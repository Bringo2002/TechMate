import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Clock, CheckCircle, XCircle, Eye, RefreshCw,
  Calendar, DollarSign, FileText, Download, Zap, Smartphone, Brain,
  Palette, Code, Activity, Sparkles, AlertTriangle, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getOrderById, getOrderDeliverables } from '../../services/orders.service';
import { getUserInvoices } from '../../services/invoices.service';
import type { OrderRow, DeliverableRow, InvoiceRow } from '../../types/database.types';

// ============================================================================
// HELPERS
// ============================================================================

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const getProjectTypeIcon = (type: string) => {
  const icons: Record<string, React.ElementType> = {
    website: Code, app: Smartphone, consulting: Brain,
    design: Palette, backend: Activity, fullstack: Zap,
  };
  return icons[type] || Package;
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
    in_progress: { label: 'In Progress', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: RefreshCw },
    review: { label: 'Under Review', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Eye },
    completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
  };
  return configs[status] || configs['pending'];
};

const getDeliverableStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    in_progress: { label: 'In Progress', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    review: { label: 'Under Review', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10' },
    delivered: { label: 'Delivered', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  };
  return configs[status] || configs['pending'];
};

const getHealthColor = (score: number) => {
  if (score >= 80) return { color: 'text-emerald-400', bg: 'border-emerald-500/20 border-t-emerald-500', glow: 'bg-emerald-500/10' };
  if (score >= 50) return { color: 'text-amber-400', bg: 'border-amber-500/20 border-t-amber-500', glow: 'bg-amber-500/10' };
  return { color: 'text-red-400', bg: 'border-red-500/20 border-t-red-500', glow: 'bg-red-500/10' };
};

// ============================================================================
// SKELETON
// ============================================================================
const Skeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-800 rounded-lg" />
      <div className="h-6 w-48 bg-slate-800 rounded" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-[#0a0a16]/40 rounded-2xl p-6 border border-white/5">
          <div className="h-4 w-24 bg-slate-800 rounded mb-3" />
          <div className="h-8 w-20 bg-slate-800 rounded" />
        </div>
      ))}
    </div>
    <div className="bg-[#0a0a16]/40 rounded-2xl p-6 border border-white/5">
      <div className="h-5 w-32 bg-slate-800 rounded mb-4" />
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 bg-slate-800/30 rounded-lg mb-3" />
      ))}
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);

    const { data, error: err } = await getOrderById(orderId);
    if (err || !data) {
      setError(err?.message || 'Order not found');
      setLoading(false);
      return;
    }

    setOrder(data);

    // Load deliverables and related invoices in parallel
    const [delRes, invRes] = await Promise.all([
      getOrderDeliverables(orderId),
      getUserInvoices(data.user_id),
    ]);

    setDeliverables(delRes.data ?? []);
    // Filter invoices related to this order
    setInvoices((invRes.data ?? []).filter(inv => inv.order_id === orderId));
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching is a standard effect pattern
    if (orderId) loadOrder();
  }, [orderId, loadOrder]);

  if (loading) return <Skeleton />;

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{error || 'Order not found'}</h3>
        <button onClick={() => navigate('/user/orders')} className="text-cyan-400 hover:underline mt-2">
          ← Back to Orders
        </button>
      </div>
    );
  }

  const projectIconComponent = getProjectTypeIcon(order.type);
  const status = getStatusConfig(order.status);
  const health = getHealthColor(order.health_score);
  const budgetUsed = order.budget > 0 ? Math.round((order.spent / order.budget) * 100) : 0;

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-15 z-0">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Back nav + Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/user/orders')}
            className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Back to Orders
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center text-cyan-400 border border-white/5 shadow-inner">
                {React.createElement(projectIconComponent, { size: 28 })}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white font-orbitron">{order.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-500 text-sm capitalize">{order.type}</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-slate-500 text-sm">Created {formatDate(order.created_at)}</span>
                </div>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border ${status.bg} ${status.color} ${status.border}`}>
              <status.icon size={16} /> {status.label}
            </div>
          </div>
        </div>

        {/* Description */}
        {order.description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-8"
          >
            <p className="text-slate-300 leading-relaxed">{order.description}</p>
          </motion.div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Budget', value: formatCurrency(order.budget), sub: `${budgetUsed}% used`, color: 'amber', icon: DollarSign },
            { label: 'Spent', value: formatCurrency(order.spent), sub: `of ${formatCurrency(order.budget)}`, color: 'cyan', icon: DollarSign },
            { label: 'Progress', value: `${order.progress}%`, sub: order.next_milestone || 'No milestone set', color: 'purple', icon: Target },
            { label: 'Health', value: `${order.health_score}%`, sub: order.health_score >= 80 ? 'Excellent' : order.health_score >= 50 ? 'Fair' : 'At Risk', color: order.health_score >= 80 ? 'emerald' : order.health_score >= 50 ? 'amber' : 'red', icon: Activity },
          ].map((kpi, i) => {
            const bgMap: Record<string, string> = { cyan: 'bg-cyan-500/10', emerald: 'bg-emerald-500/10', amber: 'bg-amber-500/10', purple: 'bg-purple-500/10', red: 'bg-red-500/10' };
            const textMap: Record<string, string> = { cyan: 'text-cyan-400', emerald: 'text-emerald-400', amber: 'text-amber-400', purple: 'text-purple-400', red: 'text-red-400' };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 ${bgMap[kpi.color]} rounded-lg ${textMap[kpi.color]} group-hover:scale-110 transition-transform`}>
                    <kpi.icon size={18} />
                  </div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{kpi.label}</p>
                </div>
                <p className={`text-2xl font-bold ${textMap[kpi.color]} font-orbitron`}>{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-1 truncate">{kpi.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Target size={18} className="text-cyan-400" /> Overall Progress
            </h3>
            <span className="text-cyan-400 font-mono font-bold">{order.progress}%</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${order.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            <span>Started {formatDate(order.started_at)}</span>
            <span>Due {formatDate(order.due_date)}</span>
          </div>
        </motion.div>

        {/* Two Columns: Deliverables + Timeline/Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deliverables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-purple-400" />
              Deliverables
              <span className="text-xs text-slate-500 font-normal ml-auto">{deliverables.length} items</span>
            </h3>

            {deliverables.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Package size={32} className="mx-auto mb-3 text-slate-700" />
                <p>No deliverables yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deliverables.map((del, i) => {
                  const ds = getDeliverableStatusConfig(del.status);
                  return (
                    <motion.div
                      key={del.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-slate-800/20 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{del.name}</p>
                        <p className="text-slate-500 text-xs truncate">{del.description || 'No description'}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {del.file_url && (
                          <a
                            href={del.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                            title="Download"
                            onClick={e => e.stopPropagation()}
                          >
                            <Download size={16} />
                          </a>
                        )}
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${ds.color} ${ds.bg}`}>
                          {ds.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Right Column: Key Dates + Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-6"
          >
            {/* Key Dates */}
            <div className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" /> Timeline
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Created', date: order.created_at },
                  { label: 'Started', date: order.started_at },
                  { label: 'Due Date', date: order.due_date },
                  { label: 'Completed', date: order.completed_at },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={item.date ? 'text-white' : 'text-slate-600'}>{formatDate(item.date)}</span>
                  </div>
                ))}
              </div>
              {order.next_milestone && (
                <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-xs text-purple-400 font-medium uppercase tracking-wider mb-1">Next Milestone</p>
                  <p className="text-sm text-white">{order.next_milestone}</p>
                </div>
              )}
            </div>

            {/* Related Invoices */}
            <div className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-400" /> Invoices
              </h3>
              {invoices.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No invoices linked</p>
              ) : (
                <div className="space-y-3">
                  {invoices.map(inv => {
                    const statusColors: Record<string, string> = {
                      paid: 'text-emerald-400 bg-emerald-500/10',
                      pending: 'text-amber-400 bg-amber-500/10',
                      overdue: 'text-red-400 bg-red-500/10',
                      draft: 'text-slate-400 bg-slate-500/10',
                    };
                    return (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-800/20 rounded-lg border border-white/5">
                        <div>
                          <p className="text-white text-sm font-medium">{inv.invoice_number}</p>
                          <p className="text-slate-500 text-xs">{formatDate(inv.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-mono">{formatCurrency(inv.total_amount)}</p>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${statusColors[inv.status] || statusColors['draft']}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => navigate('/user/billing')}
                className="w-full mt-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors py-2"
              >
                View all invoices →
              </button>
            </div>

            {/* Health Score */}
            <div className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-center gap-2">
                <Sparkles size={18} className="text-cyan-400" /> Health Score
              </h3>
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${health.bg} ${health.glow} mb-3`}>
                <span className={`text-3xl font-bold ${health.color} font-orbitron`}>{order.health_score}</span>
              </div>
              <p className={`text-sm font-medium ${health.color}`}>
                {order.health_score >= 80 ? 'Excellent' : order.health_score >= 50 ? 'Fair' : 'At Risk'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
