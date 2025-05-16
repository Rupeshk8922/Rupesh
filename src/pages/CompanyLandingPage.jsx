import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchCompanyData } from '../hooks/useFetchCompanyData';
import { useAuth } from '../contexts/authContext';

function CompanyLandingPage() {
  const { companyData, loading, error } = useFetchCompanyData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && companyData) {
      // Store company ID in localStorage and redirect to user login
      localStorage.setItem('companyId', companyData.id);
      navigate('/dashboard'); // Redirect to the dashboard after setting companyId
    } else if (!loading && !companyData && !error) {
        // Handle cases where no company data is found but no error occurred
        // Maybe redirect to a setup page or show a message
        console.log("No company data found for this user.");
        // Example: navigate('/setup-company');
        // For now, let's just not redirect and maybe show a message on this page
    }
     // If there's an error and not loading, you might want to redirect to an error page or show an error message
    // if (!loading && error) {
    //     console.error("Error fetching company data:", error);
    //     navigate('/error'); // Example error page redirect
    // }

  }, [companyData, loading, error, navigate]);

  if (loading) {
    return <div>Loading company data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // If loading is false, no error, but no companyData, it means the effect didn't find a company.
  // The useEffect handles the redirect if companyData is found.
  // If we reach here, it means companyData was not found or there was an error.
  // The error case is handled above. If no companyData and no error, the useEffect won't redirect.
  // So, we can render something to indicate this.

  return (
    <div>
      <h1>Company Landing Page</h1>
      <p>Fetching your company data.</p>
      {/* You could add a link to user login here if companyData is not found */}
       {!companyData && !loading && !error && (
            <p>No company found. Please <a href="/user-login">login</a>.</p>
        )}
    </div>
  );
}

export default CompanyLandingPage;
