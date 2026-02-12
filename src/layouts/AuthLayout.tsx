// src/layouts/AuthLayout.tsx
import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

interface AuthLayoutProps {
  title: string;
  description: string;
  canonical: string;
  heading: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  description,
  canonical,
  heading,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#050511] flex items-center justify-center relative overflow-hidden font-sans text-slate-200">
      {/* SEO */}
      <Helmet>
        <title>{title} | TechMate</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* --- Animated Background Elements --- */}
      
      {/* 1. Deep Space Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      {/* 2. Floating Orbs / Glows */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[100px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"
        animate={{ x: [0, -40, 0], y: [0, -60, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* 3. Moving accent lines */}
      <motion.div 
        className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
        animate={{ opacity: [0, 1, 0], x: [-1000, 1000] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* --- Main Content Card --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-1"
      >
        {/* Neon Border Gradient Wrapper */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-blue-600/30 rounded-3xl blur-sm -z-10" />
        
        {/* Glass Card */}
        <div className="relative bg-[#0a0a16]/70 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl overflow-hidden group">
          
          {/* Subtle internal shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          {/* Heading */}
          <div className="text-center mb-8 relative">
             <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
             >
               <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                 {heading}
               </h1>
               <div className="mt-2 w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full" />
             </motion.div>
          </div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {children}
          </motion.div>

        </div>
      </motion.div>

      {/* Footer / Branding */}
      <div className="absolute bottom-6 text-center text-slate-500 text-sm z-10">
        <p>&copy; {new Date().getFullYear()} TechMate. Future Ready.</p>
      </div>
    </div>
  );
};

export default AuthLayout;
