import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext'; // Corrected hook name and casing
import useFetchSubscriptionStatus from '../hooks/useFetchSubscriptionStatus';

import OutreachModule from '../components/crm/OutreachModule';
import LeadsModule from '../components/crm/LeadsModule';
import EventsModule from '../components/crm/EventsModule';
import VolunteersModule from '../components/crm/VolunteersModule';
import AIAssistant from '../components/AIAssistant';
import MapsAndTracking from '../components/MapsAndTracking';

function UserDashboardPage() {
  const { user, company } = useauthContext(); // Get user and company from context
  const { subscriptionStatus } = useFetchSubscriptionStatus(user?.companyId); // Get subscription status

  const isSubscriptionActive = subscriptionStatus?.status === 'active';

  // State for profile update form
  const [userName, setUserName] = useState(user?.name || '');
  const [userContact, setUserContact] = useState(user?.contactNumber || '');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    // TODO: Implement logic to update user document in Firestore
    console.log('Updating profile:', { name: userName, contactNumber: userContact });
    // You'll need to call a function from your auth context or a separate hook to update the user document
  };

  if (!user || !company) {
    // Handle case where user or company data is not yet loaded
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1>User Dashboard</h1>

      <div className="welcome-banner">
        <h2>Welcome, {user.email}!</h2> {/* Display user email from the /users/{uid} document */}
        {user.role && <p>Role: {user.role}</p>} {/* Display user role from the /users/{uid} document */}
        {company && <p>Company: {company.name}</p>} {/* Display company name */}
      </div>

      {!isSubscriptionActive && (
        <div className="subscription-alert">
          <p>Your company's subscription is inactive. Some features may be limited.</p>
          {/* Optional: Link to subscription page for admin */}
        </div>
      )}

      <div className="crm-sections">
        <h3>CRM Modules</h3>
        {isSubscriptionActive ? (
          <>
            {/* Define role permissions - you can adjust these */}
            {/* For simplicity, assuming 'admin' has access to all modules */}
            {/* 'Outreach Officer' has access to Outreach */}
            {/* 'Manager' has access to Leads and Events */}
            {/* 'Volunteer' has access to Volunteers */}

            {/* Full CRM features for active subscription */}
            {(user.role === 'admin' || user.role === 'Outreach Officer') && (
              <OutreachModule />
            )}
            {(user.role === 'admin' || user.role === 'Manager') && (
              <LeadsModule />
            )}
            {(user.role === 'admin' || user.role === 'Manager') && (
              <EventsModule />
            )}
            {(user.role === 'admin' || user.role === 'Volunteer') && (
              <VolunteersModule />
            )}
          </>
        ) : (
          <>
            {/* Limited view for inactive subscription */}
            <div className="crm-module">
              <h4>Limited Access</h4>
              <p>Content is limited due to inactive subscription.</p>
              {/* You might still show some basic information or a message to the admin */}
            </div>
          </>
        )}
      </div>

      {/* Profile Section */}
      <section style={{ marginTop: '2rem' }}>
        <h3>👤 Profile</h3>
        <form onSubmit={handleProfileUpdate}>
          <div>
            <label htmlFor="userName">Name:</label>
            <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="userContact">Contact Number:</label>
            <input type="text" id="userContact" value={userContact} onChange={(e) => setUserContact(e.target.value)} />
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>Save Profile</button>
        </form>
        {/* Note: Role and Permissions cannot be changed by the user here */}
      </section>

      {/* Tasks / Reminders Section */}
      <section style={{ marginTop: '2rem' }}>
        <h3>📅 Tasks / Reminders</h3>
        <p>Role-based tasks and reminders will be displayed here.</p>
        {/* TODO: Fetch and display tasks/reminders based on user's role */}
      </section>

      {/* AI Assistant (Premium Feature) */}
      {isSubscriptionActive && (
        <section style={{ marginTop: '2rem' }}>
          <h3>🤖 AI Assistant</h3>
 <AIAssistant />
        </section>
 )}

      {/* Maps & Live Tracking (Premium Feature) */}
      {isSubscriptionActive && (
 <section style={{ marginTop: '2rem' }}>
 <h3>🗺️ Maps & Live Tracking</h3>
 <MapsAndTracking />
 </section>
 )}

      {/* Community Support */}
      <section style={{ marginTop: '2rem' }}>
        <h3>🤝 Community Support</h3>
        <button onClick={() => console.log('Navigate to community support')}>Visit Community Forum</button>
      </section>
    </div >
  );
}

export default UserDashboardPage;