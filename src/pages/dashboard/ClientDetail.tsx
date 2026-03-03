// ============================================================================
// TechMate Client Detail Page — Production
// Shows full client profile, projects, invoices and activity
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, RefreshCw, Loader2, AlertTriangle, Mail, Building2,
    DollarSign, TrendingUp, Star, CheckCircle2, Award, CircleDot,
    Sparkles, Calendar, FolderOpen, FileText,
} from 'lucide-react';
import { getClientById } from '../../services/admin.service';
import type { ClientDetail as ClientDetailType } from '../../services/admin.service';
import type { ProjectRow, InvoiceRow } from '../../types/database.types';

// ============================================================================
// Helpers
// ============================================================================
const fmtCurrency = (n: number): string => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
};

const COLOR_MAP: Record<string, string> = {
    emerald: '#34d399', blue: '#60a5fa', amber: '#fbbf24', red: '#f87171', gray: '#9ca3af',
};

const getHealthColor = (score: number): string => {
    if (score >= 90) return 'emerald';
    if (score >= 75) return 'blue';
    if (score >= 60) return 'amber';
    return 'red';
};

const getHealthLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'At Risk';
};

const getInitials = (name: string): string =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const getRelationshipInfo = (status: ClientDetailType['status']) => {
    const map: Record<ClientDetailType['status'], { label: string; color: string; Icon: React.ElementType }> = {
        champion:  { label: 'Champion',       color: 'emerald', Icon: Award },
        active:    { label: 'Active',         color: 'blue',    Icon: CheckCircle2 },
        'at-risk': { label: 'Needs Attention', color: 'amber',   Icon: AlertTriangle },
        inactive:  { label: 'Inactive',       color: 'gray',    Icon: CircleDot },
    };
    return map[status] ?? map.inactive;
};

const statusColors: Record<string, string> = {
    active: 'emerald', in_progress: 'blue', completed: 'green', cancelled: 'red',
    on_hold: 'amber', planning: 'purple', pending: 'yellow',
};

const invoiceStatusColors: Record<string, string> = {
    paid: 'emerald', pending: 'amber', overdue: 'red', cancelled: 'gray', draft: 'gray',
};

// ============================================================================
// Sub-components
// ============================================================================

const HealthRing: React.FC<{ score: number; size?: number }> = ({ score, size = 80 }) => {
    const color = getHealthColor(score);
    const hex = COLOR_MAP[color] ?? COLOR_MAP.gray;
    const r = (size / 2) - 6;
    const circumference = 2 * Math.PI * r;
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" style={{ width: size, height: size }}>
                <circle cx={size / 2} cy={size / 2} r={r}
                    stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-800" />
                <circle cx={size / 2} cy={size / 2} r={r}
                    stroke={hex} strokeWidth="4" fill="none"
                    strokeDasharray={strokeDasharray} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                {score}
            </span>
        </div>
    );
};

const StatCard: React.FC<{
    icon: React.ElementType; label: string; value: string; color?: string;
}> = ({ icon: Icon, label, value, color = 'emerald' }) => {
    const hex = COLOR_MAP[color] ?? COLOR_MAP.gray;
    return (
        <div className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${hex}15` }}>
                    <Icon className="w-5 h-5" style={{ color: hex }} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                </div>
            </div>
        </div>
    );
};

const ProjectCard: React.FC<{ project: ProjectRow; onNavigate: (id: string) => void }> = ({ project, onNavigate }) => {
    const sColor = statusColors[project.status] ?? 'gray';
    const hex = COLOR_MAP[sColor] ?? COLOR_MAP.gray;

    return (
        <div
            role="button" tabIndex={0}
            className="p-4 bg-gray-900/50 border border-gray-800/50 hover:border-emerald-500/30 rounded-xl cursor-pointer transition-all"
            onClick={() => onNavigate(project.id)}
            onKeyDown={e => { if (e.key === 'Enter') onNavigate(project.id); }}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white truncate max-w-[70%]">{project.name}</h4>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: hex, backgroundColor: `${hex}15` }}>
                    {project.status.replace('_', ' ')}
                </span>
            </div>
            {project.description && (
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">{project.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {fmtCurrency(project.budget)}
                </span>
                <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {project.client_visible_progress ?? project.progress}%
                </span>
                {project.deadline && (
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(project.deadline).toLocaleDateString()}
                    </span>
                )}
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all"
                    style={{
                        width: `${Math.min(project.client_visible_progress ?? project.progress, 100)}%`,
                        backgroundColor: hex,
                    }}
                />
            </div>
        </div>
    );
};

const InvoiceCard: React.FC<{ invoice: InvoiceRow }> = ({ invoice }) => {
    const sColor = invoiceStatusColors[invoice.status] ?? 'gray';
    const hex = COLOR_MAP[sColor] ?? COLOR_MAP.gray;

    return (
        <div className="p-4 bg-gray-900/50 border border-gray-800/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800/50 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                    <div className="text-sm font-medium text-white">{invoice.invoice_number}</div>
                    <div className="text-xs text-gray-500">
                        {new Date(invoice.created_at).toLocaleDateString()}
                        {invoice.due_date && ` • Due ${new Date(invoice.due_date).toLocaleDateString()}`}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{fmtCurrency(invoice.total_amount ?? invoice.amount)}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                    style={{ color: hex, backgroundColor: `${hex}15` }}>
                    {invoice.status}
                </span>
            </div>
        </div>
    );
};

// ============================================================================
// Main Component
// ============================================================================
const ClientDetail: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<ClientDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'projects' | 'invoices'>('projects');

    const fetchClient = useCallback(async () => {
        if (!clientId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getClientById(clientId);
            if (result.error) {
                setError(result.error.message);
            }
            setClient(result.data ?? null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load client');
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        fetchClient();
    }, [fetchClient]);

    const handleProjectNavigate = useCallback((projectId: string) => {
        navigate(`/dashboard/projects/${projectId}`);
    }, [navigate]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <span className="text-gray-400">Loading client data…</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !client) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
                    <h2 className="text-xl font-semibold text-white">Client Not Found</h2>
                    <p className="text-gray-400">{error ?? 'The requested client could not be loaded.'}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => navigate('/dashboard/clients')}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-all">
                            Back to Clients
                        </button>
                        <button onClick={fetchClient}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { label: statusLabel, color: statusColor, Icon: StatusIcon } = getRelationshipInfo(client.status);
    const statusHex = COLOR_MAP[statusColor] ?? COLOR_MAP.gray;
    const healthHex = COLOR_MAP[getHealthColor(client.healthScore)] ?? COLOR_MAP.gray;

    return (
        <div className="space-y-8">
            {/* Back nav */}
            <button onClick={() => navigate('/dashboard/clients')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Clients</span>
            </button>

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-purple-900/20 border border-emerald-500/20 rounded-3xl p-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                    {/* Left: Avatar + Info */}
                    <div className="flex items-start gap-5 flex-1">
                        {client.avatarUrl ? (
                            <img src={client.avatarUrl} alt=""
                                className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-emerald-500/20" />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/20">
                                {getInitials(client.name)}
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-white truncate">{client.name}</h1>
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                    style={{ color: statusHex, backgroundColor: `${statusHex}15` }}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {statusLabel}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                                <span className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" /> {client.email}
                                </span>
                                {client.company && (
                                    <span className="flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4" /> {client.company}
                                    </span>
                                )}
                                {client.industry && (
                                    <span className="flex items-center gap-1.5">
                                        <FolderOpen className="w-4 h-4" /> {client.industry}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" /> Joined {new Date(client.joinedAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Technologies */}
                            {client.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {client.technologies.map(t => (
                                        <span key={t} className="px-2 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-gray-400">{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Health Ring + Refresh */}
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <HealthRing score={client.healthScore} />
                            <div className="mt-2 text-sm font-semibold" style={{ color: healthHex }}>
                                {getHealthLabel(client.healthScore)}
                            </div>
                            <div className="text-xs text-gray-500">Health Score</div>
                        </div>
                        <button onClick={fetchClient} title="Refresh"
                            className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all">
                            <RefreshCw className="w-5 h-5 text-emerald-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={DollarSign} label="Total Revenue" value={fmtCurrency(client.totalRevenue)} color="emerald" />
                <StatCard icon={TrendingUp} label="Total Budget" value={fmtCurrency(client.totalBudget)} color="blue" />
                <StatCard icon={Star} label="Active Projects" value={String(client.projects.active)} color="amber" />
                <StatCard icon={CheckCircle2} label="Completed" value={String(client.projects.completed)} color="emerald" />
            </div>

            {/* Budget usage bar */}
            {client.totalBudget > 0 && (
                <div className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Budget Utilisation</span>
                        <span className="text-sm font-semibold text-white">
                            {fmtCurrency(client.totalSpent)} / {fmtCurrency(client.totalBudget)}
                            {' '}({Math.round((client.totalSpent / client.totalBudget) * 100)}%)
                        </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all bg-emerald-400"
                            style={{ width: `${Math.min(Math.round((client.totalSpent / client.totalBudget) * 100), 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Risks & Opportunities */}
            {(client.risks.length > 0 || client.opportunities.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {client.risks.length > 0 && (
                        <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <h3 className="font-semibold text-red-400">
                                    {client.risks.length} Risk{client.risks.length !== 1 ? 's' : ''}
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {client.risks.map((r, i) => (
                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                        <span className="text-red-400 mt-1">•</span> {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {client.opportunities.length > 0 && (
                        <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-semibold text-emerald-400">
                                    {client.opportunities.length} Opportunit{client.opportunities.length !== 1 ? 'ies' : 'y'}
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {client.opportunities.map((o, i) => (
                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                        <span className="text-emerald-400 mt-1">•</span> {o}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Tabs: Projects / Invoices */}
            <div>
                <div className="flex gap-2 mb-6">
                    <button onClick={() => setActiveTab('projects')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === 'projects'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700'
                        }`}>
                        <span className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            Projects ({client.projectList.length})
                        </span>
                    </button>
                    <button onClick={() => setActiveTab('invoices')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === 'invoices'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700'
                        }`}>
                        <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Invoices ({client.invoices.length})
                        </span>
                    </button>
                </div>

                {activeTab === 'projects' && (
                    client.projectList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {client.projectList.map(project => (
                                <ProjectCard key={project.id} project={project} onNavigate={handleProjectNavigate} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p>No projects yet</p>
                        </div>
                    )
                )}

                {activeTab === 'invoices' && (
                    client.invoices.length > 0 ? (
                        <div className="space-y-3">
                            {client.invoices.map(invoice => (
                                <InvoiceCard key={invoice.id} invoice={invoice} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p>No invoices yet</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ClientDetail;
