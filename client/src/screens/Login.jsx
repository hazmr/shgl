"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "jobSeeker",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const { login, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  

  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(
      formData.email,
      formData.password,
      formData.userType
    );

    if (result.success) {
      router.replace(from);
    } else {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fillDemoCredentials = (type) => {
    if (type === "employer") {
      setFormData({
        email: "sanjana@gmail.com",
        password: "hazmr@1803",
        userType: "employer",
      });
    } else if (type === "admin") {
      setFormData({
        email: "admin@gmail.com",
        password: "hazmr@1803",
        userType: "admin",
      });
    } else {
      setFormData({
        email: "john@gmail.com",
        password: "hazmr@1803",
        userType: "jobSeeker",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      {/* Atmospheric blur shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#8C8C8C]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#404040]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" aria-hidden="true"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main card container */}
        <div className="bg-[#F2F2F2] rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#0D0D0D] mb-3 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-lg text-[#8C8C8C] font-medium">
              Sign in to your shgl account
            </p>
          </div>

          {/* Demo Credentials Toggle */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="w-full px-4 py-3 bg-[#BFBFBF]/20 hover:bg-[#BFBFBF]/30 text-[#404040] font-medium rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#404040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F2] active:scale-95"
            >
              {showDemoCredentials ? "Hide" : "Show"} Demo Credentials
            </button>

            {showDemoCredentials && (
              <div className="mt-4 space-y-3 p-4 bg-[#BFBFBF]/15 rounded-2xl border border-[#BFBFBF]/30">
                <p className="text-sm font-medium text-[#8C8C8C] mb-3">
                  Try these demo accounts:
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials("employer")}
                    className="w-full p-3 text-left bg-[#BFBFBF]/10 hover:bg-[#BFBFBF]/20 rounded-2xl transition-all duration-300 group hover:scale-[1.02]"
                  >
                    <div className="font-semibold text-[#404040]">Employer</div>
                    <div className="text-xs text-[#8C8C8C] mt-1">
                      sanjana@gmail.com / hazmr@1803
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials("jobSeeker")}
                    className="w-full p-3 text-left bg-[#BFBFBF]/10 hover:bg-[#BFBFBF]/20 rounded-2xl transition-all duration-300 group hover:scale-[1.02]"
                  >
                    <div className="font-semibold text-[#404040]">Job Seeker</div>
                    <div className="text-xs text-[#8C8C8C] mt-1">
                      john@gmail.com / hazmr@1803
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials("admin")}
                    className="w-full p-3 text-left bg-[#BFBFBF]/10 hover:bg-[#BFBFBF]/20 rounded-2xl transition-all duration-300 group hover:scale-[1.02]"
                  >
                    <div className="font-semibold text-[#404040]">Admin</div>
                    <div className="text-xs text-[#8C8C8C] mt-1">
                      admin@gmail.com / hazmr@1803
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#404040] mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-[#F2F2F2] border-b-2 border-[#BFBFBF] text-[#0D0D0D] placeholder-[#8C8C8C] rounded-t-lg focus:outline-none focus:border-b-2 focus:border-[#404040] transition-all duration-300 focus-visible:ring-0"
                />
                <svg
                  className="absolute right-3 top-3.5 w-5 h-5 text-[#8C8C8C] pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#404040] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#F2F2F2] border-b-2 border-[#BFBFBF] text-[#0D0D0D] placeholder-[#8C8C8C] rounded-t-lg focus:outline-none focus:border-b-2 focus:border-[#404040] transition-all duration-300 focus-visible:ring-0"
                />
                <svg
                  className="absolute right-3 top-3.5 w-5 h-5 text-[#8C8C8C] pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
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

            {/* Error Message */}
            {error && (
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
                <span className="text-sm text-[#404040] font-medium">{error}</span>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[#0D0D0D] hover:bg-[#0D0D0D]/90 active:bg-[#0D0D0D]/80 text-[#F2F2F2] font-semibold rounded-full transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#404040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2F2] active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F2F2F2] border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Create Account Link */}
            <p className="text-center text-sm text-[#8C8C8C]">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#404040] hover:text-[#0D0D0D] transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#404040] rounded px-1 focus-visible:outline-none"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
