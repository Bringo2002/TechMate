import React, { useState, useCallback } from 'react';
import {
    DollarSign, ArrowUp, ArrowDown, Download, CreditCard, Wallet,
    PiggyBank, BarChart3, Target, Zap, Clock, CheckCircle2, AlertCircle,
    XCircle, RefreshCw, ChevronRight, ChevronDown, Briefcase, Globe,
    Smartphone, Database, Cloud, Code, FileText, TrendingUp, Loader2,
    AlertTriangle, Pencil, Save, X, Search, PenTool
} from 'lucide-react';
import { useRevenue } from '../../hooks/useRevenue';
import type {
    MonthlyRevenuePoint,
    RevenueMetrics,
    InvoiceDisplayRow,
    RevenueByServiceItem,
    RevenueProjection,
    PaymentMethodBreakdown,
    BudgetSpentUpdate,
} from '../../services/revenue.service';

// ============================================================================
// Utility: Color Classes
// ============================================================================

interface ColorClasses {
    bg: string;
    text: string;
    bgLight: string;
    border: string;
}

const COLOR_MAP: Record<string, ColorClasses> = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', bgLight: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', bgLight: 'bg-blue-500/10', border: 'border-blue-500/20' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-400', bgLight: 'bg-purple-500/10', border: 'border-purple-500/20' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', bgLight: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-400', bgLight: 'bg-amber-500/10', border: 'border-amber-500/20' },
    pink: { bg: 'bg-pink-500', text: 'text-pink-400', bgLight: 'bg-pink-500/10', border: 'border-pink-500/20' },
    red: { bg: 'bg-red-500', text: 'text-red-400', bgLight: 'bg-red-500/10', border: 'border-red-500/20' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-400', bgLight: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-400', bgLight: 'bg-rose-500/10', border: 'border-rose-500/20' },
    gray: { bg: 'bg-gray-500', text: 'text-gray-400', bgLight: 'bg-gray-500/10', border: 'border-gray-500/20' },
};

const getColorClasses = (color: string): ColorClasses =>
    COLOR_MAP[color] || COLOR_MAP.blue;

// ============================================================================
// Utility: Icon Mapping (service returns icon name strings, not components)
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Globe, Smartphone, Database, Cloud, Code, Briefcase, RefreshCw, PenTool,
    DollarSign, CreditCard, Wallet, PiggyBank,
};

const getServiceIcon = (iconName: string) =>
    ICON_MAP[iconName] || Code;

// ============================================================================
// Utility: Status Config
// ============================================================================

interface StatusConfig {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    text: string;
    bgLight: string;
    border: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
    paid: { icon: CheckCircle2, label: 'Paid', ...getColorClasses('emerald') },
    sent: { icon: Clock, label: 'Pending', ...getColorClasses('amber') },
    draft: { icon: FileText, label: 'Draft', ...getColorClasses('gray') },
    pending: { icon: Clock, label: 'Pending', ...getColorClasses('amber') },
    overdue: { icon: AlertCircle, label: 'Overdue', ...getColorClasses('red') },
    cancelled: { icon: XCircle, label: 'Cancelled', ...getColorClasses('gray') },
    refunded: { icon: RefreshCw, label: 'Refunded', ...getColorClasses('purple') },
};

const getStatusConfig = (status: string): StatusConfig =>
    STATUS_CONFIGS[status] || STATUS_CONFIGS.pending;

// ============================================================================
// Utility: Format Currency
// ============================================================================

const formatCurrency = (amount: number, compact = false): string => {
    if (compact) {
        if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
        if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const calcChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change * 10) / 10), isPositive: change >= 0 };
};

// ============================================================================
// Sub-Components
// ============================================================================

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl animate-pulse" />
                <div className="space-y-2">
                    <div className="w-48 h-8 bg-gray-800 rounded animate-pulse" />
                    <div className="w-64 h-4 bg-gray-800 rounded animate-pulse" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-40 bg-gray-900/50 border border-gray-800/50 rounded-2xl animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-96 bg-gray-900/50 border border-gray-800/50 rounded-2xl animate-pulse" />
                <div className="h-96 bg-gray-900/50 border border-gray-800/50 rounded-2xl animate-pulse" />
            </div>
        </div>
    </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
            <div className="p-4 bg-red-500/10 rounded-2xl inline-block">
                <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Failed to Load Revenue Data</h2>
            <p className="text-gray-400">{error}</p>
            <button
                onClick={onRetry}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
            >
                <RefreshCw className="w-4 h-4" />
                Retry
            </button>
        </div>
    </div>
);

const EmptyState = () => (
    <div className="text-center py-12">
        <div className="p-4 bg-gray-800/50 rounded-2xl inline-block mb-4">
            <DollarSign className="w-10 h-10 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No Revenue Data Yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
            Revenue data will appear once projects have budgets and invoices are created.
        </p>
    </div>
);

// ── Metric Card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    label: string;
    change: { value: number; isPositive: boolean };
    subLeft?: string;
    subRight?: string;
    subRightColor?: string;
    accentColor: string;
    invertChangeColor?: boolean;
}

const MetricCard = ({
    icon: Icon,
    value,
    label,
    change,
    subLeft,
    subRight,
    subRightColor,
    accentColor,
    invertChangeColor = false,
}: MetricCardProps) => {
    const colors = getColorClasses(accentColor);
    const isGood = invertChangeColor ? !change.isPositive : change.isPositive;

    return (
        <div className={`group relative bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:${colors.border} rounded-2xl p-6 transition-all overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bgLight} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-all`} />
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${colors.bgLight} rounded-xl`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    {change.value > 0 && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${isGood ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} text-sm font-semibold`}>
                            {change.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            {change.value}%
                        </div>
                    )}
                </div>
                <h3 className="text-4xl font-bold text-white mb-2">{value}</h3>
                <p className="text-sm text-gray-400 mb-3">{label}</p>
                {(subLeft || subRight) && (
                    <div className="flex items-center justify-between text-xs">
                        {subLeft && <span className="text-gray-500">{subLeft}</span>}
                        {subRight && <span className={subRightColor || 'text-gray-500'}>{subRight}</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Revenue Chart ───────────────────────────────────────────────────────────

const RevenueChart = ({ data }: { data: MonthlyRevenuePoint[] }) => {
    const maxRevenue = Math.max(...data.map(m => m.revenue), 1);

    if (data.every(m => m.revenue === 0)) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between gap-2 h-72">
                {data.map((month, idx) => {
                    const height = (month.revenue / maxRevenue) * 100;
                    const recurringHeight = month.revenue > 0
                        ? (month.recurring / month.revenue) * height
                        : 0;

                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full relative group">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500/80 to-blue-400/80 rounded-t-lg transition-all duration-300 hover:from-blue-400 hover:to-blue-300 cursor-pointer"
                                    style={{ height: `${Math.max(height - recurringHeight, 2)}%` }}
                                >
                                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 border border-gray-700 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 shadow-xl">
                                        <div className="font-semibold mb-1">{month.monthLabel}</div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-gray-400">Total:</span>
                                                <span className="text-white font-medium">{formatCurrency(month.revenue, true)}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-emerald-400">Recurring:</span>
                                                <span className="text-white">{formatCurrency(month.recurring, true)}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-blue-400">One-time:</span>
                                                <span className="text-white">{formatCurrency(month.oneTime, true)}</span>
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
                                    style={{ height: `${Math.max(recurringHeight, 2)}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{month.monthLabel}</span>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500" />
                    <span className="text-gray-400">Recurring Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500" />
                    <span className="text-gray-400">One-time Projects</span>
                </div>
            </div>
        </div>
    );
};

// ── Progress to Target ──────────────────────────────────────────────────────

const ProgressToTarget = ({ metrics }: { metrics: RevenueMetrics }) => {
    const current = metrics.totalRevenue;
    const target = metrics.targetRevenue;
    const percentage = target > 0 ? (current / target) * 100 : 0;
    const remaining = Math.max(target - current, 0);
    const totalChange = calcChange(current, metrics.previousTotalRevenue);

    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysLeft = Math.max(Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)), 0);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-gray-400">Target Progress</div>
                    <div className="text-2xl font-bold text-white">
                        {formatCurrency(current, true)} / {formatCurrency(target, true)}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-400">Remaining</div>
                    <div className="text-xl font-bold text-emerald-400">{formatCurrency(remaining, true)}</div>
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
                    <div className={`text-sm font-semibold ${percentage >= 70 ? 'text-emerald-400' : percentage >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                        {percentage >= 70 ? 'Yes' : percentage >= 40 ? 'Close' : 'Behind'}
                    </div>
                </div>
                <div className="text-center p-2 bg-gray-800/30 rounded-lg border border-gray-800">
                    <div className="text-xs text-gray-400">Growth</div>
                    <div className={`text-sm font-semibold ${totalChange.isPositive ? 'text-blue-400' : 'text-red-400'}`}>
                        {totalChange.isPositive ? '+' : '-'}{totalChange.value}%
                    </div>
                </div>
                <div className="text-center p-2 bg-gray-800/30 rounded-lg border border-gray-800">
                    <div className="text-xs text-gray-400">Days Left</div>
                    <div className="text-sm font-semibold text-purple-400">{daysLeft}</div>
                </div>
            </div>
        </div>
    );
};

// ── Invoice List ────────────────────────────────────────────────────────────

const InvoiceList = ({ invoices }: { invoices: InvoiceDisplayRow[] }) => {
    if (invoices.length === 0) {
        return (
            <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No invoices yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {invoices.map((invoice) => {
                const config = getStatusConfig(invoice.status);
                const Icon = config.icon;
                const dateStr = new Date(invoice.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });

                return (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 rounded-xl transition-all group cursor-pointer">
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 ${config.bgLight} rounded-lg`}>
                                <Icon className={`w-4 h-4 ${config.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-medium text-sm truncate">{invoice.client}</span>
                                    <span className="text-xs text-gray-500 shrink-0">{invoice.invoiceNumber}</span>
                                </div>
                                <div className="text-xs text-gray-400">{invoice.service}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-white font-semibold">{formatCurrency(invoice.amount, true)}</div>
                                <div className="text-xs text-gray-500">{dateStr}</div>
                            </div>
                            <div className={`px-2.5 py-1 ${config.bgLight} rounded-lg`}>
                                <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ── Revenue by Service ──────────────────────────────────────────────────────

const ServiceRevenueList = ({ services }: { services: RevenueByServiceItem[] }) => {
    const [expandedService, setExpandedService] = useState<number | null>(null);

    if (services.length === 0) {
        return (
            <div className="text-center py-8">
                <Code className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No service revenue data</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {services.map((service, idx) => {
                const colors = getColorClasses(service.color);
                const ServiceIcon = getServiceIcon(service.iconName);
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
                                            {service.growth >= 0 ? '+' : ''}{service.growth}%
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">{service.deals} deals</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-white font-semibold">{formatCurrency(service.revenue, true)}</div>
                                    <div className="text-xs text-gray-500">Avg: {formatCurrency(service.avgDeal, true)}</div>
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
                                        <div className="text-sm font-semibold text-white">{formatCurrency(service.avgDeal, true)}</div>
                                    </div>
                                    <div className="p-2 bg-gray-800/30 rounded-lg">
                                        <div className="text-xs text-gray-400">Growth</div>
                                        <div className={`text-sm font-semibold ${colors.text}`}>
                                            {service.growth >= 0 ? '+' : ''}{service.growth}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ── Projections ─────────────────────────────────────────────────────────────

const ProjectionsView = ({ projections }: { projections: RevenueProjection[] }) => {
    if (projections.length === 0) return null;

    return (
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
                        <span className="text-white font-bold">{formatCurrency(proj.projected, true)}</span>
                    </div>

                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-purple-500/30 rounded-full"
                            style={{ width: `${Math.min((proj.projected / Math.max(proj.pipeline, 1)) * 100, 100)}%` }}
                        />
                        <div
                            className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min((proj.confirmed / Math.max(proj.pipeline, 1)) * 100, 100)}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-400">Confirmed: {formatCurrency(proj.confirmed, true)}</span>
                        <span className="text-gray-500">Pipeline: {formatCurrency(proj.pipeline, true)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ── Payment Methods ─────────────────────────────────────────────────────────

const PAYMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    'Bank Transfer': Wallet,
    'bank_transfer': Wallet,
    'Credit Card': CreditCard,
    'credit_card': CreditCard,
    'PayPal': DollarSign,
    'paypal': DollarSign,
    'Crypto': PiggyBank,
    'crypto': PiggyBank,
    'Cash': DollarSign,
    'Not Specified': Wallet,
};

const PAYMENT_COLORS: Record<string, string> = {
    'Bank Transfer': 'emerald',
    'bank_transfer': 'emerald',
    'Credit Card': 'blue',
    'credit_card': 'blue',
    'PayPal': 'purple',
    'paypal': 'purple',
    'Crypto': 'amber',
    'crypto': 'amber',
    'Cash': 'cyan',
    'Not Specified': 'gray',
};

const PaymentMethodsView = ({ methods }: { methods: PaymentMethodBreakdown[] }) => {
    if (methods.length === 0) {
        return (
            <div className="text-center py-8">
                <CreditCard className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No payment data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {methods.map((method, idx) => {
                const color = PAYMENT_COLORS[method.method] || 'gray';
                const colors = getColorClasses(color);
                const MethodIcon = PAYMENT_ICONS[method.method] || Wallet;

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
                                <div className="text-white font-semibold">{formatCurrency(method.amount, true)}</div>
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
    );
};

// ============================================================================
// Budget/Spent Edit Modal
// ============================================================================

interface BudgetEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: Array<{
        id: string;
        name: string;
        client: string;
        budget: number;
        spent: number;
        paymentStatus: string;
        status: string;
        type: string;
    }>;
    loading: boolean;
    onSave: (update: BudgetSpentUpdate) => Promise<{ success: boolean; error?: string }>;
}

const BudgetEditModal = ({ isOpen, onClose, projects, loading, onSave }: BudgetEditModalProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBudget, setEditBudget] = useState('');
    const [editSpent, setEditSpent] = useState('');
    const [editPaymentStatus, setEditPaymentStatus] = useState('unpaid');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const startEdit = useCallback((project: typeof projects[number]) => {
        setEditingId(project.id);
        setEditBudget(String(project.budget));
        setEditSpent(String(project.spent));
        setEditPaymentStatus(project.paymentStatus);
        setMessage(null);
    }, []);

    const handleSave = useCallback(async () => {
        if (!editingId) return;
        setSaving(true);
        setMessage(null);

        const budget = parseFloat(editBudget);
        const spent = parseFloat(editSpent);

        if (isNaN(budget) || budget < 0) {
            setMessage({ type: 'error', text: 'Budget must be a valid positive number' });
            setSaving(false);
            return;
        }
        if (isNaN(spent) || spent < 0) {
            setMessage({ type: 'error', text: 'Spent must be a valid positive number' });
            setSaving(false);
            return;
        }
        if (spent > budget) {
            setMessage({ type: 'error', text: 'Spent cannot exceed budget' });
            setSaving(false);
            return;
        }

        const result = await onSave({
            projectId: editingId,
            budget,
            spent,
            paymentStatus: editPaymentStatus as BudgetSpentUpdate['paymentStatus'],
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Budget updated successfully!' });
            setEditingId(null);
        } else {
            setMessage({ type: 'error', text: result.error ?? 'Failed to save' });
        }
        setSaving(false);
    }, [editingId, editBudget, editSpent, editPaymentStatus, onSave]);

    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setMessage(null);
    }, []);

    if (!isOpen) return null;

    const filteredProjects = searchTerm
        ? projects.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.client.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : projects;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-emerald-400" />
                            Edit Project Budget &amp; Spent
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Update project financial data. Changes are saved immediately.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Close modal"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors text-sm"
                        />
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mx-6 mt-3 p-3 rounded-lg text-sm font-medium ${message.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Projects List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                            <span className="ml-2 text-gray-400">Loading projects...</span>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">{searchTerm ? 'No projects match your search' : 'No projects found'}</p>
                        </div>
                    ) : (
                        filteredProjects.map((project) => {
                            const isEditing = editingId === project.id;
                            const progress = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;

                            return (
                                <div
                                    key={project.id}
                                    className={`p-4 rounded-xl border transition-all ${isEditing
                                            ? 'bg-gray-800/70 border-emerald-500/30'
                                            : 'bg-gray-800/30 border-gray-800 hover:border-gray-700'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-medium text-sm truncate">{project.name}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400'
                                                        : project.status === 'active' ? 'bg-blue-500/10 text-blue-400'
                                                            : 'bg-gray-500/10 text-gray-400'
                                                    }`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400">{project.client} &middot; {project.type}</div>
                                        </div>

                                        {!isEditing ? (
                                            <button
                                                onClick={() => startEdit(project)}
                                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors shrink-0"
                                                title="Edit budget &amp; spent"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-400 hover:text-emerald-400" />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={saving}
                                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                                    title="Save"
                                                >
                                                    {saving ? (
                                                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                                                    ) : (
                                                        <Save className="w-4 h-4 text-emerald-400" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="mt-4 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-400 block mb-1">Budget ($)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="100"
                                                        value={editBudget}
                                                        onChange={(e) => setEditBudget(e.target.value)}
                                                        title="Budget amount"
                                                        placeholder="0"
                                                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-emerald-500/50 focus:outline-none text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400 block mb-1">Spent ($)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="100"
                                                        value={editSpent}
                                                        onChange={(e) => setEditSpent(e.target.value)}
                                                        title="Spent amount"
                                                        placeholder="0"
                                                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-emerald-500/50 focus:outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Payment Status</label>
                                                <select
                                                    value={editPaymentStatus}
                                                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                                                    title="Payment status"
                                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-emerald-500/50 focus:outline-none text-sm"
                                                >
                                                    <option value="unpaid">Unpaid</option>
                                                    <option value="partial">Partial</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <span className="text-gray-400">
                                                    {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                                                </span>
                                                <span className={`font-semibold ${project.paymentStatus === 'paid' ? 'text-emerald-400'
                                                        : project.paymentStatus === 'partial' ? 'text-amber-400'
                                                            : 'text-gray-400'
                                                    }`}>
                                                    {project.paymentStatus}
                                                </span>
                                            </div>
                                            <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`absolute inset-y-0 left-0 rounded-full transition-all ${progress > 90 ? 'bg-emerald-500'
                                                            : progress > 50 ? 'bg-blue-500'
                                                                : progress > 0 ? 'bg-amber-500'
                                                                    : 'bg-gray-700'
                                                        }`}
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Revenue() {
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);

    const {
        data,
        loading,
        error,
        refetch,
        editableProjects,
        loadingProjects,
        fetchProjects,
        saveBudgetSpent,
        handleExport,
    } = useRevenue(timeRange);

    const openBudgetModal = useCallback(() => {
        setBudgetModalOpen(true);
        fetchProjects();
    }, [fetchProjects]);

    // Loading state
    if (loading) return <LoadingSkeleton />;

    // Error state
    if (error) return <ErrorState error={error} onRetry={refetch} />;

    // Data loaded
    const metrics = data?.metrics;
    const monthlyData = data?.monthlyRevenue ?? [];
    const services = data?.revenueByService ?? [];
    const invoices = data?.recentInvoices ?? [];
    const projectionData = data?.projections ?? [];
    const paymentMethodData = data?.paymentMethods ?? [];

    // Pre-compute metric changes
    const totalChange = metrics ? calcChange(metrics.totalRevenue, metrics.previousTotalRevenue) : { value: 0, isPositive: true };
    const recurringChange = metrics ? calcChange(metrics.recurringRevenue, metrics.previousRecurringRevenue) : { value: 0, isPositive: true };
    const outstandingChange = metrics ? calcChange(metrics.outstandingInvoices, metrics.previousOutstanding) : { value: 0, isPositive: true };
    const dealSizeChange = metrics ? calcChange(metrics.avgDealSize, metrics.previousAvgDealSize) : { value: 0, isPositive: true };
    const paymentCycleChange = metrics ? calcChange(metrics.avgPaymentCycleDays, metrics.previousPaymentCycleDays) : { value: 0, isPositive: true };
    const oneTimeRevenue = metrics ? metrics.oneTimeRevenue : 0;
    const prevOneTime = metrics ? metrics.previousOneTimeRevenue : 0;
    const oneTimeChange = calcChange(oneTimeRevenue, prevOneTime);
    const recurringPct = metrics && metrics.totalRevenue > 0
        ? Math.round((metrics.recurringRevenue / metrics.totalRevenue) * 1000) / 10
        : 0;
    const oneTimePct = metrics && metrics.totalRevenue > 0
        ? Math.round((oneTimeRevenue / metrics.totalRevenue) * 1000) / 10
        : 0;

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

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Time Range Selector */}
                        <div className="flex items-center gap-1 bg-gray-900/50 border border-gray-800 rounded-xl p-1">
                            {(['today', 'week', 'month', 'quarter', 'year'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {range.charAt(0).toUpperCase() + range.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Edit Budget Button */}
                        <button
                            onClick={openBudgetModal}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-amber-500/50 transition-all group"
                            title="Edit project budgets &amp; spending"
                        >
                            <Pencil className="w-4 h-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
                            <span className="text-sm font-medium text-white">Budget</span>
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-emerald-500/50 transition-all group"
                        >
                            <Download className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                            <span className="text-sm font-medium text-white">Export</span>
                        </button>

                        {/* Refresh Button */}
                        <button
                            onClick={refetch}
                            className="p-2.5 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-blue-500/50 transition-all group"
                            title="Refresh data"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Metrics Grid  - Live Data */}
                {metrics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <MetricCard
                            icon={DollarSign}
                            value={formatCurrency(metrics.totalRevenue, true)}
                            label="Total Revenue"
                            change={totalChange}
                            subLeft={`Previous: ${formatCurrency(metrics.previousTotalRevenue, true)}`}
                            subRight={`Target: ${formatCurrency(metrics.targetRevenue, true)}`}
                            accentColor="emerald"
                        />
                        <MetricCard
                            icon={RefreshCw}
                            value={formatCurrency(metrics.recurringRevenue, true)}
                            label="Recurring Revenue (MRR)"
                            change={recurringChange}
                            subLeft={`Previous: ${formatCurrency(metrics.previousRecurringRevenue, true)}`}
                            subRight={`${recurringPct}% of total`}
                            subRightColor="text-blue-400"
                            accentColor="blue"
                        />
                        <MetricCard
                            icon={Clock}
                            value={formatCurrency(metrics.outstandingInvoices, true)}
                            label="Outstanding Invoices"
                            change={outstandingChange}
                            invertChangeColor
                            subLeft={`Previous: ${formatCurrency(metrics.previousOutstanding, true)}`}
                            subRight={metrics.overdueAmount > 0 ? `${formatCurrency(metrics.overdueAmount, true)} overdue` : undefined}
                            subRightColor="text-red-400"
                            accentColor="amber"
                        />
                        <MetricCard
                            icon={Target}
                            value={formatCurrency(metrics.avgDealSize, true)}
                            label="Average Deal Size"
                            change={dealSizeChange}
                            subLeft={`Previous: ${formatCurrency(metrics.previousAvgDealSize, true)}`}
                            subRight={`${metrics.totalDeals} deals`}
                            accentColor="purple"
                        />
                        <MetricCard
                            icon={Zap}
                            value={`${metrics.avgPaymentCycleDays} days`}
                            label="Avg Payment Cycle"
                            change={paymentCycleChange}
                            invertChangeColor
                            subLeft={`Previous: ${metrics.previousPaymentCycleDays} days`}
                            accentColor="cyan"
                        />
                        <MetricCard
                            icon={Briefcase}
                            value={formatCurrency(oneTimeRevenue, true)}
                            label="One-time Projects"
                            change={oneTimeChange}
                            subLeft={`Previous: ${formatCurrency(prevOneTime, true)}`}
                            subRight={`${oneTimePct}% of total`}
                            subRightColor="text-pink-400"
                            accentColor="pink"
                        />
                    </div>
                )}

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
                        </div>
                        <RevenueChart data={monthlyData} />
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-400" />
                                Revenue Target
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Period goal progress</p>
                        </div>
                        {metrics && <ProgressToTarget metrics={metrics} />}
                    </div>
                </div>

                {/* Middle Section: Invoices + Services */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-amber-400" />
                                    Recent Invoices
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">Latest payment records</p>
                            </div>
                            <span className="text-xs text-gray-500">{invoices.length} shown</span>
                        </div>
                        <InvoiceList invoices={invoices} />
                    </div>

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
                        <ServiceRevenueList services={services} />
                    </div>
                </div>

                {/* Bottom Section: Projections + Payment Methods */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                Revenue Projections
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Forecast for upcoming months</p>
                        </div>
                        <ProjectionsView projections={projectionData} />
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-cyan-400" />
                                Payment Methods
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Distribution by payment type</p>
                        </div>
                        <PaymentMethodsView methods={paymentMethodData} />
                    </div>
                </div>
            </div>

            {/* Budget/Spent Edit Modal */}
            <BudgetEditModal
                isOpen={budgetModalOpen}
                onClose={() => setBudgetModalOpen(false)}
                projects={editableProjects}
                loading={loadingProjects}
                onSave={saveBudgetSpent}
            />
        </div>
    );
}