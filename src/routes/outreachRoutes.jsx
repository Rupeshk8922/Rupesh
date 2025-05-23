import React from "react";
import RequireAuth from "@/components/ProtectedRoute";

import DashboardLayout from "@/components/layout/DashboardLayout";
import UserDashboardPage from "@/pages/dashboard/UserDashboardPage";
import VolunteersListPage from "@/pages/dashboard/crm/volunteers/VolunteersListPage";
import CreateVolunteerPage from "@/pages/dashboard/crm/volunteers/CreateVolunteerPage";

const outreachRoutes = (user) => [
  {
    path: "/dashboard",
    element: (
      <RequireAuth user={user} allowedRoles={["outreach", "csr", "admin"]}>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { path: "", element: <UserDashboardPage /> },
      { path: "volunteers", element: <VolunteersListPage /> },
      { path: "volunteers/create", element: <CreateVolunteerPage /> },
    ],
  },
];

export default outreachRoutes;
