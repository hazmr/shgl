import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { experienceLevels } from "../data/mockData";
import { useJobs } from "../context/JobContext";
import { useJobsData } from "../contexts/JobsDataContext";
import { useAuth } from "../context/AuthContext";
import RefreshButton from "../components/RefreshButton";
import ConfirmationModal from "../components/ConfirmationModal";

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
        <div className="mx-auto max-w-7xl rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10">
          <div className="h-5 w-44 rounded-full bg-[#BFBFBF]/60 dark:bg-[#404040]/70 animate-pulse" />
          <div className="mt-5 h-10 w-full max-w-xl rounded-2xl bg-[#BFBFBF]/45 dark:bg-[#404040]/60 animate-pulse" />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-60 rounded-3xl border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/60 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/70 p-8 text-center">
          <h2 className="text-2xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Error Loading Jobs</h2>
          <p className="mt-2 text-[#404040] dark:text-[#BFBFBF]">{jobsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <section className="relative mx-auto max-w-7xl rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10 shadow-sm">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
          <div className="absolute -top-20 -left-10 h-56 w-56 rounded-full bg-[#8C8C8C]/20 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-52 w-52 rounded-full bg-[#0D0D0D]/10 dark:bg-[#F2F2F2]/5 blur-3xl" />
        </div>

        <div className="relative">
          <p className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-[#8C8C8C]">
            Jobs / Directory
          </p>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.12] text-[#0D0D0D] dark:text-[#F2F2F2]">
            Find your next tech role in EMEA.
          </h1>

          <p className="mt-4 max-w-3xl text-base sm:text-lg leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
            Explore {allJobs.length} active technology opportunities across Europe, the Middle East, and Africa.
          </p>

          <div className="mt-5">
            <RefreshButton />
          </div>

          <div className="mt-6 rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/60 p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C8C8C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Job title, company, keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] pl-11 pr-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] focus-visible:ring-2 focus-visible:ring-[#0D0D0D]/20 dark:focus-visible:ring-[#F2F2F2]/20 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                />
              </div>

              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C8C8C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="City, state, country"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] pl-11 pr-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] focus-visible:ring-2 focus-visible:ring-[#0D0D0D]/20 dark:focus-visible:ring-[#F2F2F2]/20 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] px-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              >
                <option value="">All Tech Tracks</option>
                {TECH_TRACK_OPTIONS.filter((track) =>
                  allJobs.some((job) => getTechTrack(job) === track)
                ).map((track) => (
                  <option key={track} value={track}>
                    {track}
                  </option>
                ))}
              </select>

              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] px-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              >
                <option value="">All Experience</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              <select
                value={workTypeFilter}
                onChange={(e) => setWorkTypeFilter(e.target.value)}
                className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] px-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              >
                <option value="">All Work Types</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>

              <input
                type="number"
                placeholder="Min Salary"
                value={salaryMinFilter}
                onChange={(e) => setSalaryMinFilter(e.target.value)}
                className="h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] px-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setRemoteOnly((v) => !v)}
                  className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2] ${
                    remoteOnly
                      ? "bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D]"
                      : "border border-[#BFBFBF] dark:border-[#404040] text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10"
                  }`}
                >
                  Remote Only {remoteOnly ? "On" : "Off"}
                </button>

                <button
                  onClick={resetFilters}
                  className="inline-flex min-h-11 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                >
                  Clear Filters
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8C8C8C]">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 rounded-full border border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/70 px-4 text-sm text-[#404040] dark:text-[#F2F2F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                >
                  <option value="recent">Most Recent</option>
                  <option value="salary-high">Salary High to Low</option>
                  <option value="salary-low">Salary Low to High</option>
                  <option value="company">Company A to Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
              {filteredJobs.length} Jobs Found
            </h2>
            <p className="mt-1 text-sm text-[#8C8C8C]">
              Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * jobsPerPage + 1} -{" "}
              {Math.min(currentPage * jobsPerPage, filteredJobs.length)} of {filteredJobs.length}
            </p>
          </div>
        </div>

        {notification && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              notification.type === "error"
                ? "border-[#8C8C8C]/60 bg-[#8C8C8C]/15 text-[#404040] dark:text-[#BFBFBF]"
                : "border-[#BFBFBF]/60 bg-[#BFBFBF]/20 text-[#404040] dark:text-[#BFBFBF]"
            }`}
          >
            {notification.message}
          </div>
        )}

        {paginatedJobs.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/70 p-8 text-center">
            <p className="text-lg font-medium text-[#0D0D0D] dark:text-[#F2F2F2]">No jobs match your filters.</p>
            <p className="mt-2 text-sm text-[#8C8C8C]">Try broadening your search or clearing filters.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {paginatedJobs.map((job) => (
              <article
                key={job.id}
                className="group rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-white/5 p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#BFBFBF]/45 dark:bg-[#404040]/75 text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                      {monogram(job.company || "Tech")}
                    </span>

                    <div className="min-w-0">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                      >
                        <h3 className="truncate text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                          {job.title}
                        </h3>
                      </Link>
                      <p className="mt-1 truncate text-sm text-[#404040] dark:text-[#BFBFBF]">{job.company}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                      {formatSalary(job.salary?.min, job.salary?.max)}
                    </p>
                    <p className="mt-1 text-xs text-[#8C8C8C]">
                      {getTimeAgo(job.postedDate)} • {job.applicationsCount || 0} applicants
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#8C8C8C]">
                  <span>{job.location || "Location N/A"}</span>
                  <span aria-hidden>•</span>
                  <span>{job.jobType || "Full-time"}</span>
                  <span aria-hidden>•</span>
                  <span>{job.workType || "Hybrid"}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#BFBFBF]/40 dark:bg-[#404040]/70 px-3 py-1 text-xs font-medium text-[#404040] dark:text-[#BFBFBF]">
                    {getTechTrack(job)}
                  </span>
                  {job.experienceLevel && (
                    <span className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs text-[#8C8C8C]">
                      {job.experienceLevel}
                    </span>
                  )}
                  {job.featured && (
                    <span className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs text-[#8C8C8C]">
                      Featured
                    </span>
                  )}
                  {job.urgent && (
                    <span className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs text-[#8C8C8C]">
                      Urgent
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-[#BFBFBF]/60 dark:border-[#404040]/80 pt-4">
                  {!isEmployer && (
                    <>
                      {isJobApplied(job.id) ? (
                        <button
                          onClick={() => handleWithdraw(job)}
                          className="inline-flex min-h-11 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                        >
                          Withdraw
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate("/login", {
                                state: { from: { pathname: "/jobs" } },
                              });
                              return;
                            }
                            handleQuickApply(job);
                          }}
                          disabled={isAuthenticated && isJobSeeker && !user?.profileComplete}
                          className="inline-flex min-h-11 items-center rounded-full bg-[#0D0D0D] px-5 text-sm font-medium text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                        >
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
                            navigate("/login", {
                              state: { from: { pathname: "/jobs" } },
                            });
                            return;
                          }
                          handleSaveToggle(job);
                        }}
                        className="inline-flex min-h-11 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                      >
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
                    className="inline-flex min-h-11 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                  >
                    Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex min-h-11 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
            >
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
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                    currentPage === pageNum
                      ? "bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D]"
                      : "border border-[#BFBFBF] dark:border-[#404040] text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex min-h-11 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
            >
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
            ? `You are about to apply for ${selectedJob.title} at ${selectedJob.company}.`
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
        message="This action cannot be undone."
        confirmText="Withdraw"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Jobs;
