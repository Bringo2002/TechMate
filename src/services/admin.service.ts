// ============================================================================
// TechMate Admin Service
// Dashboard metrics, analytics, and admin operations
// ============================================================================

import api from '../lib/apiClient';
import type { ProfileRow, ProjectRow, ProjectRowWithClient, OrderRow, InvoiceRow, RequestRow, SupportTicketRow, ActivityLogRowWithProfile, ServiceCategoryRow } from '../types/database.types';
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
    try {
        const data = await api.get<AdminDashboardMetrics>('/admin-metrics/live');
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

// ============================================================================
// Chart Data
// ============================================================================
export async function getUserGrowth(months: number = 12): Promise<ServiceResponse<GrowthDataPoint[]>> {
    try {
        const data = await api.get<GrowthDataPoint[]>(`/admin-metrics/user-growth?months=${months}`);
        return { data: data ?? [], error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getRevenueByMonth(months: number = 12): Promise<ServiceResponse<RevenueDataPoint[]>> {
    // Try the real function first
    try {
        const data = await api.get<RevenueDataPoint[]>(`/admin-metrics/revenue-by-month?months=${months}`);
        if (data && data.length > 0) {
            return { data, error: null };
        }
    } catch {
        // fall through to the projects-based fallback below
    }

    // Fallback: derive from projects
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    let projects: Array<{ budget: number; created_at: string; status: string }>;
    try {
        const all = await api.get<Array<{ budget: number; created_at: string; status: string }>>('/projects');
        projects = (all ?? []).filter(
            p => p.status !== 'cancelled' && new Date(p.created_at) >= cutoff
        );
    } catch {
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
    let invoices: InvoiceRow[] = [];
    try {
        invoices = await api.get<InvoiceRow[]>('/invoices');
    } catch {
        invoices = [];
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    if (invoices.length > 0) {
        const all = invoices;
        return {
            totalRevenue: all.reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
            paidRevenue: all.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
            pendingRevenue: all.filter(i => i.status === 'sent').reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
            overdueRevenue: all.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
            monthlyRevenue: all.filter(i => i.status === 'paid' && i.paid_date && i.paid_date >= monthStart)
                .reduce((s, i) => s + (i.amount ?? 0) + (i.tax_amount ?? 0), 0),
        };
    }

    // 2. Fallback: derive revenue from projects
    let projects: Array<{ budget: number; spent: number; status: string; payment_status: string; updated_at: string }>;
    try {
        projects = await api.get('/projects');
    } catch {
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
    try {
        const [projects, users] = await Promise.all([
            api.get<ProjectRow[]>('/projects'),
            api.get<Array<{ id: string; email: string; full_name: string | null }>>('/users').catch(() => []),
        ]);
        const userMap = new Map(users.map(u => [u.id, u]));
        const withClient = (projects ?? [])
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, limit)
            .map(p => ({ ...p, profiles: userMap.get(p.user_id) ?? null })) as unknown as ProjectRowWithClient[];
        return { data: withClient, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getAllProjects(): Promise<ServiceResponse<ProjectRowWithClient[]>> {
    try {
        const [projects, users] = await Promise.all([
            api.get<ProjectRow[]>('/projects'),
            api.get<Array<{ id: string; email: string; full_name: string | null }>>('/users').catch(() => []),
        ]);
        const userMap = new Map(users.map(u => [u.id, u]));
        const withClient = (projects ?? [])
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .map(p => ({ ...p, profiles: userMap.get(p.user_id) ?? null })) as unknown as ProjectRowWithClient[];
        return { data: withClient, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

// ============================================================================
// Single Project — used by ProjectDashboard detail page
// ============================================================================
export async function getProjectById(projectId: string): Promise<ServiceResponse<ProjectRowWithClient>> {
    if (!projectId) {
        return { data: null, error: { code: 'MISSING_ID', message: 'Project ID is required' } };
    }

    try {
        const project = await api.get<ProjectRow>(`/projects/${projectId}`);
        let owner: { id: string; email: string; full_name: string | null } | null = null;
        try {
            owner = await api.get(`/users/${project.user_id}`);
        } catch {
            // Owner lookup failing shouldn't fail the whole project fetch
        }
        return { data: { ...project, profiles: owner } as unknown as ProjectRowWithClient, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getRecentOrders(limit: number = 10): Promise<ServiceResponse<OrderRow[]>> {
    try {
        const data = await api.get<OrderRow[]>('/orders');
        const sorted = (data ?? [])
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);
        return { data: sorted, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getRecentUsers(limit: number = 10): Promise<ServiceResponse<ProfileRow[]>> {
    try {
        const data = await api.get<ProfileRow[]>('/users');
        const sorted = (data ?? [])
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);
        return { data: sorted, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

/**
 * Get all client profiles for selection
 */
export async function getAllClients(): Promise<ServiceResponse<ProfileRow[]>> {
    // 1. Fetch all profiles
    let profiles: ProfileRow[];
    try {
        profiles = await api.get<ProfileRow[]>('/users');
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }

    // 2. Fetch all inquiries to ensure we don't miss anyone who submitted one
    let inquiries: Array<{ client_id: string }> = [];
    try {
        inquiries = await api.get<Array<{ client_id: string }>>('/inquiries');
    } catch {
        // Non-critical — proceeds with just the role-based filter below
    }

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
    // Parallel fetch: profiles, projects, invoices (paid), businesses (active)
    let profiles: ProfileRow[];
    let projects: ProjectRow[];
    let invoices: InvoiceRow[];
    let businesses: { id: string; owner_id: string; name: string; industry: string | null }[];

    try {
        const [profilesData, projectsData, invoicesData, businessesData] = await Promise.all([
            api.get<ProfileRow[]>('/users'),
            api.get<ProjectRow[]>('/projects'),
            api.get<InvoiceRow[]>('/invoices'),
            api.get<{ id: string; owner_id: string; name: string; industry: string | null }[]>('/businesses'),
        ]);
        profiles = profilesData ?? [];
        projects = projectsData ?? [];
        // Backend doesn't support a status filter param on /invoices or
        // an is_active filter on /businesses — filtered client-side here,
        // same pattern used elsewhere in this codebase.
        invoices = (invoicesData ?? []).filter(i => i.status === 'paid');
        businesses = (businessesData ?? []).filter(b => (b as unknown as { is_active?: boolean }).is_active !== false);
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }

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
        const activeProjects = userProjects.filter(pr => pr.status === 'active');
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

    let p: ProfileRow;
    let userProjects: ProjectRow[];
    let userInvoices: InvoiceRow[];
    let business: { id: string; owner_id: string; name: string; industry: string | null } | undefined;

    try {
        const [profile, allProjects, allInvoices, allBusinesses] = await Promise.all([
            api.get<ProfileRow>(`/users/${clientId}`),
            api.get<ProjectRow[]>(`/projects?userId=${clientId}`),
            api.get<InvoiceRow[]>(`/invoices?userId=${clientId}`),
            api.get<{ id: string; owner_id: string; name: string; industry: string | null }[]>('/businesses').catch(() => []),
        ]);
        p = profile;
        userProjects = (allProjects ?? []).sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        userInvoices = (allInvoices ?? []).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        // Backend has no ownerId filter param on /businesses — filtered client-side.
        business = (allBusinesses as unknown as { owner_id: string; is_active?: boolean }[])
            .find(b => b.owner_id === clientId && b.is_active !== false) as unknown as
            { id: string; owner_id: string; name: string; industry: string | null } | undefined;
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }

    const activeProjects = userProjects.filter(pr => pr.status === 'active');
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
    try {
        const data = await api.get<InvoiceRow[]>('/invoices');
        const sorted = (data ?? [])
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);
        return { data: sorted, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}


export async function getRecentActivity(limit: number = 10): Promise<ServiceResponse<ActivityLogRowWithProfile[]>> {
    try {
        const [logs, users] = await Promise.all([
            api.get<ActivityLogRowWithProfile[]>(`/activity-logs`),
            api.get<Array<{ id: string; full_name: string | null; avatar_url: string | null; email: string }>>('/users').catch(() => []),
        ]);
        const userMap = new Map(users.map(u => [u.id, u]));
        const withProfile = (logs ?? [])
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit)
            .map(l => ({
                ...l,
                profiles: l.user_id ? userMap.get(l.user_id) ?? null : null,
            })) as unknown as ActivityLogRowWithProfile[];
        return { data: withProfile, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

// ============================================================================
// Open Items (tickets, requests)
// ============================================================================
/**
 * The "requests" table is a deprecated marketplace concept — the real
 * schema's own comment on client_inquiries says it explicitly replaces
 * this table, and no backend module was built for it (deliberately;
 * see the ClientInquiries module's notes). Rather than fake a mapping
 * onto ClientInquiries with mismatched status semantics (new/reviewing/
 * discovery_call_scheduled/etc. vs. open/in_progress), this returns
 * empty. If "open requests" needs real data, it should mean open
 * ClientInquiries — that's a product decision, not something to guess
 * silently here.
 */
export async function getOpenRequests(_limit: number = 20): Promise<ServiceResponse<RequestRow[]>> {
    return { data: [], error: null };
}

export async function getOpenTickets(limit: number = 20): Promise<ServiceResponse<SupportTicketRow[]>> {
    try {
        const data = await api.get<SupportTicketRow[]>('/support-tickets');
        const openOnly = (data ?? [])
            .filter(t => t.status === 'open' || t.status === 'in_progress')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);
        return { data: openOnly, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

// ============================================================================
// Service Categories
// ============================================================================
export async function getServiceCategories() {
    try {
        return await api.get<ServiceCategoryRow[]>('/service-categories/active');
    } catch {
        return [];
    }
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