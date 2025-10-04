// src/components/dashboard/charts/BarChart.tsx
// Futuristic glowing animated bar chart for TechMate dashboard

import React from "react";
import { motion } from "framer-motion";

export interface BarChartProps {
  data: { month: string; value: number }[];
    futuristic?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg overflow-hidden">
      {/* Neon aura background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-purple-500/10 blur-2xl rounded-2xl pointer-events-none" />

      {/* Chart title */}
      <h3 className="text-lg font-semibold text-cyan-400 mb-4 drop-shadow-md">
        Monthly Volume
      </h3>

      {/* SVG Chart */}
      <svg viewBox="0 0 100 100" className="w-full h-56 relative z-10">
        {/* Glowing grid lines */}
        {[20, 40, 60, 80].map((y, i) => (
          <line
            key={i}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="url(#gridGradient)"
            strokeWidth={0.3}
          />
        ))}

        {/* Gradient defs */}
        <defs>
          <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
          </linearGradient>

          <linearGradient id="gridGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.2} />
          </linearGradient>
        </defs>

        {/* Bars */}
        {data.map((d, i) => {
          const barWidth = 100 / data.length - 4;
          const x = i * (100 / data.length) + 2;
          const height = (d.value / maxValue) * 100;
          const y = 100 - height;

          return (
            <motion.rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              initial={{ height: 0, y: 100 }}
              animate={{ height, y }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
              height={height}
              fill="url(#barGradient)"
              rx="1"
              className="cursor-pointer"
              whileHover={{
                scale: 1.05,
                filter: "brightness(1.3)",
              }}
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-4 text-xs text-cyan-300 font-mono relative z-10">
        {data.map((d, i) => (
          <span key={i} className="truncate w-1/12">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
};
