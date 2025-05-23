import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import UserDashboardPage from "@/pages/dashboard/UserDashboardPage";
import EventsListPage from "@/pages/modules/events/EventsListPage";
import ViewEventPage from "@/pages/modules/events/ViewEventPage";
import CreateEventPage from "../pages/modules/events/CreateEventPage";
import VolunteersListPage from "../pages/modules/volunteers/VolunteersListPage";
import CreateVolunteerPage from "@/pages/dashboard/crm/volunteers/CreateVolunteerPage";
import EditVolunteerPage from "@/pages/modules/volunteers/EditVolunteerPage";
import ProfilePage from "@/pages/modules/settings/ProfilePage";
import SettingsPage from "@/pages/modules/settings/SettingsPage";
import CompanySettingsPage from "@/pages/dashboard/admin/CompanySettingsPage";

const csrRoutes = [
 {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { path: "", element: <UserDashboardPage /> },
      { path: "events", element: <EventsListPage /> },
      { path: "events/create", element: <CreateEventPage /> },
      { path: "events/view/:eventId", element: <ViewEventPage /> },
      { path: "volunteers", element: <VolunteersListPage /> },
      { path: "volunteers/create", element: <CreateVolunteerPage /> },
      { path: "volunteers/edit/:volunteerId", element: <EditVolunteerPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "company-settings", element: <CompanySettingsPage /> },
    ],
  },
];

export default csrRoutes;
