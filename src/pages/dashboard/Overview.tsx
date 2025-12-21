import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, DollarSign, Users, Rocket, Zap, Activity, Clock, CheckCircle2, AlertCircle, Smartphone, Globe, Database, Cloud, Sparkles, ChevronRight, Calendar, AlertTriangle, Target, Briefcase, GitBranch, Server, MessageSquare, TrendingDown, Award, ChevronDown, Brain, Workflow, Cpu, LineChart, BarChart3, PieChart, TrendingUpIcon, Flame, Shield, Boxes, Code2, Timer, Bell, Eye, Filter, Plus, ArrowRight, CircleDot, Layers, Network, Gauge } from 'lucide-react';

const Overview = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiInsightsOpen, setAiInsightsOpen] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // AI-Powered Predictions
  const aiPredictions = [
    {
      type: 'revenue',
      title: 'Revenue Forecast',
      prediction: '$1.2M by Q2',
      confidence: 94,
      insight: 'Mobile app projects trending 34% above projections. AI recommends expanding iOS team.',
      action: 'View Strategy',
      trend: 'up',
      impact: 'high',
      icon: Brain
    },
    {
      type: 'risk',
      title: 'Risk Alert',
      prediction: 'TechCorp 67% likely to request delay',
      confidence: 78,
      insight: 'Historical pattern: 3 UI revision cycles = avg 2-week delay. Proactive meeting recommended.',
      action: 'Mitigate Now',
      trend: 'warning',
      impact: 'medium',
      icon: Shield
    },
    {
      type: 'opportunity',
      title: 'Upsell Opportunity',
      prediction: '+$180K potential with FinanceHub',
      confidence: 87,
      insight: 'Client satisfaction 4.9/5 + requesting features beyond scope. Prime for Phase 2 proposal.',
      action: 'Draft Proposal',
      trend: 'up',
      impact: 'high',
      icon: Target
    }
  ];

  // Real-time Business Vitals
  const vitals = [
    {
      label: 'Revenue Velocity',
      value: '$847K',
      subValue: '+23.5% MoM',
      trend: 'up',
      trendValue: '+$156K',
      target: '$900K',
      targetProgress: 94,
      prediction: '$1.2M by Q2',
      health: 'excellent',
      icon: Flame,
      color: 'emerald',
      insights: ['Best month in 8 quarters', 'Mobile apps +34%', '3 whales closing'],
      sparkline: [680, 705, 730, 760, 800, 825, 847]
    },
    {
      label: 'Team Efficiency',
      value: '87%',
      subValue: 'Optimal zone',
      trend: 'stable',
      trendValue: 'On target',
      target: '85%',
      targetProgress: 102,
      prediction: '3 devs free next week',
      health: 'excellent',
      icon: Users,
      color: 'blue',
      insights: ['Zero overtime', '12% faster delivery', '3 available developers'],
      sparkline: [82, 84, 85, 86, 87, 87, 87]
    },
    {
      label: 'Client Health',
      value: '4.8/5',
      subValue: '12 new reviews',
      trend: 'up',
      trendValue: '+0.3',
      target: '4.5',
      targetProgress: 107,
      prediction: '2 referrals incoming',
      health: 'excellent',
      icon: Award,
      color: 'purple',
      insights: ['Zero complaints', '96% retention', '4 testimonials pending'],
      sparkline: [4.3, 4.4, 4.5, 4.6, 4.7, 4.75, 4.8]
    },
    {
      label: 'Pipeline Momentum',
      value: '$340K',
      subValue: '5 hot deals',
      trend: 'up',
      trendValue: '+$89K',
      target: '$300K',
      targetProgress: 113,
      prediction: '85% close probability',
      health: 'excellent',
      icon: Rocket,
      color: 'amber',
      insights: ['2 ready to sign', '$120K whale interested', 'Record high pipeline'],
      sparkline: [210, 235, 260, 280, 310, 325, 340]
    }
  ];

  // Smart Financials with Predictive Analytics
  const financials = [
    {
      label: 'Monthly Revenue',
      current: '$847,290',
      projected: '$1.2M (Q2)',
      change: '+23.5%',
      trend: 'up',
      health: 'excellent',
      breakdown: { mrr: '$124K', oneTime: '$723K' },
      insights: ['Mobile: $289K (+22%)', 'Web: $342K (+18%)', 'Cloud: $156K (+12%)'],
      chartData: [680, 705, 730, 760, 800, 825, 847],
      icon: DollarSign,
      color: 'emerald'
    },
    {
      label: 'Cash Flow',
      current: '+$691K',
      projected: '+$800K next month',
      change: '$156K pending',
      trend: 'up',
      health: 'excellent',
      breakdown: { incoming: '$156K', collected: '$847K' },
      insights: ['$89K due this week', '2 invoices overdue', 'Avg collection: 18 days'],
      chartData: [520, 580, 620, 650, 670, 685, 691],
      icon: TrendingUp,
      color: 'blue'
    },
    {
      label: 'Project Margins',
      current: '64%',
      projected: '68% with optimization',
      change: '+4.2%',
      trend: 'up',
      health: 'excellent',
      breakdown: { direct: '32%', indirect: '4%' },
      insights: ['Industry avg: 45-55%', 'Top quartile performer', 'AI tools saving 8%'],
      chartData: [58, 59, 61, 62, 63, 63.5, 64],
      icon: Target,
      color: 'purple'
    },
    {
      label: 'Runway & Burn',
      current: '14 months',
      projected: '18 months at current rate',
      change: '$89K/mo burn',
      trend: 'stable',
      health: 'excellent',
      breakdown: { reserves: '$1.2M', burn: '$89K' },
      insights: ['Within budget', 'Healthy reserves', 'Break-even: $124K MRR'],
      chartData: [92, 91, 90, 89.5, 89.2, 89.1, 89],
      icon: Gauge,
      color: 'cyan'
    }
  ];

  // Advanced Project Intelligence
  const projects = [
    { 
      name: 'E-commerce Platform Redesign',
      client: 'TechCorp Inc.',
      status: 'Blocked',
      statusType: 'danger',
      progress: 67,
      velocity: -12,
      health: 'at-risk',
      aiScore: 68,
      dueDate: '2024-02-15',
      daysLeft: 25,
      priority: 'critical',
      team: ['Sarah Chen', 'Mike Rodriguez', 'Alex Kim', 'Jenny Liu', 'Tom Wilson'],
      revenue: '$45K',
      budget: '$50K',
      spent: '$33.5K',
      burnRate: 'on-track',
      profitability: 22,
      blockers: 'Awaiting client approval on UI changes (2h overdue)',
      risks: ['Client indecision pattern detected', 'May trigger 2-week delay'],
      opportunities: ['Upsell Phase 2: +$35K', 'Referral potential: High'],
      lastUpdate: '2 hours ago',
      techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      metrics: { commits: 247, prs: 34, bugs: 3, tests: 186 },
      nextMilestone: 'UI approval & iteration',
      predictedCompletion: 'Feb 28 (13 days late)'
    },
    { 
      name: 'Mobile Banking App',
      client: 'FinanceHub',
      status: 'Testing',
      statusType: 'warning',
      progress: 89,
      velocity: 8,
      health: 'on-track',
      aiScore: 92,
      dueDate: '2024-01-28',
      daysLeft: 7,
      priority: 'high',
      team: ['Maria Santos', 'David Park', 'Chris Anderson', 'Lisa Chen'],
      revenue: '$67K',
      budget: '$70K',
      spent: '$62.3K',
      burnRate: 'on-track',
      profitability: 28,
      blockers: null,
      risks: ['Tight deadline', 'Final security audit pending'],
      opportunities: ['Client loves it - Phase 2 likely: +$85K', '2 referrals confirmed'],
      lastUpdate: '30 min ago',
      techStack: ['React Native', 'Firebase', 'Stripe', 'Plaid'],
      metrics: { commits: 412, prs: 67, bugs: 1, tests: 324 },
      nextMilestone: 'Production deployment',
      predictedCompletion: 'Jan 27 (1 day early)'
    },
    { 
      name: 'AI Analytics Dashboard',
      client: 'DataMinds',
      status: 'Development',
      statusType: 'active',
      progress: 45,
      velocity: 15,
      health: 'excellent',
      aiScore: 96,
      dueDate: '2024-03-10',
      daysLeft: 48,
      priority: 'medium',
      team: ['Alex Kim', 'Priya Sharma', 'James Wilson', 'Sophie Martinez', 'Mark Chen', 'Emma Davis'],
      revenue: '$52K',
      budget: '$55K',
      spent: '$23.4K',
      burnRate: 'under-budget',
      profitability: 31,
      blockers: null,
      risks: ['Complex ML models', 'Third-party API dependencies'],
      opportunities: ['Enterprise license upgrade: +$120K/year', 'Case study material'],
      lastUpdate: '1 hour ago',
      techStack: ['Python', 'TensorFlow', 'React', 'PostgreSQL'],
      metrics: { commits: 189, prs: 23, bugs: 0, tests: 156 },
      nextMilestone: 'ML model training complete',
      predictedCompletion: 'Mar 5 (5 days early)'
    },
    { 
      name: 'CRM Integration Suite',
      client: 'SalesPro',
      status: 'Ready to Deploy',
      statusType: 'success',
      progress: 92,
      velocity: 5,
      health: 'excellent',
      aiScore: 94,
      dueDate: '2024-01-25',
      daysLeft: 4,
      priority: 'medium',
      team: ['John Williams', 'Amy Thompson', 'Robert Lee'],
      revenue: '$34K',
      budget: '$35K',
      spent: '$32.2K',
      burnRate: 'on-track',
      profitability: 26,
      blockers: null,
      risks: ['Minimal - ready for launch'],
      opportunities: ['Maintenance contract: +$2K/mo', 'Training package: +$8K'],
      lastUpdate: '15 min ago',
      techStack: ['Node.js', 'Express', 'MongoDB', 'Redis'],
      metrics: { commits: 156, prs: 28, bugs: 0, tests: 142 },
      nextMilestone: 'Client final approval',
      predictedCompletion: 'Jan 24 (on time)'
    }
  ];

  // Real-time Activity Stream
  const activities = [
    { 
      type: 'deployment',
      icon: Rocket,
      message: 'Mobile Banking App v2.1 deployed to staging',
      detail: 'All 324 tests passing. Zero critical issues detected.',
      user: 'Maria Santos',
      project: 'FinanceHub',
      time: '5 min ago',
      status: 'success',
      metric: '100% test coverage'
    },
    { 
      type: 'ai',
      icon: Brain,
      message: 'AI detected upsell opportunity',
      detail: 'FinanceHub satisfaction spike. Phase 2 proposal recommended.',
      user: 'AI Engine',
      project: 'FinanceHub',
      time: '12 min ago',
      status: 'opportunity',
      metric: '87% confidence'
    },
    { 
      type: 'client',
      icon: MessageSquare,
      message: 'TechCorp requested UI revisions',
      detail: '3 design changes. Pattern suggests 2-week delay risk.',
      user: 'Sarah Chen',
      project: 'E-commerce Platform',
      time: '23 min ago',
      status: 'warning',
      metric: 'Risk: Medium'
    },
    { 
      type: 'payment',
      icon: DollarSign,
      message: 'Invoice #1247 paid - $45,000',
      detail: 'TechCorp Inc. Wire transfer received. Auto-reconciled.',
      user: 'Finance Bot',
      project: 'TechCorp',
      time: '1 hour ago',
      status: 'success',
      metric: 'On time'
    },
    { 
      type: 'performance',
      icon: Zap,
      message: 'Team velocity increased 15%',
      detail: 'AI tools adoption driving efficiency gains.',
      user: 'Analytics',
      project: 'All Projects',
      time: '2 hours ago',
      status: 'success',
      metric: '+15% faster'
    },
    { 
      type: 'alert',
      icon: Server,
      message: 'DataMinds infrastructure scaled',
      detail: 'Auto-scaled to handle ML training workload.',
      user: 'DevOps AI',
      project: 'AI Analytics',
      time: '2 hours ago',
      status: 'info',
      metric: 'Cost: +$45/day'
    },
    { 
      type: 'milestone',
      icon: Award,
      message: 'CRM Integration 90% complete',
      detail: 'Final testing phase. On track for early delivery.',
      user: 'John Williams',
      project: 'SalesPro',
      time: '3 hours ago',
      status: 'success',
      metric: '2 days ahead'
    }
  ];

  // Service Intelligence
  const services = [
    { 
      name: 'Web Development',
      revenue: '$342K',
      projects: 32,
      active: 8,
      growth: '+18%',
      margin: '68%',
      satisfaction: 4.9,
      velocity: '+12%',
      prediction: '$420K next quarter',
      demand: 'High',
      capacity: '78%',
      icon: Globe,
      color: 'emerald',
      topClient: 'TechCorp Inc.',
      avgProjectSize: '$42K',
      winRate: '87%'
    },
    { 
      name: 'Mobile Apps',
      revenue: '$289K',
      projects: 24,
      active: 6,
      growth: '+22%',
      margin: '62%',
      satisfaction: 4.8,
      velocity: '+18%',
      prediction: '$380K next quarter',
      demand: 'Very High',
      capacity: '92%',
      icon: Smartphone,
      color: 'blue',
      topClient: 'FinanceHub',
      avgProjectSize: '$67K',
      winRate: '91%'
    },
    { 
      name: 'Cloud Services',
      revenue: '$156K',
      projects: 28,
      active: 7,
      growth: '+12%',
      margin: '71%',
      satisfaction: 4.7,
      velocity: '+8%',
      prediction: '$190K next quarter',
      demand: 'Medium',
      capacity: '65%',
      icon: Cloud,
      color: 'purple',
      topClient: 'DataMinds',
      avgProjectSize: '$28K',
      winRate: '83%'
    },
    { 
      name: 'API Development',
      revenue: '$134K',
      projects: 18,
      active: 4,
      growth: '+15%',
      margin: '59%',
      satisfaction: 4.6,
      velocity: '+10%',
      prediction: '$165K next quarter',
      demand: 'Growing',
      capacity: '54%',
      icon: Database,
      color: 'cyan',
      topClient: 'SalesPro',
      avgProjectSize: '$34K',
      winRate: '79%'
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
          <div className="text-[10px] text-gray-500">AI Health</div>
        </div>
      </div>
    );
  };

  const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className="flex items-end gap-[2px] h-8">
        {data.map((value, i) => {
          const height = range > 0 ? ((value - min) / range) * 100 : 50;
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
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-purple-900/20 border border-emerald-500/20 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent">
                Welcome back, Brian
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
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">Revenue: +23.5% MoM</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-semibold text-sm">Team: 87% Optimal</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-semibold text-sm">Client: 4.8/5</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-semibold shadow-lg shadow-emerald-500/20">
              <Brain className="w-5 h-5" />
              AI Command Center
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* AI Predictions Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {aiPredictions.map((pred, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl border p-5 group hover:scale-[1.02] transition-all ${
              pred.impact === 'high' ? 'bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 border-emerald-500/30' :
              pred.trend === 'warning' ? 'bg-gradient-to-br from-amber-900/20 to-amber-900/5 border-amber-500/30' :
              'bg-gradient-to-br from-blue-900/20 to-blue-900/5 border-blue-500/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                pred.impact === 'high' ? 'bg-emerald-500/10' :
                pred.trend === 'warning' ? 'bg-amber-500/10' :
                'bg-blue-500/10'
              }`}>
                <pred.icon className={`w-6 h-6 ${
                  pred.impact === 'high' ? 'text-emerald-400' :
                  pred.trend === 'warning' ? 'text-amber-400' :
                  'text-blue-400'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-white">{pred.title}</h4>
                  <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-300">
                    {pred.confidence}% confidence
                  </span>
                </div>
                
                <p className="text-2xl font-bold text-white mb-2">{pred.prediction}</p>
                <p className="text-sm text-gray-300 mb-3">{pred.insight}</p>
                
                <button className={`text-sm font-semibold flex items-center gap-1 ${
                  pred.impact === 'high' ? 'text-emerald-400 hover:text-emerald-300' :
                  pred.trend === 'warning' ? 'text-amber-400 hover:text-amber-300' :
                  'text-blue-400 hover:text-blue-300'
                } transition-colors`}>
                  {pred.action}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Business Vitals - Premium Cards */}
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
                    <span className="text-emerald-400 font-semibold">{vital.targetProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-${vital.color}-500 to-${vital.color}-400 transition-all duration-500`}
                      style={{ width: `${Math.min(vital.targetProgress, 100)}%` }}
                    />
                  </div>
                </div>

                {selectedMetric === idx ? (
                  <div className="space-y-2 mb-4">
                    {vital.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className={`w-3 h-3 text-${vital.color}-400 mt-0.5 flex-shrink-0`} />
                        <span className="text-gray-300">{insight}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4">
                    <MiniSparkline data={vital.sparkline} color={vital.color} />
                  </div>
                )}

                <div className={`text-xs text-${vital.color}-400 font-medium flex items-center gap-1.5`}>
                  <Brain className="w-3 h-3" />
                  {vital.prediction}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Financial Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-xs text-gray-400 mb-4">{fin.breakdown.mrr && `MRR: ${fin.breakdown.mrr} | One-time: ${fin.breakdown.oneTime}`}</p>

                <div className="space-y-1.5 mb-4">
                  {fin.insights.map((insight, i) => (
                    <p key={i} className="text-xs text-gray-400">{insight}</p>
                  ))}
                </div>

                <div className="mb-4">
                  <MiniSparkline data={fin.chartData} color={fin.color} />
                </div>

                <div className={`text-xs text-${fin.color}-400 font-medium`}>
                  Forecast: {fin.projected}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Rocket className="w-6 h-6 text-emerald-400" />
                Project Intelligence
              </h3>
              <p className="text-sm text-gray-400 mt-1">AI-powered project monitoring & predictions</p>
            </div>
            <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors">
              View All
              <ChevronRight className="w-4 h-4" />
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
                        project.statusType === 'danger' ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' :
                        project.statusType === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        project.statusType === 'active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
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
                          {project.velocity > 0 ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {project.risks.length > 0 && (
                        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-semibold text-amber-400">Risks</span>
                          </div>
                          {project.risks.map((risk, i) => (
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
                          {project.opportunities.map((opp, i) => (
                            <p key={i} className="text-xs text-gray-300 mb-1 last:mb-0">• {opp}</p>
                          ))}
                        </div>
                      )}
                    </div>

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
                      {project.techStack.map((tech, i) => (
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
                            project.health === 'excellent' ? 'bg-gradient-to-r from-emerald-500 to-blue-500' :
                            project.health === 'on-track' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                            'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>Next: {project.nextMilestone}</span>
                      <span className={project.predictedCompletion.includes('early') ? 'text-emerald-400' : project.predictedCompletion.includes('late') ? 'text-red-400' : 'text-blue-400'}>
                        ETA: {project.predictedCompletion}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-all">
                    View Dashboard
                  </button>
                  <button className="flex-1 py-2.5 px-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all">
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

        {/* Real-time Activity Intelligence */}
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

      {/* Service Intelligence Grid */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-400" />
              Service Line Intelligence
            </h3>
            <p className="text-sm text-gray-400 mt-1">Performance analytics & growth forecasting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className={`relative overflow-hidden bg-gradient-to-br from-gray-800/40 to-gray-800/20 border border-gray-700/50 rounded-xl p-6 hover:border-${service.color}-500/30 transition-all group`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${service.color}-500/5 rounded-full blur-2xl group-hover:bg-${service.color}-500/10 transition-all`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-${service.color}-500/10 rounded-xl`}>
                      <Icon className={`w-6 h-6 text-${service.color}-400`} />
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      service.demand === 'Very High' ? 'bg-emerald-500/10 text-emerald-400' :
                      service.demand === 'High' ? 'bg-blue-500/10 text-blue-400' :
                      service.demand === 'Growing' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {service.demand}
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-lg mb-1">{service.name}</h4>
                  <p className="text-3xl font-bold text-white mb-1">{service.revenue}</p>
                  <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold mb-4">
                    <ArrowUp className="w-3.5 h-3.5" />
                    {service.growth}
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Projects</span>
                      <span className="text-white font-semibold">{service.projects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Active Now</span>
                      <span className="text-blue-400 font-semibold">{service.active}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Avg Deal Size</span>
                      <span className="text-white font-semibold">{service.avgProjectSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="text-emerald-400 font-semibold">{service.winRate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Margin</span>
                      <span className="text-purple-400 font-semibold">{service.margin}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Satisfaction</span>
                      <div className="flex items-center gap-1">
                        <span className="text-white font-semibold">{service.satisfaction}</span>
                        <span className="text-amber-400">★</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-900/50 rounded-lg mb-4">
                    <div className="text-xs text-gray-400 mb-1">Capacity</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${service.color}-500 transition-all`}
                          style={{ width: service.capacity }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-white">{service.capacity}</span>
                    </div>
                  </div>

                  <div className={`text-xs text-${service.color}-400 font-medium mb-4 flex items-center gap-1.5`}>
                    <Brain className="w-3 h-3" />
                    Forecast: {service.prediction}
                  </div>

                  <button className={`w-full py-2.5 px-4 bg-${service.color}-500/10 hover:bg-${service.color}-500/20 border border-${service.color}-500/30 text-${service.color}-400 rounded-lg text-sm font-medium transition-all`}>
                    Deep Dive Analysis
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium CTA */}
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
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-emerald-400 mb-1">$340K</div>
                <div className="text-xs text-gray-400">Hot Pipeline</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-blue-400 mb-1">85%</div>
                <div className="text-xs text-gray-400">Close Rate</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-purple-400 mb-1">3</div>
                <div className="text-xs text-gray-400">Devs Available</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-bold text-amber-400 mb-1">4.8/5</div>
                <div className="text-xs text-gray-400">Client Score</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-xl font-bold text-lg transition-all flex items-center gap-3 shadow-2xl shadow-emerald-500/30">
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

export default Overview;