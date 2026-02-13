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
export async function getNotifications(
    userId: string,
    filters?: NotificationFilters,
    limit: number = 50
): Promise<ServiceResponse<NotificationRow[]>> {
    let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

    if (filters?.type) query = query.eq('type', filters.type);
    if (typeof filters?.isRead === 'boolean') query = query.eq('is_read', filters.isRead);
    if (filters?.category) query = query.eq('category', filters.category);

    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

export async function getUnreadCount(userId: string): Promise<number> {
    const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    return count ?? 0;
}

// ============================================================================
// Write
// ============================================================================
export async function createNotification(
    notification: NotificationInsert
): Promise<ServiceResponse<NotificationRow>> {
    const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

export async function markAsRead(notificationId: string): Promise<void> {
    await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
}

export async function markAllAsRead(userId: string): Promise<void> {
    await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);
}

export async function deleteNotification(notificationId: string): Promise<void> {
    await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
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
