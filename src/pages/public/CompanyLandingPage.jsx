import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchCompanyData } from '../hooks/useFetchCompanyData';

function CompanyLandingPage() {
  const { companyData, loading, error } = useFetchCompanyData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (companyData) {
        // Store company ID and redirect to dashboard
        localStorage.setItem('companyId', companyData.id);
        navigate('/dashboard');
      } else if (!companyData && !error) {
        // No company found, no error — maybe prompt user action or wait
        console.log("No company data found for this user.");
        // Optionally navigate to setup or info page:
        // navigate('/setup-company');
      } else if (error) {
        // Handle error case: show error UI or redirect to an error page
        console.error("Error fetching company data:", error);
        // Example: navigate('/error');
      }
    }
  }, [companyData, loading, error, navigate]);

  if (loading) return <div>Loading company data...</div>;

  if (error) return <div>Error: {error}</div>;

  // When not loading, no error, and no company data, render this fallback UI
  return (
    <div>
      <h1>Company Landing Page</h1>
      <p>Fetching your company data.</p>
      {!companyData && !loading && !error && (
        <p>
          No company found. Please{' '}
          <a href="/user-login" className="text-blue-600 underline">
            login
          </a>
          .
        </p>
      )}
    </div>
  );
}

export default CompanyLandingPage;
