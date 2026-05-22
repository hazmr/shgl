"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useJobsData } from "../contexts/JobsDataContext";

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
          <div className="rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10">
            <div className="h-4 w-40 rounded-full bg-[#BFBFBF]/60 dark:bg-[#404040]/70 animate-pulse" />
            <div className="mt-5 h-10 w-full max-w-xl rounded-2xl bg-[#BFBFBF]/50 dark:bg-[#404040]/60 animate-pulse" />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-64 rounded-3xl bg-[#F2F2F2]/70 dark:bg-[#0D0D0D]/60 border border-[#BFBFBF]/45 dark:border-[#404040]/65 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="relative mx-auto max-w-7xl rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10 shadow-sm">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
          <div className="absolute -top-20 right-6 h-48 w-48 rounded-full bg-[#8C8C8C]/20 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-44 w-44 rounded-full bg-[#0D0D0D]/10 dark:bg-[#F2F2F2]/5 blur-3xl" />
        </div>

        <div className="relative">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-[#8C8C8C]">
              Section / Jobs
            </p>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.12] text-[#0D0D0D] dark:text-[#F2F2F2]">
              Latest Tech Roles.
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
              Browse current technology openings and focus on work that matches your track.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium tracking-wide active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]",
                    active
                      ? "bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] shadow-sm"
                      : "bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/60 border border-[#BFBFBF]/70 dark:border-[#404040]/80 text-[#404040] dark:text-[#BFBFBF] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10",
                  ].join(" ")}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm text-[#404040] dark:text-[#BFBFBF]">
              Showing <span className="font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">{displayedJobs.length}</span> of {" "}
              <span className="font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">{filteredJobs.length}</span> roles
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const active = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={[
                      "inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium tracking-wide active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]",
                      active
                        ? "bg-[#BFBFBF]/70 dark:bg-[#404040]/90 text-[#0D0D0D] dark:text-[#F2F2F2]"
                        : "bg-[#F2F2F2]/70 dark:bg-[#0D0D0D]/60 border border-[#BFBFBF]/70 dark:border-[#404040]/80 text-[#404040] dark:text-[#BFBFBF] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10",
                    ].join(" ")}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedJobs.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-8 text-center">
                <p className="text-lg font-medium text-[#0D0D0D] dark:text-[#F2F2F2]">No matching jobs found.</p>
                <p className="mt-2 text-sm text-[#8C8C8C]">Try another category or filter combination.</p>
              </div>
            )}

            {displayedJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-white/5 p-6 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.99] backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#BFBFBF]/45 dark:bg-[#404040]/75">
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
                          <span className="hidden h-full w-full items-center justify-center text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                            {getCompanyMonogram(job.company || "Tech")}
                          </span>
                        </>
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                          {getCompanyMonogram(job.company || "Tech")}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                        {job.title}
                      </h3>
                      <p className="mt-1 truncate text-sm text-[#404040] dark:text-[#BFBFBF]">{job.company}</p>
                    </div>
                  </div>

                  {job.remote && (
                    <span className="inline-flex h-8 items-center rounded-full bg-[#0D0D0D]/10 dark:bg-[#F2F2F2]/10 px-3 text-xs font-medium text-[#404040] dark:text-[#BFBFBF]">
                      Remote
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#8C8C8C]">
                  <span>{job.location || "Location N/A"}</span>
                  <span aria-hidden>•</span>
                  <span>{job.jobType || "Full-time"}</span>
                  <span aria-hidden>•</span>
                  <span>{job.workType || "Hybrid"}</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#BFBFBF]/40 dark:bg-[#404040]/70 px-3 py-1 text-xs font-medium text-[#404040] dark:text-[#BFBFBF]">
                    {getTechTrack(job)}
                  </span>
                  {(job.requirements || []).slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs text-[#8C8C8C]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-end justify-between gap-3 border-t border-[#BFBFBF]/60 dark:border-[#404040]/80 pt-5">
                  <div className="text-base font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                    {formatSalary(job.salary?.min, job.salary?.max)}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8C8C8C]">{getTimeAgo(job.postedDate)}</p>
                    <p className="mt-1 text-sm font-medium text-[#404040] dark:text-[#BFBFBF] transition-transform duration-300 group-hover:translate-x-0.5">
                      View Role →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {displayCount < filteredJobs.length && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={loadMoreJobs}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#BFBFBF] dark:border-[#404040] px-7 py-3 text-sm font-semibold tracking-wide text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
              >
                Load More Jobs <span aria-hidden>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default JobsSection;
