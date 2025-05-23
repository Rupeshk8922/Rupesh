import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import UserDashboardPage from "@/pages/dashboard/UserDashboardPage";

const telecallerRoutes = [
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { path: "", element: <UserDashboardPage /> },
    ],
  },
];

export default telecallerRoutes;
