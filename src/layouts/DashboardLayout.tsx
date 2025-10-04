import React, { ReactNode, useState } from "react";
import { DashboardNav } from "../components/dashboard/DashboardNav";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Settings, Menu, X } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#01062d] text-white font-sans antialiased">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar navigation - Always visible on desktop, toggleable on mobile */}
      <aside className="hidden md:block relative z-50">
        <DashboardNav />
      </aside>

      {/* Mobile sidebar - Only shows when toggled */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 z-50 h-full md:hidden"
          >
            <DashboardNav />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col px-2 py-4 md:px-4 md:py-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-between items-center border-b border-transparent 
                     bg-gradient-to-r from-white/5 via-white/10 to-white/5 
                     backdrop-blur-xl rounded-xl shadow-lg px-3 md:px-4 py-3 mb-4 md:mb-6"
        >
          {/* Left side - Mobile menu + Dashboard title */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu button - Only visible on mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-full hover:bg-white/10 transition"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Dashboard title - Responsive text size */}
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-600 
                         bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,212,255,0.7)]"
            >
              Dashboard
            </motion.h1>
          </div>

          {/* Right side - User info block */}
          <div className="flex items-center space-x-2 md:space-x-4 lg:space-x-6">
            {/* Notification + Settings - Hide on very small screens */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                className="p-2 rounded-full hover:bg-white/10 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 hover:scale-110 transition-transform" />
              </button>
              <button
                className="p-2 rounded-full hover:bg-white/10 transition"
                title="Settings"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-purple-400 hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Avatar + greeting */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative">
                <img
                  src="/assets/avatar.png"
                  alt="User Avatar"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-cyan-400 
                             shadow-[0_0_15px_rgba(0,212,255,0.7)]"
                />
                {/* Pulsing halo */}
                <span className="absolute inset-0 rounded-full border border-cyan-400 
                                animate-ping opacity-40"></span>
              </div>
              {/* Hide greeting text on small screens */}
              <span className="hidden sm:block bg-gradient-to-r from-green-400 to-cyan-400 
                               bg-clip-text text-transparent font-semibold text-xs md:text-sm">
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
