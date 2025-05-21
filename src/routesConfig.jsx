import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Lazy loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NewCompanyPage = lazy(() => import('./pages/NewCompanyPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const SignupChoicePage = lazy(() => import('./pages/SignupChoicePage'));
const VerifyCompanyPage = lazy(() => import('./pages/VerifyCompanyPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const CheckoutCancelPage = lazy(() => import('./pages/CheckoutCancelPage'));
const SignupVolunteerPage = lazy(() => import('./pages/SignupVolunteerPage'));
const RedirectingPage = lazy(() => import('./pages/RedirectingPage'));

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
const EditLeadPage = lazy(() => import('./pages/dashboard/crm/leads/EditLeadPage.jsx'));

const EventsListPage = lazy(() => import('./pages/dashboard/crm/events/EventsPage.jsx'));
const AddEventForm = lazy(() => import('./components/crm/AddEventForm.jsx'));
const EventDetailsPage = lazy(() => import('./pages/dashboard/crm/events/EventDetailsPage.jsx'));
const EditEventPage = lazy(() => import('./pages/dashboard/crm/events/EditEventPage.jsx'));

const VolunteersListPage = lazy(() => import('./components/crm/VolunteersList.jsx'));
const AddVolunteerForm = lazy(() => import('./components/crm/AddVolunteerForm.jsx'));
const VolunteerDetailsPage = lazy(() => import('./pages/dashboard/crm/volunteers/VolunteerDetailsPage'));
const EditVolunteerPage = lazy(() => import('./pages/dashboard/crm/volunteers/EditVolunteerPage.jsx'));

const UpgradePlan = lazy(() => import('./pages/UpgradePlan.jsx'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
const NoAccessPage = lazy(() => import('./pages/NoAccessPage'));

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'Manager',
  OUTREACH_OFFICER: 'Outreach Officer',
  VOLUNTEER_COORDINATOR: 'Volunteer Coordinator',
  CSR: 'CSR',
  TELECALLER: 'Telecaller',
  USER: 'User',
};

// Dashboard paths by role
export const roleDashboardPaths = {
  [USER_ROLES.ADMIN]: '/dashboard/admin',
  [USER_ROLES.MANAGER]: '/dashboard/admin',
  [USER_ROLES.OUTREACH_OFFICER]: '/dashboard/outreach',
  [USER_ROLES.CSR]: '/dashboard/csr',
  [USER_ROLES.VOLUNTEER_COORDINATOR]: '/dashboard/volunteer',
  [USER_ROLES.TELECALLER]: '/dashboard/telecaller',
  [USER_ROLES.USER]: '/dashboard/user',
};

export const getRoleDashboardPath = (role) => roleDashboardPaths[role] || '/dashboard';

// Routes config
export const routes = [
  // Redirect root '/' to '/signup' for first time users
  { path: '/', redirect: '/signup', isPublic: true },

  // Public routes
  { path: '/signup', component: SignupChoicePage, isPublic: true },
  { path: '/login', component: LoginPage, isPublic: true },
  { path: '/new-company', component: NewCompanyPage, isPublic: true },
  { path: '/verify-email', component: VerifyEmailPage, isPublic: true },
  { path: '/verify-company', component: VerifyCompanyPage, isPublic: true },
  { path: '/forgot-password', component: ForgotPasswordPage, isPublic: true },
  { path: '/success', component: CheckoutSuccessPage, isPublic: true },
  { path: '/cancel', component: CheckoutCancelPage, isPublic: true },
  { path: '/redirecting', component: RedirectingPage, isPublic: true },
  { path: '/signup-volunteer', component: SignupVolunteerPage, isPublic: true },

  // Protected dashboard routes
  {
    path: '/dashboard',
    isProtected: true,
    allowedRoles: Object.values(USER_ROLES),
    component: DashboardLayout,
    nestedRoutes: [
      { path: 'admin', component: AdminDashboard, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },
      { path: 'user', component: UserDashboardPage, allowedRoles: [USER_ROLES.USER] },
      { path: 'outreach', component: OutreachDashboard, allowedRoles: [USER_ROLES.OUTREACH_OFFICER] },
      { path: 'csr', component: CSRDashboard, allowedRoles: [USER_ROLES.CSR] },
      { path: 'volunteer', component: VolunteerDashboard, allowedRoles: [USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'telecaller', component: TelecallerDashboard, allowedRoles: [USER_ROLES.TELECALLER] },

      // User management
      { path: 'users', component: UsersPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },
      { path: 'users/add', component: AddUserPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },
      { path: 'users/:userId/edit', component: EditUserPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },

      // Settings
      { path: 'settings/profile', component: AdminProfileSettingsPage, allowedRoles: Object.values(USER_ROLES) },
      { path: 'settings/company', component: CompanySettingsPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },

      // Reports and support
      { path: 'reports', component: ReportsPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },
      { path: 'support', component: SupportPage, allowedRoles: Object.values(USER_ROLES) },

      // CRM modules: leads
      { path: 'leads', component: LeadsListPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER] },
      { path: 'leads/add', component: AddLeadForm, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER] },
      { path: 'leads/:leadId', component: LeadDetailsPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER] },
      { path: 'leads/:leadId/edit', component: EditLeadPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OUTREACH_OFFICER] },

      // CRM modules: events
      { path: 'events', component: EventsListPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'events/add', component: AddEventForm, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'events/:eventId', component: EventDetailsPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'events/:eventId/edit', component: EditEventPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },

      // CRM modules: volunteers
      { path: 'volunteers', component: VolunteersListPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'volunteers/add', component: AddVolunteerForm, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'volunteers/:volunteerId', component: VolunteerDetailsPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
      { path: 'volunteers/:volunteerId/edit', component: EditVolunteerPage, allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.VOLUNTEER_COORDINATOR] },
    ],
  },

  // Other protected routes
  {
    path: '/upgrade-plan',
    component: UpgradePlan,
    isProtected: true,
    allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    requiredSubscription: 'active',
  },

  // Fallback routes
  { path: '/no-access', component: NoAccessPage, isPublic: true },
  { path: '*', component: ErrorPage, isPublic: true },
];

// Recursive route rendering function
export const renderRoutes = (routes) => {
  return routes.map((route, idx) => {
    const {
      path,
      component: Component,
      isPublic,
      isProtected,
      allowedRoles,
      requiredSubscription,
      redirect,
      nestedRoutes,
    } = route;

    if (redirect) {
      // Add index={true} for the root path redirect to ensure it matches correctly
      if (path === '/') {
        return (
          <Route key={idx} path={path} element={<Navigate to={redirect} replace />} index={true} />
        );
      } else {
        return <Route key={idx} path={path} element={<Navigate to={redirect} replace />} />;
      }

    }

    if (nestedRoutes) {
      const element = isProtected ? (
        <ProtectedRoute allowedRoles={allowedRoles} requiredSubscription={requiredSubscription}>
          <Component />
        </ProtectedRoute>
      ) : (
        <Component />
      );

      return (
        <Route key={idx} path={path} element={element}>
          {renderRoutes(nestedRoutes)}
        </Route>
      );
    }

    const element = isProtected ? (
      <ProtectedRoute allowedRoles={allowedRoles} requiredSubscription={requiredSubscription}>
        <Component />
      </ProtectedRoute>
    ) : (
      <Component />
    );

    return <Route key={idx} path={path} element={element} />;
  });
};
