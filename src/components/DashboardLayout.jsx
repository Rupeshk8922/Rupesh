import SidebarLayout from './SidebarLayout.jsx'; // Adjust the path if needed

function DashboardLayout({ role, children }) {
  const allowedRoles = ['admin', 'outreach', 'csr', 'telecaller', 'volunteer'];

  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 text-lg">
        Access denied or role not assigned
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <SidebarLayout role={role} />
      <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
