import React from "react";
import { motion } from "framer-motion";

const Settings: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl shadow-lg"
  >
    <h2 className="text-2xl font-bold text-yellow-400 mb-4">Settings</h2>
    <p className="text-gray-300">Profile, preferences, and system controls.</p>
  </motion.div>
);

export default Settings;
