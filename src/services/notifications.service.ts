// ============================================================================
// TechMate Notifications Service
// CRUD for notifications — now backed by the NestJS API instead of Supabase.
// ============================================================================

import type { NotificationRow, NotificationInsert } from '../types/database.types';
import type { ServiceResponse, NotificationFilters } from '../types/api.types';
import api from '../lib/apiClient';

// ============================================================================
// Read
// ============================================================================

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
        const result = await api.get<{ count: number }>('/notifications/unread-count');
        return result?.count ?? 0;
    } catch {
        return 0;
    }
}

// ============================================================================
// Write
// ============================================================================

/** Now actually wired — was a no-op stub before. */
export async function createNotification(
    notification: NotificationInsert
): Promise<ServiceResponse<NotificationRow>> {
    try {
        const data = await api.post<NotificationRow>('/notifications', {
            userId: notification.user_id,
            title: notification.title,
            message: notification.message ?? undefined,
            type: notification.type ?? undefined,
            category: notification.category ?? undefined,
            link: notification.link ?? undefined,
        });
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function markAsRead(notificationId: string): Promise<void> {
    try {
        await api.patch(`/notifications/${notificationId}/read`);
    } catch (err) {
        console.error('Failed to mark notification read', err);
    }
}

/** Now actually wired — was a no-op stub before. */
export async function markAllAsRead(_userId: string): Promise<void> {
    try {
        await api.patch('/notifications/read-all');
    } catch (err) {
        console.error('Failed to mark all notifications read', err);
    }
}

/** Now actually wired — was a no-op stub before. */
export async function deleteNotification(notificationId: string): Promise<void> {
    try {
        await api.delete(`/notifications/${notificationId}`);
    } catch (err) {
        console.error('Failed to delete notification', err);
    }
}

export async function clearAllNotifications(_userId: string): Promise<void> {
    try {
        await api.delete('/notifications');
    } catch (err) {
        console.error('Failed to clear notifications', err);
    }
}

// ============================================================================
// Real-time Subscription
// ============================================================================

/**
 * NOTE: Supabase realtime is gone, and this backend has no websocket/SSE
 * layer yet. No-op stub — same treatment as messages.service.ts and
 * inquiries.service.ts.
 */
export function subscribeToNotifications(
    _userId: string,
    _onNotification: (notification: NotificationRow) => void
): () => void {
    console.warn(
        '[notifications.service] subscribeToNotifications: realtime is not implemented in the new backend yet — this is a no-op.'
    );
    return () => {};
}
