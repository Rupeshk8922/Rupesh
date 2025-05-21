import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';import CompanyDataReader from '../components/CompanyDataReader';

function CompanyDashboard() { // Removed `companyId` prop - fetching within component
  console.log("🏠 CompanyDashboard: Rendering...");
  const { user, authLoading, claims } = useAuth();
  const [companyId, setCompanyId] = useState(null);
  const [claimsLoaded, setClaimsLoaded] = useState(false); // ✅ New flag

  useEffect(() => {
    console.log("🏠 CompanyDashboard: user, authLoading, claims changed:", {
      user: user?.uid || null,
      authLoading,
      claims,
    });

    // ✅ Ensure claims exist before processing
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

  // 🟡 Use CompanyDataReader's loading state or a separate fetch in this component
  if (authLoading || !claimsLoaded) {
    return <div>Loading dashboard...</div>;
  }

  if (!user) return <div>Please log in.</div>;

  // 🟡 Conditionally render based on companyId availability
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
