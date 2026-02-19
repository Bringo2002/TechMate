import React, { useState } from 'react';
import { Users, TrendingUp, DollarSign, Star, Award, AlertTriangle, CheckCircle2, MessageSquare, Brain, Sparkles, Plus, Search, Download, MoreVertical, CircleDot } from 'lucide-react';

const Clients = () => {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'at-risk' | 'champions'>('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'satisfaction' | 'ltv'>('revenue');

  const clients = [
    {
      id: 1,
      name: 'TechCorp Inc.',
      logo: 'TC',
      industry: 'E-commerce',
      tier: 'Enterprise',
      status: 'Active',
      healthScore: 78,
      satisfaction: 4.8,
      relationship: 'Strong',
      totalRevenue: 185000,
      lifetimeValue: 420000,
      avgProjectSize: 45000,
      projects: { total: 5, active: 2, completed: 3, success: 100 },
      team: { accountManager: 'Sarah Chen', techLead: 'Mike Rodriguez', lastContact: '2 days ago' },
      opportunities: [
        { type: 'upsell', description: 'Phase 2 expansion', value: 35000, probability: 85 },
        { type: 'referral', description: 'Referred StartupXYZ', value: 55000, probability: 70 }
      ],
      risks: [
        { type: 'blocker', severity: 'medium', description: 'UI approval delays causing timeline pressure' }
      ],
      aiInsights: ['Client showing strong upsell signals - Phase 2 highly likely'],
      services: ['Web Development', 'Cloud Services', 'DevOps']
    },
    {
      id: 2,
      name: 'FinanceHub',
      logo: 'FH',
      industry: 'Fintech',
      tier: 'Enterprise',
      status: 'Champion',
      healthScore: 96,
      satisfaction: 4.9,
      relationship: 'Exceptional',
      totalRevenue: 201000,
      lifetimeValue: 650000,
      avgProjectSize: 67000,
      projects: { total: 3, active: 1, completed: 2, success: 100 },
      team: { accountManager: 'Maria Santos', techLead: 'David Park', lastContact: '1 day ago' },
      opportunities: [
        { type: 'expansion', description: 'Phase 2 mobile features', value: 85000, probability: 95 },
        { type: 'referral', description: '2 confirmed referrals', value: 150000, probability: 80 }
      ],
      risks: [],
      aiInsights: ['Dream client - Phase 2 nearly guaranteed at $85K'],
      services: ['Mobile Apps', 'API Development']
    },
    {
      id: 3,
      name: 'DataMinds',
      logo: 'DM',
      industry: 'AI/Analytics',
      tier: 'Growth',
      status: 'Active',
      healthScore: 92,
      satisfaction: 5.0,
      relationship: 'Strong',
      totalRevenue: 104000,
      lifetimeValue: 380000,
      avgProjectSize: 52000,
      projects: { total: 2, active: 1, completed: 1, success: 100 },
      team: { accountManager: 'Alex Kim', techLead: 'Priya Sharma', lastContact: '3 hours ago' },
      opportunities: [
        { type: 'expansion', description: 'Enterprise license upgrade', value: 120000, probability: 70 }
      ],
      risks: [],
      aiInsights: ['High-value expansion opportunity - $120K enterprise upgrade'],
      services: ['AI & Machine Learning', 'Cloud Services']
    },
    {
      id: 4,
      name: 'SalesPro',
      logo: 'SP',
      industry: 'B2B SaaS',
      tier: 'Mid-Market',
      status: 'Active',
      healthScore: 88,
      satisfaction: 4.7,
      relationship: 'Good',
      totalRevenue: 82000,
      lifetimeValue: 180000,
      avgProjectSize: 34000,
      projects: { total: 3, active: 1, completed: 2, success: 100 },
      team: { accountManager: 'John Williams', techLead: 'Amy Thompson', lastContact: '5 days ago' },
      opportunities: [
        { type: 'maintenance', description: 'Monthly maintenance contract', value: 24000, probability: 90 }
      ],
      risks: [],
      aiInsights: ['Maintenance contract almost certain - recurring revenue'],
      services: ['API Development', 'DevOps']
    },
    {
      id: 5,
      name: 'HealthTech Inc',
      logo: 'HT',
      industry: 'Healthcare',
      tier: 'Enterprise',
      status: 'At-Risk',
      healthScore: 62,
      satisfaction: 4.2,
      relationship: 'Needs Attention',
      totalRevenue: 89000,
      lifetimeValue: 89000,
      avgProjectSize: 89000,
      projects: { total: 1, active: 1, completed: 0, success: 0 },
      team: { accountManager: 'Sarah Chen', techLead: 'Tom Wilson', lastContact: '12 days ago' },
      opportunities: [
        { type: 'expansion', description: 'Multi-facility rollout', value: 250000, probability: 40 }
      ],
      risks: [
        { type: 'engagement', severity: 'high', description: 'Low responsiveness - last contact 12 days ago' }
      ],
      aiInsights: ['RED FLAG: Low engagement - immediate intervention needed'],
      services: ['Web Development', 'Cloud Services']
    },
    {
      id: 6,
      name: 'RetailMax',
      logo: 'RM',
      industry: 'Retail',
      tier: 'Mid-Market',
      status: 'Active',
      healthScore: 85,
      satisfaction: 4.6,
      relationship: 'Good',
      totalRevenue: 42000,
      lifetimeValue: 145000,
      avgProjectSize: 42000,
      projects: { total: 1, active: 1, completed: 0, success: 0 },
      team: { accountManager: 'David Park', techLead: 'Chris Anderson', lastContact: '1 day ago' },
      opportunities: [
        { type: 'mobile', description: 'Mobile app companion', value: 35000, probability: 75 }
      ],
      risks: [],
      aiInsights: ['Strong mobile app upsell potential'],
      services: ['Web Development']
    }
  ];

  const filteredClients = clients.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'active') return c.status === 'Active';
    if (filter === 'at-risk') return c.healthScore < 70;
    if (filter === 'champions') return c.healthScore >= 90;
    return true;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
    if (sortBy === 'satisfaction') return b.satisfaction - a.satisfaction;
    if (sortBy === 'ltv') return b.lifetimeValue - a.lifetimeValue;
    return 0;
  });

  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalLTV = clients.reduce((sum, c) => sum + c.lifetimeValue, 0);
  const avgSatisfaction = clients.reduce((sum, c) => sum + c.satisfaction, 0) / clients.length;
  const atRiskCount = clients.filter(c => c.healthScore < 70).length;

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'emerald';
    if (score >= 75) return 'blue';
    if (score >= 60) return 'amber';
    return 'red';
  };

  const getRelationshipBadge = (relationship: string) => {
    const configs: Record<string, { color: string; icon: React.ElementType }> = {
      'Exceptional': { color: 'emerald', icon: Award },
      'Strong': { color: 'blue', icon: CheckCircle2 },
      'Good': { color: 'cyan', icon: CircleDot },
      'Needs Attention': { color: 'amber', icon: AlertTriangle }
    };
    const config = configs[relationship] || { color: 'gray', icon: CircleDot };
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-1.5 text-${config.color}-400`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{relationship}</span>
      </div>
    );
  };

  const HealthScore = ({ score }: { score: number }) => {
    const color = getHealthColor(score);
    const circumference = 2 * Math.PI * 24;
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;
    
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
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{score}</span>
        </div>
        <div>
          <div className={`text-sm font-semibold text-${color}-400`}>
            {score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : 'At Risk'}
          </div>
          <div className="text-xs text-gray-500">Health</div>
        </div>
      </div>
    );
  };

  const ClientCard = ({ client }: { client: typeof clients[0] }) => {
    const healthColor = getHealthColor(client.healthScore);
    
    return (
      <div
        className={`group relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-${healthColor}-500/30 rounded-2xl p-6 transition-all cursor-pointer`}
        onClick={() => setSelectedClient(selectedClient === client.id ? null : client.id)}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${healthColor}-500/5 rounded-full blur-3xl group-hover:bg-${healthColor}-500/10 transition-all`}></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
                {client.logo}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                  {client.name}
                </h3>
                <p className="text-sm text-gray-400">{client.industry} • {client.tier}</p>
              </div>
            </div>
            <button title="More options" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Health & Relationship */}
          <div className="flex items-center justify-between mb-4">
            <HealthScore score={client.healthScore} />
            {getRelationshipBadge(client.relationship)}
          </div>

          {/* Revenue & Satisfaction */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="text-xl font-bold text-emerald-400">${(client.totalRevenue / 1000).toFixed(0)}K</div>
              <div className="text-xs text-gray-400">Revenue</div>
            </div>
            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-amber-400">{client.satisfaction}</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-xs text-gray-400">Satisfaction</div>
            </div>
          </div>

          {/* Projects */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-gray-400">{client.projects.active} active • {client.projects.completed} completed</span>
            <span className="text-blue-400 font-semibold">{client.projects.total} total</span>
          </div>

          {/* Risks Alert */}
          {client.risks.length > 0 && (
            <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">{client.risks.length} Risk{client.risks.length > 1 ? 's' : ''}</span>
              </div>
              <p className="text-xs text-gray-300">{client.risks[0].description}</p>
            </div>
          )}

          {/* Opportunities */}
          {client.opportunities.length > 0 && (
            <div className="mb-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">{client.opportunities.length} Opportunit{client.opportunities.length > 1 ? 'ies' : 'y'}</span>
              </div>
              <p className="text-xs text-gray-300">${(client.opportunities.reduce((sum, opp) => sum + opp.value, 0) / 1000).toFixed(0)}K potential value</p>
            </div>
          )}

          {/* AI Insight */}
          <div className={`p-3 rounded-xl border mb-4 bg-${healthColor}-500/5 border-${healthColor}-500/20`}>
            <div className="flex items-start gap-2">
              <Brain className={`w-4 h-4 mt-0.5 flex-shrink-0 text-${healthColor}-400`} />
              <p className="text-sm text-gray-300">{client.aiInsights[0]}</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-all">
              View Profile
            </button>
            <button title="Send Message" className="py-2.5 px-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-all">
              <MessageSquare className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-purple-900/20 border border-emerald-500/20 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent mb-2">
                Client Relationship Hub
              </h1>
              <p className="text-gray-400 text-lg">
                AI-powered client intelligence & relationship management
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-semibold shadow-lg shadow-emerald-500/20">
              <Plus className="w-5 h-5" />
              Add Client
            </button>
          </div>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">${(totalRevenue / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-400">Total Revenue</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">${(totalLTV / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-400">Lifetime Value</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{avgSatisfaction.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">Avg Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{atRiskCount}</div>
                  <div className="text-xs text-gray-400">At Risk</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'at-risk', 'champions'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700'
              }`}
            >
              {f === 'all' ? 'All Clients' : f === 'at-risk' ? 'At Risk' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-2 text-xs opacity-70">
                ({f === 'all' ? clients.length : f === 'at-risk' ? atRiskCount : clients.filter(c => f === 'champions' ? c.healthScore >= 90 : c.status === 'Active').length})
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          
          <select
            title="Sort clients"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'revenue' | 'satisfaction' | 'ltv')}
            className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="satisfaction">Sort by Satisfaction</option>
            <option value="ltv">Sort by LTV</option>
          </select>

          <button title="Download" className="p-2 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all">
            <Download className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {/* Empty State */}
      {sortedClients.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No clients found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default Clients;