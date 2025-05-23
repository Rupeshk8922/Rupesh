import React from "react";
import RequireAuth from "@/components/ProtectedRoute";

import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import UserDashboardPage from "@/pages/dashboard/UserDashboardPage";

const volunteerRoutes = (user) => ({
  path: "/dashboard",
  element: (
    <RequireAuth user={user} allowedRoles={["volunteer"]}>
      <DashboardLayout />
    </RequireAuth>
  ),
  children: [
    { path: "", element: <UserDashboardPage /> },
  ],
});

export default volunteerRoutes;
