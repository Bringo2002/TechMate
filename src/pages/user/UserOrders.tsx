import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter,
  Clock, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Calendar,
  DollarSign,
  Eye,
  Download,
  MessageSquare,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  FileText,
  RefreshCw
} from 'lucide-react';
import projectService, { Project } from '../../services/projectService';
import supabase from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// UI Statuses
type UIOrderStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
type UIPriority = 'low' | 'medium' | 'high' | 'urgent';
type SortField = 'date' | 'status' | 'amount' | 'title';
type SortDirection = 'asc' | 'desc';

// Extend Project or create a mapped type if strictly needed, 
// but we can use the Project type and map on the fly.
interface Order extends Omit<Project, 'status' | 'priority'> {
  // Overwrite with UI-specific strict types if needed, or just use string and cast
  status: UIOrderStatus; 
  priority: UIPriority;
  // Helper fields for UI that might be calculated
  formattedDate: string;
  formattedAmount: string;
}

interface FilterOptions {
  status: UIOrderStatus | 'all';
  priority: UIPriority | 'all';
  category: string | 'all';
  dateRange: 'all' | 'week' | 'month' | 'quarter';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const mapDBStatusToUI = (dbStatus: string | null): UIOrderStatus => {
  if (!dbStatus) return 'pending';
  const s = dbStatus.toLowerCase();
  
  if (s === 'active' || s === 'running') return 'in_progress';
  if (s === 'planning' || s === 'open') return 'pending';
  if (s === 'ready' || s === 'review') return 'review';
  if (s === 'completed') return 'completed';
  if (s === 'cancelled' || s === 'blocked') return 'cancelled';
  
  return 'pending'; // fallback
};

const mapDBPriorityToUI = (dbPriority: string | null): UIPriority => {
  if (!dbPriority) return 'medium';
  const p = dbPriority.toLowerCase();
  if (p === 'critical') return 'urgent';
  if (['low', 'medium', 'high'].includes(p)) return p as UIPriority;
  return 'medium';
};

const getStatusConfig = (status: UIOrderStatus) => {
  const configs = {
    pending: {
      label: 'Pending',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      icon: Clock,
      textColor: 'text-yellow-400'
    },
    in_progress: {
      label: 'In Progress',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: RefreshCw,
      textColor: 'text-blue-400'
    },
    review: {
      label: 'Under Review',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      icon: AlertCircle,
      textColor: 'text-purple-400'
    },
    completed: {
      label: 'Completed',
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: CheckCircle,
      textColor: 'text-green-400'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: XCircle,
      textColor: 'text-red-400'
    }
  };
  return configs[status];
};

const getPriorityConfig = (priority: UIPriority) => {
  const configs = {
    low: { label: 'Low', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
    medium: { label: 'Medium', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    high: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    urgent: { label: 'Urgent', color: 'text-red-400', bgColor: 'bg-red-500/20' }
  };
  return configs[priority];
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails, isExpanded, onToggleExpand }) => {
  const statusConfig = getStatusConfig(order.status);
  const priorityConfig = getPriorityConfig(order.priority);
  const StatusIcon = statusConfig.icon;

  // Fallback for visual progress if null
  const displayProgress = order.progress ?? (order.status === 'completed' ? 100 : order.status === 'pending' ? 0 : 50);

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-indigo-500/50 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
              {order.name}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Package size={14} />
              {order.type}
            </span>
            <span>ID: {order.id.slice(0,8)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusConfig.color}`}>
            <StatusIcon size={14} />
            {statusConfig.label}
          </span>
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors" title="More options">
            <MoreVertical size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className={`font-medium ${statusConfig.textColor}`}>{displayProgress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-sm text-white font-medium">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Due Date</p>
            <p className="text-sm text-white font-medium">{formatDate(order.deadline)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm text-white font-medium">{formatCurrency(order.budget)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Last Update</p>
            <p className="text-sm text-white font-medium">{formatDate(order.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="border-t border-gray-700/50 pt-4 mb-4 space-y-3 animate-fadeIn">
          <div>
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-300">{order.description || 'No description provided.'}</p>
          </div>
         
          {order.deliverables && order.deliverables.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Deliverables</p>
              <div className="flex flex-wrap gap-2">
                {order.deliverables.map((item, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

           {/* Fallback to technologies if deliverables not set */}
           {(!order.deliverables || order.deliverables.length === 0) && order.technologies && order.technologies.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {order.technologies.map((item, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
        <button
          onClick={onToggleExpand}
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show More
            </>
          )}
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(order)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Eye size={16} />
            View Details
          </button>
          {order.status === 'completed' && (
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Download size={16} />
              Download
            </button>
          )}
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <MessageSquare size={16} />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: { value: number; isPositive: boolean };
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, trend, color }) => (
  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-gray-600/50 transition-all">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}33` }}>
        <Icon width={20} height={20} className={color} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <TrendingUp size={12} className={trend.isPositive ? '' : 'rotate-180'} />
          {trend.value}%
        </div>
      )}
    </div>
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UserOrders: React.FC = () => {
    // We can't easily use useAuth() here because keeping it simple for replacement without 
    // depending on the hook's specific return structure if it changes.
    // Instead we will use Supabase client directly for auth check for maximum reliability
    // since we already saw useAuth has many fields.
  const [userId, setUserId] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    category: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
        setUserId(session?.user?.id || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            setUserId(session?.user?.id || null);
        }
    );

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const projects = await projectService.getUserProjects(userId);
        
        // Map backend projects to UI orders
        const mappedOrders: Order[] = projects.map(p => ({
          ...p,
          status: mapDBStatusToUI(p.status),
          priority: mapDBPriorityToUI(p.priority),
          // Fallback missing schema fields logic
          progress: p.progress ?? 0,
          deliverables: p.deliverables ?? p.technologies ?? [],
          formattedDate: formatDate(p.created_at),
          formattedAmount: formatCurrency(p.budget),
        }));

        setOrders(mappedOrders);
      } catch (error) {
        console.error('Failed to load orders', error);
        toast.error('Could not load your orders. Please try again.');
        // Don't set orders to empty array here necessarily if we want to show retry, 
        // but for now empty is fine.
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (order.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         order.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || order.status === filters.status;
    const matchesPriority = filters.priority === 'all' || order.priority === filters.priority;
    const matchesCategory = filters.category === 'all' || order.type === filters.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Sort logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'amount':
        // Handle null amounts by treating them as 0
        comparison = (a.budget || 0) - (b.budget || 0);
        break;
      case 'title':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalSpent: orders.reduce((sum, o) => sum + (o.budget || 0), 0)
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (order: Order) => {
    console.log('View details for order:', order.id);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(orders.map(o => o.type)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Orders</h1>
            <p className="text-gray-400">Manage and track all your project orders</p>
          </div>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:scale-105 flex items-center gap-2">
            <Package size={20} />
            New Order
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard 
            label="Total Orders" 
            value={stats.total}
            icon={Package}
            color="#6366f1"
          />
          <StatsCard 
            label="Pending" 
            value={stats.pending}
            icon={Clock}
            color="#eab308"
            // trend={{ value: 5, isPositive: false }}
          />
          <StatsCard 
            label="In Progress" 
            value={stats.inProgress}
            icon={RefreshCw}
            color="#3b82f6"
            // trend={{ value: 12, isPositive: true }}
          />
          <StatsCard 
            label="Completed" 
            value={stats.completed}
            icon={CheckCircle}
            color="#22c55e"
            // trend={{ value: 18, isPositive: true }}
          />
          <StatsCard 
            label="Total Spent" 
            value={formatCurrency(stats.totalSpent)}
            icon={DollarSign}
            color="#a855f7"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by title, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showFilters 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Filter size={20} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Sort */}
            <select
              title="Sort Orders"
              aria-label="Sort Orders"
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
              className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700/50">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  title="Filter by status"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value as UIOrderStatus | 'all'})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                <select
                  title="Filter by priority"
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value as UIPriority | 'all'})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  title="Filter by category"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <p>
            Showing <span className="text-white font-medium">{sortedOrders.length}</span> of{' '}
            <span className="text-white font-medium">{orders.length}</span> orders
          </p>
          {(searchQuery || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ status: 'all', priority: 'all', category: 'all', dateRange: 'all' });
              }}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {sortedOrders.length > 0 ? (
            sortedOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
                isExpanded={expandedOrders.has(order.id)}
                onToggleExpand={() => toggleExpand(order.id)}
              />
            ))
          ) : (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t placed any orders yet'}
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                <Package size={20} />
                Create New Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrders;