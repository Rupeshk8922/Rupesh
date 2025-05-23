import React from "react";

import RequireAuth from "../components/ProtectedRoute";
import DashboardAdmin from "../pages/dashboard/DashboardAdmin";

// Analytics
import EventAnalyticsPage from "../pages/analytics/EventAnalyticsPage";
import LeadsAnalyticsPage from "../pages/analytics/LeadsAnalyticsPage";
import VolunteerAnalyticsPage from "../pages/analytics/VolunteerAnalyticsPage";
import PerformanceSummary from "../pages/analytics/PerformanceSummary";

// Leads
import LeadsListPage from "../pages/modules/leads/LeadsListPage";
import CreateLeadPage from "../pages/modules/leads/CreateLeadPage";
import EditLeadPage from "../pages/modules/leads/EditLeadPage";
import ViewLeadPage from "../pages/modules/leads/ViewLeadPage";
import LeadDetailsPage from "../pages/leads/LeadDetailsPage";

// Outreach Contacts
import OutreachContactDetails from "../pages/leads/OutreachContactDetails";
import EditOutreachContactPage from "../pages/leads/EditOutreachContactPage";

// Events
import EventsListPage from "../pages/modules/events/EventsListPage";
import CreateEventPage from "../pages/modules/events/CreateEventPage";
import EditEventPage from "../pages/modules/events/EditEventPage";
import ViewEventPage from "../pages/modules/events/ViewEventPage";
import FollowUpReminder from "../pages/events/FollowUpReminder";

// Users
import UsersListPage from "../pages/modules/users/UsersListPage";
import InviteUserPage from "../pages/modules/users/InviteUserPage";
import EditUserPage from "../pages/modules/users/EditUserPage";

// Volunteers (NEW)
import VolunteersListPage from "../pages/modules/volunteers/VolunteersListPage";
import CreateVolunteerPage from "../pages/dashboard/crm/volunteers/CreateVolunteerPage";

// Settings
import ProfilePage from "../pages/modules/settings/ProfilePage";
import SettingsPage from "../pages/modules/settings/SettingsPage";
import CompanySettingsPage from "../pages/dashboard/admin/CompanySettingsPage";

const adminRoutes = (user) => ({
  path: "/dashboard-admin",
  element: <RequireAuth user={user} allowedRoles={["admin"]} />,
  children: [
    { path: "", element: <DashboardAdmin /> },

    // Analytics
    { path: "analytics/events", element: <EventAnalyticsPage /> },
    { path: "analytics/leads", element: <LeadsAnalyticsPage /> },
    { path: "analytics/volunteers", element: <VolunteerAnalyticsPage /> },
    { path: "analytics/performance", element: <PerformanceSummary /> },

    // Leads
    { path: "leads", element: <LeadsListPage /> },
    { path: "leads/create", element: <CreateLeadPage /> },
    { path: "leads/edit/:leadId", element: <EditLeadPage /> },
    { path: "leads/view/:leadId", element: <ViewLeadPage /> },
    { path: "leads/details/:leadId", element: <LeadDetailsPage /> },

    // Outreach Contacts
    { path: "outreach-contacts/details/:contactId", element: <OutreachContactDetails /> },
    { path: "outreach-contacts/edit/:contactId", element: <EditOutreachContactPage /> },

    // Events
    { path: "events", element: <EventsListPage /> },
    { path: "events/create", element: <CreateEventPage /> },
    { path: "events/edit/:eventId", element: <EditEventPage /> },
    { path: "events/view/:eventId", element: <ViewEventPage /> },
    { path: "events/follow-up/:eventId", element: <FollowUpReminder /> },

    // Users
    { path: "users", element: <UsersListPage /> },
    { path: "users/invite", element: <InviteUserPage /> },
    { path: "users/edit/:userId", element: <EditUserPage /> },

    // Volunteers (NEW)
    { path: "volunteers", element: <VolunteersListPage /> },
    { path: "volunteers/create", element: <CreateVolunteerPage /> },

    // Profile & Settings
    { path: "profile", element: <ProfilePage /> },
    { path: "settings", element: <SettingsPage /> },

    // Company Settings (NEW)
    { path: "settings/company", element: <CompanySettingsPage /> },
  ],
});

export default adminRoutes;
