import { Link } from "react-router-dom";
import { useCompanies } from "../contexts/CompaniesContext";
import { useJobsData } from "../contexts/JobsDataContext";

const isTechCompany = (company) => {
  const haystack = `${company.name || ""} ${company.industry || ""}`.toLowerCase();
  return /tech|software|fintech|saas|cloud|data|ai|cyber|it|platform|digital/.test(haystack);
};

const isTechJob = (job) => {
  const haystack = `${job.title || ""} ${job.category || ""} ${(job.requirements || []).join(" ")}`.toLowerCase();
  return /tech|software|engineer|developer|data|ai|cloud|devops|security|product|mobile|frontend|backend/.test(haystack);
};

const CompaniesSection = () => {
  const { companies, loading } = useCompanies();
  const { jobs } = useJobsData();

  const techCompanies = companies.filter(isTechCompany);
  const techJobs = jobs.filter(isTechJob);

  const companiesWithJobCounts = techCompanies.slice(0, 8).map((company) => ({
    ...company,
    jobCount: techJobs.filter((job) => job.company === company.name).length,
  }));

  const getCompanyMonogram = (name = "") => {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const resolveLogo = (logo) => {
    if (!logo) return "";
    if (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/")) {
      return logo;
    }
    return `/${logo}`;
  };

  const ratingToEditorial = (rating) => {
    if (rating >= 4.5) return "Exceptional";
    if (rating >= 4.0) return "Strong";
    if (rating >= 3.5) return "Solid";
    return "Emerging";
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="relative mx-auto max-w-7xl rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10 shadow-sm">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
          <div className="absolute -top-24 left-12 h-52 w-52 rounded-full bg-[#8C8C8C]/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-1/4 translate-y-1/4 rounded-full bg-[#404040]/15 dark:bg-[#BFBFBF]/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-[#8C8C8C]">
              Section / Companies
            </p>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.12] text-[#0D0D0D] dark:text-[#F2F2F2]">
              Leading Workplaces.
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
              Compare technology teams that are actively hiring across Europe, the Middle East, and Africa.
            </p>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-64 rounded-3xl border border-[#BFBFBF]/45 dark:border-[#404040]/65 bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/60 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
              {companiesWithJobCounts.map((company) => (
                <Link
                  key={company.name}
                  to={`/companies/${company.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}`}
                  className="group flex h-full flex-col rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-white/5 p-5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.99] backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#BFBFBF]/45 dark:bg-[#404040]/75">
                      {company.logo ? (
                        <>
                          <img
                            src={resolveLogo(company.logo)}
                            alt={`${company.name} logo`}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              event.currentTarget.nextSibling.style.display = "flex";
                            }}
                          />
                          <span className="hidden h-full w-full items-center justify-center text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                            {getCompanyMonogram(company.name)}
                          </span>
                        </>
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                          {getCompanyMonogram(company.name)}
                        </span>
                      )}
                    </div>

                    <div className="rounded-full bg-[#0D0D0D]/10 dark:bg-[#F2F2F2]/10 px-3 py-1 text-xs font-medium text-[#404040] dark:text-[#BFBFBF]">
                      {company.jobCount} roles
                    </div>
                  </div>

                  <h3 className="mt-5 truncate text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                    {company.name}
                  </h3>

                  <p className="mt-1 text-sm text-[#404040] dark:text-[#BFBFBF] line-clamp-2">
                    {company.industry || "Technology"}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-[#8C8C8C]">
                    <div className="rounded-2xl bg-[#BFBFBF]/25 dark:bg-[#404040]/45 px-3 py-2">
                      <p>Team</p>
                      <p className="mt-1 font-medium text-[#404040] dark:text-[#BFBFBF]">
                        {company.employees ? company.employees.toLocaleString() : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#BFBFBF]/25 dark:bg-[#404040]/45 px-3 py-2">
                      <p>Rating</p>
                      <p className="mt-1 font-medium text-[#404040] dark:text-[#BFBFBF]">
                        {(company.rating || 0).toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-[#8C8C8C]">
                    {ratingToEditorial(company.rating || 0)}
                  </p>

                  <div className="mt-auto pt-4">
                    <div className="h-px w-full bg-[#BFBFBF]/55 dark:bg-[#404040]/75" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              to="/companies"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#BFBFBF] dark:border-[#404040] px-7 py-3 text-sm font-semibold tracking-wide text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
            >
              View All Companies ({techCompanies.length}) <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;
