import React, { useState } from 'react';
import supabase from '../lib/supabaseClient';
import { NavLink } from 'react-router-dom';
import { 
  Home, Package, User, HelpCircle, LogOut, MessageSquare, Bell, 
  BarChart3, CreditCard, Settings, Menu, X 
} from 'lucide-react';

const UserDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      return;
    }

    // Redirect after logout
    window.location.href = "/login";
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home, path: '/user' },
    { id: 'orders', label: 'My Orders', icon: Package, path: '/user/orders' },
    { id: 'profile', label: 'Profile', icon: User, path: '/user/profile' },
    { id: 'support', label: 'Support', icon: HelpCircle, path: '/user/support' },
    { id: 'divider-1', label: '', icon: null, path: null, isDivider: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/user/messages' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/user/notifications' },
    { id: 'stats', label: 'Statistics', icon: BarChart3, path: '/user/stats' },
    { id: 'billing', label: 'Billing', icon: CreditCard, path: '/user/billing' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/user/settings' }
  ];

  const CollapsibleSidebar: React.FC = () => (
    <div 
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 to-gray-950 
                   border-r border-gray-800/50 backdrop-blur-xl transition-all duration-300 z-50 
                   flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-800/50">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg 
                            flex items-center justify-center font-bold text-sm text-white">
              TS
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">NyxDev</h2>
              <p className="text-xs text-gray-400"> Dashboard </p>
            </div>
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors ml-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <Menu size={20} className="text-gray-400" />
          ) : (
            <X size={20} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => {
            if (item.isDivider) {
              return (
                <div 
                  key={item.id} 
                  className={`my-2 border-t border-gray-800/50 transition-all duration-300 ${
                    isCollapsed ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              );
            }

            const Icon = item.icon as React.ElementType;

            return (
              <NavLink
                key={item.id}
                to={item.path || '#'}
                className={({ isActive }) => `w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl transition-all 
                  duration-300 group relative flex-shrink-0
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }
                `}
                title={isCollapsed ? item.label : ''}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} className="flex-shrink-0" />
                    
                    {/* Label - Hidden when collapsed */}
                    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
                      isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                    }`}>
                      {item.label}
                    </span>

                    {/* Active indicator line */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 
                                      bg-white rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout - Bottom Section */}
      <div className="p-3 md:p-4 border-t border-gray-800/50 space-y-3">
       
        {/* Logout Button */}
       <button 
  onClick={handleLogout}
  className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl 
               text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all 
               font-medium group ${isCollapsed ? 'justify-center' : ''}`}
  title={isCollapsed ? 'Logout' : ''}
>
  <LogOut size={20} className="flex-shrink-0" />
  <span className={`transition-all duration-300 ${
    isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
  }`}>
    Logout
  </span>
</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <CollapsibleSidebar />

      <div 
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
