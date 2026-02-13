// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { validateEmail } from "../utils/validateForm";
import supabase from "../lib/supabaseClient";
import AuthLayout from "../layouts/AuthLayout";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const emailError = validateEmail(formData.email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Signing in...");

    try {
      // 1️⃣ Sign in with email/password
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) throw loginData ? loginError : new Error(loginError?.message || "Invalid credentials");

      // 2️⃣ Fetch user role from profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", loginData.user?.id)
        .single();

      if (profileError) {
        // Fallback if profile doesn't exist (edge case) -> default to user
        console.warn("Profile fetch error:", profileError);
      }

      const role = profileData?.role;

      toast.success("Welcome back!", { id: loadingToast });

      // 3️⃣ Redirect based on role
      if (role === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      let errorMessage = err.message || "Unable to sign in.";
      
      // Handle known Supabase/Network errors
      if (err.message?.toLowerCase().includes("email not confirmed")) {
        errorMessage = "Please confirm your email address first.";
      } else if (err.message?.toLowerCase().includes("invalid login")) {
        errorMessage = "Invalid email or password.";
      } else if (err.message?.includes("Connection to server failed")) {
         errorMessage = err.message; // Use the detailed message from useAuth
      }
      
      toast.error(errorMessage, { id: loadingToast, duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
        // Attempt to redirect via top window to break out of iframes if possible
        try {
           // @ts-ignore
           window.top.location.href = data.url; 
        } catch (e) {
           // Fallback if blocked
           window.location.href = data.url;
        }
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      toast.error("Google sign in failed.");
    }
  };

  // Animation variants for staggered entrance
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
      title="Login"
      description="Login securely to TechMate and manage your tech solutions with futuristic ease."
      canonical="https://techmate.com/login"
      heading="Welcome Back"
    >
      <motion.form 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit} 
        className="space-y-5"
      >
        {/* Email */}
        <motion.div variants={itemVariants} className="relative group">
          <FiMail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" size={20} />
          <input
            type="email"
            name="email"
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
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            aria-label="Password"
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-900/50 text-white border border-slate-700
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 
                       placeholder-slate-500 transition-all duration-300 backdrop-blur-sm
                       hover:bg-slate-900/70 shadow-inner shadow-black/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-3.5 text-gray-500 hover:text-cyan-400 focus:outline-none transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </motion.div>

        {/* Forgot Password */}
        <motion.div variants={itemVariants} className="flex justify-end">
          <Link 
            to="/forgot-password" 
            className="text-sm text-cyan-500 hover:text-cyan-300 hover:underline transition-colors flex items-center gap-1 group"
          >
           <span>Forgot Password?</span>
          </Link>
        </motion.div>

        {/* Login Button */}
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
              <span>Signing in...</span>
            </div>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2">
              Login
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

        {/* Google login */}
        <motion.button
          variants={itemVariants}
          type="button"
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 py-3 rounded-xl
                     border border-slate-700 hover:border-slate-500 transition-all font-medium group backdrop-blur-sm"
        >
          <FcGoogle size={22} className="drop-shadow-sm" /> 
          <span className="group-hover:text-white transition-colors">Sign in with Google</span>
        </motion.button>

        {/* Signup Link */}
        <motion.p variants={itemVariants} className="text-center text-slate-400 mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors ml-1">
            Sign Up
          </Link>
        </motion.p>
      </motion.form>
    </AuthLayout>
  );
};

export default LoginPage;
