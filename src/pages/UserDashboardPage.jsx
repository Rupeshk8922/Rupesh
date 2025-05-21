import { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useFetchCompanyData } from '../hooks/useFetchCompanyData';

 function UserDashboardPage() {
  const { user, authLoading, authIsFullyLoaded, companyId, userRole } = useAuth();
  const { company, companyDataLoading } = useFetchCompanyData(companyId);

  const isSubscriptionActive = true; // Assuming subscription is always active for now\
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');

  const isLoading = authLoading || !authIsFullyLoaded || companyDataLoading || subscriptionLoading ;

  // TODO: Implement handleProfileUpdate logic and define userName/setUserName if needed.
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    console.log("Profile Updated:", { userName, userContact });
    // TODO: Save to Firestore or Firebase Auth if needed
  };

  if (isLoading) {
 return <div>🔄 Loading dashboard data...</div>;
  }

  if (!user) {
 return <div>Redirecting to login...</div>; // Redirect to login if no user
  }

  if (!companyId) {
 return <div>No company assigned to your account. Please contact your administrator.</div>; // Message if no companyId
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">User Dashboard</h1>
      <p>Welcome, {user.email} ({userRole})</p>
      <p>Company: {company?.name || 'N/A'}</p>

      {!isSubscriptionActive && (
        <div className="bg-yellow-200 p-2 rounded mt-4">
          ⚠️ Your company’s subscription is inactive. Upgrade to access all features.
        </div>
      )}

      {/* <CompanyDashboard /> */} {/* Assuming this component is used elsewhere or will be uncommented later */}

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">👤 Profile</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="userName" className="block font-medium">Name:</label>
            <input
              type="text"
              id="userName"              value={userName}
              // onChange={(e) => setUserName(e.target.value)} // userName and setUserName are not defined
              onChange={(e) => console.log('userName changed:', e.target.value)} // Placeholder
              placeholder="Enter your name"
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label htmlFor="userContact" className="block font-medium">Contact Number:</label>
            <input
              type="text"
              id="userContact"
              value={userContact}
              onChange={(e) => setUserContact(e.target.value)}
              placeholder="Enter your contact"
              className="border p-2 w-full rounded"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Save
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold">📅 Tasks / Reminders</h3>
        <p>Role-based tasks and reminders will be displayed here.</p>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold">🤝 Community Support</h3>
        <button
          onClick={() => console.log('Navigate to community support')}
          className="mt-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Visit Community Forum
        </button>
      </section>

      {isSubscriptionActive && (
        <>
          <section className="mt-8">
            {/* <h3 className="text-lg font-semibold">🤖 AI Assistant</h3> */} {/* AIAssistant is not used */}
            {/* <AIAssistant /> */}
          </section>

          <section className="mt-8">
            {/* <h3 className="text-lg font-semibold">🗺️ Maps & Live Tracking</h3> */} {/* MapsAndTracking is not used */}
            <MapsAndTracking />
          </section>
        </>
      )}
    </div>
  );
}

export default UserDashboardPage;
