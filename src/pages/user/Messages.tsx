import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, Send, Paperclip, Smile, MoreVertical, Phone, Video, Star, Check, CheckCheck, Circle, Clock, Trash2, X, Copy, Reply, Pin, Archive, Bell, BellOff, User, MessageCircle, Mic, Camera, Play, Pause, ShieldCheck, Settings, Info, Moon, EyeOff, Terminal, Code } from 'lucide-react';

interface MessageAttachment {
  type: 'code' | 'image' | 'voice';
  content: string;
  name?: string;
  size?: string;
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
  isEdited?: boolean;
}

type Theme = 'dark' | 'midnight' | 'amoled' | 'ocean';

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
        attachments: [{ type: 'image', content: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', name: 'mockup-preview.png', size: '2.4 MB' }]
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
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
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
      bg: 'from-slate-950 via-slate-900 to-slate-950',
      sidebar: 'bg-slate-900/95',
      mainBg: 'bg-slate-900/50',
      chatBg: 'bg-slate-900/50',
      border: 'border-slate-700/50',
      accent: 'from-cyan-500 to-blue-500',
      accentSolid: 'bg-cyan-500',
      accentBg: 'bg-cyan-500',
      accentText: 'text-cyan-400',
      accentBorder: 'border-cyan-500/30',
      card: 'bg-slate-800/70',
      cardHover: 'hover:bg-slate-800/90',
      messageSent: 'bg-gradient-to-br from-cyan-600 to-blue-600',
      messageReceived: 'bg-slate-800/80',
      shadow: 'shadow-cyan-500/20'
    },
    midnight: {
      bg: 'from-blue-950 via-slate-950 to-blue-950',
      sidebar: 'bg-slate-900/95',
      mainBg: 'bg-blue-950/30',
      chatBg: 'bg-blue-950/30',
      border: 'border-blue-800/50',
      accent: 'from-blue-500 to-indigo-500',
      accentSolid: 'bg-blue-500',
      accentBg: 'bg-blue-500',
      accentText: 'text-blue-400',
      accentBorder: 'border-blue-500/30',
      card: 'bg-slate-800/70',
      cardHover: 'hover:bg-slate-800/90',
      messageSent: 'bg-gradient-to-br from-blue-600 to-indigo-600',
      messageReceived: 'bg-slate-800/80',
      shadow: 'shadow-blue-500/20'
    },
    amoled: {
      bg: 'from-black via-gray-950 to-black',
      sidebar: 'bg-black/95',
      mainBg: 'bg-black/80',
      chatBg: 'bg-black',
      border: 'border-gray-800/50',
      accent: 'from-emerald-500 to-teal-500',
      accentSolid: 'bg-emerald-500',
      accentBg: 'bg-emerald-500',
      accentText: 'text-emerald-400',
      accentBorder: 'border-emerald-500/30',
      card: 'bg-gray-900/90',
      cardHover: 'hover:bg-gray-900',
      messageSent: 'bg-gradient-to-br from-emerald-600 to-teal-600',
      messageReceived: 'bg-gray-900',
      shadow: 'shadow-emerald-500/20'
    },
    ocean: {
      bg: 'from-slate-950 via-teal-950 to-slate-950',
      sidebar: 'bg-slate-900/95',
      mainBg: 'bg-teal-950/30',
      chatBg: 'bg-teal-950/30',
      border: 'border-teal-800/50',
      accent: 'from-teal-500 to-cyan-500',
      accentSolid: 'bg-teal-500',
      accentBg: 'bg-teal-500',
      accentText: 'text-teal-400',
      accentBorder: 'border-teal-500/30',
      card: 'bg-slate-800/70',
      cardHover: 'hover:bg-slate-800/90',
      messageSent: 'bg-gradient-to-br from-teal-600 to-cyan-600',
      messageReceived: 'bg-slate-800/80',
      shadow: 'shadow-teal-500/20'
    }
  };

  const t = themes[theme];

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

  const emojiCategories = {
    'Frequently Used': ['👍', '❤️', '😂', '🎉', '🔥', '✅'],
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉'],
    'Gestures': ['👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘', '👌'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💕'],
    'Objects': ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '🚀', '💡', '🔥', '⚡', '✨']
  };

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
        if (msg.id !== messageId) return msg; // Return unchanged message if IDs don't match

        const updatedReactions = msg.reactions ? [...msg.reactions] : [];
        const reactionIndex = updatedReactions.findIndex(r => r.emoji === emoji);

        if (reactionIndex !== -1) {
            const reaction = updatedReactions[reactionIndex];
            const userIndex = reaction.users.indexOf('You');

            if (userIndex !== -1) {
                // User has already reacted, remove their reaction
                reaction.users.splice(userIndex, 1);
                reaction.count -= 1;

                if (reaction.count === 0) {
                    updatedReactions.splice(reactionIndex, 1); // Remove reaction if count is 0
                }
            } else {
                // User has not reacted, add their reaction
                reaction.users.push('You');
                reaction.count += 1;
            }
        } else {
            // Reaction doesn't exist, add a new one
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
    <div>
      {/* Sidebar */}
      <div className={`w-[380px] ${t.sidebar} backdrop-blur-xl border-r ${t.border} flex flex-col`}>
        {/* Header */}
        <div className={`p-5 border-b ${t.border}`}>
          <div className="flex items-center justify-between mb-5">
            <h1 className={`text-2xl font-bold bg-gradient-to-r ${t.accent} bg-clip-text text-transparent flex items-center gap-2`}>
              <MessageCircle className="w-7 h-7" />
              Messages
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const themeOrder: Theme[] = ['dark', 'midnight', 'amoled', 'ocean'];
                  const currentIndex = themeOrder.indexOf(theme);
                  const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
                  setTheme(nextTheme);
                }}
                className={`p-2 rounded-xl ${t.card} ${t.cardHover} transition-all`} 
                title="Switch theme"
              >
                <Moon className={`w-5 h-5 ${t.accentText}`} />
              </button>
              <button className={`p-2 rounded-xl ${t.card} ${t.cardHover} transition-all`} title="New conversation" aria-label="New conversation">
                <Plus className={`w-5 h-5 ${t.accentText}`} />
              </button>
              <button className={`p-2 rounded-xl ${t.card} ${t.cardHover} transition-all`} title="Settings" aria-label="Settings">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${t.accentText}`} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 ${t.card} border ${t.accentBorder} rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm placeholder-gray-500 transition-all`}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`flex gap-2 px-4 py-3 border-b ${t.border} overflow-x-auto`}>
          {['all', 'unread', 'pinned', 'groups', 'archived'].map((tab) => (
            <button
              title="Add reaction"
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterTab === tab
                  ? `${t.accentBg} text-white shadow-lg ${t.shadow}`
                  : `${t.card} text-gray-400 ${t.cardHover}`
              }`}
            >
              {tab === 'all' && '💬 '}
              {tab === 'unread' && '🔴 '}
              {tab === 'pinned' && '📌 '}
              {tab === 'groups' && '👥 '}
              {tab === 'archived' && '📦 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`p-4 border-b border-slate-800/30 cursor-pointer transition-all ${t.cardHover} relative group ${
                selectedConversation === conv.id ? `${t.card} border-l-4 ${t.accentBorder.replace('/30', '')}` : ''
              }`}
            >
              {conv.pinned && (
                <Pin className="absolute top-3 right-3 w-3 h-3 text-gray-500" />
              )}
              
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center text-2xl border-2 ${t.accentBorder} transition-transform group-hover:scale-105`}>
                    {conv.avatar}
                  </div>
                  {conv.status && (
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-900 ${
                      conv.status === 'online' ? 'bg-emerald-500' :
                      conv.status === 'away' ? 'bg-amber-500' :
                      conv.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                  )}
                  {conv.verified && (
                    <ShieldCheck className="absolute -top-1 -right-1 w-4 h-4 text-blue-400 fill-blue-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base truncate max-w-[180px]">{conv.name}</span>
                      {conv.muted && <BellOff className="w-3.5 h-3.5 text-gray-500" />}
                      {conv.type === 'group' && conv.members && (
                        <span className="text-xs text-gray-500">({conv.members})</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{conv.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${conv.unread > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {conv.typing ? (
                        <span className={t.accentText}>typing...</span>
                      ) : (
                        conv.lastMessage
                      )}
                    </p>
                    {conv.unread > 0 && (
                      <div className={`px-2 py-1 rounded-full ${t.accentBg} text-white text-xs font-bold ml-2 flex-shrink-0 min-w-[22px] text-center`}>
                        {conv.unread > 99 ? '99+' : conv.unread}
                      </div>
                    )}
                  </div>
                  
                  {conv.role && <span className="text-xs text-gray-500 mt-0.5 block">{conv.role}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className={`h-[72px] border-b ${t.border} ${t.mainBg} backdrop-blur-xl px-6 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center text-2xl border-2 ${t.accentBorder}`}>
              {selectedConv?.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{selectedConv?.name}</h2>
                {selectedConv?.verified && <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400" />}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Circle className={`w-2 h-2 fill-current ${
                  selectedConv?.status === 'online' ? 'text-emerald-500' :
                  selectedConv?.status === 'away' ? 'text-amber-500' :
                  selectedConv?.status === 'dnd' ? 'text-red-500' : 'text-gray-500'
                }`} />
                <span className="text-gray-400">
                  {selectedConv?.status === 'online' ? 'Active now' :
                   selectedConv?.status === 'away' ? 'Away' :
                   selectedConv?.status === 'dnd' ? 'Do not disturb' : 'Offline'}
                  {selectedConv?.type === 'group' && selectedConv.members && ` • ${selectedConv.members} members`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className={`p-2.5 rounded-xl ${t.card} ${t.cardHover} transition-all`} title="Voice call">
              <Phone className="w-5 h-5 text-gray-300" />
            </button>
            <button className={`p-2.5 rounded-xl ${t.card} ${t.cardHover} transition-all`} title="Video call">
              <Video className="w-5 h-5 text-gray-300" />
            </button>
            <button className={`p-2.5 rounded-xl ${t.card} ${t.cardHover} transition-all`} title="Search in conversation">
              <Search className="w-5 h-5 text-gray-300" />
            </button>
            <button 
              onClick={() => setShowConversationInfo(!showConversationInfo)}
              className={`p-2.5 rounded-xl ${t.card} ${t.cardHover} transition-all ${showConversationInfo ? t.accentBg : ''}`} 
              title="Conversation info"
            >
              <Info className={`w-5 h-5 ${showConversationInfo ? 'text-white' : 'text-gray-300'}`} />
            </button>
            <button className={`p-2.5 rounded-xl ${t.card} ${t.cardHover} transition-all`} title="More options">
              <MoreVertical className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Pinned Messages Banner */}
        {pinnedMessages.length > 0 && (
          <div className={`px-6 py-3 ${t.card} border-b ${t.border} flex items-center gap-3`}>
            <Pin className={`w-4 h-4 ${t.accentText}`} />
            <span className="text-sm text-gray-300 flex-1 truncate">
              {pinnedMessages.length} pinned message{pinnedMessages.length > 1 ? 's' : ''}: {pinnedMessages[0].message}
            </span>
            <button className="text-xs text-gray-400 hover:text-white transition-colors">View All</button>
          </div>
        )}

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${t.chatBg}`}>
          {/* Date Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className={`flex-1 h-px ${t.border}`}></div>
            <span className={`text-xs ${t.card} px-3 py-1 rounded-full text-gray-400 font-medium`}>Today</span>
            <div className={`flex-1 h-px ${t.border}`}></div>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 group ${msg.sender === 'You' ? 'flex-row-reverse' : ''}`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {/* Avatar */}
              {msg.sender !== 'You' && (
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center border-2 ${t.accentBorder} flex-shrink-0`}>
                  {msg.avatar}
                </div>
              )}
              
              <div className={`flex-1 max-w-[65%] ${msg.sender === 'You' ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Sender Info */}
                {msg.sender !== 'You' && (
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-sm font-semibold text-gray-200">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                )}
                
                {/* Reply Preview */}
                {msg.replyTo && (
                  <div className={`mb-2 px-3 py-2 rounded-lg ${t.card} border-l-4 border-cyan-500 max-w-full`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Reply className={`w-3 h-3 ${t.accentText}`} />
                      <span className={`text-xs font-medium ${t.accentText}`}>{msg.replyTo.sender}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{msg.replyTo.message}</p>
                  </div>
                )}
                
                {/* Message Bubble */}
                <div className="relative">
                  {/* Quick Actions */}
                  {hoveredMessageId === msg.id && (
                    <div className={`absolute ${msg.sender === 'You' ? '-left-32' : '-right-32'} top-0 flex gap-1 ${t.card} p-1.5 rounded-xl border ${t.border} shadow-2xl z-10`}>
                      <button
                        onClick={() => handleAddReaction(msg.id, '❤️')}
                        className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
                        title="Add reaction ❤️"
                      >
                        <span className="text-base">❤️</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo({ id: msg.id, sender: msg.sender, message: msg.message })}
                        className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <Reply className="w-4 h-4 text-gray-300" />
                      </button>
                      {msg.sender === 'You' && !msg.deleted && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handlePinMessage(msg.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <Pin className={`w-4 h-4 ${msg.isPinned ? t.accentText : 'text-gray-300'}`} />
                      </button>
                    </div>
                  )}

                  <div className={`px-4 py-3 rounded-2xl shadow-lg ${
                    msg.deleted 
                      ? 'bg-gray-800/30 border border-gray-700/50 italic'
                      : msg.sender === 'You' 
                      ? `${t.messageSent} text-white`
                      : msg.isAI
                      ? 'bg-gradient-to-br from-purple-600/90 to-pink-600/90 text-white'
                      : `${t.messageReceived} border ${t.border}`
                  }`}>
                    {msg.deleted ? (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <EyeOff className="w-4 h-4" />
                        <span>{msg.message}</span>
                      </div>
                    ) : (
                      <>
                        {msg.message && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                        )}
                        
                        {/* Attachments */}
                        {msg.attachments?.map((att, i) => (
                          <div key={i} className="mt-3">
                            {att.type === 'image' && (
                              <div className="relative rounded-xl overflow-hidden cursor-pointer">
                                <img 
                                  src={att.content} 
                                  alt={att.name || 'Image'}
                                  className="max-w-full h-auto max-h-80 rounded-xl"
                                />
                              </div>
                            )}
                            
                            {att.type === 'voice' && (
                              <div className={`flex items-center gap-3 ${msg.sender === 'You' ? 'bg-white/10' : 'bg-black/10'} rounded-xl p-3 min-w-[200px]`}>
                                <button
                                  onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                                  className={`p-2 rounded-full ${msg.sender === 'You' ? 'bg-white/20' : t.card}`}
                                >
                                  {playingVoiceId === msg.id ? (
                                    <Pause className="w-4 h-4" />
                                  ) : (
                                    <Play className="w-4 h-4" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <div className="h-8 flex items-center gap-0.5">
                                    {Array.from({ length: 20 }).map((_, idx) => (
                                      <div
                                        key={idx}
                                        className={`w-1 rounded-full ${msg.sender === 'You' ? 'bg-white/40' : 'bg-gray-400'}`}
                                        style={{ height: `${Math.random() * 100 + 20}%` }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {att.duration && <span className="text-xs opacity-70">{att.duration}</span>}
                              </div>
                            )}
                            
                            {att.type === 'code' && (
                              <div className={`${msg.sender === 'You' ? 'bg-black/20' : 'bg-black/40'} rounded-xl p-4 relative`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 opacity-60" />
                                    {att.name && <span className="text-xs opacity-60 font-mono">{att.name}</span>}
                                  </div>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(att.content)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <code className="text-xs font-mono block whitespace-pre-wrap opacity-90">{att.content}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  
                  {/* Message Footer */}
                  {!msg.deleted && (
                    <div className={`flex items-center gap-2 mt-1 px-1 ${msg.sender === 'You' ? 'justify-end' : ''}`}>
                      {msg.sender === 'You' && (
                        <span className="text-xs text-gray-500">{msg.time}</span>
                      )}
                      {msg.isEdited && (
                        <span className="text-xs text-gray-500 italic">edited</span>
                      )}
                      {msg.sender === 'You' && (
                        <span className="flex items-center">
                          {msg.status === 'read' ? (
                            <CheckCheck className={`w-4 h-4 ${t.accentText}`} />
                          ) : msg.status === 'delivered' ? (
                            <CheckCheck className="w-4 h-4 text-gray-400" />
                          ) : msg.status === 'sent' ? (
                            <Check className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-500 animate-pulse" />
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {msg.reactions.map((reaction, i) => {
                      const hasUserReacted = reaction.users.includes('You');
                      return (
                        <button
                          key={i}
                          onClick={() => handleAddReaction(msg.id, reaction.emoji)}
                          className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 transition-all ${
                            hasUserReacted 
                              ? `${t.accentBg} text-white shadow-lg` 
                              : `${t.card} border ${t.border}`
                          }`}
                        >
                          <span className="text-sm">{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                      className={`px-2.5 py-1 rounded-full ${t.card} border ${t.border} transition-transform`}
                    >
                      <Plus className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {selectedConv?.typing && (
            <div className="flex gap-3 items-end">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center border-2 ${t.accentBorder}`}>
                {selectedConv.avatar}
              </div>
              <div className={`px-5 py-3 rounded-2xl ${t.messageReceived} border ${t.border}`}>
                <div className="flex gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${t.accentBg} animate-bounce`} style={{ animationDelay: '0ms' }} />
                  <div className={`w-2 h-2 rounded-full ${t.accentBg} animate-bounce`} style={{ animationDelay: '150ms' }} />
                  <div className={`w-2 h-2 rounded-full ${t.accentBg} animate-bounce`} style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className={`p-4 border-t ${t.border} ${t.mainBg} backdrop-blur-xl`}>
          {/* Reply Preview */}
          {replyingTo && (
            <div className={`mb-3 px-4 py-3 ${t.card} border ${t.border} rounded-xl flex items-center justify-between`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Reply className={`w-4 h-4 ${t.accentText} flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium ${t.accentText}`}>Replying to {replyingTo.sender}</p>
                  <p className="text-sm text-gray-400 truncate">{replyingTo.message}</p>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )}
          
          {/* Voice Recording */}
          {isRecordingVoice && (
            <div className={`mb-3 px-4 py-3 ${t.card} border ${t.accentBorder} rounded-xl flex items-center justify-between animate-pulse`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${t.accentBg} animate-pulse`} />
                <span className={`text-sm font-medium ${t.accentText}`}>Recording voice message...</span>
                <span className="text-sm text-gray-400">{formatVoiceDuration(voiceRecordDuration)}</span>
              </div>
              <button
                onClick={() => setIsRecordingVoice(false)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-3">
            {/* Attachment Button */}
            <button className={`p-3 rounded-xl ${t.card} ${t.cardHover} transition-all flex-shrink-0`} title="Attach">
              <Paperclip className={`w-5 h-5 ${t.accentText}`} />
            </button>
            
            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className={`w-full px-5 py-3.5 pr-40 ${t.card} border ${t.accentBorder} rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none text-sm placeholder-gray-500 max-h-32 overflow-y-auto transition-all`}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-1">
                <button 
                  onClick={() => setShowEmojiPicker(showEmojiPicker === -1 ? null : -1)}
                  className={`p-2 rounded-lg ${t.cardHover} transition-all`} 
                  title="Emoji"
                >
                  <Smile className="w-4 h-4 text-gray-400" />
                </button>
                <button className={`p-2 rounded-lg ${t.cardHover} transition-all`} title="Image">
                  <Camera className="w-4 h-4 text-gray-400" />
                </button>
                <button className={`p-2 rounded-lg ${t.cardHover} transition-all`} title="Code">
                  <Code className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              {/* Emoji Picker */}
              {showEmojiPicker === -1 && (
                <div className={`absolute bottom-full right-0 mb-2 ${t.card} border ${t.border} rounded-2xl shadow-2xl z-50 w-96 max-h-96 overflow-y-auto`}>
                  <div className="p-4 space-y-4">
                    {Object.entries(emojiCategories).map(([category, emojis]) => (
                      <div key={category}>
                        <h4 className="text-xs font-semibold text-gray-400 mb-2">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {emojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                setMessageInput(prev => prev + emoji);
                                setShowEmojiPicker(null);
                              }}
                              className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-gray-700/30 rounded-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Voice/Send Button */}
            {messageInput.trim() ? (
              <button
                onClick={handleSendMessage}
                className={`px-5 py-3.5 rounded-2xl bg-gradient-to-r ${t.accent} hover:shadow-xl ${t.shadow} transition-all flex items-center gap-2 font-semibold text-white flex-shrink-0`}
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                className={`p-3.5 rounded-2xl ${isRecordingVoice ? `${t.accentBg} text-white` : `${t.card} ${t.cardHover}`} transition-all flex-shrink-0`}
                title={isRecordingVoice ? 'Stop recording' : 'Record voice message'}
              >
                <Mic className={`w-5 h-5 ${isRecordingVoice ? 'animate-pulse' : t.accentText}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Conversation Info */}
      {showConversationInfo && (
        <div className={`w-[360px] ${t.sidebar} backdrop-blur-xl border-l ${t.border} overflow-y-auto`}>
          {/* Profile Section */}
          <div className={`p-6 border-b ${t.border} text-center`}>
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center text-5xl border-4 ${t.accentBorder} mx-auto mb-4`}>
              {selectedConv?.avatar}
            </div>
            <h3 className="font-bold text-xl mb-1">{selectedConv?.name}</h3>
            {selectedConv?.role && (
              <p className="text-sm text-gray-400 mb-3">{selectedConv.role}</p>
            )}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Circle className={`w-2 h-2 fill-current ${
                selectedConv?.status === 'online' ? 'text-emerald-500' : 'text-gray-500'
              }`} />
              <span className="text-sm text-gray-400">
                {selectedConv?.status === 'online' ? 'Active now' : 'Offline'}
              </span>
            </div>
            
            <div className="flex gap-2 justify-center">
              <button className={`p-3 rounded-xl ${t.card} ${t.cardHover} transition-all`}>
                <Phone className="w-5 h-5 text-gray-300" />
              </button>
              <button className={`p-3 rounded-xl ${t.card} ${t.cardHover} transition-all`}>
                <Video className="w-5 h-5 text-gray-300" />
              </button>
              <button className={`p-3 rounded-xl ${t.card} ${t.cardHover} transition-all`}>
                <User className="w-5 h-5 text-gray-300" />
              </button>
              <button className={`p-3 rounded-xl ${t.card} ${t.cardHover} transition-all`}>
                <Bell className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className={`p-6 border-b ${t.border}`}>
            <h4 className="text-sm font-semibold text-gray-400 mb-4">CONVERSATION STATS</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Messages</span>
                <span className={`text-sm font-semibold ${t.accentText}`}>{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Media</span>
                <span className={`text-sm font-semibold ${t.accentText}`}>8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Links</span>
                <span className={`text-sm font-semibold ${t.accentText}`}>12</span>
              </div>
            </div>
          </div>

          {/* Shared Media */}
          <div className={`p-6 border-b ${t.border}`}>
            <h4 className="text-sm font-semibold text-gray-400 mb-4">SHARED MEDIA</h4>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`aspect-square rounded-lg ${t.card} hover:scale-105 transition-transform cursor-pointer`}></div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 space-y-2">
            <button className={`w-full flex items-center gap-3 p-3 rounded-xl ${t.card} ${t.cardHover} transition-all text-left`}>
              <Star className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">Star Conversation</span>
            </button>
            <button className={`w-full flex items-center gap-3 p-3 rounded-xl ${t.card} ${t.cardHover} transition-all text-left`}>
              <BellOff className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">Mute Notifications</span>
            </button>
            <button className={`w-full flex items-center gap-3 p-3 rounded-xl ${t.card} ${t.cardHover} transition-all text-left`}>
              <Archive className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-300">Archive Chat</span>
            </button>
            <button className={`w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all text-left`}>
              <Trash2 className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-400">Delete Conversation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}