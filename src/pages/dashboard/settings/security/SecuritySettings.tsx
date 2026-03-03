import React, { useState } from 'react';
import { 
  Laptop, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Shield,
  Key,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar,
  MapPin,
  Chrome,
  Monitor,
  Trash2,
  Plus,
  Check,
  Activity
} from 'lucide-react';

interface Session {
  id: string;
  device: string;
  location: string;
  current:  boolean;
  lastActive: string;
  browser: string;
  ip: string;
  loginTime: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  environment: 'production' | 'development' | 'test';
  permissions: string[];
  active: boolean;
}

interface LoginActivity {
  id: string;
  location: string;
  device: string;
  time: string;
  status: 'success' | 'failed';
  ip: string;
  method: string;
}

export default function SecuritySettings() {
  // Notification state
  const [notification, setNotification] = useState<{ 
    show: boolean; 
    message: string; 
    type:  'success' | 'error' | 'info' 
  }>({ show: false, message: '', type: 'success' });

  // Session state
  const [sessions, setSessions] = useState<Session[]>([
    { 
      id: '1',
      device: 'MacBook Pro', 
      location: 'Nairobi, Kenya', 
      current: true, 
      lastActive: 'Active now', 
      browser: 'Chrome 120 on macOS Sonoma',
      ip: '197.248.xxx.xxx',
      loginTime: 'Jan 17, 2026 at 09:00 AM'
    },
    { 
      id: '2',
      device: 'iPhone 14', 
      location: 'Nairobi, Kenya', 
      current: false, 
      lastActive: '2 hours ago', 
      browser: 'Safari on iOS 17',
      ip: '197.248.xxx.xxx',
      loginTime: 'Jan 17, 2026 at 11:30 AM'
    },
    { 
      id:  '3',
      device: 'iPad Air', 
      location: 'Mombasa, Kenya', 
      current: false, 
      lastActive: '1 day ago', 
      browser: 'Safari on iPadOS 17',
      ip: '41.90.xxx.xxx',
      loginTime: 'Jan 16, 2026 at 03:45 PM'
    }
  ]);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_prod_1234567890abcdef',
      created: 'Jan 1, 2024',
      lastUsed: '2 hours ago',
      environment: 'production',
      permissions: ['read', 'write', 'delete'],
      active: true
    },
    {
      id: '2',
      name: 'Development API',
      key: 'sk_dev_9876543210fedcba',
      created: 'Dec 15, 2023',
      lastUsed: '1 day ago',
      environment: 'development',
      permissions: ['read', 'write'],
      active: true
    }
  ]);

  // Login activity state
  const [loginActivity] = useState<LoginActivity[]>([
    { id: '1', location: 'Nairobi, Kenya', device: 'Chrome on macOS', time: '2 hours ago', status: 'success', ip: '197.248.xxx.xxx', method: 'Password' },
    { id: '2', location: 'Nairobi, Kenya', device: 'Safari on iOS', time: '5 hours ago', status: 'success', ip: '197.248.xxx.xxx', method: 'Password' },
    { id: '3', location: 'Mombasa, Kenya', device: 'Safari on iPadOS', time: '1 day ago', status: 'success', ip: '41.90.xxx.xxx', method: 'Password' },
    { id: '4', location: 'Unknown Location', device: 'Chrome on Windows', time: '3 days ago', status: 'failed', ip: '192.168.xxx. xxx', method: 'Password' }
  ]);

  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm:  false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [qrCodeUrl] = useState('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/NyxDev: brian@nyxdev.com?secret=JBSWY3DPEHPK3PXP&issuer=NyxDev');

  // API Key dialog state
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [newApiKeyData, setNewApiKeyData] = useState({
    name: '',
    environment: 'development' as 'production' | 'development' | 'test',
    permissions: [] as string[]
  });
  const [generatedKey, setGeneratedKey] = useState('');

  // Export data state
  const [isExporting, setIsExporting] = useState(false);

  const showNotif = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type:  'success' }), 4000);
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/. test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showNotif('Passwords do not match', 'error');
      return;
    }
    if (passwordStrength < 50) {
      showNotif('Password is too weak', 'error');
      return;
    }

    setIsChangingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsChangingPassword(false);
    setShowPasswordDialog(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    setPasswordStrength(0);
    setShowPasswords({ current: false, new: false, confirm: false });
    showNotif('Password changed successfully', 'success');
  };

  const handleEnable2FA = async () => {
    if (twoFactorCode.length !== 6) {
      showNotif('Please enter a 6-digit code', 'error');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    setTwoFactorEnabled(true);
    setShow2FADialog(false);
    setTwoFactorCode('');
    showNotif('Two-factor authentication enabled', 'success');
  };

  const handleDisable2FA = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTwoFactorEnabled(false);
    showNotif('Two-factor authentication disabled', 'info');
  };

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    showNotif('Session revoked successfully', 'success');
  };

  const handleRevokeAllSessions = () => {
    setSessions(sessions.filter(s => s.current));
    showNotif('All other sessions revoked', 'success');
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showNotif('API key copied to clipboard', 'success');
  };

  const handleGenerateApiKey = async () => {
    if (!newApiKeyData.name || newApiKeyData.permissions.length === 0) {
      showNotif('Please fill in all fields', 'error');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newKey = `sk_${newApiKeyData.environment}_${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(newKey);
    
    const newApiKey:  ApiKey = {
      id:  Date.now().toString(),
      name: newApiKeyData.name,
      key: newKey,
      created: 'Just now',
      lastUsed:  'Never',
      environment: newApiKeyData.environment,
      permissions: newApiKeyData.permissions,
      active: true
    };
    
    setApiKeys([... apiKeys, newApiKey]);
  };

  const handleRevokeApiKey = (id:  string) => {
    setApiKeys(apiKeys.map(key => key.id === id ? { ...key, active: false } : key));
    showNotif('API key revoked', 'success');
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    showNotif('API key deleted', 'success');
  };

  const exportSecurityData = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const data = {
      sessions,
      apiKeys:  apiKeys.map(k => ({ ...k, key: '***REDACTED***' })),
      loginActivity,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
    showNotif('Security data exported', 'success');
  };

  const togglePermission = (permission: string) => {
    setNewApiKeyData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="text-violet-500" size={32} />
              Security
            </h1>
            <p className="text-zinc-500 mt-1">Manage authentication, sessions, and API access</p>
          </div>
          
          <button
            onClick={exportSecurityData}
            disabled={isExporting}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} />
                Export Security Data
              </>
            )}
          </button>
        </div>

        {/* Authentication */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
            <Lock className="text-violet-500" size={20} />
            <div>
              <h3 className="text-lg font-semibold">Authentication</h3>
              <p className="text-sm text-zinc-500">Manage your login credentials and security methods</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Password */}
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Key size={16} className="text-zinc-400" />
                  <h4 className="font-medium">Password</h4>
                </div>
                <p className="text-sm text-zinc-500">Last changed 3 months ago</p>
                <p className="text-xs text-zinc-600 mt-1">Use a strong, unique password for your account</p>
              </div>
              <button 
                onClick={() => setShowPasswordDialog(true)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-all"
              >
                Change Password
              </button>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-zinc-400" />
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                </div>
                <p className="text-sm text-zinc-500">Add an extra layer of security with 2FA</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    twoFactorEnabled 
                      ?  'bg-emerald-900/50 text-emerald-400 border border-emerald-800' 
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {twoFactorEnabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => twoFactorEnabled ? handleDisable2FA() : setShow2FADialog(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  twoFactorEnabled
                    ? 'bg-red-900/50 hover:bg-red-900 text-red-400 border border-red-800'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <Monitor className="text-violet-500" size={20} />
              <div>
                <h3 className="text-lg font-semibold">Active Sessions</h3>
                <p className="text-sm text-zinc-500">Devices currently logged into your account</p>
              </div>
            </div>
            {sessions.filter(s => ! s.current).length > 0 && (
              <button 
                onClick={handleRevokeAllSessions}
                className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-400 border border-red-800 rounded-lg text-sm font-medium transition-all"
              >
                Revoke All Others
              </button>
            )}
          </div>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg">
                      {session.device. includes('MacBook') || session.device.includes('iPad') 
                        ? <Laptop className="w-5 h-5 text-zinc-400" /> 
                        : <Smartphone className="w-5 h-5 text-zinc-400" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{session.device}</h4>
                        {session.current && (
                          <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded text-xs font-medium">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <Chrome size={12} />
                          {session. browser}
                        </p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <MapPin size={12} />
                          {session.location} • {session.ip}
                        </p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <Calendar size={12} />
                          Logged in:  {session.loginTime}
                        </p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <Activity size={12} />
                          Last active: {session.lastActive}
                        </p>
                      </div>
                    </div>
                  </div>
                  {! session.current && (
                    <button 
                      onClick={() => handleRevokeSession(session.id)}
                      className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-400 border border-red-800 rounded-lg text-xs font-medium transition-all"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <Key className="text-violet-500" size={20} />
              <div>
                <h3 className="text-lg font-semibold">API Keys</h3>
                <p className="text-sm text-zinc-500">Manage programmatic access to your account</p>
              </div>
            </div>
            <button 
              onClick={() => setShowApiKeyDialog(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Generate New Key
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{apiKey.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        apiKey.environment === 'production' 
                          ? 'bg-red-900/50 text-red-400 border border-red-800'
                          : apiKey.environment === 'development'
                          ? 'bg-blue-900/50 text-blue-400 border border-blue-800'
                          : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                      }`}>
                        {apiKey.environment}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        apiKey.active
                          ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      }`}>
                        {apiKey.active ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>Created {apiKey.created}</span>
                      <span>•</span>
                      <span>Last used {apiKey.lastUsed}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {apiKey.permissions.map(perm => (
                        <span key={perm} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded text-xs">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-zinc-400 font-mono">
                    {apiKey.key. substring(0, 15)}••••••••••••••••••••
                  </code>
                  <button 
                    onClick={() => handleCopyApiKey(apiKey.key)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs font-medium transition-all"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {apiKey.active && (
                    <button 
                      onClick={() => handleRevokeApiKey(apiKey.id)}
                      className="px-3 py-2 bg-red-900/50 hover:bg-red-900 text-red-400 border border-red-800 rounded text-xs font-medium transition-all"
                    >
                      Revoke
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs font-medium transition-all"
                    title="Delete key"
                  >
                    <Trash2 className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Activity */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
            <Activity className="text-violet-500" size={20} />
            <div>
              <h3 className="text-lg font-semibold">Recent Login Activity</h3>
              <p className="text-sm text-zinc-500">Monitor access attempts to your account</p>
            </div>
          </div>

          <div className="space-y-2">
            {loginActivity.map((login) => (
              <div key={login.id} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${login.status === 'success' ?  'bg-emerald-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{login.device}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        login. status === 'success'
                          ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                          : 'bg-red-900/30 text-red-400 border border-red-800'
                      }`}>
                        {login.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                      <span>{login.location}</span>
                      <span>•</span>
                      <span>{login.ip}</span>
                      <span>•</span>
                      <span>{login.method}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-zinc-500">{login.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Password Change Dialog */}
        {showPasswordDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-900/30 rounded-lg">
                  <Lock className="text-violet-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Change Password</h3>
                  <p className="text-sm text-zinc-500">Update your account password</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      id="current-password"
                      type={showPasswords. current ? 'text' : 'password'}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      className="w-full px-3 py-2 pr-10 bg-black border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.new}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, new: e.target.value });
                        setPasswordStrength(calculatePasswordStrength(e.target. value));
                      }}
                      className="w-full px-3 py-2 pr-10 bg-black border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordData.new && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-500">Password strength</span>
                        <span className={`font-medium ${
                          passwordStrength < 50 ?  'text-red-400' : 
                          passwordStrength < 75 ? 'text-yellow-400' :
                          'text-emerald-400'
                        }`}>
                          {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            passwordStrength < 50 ? 'bg-red-500' : 
                            passwordStrength < 75 ? 'bg-yellow-500' :
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e. target.value })}
                      className="w-full px-3 py-2 pr-10 bg-black border border-zinc-800 rounded-lg text-sm focus:outline-none focus: ring-2 focus:ring-violet-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordData.confirm && passwordData.new !== passwordData.confirm && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <XCircle size={12} />
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                  <p className="text-xs text-zinc-400">
                    💡 Use at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPasswordData({ current: '', new: '', confirm: '' });
                    setPasswordStrength(0);
                    setShowPasswords({ current: false, new: false, confirm: false });
                  }}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed disabled: opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || ! passwordData.current || !passwordData.new || passwordData.new !== passwordData.confirm}
                  className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Changing... 
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Setup Dialog */}
        {show2FADialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-900/30 rounded-lg">
                  <Shield className="text-violet-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Enable Two-Factor Authentication</h3>
                  <p className="text-sm text-zinc-500">Secure your account with 2FA</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium">Step 1: Scan QR Code</p>
                  <p className="text-xs text-zinc-500">Use an authenticator app like Google Authenticator or Authy</p>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-xs text-zinc-500 text-center">
                    Or manually enter:  <code className="text-violet-400">JBSWY3DPEHPK3PXP</code>
                  </p>
                </div>

                <div>
                  <label htmlFor="2fa-code" className="block text-sm font-medium mb-2">Step 2: Enter Verification Code</label>
                  <input
                    id="2fa-code"
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target. value. replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-center text-xl tracking-widest focus:outline-none focus: ring-2 focus:ring-violet-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShow2FADialog(false);
                    setTwoFactorCode('');
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnable2FA}
                  disabled={twoFactorCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate API Key Dialog */}
        {showApiKeyDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-900/30 rounded-lg">
                  <Key className="text-violet-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Generate API Key</h3>
                  <p className="text-sm text-zinc-500">Create a new access token</p>
                </div>
              </div>

              {! generatedKey ?  (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Key Name</label>
                    <input
                      type="text"
                      value={newApiKeyData.name}
                      onChange={(e) => setNewApiKeyData({ ...newApiKeyData, name: e.target.value })}
                      placeholder="e.g., Production API"
                      className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Environment</label>
                    <div className="flex gap-2">
                      {(['production', 'development', 'test'] as const).map((env) => (
                        <button
                          key={env}
                          onClick={() => setNewApiKeyData({ ...newApiKeyData, environment: env })}
                          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            newApiKeyData.environment === env
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {env}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Permissions</label>
                    <div className="space-y-2">
                      {['read', 'write', 'delete']. map((perm) => (
                        <button
                          key={perm}
                          onClick={() => togglePermission(perm)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm hover:border-zinc-700 transition-all"
                        >
                          <span className="capitalize">{perm}</span>
                          {newApiKeyData.permissions.includes(perm) && (
                            <Check size={16} className="text-violet-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-3">
                    <p className="text-xs text-yellow-400">
                      ⚠️ This key will only be shown once. Make sure to copy it to a secure location.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-900/20 border border-emerald-900/50 rounded-lg p-4">
                    <p className="text-sm text-emerald-400 font-medium mb-2">✓ API Key Generated Successfully</p>
                    <p className="text-xs text-zinc-400">Copy this key now - it won't be shown again</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Your API Key</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs text-violet-400 font-mono break-all">
                        {generatedKey}
                      </code>
                      <button
                        onClick={() => handleCopyApiKey(generatedKey)}
                        title="Copy API key"
                        className="px-3 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium transition-all"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {! generatedKey ?  (
                  <>
                    <button
                      onClick={() => {
                        setShowApiKeyDialog(false);
                        setNewApiKeyData({ name: '', environment: 'development', permissions: [] });
                      }}
                      className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateApiKey}
                      disabled={! newApiKeyData.name || newApiKeyData.permissions.length === 0}
                      className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all"
                    >
                      Generate Key
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowApiKeyDialog(false);
                      setGeneratedKey('');
                      setNewApiKeyData({ name: '', environment: 'development', permissions:  [] });
                    }}
                    className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium transition-all"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification. show && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm ${
            notification.type === 'success' ?  'bg-emerald-900/90 border-emerald-800/50 text-emerald-100' : 
            notification.type === 'error' ? 'bg-red-900/90 border-red-800/50 text-red-100' :
            'bg-blue-900/90 border-blue-800/50 text-blue-100'
          }`}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5" />}
            {notification.type === 'info' && <AlertTriangle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}