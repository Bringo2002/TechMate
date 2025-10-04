import React from "react";
import { motion } from "framer-motion";

const Analytics: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl shadow-lg"
  >
    <h2 className="text-2xl font-bold text-purple-400 mb-4">Analytics</h2>
    <p className="text-gray-300">Charts, trends, and insights live here.</p>
  </motion.div>
);

export default Analytics;
