// ============================================================================
// TechMate Messages Service
// Messaging with real-time subscriptions
// ============================================================================

import supabase from '../lib/supabaseClient';
import type { MessageRow, MessageInsert, Json } from '../types/database.types';
import type { ServiceResponse } from '../types/api.types';
// ============================================================================
// Conversations (aggregated contacts)
// ============================================================================

/** Lightweight shape for the profile columns we actually SELECT. */
interface ContactProfile {
    id: string;
    full_name: string;
    avatar_url: string | null;
}

export interface ConversationSummary {
    contactId: string;
    contactName: string;
    contactAvatar: string | null;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isOnline: boolean;
}

import api from '../lib/apiClient';

export async function getConversations(_userId: string): Promise<ServiceResponse<ConversationSummary[]>> {
    try {
        const inbox = await api.get<any[]>('/messages/inbox');
        const conversations: ConversationSummary[] = (Array.isArray(inbox) ? inbox : []).map(item => ({
            contactId: item.otherUser?.id ?? item.senderId ?? item.receiverId,
            contactName: item.otherUser?.name ?? 'User',
            contactAvatar: item.otherUser?.avatarUrl ?? null,
            lastMessage: item.content ?? '',
            lastMessageTime: item.createdAt ?? '',
            unreadCount: item.unreadCount ?? 0,
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
            receiverId: message.recipient_id,
            content: message.content,
        });
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function markMessagesAsRead(_userId: string, _contactId: string): Promise<void> {
    // Read receipts managed automatically on fetching conversation
}

export async function deleteMessage(_messageId: string): Promise<void> {
    // Delete message endpoint
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
    const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)
        .is('deleted_at', null);

    return count ?? 0;
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
export function subscribeToMessages(
    userId: string,
    onMessage: (message: MessageRow) => void
) {
    const channel = supabase
        .channel(`messages:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${userId}`,
            },
            (payload) => {
                onMessage(payload.new as MessageRow);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
