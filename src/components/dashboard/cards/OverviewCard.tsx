// src/components/dashboard/cards/OverviewCard.tsx
// Futuristic glass-neon Metric Card for TechMate dashboard

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "neutral" | "negative";
  icon: React.ReactNode;
  color: string; // Tailwind neon color (e.g. "from-accentBlue to-accentPurple")
  futuristic?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
}) => {
  const changeIcon =
    changeType === "positive" ? (
      <ArrowUpRight className="w-4 h-4 text-green-400" />
    ) : changeType === "negative" ? (
      <ArrowDownRight className="w-4 h-4 text-red-400" />
    ) : (
      <Minus className="w-4 h-4 text-gray-400" />
    );

  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: "0px 0px 25px rgba(0, 200, 255, 0.5)" }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative rounded-2xl p-6 bg-white/5 backdrop-blur-md 
                 border border-white/10 shadow-lg overflow-hidden"
    >
      {/* Glow border effect */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-20 blur-xl`}
      ></div>

      {/* Icon pod */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-md`}
        >
          {icon}
        </motion.div>
      </div>

      {/* Title */}
      <div className="text-sm text-gray-400 mb-1 relative z-10">{title}</div>

      {/* Value */}
      <motion.div
        key={value} // triggers re-animation on value change
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-white text-4xl font-bold mb-2 relative z-10 tracking-tight"
      >
        {value}
      </motion.div>

      {/* Change indicator */}
      <div
        className={`text-sm flex items-center gap-1 relative z-10 ${
          changeType === "positive"
            ? "text-green-400"
            : changeType === "negative"
            ? "text-red-400"
            : "text-gray-400"
        }`}
      >
        {changeIcon} {change}
      </div>
    </motion.div>
  );
};
