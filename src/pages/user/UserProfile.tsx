import React, { useState } from 'react';

interface UserData {
  name: string;
  email: string;
  avatar: string;
}

const UserProfile: React.FC = () => {
  const [user] = useState<UserData>({
    name: 'Alex Morgan',
    email: 'alex.morgan@email.com',
    avatar: 'AM'
  });

  const [formData, setFormData] = useState<UserData>(user);
  const [passwords, setPasswords] = useState({ current: '', new: '' });

  const handleSave = (): void => {
    console.log('Saving profile changes:', formData);
    // Add your save logic here
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account information</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {user.avatar}
          </div>
          <div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Change Photo
            </button>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              title="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              title="Email Address"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={handleSave}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              Save Changes
            </button>
            <button 
              onClick={() => setFormData(user)}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
