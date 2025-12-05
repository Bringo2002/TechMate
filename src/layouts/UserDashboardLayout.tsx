import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Package, User, HelpCircle, LogOut } from 'lucide-react';

const UserDashboardLayout: React.FC = () => {
  const location = useLocation();
  const user = {
    name: 'Alex Morgan',
    email: 'alex.morgan@email.com',
    avatar: 'AM'
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home, path: '/dashboard/user' },
    { id: 'orders', label: 'My Orders', icon: Package, path: '/dashboard/user/orders' },
    { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/user/profile' },
    { id: 'support', label: 'Support', icon: HelpCircle, path: '/dashboard/user/support' }
  ];

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-bold">
              TS
            </div>
            <div>
              <h2 className="font-bold text-lg">TechServices</h2>
              <p className="text-xs text-gray-400">Client Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
