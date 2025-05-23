import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const DashboardLayout = ({ children }) => {
  const { role } = useAuth();
  const location = useLocation(); // ✅ Fix added

  const baseLinks = [
    { to: "/", label: "Home" },
    { to: "/profile", label: "My Profile" },
  ];

  const roleLinks = {
    admin: [
      { to: "/dashboard/admin", label: "Admin Dashboard" },
      { to: "/leads", label: "Manage Leads" },
      { to: "/events", label: "Manage Events" },
    ],
    volunteer: [
      { to: "/dashboard/volunteer", label: "Volunteer Dashboard" },
      { to: "/events", label: "My Events" },
    ],
    csr: [
      { to: "/dashboard/csr", label: "CSR Dashboard" },
      { to: "/leads", label: "My Leads" },
    ],
    outreach: [
      { to: "/dashboard/outreach", label: "Outreach Dashboard" },
      { to: "/events", label: "Field Events" },
    ],
    telecaller: [
      { to: "/dashboard/telecaller", label: "Telecaller Dashboard" },
      { to: "/leads", label: "Call Leads" },
    ],
    manager: [
      { to: "/dashboard/manager", label: "Manager Dashboard" },
      { to: "/events", label: "Overview Events" },
      { to: "/leads", label: "Overview Leads" },
    ],
  };

  const links = [...baseLinks, ...(roleLinks[role] || [])];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <div className="text-xl font-bold mb-4">Empact CRM</div>
        <nav className="space-y-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "block px-4 py-2 rounded hover:bg-blue-100",
                location.pathname === to ? "bg-blue-200 font-semibold" : ""
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
};

export default DashboardLayout;
