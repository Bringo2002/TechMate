import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle,
  Activity,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import supabase from '../../lib/supabaseClient';
import type { OrderRow, InvoiceRow } from '../../types/database.types';

// ============================================================================
// HELPERS
// ============================================================================

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-white text-xs font-semibold">{label}</p>
      {payload.map((p, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name?.includes('$') ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Stats() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);

   
  useEffect(() => {
    if (user) loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [ordersRes, invoicesRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: true }),
        supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: true }),
      ]);

      setOrders(ordersRes.data ?? []);
      setInvoices(invoicesRes.data ?? []);
    } catch {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status === 'in_progress' || o.status === 'review').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalBudget = orders.reduce((sum, o) => sum + (o.budget || 0), 0);
  const totalSpent = orders.reduce((sum, o) => sum + (o.spent || 0), 0);
  const avgProgress = totalOrders > 0 ? Math.round(orders.reduce((sum, o) => sum + (o.progress || 0), 0) / totalOrders) : 0;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);
  // Suppress unused variable warnings - these stats are computed for future use
  void totalInvoiced;
  void totalPaid;

  // Chart: Orders by status
  const statusData = [
    { name: 'Active', value: orders.filter(o => o.status === 'in_progress').length },
    { name: 'Review', value: orders.filter(o => o.status === 'review').length },
    { name: 'Completed', value: completedOrders },
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length },
  ].filter(d => d.value > 0);

  // Chart: Orders by type
  const typeGroups = orders.reduce<Record<string, number>>((acc, o) => {
    const type = o.type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const typeData = Object.entries(typeGroups).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value,
  }));

  // Chart: Monthly spend over time
  const monthlySpend = invoices.reduce<Record<string, number>>((acc, inv) => {
    const month = new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + (inv.total_amount || inv.amount || 0);
    return acc;
  }, {});
  const spendData = Object.entries(monthlySpend).map(([month, amount]) => ({ month, amount }));

  // Chart: Budget vs Spent per order
  const budgetData = orders
    .filter(o => o.budget > 0)
    .slice(-8) // Last 8 orders for readability
    .map(o => ({
      name: o.title?.slice(0, 12) + (o.title && o.title.length > 12 ? '...' : ''),
      budget: o.budget,
      spent: o.spent,
    }));

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#0a0a16]/40 rounded-2xl p-5 border border-white/5 animate-pulse">
              <div className="h-3 w-20 bg-slate-800 rounded mb-3" />
              <div className="h-7 w-16 bg-slate-800 rounded mb-2" />
              <div className="h-3 w-24 bg-slate-800/50 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#0a0a16]/40 rounded-2xl p-6 border border-white/5 animate-pulse">
              <div className="h-5 w-32 bg-slate-800 rounded mb-4" />
              <div className="h-48 bg-slate-800/30 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8 min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-15 z-0">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white font-orbitron flex items-center gap-3">
              <BarChart3 className="text-purple-400" />
              Statistics
            </h1>
            <p className="text-slate-400 mt-1">Your project and spending analytics at a glance.</p>
          </div>
          <button
            onClick={loadData}
            className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors px-4 py-2 bg-slate-800/60 rounded-xl border border-white/10 hover:border-white/20"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: totalOrders.toString(), icon: Package, color: 'cyan', sub: `${activeOrders} active` },
            { label: 'Completed', value: completedOrders.toString(), icon: CheckCircle, color: 'emerald', sub: `${completionRate}% rate` },
            { label: 'Total Invested', value: formatCurrency(totalSpent), icon: DollarSign, color: 'amber', sub: `of ${formatCurrency(totalBudget)}` },
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: Activity, color: 'purple', sub: `across all projects` },
          ].map((kpi, i) => {
            const bgMap: Record<string, string> = { cyan: 'bg-cyan-500/10', emerald: 'bg-emerald-500/10', amber: 'bg-amber-500/10', purple: 'bg-purple-500/10' };
            const textMap: Record<string, string> = { cyan: 'text-cyan-400', emerald: 'text-emerald-400', amber: 'text-amber-400', purple: 'text-purple-400' };
            const borderMap: Record<string, string> = { cyan: 'hover:border-cyan-500/20', emerald: 'hover:border-emerald-500/20', amber: 'hover:border-amber-500/20', purple: 'hover:border-purple-500/20' };

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl ${borderMap[kpi.color]} transition-all group`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 ${bgMap[kpi.color]} rounded-lg ${textMap[kpi.color]} group-hover:scale-110 transition-transform`}>
                    <kpi.icon size={18} />
                  </div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{kpi.label}</p>
                </div>
                <p className={`text-2xl font-bold ${textMap[kpi.color]} font-orbitron`}>{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Grid */}
        {totalOrders === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#0a0a16]/40 rounded-2xl border border-white/5 border-dashed"
          >
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={32} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No data yet</h3>
            <p className="text-slate-400">Your analytics will populate once you have active projects.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget vs Spent */}
            {budgetData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign size={18} className="text-amber-400" />
                  Budget vs Spent
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={budgetData} barGap={4}>
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="budget" fill="#1e40af" radius={[4, 4, 0, 0]} name="Budget ($)" />
                    <Bar dataKey="spent" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Spent ($)" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 mt-3 justify-center">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><div className="w-3 h-3 rounded-sm bg-[#1e40af]" /> Budget</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400"><div className="w-3 h-3 rounded-sm bg-cyan-500" /> Spent</div>
                </div>
              </motion.div>
            )}

            {/* Project Status Distribution */}
            {statusData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-purple-400" />
                  Project Status
                </h3>
                <div className="flex items-center">
                  <ResponsiveContainer width="60%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2 pl-4">
                    {statusData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-slate-400 text-xs">{d.name}</span>
                        </div>
                        <span className="text-white font-semibold text-xs">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Project Types */}
            {typeData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Package size={18} className="text-cyan-400" />
                  Project Types
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={typeData} layout="vertical" barSize={18}>
                    <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Projects" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Monthly Spend Trend */}
            {spendData.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" />
                  Monthly Investment
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={spendData}>
                    <defs>
                      <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="amount" stroke="#06b6d4" fill="url(#spendGrad)" strokeWidth={2} name="Investment ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-4 mt-4"
        >
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-slate-600" />
            Data sourced from your real project and invoice history
          </p>
        </motion.div>
      </div>
    </div>
  );
}
