import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Calendar, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Particle starfield background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const numParticles = 160;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.8 + 0.7,
        });
      }
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
      requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <section
      id="contact"
      className="relative px-6 py-28 bg-gradient-to-br from-[#0a0a1f] via-[#0f0f2f] to-[#1b1036] text-white overflow-hidden min-h-screen flex flex-col justify-center"
    >
      {/* Interactive Starfield */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>

      {/* Giant holographic title */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 0.1, y: 0 }}
        transition={{ duration: 2 }}
        className="fixed inset-0 flex items-center justify-center
             text-[120px] md:text-[220px] font-black
             text-blue-200 tracking-widest opacity-10
             z-0 select-none pointer-events-none whitespace-nowrap"
      >
        CONTACT
      </motion.h1>

      {/* Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-3 gap-14 w-full">
        
        {/* Column 1 – Quick Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="space-y-8"
        >
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Connect With Us
          </h2>
          <GlassCard icon={<Mail />} title="Email Us" detail="nyxdev4@gmail.com" />
          <GlassCard icon={<Phone />} title="Call Us" detail="(254) 759449324" />
          <GlassCard icon={<MapPin />} title="Our Location" detail="Kilimani, Nairobi, Kenya" />
          <GlassCard icon={<Calendar />} title="Book a Call" detail="Schedule a free consultation" link="/schedule" />
        </motion.div>

        {/* Column 2 – Futuristic Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="col-span-2 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl space-y-8 relative overflow-hidden"
        >
          {/* Light scan animation overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-transparent animate-pulse"></div>

          <div className="grid md:grid-cols-2 gap-6">
            <FloatingInput placeholder="Full Name" type="text" />
            <FloatingInput placeholder="Email Address" type="email" />
          </div>
          <FloatingInput placeholder="Company / Organization" type="text" />
          <FloatingTextarea placeholder="Your Message" />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="relative w-full py-5 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white font-semibold rounded-2xl shadow-2xl overflow-hidden"
          >
            {loading ? (
              <div className="flex justify-center items-center space-x-2">
                <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                <span>Transmitting...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center space-x-3">
                <Send className="w-6 h-6" />
                <span>Send Message</span>
              </span>
            )}
          </motion.button>
          </motion.form>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-20 w-full flex justify-center"
      >
        <button
          onClick={() => navigate('/quote')}
          className="px-12 py-5 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-500 hover:to-purple-600 text-white rounded-2xl transition-all duration-500 shadow-2xl text-lg font-semibold tracking-wide"
        >
          Request a Quote
        </button>
      </motion.div>
    </section>
  );
};

interface GlassCardProps {
  icon: React.ReactNode;
  title: string;
  detail: string;
  link?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ icon, title, detail, link }) => {
  let href: string | null = link || null;
  if (!link) {
    if (title.toLowerCase().includes('email')) {
      href = `mailto:${detail}`;
    } else if (title.toLowerCase().includes('call')) {
      const cleanedNumber = detail.replace(/[^+\d]/g, '');
      href = `tel:${cleanedNumber}`;
    } else if (title.toLowerCase().includes('location')) {
      href = `https://www.google.com/maps/search/${encodeURIComponent(detail)}`;
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.07 }}
      className="flex items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 transition relative overflow-hidden group shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition"></div>
      <div className="w-12 h-12 mr-5 text-blue-300">{icon}</div>
      <div>
        <p className="text-xs text-blue-300 uppercase tracking-widest">{title}</p>
        {href ? (
          <a
            href={href}
            className="font-medium text-white underline hover:text-blue-300"
            target={title.toLowerCase().includes('location') ? '_blank' : undefined}
            rel={title.toLowerCase().includes('location') ? 'noopener noreferrer' : undefined}
          >
            {detail}
          </a>
        ) : (
          <p className="font-medium text-white">{detail}</p>
        )}
      </div>
    </motion.div>
  );
};


const FloatingInput: React.FC<{ type?: string; placeholder: string }> = ({ type = "text", placeholder }) => (
  <input
    type={type}
    placeholder={placeholder}
    className="w-full p-4 rounded-xl bg-blue-950/40 border border-blue-900/30 
               placeholder-white/60 text-white 
               focus:outline-none focus:ring-2 focus:ring-blue-700 
               backdrop-blur-md"
  />
);

  const FloatingTextarea: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <textarea
    rows={5}
    placeholder={placeholder}
    className="w-full p-4 rounded-xl bg-blue-950/40 border border-blue-900/30 
               placeholder-white/60 text-white 
               focus:outline-none focus:ring-2 focus:ring-blue-700 
               backdrop-blur-md resize-none"
  />
);


export default ContactPage;
