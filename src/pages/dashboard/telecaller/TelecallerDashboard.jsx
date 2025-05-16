import React from 'react';
import { useAuth } from '../../../contexts/authContext.jsx'; // Correct path and hook name


const TelecallerDashboard = () => {
  const { user } = useAuth(); // Example usage of the hook
  return (
    <div>
      {/* Content for Telecaller Dashboard */}
    </div>
  );
};

export default TelecallerDashboard;