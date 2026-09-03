// ============================================================================
// TechMate Projects Service (Enhanced)
// Full CRUD with pagination, filtering, and stats
// ============================================================================

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
    const res = await api.get<ProjectRow[]>('/projects');
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

export async function getUserProjects(userId: string): Promise<ServiceResponse<ProjectRow[]>> {
  try {
    const data = await api.get<ProjectRow[]>(`/projects?userId=${userId}`);
    return { data: Array.isArray(data) ? data : [], error: null };
  } catch (err: unknown) {
    return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
  }
}

export async function getProjectById(projectId: string): Promise<ServiceResponse<ProjectRow>> {
  try {
    const data = await api.get<ProjectRow>(`/projects/${projectId}`);
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
    const data = await api.post<ProjectRow>('/projects', project);
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
    const data = await api.put<ProjectRow>(`/projects/${projectId}`, updates);
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
    await api.delete(`/projects/${projectId}`);
    return { data: null, error: null };
  } catch (err: unknown) {
    return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
  }
}

// ============================================================================
// Stats
// ============================================================================
export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
  totalBudget: number;
  totalSpent: number;
  avgHealth: number;
}

export async function getProjectStats(userId?: string): Promise<ProjectStats> {
  const query = userId ? `/projects/stats?userId=${userId}` : '/projects/stats';
  return api.get<ProjectStats>(query);
}

// Backward compatibility
export default { getUserProjects: (userId: string) => getUserProjects(userId).then(r => r.data ?? []) };
