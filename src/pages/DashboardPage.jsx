import { useContext } from 'react';
import { SubscriptionContext } from '../contexts/SubscriptionContext';
import CompanyDashboard from './CompanyDashboard';import UserDashboardPage from './UserDashboardPage';
function DashboardPage() {
  const { subscriptionStatus } = useContext(SubscriptionContext);

  return (
    <>
      {subscriptionStatus === 'active' || subscriptionStatus === 'trialing' ? (
        <CompanyDashboard />
      ) : (
        <UserDashboardPage />
      )}
    </>
  );
}

export default DashboardPage;