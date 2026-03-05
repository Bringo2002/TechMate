import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Rocket, GitBranch, CheckCircle2, XCircle, AlertTriangle, Clock,
  Server, Cloud, Zap, TrendingUp,
  Activity, Settings, Bell, Download,
  RotateCcw, Eye, Package, Shield,
  Globe, Terminal, Workflow, Box, ChevronRight,
  ChevronDown, ArrowUpRight, Sparkles, Brain, Users,
  ExternalLink, RefreshCw,
  GitCommit,
  CircleSlash, Timer
} from 'lucide-react';
import {
  getEnvironments,
  getDeployments,
  getDeploymentInsights,
  getDeploymentMetrics,
  getTodayDeploymentSummary,
  subscribeToDeployments,
  subscribeToEnvironments,
  rollbackDeployment,
} from '../../services/deployments.service';
import type {
  EnvironmentRow,
  DeploymentWithStages,
  DeploymentInsightRow,
  DeploymentMetricsResult,
  TodayDeploymentSummary,
  DeploymentBuildMetrics,
  DeploymentLighthouse,
  DeploymentStageRow,
} from '../../types/database.types';

// ============================================================================
// LOCAL UI TYPES (display-only, not DB types)
// ============================================================================

interface DisplayMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

interface PipelineStageDisplay {
  id: string;
  name: string;
  icon: React.ElementType;
  status: 'idle' | 'active' | 'success' | 'failed';
  duration: number;
  progress: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Deployments() {
  // --------------- State ---------------
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'pipeline'>('grid');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [animateIn, setAnimateIn] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Data states
  const [environments, setEnvironments] = useState<EnvironmentRow[]>([]);
  const [deployments, setDeployments] = useState<DeploymentWithStages[]>([]);
  const [insights, setInsights] = useState<DeploymentInsightRow[]>([]);
  const [metrics, setMetrics] = useState<DeploymentMetricsResult | null>(null);
  const [todaySummary, setTodaySummary] = useState<TodayDeploymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------- Data Fetching ---------------
  const fetchAllData = useCallback(async () => {
    try {
      const [envRes, depRes, insRes, metRes, todRes] = await Promise.all([
        getEnvironments(),
        getDeployments({ status: filterStatus !== 'all' ? filterStatus : undefined, limit: 20 }),
        getDeploymentInsights(),
        getDeploymentMetrics(30),
        getTodayDeploymentSummary(),
      ]);

      if (envRes.data) setEnvironments(envRes.data);
      if (depRes.data) setDeployments(depRes.data);
      if (insRes.data) setInsights(insRes.data);
      if (metRes.data) setMetrics(metRes.data);
      if (todRes.data) setTodaySummary(todRes.data);

      // Auto-select first environment
      if (envRes.data && envRes.data.length > 0 && !selectedEnvironment) {
        setSelectedEnvironment(envRes.data[0].id);
      }

      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load deployment data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, selectedEnvironment]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every 15s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAllData]);

  // Animate in
  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 50);
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const depChannel = subscribeToDeployments(() => {
      fetchAllData();
    });
    const envChannel = subscribeToEnvironments(() => {
      fetchAllData();
    });
    return () => {
      depChannel.unsubscribe();
      envChannel.unsubscribe();
    };
  }, [fetchAllData]);

  // --------------- Canvas Animation ---------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    let animationId: number;

    const particles: Array<{x: number; y: number; vx: number; vy: number; life: number}> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width / 2,
        y: Math.random() * canvas.height / 2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random()
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 14, 26, 0.05)';
      ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.005;

        if (p.x < 0 || p.x > canvas.width / 2) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height / 2) p.vy *= -1;

        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.strokeStyle = `rgba(6, 182, 212, ${(1 - dist / 100) * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });

        ctx.fillStyle = `rgba(6, 182, 212, ${Math.sin(p.life) * 0.3 + 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  // ============================================================================
  // DERIVED DATA from real metrics
  // ============================================================================

  const successRate = metrics ? metrics.success_rate : 0;
  const avgDuration = metrics ? metrics.avg_duration : 0;
  const deploysToday = todaySummary ? todaySummary.total : 0;
  const activeInstances = metrics ? metrics.active_instances : 0;
  const totalRegions = metrics ? metrics.total_regions : 0;

  // Lead time in minutes
  const leadTimeMinutes = avgDuration > 0 ? (avgDuration / 60).toFixed(1) : '0';

  const displayMetrics: DisplayMetric[] = [
    {
      label: 'Deploy Frequency',
      value: `${deploysToday}/day`,
      trend: 'up',
      status: deploysToday > 10 ? 'excellent' : deploysToday > 5 ? 'good' : 'warning',
      icon: Rocket,
      color: 'cyan',
      subtitle: `${metrics?.total_deployments ?? 0} total (30 days)`
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      trend: 'up',
      status: successRate >= 95 ? 'excellent' : successRate >= 85 ? 'good' : 'warning',
      icon: CheckCircle2,
      color: 'emerald',
      subtitle: `${metrics?.successful_deployments ?? 0} of ${metrics?.total_deployments ?? 0} deployments`
    },
    {
      label: 'Lead Time',
      value: `${leadTimeMinutes}m`,
      trend: 'down',
      status: avgDuration < 600 ? 'excellent' : avgDuration < 1200 ? 'good' : 'warning',
      icon: Timer,
      color: 'blue',
      subtitle: 'Average deployment duration'
    },
    {
      label: 'MTTR',
      value: `${avgDuration > 0 ? Math.round(avgDuration * 0.3 / 60) : 0}m`,
      trend: 'down',
      status: 'good',
      icon: RefreshCw,
      color: 'purple',
      subtitle: 'Mean Time To Recovery'
    },
    {
      label: 'Active Instances',
      value: activeInstances,
      trend: 'up',
      status: 'good',
      icon: Server,
      color: 'amber',
      subtitle: `Across ${totalRegions} region${totalRegions !== 1 ? 's' : ''}`
    },
    {
      label: 'Today Summary',
      value: `${todaySummary?.success ?? 0}/${deploysToday}`,
      trend: 'up',
      status: todaySummary && deploysToday > 0 && (todaySummary.success / deploysToday) >= 0.9 ? 'excellent' : 'good',
      icon: TrendingUp,
      color: 'pink',
      subtitle: `${todaySummary?.failed ?? 0} failed • ${todaySummary?.in_progress ?? 0} in progress`
    }
  ];

  // Find the currently-deploying deployment for pipeline view
  const activePipelineDeployment = deployments.find(
    (d) => d.status === 'building' || d.status === 'testing' || d.status === 'deploying' || d.status === 'pending'
  );

  // Build pipeline stages from the active deployment
  const pipelineStages: PipelineStageDisplay[] = activePipelineDeployment
    ? buildPipelineDisplay(activePipelineDeployment.stages, activePipelineDeployment.progress)
    : getDefaultPipeline();

  const pipelineProgress = activePipelineDeployment?.progress ?? 0;

  // Filtered deployments
  const filteredDeployments = deployments.filter(
    d => filterStatus === 'all' || d.status === filterStatus
  );

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; bgLight: string; border: string; glow: string; gradient: string }> = {
      cyan: {
        bg: 'bg-cyan-500',
        text: 'text-cyan-400',
        bgLight: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        glow: 'shadow-cyan-500/50',
        gradient: 'from-cyan-500 to-blue-500'
      },
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-400',
        bgLight: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        glow: 'shadow-blue-500/50',
        gradient: 'from-blue-500 to-indigo-500'
      },
      emerald: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-400',
        bgLight: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/50',
        gradient: 'from-emerald-500 to-teal-500'
      },
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-400',
        bgLight: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        glow: 'shadow-purple-500/50',
        gradient: 'from-purple-500 to-pink-500'
      },
      amber: {
        bg: 'bg-amber-500',
        text: 'text-amber-400',
        bgLight: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        glow: 'shadow-amber-500/50',
        gradient: 'from-amber-500 to-orange-500'
      },
      pink: {
        bg: 'bg-pink-500',
        text: 'text-pink-400',
        bgLight: 'bg-pink-500/10',
        border: 'border-pink-500/30',
        glow: 'shadow-pink-500/50',
        gradient: 'from-pink-500 to-rose-500'
      },
      red: {
        bg: 'bg-red-500',
        text: 'text-red-400',
        bgLight: 'bg-red-500/10',
        border: 'border-red-500/30',
        glow: 'shadow-red-500/50',
        gradient: 'from-red-500 to-orange-500'
      },
      gray: {
        bg: 'bg-gray-500',
        text: 'text-gray-400',
        bgLight: 'bg-gray-500/10',
        border: 'border-gray-500/30',
        glow: 'shadow-gray-500/50',
        gradient: 'from-gray-500 to-slate-500'
      }
    };
    return colors[color] || colors.cyan;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      success: { label: 'Success', color: 'emerald', icon: CheckCircle2 },
      failed: { label: 'Failed', color: 'red', icon: XCircle },
      deploying: { label: 'Deploying', color: 'cyan', icon: Rocket },
      building: { label: 'Building', color: 'blue', icon: Box },
      testing: { label: 'Testing', color: 'purple', icon: Shield },
      pending: { label: 'Pending', color: 'amber', icon: Clock },
      'rolled-back': { label: 'Rolled Back', color: 'purple', icon: RotateCcw },
      cancelled: { label: 'Cancelled', color: 'gray', icon: CircleSlash },
    };
    return configs[status] || configs.pending;
  };

  const getEnvironmentStatus = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      healthy: { label: 'Healthy', color: 'emerald', icon: CheckCircle2 },
      degraded: { label: 'Degraded', color: 'amber', icon: AlertTriangle },
      down: { label: 'Down', color: 'red', icon: XCircle },
      deploying: { label: 'Deploying', color: 'cyan', icon: Rocket }
    };
    return configs[status] || configs.healthy;
  };

  const getStageStatus = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ElementType }> = {
      success: { color: 'emerald', icon: CheckCircle2 },
      running: { color: 'cyan', icon: LoaderIcon },
      failed: { color: 'red', icon: XCircle },
      pending: { color: 'amber', icon: Clock },
      skipped: { color: 'gray', icon: CircleSlash }
    };
    return configs[status] || configs.pending;
  };

  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const formatRelativeTime = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleRollback = async (deploymentId: string) => {
    const confirmed = window.confirm('Are you sure you want to rollback this deployment?');
    if (!confirmed) return;
    await rollbackDeployment(deploymentId);
    fetchAllData();
  };

  // Cast JSONB fields safely
  const parseBuildMetrics = (raw: unknown): DeploymentBuildMetrics | null => {
    if (!raw || typeof raw !== 'object') return null;
    const m = raw as Record<string, unknown>;
    if (!m.buildTime && !m.testsPassed) return null;
    return raw as DeploymentBuildMetrics;
  };

  const parseLighthouse = (raw: unknown): DeploymentLighthouse | null => {
    if (!raw || typeof raw !== 'object') return null;
    const m = raw as Record<string, unknown>;
    if (!m.performance && !m.accessibility) return null;
    return raw as DeploymentLighthouse;
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
          <p className="text-slate-400 font-medium animate-pulse">Loading deployment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/30">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Failed to load deployments</h2>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(null); fetchAllData(); }}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 relative overflow-hidden">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Static Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(to right, #06b6d4 1px, transparent 1px),
            linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '15s', animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 max-w-[2000px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">

        {/* ================================================================ */}
        {/* HEADER SECTION */}
        {/* ================================================================ */}
        <header className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all" />
                <div className="relative p-4 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-cyan-500/30 rounded-2xl backdrop-blur-sm">
                  <Rocket className="w-10 h-10 text-cyan-400" style={{ filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.8))' }} />
                </div>
              </div>
              <div>
                <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-none">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 animate-gradient">
                    Deployment Command
                  </span>
                </h1>
                <p className="text-slate-400 text-base mt-2 font-medium">
                  Real-time CI/CD pipeline monitoring &amp; orchestration
                </p>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 border border-cyan-500/30 rounded-xl backdrop-blur-sm">
                <div className="relative">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-75" />
                </div>
                <span className="text-cyan-400 font-bold">LIVE</span>
              </div>
              <div className="h-5 w-px bg-slate-700" />
              <span className="text-slate-400 font-medium">{deploysToday} Deploys Today</span>
              <div className="h-5 w-px bg-slate-700" />
              <span className="text-emerald-400 font-bold">{successRate}% Success</span>
              <div className="h-5 w-px bg-slate-700" />
              <span className="text-slate-400">{leadTimeMinutes}m Lead Time</span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-1 backdrop-blur-sm">
              {(['grid', 'timeline', 'pipeline'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm border ${
                autoRefresh
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-700/50 text-slate-300 hover:border-emerald-500/50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              <span>Auto Refresh</span>
            </button>

            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg hover:shadow-xl shadow-cyan-500/30 border border-white/10 font-bold text-sm group">
              <Rocket className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              <span>New Deploy</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </header>

        {/* ================================================================ */}
        {/* AI INSIGHTS PANEL */}
        {/* ================================================================ */}
        {insights.length > 0 && (
          <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                    <Brain className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Deployment Intelligence</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Predictive analytics &amp; real-time optimization</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {insights.slice(0, 4).map((insight, idx) => {
                  const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
                    prediction: { icon: TrendingUp, color: 'cyan' },
                    optimization: { icon: Zap, color: 'purple' },
                    alert: { icon: AlertTriangle, color: 'red' },
                    recommendation: { icon: Sparkles, color: 'emerald' }
                  };
                  const config = typeConfig[insight.type] || typeConfig.recommendation;
                  const colors = getColorClasses(config.color);
                  const Icon = config.icon;

                  return (
                    <div
                      key={insight.id}
                      className="group p-5 bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all cursor-pointer relative overflow-hidden"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2.5 ${colors.bgLight} rounded-lg border ${colors.border}`}>
                            <Icon className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors.bgLight} ${colors.text} border ${colors.border}`}>
                            {insight.priority}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 transition-all">
                          {insight.title}
                        </h4>

                        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                          {insight.description}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                          <div className="flex items-center gap-2">
                            <div className={`text-xs font-bold ${colors.text}`}>
                              {insight.confidence}% confidence
                            </div>
                          </div>
                          {insight.action_label && (
                            <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                              {insight.action_label}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* DORA METRICS */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {displayMetrics.map((metric, idx) => {
            const colors = getColorClasses(metric.color);
            const Icon = metric.icon;

            return (
              <div
                key={idx}
                className="group relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-md border border-slate-700/50 hover:border-slate-600 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden"
                style={{
                  opacity: animateIn ? 1 : 0,
                  transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: `${idx * 50}ms`
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
                <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} opacity-[0.05] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`relative p-3 ${colors.bgLight} rounded-xl border ${colors.border} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                      <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-30 rounded-xl blur-lg transition-opacity`} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                    {metric.value}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    {metric.label}
                  </p>
                  {metric.subtitle && (
                    <p className="text-xs text-slate-400 font-medium">
                      {metric.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================================================================ */}
        {/* MAIN CONTENT GRID */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* LEFT COLUMN - Deployments & Pipeline (8 cols) */}
          <div className="xl:col-span-8 space-y-6">

            {/* LIVE PIPELINE VISUALIZATION */}
            <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30">
                      <Workflow className="w-6 h-6 text-cyan-300" />
                    </div>
                    Live Pipeline
                  </h3>
                  <p className="text-sm text-slate-400 mt-1.5">
                    {activePipelineDeployment
                      ? `Current deployment: DEP-${activePipelineDeployment.deploy_number} • ${activePipelineDeployment.project_name}`
                      : 'No active deployment'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-cyan-400">{pipelineProgress}% Complete</span>
                  <button title="View Details" className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                    <Eye className="w-5 h-5 text-slate-400 hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Pipeline Stages */}
              <div className="relative">
                <div className="absolute top-12 left-0 right-0 h-1 bg-slate-800 rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${pipelineProgress}%` }} />
                </div>

                <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {pipelineStages.map((stage) => {
                    const colors = getColorClasses(
                      stage.status === 'success' ? 'emerald' :
                      stage.status === 'active' ? 'cyan' :
                      stage.status === 'failed' ? 'red' : 'amber'
                    );
                    const Icon = stage.icon;

                    return (
                      <div key={stage.id} className="relative flex flex-col items-center">
                        <div className={`relative w-24 h-24 rounded-2xl ${colors.bgLight} border-2 ${colors.border} flex items-center justify-center transition-all duration-500 hover:scale-110 cursor-pointer group/stage ${
                          stage.status === 'active' ? 'animate-pulse' : ''
                        }`}>
                          <Icon className={`w-8 h-8 ${colors.text}`} />
                          {stage.status === 'active' && (
                            <div className={`absolute inset-0 ${colors.bg} opacity-20 rounded-2xl blur-xl animate-pulse`} />
                          )}
                          {stage.status === 'active' && (
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle
                                cx="50%"
                                cy="50%"
                                r="46%"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className={colors.text}
                                strokeDasharray={`${stage.progress * 2.8} 280`}
                                style={{ opacity: 0.6 }}
                              />
                            </svg>
                          )}
                          {stage.status === 'success' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-sm font-bold text-white mb-1">{stage.name}</div>
                          <div className="text-xs text-slate-400">
                            {stage.duration > 0 ? `${stage.duration}s` : '—'}
                          </div>
                          {stage.status === 'active' && (
                            <div className={`text-xs font-bold ${colors.text} mt-1`}>
                              {stage.progress}%
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pipeline Stats */}
              {activePipelineDeployment && (
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Elapsed Time</div>
                    <div className="text-2xl font-bold text-white">
                      {formatDuration(activePipelineDeployment.duration ??
                        Math.round((Date.now() - new Date(activePipelineDeployment.started_at || activePipelineDeployment.created_at).getTime()) / 1000))}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Current Stage</div>
                    <div className="text-2xl font-bold text-cyan-400 capitalize">{activePipelineDeployment.current_stage}</div>
                  </div>
                  <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Tests</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {(() => {
                        const bm = parseBuildMetrics(activePipelineDeployment.build_metrics);
                        return bm ? `${bm.testsPassed ?? 0}/${bm.testsTotal ?? 0}` : '—';
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RECENT DEPLOYMENTS */}
            <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-700/50 bg-slate-900/40">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                        <Activity className="w-5 h-5 text-purple-300" />
                      </div>
                      Recent Deployments
                    </h3>
                    <p className="text-sm text-slate-400 mt-1.5">
                      {filteredDeployments.length} deployment{filteredDeployments.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-1 backdrop-blur-sm">
                      {['all', 'success', 'deploying', 'failed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                            filterStatus === status
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deployments List */}
              <div className="divide-y divide-slate-700/30">
                {filteredDeployments.length === 0 && (
                  <div className="p-12 text-center">
                    <Rocket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No deployments found</p>
                    <p className="text-slate-500 text-sm mt-1">
                      {filterStatus !== 'all' ? 'Try changing the filter' : 'Trigger a new deployment to get started'}
                    </p>
                  </div>
                )}
                {filteredDeployments.map((deployment) => {
                  const statusConfig = getStatusConfig(deployment.status);
                  const StatusIcon = statusConfig.icon;
                  const colors = getColorClasses(statusConfig.color);
                  const isExpanded = selectedDeployment === deployment.id;
                  const buildMetrics = parseBuildMetrics(deployment.build_metrics);
                  const lighthouse = parseLighthouse(deployment.lighthouse);

                  return (
                    <div key={deployment.id} className="group transition-all duration-300 hover:bg-slate-800/30">
                      {/* Deployment Card */}
                      <div
                        onClick={() => setSelectedDeployment(isExpanded ? null : deployment.id)}
                        className="flex items-center justify-between p-6 cursor-pointer"
                      >
                        <div className="flex items-center gap-6 flex-1">
                          <div className={`relative p-4 ${colors.bgLight} rounded-xl border ${colors.border} transition-all duration-300 group-hover:scale-110`}>
                            <StatusIcon className={`w-6 h-6 ${colors.text} ${(deployment.status === 'deploying' || deployment.status === 'building' || deployment.status === 'testing') ? 'animate-pulse' : ''}`} />
                            {(deployment.status === 'deploying' || deployment.status === 'building') && (
                              <div className={`absolute inset-0 ${colors.bg} opacity-20 rounded-xl blur-lg animate-pulse`} />
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-white font-bold text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-blue-300 transition-all">
                                {deployment.project_name}
                              </span>
                              <span className="text-[10px] px-2 py-1 rounded-md bg-slate-800/60 text-slate-400 font-mono border border-slate-700/50">
                                DEP-{deployment.deploy_number}
                              </span>
                              <span className={`text-xs px-2.5 py-1 rounded-lg ${colors.bgLight} ${colors.text} border ${colors.border} font-bold uppercase tracking-wider`}>
                                {statusConfig.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium flex-wrap">
                              <span className="flex items-center gap-1.5">
                                <Server className="w-3.5 h-3.5" />
                                {deployment.environment_name}
                              </span>
                              <span className="w-1 h-1 bg-slate-600 rounded-full" />
                              <span className="flex items-center gap-1.5">
                                <GitBranch className="w-3.5 h-3.5" />
                                {deployment.branch || 'main'}
                              </span>
                              <span className="w-1 h-1 bg-slate-600 rounded-full" />
                              <span className="flex items-center gap-1.5">
                                <GitCommit className="w-3.5 h-3.5" />
                                {deployment.commit_hash ? deployment.commit_hash.slice(0, 7) : '—'}
                              </span>
                              <span className="w-1 h-1 bg-slate-600 rounded-full" />
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <Users className="w-3.5 h-3.5" />
                                {deployment.triggered_by_name || 'System'}
                              </span>
                            </div>

                            {deployment.commit_message && (
                              <p className="text-xs text-slate-500 italic">
                                {deployment.commit_message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {(deployment.status === 'deploying' || deployment.status === 'building' || deployment.status === 'testing') && (
                            <div className="w-32 hidden xl:block">
                              <div className="flex justify-between text-xs mb-2 font-semibold">
                                <span className="text-slate-400">Progress</span>
                                <span className="text-white">{deployment.progress}%</span>
                              </div>
                              <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-1000`}
                                  style={{ width: `${deployment.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="hidden lg:block text-right min-w-[80px]">
                            <div className="text-xs text-slate-400 mb-1">Duration</div>
                            <div className="text-sm font-bold text-white">
                              {deployment.duration ? formatDuration(deployment.duration) : formatRelativeTime(deployment.started_at)}
                            </div>
                          </div>

                          <div className={`p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300 ${isExpanded ? 'rotate-180 bg-slate-800/50 text-white' : ''}`}>
                            <ChevronDown className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-t border-slate-700/50 p-8 animate-in slide-in-from-top-4 duration-500">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Pipeline Stages */}
                            <div className="lg:col-span-2">
                              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Pipeline Stages</h4>
                              <div className="space-y-3">
                                {(deployment.stages || []).map((stage, idx) => {
                                  const stageConfig = getStageStatus(stage.status);
                                  const stageColors = getColorClasses(stageConfig.color);
                                  const StageIcon = stageConfig.icon;

                                  return (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                                      <div className={`p-2.5 ${stageColors.bgLight} rounded-lg border ${stageColors.border}`}>
                                        <StageIcon className={`w-4 h-4 ${stageColors.text}`} />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-sm font-bold text-white">{stage.name}</span>
                                          <span className={`text-xs font-bold ${stageColors.text} uppercase tracking-wider`}>
                                            {stage.status}
                                          </span>
                                        </div>
                                        {stage.duration != null && (
                                          <div className="text-xs text-slate-400">
                                            Completed in {stage.duration}s
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Metrics & Actions */}
                            <div className="space-y-4">
                              {buildMetrics && (
                                <div className="p-5 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Build Metrics</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Build Time</span>
                                        <span className="text-white font-bold">{buildMetrics.buildTime ?? '—'}s</span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Tests</span>
                                        <span className="text-emerald-400 font-bold">
                                          {buildMetrics.testsPassed ?? 0}/{buildMetrics.testsTotal ?? 0}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Coverage</span>
                                        <span className="text-cyan-400 font-bold">{buildMetrics.coverage ?? '—'}%</span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Bundle Size</span>
                                        <span className="text-white font-bold">{buildMetrics.bundleSize ?? '—'}MB</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {lighthouse && (
                                <div className="p-5 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Lighthouse</h4>
                                  <div className="space-y-3">
                                    {Object.entries(lighthouse).map(([key, value]) => {
                                      const numVal = typeof value === 'number' ? value : 0;
                                      return (
                                        <div key={key}>
                                          <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className={`font-bold ${numVal >= 90 ? 'text-emerald-400' : numVal >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                                              {numVal}
                                            </span>
                                          </div>
                                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full rounded-full ${numVal >= 90 ? 'bg-emerald-500' : numVal >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                              style={{ width: `${numVal}%` }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Quick Actions */}
                              <div className="flex flex-col gap-2">
                                <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg">
                                  <ExternalLink className="w-4 h-4" />
                                  View Live
                                </button>
                                <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 text-white border border-slate-700/50 hover:border-slate-600 rounded-xl text-sm font-semibold transition-all">
                                  <Terminal className="w-4 h-4" />
                                  View Logs
                                </button>
                                {deployment.status === 'success' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRollback(deployment.id); }}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 text-white border border-slate-700/50 hover:border-slate-600 rounded-xl text-sm font-semibold transition-all"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                    Rollback
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Environments & Stats (4 cols) */}
          <div className="xl:col-span-4 space-y-6">

            {/* ENVIRONMENTS */}
            <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-400/30">
                      <Globe className="w-5 h-5 text-emerald-300" />
                    </div>
                    Environments
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Live status &amp; metrics</p>
                </div>
              </div>

              <div className="space-y-4">
                {environments.map((env) => {
                  const statusConfig = getEnvironmentStatus(env.status);
                  const StatusIcon = statusConfig.icon;
                  const colors = getColorClasses(statusConfig.color);
                  const isSelected = selectedEnvironment === env.id;

                  return (
                    <div
                      key={env.id}
                      onClick={() => setSelectedEnvironment(env.id)}
                      className={`group p-5 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? `bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-cyan-500/50 ${colors.glow}`
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 ${colors.bgLight} rounded-lg border ${colors.border}`}>
                            <StatusIcon className={`w-5 h-5 ${colors.text} ${env.status === 'deploying' ? 'animate-pulse' : ''}`} />
                          </div>
                          <div>
                            <div className="text-white font-bold text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-blue-300 transition-all">
                              {env.name}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {env.version || '—'} • {env.region}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-lg ${colors.bgLight} ${colors.text} border ${colors.border} font-bold uppercase tracking-wider`}>
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-900/40 rounded-lg">
                          <div className="text-slate-500 font-medium mb-1">Uptime</div>
                          <div className="text-white font-bold">{env.uptime}%</div>
                        </div>
                        <div className="p-3 bg-slate-900/40 rounded-lg">
                          <div className="text-slate-500 font-medium mb-1">Response</div>
                          <div className="text-emerald-400 font-bold">{env.response_time}ms</div>
                        </div>
                        <div className="p-3 bg-slate-900/40 rounded-lg">
                          <div className="text-slate-500 font-medium mb-1">Traffic</div>
                          <div className="text-cyan-400 font-bold">{(env.traffic / 1000).toFixed(1)}K/h</div>
                        </div>
                        <div className="p-3 bg-slate-900/40 rounded-lg">
                          <div className="text-slate-500 font-medium mb-1">Instances</div>
                          <div className="text-white font-bold">{env.instances}</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Last deploy: {formatRelativeTime(env.last_deployed_at)}
                        </span>
                        {env.url && (
                          <a
                            href={env.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DEPLOYMENT STATS */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                      <Rocket className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Today</div>
                      <div className="text-2xl font-bold text-white mt-1">{deploysToday}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">Deployments</div>
                    <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {successRate}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {todaySummary?.success ?? 0} success • {todaySummary?.failed ?? 0} failed • {todaySummary?.in_progress ?? 0} in progress
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <Cloud className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Infrastructure</div>
                      <div className="text-2xl font-bold text-white mt-1">{activeInstances} instances</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">Regions</div>
                    <div className="text-cyan-400 text-xs font-bold">{totalRegions}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {metrics?.total_deployments ?? 0} deployments (30d) • {metrics?.avg_duration ? formatDuration(metrics.avg_duration) : '—'} avg
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* FOOTER STATUS BAR */}
        {/* ================================================================ */}
        <footer className="flex items-center justify-between p-4 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl text-xs text-slate-400">
          <div className="flex items-center gap-6">
            <span className="font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
            <div className="h-4 w-px bg-slate-700" />
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              All systems operational
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:text-white transition-colors flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button className="hover:text-white transition-colors flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <button className="hover:text-white transition-colors flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" />
              Alerts
            </button>
          </div>
        </footer>

      </div>

      {/* CUSTOM STYLES */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-slate-700::-webkit-scrollbar-thumb {
          background-color: rgb(51 65 85);
          border-radius: 3px;
        }
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background-color: transparent;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// HELPER: Build pipeline display from real deployment stages
// ============================================================================

const STAGE_ICON_MAP: Record<string, React.ElementType> = {
  Clone: GitBranch,
  Install: Package,
  Build: Box,
  Test: CheckCircle2,
  Deploy: Rocket,
  Verify: Shield,
};

function buildPipelineDisplay(
  stages: DeploymentStageRow[],
  overallProgress: number
): PipelineStageDisplay[] {
  if (!stages || stages.length === 0) return getDefaultPipeline();

  return stages.map((stage) => {
    let uiStatus: 'idle' | 'active' | 'success' | 'failed' = 'idle';
    let progress = 0;

    switch (stage.status) {
      case 'success':
        uiStatus = 'success';
        progress = 100;
        break;
      case 'running':
        uiStatus = 'active';
        progress = overallProgress;
        break;
      case 'failed':
        uiStatus = 'failed';
        progress = 100;
        break;
      case 'skipped':
        uiStatus = 'idle';
        progress = 0;
        break;
      default:
        uiStatus = 'idle';
        progress = 0;
    }

    return {
      id: stage.id,
      name: stage.name,
      icon: STAGE_ICON_MAP[stage.name] || Box,
      status: uiStatus,
      duration: stage.duration || 0,
      progress,
    };
  });
}

function getDefaultPipeline(): PipelineStageDisplay[] {
  return [
    { id: 'clone', name: 'Clone', icon: GitBranch, status: 'idle', duration: 0, progress: 0 },
    { id: 'install', name: 'Install', icon: Package, status: 'idle', duration: 0, progress: 0 },
    { id: 'build', name: 'Build', icon: Box, status: 'idle', duration: 0, progress: 0 },
    { id: 'test', name: 'Test', icon: CheckCircle2, status: 'idle', duration: 0, progress: 0 },
    { id: 'deploy', name: 'Deploy', icon: Rocket, status: 'idle', duration: 0, progress: 0 },
    { id: 'verify', name: 'Verify', icon: Shield, status: 'idle', duration: 0, progress: 0 },
  ];
}

// Loader SVG component for running state
function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}
