import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile as updateProfileApi, getProfilePictureUrl } from '../services/profileService';
import CornerAccents from '../components/CornerAccents';

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
    if (authLoading) return;

    if (!isJobSeeker) {
      navigate('/');
      return;
    }

    const loadProfile = async () => {
      try {
        console.log('[Profile] Fetching profile data from backend');
        const profileData = await getProfile();

        if (profileData && profileData.id) {
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

      if (fieldName === 'profileImage') {
        setProfilePictureFile(file);
      } else if (fieldName === 'resume') {
        setResumeFile(file);
      }

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
      const profileData = {
        jobTitle: formData.title,
        location: formData.location,
        experienceLevel: formData.experience,
        professionalBio: formData.bio,
        portfolioWebsite: formData.portfolio || null
      };

      const result = await updateProfileApi(
        profileData,
        profilePictureFile,
        resumeFile
      );

      if (result) {
        showNotification('Profile updated successfully!', 'success');

        let updatedProfileImage = formData.profileImage;
        if (profilePictureFile) {
          updatedProfileImage = await getProfilePictureUrl();
        }

        const updatedFormData = {
          ...formData,
          profileImage: updatedProfileImage,
          resume: result.resumeName ? 'Uploaded' : formData.resume
        };

        setFormData(updatedFormData);

        const completeness = calculateProfileCompleteness(updatedFormData);
        const isComplete = completeness === 100;

        if (updateProfileComplete) {
          updateProfileComplete(isComplete);
          console.log('[Profile] Updated profileComplete flag to:', isComplete);
        }

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

    const hasValue = (value) => {
      return value && value !== '' && value !== null && value !== undefined;
    };

    if (hasValue(data.name)) score += 10;
    if (hasValue(data.email)) score += 10;
    if (hasValue(data.phone)) score += 10;
    if (hasValue(data.title)) score += 10;
    if (hasValue(data.location)) score += 10;
    if (hasValue(data.bio)) score += 10;

    if (hasValue(data.experience)) score += 10;

    if (hasValue(data.profileImage)) score += 10;

    if (hasValue(data.resume)) score += 20;

    return Math.min(100, score);
  };

  const completeness = calculateProfileCompleteness(formData);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '// BASIC_DETAILS' },
    { id: 'files', label: 'Files & Uploads', icon: '// ATTACHMENTS' }
  ];

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-10 group mb-8">
          <CornerAccents className="text-fg/30" />
          <div className="h-4 w-40 bg-fg/10 animate-pulse mb-4" />
          <div className="h-8 w-2/3 bg-fg/10 animate-pulse mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-[10px] text-[#8C8C8E] uppercase tracking-wider mb-6">
        <Link to="/" className="hover:text-fg transition-colors duration-200">HOME</Link>
        <span>/</span>
        <span className="text-fg">MY PROFILE</span>
      </nav>

      {/* Hero card */}
      <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-8 lg:p-10 mb-8 transition-all duration-300 group">
        <CornerAccents className="text-fg/30 group-hover:text-fg/50" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start relative z-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">
              // PROFILE_CONTROL_PANEL
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold font-sans text-fg uppercase tracking-tight mb-2">
              My Profile
            </h1>
            <p className="font-mono text-xs sm:text-sm text-secondary leading-relaxed max-w-2xl">
              Keep your credentials and work status updated to apply to active quantitative roles in the portal database.
            </p>
          </div>

          {/* Progress gauge */}
          <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-5">
            <div className="flex justify-between items-center mb-2 font-mono text-[10px] font-bold text-fg uppercase">
              <span>COMPLETENESS</span>
              <span>{completeness}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#0A0A0B]/10 dark:bg-[#ECECEC]/10 relative">
              <div
                className="h-full bg-fg transition-all duration-500 ease-out"
                style={{ width: `${completeness}%` }}
              />
            </div>
            {completeness < 100 && (
              <p className="font-mono text-[9px] text-red-500 mt-2 uppercase tracking-wide">
                * Upload resume & profile picture to unlock applications.
              </p>
            )}
          </div>
        </div>

        {/* Alerts banner */}
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

      {/* Main Profile Form panel */}
      <form onSubmit={handleSubmit}>
        {/* Tabs Control */}
        <section className="mb-6">
          <nav className="flex flex-wrap gap-2 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-2">
            {tabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group/tab relative inline-flex min-h-10 items-center justify-center border px-4 font-mono text-xs uppercase font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                    selected
                      ? "border-fg bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B]"
                      : "border-transparent bg-transparent text-muted hover:text-fg"
                  }`}
                >
                  <CornerAccents className="opacity-0 group-hover/tab:opacity-100" />
                  <span>{tab.icon} {tab.label}</span>
                </button>
              );
            })}
          </nav>
        </section>

        {/* Active Tab Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start mb-8">
          {/* Left panel - Inputs */}
          <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 lg:p-8 group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
                  <h3 className="font-mono text-xs uppercase font-bold text-fg">
                    // ACCOUNT_INFORMATION
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full name */}
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] p-2 transition-all duration-300">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] block mb-1">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none text-fg font-mono text-xs focus:ring-0 focus:outline-none p-0"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] p-2 transition-all duration-300">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] block mb-1">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none text-fg font-mono text-xs focus:ring-0 focus:outline-none p-0"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] p-2 transition-all duration-300">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] block mb-1">
                      CONTACT PHONE *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none text-fg font-mono text-xs focus:ring-0 focus:outline-none p-0"
                      required
                    />
                  </div>

                  {/* Job title */}
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] p-2 transition-all duration-300">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] block mb-1">
                      JOB TITLE *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. SOFTWARE DEVELOPER"
                      className="w-full bg-transparent border-none text-fg font-mono text-xs focus:ring-0 focus:outline-none p-0 placeholder:text-muted/60"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] p-2 transition-all duration-300">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] block mb-1">
                      LOCATION / REGION *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. LONDON, UK"
                      className="w-full bg-transparent border-none text-fg font-mono text-xs focus:ring-0 focus:outline-none p-0 placeholder:text-muted/60"
                      required
                    />
                  </div>

                  {/* Experience */}
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] p-2 transition-all duration-300">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] block mb-1">
                      EXPERIENCE LEVEL *
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none text-fg font-mono text-xs focus:ring-0 focus:outline-none p-0 cursor-pointer"
                      required
                    >
                      <option value="" className="bg-elevated text-fg">SELECT LEVEL</option>
                      <option value="Entry Level" className="bg-elevated text-fg">ENTRY LEVEL (0-2 YRS)</option>
                      <option value="Mid Level" className="bg-elevated text-fg">MID LEVEL (2-5 YRS)</option>
                      <option value="Senior Level" className="bg-elevated text-fg">SENIOR LEVEL (5-8 YRS)</option>
                      <option value="Lead Level" className="bg-elevated text-fg">LEAD LEVEL (8+ YRS)</option>
                    </select>
                  </div>
                </div>

                {/* Professional bio */}
                <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] p-2 transition-all duration-300">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] block mb-1">
                    PROFESSIONAL BIO *
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell us about yourself, your quantitative focus, and tech stack stack stack..."
                    className="w-full bg-transparent border-none text-fg font-sans text-xs focus:ring-0 focus:outline-none p-0 placeholder:text-muted/60 resize-y"
                    required
                  />
                </div>

                {/* Portfolio website */}
                <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#FFFFFF] dark:bg-[#18181B] p-2 transition-all duration-300">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E] block mb-1">
                    PORTFOLIO WEBSITE / LINK
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-transparent border-none text-fg font-mono text-xs focus:ring-0 focus:outline-none p-0 placeholder:text-muted/60"
                  />
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-8">
                {/* Resume block */}
                <div>
                  <div className="border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
                    <h3 className="font-mono text-xs uppercase font-bold text-fg">
                      // RESUME_SPECIFICATION *
                    </h3>
                  </div>

                  <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 p-6 bg-[#0A0A0B]/2 dark:bg-[#ECECEC]/2">
                    {formData.resume ? (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <svg className="h-8 w-8 text-fg shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="font-mono text-xs font-bold text-fg">RESUME_ATTACHMENT_VERIFIED</p>
                            <p className="font-mono text-[9px] text-[#8C8C8E] uppercase">STATUS: ACTIVE IN PORTAL DB</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const { getResumeUrl } = await import('../services/profileService');
                                const resumeUrl = await getResumeUrl();
                                if (resumeUrl) {
                                  window.open(resumeUrl, '_blank');
                                } else {
                                  showNotification('Resume not found', 'error');
                                }
                              } catch (error) {
                                console.error('Error viewing resume:', error);
                                showNotification('Failed to load resume', 'error');
                              }
                            }}
                            className="group/ebtn relative inline-flex h-9 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-fg hover:border-fg transition-all duration-300 cursor-pointer"
                          >
                            <CornerAccents className="opacity-0 group-hover/ebtn:opacity-100" />
                            <span>View PDF</span>
                          </button>

                          <button
                            type="button"
                            className="group/ebtn relative inline-flex h-9 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-fg hover:border-fg transition-all duration-300 cursor-pointer"
                          >
                            <CornerAccents className="opacity-0 group-hover/ebtn:opacity-100" />
                            <label className="cursor-pointer">
                              Upload New
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileChange(e, 'resume')}
                                className="hidden"
                              />
                            </label>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg className="h-10 w-10 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="font-mono text-xs text-secondary mb-4 uppercase">Upload Résumé (PDF ONLY • MAX 5MB)</p>
                        <button
                          type="button"
                          className="group/ebtn relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 cursor-pointer"
                        >
                          <CornerAccents className="opacity-0 group-hover/ebtn:opacity-100" />
                          <label className="cursor-pointer">
                            Choose PDF File
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileChange(e, 'resume')}
                              className="hidden"
                            />
                          </label>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile image block */}
                <div>
                  <div className="border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-4 mb-4">
                    <h3 className="font-mono text-xs uppercase font-bold text-fg">
                      // PROFILE_IMAGE_UPLOAD
                    </h3>
                  </div>

                  <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 p-6 bg-[#0A0A0B]/2 dark:bg-[#ECECEC]/2">
                    {formData.profileImage ? (
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-20 w-20 shrink-0 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 overflow-hidden">
                          <img src={formData.profileImage} alt="Profile preview" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-mono text-xs font-bold text-fg mb-3">AVATAR_IMAGE_VERIFIED</p>
                          <button
                            type="button"
                            className="group/ebtn relative inline-flex h-9 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent px-4 font-mono text-[10px] uppercase font-bold tracking-wider text-fg hover:border-fg transition-all duration-300 cursor-pointer"
                          >
                            <CornerAccents className="opacity-0 group-hover/ebtn:opacity-100" />
                            <label className="cursor-pointer">
                              Change Picture
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'profileImage')}
                                className="hidden"
                              />
                            </label>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="h-14 w-14 border border-dashed border-fg/30 mx-auto flex items-center justify-center mb-3">
                          <span className="font-mono text-sm text-muted">?</span>
                        </div>
                        <p className="font-mono text-xs text-secondary mb-4 uppercase">Upload Profile Picture (JPG/PNG)</p>
                        <button
                          type="button"
                          className="group/ebtn relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 cursor-pointer"
                        >
                          <CornerAccents className="opacity-0 group-hover/ebtn:opacity-100" />
                          <label className="cursor-pointer">
                            Choose Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'profileImage')}
                              className="hidden"
                            />
                          </label>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Side panel for preview/actions */}
          <aside className="space-y-8">
            {/* Quick Profile Summary Card */}
            <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 group">
              <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
              <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-3 mb-4">
                // PEER_IDENTIFIER
              </h3>
              
              <div className="flex flex-col items-center py-4 text-center border-b border-[#0A0A0B]/5 dark:border-[#ECECEC]/5 mb-4">
                <div className="h-20 w-20 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 overflow-hidden mb-4 flex items-center justify-center">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-mono text-2xl font-bold text-fg">
                      {formData.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold font-sans text-fg uppercase tracking-tight truncate max-w-full">
                  {formData.name || 'UNINITIALIZED'}
                </h4>
                <p className="font-mono text-[9px] text-[#8C8C8E] uppercase tracking-wider mt-1 truncate max-w-full">
                  {formData.title || '// JOB_TITLE_NOT_SET'}
                </p>
                <p className="font-mono text-[9px] text-secondary mt-1">
                  {formData.location || 'EMEA_REGION'}
                </p>
              </div>

              {/* Status table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#0A0A0B]/5 dark:border-[#ECECEC]/5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E]">VERIFICATION</span>
                  <span className="font-mono text-[9px] font-bold text-fg uppercase">OK</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#0A0A0B]/5 dark:border-[#ECECEC]/5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E]">RESUME</span>
                  <span className={`font-mono text-[9px] font-bold uppercase ${formData.resume ? 'text-green-500' : 'text-red-500'}`}>
                    {formData.resume ? 'ATTACHED' : 'MISSING'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#8C8C8E]">AVATAR</span>
                  <span className={`font-mono text-[9px] font-bold uppercase ${formData.profileImage ? 'text-green-500' : 'text-red-500'}`}>
                    {formData.profileImage ? 'UPLOADED' : 'MISSING'}
                  </span>
                </div>
              </div>
            </section>

            {/* Form submit card */}
            <section className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#FFFFFF] dark:bg-[#18181B] p-6 group">
              <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
              <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-fg border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-3 mb-4">
                // SUBMIT_ACTION
              </h3>
              
              <button
                type="submit"
                disabled={isLoading}
                className="group/submitbtn relative inline-flex min-h-11 w-full items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
              >
                <CornerAccents className="opacity-0 group-hover/submitbtn:opacity-100" />
                <span>{isLoading ? 'Processing...' : 'Save Profile Details'}</span>
              </button>
            </section>
          </aside>
        </section>
      </form>
    </div>
  );
};

export default Profile;