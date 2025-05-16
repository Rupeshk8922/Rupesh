import React from 'react'; // Keep React import if JSX is used
import { useAuth } from '../../../contexts/authContext.jsx'; // Assuming CSR Dashboard needs auth context
const OutreachDashboard = () => {
  const { user } = useAuth(); // Example usage of the auth context
  return (
    <div>
      {/* CSR Dashboard Content Goes Here */}
      {user && <p>Welcome, {user.email}!</p>} {/* Example of using user info */}
    </div>
  );
};
export default OutreachDashboard;