// src/components/dashboard/cards/ServiceCard.tsx
// Futuristic glass-neon Service Card for TechMate dashboard

import React from "react";
import { motion } from "framer-motion";

// Accent options mapped to gradients instead of flat colors
type DashboardAccent =
  | "accentGreen"
  | "accentBlue"
  | "accentOrange"
  | "accentPurple";

const accentGradientMap: Record<DashboardAccent, string> = {
  accentGreen: "from-green-400 via-emerald-500 to-green-600",
  accentBlue: "from-cyan-400 via-blue-500 to-indigo-500",
  accentOrange: "from-orange-400 via-amber-500 to-orange-600",
  accentPurple: "from-purple-400 via-fuchsia-500 to-pink-500",
};

export interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: DashboardAccent; 
  futuristic?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  color = "accentBlue",
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative rounded-2xl p-6 bg-white/5 backdrop-blur-md 
                 border border-white/10 shadow-lg overflow-hidden"
    >
      {/* Glow border */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${accentGradientMap[color]} opacity-20 blur-xl`}
      ></div>

      {/* Icon orb */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${accentGradientMap[color]} text-black shadow-lg relative z-10 mb-4`}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2 relative z-10 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-300 leading-relaxed relative z-10">
        {description}
      </p>
    </motion.div>
  );
};
