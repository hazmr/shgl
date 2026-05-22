"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCompanies } from "../contexts/CompaniesContext";
import { useJobsData } from "../contexts/JobsDataContext";

const CompanyDetail = () => {
  const { id } = useParams();
  const { loading, getCompanyByName } = useCompanies();
  const { jobs } = useJobsData();
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentJobPage, setCurrentJobPage] = useState(1);
  const jobsPerPage = 6;

  useEffect(() => {
    if (!loading) {
      const foundCompany = getCompanyByName(id);
      setCompany(foundCompany);
    }
  }, [id, loading, getCompanyByName]);

  useEffect(() => {
    setCurrentJobPage(1);
  }, [activeTab, id]);

  const companyJobs = useMemo(() => {
    if (!company) return [];
    return jobs.filter((job) => job.company === company.name);
  }, [company, jobs]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentJobPage - 1) * jobsPerPage;
    return companyJobs.slice(startIndex, startIndex + jobsPerPage);
  }, [companyJobs, currentJobPage]);

  const totalJobPages = Math.ceil(companyJobs.length / jobsPerPage);

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

  const resolveLogo = (logo) => {
    if (!logo) return "";
    if (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/")) {
      return logo;
    }
    return `/${logo}`;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i += 1) {
      stars.push(
        <span key={i} aria-hidden>
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" aria-hidden>
          ☆
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i += 1) {
      stars.push(
        <span key={`empty-${i}`} aria-hidden>
          ☆
        </span>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10">
          <div className="h-6 w-56 rounded-full bg-[#BFBFBF]/60 dark:bg-[#404040]/70 animate-pulse" />
          <div className="mt-5 h-10 w-full max-w-xl rounded-2xl bg-[#BFBFBF]/50 dark:bg-[#404040]/60 animate-pulse" />
          <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.4fr_0.75fr] gap-5">
            <div className="h-64 rounded-3xl border border-[#BFBFBF]/45 dark:border-[#404040]/65 bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/60 animate-pulse" />
            <div className="h-64 rounded-3xl border border-[#BFBFBF]/45 dark:border-[#404040]/65 bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !company) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/70 p-8 text-center">
          <h2 className="text-2xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Company Not Found</h2>
          <p className="mt-2 text-[#404040] dark:text-[#BFBFBF]">The requested company could not be located.</p>
          <Link
            href="/companies"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#0D0D0D] px-6 text-sm font-medium text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          >
            Back to Companies <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <section className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10 shadow-sm">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-[#8C8C8C]/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-1/4 translate-y-1/4 rounded-full bg-[#404040]/15 dark:bg-[#BFBFBF]/10 blur-3xl" />
        </div>

        <div className="relative">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-[#8C8C8C]">
            <Link href="/" className="hover:text-[#404040] dark:hover:text-[#BFBFBF] transition-colors duration-200">Home</Link>
            <span>/</span>
            <Link href="/companies" className="hover:text-[#404040] dark:hover:text-[#BFBFBF] transition-colors duration-200">Companies</Link>
            <span>/</span>
            <span className="text-[#404040] dark:text-[#BFBFBF]">{company.name}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1.35fr_0.75fr] gap-6">
            <div className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#BFBFBF]/45 dark:bg-[#404040]/75">
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
                      <span className="hidden h-full w-full items-center justify-center text-base font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                        {monogram(company.name)}
                      </span>
                    </>
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-base font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                      {monogram(company.name)}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0D0D0D] dark:text-[#F2F2F2]">
                    {company.name}
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-[#404040] dark:text-[#BFBFBF]">{company.industry || "Technology"}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#8C8C8C]">{renderStars(company.rating || 0)}</span>
                    <span className="text-xs text-[#8C8C8C]">{(company.rating || 0).toFixed(1)} / 5</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#BFBFBF]/40 dark:bg-[#404040]/70 px-3 py-1 text-xs font-medium text-[#404040] dark:text-[#BFBFBF]">
                      {companyJobs.length} Open Positions
                    </span>
                    {company.founded && (
                      <span className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs text-[#8C8C8C]">
                        Founded {company.founded}
                      </span>
                    )}
                    {company.size && (
                      <span className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs text-[#8C8C8C]">
                        {company.size}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6 backdrop-blur-sm">
              <Link
                href={`/jobs?company=${encodeURIComponent(company.name)}`}
                className="w-full inline-flex min-h-11 items-center justify-center rounded-full bg-[#0D0D0D] px-5 text-sm font-medium text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              >
                View All Jobs
              </Link>

              <button className="mt-3 w-full inline-flex min-h-11 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
                Follow Company
              </button>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl">
        <nav className="flex flex-wrap gap-2 rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-3">
          {[
            { id: "overview", label: "Overview" },
            { id: "jobs", label: `Jobs (${companyJobs.length})` },
            { id: "culture", label: "Culture" },
            { id: "benefits", label: "Benefits" },
          ].map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                  selected
                    ? "bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D]"
                    : "border border-[#BFBFBF] dark:border-[#404040] text-[#404040] dark:text-[#BFBFBF] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </section>

      <section className="mx-auto mt-6 max-w-7xl grid grid-cols-1 xl:grid-cols-[1.35fr_0.75fr] gap-6">
        <div>
          {activeTab === "overview" && (
            <div className="space-y-5">
              <article className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
                <h2 className="text-xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">About {company.name}</h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
                  {company.description ||
                    `${company.name} is a ${(company.industry || "technology").toLowerCase()} organization with teams distributed across ${(company.locations || []).length} locations.`}
                </p>
              </article>

              <article className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
                <h3 className="text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Mission</h3>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
                  Build dependable products, hire with rigor, and support long-term professional growth in the EMEA region.
                </p>
              </article>

              <article className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
                <h3 className="text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Values</h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: "Excellence", desc: "High standards in every detail." },
                    { title: "Accountability", desc: "People take responsibility for outcomes." },
                    { title: "Transparency", desc: "Direct and open communication." },
                    { title: "Growth", desc: "Continuous learning and professional development." },
                  ].map((value) => (
                    <div key={value.title} className="rounded-2xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/35 p-4">
                      <h4 className="text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">{value.title}</h4>
                      <p className="mt-1 text-sm text-[#404040] dark:text-[#BFBFBF]">{value.desc}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}

          {activeTab === "jobs" && (
            <article className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Open Positions ({companyJobs.length})</h2>
                <Link
                    href={`/jobs?company=${encodeURIComponent(company.name)}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-4 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300"
                >
                  View All
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {paginatedJobs.length === 0 && (
                  <p className="text-sm text-[#8C8C8C]">No open roles at this moment.</p>
                )}

                {paginatedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block rounded-2xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/35 p-4 hover:shadow-sm transition-all duration-300"
                  >
                    <h3 className="text-base font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">{job.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8C8C8C]">
                      <span>{job.location || "Location N/A"}</span>
                      <span aria-hidden>•</span>
                      <span>{job.jobType || "Full-time"}</span>
                      <span aria-hidden>•</span>
                      <span>{job.workType || "Hybrid"}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-[#404040] dark:text-[#BFBFBF]">
                        {formatSalary(job.salary?.min, job.salary?.max)}
                      </span>
                      <span className="text-[#8C8C8C]">{getTimeAgo(job.postedDate)}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {totalJobPages > 1 && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentJobPage(Math.max(1, currentJobPage - 1))}
                    disabled={currentJobPage === 1}
                    className="inline-flex min-h-10 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-4 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalJobPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentJobPage(pageNum)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                        pageNum === currentJobPage
                          ? "bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D]"
                          : "border border-[#BFBFBF] dark:border-[#404040] text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentJobPage(Math.min(totalJobPages, currentJobPage + 1))}
                    disabled={currentJobPage === totalJobPages}
                    className="inline-flex min-h-10 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-4 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </article>
          )}

          {activeTab === "culture" && (
            <article className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
              <h2 className="text-xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Culture</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: "Work Style",
                    desc: "Focus time prioritized alongside clear weekly goals.",
                  },
                  {
                    title: "Learning",
                    desc: "Mentorship and ongoing knowledge exchange across our EMEA teams.",
                  },
                  {
                    title: "Collaboration",
                    desc: "Cross-functional planning within a remote-first culture.",
                  },
                  {
                    title: "Inclusion",
                    desc: "A respectful, diverse environment with high standards.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/35 p-4">
                    <h3 className="text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#404040] dark:text-[#BFBFBF]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </article>
          )}

          {activeTab === "benefits" && (
            <article className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
              <h2 className="text-xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Benefits</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Competitive compensation",
                  "Medical, dental, vision",
                  "Flexible paid time off",
                  "Home office support",
                  "Learning budget",
                  "Parental leave",
                  "Commuter support",
                  "Team retreats",
                ].map((benefit) => (
                  <span
                    key={benefit}
                    className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1.5 text-xs text-[#8C8C8C]"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </article>
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
            <h3 className="text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Company Stats</h3>
            <dl className="mt-4 space-y-3">
              <StatRow label="Founded" value={company.founded || "N/A"} />
              <StatRow label="Size" value={company.size || "N/A"} />
              {company.employees && (
                <StatRow label="Employees" value={company.employees.toLocaleString()} />
              )}
              <StatRow label="Open Jobs" value={companyJobs.length} />
              <StatRow label="Rating" value={(company.rating || 0).toFixed(1)} />
            </dl>
          </section>

          <section className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
            <h3 className="text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Locations</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(company.locations || []).map((location, index) => (
                <span
                  key={`${location}-${index}`}
                  className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1.5 text-xs text-[#8C8C8C]"
                >
                  {location}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
            <h3 className="text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Contact</h3>
            <div className="mt-4 space-y-2">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex min-h-10 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-4 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300"
                >
                  Visit Website
                </a>
              )}
              <button className="w-full inline-flex min-h-10 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-4 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300">
                Follow
              </button>
              <button className="w-full inline-flex min-h-10 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-4 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300">
                Contact HR
              </button>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
};

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#BFBFBF]/20 dark:bg-[#404040]/35 px-3 py-2">
    <dt className="text-xs uppercase tracking-[0.08em] text-[#8C8C8C]">{label}</dt>
    <dd className="text-sm font-medium text-[#404040] dark:text-[#BFBFBF]">{value}</dd>
  </div>
);

export default CompanyDetail;
