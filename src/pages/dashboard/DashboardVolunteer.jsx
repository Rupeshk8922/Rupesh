import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext.jsx';

const VolunteerDashboard = () => {
  const { user, userRole, loading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // Protect route
  if (!loading && (!user || (userRole !== 'volunteer' && userRole !== 'admin'))) {
    return <Navigate to="/access-denied" />;
  }

  useEffect(() => {
    const fetchVolunteerData = async () => {
      setDataLoading(true);
      try {
        // Replace this with actual Firebase/Firestore data call
        setTimeout(() => {
          setDashboardData({
            events: [], // Replace with fetched assigned events
            hours: 0,   // Replace with actual volunteer hours
          });
          setError(null);
          setDataLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error loading volunteer dashboard:', err);
        setError('Unable to load your dashboard.');
        setDataLoading(false);
      }
    };

    if (user && (userRole === 'volunteer' || userRole === 'admin')) {
      fetchVolunteerData();
    }
  }, [user, userRole]);

  if (loading || dataLoading) {
    return <div className="p-4">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Volunteer Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.email || 'Volunteer'}!</p>

      {/* Volunteer Hours */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Total Hours Contributed</h2>
        <p className="text-lg text-green-700 font-medium">{dashboardData?.hours || 0} hours</p>
      </section>

      {/* Assigned Events */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Assigned Events</h2>
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
    </div>
  );
};

export default VolunteerDashboard;
