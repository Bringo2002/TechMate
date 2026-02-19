// ============================================================================
// TechMate useProjects Hook
// Project data fetching for both admin and user views
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { ProjectRow } from '../types/database.types';
import type { ProjectFilters, QueryOptions } from '../types/api.types';
import * as projectService from '../services/projectService';

interface UseProjectsOptions {
    userId?: string;
    autoFetch?: boolean;
    filters?: ProjectFilters;
    page?: number;
    pageSize?: number;
}

interface UseProjectsReturn {
    projects: ProjectRow[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    stats: {
        total: number;
        active: number;
        completed: number;
        planning: number;
        totalBudget: number;
        totalSpent: number;
        avgHealth: number;
    };
    refresh: () => Promise<void>;
    setPage: (page: number) => void;
    setFilters: (filters: ProjectFilters) => void;
    createProject: typeof projectService.createProject;
    updateProject: typeof projectService.updateProject;
    deleteProject: typeof projectService.deleteProject;
}

export function useProjects(options?: UseProjectsOptions): UseProjectsReturn {
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(options?.page ?? 1);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState<ProjectFilters>(options?.filters ?? {});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0, active: 0, completed: 0, planning: 0, totalBudget: 0, totalSpent: 0, avgHealth: 0,
    });

    const pageSize = options?.pageSize ?? 20;

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (options?.userId) {
                // User-specific (simple list)
                const { data, error: err } = await projectService.getUserProjects(options.userId);
                if (err) throw new Error(err.message);
                setProjects(data ?? []);
                setTotal(data?.length ?? 0);
            } else {
                // Admin (paginated)
                const queryOptions: QueryOptions<ProjectFilters> = {
                    pagination: { page: currentPage, pageSize },
                    sort: { sortBy: 'updated_at', sortDirection: 'desc' },
                    filters: { ...filters, ...(options?.filters ?? {}) },
                };
                const { data, error: err } = await projectService.getProjects(queryOptions);
                if (err) throw new Error(err.message);
                if (data) {
                    setProjects(data.data);
                    setTotal(data.total);
                    setTotalPages(data.totalPages);
                }
            }

            // Fetch stats
            const s = await projectService.getProjectStats(options?.userId);
            setStats(s);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options?.userId, currentPage, pageSize, filters]);

    useEffect(() => {
        if (options?.autoFetch !== false) {
            fetchProjects();
        }
    }, [fetchProjects, options?.autoFetch]);

    return {
        projects,
        total,
        page: currentPage,
        totalPages,
        loading,
        error,
        stats,
        refresh: fetchProjects,
        setPage: setCurrentPage,
        setFilters,
        createProject: projectService.createProject,
        updateProject: projectService.updateProject,
        deleteProject: projectService.deleteProject,
    };
}

export default useProjects;
