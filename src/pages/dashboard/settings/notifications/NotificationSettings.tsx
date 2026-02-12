import React, { useState } from 'react';
import { CheckCircle, XCircle, Mail, MessageSquare, Smartphone } from 'lucide-react';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface Channel {
  id: string;
  type: string;
  address: string;
  verified: boolean;
  icon: React.ElementType;
}

export default function NotificationSettings() {
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [emailNotifications, setEmailNotifications] = useState<NotificationSetting[]>([
    { id: '1', label: 'Team Activity', description: 'Get notified when team members join or leave', enabled: true },
    { id: '2', label: 'Security Alerts', description: 'Important security updates and warnings', enabled: true },
    { id: '3', label: 'Product Updates', description: 'New features and announcements', enabled: false },
    { id: '4', label: 'Weekly Summary', description: 'Weekly digest of activity', enabled: true },
    { id: '5', label: 'Deployment Alerts', description: 'Notifications for successful and failed deployments', enabled: true },
    { id: '6', label: 'Billing Updates', description: 'Invoice and payment notifications', enabled: true }
  ]);

  const [channels, setChannels] = useState<Channel[]>([
    { id: '1', type: 'Email', address: 'brian@nyxdev.com', verified: true, icon: Mail },
    { id: '2', type: 'Slack', address: '#engineering', verified: true, icon: MessageSquare },
    { id: '3', type: 'SMS', address: '+254 712 345 678', verified: false, icon: Smartphone }
  ]);

  const showNotif = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const toggleNotification = (id: string) => {
    setEmailNotifications(
      emailNotifications.map(n => 
        n.id === id ? { ...n, enabled: !n.enabled } : n
      )
    );
    const setting = emailNotifications.find(n => n.id === id);
    if (setting) {
      showNotif(`${setting.label} ${setting.enabled ? 'disabled' : 'enabled'}`, 'success');
    }
  };

  const verifyChannel = (id: string) => {
    setChannels(channels.map(c => c.id === id ? { ...c, verified: true } : c));
    const channel = channels.find(c => c.id === id);
    if (channel) {
      showNotif(`${channel.type} verified successfully`, 'success');
    }
  };

  const removeChannel = (id: string) => {
    const channel = channels.find(c => c.id === id);
    setChannels(channels.filter(c => c.id !== id));
    if (channel) {
      showNotif(`${channel.type} channel removed`, 'success');
    }
  };

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Email Notifications</h3>
          <p className="text-sm text-zinc-500">Choose what updates you receive</p>
        </div>
        <div className="space-y-4">
          {emailNotifications.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-8 py-3">
              <div className="flex-1 space-y-1">
                <label className="block text-sm font-medium text-zinc-100">{n.label}</label>
                <p className="text-sm text-zinc-500">{n.description}</p>
              </div>
              <button 
                onClick={() => toggleNotification(n.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  n.enabled ? 'bg-violet-600' : 'bg-zinc-800'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  n.enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Notification Frequency</h3>
          <p className="text-sm text-zinc-500">Control how often you receive notifications</p>
        </div>
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Digest Frequency</label>
            <p className="text-sm text-zinc-500">How often to send summary emails</p>
          </div>
          <select 
            aria-label="Digest Frequency"
            title="Select Digest Frequency"
            className="w-80 px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          >
            <option>Real-time</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Never</option>
          </select>
        </div>
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Quiet Hours</label>
            <p className="text-sm text-zinc-500">Don't send notifications during these hours</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="time" 
              defaultValue="22:00"
              title="Set Quiet Hours Start Time"
              className="px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
            <span className="text-zinc-500">to</span>
            <input 
              type="time" 
              defaultValue="08:00"
              title="Set Quiet Hours End Time"
              className="px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Notification Channels</h3>
          <p className="text-sm text-zinc-500">Where to send notifications</p>
        </div>
        <div className="space-y-3">
          {channels.map((c) => (
            <div key={c.id} className="p-4 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <c.icon className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-100">{c.type}</div>
                    <div className="text-xs text-zinc-500 mt-1">{c.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.verified ? (
                    <>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-900/30 text-emerald-300 border border-emerald-800/50 rounded text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                      <button 
                        onClick={() => removeChannel(c.id)}
                        className="px-3 py-1.5 border border-red-900/50 text-red-400 hover:bg-red-950/50 rounded text-xs font-medium transition-all"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => verifyChannel(c.id)}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-md text-sm font-medium text-zinc-300 transition-all">
            Add Channel
          </button>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Push Notifications</h3>
          <p className="text-sm text-zinc-500">Browser and mobile push notifications</p>
        </div>
        <div className="p-4 border border-zinc-900 rounded-lg bg-zinc-900/20">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-zinc-100">Browser Notifications</div>
              <div className="text-xs text-zinc-500 mt-1">Receive notifications in your browser</div>
            </div>
            <button title="Toggle Browser Notifications" className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
        <div className="p-4 border border-zinc-900 rounded-lg bg-zinc-900/20">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-zinc-100">Mobile Push</div>
              <div className="text-xs text-zinc-500 mt-1">Receive notifications on your mobile device</div>
            </div>
            <button title="Toggle Mobile Push Notifications" className="relative inline-flex h-6 w-11 items-center rounded-full bg-violet-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification.show && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${
            notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-800/50 text-emerald-100' :
            'bg-red-900/90 border-red-800/50 text-red-100'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}