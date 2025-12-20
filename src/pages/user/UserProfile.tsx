import React, { useState, useRef } from 'react';
import supabase from '../../lib/supabaseClient';
import { 
  User, Mail, Phone, MapPin, Building, Calendar, Globe, Camera,
  Save, X, Lock, Bell, CreditCard, Shield, Eye, EyeOff, Check,
  AlertCircle, Briefcase, Award, TrendingUp, DollarSign, Package,
  Clock, CheckCircle, Trash2, Upload, MessageSquare, Settings,
  ChevronRight, Activity, FileText, Download, Zap, Star,
  Target, BarChart3, PieChart, TrendingDown, AlertTriangle
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  location: string;
  country: string;
  timezone: string;
  website: string;
  bio: string;
  avatar: string;
  joinDate: string;
  isPremium: boolean;
  isVerified: boolean;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  weeklyDigest: boolean;
  smsNotifications: boolean;
}

interface AccountStats {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  memberSince: string;
  monthlyRevenue: number;
  revenueChange: number;
}

interface Activity {
  id: string;
  action: string;
  description: string;
  time: string;
  icon: React.ElementType;
  color: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  trend?: number;
  size?: 'small' | 'large';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, trend, size = 'small' }) => (
  <div className={`relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 ${size === 'large' ? 'col-span-2' : ''}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
        <Icon size={24} style={{ color }} />
      </div>
      {trend !== undefined && (
        <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${trend >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-gray-400 text-sm mb-2">{label}</p>
    <p className="text-white text-3xl font-bold">{value}</p>
  </div>
);

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = activity.icon;

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="group bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer hover:bg-gray-800/50"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${activity.color}20` }}>
          <Icon size={20} style={{ color: activity.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white font-semibold">{activity.action}</p>
            <p className="text-gray-500 text-xs">{activity.time}</p>
          </div>
          <p className="text-gray-400 text-sm">{activity.description}</p>
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <p className="text-gray-500 text-xs">Activity ID: {activity.id}</p>
              <p className="text-indigo-400 text-xs mt-1">Click to collapse</p>
            </div>
          )}
        </div>
        <ChevronRight size={16} className={`text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
      </div>
    </div>
  );
};

interface NotificationCardProps {
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  onAction?: () => void;
  onDismiss?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ title, message, time, type, onAction, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);

  const colors = {
    info: { bg: '#3b82f620', border: '#3b82f640', icon: '#3b82f6' },
    warning: { bg: '#f59e0b20', border: '#f59e0b40', icon: '#f59e0b' },
    success: { bg: '#22c55e20', border: '#22c55e40', icon: '#22c55e' }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border transition-all duration-300"
      style={{
        backgroundColor: colors[type].bg,
        borderColor: isHovered ? colors[type].border : '#374151'
      }}
    >
      <div className="flex items-start gap-3">
        <Bell size={20} style={{ color: colors[type].icon }} className="shrink-0 mt-1" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white font-semibold">{title}</p>
            <p className="text-gray-500 text-xs">{time}</p>
          </div>
          <p className="text-gray-400 text-sm mb-3">{message}</p>
          <div className="flex gap-2">
            {onAction && (
              <button onClick={onAction} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors">
                View Details
              </button>
            )}
            {onDismiss && (
              <button onClick={onDismiss} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors">
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, confirmText, onConfirm, onCancel, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl animate-scaleIn">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-xl ${type === 'danger' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
            <AlertTriangle size={24} className={type === 'danger' ? 'text-red-500' : 'text-yellow-500'} />
          </div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            title="Change Avatar"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all duration-300 ${
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UserProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Brian',
    lastName: 'Blackwell',
    email: 'brianblackwell@gmail.com',
    phone: '+254 (254) 759449324',
    company: 'Nyxdev Innovations Inc.',
    jobTitle: 'Chief Executive Officer',
    location: 'San Francisco, CA',
    country: 'United States',
    timezone: 'PST (UTC-8)',
    website: 'https://nyxdev.com',
    bio: 'Passionate about building products that make a difference. 10+ years of experience in tech industry.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    joinDate: '2023-03-15',
    isPremium: true,
    isVerified: true
  });

  const [stats] = useState<AccountStats>({
    totalOrders: 24,
    completedOrders: 18,
    activeOrders: 6,
    totalSpent: 45280,
    avgOrderValue: 1886,
    memberSince: '2023-03-15',
    monthlyRevenue: 12500,
    revenueChange: 15.3
  });

  const [activities] = useState<Activity[]>([
    {
      id: 'ACT-001',
      action: 'Profile Updated',
      description: 'You successfully updated your profile information including job title and bio.',
      time: '2 hours ago',
      icon: User,
      color: '#6366f1'
    },
    {
      id: 'ACT-002',
      action: 'New Order Placed',
      description: 'Order #1008 - Security Audit package for $2,500',
      time: '1 day ago',
      icon: Package,
      color: '#22c55e'
    },
    {
      id: 'ACT-003',
      action: 'Password Changed',
      description: 'Your password was successfully updated from a new device.',
      time: '3 days ago',
      icon: Lock,
      color: '#eab308'
    },
    {
      id: 'ACT-004',
      action: 'Login from New Device',
      description: 'Chrome on MacOS - San Francisco, CA',
      time: '5 days ago',
      icon: Shield,
      color: '#f59e0b'
    }
  ]);

  const [security, setSecurity] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    weeklyDigest: true,
    smsNotifications: false
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = async () => {
  try {
    setIsDeleting(true);
    
    // Call the database function to delete the account
    const { error } = await supabase.rpc('delete_own_account');
    
    if (error) throw error;

    // Sign out and redirect
    await supabase.auth.signOut();
    window.location.href = '/goodbye';
    
  } catch (error) {
    console.error('Failed to delete account:', error);
    alert('Failed to delete account. Please try again or contact support.');
  } finally {
    setIsDeleting(false);
    setShowDeleteDialog(false);
  }
};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-slideInRight">
            <Check size={20} />
            <span className="font-medium">Changes saved successfully!</span>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-purple-950 rounded-3xl p-8 mb-8 overflow-hidden shadow-2xl border border-purple-800/30">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={handleAvatarClick}
                  title="Change Avatar"
                  className="absolute bottom-0 right-0 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <Camera size={18} />
                </button>
                <input
                  title="Enter your current password"
                  placeholder="Current Password"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  {profile.isVerified && (
                    <div className="p-1 bg-blue-500 rounded-full">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                  {profile.isPremium && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
                      PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-white/90 text-lg mb-1">{profile.jobTitle}</p>
                <p className="text-white/70 mb-4">{profile.company}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Joined {formatDate(profile.joinDate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[100px]">
                  <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                  <p className="text-white/70 text-sm">Orders</p>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[100px]">
                  <p className="text-3xl font-bold text-white">{stats.activeOrders}</p>
                  <p className="text-white/70 text-sm">Active</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Cancel Editing" : "Edit Profile"}
            aria-label={isEditing ? "Cancel Editing" : "Edit Profile"}
            className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl text-white transition-all duration-300 hover:scale-110"
          >
            {isEditing ? <X size={20} /> : <Settings size={20} />}
          </button>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <StatCard
            icon={Package}
            label="Total Orders"
            value={stats.totalOrders}
            color="#6366f1"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completedOrders}
            color="#22c55e"
          />
          <StatCard
            icon={Clock}
            label="Active Orders"
            value={stats.activeOrders}
            color="#f59e0b"
          />
          
          {/* Activity Feed - Spans 2 columns */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Activity size={24} className="text-indigo-400" />
                Recent Activity
              </h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Notifications - Spans 2 columns */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Bell size={24} className="text-indigo-400" />
              Notifications
            </h2>
            <div className="space-y-3">
              <NotificationCard
                title="New Order Received"
                message="Order #1009 for Security Consultation has been placed"
                time="5 min ago"
                type="success"
                onAction={() => alert('View order')}
                onDismiss={() => alert('Dismissed')}
              />
              <NotificationCard
                title="Payment Due Soon"
                message="Your premium subscription renews in 3 days"
                time="2 hours ago"
                type="warning"
                onAction={() => alert('Update payment')}
                onDismiss={() => alert('Dismissed')}
              />
              <NotificationCard
                title="Profile Views"
                message="Your profile has been viewed 45 times this week"
                time="1 day ago"
                type="info"
                onDismiss={() => alert('Dismissed')}
              />
            </div>
          </div>

          {/* Revenue Trend Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Revenue</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-bold text-white">{formatCurrency(stats.monthlyRevenue)}</h3>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold flex items-center gap-1">
                    <TrendingUp size={14} />
                    +{stats.revenueChange}%
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-1">This month</p>
              </div>
              <BarChart3 size={32} className="text-indigo-400" />
            </div>
            <div className="flex items-end justify-between h-32 gap-2">
              {[40, 65, 45, 80, 55, 90, 70, 95].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-lg transition-all duration-300 hover:from-indigo-500 hover:to-purple-500"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>

          {/* Average Order Value */}
          <StatCard
            icon={Target}
            label="Monthly Revenue"
            value={formatCurrency(stats.monthlyRevenue)}
            color="#10b981"
            trend={stats.revenueChange}
            size="large"
          />

          {/* Quick Actions Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap size={24} className="text-indigo-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <button className="p-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-white transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2">
                <Package size={24} />
                <span className="text-sm">New Order</span>
              </button>
              <button className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl text-white transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2">
                <MessageSquare size={24} />
                <span className="text-sm">Messages</span>
              </button>
              <button className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-white transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2">
                <Download size={24} />
                <span className="text-sm">Download Report</span>
              </button>
            </div>
          </div>

          {/* Security Status */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield size={24} className="text-green-400" />
              Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <span className="text-white font-medium">All systems secure</span>
                <Check size={20} className="text-green-400" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <Lock size={20} className="text-green-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">2FA Enabled</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <Check size={20} className="text-green-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Email Verified</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <Shield size={20} className="text-green-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Strong Password</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Lock size={24} className="text-indigo-400" />
              Security Settings
            </h2>

            {/* Two Factor Authentication */}
            <div className="mb-6 p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-1">Two-Factor Authentication</h3>
                  <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                </div>
                <button
                  onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
                  title={security.twoFactorEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
                  aria-label={security.twoFactorEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    security.twoFactorEnabled ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Change Password</h3>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={security.currentPassword}
                  onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Current Password"
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={security.newPassword}
                  onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="New Password"
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={security.confirmPassword}
                  onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Confirm New Password"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105">
                Update Password
              </button>
            </div>
          </div>

          {/* Notification Preferences Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Bell size={24} className="text-indigo-400" />
              Notification Preferences
            </h2>
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                <div>
                  <h3 className="text-white font-semibold mb-1">Email Notifications</h3>
                  <p className="text-gray-400 text-sm">Receive updates via email</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                  title={notifications.emailNotifications ? "Disable email notifications" : "Enable email notifications"}
                  aria-label={notifications.emailNotifications ? "Disable email notifications" : "Enable email notifications"}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    notifications.emailNotifications ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      notifications.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* Order Updates */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                <div>
                  <h3 className="text-white font-semibold mb-1">Order Updates</h3>
                  <p className="text-gray-400 text-sm">Notifications about your orders</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, orderUpdates: !notifications.orderUpdates })}
                  title={notifications.orderUpdates ? "Disable order updates" : "Enable order updates"}
                  aria-label={notifications.orderUpdates ? "Disable order updates" : "Enable order updates"}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    notifications.orderUpdates ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      notifications.orderUpdates ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* Promotions & Offers */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                <div>
                  <h3 className="text-white font-semibold mb-1">Promotions & Offers</h3>
                  <p className="text-gray-400 text-sm">Exclusive deals and discounts</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, promotions: !notifications.promotions })}
                  title={notifications.promotions ? "Disable promotions" : "Enable promotions"}
                  aria-label={notifications.promotions ? "Disable promotions" : "Enable promotions"}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    notifications.promotions ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      notifications.promotions ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                <div>
                  <h3 className="text-white font-semibold mb-1">Weekly Digest</h3>
                  <p className="text-gray-400 text-sm">Summary of your account activity</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, weeklyDigest: !notifications.weeklyDigest })}
                  title={notifications.weeklyDigest ? "Disable weekly digest" : "Enable weekly digest"}
                  aria-label={notifications.weeklyDigest ? "Disable weekly digest" : "Enable weekly digest"}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    notifications.weeklyDigest ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      notifications.weeklyDigest ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                <div>
                  <h3 className="text-white font-semibold mb-1">SMS Notifications</h3>
                  <p className="text-gray-400 text-sm">Text messages for urgent updates</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, smsNotifications: !notifications.smsNotifications })}
                  title={notifications.smsNotifications ? "Disable SMS notifications" : "Enable SMS notifications"}
                  aria-label={notifications.smsNotifications ? "Disable SMS notifications" : "Enable SMS notifications"}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    notifications.smsNotifications ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      notifications.smsNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          {/* Billing Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <CreditCard size={24} className="text-indigo-400" />
                Payment Methods
              </h2>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <Upload size={18} />
                Add Card
              </button>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold">
                    Default
                  </div>
                  <CreditCard size={32} />
                </div>
                <div className="text-2xl font-bold mb-6 tracking-wider">
                  •••• •••• •••• 4242
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/70 text-xs mb-1">Card Holder</p>
                    <p className="font-semibold">ALEX JOHNSON</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs mb-1">Expires</p>
                    <p className="font-semibold">12/25</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
              <Upload size={18} />
              Add New Card
            </button>
          </div>

          {/* Danger Zone */}
          <div className="lg:col-span-4 bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
            <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3">
              <AlertTriangle size={24} />
              Danger Zone
            </h2>
            <p className="text-gray-300 mb-6">
              Once you delete your account, there is no going back. This action is permanent and will immediately remove all your data, orders, and subscription details. Please be certain before proceeding.
            </p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 shadow-lg hover:shadow-red-500/50 whitespace-nowrap"
            >
              <Trash2 size={20} />
              Delete Account
            </button>
          </div>

          {/* Profile Edit Section (shown when editing) */}
          {isEditing && (
            <div className="lg:col-span-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <User size={24} className="text-indigo-400" />
                  Edit Profile
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">First Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Enter first name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Last Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Phone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Company</label>
                  <div className="relative">
                    <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Your company"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Job Title</label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={profile.jobTitle}
                      onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Your job title"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-gray-400 text-sm mb-2 block">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone."
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteDialog(false)}
          type="danger"
        />
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  );
};

export default UserProfile;