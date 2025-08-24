// src/components/dashboard/DashboardNav.tsx
// Sidebar navigation for TechMate dashboard with active state styling

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Activity, Users, Settings } from "lucide-react";

// Navigation items with icons and route paths
const navItems = [
  { id: "overview", label: "Overview", icon: <BarChart3 className="w-5 h-5" />, path: "/dashboard" },
  { id: "analytics", label: "Analytics", icon: <Activity className="w-5 h-5" />, path: "/dashboard/analytics" },
  { id: "clients", label: "Clients", icon: <Users className="w-5 h-5" />, path: "/dashboard/clients" },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" />, path: "/dashboard/settings" },
];

export const DashboardNav: React.FC = () => {
  const location = useLocation();

  return (
   <aside className="w-64 bg-[#01062d] text-white min-h-screen border-r border-dashboard-accentWhite p-4 flex flex-col justify-between">

      
      {/* Brand / Logo */}
<div className="mb-8">
  <h1 className="text-2xl font-bold tracking-wide">
    <span className="text-white">Tech</span>
    <span className="text-blue-500">Mate</span>
  </h1>
</div>


      {/* Navigation links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-[#2979FF] text-black shadow-md"
                  : "text-gray-400 hover:bg-[#2979FF] hover:text-white"
              }`}
            >
              {item.icon}
              <span className="ml-3 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer status indicator — can be extended for versioning or environment */}
      <div className="text-xs text-gray-400 mt-4">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-dashboard-accentGreen rounded-full mr-2 animate-pulse"></span>
          <span>DWIS 10</span>
        </div>
      </div>
    </aside>
  );
};
