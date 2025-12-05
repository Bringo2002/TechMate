import React from 'react';
import { Plus, Package, Clock, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';

interface Order {
  id: number;
  title: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  progress: number;
  dueDate: string;
  lastUpdate: string;
}

const UserOverview: React.FC = () => {
  const userName = 'Alex';

  const activeOrders: Order[] = [
    { id: 1, title: 'E-commerce Website Development', status: 'in_progress', progress: 65, dueDate: '2025-01-15', lastUpdate: '2 hours ago' },
    { id: 2, title: 'Mobile App UI/UX Design', status: 'review', progress: 90, dueDate: '2025-01-10', lastUpdate: '1 day ago' },
    { id: 3, title: 'API Integration Service', status: 'pending', progress: 20, dueDate: '2025-01-20', lastUpdate: '3 days ago' }
  ];

  const allOrders: Order[] = [
    ...activeOrders,
    { id: 4, title: 'Database Migration', status: 'completed', progress: 100, dueDate: '2024-12-01', lastUpdate: '5 days ago' },
    { id: 5, title: 'SEO Optimization', status: 'completed', progress: 100, dueDate: '2024-11-28', lastUpdate: '1 week ago' }
  ];

  const recentUpdates = [
    { id: 1, type: 'completed', message: 'Admin marked "Database Migration" as completed', time: '5 days ago', icon: CheckCircle },
    { id: 2, type: 'progress', message: 'Your "E-commerce Website" project moved to testing phase', time: '2 days ago', icon: Clock },
    { id: 3, type: 'message', message: 'New message from support regarding your API project', time: '3 days ago', icon: MessageSquare },
    { id: 4, type: 'review', message: 'Mobile App design submitted for your review', time: '1 day ago', icon: AlertCircle }
  ];

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      review: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[status] || '';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      review: 'Under Review',
      completed: 'Completed'
    };
    return labels[status] || status;
  };

  const stats = [
    { label: 'Pending', count: allOrders.filter(o => o.status === 'pending').length, color: 'yellow' },
    { label: 'In Progress', count: allOrders.filter(o => o.status === 'in_progress').length, color: 'blue' },
    { label: 'Under Review', count: allOrders.filter(o => o.status === 'review').length, color: 'purple' },
    { label: 'Completed', count: allOrders.filter(o => o.status === 'completed').length, color: 'green' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {userName}!</h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your projects</p>
        </div>
        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
          <Plus size={20} />
          New Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">{stat.label}</div>
            <div className={`text-3xl font-bold text-${stat.color}-400`}>{stat.count}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package size={24} className="text-indigo-400" />
            Active Orders
          </h2>
          <div className="space-y-4">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-4 hover:border-indigo-500/50 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white">{order.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{order.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Due: {order.dueDate}</span>
                  <span>Updated {order.lastUpdate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={24} className="text-indigo-400" />
            Recent Updates
          </h2>
          <div className="space-y-3">
            {recentUpdates.map(update => {
              const Icon = update.icon;
              return (
                <div key={update.id} className="flex items-start gap-3 p-3 bg-gray-900/50 border border-gray-700/30 rounded-lg hover:border-gray-600/50 transition-all">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">{update.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{update.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOverview;