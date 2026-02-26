import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import {
  AlertCircle, CheckCircle2, AlertTriangle, Clock, DollarSign,
  ChevronLeft, Sparkles, Target, TrendingUp, Activity,
  Loader2, FileText, Calendar, ArrowUp, ArrowDown, Layers, Code2,
  Package, XCircle, MessageSquare, Users, Zap, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import supabase from '../../lib/supabaseClient';
import type { ProjectRow, Json } from '../../types/database.types';

// ─── Currency formatter ───────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

// ── Types ────────────────────────────────────────────────────────────────────
type ActivityItem = {
  id: string;
  action: string;
  changes: Json;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
};

type TeamMember = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const HealthScoreRing = ({ score, size = 80 }: { score: number; size?: number }) => {
  const cfg =
    score >= 90 ? { color: 'text-emerald-400', label: 'Excellent', glow: 'shadow-emerald-500/30' }
    : score >= 75 ? { color: 'text-cyan-400', label: 'Good', glow: 'shadow-cyan-500/30' }
    : score >= 60 ? { color: 'text-amber-400', label: 'Fair', glow: 'shadow-amber-500/30' }
    : { color: 'text-red-400', label: 'Critical', glow: 'shadow-red-500/30' };
  const r = (size / 2) - 6;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
      className={`relative shadow-xl ${cfg.glow} rounded-full`}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="5" fill="none" className="text-gray-800" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="5" fill="none"
          className={cfg.color} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out 0.5s' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white">{score}</span>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
      </div>
    </motion.div>
  );
};

const BudgetDonut = ({ spent, budget, size = 100 }: { spent: number; budget: number; size?: number }) => {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const r = (size / 2) - 8;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const clr = pct > 90 ? 'text-red-400' : pct > 70 ? 'text-amber-400' : 'text-cyan-400';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="7" fill="none" className="text-gray-800" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="7" fill="none"
          className={clr} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black text-white">{pct.toFixed(0)}%</span>
        <span className="text-[9px] text-gray-400 font-medium">Utilized</span>
      </div>
    </div>
  );
};

const StatCard = ({
  label, value, sub, icon: Icon, color, trend, delay = 0,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; trend?: 'up' | 'down' | 'neutral'; delay?: number;
}) => (
  <motion.div {...fadeUp(delay)}
    className="group relative bg-gradient-to-br from-[#0a0a16]/90 to-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-cyan-500/20 transition-all duration-300 overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-28 h-28 bg-${color}-500/5 rounded-full blur-3xl group-hover:bg-${color}-500/10 transition-all duration-500`} />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 bg-${color}-500/10 rounded-xl border border-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {trend && trend !== 'neutral' && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          </div>
        )}
      </div>
      <h4 className="text-xs font-medium text-slate-400 mb-1 tracking-wide uppercase">{label}</h4>
      <p className="text-2xl font-bold text-white leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1.5">{sub}</p>}
    </div>
  </motion.div>
);

const SectionCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div {...fadeUp(delay)}
    className={`bg-gradient-to-br from-[#0a0a16]/90 to-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionTitle = ({ icon: Icon, color, children }: { icon: React.ElementType; color: string; children: React.ReactNode }) => (
  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
    <Icon className={`w-5 h-5 text-${color}-400`} />
    {children}
  </h3>
);

// ── Activity helpers ──
const getActivityIcon = (action: string) => {
  if (action.includes('create') || action.includes('new')) return { icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  if (action.includes('update') || action.includes('edit')) return { icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' };
  if (action.includes('complete') || action.includes('deliver')) return { icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
  if (action.includes('comment') || action.includes('message')) return { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' };
  return { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-500/10' };
};

const formatActivityAction = (action: string): string => {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function UserProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Parallax mouse effect
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted.current) { setError('Not authenticated'); setLoading(false); }
        return;
      }

      // Fetch project
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

      if (!isMounted.current) return;
      if (fetchError || !data) {
        setError('Project not found or access denied.');
        setProject(null);
        setLoading(false);
        return;
      }
      setProject(data as ProjectRow);

      // Fetch activity logs for this project
      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('id, action, changes, created_at, profiles:user_id(full_name, avatar_url)')
        .eq('entity_type', 'project')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (isMounted.current && activityData) {
        setActivities(activityData as unknown as ActivityItem[]);
      }

      // Fetch team members: technical lead + project creator
      const teamIds = new Set<string>();
      if ((data as ProjectRow).technical_lead_id) teamIds.add((data as ProjectRow).technical_lead_id!);

      if (teamIds.size > 0) {
        const { data: teamData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, job_title')
          .in('id', Array.from(teamIds));

        if (isMounted.current && teamData) {
          setTeamMembers(teamData.map((t: any) => ({
            id: t.id,
            full_name: t.full_name,
            avatar_url: t.avatar_url,
            role: t.id === (data as ProjectRow).technical_lead_id ? 'Technical Lead' : (t.job_title ?? 'Team Member'),
          })));
        }
      }

      setLoading(false);
    })();
  }, [projectId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-14 h-14 text-cyan-400 animate-spin relative z-10" />
          </div>
          <p className="text-cyan-400/80 font-medium animate-pulse tracking-wide">
            Loading Project Intelligence...
          </p>
          <div className="flex gap-1 mt-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-2 h-2 bg-cyan-500/40 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Error ──
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white gap-6 p-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="relative">
          <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
          <XCircle className="w-16 h-16 text-red-400 relative z-10" />
        </motion.div>
        <h1 className="text-2xl font-bold">{error ?? 'Project Not Found'}</h1>
        <button
          onClick={() => navigate('/user')}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </button>
      </div>
    );
  }

  // ─── Derived Data ─────────────────────────────────────────────────────────
  const progress = project.client_visible_progress || project.progress || 0;
  const daysLeft = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 864e5)
    : null;
  const budget = project.budget ?? 0;
  const spent = project.spent ?? 0;
  const remaining = budget - spent;
  const health = project.health_score ?? 100;
  const burnPct = budget > 0 ? (spent / budget) * 100 : 0;
  const isOnTrack = burnPct <= progress;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  const tech: string[] = project.technologies ?? [];
  const deliverables: Json[] = Array.isArray(project.deliverables) ? project.deliverables : [];

  const timeElapsed = (() => {
    if (!project.started_at || !project.deadline) return 0;
    const s = new Date(project.started_at).getTime();
    const e = new Date(project.deadline).getTime();
    const n = Date.now();
    if (n >= e) return 100;
    if (n <= s) return 0;
    return Math.round(((n - s) / (e - s)) * 100);
  })();

  // Status config
  const statusMap: Record<string, { bg: string; bdr: string; txt: string; dot: string }> = {
    active:    { bg: 'bg-cyan-500/10',    bdr: 'border-cyan-500/30',    txt: 'text-cyan-400',    dot: 'bg-cyan-400' },
    planning:  { bg: 'bg-blue-500/10',    bdr: 'border-blue-500/30',    txt: 'text-blue-400',    dot: 'bg-blue-400' },
    completed: { bg: 'bg-emerald-500/10', bdr: 'border-emerald-500/30', txt: 'text-emerald-400', dot: 'bg-emerald-400' },
    review:    { bg: 'bg-purple-500/10',  bdr: 'border-purple-500/30',  txt: 'text-purple-400',  dot: 'bg-purple-400' },
    on_hold:   { bg: 'bg-amber-500/10',   bdr: 'border-amber-500/30',   txt: 'text-amber-400',   dot: 'bg-amber-400' },
    cancelled: { bg: 'bg-red-500/10',     bdr: 'border-red-500/30',     txt: 'text-red-400',     dot: 'bg-red-400' },
  };
  const sc = statusMap[project.status] ?? statusMap.active;

  const checkpoints = [
    { label: 'Progress', val: `${progress}%`,          ok: progress >= 50,                           Icon: progress >= 100 ? CheckCircle2 : Target },
    { label: 'Health',   val: `${health}/100`,          ok: health >= 75,                             Icon: health >= 90 ? CheckCircle2 : Sparkles },
    { label: 'Budget',   val: `${burnPct.toFixed(0)}%`, ok: burnPct <= 85,                            Icon: isOnTrack ? TrendingUp : AlertTriangle },
    { label: 'Timeline', val: daysLeft != null ? `${daysLeft}d` : '—', ok: daysLeft === null || daysLeft > 0, Icon: daysLeft != null && daysLeft > 7 ? CheckCircle2 : Clock },
  ];

  // Deliverable helpers
  const getDeliverableName = (d: Json, i: number): string => {
    if (typeof d === 'string') return d;
    if (typeof d === 'object' && d !== null && !Array.isArray(d)) {
      const obj = d as Record<string, Json | undefined>;
      return (obj.name as string) ?? (obj.title as string) ?? `Deliverable ${i + 1}`;
    }
    return `Deliverable ${i + 1}`;
  };

  const isDeliverableDone = (d: Json): boolean => {
    if (typeof d === 'string') return false;
    if (typeof d === 'object' && d !== null && !Array.isArray(d)) {
      const obj = d as Record<string, Json | undefined>;
      return obj.status === 'completed' || obj.completed === true;
    }
    return false;
  };

  const getDeliverableProgress = (d: Json): number => {
    if (typeof d === 'object' && d !== null && !Array.isArray(d)) {
      const obj = d as Record<string, Json | undefined>;
      if (obj.progress && typeof obj.progress === 'number') return obj.progress;
      if (obj.status === 'completed' || obj.completed === true) return 100;
      if (obj.status === 'in_progress') return 50;
    }
    return 0;
  };

  const completedCount = deliverables.filter(isDeliverableDone).length;

  // Phase data for milestone timeline
  const phases = [
    { name: 'Planning', pct: 0,  icon: FileText,  color: 'blue' },
    { name: 'Development', pct: 25, icon: Code2,  color: 'cyan' },
    { name: 'Review',  pct: 50, icon: Target,     color: 'purple' },
    { name: 'Testing', pct: 75, icon: AlertCircle, color: 'amber' },
    { name: 'Delivery', pct: 100, icon: Package,   color: 'emerald' },
  ];

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 relative">
      {/* Parallax background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div
          className="absolute w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]"
          style={{
            top: `${20 + mousePosition.y * 0.1}%`,
            left: `${mousePosition.x * 0.3}%`,
            transition: 'all 0.6s ease-out',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px]"
          style={{
            bottom: `${mousePosition.y * 0.15}%`,
            right: `${mousePosition.x * 0.2}%`,
            transition: 'all 0.8s ease-out',
          }}
        />
      </div>

      {/* ══════════════════ HERO HEADER ══════════════════ */}
      <motion.div {...fadeUp(0)}
        className="relative overflow-hidden bg-gradient-to-br from-cyan-900/20 via-blue-900/15 to-purple-900/20 border border-cyan-500/20 rounded-3xl p-6 md:p-8 lg:p-10"
      >
        {/* Animated gradient mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-purple-500/3 rounded-full blur-3xl" />

        <div className="relative z-10">
          <button onClick={() => navigate('/user')}
            className="flex items-center gap-1.5 text-sm text-cyan-400/80 hover:text-cyan-400 font-medium mb-5 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent leading-tight mb-4"
              >
                {project.name}
              </motion.h1>

              <motion.div {...fadeUp(0.2)} className="flex flex-wrap items-center gap-2 mb-5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${sc.bg} ${sc.bdr} ${sc.txt}`}>
                  <span className={`w-2 h-2 rounded-full ${sc.dot} ${project.status === 'active' ? 'animate-pulse' : ''}`} />
                  {project.status.replace(/_/g, ' ')}
                </span>
                {project.type && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border bg-slate-800/50 border-slate-700/50 text-slate-300">
                    <Layers className="w-3 h-3" /> {project.type.replace(/_/g, ' ')}
                  </span>
                )}
                {project.status === 'completed' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                  </span>
                )}
              </motion.div>

              <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  Started {project.started_at ? new Date(project.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                </span>
                {project.deadline && (
                  <span className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-red-400' : ''}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {isOverdue ? `Overdue by ${Math.abs(daysLeft!)} days` : `Due ${new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </span>
                )}
                {project.updated_at && (
                  <span className="flex items-center gap-1.5 text-xs text-cyan-400/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Updated {timeAgo(project.updated_at)}
                  </span>
                )}
              </motion.div>
            </div>

            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <HealthScoreRing score={health} size={100} />
              <span className="text-[11px] text-slate-500 font-semibold tracking-wider uppercase">Project Health</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════ CHECKPOINT STRIP ══════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {checkpoints.map((ch, i) => (
          <motion.div key={i} {...fadeUp(0.1 + i * 0.05)}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            ch.ok
              ? 'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40'
              : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
          }`}>
            <ch.Icon className={`w-6 h-6 flex-shrink-0 ${ch.ok ? 'text-cyan-400' : 'text-red-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{ch.label}</div>
              <div className="text-xl font-black text-white">{ch.val}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ══════════════════ KPI CARDS ══════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Budget" value={fmt(budget)}
          sub={`${fmt(spent)} spent · ${fmt(remaining)} remaining`}
          icon={DollarSign} color="cyan" delay={0.15}
          trend={spent > budget * 0.9 ? 'down' : 'up'}
        />
        <StatCard label="Timeline" value={daysLeft != null ? `${Math.abs(daysLeft)}d` : '—'}
          sub={isOverdue ? `Overdue by ${Math.abs(daysLeft!)} days` : daysLeft != null ? `${daysLeft} days left` : 'No deadline set'}
          icon={Clock}
          color={isOverdue ? 'red' : daysLeft != null && daysLeft < 7 ? 'amber' : 'blue'}
          trend={isOverdue ? 'down' : 'neutral'} delay={0.2}
        />
        <StatCard label="Completion" value={`${progress}%`}
          sub={project.status === 'completed' ? 'Project delivered ✓' : `${100 - progress}% remaining`}
          icon={Target} color="purple" delay={0.25}
          trend={progress >= 75 ? 'up' : 'neutral'}
        />
        <StatCard label="Budget Usage" value={`${burnPct.toFixed(1)}%`}
          sub={`${isOnTrack ? 'On-track' : 'Over-spending'} vs ${progress}% progress`}
          icon={isOnTrack ? TrendingUp : AlertTriangle}
          color={burnPct > progress + 15 ? 'red' : 'cyan'} delay={0.3}
          trend={burnPct > progress + 15 ? 'down' : 'up'}
        />
      </div>

      {/* ══════════════════ MILESTONE TIMELINE ══════════════════ */}
      <SectionCard delay={0.35}>
        <SectionTitle icon={Target} color="cyan">Project Milestones</SectionTitle>
        <div className="relative">
          {/* Background track */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-800" />

          <div className="space-y-0">
            {phases.map((phase, i) => {
              const isComplete = progress >= phase.pct + 20;
              const isCurrent = progress >= phase.pct && progress < phase.pct + 20;
              const PhIcon = phase.icon;
              return (
                <motion.div
                  key={phase.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className={`relative flex items-start gap-4 py-4 ${i < phases.length - 1 ? '' : ''}`}
                >
                  {/* Node */}
                  <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                    isComplete ? `bg-${phase.color}-500/10 border-${phase.color}-500/30` :
                    isCurrent ? `bg-${phase.color}-500/20 border-${phase.color}-500/50 shadow-lg shadow-${phase.color}-500/20` :
                    'bg-slate-900 border-slate-700'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className={`w-5 h-5 text-${phase.color}-400`} />
                    ) : (
                      <PhIcon className={`w-5 h-5 ${isCurrent ? `text-${phase.color}-400` : 'text-slate-600'}`} />
                    )}
                    {isCurrent && (
                      <span className={`absolute -top-1 -right-1 w-3 h-3 bg-${phase.color}-400 rounded-full animate-pulse`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isComplete ? 'text-white' : isCurrent ? 'text-white' : 'text-slate-500'}`}>
                        {phase.name}
                      </span>
                      {isCurrent && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-${phase.color}-500/10 text-${phase.color}-400 border border-${phase.color}-500/30`}>
                          Current
                        </span>
                      )}
                      {isComplete && (
                        <span className="text-[10px] text-emerald-400 font-semibold">✓ Complete</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* ══════════════════ PROGRESS + FINANCIAL ══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Progress & Timeline */}
          <SectionCard delay={0.4}>
            <div className="flex items-center justify-between mb-5">
              <SectionTitle icon={Activity} color="cyan">Project Progress</SectionTitle>
              <div className="flex items-baseline gap-1">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="text-4xl font-black text-white"
                >{progress}</motion.span>
                <span className="text-lg font-bold text-slate-500">%</span>
              </div>
            </div>

            <div className="h-5 bg-slate-800 rounded-full overflow-hidden mb-2 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                className={`h-full rounded-full relative ${
                  health >= 90 ? 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-400'
                  : health >= 70 ? 'bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400'
                  : 'bg-gradient-to-r from-amber-600 via-amber-400 to-orange-400'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              </motion.div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Started {project.started_at ? new Date(project.started_at).toLocaleDateString() : 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Deadline {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            {project.started_at && project.deadline && (
              <div className="p-4 bg-slate-800/20 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="uppercase tracking-wider font-semibold">Timeline Elapsed</span>
                  <span className={`font-bold ${timeElapsed > 90 ? 'text-red-400' : timeElapsed > 70 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {timeElapsed}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(timeElapsed, 100)}%` }}
                    transition={{ duration: 1.2, delay: 0.7 }}
                    className={`h-full rounded-full ${
                      timeElapsed > progress + 20 ? 'bg-gradient-to-r from-red-500 to-orange-500'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500'
                    }`}
                  />
                </div>

                {isOverdue && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 mt-2 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
                    Project is {Math.abs(daysLeft!)} days past deadline
                  </p>
                )}
                {!isOverdue && daysLeft !== null && (
                  <p className="text-xs text-cyan-400/70 flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    Project is on schedule
                  </p>
                )}
              </div>
            )}
          </SectionCard>

          {/* Description */}
          {project.description && (
            <SectionCard delay={0.45}>
              <SectionTitle icon={FileText} color="blue">Project Description</SectionTitle>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </SectionCard>
          )}
        </div>

        {/* Right column: Financial + Details + Team */}
        <div className="space-y-6">
          {/* Financial */}
          <SectionCard delay={0.4}>
            <SectionTitle icon={DollarSign} color="cyan">Financial Overview</SectionTitle>
            <div className="flex items-center gap-5 mb-5">
              <BudgetDonut spent={spent} budget={budget} size={110} />
              <div className="flex-1 space-y-2.5">
                {[
                  { label: 'Total Budget', value: fmt(budget), cls: 'text-white' },
                  { label: 'Spent',        value: fmt(spent),  cls: 'text-cyan-400' },
                  { label: 'Remaining',    value: fmt(remaining), cls: remaining < 0 ? 'text-red-400' : 'text-white' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className={`font-bold ${cls}`}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Burn Rate</span>
                  <span className={`font-bold flex items-center gap-1 ${isOnTrack ? 'text-cyan-400' : 'text-red-400'}`}>
                    {isOnTrack ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {isOnTrack ? 'On-track' : 'Over-budget'}
                  </span>
                </div>
              </div>
            </div>

            {project.payment_status && (
              <div className="p-3.5 bg-slate-800/30 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold">Payment Status</span>
                  <span className={`font-bold capitalize flex items-center gap-1 ${
                    project.payment_status === 'paid' ? 'text-emerald-400'
                    : project.payment_status === 'partial' ? 'text-amber-400'
                    : 'text-red-400'
                  }`}>
                    {project.payment_status === 'paid' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {project.payment_status}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    project.payment_status === 'paid' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 w-full'
                    : project.payment_status === 'partial' ? 'bg-gradient-to-r from-amber-500 to-amber-400 w-1/2'
                    : 'bg-red-500 w-[5%]'
                  }`} />
                </div>
              </div>
            )}
          </SectionCard>

          {/* Team Members */}
          <SectionCard delay={0.45}>
            <SectionTitle icon={Users} color="purple">Your Team</SectionTitle>
            {teamMembers.length > 0 ? (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-800/20 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (member.full_name ?? 'T').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{member.full_name ?? 'Team Member'}</p>
                      <p className="text-[11px] text-purple-400 font-medium">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Team details coming soon</p>
                <p className="text-xs text-slate-600 mt-1">Your project manager will update this</p>
              </div>
            )}
          </SectionCard>

          {/* Project Details */}
          <SectionCard delay={0.5}>
            <SectionTitle icon={Layers} color="blue">Project Details</SectionTitle>
            <div className="space-y-3 text-sm">
              {[
                { k: 'Type',     v: (project.type ?? 'N/A').replace(/_/g, ' '), cls: 'text-white capitalize' },
                { k: 'Status',   v: project.status.replace(/_/g, ' '),          cls: `${sc.txt} capitalize` },
                ...(project.deadline ? [{ k: 'Deadline', v: new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), cls: isOverdue ? 'text-red-400' : 'text-white' }] : []),
              ].map(({ k, v, cls }) => (
                <div key={k} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                  <span className="text-slate-400">{k}</span>
                  <span className={`font-semibold ${cls}`}>{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ══════════════════ TECH STACK ══════════════════ */}
      {tech.length > 0 && (
        <SectionCard delay={0.5}>
          <SectionTitle icon={Code2} color="cyan">Tech Stack</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {tech.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="px-4 py-2.5 bg-gradient-to-r from-slate-800/60 to-slate-800/30 border border-slate-700/50 hover:border-cyan-500/40 rounded-xl text-sm text-cyan-300 font-mono font-semibold transition-all hover:shadow-lg hover:shadow-cyan-500/10 hover:bg-cyan-500/5 cursor-default"
              >
                {t}
              </motion.span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ══════════════════ DELIVERABLES ══════════════════ */}
      {deliverables.length > 0 && (
        <SectionCard delay={0.55}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={Package} color="blue">Deliverables</SectionTitle>
            <span className="text-xs font-bold text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
              {completedCount}/{deliverables.length}
            </span>
          </div>

          {/* Overall progress bar */}
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${deliverables.length > 0 ? (completedCount / deliverables.length) * 100 : 0}%` }}
              transition={{ duration: 1, delay: 0.7 }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            />
          </div>

          <div className="space-y-2">
            {deliverables.map((d, i) => {
              const name = getDeliverableName(d, i);
              const done = isDeliverableDone(d);
              const prog = getDeliverableProgress(d);
              const dueDate = typeof d === 'object' && d !== null && !Array.isArray(d)
                ? (d as Record<string, Json | undefined>).due_date as string | null : null;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className={`p-4 rounded-xl border transition-all ${
                    done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/20 border-white/5 hover:border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {done
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      : <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                    }
                    <span className={`text-sm font-medium flex-1 ${done ? 'text-emerald-300 line-through opacity-70' : 'text-white'}`}>
                      {name}
                    </span>
                    {dueDate && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {!done && prog > 0 && (
                    <div className="mt-2 ml-8">
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${prog}%` }} />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* ══════════════════ ACTIVITY FEED ══════════════════ */}
      <SectionCard delay={0.6}>
        <SectionTitle icon={Sparkles} color="purple">Recent Activity</SectionTitle>
        {activities.length > 0 ? (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/30 via-slate-800 to-transparent" />
            <div className="space-y-4">
              {activities.map((act, i) => {
                const ai = getActivityIcon(act.action);
                const AIcon = ai.icon;
                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.06 }}
                    className="relative flex items-start gap-4 pl-2"
                  >
                    <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 ${ai.bg}`}>
                      <AIcon className={`w-4 h-4 ${ai.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{formatActivityAction(act.action)}</p>
                      {act.profiles?.full_name && (
                        <p className="text-xs text-slate-500 mt-0.5">by {act.profiles.full_name}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap flex-shrink-0">{timeAgo(act.created_at)}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-3 border border-white/5">
              <Sparkles className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm text-slate-500">No activity recorded yet</p>
            <p className="text-xs text-slate-600 mt-1">Updates will appear here as your project progresses</p>
          </div>
        )}
      </SectionCard>

      {/* ══════════════════ BOTTOM ACTION BAR ══════════════════ */}
      <motion.div {...fadeUp(0.65)}
        className="bg-gradient-to-br from-[#0a0a16]/90 to-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 sticky bottom-4 z-20 shadow-2xl shadow-black/50"
      >
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => navigate('/user')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <button onClick={() => navigate('/user/messages')}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
            <MessageSquare className="w-4 h-4" /> Send Message
          </button>
          <button onClick={() => navigate('/user/support')}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-semibold transition-all ml-auto hover:scale-[1.02] active:scale-[0.98]">
            <AlertCircle className="w-4 h-4" /> Get Support
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      <div className="h-4" />
    </div>
  );
}
