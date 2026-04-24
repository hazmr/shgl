import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitContactForm } from '../services/contactService';

const fieldClassName =
  'h-14 w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] px-4 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] focus-visible:ring-2 focus-visible:ring-[#0D0D0D]/20 dark:focus-visible:ring-[#F2F2F2]/20 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]';

const textAreaClassName =
  'w-full rounded-t-lg border-b-2 border-[#BFBFBF] dark:border-[#404040] bg-[#F2F2F2] dark:bg-[#0D0D0D] px-4 py-3 text-sm text-[#0D0D0D] dark:text-[#F2F2F2] placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-[#F2F2F2] focus-visible:ring-2 focus-visible:ring-[#0D0D0D]/20 dark:focus-visible:ring-[#F2F2F2]/20 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]';

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
    { value: 'jobseeker', label: 'Job Seeker' },
    { value: 'employer', label: 'Employer' },
    { value: 'other', label: 'Other' },
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

    // Clear error when user starts typing
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
      // Submit contact form to backend API
      const response = await submitContactForm(formData);
      console.log('Contact form submitted successfully:', response);

      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        userType: 'jobseeker',
        subject: '',
        message: '',
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setIsSubmitting(false);
      setSubmitError(error.message || 'Failed to submit contact form. Please try again.');

      // Hide error message after 7 seconds
      setTimeout(() => {
        setSubmitError('');
      }, 7000);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <section className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-[#BFBFBF]/50 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/30 p-6 sm:p-8 lg:p-10 shadow-sm">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-8 h-64 w-64 rounded-full bg-[#8C8C8C]/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-1/4 translate-y-1/4 rounded-full bg-[#404040]/15 dark:bg-[#BFBFBF]/10 blur-3xl" />
        </div>

        <div className="relative grid grid-cols-1 xl:grid-cols-[1.35fr_0.8fr] gap-8 lg:gap-10">
          <div>
            <p className="inline-flex items-center rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-[#8C8C8C]">
              Contact / Support
            </p>

            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.12] text-[#0D0D0D] dark:text-[#F2F2F2]">
              Get in Touch
            </h1>

            <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
              Share your issue, account question, or product feedback and our team will respond as fast as possible.
            </p>

            {submitSuccess && (
              <div className="mt-6 rounded-2xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#BFBFBF]/25 dark:bg-[#404040]/40 px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D]">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Message sent successfully.</p>
                    <p className="mt-1 text-sm text-[#404040] dark:text-[#BFBFBF]">Thanks for contacting us. We usually reply within 24-48 hours.</p>
                  </div>
                </div>
              </div>
            )}

            {submitError && (
              <div className="mt-6 rounded-2xl border border-[#8C8C8C]/55 bg-[#8C8C8C]/15 px-4 py-3">
                <p className="text-sm font-semibold text-[#404040]">Submission failed.</p>
                <p className="mt-1 text-sm text-[#404040]">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-5 sm:p-6 lg:p-7 backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8C8C8C]">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={fieldClassName}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-xs text-[#404040]">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8C8C8C]">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={fieldClassName}
                    placeholder="john@gmail.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-[#404040]">{errors.email}</p>}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#8C8C8C]">I am a *</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {userTypes.map((type) => {
                    const selected = formData.userType === type.value;
                    return (
                      <label
                        key={type.value}
                        className={`flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                          selected
                            ? 'border-[#0D0D0D] dark:border-[#F2F2F2] bg-[#0D0D0D] text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D]'
                            : 'border-[#BFBFBF] dark:border-[#404040] text-[#404040] dark:text-[#BFBFBF] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10'
                        }`}
                      >
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

              <div className="mt-5">
                <label htmlFor="contact-subject" className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8C8C8C]">
                  Subject *
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={fieldClassName}
                >
                  <option value="">Select a subject</option>
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.subject && <p className="mt-1 text-xs text-[#404040]">{errors.subject}</p>}
              </div>

              <div className="mt-5">
                <label htmlFor="contact-message" className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8C8C8C]">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={7}
                  className={textAreaClassName}
                  placeholder="Please describe your issue or inquiry in detail..."
                />
                {errors.message && <p className="mt-1 text-xs text-[#404040]">{errors.message}</p>}
                <p className="mt-1 text-xs text-[#8C8C8C]">Minimum 10 characters. Current: {formData.message.length}</p>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-6 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0D0D0D] px-6 text-sm font-medium text-[#F2F2F2] dark:bg-[#F2F2F2] dark:text-[#0D0D0D] shadow-sm hover:shadow-md hover:bg-[#0D0D0D]/90 dark:hover:bg-[#F2F2F2]/90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-[#F2F2F2] dark:border-[#0D0D0D] border-t-transparent animate-spin" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </form>
          </div>

          <aside className="rounded-3xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2]/80 dark:bg-[#0D0D0D]/60 p-5 sm:p-6 lg:p-7 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">Support Details</h2>
            <p className="mt-2 text-sm text-[#404040] dark:text-[#BFBFBF]">If your request is urgent, use one of the channels below.</p>

            <div className="mt-6 space-y-3">
              <InfoCard
                title="Email Us"
                value="support@gmail.com"
                iconPath="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
              <InfoCard
                title="Response Time"
                value="Within 24-48 hours"
                iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <InfoCard
                title="Call Us"
                value="+1 (555) 123-4567"
                iconPath="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

const InfoCard = ({ title, value, iconPath }) => (
  <div className="rounded-2xl border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#BFBFBF]/20 dark:bg-[#404040]/35 px-4 py-3">
    <div className="flex items-start gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D0D0D]/10 dark:bg-[#F2F2F2]/10 text-[#404040] dark:text-[#BFBFBF]">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
        </svg>
      </span>
      <span>
        <p className="text-sm font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">{title}</p>
        <p className="mt-0.5 text-sm text-[#404040] dark:text-[#BFBFBF]">{value}</p>
      </span>
    </div>
  </div>
);

export default Contact;
