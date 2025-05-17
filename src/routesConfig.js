import { lazy } from 'react';
import { Route } from 'react-router-dom';

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
const EditVolunteerPage = lazy(() => import('./pages/dashboard/crm/volunteers/EditVolunteerPage.jsx'));
const UpgradePlan = lazy(() => import('./pages/UpgradePlan.jsx'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
const NoAccessPage = lazy(() => import('./pages/NoAccessPage'));


// Role definitions
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'Manager',
  OUTREACH_OFFICER: 'Outreach Officer',
  VOLUNTEER_COORDINATOR: 'Volunteer Coordinator',
  CSR: 'CSR',
  TELECALLER: 'Telecaller',
  USER: 'User',
};

// Dashboard paths for each role
export const roleDashboardPaths = {
  [USER_ROLES.ADMIN]: '/dashboard/admin',
  [USER_ROLES.MANAGER]: '/dashboard/admin', // Assuming Manager goes to the same dashboard as admin
  [USER_ROLES.OUTREACH_OFFICER]: '/dashboard/outreach',
  [USER_ROLES.CSR]: '/dashboard/csr',
  [USER_ROLES.VOLUNTEER_COORDINATOR]: '/dashboard/volunteer',
  [USER_ROLES.TELECALLER]: '/dashboard/telecaller',
  [USER_ROLES.USER]: '/dashboard/user', // Assuming a general user dashboard
};

export const getRoleDashboardPath = (role) => {
  return roleDashboardPaths[role] || '/dashboard'; // Default to /dashboard if role not found
};

// Route configuration
export const routes = [
  // Public Routes
  { path: '/login', component: LoginPage, isPublic: true },
  { path: '/new-company', component: NewCompanyPage, isPublic: true },
  { path: '/verify-email', component: VerifyEmailPage, isPublic: true },
  { path: '/verify-company', component: VerifyCompanyPage, isPublic: true },
  { path: '/forgot-password', component: ForgotPasswordPage, isPublic: true },
  { path: '/success', component: CheckoutSuccessPage, isPublic: true }, // Stripe redirect
  { path: '/cancel', component: CheckoutCancelPage, isPublic: true }, // Stripe redirect
  // Add other public routes like signup pages here
  // { path: '/signup-choice', component: SignupChoicePage, isPublic: true },
  // { path: '/signup', component: SignupPage, isPublic: true },
  // { path: '/signup/company', component: SignupCompanyPage, isPublic: true },
  // { path: '/signup/volunteer', component: SignupVolunteerPage, isPublic: true },


  // Protected Routes (Nested under /dashboard)
  {
    path: '/dashboard',
    isProtected: true,
    allowedRoles: Object.values(USER_ROLES), // All roles have access to the dashboard layout
    // No component here directly, the DashboardLayout will be rendered by the parent Route
    nestedRoutes: [
      { path: 'admin', component: AdminDashboard, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },
      { path: 'user', component: UserDashboardPage, allowedRoles: [USER_ROLES.USER] },
      { path: 'outreach', component: OutreachDashboard, allowedRoles: [USER_ROLES.OUTREACH_OFFICER] },
      { path: 'csr', component: CSRDashboard, allowedRoles: [USER_ROLES.CSR] },
      { path: 'volunteer', component: VolunteerDashboard, allowedRoles: [USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'telecaller', component: TelecallerDashboard, allowedRoles: [USER_ROLES.TELECALLER] },

      // User Management
      { path: 'users', component: UsersPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },
      { path: 'users/add', component: AddUserPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },
      { path: 'users/:userId/edit', component: EditUserPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },

      // Profile and Company Settings
      { path: 'settings/profile', component: AdminProfileSettingsPage, allowedRoles: Object.values(USER_ROLES) },
      { path: 'settings/company', component: CompanySettingsPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },

      // Reports
      { path: 'reports', component: ReportsPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },

      // Support
      { path: 'support', component: SupportPage, allowedRoles: Object.values(USER_ROLES) },

      // CRM Modules
      { path: 'leads', component: LeadsListPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER] },
      { path: 'leads/add', component: AddLeadForm, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER] },
      { path: 'leads/:leadId', component: LeadDetailsPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER] },
      { path: 'leads/:leadId/edit', component: EditLeadPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER] },

      { path: 'events', component: EventsListPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'events/add', component: AddEventForm, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'events/:eventId', component: EventDetailsPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'events/:eventId/edit', component: EditEventPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },

      { path: 'volunteers', component: VolunteersListPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'volunteers/add', component: AddVolunteerForm, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'volunteers/:volunteerId', component: VolunteerDetailsPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'volunteers/:volunteerId/edit', component: EditVolunteerPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
    ],
  },

  // Other Protected Routes (not nested under /dashboard)
  { path: '/upgrade-plan', component: UpgradePlan, isProtected: true, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER], requiredSubscription: 'active' }, // Example of required subscription

  // Fallback routes
  { path: '/no-access', component: NoAccessPage, isPublic: true }, // Dedicated no access page
  { path: '*', component: ErrorPage, isPublic: true }, // Catch all 404
];

// Function to render routes recursively
export const renderRoutes = (routes) => {
  return routes.map((route, index) => {
    const { path, component: Component, isPublic, isProtected, allowedRoles, requiredSubscription, nestedRoutes } = route;

    // For nested routes, the parent route renders the layout and outlet
    if (nestedRoutes) {
      return (
        <Route
          key={index}
          path={path}
          element={
            isProtected ? (
              <ProtectedRoute allowedRoles={allowedRoles} requiredSubscription={requiredSubscription}>
                 {/* Render the layout component directly here for nested routes */}
                 <DashboardLayout />
              </ProtectedRoute>
            ) : (
              <Component />
            )
          }
        >
          {/* Recursively render nested routes */}
          {renderRoutes(nestedRoutes)}
        </Route>
      );
    }

    // For single routes, render the component directly within ProtectedRoute or as a public route
    if (isProtected) {
      return (
        <Route
          key={index}
          path={path}
          element={
            <ProtectedRoute allowedRoles={allowedRoles} requiredSubscription={requiredSubscription}>
              <Component />
            </ProtectedRoute>
          }
        />
      );
    }

    // Public routes
    return <Route key={index} path={path} element={<Component />} />;
  });
};