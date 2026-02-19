import React, { useState, useEffect } from 'react';
import {
  Settings, Monitor, Moon, Sun, Globe,
  Database as DatabaseIcon, Eye, Save, RotateCcw,
  Bell, BellOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import supabase from '../../lib/supabaseClient';
import type { UserSettingsInsert } from '../../types/database.types';
import { useAuth } from '../../hooks/useAuth';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  reduceMotion: boolean;
  highContrast: boolean;
  autoSave: boolean;
  language: string;
  notification_email: boolean;
  notification_push: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  reduceMotion: false,
  highContrast: false,
  autoSave: true,
  language: 'en-US',
  notification_email: true,
  notification_push: true,
};

// ============================================================================
// TOGGLE COMPONENT
// ============================================================================

function Toggle({
  checked,
  onChange,
  color = 'indigo'
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  color?: 'indigo' | 'emerald' | 'cyan';
}) {
  const colors = {
    indigo: 'peer-checked:bg-indigo-600',
    emerald: 'peer-checked:bg-emerald-600',
    cyan: 'peer-checked:bg-cyan-600',
  };
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={`w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/50 rounded-full peer ${colors[color]} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`} />
    </label>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UserSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'accessibility'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // ============================================================================
  // LOAD SETTINGS FROM DB
  // ============================================================================

  useEffect(() => {
    if (user) loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which means no settings saved yet
        console.error('Failed to load settings:', error);
      }

      if (data) {
        const row = data as Record<string, unknown>;
        setSettings({
          theme: row.theme || 'dark',
          reduceMotion: row.reduce_motion ?? false,
          highContrast: row.high_contrast ?? false,
          autoSave: row.auto_save ?? true,
          language: row.language || 'en-US',
          notification_email: row.notification_email ?? true,
          notification_push: row.notification_push ?? true,
        });
      }
    } catch {
      // Fallback to defaults — no error toast needed since the component handles defaults
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSettingChange = (key: keyof AppSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const settingsData: UserSettingsInsert = {
        user_id: user.id,
        theme: settings.theme,
        reduce_motion: settings.reduceMotion,
        high_contrast: settings.highContrast,
        auto_save: settings.autoSave,
        language: settings.language,
        notification_email: settings.notification_email,
        notification_push: settings.notification_push,
        color_mode: 'vibrant',
        ai_personality: 'balanced',
        ai_voice: false,
        data_usage: 'standard',
        notification_sms: false,
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData as unknown as Record<string, unknown>);

      if (error) throw error;

      // Also save to localStorage for immediate theme/accessibility application
      localStorage.setItem('techmate_settings', JSON.stringify(settings));

      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
    toast('Settings reset to defaults — click Save to apply', { icon: '↺' });
  };

  // ============================================================================
  // LOADING
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen text-gray-100 p-2 md:p-0">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="h-10 w-64 bg-slate-800 rounded animate-pulse" />
          <div className="h-12 w-96 bg-slate-800 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-900/40 rounded-2xl p-6 animate-pulse">
                  <div className="h-5 w-32 bg-slate-800 rounded mb-4" />
                  <div className="h-20 bg-slate-800/50 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="bg-slate-900/40 rounded-2xl p-6 animate-pulse">
                <div className="h-5 w-24 bg-slate-800 rounded mb-4" />
                <div className="h-32 bg-slate-800/50 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen text-gray-100 p-2 md:p-0">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
              <Settings className="text-indigo-400" size={32} />
              Settings
            </h1>
            <p className="text-gray-400 mt-1">Manage your display preferences and notification settings.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`px-6 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-lg
                ${hasChanges
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 cursor-pointer'
                  : 'bg-slate-800/50 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'general'
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-slate-700 shadow-xl'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Monitor size={18} className={activeTab === 'general' ? 'text-indigo-400' : ''} />
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-slate-700 shadow-xl'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Bell size={18} className={activeTab === 'notifications' ? 'text-cyan-400' : ''} />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('accessibility')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'accessibility'
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-slate-700 shadow-xl'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Eye size={18} className={activeTab === 'accessibility' ? 'text-emerald-400' : ''} />
            Accessibility
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Settings Panel */}
          <div className="lg:col-span-2 space-y-6">

            {/* =================== GENERAL/APPEARANCE =================== */}
            {activeTab === 'general' && (
              <div className="flex flex-col gap-6 animate-fadeIn">

                {/* Theme Selection */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Monitor size={20} className="text-indigo-400" />
                    Interface Theme
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => handleSettingChange('theme', 'dark')}
                      className={`relative p-4 rounded-xl border-2 transition-all group overflow-hidden ${
                        settings.theme === 'dark'
                          ? 'border-indigo-500 bg-slate-800/80 shadow-lg shadow-indigo-500/10'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <Moon size={24} className={settings.theme === 'dark' ? 'text-indigo-400' : 'text-gray-500'} />
                        <span className="font-medium text-sm">Dark</span>
                      </div>
                      {settings.theme === 'dark' && (
                        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSettingChange('theme', 'light')}
                      className={`relative p-4 rounded-xl border-2 transition-all group overflow-hidden ${
                        settings.theme === 'light'
                          ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-500/10'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <Sun size={24} className={settings.theme === 'light' ? 'text-indigo-600' : 'text-gray-500'} />
                        <span className={`font-medium text-sm ${settings.theme === 'light' ? 'text-slate-900' : 'text-gray-300'}`}>Light</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSettingChange('theme', 'system')}
                      className={`relative p-4 rounded-xl border-2 transition-all group overflow-hidden ${
                        settings.theme === 'system'
                          ? 'border-indigo-500 bg-slate-800/80 shadow-lg shadow-indigo-500/10'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <Monitor size={24} className={settings.theme === 'system' ? 'text-indigo-400' : 'text-gray-500'} />
                        <span className="font-medium text-sm">System</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-indigo-400" />
                    Language
                  </h3>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>

                {/* Auto Save */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <DatabaseIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Auto-Save</h4>
                      <p className="text-sm text-gray-400">Automatically save work to cloud</p>
                    </div>
                  </div>
                  <Toggle checked={settings.autoSave} onChange={(v) => handleSettingChange('autoSave', v)} />
                </div>
              </div>
            )}

            {/* =================== NOTIFICATIONS =================== */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Bell size={20} className="text-cyan-400" />
                    Notification Preferences
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                          <Bell size={18} />
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive updates about your projects via email</p>
                        </div>
                      </div>
                      <Toggle checked={settings.notification_email} onChange={(v) => handleSettingChange('notification_email', v)} color="cyan" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                          <BellOff size={18} />
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">Push Notifications</p>
                          <p className="text-xs text-gray-500">Receive browser push notifications for real-time alerts</p>
                        </div>
                      </div>
                      <Toggle checked={settings.notification_push} onChange={(v) => handleSettingChange('notification_push', v)} color="cyan" />
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6">
                  <p className="text-indigo-300 text-sm">
                    <span className="font-bold">Note:</span> You'll always receive critical security and billing alerts regardless of your notification preferences.
                  </p>
                </div>
              </div>
            )}

            {/* =================== ACCESSIBILITY =================== */}
            {activeTab === 'accessibility' && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Eye size={20} className="text-emerald-400" />
                    Visual Adjustments
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div>
                        <h4 className="font-bold text-white">Reduced Motion</h4>
                        <p className="text-sm text-gray-400">Minimize animations and transitions</p>
                      </div>
                      <Toggle checked={settings.reduceMotion} onChange={(v) => handleSettingChange('reduceMotion', v)} color="emerald" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div>
                        <h4 className="font-bold text-white">High Contrast Mode</h4>
                        <p className="text-sm text-gray-400">Increase visual distinction of elements</p>
                      </div>
                      <Toggle checked={settings.highContrast} onChange={(v) => handleSettingChange('highContrast', v)} color="emerald" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info Panel */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">About</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Platform</span>
                  <span className="text-white font-mono">TechMate</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Account</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Active
                  </span>
                </div>
                {user && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">User ID</span>
                    <span className="text-slate-500 font-mono text-xs truncate max-w-[120px]" title={user.id}>
                      {user.id.slice(0, 8)}...
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Need help?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Our support team is available 24/7 to assist with your configuration.
              </p>
              <button
                onClick={() => window.location.href = '/user/support'}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;