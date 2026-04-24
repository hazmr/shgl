import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useJobsData } from '../contexts/JobsDataContext';
import * as jobApplicationService from '../services/jobApplicationService';

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

    // Cleanup on unmount
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

        // Get job details from JobsDataContext
        const foundJob = getJobById(jobId);
        setJob(foundJob);

        // Fetch applications from backend
        const applicationsData = await jobApplicationService.getApplicationsByJob(jobId);
        console.log('[JobApplicants] Fetched applications:', applicationsData);

        // Transform backend data to match frontend format
        const transformedApplications = applicationsData.map(app => {
          const profile = app.userProfile;
          console.log('[JobApplicants] Profile data:', profile);

          // Helper function to convert Java byte array to base64
          const byteArrayToBase64 = (byteArray) => {
            if (!byteArray) return null;

            // If it's already a string (base64 or data URL), return it
            if (typeof byteArray === 'string') {
              return byteArray;
            }

            // If it's not an array, log and return null
            if (!Array.isArray(byteArray)) {
              console.warn('[JobApplicants] Expected array but got:', typeof byteArray, byteArray);
              return null;
            }

            if (byteArray.length === 0) return null;

            try {
              // Java bytes are signed (-128 to 127), convert to unsigned (0 to 255)
              const bytes = new Uint8Array(byteArray.map(b => b & 0xFF));

              // Convert to binary string
              let binary = '';
              const len = bytes.byteLength;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
              }

              // Convert to base64
              return btoa(binary);
            } catch (error) {
              console.error('[JobApplicants] Error converting byte array:', error);
              return null;
            }
          };

          // Convert byte array resume to base64 if exists
          let resumeBase64 = null;
          if (profile?.resume) {
            console.log('[JobApplicants] Resume data type:', typeof profile.resume, 'Length:', profile.resume?.length);
            const base64String = byteArrayToBase64(profile.resume);
            if (base64String) {
              // If it already has data URL prefix, use as is
              if (base64String.startsWith('data:')) {
                resumeBase64 = base64String;
              } else {
                resumeBase64 = `data:${profile.resumeType || 'application/pdf'};base64,${base64String}`;
              }
            }
          }

          // Convert byte array profile picture to base64 if exists
          let profilePictureBase64 = null;
          if (profile?.profilePicture) {
            console.log('[JobApplicants] Profile picture type:', typeof profile.profilePicture, 'Length:', profile.profilePicture?.length);
            const base64String = byteArrayToBase64(profile.profilePicture);
            if (base64String) {
              // If it already has data URL prefix, use as is
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
              status: app.status || 'PENDING'
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

      // Update local state
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Interview':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Hired':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.applicant.status.toLowerCase().replace(' ', '') === filter;
  });

  const statusCounts = {
    all: applications.length,
    applied: applications.filter(app => app.applicant.status === 'Applied').length,
    inreview: applications.filter(app => app.applicant.status === 'In Review').length,
    interview: applications.filter(app => app.applicant.status === 'Interview').length,
    hired: applications.filter(app => app.applicant.status === 'Hired').length,
    rejected: applications.filter(app => app.applicant.status === 'Rejected').length,
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div>
        <div>
          <div></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isEmployer) {
    return (
      <div>
        <div>
          <div>🚫</div>
          <h2>{!isAuthenticated ? 'Please Log In' : 'Access Denied'}</h2>
          <p>{!isAuthenticated ? 'You need to be logged in to view job applicants.' : 'This page is only available for employers.'}</p>
          <Link to="/">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div>
          <div></div>
          <p>Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <div>
          <div>❓</div>
          <h2>Job Not Found</h2>
          <p>The job you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/employer/jobs">
            Back to My Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
      {/* Background Elements */}
      <div>
        <div></div>
        <div></div>
      </div>

      <div>
        {/* Header */}
        <div>
          <Link to="/employer/jobs">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Jobs
          </Link>
          <h1>
            Job Applicants
          </h1>
          <p>
            {job.title} at {job.company}
          </p>
          <div>
            <span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
            <span>•</span>
            <span>{job.jobType}</span>
            <span>•</span>
            <span>Posted {getTimeAgo(job.postedDate)}</span>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div>
            <div>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {notification.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L12.732 4.5c-.77-.833-2.186-.833-2.954 0L2.857 16.5c-.77.833.192 2.5 1.732 2.5z" />
                )}
              </svg>
              {notification.message}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div>
          <div>
            {[
              { key: 'all', label: 'All Applications' },
              { key: 'applied', label: 'Applied' },
              { key: 'inreview', label: 'In Review' },
              { key: 'interview', label: 'Interview' },
              { key: 'hired', label: 'Hired' },
              { key: 'rejected', label: 'Rejected' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
               
              >
                {label} ({statusCounts[key]})
              </button>
            ))}
          </div>
        </div>

        {applications.length === 0 ? (
          <div>
            <div>📭</div>
            <h3>No Applications Yet</h3>
            <p>
              Your job posting is live! Applications will appear here once candidates start applying for this position.
            </p>
            <Link
              to={`/jobs/${job.id}`}
             
            >
              View Job Posting
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div>
            <div>🔍</div>
            <h3>No Applications Found</h3>
            <p>
              No applications match the selected filter.
            </p>
          </div>
        ) : (
          <div>
            {filteredApplications
              .sort((a, b) => new Date(b.applicant.appliedAt) - new Date(a.applicant.appliedAt))
              .map((application) => (
              <div
                key={application.applicationId}
               
              >
                <div>
                  <div>
                    <div>
                      <div>
                        <div>
                          <span>
                            {application.applicant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3>
                            {application.applicant.name}
                          </h3>
                          <p>{application.applicant.title}</p>
                          <p>{application.applicant.email}</p>
                          <div>
                            Applied {getTimeAgo(application.applicant.appliedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span>
                        {application.applicant.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div>
                      <label>
                        Update Status
                      </label>
                      <select
                        value={application.applicant.status}
                        onChange={(e) => handleStatusChange(application.applicationId, e.target.value)}
                       
                      >
                        <option value="Applied">Applied</option>
                        <option value="In Review">In Review</option>
                        <option value="Interview">Interview</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <button
                        onClick={() => {
                          setSelectedApplicant(application.applicant);
                          setShowContactModal(true);
                        }}
                       
                      >
                        Contact Applicant
                      </button>

                      <button
                        onClick={() => {
                          setSelectedApplicant(application.applicant);
                          setShowProfileModal(true);
                        }}
                       
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedApplicant && (
          <div
           
            style={{ zIndex: 10000 }}
            onClick={() => setShowContactModal(false)}
          >
            <div
             
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div>
                  <span>
                    {selectedApplicant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3>{selectedApplicant.name}</h3>
                <p>{selectedApplicant.title}</p>
              </div>

              <div>
                <div>
                  <div>
                    <div>Email</div>
                    <div>{selectedApplicant.email}</div>
                  </div>
                  <a
                    href={`mailto:${selectedApplicant.email}?subject=Regarding your application for ${job.title}`}
                   
                  >
                    Send Email
                  </a>
                </div>

                <div>
                  <div>
                    <div>Phone</div>
                    <div>{selectedApplicant.phone}</div>
                  </div>
                  <a
                    href={`tel:${selectedApplicant.phone}`}
                   
                  >
                    Call Now
                  </a>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowContactModal(false)}
                 
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Profile Modal - Render outside main container */}
      {showProfileModal && selectedApplicant && (
        <div
         
          style={{ zIndex: 10000 }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
           
            onClick={(e) => e.stopPropagation()}
          >
              {/* Close Button */}
              <button
                onClick={() => setShowProfileModal(false)}
               
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

            <div>
              <div>
                <div>
                  {selectedApplicant.profileImage ? (
                    <img
                      src={selectedApplicant.profileImage}
                      alt={selectedApplicant.name}
                     
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div>
                    <span>
                      {selectedApplicant.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <h3>{selectedApplicant.name}</h3>
                <p>{selectedApplicant.title}</p>
                <p>{selectedApplicant.location || 'Location not provided'}</p>
              </div>

              <div>
                {/* Bio */}
                <div>
                  <h4>About</h4>
                  <p>{selectedApplicant.bio}</p>
                </div>

                {/* Experience */}
                <div>
                  <h4>Experience</h4>
                  <p>{selectedApplicant.experience}</p>
                </div>

                {/* Resume */}
                <div>
                  <h4>Resume</h4>
                  {selectedApplicant.resume ? (
                    <div>
                      <div>
                        <div>
                          <div>
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <div>{selectedApplicant.name.replace(/\s+/g, '_')}_Resume.pdf</div>
                            <div>Click to view or download resume</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            try {
                              const base64Data = selectedApplicant.resume;

                              // Check if it's a valid base64 data URL
                              if (!base64Data || !base64Data.startsWith('data:application/pdf;base64,')) {
                                alert('Resume file is not available or in an invalid format.');
                                return;
                              }

                              // Extract the base64 string (remove data URL prefix)
                              const base64String = base64Data.split(',')[1];

                              // Convert base64 to bytes
                              const binaryString = atob(base64String);
                              const bytes = new Uint8Array(binaryString.length);
                              for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                              }

                              // Create blob and open in new tab
                              const blob = new Blob([bytes], { type: 'application/pdf' });
                              const blobUrl = URL.createObjectURL(blob);

                              // Open in new tab
                              const newTab = window.open(blobUrl, '_blank');
                              if (newTab) {
                                newTab.focus();
                                // Clean up the blob URL after a delay
                                setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                              } else {
                                // Fallback: trigger download if popup blocked
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
                         
                        >
                          View Resume
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>
                        <div>
                          <div>
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <div>No resume uploaded</div>
                            <div>Candidate has not provided a resume yet</div>
                          </div>
                        </div>
                        <div>
                          <div>💡 To test resume viewing:</div>
                          <div>
                            The test user "Alex Brown" has a sample PDF resume.<br/>
                            1. Apply for a job as Alex Brown<br/>
                            2. Login as employer to see the resume<br/>
                            3. Click "View Resume" to test the functionality
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Work Experience */}
                {selectedApplicant.workHistory && selectedApplicant.workHistory.length > 0 && (
                  <div>
                    <h4>Work Experience</h4>
                    <div>
                      {selectedApplicant.workHistory.map((work, index) => (
                        <div key={index}>
                          <div>
                            <div>
                              <h5>{work.position}</h5>
                              <p>{work.company}</p>
                            </div>
                            <span>
                              {work.startDate} - {work.current ? 'Present' : work.endDate}
                            </span>
                          </div>
                          {work.description && (
                            <p>{work.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {selectedApplicant.education && selectedApplicant.education.length > 0 && (
                  <div>
                    <h4>Education</h4>
                    <div>
                      {selectedApplicant.education.map((edu, index) => (
                        <div key={index}>
                          <div>
                            <div>
                              <h5>{edu.degree}</h5>
                              <p>{edu.institution}</p>
                            </div>
                            <span>{edu.year}</span>
                          </div>
                          {edu.description && (
                            <p>{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {selectedApplicant.portfolio && (
                  <div>
                    <h4>Portfolio</h4>
                    <a
                      href={selectedApplicant.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                     
                    >
                      {selectedApplicant.portfolio}
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}

                {/* Contact Info */}
                <div>
                  <h4>Contact Information</h4>
                  <div>
                    <div>
                      <span>Email:</span>
                      <span>{selectedApplicant.email}</span>
                    </div>
                    <div>
                      <span>Phone:</span>
                      <span>{selectedApplicant.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <a
                  href={`mailto:${selectedApplicant.email}?subject=Regarding your application for ${job.title}`}
                 
                >
                  Send Email
                </a>
                <button
                  onClick={() => setShowProfileModal(false)}
                 
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
    </>
  );
};

export default JobApplicants;