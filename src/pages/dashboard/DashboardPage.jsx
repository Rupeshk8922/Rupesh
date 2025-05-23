import { useContext } from 'react';
import { SubscriptionContext } from '../contexts/SubscriptionContext';
import CompanyDashboard from './CompanyDashboard';
import UserDashboardPage from './UserDashboardPage';

function DashboardPage() {
  const { subscriptionStatus } = useContext(SubscriptionContext);

  // Optionally handle loading or unknown subscriptionStatus
  if (!subscriptionStatus) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <>
      {(subscriptionStatus === 'active' || subscriptionStatus === 'trialing') ? (
        <CompanyDashboard />
      ) : (
        <UserDashboardPage />
      )}
    </>
  );
}

export default DashboardPage;
