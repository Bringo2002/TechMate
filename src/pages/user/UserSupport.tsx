import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MessageSquare, Send, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import * as supportService from '../../services/support.service';
import type { SupportTicketRow, SupportTicketInsert, TicketPriority, TicketCategory } from '../../types/database.types';

const UserSupport: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' as TicketPriority, category: 'general' as TicketCategory });
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supportService.getUserTickets(user.id);
    if (error) {
      toast.error('Failed to load tickets');
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching pattern
      void loadTickets();
    }
  }, [user, loadTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supportService.createTicket({
      user_id: user.id,
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority,
      category: newTicket.category, // Default category
      status: 'open'
    } as SupportTicketInsert);

    if (error) {
      toast.error('Failed to create ticket: ' + error.message);
    } else {
      toast.success('Ticket created successfully!');
      setNewTicket({ subject: '', description: '', priority: 'medium', category: 'general' });
      setIsCreating(false);
      loadTickets();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'resolved': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen text-gray-100 p-2 md:p-0">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
              <MessageSquare className="text-indigo-400" size={32} />
              Support Center
            </h1>
            <p className="text-gray-400 mt-1">Get expert help with your projects and technical integration.</p>
          </div>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            {isCreating ? <Send size={20} /> : <Plus size={20} />}
            {isCreating ? 'View Tickets' : 'New Ticket'}
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List / Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {isCreating ? (
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-6">Create Support Request</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Subject</label>
                    <input
                      type="text"
                      required
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 hover:bg-slate-800/80 transition-colors"
                      placeholder="E.g., Integration Error in Module X"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Priority</label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as TicketPriority})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 hover:bg-slate-800/80 transition-colors"
                      >
                        <option value="low">Low - General Question</option>
                        <option value="medium">Medium - Feature Request</option>
                        <option value="high">High - Critical Issue</option>
                      </select>
                    </div>
                     <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Category</label>
                      <select 
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({...newTicket, category: e.target.value as TicketCategory})}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 hover:bg-slate-800/80 transition-colors"
                      >
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing & Account</option>
                        <option value="feature_request">Feature Request</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <textarea
                      required
                      rows={6}
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 hover:bg-slate-800/80 transition-colors resize-none"
                      placeholder="Describe the issue in detail..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search & Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900/40 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Ticket List */}
                {loading ? (
                    <div className="text-center text-gray-400 py-10">Loading tickets...</div>
                ) : tickets.filter(t => {
                    const matchesSearch = !searchQuery || 
                      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
                    return matchesSearch && matchesStatus;
                  }).length === 0 ? (
                    <div className="text-center text-gray-400 py-10">No tickets found.</div>
                ) : (
                  tickets.filter(t => {
                    const matchesSearch = !searchQuery || 
                      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
                    return matchesSearch && matchesStatus;
                  }).map(ticket => (
                    <div 
                      key={ticket.id}
                      className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-indigo-500/30 transition-all cursor-pointer hover:bg-slate-800/40"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-gray-500 font-mono text-sm">#{ticket.id.slice(0, 8)}</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{ticket.subject}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} /> Created {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                            {/* Replies count not in table yet, just static/hidden */}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className={`text-xs font-bold uppercase ${getPriorityColor(ticket.priority)}`}>
                             {ticket.priority} Priority
                           </span>
                           {/* <span className="text-xs text-gray-500">Last activity 2h ago</span> */}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Answers</h3>
              <div className="space-y-3">
                {['How to reset API keys?', 'Billing cycle explained', 'Setting up webhooks', 'Team permission levels'].map((item, i) => (
                  <a key={i} href="#" className="block p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 text-gray-300 hover:text-indigo-400 text-sm transition-colors flex items-center justify-between group">
                    {item}
                    <Send size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                View Documentation →
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-white">
                <Send size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
              <p className="text-sm text-gray-400 mb-4">
                Chat with our engineering team directly for urgent implementation issues.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-gray-700" />
                  ))}
                </div>
                <span className="text-xs text-green-400 font-bold">● Online Now</span>
              </div>
              <button className="w-full py-2.5 bg-white text-indigo-900 hover:bg-gray-100 rounded-xl font-bold transition-all shadow-lg">
                Start Chat
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserSupport;