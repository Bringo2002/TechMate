import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, Send, Paperclip, Smile, MoreVertical, Phone, Video, Star, Check, CheckCheck, Circle, Clock, Filter, Hash, AtSign, Zap, Code, Terminal, GitBranch, Activity, Moon, Image, Edit2, Trash2, X, Copy } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  avatar: string;
  message: string;
  time: string;
  status: 'read' | 'delivered' | 'sending';
  reactions?: { emoji: string; count: number; users: string[] }[];
  attachments?: { type: string; content: string }[];
  isAI?: boolean;
  isEdited?: boolean;
}

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<number>(1);
  const [messageInput, setMessageInput] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [theme, setTheme] = useState<'dark' | 'midnight' | 'ocean'>('dark');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'Sarah Chen',
      avatar: '👩‍💻',
      message: 'Hey team! I just finished the new dashboard mockups. Check them out when you get a chance.',
      time: '10:30 AM',
      status: 'read',
      reactions: [{ emoji: '👍', count: 3, users: ['Alex', 'Mike', 'You'] }, { emoji: '🔥', count: 2, users: ['Lisa', 'You'] }]
    },
    {
      id: 2,
      sender: 'You',
      avatar: '🧑‍💼',
      message: 'These look amazing! The glassmorphism effect really fits our brand.',
      time: '10:32 AM',
      status: 'read',
      reactions: []
    },
    {
      id: 3,
      sender: 'Alex Kumar',
      avatar: '👨‍💻',
      message: 'Quick update: deployment pipeline is ready. We can push to prod whenever.',
      time: '10:45 AM',
      status: 'read',
      reactions: [{ emoji: '✅', count: 1, users: ['You'] }],
      attachments: [{ type: 'code', content: 'kubectl apply -f deployment.yaml' }]
    },
    {
      id: 4,
      sender: 'AI Assistant',
      avatar: '🤖',
      message: 'Action items extracted: 1) Review mockups (assigned: Brian) 2) Deploy to prod (assigned: Alex)',
      time: '10:46 AM',
      status: 'delivered',
      isAI: true
    }
  ]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const themes = {
    dark: {
      bg: 'from-slate-950 via-slate-900 to-slate-950',
      sidebar: 'bg-slate-900/80',
      mainBg: 'bg-slate-900/30',
      border: 'border-slate-700/50',
      accent: 'from-cyan-500 to-blue-500',
      accentBg: 'bg-cyan-500',
      accentText: 'text-cyan-400',
      accentBorder: 'border-cyan-500/20',
      card: 'bg-slate-800/50',
      cardHover: 'hover:bg-slate-800/70',
      shadow: 'shadow-cyan-500/20'
    },
    midnight: {
      bg: 'from-slate-950 via-blue-950 to-slate-950',
      sidebar: 'bg-blue-950/50',
      mainBg: 'bg-blue-950/20',
      border: 'border-blue-500/30',
      accent: 'from-blue-500 to-indigo-500',
      accentBg: 'bg-blue-500',
      accentText: 'text-blue-400',
      accentBorder: 'border-blue-500/20',
      card: 'bg-slate-800/60',
      cardHover: 'hover:bg-slate-800/80',
      shadow: 'shadow-blue-500/20'
    },
    ocean: {
      bg: 'from-slate-950 via-teal-950 to-slate-950',
      sidebar: 'bg-teal-950/50',
      mainBg: 'bg-teal-950/20',
      border: 'border-teal-500/30',
      accent: 'from-teal-500 to-cyan-500',
      accentBg: 'bg-teal-500',
      accentText: 'text-teal-400',
      accentBorder: 'border-teal-500/20',
      card: 'bg-slate-800/60',
      cardHover: 'hover:bg-slate-800/80',
      shadow: 'shadow-teal-500/20'
    }
  };

  const t = themes[theme];

  const conversations = [
    {
      id: 1,
      type: 'dm',
      name: 'Sarah Chen',
      role: 'Lead Designer',
      lastMessage: 'Can you review the new mockups?',
      time: '2m ago',
      unread: 3,
      avatar: '👩‍💻',
      status: 'online',
      priority: 'high'
    },
    {
      id: 2,
      type: 'channel',
      name: 'E-Commerce Platform',
      lastMessage: 'Deployment to staging complete',
      time: '15m ago',
      unread: 0,
      avatar: '🛒',
      status: 'online',
      priority: 'high',
      project: true
    },
    {
      id: 3,
      type: 'client',
      name: 'TechCorp Inc.',
      lastMessage: 'When can we schedule the demo?',
      time: '1h ago',
      unread: 2,
      avatar: '🏢',
      status: 'online',
      priority: 'high',
      client: true
    },
    {
      id: 4,
      type: 'channel',
      name: 'Mobile App Dev',
      lastMessage: 'CI/CD: Build #234 successful ✓',
      time: '2h ago',
      unread: 0,
      avatar: '📱',
      status: 'away',
      priority: 'low',
      project: true
    },
    {
      id: 5,
      type: 'group',
      name: 'Design Team',
      lastMessage: 'Mike: New Figma file shared',
      time: '3h ago',
      unread: 0,
      avatar: '🎨',
      status: 'online',
      priority: 'low'
    },
    {
      id: 6,
      type: 'dm',
      name: 'Alex Kumar',
      role: 'DevOps Engineer',
      lastMessage: 'K8s cluster scaling issue resolved',
      time: '4h ago',
      unread: 0,
      avatar: '👨‍💻',
      status: 'dnd',
      priority: 'medium'
    },
    {
      id: 7,
      type: 'channel',
      name: 'API Development',
      lastMessage: 'GraphQL endpoint deployed',
      time: '5h ago',
      unread: 5,
      avatar: '⚡',
      status: 'online',
      priority: 'high',
      project: true
    }
  ];

  const activeUsers = [
    { name: 'Sarah', avatar: '👩‍💻', status: 'online' },
    { name: 'Alex', avatar: '👨‍💻', status: 'online' },
    { name: 'Mike', avatar: '👨‍🎨', status: 'away' },
    { name: 'Lisa', avatar: '👩‍💼', status: 'online' }
  ];

  const integrations = [
    { icon: <GitBranch className="w-4 h-4" />, name: 'GitHub', count: 12 },
    { icon: <Activity className="w-4 h-4" />, name: 'Jira', count: 8 },
    { icon: <Terminal className="w-4 h-4" />, name: 'CI/CD', count: 3 }
  ];

  const quickEmojis = ['👍', '❤️', '😂', '🎉', '🔥', '✅', '👏', '💯'];

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageInput]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search messages"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'You',
      avatar: '🧑‍💼',
      message: messageInput.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
      reactions: []
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 500);

    // Simulate read status
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
      ));
    }, 2000);
  }, [messageInput, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setMessageInput(message.message);
      setEditingMessageId(messageId);
    }
  };

  const handleSaveEdit = () => {
    if (!messageInput.trim() || !editingMessageId) return;

    setMessages(prev => prev.map(msg =>
      msg.id === editingMessageId
        ? { ...msg, message: messageInput.trim(), isEdited: true }
        : msg
    ));

    setMessageInput('');
    setEditingMessageId(null);
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleAddReaction = (messageId: number, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions?.map(r =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, 'You'] }
                : r
            )
          };
        } else {
          return {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji, count: 1, users: ['You'] }]
          };
        }
      }
      return msg;
    }));
    setShowEmojiPicker(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const filteredConversations = conversations.filter(conv => {
    if (filterTab === 'unread') return conv.unread > 0;
    if (filterTab === 'starred') return conv.client;
    if (filterTab === 'mentions') return conv.name.toLowerCase().includes('@');
    return true;
  });

  const filteredMessages = messages.filter(msg =>
    searchQuery ? msg.message.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className={`flex h-screen bg-gradient-to-br ${t.bg} text-gray-100`}>
      {/* Sidebar */}
      <div className={`w-80 ${t.sidebar} backdrop-blur-xl border-r ${t.border} flex flex-col`}>
        {/* Header */}
        <div className={`p-6 border-b ${t.border}`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold bg-gradient-to-r ${t.accent} bg-clip-text text-transparent`}>
              Messages
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'midnight' : theme === 'midnight' ? 'ocean' : 'dark')}
                className={`p-2 rounded-lg ${t.card} ${t.cardHover} transition-all`} 
                title="Switch theme"
              >
                <Moon className={`w-5 h-5 ${t.accentText}`} />
              </button>
              <button className={`p-2 rounded-lg ${t.card} ${t.cardHover} transition-all`} title="Add new">
                <Plus className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 ${t.card} border ${t.accentBorder} rounded-lg focus:outline-none focus:border-opacity-50 text-sm placeholder-gray-500`}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`flex gap-2 px-4 py-3 border-b ${t.border} overflow-x-auto`}>
          {['all', 'unread', 'starred', 'mentions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterTab === tab
                  ? `${t.card} ${t.accentText} shadow-lg ${t.shadow}`
                  : `bg-slate-800/30 text-gray-400 ${t.cardHover}`
              }`}
              title={`Filter by ${tab}`}
            >
              {tab === 'mentions' && <AtSign className="w-3 h-3 inline mr-1" />}
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
              className={`p-4 border-b border-slate-800/50 cursor-pointer transition-all ${t.cardHover} ${
                selectedConversation === conv.id ? `${t.card} border-l-4 ${t.accentBorder.replace('/20', '')}` : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center text-xl border ${t.accentBorder}`}>
                    {conv.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    conv.status === 'online' ? 'bg-green-500' :
                    conv.status === 'away' ? 'bg-yellow-500' :
                    conv.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{conv.name}</span>
                      {conv.project && <Hash className={`w-3 h-3 ${t.accentText}`} />}
                      {conv.client && <Star className="w-3 h-3 text-yellow-400" />}
                    </div>
                    <span className="text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                  {conv.role && <span className="text-xs text-gray-500">{conv.role}</span>}
                </div>
                
                {conv.unread > 0 && (
                  <div className={`px-2 py-1 rounded-full ${t.accentBg} text-white text-xs font-bold`}>
                    {conv.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Active Users */}
        <div className={`p-4 border-t ${t.border}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">ACTIVE NOW</span>
            <span className={`text-xs ${t.accentText}`}>{activeUsers.length} online</span>
          </div>
          <div className="flex gap-2">
            {activeUsers.map((user, i) => (
              <div key={i} className="relative group">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center border ${t.accentBorder} cursor-pointer hover:scale-110 transition-transform`}>
                  {user.avatar}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                  user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className={`h-20 border-b ${t.border} ${t.mainBg} backdrop-blur-xl px-6 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center text-2xl border ${t.accentBorder}`}>
              {selectedConv?.avatar}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{selectedConv?.name}</h2>
              <div className="flex items-center gap-2 text-sm">
                <Circle className={`w-2 h-2 fill-current ${
                  selectedConv?.status === 'online' ? 'text-green-500' :
                  selectedConv?.status === 'away' ? 'text-yellow-500' :
                  selectedConv?.status === 'dnd' ? 'text-red-500' : 'text-gray-500'
                }`} />
                <span className="text-gray-400">
                  {selectedConv?.status === 'online' ? 'Online' :
                   selectedConv?.status === 'away' ? 'Away' :
                   selectedConv?.status === 'dnd' ? 'Do not disturb' : 'Offline'}
                  {selectedConv?.role && ` • ${selectedConv.role}`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className={`p-2.5 rounded-lg ${t.card} ${t.cardHover} transition-all`} title="Phone call">
              <Phone className="w-5 h-5 text-gray-400" />
            </button>
            <button className={`p-2.5 rounded-lg ${t.card} ${t.cardHover} transition-all`} title="Video call">
              <Video className="w-5 h-5 text-gray-400" />
            </button>
            <button className={`p-2.5 rounded-lg ${t.card} ${t.cardHover} transition-all`} title="Star conversation">
              <Star className="w-5 h-5 text-gray-400" />
            </button>
            <button className={`p-2.5 rounded-lg ${t.card} ${t.cardHover} transition-all`} title="Filter messages">
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
            <button className={`p-2.5 rounded-lg ${t.card} ${t.cardHover} transition-all`} title="More options">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 group ${msg.sender === 'You' ? 'flex-row-reverse' : ''}`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center border ${t.accentBorder} flex-shrink-0`}>
                {msg.avatar}
              </div>
              
              <div className={`flex-1 max-w-2xl ${msg.sender === 'You' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-300">{msg.sender}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                  {msg.isEdited && <span className="text-xs text-gray-500 italic">(edited)</span>}
                  {msg.sender === 'You' && (
                    msg.status === 'read' ? <CheckCheck className={`w-4 h-4 ${t.accentText}`} /> :
                    msg.status === 'delivered' ? <Check className="w-4 h-4 text-gray-400" /> :
                    <Clock className="w-4 h-4 text-gray-500 animate-pulse" />
                  )}
                </div>
                
                <div className={`relative px-4 py-3 rounded-2xl ${
                  msg.sender === 'You' 
                    ? `bg-gradient-to-r ${t.accent} text-white shadow-lg ${t.shadow}` 
                    : msg.isAI
                    ? 'bg-purple-500/10 border border-purple-500/30 text-purple-100'
                    : `${t.card} border ${t.border}`
                }`}>
                  {/* Message Actions (on hover) */}
                  {hoveredMessageId === msg.id && msg.sender === 'You' && (
                    <div className={`absolute ${msg.sender === 'You' ? '-left-16' : '-right-16'} top-0 flex gap-1 ${t.card} p-1 rounded-lg border ${t.border} shadow-lg`}>
                      <button
                        onClick={() => handleEditMessage(msg.id)}
                        className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.message)}
                        className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  )}

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  
                  {msg.attachments && msg.attachments.map((att, i) => (
                    <div key={i} className={`mt-3 p-3 bg-black/30 rounded-lg border ${t.accentBorder} group/code relative`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Code className={`w-4 h-4 ${t.accentText}`} />
                          <span className={`text-xs ${t.accentText} font-mono`}>bash</span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(att.content)}
                          className="opacity-0 group-hover/code:opacity-100 p-1 hover:bg-slate-700 rounded transition-all"
                          title="Copy code"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                      <code className="text-xs text-gray-300 font-mono block">{att.content}</code>
                    </div>
                  ))}
                </div>
                
                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {msg.reactions.map((reaction, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddReaction(msg.id, reaction.emoji)}
                        className={`px-2 py-1 rounded-full ${t.card} border ${t.border} text-xs flex items-center gap-1 hover:scale-110 transition-transform cursor-pointer`}
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-gray-400">{reaction.count}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`px-2 py-1 rounded-full ${t.card} border ${t.border} text-xs hover:scale-110 transition-transform cursor-pointer`}
                    >
                      <Smile className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                )}
                
                {/* Add Reaction Button (if no reactions) */}
                {(!msg.reactions || msg.reactions.length === 0) && hoveredMessageId === msg.id && (
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`mt-2 px-2 py-1 rounded-full ${t.card} border ${t.border} text-xs opacity-0 group-hover:opacity-100 transition-opacity`}
                  >
                    <Smile className="w-3 h-3 text-gray-400 inline mr-1" />
                    Add reaction
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.accent} bg-opacity-20 flex items-center justify-center border ${t.accentBorder}`}>
              👩‍💻
            </div>
            <div className={`px-4 py-3 rounded-2xl ${t.card} border ${t.border}`}>
              <div className="flex gap-1">
                <div className={`w-2 h-2 rounded-full ${t.accentBg} animate-bounce`} style={{ animationDelay: '0ms' }} />
                <div className={`w-2 h-2 rounded-full ${t.accentBg} animate-bounce`} style={{ animationDelay: '150ms' }} />
                <div className={`w-2 h-2 rounded-full ${t.accentBg} animate-bounce`} style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className={`p-4 border-t ${t.border} ${t.mainBg} backdrop-blur-xl`}>
          {editingMessageId && (
            <div className={`mb-2 px-3 py-2 ${t.card} border ${t.border} rounded-lg flex items-center justify-between`}>
              <span className="text-xs text-gray-400">Editing message</span>
              <button
                onClick={() => {
                  setEditingMessageId(null);
                  setMessageInput('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={editingMessageId ? "Edit your message..." : "Type a message... (Enter to send, Shift+Enter for new line)"}
                rows={1}
                className={`w-full px-4 py-3 pr-36 ${t.card} border ${t.accentBorder} rounded-xl focus:outline-none focus:border-opacity-50 resize-none text-sm placeholder-gray-500 max-h-32 overflow-y-auto`}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-1">
                <button className={`p-1.5 rounded-lg ${t.cardHover} transition-all`} title="Attach a file">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <button className={`p-1.5 rounded-lg ${t.cardHover} transition-all`} title="Insert an image">
                  <Image className="w-4 h-4 text-gray-400" />
                </button>
                <button className={`p-1.5 rounded-lg ${t.cardHover} transition-all`} title="Insert code snippet">
                  <Code className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-1.5 rounded-lg ${t.cardHover} transition-all ${showEmojiPicker ? t.accentBg : ''}`}
                  title="Add an emoji"
                >
                  <Smile className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className={`absolute bottom-full right-0 mb-2 p-3 ${t.card} border ${t.border} rounded-xl shadow-2xl z-50`}>
                  <div className="flex flex-wrap gap-2 w-64">
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setMessageInput(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-2xl hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={editingMessageId ? handleSaveEdit : handleSendMessage}
              disabled={!messageInput.trim()}
              className={`px-5 py-3 rounded-xl bg-gradient-to-r ${t.accent} hover:shadow-lg ${t.shadow} transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Send className="w-4 h-4" />
              <span>{editingMessageId ? 'Save' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`w-80 ${t.sidebar} backdrop-blur-xl border-l ${t.border} overflow-y-auto`}>
        {/* Thread Info */}
        <div className={`p-6 border-b ${t.border}`}>
          <h3 className="font-semibold mb-4 text-gray-200">Conversation Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Participants</span>
              <span className={t.accentText}>2</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Files shared</span>
              <span className={t.accentText}>8</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Links</span>
              <span className={t.accentText}>12</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Messages</span>
              <span className={t.accentText}>{messages.length}</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className={`p-6 border-b ${t.border}`}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-gray-200">AI Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <p className="text-xs font-medium text-purple-200 mb-2">Action Items (3)</p>
              <ul className="text-xs text-gray-300 space-y-1.5">
                <li>• Review mockups - Brian</li>
                <li>• Deploy to prod - Alex</li>
                <li>• Update docs - Sarah</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-xs font-medium text-green-200 mb-1">Sentiment</p>
              <p className="text-xs text-gray-300">Positive • Collaborative</p>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className={`p-6 border-b ${t.border}`}>
          <h3 className="font-semibold mb-4 text-gray-200">Connected Tools</h3>
          <div className="space-y-2">
            {integrations.map((int, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${t.card} ${t.cardHover} cursor-pointer transition-all`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${t.accent} bg-opacity-20`}>
                    {int.icon}
                  </div>
                  <span className="text-sm text-gray-200">{int.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${t.card} ${t.accentText} border ${t.accentBorder}`}>{int.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Files */}
        <div className="p-6">
          <h3 className="font-semibold mb-4 text-gray-200">Recent Files</h3>
          <div className="space-y-2">
            {[
              { name: 'design-mockups.fig', size: '2.4 MB', icon: '🎨' },
              { name: 'deployment.yaml', size: '14 KB', icon: '⚙️' },
              { name: 'meeting-notes.md', size: '8 KB', icon: '📝' }
            ].map((file, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${t.card} ${t.cardHover} cursor-pointer transition-all`}>
                <div className="text-2xl">{file.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-200">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
