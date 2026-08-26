import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../lib/supabaseClient';
import authService from '../../services/authService';
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

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  phone: string | null;
  bio: string | null;
  company: string | null;
  job_title: string | null;
  [key: string]: unknown;
};

// For order and inquiry items
interface ProjectListItem {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  due_date: string | null;
  next_milestone: string | null;
  source: 'project' | 'order' | 'inquiry';
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const getProjectTypeIcon = (type: string) => {
  const icons: Record<string, typeof Code> = {
    website: Code,
    app: Smartphone,
    consulting: Brain,
    design: Palette,
    backend: Activity,
    fullstack: Zap,
    mobile_app: Smartphone,
    web_app: Code,
    other: Package,
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
    case 'new':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case 'reviewing':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'accepted':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'declined':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};

const getSoonestOrder = (orders: ProjectListItem[]): ProjectListItem | undefined => {
  return [...orders]
    .filter((o) => o.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0];
};

// ─── Component ─────────────────────────────────────────────────────────────────

const UserOverview: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax mouse effect
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

  // Fetch profile and project/order/inquiry data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let user;
        try {
          user = await authService.getMe();
        } catch {
          throw new Error('User not found');
        }
        if (!user) throw new Error('User not found');

        // Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // ── Projects (primary data source) ──
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        const projectsMapped: ProjectListItem[] = (projectsData ?? []).map((p: Record<string, unknown>) => {
          // Map project status to display status
          const statusMap: Record<string, string> = {
            active: 'in_progress',
            planning: 'pending',
            completed: 'completed',
            on_hold: 'pending',
            review: 'reviewing',
            cancelled: 'cancelled',
          };
          return {
            id: p.id,
            title: p.name,
            type: p.type ?? 'other',
            status: statusMap[p.status] ?? p.status,
            progress: p.client_visible_progress || p.progress || 0,
            budget: p.budget ?? 0,
            spent: p.spent ?? 0,
            due_date: p.deadline ?? null,
            next_milestone: p.nextMilestone ?? null,
            source: 'project' as const,
          };
        });

        // ── Orders ──
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const ordersMapped: ProjectListItem[] = (ordersData ?? []).map((o: Record<string, unknown>) => ({
          id: o.id,
          title: o.title,
          type: o.type,
          status: o.status,
          progress: o.progress ?? 0,
          budget: o.budget ?? 0,
          spent: o.spent ?? 0,
          due_date: o.due_date ?? null,
          next_milestone: o.next_milestone ?? null,
          source: 'order' as const,
        }));

        // ── Inquiries ──
        const { data: inquiriesData } = await supabase
          .from('client_inquiries')
          .select('*')
          .eq('client_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        const inquiriesMapped: ProjectListItem[] = (inquiriesData ?? []).map((i: Record<string, unknown>) => ({
          id: i.id,
          title: i.title,
          type: i.project_type ?? 'other',
          status: i.status,
          progress: 0,
          budget: i.budget_min ?? 0,
          spent: 0,
          due_date: i.deadline ?? null,
          next_milestone: null,
          source: 'inquiry' as const,
        }));

        // Merge all sources — projects first (primary), then orders, then inquiries
        setOrders([...projectsMapped, ...ordersMapped, ...inquiriesMapped]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBudget = orders.reduce((acc, o) => acc + (o.budget ?? 0), 0);
  const totalSpent = orders.reduce((acc, o) => acc + (o.spent ?? 0), 0);
  const budgetUsedPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const activeOrdersCount = orders.filter((o) =>
    o.status === 'in_progress' || o.status === 'reviewing'
  ).length;

  const soonestOrder = getSoonestOrder(orders);

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
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4">
        <AlertCircle size={48} />
        <p>Failed to load dashboard data. Please refresh.</p>
        <p className="text-sm text-red-500/50">{String(error)}</p>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="space-y-8 relative">
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between relative z-10"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron tracking-wide">
            Welcome, {typeof profile?.full_name === 'string' && profile.full_name ? profile.full_name.split(' ')[0] : 'User'}
          </h1>
          <p className="text-slate-400">Overview of your active projects and milestones.</p>
        </div>
        <button
          onClick={() => navigate('/user/new-project')}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95"
        >
          + New Project
        </button>
      </motion.div>
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
        {/* Next Milestone */}
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
      {/* Projects List */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 font-orbitron flex items-center gap-2">
          <Sparkles size={20} className="text-cyan-400" /> Current Projects & Requests
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order, i) => {
            const Icon = getProjectTypeIcon(order.type);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.4 }}
                onClick={() => {
                  if (order.source === 'project') {
                    navigate(`/user/projects/${order.id}`);
                  } else if (order.source === 'order') {
                    navigate(`/user/orders/${order.id}`);
                  } else {
                    navigate(`/user/requests/${order.id}`);
                  }
                }}
                className="bg-[#0a0a16]/40 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:bg-[#0a0a16]/60 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 group cursor-pointer relative overflow-hidden"
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
                      <p className="text-sm text-slate-500 capitalize">
                        {order.type} Development{order.source === 'inquiry' && ' (Request)'}
                      </p>
                    </div>
                  </div>
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
                        style={{ width: `${order.progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={14} />
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
        {orders.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-slate-700 rounded-2xl bg-white/5">
            <p className="text-slate-400">No active projects or requests found.</p>
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