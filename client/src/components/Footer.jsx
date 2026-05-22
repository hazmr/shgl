import { Link } from "react-router-dom";
import CornerAccents from "./CornerAccents";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] gap-10">
          <div>
            <Link
              to="/"
              className="group relative inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 px-5 py-2.5 text-xl font-bold tracking-widest text-[#0A0A0B] dark:text-[#ECECEC] font-mono uppercase bg-transparent transition-all duration-300"
            >
              <CornerAccents className="opacity-0 group-hover:opacity-100" />
              SHGL
            </Link>
            <p className="mt-5 max-w-md text-xs leading-relaxed font-mono text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider">
              QUANTITATIVE CAREERS & TECHNOLOGY LISTINGS ACROSS EMEA.
              CLEAR ROLE SPECIFICATIONS, STRUCTURAL INSIGHTS, AND RESOLUTE INTEGRITY.
            </p>
          </div>

          <FooterCol title="Explore">
            <FooterLink to="/jobs">Jobs</FooterLink>
            <FooterLink to="/companies">Companies</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
          </FooterCol>

          <FooterCol title="Account">
            <FooterLink to="/login">Sign In</FooterLink>
            <FooterLink to="/register">Register</FooterLink>
            <FooterLink to="/profile">Profile</FooterLink>
          </FooterCol>

          <FooterCol title="Meta System">
            <li>
              <span className="text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E]">SYS_VERSION: v1.0.0</span>
            </li>
            <li>
              <span className="text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E]">EPOCH_TIME: {year}</span>
            </li>
          </FooterCol>
        </div>

        <hr className="my-8 border-[#0A0A0B]/10 dark:border-[#ECECEC]/10" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between font-mono text-[10px] tracking-widest uppercase">
          <p className="text-[#5C5C5E] dark:text-[#8C8C8E]">
            © {year} SHGL — STRUCTURING TECH PLACEMENT ACROSS GLOBAL MARKETS.
          </p>
          <p className="text-[#8C8C8E]">
            PULLING THE FUTURE FORWARD.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, children }) => (
  <div>
    <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[#0A0A0B] dark:text-[#ECECEC]">
      {title}
    </h4>
    <ul className="mt-4 space-y-2">{children}</ul>
  </div>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link to={to}
      className="group relative inline-flex items-center h-9 px-4 border border-transparent hover:border-[#0A0A0B]/10 dark:hover:border-[#ECECEC]/10 text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:text-[#0A0A0B] dark:hover:text-[#ECECEC] transition-all duration-300"
    >
      <CornerAccents className="opacity-0 group-hover:opacity-100" />
      {children}
    </Link>
  </li>
);

export default Footer;
