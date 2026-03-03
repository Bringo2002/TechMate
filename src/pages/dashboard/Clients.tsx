// ============================================================================
// TechMate Client Relationship Hub — Production
// Renders real client data from Supabase via useClients hook
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
    Users, TrendingUp, DollarSign, Star, Award, AlertTriangle,
    CheckCircle2, MessageSquare, Sparkles, Search, Download,
    MoreVertical, CircleDot, RefreshCw, Loader2,
} from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import type { ClientStats } from '../../services/admin.service';

// ============================================================================
// Helpers
// ============================================================================
type FilterType = 'all' | 'active' | 'at-risk' | 'champions';
type SortType = 'revenue' | 'health' | 'projects';

const fmtCurrency = (n: number): string => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
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

const getRelationshipInfo = (status: ClientStats['status']) => {
    const map: Record<ClientStats['status'], { label: string; color: string; Icon: React.ElementType }> = {
        champion:  { label: 'Champion',       color: 'emerald', Icon: Award },
        active:    { label: 'Active',         color: 'blue',    Icon: CheckCircle2 },
        'at-risk': { label: 'Needs Attention', color: 'amber',   Icon: AlertTriangle },
        inactive:  { label: 'Inactive',       color: 'gray',    Icon: CircleDot },
    };
    return map[status] ?? map.inactive;
};

const timeAgo = (iso: string | null): string => {
    if (!iso) return 'N/A';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

// Fixed color map for inline SVG (Tailwind JIT can't generate from runtime strings)
const COLOR_MAP: Record<string, string> = {
    emerald: '#34d399', blue: '#60a5fa', amber: '#fbbf24', red: '#f87171', gray: '#9ca3af',
};

// ============================================================================
// Sub-components (hoisted & memoized)
// ============================================================================
const HealthScore = React.memo(({ score }: { score: number }) => {
    const color = getHealthColor(score);
    const hex = COLOR_MAP[color] ?? COLOR_MAP.gray;
    const circumference = 2 * Math.PI * 24;
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

    return (
        <div className="flex items-center gap-2">
            <div className="relative w-14 h-14">
                <svg className="transform -rotate-90 w-14 h-14">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-800" />
                    <circle cx="28" cy="28" r="24" stroke={hex} strokeWidth="3" fill="none"
                        strokeDasharray={strokeDasharray} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{score}</span>
            </div>
            <div>
                <div className="text-sm font-semibold" style={{ color: hex }}>{getHealthLabel(score)}</div>
                <div className="text-xs text-gray-500">Health</div>
            </div>
        </div>
    );
});
HealthScore.displayName = 'HealthScore';

const RelationshipBadge = React.memo(({ status }: { status: ClientStats['status'] }) => {
    const { label, color, Icon } = getRelationshipInfo(status);
    const hex = COLOR_MAP[color] ?? COLOR_MAP.gray;
    return (
        <div className="flex items-center gap-1.5" style={{ color: hex }}>
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    );
});
RelationshipBadge.displayName = 'RelationshipBadge';

// --------------- Client Card ---------------
interface ClientCardProps { client: ClientStats; isExpanded: boolean; onToggle: () => void; }

const ClientCard = React.memo(({ client, isExpanded, onToggle }: ClientCardProps) => {
    const healthHex = COLOR_MAP[getHealthColor(client.healthScore)] ?? COLOR_MAP.gray;

    return (
        <div
            role="button" tabIndex={0}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-emerald-500/30 rounded-2xl p-6 transition-all cursor-pointer"
            onClick={onToggle}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-all"
                style={{ backgroundColor: `${healthHex}10` }} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {client.avatarUrl ? (
                            <img src={client.avatarUrl} alt="" className="w-14 h-14 rounded-xl object-cover shadow-lg shadow-emerald-500/20" />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
                                {getInitials(client.name)}
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                                {client.name}
                            </h3>
                            <p className="text-sm text-gray-400 truncate max-w-[180px]">
                                {[client.industry, client.company].filter(Boolean).join(' • ') || client.email}
                            </p>
                        </div>
                    </div>
                    <button title="More options" className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={e => e.stopPropagation()}>
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Health & Relationship */}
                <div className="flex items-center justify-between mb-4">
                    <HealthScore score={client.healthScore} />
                    <RelationshipBadge status={client.status} />
                </div>

                {/* Revenue / Budget */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                        <div className="text-xl font-bold text-emerald-400">{fmtCurrency(client.totalRevenue)}</div>
                        <div className="text-xs text-gray-400">Revenue</div>
                    </div>
                    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                        <div className="text-xl font-bold text-blue-400">{fmtCurrency(client.totalBudget)}</div>
                        <div className="text-xs text-gray-400">Budget</div>
                    </div>
                </div>

                {/* Projects */}
                <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-gray-400">{client.projects.active} active • {client.projects.completed} completed</span>
                    <span className="text-blue-400 font-semibold">{client.projects.total} total</span>
                </div>

                {/* Risks */}
                {client.risks.length > 0 && (
                    <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-semibold text-red-400">
                                {client.risks.length} Risk{client.risks.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <p className="text-xs text-gray-300 line-clamp-2">{client.risks[0]}</p>
                    </div>
                )}

                {/* Opportunities */}
                {client.opportunities.length > 0 && (
                    <div className="mb-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-400">
                                {client.opportunities.length} Opportunit{client.opportunities.length > 1 ? 'ies' : 'y'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-300 line-clamp-2">{client.opportunities[0]}</p>
                    </div>
                )}

                {/* Technologies */}
                {client.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {client.technologies.slice(0, 4).map(t => (
                            <span key={t} className="px-2 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-gray-400">{t}</span>
                        ))}
                        {client.technologies.length > 4 && (
                            <span className="px-2 py-0.5 text-xs text-gray-500">+{client.technologies.length - 4}</span>
                        )}
                    </div>
                )}

                {/* Expandable details */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-800 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Budget Used</span>
                            <span className="text-white">{client.totalBudget > 0 ? Math.round((client.totalSpent / client.totalBudget) * 100) : 0}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Risk Level</span>
                            <span className="text-white capitalize">{client.riskLevel}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Last Activity</span>
                            <span className="text-white">{timeAgo(client.lastProjectUpdate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Member Since</span>
                            <span className="text-white">{new Date(client.joinedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                )}

                {/* CTA */}
                <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-all"
                        onClick={e => e.stopPropagation()}>
                        View Profile
                    </button>
                    <button title="Send Message"
                        className="py-2.5 px-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-all"
                        onClick={e => e.stopPropagation()}>
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
});
ClientCard.displayName = 'ClientCard';

// --------------- Skeleton ---------------
const CardSkeleton = () => (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 animate-pulse">
        <div className="flex gap-3 mb-4"><div className="w-14 h-14 rounded-xl bg-gray-800" /><div className="flex-1 space-y-2"><div className="h-5 w-32 bg-gray-800 rounded" /><div className="h-3 w-24 bg-gray-800 rounded" /></div></div>
        <div className="h-14 bg-gray-800 rounded-lg mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-4"><div className="h-16 bg-gray-800 rounded-lg" /><div className="h-16 bg-gray-800 rounded-lg" /></div>
        <div className="h-4 w-48 bg-gray-800 rounded mb-4" />
        <div className="flex gap-2"><div className="h-10 flex-1 bg-gray-800 rounded-lg" /><div className="h-10 w-12 bg-gray-800 rounded-lg" /></div>
    </div>
);

// ============================================================================
// Main Component
// ============================================================================
const Clients: React.FC = () => {
    const { clients, loading, error, refresh } = useClients();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('revenue');
    const [search, setSearch] = useState('');

    // Filtering
    const filteredClients = useMemo(() => {
        let list = clients;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.company?.toLowerCase().includes(q)) ||
                (c.industry?.toLowerCase().includes(q))
            );
        }
        if (filter === 'active') list = list.filter(c => c.status === 'active');
        else if (filter === 'at-risk') list = list.filter(c => c.status === 'at-risk');
        else if (filter === 'champions') list = list.filter(c => c.status === 'champion');
        return list;
    }, [clients, filter, search]);

    // Sorting
    const sortedClients = useMemo(() => {
        const arr = [...filteredClients];
        if (sortBy === 'revenue') arr.sort((a, b) => b.totalRevenue - a.totalRevenue);
        else if (sortBy === 'health') arr.sort((a, b) => b.healthScore - a.healthScore);
        else if (sortBy === 'projects') arr.sort((a, b) => b.projects.total - a.projects.total);
        return arr;
    }, [filteredClients, sortBy]);

    // Aggregate stats
    const stats = useMemo(() => {
        const totalRevenue = clients.reduce((s, c) => s + c.totalRevenue, 0);
        const avgHealth = clients.length > 0
            ? Math.round(clients.reduce((s, c) => s + c.healthScore, 0) / clients.length) : 0;
        const atRiskCount = clients.filter(c => c.status === 'at-risk').length;
        const activeCount = clients.filter(c => c.projects.active > 0).length;
        return { totalRevenue, avgHealth, atRiskCount, activeCount };
    }, [clients]);

    const filterCounts = useMemo(() => ({
        all: clients.length,
        active: clients.filter(c => c.status === 'active').length,
        'at-risk': clients.filter(c => c.status === 'at-risk').length,
        champions: clients.filter(c => c.status === 'champion').length,
    }), [clients]);

    const handleToggle = useCallback((id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // CSV export
    const handleExport = useCallback(() => {
        if (sortedClients.length === 0) return;
        const headers = ['Name', 'Email', 'Company', 'Industry', 'Status', 'Health Score', 'Revenue', 'Projects', 'Technologies'];
        const rows = sortedClients.map(c => [
            c.name, c.email, c.company ?? '', c.industry ?? '', c.status,
            c.healthScore, c.totalRevenue, c.projects.total, c.technologies.join('; '),
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [sortedClients]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-purple-900/20 border border-emerald-500/20 rounded-3xl p-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent mb-2">
                                Client Relationship Hub
                            </h1>
                            <p className="text-gray-400 text-lg">
                                {loading ? 'Loading client data…' : `${clients.length} client${clients.length !== 1 ? 's' : ''} tracked`}
                            </p>
                        </div>
                        <button onClick={refresh} disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-all font-semibold shadow-lg shadow-emerald-500/20">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Portfolio stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{loading ? '—' : fmtCurrency(stats.totalRevenue)}</div>
                                    <div className="text-xs text-gray-400">Total Revenue</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-400" /></div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{loading ? '—' : stats.avgHealth}</div>
                                    <div className="text-xs text-gray-400">Avg Health Score</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-500/10 rounded-lg"><Star className="w-5 h-5 text-amber-400" /></div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{loading ? '—' : stats.activeCount}</div>
                                    <div className="text-xs text-gray-400">Active Clients</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{loading ? '—' : stats.atRiskCount}</div>
                                    <div className="text-xs text-gray-400">At Risk</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                    <button onClick={refresh} className="ml-auto text-sm text-red-400 hover:text-red-300 underline">Retry</button>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {(['all', 'active', 'at-risk', 'champions'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                filter === f
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700'
                            }`}>
                            {f === 'all' ? 'All Clients' : f === 'at-risk' ? 'At Risk' : f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="ml-2 text-xs opacity-70">({filterCounts[f]})</span>
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search clients..."
                            className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                    </div>
                    <select title="Sort clients" value={sortBy} onChange={e => setSortBy(e.target.value as SortType)}
                        className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all">
                        <option value="revenue">Sort by Revenue</option>
                        <option value="health">Sort by Health</option>
                        <option value="projects">Sort by Projects</option>
                    </select>
                    <button title="Download CSV" onClick={handleExport}
                        className="p-2 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all">
                        <Download className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : sortedClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedClients.map(client => (
                        <ClientCard key={client.id} client={client}
                            isExpanded={expandedId === client.id}
                            onToggle={() => handleToggle(client.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No clients found</h3>
                    <p className="text-gray-500">{search ? 'Try a different search term' : 'Try adjusting your filters'}</p>
                </div>
            )}

            {/* Loading overlay for refresh */}
            {loading && clients.length > 0 && (
                <div className="fixed bottom-6 right-6 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 flex items-center gap-2 shadow-xl z-50">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span className="text-sm text-gray-300">Refreshing…</span>
                </div>
            )}
        </div>
    );
};

export default Clients;
