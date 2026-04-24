import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

const SavedJobs = () => {
  const { savedJobs, unsaveJob, applyForJob, isJobApplied } = useJobs();
  const { isJobSeeker, isAuthenticated, isLoading: authLoading } = useAuth();
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatSalary = (min, max) => {
    const minValue = Number(min) || 0;
    const maxValue = Number(max) || 0;
    if (!minValue && !maxValue) return 'Competitive';
    return `$${(minValue / 1000).toFixed(0)}k - $${(maxValue / 1000).toFixed(0)}k`;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Recently';
    }
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${Math.max(1, diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleUnsave = async (jobId) => {
    const result = await unsaveJob(jobId);
    if (result.success) {
      showNotification(result.message, 'success');
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleQuickApply = async (job) => {
    const result = await applyForJob(job);
    if (result.success) {
      showNotification(result.message, 'success');
    } else {
      showNotification(result.error, 'error');
    }
  };

  const getSalaryValues = (job) => {
    const min = job.salaryMin ?? job.salary?.min ?? 0;
    const max = job.salaryMax ?? job.salary?.max ?? 0;
    return { min, max };
  };

  const monogram = (name = '') => {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const resolveLogo = (logo) => {
    if (!logo) return '';
    if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/')) {
      return logo;
    }
    return `/${logo}`;
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10">
          <div className="h-5 w-44 rounded-full bg-[#BFBFBF]/60 dark:bg-[#404040]/70 animate-pulse" />
          <div className="mt-5 h-10 w-full max-w-xl rounded-2xl bg-[#BFBFBF]/50 dark:bg-[#404040]/60 animate-pulse" />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-56 rounded-3xl border border-[#BFBFBF]/45 dark:border-[#404040]/65 bg-[#F2F2F2]/75 dark:bg-[#0D0D0D]/60 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isJobSeeker) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/70 p-8 text-center">
          <h2 className="text-2xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">{!isAuthenticated ? 'Please Log In' : 'Access Denied'}</h2>
          <p className="mt-2 text-[#404040] dark:text-[#BFBFBF]">{!isAuthenticated ? 'You need to be logged in to view your saved jobs.' : 'This page is only available for job seekers.'}</p>
          <Link
            to="/"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#0D0D0D] px-6 text-sm font-medium text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          >
            Go Home
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
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-[#8C8C8C]">
                Job Seeker / Saved
              </p>
              <h1 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight text-[#0D0D0D] dark:text-[#F2F2F2]">Saved Jobs</h1>
              <p className="mt-2 text-sm sm:text-base text-[#404040] dark:text-[#BFBFBF]">Your bookmarked opportunities for quick revisit.</p>
            </div>

            <div className="rounded-2xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 px-4 py-3 text-center">
              <p className="text-2xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">{savedJobs.length}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-[#8C8C8C]">Saved Jobs</p>
            </div>
          </div>

          {notification && (
            <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${notification.type === 'error' ? 'border-[#8C8C8C]/55 bg-[#8C8C8C]/15 text-[#404040]' : 'border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#BFBFBF]/25 dark:bg-[#404040]/40 text-[#404040] dark:text-[#BFBFBF]'}`}>
              {notification.message}
            </div>
          )}

          {savedJobs.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-8 text-center">
              <h3 className="text-xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">No Saved Jobs Yet</h3>
              <p className="mt-2 text-sm text-[#404040] dark:text-[#BFBFBF]">Save roles from listings to keep them handy for later review.</p>
              <Link
                to="/jobs"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0D0D0D] px-6 text-sm font-medium text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              >
                Browse Jobs
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4">
              {savedJobs
                .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
                .map((job) => {
                  const salary = getSalaryValues(job);
                  const companyName = job.companyName || job.company || 'Company';

                  return (
                    <article
                      key={job.id}
                      className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-white/5 p-5 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row gap-5 lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#BFBFBF]/45 dark:bg-[#404040]/75">
                              {job.companyLogo ? (
                                <>
                                  <img
                                    src={resolveLogo(job.companyLogo)}
                                    alt={`${companyName} logo`}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                      event.currentTarget.style.display = 'none';
                                      event.currentTarget.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <span className="hidden h-full w-full items-center justify-center text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                                    {monogram(companyName)}
                                  </span>
                                </>
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                                  {monogram(companyName)}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-2">
                                <Link
                                  to={`/jobs/${job.id}`}
                                  className="truncate text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2] hover:underline"
                                >
                                  {job.title}
                                </Link>

                                <button
                                  onClick={() => handleUnsave(job.id)}
                                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] text-[#8C8C8C] hover:text-[#404040] dark:hover:text-[#BFBFBF] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300"
                                  title="Remove from saved jobs"
                                >
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                                </button>
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8C8C8C]">
                                <span>{companyName}</span>
                                <span aria-hidden>•</span>
                                <span>{job.location || 'Location N/A'}</span>
                                <span aria-hidden>•</span>
                                <span>{job.jobType || 'Full-time'}</span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {job.workType && (
                                  <span className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs text-[#8C8C8C]">
                                    {job.workType}
                                  </span>
                                )}
                                {job.category && (
                                  <span className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs text-[#8C8C8C]">
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

                              <p className="mt-3 text-xs text-[#8C8C8C]">
                                Saved {getTimeAgo(job.savedAt)} • Posted {getTimeAgo(job.postedDate)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="w-full lg:w-auto lg:min-w-[210px]">
                          <p className="text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
                            {formatSalary(salary.min, salary.max)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 lg:justify-end">
                            <button
                              onClick={() => handleQuickApply(job)}
                              disabled={isJobApplied(job.id)}
                              className="inline-flex min-h-10 items-center rounded-full bg-[#0D0D0D] px-4 text-sm font-medium text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                            >
                              {isJobApplied(job.id) ? 'Applied' : 'Quick Apply'}
                            </button>
                            <Link
                              to={`/jobs/${job.id}`}
                              className="inline-flex min-h-10 items-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-4 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SavedJobs;