// src/components/dashboard/tables/RecentRequestsTable.tsx
import React from "react";
import { motion } from "framer-motion";
import { Request } from "../../../types/dashboard";

// Futuristic status badge styles
const statusColors: Record<Request["status"], string> = {
  Pending: "bg-yellow-400/10 text-yellow-300 border border-yellow-400/40 shadow-[0_0_8px_2px_rgba(250,204,21,0.3)]",
  "In Progress": "bg-blue-400/10 text-blue-300 border border-blue-400/40 shadow-[0_0_8px_2px_rgba(59,130,246,0.3)]",
  Completed: "bg-green-400/10 text-green-300 border border-green-400/40 shadow-[0_0_8px_2px_rgba(34,197,94,0.3)]",
};

interface RecentRequestsTableProps {
  data: Request[];
    futuristic?: boolean;
}

export const RecentRequestsTable: React.FC<RecentRequestsTableProps> = ({ data }) => {
  return (
    <div className="relative overflow-hidden bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
      {/* Subtle glowing border effect */}
      <div className="absolute inset-0 rounded-2xl border border-blue-500/20 pointer-events-none animate-pulse"></div>

      {/* Table title */}
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 tracking-wide">
        Recent Requests
      </h2>

      {/* Responsive wrapper */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          {/* Futuristic header */}
          <thead className="text-xs uppercase bg-gray-800/60 text-blue-300 sticky top-0 z-10 backdrop-blur-lg">
            <tr>
              <th className="px-4 py-3 tracking-wider">Service</th>
              <th className="px-4 py-3 tracking-wider">Client</th>
              <th className="px-4 py-3 tracking-wider">Status</th>
              <th className="px-4 py-3 tracking-wider">Date</th>
            </tr>
          </thead>

          {/* Animated body rows */}
          <motion.tbody
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {data.map((req, idx) => (
              <motion.tr
                key={req.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(59,130,246,0.05)" }}
                className={`transition-colors ${idx % 2 === 0 ? "bg-gray-900/40" : "bg-gray-800/30"}`}
              >
                <td className="px-4 py-3">{req.service}</td>
                <td className="px-4 py-3">{req.client}</td>

                {/* Status badge */}
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide animate-pulse ${statusColors[req.status]}`}
                  >
                    {req.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-400">{req.date}</td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};
