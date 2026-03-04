import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    DollarSign, Search, ArrowUpDown, ArrowUp, ArrowDown,
    Save, X, Check, AlertCircle, Loader2, RefreshCw,
    Download, Filter, CheckSquare, Square,
    ChevronLeft, ChevronRight, Pencil, Undo2, Wallet
} from 'lucide-react';
import {
    getProjectsForBudgetEdit,
    updateProjectBudgetSpent,
    batchUpdateProjectBudgets,
    type BudgetSpentUpdate,
} from '../../services/revenue.service';

// ============================================================================
// Types
// ============================================================================

interface ProjectRow {
    id: string;
    name: string;
    client: string;
    budget: number;
    spent: number;
    paymentStatus: string;
    status: string;
    type: string;
}

interface EditedFields {
    budget?: number;
    spent?: number;
    paymentStatus?: string;
}

type SortField = 'name' | 'client' | 'budget' | 'spent' | 'utilization' | 'paymentStatus' | 'status';
type SortDir = 'asc' | 'desc';

const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'refunded'] as const;
const PROJECT_STATUSES = ['active', 'completed', 'on_hold', 'cancelled'] as const;
const PAGE_SIZES = [10, 25, 50, 100] as const;

// ============================================================================
// Helpers
// ============================================================================

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
}

function formatCurrencyFull(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function getUtilization(spent: number, budget: number): number {
    return budget > 0 ? Math.round((spent / budget) * 100) : 0;
}

function utilizationColor(pct: number): string {
    if (pct >= 100) return 'text-red-400';
    if (pct >= 80) return 'text-amber-400';
    if (pct >= 50) return 'text-blue-400';
    return 'text-emerald-400';
}

function utilizationBarColor(pct: number): string {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-amber-500';
    if (pct >= 50) return 'bg-blue-500';
    return 'bg-emerald-500';
}

function paymentBadge(status: string): { bg: string; text: string } {
    switch (status) {
        case 'paid': return { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' };
        case 'partial': return { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' };
        case 'refunded': return { bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-400' };
        default: return { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400' };
    }
}

function statusBadge(status: string): { bg: string; text: string } {
    switch (status) {
        case 'completed': return { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' };
        case 'active': return { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400' };
        case 'on_hold': return { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' };
        default: return { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400' };
    }
}

// ============================================================================
// Editable Currency Cell
// ============================================================================

interface CurrencyCellProps {
    value: number;
    editValue: number | undefined;
    isEditing: boolean;
    onEdit: (val: number) => void;
    label: string;
}

const CurrencyCell: React.FC<CurrencyCellProps> = ({ value, editValue, isEditing, onEdit, label }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const displayValue = editValue ?? value;
    const isModified = editValue !== undefined && editValue !== value;

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    if (!isEditing) {
        return (
            <span className={`font-mono text-sm ${isModified ? 'text-amber-300' : 'text-white'}`}>
                {formatCurrencyFull(displayValue)}
                {isModified && <span className="ml-1 text-amber-500 text-xs">*</span>}
            </span>
        );
    }

    return (
        <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
                ref={inputRef}
                type="number"
                min="0"
                step="100"
                value={editValue ?? value}
                onChange={(e) => onEdit(parseFloat(e.target.value) || 0)}
                aria-label={label}
                className="w-full pl-7 pr-2 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm font-mono focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
        </div>
    );
};

// ============================================================================
// Payment Status Select Cell
// ============================================================================

interface StatusSelectProps {
    value: string;
    editValue: string | undefined;
    isEditing: boolean;
    onEdit: (val: string) => void;
}

const StatusSelectCell: React.FC<StatusSelectProps> = ({ value, editValue, isEditing, onEdit }) => {
    const currentValue = editValue ?? value;
    const isModified = editValue !== undefined && editValue !== value;
    const badge = paymentBadge(currentValue);

    if (!isEditing) {
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold capitalize ${badge.bg} ${badge.text}`}>
                {currentValue}
                {isModified && <span className="text-amber-500">*</span>}
            </span>
        );
    }

    return (
        <select
            value={currentValue}
            onChange={(e) => onEdit(e.target.value)}
            aria-label="Payment status"
            className="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all capitalize"
        >
            {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
    );
};

// ============================================================================
// Summary Stats Bar
// ============================================================================

interface SummaryProps {
    projects: ProjectRow[];
    pendingChanges: number;
}

const SummaryBar: React.FC<SummaryProps> = ({ projects, pendingChanges }) => {
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
    const avgUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const overdueCount = projects.filter(p => p.paymentStatus === 'unpaid' && p.status === 'completed').length;

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
                { label: 'Total Budget', value: formatCurrency(totalBudget), color: 'text-emerald-400', icon: DollarSign },
                { label: 'Total Spent', value: formatCurrency(totalSpent), color: 'text-blue-400', icon: Wallet },
                { label: 'Avg Utilization', value: `${avgUtilization}%`, color: utilizationColor(avgUtilization), icon: ArrowUpDown },
                { label: 'Overdue', value: String(overdueCount), color: overdueCount > 0 ? 'text-red-400' : 'text-gray-400', icon: AlertCircle },
                { label: 'Pending Changes', value: String(pendingChanges), color: pendingChanges > 0 ? 'text-amber-400' : 'text-gray-500', icon: Pencil },
            ].map((stat) => (
                <div key={stat.label} className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-800/50`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div>
                        <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ============================================================================
// Toast / Notification
// ============================================================================

interface ToastMsg {
    id: number;
    type: 'success' | 'error' | 'info';
    text: string;
}

const Toast: React.FC<{ msg: ToastMsg; onDismiss: (id: number) => void }> = ({ msg, onDismiss }) => {
    useEffect(() => {
        const t = setTimeout(() => onDismiss(msg.id), 4000);
        return () => clearTimeout(t);
    }, [msg.id, onDismiss]);

    const colors = msg.type === 'success'
        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        : msg.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-400';

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors} shadow-lg animate-in slide-in-from-right`}>
            {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{msg.text}</span>
            <button onClick={() => onDismiss(msg.id)} className="ml-auto p-1 hover:opacity-70" title="Dismiss">
                <X className="w-3 h-3" />
            </button>
        </div>
    );
};

// ============================================================================
// Main: Budget Management Page
// ============================================================================

export default function BudgetManagement() {
    // Data
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit state: map of projectId → edited fields
    const [edits, setEdits] = useState<Map<string, EditedFields>>(new Map());
    const [editingRowId, setEditingRowId] = useState<string | null>(null);

    // Selection for bulk actions
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Table controls
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPayment, setFilterPayment] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState<number>(25);

    // Save state
    const [saving, setSaving] = useState(false);
    const [toasts, setToasts] = useState<ToastMsg[]>([]);
    const toastId = useRef(0);

    // ─── Data Fetch ──────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getProjectsForBudgetEdit();
            if (result.error) {
                setError(result.error.message);
            } else {
                setProjects(result.data ?? []);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── Toast Helper ────────────────────────────────────────────────
    const addToast = useCallback((type: ToastMsg['type'], text: string) => {
        const id = ++toastId.current;
        setToasts(prev => [...prev.slice(-4), { id, type, text }]);
    }, []);

    const dismissToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // ─── Edit Helpers ────────────────────────────────────────────────
    const startEditing = useCallback((projectId: string) => {
        setEditingRowId(projectId);
    }, []);

    const stopEditing = useCallback(() => {
        setEditingRowId(null);
    }, []);

    const setFieldEdit = useCallback((projectId: string, field: keyof EditedFields, value: number | string) => {
        setEdits(prev => {
            const next = new Map(prev);
            const existing = next.get(projectId) ?? {};
            const project = projects.find(p => p.id === projectId);
            if (!project) return prev;

            const originalValue = field === 'paymentStatus' ? project.paymentStatus
                : field === 'budget' ? project.budget
                    : project.spent;

            // If value matches original, remove the field edit
            if (value === originalValue) {
                const updated = { ...existing };
                delete updated[field];
                if (Object.keys(updated).length === 0) {
                    next.delete(projectId);
                } else {
                    next.set(projectId, updated);
                }
            } else {
                next.set(projectId, { ...existing, [field]: value });
            }
            return next;
        });
    }, [projects]);

    const discardEdit = useCallback((projectId: string) => {
        setEdits(prev => {
            const next = new Map(prev);
            next.delete(projectId);
            return next;
        });
        if (editingRowId === projectId) setEditingRowId(null);
    }, [editingRowId]);

    const discardAllEdits = useCallback(() => {
        setEdits(new Map());
        setEditingRowId(null);
    }, []);

    // ─── Selection ───────────────────────────────────────────────────
    const toggleSelect = useCallback((id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback((visibleIds: string[]) => {
        setSelected(prev => {
            const allSelected = visibleIds.every(id => prev.has(id));
            if (allSelected) {
                const next = new Set(prev);
                visibleIds.forEach(id => next.delete(id));
                return next;
            }
            return new Set([...prev, ...visibleIds]);
        });
    }, []);

    // ─── Bulk Payment Status ─────────────────────────────────────────
    const bulkSetPaymentStatus = useCallback((status: string) => {
        setEdits(prev => {
            const next = new Map(prev);
            selected.forEach(id => {
                const project = projects.find(p => p.id === id);
                if (!project) return;
                if (project.paymentStatus === status) {
                    // Remove if matches original
                    const existing = next.get(id);
                    if (existing) {
                        const updated = { ...existing };
                        delete updated.paymentStatus;
                        if (Object.keys(updated).length === 0) next.delete(id);
                        else next.set(id, updated);
                    }
                } else {
                    const existing = next.get(id) ?? {};
                    next.set(id, { ...existing, paymentStatus: status });
                }
            });
            return next;
        });
        addToast('info', `Marked ${selected.size} projects as "${status}" (unsaved)`);
    }, [selected, projects, addToast]);

    // ─── Save ────────────────────────────────────────────────────────
    const saveAllChanges = useCallback(async () => {
        if (edits.size === 0) return;
        setSaving(true);

        // Validate
        const validationErrors: string[] = [];
        for (const [projectId, fields] of edits) {
            const project = projects.find(p => p.id === projectId);
            if (!project) continue;
            const budget = fields.budget ?? project.budget;
            const spent = fields.spent ?? project.spent;
            if (budget < 0) validationErrors.push(`${project.name}: budget cannot be negative`);
            if (spent < 0) validationErrors.push(`${project.name}: spent cannot be negative`);
            if (spent > budget) validationErrors.push(`${project.name}: spent ($${spent}) exceeds budget ($${budget})`);
        }

        if (validationErrors.length > 0) {
            validationErrors.forEach(e => addToast('error', e));
            setSaving(false);
            return;
        }

        // Build updates
        const updates: BudgetSpentUpdate[] = [];
        for (const [projectId, fields] of edits) {
            updates.push({
                projectId,
                budget: fields.budget,
                spent: fields.spent,
                paymentStatus: fields.paymentStatus as BudgetSpentUpdate['paymentStatus'],
            });
        }

        if (updates.length === 1) {
            // Single update
            const result = await updateProjectBudgetSpent(updates[0]);
            if (result.error) {
                addToast('error', `Failed: ${result.error.message}`);
            } else {
                addToast('success', 'Budget updated successfully');
                setEdits(new Map());
                setEditingRowId(null);
                fetchData();
            }
        } else {
            // Batch update
            const result = await batchUpdateProjectBudgets(updates);
            if (result.data) {
                if (result.data.failed > 0) {
                    addToast('error', `${result.data.failed} update(s) failed`);
                    result.data.errors.forEach(e => addToast('error', e));
                }
                if (result.data.succeeded > 0) {
                    addToast('success', `${result.data.succeeded} project(s) updated successfully`);
                }
                // Clear edits for succeeded items
                setEdits(new Map());
                setEditingRowId(null);
                fetchData();
            }
        }
        setSaving(false);
    }, [edits, projects, addToast, fetchData]);

    // ─── Save single row ─────────────────────────────────────────────
    const saveSingleRow = useCallback(async (projectId: string) => {
        const fields = edits.get(projectId);
        if (!fields) return;

        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const budget = fields.budget ?? project.budget;
        const spent = fields.spent ?? project.spent;

        if (spent > budget) {
            addToast('error', `${project.name}: spent exceeds budget`);
            return;
        }

        setSaving(true);
        const result = await updateProjectBudgetSpent({
            projectId,
            budget: fields.budget,
            spent: fields.spent,
            paymentStatus: fields.paymentStatus as BudgetSpentUpdate['paymentStatus'],
        });

        if (result.error) {
            addToast('error', `Failed: ${result.error.message}`);
        } else {
            addToast('success', `${project.name} updated`);
            setEdits(prev => {
                const next = new Map(prev);
                next.delete(projectId);
                return next;
            });
            if (editingRowId === projectId) setEditingRowId(null);
            fetchData();
        }
        setSaving(false);
    }, [edits, projects, addToast, fetchData, editingRowId]);

    // ─── Filtering + Sorting + Pagination ────────────────────────────
    const filtered = useMemo(() => {
        let result = [...projects];

        // Search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.client.toLowerCase().includes(q) ||
                p.type.toLowerCase().includes(q)
            );
        }

        // Filter by status
        if (filterStatus !== 'all') {
            result = result.filter(p => p.status === filterStatus);
        }
        if (filterPayment !== 'all') {
            result = result.filter(p => {
                const editPayment = edits.get(p.id)?.paymentStatus;
                return (editPayment ?? p.paymentStatus) === filterPayment;
            });
        }

        // Sort
        result.sort((a, b) => {
            let cmp = 0;
            const aEdits = edits.get(a.id) ?? {};
            const bEdits = edits.get(b.id) ?? {};

            switch (sortField) {
                case 'name': cmp = a.name.localeCompare(b.name); break;
                case 'client': cmp = a.client.localeCompare(b.client); break;
                case 'budget': cmp = (aEdits.budget ?? a.budget) - (bEdits.budget ?? b.budget); break;
                case 'spent': cmp = (aEdits.spent ?? a.spent) - (bEdits.spent ?? b.spent); break;
                case 'utilization': {
                    const aUtil = getUtilization(aEdits.spent ?? a.spent, aEdits.budget ?? a.budget);
                    const bUtil = getUtilization(bEdits.spent ?? b.spent, bEdits.budget ?? b.budget);
                    cmp = aUtil - bUtil;
                    break;
                }
                case 'paymentStatus': cmp = (aEdits.paymentStatus ?? a.paymentStatus).localeCompare(bEdits.paymentStatus ?? b.paymentStatus); break;
                case 'status': cmp = a.status.localeCompare(b.status); break;
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [projects, search, filterStatus, filterPayment, sortField, sortDir, edits]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages - 1);
    const paginated = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);
    const visibleIds = paginated.map(p => p.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selected.has(id));

    // Reset page when filters change
    useEffect(() => { setPage(0); }, [search, filterStatus, filterPayment, pageSize]);

    // ─── Sort handler ────────────────────────────────────────────────
    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    }, [sortField]);

    const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-600" />;
        return sortDir === 'asc'
            ? <ArrowUp className="w-3 h-3 text-emerald-400" />
            : <ArrowDown className="w-3 h-3 text-emerald-400" />;
    };

    // ─── CSV Export ──────────────────────────────────────────────────
    const exportCSV = useCallback(() => {
        const header = 'Project,Client,Budget,Spent,Utilization %,Payment Status,Status,Type';
        const rows = filtered.map(p => {
            const e = edits.get(p.id) ?? {};
            const budget = e.budget ?? p.budget;
            const spent = e.spent ?? p.spent;
            const util = getUtilization(spent, budget);
            const payment = e.paymentStatus ?? p.paymentStatus;
            return `"${p.name}","${p.client}",${budget},${spent},${util},${payment},${p.status},${p.type}`;
        });
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `budget-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [filtered, edits]);

    // ─── Pending changes count ───────────────────────────────────────
    const pendingCount = edits.size;

    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    <p className="text-gray-400 text-lg">Loading projects...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8 flex items-center justify-center">
                <div className="bg-gray-900/60 border border-red-500/20 rounded-2xl p-8 max-w-md text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button onClick={fetchData} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
            <div className="max-w-[1800px] mx-auto space-y-6">

                {/* ── Toast container ── */}
                <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
                    {toasts.map(t => <Toast key={t.id} msg={t} onDismiss={dismissToast} />)}
                </div>

                {/* ── Page Header ── */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-xl">
                                <Wallet className="w-7 h-7 text-amber-400" />
                            </div>
                            Budget Management
                        </h1>
                        <p className="text-gray-400">Edit project budgets, track spending, and manage payment statuses</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={fetchData}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all text-sm"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                            <span className="text-white font-medium hidden sm:inline">Refresh</span>
                        </button>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all text-sm"
                        >
                            <Download className="w-4 h-4 text-gray-400" />
                            <span className="text-white font-medium hidden sm:inline">Export CSV</span>
                        </button>
                        {pendingCount > 0 && (
                            <>
                                <button
                                    onClick={discardAllEdits}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-all text-sm"
                                >
                                    <Undo2 className="w-4 h-4 text-gray-400" />
                                    <span className="text-white font-medium">Discard All</span>
                                </button>
                                <button
                                    onClick={saveAllChanges}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all text-sm shadow-lg shadow-emerald-500/20"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save All ({pendingCount})
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Summary Stats ── */}
                <SummaryBar projects={projects} pendingChanges={pendingCount} />

                {/* ── Search + Filters ── */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search projects, clients, types..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-sm transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                aria-label="Filter by project status"
                                className="px-3 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white text-sm focus:border-emerald-500/50 focus:outline-none capitalize"
                            >
                                <option value="all">All Statuses</option>
                                {PROJECT_STATUSES.map(s => (
                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <select
                            value={filterPayment}
                            onChange={(e) => setFilterPayment(e.target.value)}
                            aria-label="Filter by payment status"
                            className="px-3 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white text-sm focus:border-emerald-500/50 focus:outline-none capitalize"
                        >
                            <option value="all">All Payments</option>
                            {PAYMENT_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Bulk Actions Bar ── */}
                {selected.size > 0 && (
                    <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                        <span className="text-sm text-blue-400 font-medium">{selected.size} selected</span>
                        <div className="h-4 w-px bg-gray-700" />
                        <span className="text-xs text-gray-500">Set payment status:</span>
                        {PAYMENT_STATUSES.map(s => (
                            <button
                                key={s}
                                onClick={() => bulkSetPaymentStatus(s)}
                                className="px-3 py-1 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white font-medium hover:bg-gray-700 transition-colors capitalize"
                            >
                                {s}
                            </button>
                        ))}
                        <button
                            onClick={() => setSelected(new Set())}
                            className="ml-auto px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Clear Selection
                        </button>
                    </div>
                )}

                {/* ── Data Table ── */}
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-800/50">
                                    <th className="px-4 py-3">
                                        <button
                                            onClick={() => toggleSelectAll(visibleIds)}
                                            className="p-1 hover:bg-gray-800 rounded transition-colors"
                                            aria-label="Select all"
                                        >
                                            {allVisibleSelected
                                                ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                                                : <Square className="w-4 h-4 text-gray-600" />
                                            }
                                        </button>
                                    </th>
                                    {([
                                        ['name', 'Project'],
                                        ['client', 'Client'],
                                        ['budget', 'Budget'],
                                        ['spent', 'Spent'],
                                        ['utilization', 'Utilization'],
                                        ['paymentStatus', 'Payment'],
                                        ['status', 'Status'],
                                    ] as [SortField, string][]).map(([field, label]) => (
                                        <th key={field} className="px-4 py-3">
                                            <button
                                                onClick={() => handleSort(field)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
                                            >
                                                {label}
                                                <SortIcon field={field} />
                                            </button>
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-16 text-gray-500">
                                            {search || filterStatus !== 'all' || filterPayment !== 'all'
                                                ? 'No projects match your filters'
                                                : 'No projects found'
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((project) => {
                                        const isEditing = editingRowId === project.id;
                                        const rowEdits = edits.get(project.id);
                                        const hasChanges = !!rowEdits;
                                        const isSelected = selected.has(project.id);

                                        const effectiveBudget = rowEdits?.budget ?? project.budget;
                                        const effectiveSpent = rowEdits?.spent ?? project.spent;
                                        const util = getUtilization(effectiveSpent, effectiveBudget);
                                        const pBadge = statusBadge(project.status);

                                        return (
                                            <tr
                                                key={project.id}
                                                className={`border-b border-gray-800/30 transition-colors ${isEditing ? 'bg-gray-800/30' : hasChanges ? 'bg-amber-500/[0.03]' : 'hover:bg-gray-800/20'
                                                    }`}
                                                onDoubleClick={() => startEditing(project.id)}
                                            >
                                                {/* Checkbox */}
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => toggleSelect(project.id)}
                                                        className="p-1 hover:bg-gray-800 rounded transition-colors"
                                                        aria-label={`Select ${project.name}`}
                                                    >
                                                        {isSelected
                                                            ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                                                            : <Square className="w-4 h-4 text-gray-600" />
                                                        }
                                                    </button>
                                                </td>

                                                {/* Project Name */}
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <span className="text-sm font-medium text-white">{project.name}</span>
                                                        <span className="text-xs text-gray-500 block">{project.type}</span>
                                                    </div>
                                                </td>

                                                {/* Client */}
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-300">{project.client}</span>
                                                </td>

                                                {/* Budget */}
                                                <td className="px-4 py-3 min-w-[140px]">
                                                    <CurrencyCell
                                                        value={project.budget}
                                                        editValue={rowEdits?.budget}
                                                        isEditing={isEditing}
                                                        onEdit={(v) => setFieldEdit(project.id, 'budget', v)}
                                                        label={`Budget for ${project.name}`}
                                                    />
                                                </td>

                                                {/* Spent */}
                                                <td className="px-4 py-3 min-w-[140px]">
                                                    <CurrencyCell
                                                        value={project.spent}
                                                        editValue={rowEdits?.spent}
                                                        isEditing={isEditing}
                                                        onEdit={(v) => setFieldEdit(project.id, 'spent', v)}
                                                        label={`Spent for ${project.name}`}
                                                    />
                                                </td>

                                                {/* Utilization */}
                                                <td className="px-4 py-3 min-w-[120px]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${utilizationBarColor(util)}`}
                                                                style={{ width: `${Math.min(util, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-bold tabular-nums ${utilizationColor(util)}`}>
                                                            {util}%
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Payment Status */}
                                                <td className="px-4 py-3 min-w-[120px]">
                                                    <StatusSelectCell
                                                        value={project.paymentStatus}
                                                        editValue={rowEdits?.paymentStatus}
                                                        isEditing={isEditing}
                                                        onEdit={(v) => setFieldEdit(project.id, 'paymentStatus', v)}
                                                    />
                                                </td>

                                                {/* Project Status */}
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-semibold capitalize ${pBadge.bg} ${pBadge.text}`}>
                                                        {project.status.replace('_', ' ')}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        {isEditing ? (
                                                            <button
                                                                onClick={stopEditing}
                                                                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                                                                title="Stop editing"
                                                            >
                                                                <X className="w-4 h-4 text-gray-400" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => startEditing(project.id)}
                                                                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                                                                title="Edit row"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-emerald-400" />
                                                            </button>
                                                        )}
                                                        {hasChanges && (
                                                            <>
                                                                <button
                                                                    onClick={() => saveSingleRow(project.id)}
                                                                    disabled={saving}
                                                                    className="p-1.5 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                                    title="Save this row"
                                                                >
                                                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => discardEdit(project.id)}
                                                                    className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                    title="Discard changes"
                                                                >
                                                                    <Undo2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-800/50">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
                            <div className="h-4 w-px bg-gray-800" />
                            <div className="flex items-center gap-1.5">
                                <span>Show</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    aria-label="Rows per page"
                                    className="px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none"
                                >
                                    {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <span>per page</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={safePage === 0}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Previous page"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-400" />
                            </button>
                            <span className="text-sm text-gray-400 tabular-nums">
                                Page {safePage + 1} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={safePage >= totalPages - 1}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Next page"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
