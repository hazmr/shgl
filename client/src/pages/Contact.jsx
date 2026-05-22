import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitContactForm } from '../services/contactService';
import CornerAccents from '../components/CornerAccents';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: 'jobseeker',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const navigate = useNavigate();

  const userTypes = [
    { value: 'jobseeker', label: 'JOB SEEKER' },
    { value: 'employer', label: 'EMPLOYER' },
    { value: 'other', label: 'OTHER' },
  ];

  const subjectOptions = [
    'Technical Issue',
    'Account Problem',
    'Employer Onboarding',
    'Job Posting Issue',
    'Application Question',
    'Feature Request',
    'General Inquiry',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
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
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await submitContactForm(formData);
      console.log('Contact form submitted successfully:', response);

      setIsSubmitting(false);
      setSubmitSuccess(true);

      setFormData({
        name: '',
        email: '',
        userType: 'jobseeker',
        subject: '',
        message: '',
      });

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setIsSubmitting(false);
      setSubmitError(error.message || 'Failed to submit contact form. Please try again.');

      setTimeout(() => {
        setSubmitError('');
      }, 7000);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECECEC] dark:bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="border-b border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 pb-6 mb-8">
          <div className="text-[10px] font-bold font-mono text-[#8C8C8E] uppercase tracking-wider mb-2">
            // SUPPORT_PORTAL / CONTACT_US
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-sans uppercase text-fg tracking-tight mb-2">
            Get in Touch
          </h1>
          <p className="text-xs font-mono text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider">
            Share your issue, account question, or product feedback with the SHGL team.
          </p>
        </div>

        {/* Success / Error Messages */}
        {submitSuccess && (
          <div className="p-4 mb-6 bg-fg/5 dark:bg-fg/5 border border-fg/15 flex items-start gap-3">
            <svg className="w-5 h-5 text-fg flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-xs font-mono font-bold text-fg uppercase tracking-wider">Message sent successfully.</p>
              <p className="font-mono text-[10px] text-fg/60 uppercase tracking-wider mt-1">Thanks for contacting SHGL support. We usually reply within 24-48 hours.</p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/35 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider">Submission failed.</p>
              <p className="font-mono text-[10px] text-red-500/80 uppercase tracking-wider mt-1">{submitError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Form Column */}
          <div className="lg:col-span-2 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 sm:p-8 transition-all duration-300 relative group">
            <CornerAccents className="text-fg/20 group-hover:text-fg/40" />
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label htmlFor="contact-name" className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs uppercase text-fg placeholder:text-fg/30 focus:outline-none"
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="absolute bottom-0 right-3 text-[9px] font-mono text-red-500 uppercase tracking-wider">{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                  <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                  <label htmlFor="contact-email" className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs text-fg placeholder:text-fg/30 focus:outline-none"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="absolute bottom-0 right-3 text-[9px] font-mono text-red-500 uppercase tracking-wider">{errors.email}</p>}
                </div>
              </div>

              {/* User Type Tab Selection */}
              <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-4">
                <span className="block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider mb-3">// IDENTITY_CLASSIFICATION *</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {userTypes.map((type) => {
                    const selected = formData.userType === type.value;
                    return (
                      <label
                        key={type.value}
                        className={`group/tab relative border px-4 py-3 font-mono text-xs uppercase text-center cursor-pointer transition-all duration-300 ${
                          selected
                            ? 'border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B]'
                            : 'border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 text-fg/60 hover:text-fg hover:bg-fg/5'
                        }`}
                      >
                        {selected && <CornerAccents className="opacity-100" />}
                        <input
                          type="radio"
                          name="userType"
                          value={type.value}
                          checked={selected}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        {type.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Subject Dropdown */}
              <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                <label htmlFor="contact-subject" className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">
                  Subject *
                </label>
                <div className="relative">
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs uppercase text-fg focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">Select a subject</option>
                    {subjectOptions.map((option) => (
                      <option key={option} value={option} className="bg-[#FFFFFF] dark:bg-[#18181B] text-fg">
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pb-3 text-fg">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {errors.subject && <p className="absolute bottom-0 right-3 text-[9px] font-mono text-red-500 uppercase tracking-wider">{errors.subject}</p>}
              </div>

              {/* Message */}
              <div className="border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 focus-within:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 relative group/field">
                <CornerAccents className="opacity-0 group-focus-within/field:opacity-100" />
                <label htmlFor="contact-message" className="pt-3 px-4 block text-[9px] font-mono text-[#8C8C8E] uppercase tracking-wider">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-transparent px-4 pb-3 pt-1 font-mono text-xs text-fg placeholder:text-fg/30 focus:outline-none resize-none"
                  placeholder="Describe your request in detail..."
                />
                {errors.message && <p className="absolute bottom-0 right-3 text-[9px] font-mono text-red-500 uppercase tracking-wider">{errors.message}</p>}
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[#8C8C8E] tracking-wider px-2">
                <span>// MESSAGE_MIN_LENGTH: 10 CHARS</span>
                <span>LENGTH: {formData.message.length}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-4 sm:justify-end border-t border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B]/15 dark:border-[#ECECEC]/15 bg-transparent text-fg px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-fg hover:text-surface transition-all duration-300"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  <span>CANCEL</span>
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group/btn relative inline-flex min-h-11 items-center justify-center border border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider hover:bg-transparent hover:text-fg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 border-2 border-surface border-t-transparent animate-spin" />
                      SENDING...
                    </span>
                  ) : (
                    <span>SEND MESSAGE</span>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Support Details Column */}
          <div className="space-y-6">
            <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 transition-all duration-300 relative group">
              <CornerAccents className="text-fg/20 group-hover:text-fg/45" />
              
              <h2 className="text-lg font-bold uppercase text-fg font-sans tracking-wide mb-2">SHGL Support Registry</h2>
              <p className="font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] uppercase tracking-wider leading-relaxed mb-6">
                For automated inquiries or faster processing, you may direct your correspondence to the designated channels below.
              </p>

              <div className="space-y-4">
                
                {/* Email Support */}
                <InfoCard
                  title="EMAIL SUPPORT"
                  value="support@SHGL.tech"
                  iconPath="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />

                {/* Response SLA */}
                <InfoCard
                  title="RESPONSE TIME"
                  value="WITHIN 24-48 HOURS"
                  iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />

                {/* Telephone */}
                <InfoCard
                  title="SYSTEM HOTLINE"
                  value="+1 (555) 768-6872"
                  iconPath="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const InfoCard = ({ title, value, iconPath }) => (
  <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 p-4 transition-all duration-300 relative group flex items-start gap-3">
    <CornerAccents className="opacity-0 group-hover:opacity-100" />
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] text-fg">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
      </svg>
    </span>
    <div>
      <p className="font-mono text-[9px] font-bold text-[#8C8C8E] uppercase tracking-wider">{title}</p>
      <p className="font-mono text-xs font-bold text-fg uppercase tracking-wider mt-0.5">{value}</p>
    </div>
  </div>
);

export default Contact;
