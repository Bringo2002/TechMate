import React, { useState, useEffect, useRef } from 'react';
import {
  Code, Smartphone, Globe, Monitor, RefreshCcw, Database,
  ShieldCheck, CloudCog, Rocket, Network, Layers, Bot
} from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  { title: 'Website Development', description: 'Responsive websites that bring your brand to life on any device.', icon: Globe, color: 'text-blue-400' },
  { title: 'Web App Development', description: 'Tailored web apps solving real problems.', icon: Code, color: 'text-emerald-400' },
  { title: 'Mobile Apps (iOS & Android)', description: 'High-quality native or cross-platform apps.', icon: Smartphone, color: 'text-purple-400' },
  { title: 'Desktop Software', description: 'Powerful apps for Windows, macOS, Linux.', icon: Monitor, color: 'text-orange-400' },
  { title: 'MVPs & Prototypes', description: 'Turn ideas into MVPs fast.', icon: Rocket, color: 'text-orange-300' },
  { title: 'Custom APIs & Backend', description: 'Scalable backend systems that perform.', icon: Database, color: 'text-red-400' },
  { title: 'Ongoing Support & Maintenance', description: 'Stay future-ready with proactive updates.', icon: RefreshCcw, color: 'text-indigo-400' },
  { title: 'SaaS Product Development', description: 'End-to-end SaaS solutions for scale.', icon: Layers, color: 'text-blue-400' },
  { title: 'DevOps & Cloud', description: 'Automated CI/CD & cloud infrastructure.', icon: CloudCog, color: 'text-cyan-400' },
  { title: 'Cybersecurity & Data Protection', description: 'Protect data, applications, and trust.', icon: ShieldCheck, color: 'text-violet-400' },
  { title: 'Web3 / Blockchain', description: 'Smart contracts, wallets, NFT dashboards.', icon: Network, color: 'text-purple-300' },
  { title: 'AI Integration & Automation', description: 'AI features to elevate apps & business value.', icon: Bot, color: 'text-cyan-500' },
];

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.7, type: 'spring' as const, stiffness: 90 } },
});

const ServicesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cyber Grid + Constellations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5,
      speed: Math.random() * 0.2 + 0.05,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      // Grid
      ctx.strokeStyle = 'rgba(0,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Stars
      ctx.fillStyle = 'rgba(0,255,255,0.8)';
      stars.forEach((s) => {
        s.y -= s.speed;
        if (s.y < 0) s.y = height;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      // Constellation lines
      ctx.strokeStyle = 'rgba(0,255,255,0.2)';
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    setShowModal(false);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Cyber Grid Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 -z-20" />

      {/* Cursor Neon Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: cursor.x / 15, y: cursor.y / 15 }}
          className="absolute w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl top-1/3 left-1/4"
        />
        <motion.div
          animate={{ x: -cursor.x / 20, y: -cursor.y / 20 }}
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-1/2 left-2/3"
        />
      </div>

      {/* Header */}
      <motion.div {...fadeIn(0)} className="relative z-10 text-center px-6 pt-20">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4 animate-text-gradient">
          Our Futuristic Services
        </h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-12">
          Cutting-edge solutions, immersive experiences, and interactive tech designed for the next era.
        </p>
      </motion.div>

      {/* Services Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-6">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={index}
              {...fadeIn(0.1 * index)}
              whileHover={{ scale: 1.12, rotate: 2 }}
              className="relative bg-black/30 border border-cyan-500/30 backdrop-blur-lg rounded-3xl p-6 shadow-2xl hover:shadow-[0_0_90px_rgba(0,255,255,0.6)] transition-all cursor-pointer"
            >
              <motion.div
                animate={{
                  x: [0, 6, -6, 0],
                  y: [0, -6, 6, 0],
                  rotate: [0, 90, 180, 270, 360],
                }}
                transition={{ repeat: Infinity, duration: 6 + index / 2, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 w-3 h-3 bg-cyan-400 rounded-full blur-sm -translate-x-1/2 -translate-y-1/2"
              />
              <div className={`w-14 h-14 flex items-center justify-center rounded-full bg-black/20 mb-4 ${service.color} shadow-lg`}>
                <Icon className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-white">{service.title}</h2>
              <p className="text-slate-300 text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quote Button */}
      <motion.div {...fadeIn(0.5)} className="relative z-10 text-center mt-20">
        <button
          onClick={() => setShowModal(true)}
          className="px-12 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:scale-110 transition-transform font-bold shadow-2xl text-white"
        >
          Request a Quote
        </button>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.85, rotateX: -10 }}
            animate={{ scale: 1, rotateX: 0 }}
            className="bg-black/70 p-8 rounded-3xl w-full max-w-md mx-4 shadow-2xl border border-cyan-400/50 backdrop-blur-lg"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Request a Quote</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                type="text"
                required
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-cyan-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-cyan-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                name="message"
                rows={4}
                required
                placeholder="Describe your needs..."
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-cyan-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:scale-105 transition-transform font-bold text-white shadow-lg"
              >
                Submit
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ServicesPage;
