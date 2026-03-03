// ============================================================================
// TechMate useClients Hook
// Fetches aggregated client data for the Client Relationship Hub
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { getClientsWithStats, type ClientStats } from '../services/admin.service';

interface UseClientsReturn {
    clients: ClientStats[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useClients(): UseClientsReturn {
    const [clients, setClients] = useState<ClientStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getClientsWithStats();
            if (result.error) {
                setError(result.error.message);
            }
            setClients(result.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load clients');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    return {
        clients,
        loading,
        error,
        refresh: fetchClients,
    };
}

export default useClients;
