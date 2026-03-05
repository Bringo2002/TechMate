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

export async function getConversations(userId: string): Promise<ServiceResponse<ConversationSummary[]>> {
    // Get all messages involving this user
    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .returns<MessageRow[]>();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }

    // Group by contact
    const contactMap = new Map<string, { messages: MessageRow[]; unread: number }>();
    for (const msg of messages ?? []) {
        const contactId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
        if (!contactMap.has(contactId)) {
            contactMap.set(contactId, { messages: [], unread: 0 });
        }
        const entry = contactMap.get(contactId)!;
        entry.messages.push(msg);
        if (!msg.is_read && msg.recipient_id === userId) {
            entry.unread++;
        }
    }

    // Fetch contact profiles
    const contactIds = Array.from(contactMap.keys());
    if (contactIds.length === 0) return { data: [], error: null };

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', contactIds)
        .returns<ContactProfile[]>();

    const profileMap = new Map<string, ContactProfile>();
    for (const p of profiles ?? []) {
        profileMap.set(p.id, p);
    }

    const conversations: ConversationSummary[] = contactIds.map(contactId => {
        const entry = contactMap.get(contactId)!;
        const profile = profileMap.get(contactId);
        const lastMsg = entry.messages[0];

        return {
            contactId,
            contactName: profile?.full_name ?? 'Unknown User',
            contactAvatar: profile?.avatar_url ?? null,
            lastMessage: lastMsg?.content ?? '',
            lastMessageTime: lastMsg?.created_at ?? '',
            unreadCount: entry.unread,
            isOnline: false, // Would need presence tracking
        };
    });

    // Sort by most recent message
    conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    return { data: conversations, error: null };
}

// ============================================================================
// Messages
// ============================================================================
export async function getMessages(
    userId: string,
    contactId: string,
    limit: number = 50
): Promise<ServiceResponse<MessageRow[]>> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
            `and(sender_id.eq.${userId},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${userId})`
        )
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(limit)
        .returns<MessageRow[]>();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }

    return { data: data ?? [], error: null };
}

export async function sendMessage(message: MessageInsert): Promise<ServiceResponse<MessageRow>> {
    const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

export async function markMessagesAsRead(userId: string, contactId: string): Promise<void> {
    await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('sender_id', contactId)
        .eq('recipient_id', userId)
        .eq('is_read', false);
}

export async function deleteMessage(messageId: string): Promise<void> {
    await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);
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
