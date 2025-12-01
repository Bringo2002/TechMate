import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Instagram } from "lucide-react";
import { SiX } from "react-icons/si"; // for the new X (Twitter) icon

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-blue-950 via-black to-black text-white mt-16 overflow-hidden">
      {/* Futuristic background pulse */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,180,255,0.15),transparent_70%)]"
      />

      <div className="relative max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 z-10">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold tracking-widest bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            NyxDev
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Building the future, one line of code at a time.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col md:items-center">
          <p className="text-gray-300 text-sm font-semibold mb-3">Quick Links</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/terms" className="hover:text-cyan-400 transition">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-cyan-400 transition">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/cookies" className="hover:text-cyan-400 transition">
                Cookie Policy
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-cyan-400 transition">
                About Us
              </a>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div className="flex flex-col md:items-end">
          <p className="text-gray-300 text-sm font-semibold mb-3">Connect</p>
          <div className="flex space-x-5">
            {/* GitHub */}
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group"
              title="GitHub"
            >
              <Github className="w-6 h-6 text-gray-400 group-hover:text-white transition" />
              <span className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition"></span>
              <span className="sr-only">GitHub</span>
            </motion.a>

            {/* X */}
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://x.com/NyxDev4"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              title="X"
            >
              <SiX className="w-6 h-6 text-gray-400 group-hover:text-white transition" />
              <span className="absolute inset-0 rounded-full bg-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition"></span>
              <span className="sr-only">X</span>
            </motion.a>

            {/* Instagram */}
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://instagram.com/nyxdev2025"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group"
              title="Instagram"
            >
              <Instagram className="w-6 h-6 text-gray-400 group-hover:text-white transition" />
              <span className="absolute inset-0 rounded-full bg-pink-500/20 blur-md opacity-0 group-hover:opacity-100 transition"></span>
              <span className="sr-only">Instagram</span>
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group"
              title="LinkedIn"
            >
              <Linkedin className="w-6 h-6 text-gray-400 group-hover:text-white transition" />
              <span className="absolute inset-0 rounded-full bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition"></span>
              <span className="sr-only">LinkedIn</span>
            </motion.a>
          </div>
        </div>
      </div>

      {/* Divider Pulse Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 max-w-7xl mx-auto"
      />

      {/* Bottom */}
      <div className="relative text-center text-gray-500 text-xs py-6 z-10">
        © {new Date().getFullYear()} TechMate  
      </div>
    </footer>
  );
};

export default Footer;
