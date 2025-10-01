import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { validateEmail, validatePassword } from "../utils/validateForm";
import AuthLayout from "../layouts/AuthLayout";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    // ✅ Validate input before starting request
    const emailError = validateEmail(formData.email);
    if (emailError) return setError(emailError);

    const passwordError = validatePassword(formData.password);
    if (passwordError) return setError(passwordError);

    setLoading(true);
    try {
      await login(formData.email, formData.password);

      // ✅ Redirect to where user came from, fallback to dashboard
      const redirectPath =
        (location.state as any)?.from?.pathname || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);

      // ✅ More intelligent error messages
      if (err.message?.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email before logging in. Check your inbox.");
      } else if (err.message?.toLowerCase().includes("invalid login")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(err.message || "Unable to log in. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle?.();
    } catch (err: any) {
      console.error("Google login failed:", err);
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Login"
      description="Login securely to TechMate and manage your tech solutions with futuristic ease."
      canonical="https://yourdomain.com/login"
      heading="Welcome Back"
    >
      {error && (
        <p
          role="alert"
          className="text-red-500 text-sm mb-4 text-center font-medium"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          aria-label="Email Address"
          className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            aria-label="Password"
            className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-3 text-gray-400 hover:text-white focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-400 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-900 text-white font-bold py-3 rounded-xl 
                     transition-all duration-200 disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? (
            <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Login"
          )}
        </button>
      </form>

      {/* Signup Link */}
      <p className="text-center text-gray-300 mt-4">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-blue-400 hover:underline">
          Sign Up
        </Link>
      </p>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <hr className="flex-grow border-slate-600" />
        <span className="text-slate-400">or</span>
        <hr className="flex-grow border-slate-600" />
      </div>

      {/* Google login */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl 
                   shadow hover:shadow-lg transition-all font-semibold mb-6"
      >
        <FcGoogle size={24} /> Login with Google
      </button>
    </AuthLayout>
  );
};

export default LoginPage;
