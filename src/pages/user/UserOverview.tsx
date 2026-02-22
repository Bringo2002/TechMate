import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  title: string;
  type: 'website' | 'app' | 'consulting' | 'design' | 'backend' | 'fullstack' | string;
  status: 'in_progress' | 'completed' | 'pending' | 'cancelled' | string;
  progress: number;
  budget: number;
  spent: number;
  due_date: string | null;
  next_milestone: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getProjectTypeIcon = (type: string) => {
  const icons: Record<string, typeof Code> = {
    website: Code,
    app: Smartphone,
    consulting: Brain,
    design: Palette,
    backend: Activity,
    fullstack: Zap,
  };
  return icons[type] ?? Package;
};

const formatDueDate = (dateStr: string | null): string => {
  if (!dateStr) return 'TBD';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'TBD' : date.toLocaleDateString();
};

const getDaysUntil = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Due today';
  return `${diff} day${diff === 1 ? '' : 's'} left`;
};

const formatStatus = (status: string | undefined): string => {
  if (!status) return 'UNKNOWN';
  return status.replace(/_/g, ' ').toUpperCase();
};

const getStatusStyles = (status: string): string => {
  switch (status) {
    case 'in_progress':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'cancelled':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};

// Sort orders by soonest due date (nulls pushed to end)
const getSoonestOrder = (orders: Order[]): Order | undefined => {
  return [...orders]
    .filter((o) => o.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0];
};

// ─── Component ────────────────────────────────────────────────────────────────

const UserOverview: React.FC = () => {
  const navigate = useNavigate();
  const { profile, orders, loading, error } = useDashboardData();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ── Fix #1: Correct parallax calculation using viewport ratio ──
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // ── Fix #2: Properly typed order calculations ──
  const typedOrders = (orders ?? []) as unknown as Order[];

  const totalBudget = typedOrders.reduce((acc, o) => acc + (o.budget ?? 0), 0);
  const totalSpent = typedOrders.reduce((acc, o) => acc + (o.spent ?? 0), 0);
  const budgetUsedPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const activeOrdersCount = typedOrders.filter((o) => o.status === 'in_progress').length;

  // ── Fix #7: Get soonest milestone by due date instead of orders[0] ──
  const soonestOrder = getSoonestOrder(typedOrders);

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full"
        />
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4">
        <AlertCircle size={48} />
        <p>Failed to load dashboard data. Please refresh.</p>
        <p className="text-sm text-red-500/50">{String(error)}</p>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 relative">
      {/* ── Fix #1: Corrected parallax background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div
          className="absolute w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]"
          style={{
            top: `${20 + mousePosition.y * 0.1}%`,
            left: `${mousePosition.x * 0.3}%`,
            transition: 'all 0.6s ease-out',
          }}
        />
      </div>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between relative z-10"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron tracking-wide">
            Welcome, {typeof profile?.full_name === 'string' ? profile.full_name.split(' ')[0] : 'User'}
          </h1>
          <p className="text-slate-400">Overview of your active projects and milestones.</p>
        </div>

        {/* ── Fix #5: Navigate to correct route ── */}
        <button
          onClick={() => navigate('/user/new-project')}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg
                     shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95"
        >
          + New Project
        </button>
      </motion.div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Active Projects */}
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

        {/* Budget Utilized */}
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
            {/* ── Fix #6: Show raw numbers if budget tracking is unavailable ── */}
            {totalBudget === 0 && (
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                No budget set
              </span>
            )}
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Budget Utilized</h3>
          <div className="text-3xl font-bold text-white font-orbitron">
            {totalBudget > 0 ? `${budgetUsedPercent.toFixed(0)}%` : '—'}
          </div>
          {totalBudget > 0 && (
            <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-700"
                style={{ width: `${budgetUsedPercent}%` }}
              />
            </div>
          )}
        </motion.div>

        {/* Next Milestone — Fix #7 & #8 */}
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
            {/* ── Fix #8: Dynamic days remaining ── */}
            {soonestOrder?.due_date && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Clock size={12} />
                {getDaysUntil(soonestOrder.due_date)}
              </span>
            )}
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Next Milestone</h3>
          <div className="text-lg font-bold text-white truncate">
            {soonestOrder?.next_milestone ?? 'No upcoming milestones'}
          </div>
          {soonestOrder && (
            <p className="text-xs text-slate-500 mt-1">For: {soonestOrder.title}</p>
          )}
        </motion.div>
      </div>

      {/* ── Projects List ── */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 font-orbitron flex items-center gap-2">
          <Sparkles size={20} className="text-cyan-400" /> Current Projects
        </h2>

        {/* ── Fix #9: AnimatePresence removed from static list; kept for proper exit if needed ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {typedOrders.map((order, i) => {
            const Icon = getProjectTypeIcon(order.type);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.4 }}
                // ── Fix #11: Added onClick to navigate to order detail ──
                onClick={() => navigate(`/user/orders/${order.id}`)}
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
                  {/* ── Fix #3: Safe status formatting ── */}
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(order.status)}`}>
                    {formatStatus(order.status)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">Completion</span>
                      <span className="text-white font-mono">{order.progress ?? 0}%</span>
                    </div>
                    <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                      <div
                        className={`bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-500`}
                        data-progress={order.progress ?? 0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={14} />
                      {/* ── Fix #4: Safe date formatting ── */}
                      <span>Due {formatDueDate(order.due_date)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      View Details <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Fix #5: Empty state uses correct route ── */}
        {typedOrders.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-slate-700 rounded-2xl bg-white/5">
            <p className="text-slate-400">No active projects found.</p>
            <button
               onClick={() => navigate('/user/new-project')}
              className="mt-4 text-cyan-400 text-sm hover:underline"
            >
              Start a new project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOverview;

/* Add this style block at the bottom of the file or move to a CSS/SCSS file and import it */
const style = document.createElement('style');
style.innerHTML = `
  [data-progress] {
    width: 0%;
    transition: width 0.5s;
  }
  [data-progress]:not([data-progress=""]) {
    width: attr(data-progress percentage);
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('user-overview-progress-style')) {
  style.id = 'user-overview-progress-style';
  document.head.appendChild(style);
}