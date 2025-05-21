import { Link } from 'react-router-dom';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const AdminDashboard = () => {
  const { user: currentUser, authLoading } = useAuthContext();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setTotalUsers(usersSnapshot.size);

        const companiesSnapshot = await getDocs(collection(db, 'companies'));
        setTotalCompanies(companiesSnapshot.size);

        const volunteersSnapshot = await getDocs(collection(db, 'volunteers'));
        setTotalVolunteers(volunteersSnapshot.size);

        const eventsSnapshot = await getDocs(collection(db, 'events'));
        setTotalEvents(eventsSnapshot.size);

        const leadsSnapshot = await getDocs(collection(db, 'leads'));
        setTotalLeads(leadsSnapshot.size);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch dashboard data.');
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);


  if (authLoading || loading) {
    return <div>Loading...</div>; // Replace with a proper spinner component
  }

  if (error) {
    return <div>Error: {error}</div>;
  }


  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div>
        <h3>Users: {totalUsers}</h3>
        <Link to="/admin/users">View Users</Link>
      </div>
      <div>
        <h3>Companies: {totalCompanies}</h3>
        {/* Link to companies page if available */}
      </div>
      <div>
        <h3>Volunteers: {totalVolunteers}</h3>
        {/* Link to volunteers page if available */}
      </div>
      <div>
        <h3>Events: {totalEvents}</h3>
        {/* Link to events page if available */}
      </div>
      <div>
        <h3>Leads: {totalLeads}</h3>
        {/* Link to leads page if available */}
      </div>
    </div>
  );
};

export default AdminDashboard;