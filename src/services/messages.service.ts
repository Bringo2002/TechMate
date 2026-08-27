// ============================================================================
// TechMate Messages Service
// Messaging — now backed by the NestJS API instead of Supabase.
// ============================================================================

import type { MessageRow, MessageInsert, Json } from '../types/database.types';
import type { ServiceResponse } from '../types/api.types';
import api from '../lib/apiClient';

export interface ConversationSummary {
    contactId: string;
    contactName: string;
    contactAvatar: string | null;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isOnline: boolean;
}

// ============================================================================
// Conversations (aggregated contacts)
// ============================================================================

/**
 * The backend's /messages/inbox now returns exactly the ConversationSummary
 * shape (contactId/contactName/contactAvatar/lastMessage/lastMessageTime/
 * unreadCount) computed server-side — no more guessing at fields
 * (otherUser, item.unreadCount) that the old wrong-schema backend never
 * actually returned. isOnline isn't tracked anywhere in the schema, so it
 * defaults to false here, same as before.
 */
export async function getConversations(_userId: string): Promise<ServiceResponse<ConversationSummary[]>> {
    try {
        const inbox = await api.get<Omit<ConversationSummary, 'isOnline'>[]>('/messages/inbox');
        const conversations: ConversationSummary[] = (Array.isArray(inbox) ? inbox : []).map(item => ({
            ...item,
            isOnline: false,
        }));
        return { data: conversations, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getMessages(
    _userId: string,
    contactId: string,
    _limit: number = 50
): Promise<ServiceResponse<MessageRow[]>> {
    try {
        const data = await api.get<MessageRow[]>(`/messages/conversation/${contactId}`);
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function sendMessage(message: MessageInsert): Promise<ServiceResponse<MessageRow>> {
    try {
        const data = await api.post<MessageRow>('/messages/send', {
            recipientId: message.recipient_id,
            content: message.content,
            subject: message.subject ?? undefined,
            attachments: message.attachments ?? undefined,
        });
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

/** Now actually wired — the backend marks every unread message from this contact as read. */
export async function markMessagesAsRead(_userId: string, contactId: string): Promise<void> {
    try {
        await api.patch(`/messages/conversation/${contactId}/read`);
    } catch (err) {
        console.error('Failed to mark conversation read', err);
    }
}

export async function deleteMessage(messageId: string): Promise<void> {
    try {
        await api.delete(`/messages/${messageId}`);
    } catch (err) {
        console.error('Failed to delete message', err);
    }
}

export async function getUnreadMessageCount(_userId: string): Promise<number> {
    try {
        const result = await api.get<{ count: number }>('/messages/unread-count');
        return result?.count ?? 0;
    } catch {
        return 0;
    }
}

// ============================================================================
// Start a new conversation (convenience wrapper for New Conversation flows)
// ============================================================================
export async function startConversation(
    senderId: string,
    recipientId: string,
    content: string,
    attachments: Json = []
): Promise<ServiceResponse<MessageRow>> {
    return sendMessage({
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        is_read: false,
        attachments,
    });
}

// ============================================================================
// Real-time
// ============================================================================

/**
 * NOTE: Supabase realtime is gone, and this backend has no websocket/SSE
 * layer yet. No-op stub rather than something that silently pretends to
 * still work — same treatment as inquiries.service.ts's subscriptions.
 * Any UI relying on live message delivery needs a manual refresh or
 * polling until a real realtime layer gets built.
 */
export function subscribeToMessages(
    _userId: string,
    _onMessage: (message: MessageRow) => void
): () => void {
    console.warn(
        '[messages.service] subscribeToMessages: realtime is not implemented in the new backend yet — this is a no-op.'
    );
    return () => {};
}
