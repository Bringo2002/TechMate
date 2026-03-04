// ============================================================================
// TechMate useAnalytics Hook
// Fetches real analytics data from Supabase via analytics.service
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { fetchAnalyticsData, type AnalyticsData } from '../services/analytics.service';

interface UseAnalyticsReturn {
    data: AnalyticsData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useAnalytics(timeRange: '7d' | '30d' | '90d' | '1y'): UseAnalyticsReturn {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchAnalyticsData(timeRange);
            setData(result);
        } catch (err) {
            console.error('[useAnalytics] Failed to fetch analytics data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

export default useAnalytics;
