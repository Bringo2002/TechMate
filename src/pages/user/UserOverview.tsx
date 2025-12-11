import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Package, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Activity,
  FileText,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type OrderStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
type UpdateType = 'completed' | 'progress' | 'message' | 'review' | 'warning';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface Order {
  id: number;
  title: string;
  description?: string;
  status: OrderStatus;
  progress: number;
  dueDate: string;
  lastUpdate: string;
  priority?: Priority;
  assignedTo?: string;
  category?: string;
}

interface Update {
  id: number;
  type: UpdateType;
  message: string;
  time: string;
  timestamp: Date;
  orderId?: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  actionable?: boolean;
  actionUrl?: string;
}

interface DashboardStats {
  pending: number;
  inProgress: number;
  review: number;
  completed: number;
  totalSpent?: number;
  avgCompletionTime?: number;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  action: () => void;
  variant: 'primary' | 'secondary' | 'success';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    review: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
  };
  return colors[status] || colors.pending;
};

const getStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    review: 'Under Review',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return labels[status] || status;
};

const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    low: 'text-gray-400',
    medium: 'text-blue-400',
    high: 'text-orange-400',
    urgent: 'text-red-400'
  };
  return colors[priority] || colors.medium;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatCardProps {
  label: string;
  count: number;
  color: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ label, count, color, icon: Icon, trend }) => {
  // FIX: Use inline styles for dynamic color values instead of template literals in className
  const bgColor = color === 'yellow' ? '#eab308' : 
                  color === 'blue' ? '#3b82f6' : 
                  color === 'purple' ? '#a855f7' : 
                  color === 'green' ? '#22c55e' : '#6366f1';
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
          style={{ backgroundColor: `${bgColor}33` }}
        >
          <Icon width={24} height={24} className={`text-[${bgColor}]`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp size={14} className={trend.isPositive ? '' : 'rotate-180'} />
            {trend.value}%
          </div>
        )}
      </div>
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-3xl font-bold" style={{ color: bgColor }}>{count}</div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-4 hover:border-indigo-500/50 transition-all cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
            {order.title}
          </h3>
          {order.priority && (
            <span className={`text-xs ${getPriorityColor(order.priority)}`}>
              ●
            </span>
          )}
        </div>
        {order.category && (
          <p className="text-xs text-gray-500">{order.category}</p>
        )}
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
        {getStatusLabel(order.status)}
      </span>
    </div>
    
    <div className="mb-3">
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>Progress</span>
        <span className="font-medium">{order.progress}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${order.progress}%` }}
        />
      </div>
    </div>
    
    <div className="flex justify-between items-center text-xs text-gray-500">
      <div className="flex items-center gap-1">
        <Calendar size={12} />
        <span>{formatDate(order.dueDate)}</span>
      </div>
      <span>Updated {order.lastUpdate}</span>
    </div>
  </div>
);

interface UpdateCardProps {
  update: Update;
}

const UpdateCard: React.FC<UpdateCardProps> = ({ update }) => {
  const Icon = update.icon;
  const updateTypeColors: Record<UpdateType, string> = {
    completed: 'bg-green-500/20 text-green-400',
    progress: 'bg-blue-500/20 text-blue-400',
    message: 'bg-indigo-500/20 text-indigo-400',
    review: 'bg-purple-500/20 text-purple-400',
    warning: 'bg-yellow-500/20 text-yellow-400'
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-900/50 border border-gray-700/30 rounded-lg hover:border-gray-600/50 transition-all group">
      <div className={`flex-shrink-0 w-10 h-10 ${updateTypeColors[update.type]} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon width={20} height={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300 leading-relaxed">{update.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">{update.time}</p>
          {update.actionable && update.actionUrl && (
            <>
              <span className="text-gray-600">•</span>
              <button 
                onClick={() => console.log('Navigate to:', update.actionUrl)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View Details
                <ChevronRight size={12} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface QuickActionCardProps {
  action: QuickAction;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ action }) => {
  const Icon = action.icon;
  const variantStyles = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25'
  };

  return (
    <button
      onClick={action.action}
      className={`${variantStyles[action.variant]} p-4 rounded-xl flex items-center gap-3 transition-all group w-full text-left`}
    >
      <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon width={24} height={24} />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold mb-0.5">{action.label}</h4>
        <p className="text-xs opacity-80">{action.description}</p>
      </div>
      <ChevronRight size={20} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UserOverview: React.FC = () => {
  const [userName] = useState('Alex');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | OrderStatus>('all');

  const [activeOrders] = useState<Order[]>([
    { 
      id: 1, 
      title: 'E-commerce Website Development', 
      category: 'Web Development',
      status: 'in_progress', 
      progress: 65, 
      dueDate: '2025-01-15', 
      lastUpdate: '2 hours ago',
      priority: 'high',
      assignedTo: 'Dev Team A'
    },
    { 
      id: 2, 
      title: 'Mobile App UI/UX Design', 
      category: 'Design',
      status: 'review', 
      progress: 90, 
      dueDate: '2025-01-10', 
      lastUpdate: '1 day ago',
      priority: 'urgent'
    },
    { 
      id: 3, 
      title: 'API Integration Service', 
      category: 'Backend',
      status: 'pending', 
      progress: 20, 
      dueDate: '2025-01-20', 
      lastUpdate: '3 days ago',
      priority: 'medium'
    }
  ]);

  const [allOrders] = useState<Order[]>([
    { 
      id: 1, 
      title: 'E-commerce Website Development', 
      category: 'Web Development',
      status: 'in_progress', 
      progress: 65, 
      dueDate: '2025-01-15', 
      lastUpdate: '2 hours ago',
      priority: 'high',
      assignedTo: 'Dev Team A'
    },
    { 
      id: 2, 
      title: 'Mobile App UI/UX Design', 
      category: 'Design',
      status: 'review', 
      progress: 90, 
      dueDate: '2025-01-10', 
      lastUpdate: '1 day ago',
      priority: 'urgent'
    },
    { 
      id: 3, 
      title: 'API Integration Service', 
      category: 'Backend',
      status: 'pending', 
      progress: 20, 
      dueDate: '2025-01-20', 
      lastUpdate: '3 days ago',
      priority: 'medium'
    },
    { 
      id: 4, 
      title: 'Database Migration', 
      category: 'DevOps',
      status: 'completed', 
      progress: 100, 
      dueDate: '2024-12-01', 
      lastUpdate: '5 days ago',
      priority: 'high'
    },
    { 
      id: 5, 
      title: 'SEO Optimization', 
      category: 'Marketing',
      status: 'completed', 
      progress: 100, 
      dueDate: '2024-11-28', 
      lastUpdate: '1 week ago',
      priority: 'low'
    }
  ]);

  const [recentUpdates] = useState<Update[]>([
    { 
      id: 1, 
      type: 'completed', 
      message: 'Admin marked "Database Migration" as completed. All deliverables are now available for download.', 
      time: '5 days ago',
      timestamp: new Date('2024-12-02'),
      orderId: 4,
      icon: CheckCircle,
      actionable: true,
      actionUrl: '/dashboard/user/orders/4'
    },
    { 
      id: 2, 
      type: 'progress', 
      message: 'Your "E-commerce Website" project moved to testing phase. Initial QA results look promising.', 
      time: '2 days ago',
      timestamp: new Date('2024-12-05'),
      orderId: 1,
      icon: Clock,
      actionable: true,
      actionUrl: '/dashboard/user/orders/1'
    },
    { 
      id: 3, 
      type: 'message', 
      message: 'New message from support team regarding API endpoint configuration for your project.', 
      time: '3 days ago',
      timestamp: new Date('2024-12-04'),
      orderId: 3,
      icon: MessageSquare,
      actionable: true,
      actionUrl: '/dashboard/user/support'
    },
    { 
      id: 4, 
      type: 'review', 
      message: 'Mobile App design submitted for your review. Please provide feedback within 48 hours.', 
      time: '1 day ago',
      timestamp: new Date('2024-12-06'),
      orderId: 2,
      icon: AlertCircle,
      actionable: true,
      actionUrl: '/dashboard/user/orders/2'
    }
  ]);

  const stats: DashboardStats = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    inProgress: allOrders.filter(o => o.status === 'in_progress').length,
    review: allOrders.filter(o => o.status === 'review').length,
    completed: allOrders.filter(o => o.status === 'completed').length,
    totalSpent: 15750,
    avgCompletionTime: 14
  };

  const quickActions: QuickAction[] = [
    {
      id: 'new-order',
      label: 'New Order',
      description: 'Start a new project request',
      icon: Plus,
      action: () => console.log('Navigate to new order'),
      variant: 'primary'
    },
    {
      id: 'view-all',
      label: 'View All Orders',
      description: 'See your complete order history',
      icon: Package,
      action: () => console.log('Navigate to all orders'),
      variant: 'secondary'
    },
    {
      id: 'contact-support',
      label: 'Contact Support',
      description: 'Get help from our team',
      icon: MessageSquare,
      action: () => console.log('Navigate to support'),
      variant: 'secondary'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = selectedFilter === 'all' 
    ? activeOrders 
    : activeOrders.filter(o => o.status === selectedFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your projects today
            </p>
          </div>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:scale-105">
            <Plus size={20} />
            New Order
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Pending" 
            count={stats.pending} 
            color="yellow" 
            icon={Clock}
            trend={{ value: 12, isPositive: false }}
          />
          <StatCard 
            label="In Progress" 
            count={stats.inProgress} 
            color="blue" 
            icon={Activity}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard 
            label="Under Review" 
            count={stats.review} 
            color="purple" 
            icon={AlertCircle}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard 
            label="Completed" 
            count={stats.completed} 
            color="green" 
            icon={CheckCircle}
            trend={{ value: 22, isPositive: true }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map(action => (
            <QuickActionCard key={action.id} action={action} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Orders */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package size={24} className="text-indigo-400" />
                Active Orders
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({filteredOrders.length})
                </span>
              </h2>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilter('in_progress')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedFilter === 'in_progress'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setSelectedFilter('review')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedFilter === 'review'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Review
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order}
                    onClick={() => console.log(`View order ${order.id}`)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">No orders found with this filter</p>
                </div>
              )}
            </div>

            {activeOrders.length > 3 && (
              <button
                onClick={() => console.log('View all orders')}
                className="mt-4 flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium text-sm group w-full"
              >
                View All Orders
                <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Recent Updates */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock size={24} className="text-indigo-400" />
              Recent Updates
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recentUpdates.map(update => (
                <UpdateCard key={update.id} update={update} />
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-indigo-400" />
              Project Insights
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400 text-sm">Total Projects</span>
                <span className="text-white font-bold">{allOrders.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400 text-sm">Avg. Completion</span>
                <span className="text-white font-bold">{stats.avgCompletionTime} days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400 text-sm">Total Invested</span>
                <span className="text-white font-bold">${stats.totalSpent?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-yellow-400" />
              Action Required
            </h3>
            <div className="space-y-3">
              {recentUpdates.filter(u => u.actionable).slice(0, 2).map(update => (
                <button
                  key={update.id}
                  onClick={() => console.log('Navigate to:', update.actionUrl)}
                  className="block p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-all border border-gray-700/30 hover:border-indigo-500/50 group w-full text-left"
                >
                  <p className="text-sm text-gray-300 mb-1 line-clamp-2 group-hover:text-white transition-colors">
                    {update.message}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{update.time}</span>
                    <span className="text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                      View
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;