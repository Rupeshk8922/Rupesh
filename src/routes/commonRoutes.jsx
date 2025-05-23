import AccessDenied from "../pages/errors/AccessDeniedPage";
import NotFound from "../pages/common/NotFound";
import SupportPage from "../pages/settings/SupportPage";

const commonRoutes = [
  { path: "/access-denied", element: <AccessDenied /> },
  { path: "/support", element: <SupportPage /> },
  { path: "*", element: <NotFound /> },
];

export default commonRoutes;
