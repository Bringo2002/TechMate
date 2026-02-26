// ============================================================================
// TechMate useServices Hook
// Services page data with loading/error states
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { getServicesData, type ServiceData } from '../services/dashboardService';

interface UseServicesReturn {
    services: ServiceData[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useServices(): UseServicesReturn {
    const [services, setServices] = useState<ServiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getServicesData();
            if (result.error) {
                setError(result.error);
            }
            setServices(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load services');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    return {
        services,
        loading,
        error,
        refresh: fetchServices,
    };
}

export default useServices;
