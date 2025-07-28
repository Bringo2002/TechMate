import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Code, MessageCircle, Plus } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLearnMore = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="bg-[#0D1117] text-white font-sans">
      {/* Hero Section */}
      <section id="home" className="relative px-6 py-20 overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/bg.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/50 z-0" />
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center z-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Innovative Tech Solutions
              <br />
              <span className="text-blue-400">for Your Business</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We build sleek websites, powerful mobile apps, and scalable web applications that help businesses thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleLearnMore}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full transition-all duration-200 transform hover:scale-105 flex items-center gap-2 group"
              >
                Learn More
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/services')}
                className="border border-gray-400 hover:border-white px-8 py-3 rounded-full transition-all duration-200 hover:bg-white/10"
              >
                Explore Services
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-700 backdrop-blur-lg bg-opacity-30">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Code size={20} className="text-blue-400" />
                      <span className="text-sm font-mono">TechMate.dev</span>
                    </div>
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={i}
                        className={`bg-blue-500/20 h-8 rounded animate-pulse hero-pulse-delay-${i}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-xl -z-10" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">What We Offer</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: 'Web Development',
              desc: 'Custom websites that are fast, responsive, and uniquely crafted for your brand.',
            },
            {
              title: 'Mobile Apps',
              desc: 'Intuitive and high-performance apps for iOS and Android to engage your audience anywhere.',
            },
            {
              title: 'Web Applications',
              desc: 'Robust, scalable platforms to power your business operations and digital products.',
            },
            {
              title: 'Tech Consulting',
              desc: 'Expert guidance on choosing the right technologies to scale and future-proof your business.',
            },
          ].map((service, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-slate-600 hover:shadow-xl transition-all transform hover:scale-105"
            >
              <h3 className="text-2xl font-semibold mb-2 text-blue-400">
                {service.title}
              </h3>
              <p className="text-slate-200">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">Recent Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'E-Commerce Hub',
              desc: 'Online store built for growth — sleek design, secure payments, and lightning speed.',
            },
            {
              title: 'HealthConnect App',
              desc: 'A mobile app that connects patients with doctors for seamless virtual consultations.',
            },
            {
              title: 'Startup Launchpad',
              desc: 'Conversion-optimized landing page that gets your startup noticed and funded.',
            },
          ].map((project, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-slate-600 hover:shadow-xl transition-all transform hover:scale-105"
            >
              <h3 className="text-2xl font-semibold mb-2 text-blue-400">
                {project.title}
              </h3>
              <p className="text-slate-200">{project.desc}</p>
            </div>
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
            <div key={index} className="bg-white/5 p-6 rounded-xl border border-slate-600">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-blue-400">
                <Plus size={16} /> {faq.question}
              </h3>
              <p className="text-slate-200 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6 bg-blue-600 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Build Something Incredible?</h2>
        <p className="mb-6 text-lg">Let’s turn your ideas into real, impactful digital solutions. We’re just a click away.</p>
        <button
          onClick={() => navigate('/quote')}
          className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition"
        >
          Request a Free Consultation
        </button>
      </section>

      {/* Live Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => alert('Chat with us!')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg"
        >
          <MessageCircle size={20} /> Chat with Us
        </button>
      </div>
    </main>
  );
};

export default Home;