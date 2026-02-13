// ============================================================================
// TechMate useRealtime Hook
// Generic real-time subscription utility
// ============================================================================

import { useEffect, useRef } from 'react';
import supabase from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions<T> {
    table: string;
    event?: EventType;
    filter?: string;
    onInsert?: (record: T) => void;
    onUpdate?: (record: T) => void;
    onDelete?: (record: T) => void;
    onChange?: (event: EventType, record: T) => void;
    enabled?: boolean;
}

/**
 * Generic hook for subscribing to Supabase real-time changes on any table.
 *
 * @example
 * useRealtime<ProjectRow>({
 *   table: 'projects',
 *   filter: `user_id=eq.${userId}`,
 *   onInsert: (project) => setProjects(prev => [project, ...prev]),
 *   onUpdate: (project) => setProjects(prev => prev.map(p => p.id === project.id ? project : p)),
 *   onDelete: (project) => setProjects(prev => prev.filter(p => p.id !== project.id)),
 * });
 */
export function useRealtime<T extends Record<string, unknown>>(
    options: UseRealtimeOptions<T>
): void {
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (options.enabled === false) return;

        const channelName = `realtime:${options.table}:${options.filter ?? 'all'}`;

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: options.event ?? '*',
                    schema: 'public',
                    table: options.table,
                    ...(options.filter ? { filter: options.filter } : {}),
                },
                (payload) => {
                    const eventType = payload.eventType as EventType;
                    const record = (payload.new ?? payload.old) as T;

                    // Call specific handler
                    switch (eventType) {
                        case 'INSERT':
                            options.onInsert?.(record);
                            break;
                        case 'UPDATE':
                            options.onUpdate?.(record);
                            break;
                        case 'DELETE':
                            options.onDelete?.(payload.old as T);
                            break;
                    }

                    // Call generic handler
                    options.onChange?.(eventType, record);
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [options.table, options.filter, options.event, options.enabled]);
}

export default useRealtime;
