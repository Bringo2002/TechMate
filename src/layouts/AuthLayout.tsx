// src/components/AuthLayout.tsx
import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

interface AuthLayoutProps {
  title: string; // Page title (SEO + heading)
  description: string; // Meta description
  canonical: string; // Canonical link
  heading: string; // Main visible heading
  children: React.ReactNode; // Form & content
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  description,
  canonical,
  heading,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] to-[#050a10] flex items-center justify-center relative overflow-hidden">
      {/* SEO */}
      <Helmet>
        <title>{title} | TechMate</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | TechMate`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="w-full h-full bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-30"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-slate-700 shadow-xl"
      >
        <h1 className="text-4xl font-extrabold text-blue-400 mb-6 text-center tracking-wide">
          {heading}
        </h1>
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;
