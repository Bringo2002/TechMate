// ============================================================================
// TechMate Teams Service
// Aggregates real Supabase data for the Teams & Developer Allocation page
// ============================================================================

import api from '../lib/apiClient';
import type {
    TeamMemberRow,
    DeveloperAllocationRow,
    TeamMemberRole,
    TeamDepartment,
    Seniority,
    TeamMemberStatus,
    AllocationStatus,
    ProjectRoleOnProject,
} from '../types/database.types';

// ============================================================================
// Types
// ============================================================================

/** A lightweight project reference used in UI grids/tables */
export interface ProjectRef {
    id: string;
    name: string;
    status: string;
}

/** An allocation row with its parent project resolved */
export type AllocationWithProject = DeveloperAllocationRow & {
    project?: ProjectRef | null;
};

/** Extended member with allocation data and computed roll-ups */
export interface MemberWithWorkload extends TeamMemberRow {
    allocations: AllocationWithProject[];
    total_allocation_pct: number;
    active_projects: number;
    totalEstimated: number;
    totalLogged: number;
}

/** KPI snapshot for the header cards */
export interface TeamsKPIs {
    activeCount: number;
    onLeaveCount: number;
    inactiveCount: number;
    avgAllocation: number;
    overallocated: number;
    underutilised: number;
    activeProjectsCount: number;
    totalMembers: number;
}

/** Everything the Teams page needs */
export interface TeamsData {
    members: MemberWithWorkload[];
    projects: ProjectRef[];
    allocations: AllocationWithProject[];
    kpis: TeamsKPIs;
}

// ============================================================================
// Helpers
// ============================================================================

/** Safely cast string → typed enum, falling back to a default   */
function asRole(v: string | null | undefined): TeamMemberRole {
    const valid: TeamMemberRole[] = ['developer', 'designer', 'tech_lead', 'devops', 'qa', 'pm'];
    return valid.includes(v as TeamMemberRole) ? (v as TeamMemberRole) : 'developer';
}

function asDept(v: string | null | undefined): TeamDepartment {
    const valid: TeamDepartment[] = ['engineering', 'design', 'qa', 'devops', 'management'];
    return valid.includes(v as TeamDepartment) ? (v as TeamDepartment) : 'engineering';
}

function asSeniority(v: string | null | undefined): Seniority {
    const valid: Seniority[] = ['junior', 'mid', 'senior', 'lead', 'principal'];
    return valid.includes(v as Seniority) ? (v as Seniority) : 'mid';
}

function asStatus(v: string | null | undefined): TeamMemberStatus {
    const valid: TeamMemberStatus[] = ['active', 'on_leave', 'inactive'];
    return valid.includes(v as TeamMemberStatus) ? (v as TeamMemberStatus) : 'active';
}

function asAllocStatus(v: string | null | undefined): AllocationStatus {
    const valid: AllocationStatus[] = ['active', 'completed', 'paused', 'removed'];
    return valid.includes(v as AllocationStatus) ? (v as AllocationStatus) : 'active';
}

function asProjectRole(v: string | null | undefined): ProjectRoleOnProject {
    const valid: ProjectRoleOnProject[] = ['developer', 'lead', 'reviewer', 'designer', 'qa'];
    return valid.includes(v as ProjectRoleOnProject) ? (v as ProjectRoleOnProject) : 'developer';
}

// ============================================================================
// Main fetch
// ============================================================================

/**
 * Fetch all teams + allocation data from Supabase in parallel.
 * Joins are done in-memory so we don't depend on PostgREST relation
 * config – only raw table reads are needed.
 */
export async function fetchTeamsData(): Promise<TeamsData> {
    // Parallel queries ──────────────────────────────────────────────────────
    const [rawMembers, rawAllocs, rawProjects] = await Promise.all([
        api.get<Record<string, unknown>[]>('/team-members'),
        api.get<Record<string, unknown>[]>('/allocations'),
        api.get<Record<string, unknown>[]>('/projects'),
    ]) as [Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[]];

    // ── Normalise rows ─────────────────────────────────────────────────────

    const projects: ProjectRef[] = rawProjects.map(p => ({
        id: String(p.id ?? ''),
        name: String(p.name ?? ''),
        status: String(p.status ?? 'active'),
    }));

    const projectMap = new Map(projects.map(p => [p.id, p]));

    const members: TeamMemberRow[] = rawMembers.map(r => ({
        id: String(r.id ?? ''),
        profile_id: r.profile_id ? String(r.profile_id) : null,
        full_name: String(r.full_name ?? ''),
        email: String(r.email ?? ''),
        avatar_url: r.avatar_url ? String(r.avatar_url) : null,
        role: asRole(r.role as string),
        department: asDept(r.department as string),
        seniority: asSeniority(r.seniority as string),
        skills: Array.isArray(r.skills) ? (r.skills as string[]) : [],
        hourly_rate: Number(r.hourly_rate ?? 0),
        availability: Number(r.availability ?? 40),
        status: asStatus(r.status as string),
        joined_at: String(r.joined_at ?? ''),
        created_at: String(r.created_at ?? ''),
        updated_at: String(r.updated_at ?? ''),
        deleted_at: r.deleted_at ? String(r.deleted_at) : null,
    }));

    const allocations: AllocationWithProject[] = rawAllocs.map(r => {
        const pid = String(r.project_id ?? '');
        return {
            id: String(r.id ?? ''),
            team_member_id: String(r.team_member_id ?? ''),
            project_id: pid,
            role_on_project: asProjectRole(r.role_on_project as string),
            allocation_pct: Number(r.allocation_pct ?? 0),
            hours_estimated: Number(r.hours_estimated ?? 0),
            hours_logged: Number(r.hours_logged ?? 0),
            start_date: r.start_date ? String(r.start_date) : null,
            end_date: r.end_date ? String(r.end_date) : null,
            status: asAllocStatus(r.status as string),
            notes: r.notes ? String(r.notes) : null,
            created_at: String(r.created_at ?? ''),
            updated_at: String(r.updated_at ?? ''),
            project: projectMap.get(pid) ?? null,
        };
    });

    // ── Build MemberWithWorkload ───────────────────────────────────────────
    const membersWithWorkload: MemberWithWorkload[] = members.map(m => {
        const myAllocs = allocations.filter(a => a.team_member_id === m.id && a.status === 'active');
        const totalPct = myAllocs.reduce((s, a) => s + a.allocation_pct, 0);
        const totalEstimated = myAllocs.reduce((s, a) => s + a.hours_estimated, 0);
        const totalLogged = myAllocs.reduce((s, a) => s + a.hours_logged, 0);
        return {
            ...m,
            allocations: myAllocs,
            total_allocation_pct: totalPct,
            active_projects: myAllocs.length,
            totalEstimated,
            totalLogged,
        };
    });

    // ── KPIs ───────────────────────────────────────────────────────────────
    const activeCount = members.filter(m => m.status === 'active').length;
    const onLeaveCount = members.filter(m => m.status === 'on_leave').length;
    const inactiveCount = members.filter(m => m.status === 'inactive').length;
    const activeMembers = membersWithWorkload.filter(m => m.status === 'active');
    const avgAllocation = activeCount > 0
        ? Math.round(activeMembers.reduce((s, m) => s + m.total_allocation_pct, 0) / activeCount)
        : 0;
    const overallocated = membersWithWorkload.filter(m => m.total_allocation_pct > 100).length;
    const underutilised = activeMembers.filter(m => m.total_allocation_pct < 50).length;

    // Distinct active projects (from allocations only)
    const activeProjectIds = new Set(
        allocations.filter(a => a.status === 'active').map(a => a.project_id),
    );
    const activeProjectsCount = activeProjectIds.size;

    const kpis: TeamsKPIs = {
        activeCount,
        onLeaveCount,
        inactiveCount,
        avgAllocation,
        overallocated,
        underutilised,
        activeProjectsCount,
        totalMembers: members.length,
    };

    return {
        members: membersWithWorkload,
        projects,
        allocations,
        kpis,
    };
}

// ============================================================================
// Add a new team member
// ============================================================================

export interface AddTeamMemberPayload {
    full_name: string;
    email: string;
    role: TeamMemberRole;
    department: TeamDepartment;
    seniority: Seniority;
    skills: string[];
    hourly_rate: number;
    availability: number;
    status: TeamMemberStatus;
    avatar_url?: string | null;
    profile_id?: string | null;
}

export async function addTeamMember(payload: AddTeamMemberPayload): Promise<TeamMemberRow> {
    const raw = await api.post<Record<string, unknown>>('/team-members', {
        full_name: payload.full_name,
        email: payload.email,
        role: payload.role,
        department: payload.department,
        seniority: payload.seniority,
        skills: payload.skills,
        hourly_rate: payload.hourly_rate,
        availability: payload.availability,
        status: payload.status,
        avatar_url: payload.avatar_url ?? null,
        profile_id: payload.profile_id ?? null,
    });
    return {
        id: String(raw.id ?? ''),
        profile_id: raw.profile_id ? String(raw.profile_id) : null,
        full_name: String(raw.full_name ?? ''),
        email: String(raw.email ?? ''),
        avatar_url: raw.avatar_url ? String(raw.avatar_url) : null,
        role: asRole(raw.role as string),
        department: asDept(raw.department as string),
        seniority: asSeniority(raw.seniority as string),
        skills: Array.isArray(raw.skills) ? (raw.skills as string[]) : [],
        hourly_rate: Number(raw.hourly_rate ?? 0),
        availability: Number(raw.availability ?? 40),
        status: asStatus(raw.status as string),
        joined_at: String(raw.joined_at ?? ''),
        created_at: String(raw.created_at ?? ''),
        updated_at: String(raw.updated_at ?? ''),
        deleted_at: raw.deleted_at ? String(raw.deleted_at) : null,
    };
}

// ============================================================================
// Fetch a single team member by ID (full row)
// ============================================================================

export async function getTeamMemberById(memberId: string): Promise<MemberWithWorkload> {
    // Fetch member
    let raw: Record<string, unknown>;
    try {
        raw = await api.get<Record<string, unknown>>(`/team-members/${memberId}`);
    } catch (err) {
        throw new Error(`Failed to fetch team member: ${(err as Error).message}`);
    }

    const member: TeamMemberRow = {
        id: String(raw.id ?? ''),
        profile_id: raw.profile_id ? String(raw.profile_id) : null,
        full_name: String(raw.full_name ?? ''),
        email: String(raw.email ?? ''),
        avatar_url: raw.avatar_url ? String(raw.avatar_url) : null,
        role: asRole(raw.role as string),
        department: asDept(raw.department as string),
        seniority: asSeniority(raw.seniority as string),
        skills: Array.isArray(raw.skills) ? (raw.skills as string[]) : [],
        hourly_rate: Number(raw.hourly_rate ?? 0),
        availability: Number(raw.availability ?? 40),
        status: asStatus(raw.status as string),
        joined_at: String(raw.joined_at ?? ''),
        created_at: String(raw.created_at ?? ''),
        updated_at: String(raw.updated_at ?? ''),
        deleted_at: raw.deleted_at ? String(raw.deleted_at) : null,
    };

    // Fetch allocations for this member with project info
    const allocData = await api.get<Record<string, unknown>[]>(
        `/allocations?teamMemberId=${memberId}`
    ).catch(() => [] as Record<string, unknown>[]);

    // Fetch projects for joining
    const projectsData = await api.get<Record<string, unknown>[]>('/projects').catch(
        () => [] as Record<string, unknown>[]
    );

    const projectMap = new Map(
        (projectsData ?? []).map((p: Record<string, unknown>) => [
            String(p.id),
            { id: String(p.id), name: String(p.name ?? ''), status: String(p.status ?? 'active') },
        ]),
    );

    const allocations: AllocationWithProject[] = (allocData ?? []).map((r: Record<string, unknown>) => {
        const pid = String(r.project_id ?? '');
        return {
            id: String(r.id ?? ''),
            team_member_id: String(r.team_member_id ?? ''),
            project_id: pid,
            role_on_project: asProjectRole(r.role_on_project as string),
            allocation_pct: Number(r.allocation_pct ?? 0),
            hours_estimated: Number(r.hours_estimated ?? 0),
            hours_logged: Number(r.hours_logged ?? 0),
            start_date: r.start_date ? String(r.start_date) : null,
            end_date: r.end_date ? String(r.end_date) : null,
            status: asAllocStatus(r.status as string),
            notes: r.notes ? String(r.notes) : null,
            created_at: String(r.created_at ?? ''),
            updated_at: String(r.updated_at ?? ''),
            project: projectMap.get(pid) ?? null,
        };
    });

    const activeAllocs = allocations.filter(a => a.status === 'active');
    return {
        ...member,
        allocations,
        total_allocation_pct: activeAllocs.reduce((s, a) => s + a.allocation_pct, 0),
        active_projects: activeAllocs.length,
        totalEstimated: activeAllocs.reduce((s, a) => s + a.hours_estimated, 0),
        totalLogged: activeAllocs.reduce((s, a) => s + a.hours_logged, 0),
    };
}

// ============================================================================
// Update a team member
// ============================================================================

export async function updateTeamMember(
    memberId: string,
    updates: Partial<Pick<TeamMemberRow, 'full_name' | 'email' | 'role' | 'department' | 'seniority' | 'skills' | 'hourly_rate' | 'availability' | 'status' | 'avatar_url'>>,
): Promise<void> {
    try {
        await api.put(`/team-members/${memberId}`, updates);
    } catch (err) {
        throw new Error(`Failed to update team member: ${(err as Error).message}`);
    }
}

// ============================================================================
// Soft-delete a team member
// ============================================================================

export async function deleteTeamMember(memberId: string): Promise<void> {
    try {
        await api.delete(`/team-members/${memberId}`);
    } catch (err) {
        throw new Error(`Failed to delete team member: ${(err as Error).message}`);
    }
}

// ============================================================================
// Create a new allocation (assign developer to project)
// ============================================================================

export interface CreateAllocationPayload {
    team_member_id: string;
    project_id: string;
    role_on_project: ProjectRoleOnProject;
    allocation_pct: number;
    hours_estimated: number;
    start_date?: string | null;
    end_date?: string | null;
    notes?: string | null;
}

export async function createAllocation(payload: CreateAllocationPayload): Promise<DeveloperAllocationRow> {
    let r: Record<string, unknown>;
    try {
        r = await api.post<Record<string, unknown>>('/allocations', {
            team_member_id: payload.team_member_id,
            project_id: payload.project_id,
            role_on_project: payload.role_on_project,
            allocation_pct: payload.allocation_pct,
            hours_estimated: payload.hours_estimated,
            start_date: payload.start_date ?? null,
            end_date: payload.end_date ?? null,
            notes: payload.notes ?? null,
        });
    } catch (err) {
        throw new Error(`Failed to create allocation: ${(err as Error).message}`);
    }
    return {
        id: String(r.id ?? ''),
        team_member_id: String(r.team_member_id ?? ''),
        project_id: String(r.project_id ?? ''),
        role_on_project: asProjectRole(r.role_on_project as string),
        allocation_pct: Number(r.allocation_pct ?? 0),
        hours_estimated: Number(r.hours_estimated ?? 0),
        hours_logged: Number(r.hours_logged ?? 0),
        start_date: r.start_date ? String(r.start_date) : null,
        end_date: r.end_date ? String(r.end_date) : null,
        status: asAllocStatus(r.status as string),
        notes: r.notes ? String(r.notes) : null,
        created_at: String(r.created_at ?? ''),
        updated_at: String(r.updated_at ?? ''),
    };
}

// ============================================================================
// Update an existing allocation
// ============================================================================

export async function updateAllocation(
    allocationId: string,
    updates: Partial<Pick<DeveloperAllocationRow, 'role_on_project' | 'allocation_pct' | 'hours_estimated' | 'hours_logged' | 'start_date' | 'end_date' | 'status' | 'notes'>>,
): Promise<void> {
    try {
        await api.put(`/allocations/${allocationId}`, updates);
    } catch (err) {
        throw new Error(`Failed to update allocation: ${(err as Error).message}`);
    }
}

// ============================================================================
// Remove developer from project (set allocation status to 'removed')
// ============================================================================

export async function removeAllocation(allocationId: string): Promise<void> {
    try {
        await api.put(`/allocations/${allocationId}/remove`, {});
    } catch (err) {
        throw new Error(`Failed to remove allocation: ${(err as Error).message}`);
    }
}

// ============================================================================
// Fetch all available projects (not deleted, for assignment dropdowns)
// ============================================================================

export async function getAvailableProjects(): Promise<ProjectRef[]> {
    let data: Record<string, unknown>[];
    try {
        data = await api.get<Record<string, unknown>[]>('/projects');
    } catch (err) {
        throw new Error(`Failed to fetch projects: ${(err as Error).message}`);
    }

    // The API doesn't support an `.in()`-style status filter server-side,
    // so filtering happens here — same end result as before.
    const assignableStatuses = new Set(['planning', 'active', 'review']);

    return (data ?? [])
        .filter((p: Record<string, unknown>) => assignableStatuses.has(String(p.status ?? '')))
        .map((p: Record<string, unknown>) => ({
            id: String(p.id ?? ''),
            name: String(p.name ?? ''),
            status: String(p.status ?? 'active'),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// Fetch project team (members assigned + available members)
// ============================================================================

export interface ProjectTeamMember {
    allocation_id: string;
    team_member_id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: TeamMemberRole;
    seniority: Seniority;
    department: TeamDepartment;
    skills: string[];
    hourly_rate: number;
    member_status: TeamMemberStatus;
    role_on_project: ProjectRoleOnProject;
    allocation_pct: number;
    hours_estimated: number;
    hours_logged: number;
    start_date: string | null;
    end_date: string | null;
    alloc_status: AllocationStatus;
    notes: string | null;
}

export interface AvailableMember {
    team_member_id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: TeamMemberRole;
    seniority: Seniority;
    department: TeamDepartment;
    skills: string[];
    hourly_rate: number;
    member_status: TeamMemberStatus;
    total_allocation_pct: number;
    active_projects: number;
}

export async function fetchProjectTeam(projectId: string): Promise<{
    team: ProjectTeamMember[];
    available: AvailableMember[];
}> {
    // Fetch team members assigned to this project
    let allocData: Record<string, unknown>[];
    try {
        allocData = await api.get<Record<string, unknown>[]>(
            `/allocations?projectId=${projectId}&status=active`
        );
    } catch (err) {
        throw new Error(`Failed to fetch project allocations: ${(err as Error).message}`);
    }

    const memberIds = (allocData ?? []).map((a: Record<string, unknown>) => String(a.team_member_id));

    // Fetch all team members
    let allMembers: Record<string, unknown>[];
    try {
        allMembers = await api.get<Record<string, unknown>[]>('/team-members');
    } catch (err) {
        throw new Error(`Failed to fetch team members: ${(err as Error).message}`);
    }

    // Fetch all allocations for workload computation
    const allAllocData = await api
        .get<Record<string, unknown>[]>('/allocations?status=active')
        .catch(() => [] as Record<string, unknown>[]);

    const memberMap = new Map(
        (allMembers ?? []).map((m: Record<string, unknown>) => [String(m.id), m]),
    );

    // Compute total allocation per member
    const allocByMember = new Map<string, number>();
    const projectsByMember = new Map<string, number>();
    for (const a of (allAllocData ?? []) as Record<string, unknown>[]) {
        const mid = String(a.team_member_id);
        allocByMember.set(mid, (allocByMember.get(mid) ?? 0) + Number(a.allocation_pct ?? 0));
        projectsByMember.set(mid, (projectsByMember.get(mid) ?? 0) + 1);
    }

    const team: ProjectTeamMember[] = (allocData ?? []).map((a: Record<string, unknown>) => {
        const mid = String(a.team_member_id);
        const m = memberMap.get(mid) as Record<string, unknown> | undefined;
        return {
            allocation_id: String(a.id ?? ''),
            team_member_id: mid,
            full_name: String(m?.full_name ?? ''),
            email: String(m?.email ?? ''),
            avatar_url: m?.avatar_url ? String(m.avatar_url) : null,
            role: asRole(m?.role as string),
            seniority: asSeniority(m?.seniority as string),
            department: asDept(m?.department as string),
            skills: Array.isArray(m?.skills) ? (m.skills as string[]) : [],
            hourly_rate: Number(m?.hourly_rate ?? 0),
            member_status: asStatus(m?.status as string),
            role_on_project: asProjectRole(a.role_on_project as string),
            allocation_pct: Number(a.allocation_pct ?? 0),
            hours_estimated: Number(a.hours_estimated ?? 0),
            hours_logged: Number(a.hours_logged ?? 0),
            start_date: a.start_date ? String(a.start_date) : null,
            end_date: a.end_date ? String(a.end_date) : null,
            alloc_status: asAllocStatus(a.status as string),
            notes: a.notes ? String(a.notes) : null,
        };
    });

    const assignedIds = new Set(memberIds);
    const available: AvailableMember[] = (allMembers ?? [])
        .filter((m: Record<string, unknown>) => {
            const mid = String(m.id);
            return !assignedIds.has(mid) && String(m.status) === 'active';
        })
        .map((m: Record<string, unknown>) => {
            const mid = String(m.id);
            return {
                team_member_id: mid,
                full_name: String(m.full_name ?? ''),
                email: String(m.email ?? ''),
                avatar_url: m.avatar_url ? String(m.avatar_url) : null,
                role: asRole(m.role as string),
                seniority: asSeniority(m.seniority as string),
                department: asDept(m.department as string),
                skills: Array.isArray(m.skills) ? (m.skills as string[]) : [],
                hourly_rate: Number(m.hourly_rate ?? 0),
                member_status: asStatus(m.status as string),
                total_allocation_pct: allocByMember.get(mid) ?? 0,
                active_projects: projectsByMember.get(mid) ?? 0,
            };
        });

    return { team, available };
}
