// src/components/dashboard/charts/LineChart.tsx
// Styled line chart component for TechMate dashboard using SVG

import React from "react";

// Props interface for the line chart
export interface LineChartProps {
  data: { month: string; value: number }[]; // array of monthly data points
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  // Determine the highest value for vertical scaling
  const maxValue = Math.max(...data.map(d => d.value));

  // Generate SVG polyline points from data
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100; // evenly distribute along x-axis
      const y = 100 - (d.value / maxValue) * 100; // scale y-axis inversely
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 shadow-md">
      {/* Chart title */}
      <h3 className="text-white text-lg font-semibold mb-4">Monthly Trends</h3>

      {/* SVG container for the line chart */}
      <svg viewBox="0 0 100 100" className="w-full h-48">
        {/* Background grid lines for visual reference */}
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

        {/* Line connecting the data points */}
        <polyline
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          points={points}
          className="transition-all duration-300"
        />

        {/* Circles at each data point */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.value / maxValue) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2}
              fill="#3B82F6"
              className="hover:scale-110 transition-transform"
            />
          );
        })}
      </svg>

      {/* Month labels below the chart */}
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
