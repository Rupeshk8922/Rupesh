import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useFetchSubscriptionStatus } from '../hooks/useFetchSubscriptionStatus';

import OutreachModule from '../components/crm/OutreachModule';
import LeadsModule from '../components/crm/LeadsModule';
import EventsModule from '../components/crm/EventsModule';
import VolunteersModule from '../components/crm/VolunteersModule';
import AIAssistant from '../components/AIAssistant';
import MapsAndTracking from '../components/MapsAndTracking';

function UserDashboardPage() {
  const { user, company } = useAuth();
  const { subscriptionStatus } = useFetchSubscriptionStatus(user?.companyId);

  const isSubscriptionActive = subscriptionStatus?.status === 'active';

  const [userName, setUserName] = useState(user?.name || '');
  const [userContact, setUserContact] = useState(user?.contactNumber || '');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    console.log('Updating profile:', { name: userName, contactNumber: userContact });
    // TODO: Implement profile update logic here
  };

  if (!user || !company) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1>User Dashboard</h1>

      <div className="welcome-banner">
        <h2>Welcome, {user.email}!</h2>
        {user.role && <p>Role: {user.role}</p>}
        {company && <p>Company: {company.name}</p>}
      </div>

      {!isSubscriptionActive && (
        <div className="subscription-alert">
          <p>Your company's subscription is inactive. Some features may be limited.</p>
        </div>
      )}

      <div className="crm-sections">
        <h3>CRM Modules</h3>
        {isSubscriptionActive ? (
          <>
            {(user.role === 'admin' || user.role === 'Outreach Officer') && <OutreachModule />}
            {(user.role === 'admin' || user.role === 'Manager') && <LeadsModule />}
            {(user.role === 'admin' || user.role === 'Manager') && <EventsModule />}
            {(user.role === 'admin' || user.role === 'Volunteer') && <VolunteersModule />}
          </>
        ) : (
          <div className="crm-module">
            <h4>Limited Access</h4>
            <p>Content is limited due to inactive subscription.</p>
          </div>
        )}
      </div>

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
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>📅 Tasks / Reminders</h3>
        <p>Role-based tasks and reminders will be displayed here.</p>
      </section>

      {isSubscriptionActive && (
        <>
          <section style={{ marginTop: '2rem' }}>
            <h3>🤖 AI Assistant</h3>
            <AIAssistant />
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h3>🗺️ Maps & Live Tracking</h3>
            <MapsAndTracking />
          </section>
        </>
      )}

      <section style={{ marginTop: '2rem' }}>
        <h3>🤝 Community Support</h3>
        <button onClick={() => console.log('Navigate to community support')}>Visit Community Forum</button>
      </section>
    </div>
  );
}

export default UserDashboardPage;
