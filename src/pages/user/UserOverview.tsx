import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import { 
  Package, 
  Clock,
  DollarSign,
  Sparkles,
  Target,
  Calendar,
  AlertCircle,
  Zap,
  Smartphone,
  Brain,
  Palette,
  Code,
  Activity,
  ChevronRight // Added ChevronRight import
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// --- Icons Helper ---
const getProjectTypeIcon = (type: string) => {
  const icons: Record<string, typeof Code> = {
    website: Code,
    app: Smartphone,
    consulting: Brain,
    design: Palette,
    backend: Activity,
    fullstack: Zap
  };
  return icons[type] || Package;
};

const UserOverview: React.FC = () => {
  const navigate = useNavigate();
  const { profile, orders, loading, error } = useDashboardData();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse move effect for background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate totals
  const totalBudget = orders?.reduce((acc: number, order: Record<string, number>) => acc + (order.budget || 0), 0) || 0;
  const totalSpent = orders?.reduce((acc: number, order: Record<string, number>) => acc + (order.spent || 0), 0) || 0;
  const budgetUsedPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const activeOrdersCount = orders?.filter((o: Record<string, string>) => o.status === 'in_progress').length || 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
         <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full"
         />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4">
        <AlertCircle size={48} />
        <p>Failed to load dashboard data. Please refresh.</p>
        <p className="text-sm text-red-500/50">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Interactive Background Elements (localized to this view) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div 
          className="absolute w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]"
          style={{
            top: '20%',
            left: mousePosition.x * 0.02 + '%',
            transition: 'all 0.5s ease-out'
          }} 
        />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between relative z-10"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron tracking-wide">
            Welcome, {profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-slate-400 flex items-center gap-2">
            Overview of your active projects and milestones.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/job-discovery')}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg 
                           shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95">
          + New Project
        </button>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Active Projects Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0a16]/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Activity size={24} />
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
              LIVE
            </span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Active Projects</h3>
          <div className="text-3xl font-bold text-white font-orbitron">{activeOrdersCount}</div>
        </motion.div>

        {/* Budget Usage Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0a0a16]/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
              <DollarSign size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Budget Utilized</h3>
          <div className="text-3xl font-bold text-white font-orbitron">
            {budgetUsedPercent.toFixed(0)}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
              style={{ width: `${budgetUsedPercent}%` }} 
            />
          </div>
        </motion.div>

        {/* Next Milestone Card (Mock Logic) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0a16]/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Target size={24} />
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Clock size={12} /> 2 days left
            </span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Next Milestone</h3>
          <div className="text-lg font-bold text-white truncate">
             {orders?.[0]?.next_milestone || 'Project Setup'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
             For: {orders?.[0]?.title || 'New Project'}
          </p>
        </motion.div>
      </div>

      {/* Projects List */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 font-orbitron flex items-center gap-2">
            <Sparkles size={20} className="text-cyan-400" /> Current Projects
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {orders?.map((order: Record<string, string | number>, i: number) => {
               const Icon = getProjectTypeIcon(order.type);
               return (
                <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.4 }}
                    className="bg-[#0a0a16]/40 backdrop-blur-sm border border-white/5 p-6 rounded-2xl 
                               hover:bg-[#0a0a16]/60 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] 
                               transition-all duration-300 group cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-cyan-400 border border-white/5 shadow-inner">
                                <Icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                                    {order.title}
                                </h3>
                                <p className="text-sm text-slate-500 capitalize">{order.type} Development</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            order.status === 'in_progress' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                            order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-400">Completion</span>
                                <span className="text-white font-mono">{order.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-500"
                                    style={{ width: `${order.progress}%` }}
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar size={14} />
                                <span>Due {new Date(order.due_date).toLocaleDateString()}</span>
                            </div>
                             <div className="flex items-center gap-1 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                View Details <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                </motion.div>
               );
            })}
          </AnimatePresence>
          
          {/* Empty State */}
          {(!orders || orders.length === 0) && (
             <div className="col-span-full py-12 text-center border border-dashed border-slate-700 rounded-2xl bg-white/5">
                <p className="text-slate-400">No active projects found.</p>
                <button 
                  onClick={() => navigate('/job-discovery')}
                  className="mt-4 text-cyan-400 text-sm hover:underline"
                >
                  Start a new project
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOverview;
