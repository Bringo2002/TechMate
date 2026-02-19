import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  Search, Plus, AlertTriangle, DollarSign, 
  Briefcase, Sparkles, Brain, Command, ChevronRight, 
  LayoutGrid, List, Users, Target, TrendingUp,
  ArrowUp, ArrowDown, Zap, CheckCircle2, XCircle,
  RefreshCw, BarChart3, MessageSquare, Send, X
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

// Add this constant at the top of your file
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || 'your-api-key-here';

interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  budget: number;
  status: 'planning' | 'active' | 'blocked' | 'ready';
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline:  string;
  description?:  string;
  created_at: string;
  user_id: string;
  progress?:  number;
  actual_cost?: number;
}

interface AIInsight {
  type: 'warning' | 'success' | 'info' | 'critical';
  message: string;
  action?: string;
}

const COLORS = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  blue: { bg: 'bg-blue-500/10', border:  'border-blue-500/20', text: 'text-blue-400' },
  red: { bg: 'bg-red-500/10', border:  'border-red-500/20', text: 'text-red-400' },
  purple: { bg: 'bg-purple-500/10', border:  'border-purple-500/20', text: 'text-purple-400' }
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiConversation, setAiConversation] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [sortBy, setSortBy] = useState<'deadline' | 'budget' | 'created' | 'priority'>('created');
  const searchRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if ((e.metaKey || e. ctrlKey) && e.key === 'i') {
        e.preventDefault();
        setShowAiPanel(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiConversation]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // FIX #3: Add projects dependency
  useEffect(() => {
    if (projects.length > 0 && aiInsights.length === 0) {
      generateRealAiInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects. length]); // Changed from [projects] to avoid infinite loop

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'E-commerce Platform Redesign',
          client: 'TechCorp Inc.',
          type: 'web',
          budget: 125000,
          status: 'active',
          priority: 'high',
          deadline: '2026-03-15',
          description: 'Complete overhaul of existing e-commerce platform with modern UI/UX',
          created_at: '2026-01-10T10:00:00Z',
          user_id: 'user1',
          progress: 45,
          actual_cost: 52000
        },
        {
          id: '2',
          name: 'Mobile Banking App',
          client: 'FinanceFlow',
          type: 'mobile',
          budget: 200000,
          status: 'active',
          priority: 'critical',
          deadline: '2026-02-28',
          description: 'iOS and Android banking application with biometric authentication',
          created_at: '2026-01-05T14:30:00Z',
          user_id: 'user1',
          progress: 65,
          actual_cost: 130000
        },
        {
          id: '3',
          name: 'Brand Identity System',
          client: 'StartupXYZ',
          type: 'design',
          budget: 45000,
          status: 'planning',
          priority: 'medium',
          deadline: '2026-04-01',
          description: 'Complete brand identity including logo, guidelines, and assets',
          created_at: '2026-01-12T09:15:00Z',
          user_id: 'user1',
          progress: 15,
          actual_cost: 8000
        },
        {
          id: '4',
          name: 'AI Chatbot Integration',
          client:  'CustomerCare Co.',
          type: 'web',
          budget: 75000,
          status: 'blocked',
          priority: 'high',
          deadline: '2026-01-20',
          description: 'Custom AI chatbot for customer support automation',
          created_at: '2025-12-20T16:45:00Z',
          user_id: 'user1',
          progress: 30,
          actual_cost: 35000
        },
        {
          id: '5',
          name: 'Marketing Campaign Dashboard',
          client: 'AdAgency Pro',
          type: 'web',
          budget: 60000,
          status: 'ready',
          priority: 'low',
          deadline: '2026-02-15',
          description: 'Analytics dashboard for tracking multi-channel campaigns',
          created_at: '2025-12-15T11:20:00Z',
          user_id: 'user1',
          progress: 95,
          actual_cost: 58000
        }
      ];
      
      setProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRealAiInsights = async () => {
    setIsAnalyzing(true);
    try {
      const projectsSummary = projects.map(p => ({
        name: p.name,
        status: p.status,
        priority: p.priority,
        budget: p.budget,
        deadline: p.deadline,
        progress: p.progress || 0
      }));

      // FIX #2: Add API key header
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY, // Added API key
          "anthropic-version": "2023-06-01" // Added version header
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a project management AI assistant. Analyze these projects and provide 4-5 actionable insights in JSON format. Each insight should have a "type" (warning, success, info, or critical), "message" (the insight text), and optionally an "action" (recommended action).

Projects data:
${JSON.stringify(projectsSummary, null, 2)}

Return ONLY a JSON array of insights, no other text.  Format: 
[{"type": "warning", "message":  ".. .", "action": "..."}, ...]`
          }]
        })
      });

      if (! response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.content && data.content[0]) {
        const textContent = data.content[0]. text;
        const cleanedContent = textContent.replace(/```json\n? |\n?```/g, '').trim();
        const insights = JSON.parse(cleanedContent);
        setAiInsights(insights);
      }
    } catch (error) {
      console.error('AI Insights Error:', error);
      generateFallbackInsights();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFallbackInsights = () => {
    const insights: AIInsight[] = [];
    const now = new Date();
    const overdueProjects = projects.filter(p => new Date(p.deadline) < now && p.status !== 'ready');
    const criticalProjects = projects.filter(p => p.priority === 'critical');
    const blockedProjects = projects.filter(p => p.status === 'blocked');
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalActualCost = projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0);
    
    if (overdueProjects.length > 0) {
      insights.push({
        type: 'critical',
        message: `${overdueProjects.length} project${overdueProjects.length > 1 ? 's are' : ' is'} overdue and requires immediate attention`,
        action: 'Review timeline and allocate additional resources'
      });
    }
    
    if (criticalProjects.length > 0) {
      insights.push({
        type: 'warning',
        message: `${criticalProjects.length} critical priority project${criticalProjects.length > 1 ? 's' : ''} in pipeline`,
        action: 'Ensure top developers are assigned'
      });
    }
    
    if (blockedProjects.length > 0) {
      insights.push({
        type: 'warning',
        message: `${blockedProjects.length} blocked project${blockedProjects.length > 1 ? 's need' : ' needs'} resolution to proceed`,
        action: 'Schedule stakeholder meeting to unblock'
      });
    }
    
    const budgetUtilization = totalBudget > 0 ?  (totalActualCost / totalBudget) * 100 : 0;
    if (budgetUtilization > 80) {
      insights.push({
        type: 'warning',
        message: `Budget utilization at ${budgetUtilization.toFixed(1)}% - approaching limit`,
        action: 'Review project budgets and negotiate extensions if needed'
      });
    } else {
      insights.push({
        type: 'success',
        message: `Healthy budget utilization at ${budgetUtilization.toFixed(1)}%`,
        action: 'Continue current spending trajectory'
      });
    }
    
    insights.push({
      type: 'info',
      message: `$${(totalBudget / 1000).toFixed(0)}K total budget across ${projects.length} projects`,
      action: 'Portfolio diversification is balanced'
    });
    
    setAiInsights(insights);
  };

  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const projectDetails = projects.map(p => ({
        name: p.name,
        client: p.client,
        type: p.type,
        budget: p.budget,
        actual_cost: p.actual_cost || 0,
        status:  p.status,
        priority: p.priority,
        deadline: p.deadline,
        progress: p.progress || 0,
        daysRemaining: Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }));

      // FIX #2: Add API key header
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version":  "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: `As an expert project portfolio analyst, provide a comprehensive analysis of this project portfolio. Include:

1. Overall portfolio health assessment
2. Risk analysis and mitigation strategies
3. Resource allocation recommendations
4. Budget optimization opportunities
5. Timeline predictions and concerns
6. Strategic recommendations for the next quarter

Portfolio Data:
${JSON.stringify(projectDetails, null, 2)}

Provide detailed, actionable insights formatted in markdown with clear sections. `
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.content && data.content[0]) {
        setAiResponse(data.content[0].text);
      } else {
        setAiResponse('Unable to generate analysis.  Please try again.');
      }
    } catch (error) {
      console.error('Deep Analysis Error:', error);
      setAiResponse('**Analysis Error**\n\nUnable to connect to AI service. Please check your API key and connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    const newMessage = { role: 'user' as const, content: userMessage };
    setAiConversation([...aiConversation, newMessage]);
    setUserMessage('');
    setIsSendingMessage(true);

    try {
      const conversationHistory = [... aiConversation, newMessage];
      const projectContext = projects.map(p => ({
        name: p.name,
        client: p.client,
        status: p.status,
        priority: p.priority,
        budget: p.budget,
        deadline: p.deadline,
        progress: p.progress
      }));

      // FIX #2: Add API key header
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: `You are an AI project management assistant. Here is the current project portfolio context:

${JSON.stringify(projectContext, null, 2)}

Based on this context, answer the user's questions and provide helpful project management advice.  Be concise but insightful.`
            },
            ... conversationHistory
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response. json();
      
      if (data.content && data.content[0]) {
        const assistantMessage = {
          role: 'assistant' as const,
          content: data.content[0].text
        };
        setAiConversation(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content:  'I apologize, but I encountered an error.  Please check your API key configuration.'
      };
      setAiConversation(prev => [... prev, errorMessage]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Memoized calculations
  const stats = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const activeCount = projects.filter(p => p.status === 'active').length;
    const atRiskCount = projects.filter(p => new Date(p.deadline) < new Date() || p.status === 'blocked').length;
    const avgProgress = projects.length > 0 ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length : 0;
    
    return [
      { 
        label: 'Total Budget', 
        value: `$${(totalBudget / 1000).toFixed(0)}K`, 
        change: '+27%', 
        trend: 'up',
        icon: DollarSign, 
        color: 'emerald' 
      },
      { 
        label: 'Active Projects', 
        value: activeCount. toString(), 
        change: `${activeCount} active`, 
        trend: 'up',
        icon:  Briefcase, 
        color: 'blue' 
      },
      { 
        label: 'At Risk', 
        value: atRiskCount.toString(), 
        change: atRiskCount > 0 ?  'Needs attention' : 'On track',
        trend: atRiskCount > 0 ?  'down' : 'up',
        icon: AlertTriangle, 
        color: 'red' 
      },
      { 
        label: 'Completion Rate', 
        value: `${Math.round(avgProgress)}%`, 
        change: '+12%', 
        trend: 'up',
        icon: TrendingUp, 
        color: 'purple' 
      }
    ];
  }, [projects]);

  const statusData = useMemo(() => [
    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: '#6366f1' },
    { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#10b981' },
    { name: 'Blocked', value:  projects.filter(p => p. status === 'blocked').length, color: '#ef4444' },
    { name: 'Ready', value: projects.filter(p => p.status === 'ready').length, color: '#f59e0b' }
  ], [projects]);

  const budgetTrendData = useMemo(() => 
    projects
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 5)
      .map(p => ({
        name: p.name. length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        budget: p.budget / 1000,
        actual: (p.actual_cost || 0) / 1000
      }))
  , [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p. name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || p. priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'budget':
          return b.budget - a.budget;
        case 'priority': {
          const priorityOrder = { critical: 0, high: 1, medium:  2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [projects, searchQuery, filterStatus, filterPriority, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading project intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent mb-2">
              Project Intelligence Hub
            </h1>
            <p className="text-slate-400 flex items-center gap-2">
              <Sparkles className="text-emerald-400" size={16} />
              Real-time AI-powered insights and predictive analytics
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchProjects} 
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 border border-slate-700"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button 
              onClick={() => setShowAiPanel(! showAiPanel)} 
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25"
            >
              <Brain size={18} />
              AI Copilot
              <kbd className="px-1. 5 py-0.5 bg-white/20 rounded text-xs">⌘I</kbd>
            </button>
            <button 
              onClick={() => setShowNewProjectDialog(true)} 
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Plus size={20} />
              New Project
            </button>
          </div>
        </div>

        {/* AI Insights Banner */}
        {aiInsights.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="text-purple-400 mt-0.5 animate-pulse" size={20} />
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  AI-Generated Insights
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">Live Analysis</span>
                </h3>
                <div className="grid grid-cols-1 md: grid-cols-2 gap-2">
                  {aiInsights. slice(0, 4).map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-slate-900/30 rounded-lg">
                      {insight.type === 'critical' && <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />}
                      {insight. type === 'warning' && <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />}
                      {insight.type === 'success' && <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={16} />}
                      {insight.type === 'info' && <Sparkles className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />}
                      <div className="flex-1">
                        <p className="text-purple-200 text-sm">{insight.message}</p>
                        {insight.action && (
                          <p className="text-purple-300/70 text-xs mt-1">→ {insight.action}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowAiPanel(true)} 
                  className="text-purple-300 hover:text-purple-200 text-sm mt-3 flex items-center gap-1"
                >
                  View detailed analysis <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const colors = COLORS[stat.color as keyof typeof COLORS];
            return (
              <div key={idx} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700/50 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-lg ${colors.bg} ${colors. border} border`}>
                    <Icon className={colors.text} size={20} />
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ?  (
                      <ArrowUp className="text-emerald-400" size={16} />
                    ) : (
                      <ArrowDown className="text-red-400" size={16} />
                    )}
                    <span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-400' :  'text-red-400'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-emerald-400" />
                Budget vs Actual Cost
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={budgetTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color:  '#e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="budget" stroke="#10b981" strokeWidth={2} name="Budget ($K)" />
                  <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} name="Actual ($K)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* FIX #1: Fixed PieChart legend */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Status</h3>
              {statusData.some(s => s.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie 
                        data={statusData. filter(s => s.value > 0)} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={70} 
                        paddingAngle={5} 
                        dataKey="value"
                      >
                        {statusData.filter(s => s.value > 0).map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {statusData.filter(s => s.value > 0).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">No data available</div>
              )}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Command className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              ref={searchRef}
              type="text" 
              placeholder="Search projects...  (⌘K)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-800/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <label htmlFor="filterStatus" className="sr-only">Filter by status</label>
            <select 
              id="filterStatus"
              aria-label="Filter by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-800/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="ready">Ready</option>
            </select>

            <label htmlFor="filterPriority" className="sr-only">Filter by priority</label>
            <select 
              id="filterPriority"
              aria-label="Filter by priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-800/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <label htmlFor="sortBy" className="sr-only">Sort by</label>
            <select 
              id="sortBy"
              aria-label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'deadline' | 'budget' | 'created' | 'priority')}
              className="px-4 py-3 bg-slate-900/50 border border-slate-800/50 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="created">Latest</option>
              <option value="deadline">Deadline</option>
              <option value="budget">Budget</option>
              <option value="priority">Priority</option>
            </select>
            <div className="flex border border-slate-800/50 rounded-lg overflow-hidden">
              <button 
                onClick={() => setView('grid')}
                className={`px-4 py-3 ${view === 'grid' ? 'bg-emerald-500 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-white'} transition-colors`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`px-4 py-3 ${view === 'list' ? 'bg-emerald-500 text-white' :  'bg-slate-900/50 text-slate-400 hover:text-white'} transition-colors`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ?  (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-12 text-center">
            <Target className="text-slate-600 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your filters or create a new project</p>
            <button 
              onClick={() => setShowNewProjectDialog(true)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Project
            </button>
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProjects.map((project) => {
              const daysRemaining = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysRemaining < 0;
              const progressPercent = project.progress || 0;
              
              const priorityColors = {
                critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
                high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
                medium:  { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
                low:  { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' }
              };
              
              const statusColors = {
                planning: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
                active: { bg: 'bg-green-500/10', text: 'text-green-400' },
                blocked: { bg: 'bg-red-500/10', text: 'text-red-400' },
                ready: { bg: 'bg-purple-500/10', text: 'text-purple-400' }
              };
              
              const priorityColor = priorityColors[project.priority];
              const statusColor = statusColors[project.status];
              
              return (
                <div 
                  key={project.id} 
                  className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-slate-400">{project.client}</p>
                    </div>
                    <div className={`px-2. 5 py-1 rounded-lg ${priorityColor.bg} ${priorityColor.border} border`}>
                      <span className={`text-xs font-semibold uppercase ${priorityColor.text}`}>
                        {project.priority}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-semibold">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width:  `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Budget</p>
                      <p className="text-sm font-semibold text-white">${(project.budget / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-slate-400">${((project.actual_cost || 0) / 1000).toFixed(0)}K used</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Deadline</p>
                      <p className={`text-sm font-semibold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                        {new Date(project.deadline).toLocaleDateString()}
                      </p>
                      <p className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                        {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className={`px-2.5 py-1 rounded-lg ${statusColor.bg}`}>
                      <span className={`text-xs font-medium ${statusColor.text}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <Users size={16} className="text-slate-400" />
                      </button>
                      <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <MessageSquare size={16} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Copilot Panel */}
      {showAiPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                  <Brain className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Project Copilot</h2>
                  <p className="text-sm text-slate-400">Powered by Claude</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiPanel(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
              <div className="w-1/3 border-r border-slate-800 p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleDeepAnalysis}
                    disabled={isAnalyzing}
                    className="w-full text-left px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    <BarChart3 size={18} className="text-emerald-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Deep Analysis</p>
                      <p className="text-xs text-slate-400">Portfolio insights</p>
                    </div>
                  </button>
                  <button 
                    onClick={generateRealAiInsights}
                    disabled={isAnalyzing}
                    className="w-full text-left px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    <Zap size={18} className="text-yellow-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Refresh Insights</p>
                      <p className="text-xs text-slate-400">Update analysis</p>
                    </div>
                  </button>
                </div>
                
                {aiInsights.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-white mb-3">Current Insights</h3>
                    <div className="space-y-2">
                      {aiInsights.map((insight, idx) => (
                        <div key={idx} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                          <div className="flex items-start gap-2">
                            {insight.type === 'critical' && <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={14} />}
                            {insight.type === 'warning' && <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={14} />}
                            {insight.type === 'success' && <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={14} />}
                            {insight.type === 'info' && <Sparkles className="text-blue-400 flex-shrink-0 mt-0.5" size={14} />}
                            <p className="text-xs text-slate-300">{insight.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {aiResponse && (
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <div className="text-slate-300 whitespace-pre-wrap">{aiResponse}</div>
                      </div>
                    </div>
                  )}
                  
                  {aiConversation. map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-800/50 border border-slate-700/50 text-slate-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isSendingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
                
                <div className="p-4 border-t border-slate-800">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about your projects..."
                      className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!userMessage.trim() || isSendingMessage}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      <Send size={18} />
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