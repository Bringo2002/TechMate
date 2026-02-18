import { useState } from 'react';
import { Globe, Smartphone, Cloud, Database, Brain, TrendingUp, ArrowUp, DollarSign, Users, Award, Target, BarChart3, Rocket, CheckCircle2, Sparkles, ChevronRight, Plus, PieChart, Star, Briefcase, Server, Terminal, Settings } from 'lucide-react';

const Services = () => {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const services = [
    {
      id: 1,
      name: 'Web Development',
      icon: Globe,
      color: 'emerald',
      description: 'Custom web applications, e-commerce platforms, and progressive web apps',
      revenue: 342000,
      growth: 18,
      margin: 68,
      satisfaction: 4.9,
      projects: {
        total: 32,
        active: 8,
        completed: 22,
        pending: 2
      },
      team: {
        total: 12,
        available: 3,
        utilization: 78
      },
      metrics: {
        avgProjectSize: 42000,
        avgDuration: 12, // weeks
        winRate: 87,
        repeatClients: 65,
        onTimeDelivery: 92
      },
      technologies: ['React', 'Vue.js', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS'],
      topClients: [
        { name: 'TechCorp Inc.', revenue: 95000, projects: 3, satisfaction: 4.8 },
        { name: 'StartupXYZ', revenue: 67000, projects: 2, satisfaction: 5.0 },
        { name: 'Enterprise Co', revenue: 54000, projects: 2, satisfaction: 4.7 }
      ],
      revenueBreakdown: {
        development: 65,
        maintenance: 20,
        consulting: 15
      },
      forecast: {
        nextQuarter: 420000,
        confidence: 89,
        trend: 'up'
      },
      opportunities: [
        { type: 'upsell', client: 'TechCorp Inc.', value: 35000, probability: 85 },
        { type: 'new', client: 'Potential Lead A', value: 55000, probability: 70 },
        { type: 'expansion', client: 'StartupXYZ', value: 28000, probability: 90 }
      ],
      recentWins: [
        { project: 'E-commerce Platform', client: 'TechCorp', value: 45000, date: '2024-01-15' },
        { project: 'Admin Dashboard', client: 'StartupXYZ', value: 32000, date: '2024-01-08' }
      ],
      capacity: {
        current: 78,
        optimal: 85,
        max: 100
      },
      demand: 'High',
      aiInsights: [
        'Revenue trending 18% above Q4 projections',
        'Mobile-first projects driving growth',
        'Consider expanding React team by 2 developers',
        '3 hot leads in pipeline worth $118K combined'
      ]
    },
    {
      id: 2,
      name: 'Mobile Apps',
      icon: Smartphone,
      color: 'blue',
      description: 'Native iOS/Android apps, cross-platform solutions, and mobile-first experiences',
      revenue: 289000,
      growth: 22,
      margin: 62,
      satisfaction: 4.8,
      projects: {
        total: 24,
        active: 6,
        completed: 17,
        pending: 1
      },
      team: {
        total: 9,
        available: 2,
        utilization: 92
      },
      metrics: {
        avgProjectSize: 67000,
        avgDuration: 16,
        winRate: 91,
        repeatClients: 71,
        onTimeDelivery: 88
      },
      technologies: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'Flutter', 'Expo'],
      topClients: [
        { name: 'FinanceHub', revenue: 134000, projects: 2, satisfaction: 4.9 },
        { name: 'HealthTech Inc', revenue: 89000, projects: 1, satisfaction: 4.8 },
        { name: 'FitApp Co', revenue: 66000, projects: 1, satisfaction: 4.7 }
      ],
      revenueBreakdown: {
        development: 70,
        maintenance: 18,
        consulting: 12
      },
      forecast: {
        nextQuarter: 380000,
        confidence: 94,
        trend: 'up'
      },
      opportunities: [
        { type: 'phase2', client: 'FinanceHub', value: 85000, probability: 95 },
        { type: 'new', client: 'Gaming Startup', value: 72000, probability: 65 },
        { type: 'upsell', client: 'HealthTech Inc', value: 42000, probability: 80 }
      ],
      recentWins: [
        { project: 'Banking App v2', client: 'FinanceHub', value: 67000, date: '2024-01-20' },
        { project: 'Fitness Tracker', client: 'FitApp Co', value: 66000, date: '2024-01-12' }
      ],
      capacity: {
        current: 92,
        optimal: 85,
        max: 100
      },
      demand: 'Very High',
      aiInsights: [
        'Highest growth service line at +22% MoM',
        'Team at 92% utilization - consider hiring',
        'FinanceHub Phase 2 nearly certain ($85K)',
        'Fintech vertical showing strong demand'
      ]
    },
    {
      id: 3,
      name: 'Cloud Services',
      icon: Cloud,
      color: 'purple',
      description: 'Cloud infrastructure, migrations, DevOps, and serverless architectures',
      revenue: 156000,
      growth: 12,
      margin: 71,
      satisfaction: 4.7,
      projects: {
        total: 28,
        active: 7,
        completed: 19,
        pending: 2
      },
      team: {
        total: 8,
        available: 3,
        utilization: 65
      },
      metrics: {
        avgProjectSize: 28000,
        avgDuration: 8,
        winRate: 83,
        repeatClients: 78,
        onTimeDelivery: 95
      },
      technologies: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform'],
      topClients: [
        { name: 'DataMinds', revenue: 52000, projects: 3, satisfaction: 4.8 },
        { name: 'Enterprise Corp', revenue: 38000, projects: 2, satisfaction: 4.6 },
        { name: 'ScaleUp Inc', revenue: 31000, projects: 2, satisfaction: 4.7 }
      ],
      revenueBreakdown: {
        development: 50,
        maintenance: 35,
        consulting: 15
      },
      forecast: {
        nextQuarter: 190000,
        confidence: 86,
        trend: 'up'
      },
      opportunities: [
        { type: 'expansion', client: 'DataMinds', value: 45000, probability: 75 },
        { type: 'new', client: 'AI Startup B', value: 38000, probability: 60 },
        { type: 'migration', client: 'Legacy Corp', value: 95000, probability: 55 }
      ],
      recentWins: [
        { project: 'Infrastructure Setup', client: 'DataMinds', value: 52000, date: '2024-01-18' },
        { project: 'Cloud Migration', client: 'ScaleUp Inc', value: 31000, date: '2024-01-10' }
      ],
      capacity: {
        current: 65,
        optimal: 85,
        max: 100
      },
      demand: 'Medium',
      aiInsights: [
        'Highest margin service at 71%',
        'Team has 35% spare capacity',
        'Recurring revenue model performing well',
        'Enterprise migration market expanding'
      ]
    },
    {
      id: 4,
      name: 'API Development',
      icon: Database,
      color: 'cyan',
      description: 'RESTful APIs, GraphQL, integrations, and microservices architecture',
      revenue: 134000,
      growth: 15,
      margin: 59,
      satisfaction: 4.6,
      projects: {
        total: 18,
        active: 4,
        completed: 13,
        pending: 1
      },
      team: {
        total: 6,
        available: 2,
        utilization: 54
      },
      metrics: {
        avgProjectSize: 34000,
        avgDuration: 10,
        winRate: 79,
        repeatClients: 82,
        onTimeDelivery: 89
      },
      technologies: ['Node.js', 'Python', 'GraphQL', 'REST', 'MongoDB', 'Redis'],
      topClients: [
        { name: 'SalesPro', revenue: 48000, projects: 2, satisfaction: 4.7 },
        { name: 'B2B Platform', revenue: 39000, projects: 1, satisfaction: 4.5 },
        { name: 'Integration Co', revenue: 28000, projects: 1, satisfaction: 4.6 }
      ],
      revenueBreakdown: {
        development: 60,
        maintenance: 25,
        consulting: 15
      },
      forecast: {
        nextQuarter: 165000,
        confidence: 82,
        trend: 'up'
      },
      opportunities: [
        { type: 'maintenance', client: 'SalesPro', value: 24000, probability: 90 },
        { type: 'new', client: 'SaaS Startup C', value: 41000, probability: 68 },
        { type: 'expansion', client: 'Integration Co', value: 18000, probability: 85 }
      ],
      recentWins: [
        { project: 'CRM Integration', client: 'SalesPro', value: 34000, date: '2024-01-22' },
        { project: 'API Gateway', client: 'B2B Platform', value: 39000, date: '2024-01-14' }
      ],
      capacity: {
        current: 54,
        optimal: 85,
        max: 100
      },
      demand: 'Growing',
      aiInsights: [
        'Steady growth at +15% MoM',
        'Highest repeat client rate at 82%',
        'Significant spare capacity available',
        'Maintenance contracts provide stable MRR'
      ]
    },
    {
      id: 5,
      name: 'AI & Machine Learning',
      icon: Brain,
      color: 'indigo',
      description: 'ML models, AI integrations, data science, and intelligent automation',
      revenue: 98000,
      growth: 35,
      margin: 74,
      satisfaction: 4.9,
      projects: {
        total: 12,
        active: 4,
        completed: 7,
        pending: 1
      },
      team: {
        total: 5,
        available: 1,
        utilization: 88
      },
      metrics: {
        avgProjectSize: 58000,
        avgDuration: 14,
        winRate: 73,
        repeatClients: 58,
        onTimeDelivery: 86
      },
      technologies: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Jupyter', 'MLflow'],
      topClients: [
        { name: 'DataMinds', revenue: 52000, projects: 1, satisfaction: 5.0 },
        { name: 'AI Research Lab', revenue: 46000, projects: 1, satisfaction: 4.8 }
      ],
      revenueBreakdown: {
        development: 75,
        maintenance: 15,
        consulting: 10
      },
      forecast: {
        nextQuarter: 145000,
        confidence: 78,
        trend: 'up'
      },
      opportunities: [
        { type: 'enterprise', client: 'Fortune 500 Co', value: 180000, probability: 45 },
        { type: 'expansion', client: 'DataMinds', value: 120000, probability: 70 },
        { type: 'new', client: 'AI Startup D', value: 65000, probability: 60 }
      ],
      recentWins: [
        { project: 'Analytics Dashboard', client: 'DataMinds', value: 52000, date: '2024-01-16' }
      ],
      capacity: {
        current: 88,
        optimal: 85,
        max: 100
      },
      demand: 'Very High',
      aiInsights: [
        'Explosive 35% growth - fastest growing service',
        'Premium pricing with 74% margins',
        'Team near capacity - hire 2 ML engineers',
        'Enterprise AI market heating up rapidly'
      ]
    },
    {
      id: 6,
      name: 'DevOps & Infrastructure',
      icon: Server,
      color: 'orange',
      description: 'CI/CD pipelines, infrastructure automation, monitoring, and reliability engineering',
      revenue: 87000,
      growth: 9,
      margin: 65,
      satisfaction: 4.7,
      projects: {
        total: 15,
        active: 5,
        completed: 9,
        pending: 1
      },
      team: {
        total: 4,
        available: 1,
        utilization: 72
      },
      metrics: {
        avgProjectSize: 22000,
        avgDuration: 6,
        winRate: 81,
        repeatClients: 89,
        onTimeDelivery: 94
      },
      technologies: ['Jenkins', 'GitLab CI', 'Ansible', 'Prometheus', 'Grafana', 'ELK Stack'],
      topClients: [
        { name: 'TechCorp Inc.', revenue: 28000, projects: 2, satisfaction: 4.8 },
        { name: 'ScaleUp Inc', revenue: 24000, projects: 1, satisfaction: 4.6 },
        { name: 'FinanceHub', revenue: 19000, projects: 1, satisfaction: 4.7 }
      ],
      revenueBreakdown: {
        development: 45,
        maintenance: 45,
        consulting: 10
      },
      forecast: {
        nextQuarter: 102000,
        confidence: 91,
        trend: 'up'
      },
      opportunities: [
        { type: 'recurring', client: 'Multiple', value: 36000, probability: 85 },
        { type: 'new', client: 'Growing Startup', value: 28000, probability: 72 }
      ],
      recentWins: [
        { project: 'CI/CD Setup', client: 'TechCorp Inc.', value: 14000, date: '2024-01-19' },
        { project: 'Monitoring Suite', client: 'ScaleUp Inc', value: 24000, date: '2024-01-11' }
      ],
      capacity: {
        current: 72,
        optimal: 85,
        max: 100
      },
      demand: 'Medium',
      aiInsights: [
        'Highest repeat rate at 89% - sticky service',
        'Strong recurring revenue model',
        'Cross-sell opportunity with other services',
        'Modest but stable growth trajectory'
      ]
    }
  ];

  const totalRevenue = services.reduce((sum, s) => sum + s.revenue, 0);
  const avgGrowth = services.reduce((sum, s) => sum + s.growth, 0) / services.length;
  const avgMargin = services.reduce((sum, s) => sum + s.margin, 0) / services.length;
  const totalProjects = services.reduce((sum, s) => sum + s.projects.total, 0);

  const ServiceCard = ({ service }: { service: typeof services[0] }) => {
    const Icon = service.icon;
    
    return (
      <div
        className={`group relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-${service.color}-500/30 rounded-2xl p-6 transition-all cursor-pointer`}
        onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${service.color}-500/5 rounded-full blur-3xl group-hover:bg-${service.color}-500/10 transition-all`}></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={`p-4 bg-${service.color}-500/10 rounded-xl`}>
              <Icon className={`w-8 h-8 text-${service.color}-400`} />
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              service.demand === 'Very High' ? 'bg-emerald-500/10 text-emerald-400' :
              service.demand === 'High' ? 'bg-blue-500/10 text-blue-400' :
              service.demand === 'Growing' ? 'bg-purple-500/10 text-purple-400' :
              'bg-gray-500/10 text-gray-400'
            }`}>
              {service.demand} Demand
            </div>
          </div>

          <h3 className={`text-2xl font-bold text-white mb-2 group-hover:text-${service.color}-400 transition-colors`}>
            {service.name}
          </h3>
          <p className="text-sm text-gray-400 mb-6">{service.description}</p>

          {/* Revenue & Growth */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-white">${(service.revenue / 1000).toFixed(0)}K</span>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                <ArrowUp className="w-4 h-4" />
                {service.growth}%
              </div>
            </div>
            <p className="text-xs text-gray-400">Monthly revenue</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <div className="text-xl font-bold text-white">{service.projects.active}</div>
              <div className="text-xs text-gray-400">Active Projects</div>
            </div>
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <div className="text-xl font-bold text-emerald-400">{service.margin}%</div>
              <div className="text-xs text-gray-400">Margin</div>
            </div>
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <div className="text-xl font-bold text-white">{service.team.available}</div>
              <div className="text-xs text-gray-400">Available</div>
            </div>
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-amber-400">{service.satisfaction}</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-xs text-gray-400">Satisfaction</div>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Team Capacity</span>
              <span className="font-semibold text-white">{service.capacity.current}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-${service.color}-500 to-${service.color}-400 transition-all`}
                style={{ width: `${service.capacity.current}%` }}
              />
            </div>
          </div>

          {/* AI Insight */}
          <div className={`p-3 rounded-xl border mb-6 bg-${service.color}-500/5 border-${service.color}-500/20`}>
            <div className="flex items-start gap-2">
              <Brain className={`w-4 h-4 mt-0.5 flex-shrink-0 text-${service.color}-400`} />
              <p className="text-sm text-gray-300">{service.aiInsights[0]}</p>
            </div>
          </div>

          {/* CTA Button */}
          <button className={`w-full py-3 px-4 bg-${service.color}-500/10 hover:bg-${service.color}-500/20 border border-${service.color}-500/30 text-${service.color}-400 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2`}>
            Deep Dive Analysis
            <ChevronRight className="w-4 h-4" />
          </button>
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
                Service Intelligence Hub
              </h1>
              <p className="text-gray-400 text-lg">
                AI-powered analytics for every service line
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                aria-label="Select time range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-semibold shadow-lg shadow-emerald-500/20">
                <Plus className="w-5 h-5" />
                Add Service
              </button>
            </div>
          </div>

          {/* Portfolio Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
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
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{avgGrowth.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">Avg Growth</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{avgMargin.toFixed(0)}%</div>
                  <div className="text-xs text-gray-400">Avg Margin</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalProjects}</div>
                  <div className="text-xs text-gray-400">Total Projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Detailed Service Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedService(null)}>
          <div className="max-w-7xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-900/90 border border-gray-800 rounded-3xl"
            onClick={(e) => e.stopPropagation()}>
            {(() => {
              const service = services.find(s => s.id === selectedService);
              if (!service) return null;
              const Icon = service.icon;

              return (
                <div className="p-8">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`p-5 bg-${service.color}-500/10 rounded-2xl`}>
                        <Icon className={`w-12 h-12 text-${service.color}-400`} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">{service.name}</h2>
                        <p className="text-gray-400">{service.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedService(null)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <span className="text-2xl text-gray-400">×</span>
                    </button>
                  </div>

                  {/* Key Metrics Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className={`p-6 rounded-2xl border bg-gradient-to-br from-${service.color}-900/20 to-${service.color}-900/5 border-${service.color}-500/30`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Revenue</h3>
                        <DollarSign className={`w-6 h-6 text-${service.color}-400`} />
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">${(service.revenue / 1000).toFixed(0)}K</div>
                      <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                        <ArrowUp className="w-4 h-4" />
                        {service.growth}% growth
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Projects</h3>
                        <Briefcase className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">{service.projects.total}</div>
                      <div className="text-sm text-gray-400">{service.projects.active} active</div>
                    </div>

                    <div className="p-6 rounded-2xl border bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Margin</h3>
                        <Target className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">{service.margin}%</div>
                      <div className="text-sm text-gray-400">Industry avg: 45-55%</div>
                    </div>

                    <div className="p-6 rounded-2xl border bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Satisfaction</h3>
                        <Award className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-4xl font-bold text-white">{service.satisfaction}</div>
                        <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                      </div>
                      <div className="text-sm text-gray-400">Excellent rating</div>
                    </div>
                  </div>

                  {/* AI Insights Section */}
                  <div className={`p-6 rounded-2xl border mb-8 bg-gradient-to-br from-${service.color}-900/20 to-${service.color}-900/5 border-${service.color}-500/30`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className={`w-6 h-6 text-${service.color}-400`} />
                      <h3 className="text-xl font-bold text-white">AI-Generated Insights</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.aiInsights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-xl">
                          <CheckCircle2 className={`w-5 h-5 text-${service.color}-400 mt-0.5 flex-shrink-0`} />
                          <p className="text-sm text-gray-300">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team & Capacity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-gray-800/30 rounded-2xl">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        Team Resources
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Total Team Size</span>
                          <span className="text-xl font-bold text-white">{service.team.total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Available</span>
                          <span className="text-xl font-bold text-emerald-400">{service.team.available}</span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Utilization</span>
                            <span className={`font-bold ${
                              service.team.utilization > 85 ? 'text-red-400' :
                              service.team.utilization > 70 ? 'text-amber-400' :
                              'text-emerald-400'
                            }`}>{service.team.utilization}%</span>
                          </div>
                          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                service.team.utilization > 85 ? 'bg-red-500' :
                                service.team.utilization > 70 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${service.team.utilization}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-800/30 rounded-2xl">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        Performance Metrics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-white">${(service.metrics.avgProjectSize / 1000).toFixed(0)}K</div>
                          <div className="text-xs text-gray-400">Avg Project Size</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{service.metrics.avgDuration}w</div>
                          <div className="text-xs text-gray-400">Avg Duration</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-emerald-400">{service.metrics.winRate}%</div>
                          <div className="text-xs text-gray-400">Win Rate</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-400">{service.metrics.repeatClients}%</div>
                          <div className="text-xs text-gray-400">Repeat Clients</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-gray-800/30 rounded-2xl">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-emerald-400" />
                        Revenue Breakdown
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Development</span>
                            <span className="text-sm font-semibold text-white">{service.revenueBreakdown.development}%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${service.revenueBreakdown.development}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Maintenance</span>
                            <span className="text-sm font-semibold text-white">{service.revenueBreakdown.maintenance}%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${service.revenueBreakdown.maintenance}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Consulting</span>
                            <span className="text-sm font-semibold text-white">{service.revenueBreakdown.consulting}%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${service.revenueBreakdown.consulting}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border bg-gradient-to-br from-${service.color}-900/20 to-${service.color}-900/5 border-${service.color}-500/30`}>
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className={`w-5 h-5 text-${service.color}-400`} />
                        Forecast Next Quarter
                      </h3>
                      <div className="text-4xl font-bold text-white mb-2">${(service.forecast.nextQuarter / 1000).toFixed(0)}K</div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold bg-${service.color}-500/10 text-${service.color}-400`}>
                          {service.forecast.confidence}% confidence
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        Based on pipeline analysis, historical trends, and market conditions
                      </div>
                    </div>
                  </div>

                  {/* Top Clients */}
                  <div className="p-6 bg-gray-800/30 rounded-2xl mb-8">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      Top Clients
                    </h3>
                    <div className="space-y-3">
                      {service.topClients.map((client, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                              {client.name.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{client.name}</div>
                              <div className="text-xs text-gray-400">{client.projects} project{client.projects > 1 ? 's' : ''}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-400">${(client.revenue / 1000).toFixed(0)}K</div>
                            <div className="flex items-center gap-1 text-xs">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-gray-400">{client.satisfaction}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities Pipeline */}
                  <div className="p-6 bg-gray-800/30 rounded-2xl mb-8">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      Opportunity Pipeline
                    </h3>
                    <div className="space-y-3">
                      {service.opportunities.map((opp, i) => (
                        <div key={i} className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 font-semibold uppercase">
                                  {opp.type}
                                </span>
                                <span className="text-sm font-semibold text-white">{opp.client}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-emerald-400">${(opp.value / 1000).toFixed(0)}K</div>
                              <div className="text-xs text-gray-400">{opp.probability}% likely</div>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all"
                              style={{ width: `${opp.probability}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-gray-700/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Pipeline Value</span>
                        <span className="text-2xl font-bold text-emerald-400">
                          ${(service.opportunities.reduce((sum, opp) => sum + opp.value, 0) / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="p-6 bg-gray-800/30 rounded-2xl mb-8">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-blue-400" />
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((tech, i) => (
                        <span key={i} className="px-3 py-2 bg-gray-700/50 text-gray-300 text-sm rounded-lg font-medium hover:bg-gray-700 transition-colors">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recent Wins */}
                  <div className="p-6 bg-gray-800/30 rounded-2xl mb-8">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-purple-400" />
                      Recent Wins
                    </h3>
                    <div className="space-y-3">
                      {service.recentWins.map((win, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                          <div>
                            <div className="font-semibold text-white mb-1">{win.project}</div>
                            <div className="text-sm text-gray-400">{win.client} • {win.date}</div>
                          </div>
                          <div className="text-xl font-bold text-purple-400">${(win.value / 1000).toFixed(0)}K</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button className={`flex-1 py-4 px-6 bg-${service.color}-500 hover:bg-${service.color}-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-${service.color}-500/20`}>
                      View Full Analytics
                    </button>
                    <button className="flex-1 py-4 px-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-white rounded-xl font-semibold transition-all">
                      Export Report
                    </button>
                    <button className="py-4 px-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all" title="Settings">
                      <Settings className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Bottom Insights Panel */}
      <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-emerald-900/20 border border-purple-500/20 rounded-2xl p-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              <Brain className="w-7 h-7 text-purple-400" />
              Portfolio Intelligence
            </h3>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>AI/ML showing explosive 35% growth - fastest growing service line. Consider expanding team.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Mobile Apps at 92% utilization - hire 2-3 developers to capture demand.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Cloud Services has 35% spare capacity - opportunity for new client acquisition.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>DevOps has 89% repeat rate - highest client retention. Cross-sell opportunity across portfolio.</span>
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all font-semibold shadow-lg shadow-purple-500/20 whitespace-nowrap">
            <Sparkles className="w-5 h-5" />
            AI Strategy Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;