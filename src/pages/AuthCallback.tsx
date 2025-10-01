// src/pages/AuthCallback.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import { motion } from "framer-motion";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your account...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // ✅ 1. Get the session from the URL hash (email confirmation or magic link)
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.error("No session found:", error);
          setStatus("error");
          setMessage(
            "Verification link is invalid or expired. Please try signing up again."
          );
          return;
        }

        // ✅ 2. Store session automatically handled by supabase-js
        setStatus("success");
        setMessage("Your email has been confirmed! Redirecting you...");

        // ✅ 3. Redirect after short delay
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setMessage("Something went wrong during verification. Please try again.");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
      {status === "loading" && (
        <motion.div
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      <motion.h1
        className="text-2xl font-bold mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {status === "loading" && "Verifying..."}
        {status === "success" && "Success!"}
        {status === "error" && "Oops!"}
      </motion.h1>

      <p className="text-center text-gray-300 max-w-md">{message}</p>

      {status === "error" && (
        <button
          onClick={() => navigate("/signup")}
          className="mt-6 px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
        >
          Go Back to Signup
        </button>
      )}
    </div>
  );
};

export default AuthCallback;
