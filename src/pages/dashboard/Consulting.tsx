import React, { useState, useEffect } from 'react';
import {
  Briefcase, Users, DollarSign, TrendingUp, Calendar,
  CheckCircle2, AlertCircle, XCircle, PlayCircle,
  Target, PieChart, ArrowUp, Search,
  ChevronRight, ChevronDown, User, MessageSquare, FileText,
  Zap, Star, MoreHorizontal, Activity, ArrowUpRight,
  Sparkles, Brain, TrendingDown, AlertTriangle, Globe,
  Code, Database, Smartphone,
  GitBranch, Box,
  Rocket, Settings, Bell, Download
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  type: 'Website' | 'Web App' | 'Mobile App' | 'API/Backend' | 'Desktop' | 'MVP';
  status: 'active' | 'planning' | 'development' | 'testing' | 'deployed' | 'maintenance';
  progress: number;
  health: 'excellent' | 'good' | 'at-risk' | 'critical';
  budget: number;
  spent: number;
  startDate: string;
  deadline: string;
  techStack: string[];
  team: TeamMember[];
  nextMilestone: string;
  milestoneDue: string;
  githubUrl?: string;
  deploymentStatus?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'available' | 'busy' | 'away';
  expertise: string[];
  utilization: number;
  activeProjects: number;
  revenue: number;
  rating: number;
  hourlyRate: number;
}

interface ServiceLine {
  name: string;
  icon: React.ElementType;
  projects: number;
  revenue: number;
  margin: number;
  growth: number;
  avgDelivery: number;
  color: string;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'alert';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  action?: string;
  timestamp: string;
}

interface Activity {
  id: string;
  type: 'deployment' | 'milestone' | 'client' | 'code' | 'alert' | 'team';
  title: string;
  description: string;
  project: string;
  timestamp: string;
  user?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NyxDevConsultingDashboard() {
  // State Management
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedView, setSelectedView] = useState<'overview' | 'projects' | 'team' | 'financial'>('overview');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [animateIn, setAnimateIn] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 50);
  }, []);

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const metrics: MetricCard[] = [
    {
      label: 'Active Projects',
      value: 18,
      change: 12.5,
      trend: 'up',
      icon: Briefcase,
      color: 'cyan',
      subtitle: '6 launching this month'
    },
    {
      label: 'Monthly Revenue',
      value: '$247K',
      change: 23.8,
      trend: 'up',
      icon: DollarSign,
      color: 'emerald',
      subtitle: '+$46K vs last month'
    },
    {
      label: 'Team Utilization',
      value: '89%',
      change: 5.2,
      trend: 'up',
      icon: Users,
      color: 'blue',
      subtitle: 'Optimal capacity'
    },
    {
      label: 'Avg Delivery Time',
      value: '6.2w',
      change: -8.3,
      trend: 'down',
      icon: Rocket,
      color: 'purple',
      subtitle: '12% faster'
    },
    {
      label: 'Client Satisfaction',
      value: '4.9/5',
      change: 4.2,
      trend: 'up',
      icon: Star,
      color: 'amber',
      subtitle: 'Based on 24 reviews'
    },
    {
      label: 'Code Quality',
      value: '94%',
      change: 2.1,
      trend: 'up',
      icon: Code,
      color: 'pink',
      subtitle: 'SonarQube score'
    }
  ];

  const projects: Project[] = [
    {
      id: 'PRJ-001',
      name: 'E-Commerce Platform Redesign',
      client: 'TechRetail Inc',
      type: 'Web App',
      status: 'development',
      progress: 67,
      health: 'good',
      budget: 125000,
      spent: 83750,
      startDate: '2024-11-15',
      deadline: '2024-03-30',
      techStack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
      team: [
        { id: '1', name: 'Sarah Chen', role: 'Lead Dev', avatar: 'SC', status: 'busy', expertise: ['React', 'Node'], utilization: 95, activeProjects: 2, revenue: 52000, rating: 4.9, hourlyRate: 150 },
        { id: '2', name: 'Mike Torres', role: 'Backend Dev', avatar: 'MT', status: 'busy', expertise: ['Node', 'PostgreSQL'], utilization: 88, activeProjects: 2, revenue: 45000, rating: 4.8, hourlyRate: 140 }
      ],
      nextMilestone: 'Payment Integration Complete',
      milestoneDue: '2024-02-15',
      githubUrl: 'github.com/nyxdev/techretail',
      deploymentStatus: 'Staging'
    },
    {
      id: 'PRJ-002',
      name: 'Healthcare Mobile App',
      client: 'MediConnect',
      type: 'Mobile App',
      status: 'development',
      progress: 42,
      health: 'excellent',
      budget: 180000,
      spent: 75600,
      startDate: '2024-12-01',
      deadline: '2024-05-15',
      techStack: ['React Native', 'Firebase', 'TypeScript', 'AWS'],
      team: [
        { id: '3', name: 'Alex Kim', role: 'Mobile Lead', avatar: 'AK', status: 'busy', expertise: ['React Native', 'iOS'], utilization: 92, activeProjects: 1, revenue: 58000, rating: 5.0, hourlyRate: 160 },
        { id: '4', name: 'Emma Davis', role: 'UI Designer', avatar: 'ED', status: 'available', expertise: ['Figma', 'Design Systems'], utilization: 75, activeProjects: 3, revenue: 38000, rating: 4.8, hourlyRate: 120 }
      ],
      nextMilestone: 'MVP User Testing',
      milestoneDue: '2024-02-28',
      githubUrl: 'github.com/nyxdev/mediconnect',
      deploymentStatus: 'Development'
    },
    {
      id: 'PRJ-003',
      name: 'Financial Analytics Dashboard',
      client: 'FinanceHub Pro',
      type: 'Web App',
      status: 'testing',
      progress: 85,
      health: 'good',
      budget: 95000,
      spent: 80750,
      startDate: '2024-10-01',
      deadline: '2024-02-28',
      techStack: ['Vue.js', 'D3.js', 'Python', 'FastAPI', 'Redis'],
      team: [
        { id: '5', name: 'David Park', role: 'Full Stack', avatar: 'DP', status: 'busy', expertise: ['Vue', 'Python'], utilization: 90, activeProjects: 2, revenue: 48000, rating: 4.7, hourlyRate: 145 }
      ],
      nextMilestone: 'Production Deployment',
      milestoneDue: '2024-02-20',
      githubUrl: 'github.com/nyxdev/financehub',
      deploymentStatus: 'Staging'
    },
    {
      id: 'PRJ-004',
      name: 'AI Content Generator API',
      client: 'ContentAI Solutions',
      type: 'API/Backend',
      status: 'active',
      progress: 28,
      health: 'at-risk',
      budget: 145000,
      spent: 40600,
      startDate: '2024-12-10',
      deadline: '2024-06-30',
      techStack: ['Python', 'FastAPI', 'OpenAI', 'Docker', 'K8s'],
      team: [
        { id: '6', name: 'Lisa Wang', role: 'AI Engineer', avatar: 'LW', status: 'busy', expertise: ['Python', 'ML'], utilization: 85, activeProjects: 2, revenue: 62000, rating: 4.9, hourlyRate: 170 },
        { id: '7', name: 'James Miller', role: 'DevOps', avatar: 'JM', status: 'available', expertise: ['Docker', 'AWS'], utilization: 70, activeProjects: 3, revenue: 41000, rating: 4.6, hourlyRate: 135 }
      ],
      nextMilestone: 'API v1 Beta Release',
      milestoneDue: '2024-03-15',
      githubUrl: 'github.com/nyxdev/contentai-api',
      deploymentStatus: 'Development'
    },
    {
      id: 'PRJ-005',
      name: 'Real Estate Portal',
      client: 'PropertyPro',
      type: 'Website',
      status: 'planning',
      progress: 15,
      health: 'excellent',
      budget: 78000,
      spent: 11700,
      startDate: '2024-01-08',
      deadline: '2024-04-30',
      techStack: ['Next.js', 'Tailwind', 'Supabase', 'Vercel'],
      team: [
        { id: '8', name: 'Nina Patel', role: 'Frontend Dev', avatar: 'NP', status: 'available', expertise: ['React', 'Next.js'], utilization: 68, activeProjects: 2, revenue: 36000, rating: 4.7, hourlyRate: 130 }
      ],
      nextMilestone: 'Design System Approval',
      milestoneDue: '2024-02-05',
      githubUrl: 'github.com/nyxdev/propertypro',
      deploymentStatus: 'Planning'
    }
  ];

  const serviceLines: ServiceLine[] = [
    {
      name: 'Web Applications',
      icon: Code,
      projects: 7,
      revenue: 542000,
      margin: 42,
      growth: 28.5,
      avgDelivery: 8,
      color: 'cyan'
    },
    {
      name: 'Mobile Apps',
      icon: Smartphone,
      projects: 4,
      revenue: 378000,
      margin: 38,
      growth: 34.2,
      avgDelivery: 10,
      color: 'blue'
    },
    {
      name: 'Custom APIs',
      icon: Database,
      projects: 3,
      revenue: 289000,
      margin: 45,
      growth: 18.7,
      avgDelivery: 6,
      color: 'purple'
    },
    {
      name: 'Websites',
      icon: Globe,
      projects: 4,
      revenue: 156000,
      margin: 35,
      growth: 12.3,
      avgDelivery: 4,
      color: 'emerald'
    }
  ];

  const aiInsights: AIInsight[] = [
    {
      id: 'AI-001',
      type: 'risk',
      priority: 'high',
      title: 'Budget Overrun Risk Detected',
      description: 'ContentAI Solutions project is trending 12% over budget based on current burn rate.',
      impact: 'Potential $17,400 overrun',
      action: 'Review scope with client',
      timestamp: '2 hours ago'
    },
    {
      id: 'AI-002',
      type: 'opportunity',
      priority: 'high',
      title: 'Upsell Opportunity Identified',
      description: 'TechRetail Inc has expressed interest in mobile app development. 85% probability of conversion.',
      impact: 'Estimated $180K additional revenue',
      action: 'Schedule discovery call',
      timestamp: '5 hours ago'
    },
    {
      id: 'AI-003',
      type: 'optimization',
      priority: 'medium',
      title: 'Resource Reallocation Suggestion',
      description: 'Nina Patel has 32% available capacity. Consider allocating to PropertyPro to accelerate timeline.',
      impact: '2 week delivery improvement',
      action: 'Update project allocation',
      timestamp: '1 day ago'
    }
  ];

  const recentActivity: Activity[] = [
    { id: 'ACT-001', type: 'deployment', title: 'Production deployment completed', description: 'FinanceHub Analytics v2.1 deployed to production', project: 'Financial Analytics Dashboard', timestamp: '15 min ago', user: 'David Park' },
    { id: 'ACT-002', type: 'milestone', title: 'Milestone achieved', description: 'Payment integration completed ahead of schedule', project: 'E-Commerce Platform', timestamp: '1 hour ago', user: 'Sarah Chen' },
    { id: 'ACT-003', type: 'client', title: 'Client feedback received', description: 'MediConnect approved MVP designs with minor revisions', project: 'Healthcare Mobile App', timestamp: '2 hours ago', user: 'Alex Kim' },
    { id: 'ACT-004', type: 'code', title: 'Code review completed', description: '24 PRs merged, 3 security issues resolved', project: 'ContentAI API', timestamp: '3 hours ago', user: 'Lisa Wang' },
    { id: 'ACT-005', type: 'alert', title: 'Performance optimization needed', description: 'Dashboard load time increased by 340ms', project: 'Financial Analytics Dashboard', timestamp: '5 hours ago', user: 'System' },
    { id: 'ACT-006', type: 'team', title: 'New team member onboarded', description: 'James Miller joined as DevOps engineer', project: 'Multiple Projects', timestamp: '1 day ago', user: 'HR Team' }
  ];

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
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-400',
        bgLight: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        glow: 'shadow-purple-500/50',
        gradient: 'from-purple-500 to-pink-500'
      },
      emerald: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-400',
        bgLight: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/50',
        gradient: 'from-emerald-500 to-teal-500'
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
      }
    };
    return colors[color] || colors.cyan;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      active: { label: 'Active', color: 'cyan', icon: PlayCircle },
      planning: { label: 'Planning', color: 'purple', icon: Target },
      development: { label: 'In Development', color: 'blue', icon: Code },
      testing: { label: 'Testing', color: 'amber', icon: AlertCircle },
      deployed: { label: 'Deployed', color: 'emerald', icon: CheckCircle2 },
      maintenance: { label: 'Maintenance', color: 'emerald', icon: Settings }
    };
    return configs[status] || configs.active;
  };

  const getHealthConfig = (health: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      excellent: { label: 'Excellent', color: 'emerald', icon: CheckCircle2 },
      good: { label: 'Good', color: 'blue', icon: CheckCircle2 },
      'at-risk': { label: 'At Risk', color: 'amber', icon: AlertTriangle },
      critical: { label: 'Critical', color: 'red', icon: XCircle }
    };
    return configs[health] || configs.good;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      deployment: Rocket,
      milestone: Target,
      client: Users,
      code: Code,
      alert: AlertTriangle,
      team: User
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      deployment: 'emerald',
      milestone: 'cyan',
      client: 'blue',
      code: 'purple',
      alert: 'amber',
      team: 'pink'
    };
    return colors[type] || 'cyan';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 relative overflow-hidden">
      {/* Futuristic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Network Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(to right, #06b6d4 1px, transparent 1px),
            linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-[100px]"></div>

        {/* Animated Connection Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0 }} />
              <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="url(#lineGradient)" strokeWidth="2">
            <animate attributeName="x1" values="10%;15%;10%" dur="8s" repeatCount="indefinite" />
            <animate attributeName="y1" values="20%;25%;20%" dur="8s" repeatCount="indefinite" />
          </line>
          <line x1="80%" y1="10%" x2="20%" y2="90%" stroke="url(#lineGradient)" strokeWidth="2">
            <animate attributeName="x1" values="80%;85%;80%" dur="10s" repeatCount="indefinite" />
          </line>
        </svg>
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto p-6 lg:p-8 space-y-6">
        
        {/* ================================================================ */}
        {/* HEADER SECTION */}
        {/* ================================================================ */}
        <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Logo/Icon */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative p-4 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-cyan-500/30 rounded-2xl backdrop-blur-sm">
                  <Briefcase className="w-9 h-9 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))' }} />
                </div>
              </div>

              <div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 animate-gradient">
                    Consulting Command Center
                  </span>
                </h1>
                <p className="text-slate-400 text-base mt-2 font-medium">
                  Real-time oversight of tech service delivery & operations
                </p>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 border border-cyan-500/30 rounded-xl backdrop-blur-sm">
                <div className="relative">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-cyan-400 font-bold">LIVE</span>
              </div>
              <div className="h-5 w-px bg-slate-700"></div>
              <span className="text-slate-400 font-medium">18 Active Projects</span>
              <div className="h-5 w-px bg-slate-700"></div>
              <span className="text-emerald-400 font-bold">89% Utilization</span>
              <div className="h-5 w-px bg-slate-700"></div>
              <span className="text-slate-400">$247K MRR</span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range Selector */}
            <div className="inline-flex items-center gap-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-1 backdrop-blur-sm">
              {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* AI Insights Toggle */}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm border ${
                showAIPanel
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/30'
                  : 'bg-slate-900/60 border-slate-700/50 text-slate-300 hover:border-purple-500/50'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Insights</span>
              {aiInsights.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {aiInsights.length}
                </span>
              )}
            </button>

            {/* New Project Button */}
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg hover:shadow-xl shadow-cyan-500/30 border border-white/10 font-bold text-sm group">
              <Rocket className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>New Project</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </header>

        {/* ================================================================ */}
        {/* AI INSIGHTS PANEL */}
        {/* ================================================================ */}
        {showAIPanel && (
          <div 
            className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                    <Sparkles className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI-Powered Intelligence</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Predictive analytics and optimization recommendations</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                  title="Close AI Insights Panel"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.map((insight, idx) => {
                  const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
                    opportunity: { icon: TrendingUp, color: 'emerald' },
                    risk: { icon: AlertTriangle, color: 'red' },
                    optimization: { icon: Zap, color: 'cyan' },
                    alert: { icon: AlertCircle, color: 'amber' }
                  };
                  const config = typeConfig[insight.type];
                  const colors = getColorClasses(config.color);
                  const Icon = config.icon;

                  return (
                    <div
                      key={insight.id}
                      className="group p-5 bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all cursor-pointer"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2.5 ${colors.bgLight} rounded-lg border ${colors.border} flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 transition-all">
                              {insight.title}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${colors.bgLight} ${colors.text} border ${colors.border}`}>
                              {insight.priority}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-1 rounded bg-slate-800/50 text-slate-400 font-mono border border-slate-700/50">
                            {insight.timestamp}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                        <span className={`text-xs font-bold ${colors.text}`}>
                          {insight.impact}
                        </span>
                        {insight.action && (
                          <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                            {insight.action}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* KEY METRICS GRID */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((metric, idx) => {
            const colors = getColorClasses(metric.color);
            const Icon = metric.icon;
            const isPositive = metric.trend === 'up';

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
                {/* Background Effects */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`}></div>
                <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} opacity-[0.05] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`relative p-3 ${colors.bgLight} rounded-xl border ${colors.border} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                      <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-30 rounded-xl blur-lg transition-opacity`}></div>
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${colors.bgLight} border ${colors.border} text-xs font-bold`}>
                      {isPositive ? (
                        <ArrowUp className={`w-3 h-3 ${colors.text}`} />
                      ) : (
                        <TrendingDown className={`w-3 h-3 ${colors.text}`} />
                      )}
                      <span className={colors.text}>{Math.abs(metric.change).toFixed(1)}%</span>
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Projects List (2/3 width) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* ACTIVE PROJECTS */}
            <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-700/50 bg-slate-900/40">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30">
                        <Activity className="w-5 h-5 text-cyan-300" />
                      </div>
                      Active Projects
                    </h3>
                    <p className="text-sm text-slate-400 mt-1.5 font-medium">
                      {projects.filter(p => filterStatus === 'all' || p.status === filterStatus).length} projects in view
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative group/search">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/search:text-cyan-400 transition-colors pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all w-full lg:w-64 backdrop-blur-sm"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="inline-flex items-center gap-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-1 backdrop-blur-sm">
                      {['all', 'development', 'testing', 'planning'].map((status) => (
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

              {/* Projects List */}
              <div className="divide-y divide-slate-700/30">
                {projects
                  .filter(p => filterStatus === 'all' || p.status === filterStatus)
                  .filter(p => searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.client.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((project) => {
                    const statusConfig = getStatusConfig(project.status);
                    const healthConfig = getHealthConfig(project.health);
                    const StatusIcon = statusConfig.icon;
                    const HealthIcon = healthConfig.icon;
                    const isExpanded = expandedProject === project.id;
                    const budgetUsed = (project.spent / project.budget) * 100;

                    return (
                      <div key={project.id} className="group transition-all duration-300 hover:bg-slate-800/30">
                        {/* Project Card */}
                        <div
                          onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                          className="flex items-center justify-between p-6 cursor-pointer"
                        >
                          <div className="flex items-center gap-6 flex-1">
                            {/* Status Icon */}
                            <div className={`relative p-4 ${getColorClasses(statusConfig.color).bgLight} rounded-xl border ${getColorClasses(statusConfig.color).border} transition-all duration-300 group-hover:scale-110`}>
                              <StatusIcon className={`w-6 h-6 ${getColorClasses(statusConfig.color).text}`} />
                              <div className={`absolute inset-0 ${getColorClasses(statusConfig.color).bg} opacity-0 group-hover:opacity-20 rounded-xl blur-lg transition-opacity`}></div>
                            </div>

                            {/* Project Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-white font-bold text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-blue-300 transition-all">
                                  {project.name}
                                </span>
                                <span className="text-[10px] px-2 py-1 rounded-md bg-slate-800/60 text-slate-400 font-mono border border-slate-700/50">
                                  {project.id}
                                </span>
                                <span className={`text-xs px-2.5 py-1 rounded-lg ${getColorClasses(statusConfig.color).bgLight} ${getColorClasses(statusConfig.color).text} border ${getColorClasses(statusConfig.color).border} font-bold uppercase tracking-wider`}>
                                  {statusConfig.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-slate-400 font-medium flex-wrap">
                                <span className="flex items-center gap-1.5">
                                  <Globe className="w-3.5 h-3.5" />
                                  {project.client}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="flex items-center gap-1.5">
                                  <Box className="w-3.5 h-3.5" />
                                  {project.type}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  <Users className="w-3.5 h-3.5" />
                                  {project.team.length} developers
                                </span>
                              </div>

                              {/* Tech Stack Tags */}
                              <div className="flex flex-wrap gap-2">
                                {project.techStack.slice(0, 4).map((tech) => (
                                  <span
                                    key={tech}
                                    className="text-[10px] px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20 font-mono"
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {project.techStack.length > 4 && (
                                  <span className="text-[10px] px-2 py-1 bg-slate-800/50 text-slate-400 rounded border border-slate-700/50 font-mono">
                                    +{project.techStack.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            {/* Progress */}
                            <div className="w-40 hidden xl:block">
                              <div className="flex justify-between text-xs mb-2 font-semibold">
                                <span className="text-slate-400">Progress</span>
                                <span className="text-white">{project.progress}%</span>
                              </div>
                              <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`absolute inset-0 bg-gradient-to-r ${getColorClasses(statusConfig.color).gradient} rounded-full transition-all duration-1000`}
                                  style={{
                                    width: `${project.progress}%`,
                                    boxShadow: `0 0 12px ${getColorClasses(statusConfig.color).glow}`
                                  }}
                                />
                              </div>
                            </div>

                            {/* Health Badge */}
                            <div className={`hidden lg:flex items-center gap-2 px-3 py-2 ${getColorClasses(healthConfig.color).bgLight} rounded-lg border ${getColorClasses(healthConfig.color).border}`}>
                              <HealthIcon className={`w-4 h-4 ${getColorClasses(healthConfig.color).text}`} />
                              <span className={`text-xs font-bold ${getColorClasses(healthConfig.color).text} uppercase tracking-wider`}>
                                {healthConfig.label}
                              </span>
                            </div>

                            {/* Expand Toggle */}
                            <div className={`p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300 ${isExpanded ? 'rotate-180 bg-slate-800/50 text-white' : ''}`}>
                              <ChevronDown className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-t border-slate-700/50 p-8 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              
                              {/* Budget Tracking */}
                              <div className="relative group/card p-6 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50 hover:border-emerald-500/40 transition-all overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                                
                                <div className="relative z-10 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Budget Tracking</span>
                                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                      <DollarSign className="w-4 h-4 text-emerald-400" />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                      <span className="text-3xl font-bold text-white">
                                        ${(project.spent / 1000).toFixed(1)}K
                                      </span>
                                      <span className="text-sm text-slate-500">
                                        / ${(project.budget / 1000).toFixed(0)}K
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400">Total spent from budget</p>
                                  </div>

                                  <div className="relative">
                                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                                      <div
                                        className={`h-full rounded-full transition-all duration-1000 ${
                                          budgetUsed > 90
                                            ? 'bg-gradient-to-r from-red-600 to-red-500'
                                            : budgetUsed > 75
                                            ? 'bg-gradient-to-r from-amber-600 to-amber-500'
                                            : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                                        }`}
                                        style={{ width: `${budgetUsed}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className={`text-xs font-bold mb-1 ${budgetUsed > 90 ? 'text-red-400' : 'text-slate-400'}`}>
                                        Used
                                      </div>
                                      <div className="text-lg font-bold text-white">{budgetUsed.toFixed(0)}%</div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-400 mb-1">Remaining</div>
                                      <div className="text-lg font-bold text-emerald-400">
                                        ${((project.budget - project.spent) / 1000).toFixed(1)}K
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Team & Next Milestone */}
                              <div className="relative group/card p-6 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50 hover:border-cyan-500/40 transition-all overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                                
                                <div className="relative z-10 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Next Milestone</span>
                                    <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                      <Target className="w-4 h-4 text-cyan-400" />
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                                      {project.nextMilestone}
                                    </h4>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                                      <Calendar className="w-3.5 h-3.5" />
                                      Due: {new Date(project.milestoneDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Team</div>
                                    <div className="flex -space-x-3">
                                      {project.team.map((member, i) => (
                                        <div
                                          key={i}
                                          className="relative w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-[2px] hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                                          title={`${member.name} - ${member.role}`}
                                        >
                                          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900">
                                            {member.avatar}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="flex flex-col gap-3 justify-center">
                                <button className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl shadow-cyan-500/20 group/btn">
                                  <GitBranch className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                  View Repository
                                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                                </button>

                                <button className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800/60 hover:bg-slate-800 text-white border border-slate-700/50 hover:border-slate-600 rounded-xl text-sm font-semibold transition-all group/btn">
                                  <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                  Team Chat
                                </button>

                                <button className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800/60 hover:bg-slate-800 text-white border border-slate-700/50 hover:border-slate-600 rounded-xl text-sm font-semibold transition-all group/btn">
                                  <FileText className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                  Full Report
                                </button>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* SERVICE LINES PERFORMANCE */}
            <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                      <PieChart className="w-5 h-5 text-purple-300" />
                    </div>
                    Service Line Performance
                  </h3>
                  <p className="text-sm text-slate-400 mt-1.5">Revenue & project distribution by service type</p>
                </div>
                <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors" title="More options">
                  <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceLines.map((service, idx) => {
                  const colors = getColorClasses(service.color);
                  const Icon = service.icon;
                  const totalRevenue = serviceLines.reduce((sum, s) => sum + s.revenue, 0);
                  const percentage = (service.revenue / totalRevenue) * 100;

                  return (
                    <div
                      key={idx}
                      className="group p-5 bg-gradient-to-br from-slate-900/60 to-slate-800/60 hover:from-slate-900/80 hover:to-slate-800/80 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 ${colors.bgLight} rounded-xl border ${colors.border} group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <div>
                            <div className="text-white font-bold text-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-blue-300 transition-all">
                              {service.name}
                            </div>
                            <div className="text-xs text-slate-500">{service.projects} active • {service.avgDelivery}w avg</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-sm">${(service.revenue / 1000).toFixed(0)}K</div>
                          <div className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                            <TrendingUp className="w-3 h-3" />
                            {service.growth}%
                          </div>
                        </div>
                      </div>

                      <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                        <div
                          className={`absolute inset-y-0 left-0 ${colors.bg} rounded-full transition-all duration-1000 group-hover:brightness-125`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-slate-500 font-medium mb-1">Margin</div>
                          <div className="text-white font-bold">{service.margin}%</div>
                        </div>
                        <div>
                          <div className="text-slate-500 font-medium mb-1">Portfolio Share</div>
                          <div className={`font-bold ${colors.text}`}>{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Activity & Quick Stats */}
          <div className="space-y-6">
            
            {/* LIVE ACTIVITY FEED */}
            <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30">
                      <Activity className="w-5 h-5 text-cyan-300" />
                    </div>
                    Live Activity
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Real-time project updates</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                </div>
              </div>

              <div className="space-y-0 relative max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {/* Timeline */}
                <div className="absolute left-[21px] top-4 bottom-4 w-px bg-gradient-to-b from-slate-700 via-slate-700/50 to-transparent"></div>

                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);
                  const colors = getColorClasses(color);

                  return (
                    <div key={activity.id} className="relative pl-12 pb-6 last:pb-0 group/activity">
                      {/* Node */}
                      <div className={`absolute left-3 -translate-x-1/2 w-6 h-6 ${colors.bg} rounded-full border-[3px] border-slate-900 z-10 flex items-center justify-center shadow-lg ${colors.glow} group-hover/activity:scale-125 transition-transform`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>

                      {/* Card */}
                      <div className="p-4 -mt-1 hover:bg-slate-800/40 rounded-xl transition-all border border-transparent hover:border-slate-700/50 cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${colors.bgLight} ${colors.text} uppercase tracking-widest border ${colors.border}`}>
                            {activity.type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{activity.timestamp}</span>
                        </div>
                        <span className="text-slate-200 text-sm font-bold block mb-1">
                          {activity.title}
                        </span>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">{activity.project}</span>
                          {activity.user && (
                            <>
                              <span className="text-slate-700">•</span>
                              <span className="text-cyan-400 font-medium">{activity.user}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUICK STATS CARDS */}
            <div className="grid grid-cols-1 gap-4">
              {/* Deployment Status */}
              <div className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl hover:border-emerald-500/30 transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                      <Rocket className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deployments</div>
                      <div className="text-2xl font-bold text-white mt-1">12</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">This Week</div>
                    <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      +18%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  3 production • 7 staging • 2 development
                </div>
              </div>

              {/* Code Quality */}
              <div className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl hover:border-cyan-500/30 transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                      <Code className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Code Quality</div>
                      <div className="text-2xl font-bold text-white mt-1">94%</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">Avg Score</div>
                    <div className="text-cyan-400 text-xs font-bold flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      +2.1%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  156 tests passed • 0 vulnerabilities
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
            <div className="h-4 w-px bg-slate-700"></div>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
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