import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Loader2,
  Shield,
  Download,
  Clock,
  Monitor,
  Smartphone,
  Mail,
  Globe,
  Palette,
  User,
  Building2,
  Key
} from 'lucide-react';
import { getUserById, updateProfile, deleteOwnAccount } from '../../../../services/users.service';
import authService from '../../../../services/authService';
import { DeleteAccountButton } from '../../../../components/Buttons/DeleteAccountButton';

// Define interfaces
interface ActivityLogItem {
  id: number;
  action: string;
  timestamp: string;
  ip: string;
}

interface Session {
  id: number;
  device: string;
  location: string;
  lastActive: string;
  current:  boolean;
}

export default function ProfileSettings() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    theme: 'Dark',
    language: 'English',
  });
  const [originalData, setOriginalData] = useState(formData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Email verification state
  const [emailChangeState, setEmailChangeState] = useState<'idle' | 'pending' | 'verifying'>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Delete account state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  // Session management
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, device: 'Chrome on MacOS', location: 'Nairobi, Kenya', lastActive: '2 minutes ago', current: true },
    { id: 2, device:  'Mobile App on iPhone', location: 'Nairobi, Kenya', lastActive: '1 hour ago', current: false },
    { id: 3, device: 'Firefox on Windows', location: 'Mombasa, Kenya', lastActive:  '2 days ago', current: false }
  ]);

  // Notification state
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({ 
    show: false, 
    message: '', 
    type: 'success' 
  });

  // Activity log
  const [activityLog] = useState<ActivityLogItem[]>([
    { id: 1, action: 'Password changed', timestamp: '2026-01-15 14:30', ip: '197.248.xxx.xxx' },
    { id: 2, action: 'Email updated', timestamp: '2026-01-10 09:15', ip: '197.248.xxx.xxx' },
    { id: 3, action: 'Profile updated', timestamp: '2026-01-05 16:45', ip: '197.248.xxx. xxx' }
  ]);

  // Fetch user profile data from Supabase on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let user;
        try {
          user = await authService.getMe();
        } catch (authError) {
          console.error("Authentication Error:", authError);
          showNotif("Failed to fetch profile data: User not authenticated", "error");
          return;
        }

        if (!user) {
          showNotif("Failed to fetch profile data: User not authenticated", "error");
          return;
        }

        const { data, error } = await getUserById(user.id);

        if (error || !data) {
          console.error("Database Error:", error);
          showNotif(`Failed to fetch profile data: ${error?.message ?? 'Unknown error'}`, "error");
          return;
        }

        setFormData({
          fullName: data.full_name || '',
          email: data.email || '',
          company: data.company || '',
          theme: 'Dark',
          language: 'English',
        });
        setOriginalData({
          fullName: data.full_name || '',
          email: data.email || '',
          company: data.company || '',
          theme: 'Dark',
          language: 'English',
        });
      } catch (error) {
        console.error("Unexpected Error:", error);
        showNotif("Failed to fetch profile data: Unexpected error occurred", "error");
      }
    };

    fetchProfile();
  }, []);

  // Track changes
  useEffect(() => {
    const isDifferent = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(isDifferent);
  }, [formData, originalData]);

  const showNotif = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message:  '', type: 'success' }), 4000);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleEmailChange = (newEmailValue: string) => {
    if (newEmailValue !== originalData.email) {
      setNewEmail(newEmailValue);
      setEmailChangeState('pending');
    } else {
      setEmailChangeState('idle');
      setNewEmail('');
    }
    handleInputChange('email', newEmailValue);
  };

  const sendVerificationCode = async () => {
    setEmailChangeState('verifying');
    await new Promise(resolve => setTimeout(resolve, 1000));
    showNotif('Verification code sent to your new email', 'info');
  };

  const verifyEmailChange = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (verificationCode === '123456') {
      setEmailChangeState('idle');
      setOriginalData({ ...originalData, email: newEmail });
      setFormData({ ...formData, email: newEmail });
      showNotif('Email updated successfully', 'success');
      setVerificationCode('');
      setNewEmail('');
    } else {
      showNotif('Invalid verification code', 'error');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showNotif('Please fix validation errors', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const user = await authService.getMe();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { error } = await updateProfile(user.id, {
        full_name: formData.fullName,
        email: formData.email,
        company: formData.company,
      });

      if (error) {
        throw new Error(error.message);
      }

      setOriginalData(formData);
      setHasChanges(false);
      showNotif('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showNotif('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndo = () => {
    setFormData(originalData);
    setValidationErrors({});
    setEmailChangeState('idle');
    setNewEmail('');
    setVerificationCode('');
    showNotif('Changes discarded', 'info');
  };

  // Function to handle account deletion - EXACT IMPLEMENTATION
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _deleteAccount = async () => {
    const res = await fetch("/api/account", {
      method: "DELETE",
      credentials: "include",
    });

    console.log("API Response:", res);

    if (!res.ok) {
      alert("Failed to delete account. Please try again.");
      setIsDeleting(false);
      return;
    }

    localStorage.clear();
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const { error } = await deleteOwnAccount();
      if (error) throw new Error(error.message);

      await authService.logout();
      window.location.href = '/goodbye';
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const revokeSession = async (sessionId: number) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    showNotif('Session revoked successfully', 'success');
  };

  const exportData = async () => {
    showNotif('Preparing your data export...', 'info');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const dataBlob = new Blob([JSON. stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotif('Data exported successfully', 'success');
  };

  const enable2FA = async () => {
    setShow2FASetup(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTwoFactorEnabled(true);
    setShow2FASetup(false);
    showNotif('Two-factor authentication enabled', 'success');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-zinc-500 mt-1">Manage your account preferences and security</p>
          </div>
          
          {hasChanges && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleUndo}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm font-medium transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSaving ?  'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
            <User className="text-violet-500" size={20} />
            <div>
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <p className="text-sm text-zinc-500">Update your personal details</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Full Name */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
                <p className="text-sm text-zinc-500">Your display name across the platform</p>
              </div>
              <div className="sm:w-80">
                <input 
                  id="fullName"
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full px-3 py-2 bg-black border ${validationErrors.fullName ? 'border-red-500' : 'border-zinc-800'} hover:border-zinc-700 focus:border-violet-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`}
                />
                {validationErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <XCircle size={12} />
                    {validationErrors. fullName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <p className="text-sm text-zinc-500">Primary email for notifications and login</p>
              </div>
              <div className="sm: w-80 space-y-2">
                <input 
                  id="email"
                  type="email" 
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full px-3 py-2 bg-black border ${validationErrors.email ? 'border-red-500' : 'border-zinc-800'} hover:border-zinc-700 focus:border-violet-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all`}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <XCircle size={12} />
                    {validationErrors.email}
                  </p>
                )}
                {emailChangeState === 'pending' && (
                  <button
                    onClick={sendVerificationCode}
                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    <Mail size={12} />
                    Send verification code
                  </button>
                )}
                {emailChangeState === 'verifying' && (
                  <div className="space-y-2">
                    <input
                      id="verificationCode"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e. target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    <button
                      onClick={verifyEmailChange}
                      disabled={verificationCode. length !== 6}
                      className="text-xs text-violet-400 hover:text-violet-300 disabled:text-zinc-600 disabled:cursor-not-allowed"
                    >
                      Verify email
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <label htmlFor="company" className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Building2 size={16} className="text-zinc-500" />
                  Company
                </label>
                <p className="text-sm text-zinc-500">Your organization name</p>
              </div>
              <div className="sm:w-80">
                <input 
                  id="company"
                  type="text" 
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Enter your company name"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
            <Palette className="text-violet-500" size={20} />
            <div>
              <h3 className="text-lg font-semibold">Preferences</h3>
              <p className="text-sm text-zinc-500">Customize your experience</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Theme */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Theme</label>
                <p className="text-sm text-zinc-500">Choose your interface appearance</p>
              </div>
              <div className="flex gap-2">
                {['Light', 'Dark', 'System'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => handleInputChange('theme', t)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      formData.theme === t 
                        ? 'bg-violet-600 border-violet-600 text-white' 
                        :  'bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="flex flex-col sm: flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Globe size={16} className="text-zinc-500" />
                  Language
                </label>
                <p className="text-sm text-zinc-500">Interface language preference</p>
              </div>
              <select 
                title="Language Selector"
                value={formData. language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="sm:w-80 px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Swahili</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
            <Shield className="text-violet-500" size={20} />
            <div>
              <h3 className="text-lg font-semibold">Security</h3>
              <p className="text-sm text-zinc-500">Manage security settings and authentication</p>
            </div>
          </div>

          {/* 2FA */}
          <div className="flex items-start justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Key size={16} className="text-zinc-400" />
                <h4 className="font-medium">Two-Factor Authentication</h4>
              </div>
              <p className="text-sm text-zinc-500">Add an extra layer of security to your account</p>
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  twoFactorEnabled ?  'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}>
                  {twoFactorEnabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <button
              onClick={enable2FA}
              disabled={twoFactorEnabled || show2FASetup}
              className="px-4 py-2 bg-violet-600 hover: bg-violet-700 disabled: bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all"
            >
              {show2FASetup ? 'Setting up.. .' : twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
            </button>
          </div>

          {/* Export Data */}
          <div className="flex items-start justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Download size={16} className="text-zinc-400" />
                <h4 className="font-medium">Export Your Data</h4>
              </div>
              <p className="text-sm text-zinc-500">Download a copy of your account data (GDPR compliant)</p>
            </div>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-all"
            >
              Export Data
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
            <Monitor className="text-violet-500" size={20} />
            <div>
              <h3 className="text-lg font-semibold">Active Sessions</h3>
              <p className="text-sm text-zinc-500">Manage devices with access to your account</p>
            </div>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="flex items-start gap-3">
                  {session.device.includes('Mobile') ? <Smartphone size={20} className="text-zinc-400 mt-1" /> : <Monitor size={20} className="text-zinc-400 mt-1" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{session.device}</h4>
                      {session.current && (
                        <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-400 text-xs rounded border border-emerald-800">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{session.location}</p>
                    <p className="text-xs text-zinc-600 flex items-center gap-1 mt-1">
                      <Clock size={10} />
                      Active {session.lastActive}
                    </p>
                  </div>
                </div>
                {! session.current && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="px-3 py-1.5 text-xs bg-red-900/50 hover:bg-red-900 text-red-400 border border-red-800 rounded-lg transition-all"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
            <Clock className="text-violet-500" size={20} />
            <div>
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <p className="text-sm text-zinc-500">Track changes to your account</p>
            </div>
          </div>

          <div className="space-y-2">
            {activityLog.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-zinc-500 mt-1">{activity.timestamp} • IP: {activity.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone - EXACT IMPLEMENTATION */}
        <div className="lg:col-span-4 bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
          <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3">
            <AlertTriangle size={24} />
            Danger Zone
          </h2>
          <p className="text-gray-300 mb-6">
            Once you delete your account, there is no going back. This action is permanent and will immediately remove all your data, orders, and subscription details.  Please be certain before proceeding.
          </p>
          <DeleteAccountButton
            onConfirm={handleDelete}
            isLoading={isDeleting}
          />
        </div>

        {/* Delete Confirmation Dialog - EXACT IMPLEMENTATION */}
        {showDeleteDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-4">Confirm Account Deletion</h3>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete your account?  This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                  aria-label="Cancel Deletion"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  aria-label="Confirm Deletion"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
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