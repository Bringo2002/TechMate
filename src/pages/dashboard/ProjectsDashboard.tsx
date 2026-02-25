import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import {
  AlertCircle, CheckCircle2, AlertTriangle, Clock, DollarSign, Users,
  ChevronLeft, Mail, Sparkles, Shield, Target, TrendingUp, Activity,
  CircleDot, Loader2, Zap, FileText, ExternalLink, Copy, BarChart3,
  Calendar, ArrowUp, ArrowDown, Layers, Code2, GitBranch, Bug, TestTube2,
  Package, XCircle,
} from 'lucide-react';
import { getProjectById } from '../../services/admin.service';
import { fetchGitHubMetrics, parseGitHubUrl, type GitHubMetrics } from '../../services/github.service';
import type { ProjectRowWithClient, Json } from '../../types/database.types';

// ─── Extended fields interface ────────────────────────────────────────────────
// These fields are optional — the page renders gracefully whether they exist or not.
// Add them to your projects table as JSONB / text columns when ready.
interface ProjectExtended extends ProjectRowWithClient {
  actual_cost?: number;
}

// ─── Currency formatter ───────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const HealthScoreRing = ({ score, size = 80 }: { score: number; size?: number }) => {
  const cfg =
    score >= 90 ? { color: 'text-emerald-400', label: 'Excellent', glow: 'shadow-emerald-500/20' }
    : score >= 75 ? { color: 'text-blue-400', label: 'Good', glow: 'shadow-blue-500/20' }
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
  const clr = pct > 90 ? 'text-red-400' : pct > 70 ? 'text-amber-400' : 'text-emerald-400';
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
  <div className="group relative bg-gradient-to-br from-gray-900/90 to-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 hover:border-gray-700/50 transition-all duration-300 overflow-hidden">
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
      <h4 className="text-xs font-medium text-gray-400 mb-1 tracking-wide uppercase">{label}</h4>
      <p className="text-2xl font-bold text-white leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1.5">{sub}</p>}
    </div>
  </div>
);

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-gradient-to-br from-gray-900/90 to-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 ${className}`}>
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

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // ── Fix #1: Properly typed state — no more `any` ──
  const [project, setProject] = useState<ProjectExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Fix #7: Cleanup ref to prevent setState on unmounted component ──
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Fix #2 + #3 + #6: Service layer, error state, null projectId guard ──
  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getProjectById(projectId).then(({ data, error: fetchError }) => {
      if (!isMounted.current) return;
      if (fetchError || !data) {
        setError(fetchError?.message ?? 'Project not found.');
        setProject(null);
      } else {
        setProject(data as ProjectExtended);
      }
      setLoading(false);
    });
  }, [projectId]);

  // ── Fix #11: Move hooks ABOVE early returns to satisfy Rules of Hooks ──
  // GitHub live metrics
  const githubRepo = (project?.metadata as Record<string, unknown>)?.github_repo as string | undefined;
  const [ghMetrics, setGhMetrics] = useState<GitHubMetrics | null>(null);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);

  useEffect(() => {
    if (!githubRepo) return;
    const parsed = parseGitHubUrl(githubRepo);
    if (!parsed) return;

    let cancelled = false;
    setGhLoading(true);
    setGhError(null);

    fetchGitHubMetrics(parsed.owner, parsed.repo)
      .then((data) => { if (!cancelled) setGhMetrics(data); })
      .catch((err) => { if (!cancelled) setGhError(err.message); })
      .finally(() => { if (!cancelled) setGhLoading(false); });

    return () => { cancelled = true; };
  }, [githubRepo]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-14 h-14 text-emerald-400 animate-spin relative z-10" />
          </div>
          <p className="text-emerald-400/80 font-medium animate-pulse tracking-wide">
            Loading Project Intelligence...
          </p>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-2 h-2 bg-emerald-500/40 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center text-white gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
          <XCircle className="w-16 h-16 text-red-400 relative z-10" />
        </div>
        <h1 className="text-3xl font-bold">
          {error ?? 'Project Not Found'}
        </h1>
        <p className="text-gray-400 max-w-md text-center text-sm">
          {error
            ? 'An error occurred while loading this project. Please try again.'
            : "The project you're looking for doesn't exist or has been removed."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/dashboard/projects')}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/20"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // ─── Derived Data ─────────────────────────────────────────────────────────
  const daysLeft = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 864e5)
    : null;
  const progress = project.progress ?? 0;
  const clientProgress = project.client_visible_progress ?? progress;

  // ── Fix #4: actual_cost not spent ──
  const spent = project.actual_cost ?? 0;
  const budget = project.budget ?? 0;
  const health = project.health_score ?? 100;

  // Optional fields — degrade gracefully if columns don't exist yet
  const tech: string[] = project.technologies ?? [];
  const risks: string[] = project.risks ?? [];
  const opps: string[] = project.opportunities ?? [];
  const blockers: string | null = project.blockers ?? null;
  const fallbackMetrics = project.metrics ?? { commits: 0, prs: 0, bugs: 0, tests: 0 };
  const devMetrics = ghMetrics ?? fallbackMetrics;

  const deliverables: Json[] = Array.isArray(project.deliverables) ? project.deliverables : [];
  const clientName = project.profiles?.full_name || project.client || 'Unknown Client';
  const clientEmail = project.profiles?.email ?? null;
  const burnPct = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;
  const isOnTrack = burnPct <= progress;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  const timeElapsed = (() => {
    if (!project.started_at || !project.deadline) return 0;
    const s = new Date(project.started_at).getTime();
    const e = new Date(project.deadline).getTime();
    const n = Date.now();
    if (n >= e) return 100;
    if (n <= s) return 0;
    return Math.round(((n - s) / (e - s)) * 100);
  })();

  const isAtRisk = timeElapsed > progress + 20;

  // Status config maps
  const statusMap: Record<string, { bg: string; bdr: string; txt: string; dot: string }> = {
    active:    { bg: 'bg-emerald-500/10', bdr: 'border-emerald-500/30', txt: 'text-emerald-400', dot: 'bg-emerald-400' },
    planning:  { bg: 'bg-blue-500/10',    bdr: 'border-blue-500/30',    txt: 'text-blue-400',    dot: 'bg-blue-400' },
    completed: { bg: 'bg-purple-500/10',  bdr: 'border-purple-500/30',  txt: 'text-purple-400',  dot: 'bg-purple-400' },
    review:    { bg: 'bg-cyan-500/10',    bdr: 'border-cyan-500/30',    txt: 'text-cyan-400',    dot: 'bg-cyan-400' },
    on_hold:   { bg: 'bg-amber-500/10',   bdr: 'border-amber-500/30',   txt: 'text-amber-400',   dot: 'bg-amber-400' },
    blocked:   { bg: 'bg-red-500/10',     bdr: 'border-red-500/30',     txt: 'text-red-400',     dot: 'bg-red-400' },
    cancelled: { bg: 'bg-red-500/10',     bdr: 'border-red-500/30',     txt: 'text-red-400',     dot: 'bg-red-400' },
    ready:     { bg: 'bg-purple-500/10',  bdr: 'border-purple-500/30',  txt: 'text-purple-400',  dot: 'bg-purple-400' },
  };
  const sc = statusMap[project.status] ?? statusMap.active;

  const priorityMap: Record<string, { bg: string; bdr: string; txt: string }> = {
    critical: { bg: 'bg-red-500/10',    bdr: 'border-red-500/30',    txt: 'text-red-400' },
    high:     { bg: 'bg-orange-500/10', bdr: 'border-orange-500/30', txt: 'text-orange-400' },
    medium:   { bg: 'bg-amber-500/10',  bdr: 'border-amber-500/30',  txt: 'text-amber-400' },
    low:      { bg: 'bg-green-500/10',  bdr: 'border-green-500/30',  txt: 'text-green-400' },
  };
  const pc = priorityMap[project.priority] ?? priorityMap.medium;

  const riskMap: Record<string, { bg: string; txt: string; label: string; bdr: string }> = {
    low:    { bg: 'bg-emerald-500/10', txt: 'text-emerald-400', label: 'Low Risk',    bdr: 'border-emerald-500/30' },
    medium: { bg: 'bg-amber-500/10',   txt: 'text-amber-400',   label: 'Medium Risk', bdr: 'border-amber-500/30' },
    high:   { bg: 'bg-red-500/10',     txt: 'text-red-400',     label: 'High Risk',   bdr: 'border-red-500/30' },
  };
  const rc = riskMap[project.risk_level ?? 'medium'] ?? riskMap.medium;

  const checkpoints = [
    { label: 'Progress', val: `${progress}%`,           ok: progress >= 50,                           Icon: progress >= 100 ? CheckCircle2 : Target },
    { label: 'Health',   val: `${health}/100`,           ok: health >= 75,                             Icon: health >= 90 ? CheckCircle2 : Sparkles },
    { label: 'Budget',   val: `${burnPct.toFixed(0)}%`,  ok: burnPct <= 85,                            Icon: isOnTrack ? TrendingUp : AlertTriangle },
    { label: 'Timeline', val: daysLeft != null ? `${daysLeft}d` : '—', ok: daysLeft === null || daysLeft > 0, Icon: daysLeft != null && daysLeft > 7 ? CheckCircle2 : Clock },
  ];

  // ── Share Report: Web Share API with clipboard fallback ──
  const handleCopyLink = async () => {
    const url = window.location.href;
    const shareTitle = `${project.name} — Project Report`;
    const shareText = `${project.name} | Status: ${project.status} | Progress: ${progress}% | Health: ${health}/100`;

    // Use native Web Share API if available (mobile + modern desktop)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err: unknown) {
        // User cancelled the share — fall through to clipboard
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Deliverable helpers ───────────────────────────────────────────────────
  const getDeliverableName = (d: typeof deliverables[number], i: number): string => {
    if (typeof d === 'string') return d;
    if (typeof d === 'object' && d !== null && !Array.isArray(d)) {
      const obj = d as Record<string, Json | undefined>;
      return (obj.name as string) ?? (obj.title as string) ?? `Deliverable ${i + 1}`;
    }
    return `Deliverable ${i + 1}`;
  };

  const isDeliverableDone = (d: typeof deliverables[number]): boolean => {
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
    <div className="min-h-screen bg-[#0A0E1A] text-white p-4 md:p-6 space-y-6">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-purple-900/20 border border-emerald-500/20 rounded-3xl p-6 md:p-8 lg:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-56 h-56 bg-purple-500/3 rounded-full blur-3xl" />

        <div className="relative z-10">
          <button onClick={() => navigate('/dashboard/projects')}
            className="flex items-center gap-1.5 text-sm text-emerald-400/80 hover:text-emerald-400 font-medium mb-5 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent leading-tight mb-4">
                {project.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${sc.bg} ${sc.bdr} ${sc.txt}`}>
                  <span className={`w-2 h-2 rounded-full ${sc.dot} ${project.status === 'active' ? 'animate-pulse' : ''}`} />
                  {project.status}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${pc.bg} ${pc.bdr} ${pc.txt}`}>
                  <Zap className="w-3 h-3" /> {project.priority}
                </span>
                {project.risk_level && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${rc.bg} ${rc.bdr} ${rc.txt}`}>
                    <Shield className="w-3 h-3" /> {rc.label}
                  </span>
                )}
                {project.status === 'completed' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-white">{clientName}</span>
                </span>
                {clientEmail && (
                  <button onClick={() => window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(clientEmail)}&su=${encodeURIComponent(`Re: ${project.name}`)}`, '_blank')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold transition-all">
                    <Mail className="w-3 h-3" /> Email Client
                  </button>
                )}
                <span className="hidden md:flex items-center gap-1 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {project.updated_at && (
                  <span className="flex items-center gap-1.5 text-xs">
                    <CircleDot className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span className="text-emerald-400/70">
                      Live · Updated {new Date(project.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <HealthScoreRing score={health} size={96} />
              <span className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase">Project Health</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Checkpoint Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {checkpoints.map((ch, i) => (
          <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            ch.ok
              ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
              : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
          }`}>
            <ch.Icon className={`w-6 h-6 flex-shrink-0 ${ch.ok ? 'text-emerald-400' : 'text-red-400'}`} />
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{ch.label}</div>
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
          icon={DollarSign} color="emerald"
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
          label="Budget Burn" value={`${burnPct.toFixed(1)}%`}
          sub={`${isOnTrack ? 'On-track' : 'Over-spending'} vs ${progress}% progress`}
          icon={isOnTrack ? TrendingUp : BarChart3}
          color={burnPct > progress + 15 ? 'red' : 'emerald'}
          trend={burnPct > progress + 15 ? 'down' : 'up'}
        />
      </div>

      {/* ── Progress + Financial ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Progress & Timeline */}
          <SectionCard>
            <div className="flex items-center justify-between mb-5">
              <SectionTitle icon={Activity} color="emerald">Project Progress</SectionTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{progress}</span>
                <span className="text-lg font-bold text-gray-500">%</span>
              </div>
            </div>

            <div className="h-5 bg-gray-800 rounded-full overflow-hidden mb-2 relative">
              <div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                health >= 90 ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400'
                : health >= 70 ? 'bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400'
                : 'bg-gradient-to-r from-amber-600 via-amber-400 to-orange-400'
              }`} style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              </div>
            </div>

            {clientProgress !== progress && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span>Client sees: <span className="text-white font-semibold">{clientProgress}%</span></span>
                <span className="text-gray-600">·</span>
                <span>Internal: <span className="text-white font-semibold">{progress}%</span></span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mb-5">
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
              <div className="p-4 bg-gray-800/20 rounded-xl border border-gray-800/30">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="uppercase tracking-wider font-semibold">Timeline Elapsed</span>
                  <span className={`font-bold ${timeElapsed > 90 ? 'text-red-400' : timeElapsed > 70 ? 'text-amber-400' : 'text-blue-400'}`}>
                    {timeElapsed}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all duration-700 ${
                    isAtRisk ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'
                  }`} style={{ width: `${Math.min(timeElapsed, 100)}%` }} />
                </div>

                {isAtRisk && (
                  <p className="text-xs text-red-400/80 flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Timeline is {timeElapsed - progress}% ahead of progress — schedule at risk
                  </p>
                )}
                {isOverdue && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 mt-2 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
                    Project is {Math.abs(daysLeft!)} days overdue
                  </p>
                )}
                {!isAtRisk && !isOverdue && (
                  <p className="text-xs text-emerald-400/70 flex items-center gap-1.5 mt-2">
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
                        <div className={`h-1 rounded-full mb-1 ${isDone ? 'bg-emerald-500' : isActive ? 'bg-blue-500' : 'bg-gray-800'}`} />
                        <span className={`text-[9px] font-medium ${isDone ? 'text-emerald-400' : isActive ? 'text-blue-400' : 'text-gray-600'}`}>
                          {phase}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Dev Metrics */}
          <SectionCard>
            <SectionTitle icon={GitBranch} color="blue">Development Metrics</SectionTitle>
            {ghLoading ? (
              <div className="flex items-center justify-center py-8 gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-sm text-gray-400">Fetching GitHub data...</span>
              </div>
            ) : ghError ? (
              <div className="text-center py-6">
                <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-amber-400/80">Could not fetch GitHub data</p>
                <p className="text-xs text-gray-600 mt-1">{ghError}</p>
              </div>
            ) : !githubRepo && devMetrics.commits === 0 && devMetrics.prs === 0 ? (
              <div className="text-center py-6">
                <Code2 className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No GitHub repository linked</p>
                <button
                  onClick={() => navigate(`/dashboard/projects/${project.id}/edit`)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Connect a GitHub repo →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { l: 'Commits',       v: devMetrics.commits, I: Code2,     c: 'emerald' },
                  { l: 'Pull Requests', v: devMetrics.prs,     I: GitBranch, c: 'blue' },
                  { l: 'Open Bugs',     v: devMetrics.bugs,    I: Bug,       c: devMetrics.bugs === 0 ? 'emerald' : 'amber' },
                  { l: 'CI Runs',       v: devMetrics.tests,   I: TestTube2, c: 'purple' },
                ].map((m, i) => (
                  <div key={i} className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-800/30 hover:border-gray-700/50 transition-all group cursor-default">
                    <m.I className={`w-5 h-5 text-${m.c}-400 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                    <div className="text-2xl font-black text-white mb-0.5">{m.v}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{m.l}</div>
                  </div>
                ))}
                {githubRepo && (
                  <div className="col-span-full text-right">
                    <a
                      href={githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-600 hover:text-blue-400 transition-colors"
                    >
                      View on GitHub →
                    </a>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Financial Intelligence */}
        <div className="space-y-6">
          <SectionCard>
            <SectionTitle icon={DollarSign} color="emerald">Financial Intelligence</SectionTitle>
            <div className="flex items-center gap-5 mb-5">
              <BudgetDonut spent={spent} budget={budget} size={110} />
              <div className="flex-1 space-y-2.5">
                {[
                  { label: 'Total Budget', value: fmt(budget), cls: 'text-white' },
                  { label: 'Spent',        value: fmt(spent),  cls: 'text-emerald-400' },
                  { label: 'Remaining',    value: fmt(remaining), cls: remaining < 0 ? 'text-red-400' : 'text-white' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className={`font-bold ${cls}`}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Burn Rate</span>
                  <span className={`font-bold flex items-center gap-1 ${isOnTrack ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isOnTrack ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {isOnTrack ? 'On-track' : 'Over-budget'}
                  </span>
                </div>
              </div>
            </div>

            {project.payment_status && (
              <div className="p-3.5 bg-gray-800/30 rounded-xl border border-gray-800/30">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400 uppercase tracking-wider font-semibold">Payment Status</span>
                  <span className={`font-bold capitalize flex items-center gap-1 ${
                    project.payment_status === 'paid' ? 'text-emerald-400'
                    : project.payment_status === 'partial' ? 'text-amber-400'
                    : 'text-red-400'
                  }`}>
                    {project.payment_status === 'paid' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {project.payment_status}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
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
                { k: 'Type',     v: project.type ?? 'N/A',             cls: 'text-white capitalize' },
                { k: 'Status',   v: project.status,                    cls: `${sc.txt} capitalize` },
                { k: 'Priority', v: project.priority,                  cls: `${pc.txt} capitalize` },
                ...(project.risk_level ? [{ k: 'Risk Level', v: project.risk_level, cls: `${rc.txt} capitalize` }] : []),
              ].map(({ k, v, cls }) => (
                <div key={k} className="flex justify-between items-center py-1 border-b border-gray-800/30 last:border-0">
                  <span className="text-gray-400">{k}</span>
                  <span className={`font-semibold ${cls}`}>{v}</span>
                </div>
              ))}
              {project.deadline && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-400">Deadline</span>
                  <span className={`font-semibold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                    {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Risk & Opportunities ── */}
      {(blockers || risks.length > 0 || opps.length > 0) && (
        <div className="space-y-4">
          {blockers && (
            <div className="relative overflow-hidden bg-gradient-to-r from-red-900/20 via-red-900/10 to-transparent border border-red-500/30 rounded-2xl p-5 hover:border-red-500/50 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full blur-3xl" />
              <div className="relative z-10 flex items-start gap-3">
                <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-red-400 text-sm uppercase tracking-wider mb-1">Critical Blocker</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{blockers}</p>
                </div>
              </div>
            </div>
          )}
          {(risks.length > 0 || opps.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {risks.length > 0 && (
                <SectionCard className="border-amber-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    </div>
                    <h4 className="font-bold text-amber-400">Identified Risks</h4>
                    <span className="ml-auto text-xs bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full font-bold">{risks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {risks.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-300 p-3 bg-gray-800/20 rounded-xl border border-gray-800/20 hover:border-amber-500/10 transition-all">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
              {opps.length > 0 && (
                <SectionCard className="border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h4 className="font-bold text-emerald-400">Opportunities</h4>
                    <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">{opps.length}</span>
                  </div>
                  <div className="space-y-2">
                    {opps.map((o, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-300 p-3 bg-gray-800/20 rounded-xl border border-gray-800/20 hover:border-emerald-500/10 transition-all">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{o}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tech Stack ── */}
      {tech.length > 0 && (
        <SectionCard>
          <SectionTitle icon={Code2} color="cyan">Tech Stack</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {tech.map((t) => (
              <span key={t} className="px-4 py-2.5 bg-gradient-to-r from-gray-800/60 to-gray-800/30 border border-gray-700/50 hover:border-cyan-500/40 rounded-xl text-sm text-cyan-300 font-mono font-semibold transition-all hover:shadow-lg hover:shadow-cyan-500/10 hover:bg-cyan-500/5 cursor-default">
                {t}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Description + Internal Notes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {project.description && (
          <SectionCard>
            <SectionTitle icon={FileText} color="blue">Project Description</SectionTitle>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </SectionCard>
        )}
        {project.internal_notes && (
          <div className="bg-gradient-to-br from-amber-900/10 to-gray-900/40 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-amber-400" />
              Internal Notes
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ml-2 border border-amber-500/20">
                Admin Only
              </span>
            </h3>
            <p className="text-sm text-amber-200/80 leading-relaxed whitespace-pre-wrap">{project.internal_notes}</p>
          </div>
        )}
      </div>

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
                  done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-gray-800/20 border-gray-800/30 hover:border-gray-700/50'
                }`}>
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    : <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0" />
                  }
                  <span className={`text-sm font-medium ${done ? 'text-emerald-300 line-through opacity-70' : 'text-white'}`}>
                    {name}
                  </span>
                  {dueDate && (
                    <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800/30 flex items-center justify-between text-xs text-gray-500">
            <span>{completedCount} / {deliverables.length} completed</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {deliverables.length > 0 ? Math.round((completedCount / deliverables.length) * 100) : 0}% done
            </span>
          </div>
        </SectionCard>
      )}

      {/* ── Sticky Action Bar ── */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 sticky bottom-4 z-20 shadow-2xl shadow-black/50">
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => navigate('/dashboard/projects')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm font-semibold transition-all">
            <ChevronLeft className="w-4 h-4" /> All Projects
          </button>
          <button onClick={() => navigate(`/dashboard/projects/${project.id}/edit`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-semibold transition-all">
            <FileText className="w-4 h-4" /> Edit Project
          </button>
          {clientEmail && (
            <button onClick={() => window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(clientEmail)}&su=${encodeURIComponent(`Re: ${project.name}`)}`, '_blank')}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold transition-all">
              <Mail className="w-4 h-4" /> Contact Client
            </button>
          )}
          <button onClick={() => window.open(window.location.href, '_blank')}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-semibold transition-all">
            <ExternalLink className="w-4 h-4" /> Open in New Tab
          </button>
          <button onClick={handleCopyLink}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-semibold transition-all ml-auto">
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share Report'}
          </button>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}