import React, { useState } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, DollarSign, Users, Rocket, Activity, Download, ChevronRight, Target, Award, CheckCircle2, AlertCircle, BarChart3, PieChart, LineChartIcon, Globe, Smartphone, Database, Cloud, Layers, Sparkles, Brain } from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');


  // Mock data
  const kpis = [
    {
      label: 'Total Revenue',
      value: '$847,290',
      change: '+23.5%',
      trend: 'up',
      compareValue: '$687,450',
      icon: DollarSign,
      color: 'emerald',
      sparkline: [650, 680, 670, 720, 750, 780, 847]
    },
    {
      label: 'Active Projects',
      value: '24',
      change: '+12.3%',
      trend: 'up',
      compareValue: '21',
      icon: Rocket,
      color: 'blue',
      sparkline: [18, 19, 20, 21, 22, 23, 24]
    },
    {
      label: 'Client Acquisition',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      compareValue: '144',
      icon: Users,
      color: 'purple',
      sparkline: [130, 135, 140, 144, 148, 152, 156]
    },
    {
      label: 'Avg Project Value',
      value: '$35,304',
      change: '+18.7%',
      trend: 'up',
      compareValue: '$29,750',
      icon: Target,
      color: 'amber',
      sparkline: [28, 29, 30, 31, 33, 34, 35]
    },
    {
      label: 'Client Satisfaction',
      value: '4.8/5',
      change: '+0.3',
      trend: 'up',
      compareValue: '4.5/5',
      icon: Award,
      color: 'pink',
      sparkline: [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8]
    },
    {
      label: 'Deployment Success',
      value: '96.2%',
      change: '+2.1%',
      trend: 'up',
      compareValue: '94.1%',
      icon: CheckCircle2,
      color: 'cyan',
      sparkline: [92, 93, 93.5, 94.1, 95, 95.8, 96.2]
    }
  ];

  const revenueByService = [
    { name: 'Web Development', value: 342000, percentage: 40, growth: 18, color: 'emerald', icon: Globe },
    { name: 'Mobile Apps', value: 289000, percentage: 34, growth: 22, color: 'blue', icon: Smartphone },
    { name: 'Cloud Services', value: 156000, percentage: 18, growth: 12, color: 'purple', icon: Cloud },
    { name: 'API Development', value: 134000, percentage: 16, growth: 15, color: 'cyan', icon: Database },
    { name: 'DevOps', value: 98000, percentage: 12, growth: 9, color: 'amber', icon: Layers }
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 62000, projects: 18, clients: 12 },
    { month: 'Feb', revenue: 71000, projects: 19, clients: 13 },
    { month: 'Mar', revenue: 68000, projects: 20, clients: 14 },
    { month: 'Apr', revenue: 79000, projects: 21, clients: 15 },
    { month: 'May', revenue: 85000, projects: 22, clients: 16 },
    { month: 'Jun', revenue: 92000, projects: 23, clients: 17 },
    { month: 'Jul', revenue: 98000, projects: 24, clients: 18 }
  ];

  const projectStatus = [
    { status: 'Completed', count: 47, percentage: 52, color: 'emerald' },
    { status: 'In Progress', count: 24, percentage: 27, color: 'blue' },
    { status: 'Planning', count: 12, percentage: 13, color: 'purple' },
    { status: 'On Hold', count: 7, percentage: 8, color: 'amber' }
  ];

  const clientMetrics = [
    { tier: 'Enterprise', count: 12, revenue: 456000, avgValue: 38000, color: 'emerald' },
    { tier: 'Growth', count: 28, revenue: 287000, avgValue: 10250, color: 'blue' },
    { tier: 'Mid-Market', count: 45, revenue: 189000, avgValue: 4200, color: 'purple' },
    { tier: 'Startup', count: 71, revenue: 98000, avgValue: 1380, color: 'cyan' }
  ];

  const topPerformers = [
    { name: 'Sarah Chen', role: 'Account Manager', revenue: 245000, clients: 8, satisfaction: 4.9, color: 'emerald' },
    { name: 'Mike Rodriguez', role: 'Tech Lead', projects: 12, onTime: 100, quality: 4.8, color: 'blue' },
    { name: 'Maria Santos', role: 'Account Manager', revenue: 201000, clients: 6, satisfaction: 4.9, color: 'purple' },
    { name: 'David Park', role: 'Tech Lead', projects: 10, onTime: 95, quality: 4.7, color: 'amber' }
  ];

  const conversionFunnel = [
    { stage: 'Leads', count: 245, percentage: 100, color: 'blue' },
    { stage: 'Qualified', count: 167, percentage: 68, color: 'cyan' },
    { stage: 'Proposals', count: 98, percentage: 40, color: 'purple' },
    { stage: 'Negotiation', count: 62, percentage: 25, color: 'amber' },
    { stage: 'Closed Won', count: 42, percentage: 17, color: 'emerald' }
  ];

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

  const renderRevenueChart = () => {
    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
    
    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-2 h-64">
          {monthlyRevenue.map((month, idx) => {
            const height = (month.revenue / maxRevenue) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-blue-500 rounded-t-lg transition-all duration-300 hover:from-emerald-400 hover:to-blue-400 cursor-pointer"
                    style={{ height: `${height}%`, minHeight: '8%' }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      ${(month.revenue / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">{month.month}</span>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-gray-400">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-400">Growth Trend</span>
          </div>
        </div>
      </div>
    );
  };

  const renderServiceBreakdown = () => {
    const total = revenueByService.reduce((sum, s) => sum + s.value, 0);
    
    return (
      <div className="space-y-4">
        {revenueByService.map((service, idx) => {
          const Icon = service.icon;
          const percentage = (service.value / total) * 100;
          
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
                  <span className={`text-sm font-semibold text-${service.color}-400`}>
                    {percentage.toFixed(1)}%
                  </span>
                  <div className={`flex items-center gap-1 text-xs text-${service.color}-400`}>
                    <ArrowUp className="w-3 h-3" />
                    {service.growth}%
                  </div>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-${service.color}-500 to-${service.color}-400 rounded-full transition-all duration-500 group-hover:shadow-lg group-hover:shadow-${service.color}-500/50`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderConversionFunnel = () => {
    return (
      <div className="space-y-3">
        {conversionFunnel.map((stage, idx) => (
          <div key={idx} className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{stage.stage}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{stage.count} leads</span>
                <span className={`text-sm font-semibold text-${stage.color}-400`}>
                  {stage.percentage}%
                </span>
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
  };

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
          
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-all">
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

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-emerald-400" />
                Revenue Trend
              </h3>
              <p className="text-sm text-gray-400 mt-1">Monthly revenue performance</p>
            </div>
            <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
              View Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {renderRevenueChart()}
        </div>

        {/* Project Status */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-400" />
              Project Status
            </h3>
            <p className="text-sm text-gray-400 mt-1">Current project distribution</p>
          </div>
          
          <div className="space-y-4">
            {projectStatus.map((status, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${status.color}-500`}></div>
                    <span className="text-sm text-gray-300">{status.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{status.count}</span>
                    <span className={`text-sm font-semibold text-${status.color}-400`}>
                      {status.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-${status.color}-500 to-${status.color}-400 rounded-full`}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-800/30 rounded-xl">
            <div className="text-sm text-gray-400 mb-1">Total Projects</div>
            <div className="text-2xl font-bold text-white">90</div>
          </div>
        </div>
      </div>

      {/* Service Breakdown & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Revenue Breakdown */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Revenue by Service
            </h3>
            <p className="text-sm text-gray-400 mt-1">Service line performance breakdown</p>
          </div>
          
          {renderServiceBreakdown()}
        </div>

        {/* Conversion Funnel */}
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
      </div>

      {/* Client Tiers & Top Performers */}
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

      {/* AI Insights */}
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
