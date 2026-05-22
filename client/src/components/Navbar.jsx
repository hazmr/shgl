import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import CornerAccents from "./CornerAccents";
import TextScramble from "./TextScramble";

/**
 * SHGL — Quantitative/Foundry-inspired Navbar
 * Sharp rectangular shapes, gridlines, corner accents, monospace typography.
 */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const { user, logout, isAuthenticated, isEmployer, isJobSeeker, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

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

  const navLinkClass = (href) => {
    const isActive = pathname === href;
    return [
      "relative inline-flex items-center h-10 px-5 text-[11px] font-mono font-semibold uppercase tracking-wider group/navlink",
      "transition-all duration-300 ease-foundry",
      isActive
        ? "bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B]"
        : "text-[#5C5C5E] dark:text-[#8C8C8E] hover:text-[#0A0A0B] dark:hover:text-[#ECECEC] hover:bg-[#0A0A0B]/5 dark:hover:bg-[#ECECEC]/5",
    ].join(" ");
  };

  const roleLabel = isAdmin ? "ADMIN" : isEmployer ? "EMPLOYER" : "JOB SEEKER";

  return (
    <header className="sticky top-0 z-40 border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#ECECEC]/90 dark:bg-[#0A0A0B]/90 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Wordmark & Icon */}
        <Link
          to="/"
          className="group relative flex items-center gap-2.5 px-3 py-1.5 border border-transparent hover:border-[#0A0A0B]/10 dark:hover:border-[#ECECEC]/10 transition-all duration-300"
        >
          <CornerAccents className="text-fg/0 group-hover:text-fg/30" />
          <svg className="h-5 w-5 text-[#0A0A0B] dark:text-[#ECECEC] transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="6" height="6" />
            <rect x="15" y="3" width="6" height="6" />
            <rect x="3" y="15" width="6" height="6" />
            <rect x="15" y="15" width="6" height="6" />
            <path d="M9 6h6M9 18h6M6 9v6M18 9v6" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
          <span className="text-lg font-bold tracking-widest text-[#0A0A0B] dark:text-[#ECECEC] font-mono">
            <TextScramble text="SHGL" triggerOnHover={true} autostart={false} />
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1.5 ml-6">
          <Link to="/jobs" className={navLinkClass("/jobs")}>
            {pathname === "/jobs" && <CornerAccents />}
            <TextScramble text="JOBS" triggerOnHover={true} autostart={false} />
          </Link>
          <Link to="/companies" className={navLinkClass("/companies")}>
            {pathname === "/companies" && <CornerAccents />}
            <TextScramble text="COMPANIES" triggerOnHover={true} autostart={false} />
          </Link>
          <Link to="/contact" className={navLinkClass("/contact")}>
            {pathname === "/contact" && <CornerAccents />}
            <TextScramble text="CONTACT" triggerOnHover={true} autostart={false} />
          </Link>
        </nav>

        <div className="flex-1" />

        {/* Theme toggle (Sharp square design) */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="relative h-10 w-10 flex items-center justify-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 hover:border-[#0A0A0B] dark:hover:border-[#ECECEC] text-[#0A0A0B] dark:text-[#ECECEC] bg-transparent transition-all duration-300 group"
        >
          <CornerAccents className="opacity-0 group-hover:opacity-100" />
          {theme === "dark" ? (
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
              <path strokeWidth="1.8" strokeLinecap="round" d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.2 5.2l1.8 1.8M17 17l1.8 1.8M18.8 5.2L17 7M7 17l-1.8 1.8" />
            </svg>
          ) : (
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
            </svg>
          )}
        </button>

        {/* Right: auth */}
        <div className="hidden md:flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="group relative inline-flex items-center h-10 px-5 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0A0A0B] dark:text-[#ECECEC] border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 hover:border-[#0A0A0B] dark:hover:border-[#ECECEC] transition-all duration-300"
              >
                <CornerAccents className="opacity-0 group-hover:opacity-100" />
                SIGN IN
              </Link>
              <Link
                to="/register"
                className="group relative inline-flex items-center h-10 px-5 text-[11px] font-mono font-semibold uppercase tracking-wider bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] transition-all duration-300"
              >
                <CornerAccents className="opacity-0 group-hover:opacity-100" />
                REGISTER
              </Link>
            </>
          ) : (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="group relative inline-flex items-center gap-3 h-10 px-5 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 hover:border-[#0A0A0B] dark:hover:border-[#ECECEC] bg-transparent text-[#0A0A0B] dark:text-[#ECECEC] transition-all duration-300"
              >
                <CornerAccents className="opacity-0 group-hover:opacity-100" />
                <span className="max-w-[10rem] truncate font-mono text-xs font-semibold">
                  {user?.name?.toUpperCase() || user?.email?.toUpperCase() || "ACCOUNT"}
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#8C8C8E]">
                  [{roleLabel}]
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 border border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 bg-[#ECECEC] dark:bg-[#0A0A0B] shadow-2xl overflow-hidden z-50">
                  <div className="px-5 py-4 border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
                    <div className="text-xs font-mono font-bold text-[#0A0A0B] dark:text-[#ECECEC] truncate">
                      {user?.name || "—"}
                    </div>
                    <div className="text-[10px] font-mono text-[#8C8C8E] mt-0.5">
                      {roleLabel}
                    </div>
                  </div>

                  <ul className="py-1">
                    {isJobSeeker && (
                      <>
                        <MenuLink to="/profile">PROFILE</MenuLink>
                        <MenuLink to="/applied-jobs">APPLIED JOBS</MenuLink>
                        <MenuLink to="/saved-jobs">SAVED JOBS</MenuLink>
                      </>
                    )}
                    {isEmployer && (
                      <>
                        <MenuLink to="/post-job">POST A JOB</MenuLink>
                        <MenuLink to="/employer/jobs">MY JOBS</MenuLink>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <MenuLink to="/admin">DASHBOARD</MenuLink>
                        <MenuLink to="/admin/companies">COMPANIES</MenuLink>
                        <MenuLink to="/admin/employers">EMPLOYERS</MenuLink>
                        <MenuLink to="/admin/contact-messages">MESSAGES</MenuLink>
                      </>
                    )}
                  </ul>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-xs font-mono font-semibold border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 text-[#0A0A0B] dark:text-[#ECECEC] hover:bg-[#0A0A0B]/10 dark:hover:bg-[#ECECEC]/10 transition-colors duration-200"
                  >
                    SIGN OUT
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
            className="group relative h-10 w-10 flex items-center justify-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 hover:border-fg bg-transparent text-[#0A0A0B] dark:text-[#ECECEC] transition-all duration-300"
          >
            <CornerAccents className="opacity-0 group-hover:opacity-100" />
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-current transition-transform duration-300" />
              <span className="block h-0.5 w-5 bg-current transition-opacity duration-300" />
              <span className="block h-0.5 w-5 bg-current transition-transform duration-300" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#ECECEC]/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-1.5">
            <MobileLink to="/jobs">JOBS</MobileLink>
            <MobileLink to="/companies">COMPANIES</MobileLink>
            <MobileLink to="/contact">CONTACT</MobileLink>
            <hr className="my-2 border-[#0A0A0B]/10 dark:border-[#ECECEC]/10" />
            {!isAuthenticated ? (
              <>
                <MobileLink to="/login">SIGN IN</MobileLink>
                <Link
                  to="/register"
                  className="relative inline-flex items-center justify-center h-11 px-5 mt-1 text-xs font-mono font-semibold uppercase tracking-wider bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] transition-all duration-300"
                >
                  REGISTER
                </Link>
              </>
            ) : (
              <>
                {isJobSeeker && (
                  <>
                    <MobileLink to="/profile">PROFILE</MobileLink>
                    <MobileLink to="/applied-jobs">APPLIED JOBS</MobileLink>
                    <MobileLink to="/saved-jobs">SAVED JOBS</MobileLink>
                  </>
                )}
                {isEmployer && (
                  <>
                    <MobileLink to="/post-job">POST A JOB</MobileLink>
                    <MobileLink to="/employer/jobs">MY JOBS</MobileLink>
                  </>
                )}
                {isAdmin && (
                  <>
                    <MobileLink to="/admin">DASHBOARD</MobileLink>
                    <MobileLink to="/admin/companies">COMPANIES</MobileLink>
                    <MobileLink to="/admin/employers">EMPLOYERS</MobileLink>
                    <MobileLink to="/admin/contact-messages">MESSAGES</MobileLink>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-2 inline-flex items-center justify-center h-11 px-5 text-xs font-mono font-semibold uppercase tracking-wider border border-[#0A0A0B]/25 dark:border-[#ECECEC]/25 text-[#0A0A0B] dark:text-[#ECECEC] hover:bg-[#0A0A0B]/10 dark:hover:bg-[#ECECEC]/10 transition-all duration-300"
                >
                  SIGN OUT
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
      className="block px-5 py-2.5 text-xs font-mono font-medium text-[#5C5C5E] dark:text-[#8C8C8E] hover:bg-[#0A0A0B]/10 dark:hover:bg-[#ECECEC]/10 hover:text-[#0A0A0B] dark:hover:text-[#ECECEC] transition-colors duration-200"
    >
      {children}
    </Link>
  </li>
);

const MobileLink = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex items-center h-11 px-5 text-xs font-mono font-semibold uppercase tracking-wider text-[#0A0A0B] dark:text-[#ECECEC] hover:bg-[#0A0A0B]/10 dark:hover:bg-[#ECECEC]/10 transition-all duration-300"
  >
    {children}
  </Link>
);

export default Navbar;
