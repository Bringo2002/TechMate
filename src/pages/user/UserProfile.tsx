import React, { useState, useEffect, useRef } from 'react';
import supabase from '../../lib/supabaseClient';
import { getOrderStats } from '../../services/orders.service';
import { 
  User, Mail, MapPin, Calendar, Globe, Camera,
  Save, X, Lock, Bell, Shield, Eye, EyeOff, Check,
  Package, CheckCircle, Settings, Star, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  website: string | null;
  username: string | null;
  // Extended fields (stored in metadata or potentially separate table in future)
  phone?: string;
  company?: string;
  job_title?: string;
  location?: string;
  bio?: string;
  join_date?: string;
  is_premium?: boolean;
  is_verified?: boolean;
}

interface SecuritySettings {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  twoFactorEnabled: boolean;
}

interface AccountStats {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UserProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  
  // Security State
  const [security, setSecurity] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false // Mocked default
  });
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<AccountStats>({
    totalOrders: 0,
    completedOrders: 0,
    activeOrders: 0,
  });

  // Fetch Profile Data
  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const orderStats = await getOrderStats(authUser.id);
      setStats({
        totalOrders: orderStats.total,
        completedOrders: orderStats.completed,
        activeOrders: orderStats.active,
      });
    } catch {
      // Silently fail — stats are supplementary
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Combine auth user data with profile table data
      // For demo purposes, we'll mock some extended fields if they don't exist in DB
      const mergedProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || user.user_metadata?.full_name || '',
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || null,
        website: profileData?.website || '',
        username: profileData?.username || '',
        phone: user.phone || '',
        company: user.user_metadata?.company || 'Company Name',
        job_title: user.user_metadata?.job_title || 'Role',
        location: user.user_metadata?.location || 'Location',
        bio: user.user_metadata?.bio || 'Add a bio...',
        join_date: user.created_at,
        is_premium: false,
        is_verified: !!user.email_confirmed_at
      };

      setProfile(mergedProfile);
      setFormData(mergedProfile);
    } catch (error: unknown) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile?.id}/${fileName}`;

      toast.loading('Uploading avatar...');

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile in DB
      const updates = {
        id: profile?.id,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updates);

      if (updateError) throw updateError;

      // 4. Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast.dismiss();
      toast.success('Avatar updated!');
    } catch (error: unknown) {
      toast.dismiss();
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading avatar');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!profile?.id) return;

      const updates = {
        id: profile.id,
        full_name: formData.full_name,
        website: formData.website,
        username: formData.username,
        updated_at: new Date().toISOString(),
      };

      // Update profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      // Update auth metadata for fields not in profiles table (as a fallback/extension)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          company: formData.company,
          job_title: formData.job_title,
          location: formData.location,
          bio: formData.bio
        }
      });

      if (authError) throw authError;

      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (security.newPassword !== security.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!security.newPassword) return;

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: security.newPassword 
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setSecurity({ ...security, newPassword: '', confirmPassword: '', currentPassword: '' });
    } catch (error: unknown) {
      toast.error((error as Error).message);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Profile Header Card */}
        <div className="relative group bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 overflow-hidden shadow-2xl transition-all duration-500 hover:border-indigo-500/30">
          
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                      <User size={48} />
                    </div>
                  )}
                  
                  {/* Avatar Upload Overlay */}
                  <button 
                    onClick={handleAvatarClick}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  >
                    <Camera className="text-white drop-shadow-md" size={32} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>
              {profile.is_verified && (
                <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-slate-900 shadow-lg" title="Verified Account">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="bg-slate-800/50 border border-slate-700 text-white text-3xl font-bold rounded-lg px-3 py-1 focus:outline-none focus:border-indigo-500 w-full md:w-auto text-center md:text-left"
                    placeholder="Your Name"
                  />
                ) : (
                  <h1 className="text-4xl font-bold text-white tracking-tight">
                    {profile.full_name || 'Anonymous User'}
                  </h1>
                )}
                {profile.is_premium && (
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/10">
                    <Star size={12} fill="currentColor" /> PREMIUM
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2 max-w-md mx-auto md:mx-0">
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    className="bg-slate-800/50 border border-slate-700 text-indigo-300 text-lg rounded-lg px-3 py-1 focus:outline-none focus:border-indigo-500 w-full"
                    placeholder="Job Title"
                  />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="bg-slate-800/50 border border-slate-700 text-gray-400 rounded-lg px-3 py-1 focus:outline-none focus:border-indigo-500 w-full"
                    placeholder="Company"
                  />
                </div>
              ) : (
                <>
                  <p className="text-indigo-400 text-lg font-medium">{profile.job_title} @ {profile.company}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 text-sm pt-2">
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                      <Mail size={14} className="text-gray-500" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                        <MapPin size={14} className="text-gray-500" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                      <Calendar size={14} className="text-gray-500" />
                      <span>Joined {new Date(profile.join_date!).toLocaleDateString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 min-w-[140px]">
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                  isEditing 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 hover:scale-105'
                }`}
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isEditing ? (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                ) : (
                  <>
                    <Settings size={18} /> Edit Profile
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl font-medium transition-all"
                >
                  <X size={18} /> Cancel
                </button>
              )}
              
              {!isEditing && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl font-medium transition-all"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Stats & Info */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-5 hover:bg-slate-900/60 transition-colors">
                <div className="flex items-center gap-3 mb-2 text-indigo-400">
                  <Package size={20} />
                  <span className="text-sm font-medium">Orders</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.activeOrders} Active</p>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-5 hover:bg-slate-900/60 transition-colors">
                <div className="flex items-center gap-3 mb-2 text-green-400">
                  <CheckCircle size={20} />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.completedOrders}</p>
                <p className="text-xs text-gray-500 mt-1">100% Satisfaction</p>
              </div>
            </div>

            {/* About Me */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-indigo-400" />
                About Me
              </h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-gray-300 focus:outline-none focus:border-indigo-500 resize-none text-sm"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-400 text-sm leading-relaxed">
                  {profile.bio || "No bio added yet."}
                </p>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Website</span>
                  {isEditing ? (
                    <input
                       type="text"
                       name="website"
                       value={formData.website || ''}
                       onChange={handleInputChange}
                       className="bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1 text-right text-indigo-400 w-1/2"
                    />
                  ) : (
                    <a href={profile.website || '#'} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      {profile.website || 'Add website'} <Globe size={12} />
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  {isEditing ? (
                    <input
                       type="text"
                       name="location"
                       value={formData.location || ''}
                       onChange={handleInputChange}
                       className="bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1 text-right text-gray-300 w-1/2"
                    />
                  ) : (
                    <span className="text-gray-300">{profile.location || 'Not set'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield size={20} className="text-green-400" />
                Security Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <span className="text-green-400 text-sm font-medium">Email Verified</span>
                  <Check size={16} className="text-green-400" />
                </div>
                 <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <span className="text-gray-400 text-sm">2FA Enabled</span>
                   <div className="w-8 h-4 bg-slate-700 rounded-full relative cursor-not-allowed opacity-50">
                    <div className="w-4 h-4 bg-slate-500 rounded-full absolute left-0" />
                   </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Settings & Activity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Security Settings */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Lock size={20} className="text-indigo-400" />
                Security Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-400">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors pr-10"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-400">Confirm Password</label>
                  <input 
                    type="password"
                    placeholder="Confirm new password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handlePasswordChange}
                  disabled={!security.newPassword}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Update Password
                </button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Bell size={20} className="text-indigo-400" />
                Notifications
              </h3>
              
              <div className="space-y-4">
                {['Order Updates', 'Security Alerts', 'Marketing Emails', 'Weekly Digest'].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                    <div>
                      <p className="text-gray-200 font-medium">{item}</p>
                      <p className="text-xs text-gray-500">Receive notifications about {item.toLowerCase()}</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 cursor-pointer transition-colors hover:bg-indigo-500">
                      <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;