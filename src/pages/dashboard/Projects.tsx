import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Calendar, DollarSign, Users, Clock, CheckCircle2, AlertCircle, AlertTriangle, Target, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Zap, Brain, GitBranch, Code2, Bug, TestTube, Rocket, Eye, MessageSquare, Settings, MoreVertical, ChevronDown, ChevronRight, Layers, BarChart3, Activity, Shield, Sparkles, Timer, Award, Circle, Flame, Terminal } from 'lucide-react';

const Projects = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'health' | 'deadline' | 'revenue'>('health');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const projects = [
    {
      id: 1,
      name: 'E-commerce Platform Redesign',
      client: 'TechCorp Inc.',
      clientLogo: 'TC',
      status: 'Blocked',
      statusType: 'danger',
      progress: 67,
      velocity: -12,
      health: 'at-risk',
      aiScore: 68,
      aiInsight: 'Client approval delays detected. Historical pattern suggests 2-week extension likely.',
      dueDate: '2024-02-15',
      daysLeft: 25,
      startDate: '2023-11-01',
      priority: 'critical',
      team: [
        { name: 'Sarah Chen', role: 'Lead Dev', avatar: 'SC', status: 'active' },
        { name: 'Mike Rodriguez', role: 'Backend', avatar: 'MR', status: 'active' },
        { name: 'Alex Kim', role: 'Frontend', avatar: 'AK', status: 'active' },
        { name: 'Jenny Liu', role: 'Designer', avatar: 'JL', status: 'active' },
        { name: 'Tom Wilson', role: 'QA', avatar: 'TW', status: 'active' }
      ],
      revenue: 45000,
      budget: 50000,
      spent: 33500,
      profitability: 22,
      blockers: [
        { type: 'client', message: 'Awaiting UI approval (2h overdue)', severity: 'high' },
        { type: 'dependency', message: 'Third-party API rate limits', severity: 'medium' }
      ],
      risks: [
        'Client indecision pattern detected',
        'May trigger 2-week delay',
        'Budget at 67% with 25 days remaining'
      ],
      opportunities: [
        'Upsell Phase 2: +$35K potential',
        'Client satisfaction high despite delays',
        'Referral opportunity: High'
      ],
      techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Redis'],
      metrics: {
        commits: 247,
        prs: 34,
        bugs: 3,
        tests: 186,
        coverage: 87,
        uptime: 99.2
      },
      milestones: [
        { name: 'Discovery & Planning', status: 'completed', date: '2023-11-15' },
        { name: 'Design & Prototyping', status: 'completed', date: '2023-12-10' },
        { name: 'Core Development', status: 'completed', date: '2024-01-05' },
        { name: 'UI Implementation', status: 'in-progress', date: '2024-01-25' },
        { name: 'Testing & QA', status: 'pending', date: '2024-02-08' },
        { name: 'Deployment', status: 'pending', date: '2024-02-15' }
      ],
      recentActivity: [
        { type: 'comment', user: 'Sarah Chen', message: 'Pushed UI updates to staging', time: '2h ago' },
        { type: 'blocker', user: 'System', message: 'Client approval overdue', time: '2h ago' },
        { type: 'commit', user: 'Mike Rodriguez', message: 'Optimized database queries', time: '4h ago' }
      ],
      tags: ['E-commerce', 'Redesign', 'High-Priority'],
      predictedCompletion: 'Feb 28 (13 days late)',
      confidence: 72
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      client: 'FinanceHub',
      clientLogo: 'FH',
      status: 'Testing',
      statusType: 'warning',
      progress: 89,
      velocity: 8,
      health: 'on-track',
      aiScore: 92,
      aiInsight: 'Excellent momentum. Prime candidate for Phase 2 upsell (+$85K opportunity).',
      dueDate: '2024-01-28',
      daysLeft: 7,
      startDate: '2023-10-01',
      priority: 'high',
      team: [
        { name: 'Maria Santos', role: 'Lead Dev', avatar: 'MS', status: 'active' },
        { name: 'David Park', role: 'Mobile Dev', avatar: 'DP', status: 'active' },
        { name: 'Chris Anderson', role: 'Backend', avatar: 'CA', status: 'active' },
        { name: 'Lisa Chen', role: 'QA', avatar: 'LC', status: 'active' }
      ],
      revenue: 67000,
      budget: 70000,
      spent: 62300,
      profitability: 28,
      blockers: [],
      risks: [
        'Tight deadline - 7 days remaining',
        'Final security audit pending',
        'App store approval timeline uncertain'
      ],
      opportunities: [
        'Client loves it - Phase 2 likely: +$85K',
        '2 referrals confirmed',
        'Case study & testimonial secured'
      ],
      techStack: ['React Native', 'Firebase', 'Stripe', 'Plaid', 'Jest'],
      metrics: {
        commits: 412,
        prs: 67,
        bugs: 1,
        tests: 324,
        coverage: 94,
        uptime: 99.8
      },
      milestones: [
        { name: 'Requirements & Design', status: 'completed', date: '2023-10-20' },
        { name: 'Core Features', status: 'completed', date: '2023-11-30' },
        { name: 'Payment Integration', status: 'completed', date: '2023-12-20' },
        { name: 'Security Implementation', status: 'completed', date: '2024-01-10' },
        { name: 'Testing & Bug Fixes', status: 'in-progress', date: '2024-01-25' },
        { name: 'Production Deployment', status: 'pending', date: '2024-01-28' }
      ],
      recentActivity: [
        { type: 'deployment', user: 'Maria Santos', message: 'v2.1 deployed to staging', time: '30m ago' },
        { type: 'success', user: 'QA Team', message: 'All 324 tests passing', time: '1h ago' },
        { type: 'comment', user: 'Client', message: 'Loved the demo! Ready for launch', time: '3h ago' }
      ],
      tags: ['Mobile', 'Fintech', 'High-Value'],
      predictedCompletion: 'Jan 27 (1 day early)',
      confidence: 94
    },
    {
      id: 3,
      name: 'AI Analytics Dashboard',
      client: 'DataMinds',
      clientLogo: 'DM',
      status: 'Development',
      statusType: 'active',
      progress: 45,
      velocity: 15,
      health: 'excellent',
      aiScore: 96,
      aiInsight: 'Ahead of schedule. Complex ML implementation progressing smoothly.',
      dueDate: '2024-03-10',
      daysLeft: 48,
      startDate: '2023-12-01',
      priority: 'medium',
      team: [
        { name: 'Alex Kim', role: 'Lead Dev', avatar: 'AK', status: 'active' },
        { name: 'Priya Sharma', role: 'ML Engineer', avatar: 'PS', status: 'active' },
        { name: 'James Wilson', role: 'Backend', avatar: 'JW', status: 'active' },
        { name: 'Sophie Martinez', role: 'Frontend', avatar: 'SM', status: 'active' },
        { name: 'Mark Chen', role: 'Data Engineer', avatar: 'MC', status: 'active' },
        { name: 'Emma Davis', role: 'Designer', avatar: 'ED', status: 'active' }
      ],
      revenue: 52000,
      budget: 55000,
      spent: 23400,
      profitability: 31,
      blockers: [],
      risks: [
        'Complex ML models require careful testing',
        'Third-party API dependencies',
        'Large dataset processing challenges'
      ],
      opportunities: [
        'Enterprise license upgrade: +$120K/year',
        'White-label opportunity',
        'Premium case study material'
      ],
      techStack: ['Python', 'TensorFlow', 'React', 'PostgreSQL', 'Docker'],
      metrics: {
        commits: 189,
        prs: 23,
        bugs: 0,
        tests: 156,
        coverage: 91,
        uptime: 99.9
      },
      milestones: [
        { name: 'Architecture & Design', status: 'completed', date: '2023-12-15' },
        { name: 'Data Pipeline Setup', status: 'completed', date: '2024-01-05' },
        { name: 'ML Model Development', status: 'in-progress', date: '2024-02-01' },
        { name: 'Dashboard UI', status: 'in-progress', date: '2024-02-20' },
        { name: 'Integration & Testing', status: 'pending', date: '2024-03-01' },
        { name: 'Launch', status: 'pending', date: '2024-03-10' }
      ],
      recentActivity: [
        { type: 'commit', user: 'Priya Sharma', message: 'ML model accuracy improved to 94%', time: '1h ago' },
        { type: 'success', user: 'Alex Kim', message: 'Real-time processing implemented', time: '5h ago' },
        { type: 'comment', user: 'Client', message: 'Impressed with early results', time: '1d ago' }
      ],
      tags: ['AI/ML', 'Analytics', 'Enterprise'],
      predictedCompletion: 'Mar 5 (5 days early)',
      confidence: 96
    },
    {
      id: 4,
      name: 'CRM Integration Suite',
      client: 'SalesPro',
      clientLogo: 'SP',
      status: 'Ready to Deploy',
      statusType: 'success',
      progress: 92,
      velocity: 5,
      health: 'excellent',
      aiScore: 94,
      aiInsight: 'On track for early delivery. High maintenance contract potential.',
      dueDate: '2024-01-25',
      daysLeft: 4,
      startDate: '2023-11-15',
      priority: 'medium',
      team: [
        { name: 'John Williams', role: 'Lead Dev', avatar: 'JW', status: 'active' },
        { name: 'Amy Thompson', role: 'Backend', avatar: 'AT', status: 'active' },
        { name: 'Robert Lee', role: 'Integration', avatar: 'RL', status: 'active' }
      ],
      revenue: 34000,
      budget: 35000,
      spent: 32200,
      profitability: 26,
      blockers: [],
      risks: [
        'Minimal - ready for launch'
      ],
      opportunities: [
        'Maintenance contract: +$2K/mo',
        'Training package: +$8K',
        'Additional integrations: +$15K'
      ],
      techStack: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
      metrics: {
        commits: 156,
        prs: 28,
        bugs: 0,
        tests: 142,
        coverage: 89,
        uptime: 99.7
      },
      milestones: [
        { name: 'Planning & Design', status: 'completed', date: '2023-11-25' },
        { name: 'Core API Development', status: 'completed', date: '2023-12-15' },
        { name: 'CRM Integrations', status: 'completed', date: '2024-01-05' },
        { name: 'Testing & Documentation', status: 'completed', date: '2024-01-18' },
        { name: 'Client Training', status: 'in-progress', date: '2024-01-23' },
        { name: 'Production Launch', status: 'pending', date: '2024-01-25' }
      ],
      recentActivity: [
        { type: 'milestone', user: 'John Williams', message: 'All tests passing - ready to deploy', time: '15m ago' },
        { type: 'comment', user: 'Client', message: 'Training session went great!', time: '2h ago' },
        { type: 'success', user: 'Amy Thompson', message: 'Documentation completed', time: '4h ago' }
      ],
      tags: ['Integration', 'API', 'B2B'],
      predictedCompletion: 'Jan 24 (1 day early)',
      confidence: 97
    },
    {
      id: 5,
      name: 'Healthcare Portal',
      client: 'MediCare Solutions',
      clientLogo: 'MS',
      status: 'Planning',
      statusType: 'neutral',
      progress: 12,
      velocity: 0,
      health: 'excellent',
      aiScore: 88,
      aiInsight: 'Strong start. Requirements gathering ahead of schedule.',
      dueDate: '2024-04-30',
      daysLeft: 99,
      startDate: '2024-01-15',
      priority: 'medium',
      team: [
        { name: 'Sarah Chen', role: 'Lead Dev', avatar: 'SC', status: 'assigned' },
        { name: 'Tom Wilson', role: 'Backend', avatar: 'TW', status: 'assigned' },
        { name: 'Jenny Liu', role: 'Designer', avatar: 'JL', status: 'assigned' }
      ],
      revenue: 85000,
      budget: 90000,
      spent: 8500,
      profitability: 35,
      blockers: [],
      risks: [
        'HIPAA compliance requirements',
        'Complex regulatory environment',
        'Multiple stakeholder alignment needed'
      ],
      opportunities: [
        'Long-term partnership potential',
        'Multiple facility rollout: +$250K',
        'Recurring maintenance revenue'
      ],
      techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'HIPAA Compliant'],
      metrics: {
        commits: 23,
        prs: 4,
        bugs: 0,
        tests: 18,
        coverage: 92,
        uptime: 100
      },
      milestones: [
        { name: 'Requirements Gathering', status: 'in-progress', date: '2024-01-30' },
        { name: 'Architecture Design', status: 'pending', date: '2024-02-15' },
        { name: 'Security & Compliance', status: 'pending', date: '2024-03-01' },
        { name: 'Core Development', status: 'pending', date: '2024-03-30' },
        { name: 'Testing & Certification', status: 'pending', date: '2024-04-20' },
        { name: 'Launch', status: 'pending', date: '2024-04-30' }
      ],
      recentActivity: [
        { type: 'meeting', user: 'Sarah Chen', message: 'Kickoff meeting completed', time: '2d ago' },
        { type: 'comment', user: 'Client', message: 'Excited to get started!', time: '3d ago' }
      ],
      tags: ['Healthcare', 'Compliance', 'Enterprise'],
      predictedCompletion: 'Apr 28 (2 days early)',
      confidence: 88
    },
    {
      id: 6,
      name: 'Inventory Management System',
      client: 'RetailMax',
      clientLogo: 'RM',
      status: 'Development',
      statusType: 'active',
      progress: 58,
      velocity: 10,
      health: 'on-track',
      aiScore: 85,
      aiInsight: 'Steady progress. Consider upselling mobile app companion.',
      dueDate: '2024-02-20',
      daysLeft: 30,
      startDate: '2023-11-20',
      priority: 'medium',
      team: [
        { name: 'David Park', role: 'Lead Dev', avatar: 'DP', status: 'active' },
        { name: 'Chris Anderson', role: 'Backend', avatar: 'CA', status: 'active' },
        { name: 'Emma Davis', role: 'Frontend', avatar: 'ED', status: 'active' }
      ],
      revenue: 42000,
      budget: 45000,
      spent: 26100,
      profitability: 24,
      blockers: [],
      risks: [
        'Legacy system integration complexity',
        'Data migration challenges'
      ],
      opportunities: [
        'Mobile app upsell: +$35K',
        'Multi-location expansion: +$60K',
        'Analytics module: +$18K'
      ],
      techStack: ['Vue.js', 'Python', 'MySQL', 'Redis', 'Docker'],
      metrics: {
        commits: 198,
        prs: 31,
        bugs: 2,
        tests: 167,
        coverage: 86,
        uptime: 99.5
      },
      milestones: [
        { name: 'Planning & Design', status: 'completed', date: '2023-12-05' },
        { name: 'Core Modules', status: 'completed', date: '2023-12-30' },
        { name: 'Inventory Features', status: 'in-progress', date: '2024-01-25' },
        { name: 'Reporting Dashboard', status: 'in-progress', date: '2024-02-10' },
        { name: 'Testing & Training', status: 'pending', date: '2024-02-18' },
        { name: 'Launch', status: 'pending', date: '2024-02-20' }
      ],
      recentActivity: [
        { type: 'commit', user: 'David Park', message: 'Barcode scanning implemented', time: '3h ago' },
        { type: 'success', user: 'Emma Davis', message: 'UI components finalized', time: '6h ago' }
      ],
      tags: ['Retail', 'Inventory', 'B2B'],
      predictedCompletion: 'Feb 20 (on time)',
      confidence: 89
    }
  ];

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['Development', 'Testing', 'Planning'].includes(p.status);
    if (filter === 'blocked') return p.statusType === 'danger';
    if (filter === 'completed') return p.statusType === 'success';
    return true;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'health') return b.aiScore - a.aiScore;
    if (sortBy === 'deadline') return a.daysLeft - b.daysLeft;
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    return 0;
  });

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'emerald';
    if (score >= 75) return 'blue';
    if (score >= 60) return 'amber';
    return 'red';
  };

  const HealthScore = ({ score }: { score: number }) => {
    const color = getHealthColor(score);
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-14 h-14">
          <svg className="transform -rotate-90 w-14 h-14">
            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-800" />
            <circle 
              cx="28" 
              cy="28" 
              r="24" 
              stroke="currentColor" 
              strokeWidth="3" 
              fill="none" 
              className={`text-${color}-400`}
              strokeDasharray={`${score * 1.507} 150.7`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{score}</span>
        </div>
        <div>
          <div className={`text-sm font-semibold text-${color}-400`}>
            {score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : 'Poor'}
          </div>
          <div className="text-xs text-gray-500">AI Health</div>
        </div>
      </div>
    );
  };

  const ProjectCard = ({ project }: { project: typeof projects[0] }) => {
    const healthColor = getHealthColor(project.aiScore);
    
    return (
      <div className="group bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 rounded-2xl p-6 transition-all cursor-pointer"
        onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
              {project.clientLogo}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400">{project.client}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="More options">
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Status & Health */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 text-xs rounded-full border font-semibold ${
            project.statusType === 'danger' ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' :
            project.statusType === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
            project.statusType === 'active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
            project.statusType === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
            'bg-gray-500/10 text-gray-400 border-gray-500/30'
          }`}>
            {project.status}
          </span>
          <HealthScore score={project.aiScore} />
        </div>

        {/* AI Insight */}
        <div className={`mb-4 p-3 rounded-xl border ${
          project.aiScore >= 90 ? 'bg-emerald-500/5 border-emerald-500/20' :
          project.aiScore >= 75 ? 'bg-blue-500/5 border-blue-500/20' :
          'bg-amber-500/5 border-amber-500/20'
        }`}>
          <div className="flex items-start gap-2">
            <Brain className={`w-4 h-4 mt-0.5 flex-shrink-0 text-${healthColor}-400`} />
            <p className="text-sm text-gray-300">{project.aiInsight}</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-bold text-emerald-400">${(project.revenue / 1000).toFixed(0)}K</div>
            <div className="text-xs text-gray-400">Revenue</div>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-bold text-white">{project.progress}%</div>
            <div className="text-xs text-gray-400">Complete</div>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{project.daysLeft}d</div>
            <div className="text-xs text-gray-400">Remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <div className={`flex items-center gap-1 text-xs font-semibold ${
              project.velocity > 0 ? 'text-emerald-400' : project.velocity < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {project.velocity > 0 && <ArrowUp className="w-3 h-3" />}
              {project.velocity < 0 && <ArrowDown className="w-3 h-3" />}
              {project.velocity !== 0 && `${Math.abs(project.velocity)}% velocity`}
            </div>
          </div>
          <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                project.aiScore >= 90 ? 'from-emerald-500 to-blue-500' :
                project.aiScore >= 75 ? 'from-blue-500 to-cyan-500' :
                'from-amber-500 to-orange-500'
              }`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Team */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex -space-x-2">
            {project.team.slice(0, 4).map((member, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-xs font-bold border-2 border-gray-900 text-white"
                title={`${member.name} - ${member.role}`}
              >
                {member.avatar}
              </div>
            ))}
            {project.team.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-semibold border-2 border-gray-900">
                +{project.team.length - 4}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400">
            {project.team.length} members
          </div>
        </div>

        {/* Blockers */}
        {project.blockers.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-400">{project.blockers.length} Blocker{project.blockers.length > 1 ? 's' : ''}</span>
            </div>
            {project.blockers.slice(0, 1).map((blocker, i) => (
              <p key={i} className="text-sm text-gray-300">• {blocker.message}</p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-all">
            View Details
          </button>
          <button title="Send a message" className="py-2.5 px-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-all">
            <MessageSquare className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {project.tags.map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-gray-700/30 text-gray-300 text-xs rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white p-8 space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-purple-900/20 border border-emerald-500/20 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent mb-2">
                Project Command Center
              </h1>
              <p className="text-gray-400 text-lg">
                AI-powered project intelligence & real-time monitoring
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-semibold shadow-lg shadow-emerald-500/20">
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Rocket className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{projects.length}</div>
                  <div className="text-xs text-gray-400">Total Projects</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {projects.filter(p => ['Development', 'Testing', 'Planning'].includes(p.status)).length}
                  </div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {projects.filter(p => p.blockers.length > 0).length}
                  </div>
                  <div className="text-xs text-gray-400">Blocked</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${(projects.reduce((sum, p) => sum + p.revenue, 0) / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-400">Total Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'active'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('blocked')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'blocked'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Blocked
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'completed'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Ready to Deploy
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          
          <select
            title="Sort projects"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="health">Sort by Health</option>
            <option value="deadline">Sort by Deadline</option>
            <option value="revenue">Sort by Revenue</option>
          </select>

          <button title="Filter options" className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
            <Filter className="w-5 h-5 text-gray-400" />
          </button>
          
          <button title="Filter options" className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
            <Download className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Detailed Project View Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}>
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-900/90 border border-gray-800 rounded-3xl"
            onClick={(e) => e.stopPropagation()}>
            {(() => {
              const project = projects.find(p => p.id === selectedProject);
              if (!project) return null;
              const healthColor = getHealthColor(project.aiScore);

              return (
                <div className="p-8">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                        {project.clientLogo}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">{project.name}</h2>
                        <p className="text-gray-400">{project.client}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <span className="text-2xl text-gray-400">×</span>
                    </button>
                  </div>

                  {/* AI Health & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className={`p-6 rounded-2xl border bg-gradient-to-br ${
                      project.aiScore >= 90 ? 'from-emerald-900/20 to-emerald-900/5 border-emerald-500/30' :
                      project.aiScore >= 75 ? 'from-blue-900/20 to-blue-900/5 border-blue-500/30' :
                      'from-amber-900/20 to-amber-900/5 border-amber-500/30'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">AI Health Score</h3>
                        <Brain className={`w-6 h-6 text-${healthColor}-400`} />
                      </div>
                      <HealthScore score={project.aiScore} />
                      <p className="text-sm text-gray-300 mt-4">{project.aiInsight}</p>
                    </div>

                    <div className="p-6 rounded-2xl border bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Progress</h3>
                        <Activity className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">{project.progress}%</div>
                      <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r from-${healthColor}-500 to-${healthColor}-400`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${
                        project.velocity > 0 ? 'text-emerald-400' : project.velocity < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {project.velocity > 0 && <ArrowUp className="w-4 h-4" />}
                        {project.velocity < 0 && <ArrowDown className="w-4 h-4" />}
                        <span>{project.velocity !== 0 ? `${Math.abs(project.velocity)}% velocity` : 'Stable'}</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Timeline</h3>
                        <Clock className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">{project.daysLeft}d</div>
                      <div className="text-sm text-gray-400 mb-4">Days remaining</div>
                      <div className="text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400">Due date:</span>
                          <span className="text-white font-semibold">{project.dueDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Predicted:</span>
                          <span className={project.predictedCompletion.includes('early') ? 'text-emerald-400' : project.predictedCompletion.includes('late') ? 'text-red-400' : 'text-blue-400'}>
                            {project.predictedCompletion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-gray-800/30 rounded-xl">
                      <div className="text-sm text-gray-400 mb-1">Revenue</div>
                      <div className="text-2xl font-bold text-emerald-400">${(project.revenue / 1000).toFixed(0)}K</div>
                    </div>
                    <div className="p-4 bg-gray-800/30 rounded-xl">
                      <div className="text-sm text-gray-400 mb-1">Budget</div>
                      <div className="text-2xl font-bold text-white">${(project.budget / 1000).toFixed(0)}K</div>
                    </div>
                    <div className="p-4 bg-gray-800/30 rounded-xl">
                      <div className="text-sm text-gray-400 mb-1">Spent</div>
                      <div className="text-2xl font-bold text-blue-400">${(project.spent / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="p-4 bg-gray-800/30 rounded-xl">
                      <div className="text-sm text-gray-400 mb-1">Margin</div>
                      <div className="text-2xl font-bold text-purple-400">{project.profitability}%</div>
                    </div>
                  </div>

                  {/* Blockers, Risks, Opportunities */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {project.blockers.length > 0 && (
                      <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <h3 className="font-semibold text-red-400">Blockers</h3>
                        </div>
                        <div className="space-y-2">
                          {project.blockers.map((blocker, i) => (
                            <div key={i} className="text-sm text-gray-300">
                              • {blocker.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-amber-400" />
                        <h3 className="font-semibold text-amber-400">Risks</h3>
                      </div>
                      <div className="space-y-2">
                        {project.risks.map((risk, i) => (
                          <div key={i} className="text-sm text-gray-300">
                            • {risk}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-semibold text-emerald-400">Opportunities</h3>
                      </div>
                      <div className="space-y-2">
                        {project.opportunities.map((opp, i) => (
                          <div key={i} className="text-sm text-gray-300">
                            • {opp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack & Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-gray-800/30 rounded-xl">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-blue-400" />
                        Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech, i) => (
                          <span key={i} className="px-3 py-1.5 bg-gray-700/50 text-gray-300 text-sm rounded-lg font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gray-800/30 rounded-xl">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        Code Metrics
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-white">{project.metrics.commits}</div>
                          <div className="text-xs text-gray-400">Commits</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{project.metrics.prs}</div>
                          <div className="text-xs text-gray-400">PRs</div>
                        </div>
                        <div>
                          <div className={`text-2xl font-bold ${project.metrics.bugs === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {project.metrics.bugs}
                          </div>
                          <div className="text-xs text-gray-400">Bugs</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{project.metrics.tests}</div>
                          <div className="text-xs text-gray-400">Tests</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-emerald-400">{project.metrics.coverage}%</div>
                          <div className="text-xs text-gray-400">Coverage</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-400">{project.metrics.uptime}%</div>
                          <div className="text-xs text-gray-400">Uptime</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="p-6 bg-gray-800/30 rounded-xl mb-8">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      Team Members
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {project.team.map((member, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                            {member.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{member.name}</div>
                            <div className="text-xs text-gray-400">{member.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestones Timeline */}
                  <div className="p-6 bg-gray-800/30 rounded-xl mb-8">
                    <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Project Milestones
                    </h3>
                    <div className="space-y-4">
                      {project.milestones.map((milestone, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            milestone.status === 'completed' ? 'bg-emerald-500' :
                            milestone.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                            'bg-gray-700'
                          }`}>
                            {milestone.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-white" />}
                            {milestone.status === 'in-progress' && <Activity className="w-5 h-5 text-white" />}
                            {milestone.status === 'pending' && <Circle className="w-5 h-5 text-gray-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-white">{milestone.name}</h4>
                              <span className="text-sm text-gray-400">{milestone.date}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              milestone.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                              milestone.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1).replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button className="flex-1 py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all">
                      Open Project Dashboard
                    </button>
                    <button className="flex-1 py-4 px-6 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-semibold transition-all">
                      Contact Client
                    </button>
                    <button title="Settings" className="py-4 px-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all">
                      <Settings className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;