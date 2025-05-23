import publicRoutes from "./publicRoutes";
import adminRoutes from "./adminRoutes";
import csrRoutes from "./csrRoutes";
import outreachRoutes from "./outreachRoutes";
import telecallerRoutes from "./telecallerRoutes";
import volunteerRoutes from "./volunteerRoutes";
import commonRoutes from "./commonRoutes";

const roleRouteMap = {
  admin: adminRoutes,
  csr: csrRoutes,
  outreach: outreachRoutes,
  telecaller: telecallerRoutes,
  volunteer: volunteerRoutes,
};

export function getRoutes(user) {
  const role = user?.role;
  let routes = [...publicRoutes];

  if (role && roleRouteMap[role]) {
    // roleRouteMap functions expect `user` parameter, so call accordingly
    routes.push(...roleRouteMap[role](user));
  }

  routes = routes.concat(commonRoutes);

  return routes;
}
