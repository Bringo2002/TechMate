import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Clock, CheckCircle, XCircle, Eye,
  Calendar, DollarSign, FileText, Zap, Smartphone, Brain,
  Palette, Code, Activity, Sparkles, AlertTriangle, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getInquiryById } from '../../services/inquiries.service';
import type { ClientInquiryRow } from '../../types/database.types';

// ============================================================================
// HELPERS
// ============================================================================

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const getProjectTypeIcon = (type: string) => {
  const icons: Record<string, React.ElementType> = {
    website: Code, web_app: Code, mobile_app: Smartphone, app: Smartphone,
    consulting: Brain, design: Palette, backend: Activity, fullstack: Zap,
    maintenance: Activity, custom_software: Code,
  };
  return icons[type] || Package;
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
    new: { label: 'Submitted', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: Sparkles },
    reviewing: { label: 'Reviewing', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Eye },
    discovery_call_scheduled: { label: 'Discovery Call Scheduled', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Calendar },
    discovery_call_completed: { label: 'Discovery Call Done', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle },
    quoted: { label: 'Quoted', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: FileText },
    proposal_sent: { label: 'Proposal Sent', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: FileText },
    accepted: { label: 'Accepted', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
    declined: { label: 'Declined', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
    on_hold: { label: 'On Hold', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Clock },
  };
  return configs[status] || configs['new'];
};

const getPriorityConfig = (priority: string | null) => {
  const configs: Record<string, { label: string; color: string; bg: string }> = {
    low:    { label: 'Low',    color: 'text-slate-400', bg: 'bg-slate-500/10' },
    medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    high:   { label: 'High',   color: 'text-orange-400', bg: 'bg-orange-500/10' },
    urgent: { label: 'Urgent', color: 'text-red-400', bg: 'bg-red-500/10' },
  };
  return priority ? configs[priority] || configs['medium'] : null;
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
export default function RequestDetail() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<ClientInquiryRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInquiry = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);

    const { data, error: err } = await getInquiryById(requestId);

    if (err || !data) {
      setError(err?.message || 'Request not found');
      setLoading(false);
      return;
    }

    setInquiry(data);
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching is a standard effect pattern
    if (requestId) loadInquiry();
  }, [requestId, loadInquiry]);

  if (loading) return <Skeleton />;

  if (error || !inquiry) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{error || 'Request not found'}</h3>
        <button onClick={() => navigate('/user/orders')} className="text-cyan-400 hover:underline mt-2">
          ← Back to Orders
        </button>
      </div>
    );
  }

  const projectIconComponent = getProjectTypeIcon(inquiry.project_type);
  const status = getStatusConfig(inquiry.status);
  const priority = getPriorityConfig(inquiry.priority);
  const requirements = Array.isArray(inquiry.requirements) ? inquiry.requirements : [];
  const attachments = Array.isArray(inquiry.attachments) ? inquiry.attachments : [];
  const budgetMin = inquiry.budget_min ?? 0;
  const budgetMax = inquiry.budget_max ?? 0;

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
                <h1 className="text-2xl md:text-3xl font-bold text-white font-orbitron">{inquiry.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-500 text-sm capitalize">{inquiry.project_type.replace(/_/g, ' ')}</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-slate-500 text-sm">Submitted {formatDate(inquiry.created_at)}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    REQUEST
                  </span>
                </div>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border ${status.bg} ${status.color} ${status.border}`}>
              <status.icon size={16} /> {status.label}
            </div>
          </div>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-white font-bold flex items-center gap-2 mb-3">
            <Info size={18} className="text-cyan-400" /> Description
          </h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{inquiry.description}</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Budget Range',
              value: inquiry.budget_range || (budgetMin || budgetMax ? `${formatCurrency(budgetMin)} – ${formatCurrency(budgetMax)}` : '—'),
              sub: budgetMax > 0 ? `Up to ${formatCurrency(budgetMax)}` : 'Not specified',
              color: 'amber',
              icon: DollarSign,
            },
            {
              label: 'Timeline',
              value: inquiry.preferred_timeline || '—',
              sub: inquiry.deadline ? `Due ${formatDate(inquiry.deadline)}` : 'No deadline',
              color: 'cyan',
              icon: Calendar,
            },
            {
              label: 'Priority',
              value: priority?.label || 'Not set',
              sub: 'Assigned priority',
              color: inquiry.priority === 'urgent' || inquiry.priority === 'high' ? 'red' : inquiry.priority === 'medium' ? 'amber' : 'purple',
              icon: Sparkles,
            },
            {
              label: 'Status',
              value: status.label,
              sub: `Updated ${formatDate(inquiry.updated_at)}`,
              color: 'emerald',
              icon: Activity,
            },
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

        {/* Two Columns: Requirements + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-purple-400" />
              Requirements
              <span className="text-xs text-slate-500 font-normal ml-auto">{requirements.length} items</span>
            </h3>

            {requirements.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Package size={32} className="mx-auto mb-3 text-slate-700" />
                <p>No specific requirements listed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requirements.map((req: unknown, i: number) => {
                  const reqObj = req as Record<string, unknown>;
                  const text = typeof req === 'string' ? req : (reqObj.description as string) || (reqObj.text as string) || JSON.stringify(req);
                  return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-start gap-4 p-4 bg-slate-800/20 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <span className="text-xs font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{text}</p>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <FileText size={14} className="text-cyan-400" /> Attachments
                </h4>
                <div className="space-y-2">
                  {attachments.map((att: unknown, i: number) => {
                    const attObj = att as Record<string, unknown>;
                    const label = typeof att === 'string' ? att : (attObj.name as string) || (attObj.filename as string) || 'Attachment';
                    return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/20 rounded-lg border border-white/5">
                      <FileText size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-300 truncate">{label}</span>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column: Timeline + Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-6"
          >
            {/* Timeline */}
            <div className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" /> Timeline
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Submitted', date: inquiry.created_at },
                  { label: 'Deadline', date: inquiry.deadline },
                  { label: 'First Response', date: inquiry.first_response_at },
                  { label: 'Last Updated', date: inquiry.updated_at },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={item.date ? 'text-white' : 'text-slate-600'}>{formatDate(item.date)}</span>
                  </div>
                ))}
              </div>
              {inquiry.preferred_timeline && (
                <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-xs text-purple-400 font-medium uppercase tracking-wider mb-1">Preferred Timeline</p>
                  <p className="text-sm text-white">{inquiry.preferred_timeline}</p>
                </div>
              )}
            </div>

            {/* Budget Details */}
            <div className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-400" /> Budget Details
              </h3>
              <div className="space-y-4">
                {inquiry.budget_range && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Range</span>
                    <span className="text-white">{inquiry.budget_range}</span>
                  </div>
                )}
                {budgetMin > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Minimum</span>
                    <span className="text-white font-mono">{formatCurrency(budgetMin)}</span>
                  </div>
                )}
                {budgetMax > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Maximum</span>
                    <span className="text-white font-mono">{formatCurrency(budgetMax)}</span>
                  </div>
                )}
                {!inquiry.budget_range && budgetMin === 0 && budgetMax === 0 && (
                  <p className="text-slate-500 text-sm text-center py-2">Budget not specified</p>
                )}
              </div>
            </div>

            {/* Source Info */}
            {inquiry.source && (
              <div className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" /> Source
                </h3>
                <span className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 text-sm font-medium capitalize border border-cyan-500/20">
                  {inquiry.source}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
