
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { validateEmail, validatePassword } from "../utils/validateForm";
import supabase from "../lib/supabaseClient"; 
import AuthLayout from "../layouts/AuthLayout";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // ✅ new state for confirmation message
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccessMsg("");

    // ✅ Frontend validation
    if (!formData.name.trim()) return setError("Name is required.");

    const emailError = validateEmail(formData.email);
    if (emailError) return setError(emailError);

    const passwordError = validatePassword(formData.password);
    if (passwordError) return setError(passwordError);

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const { session } = await signup(
        formData.name,
        formData.email,
        formData.password
      );

      if (!session) {
        // ✅ No session returned → email confirmation likely required
        setSuccessMsg(
          "✅ Account created. Please check your email and confirm before logging in."
        );
        return;
      }

      // ✅ Auto-login fallback
      try {
        await login(formData.email, formData.password);
      } catch {
        console.warn("Auto-login after signup failed, redirecting manually.");
      }

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign Up"
      description="Create a TechMate account and unlock next-gen solutions with secure signup."
      canonical="https://yourdomain.com/signup"
      heading="Create Account"
    >
      {/* Show error or success messages */}
      {error && (
        <p role="alert" className="text-red-500 text-sm mb-4 text-center font-medium">
          {error}
        </p>
      )}
      {successMsg && (
        <p role="status" className="text-green-500 text-sm mb-4 text-center font-medium">
          {successMsg}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete="name"
          aria-label="Full Name"
          className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        />

        {/* Email */}
        <input
          id="email"
          name="email"
          type="email"
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
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            aria-label="Password"
            className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-white focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            aria-label="Confirm Password"
            className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all pr-10"
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-3 top-3 text-gray-400 hover:text-white focus:outline-none"
            aria-label={
              showConfirmPassword ? "Hide confirm password" : "Show confirm password"
            }
          >
            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-900 text-white font-bold py-3 rounded-xl 
                     transition-all duration-200 disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? (
            <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center text-gray-300 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-400 hover:underline">
          Login
        </Link>
      </p>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <hr className="flex-grow border-slate-600" />
        <span className="text-slate-400">or</span>
        <hr className="flex-grow border-slate-600" />
      </div>

      {/* Google Signup */}
<button
  onClick={async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // User will be redirected to Google and then back to your /auth/callback page
    } catch (err: any) {
      console.error("Google signup error:", err);
      alert(err.message || "Google signup failed. Please try again.");
    }
  }}
  className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl 
             shadow hover:shadow-lg transition-all font-semibold mb-6"
>
  <FcGoogle size={24} /> Sign Up with Google
</button>

    </AuthLayout>
  );
};

export default SignupPage;
