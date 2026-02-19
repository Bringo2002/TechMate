import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, UserCheck, Clock, Shield, Search, UserPlus, 
  Check, X, AlertTriangle, CheckCircle, XCircle, ArrowUpDown,
  Download, Undo
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  avatar: string;
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  lastActive: string;
}

type SortField = 'name' | 'email' | 'role' | 'status' | 'joinedAt' | 'lastActive';
type SortDirection = 'asc' | 'desc';

export default function TeamManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('developer');
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error'; action?: () => void }>({
    show: false,
    message: '',
    type: 'success',
    action: undefined,
  });
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'admin' | 'developer' | 'viewer'>('all');

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Brian Mwangi', email: 'brian@nyxdev.com', role: 'owner', avatar: 'BM', status: 'active', joinedAt: '2023-01-15', lastActive: '2 hours ago' },
    { id:  '2', name: 'Sarah Chen', email: 'sarah@nyxdev.com', role: 'admin', avatar: 'SC', status: 'active', joinedAt: '2023-03-20', lastActive: '1 day ago' },
    { id:  '3', name: 'Alex Kim', email: 'alex@nyxdev.com', role: 'developer', avatar: 'AK', status: 'active', joinedAt: '2023-06-10', lastActive: '3 hours ago' },
    { id:  '4', name: 'Maria Garcia', email: 'maria@nyxdev.com', role: 'developer', avatar: 'MG', status: 'active', joinedAt: '2023-08-15', lastActive: '5 hours ago' },
    { id: '5', name: 'James Wilson', email: 'james@nyxdev.com', role: 'viewer', avatar: 'JW', status: 'pending', joinedAt: '2024-01-03', lastActive: 'Never' }
  ]);

  const showNotif = useCallback((message: string, type: 'success' | 'error', action?: () => void) => {
    setNotification({ show: true, message, type, action: action || (() => { return undefined; }) });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success', action: () => undefined }), 5000);
  }, []);

  const handleInvite = () => {
    if (!inviteEmail || !inviteName) {
      showNotif('Please fill in all fields', 'error');
      return;
    }
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      avatar: inviteName.split(' ').map(n => n[0]).join('').toUpperCase(),
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: 'Never'
    };
    setTeamMembers([...teamMembers, newMember]);
    showNotif(`Invitation sent to ${inviteEmail}`, 'success', () => {
      setTeamMembers(prev => prev.filter(m => m.id !== newMember.id));
    });
    setShowInviteMember(false);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('developer');
  };

  const handleRoleChange = (memberId: string, newRole: 'admin' | 'developer' | 'viewer') => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    const oldRole = member.role;
    setTeamMembers(teamMembers.map(m => m.id === memberId ? { ... m, role: newRole } :  m));
    showNotif(`Role updated for ${member.name}`, 'success', () => {
      setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: oldRole as 'admin' | 'developer' | 'viewer' } :  m));
    });
  };

  const handleToggleStatus = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    const oldStatus = member.status;
    const newStatus:  'active' | 'suspended' = member.status === 'active' ?  'suspended' : 'active';
    setTeamMembers(teamMembers.map(m => m.id === memberId ? { ... m, status: newStatus } :  m));
    showNotif(`${member.name} ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}`, 'success', () => {
      setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: oldStatus } : m));
    });
  };

  const handleRemoveMember = () => {
    if (! selectedMember) return;
    const removedMember = { ...selectedMember }; // Create a copy to avoid reference issues
    setTeamMembers(teamMembers.filter(m => m.id !== selectedMember.id));
    showNotif(`${selectedMember.name} removed from team`, 'success', () => {
      setTeamMembers(prev => [... prev, removedMember]);
    });
    setShowDeleteConfirm(false);
    setSelectedMember(null);
  };

  const handleResend = (memberId: string) => {
    const member = teamMembers. find(m => m.id === memberId);
    if (!member) return;
    showNotif(`Invitation resent to ${member.email}`, 'success');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ?  'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'Joined', 'Last Active'],
      ... filteredAndSortedMembers.map(m => [m.name, m.email, m.role, m.status, m.joinedAt, m.lastActive])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document. createElement('a');
    a.href = url;
    a. download = `team-members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotif('Team members exported successfully', 'success');
  };

  const filteredAndSortedMembers = (() => {
    const filtered = teamMembers. filter(m => {
      const matchesSearch = m.name. toLowerCase().includes(searchQuery.toLowerCase()) ||
                           m.email.toLowerCase().includes(searchQuery. toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesRole = roleFilter === 'all' || m.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });

    return filtered.sort((a, b) => {
      let aVal:  string | number = a[sortField];
      let bVal: string | number = b[sortField];
      
      if (sortField === 'joinedAt') {
        aVal = new Date(a.joinedAt).getTime();
        bVal = new Date(b.joinedAt).getTime();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  })();

  const stats = useMemo(() => ({
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    pending: teamMembers.filter(m => m.status === 'pending').length,
    admins: teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length
  }), [teamMembers]);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-500">Total</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{stats.total}</div>
          <div className="text-xs text-zinc-500 mt-1">Team Members</div>
        </div>
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-zinc-500">Status</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
          <div className="text-xs text-zinc-500 mt-1">Active</div>
        </div>
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-zinc-500">Status</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
          <div className="text-xs text-zinc-500 mt-1">Pending</div>
        </div>
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-zinc-500">Roles</span>
          </div>
          <div className="text-2xl font-bold text-violet-400">{stats.admins}</div>
          <div className="text-xs text-zinc-500 mt-1">Admins</div>
        </div>
      </div>

      {/* Search, Filters and Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-800 hover: bg-zinc-900 text-zinc-300 rounded-md text-sm font-medium transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowInviteMember(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="border border-zinc-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-900">
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-xs font-medium text-zinc-400 uppercase hover:text-zinc-200 transition-colors"
                  >
                    Member
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1 text-xs font-medium text-zinc-400 uppercase hover:text-zinc-200 transition-colors"
                  >
                    Role
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 text-xs font-medium text-zinc-400 uppercase hover:text-zinc-200 transition-colors"
                  >
                    Status
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => handleSort('lastActive')}
                    className="flex items-center gap-1 text-xs font-medium text-zinc-400 uppercase hover:text-zinc-200 transition-colors"
                  >
                    Last Active
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button 
                    onClick={() => handleSort('joinedAt')}
                    className="flex items-center gap-1 text-xs font-medium text-zinc-400 uppercase hover:text-zinc-200 transition-colors"
                  >
                    Joined
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredAndSortedMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-zinc-700" />
                      <p className="text-sm text-zinc-500">No team members found</p>
                      <p className="text-xs text-zinc-600">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white">
                          {m.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-100">{m.name}</div>
                          <div className="text-xs text-zinc-500">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {m.role === 'owner' ?  (
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-violet-900/30 text-violet-300 border border-violet-800/50">
                          Owner
                        </span>
                      ) : (
                        <select 
                          value={m.role} 
                          onChange={(e) => handleRoleChange(m.id, e.target.value as 'admin' | 'developer' | 'viewer')} 
                          disabled={m.status === 'suspended'} 
                          className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-xs font-medium text-zinc-300 focus:outline-none focus: ring-2 focus:ring-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Change role for team member"
                        >
                          <option value="admin">Admin</option>
                          <option value="developer">Developer</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                        m.status === 'active' ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50' :
                        m.status === 'pending' ? 'bg-amber-900/30 text-amber-300 border border-amber-800/50' :
                        'bg-red-900/30 text-red-300 border border-red-800/50'
                      }`}>
                        <div className={`w-1. 5 h-1.5 rounded-full ${m.status === 'active' ?  'bg-emerald-500' : m.status === 'pending' ?  'bg-amber-500' : 'bg-red-500'}`} />
                        {m.status. charAt(0).toUpperCase() + m.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-400">{m.lastActive}</td>
                    <td className="px-4 py-4 text-sm text-zinc-400">{m.joinedAt}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {m.status === 'pending' && (
                          <button 
                            onClick={() => handleResend(m.id)} 
                            className="px-2.5 py-1 border border-zinc-800 hover: bg-zinc-900 rounded text-xs font-medium text-zinc-300 transition-all"
                          >
                            Resend
                          </button>
                        )}
                        {m.role !== 'owner' && (
                          <>
                            <button 
                              onClick={() => handleToggleStatus(m.id)} 
                              className={`px-2.5 py-1 border rounded text-xs font-medium transition-all ${
                                m. status === 'active' ? 'border-amber-800/50 text-amber-400 hover:bg-amber-950/50' :  'border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/50'
                              }`}
                            >
                              {m. status === 'active' ? 'Suspend' : 'Restore'}
                            </button>
                            <button 
                              onClick={() => { setSelectedMember(m); setShowDeleteConfirm(true); }} 
                              className="px-2.5 py-1 border border-red-900/50 text-red-400 hover:bg-red-950/50 rounded text-xs font-medium transition-all"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      {filteredAndSortedMembers. length > 0 && filteredAndSortedMembers. length !== teamMembers.length && (
        <div className="text-sm text-zinc-500 text-center">
          Showing {filteredAndSortedMembers.length} of {teamMembers.length} members
        </div>
      )}

      {/* Roles & Permissions */}
      <div className="space-y-4">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Roles & Permissions</h3>
          <p className="text-sm text-zinc-500">Understanding access levels</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { role: 'Owner', perms: ['Full system access', 'Manage billing', 'Delete workspace', 'Transfer ownership'] },
            { role:  'Admin', perms: ['Manage team', 'Change roles', 'View projects', 'Configure settings'] },
            { role:  'Developer', perms: ['Create projects', 'Deploy apps', 'View activity', 'Manage own resources'] },
            { role: 'Viewer', perms: ['View projects', 'View deployments', 'Read-only access', 'No modifications'] }
          ].map((i) => (
            <div key={i.role} className="p-4 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
              <div className="text-xs font-semibold text-violet-400 mb-3">{i.role}</div>
              <ul className="space-y-2">
                {i.perms.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                    <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteMember && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowInviteMember(false)}
        >
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-100">Invite Team Member</h2>
              <button 
                onClick={() => setShowInviteMember(false)} 
                className="p-1 hover:bg-zinc-900 rounded transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-100 mb-2">Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Doe"
                  onKeyDown={(e) => e.key === 'Enter' && document.getElementById('invite-email')?.focus()}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus: ring-2 focus:ring-violet-500 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-100 mb-2">Email</label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john@company.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-100 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  aria-label="Select role for the new team member"
                >
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowInviteMember(false)} 
                className="flex-1 px-4 py-2 border border-zinc-800 hover: bg-zinc-900 rounded-md text-sm font-medium text-zinc-300 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleInvite} 
                className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedMember && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}
        >
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 bg-red-900/20 border border-red-800/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Remove Team Member</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Are you sure you want to remove {selectedMember.name}? This action cannot be undone. 
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowDeleteConfirm(false); setSelectedMember(null); }} 
                className="flex-1 px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-md text-sm font-medium text-zinc-300 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleRemoveMember} 
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications with Undo */}
      {notification. show && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] ${
            notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-800/50 text-emerald-100' : 
            'bg-red-900/90 border-red-800/50 text-red-100'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> :  <XCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium flex-1">{notification.message}</span>
            {notification.action && (
              <button
                onClick={() => {
                  notification.action?. ();
                  setNotification({ show: false, message: '', type: 'success' });
                }}
                className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
              >
                <Undo className="w-3 h-3" />
                Undo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}