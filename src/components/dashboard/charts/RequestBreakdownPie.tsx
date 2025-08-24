// src/components/dashboard/charts/RequestBreakdownPie.tsx

import React from "react";

// Define the shape of each pie slice's data
export interface PieData {
  label: string;
  value: number;
  color: string; // Tailwind-compatible or hex color
}

// Props for the pie chart component
interface RequestBreakdownPieProps {
  data: PieData[];
}

export const RequestBreakdownPie: React.FC<RequestBreakdownPieProps> = ({ data }) => {
  // Calculate total value to determine slice proportions
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;

  /**
   * Generates an SVG path for a pie slice based on percentage
   * @param percent - fraction of the circle (0 to 1)
   * @param radius - radius of the pie chart
   */
  const createPath = (percent: number, radius = 50) => {
    const angle = percent * 2 * Math.PI;
    const x = radius + radius * Math.sin(angle);
    const y = radius - radius * Math.cos(angle);
    const largeArc = percent > 0.5 ? 1 : 0;

    // SVG arc path from center to outer edge
    return `M${radius},${radius} L${radius},0 A${radius},${radius} 0 ${largeArc} 1 ${x},${y} Z`;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 shadow-md">
      {/* Chart title */}
      <h3 className="text-white text-lg font-semibold mb-4">Request Breakdown</h3>

      {/* SVG container for pie chart */}
      <svg viewBox="0 0 100 100" className="w-full h-48">
        {data.map((d, i) => {
          const percent = d.value / total;
          const path = createPath(cumulativePercent + percent);
          cumulativePercent += percent;

          return (
            <path
              key={i}
              d={path}
              fill={d.color}
              className="transition duration-300 hover:opacity-80"
            />
          );
        })}
      </svg>

      {/* Legend below the chart */}
      <div className="mt-4 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center space-x-2 text-sm text-gray-300">
            <span
              className={`inline-block w-3 h-3 rounded-full pie-color-${i}`}
            />
            <span>{d.label}</span>
            <span className="ml-auto text-gray-500">{((d.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
