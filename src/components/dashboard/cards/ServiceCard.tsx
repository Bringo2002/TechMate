// src/components/dashboard/cards/ServiceCard.tsx
// Reusable service card for TechMate dashboard with dynamic accent styling

import React from "react";

// Define allowed accent color keys based on your Tailwind config
type DashboardAccent =
  | "accentGreen"
  | "accentBlue"
  | "accentOrange"
  | "accentPurple";

// Props interface for the service card
export interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: DashboardAccent; // Optional accent color
}

// Map accent keys to Tailwind background classes
const accentColorMap: Record<DashboardAccent, string> = {
  accentGreen: "bg-dashboard-accentGreen",
  accentBlue: "bg-dashboard-accentBlue",
  accentOrange: "bg-dashboard-accentOrange",
  accentPurple: "bg-dashboard-accentPurple",
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  color = "accentBlue", // Default accent if none provided
}) => (
  <div className="bg-dashboard-background rounded-xl p-6 border border-dashboard-accentBlue hover:shadow-xl transition duration-300 hover:border-dashboard-accentGreen">
    
    {/* Icon container with dynamic accent background */}
    <div className={`inline-flex p-3 rounded-lg ${accentColorMap[color]} mb-4 text-black`}>
      {icon}
    </div>

    {/* Service title */}
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

    {/* Service description */}
    <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
  </div>
);
