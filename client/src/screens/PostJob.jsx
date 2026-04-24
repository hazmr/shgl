import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobsData } from '../contexts/JobsDataContext';
import httpClient from '../config/httpClient';
import { API_ENDPOINTS } from '../config/api';

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
          <p>{!isAuthenticated ? 'You need to be logged in to post jobs.' : 'This page is only available for employers.'}</p>
          <a href="/">
            Go Home
          </a>
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
            Post a New Job
          </h1>
          <p>
            Find the perfect candidate for your {user.company}
          </p>
        </div>

        <div>
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div>
              <div>
                <label>
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                 
                  placeholder="e.g., Senior Software Engineer"
                />
                {errors.title && <p>{errors.title}</p>}
              </div>

              <div>
                <label>
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                 
                  placeholder="e.g., San Francisco, CA"
                />
                {errors.location && <p>{errors.location}</p>}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label>
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
               
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
              {errors.description && <p>{errors.description}</p>}
            </div>

            {/* Job Details */}
            <div>
              <div>
                <label>
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                 
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>
                  Work Type
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                 
                >
                  {workTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                 
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>
                  Experience Level
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                 
                >
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <div>
                <label>
                  Minimum Salary *
                </label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                 
                  placeholder="50000"
                />
                {errors.salaryMin && <p>{errors.salaryMin}</p>}
              </div>

              <div>
                <label>
                  Maximum Salary *
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                 
                  placeholder="80000"
                />
                {errors.salaryMax && <p>{errors.salaryMax}</p>}
              </div>

              <div>
                <label>
                  Currency
                </label>
                <select
                  name="salaryCurrency"
                  value={formData.salaryCurrency}
                  onChange={handleChange}
                 
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>
                  Period
                </label>
                <select
                  name="salaryPeriod"
                  value={formData.salaryPeriod}
                  onChange={handleChange}
                 
                >
                  {salaryPeriods.map(period => (
                    <option key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Application Deadline */}
            <div>
              <label>
                Application Deadline (Optional)
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
               
              />
            </div>

            {/* Additional Options */}
            <div>
              <label>
                Additional Options
              </label>
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                   
                  />
                  <span>
                    Featured Job
                  </span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="urgent"
                    checked={formData.urgent}
                    onChange={handleChange}
                   
                  />
                  <span>
                    Urgent Hiring
                  </span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="remote"
                    checked={formData.remote}
                    onChange={handleChange}
                   
                  />
                  <span>
                    Remote Friendly
                  </span>
                </label>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label>
                Requirements *
              </label>
              {formData.requirements.map((requirement, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                   
                    placeholder="e.g., 3+ years of React experience"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'requirements')}
                     
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
               
              >
                + Add Requirement
              </button>
              {errors.requirements && <p>{errors.requirements}</p>}
            </div>

            {/* Benefits */}
            <div>
              <label>
                Benefits & Perks *
              </label>
              {formData.benefits.map((benefit, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'benefits')}
                   
                    placeholder="e.g., Health insurance, Flexible hours"
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'benefits')}
                     
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('benefits')}
               
              >
                + Add Benefit
              </button>
              {errors.benefits && <p>{errors.benefits}</p>}
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div>
                {errors.general}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
               
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
               
              >
                {isSubmitting ? (
                  <div>
                    <div></div>
                    <span>Posting Job...</span>
                  </div>
                ) : (
                  'Post Job'
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