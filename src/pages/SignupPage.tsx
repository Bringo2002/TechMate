// src/pages/SignupPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // ---------- Frontend validation ----------
    if (!formData.name.trim()) {
      toast.error("Full Name is required");
      return;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating your account...");

    try {
      // ---------- 1) Sign up the user with Supabase Auth ----------
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name },
        },
      });

      if (signUpError) throw signUpError;

      const userId = signUpData?.user?.id;

      // ---------- 2) Insert profile row into "profiles" table ----------
      if (userId) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          email: formData.email,
          full_name: formData.name,
          role: "user",
        });

        if (profileError) {
            console.error("Profile creation error:", profileError);
            // Non-blocking but worth logging
        }
      }

      // ---------- 3) Handle success + optional auto-login ----------
      // If Supabase returned a session (user is already authenticated), redirect immediately.
      if (signUpData?.session) {
        toast.success("Account created successfully! Logging you in...", { id: loadingToast });
        navigate("/user", { replace: true });
        return;
      }

      // If no session returned, attempt optional auto-login
      try {
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (loginData?.session) {
          toast.success("Account created! Welcome aboard.", { id: loadingToast });
          navigate("/user", { replace: true });
          return;
        }
      } catch (loginErr) {
        console.warn("Auto-login failed:", loginErr);
      }

      // ---------- 4) No session means email confirmation required ----------
      toast.success("Account created! Please check your email to activate.", { id: loadingToast, duration: 6000 });
      // Clear sensitive fields
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));

    } catch (err: any) {
      console.error("Signup flow error:", err);
      toast.error(err?.message || "Registration failed. Please try again.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        try {
           // @ts-ignore
           window.top.location.href = data.url; 
        } catch (e) {
           window.location.href = data.url;
        }
      }
    } catch (err: any) {
      console.error("Google signup error:", err);
      toast.error("Google sign up failed.");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <AuthLayout
      title="Sign Up"
      description="Create a TechMate account and unlock next-gen solutions with secure signup."
      canonical="https://yourdomain.com/signup"
      heading="Create Account"
    >
      <motion.form 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit} 
        className="space-y-4"
      >
        {/* Name */}
        <motion.div variants={itemVariants} className="relative group">
           <FiUser className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" size={20} />
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
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 text-white border border-slate-700
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 
                       placeholder-slate-500 transition-all duration-300 backdrop-blur-sm
                       hover:bg-slate-900/70 shadow-inner shadow-black/20"
          />
        </motion.div>

        {/* Email */}
        <motion.div variants={itemVariants} className="relative group">
           <FiMail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" size={20} />
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
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 text-white border border-slate-700
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 
                       placeholder-slate-500 transition-all duration-300 backdrop-blur-sm
                       hover:bg-slate-900/70 shadow-inner shadow-black/20"
          />
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants} className="relative group">
           <FiLock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" size={20} />
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
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-900/50 text-white border border-slate-700
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 
                       placeholder-slate-500 transition-all duration-300 backdrop-blur-sm
                       hover:bg-slate-900/70 shadow-inner shadow-black/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-gray-500 hover:text-cyan-400 focus:outline-none transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </motion.div>

        {/* Confirm Password */}
        <motion.div variants={itemVariants} className="relative group">
           <FiLock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" size={20} />
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
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-900/50 text-white border border-slate-700
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 
                       placeholder-slate-500 transition-all duration-300 backdrop-blur-sm
                       hover:bg-slate-900/70 shadow-inner shadow-black/20"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-3.5 text-gray-500 hover:text-cyan-400 focus:outline-none transition-colors"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 
                     text-white font-bold py-3 rounded-xl transition-all duration-300 
                     disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider
                     shadow-lg shadow-cyan-900/20 relative overflow-hidden group"
        >
          {loading ? (
             <div className="flex justify-center items-center gap-2">
             <motion.div 
             animate={{ rotate: 360 }}
             transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
             className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" 
           />
           <span>Creating Account...</span>
           </div>
          ) : (
             <span className="relative z-10 flex items-center justify-center gap-2">
             Sign Up
           </span>
          )}
          {/* Shine effect on hover */}
          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine" />
        </motion.button>
        
        {/* Divider */}
        <motion.div variants={itemVariants} className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-widest">Or continue with</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </motion.div>

        {/* Google Signup */}
        <motion.button
          variants={itemVariants}
          type="button"
          onClick={handleGoogleSignup}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          whileTap={{ scale: 0.98 }}
           className="w-full flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 py-3 rounded-xl
                     border border-slate-700 hover:border-slate-500 transition-all font-medium group backdrop-blur-sm"
        >
          <FcGoogle size={22} className="drop-shadow-sm" />
          <span className="group-hover:text-white transition-colors">Sign up with Google</span>
        </motion.button>

        {/* Login Link */}
        <motion.p variants={itemVariants} className="text-center text-slate-400 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors ml-1">
            Log In
          </Link>
        </motion.p>
      </motion.form>
    </AuthLayout>
  );
};

export default SignupPage;
