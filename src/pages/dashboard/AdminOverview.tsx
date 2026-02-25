import { useState, useEffect } from 'react';
import {
  TrendingUp, ArrowUp, ArrowDown, DollarSign, Users,
  Rocket, Activity, ChevronRight, CircleDot, Flame, Loader2,
  Clock, AlertTriangle, AlertCircle, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAdmin from '../../hooks/useAdmin';
import { useAuth } from '../../hooks/useAuth';

// Utility: format currency
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const AdminOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live backend hook
  const {
    metrics,
    userGrowth,
    revenueByMonth,
    recentProjects,
    recentActivity,
    revenueStats,
    loading
  } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin relative z-10" />
          </div>
          <p className="text-emerald-400/80 font-medium animate-pulse">Loading Intelligence...</p>
        </div>
      </div>
    );
  }

  // All metrics from live backend
  const currentMonthRevenue = revenueStats?.monthlyRevenue ?? 0;
  const lastMonthRevenue = revenueByMonth && revenueByMonth.length > 1
    ? revenueByMonth[revenueByMonth.length - 2].revenue
    : 0;
  const revenueGrowth = lastMonthRevenue > 0
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  const vitals = [
    {
      label: 'Revenue Velocity',
      value: fmt(currentMonthRevenue),
      subValue: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% MoM`,
      trend: revenueGrowth >= 0 ? 'up' : 'down',
      trendValue: fmt(currentMonthRevenue - lastMonthRevenue),
      target: '$50K',
      targetProgress: Math.min((currentMonthRevenue / 50000) * 100, 100),
      health: revenueGrowth >= 0 ? 'excellent' : 'good',
      icon: Flame,
      color: 'emerald',
      sparkline: revenueByMonth ? revenueByMonth.map(r => r.revenue) : [],
    },
    {
      label: 'Active Projects',
      value: metrics?.active_projects?.toString() || '0',
      subValue: 'Currently running',
      trend: 'stable',
      trendValue: '',
      target: '20',
      targetProgress: metrics ? (metrics.active_projects / 20) * 100 : 0,
      health: 'good',
      icon: Rocket,
      color: 'blue',
      sparkline: [],
    },
    {
      label: 'Client Health',
      value: metrics && typeof metrics.active_users === 'number' && typeof metrics.total_users === 'number'
        ? `${metrics.active_users} / ${metrics.total_users}`
        : '0 / 0',
      subValue: `${metrics?.new_users_this_month || 0} new`,
      trend: 'up',
      trendValue: '',
      target: '100',
      targetProgress: metrics ? (metrics.active_users / 100) * 100 : 0,
      health: 'excellent',
      icon: Users,
      color: 'purple',
      sparkline: userGrowth ? userGrowth.map(g => g.count) : [],
    },
    {
      label: 'Pipeline Value',
      value: fmt(revenueStats?.pendingRevenue ?? 0),
      subValue: `${metrics?.open_requests || 0} requests`,
      trend: 'up',
      trendValue: '',
      target: '$100K',
      targetProgress: Math.min((revenueStats?.pendingRevenue ?? 0) / 100000 * 100, 100),
      health: 'excellent',
      icon: TrendingUp,
      color: 'amber',
      sparkline: [],
    }
  ];

  const financials = [
    {
      label: 'Monthly Revenue',
      current: fmt(revenueStats?.monthlyRevenue ?? 0),
      projected: 'N/A',
      change: `${revenueGrowth.toFixed(1)}%`,
      trend: revenueGrowth >= 0 ? 'up' : 'down',
      health: 'excellent',
      breakdown: { mrr: fmt(revenueStats?.monthlyRevenue ?? 0), oneTime: '$0' },
      chartData: revenueByMonth ? revenueByMonth.map(r => r.revenue) : [],
      icon: DollarSign,
      color: 'emerald'
    },
    {
      label: 'Cash Flow',
      current: fmt(revenueStats?.paidRevenue ?? 0),
      projected: 'N/A',
      change: fmt(revenueStats?.pendingRevenue ?? 0) + ' pending',
      trend: 'up',
      health: 'excellent',
      breakdown: { incoming: fmt(revenueStats?.pendingRevenue ?? 0), collected: fmt(revenueStats?.paidRevenue ?? 0) },
      chartData: [],
      icon: TrendingUp,
      color: 'blue'
    }
  ];

  // Real database projects only!
  const projects = (recentProjects ?? []).map(p => ({
    id: p.id, // <-- MAKE SURE THIS EXISTS IN YOUR DATA
    client_id: p.user_id, // <-- for contact/profile route
    client_email: p.profiles?.email || null, // <-- provide if emailing
    name: p.name,
    client: p.client || 'Unknown Client',
    status: p.status,
    statusType: p.status === 'active' ? 'active' : p.status === 'completed' ? 'success' : p.status === 'cancelled' ? 'danger' : 'warning',
    progress: p.progress || 0,
    velocity: 0,
    health: p.health_score > 90 ? 'excellent' : p.health_score > 70 ? 'on-track' : 'at-risk',
    aiScore: p.health_score || 0,
    dueDate: p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A',
    daysLeft: p.deadline ? Math.ceil((new Date(p.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0,
    priority: p.priority || 'medium',
    team: [],
    revenue: fmt(p.budget || 0),
    budget: fmt(p.budget || 0),
    spent: fmt(p.spent || 0),
    burnRate: 'on-track',
    profitability: 0,
    blockers: p.blockers || null,
    risks: p.risks || [],
    opportunities: p.opportunities || [],
    lastUpdate: p.updated_at ? new Date(p.updated_at).toLocaleTimeString() : '',
    techStack: p.technologies || [],
    metrics: p.metrics || { commits: 0, prs: 0, bugs: 0, tests: 0 },
    nextMilestone: p.nextMilestone || 'N/A',
    predictedCompletion: p.predictedCompletion || 'N/A'
  }));

  const activities = recentActivity && recentActivity.length > 0 ? recentActivity.map(a => ({
    type: 'activity',
    icon: Activity,
    message: `${a.profiles?.full_name || 'User'} ${a.action} ${a.entity_type}`,
    detail: JSON.stringify(a.changes).slice(0, 50) + '...',
    user: a.profiles?.full_name || 'Unknown',
    project: 'System',
    time: a.created_at ? new Date(a.created_at).toLocaleTimeString() : '',
    status: 'info',
    metric: 'Log'
  })) : [
    {
      type: 'deployment',
      icon: Rocket,
      message: 'No recent activity',
      detail: 'System is quiet.',
      user: 'System',
      project: '-',
      time: 'Just now',
      status: 'info',
      metric: '-'
    }
  ];

  const HealthScore = ({ score }: { score: number }) => {
    const getColor = (s: number) => {
      if (s >= 90) return { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'Excellent' };
      if (s >= 75) return { bg: 'bg-blue-500', text: 'text-blue-400', label: 'Good' };
      if (s >= 60) return { bg: 'bg-amber-500', text: 'text-amber-400', label: 'Fair' };
      return { bg: 'bg-red-500', text: 'text-red-400', label: 'Poor' };
    };
    const config = getColor(score);
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-12">
          <svg className="transform -rotate-90 w-12 h-12">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-800" />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className={config.text}
              strokeDasharray={`${score * 1.257} 125.7`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{score}</span>
        </div>
        <div>
          <div className={`text-xs font-semibold ${config.text}`}>{config.label}</div>
          <div className="text-[10px] text-gray-500">Health Score</div>
        </div>
      </div>
    );
  };

  const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
    if (!data || data.length === 0)
      return <div className="h-8 flex items-center justify-center text-xs text-gray-600">No data</div>;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    return (
      <div className="flex items-end gap-[2px] h-8">
        {data.map((value, i) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={i}
              className={`flex-1 bg-${color}-500 rounded-t opacity-60 hover:opacity-100 transition-all`}
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-purple-900/20 border border-emerald-500/20 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent">
                Welcome back, {user?.email?.split('@')[0] || 'Admin'}
              </h1>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
                  <CircleDot className="w-3 h-3 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-lg mb-2">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Business Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vitals.map((vital, idx) => {
          const Icon = vital.icon;
          return (
            <div
              key={idx}
              className="group relative bg-gradient-to-br from-gray-900/90 to-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all overflow-hidden cursor-pointer"
              onClick={() => setSelectedMetric(selectedMetric === idx ? null : idx)}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${vital.color}-500/5 rounded-full blur-3xl group-hover:bg-${vital.color}-500/10 transition-all`}></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-${vital.color}-500/10 rounded-xl`}>
                    <Icon className={`w-6 h-6 text-${vital.color}-400`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      vital.health === 'excellent' ? 'bg-emerald-500/10 text-emerald-400' :
                        vital.health === 'good' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                    }`}>
                      {vital.health}
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">{vital.label}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-white">{vital.value}</span>
                  <span className={`text-sm font-semibold flex items-center gap-1 ${
                    vital.trend === 'up' ? 'text-emerald-400' :
                      vital.trend === 'down' ? 'text-red-400' :
                        'text-gray-400'
                  }`}>
                    {vital.trend === 'up' && <ArrowUp className="w-3 h-3" />}
                    {vital.trend === 'down' && <ArrowDown className="w-3 h-3" />}
                    {vital.subValue}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Target: {vital.target}</span>
                    <span className="text-emerald-400 font-semibold">{vital.targetProgress.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${vital.color}-500 to-${vital.color}-400 transition-all duration-500`}
                      style={{ width: `${Math.min(vital.targetProgress, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <MiniSparkline data={vital.sparkline} color={vital.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Financials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {financials.map((fin, idx) => {
          const Icon = fin.icon;
          return (
            <div
              key={idx}
              className={`relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-${fin.color}-500/30 transition-all group`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${fin.color}-500/5 rounded-full blur-3xl group-hover:bg-${fin.color}-500/10 transition-all`}></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-${fin.color}-500/10 rounded-xl`}>
                    <Icon className={`w-5 h-5 text-${fin.color}-400`} />
                  </div>
                  {fin.trend === 'up' && (
                    <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                      <ArrowUp className="w-4 h-4" />
                      {fin.change}
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">{fin.label}</h3>
                <p className="text-3xl font-bold text-white mb-1">{fin.current}</p>
                <p className="text-xs text-gray-400 mb-4">{
                  Object.entries(fin.breakdown).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(' | ')
                }</p>
                <div className="mb-4">
                  <MiniSparkline data={fin.chartData} color={fin.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          {/* Project UI: maps real, live projects */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Rocket className="w-6 h-6 text-emerald-400" />
                Project Intelligence
              </h3>
              <p className="text-sm text-gray-400 mt-1">AI-powered project monitoring & predictions</p>
            </div>
            <button
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
              onClick={() => navigate('/dashboard/create-project')}
            >
              + New Project
              <Rocket className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {projects.map((project, idx) => (
              <div
                key={idx}
                className="group bg-gray-800/20 hover:bg-gray-800/40 border border-gray-800/50 hover:border-gray-700/50 rounded-xl p-6 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h4 className="font-bold text-xl text-white group-hover:text-emerald-400 transition-colors">
                        {project.name}
                      </h4>
                      <span className={`px-3 py-1 text-xs rounded-full border font-semibold ${
                        project.statusType === 'danger'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
                          : project.statusType === 'warning'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : project.statusType === 'active'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {project.status}
                      </span>
                      <HealthScore score={project.aiScore} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Client</div>
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {project.client}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Revenue</div>
                        <div className="text-sm font-semibold text-emerald-400">{project.revenue}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Timeline</div>
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {project.daysLeft}d left
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Velocity</div>
                        <div className={`text-sm font-semibold flex items-center gap-1 ${
                          project.velocity > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {project.velocity > 0 ? (
                            <ArrowUp className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5" />
                          )}
                          {Math.abs(project.velocity)}%
                        </div>
                      </div>
                    </div>
                    {project.blockers && (
                      <div className="flex items-start gap-2 mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-red-400 font-medium mb-1">Critical Blocker</p>
                          <p className="text-sm text-gray-300">{project.blockers}</p>
                        </div>
                      </div>
                    )}
                    {(project.risks.length > 0 || project.opportunities.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {project.risks.length > 0 && (
                          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-semibold text-amber-400">Risks</span>
                            </div>
                            {project.risks.map((risk: string, i: number) => (
                              <p key={i} className="text-xs text-gray-300 mb-1 last:mb-0">• {risk}</p>
                            ))}
                          </div>
                        )}
                        {project.opportunities.length > 0 && (
                          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-semibold text-emerald-400">Opportunities</span>
                            </div>
                            {project.opportunities.map((opp: string, i: number) => (
                              <p key={i} className="text-xs text-gray-300 mb-1 last:mb-0">• {opp}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-lg font-bold text-white">{project.metrics.commits}</div>
                        <div className="text-xs text-gray-400">Commits</div>
                      </div>
                      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-lg font-bold text-white">{project.metrics.prs}</div>
                        <div className="text-xs text-gray-400">Pull Requests</div>
                      </div>
                      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                        <div className={`text-lg font-bold ${project.metrics.bugs === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{project.metrics.bugs}</div>
                        <div className="text-xs text-gray-400">Bugs</div>
                      </div>
                      <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-lg font-bold text-white">{project.metrics.tests}</div>
                        <div className="text-xs text-gray-400">Tests</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {project.techStack.map((tech: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-700/30 text-gray-300 text-xs rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-bold">{project.progress}%</span>
                      </div>
                      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.health === 'excellent'
                              ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                              : project.health === 'on-track'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>Next: {project.nextMilestone}</span>
                      <span className={project.predictedCompletion.includes('early')
                        ? 'text-emerald-400'
                        : project.predictedCompletion.includes('late')
                          ? 'text-red-400'
                          : 'text-blue-400'
                      }>
                        ETA: {project.predictedCompletion}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-all"
                    onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  >
                    View Dashboard
                  </button>
                  <button
                    className="flex-1 py-2.5 px-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all"
                    onClick={() => {
                      if (project.client_email) {
                        window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(project.client_email)}&su=${encodeURIComponent(`Re: ${project.name}`)}`, '_blank');
                      }
                    }}
                  >
                    Contact Client
                  </button>
                  <button title="More Options" className="py-2.5 px-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Live Activity Stream
            </h3>
            <p className="text-sm text-gray-400 mt-1">Real-time events & AI insights</p>
          </div>
          <div className="space-y-3">
            {activities.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-800/50 last:border-0 last:pb-0">
                  <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${
                    activity.status === 'success' ? 'bg-emerald-500/10' :
                      activity.status === 'warning' ? 'bg-amber-500/10' :
                        activity.status === 'opportunity' ? 'bg-purple-500/10' :
                          'bg-blue-500/10'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      activity.status === 'success' ? 'text-emerald-400' :
                        activity.status === 'warning' ? 'text-amber-400' :
                          activity.status === 'opportunity' ? 'text-purple-400' :
                            'text-blue-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">{activity.message}</p>
                    <p className="text-xs text-gray-400 mb-2">{activity.detail}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{activity.user}</span>
                        {activity.project && (
                          <>
                            <span>•</span>
                            <span>{activity.project}</span>
                          </>
                        )}
                      </div>
                      <span className={`text-xs font-semibold ${
                        activity.status === 'success' ? 'text-emerald-400' :
                          activity.status === 'warning' ? 'text-amber-400' :
                            'text-blue-400'
                      }`}>
                        {activity.metric}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-6 py-3 px-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
            View Full Timeline
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/30 via-blue-900/30 to-purple-900/30 border border-emerald-500/30 rounded-3xl p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex-1">
            <h3 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-emerald-400" />
              Your Agency is Primed for Explosive Growth
            </h3>
            <p className="text-gray-300 text-lg mb-4">
              AI analysis shows perfect conditions: strong pipeline, available capacity, and exceptional client satisfaction. The data says now is the time to scale.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Hot Pipeline", value: "$340K", style: "text-emerald-400" },
                { label: "Close Rate", value: "85%", style: "text-blue-400" },
                { label: "Devs Available", value: "3", style: "text-purple-400" },
                { label: "Client Score", value: "4.8/5", style: "text-amber-400" },
              ].map((card, idx) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className={`text-2xl font-bold mb-1 ${card.style}`}>{card.value}</div>
                  <div className="text-xs text-gray-400">{card.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-xl font-bold text-lg transition-all flex items-center gap-3 shadow-2xl shadow-emerald-500/30"
              onClick={() => navigate('/dashboard/create-project')}
            >
              <Rocket className="w-6 h-6" />
              Launch New Project
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl font-semibold transition-all">
              Review Pipeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;