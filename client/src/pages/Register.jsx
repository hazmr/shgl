import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CornerAccents from '../components/CornerAccents';

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
    <div className="min-h-screen flex items-center justify-center bg-[#ECECEC] dark:bg-[#0A0A0B] px-4 py-12 relative overflow-hidden transition-colors duration-300">
      {/* Absolute decorative grid background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Main technical container */}
        <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-10 transition-all duration-300 relative group">
          <CornerAccents className="text-fg/30 group-hover:text-fg/50" />

          {/* Header Section */}
          <div className="mb-8 border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0B] dark:text-[#ECECEC] mb-2 uppercase font-mono">
              REGISTER
            </h1>
            <p className="text-xs font-mono tracking-widest text-[#8C8C8E]">
              JOIN THE SHGL ALGORITHMIC SYSTEM
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2"
              >
                Full Name
              </label>
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 font-mono">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2"
              >
                Email Address
              </label>
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-mono">{errors.email}</p>
              )}
            </div>

            {/* Mobile Number Field */}
            <div>
              <label
                htmlFor="mobileNumber"
                className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2"
              >
                Mobile Number
              </label>
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                <input
                  id="mobileNumber"
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                />
              </div>
              {errors.mobileNumber && (
                <p className="mt-1 text-xs text-red-500 font-mono">{errors.mobileNumber}</p>
              )}
            </div>

            {/* User Type Selection */}
            <div>
              <label
                htmlFor="userType"
                className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2"
              >
                Account Type
              </label>
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                <select
                  id="userType"
                  value={formData.userType}
                  onChange={handleUserTypeChange}
                  className="w-full px-4 py-3 bg-transparent border-none text-fg focus:outline-none focus:ring-0 font-mono text-sm cursor-pointer"
                >
                  <option value="jobSeeker" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">Job Seeker</option>
                  <option value="employer" className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">Employer</option>
                </select>
              </div>
            </div>

            {/* Company Name Field (Conditional) */}
            {formData.userType === 'employer' && (
              <div>
                <label
                  htmlFor="company"
                  className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2"
                >
                  Company Name
                </label>
                <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <input
                    id="company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                  />
                </div>
                {errors.company && (
                  <p className="mt-1 text-xs text-red-500 font-mono">{errors.company}</p>
                )}
              </div>
            )}

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-mono">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-mono font-bold text-fg uppercase tracking-wider mb-2"
              >
                Confirm Password
              </label>
              <div className="relative border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/field">
                <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500 font-mono">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 font-mono text-xs flex items-start gap-3">
                <span className="font-bold">[SUCCESS]</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-xs flex items-start gap-3">
                <span className="font-bold">[ERROR]</span>
                <span>{errors.general}</span>
              </div>
            )}

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full px-6 py-3 border border-[#0A0A0B] dark:border-[#ECECEC] hover:bg-[#0A0A0B] hover:text-[#ECECEC] dark:hover:bg-[#ECECEC] dark:hover:text-[#0A0A0B] bg-transparent text-fg font-mono text-xs uppercase font-bold tracking-wider transition-all duration-300 group/btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>CREATING ID...</span>
                </>
              ) : (
                'CREATE ACCOUNT'
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center font-mono text-xs text-[#8C8C8E] mt-4">
              ALREADY REGISTERED?{' '}
              <Link
                to="/login"
                className="font-bold text-fg hover:underline transition-all duration-300"
              >
                SIGN IN
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
