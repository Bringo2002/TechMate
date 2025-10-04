// src/components/dashboard/charts/LineChart.tsx
// Futuristic animated line chart for TechMate dashboard

import React, { useState } from "react";

export interface LineChartProps {
  data: { month: string; value: number }[];
    futuristic?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value));

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-2xl p-6 border border-gray-700 shadow-lg overflow-hidden">
      <h3 className="text-white text-lg font-bold mb-4 tracking-wide">
        Monthly Trends
      </h3>

      <svg viewBox="0 0 100 100" className="w-full h-56">
        {/* Background pulsing grid */}
        {[20, 40, 60, 80].map((y, i) => (
          <line
            key={i}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(75,85,99,0.3)"
            strokeDasharray="3,3"
            strokeWidth={0.4}
            className="animate-pulse"
          />
        ))}

        {/* Area gradient under the line */}
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0)" />
          </linearGradient>
        </defs>

        {/* Filled area under line */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#fillGradient)"
          className="animate-[pulse_6s_infinite]"
        />

        {/* Line path */}
        <polyline
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
          className="animate-[dash_3s_ease-in-out_forwards]"
        />

        {/* Data point circles */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.value / maxValue) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={hovered === i ? 3.5 : 2}
              fill="#06b6d4"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>

      {/* Month labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium tracking-wide">
        {data.map((d, i) => (
          <span key={i} className="w-1/12 text-center truncate">
            {d.month}
          </span>
        ))}
      </div>

      {/* Tooltip */}
      {hovered !== null && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-md border border-gray-700 animate-fadeIn">
          {data[hovered].month}: {data[hovered].value}
        </div>
      )}
    </div>
  );
};
