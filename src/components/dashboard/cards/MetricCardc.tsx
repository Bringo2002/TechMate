// src/components/dashboard/cards/MetricCard.tsx

import React from "react";

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: string; // Optional percentage change
  color?: keyof typeof accentColors; // Optional accent color
}

// Define accent color classes based on your Tailwind config
const accentColors = {
  accentGreen: "text-dashboard-accentGreen",
  accentBlue: "text-dashboard-accentBlue",
  accentOrange: "text-dashboard-accentOrange",
  accentPurple: "text-dashboard-accentPurple",
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, color = "accentGreen" }) => {
  return (
    <div className="bg-dashboard-background rounded-xl shadow-md p-4 border border-dashboard-accentBlue hover:shadow-lg transition duration-300">
      {/* Title */}
      <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>

      {/* Value */}
      <p className={`text-2xl font-bold ${accentColors[color]}`}>{value}</p>

      {/* Optional Change Indicator */}
      {change && (
        <span className="text-xs text-gray-500 mt-1 block">
          {change.startsWith("+") ? "▲" : "▼"} {change}
        </span>
      )}
    </div>
  );
};

export default MetricCard;
