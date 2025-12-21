import React, { ReactNode, useState } from "react";
import DashboardNav from "../components/dashboard/DashboardNav";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Plus, ChevronDown, Menu, X, User, LogOut, Settings } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const notifications = [
  { id: 1, type: "success", message: "Project deployed successfully", time: "2m ago" },
  { id: 2, type: "warning", message: "3 tasks require review", time: "15m ago" },
  { id: 3, type: "info", message: "New client onboarded", time: "1h ago" },
  { id: 4, type: "success", message: "Payment received from TechCorp", time: "3h ago" },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifications] = useState(7);

  return (
    <div className="flex min-h-screen bg-[#000000] text-white font-sans antialiased">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
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
            <DashboardNav isMobile={true} onCloseMobile={() => setSidebarOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Enhanced Header */}
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-black via-gray-900/50 to-black backdrop-blur-xl border-b border-gray-800/50 relative overflow-hidden z-30"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 opacity-50"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                title="Toggle Sidebar"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5 text-gray-400" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Page Title */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Dashboard
                </h2>
                <p className="text-xs md:text-sm text-gray-400 mt-0.5 hidden sm:block">
                  Manage your tech services ecosystem
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search - Hidden on mobile */}
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search projects, clients..."
                  className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 w-64 transition-all"
                />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 hover:bg-gray-800/50 rounded-xl transition-all group"
                >
                  <Bell className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full text-xs flex items-center justify-center text-white font-medium shadow-lg shadow-emerald-500/50">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-800">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        <p className="text-xs text-gray-400 mt-1">{unreadNotifications} unread</p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                notif.type === 'success' ? 'bg-emerald-400' :
                                notif.type === 'warning' ? 'bg-amber-400' :
                                'bg-blue-400'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-200">{notif.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center border-t border-gray-800">
                        <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                          View All Notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 hover:bg-gray-800/50 rounded-xl transition-all group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black"></span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-white">Brian Mwangi</p>
                    <p className="text-xs text-gray-400">Administrator</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 hidden md:block transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-800">
                        <p className="font-semibold text-white">Brian Mwangi</p>
                        <p className="text-xs text-gray-400 mt-1">brian@nyxtech.com</p>
                      </div>
                      <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors">
                          <User className="w-4 h-4" />
                          Profile Settings
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                          Preferences
                        </button>
                        <div className="my-2 border-t border-gray-800"></div>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Action - Hidden on mobile */}
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all font-medium text-sm">
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        </motion.header>

        {/* Main content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex-1 overflow-auto bg-[#000000] p-4 md:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;