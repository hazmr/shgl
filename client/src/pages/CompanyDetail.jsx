import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import { useCompanies } from "../contexts/CompaniesContext";
import { useJobsData } from "../contexts/JobsDataContext";
import CornerAccents from "../components/CornerAccents";

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
      return `${Math.max(1, diffInHours)}H AGO`;
    }

    return `${Math.floor(diffInHours / 24)}D AGO`;
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-10 group mb-8">
          <CornerAccents className="text-fg/30" />
          <div className="h-4 w-40 bg-fg/10 animate-pulse mb-4" />
          <div className="h-8 w-2/3 bg-fg/10 animate-pulse mb-4" />
          <div className="h-4 w-full bg-fg/10 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-12 text-center group">
          <CornerAccents className="text-fg/30" />
          <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-2">// 404_NOT_FOUND</div>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-fg mb-4">Company Not Found</h2>
          <p className="font-mono text-xs text-secondary mb-8">
            The requested company record could not be retrieved from the database.
          </p>
          <Link
            to="/companies"
            className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
          >
            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
            <span>Back to Companies</span>
            <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1 ml-2">→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider mb-6">
        <Link to="/" className="hover:text-fg transition-colors duration-200">HOME</Link>
        <span>/</span>
        <Link to="/companies" className="hover:text-fg transition-colors duration-200">COMPANIES</Link>
        <span>/</span>
        <span className="text-fg">{company.name?.toUpperCase()}</span>
      </nav>

      {/* Hero Card Header */}
      <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-8 lg:p-10 mb-8 transition-all duration-300 group">
        <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start relative z-10">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
              {/* Logo block */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
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
                    <span className="hidden h-full w-full items-center justify-center font-mono text-lg font-bold text-fg">
                      {monogram(company.name)}
                    </span>
                  </>
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-mono text-lg font-bold text-fg">
                    {monogram(company.name)}
                  </span>
                )}
              </div>

              <div>
                <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-1">
                  // {company.industry?.toUpperCase() || "TECHNOLOGY"}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-sans text-fg uppercase tracking-tight leading-tight">
                  {company.name}
                </h1>
              </div>
            </div>

            {/* Quick overview metrics */}
            <div className="flex flex-wrap gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-1 text-fg">
                OPEN ROLES: {companyJobs.length}
              </span>
              {company.founded && (
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-1 text-[#5C5C5E] dark:text-[#8C8C8E]">
                  FOUNDED: {company.founded}
                </span>
              )}
              {company.size && (
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-1 text-[#5C5C5E] dark:text-[#8C8C8E]">
                  SIZE: {company.size.toUpperCase()}
                </span>
              )}
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider border border-fg bg-fg text-surface px-3 py-1">
                SCORE: {(company.rating || 0).toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          {/* Action side */}
          <div className="border-t lg:border-t-0 lg:border-l border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-end gap-3 h-full">
            <Link
              to={`/jobs?company=${encodeURIComponent(company.name)}`}
              className="group/jbtn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-5 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 cursor-pointer"
            >
              <CornerAccents className="opacity-0 group-hover/jbtn:opacity-100" />
              <span>View Open Jobs</span>
            </Link>
            <button className="group/fbtn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg px-5 font-mono text-xs uppercase font-bold tracking-wider hover:border-fg transition-all duration-300 cursor-pointer">
              <CornerAccents className="opacity-0 group-hover/fbtn:opacity-100" />
              <span>Follow Company</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="mb-8">
        <nav className="flex flex-wrap gap-2 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-2">
          {[
            { id: "overview", label: "OVERVIEW" },
            { id: "jobs", label: `OPEN JOBS (${companyJobs.length})` },
            { id: "culture", label: "CULTURE" },
            { id: "benefits", label: "BENEFITS" },
          ].map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group/tab relative inline-flex min-h-10 items-center justify-center border px-4 font-mono text-xs uppercase font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                  selected
                    ? "border-fg bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B]"
                    : "border-transparent bg-transparent text-muted hover:text-fg"
                }`}
              >
                <CornerAccents className="opacity-0 group-hover/tab:opacity-100" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </section>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Left column - Active tab panels */}
        <div>
          {activeTab === "overview" && (
            <div className="space-y-8">
              <article className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 group">
                <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
                <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
                  // COMPANY_OVERVIEW
                </h2>
                <p className="text-sm font-sans leading-relaxed text-[#5C5C5E] dark:text-[#8C8C8E] whitespace-pre-line">
                  {company.description ||
                    `${company.name} is a leading ${(company.industry || "technology").toLowerCase()} organization with teams distributed across ${(company.locations || []).length} hubs.`}
                </p>
              </article>

              <article className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 group">
                <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
                <h3 className="text-lg font-bold font-mono uppercase tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
                  // KEY_MISSION
                </h3>
                <p className="text-sm font-sans leading-relaxed text-[#5C5C5E] dark:text-[#8C8C8E]">
                  To engineer scalable software architectures and quantitative models, building dependable infrastructure while supporting professional growth within EMEA.
                </p>
              </article>

              <article className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 group">
                <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
                <h3 className="text-lg font-bold font-mono uppercase tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
                  // CORE_VALUES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "EXCELLENCE", desc: "Setting rigorous architectural standards in product engineering." },
                    { title: "ACCOUNTABILITY", desc: "Taking direct responsibility for performance and quality." },
                    { title: "TRANSPARENCY", desc: "Fostering direct, clear, and quantitative peer feedback." },
                    { title: "GROWTH", desc: "Supporting research-oriented continuous education budgets." },
                  ].map((value) => (
                    <div key={value.title} className="border border-[#0A0A0B]/5 dark:border-[#ECECEC]/5 bg-[#0A0A0B]/2 dark:bg-[#ECECEC]/2 p-4 transition-colors">
                      <h4 className="font-mono text-xs font-bold text-fg mb-1">{value.title}</h4>
                      <p className="text-xs text-[#5C5C5E] dark:text-[#8C8C8E] leading-relaxed">{value.desc}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}

          {activeTab === "jobs" && (
            <article className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 group">
              <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-6">
                <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-fg">
                  // ACTIVE_LISTINGS
                </h2>
                <Link
                  to={`/jobs?company=${encodeURIComponent(company.name)}`}
                  className="group/vbtn relative inline-flex min-h-9 items-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-fg hover:border-fg transition-all duration-300 cursor-pointer"
                >
                  <CornerAccents className="opacity-0 group-hover/vbtn:opacity-100" />
                  <span>VIEW ALL</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedJobs.length === 0 && (
                  <p className="font-mono text-xs text-muted col-span-2">// NO_ACTIVE_POSITIONS_AVAILABLE</p>
                )}

                {paginatedJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="group/jobcard flex flex-col relative border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/2 dark:bg-[#ECECEC]/2 p-5 hover:border-fg hover:bg-transparent transition-all duration-300 cursor-pointer"
                  >
                    <CornerAccents className="opacity-0 group-hover/jobcard:opacity-100" />
                    <h3 className="text-base font-bold font-sans text-fg uppercase tracking-tight mb-1">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider mb-4">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.jobType}</span>
                      <span>•</span>
                      <span>{job.workType}</span>
                    </div>
                    <div className="mt-auto pt-4 border-t border-[#0A0A0B]/5 dark:border-[#ECECEC]/5 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-fg uppercase">
                        {formatSalary(job.salary?.min, job.salary?.max)}
                      </span>
                      <span className="font-mono text-[9px] text-muted">{getTimeAgo(job.postedDate)}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Job Pagination */}
              {totalJobPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentJobPage(Math.max(1, currentJobPage - 1))}
                    disabled={currentJobPage === 1}
                    className="group/jprev relative inline-flex min-h-9 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-fg disabled:opacity-40 disabled:cursor-not-allowed hover:border-fg transition-all duration-300 cursor-pointer"
                  >
                    <CornerAccents className="opacity-0 group-hover/jprev:opacity-100" />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalJobPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentJobPage(pageNum)}
                      className={`group/jnum relative inline-flex h-9 w-9 items-center justify-center border font-mono text-[10px] uppercase font-bold transition-all duration-300 cursor-pointer ${
                        pageNum === currentJobPage
                          ? "border-fg bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B]"
                          : "border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg hover:border-fg"
                      }`}
                    >
                      <CornerAccents className="opacity-0 group-hover/jnum:opacity-100" />
                      <span>{pageNum}</span>
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentJobPage(Math.min(totalJobPages, currentJobPage + 1))}
                    disabled={currentJobPage === totalJobPages}
                    className="group/jnext relative inline-flex min-h-9 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-fg disabled:opacity-40 disabled:cursor-not-allowed hover:border-fg transition-all duration-300 cursor-pointer"
                  >
                    <CornerAccents className="opacity-0 group-hover/jnext:opacity-100" />
                    <span>Next</span>
                  </button>
                </div>
              )}
            </article>
          )}

          {activeTab === "culture" && (
            <article className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 group">
              <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
              <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
                // TEAM_CULTURE
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "WORK MODEL",
                    desc: "Focus time is prioritized, with clear deliverables and quantitative weekly targets.",
                  },
                  {
                    title: "CONTINUOUS LEARNING",
                    desc: "Academic collaboration and mentoring across senior quantitative research teams.",
                  },
                  {
                    title: "PEER REVIEW",
                    desc: "An engineering ecosystem built around direct, thorough pull request architectures.",
                  },
                  {
                    title: "DIVERSITY & RIGOR",
                    desc: "Hiring standard is exceptionally high, welcoming different technical backgrounds.",
                  },
                ].map((item) => (
                  <div key={item.title} className="border border-[#0A0A0B]/5 dark:border-[#ECECEC]/5 bg-[#0A0A0B]/2 dark:bg-[#ECECEC]/2 p-4">
                    <h3 className="font-mono text-xs font-bold text-fg mb-1">{item.title}</h3>
                    <p className="text-xs text-[#5C5C5E] dark:text-[#8C8C8E] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </article>
          )}

          {activeTab === "benefits" && (
            <article className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 group">
              <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
              <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
                // EMPLOYMENT_BENEFITS
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "COMPETITIVE COMPENSATION",
                  "COMPREHENSIVE HEALTHCARE",
                  "FLEXIBLE PAID TIME OFF",
                  "HOME OFFICE EQUIP BUDGET",
                  "ACADEMIC LEARNING BUDGET",
                  "COMPREHENSIVE FAMILY LEAVE",
                  "COMMUTER ALLOWANCES",
                  "ANNUAL TEAM GATHERINGS",
                ].map((benefit) => (
                  <span
                    key={benefit}
                    className="font-mono text-[10px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-1.5 text-fg"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </article>
          )}
        </div>

        {/* Right column - Side cards */}
        <aside className="space-y-8">
          {/* Company stats */}
          <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-3 mb-4">
              // SPECIFICATIONS
            </h3>
            <dl className="space-y-2">
              <StatRow label="Founded" value={company.founded || "N/A"} />
              <StatRow label="Size Class" value={company.size || "N/A"} />
              {company.employees && (
                <StatRow label="Headcount" value={company.employees.toLocaleString()} />
              )}
              <StatRow label="Active Listings" value={companyJobs.length} />
              <StatRow label="Rating Index" value={`${(company.rating || 0).toFixed(1)} / 5.0`} />
            </dl>
          </section>

          {/* Locations list */}
          <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-3 mb-4">
              // EMEA_HUBS
            </h3>
            <div className="flex flex-wrap gap-2">
              {(company.locations || []).map((location, index) => (
                <span
                  key={`${location}-${index}`}
                  className="font-mono text-[9px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-2 py-1 text-fg"
                >
                  {location.toUpperCase()}
                </span>
              ))}
            </div>
          </section>

          {/* Contact Actions */}
          <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-3 mb-4">
              // CONNECT
            </h3>
            <div className="space-y-3">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/webbtn relative inline-flex min-h-10 w-full items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-xs uppercase font-bold tracking-wider text-fg hover:border-fg transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/webbtn:opacity-100" />
                  <span>Visit Website</span>
                </a>
              )}
              <button className="group/followbtn relative inline-flex min-h-10 w-full items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-xs uppercase font-bold tracking-wider text-fg hover:border-fg transition-all duration-300">
                <CornerAccents className="opacity-0 group-hover/followbtn:opacity-100" />
                <span>Follow Updates</span>
              </button>
              <button className="group/hrbtn relative inline-flex min-h-10 w-full items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-xs uppercase font-bold tracking-wider text-fg hover:border-fg transition-all duration-300">
                <CornerAccents className="opacity-0 group-hover/hrbtn:opacity-100" />
                <span>Contact HR</span>
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-[#0A0A0B]/5 dark:border-[#ECECEC]/5 py-2 last:border-b-0">
    <dt className="font-mono text-[10px] uppercase tracking-wider text-[#8C8C8E]">{label}</dt>
    <dd className="font-mono text-xs font-bold text-fg uppercase">{value}</dd>
  </div>
);

export default CompanyDetail;
