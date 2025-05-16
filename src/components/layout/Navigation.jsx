import React from 'react';

const ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  VOLUNTEER: 'volunteer',
};

// Simulate the current user's role.
// In a real application, this would come from your authentication context.
const currentUserRole = ROLES.ADMIN; // Change this value to test different roles

const Navigation = () => {
  // Function to check if the current user has permission to view the Leads link
  const canViewLeads = currentUserRole === ROLES.ADMIN || currentUserRole === ROLES.ORGANIZER;

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <a href="/" className="hover:text-gray-300">Home</a>
        </li>
        <li>
          <a href="/events" className="hover:text-gray-300">Events</a>
        </li>
        <li>
          <a href="/volunteers" className="hover:text-gray-300">Volunteers</a>
        </li>
        {/* Conditionally render the Leads link based on user role */}
        {canViewLeads && (
          <li>
            <a href="/leads" className="hover:text-gray-300">Leads</a>
          </li>
        )}
        {/* Add more navigation links as needed */}
      </ul>
      {/* Comments for connecting to actual authentication */}
      {/* In a real app, you would fetch the user's role after authentication
          and use that value for currentUserRole instead of the hardcoded value. */}
      {/* <p className="text-sm mt-2">Current Role: {currentUserRole}</p> */}
    </nav>
  );
};

export default Navigation;