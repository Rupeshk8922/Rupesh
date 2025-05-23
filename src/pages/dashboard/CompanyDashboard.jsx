import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import CompanyDataReader from '../components/CompanyDataReader';

function CompanyDashboard() {
  console.log("🏠 CompanyDashboard: Rendering...");
  const { user, authLoading, claims } = useAuth();
  const [companyId, setCompanyId] = useState(null);
  const [claimsLoaded, setClaimsLoaded] = useState(false);

  // Early return if user is not logged in
  if (!user && !authLoading) return <div>Please log in.</div>;

  useEffect(() => {
    console.log("🏠 CompanyDashboard: user/authLoading/claims updated:", {
      user: user?.uid || null,
      authLoading,
      claims,
    });

    if (claims && claims.companyId) {
      setCompanyId(claims.companyId);
      setClaimsLoaded(true);
      console.log("🏠 CompanyDashboard: companyId set to:", claims.companyId);
    } else {
      setCompanyId(null);
      setClaimsLoaded(false);
      console.log("🏠 CompanyDashboard: No companyId found in claims.");
    }
  }, [user, authLoading, claims]);

  if (authLoading || !claimsLoaded) {
    // You could replace with a spinner component if available
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Company Dashboard</h1>
      {companyId ? (
        <CompanyDataReader companyId={companyId} />
      ) : (
        <div>Company ID not found in claims.</div>
      )}
    </div>
  );
}

export default CompanyDashboard;
