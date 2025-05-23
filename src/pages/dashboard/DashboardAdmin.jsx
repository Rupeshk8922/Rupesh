import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/authContext.jsx';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalUsers, setTotalUsers] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);

  const [dailySignups, setDailySignups] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [missedFollowups, setMissedFollowups] = useState(0);
  const [completedFollowups, setCompletedFollowups] = useState(0);

  const [leads, setLeads] = useState([]);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const { companyId } = useAuth();
  const navigate = useNavigate();

  // Pagination: fetch users based on currentPage
  useEffect(() => {
    if (!companyId) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      setErrorUsers(null);
      try {
        const usersRef = collection(db, 'data', companyId, 'users');

        // Fetch total count only on first page load
        if (currentPage === 1) {
          const countSnap = await getCountFromServer(usersRef);
          setTotalUsers(countSnap.data().count);
          setLastVisible(null); // reset lastVisible when on first page
        }

        let q = query(usersRef, orderBy('email'), limit(itemsPerPage));

        // For pages after first, use lastVisible to paginate
        if (currentPage > 1 && lastVisible) {
          q = query(usersRef, orderBy('email'), startAfter(lastVisible), limit(itemsPerPage));
        }

        const snapshot = await getDocs(q);

        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        }

        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setErrorUsers('Failed to fetch users.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [companyId, currentPage, itemsPerPage, lastVisible]);

  // Fetch performance metrics: daily signups, donations, follow-ups
  useEffect(() => {
    if (!companyId) return;

    const fetchPerformanceMetrics = async () => {
      try {
        const startOfToday = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));

        // Daily signups
        const signupQuery = query(
          collection(db, 'data', companyId, 'users'),
          where('createdAt', '>=', startOfToday)
        );
        const signupSnap = await getCountFromServer(signupQuery);
        setDailySignups(signupSnap.data().count);

        // Total donations sum
        const donationsSnap = await getDocs(collection(db, 'data', companyId, 'donations'));
        const total = donationsSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        setTotalDonations(total);

        // Missed follow-ups count
        const missedSnap = await getCountFromServer(
          query(collection(db, 'data', companyId, 'followups'), where('status', '==', 'missed'))
        );
        setMissedFollowups(missedSnap.data().count);

        // Completed follow-ups count
        const completedSnap = await getCountFromServer(
          query(collection(db, 'data', companyId, 'followups'), where('status', '==', 'completed'))
        );
        setCompletedFollowups(completedSnap.data().count);
      } catch (err) {
        console.error('Error fetching performance metrics:', err);
      }
    };

    fetchPerformanceMetrics();
  }, [companyId]);

  // Fetch leads
  useEffect(() => {
    if (!companyId) return;

    const fetchLeads = async () => {
      try {
        const leadsSnap = await getDocs(collection(db, 'data', companyId, 'leads'));
        setLeads(leadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching leads:', err);
      }
    };

    fetchLeads();
  }, [companyId]);

  // Fetch events
  useEffect(() => {
    if (!companyId) return;

    const fetchEvents = async () => {
      try {
        const eventsSnap = await getDocs(collection(db, 'data', companyId, 'events'));
        setEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, [companyId]);

  // Fetch volunteers
  useEffect(() => {
    if (!companyId) return;

    const fetchVolunteers = async () => {
      try {
        const volSnap = await getDocs(collection(db, 'data', companyId, 'volunteers'));
        setVolunteers(volSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching volunteers:', err);
      }
    };

    fetchVolunteers();
  }, [companyId]);

  const handleEditUser = (userId) => {
    navigate(`/dashboard/admin/users/edit/${userId}`);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    // Implement delete user logic here
    alert(`Delete user: ${userId} (Delete logic not implemented yet)`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Performance Metrics */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-100 rounded-md">
            <strong>Daily Signups:</strong> {dailySignups}
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <strong>Total Donations:</strong> ₹{totalDonations.toFixed(2)}
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <strong>Follow-ups Completed:</strong> {completedFollowups}
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <strong>Follow-ups Missed:</strong> {missedFollowups}
          </div>
        </div>
      </section>

      {/* Users Management */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Users Management</h2>
          <Link
            to="/dashboard/admin/users/add"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add New User
          </Link>
        </div>

        {loadingUsers && <p>Loading users...</p>}
        {errorUsers && <p className="text-red-500">{errorUsers}</p>}

        {!loadingUsers && !errorUsers && (
          <>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 font-semibold border-b">
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div className="text-right">Actions</div>
              </div>

              <ul className="divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <li
                      key={user.id}
                      className="grid grid-cols-4 gap-4 py-3 px-4 hover:bg-gray-50 items-center"
                    >
                      <div>{user.name || 'N/A'}</div>
                      <div>{user.email || 'N/A'}</div>
                      <div>{user.role || 'N/A'}</div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user.id)}
                          className="text-blue-600 hover:underline"
                          aria-label={`Edit user ${user.name}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:underline"
                          aria-label={`Delete user ${user.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-gray-500">No users found.</li>
                )}
              </ul>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {Math.ceil(totalUsers / itemsPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    prev < Math.ceil(totalUsers / itemsPerPage) ? prev + 1 : prev
                  )
                }
                disabled={currentPage === Math.ceil(totalUsers / itemsPerPage)}
                className={`px-4 py-2 rounded ${
                  currentPage === Math.ceil(totalUsers / itemsPerPage)
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>

      {/* Leads Overview */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Leads Overview</h2>
        {leads.length === 0 ? (
          <p>No leads found.</p>
        ) : (
          <ul className="list-disc list-inside">
            {leads.slice(0, 5).map((lead) => (
              <li key={lead.id}>
                {lead.name || lead.contact || 'Unnamed Lead'}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Events Overview */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Events Overview</h2>
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <ul className="list-disc list-inside">
            {events.slice(0, 5).map((event) => (
              <li key={event.id}>{event.name || event.title || 'Unnamed Event'}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Volunteers Overview */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Volunteers Overview</h2>
        {volunteers.length === 0 ? (
          <p>No volunteers found.</p>
        ) : (
          <ul className="list-disc list-inside">
            {volunteers.slice(0, 5).map((vol) => (
              <li key={vol.id}>{vol.name || vol.email || 'Unnamed Volunteer'}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
