// src/components/dashboard/cards/MetricCard.tsx
// Futuristic glowing metric card for TechMate dashboard

import React from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: string; // Optional percentage change
  color?: keyof typeof accentGradients;
  futuristic?: boolean;
}

// Accent gradient map
const accentGradients = {
  accentGreen: "from-green-400 via-emerald-500 to-green-600",
  accentBlue: "from-cyan-400 via-blue-500 to-indigo-500",
  accentOrange: "from-orange-400 via-amber-500 to-orange-600",
  accentPurple: "from-purple-400 via-fuchsia-500 to-pink-500",
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  color = "accentGreen",
}) => {
  const isPositive = change?.startsWith("+");

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-md 
                 border border-white/10 shadow-lg overflow-hidden"
    >
      {/* Neon glow aura */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${accentGradients[color]} opacity-20 blur-xl`}
      ></div>

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-400 mb-2 relative z-10">
        {title}
      </h3>

      {/* Value */}
      <p
        className={`text-3xl font-extrabold bg-gradient-to-r ${accentGradients[color]} bg-clip-text text-transparent relative z-10`}
      >
        {value}
      </p>

      {/* Change indicator */}
      {change && (
        <motion.span
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className={`text-xs font-medium mt-2 block relative z-10 ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {isPositive ? "▲" : "▼"} {change}
        </motion.span>
      )}
    </motion.div>
  );
};

export default MetricCard;
