"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useJobs } from "../context/JobContext";
import { useJobsData } from "../contexts/JobsDataContext";
import { useAuth } from "../context/AuthContext";
import ConfirmationModal from "../components/ConfirmationModal";

const JobDetail = () => {
  const { id } = useParams();
  const router = useRouter();
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
      router.push("/login", { state: { from: { pathname: `/jobs/${id}` } } });
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
        router.push("/profile");
      }, 2000);
    } else {
      showNotification(result.error, "error");
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push("/login", { state: { from: { pathname: `/jobs/${id}` } } });
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

  if (!job) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/70 p-8 text-center">
          <h2 className="text-2xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Job Not Found</h2>
          <p className="mt-2 text-[#404040] dark:text-[#BFBFBF]">The job you are looking for does not exist.</p>
          <Link
            href="/jobs"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#0D0D0D] px-6 text-sm font-medium text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          >
            Back to Jobs <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    );
  }

  const description = job.description || "No description provided.";
  const collapsedDescription =
    description.length > 520 ? `${description.slice(0, 520)}...` : description;

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
            <Link href="/jobs" className="hover:text-[#404040] dark:hover:text-[#BFBFBF] transition-colors duration-200">Jobs</Link>
            <span>/</span>
            <span className="text-[#404040] dark:text-[#BFBFBF]">{job.title}</span>
          </nav>

          {notification && (
            <div
              className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                notification.type === "error"
                  ? "border-[#8C8C8C]/55 bg-[#8C8C8C]/15 text-[#404040]"
                  : "border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#BFBFBF]/25 dark:bg-[#404040]/40 text-[#404040] dark:text-[#BFBFBF]"
              }`}
            >
              {notification.message}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1.4fr_0.75fr] gap-6">
            <div className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#BFBFBF]/45 dark:bg-[#404040]/75">
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
                      <span className="hidden h-full w-full items-center justify-center text-base font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                        {monogram(job.company)}
                      </span>
                    </>
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-base font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                      {monogram(job.company)}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0D0D0D] dark:text-[#F2F2F2]">
                    {job.title}
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-[#404040] dark:text-[#BFBFBF]">{job.company}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8C8C8C]">
                    <span>{job.location || "Location N/A"}</span>
                    <span aria-hidden>•</span>
                    <span>{job.jobType || "Full-time"}</span>
                    <span aria-hidden>•</span>
                    <span>{job.workType || "Hybrid"}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.category && (
                      <span className="inline-flex items-center rounded-full bg-[#BFBFBF]/40 dark:bg-[#404040]/70 px-3 py-1 text-xs font-medium text-[#404040] dark:text-[#BFBFBF]">
                        {job.category}
                      </span>
                    )}
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
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6 backdrop-blur-sm">
              <p className="text-2xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                {formatSalary(job.salary?.min, job.salary?.max)}
              </p>
              <p className="mt-1 text-xs text-[#8C8C8C]">
                Posted {getTimeAgo(job.postedDate)} • {job.applicationsCount || 0} applicants
              </p>

              {!isEmployer && (
                <div className="mt-5 space-y-2">
                  {isJobApplied(job.id) ? (
                    <button
                      onClick={handleWithdraw}
                      className="w-full inline-flex min-h-11 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                    >
                      Withdraw Application
                    </button>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={isAuthenticated && isJobSeeker && !user?.profileComplete}
                      className="w-full inline-flex min-h-11 items-center justify-center rounded-full bg-[#0D0D0D] px-5 text-sm font-medium text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                    >
                      {!isAuthenticated
                        ? "Login to Apply"
                        : !isJobSeeker
                          ? "Seekers Only"
                          : !user?.profileComplete
                            ? "Complete Profile"
                            : "Apply Now"}
                    </button>
                  )}

                  <button
                    onClick={handleSave}
                    className="w-full inline-flex min-h-11 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                  >
                    {isJobSaved(job.id)
                      ? "Saved"
                      : isAuthenticated
                        ? "Save Job"
                        : "Login to Save"}
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl grid grid-cols-1 xl:grid-cols-[1.35fr_0.75fr] gap-6">
        <div className="space-y-5">
          <article className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
            <h2 className="text-xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Job Description</h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
              {showFullDescription ? description : collapsedDescription}
            </p>
            {description.length > 520 && (
              <button
                onClick={() => setShowFullDescription((v) => !v)}
                className="mt-4 inline-flex min-h-10 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-4 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              >
                {showFullDescription ? "Show Less" : "Read More"}
              </button>
            )}
          </article>

          <article className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
            <h2 className="text-xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Requirements</h2>
            <ul className="mt-4 space-y-2">
              {(job.requirements || []).map((req, index) => (
                <li key={index} className="flex gap-2 text-sm text-[#404040] dark:text-[#BFBFBF]">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8C8C8C]" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
            <h2 className="text-xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Benefits</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(job.benefits || []).map((benefit, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1.5 text-xs text-[#8C8C8C]"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
            <h3 className="text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Job Overview</h3>
            <dl className="mt-4 space-y-3">
              <OverviewRow label="Type" value={job.jobType || "N/A"} />
              <OverviewRow label="Experience" value={job.experienceLevel || "N/A"} />
              <OverviewRow label="Work" value={job.workType || "N/A"} />
              <OverviewRow label="Category" value={job.category || "N/A"} />
              <OverviewRow label="Remote" value={job.remote ? "Yes" : "No"} />
            </dl>
          </section>

          <section className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
            <h3 className="text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">About {job.company}</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#BFBFBF]/45 dark:bg-[#404040]/75">
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
                    <span className="hidden h-full w-full items-center justify-center text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                      {monogram(job.company)}
                    </span>
                  </>
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                    {monogram(job.company)}
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">{job.company}</p>
                <p className="text-xs text-[#8C8C8C]">{job.category || "Technology"}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
              Hiring across Europe, the Middle East, and Africa with an active pipeline of technical roles.
            </p>

            <Link
                href={`/companies/${job.company
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")}`}
              className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
            >
              Company Profile
            </Link>
          </section>

          <section className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-6">
            <h3 className="text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Share</h3>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] text-xs font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300"
              >
                LinkedIn
              </a>
              <a
                href={`https://x.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(job.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] text-xs font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300"
              >
                X
              </a>
              <button
                onClick={handleCopyLink}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] text-xs font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 transition-all duration-300"
              >
                Copy
              </button>
            </div>
          </section>
        </aside>
      </section>

      <ConfirmationModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onConfirm={confirmApply}
        title="Apply for this job?"
        message={`You are about to apply for ${job?.title} at ${job?.company}.`}
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
  <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#BFBFBF]/20 dark:bg-[#404040]/35 px-3 py-2">
    <dt className="text-xs uppercase tracking-[0.08em] text-[#8C8C8C]">{label}</dt>
    <dd className="text-sm font-medium text-[#404040] dark:text-[#BFBFBF]">{value}</dd>
  </div>
);

export default JobDetail;
