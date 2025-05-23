import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext.jsx';

const OutreachDashboard = () => {
  const { user, userRole, loading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // Role access control: only outreach officers or admins allowed
  if (!loading && (!user || (userRole !== 'outreach' && userRole !== 'admin'))) {
    return <Navigate to="/access-denied" />;
  }

  useEffect(() => {
    const fetchOutreachData = async () => {
      setDataLoading(true);
      try {
        // TODO: Replace this with actual data fetch logic from Firestore/backend
        setTimeout(() => {
          setDashboardData({
            leads: [], // example: [{ id, name, status }]
            events: [], // example: [{ id, title, date }]
          });
          setError(null);
          setDataLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching outreach data:', err);
        setError('Failed to load dashboard data.');
        setDataLoading(false);
      }
    };

    if (user && (userRole === 'outreach' || userRole === 'admin')) {
      fetchOutreachData();
    }
  }, [user, userRole]);

  if (loading || dataLoading) {
    return <div className="p-4">Loading Outreach data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Outreach Officer Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.email || 'Outreach Officer'}!</p>

      {/* Events Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Assigned Events</h2>
        {dashboardData?.events?.length > 0 ? (
          <ul className="space-y-2">
            {dashboardData.events.map((event) => (
              <li key={event.id} className="p-3 border rounded-md bg-white shadow-sm">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-500">Date: {event.date}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No events assigned.</p>
        )}
      </section>

      {/* Leads Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Assigned Leads</h2>
        {dashboardData?.leads?.length > 0 ? (
          <ul className="space-y-2">
            {dashboardData.leads.map((lead) => (
              <li key={lead.id} className="p-3 border rounded-md bg-white shadow-sm">
                <p className="font-medium">{lead.name}</p>
                <p className="text-sm text-gray-500">Status: {lead.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No leads assigned.</p>
        )}
      </section>
    </div>
  );
};

export default OutreachDashboard;
