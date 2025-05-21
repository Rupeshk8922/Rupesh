import { useState, useEffect } from 'react'; // Keep React import if JSX is used and add useState, useEffect
import { useAuth } from '../../../contexts/authContext.jsx'; // Assuming CSR Dashboard needs auth context
import { Navigate } from 'react-router-dom'; // Assuming react-router-dom for redirection

const CSRDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading, userRole } = useAuth(); // Get user, loading, and userRole from auth context

  if (loading) {
    return <div>Loading...</div>; // Show loading while auth state is being determined
  }

  // Check if user is logged in and has the required role
  if (!user || (userRole !== 'csr' && userRole !== 'admin')) {
    return <Navigate to="/access-denied" />; // Redirect to access denied page if not authorized
  }

  // --- Data Fetching Logic ---
  // If CSRDashboard fetches data directly:
  useEffect(() => {
    const fetchCSRData = async () => {
      setDataLoading(true);
      try {
        // Replace with actual data fetching logic for CSR dashboard
        // Example: const data = await fetchSomeCSRData(user.uid, companyId, userRole); // Assuming companyId is needed
        // setDashboardData(data);
        // For now, simulating async fetch with a timeout
        setTimeout(() => {
          // Assume fetched data structure might be like:
          // { events: [], calls: [] } or { events: [{...}], calls: [{...}] }
          setDashboardData({ events: [], calls: [] }); // Example data
          setError(null); // Clear any previous errors on successful fetch
        }, 1000);

      } catch (err) {
        console.error("Error fetching CSR dashboard data:", err);
        // Set an error state if needed, or handle error display
        setDataLoading(false); // Stop loading even on error
      } finally {
        // Any cleanup or final state setting
        setDataLoading(false); // Ensure loading is false in finally
      }
    };

    // Fetch data only if user is authenticated, has the correct role, and not already loading
    if (user && (userRole === 'csr' || userRole === 'admin')) {
      fetchCSRData();
    }
  }, [user, userRole]); // Dependencies - fetch when user or role changes

  if (dataLoading) {
    return <div>Loading CSR data...</div>; // Show loading while CSR data is being fetched
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>; // Display error message on fetch failure
  }

  return (
    // Responsive container for basic layout
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">CSR Dashboard</h1>
      {/* Guard against null user or email */}
      <p className="text-gray-600 mb-6">Welcome, {user?.email || 'CSR User'}!</p> {/* Example of using user info */}
      {/* CSR Dashboard Content Goes Here */}
      {/* Example of displaying empty data message for lists fetched directly - using optional chaining */}
      {dashboardData && dashboardData.events && dashboardData.events.length === 0 && (
        <p>No events assigned.</p>
      )}
      {dashboardData && dashboardData.calls && dashboardData.calls.length === 0 && (
        <p>No calls logged.</p>
      )}
      {/*
        If data fetching happens in child components (e.g., a <CSRStats /> component),
        that child component MUST handle its own loading, error, and empty states.
        <CSRStats companyId={user.companyId} role={userRole} /> // Child needs own handling
      */}
    </div>
  );
};

export default CSRDashboard;