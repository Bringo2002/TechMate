// ============================================================================
// TechMate useTeams Hook
// Fetches real team & allocation data from Supabase via teams.service
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { fetchTeamsData, type TeamsData } from '../services/teams.service';

interface UseTeamsReturn {
    data: TeamsData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useTeams(): UseTeamsReturn {
    const [data, setData] = useState<TeamsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchTeamsData();
            setData(result);
        } catch (err) {
            console.error('[useTeams] Failed to fetch teams data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load teams data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

export default useTeams;
