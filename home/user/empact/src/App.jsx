import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import PrivateRoute from './components/routes/PrivateRoute';
import routeConfig from './routesConfig';

// You referenced these, ensure they are imported if used directly anywhere
import AddEventPage from './pages/dashboard/crm/events/AddEventPage';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import OutreachDashboard from './pages/dashboard/outreach/OutreachDashboard';
import CSRDashboard from './pages/dashboard/csr/CSRDashboard';
import VolunteerDashboard from './pages/dashboard/volunteer/VolunteerDashboard';
import TelecallerDashboard from './pages/dashboard/telecaller/TelecallerDashboard';
import ManagerDashboard from './pages/dashboard/manager/ManagerDashboard';
import UserDashboardPage from './pages/UserDashboardPage';

// ErrorBoundary import — replace with your actual implementation or import from a library
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Map through routeConfig to create Routes */}
            {routeConfig.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={
                  route.isPublic ? (
                    <route.Component />
                  ) : (
                    <PrivateRoute element={<route.Component />} requiredRoles={route.roles} />
                  )
                }
              />
            ))}
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
