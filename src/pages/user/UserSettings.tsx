import React, { useState } from 'react';
import { 
  Settings, Monitor, Moon, Sun, Cpu, Globe, 
  Shield, Bell, Database, Eye, Zap, Sliders,
  Volume2, Keyboard, Save, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  colorMode: 'vibrant' | 'minimal';
  aiPersonality: 'creative' | 'precise' | 'balanced';
  aiVoice: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  dataUsage: 'low' | 'standard' | 'high';
  autoSave: boolean;
  language: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UserSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'accessibility'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    colorMode: 'vibrant',
    aiPersonality: 'balanced',
    aiVoice: false,
    reduceMotion: false,
    highContrast: false,
    dataUsage: 'standard',
    autoSave: true,
    language: 'en-US'
  });

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setHasChanges(false);
    toast.success('Preferences saved successfully');
  };

  const handleReset = () => {
    setSettings({
      theme: 'dark',
      colorMode: 'vibrant',
      aiPersonality: 'balanced',
      aiVoice: false,
      reduceMotion: false,
      highContrast: false,
      dataUsage: 'standard',
      autoSave: true,
      language: 'en-US'
    });
    setHasChanges(true);
    toast('Settings reset to defaults', { icon: '↺' });
  };

  return (
    <div className="min-h-screen text-gray-100 p-2 md:p-0">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
              <Settings className="text-indigo-400" size={32} />
              Platform Settings
            </h1>
            <p className="text-gray-400 mt-1">Configure your workspace environment and AI preferences</p>
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
            General & Appearance
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-slate-700 shadow-xl'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Cpu size={18} className={activeTab === 'ai' ? 'text-purple-400' : ''} />
            AI Configuration
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
                        <span className="font-medium text-sm">Dark Future</span>
                      </div>
                      {settings.theme === 'dark' && (
                        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse-slow"></div>
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
                        <span className={`font-medium text-sm ${settings.theme === 'light' ? 'text-slate-900' : 'text-gray-300'}`}>Light Clean</span>
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
                        <span className="font-medium text-sm">System Sync</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Language & Formatting */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-indigo-400" />
                    Localization
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Display Language</label>
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
                  </div>
                </div>

                {/* Auto Save */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <Database size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Auto-Save Work</h4>
                      <p className="text-sm text-gray-400">Automatically save changes to cloud</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

              </div>
            )}

            {activeTab === 'ai' && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                
                {/* AI Personality */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Cpu size={20} className="text-purple-400" />
                      AI Personality Model
                    </h3>
                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-bold text-purple-400">
                      GPT-4 Enhanced
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div 
                      onClick={() => handleSettingChange('aiPersonality', 'creative')}
                      className={`flex items-center gap-4 p-4 rounded-xl border border-slate-800 cursor-pointer transition-all hover:border-purple-500/50 ${
                        settings.aiPersonality === 'creative' ? 'bg-purple-500/10 border-purple-500' : 'bg-slate-800/30'
                      }`}
                    >
                      <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg text-white">
                        <Zap size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">Creative Innovator</h4>
                        <p className="text-sm text-gray-400">Best for brainstorming, design systems, and generating novel ideas.</p>
                      </div>
                      {settings.aiPersonality === 'creative' && <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />}
                    </div>

                    <div 
                      onClick={() => handleSettingChange('aiPersonality', 'balanced')}
                      className={`flex items-center gap-4 p-4 rounded-xl border border-slate-800 cursor-pointer transition-all hover:border-purple-500/50 ${
                        settings.aiPersonality === 'balanced' ? 'bg-purple-500/10 border-purple-500' : 'bg-slate-800/30'
                      }`}
                    >
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                        <Sliders size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">Balanced Assistant</h4>
                        <p className="text-sm text-gray-400">Optimized for general code assistance, debugging, and refactoring.</p>
                      </div>
                      {settings.aiPersonality === 'balanced' && <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />}
                    </div>

                    <div 
                      onClick={() => handleSettingChange('aiPersonality', 'precise')}
                      className={`flex items-center gap-4 p-4 rounded-xl border border-slate-800 cursor-pointer transition-all hover:border-purple-500/50 ${
                        settings.aiPersonality === 'precise' ? 'bg-purple-500/10 border-purple-500' : 'bg-slate-800/30'
                      }`}
                    >
                      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white">
                        <Monitor size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">Precise Technician</h4>
                        <p className="text-sm text-gray-400">Strict adherence to documentation, type safety, and best practices.</p>
                      </div>
                      {settings.aiPersonality === 'precise' && <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />}
                    </div>
                  </div>
                </div>

                {/* AI Features */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-yellow-400" />
                    Features
                  </h3>
                   <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-700/50 rounded-lg text-gray-300">
                        <Volume2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">Voice Mode</h4>
                        <p className="text-sm text-gray-400">Enable audio responses from AI</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.aiVoice}
                        onChange={(e) => handleSettingChange('aiVoice', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <p className="text-indigo-300 text-sm">
                      <span className="font-bold">Pro Tip:</span> The "Creative Innovator" model is recommended when starting new projects or designing UI components.
                    </p>
                  </div>
                </div>

              </div>
            )}

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
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings.reduceMotion}
                          onChange={(e) => handleSettingChange('reduceMotion', e.target.checked)}
                        />
                         <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div>
                        <h4 className="font-bold text-white">High Contrast Mode</h4>
                        <p className="text-sm text-gray-400">Increase visual distinction of elements</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings.highContrast}
                          onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                        />
                         <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Info Panel */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Version</span>
                  <span className="text-white font-mono">v3.4.0 (Beta)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-400">Server Node</span>
                   <span className="text-emerald-400 flex items-center gap-1">
                     <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Online
                   </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Last Synced</span>
                  <span className="text-white">Just now</span>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-sm transition-colors">
                    Check for Updates
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Need help?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Our support team is available 24/7 to assist with your configuration.
              </p>
              <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
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