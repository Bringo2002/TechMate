// src/components/dashboard/charts/BarChart.tsx
// Responsive, dark-themed bar chart using SVG for TechMate dashboard

import React from "react";

// Props interface for bar chart data
export interface BarChartProps {
  data: { month: string; value: number }[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  // Determine the highest value for vertical scaling
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 shadow-md">
      {/* Chart title */}
      <h3 className="text-white text-lg font-semibold mb-4">Monthly Volume</h3>

      {/* SVG container for bar chart */}
      <svg viewBox="0 0 100 100" className="w-full h-48">
        {/* Background grid lines for reference */}
        {[20, 40, 60, 80].map((y, i) => (
          <line
            key={i}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#4B5563"
            strokeDasharray="2,2"
            strokeWidth={0.5}
          />
        ))}

        {/* Bars for each data point */}
        {data.map((d, i) => {
          const barWidth = 100 / data.length - 4; // spacing between bars
          const x = i * (100 / data.length) + 2; // horizontal position
          const height = (d.value / maxValue) * 100;
          const y = 100 - height;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={height}
              fill="#10B981" // emerald accent
              className="transition-all duration-300 hover:opacity-80"
            />
          );
        })}
      </svg>

      {/* Month labels below bars */}
      <div className="flex justify-between mt-4 text-xs text-gray-400">
        {data.map((d, i) => (
          <span key={i} className="w-1/12 text-center truncate">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
};
