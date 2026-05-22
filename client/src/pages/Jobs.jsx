import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { experienceLevels } from "../data/mockData";
import { useJobs } from "../context/JobContext";
import { useJobsData } from "../contexts/JobsDataContext";
import { useAuth } from "../context/AuthContext";
import RefreshButton from "../components/RefreshButton";
import ConfirmationModal from "../components/ConfirmationModal";
import CornerAccents from "../components/CornerAccents";

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

const TECH_TRACK_OPTIONS = [
  "Frontend",
  "Backend",
  "Data & AI",
  "DevOps & Cloud",
  "Security",
  "Product",
  "Mobile",
  "General Tech",
];

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

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [trackFilter, setTrackFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("");
  const [salaryMinFilter, setSalaryMinFilter] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 20;
  const [notification, setNotification] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const {
    applyForJob,
    saveJob,
    unsaveJob,
    isJobApplied,
    isJobSaved,
    withdrawApplication,
    getAllJobsSync,
  } = useJobs();
  const { jobs: apiJobs, loading: jobsLoading, error: jobsError } = useJobsData();
  const { isAuthenticated, isJobSeeker, isEmployer, user } = useAuth();

  const allJobs = useMemo(() => {
    return getAllJobsSync(apiJobs).filter(isTechJob);
  }, [apiJobs, getAllJobsSync]);

  useEffect(() => {
    const searchParam = searchParams.get("search");
    const locationParam = searchParams.get("location");
    const companyParam = searchParams.get("company");

    if (searchParam) setSearchTerm(searchParam);
    if (locationParam) setLocationFilter(locationParam);
    if (companyParam) setSearchTerm(companyParam);
  }, [searchParams]);

  const filteredJobs = useMemo(() => {
    const filtered = allJobs.filter((job) => {
      const matchesSearch =
          (job.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.company || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation =
          !locationFilter ||
          (job.location || "").toLowerCase().includes(locationFilter.toLowerCase());
      const matchesTrack = !trackFilter || getTechTrack(job) === trackFilter;
      const matchesExperience =
          !experienceFilter || job.experienceLevel === experienceFilter;
      const matchesWorkType = !workTypeFilter || job.workType === workTypeFilter;
      const matchesSalary =
          !salaryMinFilter || (job.salary?.min || 0) >= parseInt(salaryMinFilter, 10);
      const matchesRemote = !remoteOnly || job.remote;

      return (
          matchesSearch &&
          matchesLocation &&
          matchesTrack &&
          matchesExperience &&
          matchesWorkType &&
          matchesSalary &&
          matchesRemote
      );
    });

    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        break;
      case "salary-high":
        filtered.sort((a, b) => (b.salary?.max || 0) - (a.salary?.max || 0));
        break;
      case "salary-low":
        filtered.sort((a, b) => (a.salary?.min || 0) - (b.salary?.min || 0));
        break;
      case "company":
        filtered.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
        break;
      default:
        break;
    }

    return filtered;
  }, [
    allJobs,
    searchTerm,
    locationFilter,
    trackFilter,
    experienceFilter,
    workTypeFilter,
    salaryMinFilter,
    remoteOnly,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice(
      (currentPage - 1) * jobsPerPage,
      currentPage * jobsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    locationFilter,
    trackFilter,
    experienceFilter,
    workTypeFilter,
    salaryMinFilter,
    remoteOnly,
    sortBy,
  ]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const resetFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setTrackFilter("");
    setExperienceFilter("");
    setWorkTypeFilter("");
    setSalaryMinFilter("");
    setRemoteOnly(false);
    setCurrentPage(1);
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleQuickApply = (job) => {
    if (!isAuthenticated || !isJobSeeker) return;
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    if (!selectedJob) return;

    const result = await applyForJob(selectedJob);
    if (result.success) {
      showNotification(result.message, "success");
    } else if (result.requiresProfile) {
      showNotification(result.error, "error");
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } else {
      showNotification(result.error, "error");
    }

    setSelectedJob(null);
  };

  const handleWithdraw = (job) => {
    setSelectedJob(job);
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = async () => {
    if (!selectedJob) return;

    const result = await withdrawApplication(selectedJob.id);
    if (result.success) {
      showNotification(result.message, "success");
    } else {
      showNotification(result.error, "error");
    }

    setSelectedJob(null);
  };

  const handleSaveToggle = async (job) => {
    if (!isAuthenticated || !isJobSeeker) return;

    const saved = isJobSaved(job.id);
    const result = saved ? await unsaveJob(job.id) : await saveJob(job);

    if (result.success) {
      showNotification(result.message, "success");
    } else {
      showNotification(result.error, "error");
    }
  };

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

  const monogram = (name = "") => {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((segment) => segment[0])
        .join("")
        .toUpperCase();
  };

  if (jobsLoading) {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 sm:p-8 lg:p-10 relative">
            <CornerAccents className="opacity-50" />
            <div className="h-5 w-44 bg-[#0A0A0B]/10 dark:bg-[#ECECEC]/10 animate-pulse font-mono text-[10px]" />
            <div className="mt-5 h-10 w-full max-w-xl bg-[#0A0A0B]/10 dark:bg-[#ECECEC]/10 animate-pulse" />
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                      key={idx}
                      className="h-60 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 animate-pulse relative"
                  >
                    <CornerAccents className="opacity-25" />
                  </div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  if (jobsError) {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl border border-red-500 bg-red-500/10 p-8 text-center relative">
            <CornerAccents className="text-red-500/50" />
            <h2 className="font-mono text-sm font-bold text-red-500 uppercase">Error Loading Jobs</h2>
            <p className="mt-2 font-mono text-xs text-red-500">{jobsError}</p>
          </div>
        </div>
    );
  }

  return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header and Filter Panel */}
        <section className="relative mx-auto max-w-7xl border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 sm:p-8 lg:p-10 transition-all duration-300 group">
          <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
          
          <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

          <div className="relative z-10">
            <p className="inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 px-4 py-1.5 text-[10px] font-bold font-mono uppercase tracking-[0.15em] text-[#5C5C5E] dark:text-[#8C8C8E] bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
              // Active Listings
            </p>

            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-fg font-sans uppercase">
              Browse open roles.
            </h1>

            <p className="mt-4 max-w-3xl text-xs sm:text-sm font-mono text-[#5C5C5E] dark:text-[#8C8C8E] leading-relaxed">
              Discover verified engineering, data, and product roles currently open across Europe, the Middle East, and Africa.
            </p>

            <div className="mt-5">
              <RefreshButton />
            </div>

            {/* Filter controls */}
            <div className="mt-8 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-4 sm:p-5 lg:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Search Term */}
                <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/search">
                  <CornerAccents className="opacity-0 group-focus-within/search:opacity-100" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#8C8C8E]">Search:</span>
                  <input
                      type="text"
                      placeholder="Search by title, stack, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-12 w-full bg-transparent border-none text-fg pl-16 pr-4 font-mono text-sm placeholder-[#8C8C8E] focus:ring-0 focus:outline-none"
                  />
                </div>

                {/* Location Filter */}
                <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/loc">
                  <CornerAccents className="opacity-0 group-focus-within/loc:opacity-100" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#8C8C8E]">Loc:</span>
                  <input
                      type="text"
                      placeholder="Location (e.g. London, Hybrid)"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="h-12 w-full bg-transparent border-none text-fg pl-12 pr-4 font-mono text-sm placeholder-[#8C8C8E] focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Track Filter */}
                <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/track">
                  <CornerAccents className="opacity-0 group-focus-within/track:opacity-100" />
                  <select
                      value={trackFilter}
                      onChange={(e) => setTrackFilter(e.target.value)}
                      className="h-12 w-full bg-transparent border-none text-fg px-4 font-mono text-xs uppercase cursor-pointer focus:ring-0 focus:outline-none"
                  >
                    <option value="" className="bg-elevated text-fg">All Tech Tracks</option>
                    {TECH_TRACK_OPTIONS.filter((track) =>
                        allJobs.some((job) => getTechTrack(job) === track)
                    ).map((track) => (
                        <option key={track} value={track} className="bg-elevated text-fg">
                          {track.toUpperCase()}
                        </option>
                    ))}
                  </select>
                </div>

                {/* Experience Filter */}
                <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/exp">
                  <CornerAccents className="opacity-0 group-focus-within/exp:opacity-100" />
                  <select
                      value={experienceFilter}
                      onChange={(e) => setExperienceFilter(e.target.value)}
                      className="h-12 w-full bg-transparent border-none text-fg px-4 font-mono text-xs uppercase cursor-pointer focus:ring-0 focus:outline-none"
                  >
                    <option value="" className="bg-elevated text-fg">All Experience</option>
                    {experienceLevels.map((level) => (
                        <option key={level} value={level} className="bg-elevated text-fg">
                          {level.toUpperCase()}
                        </option>
                    ))}
                  </select>
                </div>

                {/* Work Type Filter */}
                <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/type">
                  <CornerAccents className="opacity-0 group-focus-within/type:opacity-100" />
                  <select
                      value={workTypeFilter}
                      onChange={(e) => setWorkTypeFilter(e.target.value)}
                      className="h-12 w-full bg-transparent border-none text-fg px-4 font-mono text-xs uppercase cursor-pointer focus:ring-0 focus:outline-none"
                  >
                    <option value="" className="bg-elevated text-fg">All Work Types</option>
                    <option value="Remote" className="bg-elevated text-fg">REMOTE</option>
                    <option value="Hybrid" className="bg-elevated text-fg">HYBRID</option>
                    <option value="On-site" className="bg-elevated text-fg">ON-SITE</option>
                  </select>
                </div>

                {/* Salary Min Filter */}
                <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/sal">
                  <CornerAccents className="opacity-0 group-focus-within/sal:opacity-100" />
                  <input
                      type="number"
                      placeholder="Min Salary ($)"
                      value={salaryMinFilter}
                      onChange={(e) => setSalaryMinFilter(e.target.value)}
                      className="h-12 w-full bg-transparent border-none text-fg px-4 font-mono text-xs focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                      onClick={() => setRemoteOnly((v) => !v)}
                      className={`group/rbtn relative inline-flex min-h-9 items-center border px-4 font-mono text-[10px] uppercase font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                          remoteOnly
                              ? "border-fg bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B]"
                              : "border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg hover:border-fg"
                      }`}
                  >
                    <CornerAccents className="opacity-0 group-hover/rbtn:opacity-100" />
                    Remote Only {remoteOnly ? "[ON]" : "[OFF]"}
                  </button>

                  <button
                      onClick={resetFilters}
                      className="group/cbtn relative inline-flex min-h-9 items-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg transition-all duration-300 cursor-pointer"
                  >
                    <CornerAccents className="opacity-0 group-hover/cbtn:opacity-100" />
                    Clear Filters
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider">SORTBY:</span>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 group/sort">
                    <CornerAccents className="opacity-0 group-focus-within/sort:opacity-100" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-9 bg-transparent border-none text-fg px-3 font-mono text-[10px] uppercase cursor-pointer focus:ring-0 focus:outline-none"
                    >
                      <option value="recent" className="bg-elevated text-fg">MOST RECENT</option>
                      <option value="salary-high" className="bg-elevated text-fg">SALARY: HIGH TO LOW</option>
                      <option value="salary-low" className="bg-elevated text-fg">SALARY: LOW TO HIGH</option>
                      <option value="company" className="bg-elevated text-fg">COMPANY A-Z</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Results Summary */}
        <section className="mx-auto mt-8 max-w-7xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between px-2">
            <div>
              <h2 className="text-xl font-bold font-mono text-fg uppercase tracking-tight">
                {filteredJobs.length} Record(s) Found
              </h2>
              <p className="mt-1 font-mono text-xs text-[#8C8C8E] uppercase">
                Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * jobsPerPage + 1} -{" "}
                {Math.min(currentPage * jobsPerPage, filteredJobs.length)} of {filteredJobs.length} items
              </p>
            </div>
          </div>

          {/* Inline alert */}
          {notification && (
              <div
                  className={`mt-4 border p-4 font-mono text-xs uppercase ${
                      notification.type === "error"
                          ? "border-red-500 bg-red-500/10 text-red-500"
                          : "border-green-500 bg-green-500/10 text-green-500"
                  }`}
              >
                [{notification.type.toUpperCase()}] {notification.message}
              </div>
          )}

          {paginatedJobs.length === 0 ? (
              <div className="mt-6 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-10 text-center relative group">
                <CornerAccents className="opacity-50" />
                <p className="font-mono text-sm font-bold text-fg uppercase">No jobs match your criteria.</p>
                <p className="mt-2 font-mono text-xs text-[#8C8C8E]">Try broadening your filters or clearing search input.</p>
              </div>
          ) : (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedJobs.map((job) => (
                    <article
                        key={job.id}
                        className="group/card relative flex flex-col justify-between border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 hover:border-fg transition-all duration-300"
                    >
                      <CornerAccents className="opacity-0 group-hover/card:opacity-100" />
                      
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
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
                                      {monogram(job.company || "Tech")}
                                    </span>
                                  </>
                              ) : (
                                  <span className="flex h-full w-full items-center justify-center text-xs font-bold font-mono">
                                    {monogram(job.company || "Tech")}
                                  </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <Link
                                  to={`/jobs/${job.id}`}
                                  className="focus:outline-none"
                              >
                                <h3 className="truncate text-sm font-bold font-mono text-fg uppercase tracking-tight group-hover/card:text-[#5C5C5E] dark:group-hover/card:text-[#8C8C8E] transition-colors duration-300">
                                  {job.title}
                                </h3>
                              </Link>
                              <p className="mt-1 truncate font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E]">{job.company}</p>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <p className="text-sm font-bold text-fg">
                              {formatSalary(job.salary?.min, job.salary?.max)}
                            </p>
                            <p className="mt-1 text-[10px] text-[#8C8C8E]">
                              {getTimeAgo(job.postedDate)} // {job.applicationsCount || 0} APPS
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#8C8C8E]">
                          <span>{job.location || "Location N/A"}</span>
                          <span aria-hidden className="opacity-40">//</span>
                          <span>{job.jobType || "Full-time"}</span>
                          <span aria-hidden className="opacity-40">//</span>
                          <span>{job.workType || "Hybrid"}</span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-2.5 py-1 font-mono text-[10px] font-bold text-fg">
                            {getTechTrack(job)}
                          </span>
                          {job.experienceLevel && (
                              <span className="inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 px-2.5 py-1 font-mono text-[10px] text-[#8C8C8E]">
                                {job.experienceLevel.toUpperCase()}
                              </span>
                          )}
                          {job.featured && (
                              <span className="inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 px-2.5 py-1 font-mono text-[10px] text-[#8C8C8E]">
                                FEATURED
                              </span>
                          )}
                          {job.urgent && (
                              <span className="inline-flex items-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 px-2.5 py-1 font-mono text-[10px] text-[#8C8C8E]">
                                URGENT
                              </span>
                          )}
                        </div>

                        {/* Micro-sparkline telemetry chart */}
                        <div className="mt-5 flex items-center justify-between border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-4 pb-0.5">
                          <span className="text-[7px] font-mono font-bold tracking-wider text-[#8C8C8E] uppercase">Application Velocity</span>
                          <Sparkline seed={job.title + job.id} width={65} height={14} />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3 border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-4 items-center">
                        {!isEmployer && (
                            <>
                              {isJobApplied(job.id) ? (
                                  <button
                                      onClick={() => handleWithdraw(job)}
                                      className="group/actbtn relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 bg-transparent px-4 font-mono text-xs uppercase font-bold tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-red-500 hover:text-red-500 transition-all duration-300 cursor-pointer"
                                  >
                                    <CornerAccents className="opacity-0 group-hover/actbtn:opacity-100" />
                                    Withdraw
                                  </button>
                              ) : (
                                  <button
                                      onClick={() => {
                                        if (!isAuthenticated) {
                                          navigate("/login?from=/jobs");
                                          return;
                                        }
                                        handleQuickApply(job);
                                      }}
                                      disabled={isAuthenticated && isJobSeeker && !user?.profileComplete}
                                      className="group/actbtn2 relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-5 py-2 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                                  >
                                    <CornerAccents className="opacity-0 group-hover/actbtn2:opacity-100" />
                                    {!isAuthenticated
                                        ? "Login to Apply"
                                        : !isJobSeeker
                                            ? "Seekers Only"
                                            : !user?.profileComplete
                                                ? "Complete Profile"
                                                : "Quick Apply"}
                                  </button>
                              )}

                              <button
                                  onClick={() => {
                                    if (!isAuthenticated) {
                                      navigate("/login?from=/jobs");
                                      return;
                                    }
                                    handleSaveToggle(job);
                                  }}
                                  className="group/actbtn3 relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 bg-transparent px-4 font-mono text-xs uppercase font-bold tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg transition-all duration-300 cursor-pointer"
                              >
                                <CornerAccents className="opacity-0 group-hover/actbtn3:opacity-100" />
                                {isJobSaved(job.id)
                                    ? "Saved"
                                    : !isAuthenticated
                                        ? "Login to Save"
                                        : !isJobSeeker
                                            ? "Seekers Only"
                                            : "Save"}
                              </button>
                            </>
                        )}

                        <Link
                            to={`/jobs/${job.id}`}
                            className="group/actbtn4 relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 bg-transparent px-4 font-mono text-xs uppercase font-bold tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg transition-all duration-300"
                        >
                          <CornerAccents className="opacity-0 group-hover/actbtn4:opacity-100" />
                          Details
                        </Link>
                      </div>
                    </article>
                ))}
              </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="group/page relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-xs font-bold uppercase tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg transition-all duration-300 disabled:opacity-40 cursor-pointer"
                >
                  <CornerAccents className="opacity-0 group-hover/page:opacity-100" />
                  Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.min(Math.max(1, currentPage - 2), Math.max(1, totalPages - 4));
                  const pageNum = start + i;
                  if (pageNum > totalPages) return null;

                  return (
                      <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`group/page relative inline-flex h-10 w-10 items-center justify-center border font-mono text-xs font-bold transition-all duration-300 cursor-pointer ${
                              currentPage === pageNum
                                  ? "border-fg bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B]"
                                  : "border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg"
                          }`}
                      >
                        <CornerAccents className="opacity-0 group-hover/page:opacity-100" />
                        {pageNum}
                      </button>
                  );
                })}

                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="group/page relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-xs font-bold uppercase tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg transition-all duration-300 disabled:opacity-40 cursor-pointer"
                >
                  <CornerAccents className="opacity-0 group-hover/page:opacity-100" />
                  Next
                </button>
              </div>
          )}
        </section>

        <ConfirmationModal
            isOpen={showApplyModal}
            onClose={() => setShowApplyModal(false)}
            onConfirm={confirmApply}
            title="Apply for this job?"
            message={
              selectedJob
                  ? `You are about to submit an application for the role of ${selectedJob.title.toUpperCase()} at ${selectedJob.company.toUpperCase()}.`
                  : ""
            }
            confirmText="Apply"
            cancelText="Cancel"
            type="success"
        />

        <ConfirmationModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            onConfirm={confirmWithdraw}
            title="Withdraw application?"
            message="This action cannot be undone. Are you sure you want to withdraw your application?"
            confirmText="Withdraw"
            cancelText="Cancel"
            type="danger"
        />
      </div>
  );
};

export default Jobs;