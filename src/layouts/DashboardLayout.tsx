// src/layouts/DashboardLayout.tsx
// Core layout for TechMate dashboard with sidebar, header, and dynamic content

import React, { ReactNode } from "react";
import { DashboardNav } from "../components/dashboard/DashboardNav";

// Props interface to allow flexible content injection
interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    // Root container: full height, dark theme, reada0ble font
    <div className="flex min-h-screen bg-[#01062d] text-white font-sans antialiased">
      
      {/* Sidebar navigation */}
      <DashboardNav />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col px-4 py-6 md:px-6 lg:px-8">
        
        {/* Header section */}
        <header className="flex justify-between items-center border-b border-gradient-to-r from-accentGreen via-accentBlue to-accentPurple pb-4 mb-6">
          
          {/* Dashboard title */}
          <h1 className="text-3xl font-bold text-accentBlue drop-shadow-md">
            Dashboard
          </h1>

          {/* User info block */}
          <div className="flex items-center space-x-4">
            {/* Avatar image */}
            <img
              src="/assets/avatar.png"
              alt="User Avatar"
              className="w-8 h-8 rounded-full border-2 border-accentGreen"
            />

            {/* Greeting text */}
            <span className="text-accentGreen font-medium">Welcome, Brian</span>
          </div>
        </header>

        {/* Main content area — scrollable and flexible */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
