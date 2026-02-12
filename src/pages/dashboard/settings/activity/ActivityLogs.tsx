import React, { useState } from 'react';
import { Search, Download, CheckCircle, AlertTriangle, XCircle, Filter, Calendar } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ip: string;
  type: 'success' | 'warning' | 'error';
}

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'success' | 'warning' | 'error'>('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const [auditLogs] = useState<AuditLog[]>([
    { id: '1', action: 'User Role Changed', user: 'brian@nyxdev.com', timestamp: '2024-01-08 14:32', details: 'Changed Alex Kim role from Viewer to Developer', ip: '102.68.79.12', type: 'success' },
    { id: '2', action: 'Team Member Invited', user: 'brian@nyxdev.com', timestamp: '2024-01-08 10:15', details: 'Invited james@nyxdev.com as Viewer', ip: '102.68.79.12', type: 'success' },
    { id: '3', action: 'Access Revoked', user: 'sarah@nyxdev.com', timestamp: '2024-01-07 16:45', details: 'Suspended user john@nyxdev.com', ip: '102.68.79.15', type: 'warning' },
    { id: '4', action: 'Failed Login Attempt', user: 'unknown@external.com', timestamp: '2024-01-07 09:22', details: 'Multiple failed login attempts detected', ip: '185.220.101.42', type: 'error' },
    { id: '5', action: 'Profile Updated', user: 'maria@nyxdev.com', timestamp: '2024-01-06 11:30', details: 'Updated profile information', ip: '102.68.79.18', type: 'success' },
    { id: '6', action: 'API Key Generated', user: 'brian@nyxdev.com', timestamp: '2024-01-06 09:15', details: 'Created new production API key', ip: '102.68.79.12', type: 'success' },
    { id: '7', action: 'Session Revoked', user: 'sarah@nyxdev.com', timestamp: '2024-01-05 18:20', details: 'Revoked session from iPhone device', ip: '102.68.79.15', type: 'warning' },
    { id: '8', action: 'Password Changed', user: 'alex@nyxdev.com', timestamp: '2024-01-05 14:10', details: 'Successfully changed account password', ip: '102.68.79.20', type: 'success' },
    { id: '9', action: 'Unauthorized Access', user: 'unknown@external.com', timestamp: '2024-01-04 22:45', details: 'Attempted access to restricted resource', ip: '185.220.101.42', type: 'error' },
    { id: '10', action: 'Notification Settings Updated', user: 'maria@nyxdev.com', timestamp: '2024-01-04 16:30', details: 'Modified email notification preferences', ip: '102.68.79.18', type: 'success' }
  ]);

  const showNotif = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'User', 'Details', 'IP Address', 'Type'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.action,
        log.user,
        log.details,
        log.ip,
        log.type
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotif('Activity logs exported successfully', 'success');
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || log.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-900/20 border-emerald-800/50';
      case 'warning':
        return 'bg-amber-900/20 border-amber-800/50';
      case 'error':
        return 'bg-red-900/20 border-red-800/50';
      default:
        return 'bg-emerald-900/20 border-emerald-800/50';
    }
  };

  const stats = {
    total: auditLogs.length,
    success: auditLogs.filter(l => l.type === 'success').length,
    warning: auditLogs.filter(l => l.type === 'warning').length,
    error: auditLogs.filter(l => l.type === 'error').length
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Total Events</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{stats.total}</div>
        </div>
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Successful</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.success}</div>
        </div>
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.warning}</div>
        </div>
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Errors</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.error}</div>
        </div>
      </div>

      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 mb-1">Activity Logs</h3>
          <p className="text-sm text-zinc-500">Track all account activity and changes</p>
        </div>
        <button 
          onClick={handleExportLogs}
          className="flex items-center gap-2 px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-md text-sm font-medium text-zinc-300 transition-all"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search activity logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === 'all' 
                ? 'bg-violet-600 text-white' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('success')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === 'success' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === 'warning' 
                ? 'bg-amber-600 text-white' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setFilterType('error')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === 'error' 
                ? 'bg-red-600 text-white' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            Errors
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center border border-zinc-900 rounded-lg">
            <p className="text-zinc-500">No activity logs found matching your filters</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg border ${getTypeBgColor(log.type)}`}>
                    {getTypeIcon(log.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-100">{log.action}</div>
                    <div className="text-sm text-zinc-400 mt-1">{log.details}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-zinc-500">{log.user}</span>
                      <span className="text-xs text-zinc-600">•</span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {log.timestamp}
                      </span>
                      <span className="text-xs text-zinc-600">•</span>
                      <span className="text-xs text-zinc-500">{log.ip}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
          <div className="text-sm text-zinc-500">
            Showing {filteredLogs.length} of {auditLogs.length} events
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 rounded-md text-sm font-medium text-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 rounded-md text-sm font-medium text-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notification.show && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${
            notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-800/50 text-emerald-100' :
            'bg-red-900/90 border-red-800/50 text-red-100'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}