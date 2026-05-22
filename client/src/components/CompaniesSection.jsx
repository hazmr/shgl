import { Link } from "react-router-dom";
import { useCompanies } from "../contexts/CompaniesContext";
import { useJobsData } from "../contexts/JobsDataContext";
import CornerAccents from "./CornerAccents";

const Sparkline = ({ seed = "tech", width = 70, height = 18 }) => {
  const points = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const count = 5;
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * width;
    const val = Math.abs((hash >> (i * 2.5)) % (height - 6)) + 3;
    points.push(`${x},${height - val}`);
  }
  const pathD = `M ${points.join(" L ")}`;
  return (
    <svg width={width} height={height} className="overflow-visible opacity-55 text-fg">
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width}
        cy={points[points.length - 1].split(",")[1]}
        r="1.5"
        className="fill-current animate-pulse text-fg"
      />
    </svg>
  );
};

const SegmentedLedBar = ({ value = 4.0, max = 5 }) => {
  const filled = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5 select-none" title={`Rating: ${value}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-2.5 w-1 border border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 ${
            i < filled 
              ? "bg-[#0A0A0B] dark:bg-[#ECECEC]" 
              : "bg-[#0A0A0B]/10 dark:bg-[#ECECEC]/10"
          }`}
        />
      ))}
    </span>
  );
};

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
      <div className="relative mx-auto max-w-7xl border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 sm:p-8 lg:p-10 transition-all duration-300 group">
        <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
        
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

        <div className="relative z-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 px-4 py-1.5 text-[10px] font-bold font-mono uppercase tracking-[0.15em] text-[#5C5C5E] dark:text-[#8C8C8E] bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
              // Curated Teams
            </p>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-[#0A0A0B] dark:text-[#ECECEC] font-sans uppercase">
              Hiring workspaces.
            </h2>
            <p className="mt-4 text-xs sm:text-sm font-mono text-[#5C5C5E] dark:text-[#8C8C8E] leading-relaxed">
              Compare technology teams that are actively hiring across Europe, the Middle East, and Africa.
            </p>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-64 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 animate-pulse relative"
                >
                  <CornerAccents className="opacity-25" />
                </div>
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
                  className="group/card relative flex h-full flex-col border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-5 hover:border-fg transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/card:opacity-100" />
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 text-fg">
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
                          <span className="hidden h-full w-full items-center justify-center text-xs font-bold font-mono">
                            {getCompanyMonogram(company.name)}
                          </span>
                        </>
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-bold font-mono">
                          {getCompanyMonogram(company.name)}
                        </span>
                      )}
                    </div>

                    <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider font-bold text-fg">
                      {company.jobCount} ROLES
                    </div>
                  </div>

                  <h3 className="mt-5 truncate text-sm font-bold font-mono text-fg uppercase tracking-tight group-hover/card:text-[#5C5C5E] dark:group-hover/card:text-[#8C8C8E] transition-colors duration-300">
                    {company.name}
                  </h3>

                  <p className="mt-1 font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] line-clamp-2">
                    {company.industry || "Technology"}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-[#8C8C8E] font-mono">
                    <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-2">
                      <p className="text-[9px] text-[#8C8C8E] tracking-wider uppercase font-bold">TEAM</p>
                      <p className="mt-1 font-bold text-fg">
                        {company.employees ? company.employees.toLocaleString() : "N/A"}
                      </p>
                    </div>
                    <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-2">
                      <p className="text-[9px] text-[#8C8C8E] tracking-wider uppercase font-bold">RATING</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="font-bold text-fg text-xs">{(company.rating || 0).toFixed(1)}</span>
                        <SegmentedLedBar value={company.rating || 0} />
                      </div>
                    </div>
                  </div>

                  {/* Micro-sparkline telemetry chart */}
                  <div className="mt-4 flex items-center justify-between border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[7px] font-mono font-bold tracking-wider text-[#8C8C8E] uppercase">Hiring Activity</span>
                      <Sparkline seed={company.name} />
                    </div>
                    <span className="font-mono text-[10px] text-[#8C8C8E] uppercase tracking-widest">{ratingToEditorial(company.rating || 0)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              to="/companies"
              className="group/btn relative inline-flex min-h-12 items-center gap-2 border border-[#0A0A0B] dark:border-[#ECECEC] bg-transparent px-7 py-3 font-mono text-xs uppercase font-bold tracking-wider text-fg hover:bg-[#0A0A0B] hover:text-[#ECECEC] dark:hover:bg-[#ECECEC] dark:hover:text-[#0A0A0B] transition-all duration-300 cursor-pointer"
            >
              <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
              <span>VIEW ALL TEAMS ({techCompanies.length})</span>
              <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;