import { useState, useMemo } from 'react';
import {
  TrendingUp, ArrowUp, ArrowDown, DollarSign, Users, Rocket, Activity,
  Download, ChevronRight, Target, Award, CheckCircle2, AlertCircle,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Globe, Smartphone, Database, Cloud, Layers, Sparkles, Brain,
  Gauge, Calendar, Zap, ArrowRightLeft,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';

// ─── Theme palette (matches dark dashboard) ──────────────────────────────────
const COLORS = {
  emerald: '#34d399',
  blue: '#60a5fa',
  purple: '#a78bfa',
  amber: '#fbbf24',
  cyan: '#22d3ee',
  pink: '#f472b6',
  red: '#f87171',
  grid: '#1f2937',
  axis: '#6b7280',
  bg: '#111827',
};

const PIE_PALETTE = [COLORS.emerald, COLORS.blue, COLORS.purple, COLORS.amber, COLORS.cyan, COLORS.pink];

// ─── Custom Recharts Tooltip ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/95 backdrop-blur border border-gray-700/60 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue')
            ? `$${(p.value / 1000).toFixed(1)}K`
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────
const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // ─── Mock data (preserved) ──────────────────────────────────────────────────
  const kpis = [
    { label: 'Total Revenue', value: '$847,290', change: '+23.5%', trend: 'up', compareValue: '$687,450', icon: DollarSign, color: 'emerald', sparkline: [650, 680, 670, 720, 750, 780, 847] },
    { label: 'Active Projects', value: '24', change: '+12.3%', trend: 'up', compareValue: '21', icon: Rocket, color: 'blue', sparkline: [18, 19, 20, 21, 22, 23, 24] },
    { label: 'Client Acquisition', value: '156', change: '+8.2%', trend: 'up', compareValue: '144', icon: Users, color: 'purple', sparkline: [130, 135, 140, 144, 148, 152, 156] },
    { label: 'Avg Project Value', value: '$35,304', change: '+18.7%', trend: 'up', compareValue: '$29,750', icon: Target, color: 'amber', sparkline: [28, 29, 30, 31, 33, 34, 35] },
    { label: 'Client Satisfaction', value: '4.8/5', change: '+0.3', trend: 'up', compareValue: '4.5/5', icon: Award, color: 'pink', sparkline: [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8] },
    { label: 'Deployment Success', value: '96.2%', change: '+2.1%', trend: 'up', compareValue: '94.1%', icon: CheckCircle2, color: 'cyan', sparkline: [92, 93, 93.5, 94.1, 95, 95.8, 96.2] },
  ];

  const revenueByService = [
    { name: 'Web Development', value: 342000, percentage: 40, growth: 18, color: 'emerald', icon: Globe },
    { name: 'Mobile Apps', value: 289000, percentage: 34, growth: 22, color: 'blue', icon: Smartphone },
    { name: 'Cloud Services', value: 156000, percentage: 18, growth: 12, color: 'purple', icon: Cloud },
    { name: 'API Development', value: 134000, percentage: 16, growth: 15, color: 'cyan', icon: Database },
    { name: 'DevOps', value: 98000, percentage: 12, growth: 9, color: 'amber', icon: Layers },
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 62000, projects: 18, clients: 12 },
    { month: 'Feb', revenue: 71000, projects: 19, clients: 13 },
    { month: 'Mar', revenue: 68000, projects: 20, clients: 14 },
    { month: 'Apr', revenue: 79000, projects: 21, clients: 15 },
    { month: 'May', revenue: 85000, projects: 22, clients: 16 },
    { month: 'Jun', revenue: 92000, projects: 23, clients: 17 },
    { month: 'Jul', revenue: 98000, projects: 24, clients: 18 },
  ];

  const projectStatus = [
    { status: 'Completed', count: 47, percentage: 52, color: 'emerald' },
    { status: 'In Progress', count: 24, percentage: 27, color: 'blue' },
    { status: 'Planning', count: 12, percentage: 13, color: 'purple' },
    { status: 'On Hold', count: 7, percentage: 8, color: 'amber' },
  ];

  const clientMetrics = [
    { tier: 'Enterprise', count: 12, revenue: 456000, avgValue: 38000, color: 'emerald' },
    { tier: 'Growth', count: 28, revenue: 287000, avgValue: 10250, color: 'blue' },
    { tier: 'Mid-Market', count: 45, revenue: 189000, avgValue: 4200, color: 'purple' },
    { tier: 'Startup', count: 71, revenue: 98000, avgValue: 1380, color: 'cyan' },
  ];

  const topPerformers = [
    { name: 'Sarah Chen', role: 'Account Manager', revenue: 245000, clients: 8, satisfaction: 4.9, color: 'emerald' },
    { name: 'Mike Rodriguez', role: 'Tech Lead', projects: 12, onTime: 100, quality: 4.8, color: 'blue' },
    { name: 'Maria Santos', role: 'Account Manager', revenue: 201000, clients: 6, satisfaction: 4.9, color: 'purple' },
    { name: 'David Park', role: 'Tech Lead', projects: 10, onTime: 95, quality: 4.7, color: 'amber' },
  ];

  const conversionFunnel = [
    { stage: 'Leads', count: 245, percentage: 100, color: 'blue' },
    { stage: 'Qualified', count: 167, percentage: 68, color: 'cyan' },
    { stage: 'Proposals', count: 98, percentage: 40, color: 'purple' },
    { stage: 'Negotiation', count: 62, percentage: 25, color: 'amber' },
    { stage: 'Closed Won', count: 42, percentage: 17, color: 'emerald' },
  ];

  // ─── NEW: Extended analytics data for Recharts charts ───────────────────────
  const budgetVsSpent = useMemo(() => [
    { month: 'Jan', budget: 72000, spent: 62000 },
    { month: 'Feb', budget: 75000, spent: 71000 },
    { month: 'Mar', budget: 78000, spent: 68000 },
    { month: 'Apr', budget: 80000, spent: 79000 },
    { month: 'May', budget: 88000, spent: 85000 },
    { month: 'Jun', budget: 95000, spent: 92000 },
    { month: 'Jul', budget: 100000, spent: 98000 },
  ], []);

  const weeklyActivity = useMemo(() => [
    { day: 'Mon', commits: 42, prs: 8, deploys: 3 },
    { day: 'Tue', commits: 56, prs: 12, deploys: 5 },
    { day: 'Wed', commits: 61, prs: 10, deploys: 4 },
    { day: 'Thu', commits: 48, prs: 14, deploys: 6 },
    { day: 'Fri', commits: 38, prs: 9, deploys: 7 },
    { day: 'Sat', commits: 15, prs: 3, deploys: 1 },
    { day: 'Sun', commits: 8, prs: 1, deploys: 0 },
  ], []);

  const teamSkillsRadar = useMemo(() => [
    { skill: 'React', level: 95 },
    { skill: 'Node.js', level: 88 },
    { skill: 'TypeScript', level: 92 },
    { skill: 'DevOps', level: 76 },
    { skill: 'UI/UX', level: 84 },
    { skill: 'Testing', level: 70 },
    { skill: 'Cloud', level: 80 },
    { skill: 'Mobile', level: 72 },
  ], []);

  const clientGrowthOverTime = useMemo(() => [
    { month: 'Jan', new: 8, churned: 2, net: 6 },
    { month: 'Feb', new: 10, churned: 1, net: 9 },
    { month: 'Mar', new: 12, churned: 3, net: 9 },
    { month: 'Apr', new: 9, churned: 2, net: 7 },
    { month: 'May', new: 14, churned: 1, net: 13 },
    { month: 'Jun', new: 11, churned: 2, net: 9 },
    { month: 'Jul', new: 16, churned: 1, net: 15 },
  ], []);

  const servicePieData = useMemo(() => revenueByService.map(s => ({
    name: s.name,
    value: s.value,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), []);

  const projectPieData = useMemo(() => projectStatus.map(s => ({
    name: s.status,
    value: s.count,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), []);

  // ─── Sparkline renderer (CSS – original design preserved) ───────────────────
  const renderSparkline = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    return (
      <div className="flex items-end gap-0.5 h-8">
        {data.map((value, i) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={i}
              className={`flex-1 bg-gradient-to-t from-${color}-500 to-${color}-400 rounded-t transition-all duration-300 hover:opacity-80`}
              style={{ height: `${height}%`, minHeight: '20%' }}
            />
          );
        })}
      </div>
    );
  };

  // ─── Service breakdown (CSS progress bars – preserved) ──────────────────────
  const renderServiceBreakdown = () => {
    const total = revenueByService.reduce((sum, s) => sum + s.value, 0);
    return (
      <div className="space-y-4">
        {revenueByService.map((service, idx) => {
          const Icon = service.icon;
          const pct = (service.value / total) * 100;
          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${service.color}-500/10 rounded-lg`}>
                    <Icon className={`w-4 h-4 text-${service.color}-400`} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{service.name}</div>
                    <div className="text-xs text-gray-400">${(service.value / 1000).toFixed(0)}K revenue</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold text-${service.color}-400`}>{pct.toFixed(1)}%</span>
                  <div className={`flex items-center gap-1 text-xs text-${service.color}-400`}>
                    <ArrowUp className="w-3 h-3" />
                    {service.growth}%
                  </div>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-${service.color}-500 to-${service.color}-400 rounded-full transition-all duration-500 group-hover:shadow-lg group-hover:shadow-${service.color}-500/50`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Conversion funnel (CSS bars – preserved) ──────────────────────────────
  const renderConversionFunnel = () => (
    <div className="space-y-3">
      {conversionFunnel.map((stage, idx) => (
        <div key={idx} className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">{stage.stage}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{stage.count} leads</span>
              <span className={`text-sm font-semibold text-${stage.color}-400`}>{stage.percentage}%</span>
            </div>
          </div>
          <div className="h-10 bg-gray-800/50 rounded-lg overflow-hidden relative">
            <div
              className={`h-full bg-gradient-to-r from-${stage.color}-500/20 to-${stage.color}-500/10 border-l-4 border-${stage.color}-500 flex items-center px-4 transition-all duration-500`}
              style={{ width: `${stage.percentage}%` }}
            >
              <span className="text-xs font-semibold text-white">{stage.percentage}% conversion</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ─────────────────────────────────── JSX ────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-400" />
            Analytics & Insights
          </h1>
          <p className="text-gray-400">Deep dive into your business performance and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-xl p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-all" title="Export analytics data">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend === 'up';
          return (
            <div
              key={idx}
              className="group relative bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 rounded-2xl p-6 transition-all overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${kpi.color}-500/5 rounded-full blur-3xl group-hover:bg-${kpi.color}-500/10 transition-all`}></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-${kpi.color}-500/10 rounded-xl`}>
                    <Icon className={`w-5 h-5 text-${kpi.color}-400`} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {kpi.change}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{kpi.value}</h3>
                <p className="text-sm text-gray-400 mb-4">{kpi.label}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Previous: {kpi.compareValue}</span>
                  <span>{timeRange === '7d' ? 'vs last week' : timeRange === '30d' ? 'vs last month' : 'vs last period'}</span>
                </div>
                {renderSparkline(kpi.sparkline, kpi.color)}
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════
          Recharts – Revenue Trend (Line + Area) & Project Pie
          ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend – ComposedChart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-emerald-400" />
                Revenue Trend
              </h3>
              <p className="text-sm text-gray-400 mt-1">Monthly revenue &amp; client growth</p>
            </div>
            <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1" title="View revenue details">
              View Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="month" stroke={COLORS.axis} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" stroke={COLORS.axis} tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v / 1000}K`} />
              <YAxis yAxisId="right" orientation="right" stroke={COLORS.axis} tick={{ fontSize: 12 }} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.emerald} fill="url(#revGrad)" strokeWidth={2.5} />
              <Line yAxisId="right" type="monotone" dataKey="clients" name="Clients" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 4, fill: COLORS.blue }} />
              <Line yAxisId="right" type="monotone" dataKey="projects" name="Projects" stroke={COLORS.purple} strokeWidth={2} dot={{ r: 4, fill: COLORS.purple }} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Project Status Pie Chart */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-400" />
              Project Status
            </h3>
            <p className="text-sm text-gray-400 mt-1">Current project distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={projectPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                {projectPieData.map((_entry, i) => (
                  <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {projectStatus.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_PALETTE[i] }} />
                <span className="text-gray-400">{s.status}</span>
                <span className="ml-auto font-semibold text-gray-300">{s.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-800/30 rounded-xl">
            <div className="text-sm text-gray-400 mb-1">Total Projects</div>
            <div className="text-2xl font-bold text-white">90</div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          Budget vs Spent Area + Service Revenue Donut
          ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual Spent */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-amber-400" />
              Budget vs Actual Spend
            </h3>
            <p className="text-sm text-gray-400 mt-1">Monthly budget utilization tracking</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={budgetVsSpent}>
              <defs>
                <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="month" stroke={COLORS.axis} tick={{ fontSize: 12 }} />
              <YAxis stroke={COLORS.axis} tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v / 1000}K`} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Area type="monotone" dataKey="budget" name="Budget" stroke={COLORS.blue} fill="url(#budgetGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="spent" name="Actual Spent" stroke={COLORS.emerald} fill="url(#spentGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Revenue Donut */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Revenue by Service
            </h3>
            <p className="text-sm text-gray-400 mt-1">Service line performance (donut)</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={servicePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none" label={({ name, percent }: { name: string; percent: number }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                {servicePieData.map((_entry, i) => (
                  <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {renderServiceBreakdown()}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          Weekly Activity Bar + Team Skills Radar
          ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Dev Activity */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Weekly Development Activity
            </h3>
            <p className="text-sm text-gray-400 mt-1">Commits, pull requests &amp; deployments</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyActivity} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="day" stroke={COLORS.axis} tick={{ fontSize: 12 }} />
              <YAxis stroke={COLORS.axis} tick={{ fontSize: 12 }} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Bar dataKey="commits" name="Commits" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
              <Bar dataKey="prs" name="Pull Requests" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="deploys" name="Deploys" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Capability Radar */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-pink-400" />
              Team Capabilities
            </h3>
            <p className="text-sm text-gray-400 mt-1">Skill proficiency across domains</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={teamSkillsRadar}>
              <PolarGrid stroke={COLORS.grid} />
              <PolarAngleAxis dataKey="skill" tick={{ fill: COLORS.axis, fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Proficiency" dataKey="level" stroke={COLORS.emerald} fill={COLORS.emerald} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          Client Growth Stacked Bar
          ════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
              Client Growth &amp; Churn
            </h3>
            <p className="text-sm text-gray-400 mt-1">New vs churned clients per month</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.emerald }} /> New</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.red }} /> Churned</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.blue }} /> Net</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={clientGrowthOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="month" stroke={COLORS.axis} tick={{ fontSize: 12 }} />
            <YAxis stroke={COLORS.axis} tick={{ fontSize: 12 }} />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="new" name="New Clients" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
            <Bar dataKey="churned" name="Churned" fill={COLORS.red} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="net" name="Net Growth" stroke={COLORS.blue} strokeWidth={2.5} dot={{ r: 5, fill: COLORS.blue }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Original: Conversion Funnel + Funnel Analysis ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel (CSS) */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              Sales Funnel
            </h3>
            <p className="text-sm text-gray-400 mt-1">Lead to customer conversion</p>
          </div>
          {renderConversionFunnel()}
          <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">17% Conversion Rate</span>
            </div>
            <p className="text-xs text-gray-400">Industry average: 12% • You're outperforming by 42%</p>
          </div>
        </div>

        {/* Funnel as Horizontal BarChart (Recharts) */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Funnel Analysis
            </h3>
            <p className="text-sm text-gray-400 mt-1">Conversion at each stage</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={conversionFunnel} layout="vertical" barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
              <XAxis type="number" stroke={COLORS.axis} tick={{ fontSize: 12 }} />
              <YAxis dataKey="stage" type="category" stroke={COLORS.axis} tick={{ fontSize: 12 }} width={90} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="count" name="Leads" radius={[0, 6, 6, 0]}>
                {conversionFunnel.map((_entry, i) => (
                  <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Original: Client Tiers & Top Performers ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Tiers */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Client Tiers
            </h3>
            <p className="text-sm text-gray-400 mt-1">Revenue distribution by client segment</p>
          </div>
          <div className="space-y-4">
            {clientMetrics.map((tier, idx) => (
              <div
                key={idx}
                className={`p-4 bg-${tier.color}-500/5 border border-${tier.color}-500/20 rounded-xl hover:border-${tier.color}-500/40 transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className={`text-lg font-bold text-${tier.color}-400`}>{tier.tier}</div>
                    <div className="text-xs text-gray-400">{tier.count} clients</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">${(tier.revenue / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-400">revenue</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Avg Value</span>
                  <span className={`font-semibold text-${tier.color}-400`}>${(tier.avgValue / 1000).toFixed(1)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Top Performers
            </h3>
            <p className="text-sm text-gray-400 mt-1">Outstanding team members this period</p>
          </div>
          <div className="space-y-4">
            {topPerformers.map((performer, idx) => (
              <div
                key={idx}
                className={`p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:border-${performer.color}-500/30 transition-all group`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${performer.color}-400 to-${performer.color}-600 flex items-center justify-center text-white font-bold text-lg`}>
                    {performer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{performer.name}</div>
                    <div className="text-xs text-gray-400">{performer.role}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {performer.revenue && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className={`font-bold text-${performer.color}-400`}>${(performer.revenue / 1000).toFixed(0)}K</div>
                      <div className="text-gray-500">Revenue</div>
                    </div>
                  )}
                  {performer.projects && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className={`font-bold text-${performer.color}-400`}>{performer.projects}</div>
                      <div className="text-gray-500">Projects</div>
                    </div>
                  )}
                  {performer.clients && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className={`font-bold text-${performer.color}-400`}>{performer.clients}</div>
                      <div className="text-gray-500">Clients</div>
                    </div>
                  )}
                  {performer.satisfaction && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className={`font-bold text-${performer.color}-400`}>{performer.satisfaction}</div>
                      <div className="text-gray-500">Rating</div>
                    </div>
                  )}
                  {performer.onTime && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className={`font-bold text-${performer.color}-400`}>{performer.onTime}%</div>
                      <div className="text-gray-500">On-Time</div>
                    </div>
                  )}
                  {performer.quality && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className={`font-bold text-${performer.color}-400`}>{performer.quality}</div>
                      <div className="text-gray-500">Quality</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── AI Insights (preserved) ─── */}
      <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-emerald-900/20 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">AI-Powered Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Revenue Opportunity</span>
                </div>
                <p className="text-sm text-gray-300">Mobile app services showing 22% growth - consider expanding this offering. Potential $85K additional revenue in Q2.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">Conversion Rate</span>
                </div>
                <p className="text-sm text-gray-300">Your 17% funnel conversion rate is 42% above industry average. Focus on qualified leads is paying off significantly.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">Attention Needed</span>
                </div>
                <p className="text-sm text-gray-300">DevOps services growth at 9% is below target. Consider upselling to existing clients or expanding marketing efforts.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-400">Client Success</span>
                </div>
                <p className="text-sm text-gray-300">96.2% deployment success rate and 4.8/5 satisfaction score indicate exceptional delivery quality. Leverage for case studies.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
