import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Public navigation links
const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'About Us', to: '/about' },
  { name: 'Services', to: '/services' },
  // { name: 'Portfolio', to: '/#portfolio' },
  { name: 'Contact', to: '/contact' },
  { name: 'Blog', to: '/blog' },
];

// Greetings for fun
const greetings = [
  'Welcome, Visionary',
  'Greetings, Innovator',
  'Hello, Future Builder',
  'Good to see you, Explorer',
];

// Function to get greeting based on time
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning, Visionary';
  if (hour < 18) return 'Good Afternoon, Visionary';
  return 'Good Evening, Visionary';
};

interface User {
  email: string;
  role: string; // 'admin' or 'user' or undefined
}

// Dummy user for demonstration (replace with your auth context)
const user: User | null = {
  email: 'kyleb8419@gmail.com',
  role: 'admin',
};

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [greeting, setGreeting] = useState(getTimeGreeting());
  const [colorShift, setColorShift] = useState('#00FFFF');
  const lastScrollY = useRef(0);

  // --- Hide/show on scroll ---
  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      setShow(window.scrollY < lastScrollY.current || window.scrollY < 50);
      lastScrollY.current = window.scrollY;
    }
  };

  // --- Dynamic greeting & color ---
  useEffect(() => {
    const greetInterval = setInterval(() => {
      setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
      setColorShift(
        `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`
      );
    }, 8000);
    return () => clearInterval(greetInterval);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, []);

  return (
    <motion.nav
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: show ? 0 : -120, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 90 }}
      className="fixed top-0 w-full z-50 backdrop-blur-lg bg-blue-900/80 border-b border-blue-800 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo & Live AI Greeting */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1">
          <div className="text-3xl font-extrabold tracking-tight flex items-center gap-1 cursor-pointer select-none">
            <span className="text-white glow-text">Nyx</span>
            <span className="text-cyan-400 glow-text">Dev</span>
          </div>
          <span
            className="ml-0 md:ml-4 text-sm text-cyan-300 font-semibold animate-pulse"
            style={{ color: colorShift }}
          >
            {greeting} ●
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <motion.div
              key={link.name}
              whileHover={{ scale: 1.1, color: '#00FFFF' }}
              className="text-lg font-bold cursor-pointer transition-colors"
            >
              <Link to={link.to}>{link.name}</Link>
            </motion.div>
          ))}

          {/* Only show login/signup if admin or future admins */}
          {user?.role === 'admin' && (
            <>
              <Link
                to="/login"
                className="text-lg font-bold hover:text-cyan-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-5 rounded-full shadow-md transition-all hover:scale-105"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                 duration: 0.3,
                 when: "beforeChildren", 
                 staggerChildren: 0.12, 
                },
            }}
            exit={{ 
              opacity: 0, 
              transition: { duration: 0.25 }, 
            }}
            className="relative md:hidden mx-4 mt-4 rounded-2xl overflow-hidden px-6 py-6 flex flex-col space-y-5 backdrop-blur-2xl border border-white/10 shadow-2xl bg-transparent"
          >
            {/* Menu Content */}
            <div className="relative z-10 flex flex-col space-y-5">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    transition: { 
                      type: "spring", 
                      stiffness: 100, 
                      damping: 15, 
                      delay: i * 0.07, 
                    },
                  }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="block text-white text-lg font-bold tracking-wide hover:text-cyan-400 hover:drop-shadow-[0_0_8px_#00ffff] transition-all"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {/* Login + Sign Up (mobile) */}
              {user?.role === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.5, type: "spring", stiffness: 120, damping: 15 },
                  }}
                  className="pt-3 border-t border-white/10"
                >
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-white text-lg font-bold hover:text-cyan-400 hover:drop-shadow-[0_0_8px_#00ffff] mb-4 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-lg font-bold py-2 px-5 rounded-full shadow-lg text-center transition-all hover:scale-105 hover:shadow-cyan-500/40"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
