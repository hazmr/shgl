import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

/**
 * shgl — Grayscale Material-You-inspired Navbar
 * Pill shapes, tonal surfaces, state-layer hovers, dark/light toggle.
 */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const { user, logout, isAuthenticated, isEmployer, isJobSeeker, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/", { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    [
      "relative inline-flex items-center h-11 px-5 rounded-full text-sm font-medium tracking-wide",
      "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F2] dark:focus-visible:ring-offset-[#0D0D0D]",
      isActive
        ? "bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] shadow-sm"
        : "text-[#404040] dark:text-[#BFBFBF] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 hover:text-[#0D0D0D] dark:hover:text-[#F2F2F2]",
    ].join(" ");

  const roleLabel = isAdmin ? "Admin" : isEmployer ? "Employer" : "Job Seeker";

  return (
    <header className="sticky top-0 z-40 border-b border-[#BFBFBF]/40 dark:border-[#404040]/60 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
        {/* Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full px-2 py-1 -ml-2 transition-colors duration-300 hover:bg-[#0D0D0D]/5 dark:hover:bg-[#F2F2F2]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
        >
          <img src="/black.png" alt="" aria-hidden="true" className="h-7 w-7 block dark:hidden" />
          <img src="/white.png" alt="" aria-hidden="true" className="h-7 w-7 hidden dark:block" />
          <span className="text-xl font-semibold tracking-tight text-[#0D0D0D] dark:text-[#F2F2F2]">
            shgl
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          <NavLink to="/jobs" className={navLinkClass}>Jobs</NavLink>
          <NavLink to="/companies" className={navLinkClass}>Companies</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
        </nav>

        <div className="flex-1" />

        {/* Theme toggle (pill switch) */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="relative h-11 w-[72px] rounded-full border border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] p-1 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F2] dark:focus-visible:ring-offset-[#0D0D0D]"
        >
          <span
            className={[
              "absolute top-1 left-1 h-8 w-8 rounded-full grid place-items-center shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
              theme === "dark"
                ? "translate-x-[32px] bg-[#F2F2F2] text-[#0D0D0D]"
                : "translate-x-0 bg-[#0D0D0D] text-[#F2F2F2]",
            ].join(" ")}
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
                <path strokeWidth="1.8" strokeLinecap="round" d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.2 5.2l1.8 1.8M17 17l1.8 1.8M18.8 5.2L17 7M7 17l-1.8 1.8" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              </svg>
            )}
          </span>
        </button>

        {/* Right: auth */}
        <div className="hidden md:flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="inline-flex items-center h-11 px-5 rounded-full text-sm font-medium text-[#0D0D0D] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm font-medium bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] shadow-sm hover:shadow-md hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F2] dark:focus-visible:ring-offset-[#0D0D0D]"
              >
                Register
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
            </>
          ) : (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-medium bg-[#BFBFBF]/30 dark:bg-[#404040]/40 text-[#0D0D0D] dark:text-[#F2F2F2] hover:bg-[#BFBFBF]/50 dark:hover:bg-[#404040]/70 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
              >
                <span className="max-w-[10rem] truncate">
                  {user?.name || user?.email || "Account"}
                </span>
                <span className="text-[11px] tracking-wide text-[#8C8C8C]">
                  {roleLabel}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-3xl border border-[#BFBFBF]/40 dark:border-[#404040]/60 bg-[#F2F2F2] dark:bg-[#0D0D0D] shadow-lg overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#BFBFBF]/40 dark:border-[#404040]/60">
                    <div className="text-sm font-medium text-[#0D0D0D] dark:text-[#F2F2F2] truncate">
                      {user?.name || "—"}
                    </div>
                    <div className="text-xs text-[#8C8C8C] mt-0.5">
                      {roleLabel}
                    </div>
                  </div>

                  <ul className="py-2">
                    {isJobSeeker && (
                      <>
                        <MenuLink to="/profile">Profile</MenuLink>
                        <MenuLink to="/applied-jobs">Applied jobs</MenuLink>
                        <MenuLink to="/saved-jobs">Saved jobs</MenuLink>
                      </>
                    )}
                    {isEmployer && (
                      <>
                        <MenuLink to="/post-job">Post a job</MenuLink>
                        <MenuLink to="/employer/jobs">My jobs</MenuLink>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <MenuLink to="/admin">Dashboard</MenuLink>
                        <MenuLink to="/admin/companies">Companies</MenuLink>
                        <MenuLink to="/admin/employers">Employers</MenuLink>
                        <MenuLink to="/admin/contact-messages">Messages</MenuLink>
                      </>
                    )}
                  </ul>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm font-medium border-t border-[#BFBFBF]/40 dark:border-[#404040]/60 text-[#0D0D0D] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-colors duration-200"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="relative h-11 w-11 rounded-full grid place-items-center bg-[#BFBFBF]/30 dark:bg-[#404040]/40 text-[#0D0D0D] dark:text-[#F2F2F2] hover:bg-[#BFBFBF]/50 dark:hover:bg-[#404040]/70 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-current rounded-full" />
              <span className="block h-0.5 w-5 bg-current rounded-full" />
              <span className="block h-0.5 w-5 bg-current rounded-full" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#BFBFBF]/40 dark:border-[#404040]/60 bg-[#F2F2F2]/95 dark:bg-[#0D0D0D]/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-1">
            <MobileLink to="/jobs">Jobs</MobileLink>
            <MobileLink to="/companies">Companies</MobileLink>
            <MobileLink to="/contact">Contact</MobileLink>
            <hr className="my-3 border-[#BFBFBF]/40 dark:border-[#404040]/60" />
            {!isAuthenticated ? (
              <>
                <MobileLink to="/login">Sign in</MobileLink>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 mt-1 rounded-full text-sm font-medium bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] shadow-sm active:scale-95 transition-all duration-300"
                >
                  Register →
                </Link>
              </>
            ) : (
              <>
                {isJobSeeker && (
                  <>
                    <MobileLink to="/profile">Profile</MobileLink>
                    <MobileLink to="/applied-jobs">Applied jobs</MobileLink>
                    <MobileLink to="/saved-jobs">Saved jobs</MobileLink>
                  </>
                )}
                {isEmployer && (
                  <>
                    <MobileLink to="/post-job">Post a job</MobileLink>
                    <MobileLink to="/employer/jobs">My jobs</MobileLink>
                  </>
                )}
                {isAdmin && (
                  <>
                    <MobileLink to="/admin">Dashboard</MobileLink>
                    <MobileLink to="/admin/companies">Companies</MobileLink>
                    <MobileLink to="/admin/employers">Employers</MobileLink>
                    <MobileLink to="/admin/contact-messages">Messages</MobileLink>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-2 inline-flex items-center justify-center h-12 px-6 rounded-full text-sm font-medium border border-[#BFBFBF] dark:border-[#404040] text-[#0D0D0D] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const MenuLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="block px-5 py-2.5 text-sm text-[#404040] dark:text-[#BFBFBF] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 hover:text-[#0D0D0D] dark:hover:text-[#F2F2F2] transition-colors duration-200"
    >
      {children}
    </Link>
  </li>
);

const MobileLink = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex items-center h-12 px-5 rounded-full text-sm font-medium text-[#0D0D0D] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300"
  >
    {children}
  </Link>
);

export default Navbar;
