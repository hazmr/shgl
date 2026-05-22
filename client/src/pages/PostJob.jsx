
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobsData } from '../contexts/JobsDataContext';
import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';
import CornerAccents from '../components/CornerAccents';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    workType: 'On-site',
    category: 'Technology',
    experienceLevel: 'Mid-level',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    salaryPeriod: 'year',
    applicationDeadline: '',
    requirements: [''],
    benefits: [''],
    remote: false,
    featured: false,
    urgent: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isEmployer, isAuthenticated, isLoading: authLoading } = useAuth();
  const { forceRefresh } = useJobsData();
  const navigate = useNavigate();

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const workTypes = ['Remote', 'Hybrid', 'On-site'];
  const categories = ['Technology', 'Marketing', 'Sales', 'Design', 'Finance', 'Operations', 'Other'];
  const experienceLevels = ['Entry-level', 'Mid-level', 'Senior-level', 'Executive'];
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'];
  const salaryPeriods = ['year', 'month', 'hour'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleArrayChange = (index, value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.salaryMin || formData.salaryMin < 1000) {
      newErrors.salaryMin = 'Minimum salary must be at least $1,000';
    }

    if (!formData.salaryMax || formData.salaryMax < 1000) {
      newErrors.salaryMax = 'Maximum salary must be at least $1,000';
    }

    if (parseInt(formData.salaryMax) <= parseInt(formData.salaryMin)) {
      newErrors.salaryMax = 'Maximum salary must be higher than minimum salary';
    }

    const validRequirements = formData.requirements.filter(req => req.trim());
    if (validRequirements.length === 0) {
      newErrors.requirements = 'At least one requirement is needed';
    }

    const validBenefits = formData.benefits.filter(benefit => benefit.trim());
    if (validBenefits.length === 0) {
      newErrors.benefits = 'At least one benefit is needed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty requirements and benefits and convert to JSON string
      const requirementsList = formData.requirements.filter(req => req.trim());
      const benefitsList = formData.benefits.filter(benefit => benefit.trim());

      // Prepare job data for backend
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        jobType: formData.jobType,
        workType: formData.workType,
        category: formData.category,
        experienceLevel: formData.experienceLevel,
        salaryMin: parseFloat(formData.salaryMin),
        salaryMax: parseFloat(formData.salaryMax),
        salaryCurrency: formData.salaryCurrency,
        salaryPeriod: formData.salaryPeriod,
        requirements: requirementsList.length > 0 ? JSON.stringify(requirementsList) : null,
        benefits: benefitsList.length > 0 ? JSON.stringify(benefitsList) : null,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : null,
        remote: formData.workType === 'Remote' || formData.remote,
        featured: formData.featured,
        urgent: formData.urgent,
        status: 'ACTIVE'
      };

      await httpClient.post(API_ENDPOINTS.POST_JOB, jobData);

      // Force refresh the jobs cache so the new job appears immediately
      await forceRefresh();

      navigate('/employer/jobs', {
        state: { message: 'Job posted successfully!', type: 'success' }
      });
    } catch (error) {
      console.error('Error posting job:', error);
      setErrors({
        general: error.response?.data?.message || 'Failed to post job. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECECEC] dark:bg-[#0A0A0B] transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-fg border-t-transparent animate-spin"></div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#8C8C8E]">INITIALIZING SECURITY PROTOCOL...</p>
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
            {!isAuthenticated ? 'Please Log In' : 'Access Denied'}
          </h2>
          <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] mb-6 uppercase tracking-wider leading-relaxed">
            {!isAuthenticated ? 'You need to be logged in to post jobs.' : 'This page is only available for employers.'}
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

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 border-b border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 pb-6">
          <div className="text-[10px] font-bold font-mono text-[#8C8C8E] uppercase tracking-wider mb-2">
            // EMPLOYER_PORTAL / CREATE_LISTING
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans uppercase text-fg tracking-tight mb-2">
            Post a New Job
          </h1>
          <p className="text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider">
            Find the perfect candidate for your <span className="text-fg font-bold">{user.company}</span>
          </p>
        </div>

        <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-10 transition-all duration-300 relative group">
          <CornerAccents className="text-fg/30 group-hover:text-fg/50" />

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            {/* SECTION 1: BASIC INFORMATION */}
            <div>
              <div className="text-[10px] font-mono font-bold text-[#8C8C8E] uppercase tracking-wider border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-2 mb-6">
                // 01. BASIC DETAILS
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Job Title *
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                    />
                  </div>
                  {errors.title && <p className="mt-2 text-xs font-mono text-red-500 uppercase">{errors.title}</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Location *
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., San Francisco, CA"
                      className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                    />
                  </div>
                  {errors.location && <p className="mt-2 text-xs font-mono text-red-500 uppercase">{errors.location}</p>}
                </div>
              </div>
            </div>

            {/* SECTION 2: DESCRIPTION */}
            <div>
              <div className="text-[10px] font-mono font-bold text-[#8C8C8E] uppercase tracking-wider border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-2 mb-6">
                // 02. SPECIFICATION & OVERVIEW
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                  Job Description *
                </label>
                <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-sans text-sm resize-y"
                  />
                </div>
                {errors.description && <p className="mt-2 text-xs font-mono text-red-500 uppercase">{errors.description}</p>}
              </div>
            </div>

            {/* SECTION 3: CLASSIFICATIONS */}
            <div>
              <div className="text-[10px] font-mono font-bold text-[#8C8C8E] uppercase tracking-wider border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-2 mb-6">
                // 03. CLASSIFICATIONS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Job Type */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Job Type
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#18181B] border-none text-fg focus:outline-none focus:ring-0 font-mono text-sm"
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Work Type */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Work Type
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <select
                      name="workType"
                      value={formData.workType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#18181B] border-none text-fg focus:outline-none focus:ring-0 font-mono text-sm"
                    >
                      {workTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#18181B] border-none text-fg focus:outline-none focus:ring-0 font-mono text-sm"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Experience Level
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#18181B] border-none text-fg focus:outline-none focus:ring-0 font-mono text-sm"
                    >
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: FINANCIALS */}
            <div>
              <div className="text-[10px] font-mono font-bold text-[#8C8C8E] uppercase tracking-wider border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-2 mb-6">
                // 04. COMPENSATION METRICS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Min Salary */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Minimum Salary *
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <input
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleChange}
                      placeholder="50000"
                      className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                    />
                  </div>
                  {errors.salaryMin && <p className="mt-2 text-xs font-mono text-red-500 uppercase">{errors.salaryMin}</p>}
                </div>

                {/* Max Salary */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Maximum Salary *
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <input
                      type="number"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleChange}
                      placeholder="80000"
                      className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                    />
                  </div>
                  {errors.salaryMax && <p className="mt-2 text-xs font-mono text-red-500 uppercase">{errors.salaryMax}</p>}
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Currency
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <select
                      name="salaryCurrency"
                      value={formData.salaryCurrency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#18181B] border-none text-fg focus:outline-none focus:ring-0 font-mono text-sm"
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Period */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Period
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <select
                      name="salaryPeriod"
                      value={formData.salaryPeriod}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#18181B] border-none text-fg focus:outline-none focus:ring-0 font-mono text-sm"
                    >
                      {salaryPeriods.map(period => (
                        <option key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: DEADLINE & OPTIONS */}
            <div>
              <div className="text-[10px] font-mono font-bold text-[#8C8C8E] uppercase tracking-wider border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-2 mb-6">
                // 05. PARAMETERS & OPTIONS
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deadline */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Application Deadline (Optional)
                  </label>
                  <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                    <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                    <input
                      type="date"
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Additional Options Checkboxes */}
                <div>
                  <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2">
                    Additional Parameters
                  </label>
                  <div className="flex flex-col gap-3 py-1">
                    <label className="relative flex items-center gap-3 cursor-pointer group/chk select-none">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border transition-all duration-300 relative flex items-center justify-center ${formData.featured ? 'border-fg bg-fg text-elevated' : 'border-[#0A0A0B]/30 dark:border-[#ECECEC]/30'}`}>
                        {formData.featured && (
                          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                        )}
                      </div>
                      <span className="font-mono text-xs uppercase tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] group-hover/chk:text-fg transition-colors">
                        FEATURED JOB (HIGHLIGHTED SEARCH)
                      </span>
                    </label>

                    <label className="relative flex items-center gap-3 cursor-pointer group/chk select-none">
                      <input
                        type="checkbox"
                        name="urgent"
                        checked={formData.urgent}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border transition-all duration-300 relative flex items-center justify-center ${formData.urgent ? 'border-fg bg-fg text-elevated' : 'border-[#0A0A0B]/30 dark:border-[#ECECEC]/30'}`}>
                        {formData.urgent && (
                          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                        )}
                      </div>
                      <span className="font-mono text-xs uppercase tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] group-hover/chk:text-fg transition-colors">
                        URGENT HIRING (PRIORITY ASSIGNMENT)
                      </span>
                    </label>

                    <label className="relative flex items-center gap-3 cursor-pointer group/chk select-none">
                      <input
                        type="checkbox"
                        name="remote"
                        checked={formData.remote}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border transition-all duration-300 relative flex items-center justify-center ${formData.remote ? 'border-fg bg-fg text-elevated' : 'border-[#0A0A0B]/30 dark:border-[#ECECEC]/30'}`}>
                        {formData.remote && (
                          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                        )}
                      </div>
                      <span className="font-mono text-xs uppercase tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] group-hover/chk:text-fg transition-colors">
                        REMOTE FRIENDLY DESIGNATION
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 6: REQUIREMENTS */}
            <div>
              <div className="text-[10px] font-mono font-bold text-[#8C8C8E] uppercase tracking-wider border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-2 mb-6">
                // 06. CANDIDATE REQUIREMENTS
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider">
                  Requirements (Minimum 1 Required)
                </label>
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1 relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                      <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                        placeholder="e.g., 3+ years of React experience"
                        className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                      />
                    </div>
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'requirements')}
                        className="p-3 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 hover:border-red-500 hover:text-red-500 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/delbtn"
                      >
                        <CornerAccents className="opacity-0 group-hover/delbtn:opacity-100" />
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addArrayItem('requirements')}
                  className="relative px-4 py-2 border border-dashed border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 hover:border-fg font-mono text-xs uppercase font-bold tracking-wider text-fg transition-all duration-300 group/addbtn"
                >
                  <CornerAccents className="opacity-0 group-hover/addbtn:opacity-100" />
                  + Add Requirement
                </button>
                {errors.requirements && <p className="mt-2 text-xs font-mono text-red-500 uppercase">{errors.requirements}</p>}
              </div>
            </div>

            {/* SECTION 7: BENEFITS */}
            <div>
              <div className="text-[10px] font-mono font-bold text-[#8C8C8E] uppercase tracking-wider border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-2 mb-6">
                // 07. COMPENSATION BENEFITS & PERKS
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-mono font-bold text-fg uppercase tracking-wider">
                  Benefits & Perks (Minimum 1 Required)
                </label>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1 relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                      <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleArrayChange(index, e.target.value, 'benefits')}
                        placeholder="e.g., Health insurance, Flexible hours"
                        className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                      />
                    </div>
                    {formData.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'benefits')}
                        className="p-3 border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 hover:border-red-500 hover:text-red-500 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/delbtn"
                      >
                        <CornerAccents className="opacity-0 group-hover/delbtn:opacity-100" />
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addArrayItem('benefits')}
                  className="relative px-4 py-2 border border-dashed border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 hover:border-fg font-mono text-xs uppercase font-bold tracking-wider text-fg transition-all duration-300 group/addbtn"
                >
                  <CornerAccents className="opacity-0 group-hover/addbtn:opacity-100" />
                  + Add Benefit
                </button>
                {errors.benefits && <p className="mt-2 text-xs font-mono text-red-500 uppercase">{errors.benefits}</p>}
              </div>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="p-4 bg-red-500/10 border border-red-500/35 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs font-mono text-red-500 uppercase tracking-wider">{errors.general}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 sm:justify-end border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 hover:border-fg bg-transparent text-fg px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider transition-all duration-300"
              >
                <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                <span>CANCEL</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>POSTING LISTING...</span>
                  </div>
                ) : (
                  <span>POST JOB LISTING</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;