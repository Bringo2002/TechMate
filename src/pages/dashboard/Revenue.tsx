import React, { useState } from 'react';
import { DollarSign, ArrowUp, ArrowDown, Download, CreditCard, Wallet, PiggyBank, BarChart3, Target, Zap, Clock, CheckCircle2, AlertCircle, XCircle, RefreshCw, ChevronRight, ChevronDown, Briefcase, Globe, Smartphone, Database, Cloud, Code, Send, FileText, TrendingUp } from 'lucide-react';

export default function Revenue() {
  const [timeRange, setTimeRange] = useState('month');
  const [expandedService, setExpandedService] = useState<number | null>(null);

  const revenueMetrics = {
    total: { current: 847290, previous: 687450, target: 900000 },
    recurring: { current: 234500, previous: 198200, percentage: 27.7 },
    oneTime: { current: 612790, previous: 489250, percentage: 72.3 },
    outstanding: { current: 156000, previous: 189000, overdue: 23000 },
    avgDealSize: { current: 35304, previous: 29750, change: 18.7 },
    paymentCycle: { current: 18.5, previous: 21.3 }
  };

  const monthlyRevenue = [
    { month: 'Jan', revenue: 62000, recurring: 18000, oneTime: 44000, deals: 8 },
    { month: 'Feb', revenue: 71000, recurring: 19500, oneTime: 51500, deals: 9 },
    { month: 'Mar', revenue: 68000, recurring: 20100, oneTime: 47900, deals: 7 },
    { month: 'Apr', revenue: 79000, recurring: 21500, oneTime: 57500, deals: 10 },
    { month: 'May', revenue: 85000, recurring: 23200, oneTime: 61800, deals: 11 },
    { month: 'Jun', revenue: 92000, recurring: 24800, oneTime: 67200, deals: 12 },
    { month: 'Jul', revenue: 98000, recurring: 26400, oneTime: 71600, deals: 13 },
    { month: 'Aug', revenue: 104000, recurring: 28100, oneTime: 75900, deals: 14 },
    { month: 'Sep', revenue: 89000, recurring: 29500, oneTime: 59500, deals: 9 },
    { month: 'Oct', revenue: 96000, recurring: 31200, oneTime: 64800, deals: 11 },
    { month: 'Nov', revenue: 103000, recurring: 32800, oneTime: 70200, deals: 13 }
  ];

  const revenueByService = [
    { name: 'Web Development', revenue: 342000, deals: 28, avgDeal: 12214, growth: 18, color: 'emerald', icon: Globe },
    { name: 'Mobile Apps', revenue: 289000, deals: 22, avgDeal: 13136, growth: 22, color: 'blue', icon: Smartphone },
    { name: 'Cloud Services', revenue: 156000, deals: 45, avgDeal: 3467, growth: 12, color: 'purple', icon: Cloud },
    { name: 'API Development', revenue: 134000, deals: 18, avgDeal: 7444, growth: 15, color: 'cyan', icon: Database },
    { name: 'DevOps', revenue: 98000, deals: 32, avgDeal: 3063, growth: 9, color: 'amber', icon: Code }
  ];

  const recentInvoices = [
    { id: 'INV-1289', client: 'TechCorp Inc.', amount: 45000, status: 'paid', date: '2024-01-20', service: 'Web Development' },
    { id: 'INV-1290', client: 'FinanceHub', amount: 67000, status: 'paid', date: '2024-01-18', service: 'Mobile Apps' },
    { id: 'INV-1291', client: 'DataMinds', amount: 52000, status: 'pending', date: '2024-01-21', service: 'AI Development' },
    { id: 'INV-1292', client: 'SalesPro', amount: 34000, status: 'pending', date: '2024-01-22', service: 'API Development' },
    { id: 'INV-1293', client: 'RetailMax', amount: 42000, status: 'pending', date: '2024-01-19', service: 'Web Development' },
    { id: 'INV-1287', client: 'HealthTech Inc', amount: 89000, status: 'overdue', date: '2023-12-15', service: 'Cloud Services' }
  ];

  const projections = [
    { month: 'Dec', projected: 108000, confidence: 95, confirmed: 87000, pipeline: 145000 },
    { month: 'Jan', projected: 115000, confidence: 85, confirmed: 52000, pipeline: 198000 },
    { month: 'Feb', projected: 122000, confidence: 75, confirmed: 34000, pipeline: 234000 },
    { month: 'Mar', projected: 128000, confidence: 65, confirmed: 23000, pipeline: 287000 }
  ];

  const paymentMethods = [
    { method: 'Bank Transfer', count: 45, amount: 512000, percentage: 60.4, icon: Wallet, color: 'emerald' },
    { method: 'Credit Card', count: 28, amount: 234000, percentage: 27.6, icon: CreditCard, color: 'blue' },
    { method: 'PayPal', count: 15, amount: 78000, percentage: 9.2, icon: DollarSign, color: 'purple' },
    { method: 'Crypto', count: 4, amount: 23290, percentage: 2.8, icon: PiggyBank, color: 'amber' }
  ];

interface ColorClasses {
    bg: string;
    text: string;
    bgLight: string;
    border: string;
}

const getColorClasses = (color: string): ColorClasses => {
    const colors: Record<string, ColorClasses> = {
        emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', bgLight: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        blue: { bg: 'bg-blue-500', text: 'text-blue-400', bgLight: 'bg-blue-500/10', border: 'border-blue-500/20' },
        purple: { bg: 'bg-purple-500', text: 'text-purple-400', bgLight: 'bg-purple-500/10', border: 'border-purple-500/20' },
        cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', bgLight: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
        amber: { bg: 'bg-amber-500', text: 'text-amber-400', bgLight: 'bg-amber-500/10', border: 'border-amber-500/20' },
        pink: { bg: 'bg-pink-500', text: 'text-pink-400', bgLight: 'bg-pink-500/10', border: 'border-pink-500/20' },
        red: { bg: 'bg-red-500', text: 'text-red-400', bgLight: 'bg-red-500/10', border: 'border-red-500/20' }
    };
    return colors[color] || colors.blue;
};

interface StatusConfig {
    icon: React.ComponentType;
    label: string;
    text: string;
    bgLight: string;
    border: string;
}

const getStatusConfig = (status: string): StatusConfig => {
    const configs: Record<string, StatusConfig> = {
        paid: { icon: CheckCircle2, label: 'Paid', ...getColorClasses('emerald') },
        pending: { icon: Clock, label: 'Pending', ...getColorClasses('amber') },
        overdue: { icon: AlertCircle, label: 'Overdue', ...getColorClasses('red') },
        cancelled: { icon: XCircle, label: 'Cancelled', text: 'text-gray-400', bgLight: 'bg-gray-500/10', border: 'border-gray-500/20' }
    };
    return configs[status] || configs.pending;
};

  const RevenueChart = () => {
    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
    
    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-2 h-72">
          {monthlyRevenue.map((month, idx) => {
            const height = (month.revenue / maxRevenue) * 100;
            const recurringHeight = (month.recurring / month.revenue) * height;
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500/80 to-blue-400/80 rounded-t-lg transition-all duration-300 hover:from-blue-400 hover:to-blue-300 cursor-pointer"
                    style={{ height: `${Math.max(height - recurringHeight, 4)}%` }}
                  >
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 border border-gray-700 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 shadow-xl">
                      <div className="font-semibold mb-1">{month.month}</div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-400">Total:</span>
                          <span className="text-white font-medium">${(month.revenue / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-emerald-400">Recurring:</span>
                          <span className="text-white">${(month.recurring / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-blue-400">One-time:</span>
                          <span className="text-white">${(month.oneTime / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-400">Deals:</span>
                          <span className="text-white">{month.deals}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-300 hover:from-emerald-400 hover:to-emerald-300 cursor-pointer"
                    style={{ height: `${Math.max(recurringHeight, 4)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-medium">{month.month}</span>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500"></div>
            <span className="text-gray-400">Recurring Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-gray-400">One-time Projects</span>
          </div>
        </div>
      </div>
    );
  };

  const ProgressToTarget = () => {
    const current = revenueMetrics.total.current;
    const target = revenueMetrics.total.target;
    const percentage = (current / target) * 100;
    const remaining = target - current;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Target Progress</div>
            <div className="text-2xl font-bold text-white">${(current / 1000).toFixed(0)}K / ${(target / 1000).toFixed(0)}K</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Remaining</div>
            <div className="text-xl font-bold text-emerald-400">${(remaining / 1000).toFixed(0)}K</div>
          </div>
        </div>
        
        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
            {percentage.toFixed(1)}% Complete
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-gray-800/30 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-400">On Track</div>
            <div className="text-sm font-semibold text-emerald-400">Yes</div>
          </div>
          <div className="text-center p-2 bg-gray-800/30 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-400">Growth</div>
            <div className="text-sm font-semibold text-blue-400">+23.5%</div>
          </div>
          <div className="text-center p-2 bg-gray-800/30 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-400">Days Left</div>
            <div className="text-sm font-semibold text-purple-400">21</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
              Revenue Dashboard
            </h1>
            <p className="text-gray-400">Track income, invoices, and financial performance</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-xl p-1">
              {['today', 'week', 'month', 'quarter', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-emerald-500/50 transition-all group">
              <Download className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
              <span className="text-sm font-medium text-white">Export</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-emerald-500/30 rounded-2xl p-6 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
                  <ArrowUp className="w-4 h-4" />+23.5%
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">${(revenueMetrics.total.current / 1000).toFixed(0)}K</h3>
              <p className="text-sm text-gray-400 mb-3">Total Revenue</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Previous: ${(revenueMetrics.total.previous / 1000).toFixed(0)}K</span>
                <span>Target: ${(revenueMetrics.total.target / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-blue-500/30 rounded-2xl p-6 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <RefreshCw className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold">
                  <ArrowUp className="w-4 h-4" />+18.3%
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">${(revenueMetrics.recurring.current / 1000).toFixed(0)}K</h3>
              <p className="text-sm text-gray-400 mb-3">Recurring Revenue (MRR)</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Previous: ${(revenueMetrics.recurring.previous / 1000).toFixed(0)}K</span>
                <span className="text-blue-400 font-semibold">{revenueMetrics.recurring.percentage}% of total</span>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-amber-500/30 rounded-2xl p-6 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
                  <ArrowDown className="w-4 h-4" />-17.5%
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">${(revenueMetrics.outstanding.current / 1000).toFixed(0)}K</h3>
              <p className="text-sm text-gray-400 mb-3">Outstanding Invoices</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Previous: ${(revenueMetrics.outstanding.previous / 1000).toFixed(0)}K</span>
                <span className="text-red-400 font-semibold">${(revenueMetrics.outstanding.overdue / 1000).toFixed(0)}K overdue</span>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-purple-500/30 rounded-2xl p-6 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-semibold">
                  <ArrowUp className="w-4 h-4" />+{revenueMetrics.avgDealSize.change}%
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">${(revenueMetrics.avgDealSize.current / 1000).toFixed(1)}K</h3>
              <p className="text-sm text-gray-400 mb-3">Average Deal Size</p>
              <div className="text-xs text-gray-500">Previous: ${(revenueMetrics.avgDealSize.previous / 1000).toFixed(1)}K</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-cyan-500/30 rounded-2xl p-6 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
                  <ArrowDown className="w-4 h-4" />-13.1%
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">{revenueMetrics.paymentCycle.current}</h3>
              <p className="text-sm text-gray-400 mb-3">Avg Payment Cycle (Days)</p>
              <div className="text-xs text-gray-500">Previous: {revenueMetrics.paymentCycle.previous} days</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-pink-500/30 rounded-2xl p-6 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-pink-500/10 rounded-xl">
                  <Briefcase className="w-6 h-6 text-pink-400" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 text-sm font-semibold">
                  <ArrowUp className="w-4 h-4" />+25.2%
                </div>
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">${(revenueMetrics.oneTime.current / 1000).toFixed(0)}K</h3>
              <p className="text-sm text-gray-400 mb-3">One-time Projects</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Previous: ${(revenueMetrics.oneTime.previous / 1000).toFixed(0)}K</span>
                <span className="text-pink-400 font-semibold">{revenueMetrics.oneTime.percentage}% of total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  Revenue Breakdown
                </h3>
                <p className="text-sm text-gray-400 mt-1">Monthly recurring vs one-time revenue</p>
              </div>
              <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors">
                View Details<ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <RevenueChart />
          </div>

          <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Revenue Target
              </h3>
              <p className="text-sm text-gray-400 mt-1">Monthly goal progress</p>
            </div>
            <ProgressToTarget />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Recent Invoices
                </h3>
                <p className="text-sm text-gray-400 mt-1">Latest payment records</p>
              </div>
              <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View All</button>
            </div>
            
            <div className="space-y-3">
              {recentInvoices.map((invoice, idx) => {
                const config = getStatusConfig(invoice.status);
                const Icon = config.icon;
                
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 rounded-xl transition-all group cursor-pointer">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 ${config.bgLight} rounded-lg`}>
                        {Icon && React.createElement(Icon, { className: `w-4 h-4 ${config.text}` } as any)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{invoice.client}</span>
                          <span className="text-xs text-gray-500">{invoice.id}</span>
                        </div>
                        <div className="text-xs text-gray-400">{invoice.service}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white font-semibold">${(invoice.amount / 1000).toFixed(1)}K</div>
                        <div className="text-xs text-gray-500">{invoice.date}</div>
                      </div>
                      <div className={`px-2.5 py-1 ${config.bgLight} rounded-lg`}>
                        <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue by Service */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Revenue by Service
                </h3>
                <p className="text-sm text-gray-400 mt-1">Performance breakdown</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {revenueByService.map((service, idx) => {
                const colors = getColorClasses(service.color);
                const ServiceIcon = service.icon;
                const isExpanded = expandedService === idx;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div 
                      onClick={() => setExpandedService(isExpanded ? null : idx)}
                      className="flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 ${colors.bgLight} rounded-lg`}>
                          <ServiceIcon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{service.name}</span>
                            <div className={`px-2 py-0.5 ${colors.bgLight} rounded text-xs font-semibold ${colors.text}`}>
                              +{service.growth}%
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">{service.deals} deals</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-white font-semibold">${(service.revenue / 1000).toFixed(0)}K</div>
                          <div className="text-xs text-gray-500">Avg: ${(service.avgDeal / 1000).toFixed(1)}K</div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="ml-3 pl-6 border-l-2 border-gray-800 space-y-2 py-2">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-2 bg-gray-800/30 rounded-lg">
                            <div className="text-xs text-gray-400">Deals</div>
                            <div className="text-sm font-semibold text-white">{service.deals}</div>
                          </div>
                          <div className="p-2 bg-gray-800/30 rounded-lg">
                            <div className="text-xs text-gray-400">Avg Deal</div>
                            <div className="text-sm font-semibold text-white">${(service.avgDeal / 1000).toFixed(1)}K</div>
                          </div>
                          <div className="p-2 bg-gray-800/30 rounded-lg">
                            <div className="text-xs text-gray-400">Growth</div>
                            <div className={`text-sm font-semibold ${colors.text}`}>+{service.growth}%</div>
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

        {/* Revenue Projections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Revenue Projections
              </h3>
              <p className="text-sm text-gray-400 mt-1">Forecast for upcoming months</p>
            </div>
            
            <div className="space-y-4">
              {projections.map((proj, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{proj.month}</span>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 rounded text-xs font-semibold text-purple-400">
                        {proj.confidence}% confidence
                      </div>
                    </div>
                    <span className="text-white font-bold">${(proj.projected / 1000).toFixed(0)}K</span>
                  </div>
                  
                  <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                      style={{ width: `${(proj.confirmed / proj.pipeline) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-purple-500/30 rounded-full"
                      style={{ width: `${(proj.projected / proj.pipeline) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400">Confirmed: ${(proj.confirmed / 1000).toFixed(0)}K</span>
                    <span className="text-gray-500">Pipeline: ${(proj.pipeline / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                Payment Methods
              </h3>
              <p className="text-sm text-gray-400 mt-1">Distribution by payment type</p>
            </div>
            
            <div className="space-y-4">
              {paymentMethods.map((method, idx) => {
                const colors = getColorClasses(method.color);
                const MethodIcon = method.icon;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${colors.bgLight} rounded-lg`}>
                          <MethodIcon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{method.method}</div>
                          <div className="text-xs text-gray-400">{method.count} transactions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">${(method.amount / 1000).toFixed(0)}K</div>
                        <div className={`text-xs font-semibold ${colors.text}`}>{method.percentage}%</div>
                      </div>
                    </div>
                    
                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${colors.bg} rounded-full transition-all duration-500`}
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}