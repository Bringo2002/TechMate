// src/components/dashboard/DashboardNav.tsx
// Futuristic sidebar navigation with active highlight and glow effects

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Activity, Users, Settings, ChevronLeft, ChevronRight } from "lucide-react";

const navItems = [
  { id: "overview", label: "Overview", icon: <BarChart3 className="w-5 h-5" />, path: "/dashboard" },
  { id: "analytics", label: "Analytics", icon: <Activity className="w-5 h-5" />, path: "/dashboard/analytics" },
  { id: "clients", label: "Clients", icon: <Users className="w-5 h-5" />, path: "/dashboard/clients" },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" />, path: "/dashboard/settings" },
];

export const DashboardNav: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-[#01062d] text-white min-h-screen border-r border-dashboard-accentWhite p-4 flex flex-col justify-between transition-all duration-300`}
    >
      {/* Brand / Logo */}
      <div className="mb-8 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-2xl font-bold tracking-wide">
            <span className="text-white">Nyx</span>
            <span className="text-blue-500">Dev</span>
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-2 relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`group relative flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-[#2979FF] text-black shadow-md"
                  : "text-gray-400 hover:bg-[#1a2d6b] hover:text-white"
              }`}
            >
              {/* Active glow bar */}
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md shadow-glow animate-pulse"></span>
              )}
              {item.icon}
              {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer status indicator */}
      <div className="text-xs text-gray-400 mt-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <span className="w-2 h-2 bg-dashboard-accentGreen rounded-full mr-2 animate-pulse"></span>
            <span>v1.0.0 • Online</span>
          </div>
        )}
      </div>
    </aside>
  );
};
