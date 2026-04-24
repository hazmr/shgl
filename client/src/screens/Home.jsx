import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Hero from "../components/Hero";
import JobsSection from "../components/JobsSection";
import CompaniesSection from "../components/CompaniesSection";

const Home = () => {
  const { user, isJobSeeker } = useAuth();

  return (
    <>
      <Hero />

      {/* Profile completion notice — quiet monochrome editorial note */}
      {isJobSeeker && !user?.profileComplete && (
        <aside className="bg-[#F2F2F2] border-t-2 border-b-2 border-[#BFBFBF]">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-12">
            <div className="bg-[#BFBFBF] rounded-3xl p-8 sm:p-12 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#404040] uppercase tracking-wide mb-2">
                    Notice
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#0D0D0D] mb-4">
                    Complete your profile to begin applying.
                  </h3>
                  <p className="text-base text-[#404040] leading-relaxed">
                    Add a résumé, your skills, and your experience to stand out
                    to employers across EMEA.
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#0D0D0D] text-[#F2F2F2] rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300 hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#404040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#BFBFBF]"
                >
                  Complete profile <span className="ml-2" aria-hidden>→</span>
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
