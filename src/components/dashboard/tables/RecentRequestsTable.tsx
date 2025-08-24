// src/components/dashboard/tables/RecentRequestsTable.tsx

import React from "react";
import { Request } from "../../../types/dashboard";


// Sample data to populate the table

// Tailwind classes for status badge styling with glow effect
const statusColors: Record<Request["status"], string> = {
  Pending: "bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-400/30",
  "In Progress": "bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/30",
  Completed: "bg-green-500/20 text-green-400 ring-1 ring-green-400/30",
};

// Props interface for RecentRequestsTable
interface RecentRequestsTableProps {
  data: Request[];
}

// Main table component
export const RecentRequestsTable: React.FC<RecentRequestsTableProps> = ({ data }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
      {/* Table title */}
      <h2 className="text-xl font-semibold text-white mb-4">Recent Requests</h2>

      {/* Responsive wrapper for horizontal scroll on small screens */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          {/* Sticky header for better UX */}
          <thead className="text-xs uppercase bg-gray-800 text-gray-400 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>

          {/* Table body with alternating row colors and hover effect */}
          <tbody>
            {data.map((req, idx) => (
              <tr
                key={req.id}
                className={`border-b border-gray-700 hover:bg-gray-800 transition ${
                  idx % 2 === 0 ? "bg-gray-900" : "bg-gray-950"
                }`}
              >
                <td className="px-4 py-3">{req.service}</td>
                <td className="px-4 py-3">{req.client}</td>

                {/* Status badge with dynamic styling */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${statusColors[req.status]}`}
                  >
                    {req.status}
                  </span>
                </td>

                <td className="px-4 py-3">{req.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
