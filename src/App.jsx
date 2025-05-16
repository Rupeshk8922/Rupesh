import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'; // Removed BrowserRouter

import { useAuth } from './contexts/authContext.jsx'; // Changed import to useAuth
import { SubscriptionProvider } from './contexts/SubscriptionContext.jsx'; // Keep SubscriptionProvider import
// Assuming useFetchCompanyData is in hooks/useFetchCompanyData.js or .jsx
// Import your page components
import LoginPage from './pages/LoginPage'; // Assuming LoginPage is in pages
// Placeholder routes for signup pages - Replace with actual components
// import SignupPage from './pages/SignupPage';
import NewCompanyPage from './pages/NewCompanyPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyCompanyPage from './pages/VerifyCompanyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
// Stripe Checkout Redirect Pages
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/CheckoutCancelPage';
// Components
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Assuming ProtectedRoute is in components and is a .jsx file
import DashboardLayout from './components/DashboardLayout.jsx'; // Corrected path
// Dashboard Pages
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import UserDashboardPage from "./pages/UserDashboardPage.jsx";
import OutreachDashboard from './pages/dashboard/outreach/OutreachDashboard';
import CSRDashboard from './pages/dashboard/csr/CSRDashboard.jsx';
import VolunteerDashboard from './pages/dashboard/volunteer/VolunteerDashboard';
import TelecallerDashboard from './pages/dashboard/telecaller/TelecallerDashboard';
// User Management Pages
import UsersPage from './pages/dashboard/admin/UsersPage';
import AddUserPage from './pages/AddUserPage.jsx'; // Assuming AddUserPage is directly under pages
import EditUserPage from './pages/EditUserPage.jsx'; // Assuming EditUserPage is directly under pages
// Profile and Company Settings Pages
import AdminProfileSettingsPage from './pages/dashboard/admin/AdminProfileSettingsPage';
import CompanySettingsPage from './pages/CompanySettingsPage.jsx';
// Reports Pages
import ReportsPage from './pages/ReportsPage'; // Assuming ReportsPage is a .jsx file but import doesn't need .jsx
// Support Pages
import SupportPage from './pages/SupportPage.jsx';
// CRM Modules Pages
import LeadsListPage from './pages/LeadsList.jsx';
import AddLeadForm from './components/crm/AddLeadForm.jsx';
import LeadDetailsPage from './pages/LeadDetailsPage.jsx';
import EditLeadPage from './pages/EditLeadPage.jsx'; // Corrected path
import EventsListPage from './components/crm/EventsListPage';
import AddEventForm from './pages/dashboard/crm/events/AddEventForm';
import EventDetailsPage from './pages/dashboard/crm/events/EventDetailsPage';
import EditEventPage from './pages/dashboard/crm/events/EditEventPage';
import VolunteersListPage from './pages/dashboard/crm/volunteers/VolunteersListPage';
import AddVolunteerForm from './components/crm/AddVolunteerForm.jsx';
import VolunteerDetailsPage from './pages/dashboard/crm/volunteers/VolunteerDetailsPage';
import EditVolunteerPage from './pages/dashboard/crm/volunteers/EditVolunteerPage';
// Subscription Management Pages
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import UpgradePlan from './pages/dashboard/admin/UpgradePlan';
// Error Page, Assuming ErrorPage is in pages
import ErrorPage from './pages/ErrorPage'; // Assuming ErrorPage is in pages

function App() {
  const { user, loading: authIsReady, companyId, userRole } = useAuth(); // Changed to useAuth

  useFetchCompanyData(companyId);

  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = [
    '/login', '/signup-choice', '/signup', '/signup/company',
    '/new-company', '/verify-email', '/verify-company', '/forgot-password'
  ];

  const roleDashboardPaths = {
    'admin': '/dashboard/admin',
    'Outreach Officer': '/dashboard/outreach',
    'CSR': '/dashboard/csr',
    'Volunteer Coordinator': '/dashboard/volunteer',
    'Telecaller': '/dashboard/telecaller',
  };

  const getRoleDashboardPath = (role) => {
    return roleDashboardPaths[role] || '/dashboard';
  };

  useEffect(() => {
    if (!authIsReady && !user && !publicRoutes.includes(location.pathname)) {
       // Redirect to login if auth is not ready and user is null and current path is not public
       navigate('/login');
    }
     // Removed redirection when user is present as it's handled by the second useEffect
  }, [user, authIsReady, navigate, location.pathname]); // Added authIsReady to dependencies


  useEffect(() => {
    // Redirect logged-in users from login page to their dashboard
    if (user && location.pathname === '/login') {
      navigate(getRoleDashboardPath(userRole), { replace: true });
    }
  }, [user, userRole, navigate, location.pathname]);


  if (!authIsReady) {
    return <div>Loading Authentication...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to={user ? getRoleDashboardPath(userRole) : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to={getRoleDashboardPath(userRole)} replace /> : <LoginPage />} />
      {/* Placeholder routes for signup pages - Replace with actual components */}
      {/* <Route path="/signup" element={<SignupPage />} /> */}
      <Route path="/new-company" element={<NewCompanyPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-company" element={<VerifyCompanyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Stripe Checkout Redirect Routes */}
      <Route path="/success" element={<CheckoutSuccessPage />} />
      <Route path="/cancel" element={<CheckoutCancelPage />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute element={<DashboardLayout />} allowedRoles={['admin', 'Manager', 'Outreach Officer', 'Volunteer Coordinator', 'CSR', 'Telecaller']} />}>
        <Route path="admin" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin', 'Manager']} />} />
        <Route path="user" element={<ProtectedRoute element={<UserDashboardPage />} allowedRoles={['User']} />} />
        <Route path="outreach" element={<ProtectedRoute element={<OutreachDashboard />} allowedRoles={['Outreach Officer']} />} />
        <Route path="csr" element={<ProtectedRoute element={<CSRDashboard />} allowedRoles={['CSR']} />} />
        <Route path="volunteer" element={<ProtectedRoute element={<VolunteerDashboard />} allowedRoles={['Volunteer Coordinator']} />} />
        <Route path="telecaller" element={<ProtectedRoute element={<TelecallerDashboard />} allowedRoles={['Telecaller']} />} />

        {/* User Management */}
        <Route path="users" element={<ProtectedRoute element={<UsersPage />} allowedRoles={['admin', 'Manager']} />} />
        <Route path="users/add" element={<ProtectedRoute element={<AddUserPage />} allowedRoles={['admin', 'Manager']} />} />
        <Route path="users/:userId/edit" element={<ProtectedRoute element={<EditUserPage />} allowedRoles={['admin', 'Manager']} />} />

        {/* Profile and Company Settings */}
        <Route path="settings/profile" element={<ProtectedRoute element={<AdminProfileSettingsPage />} allowedRoles={['admin', 'Manager', 'Outreach Officer', 'Volunteer Coordinator', 'CSR', 'Telecaller']} />} />
        <Route path="settings/company" element={<ProtectedRoute element={<CompanySettingsPage />} allowedRoles={['admin', 'Manager']} />} />

        {/* Reports */}
        <Route path="reports" element={<ProtectedRoute element={<ReportsPage />} allowedRoles={['admin', 'Manager']} />} />

        {/* Support */}
        <Route path="support" element={<ProtectedRoute element={<SupportPage />} allowedRoles={['admin', 'Manager', 'Outreach Officer', 'Volunteer Coordinator', 'CSR', 'Telecaller']} />} />

        {/* CRM Modules */}
        <Route path="leads" element={<ProtectedRoute element={<LeadsListPage />} allowedRoles={['admin', 'Manager', 'Outreach Officer']} />} />
        <Route path="leads/add" element={<ProtectedRoute element={<AddLeadForm />} allowedRoles={['admin', 'Manager', 'Outreach Officer']} />} />
        <Route path="leads/:leadId" element={<ProtectedRoute element={<LeadDetailsPage />} allowedRoles={['admin', 'Manager', 'Outreach Officer']} />} />
        <Route path="leads/:leadId/edit" element={<ProtectedRoute element={<EditLeadPage />} allowedRoles={['admin', 'Manager', 'Outreach Officer']} />} />

        <Route path="events" element={<ProtectedRoute element={<EventsListPage />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />} />
        <Route path="events/add" element={<ProtectedRoute element={<AddEventForm />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />} />
        <Route path="events/:eventId" element={<ProtectedRoute element={<EventDetailsPage />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />} />
        <Route path="events/:eventId/edit" element={<ProtectedRoute element={<EditEventPage />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />} />

        <Route path="volunteers" element={<ProtectedRoute element={<VolunteersListPage />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />} />
        <Route path="volunteers/add" element={<ProtectedRoute element={<AddVolunteerForm />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />} />
        <Route path="volunteers/:volunteerId" element={<ProtectedRoute element={<VolunteerDetailsPage />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />} />
        <Route path="volunteers/:volunteerId/edit" element={<ProtectedRoute element={<EditVolunteerPage />} allowedRoles={['admin', 'Manager', 'Volunteer Coordinator']} />} />
      </Route>

      {/* Subscription Management */}
      <Route
        path="/subscription" 
        element={<ProtectedRoute element={<SubscriptionPage />} allowedRoles={['admin', 'Manager']} />}
      />
      <Route
        path="/upgrade-plan"
        element={<ProtectedRoute element={<UpgradePlan />} allowedRoles={['admin', 'Manager']} />}
      />

      {/* Catch all - 404 */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
 <SubscriptionProvider>
 <App />
 </SubscriptionProvider>
 </AuthProvider>
  );
}

export default AppWrapper;