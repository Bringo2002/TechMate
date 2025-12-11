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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type OrderStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type SortField = 'date' | 'status' | 'amount' | 'title';
type SortDirection = 'asc' | 'desc';

interface Order {
  id: number;
  title: string;
  description: string;
  status: OrderStatus;
  progress: number;
  createdDate: string;
  dueDate: string;
  completedDate?: string;
  amount: number;
  priority: Priority;
  category: string;
  assignedTo?: string;
  deliverables?: string[];
  lastUpdate: string;
}

interface FilterOptions {
  status: OrderStatus | 'all';
  priority: Priority | 'all';
  category: string | 'all';
  dateRange: 'all' | 'week' | 'month' | 'quarter';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusConfig = (status: OrderStatus) => {
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

const getPriorityConfig = (priority: Priority) => {
  const configs = {
    low: { label: 'Low', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
    medium: { label: 'Medium', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    high: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    urgent: { label: 'Urgent', color: 'text-red-400', bgColor: 'bg-red-500/20' }
  };
  return configs[priority];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatCurrency = (amount: number): string => {
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

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-indigo-500/50 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
              {order.title}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Package size={14} />
              {order.category}
            </span>
            <span>Order #{order.id}</span>
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
          <span className={`font-medium ${statusConfig.textColor}`}>{order.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${order.progress}%` }}
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-sm text-white font-medium">{formatDate(order.createdDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Due Date</p>
            <p className="text-sm text-white font-medium">{formatDate(order.dueDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm text-white font-medium">{formatCurrency(order.amount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Last Update</p>
            <p className="text-sm text-white font-medium">{order.lastUpdate}</p>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="border-t border-gray-700/50 pt-4 mb-4 space-y-3 animate-fadeIn">
          <div>
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-300">{order.description}</p>
          </div>
          {order.assignedTo && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Assigned To</p>
              <p className="text-sm text-white">{order.assignedTo}</p>
            </div>
          )}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    category: 'all',
    dateRange: 'all'
  });

  const [orders] = useState<Order[]>([
    {
      id: 1001,
      title: 'E-commerce Website Development',
      description: 'Full-stack e-commerce platform with payment integration, inventory management, and admin dashboard.',
      status: 'in_progress',
      progress: 65,
      createdDate: '2024-11-15',
      dueDate: '2025-01-15',
      amount: 8500,
      priority: 'high',
      category: 'Web Development',
      assignedTo: 'Dev Team A',
      deliverables: ['Frontend', 'Backend API', 'Admin Panel', 'Documentation'],
      lastUpdate: '2 hours ago'
    },
    {
      id: 1002,
      title: 'Mobile App UI/UX Design',
      description: 'Complete UI/UX design for iOS and Android mobile application including wireframes and prototypes.',
      status: 'review',
      progress: 90,
      createdDate: '2024-11-20',
      dueDate: '2025-01-10',
      amount: 3200,
      priority: 'urgent',
      category: 'Design',
      assignedTo: 'Design Team B',
      deliverables: ['Wireframes', 'UI Mockups', 'Prototype', 'Design System'],
      lastUpdate: '1 day ago'
    },
    {
      id: 1003,
      title: 'API Integration Service',
      description: 'Integration of third-party APIs including payment gateways, shipping providers, and analytics.',
      status: 'pending',
      progress: 20,
      createdDate: '2024-11-25',
      dueDate: '2025-01-20',
      amount: 2400,
      priority: 'medium',
      category: 'Backend',
      assignedTo: 'Backend Team C',
      deliverables: ['API Documentation', 'Integration Code', 'Testing Suite'],
      lastUpdate: '3 days ago'
    },
    {
      id: 1004,
      title: 'Database Migration',
      description: 'Migration from MySQL to PostgreSQL with zero downtime and data integrity verification.',
      status: 'completed',
      progress: 100,
      createdDate: '2024-10-10',
      dueDate: '2024-12-01',
      completedDate: '2024-11-28',
      amount: 4500,
      priority: 'high',
      category: 'DevOps',
      assignedTo: 'DevOps Team D',
      deliverables: ['Migration Script', 'Backup System', 'Performance Report'],
      lastUpdate: '5 days ago'
    },
    {
      id: 1005,
      title: 'SEO Optimization',
      description: 'Comprehensive SEO audit and optimization including on-page, technical, and content improvements.',
      status: 'completed',
      progress: 100,
      createdDate: '2024-10-01',
      dueDate: '2024-11-28',
      completedDate: '2024-11-25',
      amount: 1800,
      priority: 'low',
      category: 'Marketing',
      assignedTo: 'Marketing Team E',
      deliverables: ['SEO Audit Report', 'Optimization Guide', 'Content Strategy'],
      lastUpdate: '1 week ago'
    },
    {
      id: 1006,
      title: 'Cloud Infrastructure Setup',
      description: 'AWS cloud infrastructure setup with auto-scaling, load balancing, and monitoring.',
      status: 'in_progress',
      progress: 45,
      createdDate: '2024-11-18',
      dueDate: '2025-01-25',
      amount: 5600,
      priority: 'high',
      category: 'DevOps',
      assignedTo: 'DevOps Team D',
      deliverables: ['Infrastructure Code', 'Monitoring Dashboard', 'Documentation'],
      lastUpdate: '5 hours ago'
    },
    {
      id: 1007,
      title: 'Logo and Brand Identity',
      description: 'Complete brand identity package including logo design, color palette, and brand guidelines.',
      status: 'review',
      progress: 85,
      createdDate: '2024-11-22',
      dueDate: '2025-01-08',
      amount: 2200,
      priority: 'medium',
      category: 'Design',
      assignedTo: 'Design Team B',
      deliverables: ['Logo Variations', 'Brand Guidelines', 'Asset Pack'],
      lastUpdate: '2 days ago'
    },
    {
      id: 1008,
      title: 'Security Audit',
      description: 'Comprehensive security audit including penetration testing and vulnerability assessment.',
      status: 'pending',
      progress: 10,
      createdDate: '2024-11-28',
      dueDate: '2025-02-01',
      amount: 6800,
      priority: 'urgent',
      category: 'Security',
      assignedTo: 'Security Team F',
      deliverables: ['Audit Report', 'Vulnerability List', 'Remediation Plan'],
      lastUpdate: '1 day ago'
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || order.status === filters.status;
    const matchesPriority = filters.priority === 'all' || order.priority === filters.priority;
    const matchesCategory = filters.category === 'all' || order.category === filters.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Sort logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
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
    totalSpent: orders.reduce((sum, o) => sum + o.amount, 0)
  };

  const toggleExpand = (orderId: number) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
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
            trend={{ value: 5, isPositive: false }}
          />
          <StatsCard 
            label="In Progress" 
            value={stats.inProgress}
            icon={RefreshCw}
            color="#3b82f6"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard 
            label="Completed" 
            value={stats.completed}
            icon={CheckCircle}
            color="#22c55e"
            trend={{ value: 18, isPositive: true }}
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
                  onChange={(e) => setFilters({...filters, status: e.target.value as OrderStatus | 'all'})}
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
                  onChange={(e) => setFilters({...filters, priority: e.target.value as Priority | 'all'})}
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
                  <option value="Web Development">Web Development</option>
                  <option value="Design">Design</option>
                  <option value="Backend">Backend</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Security">Security</option>
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