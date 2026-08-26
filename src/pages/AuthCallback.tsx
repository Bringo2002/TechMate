// src/pages/AuthCallback.tsx
// Handles the redirect from Google OAuth (tokens come as query params)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setTokens } from "../lib/apiClient";
import authService from "../services/authService";
import { motion } from "framer-motion";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your account...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");

        if (!accessToken || !refreshToken) {
          setStatus("error");
          setMessage("Invalid authentication callback. Missing tokens.");
          return;
        }

        // Store tokens
        setTokens(accessToken, refreshToken);

        // Clean the URL
        window.history.replaceState({}, "", "/auth/callback");

        // Fetch user info to determine role
        const userData = await authService.getMe();

        setStatus("success");
        setMessage("Your account is verified! Redirecting you...");

        setTimeout(() => {
          if (userData.role === "ADMIN") navigate("/dashboard", { replace: true });
          else navigate("/user", { replace: true });
        }, 1500);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage(error.message || "Something went wrong during verification.");
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
