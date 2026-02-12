import React from 'react';
import { Construction, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon: React.FC<{ title?: string }> = ({ title = "Coming Soon" }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500/30 blur-[60px] rounded-full animate-pulse-slow"></div>
        <div className="relative w-32 h-32 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl flex items-center justify-center shadow-2xl">
          <Construction className="text-indigo-400 w-16 h-16 animate-bounce-slow" />
          <Sparkles className="absolute -top-4 -right-4 text-amber-400 w-8 h-8 animate-spin-slow" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent mb-4">
        {title}
      </h1>
      
      <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">
        We're working hard to bring you this futuristic feature. Stay tuned for updates as we build the next generation of TechMate.
      </p>

      <div className="flex gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 border border-slate-700 hover:border-indigo-500/50"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
        <button 
          onClick={() => navigate('/user')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
