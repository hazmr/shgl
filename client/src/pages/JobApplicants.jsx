import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobsData } from '../contexts/JobsDataContext';
import * as jobApplicationService from '../services/jobApplicationService';
import CornerAccents from '../components/CornerAccents';

const JobApplicants = () => {
  const { jobId } = useParams();
  const { getJobById } = useJobsData();
  const { isEmployer, isAuthenticated, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showProfileModal || showContactModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showProfileModal, showContactModal]);

  useEffect(() => {
    const loadJobAndApplications = async () => {
      if (!jobId || !isEmployer) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const foundJob = getJobById(jobId);
        setJob(foundJob);

        const applicationsData = await jobApplicationService.getApplicationsByJob(jobId);
        console.log('[JobApplicants] Fetched applications:', applicationsData);

        const transformedApplications = applicationsData.map(app => {
          const profile = app.userProfile;
          console.log('[JobApplicants] Profile data:', profile);

          const byteArrayToBase64 = (byteArray) => {
            if (!byteArray) return null;
            if (typeof byteArray === 'string') return byteArray;
            if (!Array.isArray(byteArray)) {
              console.warn('[JobApplicants] Expected array but got:', typeof byteArray, byteArray);
              return null;
            }
            if (byteArray.length === 0) return null;

            try {
              const bytes = new Uint8Array(byteArray.map(b => b & 0xFF));
              let binary = '';
              const len = bytes.byteLength;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              return btoa(binary);
            } catch (error) {
              console.error('[JobApplicants] Error converting byte array:', error);
              return null;
            }
          };

          let resumeBase64 = null;
          if (profile?.resume) {
            const base64String = byteArrayToBase64(profile.resume);
            if (base64String) {
              if (base64String.startsWith('data:')) {
                resumeBase64 = base64String;
              } else {
                resumeBase64 = `data:${profile.resumeType || 'application/pdf'};base64,${base64String}`;
              }
            }
          }

          let profilePictureBase64 = null;
          if (profile?.profilePicture) {
            const base64String = byteArrayToBase64(profile.profilePicture);
            if (base64String) {
              if (base64String.startsWith('data:')) {
                profilePictureBase64 = base64String;
              } else {
                profilePictureBase64 = `data:${profile.profilePictureType || 'image/jpeg'};base64,${base64String}`;
              }
            }
          }

          return {
            applicationId: app.id,
            applicant: {
              name: app.userName,
              email: app.userEmail,
              title: profile?.jobTitle || 'Not specified',
              phone: app.userMobileNumber || 'Not provided',
              location: profile?.location || 'Not specified',
              bio: profile?.professionalBio || 'No bio available',
              experience: profile?.experienceLevel || 'No experience provided',
              resume: resumeBase64,
              profileImage: profilePictureBase64,
              portfolio: profile?.portfolioWebsite || null,
              appliedAt: app.appliedAt,
              status: app.status || 'PENDING',
              workHistory: profile?.workHistory || [],
              education: profile?.education || []
            }
          };
        });

        console.log('[JobApplicants] Transformed applications:', transformedApplications);
        setApplications(transformedApplications);
      } catch (error) {
        console.error('[JobApplicants] Error loading job applications:', error);
        showNotification('Failed to load applications', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadJobAndApplications();
  }, [jobId, isEmployer, getJobById]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await jobApplicationService.updateApplicationStatus(applicationId, newStatus);

      setApplications(prev =>
        prev.map(app =>
          app.applicationId === applicationId
            ? { ...app, applicant: { ...app.applicant, status: newStatus } }
            : app
        )
      );

      showNotification('Application status updated successfully!');
    } catch (error) {
      console.error('Error updating application status:', error);
      showNotification('Failed to update application status', 'error');
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'recently';
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
      case 'Applied':
      case 'PENDING':
        return 'border border-blue-500/30 text-blue-500 bg-blue-500/5';
      case 'In Review':
      case 'IN_REVIEW':
        return 'border border-yellow-500/30 text-yellow-500 bg-yellow-500/5';
      case 'Interview':
      case 'INTERVIEW':
        return 'border border-purple-500/30 text-purple-500 bg-purple-500/5';
      case 'Rejected':
      case 'REJECTED':
        return 'border border-red-500/30 text-red-500 bg-red-500/5';
      case 'Hired':
      case 'HIRED':
        return 'border border-green-500/30 text-green-500 bg-green-500/5';
      default:
        return 'border border-fg/20 text-fg/70 bg-fg/5';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    const cleanStatus = app.applicant.status.toLowerCase().replace('_', '').replace(' ', '');
    const cleanFilter = filter.toLowerCase().replace('_', '').replace(' ', '');
    return cleanStatus === cleanFilter;
  });

  const statusCounts = {
    all: applications.length,
    applied: applications.filter(app => ['Applied', 'PENDING'].includes(app.applicant.status)).length,
    inreview: applications.filter(app => ['In Review', 'IN_REVIEW'].includes(app.applicant.status)).length,
    interview: applications.filter(app => ['Interview', 'INTERVIEW'].includes(app.applicant.status)).length,
    hired: applications.filter(app => ['Hired', 'HIRED'].includes(app.applicant.status)).length,
    rejected: applications.filter(app => ['Rejected', 'REJECTED'].includes(app.applicant.status)).length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECECEC] dark:bg-[#0A0A0B] relative">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-8 h-8 border-2 border-fg border-t-transparent animate-spin"></div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#8C8C8E]">AUTHENTICATING...</p>
        </div>
      </div>
    );
  }

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
            {!isAuthenticated ? 'You need to be logged in to view job applicants.' : 'This page is only available for employers.'}
          </p>
          <Link
            to="/"
            className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 w-full"
          >
            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
            <span>RETURN HOME</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECECEC] dark:bg-[#0A0A0B] relative">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-8 h-8 border-2 border-fg border-t-transparent animate-spin"></div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#8C8C8E]">RETRIEVING CANDIDATES...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECECEC] dark:bg-[#0A0A0B] px-4 transition-colors duration-300 relative">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="w-full max-w-md border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-10 transition-all duration-300 relative group text-center">
          <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
          <div className="text-3xl mb-4 text-[#8C8C8E]">❓</div>
          <h2 className="text-2xl font-bold font-sans uppercase mb-4 text-fg">
            Job Not Found
          </h2>
          <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] mb-6 uppercase tracking-wider leading-relaxed">
            The job you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            to="/employer/jobs"
            className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 w-full"
          >
            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
            <span>BACK TO MY JOBS</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECECEC] dark:bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/employer/jobs"
            className="group/link inline-flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-wider text-fg/60 hover:text-fg transition-colors"
          >
            <span className="inline-block transition-transform duration-300 group-hover/link:-translate-x-1">←</span>
            <span>Back to My Jobs</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 pb-6 mb-8">
          <div className="text-[10px] font-bold font-mono text-[#8C8C8E] uppercase tracking-wider mb-2">
            // EMPLOYER_PORTAL / APPLICANTS_REGISTRY
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans uppercase text-fg tracking-tight mb-2">
            Job Applicants
          </h1>
          <p className="text-sm font-mono text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider mb-4">
            {job.title} <span className="text-fg/30">•</span> {job.company}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-mono uppercase text-[#8C8C8E] tracking-wider">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
            <span>/</span>
            <span>{job.jobType}</span>
            <span>/</span>
            <span>Posted {getTimeAgo(job.postedDate)}</span>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div className={`p-4 mb-6 border flex items-start gap-3 transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-fg/5 border-fg/15 text-fg' 
              : 'bg-red-500/10 border-red-500/35 text-red-500'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {notification.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
            <span className="text-xs font-mono uppercase tracking-wider">{notification.message}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-2 mb-8 flex flex-wrap gap-1">
          {[
            { key: 'all', label: 'ALL APPLICATIONS' },
            { key: 'applied', label: 'APPLIED' },
            { key: 'inreview', label: 'IN REVIEW' },
            { key: 'interview', label: 'INTERVIEW' },
            { key: 'hired', label: 'HIRED' },
            { key: 'rejected', label: 'REJECTED' }
          ].map(({ key, label }) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`relative px-4 py-2 font-mono text-[10px] font-bold tracking-wider transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B]' 
                    : 'text-fg/60 hover:text-fg hover:bg-fg/5'
                }`}
              >
                {isActive && <CornerAccents className="opacity-100" />}
                {label} ({statusCounts[key]})
              </button>
            );
          })}
        </div>

        {/* Applicant Listings */}
        {applications.length === 0 ? (
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-16 text-center relative group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <div className="max-w-md mx-auto py-8">
              <div className="text-3xl text-fg/40 mb-4 font-mono">// EMPTY</div>
              <h3 className="text-xl font-bold uppercase text-fg font-sans tracking-wide mb-2">No Applications Yet</h3>
              <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider leading-relaxed mb-6">
                Your job posting is live! Applications will appear here once candidates start applying.
              </p>
              <Link
                to={`/jobs/${job.id}`}
                className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
              >
                <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                <span>VIEW JOB POSTING</span>
              </Link>
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-16 text-center relative group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            <div className="max-w-md mx-auto py-8">
              <div className="text-3xl text-fg/40 mb-4 font-mono">// NULL_RESULT</div>
              <h3 className="text-xl font-bold uppercase text-fg font-sans tracking-wide mb-2">No Applications Found</h3>
              <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider leading-relaxed">
                No applications match the selected filter.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredApplications
              .sort((a, b) => new Date(b.applicant.appliedAt) - new Date(a.applicant.appliedAt))
              .map((application) => (
                <div
                  key={application.applicationId}
                  className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 transition-all duration-300 relative group flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <CornerAccents className="text-fg/15 group-hover:text-fg/40" />
                  
                  <div className="flex items-start gap-4">
                    {/* Applicant Avatar Placeholder */}
                    <div className="w-14 h-14 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 flex items-center justify-center bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 font-mono text-lg font-bold text-fg flex-shrink-0 relative overflow-hidden">
                      {application.applicant.profileImage ? (
                        <img 
                          src={application.applicant.profileImage} 
                          alt={application.applicant.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{application.applicant.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold uppercase text-fg font-sans tracking-wide">
                        {application.applicant.name}
                      </h3>
                      <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider mt-0.5">
                        {application.applicant.title}
                      </p>
                      <p className="font-mono text-[10px] text-fg/60 mt-1">
                        {application.applicant.email}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="font-mono text-[10px] text-fg/40 uppercase tracking-widest">APPLIED:</span>
                        <span className="font-mono text-[10px] text-fg/70 uppercase tracking-wider bg-fg/5 px-2 py-0.5 border border-fg/5">
                          {getTimeAgo(application.applicant.appliedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:self-stretch md:justify-end">
                    {/* Status Dropdown Indicator */}
                    <div className="flex flex-col gap-1 min-w-[140px]">
                      <span className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider">// SET_STATUS</span>
                      <div className="relative">
                        <select
                          value={application.applicant.status}
                          onChange={(e) => handleStatusChange(application.applicationId, e.target.value)}
                          className="w-full border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent p-2 pr-8 font-mono text-xs uppercase text-fg focus:outline-none focus:border-fg appearance-none cursor-pointer"
                        >
                          <option value="Applied">Applied</option>
                          <option value="In Review">In Review</option>
                          <option value="Interview">Interview</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-fg">
                          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Current Status Badge */}
                    <div className="flex flex-col gap-1 justify-center">
                      <span className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider">// CURRENT</span>
                      <span className={`px-3 py-2 font-mono text-[10px] font-bold tracking-wider text-center uppercase ${getStatusBadgeClass(application.applicant.status)}`}>
                        {application.applicant.status}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:self-end">
                      <button
                        onClick={() => {
                          setSelectedApplicant(application.applicant);
                          setShowContactModal(true);
                        }}
                        className="group/abtn relative inline-flex items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-fg hover:text-surface transition-all duration-300 min-h-[36px]"
                      >
                        <CornerAccents className="opacity-0 group-hover/abtn:opacity-100" />
                        <span>CONTACT</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedApplicant(application.applicant);
                          setShowProfileModal(true);
                        }}
                        className="group/abtn relative inline-flex items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 min-h-[36px]"
                      >
                        <CornerAccents className="opacity-0 group-hover/abtn:opacity-100" />
                        <span>VIEW PROFILE</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedApplicant && (
          <div
            className="fixed inset-0 bg-[#0A0A0B]/60 dark:bg-[#0A0A0B]/85 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={() => setShowContactModal(false)}
          >
            <div
              className="w-full max-w-md border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-10 transition-all duration-300 relative group"
              onClick={(e) => e.stopPropagation()}
            >
              <CornerAccents className="text-fg/30" />
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 flex items-center justify-center bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 font-mono text-xl font-bold text-fg mx-auto mb-3">
                  {selectedApplicant.profileImage ? (
                    <img 
                      src={selectedApplicant.profileImage} 
                      alt={selectedApplicant.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{selectedApplicant.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <h3 className="text-xl font-bold uppercase text-fg font-sans tracking-wide">{selectedApplicant.name}</h3>
                <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider mt-1">{selectedApplicant.title}</p>
              </div>

              <div className="space-y-4 mb-6">
                {/* Email Section */}
                <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider">// EMAIL</div>
                    <div className="font-mono text-xs text-fg break-all mt-0.5">{selectedApplicant.email}</div>
                  </div>
                  <a
                    href={`mailto:${selectedApplicant.email}?subject=Regarding your application for ${job.title}`}
                    className="group/mbtn relative inline-flex items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 text-center whitespace-nowrap"
                  >
                    <CornerAccents className="opacity-0 group-hover/mbtn:opacity-100" />
                    <span>SEND EMAIL</span>
                  </a>
                </div>

                {/* Phone Section */}
                <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider">// PHONE</div>
                    <div className="font-mono text-xs text-fg mt-0.5">{selectedApplicant.phone}</div>
                  </div>
                  <a
                    href={`tel:${selectedApplicant.phone}`}
                    className="group/mbtn relative inline-flex items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-fg hover:text-surface transition-all duration-300 text-center whitespace-nowrap"
                  >
                    <CornerAccents className="opacity-0 group-hover/mbtn:opacity-100" />
                    <span>CALL NOW</span>
                  </a>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-full group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>CLOSE WINDOW</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && selectedApplicant && (
          <div
            className="fixed inset-0 bg-[#0A0A0B]/60 dark:bg-[#0A0A0B]/85 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={() => setShowProfileModal(false)}
          >
            <div
              className="w-full max-w-2xl border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-10 transition-all duration-300 relative group overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <CornerAccents className="text-fg/30" />

              {/* Close Button top corner */}
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-2 text-fg/60 hover:text-fg font-mono text-[10px] uppercase tracking-widest flex items-center gap-1"
              >
                <span>[X] CLOSE</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-start border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-6 mb-6 mt-4">
                <div className="w-20 h-20 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 flex items-center justify-center bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 font-mono text-2xl font-bold text-fg flex-shrink-0 relative overflow-hidden">
                  {selectedApplicant.profileImage ? (
                    <img 
                      src={selectedApplicant.profileImage} 
                      alt={selectedApplicant.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{selectedApplicant.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase text-fg font-sans tracking-wide">{selectedApplicant.name}</h3>
                  <p className="font-mono text-sm text-fg/70 uppercase tracking-wider mt-1">{selectedApplicant.title}</p>
                  <p className="font-mono text-[11px] text-[#8C8C8E] uppercase tracking-wider mt-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedApplicant.location || 'Location not provided'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* About Bio */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-widest mb-2">// 01. PROFESSIONAL_SUMMARY</h4>
                  <p className="text-sm text-fg/80 font-mono tracking-wide leading-relaxed bg-fg/5 p-4 border border-fg/5">
                    {selectedApplicant.bio}
                  </p>
                </div>

                {/* Experience Summary */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-widest mb-2">// 02. EXPERIENCE_OVERVIEW</h4>
                  <p className="text-sm text-fg/80 font-mono tracking-wide leading-relaxed bg-fg/5 p-4 border border-fg/5">
                    {selectedApplicant.experience}
                  </p>
                </div>

                {/* Resume Download */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-widest mb-2">// 03. CURRICULUM_VITAE</h4>
                  {selectedApplicant.resume ? (
                    <div className="border border-fg/10 bg-fg/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 border border-fg/10 bg-surface text-fg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-mono text-xs text-fg font-bold uppercase tracking-wider">{selectedApplicant.name.replace(/\s+/g, '_')}_Resume.pdf</div>
                          <div className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider mt-0.5">Click to view/download system PDF</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          try {
                            const base64Data = selectedApplicant.resume;
                            if (!base64Data || !base64Data.startsWith('data:application/pdf;base64,')) {
                              alert('Resume file is not available or in an invalid format.');
                              return;
                            }
                            const base64String = base64Data.split(',')[1];
                            const binaryString = atob(base64String);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                              bytes[i] = binaryString.charCodeAt(i);
                            }
                            const blob = new Blob([bytes], { type: 'application/pdf' });
                            const blobUrl = URL.createObjectURL(blob);
                            const newTab = window.open(blobUrl, '_blank');
                            if (newTab) {
                              newTab.focus();
                              setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                            } else {
                              const downloadLink = document.createElement('a');
                              downloadLink.href = blobUrl;
                              downloadLink.download = `${selectedApplicant.name.replace(/\s+/g, '_')}_Resume.pdf`;
                              downloadLink.click();
                              URL.revokeObjectURL(blobUrl);
                            }
                          } catch (error) {
                            console.error('Error opening resume:', error);
                            alert('Sorry, there was an error opening the resume. The file may be corrupted or in an unsupported format.');
                          }
                        }}
                        className="group/btn relative inline-flex items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
                      >
                        <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                        <span>OPEN RESUME</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border border-red-500/20 bg-red-500/5 p-4">
                      <div className="font-mono text-xs text-red-500 uppercase tracking-wider font-bold">No Resume Uploaded</div>
                      <div className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider mt-1">Candidate has not provided a PDF resume yet.</div>
                    </div>
                  )}
                </div>

                {/* Work History */}
                {selectedApplicant.workHistory && selectedApplicant.workHistory.length > 0 && (
                  <div>
                    <h4 className="font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-widest mb-2">// 04. EXPERIENCE_LOG</h4>
                    <div className="space-y-4">
                      {selectedApplicant.workHistory.map((work, index) => (
                        <div key={index} className="border border-fg/10 p-4 bg-fg/5 relative">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-fg/10 pb-2 mb-2">
                            <div>
                              <h5 className="font-sans text-sm font-bold uppercase text-fg">{work.position}</h5>
                              <p className="font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider">{work.company}</p>
                            </div>
                            <span className="font-mono text-[9px] text-fg/60 uppercase tracking-widest bg-fg/10 px-2 py-0.5">
                              {work.startDate} - {work.current ? 'Present' : work.endDate}
                            </span>
                          </div>
                          {work.description && (
                            <p className="font-mono text-xs text-fg/80 leading-relaxed whitespace-pre-line">{work.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Log */}
                {selectedApplicant.education && selectedApplicant.education.length > 0 && (
                  <div>
                    <h4 className="font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-widest mb-2">// 05. ACADEMIC_LOG</h4>
                    <div className="space-y-4">
                      {selectedApplicant.education.map((edu, index) => (
                        <div key={index} className="border border-fg/10 p-4 bg-fg/5 relative">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-fg/10 pb-2 mb-2">
                            <div>
                              <h5 className="font-sans text-sm font-bold uppercase text-fg">{edu.degree}</h5>
                              <p className="font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider">{edu.institution}</p>
                            </div>
                            <span className="font-mono text-[9px] text-fg/60 uppercase tracking-widest bg-fg/10 px-2 py-0.5">{edu.year}</span>
                          </div>
                          {edu.description && (
                            <p className="font-mono text-xs text-fg/80 leading-relaxed whitespace-pre-line">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {selectedApplicant.portfolio && (
                  <div>
                    <h4 className="font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-widest mb-2">// 06. PORTFOLIO_EXTERNAL</h4>
                    <a
                      href={selectedApplicant.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/pfol inline-flex items-center gap-2 border border-fg/15 p-3 font-mono text-xs text-fg hover:border-fg transition-all duration-300 w-full"
                    >
                      <span className="flex-1 truncate">{selectedApplicant.portfolio}</span>
                      <span className="transition-transform duration-300 group-hover/pfol:translate-x-0.5">↗</span>
                    </a>
                  </div>
                )}

                {/* Contact Info Footer */}
                <div className="border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-6">
                  <h4 className="font-mono text-[10px] font-bold text-[#8C8C8E] uppercase tracking-widest mb-2">// 07. DIRECT_CONTACT</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="font-mono text-xs">
                      <span className="text-[#8C8C8E] uppercase mr-2">Email:</span>
                      <span className="text-fg font-bold">{selectedApplicant.email}</span>
                    </div>
                    <div className="font-mono text-xs">
                      <span className="text-[#8C8C8E] uppercase mr-2">Phone:</span>
                      <span className="text-fg font-bold">{selectedApplicant.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-6 mt-8">
                <a
                  href={`mailto:${selectedApplicant.email}?subject=Regarding your application for ${job.title}`}
                  className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>EMAIL CANDIDATE</span>
                </a>
                
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-fg hover:text-surface transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>CLOSE PROFILE</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicants;