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
    // Try RPC first
    const { data, error } = await supabase.rpc('get_revenue_by_month', { p_months: months });

    if (!error && data && (data as RevenueDataPoint[]).length > 0) {
        return { data: data as RevenueDataPoint[], error: null };
    }

    // Fallback: derive from projects table
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('budget, created_at, status')
        .is('deleted_at', null)
        .neq('status', 'cancelled')
        .gte('created_at', cutoff.toISOString());

    if (projError || !projects) {
        return { data: [], error: null };
    }

    // Group by month
    const monthMap: Record<string, number> = {};
    for (const p of projects) {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = (monthMap[key] || 0) + (p.budget || 0);
    }

    // Fill in missing months so the sparkline is continuous
    const result: RevenueDataPoint[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        result.push({ month: key, revenue: monthMap[key] || 0 });
    }

    return { data: result, error: null };
}


// ============================================================================
// Revenue Analytics
// ============================================================================
export async function getRevenueStats() {
    // 1. Try invoices first
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('amount, tax_amount, status, paid_date, created_at')
        .is('deleted_at', null)
        .returns<InvoiceRow[]>();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    if (!error && invoices && invoices.length > 0) {
        const all = invoices as InvoiceRow[];
        return {
            totalRevenue: all.reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
            paidRevenue: all.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
            pendingRevenue: all.filter(i => i.status === 'sent').reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
            overdueRevenue: all.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
            monthlyRevenue: all.filter(i => i.status === 'paid' && i.paid_date && i.paid_date >= monthStart)
                .reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
        };
    }

    // 2. Fallback: derive revenue from projects table
    const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('budget, spent, status, payment_status, updated_at')
        .is('deleted_at', null)
        .neq('status', 'cancelled');

    if (projError || !projects) {
        return { totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0, overdueRevenue: 0, monthlyRevenue: 0 };
    }

    const totalRevenue = projects.reduce((s, p) => s + (p.budget || 0), 0);
    const paidRevenue = projects
        .filter(p => p.payment_status === 'paid')
        .reduce((s, p) => s + (p.budget || 0), 0);
    const pendingRevenue = projects
        .filter(p => p.payment_status === 'unpaid' || p.payment_status === 'partial')
        .filter(p => ['active', 'review', 'planning', 'completed'].includes(p.status))
        .reduce((s, p) => s + (p.budget || 0) - (p.spent || 0), 0);
    const monthlyRevenue = projects
        .filter(p => p.payment_status === 'paid' && p.updated_at && p.updated_at >= monthStart)
        .reduce((s, p) => s + (p.budget || 0), 0);

    return {
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        overdueRevenue: 0,
        monthlyRevenue,
    };
}


// ============================================================================
// Recent Activity
// ============================================================================
export async function getRecentProjects(limit: number = 10): Promise<ServiceResponse<ProjectRowWithClient[]>> {
    const { data, error } = await supabase
        .from('projects')
        .select('*, profiles!user_id(email, full_name)')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: (data ?? []) as ProjectRowWithClient[], error: null };
}

export async function getAllProjects(): Promise<ServiceResponse<ProjectRowWithClient[]>> {
    const { data, error } = await supabase
        .from('projects')
        .select('*, profiles!user_id(email, full_name)')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: (data ?? []) as ProjectRowWithClient[], error: null };
}

// ============================================================================
// Single Project — used by ProjectDashboard detail page
// ============================================================================
export async function getProjectById(projectId: string): Promise<ServiceResponse<ProjectRowWithClient>> {
    if (!projectId) {
        return { data: null, error: { code: 'MISSING_ID', message: 'Project ID is required' } };
    }

    const { data, error } = await supabase
        .from('projects')
        .select('*, profiles:user_id(email, full_name)')
        .eq('id', projectId)
        .is('deleted_at', null)
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data as unknown as ProjectRowWithClient, error: null };
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

// ============================================================================
// Client Stats (aggregated view for the Client Relationship Hub)
// ============================================================================
export interface ClientStats {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    company: string | null;
    joinedAt: string;
    industry: string | null;
    projects: { total: number; active: number; completed: number };
    healthScore: number;
    totalRevenue: number;
    totalBudget: number;
    totalSpent: number;
    technologies: string[];
    riskLevel: string;
    risks: string[];
    opportunities: string[];
    lastProjectUpdate: string | null;
    status: 'active' | 'at-risk' | 'champion' | 'inactive';
}

export async function getClientsWithStats(): Promise<ServiceResponse<ClientStats[]>> {
    // Parallel fetch: profiles, projects, invoices (paid), businesses
    const [profilesRes, projectsRes, invoicesRes, businessesRes] = await Promise.all([
        supabase.from('profiles').select('*').is('deleted_at', null),
        supabase.from('projects').select('*').is('deleted_at', null),
        supabase.from('invoices').select('*').eq('status', 'paid').is('deleted_at', null),
        supabase.from('businesses').select('*').eq('is_active', true).is('deleted_at', null),
    ]);

    if (profilesRes.error) {
        return { data: null, error: { code: profilesRes.error.code, message: profilesRes.error.message } };
    }

    const profiles = profilesRes.data ?? [];
    const projects = (projectsRes.data ?? []) as ProjectRow[];
    const invoices = (invoicesRes.data ?? []) as InvoiceRow[];
    const businesses = (businessesRes.data ?? []) as { id: string; owner_id: string; name: string; industry: string | null }[];

    // Index projects by user_id
    const projectsByUser = new Map<string, ProjectRow[]>();
    for (const p of projects) {
        const uid = p.user_id;
        if (!uid) continue;
        if (!projectsByUser.has(uid)) projectsByUser.set(uid, []);
        projectsByUser.get(uid)!.push(p);
    }

    // Index revenue by user_id
    const revenueByUser = new Map<string, number>();
    for (const inv of invoices) {
        const uid = inv.user_id;
        if (!uid) continue;
        revenueByUser.set(uid, (revenueByUser.get(uid) ?? 0) + Number(inv.amount ?? 0));
    }

    // Index industry by owner_id
    const industryByOwner = new Map<string, string>();
    for (const b of businesses) {
        if (b.owner_id && b.industry) industryByOwner.set(b.owner_id, b.industry);
    }

    // Build client list — exclude admins and internal roles
    const clientProfiles = profiles.filter(p =>
        !p.is_admin &&
        p.role !== 'admin' &&
        p.user_type !== 'developer' &&
        p.user_type !== 'designer' &&
        p.user_type !== 'technical_lead'
    );

    const clientStats: ClientStats[] = clientProfiles.map(p => {
        const userProjects = projectsByUser.get(p.id) ?? [];
        const activeProjects = userProjects.filter(pr => pr.status === 'active' || pr.status === 'in_progress');
        const completedProjects = userProjects.filter(pr => pr.status === 'completed');

        // Health score: average of active projects, or 0
        const healthScores = activeProjects.map(pr => Number(pr.health_score ?? 0)).filter(s => s > 0);
        const healthScore = healthScores.length > 0
            ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
            : (userProjects.length > 0 ? 50 : 0);

        // Revenue
        const totalRevenue = revenueByUser.get(p.id) ?? 0;
        const totalBudget = userProjects.reduce((s, pr) => s + Number(pr.budget ?? 0), 0);
        const totalSpent = userProjects.reduce((s, pr) => s + Number(pr.spent ?? 0), 0);

        // Technologies (flatten & dedupe)
        const techs = new Set<string>();
        for (const pr of userProjects) {
            const t = pr.technologies;
            if (Array.isArray(t)) t.forEach(x => techs.add(String(x)));
        }

        // Risks & opportunities from project metadata
        const risks: string[] = [];
        const opportunities: string[] = [];
        let worstRisk = 'low';
        for (const pr of userProjects) {
            const rl = pr.risk_level;
            if (rl === 'high') worstRisk = 'high';
            else if (rl === 'medium' && worstRisk !== 'high') worstRisk = 'medium';

            const prRisks = pr.risks;
            if (Array.isArray(prRisks)) prRisks.forEach((r: string) => risks.push(r));

            const prOpps = pr.opportunities;
            if (Array.isArray(prOpps)) prOpps.forEach((o: string) => opportunities.push(o));
        }

        // Last activity
        const dates = userProjects.map(pr => pr.updated_at).filter(Boolean).sort().reverse();
        const lastProjectUpdate = dates[0] ?? null;

        // Status derivation
        let status: ClientStats['status'] = 'inactive';
        if (healthScore >= 90 && activeProjects.length > 0) status = 'champion';
        else if (healthScore < 70 || worstRisk === 'high') status = 'at-risk';
        else if (activeProjects.length > 0) status = 'active';

        return {
            id: p.id,
            name: p.full_name || p.email,
            email: p.email,
            avatarUrl: p.avatar_url ?? null,
            company: p.company ?? null,
            joinedAt: p.created_at,
            industry: industryByOwner.get(p.id) ?? null,
            projects: { total: userProjects.length, active: activeProjects.length, completed: completedProjects.length },
            healthScore,
            totalRevenue,
            totalBudget,
            totalSpent,
            technologies: [...techs],
            riskLevel: worstRisk,
            risks,
            opportunities,
            lastProjectUpdate,
            status,
        };
    });

    return { data: clientStats, error: null };
}

// ============================================================================
// Single Client Detail — full stats + project list for detail page
// ============================================================================
export interface ClientDetail extends ClientStats {
    projectList: ProjectRow[];
    invoices: InvoiceRow[];
}

export async function getClientById(clientId: string): Promise<ServiceResponse<ClientDetail>> {
    if (!clientId) {
        return { data: null, error: { code: 'MISSING_ID', message: 'Client ID is required' } };
    }

    // Parallel fetch
    const [profileRes, projectsRes, invoicesRes, businessRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', clientId).is('deleted_at', null).single(),
        supabase.from('projects').select('*').eq('user_id', clientId).is('deleted_at', null).order('updated_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('user_id', clientId).is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('businesses').select('*').eq('owner_id', clientId).eq('is_active', true).is('deleted_at', null).limit(1),
    ]);

    if (profileRes.error) {
        return { data: null, error: { code: profileRes.error.code, message: profileRes.error.message } };
    }

    const p = profileRes.data as ProfileRow;
    const userProjects = (projectsRes.data ?? []) as ProjectRow[];
    const userInvoices = (invoicesRes.data ?? []) as InvoiceRow[];
    const business = ((businessRes.data ?? []) as { id: string; owner_id: string; name: string; industry: string | null }[])[0];

    const activeProjects = userProjects.filter(pr => pr.status === 'active' || pr.status === 'in_progress');
    const completedProjects = userProjects.filter(pr => pr.status === 'completed');

    const healthScores = activeProjects.map(pr => Number(pr.health_score ?? 0)).filter(s => s > 0);
    const healthScore = healthScores.length > 0
        ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
        : (userProjects.length > 0 ? 50 : 0);

    const paidInvoices = userInvoices.filter(i => i.status === 'paid');
    const totalRevenue = paidInvoices.reduce((s, i) => s + Number(i.amount ?? 0), 0);
    const totalBudget = userProjects.reduce((s, pr) => s + Number(pr.budget ?? 0), 0);
    const totalSpent = userProjects.reduce((s, pr) => s + Number(pr.spent ?? 0), 0);

    const techs = new Set<string>();
    const risks: string[] = [];
    const opportunities: string[] = [];
    let worstRisk = 'low';

    for (const pr of userProjects) {
        if (Array.isArray(pr.technologies)) pr.technologies.forEach(x => techs.add(String(x)));
        const rl = pr.risk_level;
        if (rl === 'high') worstRisk = 'high';
        else if (rl === 'medium' && worstRisk !== 'high') worstRisk = 'medium';
        if (Array.isArray(pr.risks)) pr.risks.forEach((r: string) => risks.push(r));
        if (Array.isArray(pr.opportunities)) pr.opportunities.forEach((o: string) => opportunities.push(o));
    }

    const dates = userProjects.map(pr => pr.updated_at).filter(Boolean).sort().reverse();
    const lastProjectUpdate = dates[0] ?? null;

    let status: ClientStats['status'] = 'inactive';
    if (healthScore >= 90 && activeProjects.length > 0) status = 'champion';
    else if (healthScore < 70 || worstRisk === 'high') status = 'at-risk';
    else if (activeProjects.length > 0) status = 'active';

    return {
        data: {
            id: p.id,
            name: p.full_name || p.email,
            email: p.email,
            avatarUrl: p.avatar_url ?? null,
            company: p.company ?? null,
            joinedAt: p.created_at,
            industry: business?.industry ?? null,
            projects: { total: userProjects.length, active: activeProjects.length, completed: completedProjects.length },
            healthScore,
            totalRevenue,
            totalBudget,
            totalSpent,
            technologies: [...techs],
            riskLevel: worstRisk,
            risks,
            opportunities,
            lastProjectUpdate,
            status,
            projectList: userProjects,
            invoices: userInvoices,
        },
        error: null,
    };
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
    return { data: (data ?? []) as ActivityLogRowWithProfile[], error: null };
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