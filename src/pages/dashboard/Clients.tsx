import React from "react";
import { motion } from "framer-motion";

const Clients: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl shadow-lg"
  >
    <h2 className="text-2xl font-bold text-green-400 mb-4">Clients</h2>
    <p className="text-gray-300">Manage clients, view activity, and handle requests.</p>
  </motion.div>
);

export default Clients;
