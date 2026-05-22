import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

const CATEGORIES = [
  "All",
  "Frontend",
  "Backend",
  "Data & AI",
  "DevOps & Cloud",
  "Security",
  "Product",
  "Mobile",
  "General Tech",
];

const FILTERS = ["Recent", "Popular", "Salary", "Remote"];

const isTechJob = (job) => {
  const haystack = `${job.title || ""} ${job.category || ""} ${(job.requirements || []).join(" ")}`.toLowerCase();
  const techSignals =
    /tech|software|engineer|developer|frontend|backend|full\s*stack|data|ai|machine\s*learning|cloud|devops|sre|security|cyber|product|qa|mobile|ios|android|platform|infrastructure|api|react|node|java|python/.test(
      haystack
    );
  return techSignals || (job.category || "").toLowerCase() === "technology";
};

const getTechTrack = (job) => {
  const haystack = `${job.title || ""} ${(job.requirements || []).join(" ")}`.toLowerCase();

  if (/frontend|react|ui|web\s*app|javascript|typescript/.test(haystack)) return "Frontend";
  if (/backend|api|server|spring|node|database|microservice/.test(haystack)) return "Backend";
  if (/data|analytics|ai|machine\s*learning|ml|scientist/.test(haystack)) return "Data & AI";
  if (/devops|cloud|sre|platform|kubernetes|docker|aws|azure|gcp|infra/.test(haystack)) return "DevOps & Cloud";
  if (/security|cyber|infosec|penetration|soc/.test(haystack)) return "Security";
  if (/product\s*manager|product\s*owner/.test(haystack)) return "Product";
  if (/mobile|ios|android|react\s*native|flutter/.test(haystack)) return "Mobile";
  return "General Tech";
};

const JobsSection = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState("Recent");
  const [displayCount, setDisplayCount] = useState(6);
  const { jobs, loading } = useJobsData();

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(isTechJob);

    if (activeCategory !== "All") {
      filtered = filtered.filter((job) => getTechTrack(job) === activeCategory);
    }

    switch (activeFilter) {
      case "Recent":
        filtered = [...filtered].sort(
          (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
        );
        break;
      case "Popular":
        filtered = [...filtered].sort(
          (a, b) => b.applicationsCount - a.applicationsCount
        );
        break;
      case "Salary":
        filtered = [...filtered].sort(
          (a, b) => (b.salary?.max || 0) - (a.salary?.max || 0)
        );
        break;
      case "Remote":
        filtered = filtered.filter((job) => job.remote);
        break;
      default:
        break;
    }

    return filtered;
  }, [jobs, activeCategory, activeFilter]);

  const displayedJobs = filteredJobs.slice(0, displayCount);

  const formatSalary = (min, max) => {
    const minValue = Number(min) || 0;
    const maxValue = Number(max) || 0;
    if (!minValue && !maxValue) return "Competitive";
    return `$${(minValue / 1000).toFixed(0)}k - $${(maxValue / 1000).toFixed(0)}k`;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${Math.max(1, diffInHours)}h ago`;
    }

    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const resolveLogo = (logo) => {
    if (!logo) return "";
    if (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/")) {
      return logo;
    }
    return `/${logo}`;
  };

  const getCompanyMonogram = (name = "") => {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const loadMoreJobs = () => {
    setDisplayCount((prev) => Math.min(prev + 6, filteredJobs.length));
  };

  if (loading) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 sm:p-8 lg:p-10 relative">
            <CornerAccents className="opacity-50" />
            <div className="h-4 w-40 bg-[#0A0A0B]/10 dark:bg-[#ECECEC]/10 animate-pulse font-mono text-[10px]" />
            <div className="mt-5 h-10 w-full max-w-xl bg-[#0A0A0B]/10 dark:bg-[#ECECEC]/10 animate-pulse" />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-64 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 animate-pulse relative"
                >
                  <CornerAccents className="opacity-25" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="relative mx-auto max-w-7xl border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 sm:p-8 lg:p-10 transition-all duration-300 group">
        <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
        
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

        <div className="relative z-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 px-4 py-1.5 text-[10px] font-bold font-mono uppercase tracking-[0.15em] text-[#5C5C5E] dark:text-[#8C8C8E] bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
              // Active Listings
            </p>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-[#0A0A0B] dark:text-[#ECECEC] font-sans uppercase">
              Browse open roles.
            </h2>
            <p className="mt-4 text-xs sm:text-sm font-mono text-[#5C5C5E] dark:text-[#8C8C8E] leading-relaxed">
              Discover verified engineering, data, and product roles currently open across Europe, the Middle East, and Africa.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "relative inline-flex min-h-10 items-center justify-center border px-5 font-mono text-xs uppercase tracking-wider font-bold transition-all duration-300 group/catbtn cursor-pointer",
                    active
                      ? "border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B]"
                      : "border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg",
                  ].join(" ")}
                >
                  <CornerAccents className="opacity-0 group-hover/catbtn:opacity-100" />
                  {category}
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-6">
            <div className="text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E]">
              SHOWING <span className="font-bold text-[#0A0A0B] dark:text-[#ECECEC]">{displayedJobs.length}</span> OF {" "}
              <span className="font-bold text-[#0A0A0B] dark:text-[#ECECEC]">{filteredJobs.length}</span> ACTIVE RECORDS
            </div>

            {/* Filters Selection */}
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const active = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={[
                      "relative inline-flex min-h-9 items-center justify-center border px-4 font-mono text-[10px] uppercase tracking-wider font-bold transition-all duration-300 group/filtbtn cursor-pointer",
                      active
                        ? "border-[#0A0A0B]/40 dark:border-[#ECECEC]/40 bg-[#0A0A0B]/10 dark:bg-[#ECECEC]/10 text-fg"
                        : "border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg",
                    ].join(" ")}
                  >
                    <CornerAccents className="opacity-0 group-hover/filtbtn:opacity-100" />
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jobs Listing */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedJobs.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-8 text-center relative group">
                <CornerAccents className="opacity-50" />
                <p className="font-mono text-sm font-bold text-fg uppercase">No matching jobs found.</p>
                <p className="mt-2 font-mono text-xs text-[#8C8C8E]">Try another category or filter combination.</p>
              </div>
            )}

            {displayedJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="group/card relative flex flex-col justify-between border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 hover:border-fg transition-all duration-300"
              >
                <CornerAccents className="opacity-0 group-hover/card:opacity-100" />
                
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 text-fg">
                        {job.companyLogo ? (
                          <>
                            <img
                              src={resolveLogo(job.companyLogo)}
                              alt={`${job.company} logo`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextSibling.style.display = "flex";
                              }}
                            />
                            <span className="hidden h-full w-full items-center justify-center text-xs font-bold font-mono">
                              {getCompanyMonogram(job.company || "Tech")}
                            </span>
                          </>
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-bold font-mono">
                            {getCompanyMonogram(job.company || "Tech")}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold font-mono text-fg uppercase tracking-tight group-hover/card:text-[#5C5C5E] dark:group-hover/card:text-[#8C8C8E] transition-colors duration-300">
                          {job.title}
                        </h3>
                        <p className="mt-1 truncate font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E]">{job.company}</p>
                      </div>
                    </div>

                    {job.remote && (
                      <span className="inline-flex h-6 items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-2.5 font-mono text-[9px] uppercase tracking-wider font-bold text-fg">
                        REMOTE
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#8C8C8E]">
                    <span>{job.location || "Location N/A"}</span>
                    <span aria-hidden className="opacity-40">//</span>
                    <span>{job.jobType || "Full-time"}</span>
                    <span aria-hidden className="opacity-40">//</span>
                    <span>{job.workType || "Hybrid"}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-2.5 py-1 font-mono text-[10px] font-bold text-fg">
                      {getTechTrack(job)}
                    </span>
                    {(job.requirements || []).slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 px-2.5 py-1 font-mono text-[10px] text-[#8C8C8E]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {/* Micro-sparkline telemetry chart */}
                  <div className="mt-5 flex items-center justify-between border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-4 pb-0.5">
                    <span className="text-[7px] font-mono font-bold tracking-wider text-[#8C8C8E] uppercase">Application Velocity</span>
                    <Sparkline seed={job.title + job.id} width={65} height={14} />
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-4">
                  <div className="font-mono text-sm font-bold text-fg">
                    {formatSalary(job.salary?.min, job.salary?.max)}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] text-[#8C8C8E]">{getTimeAgo(job.postedDate)}</p>
                    <p className="mt-1 font-mono text-xs font-bold text-fg flex items-center justify-end gap-1">
                      <span>VIEW ROLE</span>
                      <span className="inline-block transition-transform duration-300 group-hover/card:translate-x-1">→</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {displayCount < filteredJobs.length && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={loadMoreJobs}
                className="group/btn relative inline-flex min-h-12 items-center gap-2 border border-[#0A0A0B] dark:border-[#ECECEC] bg-transparent px-7 py-3 font-mono text-xs uppercase font-bold tracking-wider text-fg hover:bg-[#0A0A0B] hover:text-[#ECECEC] dark:hover:bg-[#ECECEC] dark:hover:text-[#0A0A0B] transition-all duration-300 cursor-pointer"
              >
                <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                <span>LOAD MORE OPPORTUNITIES</span>
                <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default JobsSection;