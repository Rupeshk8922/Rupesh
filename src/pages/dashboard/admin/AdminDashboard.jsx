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
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/authContext';
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dailySignups, setDailySignups] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [missedFollowups, setMissedFollowups] = useState(0);
  const [completedFollowups, setCompletedFollowups] = useState(0);
  const [leads, setLeads] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);
  
  const { user, companyId } = useAuth();
  // const { subscription } = useSubscription(); // Get subscription data
  const navigate = useNavigate();

  const handleEditUser = (userId) => {
    console.log("Edit user with ID:", userId);
    // navigate(`/dashboard/admin/users/edit/${userId}`);
  };

  const handleDeleteUser = async (userId) => {
    console.log("Delete user with ID:", userId);
    // Implement delete logic
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!companyId) return setError('Company ID not available.');

      setLoading(true);
      setError(null);

      try {
        const usersRef = collection(db, 'data', companyId, 'users');

        const countSnap = await getCountFromServer(usersRef);
        setTotalUsers(countSnap.data().count);

        let q = query(usersRef, orderBy('email'), limit(itemsPerPage));
        if (currentPage > 1 && lastVisible) {
          q = query(usersRef, orderBy('email'), startAfter(lastVisible), limit(itemsPerPage));
        }

        const snapshot = await getDocs(q);
        const userData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userData);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    const fetchPerformanceMetrics = async () => {
      if (!companyId) return;

      try {
        const startOfToday = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));

        const signupQuery = query(
          collection(db, 'data', companyId, 'users'),
          where('createdAt', '>=', startOfToday)
        );
        const signupSnap = await getCountFromServer(signupQuery);
        setDailySignups(signupSnap.data().count);

        const donationsSnap = await getDocs(collection(db, 'data', companyId, 'donations'));
        const total = donationsSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        setTotalDonations(total);

        const missedSnap = await getCountFromServer(
          query(collection(db, 'data', companyId, 'followups'), where('status', '==', 'missed'))
        );
        setMissedFollowups(missedSnap.data().count);

        const completedSnap = await getCountFromServer(
          query(collection(db, 'data', companyId, 'followups'), where('status', '==', 'completed'))
        );
        setCompletedFollowups(completedSnap.data().count);

      } catch (err) {
        console.error("Error fetching metrics:", err);
      }
    };

    const fetchLeads = async () => {
      if (!companyId) return;
      try {
        const snap = await getDocs(collection(db, 'data', companyId, 'leads'));
        setLeads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    const fetchVolunteers = async () => {
      if (!companyId) return;
      try {
        const snap = await getDocs(collection(db, 'data', companyId, 'volunteers'));
        setVolunteers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching volunteers:", err);
      }
    };

    const fetchEvents = async () => {
      if (!companyId) return;
      try {
        const snap = await getDocs(collection(db, 'data', companyId, 'events'));
        setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchUsers();
    fetchPerformanceMetrics();
    fetchLeads();
    fetchVolunteers();
    fetchEvents();
  }, [companyId, currentPage, itemsPerPage]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Performance Metrics Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-100 rounded-md">
            <strong className="font-semibold">Daily Signups:</strong> {dailySignups}
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <strong className="font-semibold">Total Donations:</strong> ₹{totalDonations.toFixed(2)}
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <strong className="font-semibold">Follow-ups Completed:</strong> {completedFollowups}
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <strong className="font-semibold">Follow-ups Missed:</strong> {missedFollowups}
          </div>
        </div>
        {/* Add more charts, tables, and filters for performance reports here */}
      </div>

      {/* Users Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Users Management</h2>
          <Link to="/add-user" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add New User
          </Link>
        </div>

        {loading && <p>Loading users...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 font-semibold border-b">
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div className="text-right">Actions</div>
              </div>

              <ul className="divide-y divide-gray-200">
                {users.length > 0 ? users.map(user => (
                  <li key={user.id} className="grid grid-cols-4 gap-4 py-3 px-4 hover:bg-gray-50">
                    <div>{user.name}</div>
                    <div>{user.email}</div>
                    <div>{user.role}</div>
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleEditUser(user.id)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Delete
                      </button>
                    </div>
                  </li>
                )) : (
                  <li className="py-3 px-4">No users found.</li>
                )}
              </ul>
            </div>

            {totalUsers > itemsPerPage && (
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {currentPage} of {Math.ceil(totalUsers / itemsPerPage)}</span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * itemsPerPage >= totalUsers || loading}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Leads Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Leads Management</h2>
        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead> {/* Table Header */}
                <tr>
                  <th className="py-2 px-4 bg-gray-100 text-left font-semibold">Lead Name</th>
                  <th className="py-2 px-4 bg-gray-100 text-left font-semibold">Contact Info</th>
                  <th className="py-2 px-4 bg-gray-100 text-left font-semibold">Lead Type</th>
                  <th className="py-2 px-4 bg-gray-100 text-left font-semibold">Status</th>
                  <th className="py-2 px-4 bg-gray-100 text-left font-semibold">Next Follow-up</th>
                  <th className="py-2 px-4 bg-gray-100 text-left font-semibold">Assigned To</th>
                  <th className="py-2 px-4 bg-gray-100 text-left font-semibold">Location</th>
                  <th className="py-2 px-4 bg-gray-100 text-left font-semibold">Source</th>
                  <th className="py-2 px-4 bg-gray-100 text-left font-semibold">Created On</th>
                  <th className="py-2 px-4 bg-gray-100 text-left font-semibold">Priority</th>
                  {/* Add Actions column later */}
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td className="py-2 px-4 border-b">{lead.name}</td>
                    <td className="py-2 px-4 border-b">{lead.contactInfo}</td>
                    <td className="py-2 px-4 border-b">{lead.leadType}</td>
                    <td className="py-2 px-4 border-b">{lead.status}</td>
                    {/* Display Next Follow-up Date - assuming it\'s a Timestamp */}
                    <td className="py-2 px-4 border-b">{lead.nextFollowUpDate ? lead.nextFollowUpDate.toDate().toLocaleDateString() : 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{lead.assignedTo}</td>
                    <td className="py-2 px-4 border-b">{lead.location}</td>
                    <td className="py-2 px-4 border-b">{lead.source}</td>
                    {/* Display Created On Date - assuming it\'s a Timestamp */}
                    <td className="py-2 px-4 border-b">{lead.createdOn ? lead.createdOn.toDate().toLocaleDateString() : 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{lead.priorityLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No leads found for this company.</p>
        )}
      </div>

      {/* Events Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Events Management</h2>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="bg-gray-100 rounded-md p-4 border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">{event.eventName}</h3>
                <p><strong>Date & Time:</strong> {event.dateTime}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Organizer:</strong> {event.organizer}</p>
                <p><strong>Volunteers Required:</strong> {event.volunteersRequired}</p>
                <p><strong>Volunteers Registered:</strong> {event.volunteersRegistered}</p>
                <p><strong>Cause Type:</strong> {event.causeType}</p>
                <p><strong>Status:</strong> {event.status}</p>
                <p><strong>Event Type:</strong> {event.eventType}</p>
                <p><strong>Created On:</strong> {event.createdOn ? event.createdOn.toDate().toLocaleDateString() : 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No events found for this company.</p>
        )}
      </div>

      {/* Volunteers Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Volunteers Management</h2>
        {volunteers.length > 0 ? (
          <div className="space-y-4">
            {volunteers.map(volunteer => (
              <div key={volunteer.id} className="bg-gray-100 rounded-md p-4 border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">{volunteer.fullName}</h3>
                <p><strong>Email:</strong> {volunteer.email}</p>
                <p><strong>Phone:</strong> {volunteer.phone}</p>
                <p><strong>Location/City:</strong> {volunteer.location}</p>
                <p><strong>Skills/Interests:</strong> {volunteer.skillsInterests}</p>
                <p><strong>Availability:</strong> {volunteer.availability}</p>
                <p><strong>Preferred Causes:</strong> {volunteer.preferredCauses}</p>
                <p><strong>Status:</strong> {volunteer.status}</p>
                <p><strong>Registered Events:</strong> {volunteer.registeredEvents || 0}</p>
                <p><strong>Joined On:</strong> {volunteer.joinedOn ? volunteer.joinedOn.toDate().toLocaleDateString() : 'N/A'}</p>
                <p><strong>Notes:</strong> {volunteer.notes}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No volunteers found for this company.</p>
        )}
      </div>

      {/* AI Assistant Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
        <p>
          This section will integrate an AI assistant to help with data analysis, report generation, and other administrative tasks.
        </p>
      </div>

      {/* Settings Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <p className="mb-4">Manage various application and company settings here.</p>
        <div className="space-y-4">
          <h3>General Settings</h3>
          <h3>User and Permissions</h3>
          <h3>Notifications</h3>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

