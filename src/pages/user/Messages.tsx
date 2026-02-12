import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Send, MoreVertical, Phone, Video, 
  CheckCheck, Circle, Trash2, Reply, Pin, BellOff, 
  MessageCircle, Mic, Play, Pause, ShieldCheck, Settings, Info, 
  Moon, EyeOff, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageAttachment {
  type: 'code' | 'image' | 'voice';
  content: string;
  name?: string;
  duration?: string;
}

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface ReplyTo {
  id: number;
  sender: string;
  message: string;
}

interface Message {
  id: number;
  sender: string;
  avatar: string;
  message: string;
  time: string;
  status: 'read' | 'delivered' | 'sending' | 'sent';
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  isAI?: boolean;
  isPinned?: boolean;
  replyTo?: ReplyTo;
  deleted?: boolean;
}

type Theme = 'dark' | 'ocean';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<number>(1);
  const [messageInput, setMessageInput] = useState<string>('');
  const [filterTab, setFilterTab] = useState<string>('all');
  const [theme, setTheme] = useState<Theme>('dark');
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('techmate_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        sender: 'Sarah Chen',
        avatar: '👩‍💻',
        message: 'Hey team! I just finished the new dashboard mockups. Check them out when you get a chance. What do you think about the color scheme?',
        time: '10:30 AM',
        status: 'read',
        reactions: [{ emoji: '👍', count: 3, users: ['Alex', 'Mike', 'You'] }, { emoji: '🔥', count: 2, users: ['Lisa', 'You'] }],
        isPinned: true
      },
      {
        id: 2,
        sender: 'You',
        avatar: '🧑‍💼',
        message: 'These look amazing! The glassmorphism effect really fits our brand. Love the attention to detail.',
        time: '10:32 AM',
        status: 'read',
        reactions: [{ emoji: '❤️', count: 1, users: ['Sarah'] }],
        replyTo: { id: 1, sender: 'Sarah Chen', message: 'Hey team! I just finished the new dashboard mockups...' }
      },
      {
        id: 3,
        sender: 'Alex Kumar',
        avatar: '👨‍💻',
        message: 'Quick update: deployment pipeline is ready. We can push to production whenever you give the green light. All tests passing.',
        time: '10:45 AM',
        status: 'read',
        reactions: [{ emoji: '✅', count: 2, users: ['You', 'Sarah'] }],
        attachments: [{ type: 'code', content: 'kubectl apply -f deployment.yaml\nkubectl rollout status deployment/app', name: 'deploy.sh' }]
      },
      {
        id: 4,
        sender: 'Sarah Chen',
        avatar: '👩‍💻',
        message: '',
        time: '10:48 AM',
        status: 'read',
        attachments: [{ type: 'image', content: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', name: 'mockup-preview.png' }]
      },
      {
        id: 5,
        sender: 'You',
        avatar: '🧑‍💼',
        message: '',
        time: '10:50 AM',
        status: 'delivered',
        attachments: [{ type: 'voice', content: '', duration: '0:24' }]
      },
      {
        id: 6,
        sender: 'AI Assistant',
        avatar: '🤖',
        message: '📋 Action items extracted from conversation:\n\n1. Review dashboard mockups - @Brian (Priority: High)\n2. Deploy to production - @Alex (Status: Ready)\n3. Update documentation - @Sarah (Deadline: Tomorrow)\n\nWould you like me to create tasks in your project tracker?',
        time: '10:51 AM',
        status: 'delivered',
        isAI: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('techmate_messages', JSON.stringify(messages));
  }, [messages]);

  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<ReplyTo | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceRecordDuration, setVoiceRecordDuration] = useState<number>(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const [showConversationInfo, setShowConversationInfo] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const themes = {
    dark: {
      bg: 'from-zinc-950 via-black to-zinc-950',
      sidebar: 'bg-zinc-900/40 backdrop-blur-xl',
      mainBg: 'bg-black/40 backdrop-blur-xl',
      border: 'border-white/5',
      accent: 'from-violet-600 to-indigo-600',
      accentText: 'text-violet-400',
      accentBorder: 'border-violet-500/30',
      card: 'bg-zinc-900/60',
      cardHover: 'hover:bg-zinc-800/80',
      messageSent: 'bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/20',
      messageReceived: 'bg-zinc-800/80 border border-white/5',
      activeItem: 'bg-white/5 border-l-2 border-violet-500'
    },
    ocean: {
      bg: 'from-slate-950 via-cyan-950 to-slate-950',
      sidebar: 'bg-slate-900/40 backdrop-blur-xl',
      mainBg: 'bg-cyan-950/20 backdrop-blur-xl',
      border: 'border-cyan-500/10',
      accent: 'from-cyan-500 to-blue-500',
      accentText: 'text-cyan-400',
      accentBorder: 'border-cyan-500/30',
      card: 'bg-slate-900/60',
      cardHover: 'hover:bg-slate-800/80',
      messageSent: 'bg-gradient-to-br from-cyan-600 to-blue-600 shadow-lg shadow-cyan-900/20',
      messageReceived: 'bg-slate-800/80 border border-cyan-500/10',
      activeItem: 'bg-cyan-500/10 border-l-2 border-cyan-500'
    }
  };

  const t = themes[theme === 'ocean' ? 'ocean' : 'dark'];

  const conversations = [
    {
      id: 1,
      type: 'group',
      name: 'Product Team',
      lastMessage: 'Sarah: Check out the new mockups!',
      time: '10:51 AM',
      unread: 3,
      avatar: '👥',
      status: 'online',
      priority: 'high',
      pinned: true,
      muted: false,
      archived: false,
      typing: true,
      members: 8
    },
    {
      id: 2,
      type: 'dm',
      name: 'Sarah Chen',
      role: 'Lead Designer',
      lastMessage: 'The new designs are ready for review',
      time: '10:30 AM',
      unread: 0,
      avatar: '👩‍💻',
      status: 'online',
      priority: 'high',
      pinned: true,
      muted: false,
      archived: false
    },
    {
      id: 3,
      type: 'client',
      name: 'TechCorp Inc.',
      lastMessage: 'When can we schedule the demo?',
      time: '9:45 AM',
      unread: 5,
      avatar: '🏢',
      status: 'online',
      priority: 'high',
      pinned: false,
      muted: false,
      archived: false,
      verified: true
    },
    {
      id: 4,
      type: 'channel',
      name: 'E-Commerce Platform',
      lastMessage: 'Deployment successful ✓',
      time: 'Yesterday',
      unread: 0,
      avatar: '🛒',
      status: 'away',
      priority: 'medium',
      pinned: false,
      muted: false,
      archived: false,
      project: true
    },
    {
      id: 5,
      type: 'dm',
      name: 'Alex Kumar',
      role: 'DevOps Engineer',
      lastMessage: 'Pipeline is ready to deploy',
      time: 'Yesterday',
      unread: 0,
      avatar: '👨‍💻',
      status: 'dnd',
      priority: 'low',
      pinned: false,
      muted: false,
      archived: false
    },
    {
      id: 6,
      type: 'group',
      name: 'Design Team',
      lastMessage: 'Mike shared a Figma file',
      time: '2 days ago',
      unread: 12,
      avatar: '🎨',
      status: 'online',
      priority: 'low',
      pinned: false,
      muted: true,
      archived: false,
      members: 5
    },
    {
      id: 7,
      type: 'bot',
      name: 'AI Assistant',
      lastMessage: 'I extracted 3 action items',
      time: '3 days ago',
      unread: 0,
      avatar: '🤖',
      status: 'online',
      priority: 'low',
      pinned: false,
      muted: false,
      archived: false
    }
  ];

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageInput]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      voiceTimerRef.current = setInterval(() => {
        setVoiceRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
      }
      setVoiceRecordDuration(0);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() && !isRecordingVoice) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'You',
      avatar: '🧑‍💼',
      message: messageInput.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
      reactions: [],
      replyTo: replyingTo || undefined,
      attachments: []
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    setReplyingTo(null);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 300);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 800);

    // Simulate AI or User Reply
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const replyMessage: Message = {
          id: Date.now(),
          sender: selectedConv?.name || 'User',
          avatar: selectedConv?.avatar || '👤',
          message: 'Thanks for the update! I will check it out shortly.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          replyTo: { id: newMessage.id, sender: 'You', message: newMessage.message }
        };
         setMessages(prev => [...prev, replyMessage]);
      }, 3500);
    }
  }, [messageInput, messages, replyingTo, isRecordingVoice, selectedConv]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddReaction = (messageId: number, emoji: string) => {
    setMessages(prevMessages => prevMessages.map(msg => {
        if (msg.id !== messageId) return msg;

        const updatedReactions = msg.reactions ? [...msg.reactions] : [];
        const reactionIndex = updatedReactions.findIndex(r => r.emoji === emoji);

        if (reactionIndex !== -1) {
            const reaction = updatedReactions[reactionIndex];
            const userIndex = reaction.users.indexOf('You');

            if (userIndex !== -1) {
                reaction.users.splice(userIndex, 1);
                reaction.count -= 1;
                if (reaction.count === 0) {
                    updatedReactions.splice(reactionIndex, 1);
                }
            } else {
                reaction.users.push('You');
                reaction.count += 1;
            }
        } else {
            updatedReactions.push({ emoji, count: 1, users: ['You'] });
        }

        return { ...msg, reactions: updatedReactions };
    }));
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, deleted: true, message: 'This message was deleted' } : msg
    ));
  };

  const handlePinMessage = (messageId: number) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
  };

  const formatVoiceDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredConversations = conversations.filter(conv => {
    if (conv.archived && filterTab !== 'archived') return false;
    if (filterTab === 'unread') return conv.unread > 0;
    if (filterTab === 'pinned') return conv.pinned;
    if (filterTab === 'groups') return conv.type === 'group';
    if (filterTab === 'archived') return conv.archived;
    return filterTab === 'all';
  });

  const pinnedMessages = messages.filter(m => m.isPinned);

  return (
    <div className={`flex h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-br ${t.bg}`}>
      {/* Sidebar - Glassmorphism */}
      <div className={`w-[380px] ${t.sidebar} border-r ${t.border} flex flex-col z-20`}>
        {/* Header */}
        <div className={`p-6 border-b ${t.border}`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${t.accent} shadow-lg shadow-violet-500/20`}>
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              Messages
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTheme(prev => prev === 'dark' ? 'ocean' : 'dark')}
                className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all`} 
                title="Switch Theme"
              >
                <Moon className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all`} title="New Chat">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 bg-zinc-900/50 border ${t.border} rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500/50 text-sm placeholder-gray-600 text-gray-200 transition-all shadow-inner`}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-6 py-4 overflow-x-auto no-scrollbar">
          {['all', 'unread', 'pinned', 'groups'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                filterTab === tab
                  ? `bg-white/10 text-white border-white/10 shadow-lg shadow-black/20`
                  : `bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-300`
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {filteredConversations.map((conv) => (
              <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`p-3 rounded-2xl cursor-pointer transition-all relative group ${
                selectedConversation === conv.id ? t.activeItem : 'hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              {conv.pinned && (
                <Pin className="absolute top-3 right-3 w-3 h-3 text-gray-500 rotate-45" />
              )}
              
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center text-xl shadow-lg ring-1 ring-white/10`}>
                    {conv.avatar}
                  </div>
                  {conv.status && (
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 ${
                      conv.status === 'online' ? 'bg-emerald-500' :
                      conv.status === 'away' ? 'bg-amber-500' :
                      conv.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold text-sm truncate ${selectedConversation === conv.id ? 'text-white' : 'text-gray-300'}`}>
                      {conv.name}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">{conv.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate max-w-[160px] ${selectedConversation === conv.id ? 'text-gray-400' : 'text-gray-500'}`}>
                      {conv.typing ? (
                        <span className="text-violet-400 animate-pulse font-medium">typing...</span>
                      ) : (
                        conv.lastMessage
                      )}
                    </p>
                    {conv.unread > 0 && (
                      <div className={`w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-violet-500/40`}>
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative ${t.mainBg} z-10`}>
        {/* Chat Header */}
        <div className={`h-[80px] border-b ${t.border} backdrop-blur-md px-8 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.accent} flex items-center justify-center text-2xl shadow-lg shadow-violet-500/20`}>
              {selectedConv?.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white">{selectedConv?.name}</h2>
                {selectedConv?.verified && <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400" />}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  selectedConv?.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                  selectedConv?.status === 'away' ? 'bg-amber-500' : 'bg-gray-500'
                }`} />
                <span className="text-gray-400 font-medium">
                  {selectedConv?.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
              <Video className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            <button 
              onClick={() => setShowConversationInfo(!showConversationInfo)}
              className={`p-2.5 rounded-xl transition-all ${showConversationInfo ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} 
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pinned Badge */}
        {pinnedMessages.length > 0 && (
          <div className="absolute top-[80px] left-0 right-0 z-30 px-8 py-2 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 flex items-center gap-3">
             <Pin className="w-3.5 h-3.5 text-violet-400 rotate-45" />
             <span className="text-xs font-medium text-gray-300">
                Pinned: {pinnedMessages[0].message}
             </span>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <div className="flex items-center gap-4 my-8 opacity-50">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Today</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={msg.id}
                className={`flex gap-4 group ${msg.sender === 'You' ? 'flex-row-reverse' : ''}`}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {/* Avatar */}
                {msg.sender !== 'You' && (
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center border border-white/10 shadow-lg`}>
                    {msg.avatar}
                  </div>
                )}
                
                <div className={`flex-1 max-w-[70%] ${msg.sender === 'You' ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Sender Name */}
                  {msg.sender !== 'You' && (
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-xs font-bold text-gray-300">{msg.sender}</span>
                      <span className="text-[10px] text-gray-600">{msg.time}</span>
                    </div>
                  )}
                  
                  {/* Reply Context */}
                  {msg.replyTo && (
                    <div className="mb-2 px-4 py-2 rounded-xl bg-black/20 border-l-2 border-violet-500 text-xs text-gray-400 backdrop-blur-sm">
                      <div className="flex items-center gap-1.5 mb-0.5 text-violet-400 font-semibold">
                        <Reply className="w-3 h-3" />
                        {msg.replyTo.sender}
                      </div>
                      "{msg.replyTo.message}"
                    </div>
                  )}
                  
                  {/* Message Bubble */}
                  <div className="relative group/bubble">
                    {/* Action Toolbar */}
                    <AnimatePresence>
                      {hoveredMessageId === msg.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`absolute ${msg.sender === 'You' ? '-left-28' : '-right-28'} -top-8 flex gap-1 p-1 rounded-lg bg-zinc-800/90 border border-white/10 shadow-xl backdrop-blur-xl z-20`}
                        >
                          <button onClick={() => handleAddReaction(msg.id, '❤️')} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">❤️</button>
                          <button onClick={() => handleAddReaction(msg.id, '👍')} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">👍</button>
                          <button onClick={() => setReplyingTo({ id: msg.id, sender: msg.sender, message: msg.message })} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                            <Reply className="w-4 h-4 text-gray-300" />
                          </button>
                          {msg.sender === 'You' && !msg.deleted && (
                            <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={`px-5 py-3.5 rounded-2xl shadow-md backdrop-blur-sm transition-all duration-200 ${
                      msg.deleted 
                        ? 'bg-zinc-900/40 border border-zinc-800 italic text-gray-500'
                        : msg.sender === 'You' 
                        ? `${t.messageSent} text-white rounded-tr-none hover:shadow-violet-500/30`
                        : msg.isAI
                        ? 'bg-gradient-to-br from-fuchsia-900/40 to-purple-900/40 border border-fuchsia-500/30 text-gray-100 rounded-tl-none shadow-[0_0_15px_rgba(162,28,175,0.1)]'
                        : `${t.messageReceived} text-gray-100 rounded-tl-none hover:bg-zinc-800`
                    }`}>
                      {msg.deleted ? (
                        <div className="flex items-center gap-2 text-sm">
                          <EyeOff className="w-4 h-4" />
                          <span>Message deleted</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
                            {msg.message}
                          </div>
                          
                          {/* Rich Attachments */}
                          {msg.attachments?.map((att, i) => (
                            <div key={i} className="mt-3">
                              {att.type === 'code' && (
                                <div className="bg-black/40 rounded-lg p-3 border border-white/5 font-mono text-xs text-emerald-400 overflow-x-auto">
                                  {att.content}
                                </div>
                              )}
                              {att.type === 'image' && (
                                <div className="relative rounded-lg overflow-hidden border border-white/10 group/img cursor-pointer">
                                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors z-10" />
                                  <img src={att.content} alt={att.name} className="max-w-full h-auto max-h-60 object-cover" />
                                </div>
                              )}
                              {att.type === 'voice' && (
                                <div className="flex items-center gap-3 bg-black/20 rounded-xl p-2 pr-4 border border-white/5">
                                    <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                        <Play className="w-4 h-4 fill-current" />
                                    </button>
                                    <div className="flex gap-0.5 h-6 items-center">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="w-1 bg-white/40 rounded-full" style={{ height: Math.random() * 16 + 8 + 'px' }} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-mono ml-2 opacity-70">0:24</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    
                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`absolute -bottom-3 ${msg.sender === 'You' ? 'right-0' : 'left-0'} flex gap-1 transform scale-90`}>
                            {msg.reactions.map((reaction, i) => (
                                <div key={i} className="px-1.5 py-0.5 bg-zinc-800 rounded-full border border-zinc-700 shadow-lg text-xs flex items-center gap-1 cursor-pointer hover:bg-zinc-700">
                                    <span>{reaction.emoji}</span>
                                    <span className="font-bold text-gray-400">{reaction.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>

                  {/* Message Status */}
                  {msg.sender === 'You' && !msg.deleted && (
                    <div className="flex justify-end mt-1 mr-1">
                       {msg.status === 'read' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> :
                        msg.status === 'delivered' ? <CheckCheck className="w-3.5 h-3.5 text-gray-500" /> :
                        msg.status === 'sent' ? <CheckCheck className="w-3.5 h-3.5 text-gray-500" /> :
                        <Circle className="w-3 h-3 text-gray-600 animate-pulse" />}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-zinc-950/90 to-transparent backdrop-blur-sm z-20">
            {replyingTo && (
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-t-xl mx-2 mb-[-1px] text-xs">
                    <span className="text-gray-400 flex items-center gap-2">
                        <Reply className="w-3 h-3 text-violet-400" />
                        Replying to <span className="text-white font-bold">{replyingTo.sender}</span>
                    </span>
                    <button onClick={() => setReplyingTo(null)} className="hover:text-white text-gray-500"><X className="w-4 h-4" /></button>
                </div>
            )}
            
            <div className={`relative p-2 rounded-2xl bg-zinc-900/60 border ${t.border} shadow-2xl flex items-end gap-2 transition-all focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500/50`}>
                <button className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <Plus className="w-5 h-5" />
                </button>
                
                <textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-200 placeholder-gray-500 max-h-32 min-h-[44px] py-3 resize-none custom-scrollbar"
                    rows={1}
                />
                
                <div className="flex items-center gap-1 pb-1">
                    {!messageInput.trim() && (
                        <>
                            <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                                className={`p-2.5 rounded-xl transition-all ${isRecordingVoice ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        </>
                    )}
                    
                    <button 
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() && !isRecordingVoice}
                        className={`p-2.5 rounded-xl transition-all duration-200 ${
                            messageInput.trim() || isRecordingVoice
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:scale-105 active:scale-95'
                                : 'bg-transparent text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        <Send className="w-5 h-5 fill-current" />
                    </button>
                </div>
            </div>
            <div className="text-center mt-2 text-[10px] text-gray-600 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                End-to-end encrypted
            </div>
        </div>
      </div>
    </div>
  );
}