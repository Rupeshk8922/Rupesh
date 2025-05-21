import { useAuth } from '../contexts/authContext.jsx';
import { Link } from 'react-router-dom';
import { USER_ROLES } from '../routesConfig.jsx'; // Import USER_ROLES

function SidebarLayout() {
  const { user, userRole } = useAuth(); // Get user and userRole from context

  // Define sidebar items with their allowed roles
  const sidebarItems = [
    { label: 'Dashboard', path: '/dashboard', roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER, USER_ROLES.VOLUNTEER_COORDINATOR, USER_ROLES.CSR, USER_ROLES.TELECALLER] },
    { label: 'Leads', path: '/dashboard/leads', roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER, USER_ROLES.TELECALLER] },
    { label: 'Add Lead', path: '/dashboard/leads/add', roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER, USER_ROLES.TELECALLER] },
    { label: 'Events', path: '/dashboard/events', roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER, USER_ROLES.VOLUNTEER_COORDINATOR] },
    { label: 'Add Event', path: '/dashboard/events/add', roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER] },
    { label: 'Volunteers', path: '/dashboard/volunteers', roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER, USER_ROLES.VOLUNTEER_COORDINATOR] },
    { label: 'Add Volunteer', path: '/dashboard/volunteers/add', roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER] },
    { label: 'Reports & KPIs', path: '/dashboard/reports', roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },
    { label: 'Users / Team Management', path: '/dashboard/users', roles: [USER_ROLES.ADMIN] },
    { label: 'Profile / Settings', path: '/dashboard/settings/profile', roles: Object.values(USER_ROLES) }, // Assuming a generic settings route for all roles
    // Outreach Officer and Manager specific links
    { label: 'Targets', path: '/dashboard/outreach/targets', roles: [USER_ROLES.OUTREACH_OFFICER, USER_ROLES.MANAGER] },
    { label: 'Donors', path: '/dashboard/outreach/donors', roles: [USER_ROLES.OUTREACH_OFFICER, USER_ROLES.MANAGER] },
    { label: 'Map', path: '/dashboard/outreach/map', roles: [USER_ROLES.OUTREACH_OFFICER, USER_ROLES.MANAGER] },
    { label: 'Reminders', path: '/dashboard/outreach/reminders', roles: [USER_ROLES.OUTREACH_OFFICER, USER_ROLES.MANAGER] },
    { label: 'Performance', path: '/dashboard/outreach/performance', roles: [USER_ROLES.OUTREACH_OFFICER, USER_ROLES.MANAGER] },
    { label: 'Reports (Outreach)', path: '/dashboard/outreach/reports', roles: [USER_ROLES.OUTREACH_OFFICER, USER_ROLES.MANAGER] },
    // CSR Officer specific links
    { label: 'CSR Leads', path: '/dashboard/csr/leads', roles: [USER_ROLES.CSR] },
    { label: 'Projects', path: '/dashboard/csr/projects', roles: [USER_ROLES.CSR] },
    { label: 'Impact Reports', path: '/dashboard/csr/impact-reports', roles: [USER_ROLES.CSR] },
    // Volunteer specific links
    { label: 'Assigned Events', path: '/dashboard/volunteer/assigned-events', roles: [USER_ROLES.VOLUNTEER_COORDINATOR] },
    { label: 'Tasks', path: '/dashboard/volunteer/tasks', roles: [USER_ROLES.VOLUNTEER_COORDINATOR] },
    { label: 'Join Causes', path: '/dashboard/volunteer/join-causes', roles: [USER_ROLES.VOLUNTEER_COORDINATOR] },
    { label: 'Leaderboard', path: '/dashboard/volunteer/leaderboard', roles: [USER_ROLES.VOLUNTEER_COORDINATOR] },
    // Telecaller specific links
    { label: 'Call List', path: '/dashboard/telecaller/call-list', roles: [USER_ROLES.TELECALLER] },
    { label: 'Followups', path: '/dashboard/telecaller/followups', roles: [USER_ROLES.TELECALLER] },
    { label: 'Scripts', path: '/dashboard/telecaller/scripts', roles: [USER_ROLES.TELECALLER] },
    { label: 'Update Status', path: '/dashboard/telecaller/update-status', roles: [USER_ROLES.TELECALLER] },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white">
      {" "}
      {/* Sidebar width and styling */}
      <div className="p-4 text-xl font-semibold">Empact CRM</div>{" "}      {/* Conditional rendering based on user role */}
      <nav className="mt-4">
        {/* Conditionally render links based on user role */}
        <ul>
          {sidebarItems.map(item => (
            // Ensure user and role are available before checking includes
            user && item.roles.includes(userRole) && (
              <li key={item.path}>
                <Link to={item.path} className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">{item.label}</Link>
              </li>
            )
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default SidebarLayout;
