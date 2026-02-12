import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Settings, 
  Filter, 
  MessageSquare, 
  Zap, 
  ShieldAlert, 
  Info,
  Clock,
  MoreHorizontal
} from 'lucide-react';

interface Notification {
  id: number;
  type: 'message' | 'alert' | 'update' | 'info';
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  priority?: 'high' | 'medium' | 'low';
}

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'message',
      title: 'New Message from Sarah',
      description: 'Hey! I just reviewed the latest designs. Looks great, but I have a few comments...',
      time: '2 min ago',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Payment Successful',
      description: 'Your payment for the Professional Plan (October) was processed successfully.',
      time: '1 hour ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'update',
      title: 'System Update Completed',
      description: 'TechMate has been updated to v2.4.0. Check out the new features in the changelog.',
      time: 'Yesterday',
      read: true,
      priority: 'low'
    },
    {
      id: 4,
      type: 'info',
      title: 'Profile View',
      description: 'Your profile was viewed by a recruiter from TechCorp Inc.',
      time: '2 days ago',
      read: true,
      priority: 'low'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Password Expiring Soon',
      description: 'Your security policy requires a password change every 90 days. 3 days remaining.',
      time: '3 days ago',
      read: true,
      priority: 'high'
    }
  ]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'alerts') return n.type === 'alert' || n.type === 'update';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'alert': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'update': return <ShieldAlert className="w-5 h-5 text-emerald-400" />;
      default: return <Info className="w-5 h-5 text-violet-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-violet-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-violet-600 text-white text-sm font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-400 mt-2">Stay updated with your latest activity and alerts</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-700 transition-all flex items-center gap-2 text-sm font-medium"
            disabled={unreadCount === 0}
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
          <button 
            onClick={clearAll}
            className="px-4 py-2 bg-zinc-800 hover:bg-red-900/30 hover:border-red-800 hover:text-red-400 text-gray-400 rounded-xl border border-zinc-700 transition-all flex items-center gap-2 text-sm font-medium"
            disabled={notifications.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
          <button className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-700 transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            filter === 'all' 
              ? 'bg-white text-black' 
              : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          All Notifications
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            filter === 'unread' 
              ? 'bg-violet-600 text-white' 
              : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          Unread
        </button>
        <button 
          onClick={() => setFilter('alerts')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            filter === 'alerts' 
              ? 'bg-amber-600 text-white' 
              : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          Alerts & Updates
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
            <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500">No notifications found</h3>
            <p className="text-gray-600 mt-2">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                notification.read 
                  ? 'bg-zinc-950 border-zinc-900 opacity-60 hover:opacity-100 hover:bg-zinc-900' 
                  : 'bg-zinc-900 border-zinc-800 shadow-lg shadow-black/50 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  notification.read ? 'bg-zinc-800' : 'bg-zinc-800'
                }`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className={`font-semibold text-base ${
                      notification.read ? 'text-gray-400' : 'text-white'
                    }`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notification.time}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    {notification.description}
                  </p>

                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs font-semibold text-gray-500 hover:text-red-400 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Priority Indicator */}
              {notification.priority === 'high' && !notification.read && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/20 to-transparent rounded-tr-2xl -z-10 blur-xl"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
