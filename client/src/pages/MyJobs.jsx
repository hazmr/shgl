
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useJobsData } from '../contexts/JobsDataContext';
import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';
import CornerAccents from '../components/CornerAccents';

const MyJobs = () => {
  const { theme } = useTheme();
  const { user, isEmployer, isAuthenticated } = useAuth();
  const { forceRefresh } = useJobsData();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingJobId, setUpdatingJobId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    if (isAuthenticated && isEmployer) {
      fetchJobs();
    }
  }, [isAuthenticated, isEmployer]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await httpClient.get(API_ENDPOINTS.EMPLOYER_JOBS);
      const jobsData = response.data || [];
      setJobs(jobsData);

      // Extract company info from first job (all jobs belong to same company)
      if (jobsData.length > 0) {
        setCompanyInfo({
          id: jobsData[0].companyId,
          name: jobsData[0].companyName,
          logo: jobsData[0].companyLogo
        });
      }

      // Also refresh the global jobs cache so JobDetail page can find newly created jobs
      await forceRefresh();
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (jobId, newStatus) => {
    // Show confirmation modal
    setPendingStatusChange({ jobId, newStatus });
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { jobId, newStatus } = pendingStatusChange;

    try {
      setUpdatingJobId(jobId);
      setError('');
      setSuccess('');
      setShowConfirmModal(false);

      const response = await httpClient.patch(API_ENDPOINTS.UPDATE_JOB_STATUS(jobId), {
        status: newStatus
      });

      // Update the job in the local state
      setJobs(jobs.map(job =>
        job.id === jobId ? response.data : job
      ));

      setSuccess(`Job status updated to ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);

      setPendingStatusChange(null);
    } catch (err) {
      console.error('Error updating job status:', err);
      setError(err.response?.data?.message || 'Failed to update job status');
    } finally {
      setUpdatingJobId(null);
    }
  };

  const cancelStatusChange = () => {
    setShowConfirmModal(false);
    setPendingStatusChange(null);
  };

  const formatSalary = (min, max, currency = 'USD') => {
    return `${currency} ${(min / 1000).toFixed(0)}k - ${(max / 1000).toFixed(0)}k`;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'CLOSED':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'DRAFT':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (!isAuthenticated || !isEmployer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECECEC] dark:bg-[#0A0A0B] px-4 transition-colors duration-300 relative">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="w-full max-w-md border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-10 transition-all duration-300 relative group text-center">
          <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
          <div className="text-3xl mb-4 text-[#8C8C8E]">🚫</div>
          <h2 className="text-2xl font-bold font-sans uppercase mb-4 text-fg">
            Access Denied
          </h2>
          <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] mb-6 uppercase tracking-wider leading-relaxed">
            You must be logged in as an employer to view this page.
          </p>
          <a
            href="/"
            className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 w-full"
          >
            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
            <span>RETURN HOME</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECECEC] dark:bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative grid background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header and Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 pb-6 mb-8">
          <div>
            <div className="text-[10px] font-bold font-mono text-[#8C8C8E] uppercase tracking-wider mb-2">
              // EMPLOYER_PORTAL / LISTINGS_DASHBOARD
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-sans uppercase text-fg tracking-tight mb-2">
              My Posted Jobs
            </h1>
            <p className="text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider">
              Manage your job postings and update their active statuses
            </p>
          </div>
          <Link
            to="/employer/post-job"
            className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
          >
            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
            <span>POST A JOB LISTING</span>
            <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1 ml-2">→</span>
          </Link>
        </div>

        {/* Company Info Header Panel */}
        {companyInfo && (
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 mb-8 transition-all duration-300 relative group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/45" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
              <div className="w-16 h-16 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 flex items-center justify-center bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 font-mono text-xl font-bold text-fg">
                {companyInfo.logo ? (
                  <img
                    src={companyInfo.logo}
                    alt={companyInfo.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span>{companyInfo.name?.charAt(0) || 'C'}</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase text-fg font-sans tracking-wide">
                  {companyInfo.name}
                </h2>
                <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider mt-1">
                  Company Jobs Dashboard • {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Posted
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Alerts */}
        {success && (
          <div className="p-4 mb-6 bg-fg/5 dark:bg-fg/5 border border-fg/15 flex items-start gap-3">
            <svg className="w-5 h-5 text-fg flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-mono text-fg uppercase tracking-wider">{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/35 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-mono text-red-500 uppercase tracking-wider">{error}</span>
          </div>
        )}

        {/* Main Content Area */}
        {isLoading ? (
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] py-20 flex flex-col items-center gap-4 relative group">
            <CornerAccents className="text-fg/20" />
            <div className="w-8 h-8 border-2 border-fg border-t-transparent animate-spin"></div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#8C8C8E]">FETCHING JOB REGISTRY...</p>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State */
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-12 text-center relative group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <div className="max-w-md mx-auto py-8">
              <svg
                className="mx-auto h-12 w-12 text-[#8C8C8E] mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-bold font-sans uppercase text-fg mb-2">
                No jobs posted yet
              </h3>
              <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider mb-6 leading-relaxed">
                Start by posting your first job to attract talented candidates.
              </p>
              <Link
                to="/employer/post-job"
                className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
              >
                <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                <span>POST YOUR FIRST JOB</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Jobs Table container */
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] transition-all duration-300 relative group overflow-hidden">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 font-mono text-xs uppercase tracking-wider text-[#8C8C8E] bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 select-none">
                    <th className="py-4 px-6 font-bold">Job Title</th>
                    <th className="py-4 px-6 font-bold">Location</th>
                    <th className="py-4 px-6 font-bold">Type</th>
                    <th className="py-4 px-6 font-bold">Salary</th>
                    <th className="py-4 px-6 font-bold text-center">Applicants</th>
                    <th className="py-4 px-6 font-bold">Posted</th>
                    <th className="py-4 px-6 font-bold">Status</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0A0A0B]/10 dark:divide-[#ECECEC]/10">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-[#0A0A0B]/2 dark:hover:bg-[#ECECEC]/2 transition-colors duration-200"
                    >
                      {/* Job Title */}
                      <td className="py-5 px-6">
                        <div>
                          <Link to={`/jobs/${job.id}`} className="font-bold text-fg font-sans hover:underline text-sm uppercase tracking-wide">
                            {job.title}
                          </Link>
                          <p className="font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider mt-1">
                            {job.category}
                          </p>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-5 px-6">
                        <span className="font-mono text-xs text-fg uppercase tracking-wide">
                          {job.location}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="inline-block font-mono text-[10px] text-fg uppercase tracking-wider">
                            {job.workType}
                          </span>
                          <span className="inline-block font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider">
                            {job.experienceLevel}
                          </span>
                        </div>
                      </td>

                      {/* Salary */}
                      <td className="py-5 px-6">
                        <div className="font-mono text-xs text-fg">
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                        </div>
                        <div className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider mt-0.5">
                          per {job.salaryPeriod}
                        </div>
                      </td>

                      {/* Applicants */}
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center justify-center px-2.5 py-1 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 font-mono text-xs font-bold text-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5">
                          {job.applicationsCount || 0}
                        </div>
                      </td>

                      {/* Posted */}
                      <td className="py-5 px-6">
                        <span className="font-mono text-xs text-[#8C8C8E] uppercase tracking-wide">
                          {getTimeAgo(job.postedDate)}
                        </span>
                      </td>

                      {/* Status Badges & Controls */}
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-block text-center py-1 px-2.5 font-mono text-[9px] font-bold uppercase tracking-wider border border-current ${
                            job.status === 'ACTIVE' ? 'text-green-600 dark:text-green-400' :
                            job.status === 'CLOSED' ? 'text-red-500 dark:text-red-400' :
                            'text-amber-600 dark:text-amber-400'
                          }`}>
                            {job.status}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStatusChange(job.id, 'ACTIVE')}
                              disabled={updatingJobId === job.id || job.status === 'ACTIVE'}
                              title="Set to Active"
                              className="w-6 h-6 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 hover:border-fg font-mono text-[10px] font-bold text-fg flex items-center justify-center hover:bg-[#0A0A0B]/5 dark:hover:bg-[#ECECEC]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              A
                            </button>
                            <button
                              onClick={() => handleStatusChange(job.id, 'CLOSED')}
                              disabled={updatingJobId === job.id || job.status === 'CLOSED'}
                              title="Set to Closed"
                              className="w-6 h-6 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 hover:border-fg font-mono text-[10px] font-bold text-fg flex items-center justify-center hover:bg-[#0A0A0B]/5 dark:hover:bg-[#ECECEC]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              C
                            </button>
                            <button
                              onClick={() => handleStatusChange(job.id, 'DRAFT')}
                              disabled={updatingJobId === job.id || job.status === 'DRAFT'}
                              title="Set to Draft"
                              className="w-6 h-6 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 hover:border-fg font-mono text-[10px] font-bold text-fg flex items-center justify-center hover:bg-[#0A0A0B]/5 dark:hover:bg-[#ECECEC]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              D
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2">
                          <Link
                            to={`/job-applicants/${job.id}`}
                            className="group/btn text-center relative inline-flex min-h-9 items-center justify-center border border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 hover:border-fg px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-[#0A0A0B] hover:text-[#ECECEC] dark:hover:bg-[#ECECEC] dark:hover:text-[#0A0A0B] transition-all duration-300"
                          >
                            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                            <span>Applicants</span>
                          </Link>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="group/btn text-center relative inline-flex min-h-9 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
                          >
                            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                            <span>View</span>
                          </Link>
                        </div>
                      </td>

                      {/* Loading Overlay for Row */}
                      {updatingJobId === job.id && (
                        <td colSpan="8" className="bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 text-center py-4">
                          <div className="flex items-center justify-center gap-2 font-mono text-xs text-[#8C8C8E] uppercase tracking-wider">
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>UPDATING STATUS...</span>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && pendingStatusChange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0B]/60 dark:bg-[#0A0A0B]/80 backdrop-blur-sm transition-all">
            <div className="w-full max-w-md border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-10 transition-all duration-300 relative group">
              <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 flex items-center justify-center bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 font-mono text-lg font-bold text-fg mb-6">
                  <span>?</span>
                </div>
                
                <h3 className="text-xl font-bold font-sans uppercase text-fg mb-4">
                  Confirm Status Change
                </h3>
                
                <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider leading-relaxed mb-6">
                  Are you sure you want to change this job status to{' '}
                  <span className="text-fg font-bold">
                    {pendingStatusChange.newStatus}
                  </span>
                  ?
                </p>
                
                {pendingStatusChange.newStatus === 'CLOSED' && (
                  <p className="font-mono text-[10px] text-red-500 uppercase tracking-wider mb-6">
                    [WARNING]: Closing this job listing will stop accepting new applications immediately.
                  </p>
                )}
                {pendingStatusChange.newStatus === 'DRAFT' && (
                  <p className="font-mono text-[10px] text-amber-500 uppercase tracking-wider mb-6">
                    [NOTICE]: Setting this job to draft will hide it from the search registry.
                  </p>
                )}
                {pendingStatusChange.newStatus === 'ACTIVE' && (
                  <p className="font-mono text-[10px] text-green-500 uppercase tracking-wider mb-6">
                    [NOTICE]: Activating this job will make it public and indexable by candidates.
                  </p>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                  <button
                    onClick={cancelStatusChange}
                    className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 hover:border-fg bg-transparent text-fg px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider transition-all duration-300 cursor-pointer"
                  >
                    <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                    <span>CANCEL</span>
                  </button>
                  <button
                    onClick={confirmStatusChange}
                    className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 cursor-pointer"
                  >
                    <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                    <span>CHANGE STATUS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
