import React, { ReactNode } from "react";
import { DashboardNav } from "../components/dashboard/DashboardNav";
import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#01062d] text-white font-sans antialiased">
      {/* Sidebar navigation */}
      <motion.aside
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <DashboardNav />
      </motion.aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col px-4 py-6 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-between items-center border-b border-transparent 
                     bg-gradient-to-r from-white/5 via-white/10 to-white/5 
                     backdrop-blur-xl rounded-xl shadow-lg px-4 py-3 mb-6"
        >
          {/* Dashboard title */}
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-600 
                       bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,212,255,0.7)]"
          >
            Dashboard
          </motion.h1>

          {/* User info block */}
          <div className="flex items-center space-x-6">
            {/* Notification + Settings */}
            <button className="p-2 rounded-full hover:bg-white/10 transition" title="Notifications">
              <Bell className="w-5 h-5 text-cyan-400 hover:scale-110 transition-transform" />
              <title>Notifications</title>
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition" title="Settings">
              <Settings className="w-5 h-5 text-purple-400 hover:rotate-90 transition-transform" />
              <title>Settings</title>
            </button>

            {/* Avatar + greeting */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src="/assets/avatar.png"
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-cyan-400 
                             shadow-[0_0_15px_rgba(0,212,255,0.7)]"
                />
                {/* Pulsing halo */}
                <span className="absolute inset-0 rounded-full border border-cyan-400 
                                animate-ping opacity-40"></span>
              </div>
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 
                               bg-clip-text text-transparent font-semibold text-sm">
                Welcome, Brian
              </span>
            </div>
          </div>
        </motion.header>

        {/* Main content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex-1 overflow-auto custom-scrollbar"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;
