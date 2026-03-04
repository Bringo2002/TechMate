// ============================================================================
// TechMate useRevenue Hook
// Fetches real revenue dashboard data with loading, error, and refetch
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    fetchRevenueDashboard,
    type RevenueDashboardData,
    type BudgetSpentUpdate,
    updateProjectBudgetSpent,
    getProjectsForBudgetEdit,
    exportRevenueCSV,
} from '../services/revenue.service';

type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

interface ProjectForEdit {
    id: string;
    name: string;
    client: string;
    budget: number;
    spent: number;
    paymentStatus: string;
    status: string;
    type: string;
}

interface UseRevenueReturn {
    data: RevenueDashboardData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    // Budget edit
    editableProjects: ProjectForEdit[];
    loadingProjects: boolean;
    fetchProjects: () => Promise<void>;
    saveBudgetSpent: (update: BudgetSpentUpdate) => Promise<{ success: boolean; error?: string }>;
    // Export
    handleExport: () => void;
}

export function useRevenue(timeRange: TimeRange): UseRevenueReturn {
    const [data, setData] = useState<RevenueDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editableProjects, setEditableProjects] = useState<ProjectForEdit[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const abortRef = useRef(false);

    const fetchData = useCallback(async () => {
        abortRef.current = false;
        setLoading(true);
        setError(null);
        try {
            const result = await fetchRevenueDashboard(timeRange);
            if (abortRef.current) return;

            if (result.error) {
                setError(result.error.message);
                setData(null);
            } else {
                setData(result.data);
            }
        } catch (err) {
            if (!abortRef.current) {
                console.error('[useRevenue] Error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load revenue data');
            }
        } finally {
            if (!abortRef.current) setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchData();
        return () => { abortRef.current = true; };
    }, [fetchData]);

    const fetchProjects = useCallback(async () => {
        setLoadingProjects(true);
        try {
            const result = await getProjectsForBudgetEdit();
            setEditableProjects(result.data ?? []);
        } catch {
            console.error('[useRevenue] Failed to fetch projects for edit');
        } finally {
            setLoadingProjects(false);
        }
    }, []);

    const saveBudgetSpent = useCallback(async (update: BudgetSpentUpdate) => {
        try {
            const result = await updateProjectBudgetSpent(update);
            if (result.error) {
                return { success: false, error: result.error.message };
            }
            // Update local project list
            setEditableProjects(prev =>
                prev.map(p =>
                    p.id === update.projectId
                        ? {
                            ...p,
                            budget: update.budget ?? p.budget,
                            spent: update.spent ?? p.spent,
                            paymentStatus: update.paymentStatus ?? p.paymentStatus,
                        }
                        : p
                )
            );
            // Trigger data refetch for metrics
            fetchData();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
        }
    }, [fetchData]);

    const handleExport = useCallback(() => {
        if (!data) return;
        const csv = exportRevenueCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `techmate-revenue-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [data, timeRange]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        editableProjects,
        loadingProjects,
        fetchProjects,
        saveBudgetSpent,
        handleExport,
    };
}

export default useRevenue;
