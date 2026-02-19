// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { validateEmail } from "../utils/validateForm";
import AuthLayout from "../layouts/AuthLayout";

const ForgotPasswordPage: React.FC = () => {
  const { requestPasswordReset } = useAuth(); // your hook should expose resetPassword(email)
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccess("Password reset link sent to your email.");
      setEmail("");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || "Failed to send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Reset your password securely and regain access to TechMate."
      canonical="https://yourdomain.com/forgot-password"
      heading="Reset Password"
    >
      {error && (
        <p role="alert" className="text-red-500 text-sm mb-4 text-center font-medium">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-green-400 text-sm mb-4 text-center font-medium">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <label htmlFor="email" className="sr-only">Email Address</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          aria-label="Email Address"
          className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        />

        {/* Reset Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-900 text-white font-bold py-3 rounded-xl 
                     transition-all duration-200 disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? (
            <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      {/* Back to Login */}
      <p className="text-center text-gray-300 mt-4">
        Remembered your password?{" "}
        <Link to="/login" className="text-blue-400 hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
