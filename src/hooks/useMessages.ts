// ============================================================================
// TechMate useMessages Hook
// Messaging with real-time subscriptions
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import type { MessageRow } from '../types/database.types';
import * as messagesService from '../services/messages.service';
import type { ConversationSummary } from '../services/messages.service';

interface UseMessagesReturn {
    conversations: ConversationSummary[];
    messages: MessageRow[];
    activeContact: string | null;
    totalUnread: number;
    loading: boolean;
    error: string | null;
    setActiveContact: (contactId: string | null) => void;
    sendMessage: (content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useMessages(): UseMessagesReturn {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [messages, setMessages] = useState<MessageRow[]>([]);
    const [activeContact, setActiveContactState] = useState<string | null>(null);
    const [totalUnread, setTotalUnread] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            try {
                const user = await authService.getMe();
                setUserId(user?.id ?? null);
            } catch {
                setUserId(null);
            }
        };
        getUser();
    }, []);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        if (!userId) return;
        setLoading(true);

        try {
            const [convRes, unreadCount] = await Promise.all([
                messagesService.getConversations(userId),
                messagesService.getUnreadMessageCount(userId),
            ]);

            if (convRes.error) throw new Error(convRes.error.message);
            setConversations(convRes.data ?? []);
            setTotalUnread(unreadCount);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Fetch messages for active contact
    useEffect(() => {
        if (!userId || !activeContact) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            const res = await messagesService.getMessages(userId, activeContact);
            if (res.data) setMessages(res.data);

            // Mark as read
            await messagesService.markMessagesAsRead(userId, activeContact);
            setConversations(prev =>
                prev.map(c =>
                    c.contactId === activeContact ? { ...c, unreadCount: 0 } : c
                )
            );
        };

        fetchMessages();
    }, [userId, activeContact]);

    // Real-time subscription
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = messagesService.subscribeToMessages(
            userId,
            (newMessage) => {
                // Add to messages if in active conversation
                if (newMessage.sender_id === activeContact) {
                    setMessages(prev => [...prev, newMessage]);
                    messagesService.markMessagesAsRead(userId, activeContact!);
                } else {
                    // Update unread count
                    setTotalUnread(prev => prev + 1);
                    setConversations(prev =>
                        prev.map(c =>
                            c.contactId === newMessage.sender_id
                                ? { ...c, unreadCount: c.unreadCount + 1, lastMessage: newMessage.content, lastMessageTime: newMessage.created_at }
                                : c
                        )
                    );
                }
            }
        );

        return unsubscribe;
    }, [userId, activeContact]);

    const setActiveContact = useCallback((contactId: string | null) => {
        setActiveContactState(contactId);
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!userId || !activeContact) return;

        const res = await messagesService.sendMessage({
            sender_id: userId,
            recipient_id: activeContact,
            content,
            is_read: false,
            attachments: [],
            subject: null,
            thread_id: null,
            request_id: null,
            project_id: null,
            read_at: null,
            deleted_at: null,
            metadata: {},
        });

        if (res.data) {
            setMessages(prev => [...prev, res.data!]);
        }
    }, [userId, activeContact]);

    const deleteMessage = useCallback(async (messageId: string) => {
        await messagesService.deleteMessage(messageId);
        setMessages(prev => prev.filter(m => m.id !== messageId));
    }, []);

    return {
        conversations,
        messages,
        activeContact,
        totalUnread,
        loading,
        error,
        setActiveContact,
        sendMessage,
        deleteMessage,
        refresh: fetchConversations,
    };
}

export default useMessages;
