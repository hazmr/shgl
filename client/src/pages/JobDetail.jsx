import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useJobs } from "../context/JobContext";
import { useJobsData } from "../contexts/JobsDataContext";
import { useAuth } from "../context/AuthContext";
import ConfirmationModal from "../components/ConfirmationModal";
import CornerAccents from "../components/CornerAccents";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const {
    applyForJob,
    saveJob,
    unsaveJob,
    isJobApplied,
    isJobSaved,
    withdrawApplication,
    getJobByIdSync,
  } = useJobs();
  const { jobs: apiJobs, getJobById } = useJobsData();
  const { user, isAuthenticated, isJobSeeker, isEmployer } = useAuth();

  useEffect(() => {
    let foundJob = getJobById(id);

    if (!foundJob) {
      foundJob = getJobByIdSync(id, apiJobs);
    }

    if (foundJob) {
      setJob(foundJob);
    }
  }, [id, getJobById, getJobByIdSync, apiJobs]);

  useEffect(() => {
    setShowApplyModal(false);
    setShowWithdrawModal(false);
  }, [id]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    if (!isJobSeeker) {
      showNotification("Only job seekers can apply for jobs", "error");
      return;
    }

    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    const result = await applyForJob(job);
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
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    if (!isJobSeeker) {
      showNotification("Only job seekers can save jobs", "error");
      return;
    }

    const saved = isJobSaved(job.id);
    const result = saved ? await unsaveJob(job.id) : await saveJob(job);

    if (result.success) {
      showNotification(result.message, "success");
    } else {
      showNotification(result.error, "error");
    }
  };

  const handleWithdraw = () => {
    if (!isAuthenticated || !isJobSeeker) return;
    setShowWithdrawModal(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showNotification("Link copied to clipboard", "success");
    } catch (_) {
      showNotification("Unable to copy link", "error");
    }
  };

  const confirmWithdraw = async () => {
    const result = await withdrawApplication(job.id);
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

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-12 text-center group">
          <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
          <div className="font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider mb-2">// 404_NOT_FOUND</div>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-fg mb-4">Job Not Found</h2>
          <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] mb-8">
            The requested job record could not be retrieved from the database.
          </p>
          <Link
            to="/jobs"
            className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
          >
            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
            <span>Back to Jobs</span>
            <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1 ml-2">→</span>
          </Link>
        </div>
      </div>
    );
  }

  const description = job.description || "No description provided.";
  const collapsedDescription =
    description.length > 520 ? `${description.slice(0, 520)}...` : description;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider mb-6">
        <Link to="/" className="hover:text-fg transition-colors duration-200">HOME</Link>
        <span>/</span>
        <Link to="/jobs" className="hover:text-fg transition-colors duration-200">JOBS</Link>
        <span>/</span>
        <span className="text-fg">{job.title?.toUpperCase()}</span>
      </nav>

      {/* Notification banner */}
      {notification && (
        <div
          className={`mb-6 border p-4 font-mono text-xs uppercase ${
            notification.type === "error"
              ? "border-red-500 bg-red-500/10 text-red-500"
              : "border-green-500 bg-green-500/10 text-green-500"
          }`}
        >
          // {notification.message}
        </div>
      )}

      {/* Hero Header Block */}
      <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-8 lg:p-10 mb-8 transition-all duration-300 group">
        <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start relative z-10">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
              {/* Company Logo container */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
                {job.companyLogo ? (
                  <>
                    <img
                      src={resolveLogo(job.companyLogo)}
                      alt={`${job.company} logo`}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.nextSibling.style.display = "flex";
                      }}
                    />
                    <span className="hidden h-full w-full items-center justify-center font-mono text-lg font-bold text-fg">
                      {monogram(job.company)}
                    </span>
                  </>
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-mono text-lg font-bold text-fg">
                    {monogram(job.company)}
                  </span>
                )}
              </div>

              <div>
                <div className="font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider mb-1">
                  // {job.company?.toUpperCase()}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-sans text-fg uppercase tracking-tight leading-tight">
                  {job.title}
                </h1>
              </div>
            </div>

            {/* Quick Metadata Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.category && (
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-1 text-[#5C5C5E] dark:text-[#8C8C8E]">
                  TRACK: {job.category.toUpperCase()}
                </span>
              )}
              {job.experienceLevel && (
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-1 text-[#5C5C5E] dark:text-[#8C8C8E]">
                  LEVEL: {job.experienceLevel.toUpperCase()}
                </span>
              )}
              {job.workType && (
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-1 text-[#5C5C5E] dark:text-[#8C8C8E]">
                  TYPE: {job.workType.toUpperCase()}
                </span>
              )}
              {job.featured && (
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider border border-green-500 bg-green-500/10 px-3 py-1 text-green-500">
                  FEATURED
                </span>
              )}
              {job.urgent && (
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider border border-red-500 bg-red-500/10 px-3 py-1 text-red-500">
                  URGENT
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E]">
              <span>LOCATION: {job.location?.toUpperCase() || "N/A"}</span>
              <span>•</span>
              <span>JOB_TYPE: {job.jobType?.toUpperCase() || "FULL-TIME"}</span>
            </div>
          </div>

          {/* Action Box on Hero Panel */}
          <div className="border-t lg:border-t-0 lg:border-l border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between h-full">
            <div>
              <div className="font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider mb-1">
                // COMPENS_ESTIMATE
              </div>
              <div className="text-3xl font-bold font-sans text-fg uppercase mb-1">
                {formatSalary(job.salary?.min, job.salary?.max)}
              </div>
              <div className="font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider mb-6">
                POSTED {getTimeAgo(job.postedDate)} • {job.applicationsCount || 0} APPLICANTS
              </div>
            </div>

            {!isEmployer && (
              <div className="space-y-3">
                {isJobApplied(job.id) ? (
                  <button
                    onClick={handleWithdraw}
                    className="w-full group/wbtn relative inline-flex min-h-11 items-center justify-center border border-red-500 bg-red-500/10 text-red-500 px-5 font-mono text-xs uppercase font-bold tracking-wider hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    <CornerAccents className="opacity-0 group-hover/wbtn:opacity-100" />
                    <span>Withdraw Application</span>
                  </button>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={isAuthenticated && isJobSeeker && !user?.profileComplete}
                    className="w-full group/applybtn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-5 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                  >
                    <CornerAccents className="opacity-0 group-hover/applybtn:opacity-100" />
                    <span>
                      {!isAuthenticated
                        ? "Login to Apply"
                        : !isJobSeeker
                          ? "Seekers Only"
                          : !user?.profileComplete
                            ? "Complete Profile"
                            : "Apply Now"}
                    </span>
                  </button>
                )}

                <button
                  onClick={handleSave}
                  className="w-full group/savebtn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg px-5 font-mono text-xs uppercase font-bold tracking-wider hover:border-fg transition-all duration-300 cursor-pointer"
                >
                  <CornerAccents className="opacity-0 group-hover/savebtn:opacity-100" />
                  <span>
                    {isJobSaved(job.id)
                      ? "Saved"
                      : isAuthenticated
                        ? "Save Job"
                        : "Login to Save"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Left Columns - Description, Req, Benefits */}
        <div className="space-y-8">
          {/* Job Description */}
          <article className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
              // JOB_DESCRIPTION
            </h2>
            <div className="text-sm font-sans leading-relaxed text-[#5C5C5E] dark:text-[#8C8C8E] whitespace-pre-line">
              {showFullDescription ? description : collapsedDescription}
            </div>
            {description.length > 520 && (
              <button
                onClick={() => setShowFullDescription((v) => !v)}
                className="mt-6 group/readbtn relative inline-flex min-h-9 items-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-fg hover:border-fg transition-all duration-300 cursor-pointer"
              >
                <CornerAccents className="opacity-0 group-hover/readbtn:opacity-100" />
                <span>{showFullDescription ? "Show Less" : "Read More"}</span>
              </button>
            )}
          </article>

          {/* Requirements */}
          <article className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
              // CORE_REQUIREMENTS
            </h2>
            <ul className="space-y-4">
              {(job.requirements || []).map((req, index) => (
                <li key={index} className="flex gap-3 text-sm text-[#5C5C5E] dark:text-[#8C8C8E]">
                  <span aria-hidden className="font-mono text-[#8C8C8E] shrink-0 select-none">
                    [{(index + 1).toString().padStart(2, "0")}]
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Benefits */}
          <article className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
              // ESTIMATED_BENEFITS
            </h2>
            <div className="flex flex-wrap gap-2">
              {(job.benefits || []).map((benefit, index) => (
                <span
                  key={index}
                  className="font-mono text-[10px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-1.5 text-[#5C5C5E] dark:text-[#8C8C8E]"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </article>
        </div>

        {/* Right Column - Spec table, About Company, Share */}
        <aside className="space-y-8">
          {/* Job Overview */}
          <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-3 mb-4">
              // JOB_OVERVIEW
            </h3>
            <dl className="space-y-2">
              <OverviewRow label="Type" value={job.jobType || "N/A"} />
              <OverviewRow label="Experience" value={job.experienceLevel || "N/A"} />
              <OverviewRow label="Work Model" value={job.workType || "N/A"} />
              <OverviewRow label="Category" value={job.category || "N/A"} />
              <OverviewRow label="Remote" value={job.remote ? "YES" : "NO"} />
            </dl>
          </section>

          {/* About Company */}
          <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-3 mb-4">
              // ABOUT_EMPLOYER
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
                {job.companyLogo ? (
                  <>
                    <img
                      src={resolveLogo(job.companyLogo)}
                      alt={`${job.company} logo`}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.nextSibling.style.display = "flex";
                      }}
                    />
                    <span className="hidden h-full w-full items-center justify-center font-mono text-sm font-bold text-fg">
                      {monogram(job.company)}
                    </span>
                  </>
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-mono text-sm font-bold text-fg">
                    {monogram(job.company)}
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm font-bold font-sans text-fg uppercase">{job.company}</p>
                <p className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider">{job.category || "TECHNOLOGY"}</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#5C5C5E] dark:text-[#8C8C8E] mb-6">
              Hiring across Europe, the Middle East, and Africa with an active pipeline of technical roles.
            </p>

            <Link
              to={`/companies/${job.company
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")}`}
              className="group/compbtn relative inline-flex min-h-10 w-full items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-5 font-mono text-xs uppercase font-bold tracking-wider text-fg hover:border-fg transition-all duration-300 cursor-pointer"
            >
              <CornerAccents className="opacity-0 group-hover/compbtn:opacity-100" />
              <span>Company Profile</span>
            </Link>
          </section>

          {/* Share Box */}
          <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-3 mb-4">
              // SHARE_RECORD
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/shbtn relative inline-flex h-9 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 text-[10px] font-mono font-bold uppercase tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg transition-all duration-300"
              >
                <CornerAccents className="opacity-0 group-hover/shbtn:opacity-100" />
                <span>LINKEDIN</span>
              </a>
              <a
                href={`https://x.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(job.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/shbtn relative inline-flex h-9 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 text-[10px] font-mono font-bold uppercase tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg transition-all duration-300"
              >
                <CornerAccents className="opacity-0 group-hover/shbtn:opacity-100" />
                <span>X</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="group/shbtn relative inline-flex h-9 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 text-[10px] font-mono font-bold uppercase tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg transition-all duration-300 cursor-pointer"
              >
                <CornerAccents className="opacity-0 group-hover/shbtn:opacity-100" />
                <span>COPY</span>
              </button>
            </div>
          </section>
        </aside>
      </div>

      <ConfirmationModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onConfirm={confirmApply}
        title="Apply for this job?"
        message={`You are about to submit your application for ${job?.title} at ${job?.company}.`}
        confirmText="Apply"
        cancelText="Cancel"
        type="success"
      />

      <ConfirmationModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={confirmWithdraw}
        title="Withdraw application?"
        message="Are you sure you want to withdraw this application?"
        confirmText="Withdraw"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

const OverviewRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-[#0A0A0B]/5 dark:border-[#ECECEC]/5 py-2 last:border-b-0">
    <dt className="font-mono text-[10px] uppercase tracking-wider text-[#8C8C8E]">{label}</dt>
    <dd className="font-mono text-xs font-bold text-fg uppercase">{value}</dd>
  </div>
);

export default JobDetail;
