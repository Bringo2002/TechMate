import React from 'react';
import { Plus, FileText } from 'lucide-react';

interface Order {
  id: number;
  title: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  progress: number;
  dueDate: string;
  lastUpdate: string;
}

const UserOrders: React.FC = () => {
  const allOrders: Order[] = [
    { id: 1, title: 'E-commerce Website Development', status: 'in_progress', progress: 65, dueDate: '2025-01-15', lastUpdate: '2 hours ago' },
    { id: 2, title: 'Mobile App UI/UX Design', status: 'review', progress: 90, dueDate: '2025-01-10', lastUpdate: '1 day ago' },
    { id: 3, title: 'API Integration Service', status: 'pending', progress: 20, dueDate: '2025-01-20', lastUpdate: '3 days ago' },
    { id: 4, title: 'Database Migration', status: 'completed', progress: 100, dueDate: '2024-12-01', lastUpdate: '5 days ago' },
    { id: 5, title: 'SEO Optimization', status: 'completed', progress: 100, dueDate: '2024-11-28', lastUpdate: '1 week ago' }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Orders</h1>
          <p className="text-gray-400 mt-1">Track all your projects and requests</p>
        </div>
        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
          <Plus size={20} />
          Create Order
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allOrders.map(order => (
          <div key={order.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-indigo-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">{order.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Order #{order.id.toString().padStart(6, '0')}</p>
              </div>
              <button className="text-indigo-400 hover:text-indigo-300 font-medium text-sm">
                View Details →
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
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

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Due Date: <span className="text-white">{order.dueDate}</span></span>
                <span className="text-gray-400">Last Update: <span className="text-white">{order.lastUpdate}</span></span>
              </div>
              {order.status === 'completed' && (
                <button className="text-green-400 hover:text-green-300 font-medium flex items-center gap-1">
                  <FileText size={16} />
                  Download Files
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrders;
