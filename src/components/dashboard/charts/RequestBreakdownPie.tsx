// src/components/dashboard/charts/RequestBreakdownPie.tsx
// Futuristic animated pie chart for TechMate dashboard

import React, { useState } from "react";

export interface PieData {
  label: string;
  value: number;
  color: string; // hex or Tailwind color
}

interface RequestBreakdownPieProps {
  data: PieData[];
    futuristic?: boolean;
}

export const RequestBreakdownPie: React.FC<RequestBreakdownPieProps> = ({ data }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;

  const createPath = (percent: number, cumulative: number, radius = 50) => {
    const startAngle = cumulative * 2 * Math.PI;
    const endAngle = (cumulative + percent) * 2 * Math.PI;

    const x1 = radius + radius * Math.sin(startAngle);
    const y1 = radius - radius * Math.cos(startAngle);
    const x2 = radius + radius * Math.sin(endAngle);
    const y2 = radius - radius * Math.cos(endAngle);

    const largeArc = percent > 0.5 ? 1 : 0;

    return `M${radius},${radius} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-2xl p-6 border border-gray-700 shadow-lg overflow-hidden">
      <h3 className="text-white text-lg font-bold mb-4 tracking-wide">Request Breakdown</h3>

      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-56 h-56">
          {data.map((d, i) => {
            const percent = d.value / total;
            const path = createPath(percent, cumulativePercent);
            const isHovered = hovered === i;

            cumulativePercent += percent;

            return (
              <path
                key={i}
                d={path}
                fill={d.color}
                className={`transition-transform duration-300 ${isHovered ? "scale-105" : ""}`}
                transform={isHovered ? "translate(2,2)" : ""}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>

        {/* Centered total label */}
        <div className="absolute text-center">
          <p className="text-gray-400 text-xs">Total</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex items-center space-x-2 text-sm text-gray-300"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{
                background: d.color,
                boxShadow: hovered === i ? `0 0 6px ${d.color}` : "none",
              }}
            />
            <span>{d.label}</span>
            <span className="ml-auto text-gray-500">
              {((d.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hovered !== null && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-md border border-gray-700 animate-fadeIn">
          {data[hovered].label}: {data[hovered].value}
        </div>
      )}
    </div>
  );
};
