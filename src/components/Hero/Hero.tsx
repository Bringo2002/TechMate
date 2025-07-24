import React from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface HeroSectionProps {
  onLearnMore?: () => void;
  
}
const HeroSection: React.FC<HeroSectionProps> = ({
  onLearnMore,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <section id="home" className="relative px-6 py-20 overflow-hidden"> 
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-0" />
      <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center z-10">
        {/* Left Column - Text Content */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Innovative Tech Solutions
            <br />
            <span className="text-blue-400">for Your Business</span>
          </h1>
          
          <p className="text-xl text-gray-300 leading-relaxed">
            Web, Mobile, and Website Development
            <br />
            Development Experts
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onLearnMore}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full transition-all duration-200 transform hover:scale-105 flex items-center gap-2 group"
            >
              Learn More
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => navigate('/services')} // 🌐 Navigate to Services page
              className="border border-gray-400 hover:border-white px-8 py-3 rounded-full transition-all duration-200 hover:bg-white/10"
            >
              Explore Services
            </button>
          </div>
        </div>
        
        {/* Right Column - Mock Device/Code Display */}
        <div className="relative">
          <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-700">
              <div className="space-y-4">
                {/* Browser Controls */}
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                
                {/* Code Display */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Code size={20} className="text-blue-400" />
                    <span className="text-sm font-mono">TechMate.dev</span>
                  </div>
                  
                  {/* Animated Code Blocks */}
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
        
          
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-xl -z-10" />
        </div>
  
      </div>
    </section>
    );
};

export default HeroSection;