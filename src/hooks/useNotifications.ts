// ============================================================================
// TechMate useNotifications Hook
// Notifications with real-time subscriptions
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabaseClient';
import type { NotificationRow } from '../types/database.types';
import type { NotificationFilters } from '../types/api.types';
import * as notificationsService from '../services/notifications.service';

interface UseNotificationsReturn {
    notifications: NotificationRow[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
    refresh: () => Promise<void>;
    setFilters: (filters: NotificationFilters) => void;
}

export function useNotifications(filters?: NotificationFilters): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<NotificationRow[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentFilters, setCurrentFilters] = useState<NotificationFilters>(filters ?? {});

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const [notifRes, count] = await Promise.all([
                notificationsService.getNotifications(user.id, currentFilters),
                notificationsService.getUnreadCount(user.id),
            ]);

            if (notifRes.error) throw new Error(notifRes.error.message);

            setNotifications(notifRes.data ?? []);
            setUnreadCount(count);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [currentFilters]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Real-time subscription
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const setup = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            unsubscribe = notificationsService.subscribeToNotifications(
                user.id,
                (newNotification) => {
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            );
        };

        setup();
        return () => unsubscribe?.();
    }, []);

    const markAsRead = async (id: string) => {
        await notificationsService.markAsRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await notificationsService.markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
        setUnreadCount(0);
    };

    const deleteNotification = async (id: string) => {
        await notificationsService.deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await notificationsService.clearAllNotifications(user.id);
        setNotifications([]);
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refresh: fetchNotifications,
        setFilters: setCurrentFilters,
    };
}

export default useNotifications;
