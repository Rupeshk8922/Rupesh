import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext.jsx';
function SidebarLayout() {
  const { user, userRole } = useAuth(); // Get user and userRole from context

  // Define sidebar items with their allowed rolesgit
  const sidebarItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'Manager', 'Outreach Officer', 'Volunteer Coordinator', 'CSR', 'Telecaller'] },
    { label: 'Leads', path: '/dashboard/leads', roles: ['admin', 'Manager', 'Outreach Officer', 'Telecaller'] },
    { label: 'Add Lead', path: '/dashboard/leads/add', roles: ['admin', 'Manager', 'Outreach Officer', 'Telecaller'] },
    { label: 'Events', path: '/dashboard/events', roles: ['admin', 'Manager', 'Outreach Officer', 'Volunteer Coordinator'] },
    { label: 'Add Event', path: '/dashboard/events/add', roles: ['admin', 'Manager', 'Outreach Officer'] },
    { label: 'Volunteers', path: '/dashboard/volunteers', roles: ['admin', 'Manager', 'Outreach Officer', 'Volunteer Coordinator'] },
    { label: 'Add Volunteer', path: '/dashboard/volunteers/add', roles: ['admin', 'Manager', 'Outreach Officer'] },
    { label: 'Reports & KPIs', path: '/dashboard/reports', roles: ['admin', 'Manager'] },
    { label: 'Users / Team Management', path: '/dashboard/users', roles: ['admin'] },
    { label: 'Profile / Settings', path: '/dashboard/settings/profile', roles: ['admin', 'Manager', 'Outreach Officer', 'Volunteer Coordinator', 'CSR', 'Telecaller'] }, // Assuming a generic settings route for all roles
    // Add other sidebar items as needed, with their respective roles
  ];

  return (
    <div className="w-64 bg-gray-800 text-white">
      {" "}
      {/* Sidebar width and styling */}
      <div className="p-4 text-xl font-semibold">Empact CRM</div>{" "}
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

        {/* Outreach Officer and Manager navigation links */}
        {(userRole === 'outreach' || userRole === 'manager') && (
          <ul>
            <li><Link to="/dashboard/outreach/targets" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Targets</Link></li>
            <li><Link to="/dashboard/outreach/donors" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Donors</Link></li>
            <li><Link to="/dashboard/outreach/map" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Map</Link></li>
            <li><Link to="/dashboard/outreach/reminders" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Reminders</Link></li>
            <li><Link to="/dashboard/outreach/performance" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Performance</Link></li>
            <li><Link to="/dashboard/outreach/reports" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Reports</Link></li>
          </ul>
        )}

        {/* CSR Officer navigation links */}
        {userRole === 'csr' && (
          <ul>
            <li><Link to="/dashboard/csr/leads" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">CSR Leads</Link></li>
            <li><Link to="/dashboard/csr/projects" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Projects</Link></li>
            <li><Link to="/dashboard/csr/impact-reports" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Impact Reports</Link></li>
          </ul>
        )}

        {/* Volunteer navigation links */}
        {userRole === 'volunteer' && (
          <ul>
            <li><Link to="/dashboard/volunteer/assigned-events" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Assigned Events</Link></li>
            <li><Link to="/dashboard/volunteer/tasks" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Tasks</Link></li>
            <li><Link to="/dashboard/volunteer/join-causes" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Join Causes</Link></li>
            <li><Link to="/dashboard/volunteer/leaderboard" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Leaderboard</Link></li>
          </ul>
        )}

        {/* Telecaller navigation links */}
        {userRole === 'telecaller' && (
          <ul>
            <li><Link to="/dashboard/telecaller/call-list" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Call List</Link></li>
            <li><Link to="/dashboard/telecaller/followups" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Followups</Link></li>
            <li><Link to="/dashboard/telecaller/scripts" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Scripts</Link></li>
            <li><Link to="/dashboard/telecaller/update-status" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white">Update Status</Link></li>
          </ul>
        )}

      </nav>
    </div>
  );
}

export default SidebarLayout;
