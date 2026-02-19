import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  User,
  Paperclip,
  CheckCheck,
  Check,
  Sparkles,
  RefreshCw,
  MoreVertical,
  Inbox,
  FileText,
  Image as ImageIcon,
  Download,
  X,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import * as messagesService from '../../services/messages.service';
import type { ConversationSummary } from '../../services/messages.service';
import type { MessageRow } from '../../types/database.types';
import supabase from '../../lib/supabaseClient';

// ============================================================================
// TYPES
// ============================================================================
interface Attachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatFullTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const shouldShowTimestamp = (current: MessageRow, prev: MessageRow | null) => {
  if (!prev) return true;
  const diff = new Date(current.created_at).getTime() - new Date(prev.created_at).getTime();
  return diff > 600000; // 10 minutes
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Messages() {
  const { user } = useAuth();

  // State
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [activeContact, setActiveContact] = useState<ConversationSummary | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const { data, error } = await messagesService.getConversations(user.id);
      if (error) {
        toast.error('Failed to load conversations');
      } else {
        setConversations(data || []);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  const loadMessages = useCallback(async (contactId: string) => {
    if (!user) return;
    setLoadingMessages(true);
    try {
      const { data, error } = await messagesService.getMessages(user.id, contactId);
      if (error) {
        toast.error('Failed to load messages');
      } else {
        setMessages(data || []);
      }

      // Mark as read
      await messagesService.markMessagesAsRead(user.id, contactId);

      // Update unread count in conversations list
      setConversations(prev =>
        prev.map(c => c.contactId === contactId ? { ...c, unreadCount: 0 } : c)
      );
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeContact) {
      loadMessages(activeContact.contactId);
    }
  }, [activeContact, loadMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================================================
  // REAL-TIME SUBSCRIPTION
  // ============================================================================

  useEffect(() => {
    if (!user) return;

    const unsubscribe = messagesService.subscribeToMessages(user.id, (newMessage) => {
      // If we're in the active conversation, add the message
      if (activeContact && newMessage.sender_id === activeContact.contactId) {
        setMessages(prev => [...prev, newMessage]);
        // Auto mark as read since we're viewing
        messagesService.markMessagesAsRead(user.id, activeContact.contactId);
      } else {
        // Update unread in sidebar
        setConversations(prev =>
          prev.map(c =>
            c.contactId === newMessage.sender_id
              ? { ...c, unreadCount: c.unreadCount + 1, lastMessage: newMessage.content, lastMessageTime: newMessage.created_at }
              : c
          )
        );
        // Show toast for messages not in active conversation
        toast(`New message received`, {
          icon: '💬',
          style: { borderRadius: '12px', background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
        });
      }
    });

    return unsubscribe;
  }, [user, activeContact]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !pendingAttachment) || !user || !activeContact || sending) return;
    setSending(true);
    const content = messageInput.trim() || (pendingAttachment ? `📎 ${pendingAttachment.name}` : '');
    const attachments = pendingAttachment ? [pendingAttachment] : [];
    setMessageInput('');
    setPendingAttachment(null);

    try {
      const { data, error } = await messagesService.sendMessage({
        sender_id: user.id,
        recipient_id: activeContact.contactId,
        content,
        is_read: false,
        attachments,
      });

      if (error) {
        toast.error('Failed to send message');
        setMessageInput(content);
      } else if (data) {
        setMessages(prev => [...prev, data]);
        setConversations(prev =>
          prev.map(c =>
            c.contactId === activeContact.contactId
              ? { ...c, lastMessage: content, lastMessageTime: data.created_at }
              : c
          )
        );
      }
    } catch {
      toast.error('Failed to send');
      setMessageInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // File upload handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file);

      if (uploadError) {
        // If bucket doesn't exist, fall back to inline display
        toast.error('Upload failed — storage may not be configured');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      setPendingAttachment({
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
      });

      toast.success(`${file.name} ready to send`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (conv: ConversationSummary) => {
    setActiveContact(conv);
    setShowMobileSidebar(false);
  };

  const filteredConversations = conversations.filter(c =>
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-[calc(100vh-4rem)] flex rounded-2xl overflow-hidden bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 shadow-2xl">
      {/* ========================= SIDEBAR ========================= */}
      <div className={`${
        showMobileSidebar ? 'flex' : 'hidden md:flex'
      } flex-col w-full md:w-[340px] border-r border-white/5 bg-[#0a0a16]/40`}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-orbitron">
              <MessageSquare className="text-cyan-400" size={22} />
              Messages
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs font-bold rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
            <button
              onClick={loadConversations}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingConversations ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-12 h-12 bg-slate-800 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-slate-800 rounded mb-2" />
                    <div className="h-3 w-36 bg-slate-800/50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox size={28} className="text-slate-600" />
              </div>
              <h4 className="text-white font-semibold mb-1">No conversations yet</h4>
              <p className="text-slate-500 text-sm">Messages from your project team will appear here.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.contactId}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full flex items-center gap-3 p-4 transition-all duration-200 border-b border-white/[0.03] text-left group ${
                  activeContact?.contactId === conv.contactId
                    ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400'
                    : 'hover:bg-white/[0.03] border-l-2 border-l-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                    {conv.contactAvatar ? (
                      <img src={conv.contactAvatar} alt={conv.contactName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-slate-400" />
                    )}
                  </div>
                  {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0a0a16] rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`font-semibold text-sm truncate ${
                      conv.unreadCount > 0 ? 'text-white' : 'text-slate-300'
                    }`}>
                      {conv.contactName}
                    </p>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${
                      conv.unreadCount > 0 ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-cyan-500 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ========================= CHAT AREA ========================= */}
      <div className={`${
        showMobileSidebar ? 'hidden md:flex' : 'flex'
      } flex-col flex-1`}>
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-[#0a0a16]/60">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                {activeContact.contactAvatar ? (
                  <img src={activeContact.contactAvatar} alt={activeContact.contactName} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-slate-400" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">{activeContact.contactName}</h3>
                <p className="text-xs text-slate-500">
                  {activeContact.isOnline ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Online
                    </span>
                  ) : 'Offline'}
                </p>
              </div>

              <button
                onClick={() => toast('Conversation options coming soon', { icon: '⚙️' })}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-1 custom-scrollbar">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare size={28} className="text-slate-600" />
                    </div>
                    <h4 className="text-white font-semibold mb-1">No messages yet</h4>
                    <p className="text-slate-500 text-sm">Start the conversation by sending a message below.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = msg.sender_id === user?.id;
                  const prevMsg = i > 0 ? messages[i - 1] : null;
                  const showTime = shouldShowTimestamp(msg, prevMsg);

                  return (
                    <React.Fragment key={msg.id}>
                      {showTime && (
                        <div className="flex items-center justify-center my-4">
                          <span className="text-[10px] text-slate-600 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                      >
                        <div className={`relative max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words ${
                          isOwn
                            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-md shadow-lg shadow-cyan-500/10'
                            : 'bg-slate-800/80 text-slate-200 rounded-bl-md border border-white/5'
                        }`}>
                          <p>{msg.content}</p>

                          {/* Attachments */}
                          {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {(msg.attachments as Attachment[]).map((att, ai) => (
                                <div key={ai}>
                                  {att.type?.startsWith('image/') ? (
                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                                      <img
                                        src={att.url}
                                        alt={att.name}
                                        className="max-w-[240px] rounded-lg border border-white/10 hover:border-cyan-500/30 transition-colors cursor-pointer"
                                        loading="lazy"
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                                        isOwn
                                          ? 'bg-white/10 hover:bg-white/20 text-cyan-100'
                                          : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                                      }`}
                                    >
                                      <FileText size={14} className="shrink-0" />
                                      <span className="truncate max-w-[150px]">{att.name}</span>
                                      <span className="text-[10px] opacity-60 shrink-0">
                                        {att.size ? `${(att.size / 1024).toFixed(0)}KB` : ''}
                                      </span>
                                      <Download size={12} className="shrink-0 ml-auto" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-[10px] ${isOwn ? 'text-cyan-200/60' : 'text-slate-500'}`}>
                              {formatFullTime(msg.created_at)}
                            </span>
                            {isOwn && (
                              msg.is_read
                                ? <CheckCheck size={12} className="text-cyan-200/60" />
                                : <Check size={12} className="text-cyan-200/40" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/5 bg-[#0a0a16]/40">
              {/* Pending Attachment Preview */}
              {pendingAttachment && (
                <div className="mb-3 flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                  {pendingAttachment.type.startsWith('image/') ? (
                    <ImageIcon size={18} className="text-cyan-400 shrink-0" />
                  ) : (
                    <FileText size={18} className="text-cyan-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{pendingAttachment.name}</p>
                    <p className="text-[10px] text-cyan-400/60">{(pendingAttachment.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={() => setPendingAttachment(null)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.zip,.csv,.xls,.xlsx"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                    uploading
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                  }`}
                  title="Attach file (max 10MB)"
                >
                  {uploading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Paperclip size={20} />
                  )}
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-colors"
                  disabled={sending}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={(!messageInput.trim() && !pendingAttachment) || sending}
                  className={`p-3 rounded-xl shrink-0 transition-all duration-200 ${
                    (messageInput.trim() || pendingAttachment) && !sending
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105'
                      : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-800/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                <MessageSquare size={40} className="text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">Your Messages</h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                Select a conversation from the sidebar to start messaging, or wait for your project team to reach out.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Sparkles size={14} className="text-slate-600" />
                Real-time messaging enabled
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}