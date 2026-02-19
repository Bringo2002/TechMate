import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageSquare,
  Zap,
  ShieldAlert,
  Info,
  Clock,
  RefreshCw,
  Sparkles,
  BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import * as notificationsService from '../../services/notifications.service';
import type { NotificationRow } from '../../types/database.types';
import Pagination from '../../components/Pagination';

// ============================================================================
// HELPERS
// ============================================================================

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return <MessageSquare className="w-5 h-5 text-emerald-400" />;
    case 'warning': return <Zap className="w-5 h-5 text-amber-400" />;
    case 'error': return <ShieldAlert className="w-5 h-5 text-red-400" />;
    default: return <Info className="w-5 h-5 text-cyan-400" />;
  }
};

const getIconBg = (type: string) => {
  switch (type) {
    case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
    case 'warning': return 'bg-amber-500/10 border-amber-500/20';
    case 'error': return 'bg-red-500/10 border-red-500/20';
    default: return 'bg-cyan-500/10 border-cyan-500/20';
  }
};

const formatTimeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [pushDismissed, setPushDismissed] = useState(() =>
    localStorage.getItem('push-banner-dismissed') === 'true'
  );

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const filters: { isRead?: boolean; type?: string } = {};
      if (filter === 'unread') filters.isRead = false;

      const { data, error } = await notificationsService.getNotifications(user.id, filters);
      if (error) {
        toast.error('Failed to load notifications');
      } else {
        let result = data || [];
        // Client-side filter for alerts (warning + error types)
        if (filter === 'alerts') {
          result = result.filter(n => n.type === 'warning' || n.type === 'error');
        }
        setNotifications(result);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ============================================================================
  // REAL-TIME SUBSCRIPTION
  // ============================================================================

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationsService.subscribeToNotifications(
      user.id,
      (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);

        // Show native browser notification if tab not focused
        if (document.hidden && pushPermission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message || '',
            icon: '/favicon.ico',
            tag: newNotification.id,
          });
        }

        toast(newNotification.title, {
          icon: '🔔',
          style: {
            borderRadius: '12px',
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        });
      }
    );

    return unsubscribe;
  }, [user, pushPermission]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleMarkAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await notificationsService.markAllAsRead(user.id);
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (id: string) => {
    await notificationsService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification removed');
  };

  const handleClearAll = async () => {
    if (!user) return;
    await notificationsService.clearAllNotifications(user.id);
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-[#0a0a16]/40 rounded-2xl p-5 border border-white/5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-slate-800 rounded mb-2" />
                  <div className="h-3 w-full bg-slate-800/50 rounded" />
                </div>
                <div className="h-3 w-16 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-w-4xl mx-auto min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-15 z-0">
        <div className="absolute top-[15%] right-[15%] w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 font-orbitron">
              <Bell className="w-8 h-8 text-cyan-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-cyan-500 text-white text-sm font-bold rounded-full shadow-lg shadow-cyan-500/30 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-slate-400 mt-2">Stay updated with your project activity and alerts.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 text-white rounded-xl border border-white/10 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-white/20"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="px-4 py-2 bg-slate-800/60 hover:bg-red-900/30 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl border border-white/10 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
            <button
              onClick={loadNotifications}
              className="px-3 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Push Notification Permission Banner */}
        {pushPermission === 'default' && !pushDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-900/40 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-5 flex items-center gap-4"
          >
            <div className="p-3 bg-indigo-500/20 rounded-xl shrink-0">
              <BellRing size={22} className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm mb-0.5">Enable Push Notifications</h4>
              <p className="text-slate-400 text-xs">Get instant browser alerts when you receive new notifications, even when this tab is in the background.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={async () => {
                  try {
                    const permission = await Notification.requestPermission();
                    setPushPermission(permission);
                    if (permission === 'granted') {
                      toast.success('Push notifications enabled!');
                      new Notification('TechMate Notifications', {
                        body: 'You will now receive browser alerts.',
                        icon: '/favicon.ico',
                      });
                    } else {
                      toast('Notifications permission denied', { icon: '🔕' });
                    }
                  } catch {
                    toast.error('Could not request permission');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Enable
              </button>
              <button
                onClick={() => {
                  setPushDismissed(true);
                  localStorage.setItem('push-banner-dismissed', 'true');
                }}
                className="px-3 py-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl text-xs transition-colors"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all' as const, label: 'All', activeClass: 'bg-white/10 text-white border-white/10' },
            { key: 'unread' as const, label: 'Unread', activeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
            { key: 'alerts' as const, label: 'Alerts & Warnings', activeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                filter === tab.key
                  ? tab.activeClass
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-[#0a0a16]/40 rounded-2xl border border-white/5 border-dashed"
              >
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={32} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                <p className="text-slate-400">No notifications to show right now.</p>
              </motion.div>
            ) : (
              notifications.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((notification, i) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                    notification.is_read
                      ? 'bg-[#0a0a16]/30 border-white/5 opacity-60 hover:opacity-100 hover:bg-[#0a0a16]/50'
                      : 'bg-[#0a0a16]/60 border-white/10 shadow-lg shadow-black/20 hover:border-cyan-500/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border shrink-0 ${getIconBg(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h3 className={`font-semibold text-base ${
                          notification.is_read ? 'text-slate-400' : 'text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse" />
                          )}
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm leading-relaxed mb-3">
                        {notification.message}
                      </p>

                      {/* Action Buttons (appear on hover) */}
                      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark as read
                          </button>
                        )}
                        {notification.link && (
                          <a
                            href={notification.link}
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            View details
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Priority glow for unread */}
                  {!notification.is_read && notification.type === 'error' && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-transparent rounded-tr-2xl -z-10 blur-xl" />
                  )}
                  {!notification.is_read && notification.type === 'warning' && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-tr-2xl -z-10 blur-xl" />
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(notifications.length / pageSize)}
          totalItems={notifications.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        {/* Footer */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-4"
          >
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <Sparkles size={12} className="text-slate-600" />
              Showing {notifications.length} notifications • Real-time updates enabled
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
