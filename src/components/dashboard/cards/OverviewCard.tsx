// src/components/dashboard/cards/OverviewCard.tsx
// Metric summary card for TechMate dashboard with dynamic styling

import React from "react";

// Props interface for metric card
export interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "neutral";
  icon: React.ReactNode;
  color: string; // Tailwind class for icon background
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
}) => (
  <div className="bg-dashboard-background rounded-xl p-6 border border-gray-700 hover:shadow-lg transition duration-300">
    
    {/* Top row: icon container */}
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${color} text-black`}>
        {icon}
      </div>
    </div>

    {/* Metric title */}
    <div className="text-sm text-gray-400 mb-1">{title}</div>

    {/* Metric value */}
    <div className="text-white text-3xl font-semibold mb-2">{value}</div>

    {/* Change indicator */}
    <div
      className={`text-sm flex items-center ${
        changeType === "positive" ? "text-green-400" : "text-gray-400"
      }`}
    >
      {/* Optional: add arrow icon or trend indicator here */}
      {change}
    </div>
  </div>
);
