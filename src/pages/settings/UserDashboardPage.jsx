import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useFetchCompanyData } from '../hooks/useFetchCompanyData';
import { useRouter } from 'next/router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // your Firestore setup

function UserDashboardPage() {
  const { user, authLoading, authIsFullyLoaded, companyId, userRole } = useAuth();
  const { company, companyDataLoading } = useFetchCompanyData(companyId);
  const router = useRouter();

  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');

  const isSubscriptionActive = true; // replace with actual subscription check if you have one
  const isLoading = authLoading || !authIsFullyLoaded || companyDataLoading || subscriptionLoading;

  useEffect(() => {
    if (user) {
      setUserName(user.name || '');
      setUserContact(user.contact || '');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSubscriptionLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: userName,
        contact: userContact,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (isLoading) {
    return <div>🔄 Loading dashboard data...</div>;
  }

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  if (!companyId) {
    return <div>No company assigned to your account. Please contact your administrator.</div>;
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

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">👤 Profile</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="userName" className="block font-medium">Name:</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
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
          <button
            type="submit"
            disabled={subscriptionLoading}
            className={`p-2 rounded text-white ${subscriptionLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {subscriptionLoading ? 'Saving...' : 'Save'}
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
            {/* <AIAssistant /> */}
          </section>

          <section className="mt-8">
            {/* Replace with your actual MapsAndTracking component */}
            {/* <MapsAndTracking /> */}
            <div>Maps & Live Tracking component here</div>
          </section>
        </>
      )}
    </div>
  );
}

export default UserDashboardPage;
