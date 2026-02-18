// ============================================================================
// useInquiries Hook
// React hooks for managing inquiry data with real-time updates
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { 
  getInquiries, 
  getInquiryById, 
  getInquiryStats,
  subscribeToInquiries,
  subscribeToInquiry,
} from '../services/inquiries.service';
import type { ClientInquiryRow, InquiryStatus } from '../types/database.types';

// ============================================================================
// Types
// ============================================================================

interface InquiryFilters {
  status?: InquiryStatus;
  assigned_to?: string;
  priority?: string;
  project_type?: string;
}

interface UseInquiriesOptions {
  filters?: InquiryFilters;
  realtime?: boolean; // Enable real-time updates
  autoFetch?: boolean; // Auto-fetch on mount (default: true)
}

interface UseInquiriesReturn {
  inquiries: ClientInquiryRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseInquiryReturn {
  inquiry: ClientInquiryRow | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseInquiryStatsReturn {
  stats: any;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ============================================================================
// Hook: useInquiries (Multiple inquiries with filters)
// ============================================================================

/**
 * Hook to fetch and manage multiple inquiries
 * 
 * @example
 * ```tsx
 * const { inquiries, loading, error, refresh } = useInquiries({
 *   filters: { status: 'new' },
 *   realtime: true
 * });
 * ```
 */
export function useInquiries(options?: UseInquiriesOptions): UseInquiriesReturn {
  const [inquiries, setInquiries] = useState<ClientInquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    filters,
    realtime = false,
    autoFetch = true,
  } = options || {};

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await getInquiries(filters);

    if (err) {
      setError(err.message || 'Failed to load inquiries');
      setInquiries([]);
    } else {
      setInquiries(data || []);
    }

    setLoading(false);
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      loadInquiries();
    }
  }, [loadInquiries, autoFetch]);

  // Real-time subscription
  useEffect(() => {
    if (!realtime) return;

    const unsubscribe = subscribeToInquiries((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      setInquiries((current) => {
        switch (eventType) {
          case 'INSERT':
            // Add new inquiry to the beginning
            return [newRecord as ClientInquiryRow, ...current];

          case 'UPDATE':
            // Update existing inquiry
            return current.map((inquiry) =>
              inquiry.id === newRecord.id ? (newRecord as ClientInquiryRow) : inquiry
            );

          case 'DELETE':
            // Remove deleted inquiry
            return current.filter((inquiry) => inquiry.id !== oldRecord.id);

          default:
            return current;
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [realtime]);

  const refresh = useCallback(async () => {
    await loadInquiries();
  }, [loadInquiries]);

  return { inquiries, loading, error, refresh };
}

// ============================================================================
// Hook: useInquiry (Single inquiry)
// ============================================================================

/**
 * Hook to fetch and manage a single inquiry
 * 
 * @example
 * ```tsx
 * const { inquiry, loading, error, refresh } = useInquiry(inquiryId);
 * ```
 */
export function useInquiry(
  inquiryId: string | undefined,
  options?: { realtime?: boolean }
): UseInquiryReturn {
  const [inquiry, setInquiry] = useState<ClientInquiryRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { realtime = false } = options || {};

  const loadInquiry = useCallback(async () => {
    if (!inquiryId) {
      setLoading(false);
      setError('No inquiry ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: err } = await getInquiryById(inquiryId);

    if (err) {
      setError(err.message || 'Failed to load inquiry');
      setInquiry(null);
    } else {
      setInquiry(data);
    }

    setLoading(false);
  }, [inquiryId]);

  // Initial fetch
  useEffect(() => {
    if (inquiryId) {
      loadInquiry();
    }
  }, [loadInquiry, inquiryId]);

  // Real-time subscription for single inquiry
  useEffect(() => {
    if (!realtime || !inquiryId) return;

    const unsubscribe = subscribeToInquiry(inquiryId, (payload) => {
      const { eventType, new: newRecord } = payload;

      if (eventType === 'UPDATE') {
        setInquiry(newRecord as ClientInquiryRow);
      } else if (eventType === 'DELETE') {
        setInquiry(null);
        setError('This inquiry has been deleted');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [realtime, inquiryId]);

  const refresh = useCallback(async () => {
    await loadInquiry();
  }, [loadInquiry]);

  return { inquiry, loading, error, refresh };
}

// ============================================================================
// Hook: useInquiryStats (Statistics)
// ============================================================================

/**
 * Hook to fetch inquiry statistics
 * 
 * @example
 * ```tsx
 * // Admin view (all inquiries)
 * const { stats, loading } = useInquiryStats();
 * 
 * // Client view (their inquiries only)
 * const { stats, loading } = useInquiryStats(clientId);
 * ```
 */
export function useInquiryStats(userId?: string): UseInquiryStatsReturn {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await getInquiryStats(userId);

    if (err) {
      setError(err.message || 'Failed to load statistics');
      setStats(null);
    } else {
      setStats(data);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refresh = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh };
}

// ============================================================================
// Hook: useInquiriesCount (Quick count without full data)
// ============================================================================

/**
 * Hook to get just the count of inquiries matching filters
 * Lighter weight than useInquiries when you only need counts
 * 
 * @example
 * ```tsx
 * const { count, loading } = useInquiriesCount({ status: 'new' });
 * ```
 */
export function useInquiriesCount(filters?: InquiryFilters) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCount = async () => {
      setLoading(true);
      setError(null);

      const { data, error: err } = await getInquiries(filters);

      if (isMounted) {
        if (err) {
          setError(err.message || 'Failed to load count');
          setCount(0);
        } else {
          setCount(data?.length || 0);
        }
        setLoading(false);
      }
    };

    loadCount();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return { count, loading, error };
}