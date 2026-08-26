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
import api from '../lib/apiClient';

export async function getProjects(
  _options?: QueryOptions<ProjectFilters>
): Promise<ServiceResponse<PaginatedResponse<ProjectRow>>> {
  try {
    const res = await api.get<ProjectRow[]>('/services?all=true');
    const data = Array.isArray(res) ? res : [];
    return {
      data: {
        data,
        total: data.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
        hasMore: false,
      },
      error: null,
    };
  } catch (err: unknown) {
    return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
  }
}

export async function getUserProjects(_userId: string): Promise<ServiceResponse<ProjectRow[]>> {
  try {
    const data = await api.get<ProjectRow[]>('/services');
    return { data: Array.isArray(data) ? data : [], error: null };
  } catch (err: unknown) {
    return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
  }
}

export async function getProjectById(projectId: string): Promise<ServiceResponse<ProjectRow>> {
  try {
    const data = await api.get<ProjectRow>(`/services/${projectId}`);
    return { data, error: null };
  } catch (err: unknown) {
    return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
  }
}

// ============================================================================
// Write
// ============================================================================
export async function createProject(project: ProjectInsert): Promise<ServiceResponse<ProjectRow>> {
  try {
    const data = await api.post<ProjectRow>('/services', project);
    return { data, error: null };
  } catch (err: unknown) {
    return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
  }
}

export async function updateProject(
  projectId: string,
  updates: ProjectUpdate
): Promise<ServiceResponse<ProjectRow>> {
  try {
    const data = await api.put<ProjectRow>(`/services/${projectId}`, updates);
    return { data, error: null };
  } catch (err: unknown) {
    return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
  }
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectRow['status']
): Promise<ServiceResponse<ProjectRow>> {
  return updateProject(projectId, { status });
}

export async function deleteProject(projectId: string): Promise<ServiceResponse<null>> {
  try {
    await api.delete(`/services/${projectId}`);
    return { data: null, error: null };
  } catch (err: unknown) {
    return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
  }
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
