import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Users, Activity, Info, Save } from 'lucide-react';
import TeamManagement from './team/TeamManagement';
import ProfileSettings from './profile/ProfileSettings'
import SecuritySettings from './security/SecuritySettings';
import NotificationSettings from './notifications/NotificationSettings';
import ActivityLogs from './activity/ActivityLogs';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  badge?: number | null;
  component: React.ComponentType;
}

export default function SettingsLayout() {
  const [selectedCategory, setSelectedCategory] = useState('team');
  const [hasChanges, setHasChanges] = useState(false);

  const categories: Category[] = [
    { id: 'team', name: 'Team Management', icon: Users, badge: 5, component: TeamManagement },
    { id: 'profile', name: 'Profile', icon: User, badge: null, component: ProfileSettings },
    { id: 'security', name: 'Security', icon: Shield, badge: null, component: SecuritySettings },
    { id: 'notifications', name: 'Notifications', icon: Bell, badge: null, component: NotificationSettings },
    { id: 'activity', name: 'Activity Logs', icon: Activity, badge: 15, component: ActivityLogs }
  ];

  const handleSaveChanges = () => {
    setHasChanges(false);
  };

  const ActiveComponent = categories.find(cat => cat.id === selectedCategory)?.component || TeamManagement;

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-600/10 border border-violet-600/20 rounded-lg">
              <Settings className="w-5 h-5 text-violet-500" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          </div>
          <p className="text-zinc-500">Manage your account and team preferences</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-1 sticky top-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <cat.icon className="w-4 h-4" />
                    <span>{cat.name}</span>
                  </div>
                  {cat.badge !== null && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      selectedCategory === cat.id
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {cat.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
              <ActiveComponent />
            </div>
          </div>
        </div>

        {/* Unsaved Changes Notification */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-4 flex items-center gap-4 z-50">
            <Info className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-zinc-300">You have unsaved changes</span>
            <div className="flex gap-2 ml-4">
              <button 
                onClick={() => setHasChanges(false)} 
                className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 rounded-md text-sm font-medium text-zinc-300 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={handleSaveChanges} 
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}