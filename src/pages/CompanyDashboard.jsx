// src/pages/CompanyDashboard.jsx
import React from 'react';
import { useFetchCompanyData } from '../hooks/useFetchCompanyData';
import { useauthContext } from '../contexts/authContext';
import { useCompanyUsers } from '../hooks/useCompanyUsers'; // Assuming you have this hook
import DashboardLayout from '../components/DashboardLayout'; // Import DashboardLayout
import { useAuth } from '../contexts/authContext';

function CompanyDashboard() {
  const { companyData, isLoading: isLoadingCompanyData, error: errorCompanyData } = useFetchCompanyData();
  const companyId = companyData?.id || localStorage.getItem('companyId');
  const { user, role, loading, error } = useAuth(); // Get user, role, loading, and error from authContext
  const { users, loading: loadingUsers, error: errorUsers } = useCompanyUsers(companyId);
 // Assuming you have these hooks, uncomment and use if needed.
console.log(user, role, loading, error)
  return (
    <>
      {loading && <p>Loading dashboard...</p>}
      {error && <p>Error loading authentication data: {error.message}</p>}
      {user && role && !loading && !error && (
        <DashboardLayout role={role} />
      )}
    </>
  );
}

export default CompanyDashboard;