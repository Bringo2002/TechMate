import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import { validateEmail, validatePassword } from "../utils/validateForm";
import supabase from "../lib/supabaseClient"; 
import AuthLayout from "../layouts/AuthLayout";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

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

    // ---------- Frontend validation ----------
    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // ---------- 1) Sign up the user with Supabase Auth ----------
      // Pass the name into user metadata so it's available on the auth user.
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name },
        },
      });

      if (signUpError) {
        // Auth error (validation, duplicate email, etc.)
        throw signUpError;
      }

      // signUpData may contain a session if the provider returns one (auto-confirm),
      // or may be null/without session if email confirmation is required.
      const userId = signUpData?.user?.id;

      // ---------- 2) Insert profile row into "profiles" table ----------
      if (userId) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          email: formData.email,
          full_name: formData.name, // adjust column name if your schema uses `name` instead
          role: "user",
        });

        if (profileError) {
          // If profile insertion fails, surface a helpful message (but don't hide the fact signup succeeded)
          // We throw so UI shows the error; alternatively you could only warn and continue.
          throw profileError;
        }
      }

      // ---------- 3) Handle success + optional auto-login ----------
      // If Supabase returned a session (user is already authenticated), redirect immediately.
      if (signUpData?.session) {
        setSuccessMsg("Account created and signed in. Redirecting...");
        // Redirect normal users to /user
        navigate("/user", { replace: true });
        return;
      }

      // If no session returned, attempt optional auto-login (may fail if email confirmation required)
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (!loginError && loginData?.session) {
          setSuccessMsg("Account created and signed in. Redirecting...");
          navigate("/user", { replace: true });
          return;
        }
        // If loginError exists, it's likely because email confirmation is required.
      } catch (loginErr) {
        // swallow; we'll fallback to the "check your email" flow below
        console.warn("Auto-login attempt failed:", loginErr);
      }

      // ---------- 4) No session and auto-login didn't produce a session ----------
      setSuccessMsg(
        "✅ Account created. Please check your email and confirm your account before logging in."
      );
      // Optionally keep user on the page so they can see the success message and follow next steps.
    } catch (err: any) {
      // ---------- 5) Error handling ----------
      console.error("Signup flow error:", err);
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign Up"
      description="Create a NyxDev account and unlock next-gen solutions with secure signup."
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
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
              },
            });

            if (error) {
              console.error("Google signup error:", error);
            }
          } catch (err) {
            console.error("Unexpected error during Google signup:", err);
          }
        }}
        className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"
      >
        <FcGoogle size={20} />
        Sign up with Google
      </button>
    </AuthLayout>
  );
};

export default SignupPage;
