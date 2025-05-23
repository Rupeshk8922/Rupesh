import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth is in src/hooks
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react'; // Assuming lucide-react for icons
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const DashboardLayout = () => {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login-user');
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show a toast or error message
    }
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', roles: ['admin', 'officer', 'volunteer'] },
    { path: '/dashboard/leads', label: 'Leads', roles: ['admin', 'officer'] },
    { path: '/dashboard/events', label: 'Events', roles: ['admin', 'officer', 'volunteer'] },
    { path: '/dashboard/volunteers', label: 'Volunteers', roles: ['admin', 'officer'] },
    { path: '/dashboard/users', label: 'Users', roles: ['admin'] },
    { path: '/dashboard/company-settings', label: 'Company Settings', roles: ['admin'] },
  ];

  const filteredNavLinks = navLinks.filter(link => userRole && link.roles.includes(userRole.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Empact CRM</h2>
        </div>
        <nav className="mt-4">
          {filteredNavLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-md w-full">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="p-4 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">Empact CRM</h2>
            </div>
            <nav className="mt-4">
              {filteredNavLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="text-lg font-semibold text-gray-800">Dashboard</div>
        <div className="flex items-center space-x-2">
          {user && (
            <Avatar>
              <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
          )}
          <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 bg-white shadow-md">
          <div className="text-lg font-semibold text-gray-800">Dashboard</div> {/* Or dynamic page title */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                 <Avatar>
                  <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-gray-700">{user.email} ({userRole})</span>
              </div>
            )}
            <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
          </div>
        </header>

        <div className="p-4 md:p-6">
          <Outlet /> {/* This is where the routed page components will render */}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;