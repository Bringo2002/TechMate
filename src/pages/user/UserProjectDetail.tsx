import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import {
  AlertCircle, CheckCircle2, AlertTriangle, Clock, DollarSign,
  ChevronLeft, Sparkles, Target, TrendingUp, Activity,
  Loader2, FileText, Calendar, ArrowUp, ArrowDown, Layers, Code2,
  Package, XCircle,
} from 'lucide-react';
import supabase from '../../lib/supabaseClient';
import type { ProjectRow, Json } from '../../types/database.types';

// ─── Currency formatter ───────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const HealthScoreRing = ({ score, size = 80 }: { score: number; size?: number }) => {
  const cfg =
    score >= 90 ? { color: 'text-emerald-400', label: 'Excellent', glow: 'shadow-emerald-500/20' }
    : score >= 75 ? { color: 'text-cyan-400', label: 'Good', glow: 'shadow-cyan-500/20' }
    : score >= 60 ? { color: 'text-amber-400', label: 'Fair', glow: 'shadow-amber-500/20' }
    : { color: 'text-red-400', label: 'Critical', glow: 'shadow-red-500/20' };
  const r = (size / 2) - 6;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className={`relative shadow-xl ${cfg.glow} rounded-full`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="5" fill="none" className="text-gray-800" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="5" fill="none"
          className={cfg.color} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white">{score}</span>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
      </div>
    </div>
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
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; trend?: 'up' | 'down' | 'neutral';
}) => (
  <div className="group relative bg-gradient-to-br from-[#0a0a16]/90 to-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-cyan-500/20 transition-all duration-300 overflow-hidden">
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
  </div>
);

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-gradient-to-br from-[#0a0a16]/90 to-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, color, children }: { icon: React.ElementType; color: string; children: React.ReactNode }) => (
  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
    <Icon className={`w-5 h-5 text-${color}-400`} />
    {children}
  </h3>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function UserProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
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
      // Verify user owns this project
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted.current) { setError('Not authenticated'); setLoading(false); }
        return;
      }

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
      } else {
        setProject(data as ProjectRow);
      }
      setLoading(false);
    })();
  }, [projectId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-14 h-14 text-cyan-400 animate-spin relative z-10" />
          </div>
          <p className="text-cyan-400/80 font-medium animate-pulse tracking-wide">
            Loading Project Details...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white gap-6 p-10">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
          <XCircle className="w-16 h-16 text-red-400 relative z-10" />
        </div>
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
  const progress = project.client_visible_progress ?? project.progress ?? 0;
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

  // Status styles
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

  const completedCount = deliverables.filter(isDeliverableDone).length;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20 border border-cyan-500/20 rounded-3xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <button onClick={() => navigate('/user')}
            className="flex items-center gap-1.5 text-sm text-cyan-400/80 hover:text-cyan-400 font-medium mb-5 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent leading-tight mb-4">
                {project.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${sc.bg} ${sc.bdr} ${sc.txt}`}>
                  <span className={`w-2 h-2 rounded-full ${sc.dot} ${project.status === 'active' ? 'animate-pulse' : ''}`} />
                  {project.status.replace(/_/g, ' ')}
                </span>
                {project.status === 'completed' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
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
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <HealthScoreRing score={health} size={96} />
              <span className="text-[11px] text-slate-500 font-semibold tracking-wider uppercase">Project Health</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Checkpoint Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {checkpoints.map((ch, i) => (
          <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            ch.ok
              ? 'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40'
              : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
          }`}>
            <ch.Icon className={`w-6 h-6 flex-shrink-0 ${ch.ok ? 'text-cyan-400' : 'text-red-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{ch.label}</div>
              <div className="text-xl font-black text-white">{ch.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Budget" value={fmt(budget)}
          sub={`${fmt(spent)} spent · ${fmt(remaining)} remaining`}
          icon={DollarSign} color="cyan"
          trend={spent > budget * 0.9 ? 'down' : 'up'}
        />
        <StatCard
          label="Timeline" value={daysLeft != null ? `${Math.abs(daysLeft)}d` : '—'}
          sub={isOverdue ? `Overdue by ${Math.abs(daysLeft!)} days` : daysLeft != null ? `${daysLeft} days left` : 'No deadline set'}
          icon={Clock}
          color={isOverdue ? 'red' : daysLeft != null && daysLeft < 7 ? 'amber' : 'blue'}
          trend={isOverdue ? 'down' : 'neutral'}
        />
        <StatCard
          label="Completion" value={`${progress}%`}
          sub={project.status === 'completed' ? 'Project delivered ✓' : `${100 - progress}% remaining`}
          icon={Target} color="purple"
          trend={progress >= 75 ? 'up' : 'neutral'}
        />
        <StatCard
          label="Budget Usage" value={`${burnPct.toFixed(1)}%`}
          sub={`${isOnTrack ? 'On-track' : 'Over-spending'} vs ${progress}% progress`}
          icon={isOnTrack ? TrendingUp : AlertTriangle}
          color={burnPct > progress + 15 ? 'red' : 'cyan'}
          trend={burnPct > progress + 15 ? 'down' : 'up'}
        />
      </div>

      {/* ── Progress & Financial ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Progress & Timeline */}
          <SectionCard>
            <div className="flex items-center justify-between mb-5">
              <SectionTitle icon={Activity} color="cyan">Project Progress</SectionTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{progress}</span>
                <span className="text-lg font-bold text-slate-500">%</span>
              </div>
            </div>

            <div className="h-5 bg-slate-800 rounded-full overflow-hidden mb-2 relative">
              <div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                health >= 90 ? 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-400'
                : health >= 70 ? 'bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400'
                : 'bg-gradient-to-r from-amber-600 via-amber-400 to-orange-400'
              }`} style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              </div>
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
                  <div className={`h-full rounded-full transition-all duration-700 ${
                    timeElapsed > progress + 20 ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500'
                  }`} style={{ width: `${Math.min(timeElapsed, 100)}%` }} />
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

                <div className="flex items-center gap-1 mt-3">
                  {['Planning', 'Development', 'Review', 'Delivery'].map((phase, i) => {
                    const phasePct = (i + 1) * 25;
                    const isActive = progress >= i * 25 && progress < phasePct;
                    const isDone = progress >= phasePct;
                    return (
                      <div key={phase} className="flex-1 text-center">
                        <div className={`h-1 rounded-full mb-1 ${isDone ? 'bg-cyan-500' : isActive ? 'bg-blue-500' : 'bg-slate-800'}`} />
                        <span className={`text-[9px] font-medium ${isDone ? 'text-cyan-400' : isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                          {phase}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Description */}
          {project.description && (
            <SectionCard>
              <SectionTitle icon={FileText} color="blue">Project Description</SectionTitle>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </SectionCard>
          )}
        </div>

        {/* Financial Intelligence */}
        <div className="space-y-6">
          <SectionCard>
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

          {/* Project Details */}
          <SectionCard>
            <SectionTitle icon={Layers} color="purple">Project Details</SectionTitle>
            <div className="space-y-3 text-sm">
              {[
                { k: 'Type',     v: project.type ?? 'N/A',   cls: 'text-white capitalize' },
                { k: 'Status',   v: project.status.replace(/_/g, ' '), cls: `${sc.txt} capitalize` },
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

      {/* ── Tech Stack ── */}
      {tech.length > 0 && (
        <SectionCard>
          <SectionTitle icon={Code2} color="cyan">Tech Stack</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {tech.map((t) => (
              <span key={t} className="px-4 py-2.5 bg-gradient-to-r from-slate-800/60 to-slate-800/30 border border-slate-700/50 hover:border-cyan-500/40 rounded-xl text-sm text-cyan-300 font-mono font-semibold transition-all hover:shadow-lg hover:shadow-cyan-500/10 hover:bg-cyan-500/5 cursor-default">
                {t}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Deliverables ── */}
      {deliverables.length > 0 && (
        <SectionCard>
          <SectionTitle icon={Package} color="blue">Deliverables</SectionTitle>
          <div className="space-y-2">
            {deliverables.map((d, i) => {
              const name = getDeliverableName(d, i);
              const done = isDeliverableDone(d);
              const dueDate = typeof d === 'object' && d !== null && !Array.isArray(d) ? (d as Record<string, Json | undefined>).due_date as string | null : null;
              return (
                <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/20 border-white/5 hover:border-slate-700/50'
                }`}>
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    : <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                  }
                  <span className={`text-sm font-medium ${done ? 'text-emerald-300 line-through opacity-70' : 'text-white'}`}>
                    {name}
                  </span>
                  {dueDate && (
                    <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>{completedCount} / {deliverables.length} completed</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {deliverables.length > 0 ? Math.round((completedCount / deliverables.length) * 100) : 0}% done
            </span>
          </div>
        </SectionCard>
      )}

      {/* ── Bottom Bar ── */}
      <div className="bg-gradient-to-br from-[#0a0a16]/90 to-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 sticky bottom-4 z-20 shadow-2xl shadow-black/50">
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => navigate('/user')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl text-sm font-semibold transition-all">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <button onClick={() => navigate('/user/support')}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-semibold transition-all ml-auto">
            <AlertCircle className="w-4 h-4" /> Contact Support
          </button>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
