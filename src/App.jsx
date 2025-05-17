import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from './contexts/authContext.jsx';
import useFetchCompanyData from './hooks/useFetchCompanyData.jsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';

// Lazy-loaded Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NewCompanyPage = lazy(() => import('./pages/NewCompanyPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const VerifyCompanyPage = lazy(() => import('./pages/VerifyCompanyPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const CheckoutCancelPage = lazy(() => import('./pages/CheckoutCancelPage'));

const AdminDashboard = lazy(() => import('./pages/dashboard/admin/AdminDashboard'));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage.jsx'));
const OutreachDashboard = lazy(() => import('./pages/dashboard/outreach/OutreachDashboard'));
const CSRDashboard = lazy(() => import('./pages/dashboard/csr/CSRDashboard.jsx'));
const VolunteerDashboard = lazy(() => import('./pages/dashboard/volunteer/VolunteerDashboard'));
const TelecallerDashboard = lazy(() => import('./pages/dashboard/telecaller/TelecallerDashboard'));

const UsersPage = lazy(() => import('./pages/dashboard/admin/UsersPage'));
const AddUserPage = lazy(() => import('./pages/AddUserPage.jsx'));
const EditUserPage = lazy(() => import('./pages/EditUserPage.jsx'));

const AdminProfileSettingsPage = lazy(() => import('./pages/dashboard/admin/AdminProfileSettingsPage'));
const CompanySettingsPage = lazy(() => import('./pages/CompanySettingsPage.jsx'));
const ReportsPage = lazy(() => import('./pages/ReportsPage.jsx'));
const SupportPage = lazy(() => import('./pages/SupportPage.jsx'));

const LeadsListPage = lazy(() => import('./pages/LeadsList.jsx'));
const AddLeadForm = lazy(() => import('./components/crm/AddLeadForm.jsx'));
const LeadDetailsPage = lazy(() => import('./pages/LeadDetailsPage.jsx'));
const EditLeadPage = lazy(() => import('./pages/EditLeadPage.jsx'));

const EventsListPage = lazy(() => import('./pages/dashboard/crm/events/EventsListPage'));
const AddEventForm = lazy(() => import('./components/crm/AddEventForm.jsx'));
const EventDetailsPage = lazy(() => import('./pages/dashboard/crm/events/EventDetailsPage'));
const EditEventPage = lazy(() => import('./pages/dashboard/crm/events/EditEventPage'));

const VolunteersListPage = lazy(() => import('./components/crm/VolunteersList.jsx'));
const AddVolunteerForm = lazy(() => import('./components/crm/AddVolunteerForm.jsx'));
const VolunteerDetailsPage = lazy(() => import('./pages/dashboard/crm/volunteers/VolunteerDetailsPage'));
const EditVolunteerPage = lazy(() => import('./pages/dashboard/crm/volunteers/EditVolunteerPage'));

const UpgradePlan = lazy(() => import('./pages/UpgradePlan.jsx'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));

function App() {
  const { user, authIsFullyLoaded, companyId, userRole } = useAuth();
  
  useFetchCompanyData(companyId);

  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = [
    '/login', '/signup-choice', '/signup', '/signup/company',
    '/new-company', '/verify-email', '/verify-company', '/forgot-password',
  ];

  const roleDashboardPaths = {
    admin: '/dashboard/admin',
    'Outreach Officer': '/dashboard/outreach',
    CSR: '/dashboard/csr',
    'Volunteer Coordinator': '/dashboard/volunteer',
    Telecaller: '/dashboard/telecaller',
  };

  const getRoleDashboardPath = (role) => roleDashboardPaths[role] || '/dashboard';

  // Redirect unauthenticated users trying to access protected routes
  useEffect(() => {
    if (authIsFullyLoaded && !user && !publicRoutes.includes(location.pathname)) {
      navigate('/login', { replace: true });
    }
  }, [authIsFullyLoaded, user, navigate, location.pathname, publicRoutes]);

  // Redirect logged-in users away from login page to their dashboard
  useEffect(() => {
    if (user && location.pathname === '/login') {
      navigate(getRoleDashboardPath(userRole), { replace: true });
    }
  }, [user, userRole, navigate, location.pathname]);

  if (!authIsFullyLoaded) {
    return <div>Loading Authentication...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to={user ? getRoleDashboardPath(userRole) : '/login'} replace />} />
        <Route path="/login" element={user ? <Navigate to={getRoleDashboardPath(userRole)} replace /> : <LoginPage />} />
        <Route path="/new-company" element={<NewCompanyPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-company" element={<VerifyCompanyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Stripe Checkout Redirect Routes */}
        <Route path="/success" element={<CheckoutSuccessPage />} />
        <Route path="/cancel" element={<CheckoutCancelPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              element={<DashboardLayout />}
              allowedRoles={['admin', 'Manager', 'Outreach Officer', 'Volunteer Coordinator', 'CSR', 'Telecaller']}
            />
          }
        >
          <Route
            path="admin"
            element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin', 'Manager']} />}
          />
          <Route path="user" element={<ProtectedRoute element={<UserDashboardPage />} allowedRoles={['User']} />} />
          <Route
            path="outreach"
            element={<ProtectedRoute element={<OutreachDashboard />} allowedRoles={['Outreach Officer']} />}
          />
          <Route path="csr" element={<ProtectedRoute element={<CSRDashboard />} allowedRoles={['CSR']} />} />
          <Route
            path="volunteer"
            element={<ProtectedRoute element={<VolunteerDashboard />} allowedRoles={['Volunteer Coordinator']} />}
          />
          <Route
            path="telecaller"
            element={<ProtectedRoute element={<TelecallerDashboard />} allowedRoles={['Telecaller']} />}
          />

          {/* User Management */}
          <Route
            path="users"
            element={<ProtectedRoute element={<UsersPage />} allowedRoles={['admin', 'Manager']} />}
          />
          <Route
            path="users/add"
            element={<ProtectedRoute element={<AddUserPage />} allowedRoles={['admin', 'Manager']} />}
          />
          <Route
            path="users/:userId/edit"
            element={<ProtectedRoute element={<EditUserPage />} allowedRoles={['admin', 'Manager']} />}
          />

          {/* Profile and Company Settings */}
          <Route
            path="settings/profile"
            element={
              <ProtectedRoute
                element={<AdminProfileSettingsPage />}
                allowedRoles={['admin', 'Manager', 'Outreach Officer', 'Volunteer Coordinator', 'CSR', 'Telecaller']}
              />
            }
          />
          <Route
            path="settings/company"
            element={<ProtectedRoute element={<CompanySettingsPage />} allowedRoles={['admin', 'Manager']} />}
          />

          {/* Reports */}
          <Route path="reports" element={<ProtectedRoute element={<ReportsPage />} allowedRoles={['admin', 'Manager']} />} />

          {/* Support */}
          <Route
            path="support"
            element={
              <ProtectedRoute
                element={<SupportPage />}
                allowedRoles={['admin', 'Manager', 'Outreach Officer', 'Volunteer Coordinator', 'CSR', 'Telecaller']}
              />
            }
          />

          {/* CRM Modules */}
          <Route
            path="leads"
            element={<ProtectedRoute element={<LeadsListPage />} allowedRoles={['admin', 'Manager', 'Outreach Officer']} />}
          />
          <Route
            path="leads/add"
            element={<ProtectedRoute element={<AddLeadForm />} allowedRoles={['admin', 'Manager', 'Outreach Officer']} />}
          />
          <Route
            path="leads/:leadId"
            element={<ProtectedRoute element={<LeadDetailsPage />} allowedRoles={['admin', 'Manager', 'Outreach Officer']} />}
          />
          <Route
            path="leads/:leadId/edit"
            element={<ProtectedRoute element={<EditLeadPage />} allowedRoles={['admin', 'Manager', 'Outreach Officer']} />}
          />

          <Route
            path="events"
            element={<ProtectedRoute element={<EventsListPage />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />}
          />
          <Route
            path="events/add"
            element={<ProtectedRoute element={<AddEventForm />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />}
          />
          <Route
            path="events/:eventId"
            element={<ProtectedRoute element={<EventDetailsPage />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />}
          />
          <Route
            path="events/:eventId/edit"
            element={<ProtectedRoute element={<EditEventPage />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />}
          />

          <Route
            path="volunteers"
            element={
              <ProtectedRoute
                element={<VolunteersListPage />}
                allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']}
              />
            }
          />
          <Route
            path="volunteers/add"
            element={<ProtectedRoute element={<AddVolunteerForm />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />}
          />
          <Route
            path="volunteers/:volunteerId"
            element={
              <ProtectedRoute
                element={<VolunteerDetailsPage />}
                allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']}
              />
            }
          />
          <Route
            path="volunteers/:volunteerId/edit"
            element={<ProtectedRoute element={<EditVolunteerPage />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />}
          />
        </Route>

        {/* Subscription Management */}
        <Route
          path="/upgrade-plan"
          element={<ProtectedRoute element={<UpgradePlan />} allowedRoles={['admin', 'Manager']} />}
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
