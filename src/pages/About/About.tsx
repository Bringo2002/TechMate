import React, { useRef } from "react";
import { motion, cubicBezier } from "framer-motion";
import { useMouse } from "react-use";

const particleLayer = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  color: ["#00FFFF", "#FF00FF", "#FFAA00"][Math.floor(Math.random() * 3)],
  speed: Math.random() * 0.5 + 0.1,
}));

const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.8,
      ease: cubicBezier(0.6, 0.05, -0.01, 0.9),
    },
  },
});

const teamMembers = [
  {
    name: "Brian MacArthur",
    role: "Lead Developer & Founder",
    bio: "Full-stack visionary building immersive web & mobile experiences.",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "Alice Zhang",
    role: "UI/UX Designer",
    bio: "Crafts intuitive and futuristic interfaces with neon aesthetics.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Ravi Patel",
    role: "Backend Architect",
    bio: "Expert in scalable cloud systems and secure APIs.",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Sofia Reyes",
    role: "Mobile Developer",
    bio: "Specializes in cross-platform and native mobile apps.",
    avatar: "https://i.pravatar.cc/150?img=25",
  },
];

const About: React.FC = () => {
  const containerRef = useRef(null);
  const { docX, docY } = useMouse(containerRef);

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* Neon Holographic Network Background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }, (_, i) => (
          <motion.div
            key={`network-${i}`}
            className="absolute rounded-full bg-blue-400/30"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 50, 0],
              y: [0, (Math.random() - 0.5) * 50, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 10 + Math.random() * 5,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particleLayer.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, p.speed * 50, 0],
              x: [0, p.speed * 50, 0],
              rotate: [0, 360, 0],
            }}
            transition={{ repeat: Infinity, duration: 8 + p.speed * 2, ease: "linear" }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.div
        {...fadeInUp(0)}
        className="text-center mt-32 mb-32 relative z-10"
        style={{
          transform: `translate3d(${(docX - window.innerWidth / 2) * 0.02}px, ${(docY - window.innerHeight / 2) * 0.02}px, 0)`,
        }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight leading-tight">
          We Build the Tech You Imagine
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-slate-300 mt-6">
          NyxDev is your futuristic partner in crafting websites, apps, desktop, and cloud software with unparalleled precision.
        </p>
      </motion.div>

      {/* Futuristic Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 md:px-20 relative z-10">
        {[
          {
            title: "Our Mission",
            content: "Empower ideas, simplify tech, and create launch-ready products.",
            color: "bg-neon-blue",
          },
          {
            title: "What We Build",
            content: "Web & mobile apps, desktop software, MVPs, prototypes, APIs, full lifecycle support.",
            color: "bg-neon-purple",
          },
          {
            title: "What Makes Us Different",
            content: "Fully custom builds, startup-minded, tech-agnostic, people-first approach.",
            color: "bg-neon-green",
          },
          {
            title: "Meet the Team",
            content: "A lean team of designers, developers, and product thinkers. Hands-on, quality-driven, deadline-focused.",
            color: "bg-neon-orange",
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            {...fadeInUp(idx * 0.2)}
            whileHover={{
              scale: 1.08,
              rotateX: 5,
              rotateY: 10,
              boxShadow: `0 0 30px ${card.color.split("-")[1]}50`,
            }}
            className={`p-8 rounded-3xl border border-slate-700 backdrop-blur-lg ${card.color}/30 hover:${card.color}/50 transition-transform duration-300 cursor-pointer`}
          >
            <h3 className="text-xl font-bold mb-4">{card.title}</h3>
            <p className="text-slate-300 leading-relaxed">{card.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Meet the Team Section */}
      <motion.div {...fadeInUp(0.5)} className="max-w-6xl mx-auto my-32 relative z-10">
        <h2 className="text-4xl font-bold text-center text-white mb-12">Meet the Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {teamMembers.map((member, i) => (
            <motion.div
              key={i}
              {...fadeInUp(i * 0.2)}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-slate-800/70 backdrop-blur-lg rounded-3xl flex flex-col items-center text-center cursor-pointer transition-transform duration-300"
            >
              <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full mb-4 shadow-lg" />
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-blue-400 font-medium">{member.role}</p>
              <p className="text-slate-300 mt-2">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div {...fadeInUp(0.8)} className="bg-slate-800 p-12 rounded-3xl shadow-xl max-w-5xl mx-auto my-32 space-y-8 relative z-10">
        <h2 className="text-3xl font-bold text-center text-blue-400">Trusted by Clients Worldwide</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <blockquote className="bg-slate-700 p-6 rounded-xl shadow-lg italic text-slate-200">
            “NyxDev built our MVP faster than expected, exceeding our vision.”
            <span className="block mt-4 text-sm text-slate-400 font-medium">— Brian Harrington, Startup Founder</span>
          </blockquote>
          <blockquote className="bg-slate-700 p-6 rounded-xl shadow-lg italic text-slate-200">
            “Rare to find a dev team that *gets it*—NyxDev delivered exactly what we needed.”
            <span className="block mt-4 text-sm text-slate-400 font-medium">— Brian Harrington, CEO of EliteX.com</span>
          </blockquote>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div {...fadeInUp(1)} className="text-center space-y-6 relative z-10 mb-32">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 tracking-tight">
          🚀 Ready to Build the Future?
        </h2>
        <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Whether refining an idea or scaling a product, TechMate is your futuristic partner.
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="/quote" className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 transition-transform duration-200">
            Get a Quote
          </a>
          <a href="/contact" className="border border-blue-600 text-blue-400 px-8 py-3 rounded-full hover:bg-blue-900 hover:scale-105 focus:ring-2 focus:ring-blue-500 transition-transform duration-200">
            Contact Us
          </a>
        </div>
      </motion.div>

      {/* Holographic Floating Bot */}
      <motion.div
        className="fixed bottom-10 right-10 w-28 h-28 rounded-full bg-pink-500/30 backdrop-blur-xl shadow-pink-500 flex items-center justify-center cursor-pointer animate-bounce"
        whileHover={{ scale: 1.2 }}
      >
        <div className="w-14 h-14 bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center text-white font-bold text-2xl">
          🤖
        </div>
      </motion.div>
    </section>
  );
};

export default About;
