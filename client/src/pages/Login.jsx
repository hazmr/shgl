import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CornerAccents from "../components/CornerAccents";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const fillDemoCredentials = (role) => {
    if (role === "employer") {
      setFormData({ email: "sanjana@gmail.com", password: "hazmr@1803" });
    } else if (role === "jobSeeker") {
      setFormData({ email: "john@gmail.com", password: "hazmr@1803" });
    } else if (role === "admin") {
      setFormData({ email: "admin@gmail.com", password: "hazmr@1803" });
    }
    setShowDemoCredentials(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        setSuccessMessage("Authentication verified. Redirecting...");
        setTimeout(() => {
          navigate("/jobs");
        }, 1000);
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Connection failed. Please check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECECEC] dark:bg-[#0A0A0B] px-4 py-12 relative overflow-hidden transition-colors duration-300">
      {/* Absolute decorative grid background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main technical container */}
        <div className="border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-8 sm:p-10 transition-all duration-300 relative group">
          <CornerAccents className="text-fg/30 group-hover:text-fg/50" />

          {/* Header Section */}
          <div className="mb-8 border-b border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 pb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0B] dark:text-[#ECECEC] mb-2 uppercase font-mono">
              AUTHENTICATE
            </h1>
            <p className="text-xs font-mono tracking-widest text-[#8C8C8E]">
              SIGN IN TO YOUR SHGL ACCOUNT
            </p>
          </div>

          {/* Demo Credentials Toggle */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="relative w-full px-4 py-3 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 hover:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 text-fg font-mono text-xs uppercase font-bold tracking-wider transition-all duration-300 group/demobtn"
            >
              <CornerAccents className="opacity-0 group-hover/demobtn:opacity-100" />
              {showDemoCredentials ? "Hide" : "Show"} Demo Credentials
            </button>

            {showDemoCredentials && (
              <div className="mt-4 space-y-3 p-4 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10">
                <p className="text-[10px] font-mono font-bold text-[#8C8C8E] uppercase tracking-wider mb-2">
                  Select Demo Identity:
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials("employer")}
                    className="relative w-full p-3 text-left border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 hover:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/item"
                  >
                    <CornerAccents className="opacity-0 group-hover/item:opacity-100" />
                    <div className="font-mono text-xs font-bold text-fg">EMPLOYER</div>
                    <div className="text-[10px] font-mono text-[#8C8C8E] mt-1">
                      sanjana@gmail.com / hazmr@1803
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials("jobSeeker")}
                    className="relative w-full p-3 text-left border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 hover:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/item"
                  >
                    <CornerAccents className="opacity-0 group-hover/item:opacity-100" />
                    <div className="font-mono text-xs font-bold text-fg">JOB SEEKER</div>
                    <div className="text-[10px] font-mono text-[#8C8C8E] mt-1">
                      john@gmail.com / hazmr@1803
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials("admin")}
                    className="relative w-full p-3 text-left border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 hover:border-fg bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 transition-all duration-300 group/item"
                  >
                    <CornerAccents className="opacity-0 group-hover/item:opacity-100" />
                    <div className="font-mono text-xs font-bold text-fg">ADMINISTRATOR</div>
                    <div className="text-[10px] font-mono text-[#8C8C8E] mt-1">
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
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                />
              </div>
            </div>

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
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-transparent border-none text-fg placeholder-[#8C8C8E] focus:outline-none focus:ring-0 font-mono text-sm"
                />
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-fg flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-mono text-fg uppercase tracking-wider">{successMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/35 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs font-mono text-red-500 uppercase tracking-wider">{error}</span>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-12 flex items-center justify-center gap-2 bg-[#0A0A0B] dark:bg-[#ECECEC] text-[#ECECEC] dark:text-[#0A0A0B] font-mono text-xs uppercase font-bold tracking-widest hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group/submit"
            >
              <CornerAccents className="opacity-0 group-hover/submit:opacity-100" />
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                "SUBMIT"
              )}
            </button>

            {/* Create Account Link */}
            <p className="text-center text-xs font-mono text-[#8C8C8E] uppercase tracking-wider">
              No identity yet?{" "}
              <Link
                to="/register"
                className="font-bold text-[#0A0A0B] dark:text-[#ECECEC] hover:underline transition-all"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
