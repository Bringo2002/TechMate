import React from 'react';
import { Code, Smartphone, Globe, Monitor, RefreshCcw, Database, ShieldCheck,  CloudCog, Rocket, Network, Layers, Bot } from 'lucide-react';
import { useState } from 'react';



const services = [
  {
    title: 'Website Development',
    description: 'Beautiful, responsive websites that bring your brand to life on any device.',
    icon: Globe,
    color: 'text-blue-500',
  },
  {
    title: 'Web App Development',
    description: 'Tailored web apps built to solve real problems and power your business.',
    icon: Code,
    color: 'text-emerald-500',
  },
  {
    title: 'iOS & Android Mobile Apps (Native or Cross-Platform)',
    description: 'Launch fast, high-quality mobile apps—built just for your needs, on any platform.',
    icon: Smartphone,
    color: 'text-purple-500',
  },
  {
    title: 'Desktop software Development',
    description: 'Powerful desktop apps, custom-built for Windows, macOS, and Linux.',
    icon: Monitor,
    color: 'text-orange-500',
  },
  {
    title: 'MVPs & Prototypes',
    description: 'Quickly turn ideas into MVPs and prototypes to test, validate, and impress.',
    icon: Rocket,
    color: 'text-orange-500',
  },
  {
    title: 'Custom APIs & Backend Systems',
    description: 'Powerful backend systems and seamless APIs that drive performance, scalability, and innovation.',
    icon: Database,
    color: 'text-red-500',
  },
  {
    title: 'Ongoing Support, Maintenance & Upgrades',
    description: 'Ongoing support and proactive updates to keep your software secure, smooth, and future-ready.',
    icon: RefreshCcw,
    color: 'text-indigo-500',
  },
  {
    title: 'SaaS Product Development',
    description: 'Comprehensive SaaS development — from idea to launch, built for scale and success.',
    icon: Layers,
    color: 'text-blue-500',
  },
  {
    title: 'DevOps & Cloud Solutions',
    description: 'Automated CI/CD and scalable cloud infrastructure built on AWS, GCP, or DigitalOcean — ready for rapid deployment.',
    icon: CloudCog,
    color: 'text-blue-500',
  },
  {
    title: 'Cybersecurity & Data Protection',
    description: 'Advanced security solutions to safeguard your data, applications, and user trust.',
    icon: ShieldCheck,
    color: 'text-blue-500',
  },
  {
    title: 'Web3 / Blockchain Solutions',
    description: 'Web3 solutions including wallet integration, NFT minting dashboards, and smart contract development — built for the next digital era.',
    icon: Network,
    color: 'text-violet-500',
  },
  {
    title: 'AI Integration & Automation',
    description: 'Integrate intelligent, AI-powered features tailored to elevate your app and drive business value.',
    icon: Bot,
    color: 'text-cyan-500',
  },
];

const ServicesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    // Optional: send form to backend/API
    setShowModal(false);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="px-6 py-20 max-w-7xl mx-auto bg-bg-dark min-h-screen">
      <h1 className="text-4xl font-bold mb-4 text-center text-white">Our Services</h1>
      <p className="text-gray-400 text-center mb-12">
        We offer custom tech solutions to help your business thrive.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <div
              key={index}
              className="bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl border border-slate-700 hover:scale-105 transform transition-transform duration-300"
            >
              <Icon className={`w-8 h-8 mb-4 drop-shadow-md ${service.color}`} />
              <h2 className="text-xl font-semibold mb-2 text-white">{service.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{service.description}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-16">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-white transition-transform transform hover:scale-105"
        >
          Request a Quote
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-lg w-full max-w-md mx-4 relative shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Request a Quote</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                type="text"
                required
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Your email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                name="message"
                rows={4}
                required
                placeholder="Tell us what you need..."
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-200"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;