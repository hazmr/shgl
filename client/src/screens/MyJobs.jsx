"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useJobsData } from '../contexts/JobsDataContext';
import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';

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
      <div>
        <div>
          <h2>
            Access Denied
          </h2>
          <p>
            You must be logged in as an employer to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        {/* Header */}
        <div>
          <h1>
            My Posted Jobs
          </h1>
          <p>
            Manage your job postings and update their status
          </p>
        </div>

        {/* Company Info */}
        {companyInfo && (
          <div>
            <div>
              <div>
                {companyInfo.logo ? (
                  <img
                    src={companyInfo.logo}
                    alt={companyInfo.name}
                   
                  />
                ) : (
                  <span>
                    {companyInfo.name?.charAt(0) || 'C'}
                  </span>
                )}
              </div>
              <div>
                <h2>
                  {companyInfo.name}
                </h2>
                <p>
                  Company Jobs Dashboard • {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Posted
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div>
            {success}
          </div>
        )}
        {error && (
          <div>
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div>
            <div></div>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State */
          <div>
            <div>
              <svg
               
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3>
                No jobs posted yet
              </h3>
              <p>
                Start by posting your first job to attract talented candidates.
              </p>
              <Link
                href="/employer/post-job"
               
              >
                Post a Job
              </Link>
            </div>
          </div>
        ) : (
          /* Jobs Table */
          <div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>
                      Job Title
                    </th>
                    <th>
                      Location
                    </th>
                    <th>
                      Type
                    </th>
                    <th>
                      Salary
                    </th>
                    <th>
                      Applicants
                    </th>
                    <th>
                      Posted
                    </th>
                    <th>
                      Status
                    </th>
                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                     
                    >
                      {/* Job Title */}
                      <td>
                        <div>
                          <h3>
                            {job.title}
                          </h3>
                          <p>
                            {job.category}
                          </p>
                        </div>
                      </td>

                      {/* Location */}
                      <td>
                        <div>
                          {job.location}
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <div>
                          <span>
                            {job.workType}
                          </span>
                          <span>
                            {job.experienceLevel}
                          </span>
                        </div>
                      </td>

                      {/* Salary */}
                      <td>
                        <div>
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                        </div>
                        <div>
                          per {job.salaryPeriod}
                        </div>
                      </td>

                      {/* Applicants */}
                      <td>
                        <div>
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>
                            {job.applicationsCount || 0}
                          </span>
                        </div>
                      </td>

                      {/* Posted */}
                      <td>
                        <div>
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {getTimeAgo(job.postedDate)}
                        </div>
                      </td>

                      {/* Status Buttons */}
                      <td>
                        <div>
                          <button
                            onClick={() => handleStatusChange(job.id, 'ACTIVE')}
                            disabled={updatingJobId === job.id || job.status === 'ACTIVE'}
                            title="Set to Active"
                           
                          >
                            A
                          </button>
                          <button
                            onClick={() => handleStatusChange(job.id, 'CLOSED')}
                            disabled={updatingJobId === job.id || job.status === 'CLOSED'}
                            title="Set to Closed"
                           
                          >
                            C
                          </button>
                          <button
                            onClick={() => handleStatusChange(job.id, 'DRAFT')}
                            disabled={updatingJobId === job.id || job.status === 'DRAFT'}
                            title="Set to Draft"
                           
                          >
                            D
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div>
                          <Link
                            href={`/job-applicants/${job.id}`}
                           
                            title="View Applicants"
                          >
                            Applicants
                          </Link>
                          <Link
                              href={`/jobs/${job.id}`}
                           
                            title="View Job Details"
                          >
                            View
                          </Link>
                        </div>
                      </td>

                      {/* Loading Overlay for Row */}
                      {updatingJobId === job.id && (
                        <td colSpan="8">
                          <div>
                            <div>
                              <div></div>
                              <span>Updating...</span>
                            </div>
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
          <div>
            <div>
              <div>
                <div>
                  <svg
                   
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3>
                  Confirm Status Change
                </h3>
                <p>
                  Are you sure you want to change this job status to{' '}
                  <span>
                    {pendingStatusChange.newStatus}
                  </span>
                  ?
                </p>
                {pendingStatusChange.newStatus === 'CLOSED' && (
                  <p>
                    Closing this job will stop accepting new applications.
                  </p>
                )}
                {pendingStatusChange.newStatus === 'DRAFT' && (
                  <p>
                    Setting to draft will hide this job from job seekers.
                  </p>
                )}
                {pendingStatusChange.newStatus === 'ACTIVE' && (
                  <p>
                    Activating this job will make it visible to job seekers.
                  </p>
                )}
              </div>

              <div>
                <button
                  onClick={cancelStatusChange}
                 
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                 
                >
                  Yes, Change Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
