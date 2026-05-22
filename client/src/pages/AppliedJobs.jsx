import { useState } from 'react';
import { Link } from "react-router-dom";
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import CornerAccents from '../components/CornerAccents';

const AppliedJobs = () => {
  const { appliedJobs, withdrawApplication } = useJobs();
  const { isJobSeeker, isAuthenticated, isLoading: authLoading } = useAuth();
  const [notification, setNotification] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [jobToWithdraw, setJobToWithdraw] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleWithdraw = (jobId) => {
    setJobToWithdraw(jobId);
    setShowWithdrawModal(true);
  };

  const closeWithdrawModal = () => {
    setShowWithdrawModal(false);
    setJobToWithdraw(null);
  };

  const confirmWithdraw = async () => {
    if (!jobToWithdraw) return;

    const result = await withdrawApplication(jobToWithdraw);
    if (result.success) {
      showNotification(result.message, 'success');
    } else {
      showNotification(result.error, 'error');
    }
    setJobToWithdraw(null);
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
      return `${Math.max(1, diffInHours)}H AGO`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}D AGO`;
  };

  const getStatusTone = (status) => {
    const value = (status || 'APPLIED').toUpperCase();

    if (value === 'HIRED' || value === 'OFFERED') {
      return 'border-green-500 bg-green-500/10 text-green-500';
    }

    if (value === 'REJECTED' || value === 'WITHDRAWN') {
      return 'border-red-500 bg-red-500/10 text-red-500';
    }

    if (value === 'SHORTLISTED' || value === 'INTERVIEWED' || value === 'IN REVIEW' || value === 'REVIEWED') {
      return 'border-fg bg-fg/10 text-fg';
    }

    return 'border-muted bg-muted/10 text-muted';
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

  if (authLoading) {
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

  if (!isAuthenticated || !isJobSeeker) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-12 text-center group">
          <CornerAccents className="text-fg/30" />
          <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-2">// ACCESS_DENIED</div>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-fg mb-4">
            {!isAuthenticated ? 'Authentication Required' : 'Access Denied'}
          </h2>
          <p className="font-mono text-xs text-secondary mb-8">
            {!isAuthenticated
              ? 'You need to be logged in as a candidate to view applied job listings.'
              : 'This portal view is only available for job seeker accounts.'}
          </p>
          <Link
            to="/login"
            className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
          >
            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
            <span>Go to Login</span>
            <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1 ml-2">→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero panel */}
      <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-8 lg:p-10 mb-8 transition-all duration-300 group">
        <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">
              // APPLIC_TRACKER
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold font-sans text-fg uppercase tracking-tight mb-2">
              My Applied Jobs
            </h1>
            <p className="font-mono text-xs sm:text-sm text-secondary">
              Track processing phase, review stats, and manage submitted job proposals.
            </p>
          </div>

          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-4 text-center min-w-[150px]">
            <p className="text-3xl font-bold text-fg font-sans leading-none">{appliedJobs.length}</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] mt-1">TOTAL_RECORD_COUNT</p>
          </div>
        </div>

        {/* Inline alerts */}
        {notification && (
          <div
            className={`mt-6 border p-4 font-mono text-xs uppercase ${
              notification.type === 'error'
                ? 'border-red-500 bg-red-500/10 text-red-500'
                : 'border-green-500 bg-green-500/10 text-green-500'
            }`}
          >
            // {notification.message}
          </div>
        )}
      </section>

      {/* Main List Section */}
      <section>
        {appliedJobs.length === 0 ? (
          <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-12 text-center group">
            <CornerAccents className="text-fg/30" />
            <div className="font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider mb-2">// ZERO_APPLICATIONS</div>
            <h3 className="text-xl font-bold uppercase text-fg mb-2">No Active Submissions</h3>
            <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] mb-8">
              You have not submitted applications to any tech teams yet.
            </p>
            <Link
              to="/jobs"
              className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
            >
              <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
              <span>Browse Tech Positions</span>
              <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1 ml-2">→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {appliedJobs
              .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
              .map((job) => {
                const salary = getSalaryValues(job);
                const companyName = job.companyName || job.company || 'Company';

                return (
                  <article
                    key={job.applicationId || job.id}
                    className="group relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 hover:border-fg transition-all duration-300"
                  >
                    <CornerAccents className="opacity-0 group-hover:opacity-100" />
                    
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-4">
                          {/* Logo */}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
                            {job.companyLogo ? (
                              <>
                                <img
                                  src={resolveLogo(job.companyLogo)}
                                  alt={`${companyName} logo`}
                                  className="h-full w-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.style.display = 'none';
                                    if (event.currentTarget.nextSibling) {
                                      event.currentTarget.nextSibling.style.display = 'flex';
                                    }
                                  }}
                                />
                                <span className="hidden h-full w-full items-center justify-center font-mono text-sm font-bold text-fg">
                                  {monogram(companyName)}
                                </span>
                              </>
                            ) : (
                              <span className="flex h-full w-full items-center justify-center font-mono text-sm font-bold text-fg">
                                {monogram(companyName)}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <Link
                                to={`/jobs/${job.id}`}
                                className="text-lg font-bold font-sans text-fg uppercase tracking-tight hover:text-muted transition-colors duration-200"
                              >
                                {job.title}
                              </Link>
                              
                              <span className={`border font-mono text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 ${getStatusTone(job.status)}`}>
                                {job.status || 'APPLIED'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-secondary uppercase tracking-wider mb-3">
                              <span>{companyName}</span>
                              <span>•</span>
                              <span>{job.location || 'N/A'}</span>
                              <span>•</span>
                              <span>{job.jobType || 'FULL-TIME'}</span>
                            </div>

                            {/* Info Badges */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.workType && (
                                <span className="font-mono text-[9px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-2 py-0.5 text-secondary">
                                  {job.workType.toUpperCase()}
                                </span>
                              )}
                              {job.category && (
                                <span className="font-mono text-[9px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-2 py-0.5 text-secondary">
                                  {job.category.toUpperCase()}
                                </span>
                              )}
                              {job.experienceLevel && (
                                <span className="font-mono text-[9px] uppercase font-bold tracking-wider border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-2 py-0.5 text-secondary">
                                  {job.experienceLevel.toUpperCase()}
                                </span>
                              )}
                            </div>

                            <p className="font-mono text-[9px] text-muted uppercase">
                              APPLIED: {getTimeAgo(job.appliedAt)} • APPL_ID: {job.applicationId || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right column - Salary and actions */}
                      <div className="w-full lg:w-auto lg:min-w-[200px] border-t lg:border-t-0 border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-4 lg:pt-0 lg:text-right flex flex-col justify-between self-stretch">
                        <div>
                          <span className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider block mb-1">COMPENS_VAL</span>
                          <span className="text-lg font-bold font-sans text-fg uppercase block">
                            {formatSalary(salary.min, salary.max)}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 lg:justify-end">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="group/vbtn relative inline-flex min-h-9 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-fg hover:border-fg transition-all duration-300"
                          >
                            <CornerAccents className="opacity-0 group-hover/vbtn:opacity-100" />
                            <span>View Job</span>
                          </Link>
                          
                          <button
                            onClick={() => handleWithdraw(job.id)}
                            className="group/wbtn relative inline-flex min-h-9 items-center justify-center border border-red-500 bg-red-500/10 text-red-500 px-4 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer"
                          >
                            <CornerAccents className="opacity-0 group-hover/wbtn:opacity-100" />
                            <span>Withdraw</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        )}
      </section>

      <ConfirmationModal
        isOpen={showWithdrawModal}
        onClose={closeWithdrawModal}
        onConfirm={confirmWithdraw}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmText="Yes, Withdraw"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default AppliedJobs;
