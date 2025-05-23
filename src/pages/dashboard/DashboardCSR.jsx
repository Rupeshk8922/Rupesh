import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/authContext.jsx'; // Adjust path as needed
import { Navigate } from 'react-router-dom';

const CSRDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!user || (userRole !== 'csr' && userRole !== 'admin')) {
    return <Navigate to="/access-denied" />;
  }

  useEffect(() => {
    let isMounted = true;

    const fetchCSRData = async () => {
      setDataLoading(true);
      try {
        // Simulated async fetch delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (isMounted) {
          // Replace this with actual API/Firestore call result
          setDashboardData({ events: [], calls: [] });
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching CSR dashboard data:", err);
        if (isMounted) {
          setError('Failed to load dashboard data. Please try again.');
          setDashboardData(null);
        }
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    };

    if (user && (userRole === 'csr' || userRole === 'admin')) {
      fetchCSRData();
    }

    return () => {
      isMounted = false;
    };
  }, [user, userRole]);

  if (dataLoading) {
    return <div>Loading CSR data...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">CSR Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.email || 'CSR User'}!</p>

      {dashboardData?.events?.length === 0 && <p>No events assigned.</p>}
      {dashboardData?.calls?.length === 0 && <p>No calls logged.</p>}

      {/* TODO: Add actual event and call display components here */}
    </div>
  );
};

export default CSRDashboard;
