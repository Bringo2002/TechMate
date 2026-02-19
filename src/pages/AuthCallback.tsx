// src/pages/AuthCallback.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import { ProfileRow, UserRole } from "../types/database.types";
import { motion } from "framer-motion";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your account...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 1️⃣ Get the session (contains user)
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session || !data.session.user) {
          setStatus("error");
          setMessage("Verification link is invalid or expired. Please try signing up again.");
          return;
        }

        const user = data.session.user;

        // 2️⃣ Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // unexpected error
          throw profileError;
        }

        // 3️⃣ Insert profile if first-time Google signup
        let role: UserRole = "user"; // default
        if (!profileData) {
          if (!user.email) {
            throw new Error("User email is missing.");
          }

          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";

          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            role: role,
            full_name: fullName,
            user_type: "client",
            is_admin: false,
            is_active: true,
            email_verified: true,
            timezone: "UTC",
          } as any);

          if (insertError) throw insertError;
        } else {
          role = (profileData as ProfileRow).role;
        }

        // 4️⃣ Redirect based on role
        setStatus("success");
        setMessage("Your account is verified! Redirecting you...");

        setTimeout(() => {
          if (role === "admin") navigate("/dashboard", { replace: true });
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
