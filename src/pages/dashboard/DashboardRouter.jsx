import React from 'react';
import { useAuth } from '../../hooks/useAuth'; // Adjust the path if needed

// Import actual dashboards when ready
// import AdminDashboard from './admin/AdminDashboard';
// import CSRDashboard from './csr/CSRDashboard';
// import ManagerDashboard from './manager/ManagerDashboard';
// import OutreachDashboard from './outreach/OutreachDashboard';
// import TelecallerDashboard from './telecaller/TelecallerDashboard';
// import VolunteerDashboard from './volunteer/VolunteerDashboard';

const DashboardRouter = () => {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="mt-20 mx-auto text-center text-gray-600">
        Loading Dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-20 mx-auto text-center text-red-600">
        Please log in to access the dashboard.
      </div>
    );
  }

  switch (userRole) {
    case 'admin':
      // return <AdminDashboard />;
      return <div className="mt-20 mx-auto">Admin Dashboard Placeholder</div>;
    case 'csr':
      // return <CSRDashboard />;
      return <div className="mt-20 mx-auto">CSR Dashboard Placeholder</div>;
    case 'manager':
      // return <ManagerDashboard />;
      return <div className="mt-20 mx-auto">Manager Dashboard Placeholder</div>;
    case 'outreach':
      // return <OutreachDashboard />;
      return <div className="mt-20 mx-auto">Outreach Dashboard Placeholder</div>;
    case 'telecaller':
      // return <TelecallerDashboard />;
      return <div className="mt-20 mx-auto">Telecaller Dashboard Placeholder</div>;
    case 'volunteer':
      // return <VolunteerDashboard />;
      return <div className="mt-20 mx-auto">Volunteer Dashboard Placeholder</div>;
    default:
      return (
        <div className="mt-20 mx-auto text-center text-red-600">
          Access Denied: Unknown Role.
        </div>
      );
  }
};

export default DashboardRouter;
