// ============================================================================
// TechMate Projects Service (Enhanced)
// Full CRUD with pagination, filtering, and stats
// ============================================================================

import supabase from '../lib/supabaseClient';
import type { ProjectRow, ProjectInsert, ProjectUpdate } from '../types/database.types';
import type {
  PaginatedResponse,
  QueryOptions,
  ProjectFilters,
  ServiceResponse,
} from '../types/api.types';

// ============================================================================
// Read
// ============================================================================
export async function getProjects(
  options?: QueryOptions<ProjectFilters>
): Promise<ServiceResponse<PaginatedResponse<ProjectRow>>> {
  const page = options?.pagination?.page ?? 1;
  const pageSize = options?.pagination?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .is('deleted_at', null);

  const f = options?.filters;
  if (f?.status) query = query.eq('status', f.status);
  if (f?.priority) query = query.eq('priority', f.priority);
  if (f?.type) query = query.eq('type', f.type);
  if (f?.userId) query = query.eq('user_id', f.userId);
  if (f?.search) {
    query = query.or(`name.ilike.%${f.search}%,client.ilike.%${f.search}%,description.ilike.%${f.search}%`);
  }
  if (f?.dateRange?.from) query = query.gte('created_at', f.dateRange.from);
  if (f?.dateRange?.to) query = query.lte('created_at', f.dateRange.to);

  const sortBy = options?.sort?.sortBy ?? 'updated_at';
  query = query.order(sortBy, { ascending: options?.sort?.sortDirection === 'asc' });
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }

  const total = count ?? 0;
  return {
    data: {
      data: data ?? [],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: offset + pageSize < total,
    },
    error: null,
  };
}

export async function getUserProjects(userId: string): Promise<ServiceResponse<ProjectRow[]>> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data: data ?? [], error: null };
}

export async function getProjectById(projectId: string): Promise<ServiceResponse<ProjectRow>> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .is('deleted_at', null)
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

// ============================================================================
// Write
// ============================================================================
export async function createProject(project: ProjectInsert): Promise<ServiceResponse<ProjectRow>> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

export async function updateProject(
  projectId: string,
  updates: ProjectUpdate
): Promise<ServiceResponse<ProjectRow>> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data, error: null };
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectRow['status']
): Promise<ServiceResponse<ProjectRow>> {
  const updates: ProjectUpdate = { status };
  if (status === 'active' && !updates.started_at) {
    updates.started_at = new Date().toISOString();
  }
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
    updates.progress = 100;
  }
  return updateProject(projectId, updates);
}

export async function deleteProject(projectId: string): Promise<ServiceResponse<null>> {
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) {
    return { data: null, error: { code: error.code, message: error.message } };
  }
  return { data: null, error: null };
}

// ============================================================================
// Stats
// ============================================================================
export async function getProjectStats(userId?: string) {
  let query = supabase.from('projects').select('status, budget, spent, health_score').is('deleted_at', null);
  if (userId) query = query.eq('user_id', userId);

  const { data } = await query;
  const projects = data ?? [];

  return {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    totalBudget: projects.reduce((s, p) => s + (p.budget ?? 0), 0),
    totalSpent: projects.reduce((s, p) => s + (p.spent ?? 0), 0),
    avgHealth: projects.length > 0
      ? Math.round(projects.reduce((s, p) => s + (p.health_score ?? 0), 0) / projects.length)
      : 0,
  };
}

// Backward compatibility
export default { getUserProjects: (userId: string) => getUserProjects(userId).then(r => r.data ?? []) };
