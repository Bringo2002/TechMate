import React, { useState, useEffect, useRef } from 'react';
import {
  Rocket, GitBranch, CheckCircle2, XCircle, AlertTriangle, Clock,
  Server, Database, Cloud, Cpu, Zap, Target, TrendingUp, TrendingDown,
  Activity, BarChart3, LineChart, PieChart, Settings, Bell, Download,
  Play, Pause, RotateCcw, FastForward, Eye, Code, Package, Shield,
  Globe, Layers, Terminal, Workflow, Box, Upload, ChevronRight,
  ChevronDown, ArrowUpRight, Sparkles, Brain, AlertCircle, Users,
  FileText, MessageSquare, ExternalLink, Lock, Unlock, RefreshCw,
  TrendingUpDown, Gauge, HardDrive, Wifi, WifiOff, CircleDot,
  Hash, GitCommit, GitMerge, GitPullRequest, Container, Flame,
  Hexagon, CircleSlash, PlayCircle, StopCircle, Timer, Fingerprint
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DeploymentMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  icon: any;
  color: string;
  subtitle?: string;
}

interface Environment {
  id: string;
  name: string;
  type: 'production' | 'staging' | 'development' | 'preview';
  status: 'healthy' | 'degraded' | 'down' | 'deploying';
  version: string;
  lastDeployed: string;
  uptime: number;
  responseTime: number;
  errorRate: number;
  traffic: number;
  instances: number;
  region: string;
  url: string;
}

interface Deployment {
  id: string;
  project: string;
  environment: string;
  status: 'pending' | 'building' | 'testing' | 'deploying' | 'success' | 'failed' | 'rolled-back';
  progress: number;
  startTime: string;
  duration?: number;
  triggeredBy: string;
  branch: string;
  commit: string;
  commitMessage: string;
  buildNumber: number;
  stage: 'queue' | 'clone' | 'build' | 'test' | 'deploy' | 'verify' | 'complete';
  stages: StageStatus[];
  metrics?: {
    buildTime: number;
    testsPassed: number;
    testsTotal: number;
    coverage: number;
    bundleSize: number;
  };
  lighthouse?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

interface StageStatus {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: number;
  logs?: string[];
}

interface PipelineStage {
  id: string;
  name: string;
  icon: any;
  status: 'idle' | 'active' | 'success' | 'failed';
  duration: number;
  progress: number;
}

interface AIInsight {
  id: string;
  type: 'prediction' | 'optimization' | 'alert' | 'recommendation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  action?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Deployments() {
  // State Management
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('production');
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'pipeline'>('grid');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [animateIn, setAnimateIn] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 50);
  }, []);

  // Animated Pipeline Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    let animationId: number;
    let time = 0;

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

      time += 0.01;

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.005;

        if (p.x < 0 || p.x > canvas.width / 2) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height / 2) p.vy *= -1;

        // Draw connections
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

        // Draw particle
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
  // MOCK DATA
  // ============================================================================

  const metrics: DeploymentMetric[] = [
    {
      label: 'Deploy Frequency',
      value: '24/day',
      change: 18.5,
      trend: 'up',
      status: 'excellent',
      icon: Rocket,
      color: 'cyan',
      subtitle: '12% increase this week'
    },
    {
      label: 'Success Rate',
      value: '98.6%',
      change: 2.3,
      trend: 'up',
      status: 'excellent',
      icon: CheckCircle2,
      color: 'emerald',
      subtitle: '342 of 347 deployments'
    },
    {
      label: 'Lead Time',
      value: '12.4m',
      change: -15.2,
      trend: 'down',
      status: 'good',
      icon: Timer,
      color: 'blue',
      subtitle: '15% faster than last month'
    },
    {
      label: 'MTTR',
      value: '8.2m',
      change: -22.4,
      trend: 'down',
      status: 'excellent',
      icon: RefreshCw,
      color: 'purple',
      subtitle: 'Mean Time To Recovery'
    },
    {
      label: 'Active Instances',
      value: '156',
      change: 12.0,
      trend: 'up',
      status: 'good',
      icon: Server,
      color: 'amber',
      subtitle: 'Across 4 regions'
    },
    {
      label: 'Infrastructure Cost',
      value: '$1.2K',
      change: -8.5,
      trend: 'down',
      status: 'excellent',
      icon: TrendingDown,
      color: 'pink',
      subtitle: 'Daily average'
    }
  ];

  const environments: Environment[] = [
    {
      id: 'prod',
      name: 'Production',
      type: 'production',
      status: 'healthy',
      version: 'v2.4.1',
      lastDeployed: '2 hours ago',
      uptime: 99.98,
      responseTime: 142,
      errorRate: 0.02,
      traffic: 45230,
      instances: 12,
      region: 'us-east-1',
      url: 'https://app.nyxdev.com'
    },
    {
      id: 'staging',
      name: 'Staging',
      type: 'staging',
      status: 'deploying',
      version: 'v2.5.0-rc.1',
      lastDeployed: '15 minutes ago',
      uptime: 99.85,
      responseTime: 156,
      errorRate: 0.05,
      traffic: 1250,
      instances: 3,
      region: 'us-west-2',
      url: 'https://staging.nyxdev.com'
    },
    {
      id: 'dev',
      name: 'Development',
      type: 'development',
      status: 'healthy',
      version: 'v2.5.0-beta.3',
      lastDeployed: '1 hour ago',
      uptime: 98.42,
      responseTime: 189,
      errorRate: 0.12,
      traffic: 420,
      instances: 2,
      region: 'us-east-2',
      url: 'https://dev.nyxdev.com'
    },
    {
      id: 'preview',
      name: 'Preview',
      type: 'preview',
      status: 'healthy',
      version: 'pr-245',
      lastDeployed: '30 minutes ago',
      uptime: 100,
      responseTime: 165,
      errorRate: 0.00,
      traffic: 85,
      instances: 1,
      region: 'us-east-1',
      url: 'https://pr-245.nyxdev.com'
    }
  ];

  const recentDeployments: Deployment[] = [
    {
      id: 'DEP-1847',
      project: 'E-Commerce Platform',
      environment: 'Production',
      status: 'success',
      progress: 100,
      startTime: '2 hours ago',
      duration: 342,
      triggeredBy: 'Sarah Chen',
      branch: 'main',
      commit: 'a3f9c82',
      commitMessage: 'feat: Add payment gateway integration',
      buildNumber: 1847,
      stage: 'complete',
      stages: [
        { name: 'Clone', status: 'success', duration: 12 },
        { name: 'Install', status: 'success', duration: 45 },
        { name: 'Build', status: 'success', duration: 156 },
        { name: 'Test', status: 'success', duration: 89 },
        { name: 'Deploy', status: 'success', duration: 28 },
        { name: 'Verify', status: 'success', duration: 12 }
      ],
      metrics: {
        buildTime: 156,
        testsPassed: 342,
        testsTotal: 342,
        coverage: 94.2,
        bundleSize: 2.4
      },
      lighthouse: {
        performance: 96,
        accessibility: 98,
        bestPractices: 100,
        seo: 100
      }
    },
    {
      id: 'DEP-1846',
      project: 'Mobile App Backend',
      environment: 'Staging',
      status: 'deploying',
      progress: 67,
      startTime: '15 minutes ago',
      triggeredBy: 'Alex Kim',
      branch: 'release/v2.5',
      commit: 'b7e4d91',
      commitMessage: 'chore: Update dependencies and security patches',
      buildNumber: 1846,
      stage: 'test',
      stages: [
        { name: 'Clone', status: 'success', duration: 10 },
        { name: 'Install', status: 'success', duration: 38 },
        { name: 'Build', status: 'success', duration: 142 },
        { name: 'Test', status: 'running', duration: 45 },
        { name: 'Deploy', status: 'pending' },
        { name: 'Verify', status: 'pending' }
      ],
      metrics: {
        buildTime: 142,
        testsPassed: 256,
        testsTotal: 318,
        coverage: 91.5,
        bundleSize: 3.1
      }
    },
    {
      id: 'DEP-1845',
      project: 'Analytics Dashboard',
      environment: 'Production',
      status: 'failed',
      progress: 45,
      startTime: '4 hours ago',
      duration: 189,
      triggeredBy: 'David Park',
      branch: 'hotfix/chart-rendering',
      commit: '9c2f1a5',
      commitMessage: 'fix: Resolve chart rendering issue in Safari',
      buildNumber: 1845,
      stage: 'test',
      stages: [
        { name: 'Clone', status: 'success', duration: 11 },
        { name: 'Install', status: 'success', duration: 42 },
        { name: 'Build', status: 'success', duration: 134 },
        { name: 'Test', status: 'failed', duration: 78 },
        { name: 'Deploy', status: 'skipped' },
        { name: 'Verify', status: 'skipped' }
      ],
      metrics: {
        buildTime: 134,
        testsPassed: 289,
        testsTotal: 312,
        coverage: 88.7,
        bundleSize: 2.8
      }
    },
    {
      id: 'DEP-1844',
      project: 'Customer Portal',
      environment: 'Preview',
      status: 'success',
      progress: 100,
      startTime: '30 minutes ago',
      duration: 298,
      triggeredBy: 'Lisa Wang',
      branch: 'feature/new-dashboard',
      commit: 'e8a6b43',
      commitMessage: 'feat: Implement new customer dashboard UI',
      buildNumber: 1844,
      stage: 'complete',
      stages: [
        { name: 'Clone', status: 'success', duration: 9 },
        { name: 'Install', status: 'success', duration: 41 },
        { name: 'Build', status: 'success', duration: 168 },
        { name: 'Test', status: 'success', duration: 56 },
        { name: 'Deploy', status: 'success', duration: 18 },
        { name: 'Verify', status: 'success', duration: 6 }
      ],
      metrics: {
        buildTime: 168,
        testsPassed: 198,
        testsTotal: 198,
        coverage: 96.1,
        bundleSize: 2.1
      }
    }
  ];

  const aiInsights: AIInsight[] = [
    {
      id: 'AI-001',
      type: 'prediction',
      priority: 'high',
      title: 'Deployment Success Probability: 94%',
      description: 'Current deployment to Production has high confidence of success based on test results and historical patterns.',
      impact: 'Expected completion in 4-6 minutes',
      confidence: 94,
      action: 'Monitor progress'
    },
    {
      id: 'AI-002',
      type: 'optimization',
      priority: 'medium',
      title: 'Build Time Optimization Available',
      description: 'Detected redundant dependency installations. Implementing caching could reduce build time by ~28%.',
      impact: 'Save ~45 seconds per deployment',
      confidence: 87,
      action: 'Apply optimization'
    },
    {
      id: 'AI-003',
      type: 'alert',
      priority: 'critical',
      title: 'Elevated Error Rate in Production',
      description: 'Error rate increased from 0.02% to 0.08% in the last 30 minutes. Spike correlates with recent deployment.',
      impact: 'Affecting ~360 users/hour',
      confidence: 96,
      action: 'Investigate or rollback'
    },
    {
      id: 'AI-004',
      type: 'recommendation',
      priority: 'medium',
      title: 'Optimal Deployment Window Detected',
      description: 'Traffic analysis suggests deploying between 2-4 AM EST would minimize user impact by 78%.',
      impact: 'Reduce affected users from 8K to 1.8K',
      confidence: 91,
      action: 'Schedule deployment'
    }
  ];

  const pipelineStages: PipelineStage[] = [
    { id: 'clone', name: 'Clone Repo', icon: GitBranch, status: 'success', duration: 12, progress: 100 },
    { id: 'install', name: 'Install Deps', icon: Package, status: 'success', duration: 45, progress: 100 },
    { id: 'build', name: 'Build', icon: Box, status: 'success', duration: 156, progress: 100 },
    { id: 'test', name: 'Run Tests', icon: CheckCircle2, status: 'active', duration: 45, progress: 67 },
    { id: 'deploy', name: 'Deploy', icon: Rocket, status: 'idle', duration: 0, progress: 0 },
    { id: 'verify', name: 'Verify', icon: Shield, status: 'idle', duration: 0, progress: 0 }
  ];

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
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
      }
    };
    return colors[color] || colors.cyan;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      success: { label: 'Success', color: 'emerald', icon: CheckCircle2 },
      failed: { label: 'Failed', color: 'red', icon: XCircle },
      deploying: { label: 'Deploying', color: 'cyan', icon: Rocket },
      pending: { label: 'Pending', color: 'amber', icon: Clock },
      'rolled-back': { label: 'Rolled Back', color: 'purple', icon: RotateCcw }
    };
    return configs[status] || configs.pending;
  };

  const getEnvironmentStatus = (status: string) => {
    const configs: Record<string, any> = {
      healthy: { label: 'Healthy', color: 'emerald', icon: CheckCircle2 },
      degraded: { label: 'Degraded', color: 'amber', icon: AlertTriangle },
      down: { label: 'Down', color: 'red', icon: XCircle },
      deploying: { label: 'Deploying', color: 'cyan', icon: Rocket }
    };
    return configs[status] || configs.healthy;
  };

  const getStageStatus = (status: string) => {
    const configs: Record<string, any> = {
      success: { color: 'emerald', icon: CheckCircle2 },
      running: { color: 'cyan', icon: Loader },
      failed: { color: 'red', icon: XCircle },
      pending: { color: 'amber', icon: Clock },
      skipped: { color: 'gray', icon: CircleSlash }
    };
    return configs[status] || configs.pending;
  };

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
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(to right, #06b6d4 1px, transparent 1px),
            linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '15s', animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 max-w-[2000px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* ================================================================ */}
        {/* HEADER SECTION */}
        {/* ================================================================ */}
        <header className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all"></div>
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
                  Real-time CI/CD pipeline monitoring & orchestration
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
              <span className="text-slate-400 font-medium">24 Deploys Today</span>
              <div className="h-5 w-px bg-slate-700"></div>
              <span className="text-emerald-400 font-bold">98.6% Success</span>
              <div className="h-5 w-px bg-slate-700"></div>
              <span className="text-slate-400">12.4m Lead Time</span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
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

            {/* Auto Refresh */}
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

            {/* Deploy Button */}
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
        <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                  <Brain className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Deployment Intelligence</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Predictive analytics & real-time optimization</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {aiInsights.map((insight, idx) => {
                const typeConfig: Record<string, any> = {
                  prediction: { icon: TrendingUp, color: 'cyan' },
                  optimization: { icon: Zap, color: 'purple' },
                  alert: { icon: AlertTriangle, color: 'red' },
                  recommendation: { icon: Sparkles, color: 'emerald' }
                };
                const config = typeConfig[insight.type];
                const colors = getColorClasses(config.color);
                const Icon = config.icon;

                return (
                  <div
                    key={insight.id}
                    className="group p-5 bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all cursor-pointer relative overflow-hidden"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Priority Indicator */}
                    <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>

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
                        {insight.action && (
                          <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                            {insight.action}
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

        {/* ================================================================ */}
        {/* DORA METRICS */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((metric, idx) => {
            const colors = getColorClasses(metric.color);
            const Icon = metric.icon;
            const isPositive = metric.trend === 'up' ? (metric.change || 0) > 0 : (metric.change || 0) < 0;

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
                    {metric.change !== undefined && (
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'} border text-xs font-bold`}>
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(metric.change).toFixed(1)}%</span>
                      </div>
                    )}
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
                  <p className="text-sm text-slate-400 mt-1.5">Current deployment: DEP-1846 • Mobile App Backend</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-cyan-400">67% Complete</span>
                  <button title="View Details" className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                    <Eye className="w-5 h-5 text-slate-400 hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Pipeline Stages */}
              <div className="relative">
                {/* Connection Line */}
                <div className="absolute top-12 left-0 right-0 h-1 bg-slate-800 rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '67%' }}></div>
                </div>

                <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {pipelineStages.map((stage, idx) => {
                    const colors = getColorClasses(
                      stage.status === 'success' ? 'emerald' :
                      stage.status === 'active' ? 'cyan' :
                      stage.status === 'failed' ? 'red' : 'amber'
                    );
                    const Icon = stage.icon;

                    return (
                      <div key={stage.id} className="relative flex flex-col items-center">
                        {/* Stage Node */}
                        <div className={`relative w-24 h-24 rounded-2xl ${colors.bgLight} border-2 ${colors.border} flex items-center justify-center transition-all duration-500 hover:scale-110 cursor-pointer group/stage ${
                          stage.status === 'active' ? 'animate-pulse' : ''
                        }`}>
                          <Icon className={`w-8 h-8 ${colors.text}`} />
                          {stage.status === 'active' && (
                            <div className={`absolute inset-0 ${colors.bg} opacity-20 rounded-2xl blur-xl animate-pulse`}></div>
                          )}
                          {/* Progress Ring for Active */}
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
                          {/* Status Badge */}
                          {stage.status === 'success' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Stage Info */}
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
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Elapsed Time</div>
                  <div className="text-2xl font-bold text-white">2m 38s</div>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Est. Remaining</div>
                  <div className="text-2xl font-bold text-cyan-400">1m 22s</div>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Tests Passed</div>
                  <div className="text-2xl font-bold text-emerald-400">256/318</div>
                </div>
              </div>
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
                      {recentDeployments.filter(d => filterStatus === 'all' || d.status === filterStatus).length} deployments
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Filter */}
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
                {recentDeployments
                  .filter(d => filterStatus === 'all' || d.status === filterStatus)
                  .map((deployment) => {
                    const statusConfig = getStatusConfig(deployment.status);
                    const StatusIcon = statusConfig.icon;
                    const colors = getColorClasses(statusConfig.color);
                    const isExpanded = selectedDeployment === deployment.id;

                    return (
                      <div key={deployment.id} className="group transition-all duration-300 hover:bg-slate-800/30">
                        {/* Deployment Card */}
                        <div
                          onClick={() => setSelectedDeployment(isExpanded ? null : deployment.id)}
                          className="flex items-center justify-between p-6 cursor-pointer"
                        >
                          <div className="flex items-center gap-6 flex-1">
                            {/* Status Icon */}
                            <div className={`relative p-4 ${colors.bgLight} rounded-xl border ${colors.border} transition-all duration-300 group-hover:scale-110`}>
                              <StatusIcon className={`w-6 h-6 ${colors.text} ${deployment.status === 'deploying' ? 'animate-pulse' : ''}`} />
                              {deployment.status === 'deploying' && (
                                <div className={`absolute inset-0 ${colors.bg} opacity-20 rounded-xl blur-lg animate-pulse`}></div>
                              )}
                            </div>

                            {/* Deployment Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-white font-bold text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-blue-300 transition-all">
                                  {deployment.project}
                                </span>
                                <span className="text-[10px] px-2 py-1 rounded-md bg-slate-800/60 text-slate-400 font-mono border border-slate-700/50">
                                  {deployment.id}
                                </span>
                                <span className={`text-xs px-2.5 py-1 rounded-lg ${colors.bgLight} ${colors.text} border ${colors.border} font-bold uppercase tracking-wider`}>
                                  {statusConfig.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-slate-400 font-medium flex-wrap">
                                <span className="flex items-center gap-1.5">
                                  <Server className="w-3.5 h-3.5" />
                                  {deployment.environment}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="flex items-center gap-1.5">
                                  <GitBranch className="w-3.5 h-3.5" />
                                  {deployment.branch}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="flex items-center gap-1.5">
                                  <GitCommit className="w-3.5 h-3.5" />
                                  {deployment.commit}
                                </span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  <Users className="w-3.5 h-3.5" />
                                  {deployment.triggeredBy}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 italic">
                                {deployment.commitMessage}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            {/* Progress */}
                            {deployment.status === 'deploying' && (
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

                            {/* Duration */}
                            <div className="hidden lg:block text-right min-w-[80px]">
                              <div className="text-xs text-slate-400 mb-1">Duration</div>
                              <div className="text-sm font-bold text-white">
                                {deployment.duration ? `${Math.floor(deployment.duration / 60)}m ${deployment.duration % 60}s` : deployment.startTime}
                              </div>
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
                              
                              {/* Pipeline Stages */}
                              <div className="lg:col-span-2">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Pipeline Stages</h4>
                                <div className="space-y-3">
                                  {deployment.stages.map((stage, idx) => {
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
                                          {stage.duration && (
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
                                {/* Build Metrics */}
                                {deployment.metrics && (
                                  <div className="p-5 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Build Metrics</h4>
                                    <div className="space-y-3">
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="text-slate-400">Build Time</span>
                                          <span className="text-white font-bold">{deployment.metrics.buildTime}s</span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="text-slate-400">Tests</span>
                                          <span className="text-emerald-400 font-bold">
                                            {deployment.metrics.testsPassed}/{deployment.metrics.testsTotal}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="text-slate-400">Coverage</span>
                                          <span className="text-cyan-400 font-bold">{deployment.metrics.coverage}%</span>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="text-slate-400">Bundle Size</span>
                                          <span className="text-white font-bold">{deployment.metrics.bundleSize}MB</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Lighthouse Scores */}
                                {deployment.lighthouse && (
                                  <div className="p-5 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Lighthouse</h4>
                                    <div className="space-y-3">
                                      {Object.entries(deployment.lighthouse).map(([key, value]) => (
                                        <div key={key}>
                                          <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className={`font-bold ${value >= 90 ? 'text-emerald-400' : value >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                                              {value}
                                            </span>
                                          </div>
                                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full rounded-full ${value >= 90 ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                              style={{ width: `${value}%` }}
                                            />
                                          </div>
                                        </div>
                                      ))}
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
                                    <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 text-white border border-slate-700/50 hover:border-slate-600 rounded-xl text-sm font-semibold transition-all">
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
                  <p className="text-sm text-slate-400 mt-1">Live status & metrics</p>
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
                              {env.version} • {env.region}
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
                          <div className="text-emerald-400 font-bold">{env.responseTime}ms</div>
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
                        <span className="text-slate-400">Last deploy: {env.lastDeployed}</span>
                        <button className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                          View
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DEPLOYMENT STATS */}
            <div className="grid grid-cols-1 gap-4">
              {/* Today's Deployments */}
              <div className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                      <Rocket className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Today</div>
                      <div className="text-2xl font-bold text-white mt-1">24</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">Deployments</div>
                    <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +18%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  21 success • 2 failed • 1 in progress
                </div>
              </div>

              {/* Infrastructure Cost */}
              <div className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <Cloud className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daily Cost</div>
                      <div className="text-2xl font-bold text-white mt-1">$1,247</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">vs Budget</div>
                    <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      -8.5%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  156 instances • 4 regions
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

// Loader component for running state
function Loader({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}