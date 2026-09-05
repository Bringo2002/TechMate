import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import * as ordersService from '../services/orders.service';
import { NavLink } from 'react-router-dom';
import { 
  Home, Package, User, HelpCircle, LogOut, MessageSquare, Bell, 
  BarChart3, CreditCard, Settings, Menu, X, Sparkles, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUnreadCount as getUnreadNotifications } from '../services/notifications.service';
import { getUnreadMessageCount } from '../services/messages.service';

const UserDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeOrders, setActiveOrders] = useState<{id: string; title: string; progress: number; status: string}[]>([]);
  
  // ============================================================================
  // FETCH UNREAD COUNTS
  // ============================================================================
  useEffect(() => {
    let mounted = true;

    const fetchCounts = async () => {
      try {
        const user = await authService.getMe();
        if (!user || !mounted) return;

        const [msgCount, notifCount] = await Promise.all([
          getUnreadMessageCount(user.id),
          getUnreadNotifications(user.id),
        ]);

        if (mounted) {
          setUnreadMessages(msgCount);
          setUnreadNotifications(notifCount);
        }
      } catch { /* ignore auth errors */ }
    };

    fetchCounts();

    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);

    // Fetch active orders
    const fetchActiveOrders = async () => {
      try {
        const user = await authService.getMe();
        if (!user || !mounted) return;

      const { data: allOrders } = await ordersService.getUserOrders(user.id);
      const data = (allOrders || [])
        .filter((o: any) => ['in_progress', 'review'].includes(o.status))
        .slice(0, 3);

      if (mounted && data) {
        setActiveOrders(data);
      }
      } catch { /* ignore auth errors */ }
    };

    fetchActiveOrders();

    // Poll for updates every 15 seconds
    const pollInterval = setInterval(() => {
      if (mounted) {
        fetchCounts();
        fetchActiveOrders();
      }
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
      clearInterval(pollInterval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    window.location.href = "/login";
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home, path: '/user' },
    { id: 'orders', label: 'My Orders', icon: Package, path: '/user/orders' },
    { id: 'profile', label: 'Profile', icon: User, path: '/user/profile' },
    { id: 'support', label: 'Support', icon: HelpCircle, path: '/user/support' },
    { id: 'divider-1', label: '', icon: null, path: null, isDivider: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/user/messages', badge: unreadMessages },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/user/notifications', badge: unreadNotifications },
    { id: 'stats', label: 'Statistics', icon: BarChart3, path: '/user/stats' },
    { id: 'billing', label: 'Billing', icon: CreditCard, path: '/user/billing' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/user/settings' }
  ];

  const sidebarVariants = {
    collapsed: { width: "5rem" },
    expanded: { width: "16rem" }
  };

  return (
    <div className="flex h-screen bg-[#050511] text-white font-sans overflow-hidden relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-50 h-screen border-r border-white/5 bg-[#0a0a16]/80 backdrop-blur-xl flex flex-col shadow-2xl"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg 
                                flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-cyan-500/20 relative group">
                  <Sparkles size={20} className="text-white group-hover:animate-spin-slow transition-transform" />
                  <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white tracking-wide font-orbitron">TechMate</h2>
                  <p className="text-[10px] text-cyan-400 font-medium tracking-wider uppercase">User Portal</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors ml-auto text-slate-400 hover:text-white"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-1">
          {menuItems.map((item, index) => {
            if (item.isDivider) {
              return (
                <div 
                  key={`div-${index}`} 
                  className={`my-2 border-t border-white/5 transition-all duration-300 ${
                    isCollapsed ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              );
            }

            const Icon = item.icon as React.ElementType;
            const badgeCount = (item as Record<string, unknown>).badge as number || 0;

            return (
              <NavLink
                key={item.id}
                to={item.path || '#'}
                className={({ isActive }) => `w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl transition-all 
                  duration-300 group relative flex-shrink-0 overflow-hidden
                  ${isActive
                    ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }
                `}
                title={isCollapsed ? item.label : ''}
              >
                {({ isActive }) => (
                  <>
                    <div className={`relative z-10 p-1 rounded-lg transition-colors ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 group-hover:text-white'}`}>
                        <Icon size={20} />
                        {/* Badge dot when collapsed */}
                        {badgeCount > 0 && isCollapsed && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse" />
                        )}
                    </div>
                    
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-medium whitespace-nowrap z-10 flex-1"
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {/* Badge count when expanded */}
                    {badgeCount > 0 && !isCollapsed && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-1.5 py-0.5 min-w-[20px] text-center bg-cyan-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-cyan-500/30 z-10"
                      >
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </motion.span>
                    )}

                    {/* Active indicator glow */}
                    {isActive && !isCollapsed && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Active Orders Progress Widget */}
        {activeOrders.length > 0 && (
          <div className="px-3 pb-3 border-t border-white/5">
            <AnimatePresence>
              {!isCollapsed ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2 pt-3"
                >
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <Activity size={12} className="text-cyan-400" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Orders</span>
                  </div>
                  {activeOrders.map((order) => (
                    <NavLink
                      key={order.id}
                      to={`/user/orders/${order.id}`}
                      className="block p-2.5 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-white/5 hover:border-cyan-500/20 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-slate-300 truncate max-w-[120px] group-hover:text-white transition-colors">{order.title}</span>
                        <span className="text-[10px] font-mono text-cyan-400 shrink-0">{order.progress}%</span>
                      </div>
                      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${order.progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </NavLink>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center pt-3 gap-1.5"
                >
                  {activeOrders.map((order) => (
                    <NavLink
                      key={order.id}
                      to={`/user/orders/${order.id}`}
                      className="relative w-8 h-8 rounded-lg bg-slate-800/50 border border-white/5 hover:border-cyan-500/20 flex items-center justify-center transition-all"
                      title={`${order.title} — ${order.progress}%`}
                    >
                      <span className="text-[9px] font-mono text-cyan-400 font-bold">{order.progress}</span>
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-700 rounded-b-lg overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${order.progress}%` }} />
                      </div>
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* User Info & Logout - Bottom Section */}
        <div className="p-3 md:p-4 border-t border-white/5 space-y-3 bg-[#0a0a16]/50">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl 
                        text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all 
                        font-medium group ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                    >
                        Logout
                    </motion.span>
                )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
