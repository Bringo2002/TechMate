import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../lib/supabaseClient';
import authService from '../../services/authService';
import { 
  Package, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap,
  Smartphone,
  Brain,
  Palette,
  Code,
  Activity,
  Sparkles,
  RefreshCw,
  Eye,
  ChevronDown,
  Calendar,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';

interface ProjectListItem {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  due_date: string | null;
  budget: number;
  spent: number;
  created_at: string;
  updated_at: string;
  health_score: number;
  next_milestone?: string | null;
  metadata?: Record<string, unknown>;
  source: 'order' | 'inquiry';
}

// --- Icons Helper ---
const getProjectTypeIcon = (type: string) => {
  const icons: Record<string, typeof Code> = {
    website: Code,
    app: Smartphone,
    mobile_app: Smartphone,
    consulting: Brain,
    design: Palette,
    backend: Activity,
    fullstack: Zap,
    web_app: Code,
    other: Package,
  };
  return icons[type] || Package;
};

// --- Status Config ---
const getStatusConfig = (status: string, source: 'order' | 'inquiry') => {
  if (source === 'inquiry') {
    // Show status for inquiries ('new', 'reviewing', etc)
    const inquiryConfigs: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
      new: { label: 'Submitted', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: Sparkles },
      reviewing: { label: 'Reviewing', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Eye },
      quoted: { label: 'Quoted', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: FileText },
      accepted: { label: 'Accepted', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
      declined: { label: 'Declined', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
      on_hold: { label: 'On Hold', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Clock },
      proposal_sent: { label: 'Proposal Sent', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: FileText },
      discovery_call_scheduled: { label: 'Discovery Call', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Calendar },
      discovery_call_completed: { label: 'Discovery Call Done', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle },
    };
    return inquiryConfigs[status] || inquiryConfigs['new'];
  }

  // Order status
  const configs: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
    pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
    in_progress: { label: 'In Progress', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: RefreshCw },
    review: { label: 'Under Review', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Eye },
    completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
  };
  return configs[status] || configs['pending'];
};

const UserOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig] = useState<{ key: keyof ProjectListItem; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchOrdersAndInquiries();
  }, []);

  const fetchOrdersAndInquiries = async () => {
    try {
      let user;
      try {
        user = await authService.getMe();
      } catch (authError) {
        console.error('Authentication error:', authError);
        return;
      }
      if (!user) return;

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch client inquiries (new project requests)
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('client_inquiries')
        .select('*')
        .eq('client_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (inquiriesError) throw inquiriesError;

      // Map both to a common shape
      const ordersMapped: ProjectListItem[] = (ordersData ?? []).map((o: Record<string, unknown>) => ({
        id: o.id,
        title: o.title,
        type: o.type,
        status: o.status,
        progress: o.progress ?? 0,
        due_date: o.due_date ?? null,
        budget: o.budget ?? 0,
        spent: o.spent ?? 0,
        created_at: o.created_at,
        updated_at: o.updated_at,
        health_score: o.health_score ?? 100,
        next_milestone: o.next_milestone,
        metadata: o.metadata,
        source: 'order'
      }));

      const inquiriesMapped: ProjectListItem[] = (inquiriesData ?? []).map((i: Record<string, unknown>) => ({
        id: i.id,
        title: i.title,
        type: i.project_type, // maps to type field
        status: i.status,
        progress: 0, // For inquiries, maybe set to 0
        due_date: i.deadline,
        budget: i.budget_min ?? 0, // use budget_min or 0
        spent: 0,
        created_at: i.created_at,
        updated_at: i.updated_at,
        health_score: 100,
        next_milestone: undefined,
        metadata: i.metadata,
        source: 'inquiry'
      }));

      setOrders([...ordersMapped, ...inquiriesMapped]);
    } catch (error) {
      console.error('Error fetching orders/inquiries:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (order.type && order.type.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === bValue) return 0;
      const comparison = aValue! > bValue! ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  const totalSpent = orders.reduce((acc, curr) => acc + (curr.spent || 0), 0);

  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={20} className="text-cyan-400 animate-pulse" />
                </div>
            </div>
        </div>
     );
  }

  return (
    <div className="space-y-8 relative min-h-screen">
       {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-orbitron flex items-center gap-3">
                    <Package className="text-cyan-400" /> My Orders
                </h1>
                <p className="text-slate-400">Manage your active projects, requests, and billing history.</p>
            </div>
            <button 
                onClick={() => navigate('/user/new-project')}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
                <Sparkles size={18} /> New Order
            </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-4 rounded-xl">
                <p className="text-slate-400 text-xs font-medium mb-1">Total Orders & Requests</p>
                <p className="text-2xl font-bold text-white font-orbitron">{orders.length}</p>
            </div>
            <div className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-4 rounded-xl">
                <p className="text-slate-400 text-xs font-medium mb-1">Active</p>
                <p className="text-2xl font-bold text-cyan-400 font-orbitron">
                    {orders.filter(o => 
                      (o.source === 'order' && ['in_progress', 'review'].includes(o.status)) ||
                      (o.source === 'inquiry' && ['reviewing', 'quoted', 'proposal_sent', 'discovery_call_scheduled', 'discovery_call_completed'].includes(o.status))
                    ).length}
                </p>
            </div>
            <div className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-4 rounded-xl">
                <p className="text-slate-400 text-xs font-medium mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-400 font-orbitron">
                    {orders.filter(o =>
                      (o.source === 'order' && o.status === 'completed') ||
                      (o.source === 'inquiry' && o.status === 'accepted')
                    ).length}
                </p>
            </div>
            <div className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-4 rounded-xl">
                <p className="text-slate-400 text-xs font-medium mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-purple-400 font-orbitron">
                    ${totalSpent.toLocaleString()}
                </p>
            </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search orders & requests..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
                />
            </div>
            <div className="flex gap-4">
                <div className="relative min-w-[150px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <select 
                        title="Filter by status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                        <option value="new">Submitted</option>
                        <option value="reviewing">Reviewing (Req.)</option>
                        <option value="quoted">Quoted (Req.)</option>
                        <option value="accepted">Accepted (Req.)</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
            <AnimatePresence mode='popLayout'>
                {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order, i) => {
                        const Icon = getProjectTypeIcon(order.type);
                        const status = getStatusConfig(order.status, order.source);
                        const isExpanded = expandedId === order.id;

                        return (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ delay: i * 0.05 }}
                                className={`bg-[#0a0a16]/40 backdrop-blur-md border ${isExpanded ? 'border-cyan-500/30 bg-[#0a0a16]/60' : 'border-white/5'} 
                                            rounded-xl overflow-hidden transition-all duration-300 hover:border-white/10`}
                            >
                                <div className="p-4 md:p-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-cyan-400 border border-white/5 shadow-inner shrink-0">
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{order.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <span className="capitalize">{order.type}</span>
                                                    <span>•</span>
                                                    <span>Created {new Date(order.created_at).toLocaleDateString()}</span>
                                                    {order.source === 'inquiry' && (
                                                      <span className="ml-2 bg-cyan-700/20 px-2 py-0.5 rounded text-xs text-cyan-400 font-mono">REQUEST</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                            <div className="text-right hidden md:block">
                                                <p className="text-sm font-bold text-white">${order.budget.toLocaleString()}</p>
                                                <p className="text-xs text-slate-500">Budget</p>
                                            </div>
                                            
                                            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold border ${status.bg} ${status.color} ${status.border}`}>
                                                <status.icon size={14} />
                                                {status.label}
                                            </div>
                                            
                                            <div className={`transition-transform duration-300 text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar (Visible even when collapsed) */}
                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                                                style={{ width: `${order.progress}%` }} 
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-cyan-400 w-8 text-right">{order.progress}%</span>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/5 bg-slate-900/20"
                                        >
                                            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Timeline</p>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3 text-sm">
                                                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Calendar size={16} /></div>
                                                            <div>
                                                                <p className="text-white">Due Date</p>
                                                                <p className="text-slate-500">
                                                                {order.due_date ? new Date(order.due_date).toLocaleDateString() : 'Not set'}
                                                              </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm">
                                                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Clock size={16} /></div>
                                                            <div>
                                                                <p className="text-white">Next Milestone</p>
                                                                <p className="text-slate-500">{order.next_milestone || 'None set'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Financials</p>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between text-sm p-3 bg-slate-800/30 rounded-lg border border-white/5">
                                                            <span className="text-slate-400">Total Budget</span>
                                                            <span className="text-white font-mono">${order.budget.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm p-3 bg-slate-800/30 rounded-lg border border-white/5">
                                                            <span className="text-slate-400">Amount Spent</span>
                                                            <span className="text-cyan-400 font-mono">${order.spent.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Health</p>
                                                    <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5 text-center">
                                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 bg-emerald-500/10 mb-2">
                                                            <span className="text-xl font-bold text-emerald-400">{order.health_score}%</span>
                                                        </div>
                                                        <p className="text-sm text-emerald-400 font-medium">Excellent Condition</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 md:p-6 border-t border-white/5 flex gap-3 justify-end">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (order.source === 'order') {
                                                            navigate(`/user/orders/${order.id}`);
                                                        } else {
                                                            navigate(`/user/requests/${order.id}`);
                                                        }
                                                    }}
                                                    className="px-4 py-2 hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors flex items-center gap-2"
                                                >
                                                    <Eye size={16} /> View Details
                                                </button>
                                                {order.source === 'order' && (
                                                  <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/user/billing');
                                                    }}
                                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
                                                  >
                                                    <FileText size={16} /> Invoice
                                                  </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-[#0a0a16]/40 rounded-xl border border-white/5 border-dashed"
                    >
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={32} className="text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No projects or requests found</h3>
                        <p className="text-slate-400">Try adjusting your filters or create a new order/request.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
        </div>
      </div>
    </div>
  );
};

export default UserOrders;