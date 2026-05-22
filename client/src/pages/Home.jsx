import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Hero from "../components/Hero";
import JobsSection from "../components/JobsSection";
import CompaniesSection from "../components/CompaniesSection";
import CornerAccents from "../components/CornerAccents";

const Home = () => {
  const { user, isJobSeeker } = useAuth();

  return (
    <>
      <Hero />

      {/* Profile completion notice — quiet monochrome editorial note */}
      {isJobSeeker && !user?.profileComplete && (
        <aside className="bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 border-t border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-12 transition-all duration-300 relative group">
              <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative z-10">
                <div className="flex-1">
                  <div className="text-[10px] font-bold font-mono text-[#8C8C8E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>// SYSTEM_ALERT</span>
                    <span className="telemetry-cursor" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-sans text-fg mb-4 uppercase">
                    Complete your profile to begin applying.
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-[#5C5C5E] dark:text-[#8C8C8E] leading-relaxed">
                    Add a résumé, your skills, and your experience to stand out
                    to employers across EMEA.
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 cursor-pointer"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>COMPLETE PROFILE</span>
                  <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1 ml-2">→</span>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      )}

      <JobsSection />
      <CompaniesSection />
    </>
  );
};

export default Home;
