// src/pages/CompanyDashboard.jsx
import React from 'react';
import { useFetchCompanyData } from '../hooks/useFetchCompanyData';
import { useAuth } from '../hooks/useAuth'; // Import useAuth hook
import { useCompanyUsers } from '../hooks/useCompanyUsers';
import DashboardLayout from '../components/DashboardLayout'; // Import DashboardLayout

function CompanyDashboard() {
  const { companyData, isLoading: isLoadingCompanyData, error: errorCompanyData } = useFetchCompanyData();
  const companyId = companyData?.id || localStorage.getItem('companyId'); // Assuming you have these hooks, uncomment and use if needed.
  const { user, role, loading, error } = useAuth(); // Get user, role, loading, and error from useAuth hook.
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