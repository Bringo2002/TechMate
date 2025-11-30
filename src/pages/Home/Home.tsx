import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  MessageCircle,
  Globe,
  Smartphone,
  Layers,
  Settings,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// --- AI Backend Placeholder ---
async function fetchAiMessage() {
  const messages = [
    "Initializing modules...",
    "Connecting to NyxDev Cloud AI...",
    "Loading Web Development Suite...",
    "Running Security Protocols...",
    "Optimizing Server Response...",
    "Syncing Real-Time Analytics...",
    "All systems online 🚀",
    `AI Insight: Current time is ${new Date().toLocaleTimeString()}`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// --- Motion Preset ---
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.6 } },
});

// --- Live Terminal Component ---
const LiveTerminal: React.FC<{
  incomingQuestion?: string;
  incomingAnswer?: string;
}> = ({ incomingQuestion, incomingAnswer }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  const typeMessage = (msg: string, onComplete?: () => void) => {
    setIsTyping(true);
    let idx = 0;
    const interval = setInterval(() => {
      setCurrentLine(msg.slice(0, idx + 1));
      idx++;
      if (idx === msg.length) {
        clearInterval(interval);
        setLines((prev) => [...prev.slice(-5), msg]);
        setCurrentLine("");
        setIsTyping(false);
        onComplete && onComplete();
      }
    }, 30);
  };

  useEffect(() => {
    if (incomingQuestion && !isTyping) {
      typeMessage(`> ${incomingQuestion}`, () => {
        if (incomingAnswer) typeMessage(`> ${incomingAnswer}`);
      });
    }
  }, [incomingQuestion, incomingAnswer]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isTyping) {
        const msg = await fetchAiMessage();
        typeMessage(`> ${msg}`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isTyping]);

  return (
    <div className="bg-black/70 border border-cyan-400/40 p-6 rounded-2xl shadow-2xl backdrop-blur-lg font-mono text-sm text-green-400 h-60 overflow-hidden relative">
      {lines.map((line, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {line}
        </motion.div>
      ))}
      {currentLine && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {currentLine}
        </motion.div>
      )}
      <motion.div
        className="absolute bottom-2 left-2 w-2 h-4 bg-green-400 rounded animate-blink"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1 }}
      />
    </div>
  );
};


// --- Particle Background ---
const ParticlesBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const starCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 600;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 2.0 * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const starFragmentShader = `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + vUv.x * 50.0);
        gl_FragColor = vec4(vec3(twinkle), 1.0);
      }
    `;

    const starMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
    });

    const stars = new THREE.Points(geometry, starMaterial);
    scene.add(stars);

    const animate = () => {
      requestAnimationFrame(animate);
      starMaterial.uniforms.uTime.value += 0.02;
      stars.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      starMaterial.dispose();
      if (mountRef.current?.contains(renderer.domElement)) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full -z-10 pointer-events-none" />;
};

// --- Homepage ---
const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) servicesSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="text-white font-sans relative overflow-hidden min-h-screen bg-transparent">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-[#0D1117] opacity-95 -z-20" />

      {/* Hero Section */}
      <section id="home" className="relative px-6 py-28 overflow-hidden">
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center z-10">
          {/* Hero Text */}
          <motion.div className="space-y-6" {...fadeIn(0)}>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Innovative Tech Solutions<br />
              <span className="text-blue-400">for Your Business</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              From websites to apps, we deliver digital products that perform, convert, and scale with a touch of futuristic flair.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleLearnMore} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2 group shadow-lg shadow-purple-600/50">
                Learn More <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/services')} className="border border-gray-400 hover:border-white px-8 py-3 rounded-full transition-all duration-300 hover:bg-white/10 backdrop-blur-md">
                Explore Services
              </button>
            </div>
          </motion.div>

          {/* Holographic Terminal */}
          <motion.div className="relative z-20" {...fadeIn(0.2)}>
            <LiveTerminal />
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto relative">
        <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          What We Offer
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Globe size={28} className="text-blue-400 mb-3" />, title: 'Web Development', desc: 'Custom websites that are fast, responsive, and uniquely crafted for your brand.' },
            { icon: <Smartphone size={28} className="text-blue-400 mb-3" />, title: 'Mobile Apps', desc: 'Intuitive and high-performance apps for iOS and Android to engage your audience anywhere.' },
            { icon: <Layers size={28} className="text-blue-400 mb-3" />, title: 'Web Applications', desc: 'Robust, scalable platforms to power your business operations and digital products.' },
            { icon: <Settings size={28} className="text-blue-400 mb-3" />, title: 'Tech Consulting', desc: 'Expert guidance on choosing the right technologies to scale and future-proof your business.' }
          ].map((service, index) => (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-slate-600 transition-all transform hover:scale-[1.08] hover:shadow-2xl hover:bg-gradient-to-tr hover:from-blue-600 hover:to-purple-600"
              whileHover={{ scale: 1.08 }}
              {...fadeIn(index * 0.2)}
            >
              {service.icon}
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-gray-300">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

     {/* FAQ Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              question: 'How long does it take to build a website or app?',
              answer: 'Timelines vary, but typical projects range from 2-6 weeks depending on complexity and scope.',
            },
            {
              question: 'Do you offer ongoing support?',
              answer: 'Yes! We offer maintenance plans, updates, and full support to ensure your product stays fresh and functional.',
            },
            {
              question: 'Can you redesign my existing website or app?',
              answer: 'Absolutely. We specialize in revamping outdated systems to modern, user-friendly experiences.',
            },
            {
              question: 'What’s your pricing model?',
              answer: 'We offer flexible pricing — fixed packages for common projects and custom quotes for unique needs.',
            },
          ].map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white/5 p-6 rounded-xl border border-slate-600 transition-all transform hover:scale-[1.03] hover:shadow-lg hover:border-white"
              whileHover={{ scale: 1.03 }}
              {...fadeIn(index * 0.2)}
            >
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-blue-400">
                <Plus size={16} /> {faq.question}
              </h3>
              <p className="text-slate-200 text-sm">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </section>


      
      {/* Testimonial Section */}
      <motion.section className="py-20 px-6 max-w-5xl mx-auto" {...fadeIn(0)}>
        <h2 className="text-4xl font-bold mb-12 text-center">What Clients Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[...Array(2)].map((_, index) => (
            <motion.div
              key={index}
              className="bg-white/5 p-6 rounded-xl border border-slate-600 transition-all transform hover:scale-[1.03] hover:shadow-lg hover:border-white"
              whileHover={{ scale: 1.03 }}
              {...fadeIn(index * 0.2)}
            >
              <p className="italic text-slate-200">
                {index === 0
                  ? '"Working with TechMate was seamless. They delivered fast, and the results were stellar. Highly recommend!"'
                  : '"Our new app has been a game changer. Beautiful design, rock-solid performance, and great support."'}
              </p>
              <p className="mt-4 text-blue-400 font-semibold">
                {index === 0 ? '— Alex R., Startup Founder' : '— Lisa K., HealthTech CEO'}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>


      {/* CTA Section */}
      <section id="cta" className="py-24 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Ready to elevate your digital presence?
        </h2>
        <button onClick={() => navigate('/contact')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white px-10 py-4 rounded-full shadow-xl transition transform hover:scale-105">
          Get Started
        </button>
      </section>

      {/* Live Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
                <button
          onClick={() => window.open('https://wa.me/+254759449324', '_blank')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white px-5 py-3 rounded-full shadow-xl transition transform hover:scale-110"
        >
          <MessageCircle size={20} /> Chat with Us
        </button>
      </div>
    </main>
  );
};

export default Home;

