import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

/* Minimal inline icons */
function Icon({ name, className = "h-5 w-5" }) {
  const stroke = "stroke-current";
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${stroke}`} fill="none">
          <path d="M3 11h8V3H3v8Z" strokeWidth="1.8" />
          <path d="M13 3h8v6h-8V3Z" strokeWidth="1.8" />
          <path d="M13 11h8v10h-8V11Z" strokeWidth="1.8" />
          <path d="M3 13h8v8H3v-8Z" strokeWidth="1.8" />
        </svg>
      );
    case "categories":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${stroke}`} fill="none">
          <path d="M4 4h7v7H4V4Z" strokeWidth="1.8" />
          <path d="M13 4h7v7h-7V4Z" strokeWidth="1.8" />
          <path d="M4 13h7v7H4v-7Z" strokeWidth="1.8" />
          <path d="M13 17h7v3h-7v-3Z" strokeWidth="1.8" />
        </svg>
      );
    case "services":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${stroke}`} fill="none">
          <path d="M4 7h16M6 12h12M8 17h8" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "staff":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${stroke}`} fill="none">
          <circle cx="12" cy="8" r="3.5" strokeWidth="1.8" />
          <path d="M4 20a8 8 0 0116 0" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "bookings":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${stroke}`} fill="none">
          <path d="M7 3v4M17 3v4M4 9h16M6 12h5m-5 4h8" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="3" y="4" width="18" height="17" rx="2.5" strokeWidth="1.8" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${stroke}`} fill="none">
          <path d="M7 3v3M17 3v3" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="3" y="5" width="18" height="16" rx="2.5" strokeWidth="1.8" />
          <path d="M3 9h18" strokeWidth="1.8" />
          <path d="M7 12h3M12 12h3M17 12h0M7 16h3M12 16h3" strokeWidth="1.8" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("admin.sidebar.collapsed") === "1"
  );
  useEffect(() => {
    localStorage.setItem("admin.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/admin/calendar",  label: "Calendar",  icon: "calendar" }, // <-- added
    { to: "/admin/categories", label: "Categories", icon: "categories" },
    { to: "/admin/services",  label: "Services",  icon: "services" },
    { to: "/admin/staff",     label: "Staff",     icon: "staff" },
    { to: "/admin/bookings",  label: "Bookings",  icon: "bookings" },
  ];

  const desktopWidth = collapsed ? "lg:w-20" : "lg:w-64";

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-[60] grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 lg:hidden"
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:transform-none lg:z-40",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          desktopWidth,
          "bg-white border-r border-gray-200 shadow-sm",
          "lg:sticky lg:top-0 lg:h-screen",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 shadow-md">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold text-gray-900">Admin Panel</div>
                <div className="text-xs text-gray-500">Salon &amp; Spa</div>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          {isDesktop && (
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden lg:grid h-8 w-8 place-items-center rounded-md border border-gray-200 hover:bg-gray-100"
              title={collapsed ? "Expand" : "Collapse"}
            >
              <span className={`transition-transform ${collapsed ? "" : "rotate-180"}`}>›</span>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex flex-col gap-1 px-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-indigo-700",
                ].join(" ")
              }
            >
              <Icon name={l.icon} />
              {!collapsed && <span className="truncate">{l.label}</span>}
            </NavLink>
          ))}

          {!collapsed && (
            <div className="mt-auto select-none px-3 pt-4 text-[11px] uppercase tracking-wider text-gray-400">
              v1.0 • Internal
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
