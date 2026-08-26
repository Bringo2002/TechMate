// ============================================================================
// TechMate Notifications Service
// CRUD and real-time subscriptions for notifications
// ============================================================================

import supabase from '../lib/supabaseClient';
import type { NotificationRow, NotificationInsert } from '../types/database.types';
import type { ServiceResponse, NotificationFilters } from '../types/api.types';

// ============================================================================
// Read
// ============================================================================
import api from '../lib/apiClient';

export async function getNotifications(
    _userId: string,
    _filters?: NotificationFilters,
    _limit: number = 50
): Promise<ServiceResponse<NotificationRow[]>> {
    try {
        const data = await api.get<NotificationRow[]>('/notifications');
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getUnreadCount(_userId: string): Promise<number> {
    try {
        const data = await api.get<NotificationRow[]>('/notifications');
        return (Array.isArray(data) ? data : []).filter(n => !n.is_read).length;
    } catch {
        return 0;
    }
}

// ============================================================================
// Write
// ============================================================================
export async function createNotification(
    _notification: NotificationInsert
): Promise<ServiceResponse<NotificationRow>> {
    return { data: null, error: null };
}

export async function markAsRead(notificationId: string): Promise<void> {
    try {
        await api.patch(`/notifications/${notificationId}/read`);
    } catch (err) {
        console.error('Failed to mark notification read', err);
    }
}

export async function markAllAsRead(_userId: string): Promise<void> {
    // API batch update
}

export async function deleteNotification(_notificationId: string): Promise<void> {
    // API delete
}

export async function clearAllNotifications(userId: string): Promise<void> {
    await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);
}

// ============================================================================
// Real-time Subscription
// ============================================================================
export function subscribeToNotifications(
    userId: string,
    onNotification: (notification: NotificationRow) => void
) {
    const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                onNotification(payload.new as NotificationRow);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
