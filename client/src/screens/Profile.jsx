import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile as updateProfileApi, getProfilePictureUrl } from '../services/profileService';

const Profile = () => {
  const { user, updateProfile, updateProfileComplete, isJobSeeker, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    location: '',
    bio: '',
    experience: '',
    skills: [],
    portfolio: '',
    profileImage: null,
    resume: null,
    education: [],
    workHistory: []
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) return;

    if (!isJobSeeker) {
      navigate('/');
      return;
    }

    // Load profile data from backend every time user navigates to profile page
    const loadProfile = async () => {
      try {
        console.log('[Profile] Fetching profile data from backend');
        const profileData = await getProfile();

        if (profileData && profileData.id) {
          // Load profile picture if available
          let profileImageUrl = null;
          if (profileData.profilePictureName) {
            profileImageUrl = await getProfilePictureUrl();
          }

          const loadedFormData = {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.mobileNumber || '',
            title: profileData.jobTitle || '',
            location: profileData.location || '',
            bio: profileData.professionalBio || '',
            experience: profileData.experienceLevel || '',
            skills: [],
            portfolio: profileData.portfolioWebsite || '',
            profileImage: profileImageUrl,
            resume: profileData.resumeName ? 'Uploaded' : null,
            education: [],
            workHistory: []
          };

          setFormData(loadedFormData);
        } else {
          // No profile yet, use user basic data
          console.log('[Profile] No profile data found, using basic user data');
          const emptyFormData = {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.mobileNumber || '',
            title: '',
            location: '',
            bio: '',
            experience: '',
            skills: [],
            portfolio: '',
            profileImage: null,
            resume: null,
            education: [],
            workHistory: []
          };

          setFormData(emptyFormData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Initialize with user data if profile load fails
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.mobileNumber || '',
            title: '',
            location: '',
            bio: '',
            experience: '',
            skills: [],
            portfolio: '',
            profileImage: null,
            resume: null,
            education: [],
            workHistory: []
          });
        }
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user?.userId, isJobSeeker, navigate, authLoading]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (fieldName === 'profileImage' && !file.type.startsWith('image/')) {
        showNotification('Please upload a valid image file', 'error');
        return;
      }
      if (fieldName === 'resume' && file.type !== 'application/pdf') {
        showNotification('Please upload a PDF file for resume', 'error');
        return;
      }

      // Store the actual file for upload
      if (fieldName === 'profileImage') {
        setProfilePictureFile(file);
      } else if (fieldName === 'resume') {
        setResumeFile(file);
      }

      // Create preview URL for display
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [fieldName]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        degree: '',
        institution: '',
        year: '',
        description: ''
      }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addWorkHistory = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, {
        id: Date.now(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        current: false
      }]
    }));
  };

  const updateWorkHistory = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.map(work => 
        work.id === id ? { ...work, [field]: value } : work
      )
    }));
  };

  const removeWorkHistory = (id) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter(work => work.id !== id)
    }));
  };

  const validateProfile = () => {
    const required = ['name', 'email', 'phone', 'title', 'location', 'bio', 'experience'];
    const missing = required.filter(field => !formData[field]);

    if (missing.length > 0) {
      showNotification(`Please fill in: ${missing.join(', ')}`, 'error');
      return false;
    }

    if (!formData.resume) {
      showNotification('Please upload your resume', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfile()) return;

    setIsLoading(true);

    try {
      // Prepare profile data for backend
      const profileData = {
        jobTitle: formData.title,
        location: formData.location,
        experienceLevel: formData.experience,
        professionalBio: formData.bio,
        portfolioWebsite: formData.portfolio || null
      };

      // Call backend API
      const result = await updateProfileApi(
        profileData,
        profilePictureFile,
        resumeFile
      );

      if (result) {
        showNotification('Profile updated successfully!', 'success');

        // Reload profile picture if it was uploaded
        let updatedProfileImage = formData.profileImage;
        if (profilePictureFile) {
          updatedProfileImage = await getProfilePictureUrl();
        }

        // Update form data with new profile picture
        const updatedFormData = {
          ...formData,
          profileImage: updatedProfileImage,
          resume: result.resumeName ? 'Uploaded' : formData.resume
        };

        setFormData(updatedFormData);

        // Check if profile is now complete and update auth context
        const completeness = calculateProfileCompleteness(updatedFormData);
        const isComplete = completeness === 100;

        if (updateProfileComplete) {
          updateProfileComplete(isComplete);
          console.log('[Profile] Updated profileComplete flag to:', isComplete);
        }

        // Clear file states after successful upload
        setProfilePictureFile(null);
        setResumeFile(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.response?.data?.message || 'An error occurred while updating profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfileCompleteness = (data) => {
    let score = 0;

    // Helper function to check if a field has a meaningful value
    const hasValue = (value) => {
      return value && value !== '' && value !== null && value !== undefined;
    };

    // Basic fields (10 points each) - Total 60 points
    if (hasValue(data.name)) score += 10;
    if (hasValue(data.email)) score += 10;
    if (hasValue(data.phone)) score += 10;
    if (hasValue(data.title)) score += 10;
    if (hasValue(data.location)) score += 10;
    if (hasValue(data.bio)) score += 10;

    // Experience (10 points)
    if (hasValue(data.experience)) score += 10;

    // Portfolio is optional - not counted

    // Profile image (10 points) - REQUIRED
    if (hasValue(data.profileImage)) score += 10;

    // Resume (20 points) - REQUIRED
    if (hasValue(data.resume)) score += 20;

    return Math.min(100, score);
  };

  const completeness = calculateProfileCompleteness(formData);

  console.log('[FINAL COMPLETENESS DISPLAYED]', completeness);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'files', label: 'Files', icon: '📎' }
  ];

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

  return (
    <div>
      {/* Background Elements */}
      <div>
        <div></div>
        <div></div>
      </div>

      <div>
        {/* Header */}
        <div>
          <h1>
            My Profile
          </h1>
          <p>Complete your profile to start applying for jobs</p>

          {/* Progress Bar */}
          <div>
            <div>
              <span>Profile Completeness</span>
              <span>{completeness}%</span>
            </div>
            <div>
              <div
               
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
            {completeness < 100 && (
              <p>Complete your profile to apply for jobs</p>
            )}
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

        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
               
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div>
                <div>
                  <div>
                    <div>
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" />
                      ) : (
                        <div>
                          <span>
                            {formData.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <label>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'profileImage')}
                       
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <div>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                     
                      required
                    />
                  </div>

                  <div>
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                     
                      required
                    />
                  </div>

                  <div>
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                     
                      required
                    />
                  </div>

                  <div>
                    <label>Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                     
                      placeholder="e.g. Software Developer"
                      required
                    />
                  </div>

                  <div>
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                     
                      placeholder="e.g. San Francisco, CA"
                      required
                    />
                  </div>

                  <div>
                    <label>Experience Level *</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                     
                      required
                    >
                      <option value="">Select experience level</option>
                      <option value="Entry Level">Entry Level (0-2 years)</option>
                      <option value="Mid Level">Mid Level (2-5 years)</option>
                      <option value="Senior Level">Senior Level (5-8 years)</option>
                      <option value="Lead Level">Lead Level (8+ years)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label>Professional Bio *</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                   
                    placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                    required
                  />
                </div>

                <div>
                  <label>Portfolio/Website</label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                   
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div>
                <div>
                  <h3>Resume *</h3>
                  <div>
                    {formData.resume ? (
                      <div>
                        <div>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p>Resume uploaded successfully!</p>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const { getResumeUrl } = await import('../services/profileService');
                                const resumeUrl = await getResumeUrl();
                                if (resumeUrl) {
                                  // Open resume in new tab
                                  window.open(resumeUrl, '_blank');
                                } else {
                                  showNotification('Resume not found', 'error');
                                }
                              } catch (error) {
                                console.error('Error viewing resume:', error);
                                showNotification('Failed to load resume', 'error');
                              }
                            }}
                           
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Resume
                          </button>
                          <button
                            type="button"
                           
                          >
                            <label>
                              Upload New Resume
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileChange(e, 'resume')}
                               
                              />
                            </label>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p>Upload your resume (PDF only)</p>
                        <button
                          type="button"
                         
                        >
                          <label>
                            Choose Resume File
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileChange(e, 'resume')}
                             
                            />
                          </label>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3>Profile Picture</h3>
                  <div>
                    {formData.profileImage ? (
                      <div>
                        <img 
                          src={formData.profileImage} 
                          alt="Profile preview" 
                         
                        />
                        <button
                          type="button"
                         
                        >
                          <label>
                            Change Picture
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'profileImage')}
                             
                            />
                          </label>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <p>Upload a professional profile picture</p>
                        <button
                          type="button"
                         
                        >
                          <label>
                            Choose Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'profileImage')}
                             
                            />
                          </label>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
               
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;