import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/* Icons */
const Icon = ({ d, className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d={d} /></svg>
);
const Moon = (p) => <Icon {...p} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />;
const Sun  = (p) => <Icon {...p} d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v2m0 16v2m10-10h-2M4 12H2m15.364 6.364l-1.414-1.414M6.05 6.05 4.636 4.636m0 14.728 1.414-1.414M18.364 5.636 16.95 7.05" />;
const Menu = (p) => <Icon {...p} className="h-6 w-6" d="M3 6h18M3 12h18M3 18h18" />;
const X    = (p) => <Icon {...p} className="h-6 w-6" d="M6 6l12 12M18 6L6 18" />;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  // theme
  const initialTheme = useMemo(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // effects
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setMobileOpen(false); setUserOpen(false); }, [location.pathname]);
  useEffect(() => {
    const onDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserOpen(false);
    };
    if (userOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [userOpen]);

  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-indigo-600 hover:bg-gray-100/70 dark:text-gray-200 dark:hover:bg-white/10";
  const active =
    "text-indigo-600 dark:text-indigo-400 bg-gray-100/80 dark:bg-white/10";
  const navLink = ({ isActive }) => `${linkBase} ${isActive ? active : ""}`;

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full border-b backdrop-blur",
        scrolled
          ? "bg-white/80 shadow-sm dark:bg-gray-900/60 dark:border-white/10"
          : "bg-white/60 dark:bg-gray-900/50 dark:border-white/10",
      ].join(" ")}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 shadow-inner" />
            <span className="text-lg font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Salon</span>{" "}
              & Spa
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/services" className={navLink}>Services</NavLink>
            <NavLink to="/book" className={navLink}>Book</NavLink>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border text-gray-700 bg-white/70 shadow-sm transition hover:bg-gray-100 dark:text-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>

            {/* User */}
            {user ? (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  onClick={() => setUserOpen((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-lg border bg-white/70 px-3 py-1.5 text-sm text-gray-800 shadow-sm transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
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
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border bg-white text-sm text-gray-800 shadow-xl dark:border-white/10 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <Link
                      to="/me/appointments"
                      className="block px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/10"
                      role="menuitem"
                    >
                      My Appointments
                    </Link>
                    <div className="my-1 h-px bg-gray-100 dark:bg-white/10" />
                    <button
                      onClick={async () => {
                        await logout();
                        setUserOpen(false);
                        navigate("/");
                      }}
                      className="block w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-1">
                <NavLink to="/login" className={navLink}>Login</NavLink>
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
              </div>
            )}
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-gray-700 bg-white/70 shadow-sm transition hover:bg-gray-100 dark:text-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>
            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-gray-700 bg-white/70 shadow-sm transition hover:bg-gray-100 dark:text-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              aria-label="Open menu"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="border-t bg-white/95 backdrop-blur dark:border-white/10 dark:bg-gray-900/85">
            <div className="mx-auto max-w-6xl px-4 py-3">
              <div className="flex flex-col gap-2">
                <NavLink to="/services" className={navLink}>Services</NavLink>
                <NavLink to="/book" className={navLink}>Book</NavLink>
                <div className="my-2 h-px bg-gray-100 dark:bg-white/10" />
                {user ? (
                  <>
                    <NavLink to="/me/appointments" className={navLink}>
                      My Appointments
                    </NavLink>
                    <button
                      onClick={async () => { await logout(); navigate("/"); }}
                      className="mt-1 w-full rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className={navLink}>Login</NavLink>
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
