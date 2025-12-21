import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Activity, Users, Settings, ChevronLeft, ChevronRight, Code, Briefcase, DollarSign, Rocket, Layers, MessageSquare, Terminal, Sparkles, X } from 'lucide-react';

const navItems = [
  { id: "overview", label: "Overview", icon: BarChart3, path: "/dashboard" },
  { id: "projects", label: "Projects", icon: Rocket, path: "/dashboard/projects" },
  { id: "services", label: "Services", icon: Code, path: "/dashboard/services" },
  { id: "clients", label: "Clients", icon: Users, path: "/dashboard/clients" },
  { id: "analytics", label: "Analytics", icon: Activity, path: "/dashboard/analytics" },
  { id: "revenue", label: "Revenue", icon: DollarSign, path: "/dashboard/revenue" },
  { id: "consulting", label: "Consulting", icon: Briefcase, path: "/dashboard/consulting" },
  { id: "deployments", label: "Deployments", icon: Layers, path: "/dashboard/deployments" },
  { id: "messages", label: "Messages", icon: MessageSquare, path: "/dashboard/messages" },
  { id: "settings", label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

interface DashboardNavProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const DashboardNav: React.FC<DashboardNavProps> = ({ isMobile = false, onCloseMobile }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed && !isMobile ? "w-20" : "w-72"
      } bg-gradient-to-b from-[#0a0a0a] to-[#000000] border-r border-gray-800/50 backdrop-blur-xl flex flex-col transition-all duration-300 relative overflow-hidden h-full`}
    >
      {/* Gradient overlay effects */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${collapsed && !isMobile ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            {(!collapsed || isMobile) && (
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Nyx</span>
                  <span className="text-white">Dev</span>
                </h1>
                <p className="text-xs text-gray-500">Admin Console</p>
              </div>
            )}
          </div>
          {!isMobile && (
            <>
              {!collapsed && (
                <button
                  title="Collapse Sidebar"
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} className="text-gray-400" />
                </button>
              )}
              {collapsed && (
                <button
                  title="Expand Sidebar"
                  onClick={() => setCollapsed(!collapsed)}
                  className="absolute right-2 top-6 p-1 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}
            </>
          )}
          {isMobile && onCloseMobile && (
            <button
              title="Close Sidebar"
              onClick={onCloseMobile}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  if (isMobile && onCloseMobile) {
                    onCloseMobile();
                  }
                }}
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5"
                    : "text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
                }`}
              >
                {isActive && (
                  <>
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-blue-500 rounded-r-full shadow-lg shadow-emerald-500/50"></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-xl blur-xl"></span>
                  </>
                )}
                <Icon className={`w-5 h-5 relative z-10 flex-shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                {(!collapsed || isMobile) && (
                  <span className="font-medium relative z-10">{item.label}</span>
                )}
                {isActive && (!collapsed || isMobile) && (
                  <Sparkles className="w-3 h-3 ml-auto text-emerald-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Status */}
        <div className="p-4 border-t border-gray-800/50">
          {(!collapsed || isMobile) ? (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full block animate-pulse"></span>
                  <span className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                </div>
                <span className="text-gray-400">All Systems Operational</span>
              </div>
              <span className="text-gray-600">v2.1.0</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative">
                <span className="w-2 h-2 bg-emerald-400 rounded-full block animate-pulse"></span>
                <span className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardNav;