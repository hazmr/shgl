import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'jobSeeker',
    mobileNumber: '',
    company: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register, isLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 5) {
      newErrors.name = 'Name must be at least 5 characters';
    } else if (formData.name.trim().length > 30) {
      newErrors.name = 'Name must not exceed 30 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address must be a valid value';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (formData.password.length > 20) {
      newErrors.password = 'Password must not exceed 20 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    }

    if (formData.userType === 'employer' && !formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    const result = await register(formData);

    if (result.success) {
      navigate('/login', {
        replace: true,
        state: { message: result.message || 'Registration successful! Please login with your credentials.' }
      });
    } else {
      if (result.fieldErrors) {
        setErrors(result.fieldErrors);
      } else {
        setErrors({ general: result.error });
      }
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  const handleUserTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      userType: e.target.value,
      company: ''
    }));
    if (errors.userType) {
      setErrors(prev => ({
        ...prev,
        userType: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      {/* Atmospheric blur shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8C8C8C]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#404040]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4" aria-hidden="true"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main card container */}
        <div className="bg-[#F2F2F2] rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#0D0D0D] mb-3 tracking-tight">
              Join shgl
            </h1>
            <p className="text-lg text-[#8C8C8C] font-medium">
              Create your account and start your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-[#404040] mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-[#F2F2F2] border-b-2 border-[#BFBFBF] text-[#0D0D0D] placeholder-[#8C8C8C] rounded-t-lg focus:outline-none focus:border-b-2 focus:border-[#404040] transition-all duration-300 focus-visible:ring-0"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-[#404040] font-medium">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#404040] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-[#F2F2F2] border-b-2 border-[#BFBFBF] text-[#0D0D0D] placeholder-[#8C8C8C] rounded-t-lg focus:outline-none focus:border-b-2 focus:border-[#404040] transition-all duration-300 focus-visible:ring-0"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#404040] font-medium">{errors.email}</p>
              )}
            </div>

            {/* Mobile Number Field */}
            <div>
              <label
                htmlFor="mobileNumber"
                className="block text-sm font-semibold text-[#404040] mb-2"
              >
                Mobile Number
              </label>
              <input
                id="mobileNumber"
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 bg-[#F2F2F2] border-b-2 border-[#BFBFBF] text-[#0D0D0D] placeholder-[#8C8C8C] rounded-t-lg focus:outline-none focus:border-b-2 focus:border-[#404040] transition-all duration-300 focus-visible:ring-0"
              />
              {errors.mobileNumber && (
                <p className="mt-1 text-xs text-[#404040] font-medium">{errors.mobileNumber}</p>
              )}
            </div>

            {/* User Type Selection */}
            <div>
              <label
                htmlFor="userType"
                className="block text-sm font-semibold text-[#404040] mb-2"
              >
                I am a
              </label>
              <select
                id="userType"
                value={formData.userType}
                onChange={handleUserTypeChange}
                className="w-full px-4 py-3 bg-[#F2F2F2] border-b-2 border-[#BFBFBF] text-[#404040] rounded-t-lg focus:outline-none focus:border-b-2 focus:border-[#404040] transition-all duration-300 focus-visible:ring-0 cursor-pointer"
              >
                <option value="jobSeeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
            </div>

            {/* Company Name Field (Conditional) */}
            {formData.userType === 'employer' && (
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-semibold text-[#404040] mb-2"
                >
                  Company Name
                </label>
                <input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className="w-full px-4 py-3 bg-[#F2F2F2] border-b-2 border-[#BFBFBF] text-[#0D0D0D] placeholder-[#8C8C8C] rounded-t-lg focus:outline-none focus:border-b-2 focus:border-[#404040] transition-all duration-300 focus-visible:ring-0"
                />
                {errors.company && (
                  <p className="mt-1 text-xs text-[#404040] font-medium">{errors.company}</p>
                )}
              </div>
            )}

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#404040] mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password (8-20 characters)"
                className="w-full px-4 py-3 bg-[#F2F2F2] border-b-2 border-[#BFBFBF] text-[#0D0D0D] placeholder-[#8C8C8C] rounded-t-lg focus:outline-none focus:border-b-2 focus:border-[#404040] transition-all duration-300 focus-visible:ring-0"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-[#404040] font-medium">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-[#404040] mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-4 py-3 bg-[#F2F2F2] border-b-2 border-[#BFBFBF] text-[#0D0D0D] placeholder-[#8C8C8C] rounded-t-lg focus:outline-none focus:border-b-2 focus:border-[#404040] transition-all duration-300 focus-visible:ring-0"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-[#404040] font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-[#BFBFBF]/20 border border-[#8C8C8C]/30 rounded-2xl flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-[#404040] flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-[#404040] font-medium">{successMessage}</span>
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="p-4 bg-[#8C8C8C]/15 border border-[#8C8C8C]/40 rounded-2xl flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-[#404040] flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-[#404040] font-medium">{errors.general}</span>
              </div>
            )}

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[#0D0D0D] hover:bg-[#0D0D0D]/90 active:bg-[#0D0D0D]/80 text-[#F2F2F2] font-semibold rounded-full transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#404040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F2] active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F2F2F2] border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-[#8C8C8C]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#404040] hover:text-[#0D0D0D] transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#404040] rounded px-1 focus-visible:outline-none"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
