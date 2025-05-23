import { Link } from 'react-router-dom';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

// Reusable StatCard component
const StatCard = ({ title, count, link, linkText }) => (
  <div className="stat-card p-4 border rounded shadow-sm mb-4">
    <h3 className="text-xl font-semibold">{title}: {count}</h3>
    {link && <Link to={link} className="text-blue-600 hover:underline">{linkText}</Link>}
  </div>
);

const AdminDashboard = () => {
  const { authLoading } = useAuthContext();
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    volunteers: 0,
    events: 0,
    leads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersSnap, companiesSnap, volunteersSnap, eventsSnap, leadsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'companies')),
          getDocs(collection(db, 'volunteers')),
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'leads')),
        ]);

        setStats({
          users: usersSnap.size,
          companies: companiesSnap.size,
          volunteers: volunteersSnap.size,
          events: eventsSnap.size,
          leads: leadsSnap.size,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 font-semibold">{error}</div>;
  }

  // Optional: Add role check here to restrict to admins only

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <StatCard title="Users" count={stats.users} link="/admin/users" linkText="View Users" />
      <StatCard title="Companies" count={stats.companies} link="/admin/companies" linkText="View Companies" />
      <StatCard title="Volunteers" count={stats.volunteers} link="/admin/volunteers" linkText="View Volunteers" />
      <StatCard title="Events" count={stats.events} link="/admin/events" linkText="View Events" />
      <StatCard title="Leads" count={stats.leads} link="/admin/leads" linkText="View Leads" />
    </div>
  );
};

export default AdminDashboard;
