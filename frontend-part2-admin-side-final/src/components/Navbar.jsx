import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/* Icons */
const Icon = ({ d, className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={d} />
  </svg>
);
const Menu = (p) => <Icon {...p} className="h-6 w-6" d="M3 6h18M3 12h18M3 18h18" />;
const X = (p) => <Icon {...p} className="h-6 w-6" d="M6 6l12 12M18 6L6 18" />;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === "admin";
  const onAdminRoute = /^\/admin(\/|$)/.test(location.pathname); // ✅ detect admin pages

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    if (userOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [userOpen]);

  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-indigo-600 hover:bg-gray-100/70";
  const active = "text-indigo-600 bg-gray-100/80";
  const navLink = ({ isActive }) => `${linkBase} ${isActive ? active : ""}`;

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full border-b backdrop-blur",
        scrolled ? "bg-white/80 shadow-sm" : "bg-white/60",
      ].join(" ")}
    >
      <div className="w-full px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 shadow-inner" />
            <span className="text-lg font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                Salon
              </span>{" "}
              &amp; Spa
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {/* Show customer links only when not on admin pages */}
            {!onAdminRoute && (!user || user.role === "customer") ? (
              <>
                <NavLink to="/services" className={navLink}>
                  Services
                </NavLink>
                <NavLink to="/book" className={navLink}>
                  Book
                </NavLink>
              </>
            ) : null}

            {/* Quick link to Admin panel if you're an admin (optional) */}
            {isAdmin && (
              <NavLink to="/admin/dashboard" className={navLink}>
                Admin Panel
              </NavLink>
            )}

            {/* User menu */}
            {user ? (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  onClick={() => setUserOpen((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-lg border bg-white/70 px-3 py-1.5 text-sm text-gray-800 shadow-sm transition hover:bg-gray-100"
                  aria-haspopup="menu"
                  aria-expanded={userOpen}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                  <span className="hidden sm:inline">Hi, {user.name}</span>
                </button>

                {userOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border bg-white text-sm text-gray-800 shadow-xl"
                  >
                    {/* Customer links */}
                    {user.role === "customer" && (
                      <>
                        <NavLink
                          to="/me/appointments"
                          className="block px-4 py-2.5 hover:bg-gray-50"
                          role="menuitem"
                        >
                          My Appointments
                        </NavLink>
                        <NavLink
                          to="/me/settings"
                          className="block px-4 py-2.5 hover:bg-gray-50"
                          role="menuitem"
                        >
                          Settings
                        </NavLink>
                      </>
                    )}
                    <div className="my-1 h-px bg-gray-100" />
                    <button
                      onClick={async () => {
                        await logout();
                        setUserOpen(false);
                        navigate("/");
                      }}
                      className="block w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-1">
                {!onAdminRoute && (
                  <>
                    <NavLink to="/login" className={navLink}>
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className={({ isActive }) =>
                        [
                          "px-3 py-2 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow hover:opacity-90",
                          isActive ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                        ].join(" ")
                      }
                    >
                      Create Account
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </nav>

          {/* Mobile controls — HIDE on admin pages for admins */}
          <div className="flex items-center gap-2 md:hidden">
            {!(isAdmin && onAdminRoute) && (
              <button
                onClick={() => setMobileOpen((s) => !s)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-gray-700 bg-white/70 shadow-sm transition hover:bg-gray-100"
                aria-label="Open menu"
              >
                {mobileOpen ? <X /> : <Menu />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sheet — also HIDE on admin pages for admins */}
      {mobileOpen && !(isAdmin && onAdminRoute) && (
        <div className="md:hidden">
          <div className="border-t bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-3">
              <div className="flex flex-col gap-2">
                <NavLink to="/services" className={navLink}>
                  Services
                </NavLink>
                <NavLink to="/book" className={navLink}>
                  Book
                </NavLink>
                <div className="my-2 h-px bg-gray-100" />
                {user ? (
                  <>
                    {user.role === "customer" && (
                      <>
                        <NavLink to="/me/appointments" className={navLink}>
                          My Appointments
                        </NavLink>
                        <NavLink to="/me/settings" className={navLink}>
                          Settings
                        </NavLink>
                      </>
                    )}
                    <button
                      onClick={async () => {
                        await logout();
                        navigate("/");
                      }}
                      className="mt-1 w-full rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className={navLink}>
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="px-3 py-2 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow hover:opacity-90"
                    >
                      Create Account
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
