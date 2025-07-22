import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactSection: React.FC = () => {
  return (
    <section
      id="contact"
      className="relative px-6 py-24 bg-gradient-to-br from-blue-950 via-blue-950 to-blue-900 text-white overflow-hidden"
    >
      {/* Giant background text */}
      <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[160px] md:text-[150px] font-black text-blue-300/10 tracking-widest z-0 select-none pointer-events-none">
        CONTACT
      </h1>

      {/* Foreground content */}
      <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
        {/* Left Side */}
        <div>
          <h2 className="text-4xl font-bold mb-4">Get in touch</h2>
          <p className="text-blue-200 mb-8">
            Have questions or ready to transform your business with AI automation?
          </p>

          <div className="space-y-6">
            {/* Contact Cards */}
            <GlassCard icon={<Mail />} title="Email us" detail="brianmacathur13@gmail.com" />
            <GlassCard icon={<Phone />} title="Call us" detail="(254) 759449324" />
            <GlassCard icon={<MapPin />} title="Our location" detail="Kilimani, Nairobi, Kenya" />
          </div>
        </div>

        {/* Right Side Form */}
        <form className="bg-blue-950/80 border border-blue-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl space-y-6">
          <input
            type="text"
            placeholder="Name"
            className="w-full p-4 rounded-lg bg-blue-950/40 border border-blue-900/30 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-blue-700 backdrop-blur-md"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-lg bg-blue-950/40 border border-blue-900/30 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-blue-700 backdrop-blur-md"
          />
          <textarea
            placeholder="Message"
            rows={5}
            className="w-full p-4 rounded-lg bg-blue-950/40 border border-blue-900/30 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-blue-700 backdrop-blur-md resize-none"
          />
          <button
            type="submit"
            className="w-full py-3 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-900/30 text-white font-semibold rounded-xl transition backdrop-blur-md"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

interface GlassCardProps {
  icon: React.ReactNode;
  title: string;
  detail: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ icon, title, detail }) => (
  <div className="flex items-center bg-blue-950/60 border border-blue-900/30 backdrop-blur-md rounded-xl p-4 transition hover:bg-blue-900/40">
    <div className="w-8 h-8 mr-4 text-blue-300">{icon}</div>
    <div>
      <p className="text-sm text-blue-300">{title}</p>
      <p className="font-medium text-white">{detail}</p>
    </div>
  </div>
);

export default ContactSection;
