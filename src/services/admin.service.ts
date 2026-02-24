// ============================================================================
// TechMate Admin Service
// Dashboard metrics, analytics, and admin operations
// ============================================================================

import supabase from '../lib/supabaseClient';
import type { ProfileRow, ProjectRow, ProjectRowWithClient, OrderRow, InvoiceRow, RequestRow, SupportTicketRow, ActivityLogRowWithProfile } from '../types/database.types';
import type {
    AdminDashboardMetrics,
    GrowthDataPoint,
    RevenueDataPoint,
    ServiceResponse,
} from '../types/api.types';

// ============================================================================
// Dashboard Metrics
// ============================================================================
export async function getAdminMetrics(): Promise<ServiceResponse<AdminDashboardMetrics>> {
    const { data, error } = await supabase.rpc('get_admin_metrics');

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data as unknown as AdminDashboardMetrics, error: null };
}

// ============================================================================
// Chart Data
// ============================================================================
export async function getUserGrowth(months: number = 12): Promise<ServiceResponse<GrowthDataPoint[]>> {
    const { data, error } = await supabase.rpc('get_user_growth', { p_months: months });

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: (data ?? []) as GrowthDataPoint[], error: null };
}

export async function getRevenueByMonth(months: number = 12): Promise<ServiceResponse<RevenueDataPoint[]>> {
    const { data, error } = await supabase.rpc('get_revenue_by_month', { p_months: months });

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: (data ?? []) as RevenueDataPoint[], error: null };
}

// ============================================================================
// Revenue Analytics
// ============================================================================
export async function getRevenueStats() {
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('amount, tax_amount, status, paid_date, created_at')
        .is('deleted_at', null)
        .returns<InvoiceRow[]>();

    if (error) return { totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0, overdueRevenue: 0, monthlyRevenue: 0 };

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const all = (invoices as InvoiceRow[]) ?? [];

    return {
        totalRevenue: all.reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
        paidRevenue: all.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
        pendingRevenue: all.filter(i => i.status === 'sent').reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
        overdueRevenue: all.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
        monthlyRevenue: all.filter(i => i.status === 'paid' && i.paid_date && i.paid_date >= monthStart)
            .reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
    };
}

// ============================================================================
// Recent Activity
// ============================================================================
export async function getRecentProjects(limit: number = 10): Promise<ServiceResponse<ProjectRowWithClient[]>> {
    const { data, error } = await supabase
        .from('projects')
        .select('*, profiles:user_id(email, full_name)')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: (data as any) ?? [], error: null };
}

export async function getRecentOrders(limit: number = 10): Promise<ServiceResponse<OrderRow[]>> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

export async function getRecentUsers(limit: number = 10): Promise<ServiceResponse<ProfileRow[]>> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

/**
 * Get all client profiles for selection
 */
export async function getAllClients(): Promise<ServiceResponse<ProfileRow[]>> {
    // 1. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .is('deleted_at', null);

    if (profilesError) {
        return { data: null, error: { code: profilesError.code, message: profilesError.message } };
    }

    // 2. Fetch all unique client_ids from inquiries to ensure we don't miss anyone
    const { data: inquiries } = await supabase
        .from('client_inquiries')
        .select('client_id')
        .is('deleted_at', null);

    const inquiryClientIds = new Set((inquiries || []).map(i => i.client_id));

    // 3. Filter profiles
    const clients = (profiles ?? []).filter(p => {
        // If they have submitted an inquiry, they are definitively a client
        if (inquiryClientIds.has(p.id)) return true;

        // Exclude explicit admins
        if (p.is_admin || p.role === 'admin') return false;

        // Exclude explicit internal team members
        if (p.user_type === 'developer' || p.user_type === 'designer' || p.user_type === 'technical_lead') return false;

        // Include everyone else (they are implicitly clients)
        return true;
    });

    // 4. Sort alphabetically
    clients.sort((a, b) => (a.full_name || a.email).localeCompare(b.full_name || b.email));

    return { data: clients, error: null };
}

export async function getRecentInvoices(limit: number = 10): Promise<ServiceResponse<InvoiceRow[]>> {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}


export async function getRecentActivity(limit: number = 10): Promise<ServiceResponse<ActivityLogRowWithProfile[]>> {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*, profiles(full_name, avatar_url, email)')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: (data as any) ?? [], error: null };
}

// ============================================================================
// Open Items (tickets, requests)
// ============================================================================
export async function getOpenRequests(limit: number = 20): Promise<ServiceResponse<RequestRow[]>> {
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

export async function getOpenTickets(limit: number = 20): Promise<ServiceResponse<SupportTicketRow[]>> {
    const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .in('status', ['open', 'in_progress'])
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

// ============================================================================
// Service Categories
// ============================================================================
export async function getServiceCategories() {
    const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) return [];
    return data ?? [];
}

// ============================================================================
// System Health (Summary)
// ============================================================================
export async function getSystemHealth() {
    const [metrics, recentUsers, openTickets] = await Promise.all([
        getAdminMetrics(),
        getRecentUsers(5),
        getOpenTickets(5),
    ]);

    return {
        metrics: metrics.data,
        recentUsers: recentUsers.data ?? [],
        openTickets: openTickets.data ?? [],
        status: 'healthy' as const,
        lastChecked: new Date().toISOString(),
    };
}
