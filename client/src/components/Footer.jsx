import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/35">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] gap-10">
          <div>
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-4 py-2 text-2xl font-semibold tracking-tight text-[#0D0D0D] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
            >
              shgl
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
              A focused hiring platform for technology careers across EMEA.
              Clear role details, practical company insights, and low-friction applications.
            </p>
          </div>

          <FooterCol title="Explore">
            <FooterLink to="/jobs">Jobs</FooterLink>
            <FooterLink to="/companies">Companies</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
          </FooterCol>

          <FooterCol title="Account">
            <FooterLink to="/login">Sign in</FooterLink>
            <FooterLink to="/register">Register</FooterLink>
            <FooterLink to="/profile">Profile</FooterLink>
          </FooterCol>

          <FooterCol title="Meta">
            <li>
              <span className="text-sm text-[#404040] dark:text-[#BFBFBF]">v0.1</span>
            </li>
            <li>
              <span className="text-sm text-[#404040] dark:text-[#BFBFBF]">{year}</span>
            </li>
          </FooterCol>
        </div>

        <hr className="my-8 border-[#BFBFBF]/60 dark:border-[#404040]/80" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#404040] dark:text-[#BFBFBF]">
            © {year} shgl — Connecting tech talent across EMEA.
          </p>
          <p className="text-sm text-[#8C8C8C]">
            Find your next career move.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, children }) => (
  <div>
    <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8C8C8C]">
      {title}
    </h4>
    <ul className="mt-4 space-y-2">{children}</ul>
  </div>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-[#404040] dark:text-[#BFBFBF] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 hover:text-[#0D0D0D] dark:hover:text-[#F2F2F2] active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
    >
      {children}
    </Link>
  </li>
);

export default Footer;
