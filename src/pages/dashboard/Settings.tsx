import React, { useState } from 'react';
import supabase from '../../lib/supabaseClient';
import {
  Settings, User, Bell, Shield, Clock, Users, Save, X, Check, Info, 
  CheckCircle, XCircle, Search, UserPlus, UserCheck, Laptop, Smartphone,
  Download, AlertTriangle, Activity, Trash2
} from 'lucide-react';
import { DeleteAccountButton } from '../../components/Buttons/DeleteAccountButton';

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

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ip: string;
  type: 'success' | 'warning' | 'error';
}

export default function AdminSettings() {
  const [selectedCategory, setSelectedCategory] = useState('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);  
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('developer');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Brian Mwangi', email: 'brian@nyxdev.com', role: 'owner', avatar: 'BM', status: 'active', joinedAt: '2023-01-15', lastActive: '2 hours ago' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@nyxdev.com', role: 'admin', avatar: 'SC', status: 'active', joinedAt: '2023-03-20', lastActive: '1 day ago' },
    { id: '3', name: 'Alex Kim', email: 'alex@nyxdev.com', role: 'developer', avatar: 'AK', status: 'active', joinedAt: '2023-06-10', lastActive: '3 hours ago' },
    { id: '4', name: 'Maria Garcia', email: 'maria@nyxdev.com', role: 'developer', avatar: 'MG', status: 'active', joinedAt: '2023-08-15', lastActive: '5 hours ago' },
    { id: '5', name: 'James Wilson', email: 'james@nyxdev.com', role: 'viewer', avatar: 'JW', status: 'pending', joinedAt: '2024-01-03', lastActive: 'Never' }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', action: 'User Role Changed', user: 'brian@nyxdev.com', timestamp: '2024-01-08 14:32', details: 'Changed Alex Kim role from Viewer to Developer', ip: '102.68.79.12', type: 'success' },
    { id: '2', action: 'Team Member Invited', user: 'brian@nyxdev.com', timestamp: '2024-01-08 10:15', details: 'Invited james@nyxdev.com as Viewer', ip: '102.68.79.12', type: 'success' },
    { id: '3', action: 'Access Revoked', user: 'sarah@nyxdev.com', timestamp: '2024-01-07 16:45', details: 'Suspended user john@nyxdev.com', ip: '102.68.79.15', type: 'warning' },
    { id: '4', action: 'Failed Login Attempt', user: 'unknown@external.com', timestamp: '2024-01-07 09:22', details: 'Multiple failed login attempts detected', ip: '185.220.101.42', type: 'error' },
    { id: '5', action: 'Profile Updated', user: 'maria@nyxdev.com', timestamp: '2024-01-06 11:30', details: 'Updated profile information', ip: '102.68.79.18', type: 'success' }
  ]);

  const showNotif = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

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
    setAuditLogs([{
      id: Date.now().toString(),
      action: 'Team Member Invited',
      user: 'brian@nyxdev.com',
      timestamp: new Date().toLocaleString(),
      details: `Invited ${inviteEmail} as ${inviteRole}`,
      ip: '102.68.79.12',
      type: 'success'
    }, ...auditLogs]);
    showNotif(`Invitation sent to ${inviteEmail}`, 'success');
    setShowInviteMember(false);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('developer');
  };

 
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Call the database function to delete the account
      const { error } = await supabase.rpc('delete_own_account');
      
      if (error) throw error;
  
      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/goodbye';
      
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleRoleChange = (memberId: string, newRole: 'admin' | 'developer' | 'viewer') => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    setTeamMembers(teamMembers.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    setAuditLogs([{
      id: Date.now().toString(),
      action: 'User Role Changed',
      user: 'brian@nyxdev.com',
      timestamp: new Date().toLocaleString(),
      details: `Changed ${member.name} role from ${member.role} to ${newRole}`,
      ip: '102.68.79.12',
      type: 'success'
    }, ...auditLogs]);
    showNotif(`Role updated for ${member.name}`, 'success');
  };

  const handleToggleStatus = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    const newStatus = member.status === 'active' ? 'suspended' : 'active';
    setTeamMembers(teamMembers.map(m => m.id === memberId ? { ...m, status: newStatus } : m));
    setAuditLogs([{
      id: Date.now().toString(),
      action: newStatus === 'suspended' ? 'Access Revoked' : 'Access Restored',
      user: 'brian@nyxdev.com',
      timestamp: new Date().toLocaleString(),
      details: `${newStatus === 'suspended' ? 'Suspended' : 'Restored'} user ${member.email}`,
      ip: '102.68.79.12',
      type: newStatus === 'suspended' ? 'warning' : 'success'
    }, ...auditLogs]);
    showNotif(`${member.name} ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}`, 'success');
  };

  const handleResend = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    setAuditLogs([{
      id: Date.now().toString(),
      action: 'Invitation Resent',
      user: 'brian@nyxdev.com',
      timestamp: new Date().toLocaleString(),
      details: `Resent invitation to ${member.email}`,
      ip: '102.68.79.12',
      type: 'success'
    }, ...auditLogs]);
    showNotif(`Invitation resent to ${member.email}`, 'success');
  };

  const handleSaveChanges = () => {
    showNotif('Settings saved successfully', 'success');
    setHasChanges(false);
  };

  const handleExportLogs = () => {
    showNotif('Activity logs exported', 'success');
  };

  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(l =>
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: 'team', name: 'Team Management', icon: Users, badge: teamMembers.length },
    { id: 'profile', name: 'Profile', icon: User, badge: null },
    { id: 'security', name: 'Security', icon: Shield, badge: null },
    { id: 'notifications', name: 'Notifications', icon: Bell, badge: null },
    { id: 'logs', name: 'Activity Logs', icon: Activity, badge: auditLogs.length }
  ];

  const renderTeam = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-500">Total</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{teamMembers.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Team Members</div>
        </div>
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-zinc-500">Status</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{teamMembers.filter(m => m.status === 'active').length}</div>
          <div className="text-xs text-zinc-500 mt-1">Active</div>
        </div>
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-zinc-500">Status</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">{teamMembers.filter(m => m.status === 'pending').length}</div>
          <div className="text-xs text-zinc-500 mt-1">Pending</div>
        </div>
        <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-zinc-500">Roles</span>
          </div>
          <div className="text-2xl font-bold text-violet-400">{teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}</div>
          <div className="text-xs text-zinc-500 mt-1">Admins</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>
        <button onClick={() => setShowInviteMember(true)} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="border border-zinc-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-900">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Last Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white">{m.avatar}</div>
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{m.name}</div>
                        <div className="text-xs text-zinc-500">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {m.role === 'owner' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-violet-900/30 text-violet-300 border border-violet-800/50">Owner</span>
                    ) : (
                      <select title="Change role" value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value as any)} disabled={m.status === 'suspended'} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-xs font-medium text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all">
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
                      <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : m.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-400">{m.lastActive}</td>
                  <td className="px-4 py-4 text-sm text-zinc-400">{m.joinedAt}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {m.status === 'pending' && (
                        <button onClick={() => handleResend(m.id)} className="px-2.5 py-1 border border-zinc-800 hover:bg-zinc-900 rounded text-xs font-medium text-zinc-300 transition-all">Resend</button>
                      )}
                      {m.role !== 'owner' && (
                        <>
                          <button onClick={() => handleToggleStatus(m.id)} className={`px-2.5 py-1 border rounded text-xs font-medium transition-all ${
                            m.status === 'active' ? 'border-amber-800/50 text-amber-400 hover:bg-amber-950/50' : 'border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/50'
                          }`}>{m.status === 'active' ? 'Suspend' : 'Restore'}</button>
                          <button onClick={() => { setSelectedMember(m); setShowDeleteConfirm(true); }} className="px-2.5 py-1 border border-red-900/50 text-red-400 hover:bg-red-950/50 rounded text-xs font-medium transition-all">Remove</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Roles & Permissions</h3>
          <p className="text-sm text-zinc-500">Understanding access levels</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { role: 'Owner', perms: ['Full system access', 'Manage billing', 'Delete workspace', 'Transfer ownership'] },
            { role: 'Admin', perms: ['Manage team', 'Change roles', 'View projects', 'Configure settings'] },
            { role: 'Developer', perms: ['Create projects', 'Deploy apps', 'View activity', 'Manage own resources'] },
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
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Profile Information</h3>
          <p className="text-sm text-zinc-500">Manage your personal information</p>
        </div>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-zinc-100">Full Name</label>
              <p className="text-sm text-zinc-500">Your display name</p>
            </div>
            <input type="text" defaultValue="Brian Mwangi" onChange={() => setHasChanges(true)} className="w-80 px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
          </div>
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-zinc-100">Email</label>
              <p className="text-sm text-zinc-500">Your primary email</p>
            </div>
            <input type="email" defaultValue="brian@nyxdev.com" onChange={() => setHasChanges(true)} className="w-80 px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
          </div>
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-zinc-100">Company</label>
              <p className="text-sm text-zinc-500">Your organization</p>
            </div>
            <input type="text" defaultValue="NyxDev Technologies" onChange={() => setHasChanges(true)} className="w-80 px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Preferences</h3>
          <p className="text-sm text-zinc-500">Customize your experience</p>
        </div>
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Theme</label>
            <p className="text-sm text-zinc-500">Choose your interface theme</p>
          </div>
          <div className="flex gap-2">
            {['Light', 'Dark', 'System'].map((t) => (
              <button key={t} onClick={() => setHasChanges(true)} className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${t === 'Dark' ? 'bg-violet-600 border-violet-600 text-white' : 'bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Language</label>
            <p className="text-sm text-zinc-500">Interface language</p>
          </div>
          <select title="Language Selector" onChange={() => setHasChanges(true)} className="w-80 px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Swahili</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Authentication</h3>
          <p className="text-sm text-zinc-500">Manage your login credentials</p>
        </div>
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Password</label>
            <p className="text-sm text-zinc-500">Last changed 3 months ago</p>
          </div>
          <button className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-md text-sm font-medium text-zinc-300 transition-all">Change Password</button>
        </div>
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-1">
            <label className="block text-sm font-medium text-zinc-100">Two-Factor Authentication</label>
            <p className="text-sm text-zinc-500">Add an extra layer of security</p>
          </div>
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors">Enable 2FA</button>
        </div>
      </div>
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Active Sessions</h3>
          <p className="text-sm text-zinc-500">Manage your logged in devices</p>
        </div>
        <div className="space-y-3">
          {[
            { device: 'MacBook Pro', location: 'Nairobi, Kenya', current: true, lastActive: 'Active now', browser: 'Chrome on macOS' },
            { device: 'iPhone 14', location: 'Nairobi, Kenya', current: false, lastActive: '2 hours ago', browser: 'Safari on iOS' }
          ].map((s, i) => (
            <div key={i} className="p-4 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                    {s.device.includes('MacBook') ? <Laptop className="w-4 h-4 text-zinc-400" /> : <Smartphone className="w-4 h-4 text-zinc-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-100 mb-1">
                      {s.device}
                      {s.current && <span className="ml-2 px-2 py-0.5 bg-emerald-900/30 text-emerald-300 border border-emerald-800/50 rounded text-xs font-medium">Current</span>}
                    </div>
                    <div className="text-xs text-zinc-500">{s.browser}</div>
                    <div className="text-xs text-zinc-500">{s.location}</div>
                    <div className="text-xs text-zinc-500 mt-1">{s.lastActive}</div>
                  </div>
                </div>
                {!s.current && <button className="px-3 py-1.5 border border-red-900/50 text-red-400 hover:bg-red-950/50 rounded-md text-xs font-medium transition-all">Revoke</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">API Keys</h3>
          <p className="text-sm text-zinc-500">Manage API access</p>
        </div>
        <div className="p-4 border border-zinc-900 rounded-lg bg-zinc-900/20">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-zinc-100">Production Key</div>
              <div className="text-xs text-zinc-500 mt-1">Created Jan 1, 2024</div>
            </div>
            <span className="px-2 py-1 bg-emerald-900/30 text-emerald-300 border border-emerald-800/50 rounded text-xs font-medium">Active</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <code className="flex-1 px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-zinc-400 font-mono">sk_prod_••••••••••••••••••••••••</code>
            <button className="px-3 py-2 border border-zinc-800 hover:bg-zinc-900 rounded text-xs font-medium text-zinc-300 transition-all">Copy</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Email Notifications</h3>
          <p className="text-sm text-zinc-500">Choose what updates you receive</p>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Team Activity', desc: 'Get notified when team members join or leave', enabled: true },
            { label: 'Security Alerts', desc: 'Important security updates and warnings', enabled: true },
            { label: 'Product Updates', desc: 'New features and announcements', enabled: false },
            { label: 'Weekly Summary', desc: 'Weekly digest of activity', enabled: true },
            { label: 'Deployment Alerts', desc: 'Notifications for successful and failed deployments', enabled: true },
            { label: 'Billing Updates', desc: 'Invoice and payment notifications', enabled: true }
          ].map((n, i) => (
            <div key={i} className="flex items-start justify-between gap-8 py-3">
              <div className="flex-1 space-y-1">
                <label className="block text-sm font-medium text-zinc-100">{n.label}</label>
                <p className="text-sm text-zinc-500">{n.desc}</p>
              </div>
              <button onClick={() => setHasChanges(true)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${n.enabled ? 'bg-violet-600' : 'bg-zinc-800'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${n.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Notification Channels</h3>
          <p className="text-sm text-zinc-500">Where to send notifications</p>
        </div>
        <div className="space-y-3">
          {[
            { channel: 'Email', address: 'brian@nyxdev.com', verified: true },
            { channel: 'Slack', address: '#engineering', verified: true },
            { channel: 'SMS', address: '+254 712 345 678', verified: false }
          ].map((c, i) => (
            <div key={i} className="p-4 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-100">{c.channel}</div>
                  <div className="text-xs text-zinc-500 mt-1">{c.address}</div>
                </div>
                <div className="flex items-center gap-2">
                  {c.verified ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-900/30 text-emerald-300 border border-emerald-800/50 rounded text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <button className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-medium transition-colors">Verify</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 mb-1">Activity Logs</h3>
          <p className="text-sm text-zinc-500">Track all account activity and changes</p>
        </div>
        <button onClick={handleExportLogs} className="flex items-center gap-2 px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-md text-sm font-medium text-zinc-300 transition-all">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search activity logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
        />
      </div>

      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div key={log.id} className="p-4 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg border ${
                  log.type === 'success' ? 'bg-emerald-900/20 border-emerald-800/50' :
                  log.type === 'warning' ? 'bg-amber-900/20 border-amber-800/50' :
                  'bg-red-900/20 border-red-800/50'
                }`}>
                  {log.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                   log.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                   <XCircle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-zinc-100">{log.action}</div>
                  <div className="text-sm text-zinc-400 mt-1">{log.details}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-zinc-500">{log.user}</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-zinc-500">{log.timestamp}</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-zinc-500">{log.ip}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Function to handle account deletion
  const deleteAccount = async () => {
    const res = await fetch("/api/account", {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Deletion failed");
    }

    // Optional cleanup
    localStorage.clear();
  };

  const renderDangerZone = () => (
  <div className="space-y-6">
    <div className="pb-3 border-b border-zinc-900">
      <h3 className="text-sm font-semibold text-red-500 mb-1">Danger Zone</h3>
      <p className="text-sm text-zinc-500">Proceed with caution</p>
    </div>

    <div className="lg:col-span-4 bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
      <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3">
        <AlertTriangle size={24} />
        Danger Zone
      </h2>
      <p className="text-gray-300 mb-6">
        Once you delete your account, there is no going back. This action is permanent and will immediately remove all your data, orders, and subscription details. Please be certain before proceeding.
      </p>
      <DeleteAccountButton
       onConfirm={handleDelete}
       isLoading={isDeleting}
/>

    </div>

    {showDeleteDialog && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold mb-4">Confirm Account Deletion</h3>
          <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
              aria-label="Cancel Deletion"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              aria-label="Confirm Deletion"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

  const renderSettings = () => (
    <div className="space-y-12">
      {selectedCategory === 'profile' && renderProfile()}
      {renderDangerZone()}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-600/10 border border-violet-600/20 rounded-lg">
              <Settings className="w-5 h-5 text-violet-500" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          </div>
          <p className="text-zinc-500">Manage your account and team preferences</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-1 sticky top-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSearchQuery(''); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <cat.icon className="w-4 h-4" />
                    <span>{cat.name}</span>
                  </div>
                  {cat.badge !== null && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      selectedCategory === cat.id
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {cat.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
              {selectedCategory === 'team' && renderTeam()}
              {selectedCategory === 'profile' && renderSettings()}
              {selectedCategory === 'security' && renderSecurity()}
              {selectedCategory === 'notifications' && renderNotifications()}
              {selectedCategory === 'logs' && renderLogs()}
            </div>

            {hasChanges && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-4 flex items-center gap-4 z-50">
                <Info className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-zinc-300">You have unsaved changes</span>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => setHasChanges(false)} className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 rounded-md text-sm font-medium text-zinc-300 transition-all">
                    Discard
                  </button>
                  <button onClick={handleSaveChanges} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showInviteMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-100">Invite Team Member</h2>
              <button onClick={() => setShowInviteMember(false)} title="Close" className="p-1 hover:bg-zinc-900 rounded transition-colors">
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
                  className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-100 mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-100 mb-2">Role</label>
                <select
                  title="Select role for the new team member"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                >
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowInviteMember(false)} className="flex-1 px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-md text-sm font-medium text-zinc-300 transition-all">
                Cancel
              </button>
              <button onClick={handleInvite} className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
              <button onClick={() => { setShowDeleteConfirm(false); setSelectedMember(null); }} className="flex-1 px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-md text-sm font-medium text-zinc-300 transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${
            notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-800/50 text-emerald-100' :
            notification.type === 'error' ? 'bg-red-900/90 border-red-800/50 text-red-100' :
            'bg-blue-900/90 border-blue-800/50 text-blue-100'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
             notification.type === 'error' ? <XCircle className="w-5 h-5" /> :
             <Info className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
