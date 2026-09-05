import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, AlertTriangle, DollarSign,
  Briefcase, Sparkles, Brain, Command, ChevronRight,
  LayoutGrid, List, Target, TrendingUp,
  ArrowUp, ArrowDown, Zap, CheckCircle2, XCircle,
  RefreshCw, BarChart3, MessageSquare, Send, X,
  Clock,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';

import { getAllProjects } from '../../services/admin.service';
import type { ProjectRowWithClient } from '../../types/database.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIInsight {
  type: 'warning' | 'success' | 'info' | 'critical';
  message: string;
  action?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400' },
  red:     { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400' },
  purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400' },
};

const PRIORITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  critical: { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400' },
  high:     { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  medium:   { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  low:      { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  planning: { bg: 'bg-blue-500/10',   text: 'text-blue-400' },
  active:   { bg: 'bg-green-500/10',  text: 'text-green-400' },
  on_hold:  { bg: 'bg-red-500/10',    text: 'text-red-400' },
  completed:{ bg: 'bg-purple-500/10', text: 'text-purple-400' },
};

// AI cooldown: prevent spamming API calls (30s between requests)
const AI_COOLDOWN_MS = 30_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getClientName = (p: ProjectRowWithClient): string =>
  p.profiles?.full_name || p.profiles?.email || p.client || '—';

const formatBudget = (n: number): string => `$${(n / 1000).toFixed(0)}K`;

const daysRemaining = (deadline: string | null): number => {
  if (!deadline) return 0;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

// ─── Secure AI caller ─────────────────────────────────────────────────────────

async function callAI(_system: string, _messages: ChatMessage[], _maxTokens = 1500): Promise<string> {
  // AI insights not yet available on NestJS backend
  throw new Error('AI insights are not yet available. This feature is coming soon.');
}

// ─── Component ────────────────────────────────────────────────────────────────

const Projects = () => {
  const navigate = useNavigate();

  // ── Data State ──────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<ProjectRowWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── UI State ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'budget' | 'created' | 'priority'>('created');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // ── AI State ────────────────────────────────────────────────────────────────
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiConversation, setAiConversation] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [lastAiCall, setLastAiCall] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        setShowAiPanel((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Auto-scroll chat ────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiConversation]);

  // ── Fetch real data ─────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getAllProjects();
      if (fetchError || !data) throw new Error(fetchError?.message || 'No data returned');
      setProjects(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load projects: ${msg}`);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh without full-page spinner
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getAllProjects();
      if (fetchError || !data) throw new Error(fetchError?.message || 'No data returned');
      setProjects(data);
      // Also reset AI insights so they regenerate with fresh data
      setAiInsights([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load projects: ${msg}`);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── Auto-generate insights once data is loaded ──────────────────────────────
  useEffect(() => {
    if (projects.length > 0 && aiInsights.length === 0) {
      generateAiInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  // ── AI: Local fallback insights (no API needed) ─────────────────────────────
  const generateFallbackInsights = useCallback(() => {
    const insights: AIInsight[] = [];
    const now = new Date();
    const overdue = projects.filter((p) => p.deadline && new Date(p.deadline) < now && p.status !== 'completed');
    const critical = projects.filter((p) => p.priority === 'critical');
    const on_hold = projects.filter((p) => p.status === 'on_hold');
    const totalBudget = projects.reduce((s, p) => s + (p.budget ?? 0), 0);
    const totalSpent = projects.reduce((s, p) => s + (p.spent ?? 0), 0);
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    if (overdue.length > 0) {
      insights.push({
        type: 'critical',
        message: `${overdue.length} project${overdue.length > 1 ? 's are' : ' is'} overdue`,
        action: 'Review timelines and reallocate resources immediately',
      });
    }
    if (critical.length > 0) {
      insights.push({
        type: 'warning',
        message: `${critical.length} critical-priority project${critical.length > 1 ? 's' : ''} in pipeline`,
        action: 'Ensure senior developers are assigned',
      });
    }
    if (on_hold.length > 0) {
      insights.push({
        type: 'warning',
        message: `${on_hold.length} on-hold project${on_hold.length > 1 ? 's need' : ' needs'} resolution`,
        action: 'Schedule unblocking sessions with stakeholders',
      });
    }
    insights.push(
      utilization > 80
        ? { type: 'warning', message: `Budget utilization at ${utilization.toFixed(1)}% — approaching limit`, action: 'Review and negotiate budget extensions' }
        : { type: 'success', message: `Healthy budget utilization at ${utilization.toFixed(1)}%`, action: 'Maintain current spending trajectory' }
    );
    insights.push({
      type: 'info',
      message: `${formatBudget(totalBudget)} total portfolio value across ${projects.length} projects`,
    });

    setAiInsights(insights);
  }, [projects]);

  // ── AI: Generate insights ───────────────────────────────────────────────────
  const generateAiInsights = useCallback(async () => {
    // Rate limiting: don't spam the API
    const now = Date.now();
    if (now - lastAiCall < AI_COOLDOWN_MS) return;

    setIsAnalyzing(true);
    setLastAiCall(now);

    const summary = projects.map((p) => ({
      name: p.name,
      status: p.status,
      priority: p.priority,
      budget: p.budget,
      deadline: p.deadline,
      progress: p.progress ?? 0,
      daysLeft: daysRemaining(p.deadline),
    }));

    const system = `You are a project portfolio analyst for TechMate, a software agency. 
Analyze the given projects and return ONLY a valid JSON array of 4-5 insights.
Each insight: { "type": "warning"|"success"|"info"|"critical", "message": string, "action": string }
No markdown, no prose — raw JSON array only.`;

    try {
      const raw = await callAI(system, [
        { role: 'user', content: `Projects:\n${JSON.stringify(summary, null, 2)}` },
      ], 800);

      // Safe JSON parse with type guard
      const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        setAiInsights(parsed);
      } else {
        throw new Error('Response is not an array');
      }
    } catch {
      // Fall back to local calculations — never show an error to the user for insights
      generateFallbackInsights();
    } finally {
      setIsAnalyzing(false);
    }
  }, [projects, lastAiCall, generateFallbackInsights]);

  // ── AI: Deep portfolio analysis ─────────────────────────────────────────────
  const handleDeepAnalysis = async () => {
    const now = Date.now();
    if (now - lastAiCall < AI_COOLDOWN_MS) {
      setAiResponse('_Please wait a moment before running another analysis._');
      return;
    }
    setIsAnalyzing(true);
    setLastAiCall(now);

    const details = projects.map((p) => ({
      name: p.name,
      client: getClientName(p),
      type: p.type,
      budget: p.budget,
      spent: p.spent ?? 0,
      status: p.status,
      priority: p.priority,
      deadline: p.deadline,
      progress: p.progress ?? 0,
      daysLeft: daysRemaining(p.deadline),
    }));

    const system = `You are an expert project portfolio analyst for TechMate, a software agency.
Provide a comprehensive, actionable analysis in clean markdown. Be direct and specific.`;

    try {
      const result = await callAI(system, [{
        role: 'user',
        content: `Analyze this portfolio. Include: overall health, risks, resource allocation, budget optimization, timeline concerns, and Q2 recommendations.\n\n${JSON.stringify(details, null, 2)}`,
      }], 2000);
      setAiResponse(result);
    } catch {
      setAiResponse('**Analysis failed.** Please check your Edge Function deployment and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── AI: Chat with context ───────────────────────────────────────────────────
  // Fix: project context goes in the `system` param — not as a fake user message.
  // This avoids the consecutive user-message API violation.
  const handleSendMessage = async () => {
    if (!userMessage.trim() || isSendingMessage) return;

    const newMsg: ChatMessage = { role: 'user', content: userMessage };
    const updatedConversation = [...aiConversation, newMsg];
    setAiConversation(updatedConversation);
    setUserMessage('');
    setIsSendingMessage(true);

    const contextSummary = projects.map((p) => ({
      name: p.name,
      client: getClientName(p),
      status: p.status,
      priority: p.priority,
      budget: p.budget,
      deadline: p.deadline,
      progress: p.progress ?? 0,
      daysLeft: daysRemaining(p.deadline),
    }));

    // Project context is the SYSTEM prompt — not injected as a user message
    const system = `You are an AI project management assistant for TechMate, a software agency.
Answer questions concisely and helpfully. Current portfolio context:
${JSON.stringify(contextSummary, null, 2)}`;

    try {
      const reply = await callAI(system, updatedConversation, 1200);
      setAiConversation((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setAiConversation((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error reaching AI. Please check your Edge Function.' },
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // ── Computed Stats (real data, no hardcoded changes) ────────────────────────
  const stats = useMemo(() => {
    const totalBudget = projects.reduce((s, p) => s + (p.budget ?? 0), 0);
    const totalSpent = projects.reduce((s, p) => s + (p.spent ?? 0), 0);
    const activeCount = projects.filter((p) => p.status === 'active').length;
    const atRiskCount = projects.filter(
      (p) => (p.deadline && new Date(p.deadline) < new Date()) || p.status === 'on_hold'
    ).length;
    const avgProgress =
      projects.length > 0
        ? projects.reduce((s, p) => s + (p.progress ?? 0), 0) / projects.length
        : 0;
    const budgetUtil = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return [
      {
        label: 'Total Budget',
        value: formatBudget(totalBudget),
        sub: `${formatBudget(totalSpent)} spent`,
        trend: budgetUtil < 90 ? 'up' : 'down',
        icon: DollarSign,
        color: 'emerald',
      },
      {
        label: 'Active Projects',
        value: activeCount.toString(),
        sub: `${projects.length} total`,
        trend: 'up',
        icon: Briefcase,
        color: 'blue',
      },
      {
        label: 'At Risk',
        value: atRiskCount.toString(),
        sub: atRiskCount > 0 ? 'Needs attention' : 'All on track',
        trend: atRiskCount > 0 ? 'down' : 'up',
        icon: AlertTriangle,
        color: 'red',
      },
      {
        label: 'Avg Progress',
        value: `${Math.round(avgProgress)}%`,
        sub: `across ${projects.length} projects`,
        trend: avgProgress > 50 ? 'up' : 'down',
        icon: TrendingUp,
        color: 'purple',
      },
    ];
  }, [projects]);

  const statusData = useMemo(() => [
    { name: 'Planning', value: projects.filter((p) => p.status === 'planning').length, color: '#6366f1' },
    { name: 'Active',   value: projects.filter((p) => p.status === 'active').length,   color: '#10b981' },
    { name: 'On Hold',  value: projects.filter((p) => p.status === 'on_hold').length,  color: '#ef4444' },
    { name: 'Completed',value: projects.filter((p) => p.status === 'completed').length,color: '#f59e0b' },
  ], [projects]);

  const budgetTrendData = useMemo(() =>
    [...projects]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 6)
      .map((p) => ({
        name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
        budget: +(p.budget / 1000).toFixed(1),
        actual: +((p.spent ?? 0) / 1000).toFixed(1),
      })),
  [projects]);

  const filteredProjects = useMemo(() =>
    projects
      .filter((p) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          getClientName(p).toLowerCase().includes(q) ||
          (p.type?.toLowerCase().includes(q) ?? false);
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || p.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'deadline':  return new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
          case 'budget':    return (b.budget ?? 0) - (a.budget ?? 0);
          case 'priority': {
            const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
            return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
          }
          default:          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      }),
  [projects, searchQuery, filterStatus, filterPriority, sortBy]);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Loading project data...</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center max-w-md">
          <XCircle size={56} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Failed to load projects</h3>
          <p className="text-red-300/70 text-sm mb-6">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-delay" />
      </div>

      <div className="relative z-10 p-6 max-w-[1800px] mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent mb-2 font-orbitron">
              Project Intelligence Hub
            </h1>
            <p className="text-slate-400 flex items-center gap-2 text-sm">
              <Sparkles className="text-emerald-400" size={14} />
              {projects.length} projects · AI-powered insights
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 border border-slate-700 ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowAiPanel((v) => !v)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25"
            >
              <Brain size={16} />
              AI Copilot
              <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">⌘I</kbd>
            </button>
            <button
              onClick={() => navigate('/dashboard/create-project')}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Plus size={18} /> New Project
            </button>
          </div>
        </div>

        {/* ── AI Insights Banner ── */}
        {aiInsights.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="text-purple-400 mt-0.5 flex-shrink-0" size={18} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-white font-semibold text-sm">AI Portfolio Insights</h3>
                  {isAnalyzing && (
                    <span className="flex items-center gap-1 text-xs text-purple-300">
                      <Clock size={10} className="animate-spin" /> Analyzing...
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs ml-auto">Live</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {aiInsights.slice(0, 4).map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-900/40 rounded-lg">
                      {insight.type === 'critical' && <XCircle      className="text-red-400    flex-shrink-0 mt-0.5" size={14} />}
                      {insight.type === 'warning'  && <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={14} />}
                      {insight.type === 'success'  && <CheckCircle2  className="text-green-400  flex-shrink-0 mt-0.5" size={14} />}
                      {insight.type === 'info'     && <Sparkles      className="text-blue-400   flex-shrink-0 mt-0.5" size={14} />}
                      <div>
                        <p className="text-purple-200 text-xs leading-relaxed">{insight.message}</p>
                        {insight.action && (
                          <p className="text-purple-400/60 text-xs mt-1">→ {insight.action}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAiPanel(true)}
                  className="text-purple-300 hover:text-purple-200 text-xs mt-3 flex items-center gap-1 transition-colors"
                >
                  Open full analysis <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats Grid (real computed data) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const colors = COLORS[stat.color as keyof typeof COLORS];
            return (
              <div key={idx} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                    <Icon className={colors.text} size={18} />
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up'
                      ? <ArrowUp   className="text-emerald-400" size={14} />
                      : <ArrowDown className="text-red-400"     size={14} />
                    }
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1 font-orbitron">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-xs text-slate-600 mt-1">{stat.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Charts ── */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-emerald-400" />
                Budget vs Actual Cost ($K)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={budgetTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                  <YAxis stroke="#475569" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="budget" stroke="#10b981" strokeWidth={2} dot={false} name="Budget" />
                  <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} dot={false} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-4">Status Breakdown</h3>
              {statusData.some((s) => s.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={statusData.filter((s) => s.value > 0)}
                        cx="50%" cy="50%"
                        innerRadius={45} outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusData.filter((s) => s.value > 0).map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-1.5">
                    {statusData.filter((s) => s.value > 0).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}>
                          </div>
                          <span className="text-xs text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No data</div>
              )}
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <Command className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search projects, clients... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-11 py-3 bg-slate-900/50 border border-slate-800/50 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { id: 'filterStatus', value: filterStatus, onChange: setFilterStatus, options: [
                ['all','All Status'],['planning','Planning'],['active','Active'],['on_hold','On Hold'],['completed','Completed'],
              ]},
              { id: 'filterPriority', value: filterPriority, onChange: setFilterPriority, options: [
                ['all','All Priority'],['critical','Critical'],['high','High'],['medium','Medium'],['low','Low'],
              ]},
              { id: 'sortBy', value: sortBy, onChange: (v: string) => setSortBy(v as typeof sortBy), options: [
                ['created','Latest'],['deadline','Deadline'],['budget','Budget'],['priority','Priority'],
              ]},
            ].map(({ id, value, onChange, options }) => (
              <div key={id}>
                <label htmlFor={id} className="sr-only">{id}</label>
                <select
                  id={id}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="px-3 py-3 bg-slate-900/50 border border-slate-800/50 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                >
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div className="flex border border-slate-800/50 rounded-lg overflow-hidden">
              <button title="Grid view" onClick={() => setView('grid')} className={`px-3 py-3 ${view === 'grid' ? 'bg-emerald-500 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-white'} transition-colors`}>
                <LayoutGrid size={16} />
              </button>
              <button title="List view" onClick={() => setView('list')} className={`px-3 py-3 ${view === 'list' ? 'bg-emerald-500 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-white'} transition-colors`}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Results count ── */}
        <p className="text-xs text-slate-600 mb-4">
          {filteredProjects.length} of {projects.length} projects
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        {/* ── Projects Grid/List ── */}
        {filteredProjects.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-12 text-center">
            <Target className="text-slate-700 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
            <p className="text-slate-500 text-sm mb-6">Try adjusting your filters</p>
            <button
              onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterPriority('all'); }}
              className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-sm transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className={view === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'space-y-3'
          }>
            {filteredProjects.map((project) => {
              const days = daysRemaining(project.deadline);
              const isOverdue = days < 0;
              const progress = project.progress ?? 0;
              const priorityColor = PRIORITY_COLORS[project.priority] ?? PRIORITY_COLORS.low;
              const statusColor = STATUS_COLORS[project.status] ?? STATUS_COLORS.planning;
              const clientName = getClientName(project);

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)] transition-all group cursor-pointer"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{clientName}</p>
                    </div>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold uppercase border ${priorityColor.bg} ${priorityColor.border} ${priorityColor.text}`}>
                      {project.priority}
                    </span>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-white font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget + Deadline */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-0.5">Budget</p>
                      <p className="text-sm font-semibold text-white">{formatBudget(project.budget ?? 0)}</p>
                      <p className="text-xs text-slate-500">{formatBudget(project.spent ?? 0)} used</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-0.5">Deadline</p>
                      <p className={`text-sm font-semibold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}
                      </p>
                      <p className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                        {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                      {project.status}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/projects/${project.id}`);
                        }}
                        title="View project"
                        className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <BarChart3 size={14} className="text-slate-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (project.profiles?.email) {
                            window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(project.profiles.email)}&su=${encodeURIComponent(`Re: ${project.name}`)}`, '_blank');
                          }
                        }}
                        title="Email client"
                        className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <MessageSquare size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── AI Copilot Panel ── */}
      {showAiPanel && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAiPanel(false); }}
        >
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                  <Brain className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI Project Copilot</h2>
                  <p className="text-xs text-slate-500">Powered by Claude · Secure via Edge Function</p>
                </div>
              </div>
              <button title="Close AI panel" onClick={() => setShowAiPanel(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="text-slate-400" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* Sidebar */}
              <div className="w-64 border-r border-slate-800 p-4 overflow-y-auto flex-shrink-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Actions</p>
                <div className="space-y-2 mb-6">
                  <button
                    onClick={handleDeepAnalysis}
                    disabled={isAnalyzing}
                    className="w-full text-left px-3 py-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all flex items-center gap-2.5 disabled:opacity-40"
                  >
                    <BarChart3 size={16} className="text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">Deep Analysis</p>
                      <p className="text-xs text-slate-500">Full portfolio report</p>
                    </div>
                  </button>
                  <button
                    onClick={generateAiInsights}
                    disabled={isAnalyzing || Date.now() - lastAiCall < AI_COOLDOWN_MS}
                    className="w-full text-left px-3 py-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all flex items-center gap-2.5 disabled:opacity-40"
                  >
                    <Zap size={16} className="text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">Refresh Insights</p>
                      <p className="text-xs text-slate-500">30s cooldown</p>
                    </div>
                  </button>
                </div>

                {aiInsights.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Current Insights</p>
                    <div className="space-y-2">
                      {aiInsights.map((insight, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-800/30 rounded-lg border border-slate-700/30">
                          <div className="flex items-start gap-1.5">
                            {insight.type === 'critical' && <XCircle      className="text-red-400    flex-shrink-0 mt-0.5" size={12} />}
                            {insight.type === 'warning'  && <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={12} />}
                            {insight.type === 'success'  && <CheckCircle2  className="text-green-400  flex-shrink-0 mt-0.5" size={12} />}
                            {insight.type === 'info'     && <Sparkles      className="text-blue-400   flex-shrink-0 mt-0.5" size={12} />}
                            <p className="text-xs text-slate-300 leading-relaxed">{insight.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Chat area */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Deep analysis result */}
                  {aiResponse && (
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                      <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Portfolio Analysis</p>
                      <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{aiResponse}</div>
                    </div>
                  )}

                  {/* Empty chat state */}
                  {aiConversation.length === 0 && !aiResponse && (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <Brain className="text-slate-700 mb-3" size={32} />
                      <p className="text-slate-500 text-sm">Ask anything about your projects</p>
                      <p className="text-slate-600 text-xs mt-1">e.g. "Which projects are at risk this month?"</p>
                    </div>
                  )}

                  {/* Conversation */}
                  {aiConversation.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800/60 border border-slate-700/40 text-slate-200'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isSendingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800/60 border border-slate-700/40 px-4 py-3 rounded-xl">
                        <div className="flex items-center gap-1.5">
                          {[0, 0.2, 0.4].map((delay, i) => (
                            <div key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ '--animation-delay': `${delay}s` } as React.CSSProperties} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <div className="p-4 border-t border-slate-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder="Ask about your projects..."
                      className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <button
                      title="Send message"
                      onClick={handleSendMessage}
                      disabled={!userMessage.trim() || isSendingMessage}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;