// ============================================================================
// TechMate — Developer Profile Page
// Full-page developer detail with project assignment management.
// No modals — everything is inline or navigates to dedicated pages.
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Briefcase, Code2, Star, Clock, DollarSign,
  Shield, Palette, Terminal, Loader2, AlertCircle, RefreshCw,
  Plus, Trash2, Edit3, Save, X, CheckCircle2,
  TrendingUp, Target, Zap, BarChart3, FolderOpen, UserCheck,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type {
  TeamMemberRole, TeamDepartment, Seniority, TeamMemberStatus,
  ProjectRoleOnProject, AllocationStatus,
} from '../../types/database.types';
import {
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
  createAllocation,
  updateAllocation,
  removeAllocation,
  getAvailableProjects,
  type MemberWithWorkload,
  type AllocationWithProject,
  type ProjectRef,
  type CreateAllocationPayload,
} from '../../services/teams.service';

/* ────────────── Label maps ────────────── */
const roleLabel: Record<TeamMemberRole, string> = { developer: 'Developer', designer: 'Designer', tech_lead: 'Tech Lead', devops: 'DevOps', qa: 'QA', pm: 'PM' };
const deptLabel: Record<TeamDepartment, string> = { engineering: 'Engineering', design: 'Design', qa: 'QA', devops: 'DevOps', management: 'Management' };
const seniorityLabel: Record<Seniority, string> = { junior: 'Junior', mid: 'Mid', senior: 'Senior', lead: 'Lead', principal: 'Principal' };
const statusColor: Record<TeamMemberStatus, string> = { active: 'emerald', on_leave: 'amber', inactive: 'red' };
const roleIcon: Record<TeamMemberRole, React.ElementType> = { developer: Code2, designer: Palette, tech_lead: Star, devops: Terminal, qa: Shield, pm: Briefcase };
const allocStatusLabel: Record<AllocationStatus, string> = { active: 'Active', completed: 'Completed', paused: 'Paused', removed: 'Removed' };
const projectRoles: { value: ProjectRoleOnProject; label: string }[] = [
  { value: 'developer', label: 'Developer' },
  { value: 'lead', label: 'Lead' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'designer', label: 'Designer' },
  { value: 'qa', label: 'QA' },
];

/* ────────────── Component ────────────── */
const DeveloperProfile: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();

  // ── Data state ──────────────────────────────────────────────────────────
  const [member, setMember] = useState<MemberWithWorkload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Edit mode for profile ──────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    full_name: string;
    email: string;
    role: TeamMemberRole;
    department: TeamDepartment;
    seniority: Seniority;
    status: TeamMemberStatus;
    hourly_rate: number;
    availability: number;
    skills: string[];
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Assign to project state ────────────────────────────────────────────
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<ProjectRef[]>([]);
  const [assignForm, setAssignForm] = useState<{
    project_id: string;
    role_on_project: ProjectRoleOnProject;
    allocation_pct: number;
    hours_estimated: number;
    start_date: string;
    end_date: string;
    notes: string;
  }>({
    project_id: '',
    role_on_project: 'developer',
    allocation_pct: 50,
    hours_estimated: 40,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  });
  const [assigning, setAssigning] = useState(false);

  // ── Allocation editing ─────────────────────────────────────────────────
  const [editingAllocId, setEditingAllocId] = useState<string | null>(null);
  const [editAllocForm, setEditAllocForm] = useState<{
    role_on_project: ProjectRoleOnProject;
    allocation_pct: number;
    hours_estimated: number;
    hours_logged: number;
    notes: string;
  } | null>(null);

  // ── History toggle ─────────────────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────
  const fetchMember = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTeamMemberById(memberId);
      setMember(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load developer profile');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  // ── Derived data ───────────────────────────────────────────────────────
  const activeAllocations = useMemo(
    () => member?.allocations.filter(a => a.status === 'active') ?? [],
    [member],
  );
  const historyAllocations = useMemo(
    () => member?.allocations.filter(a => a.status !== 'active') ?? [],
    [member],
  );
  const assignedProjectIds = useMemo(
    () => new Set(activeAllocations.map(a => a.project_id)),
    [activeAllocations],
  );
  const unassignedProjects = useMemo(
    () => availableProjects.filter(p => !assignedProjectIds.has(p.id)),
    [availableProjects, assignedProjectIds],
  );

  // ── Edit profile handlers ─────────────────────────────────────────────
  const startEditing = () => {
    if (!member) return;
    setEditForm({
      full_name: member.full_name,
      email: member.email,
      role: member.role,
      department: member.department,
      seniority: member.seniority,
      status: member.status,
      hourly_rate: member.hourly_rate,
      availability: member.availability,
      skills: [...member.skills],
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditForm(null);
  };

  const saveProfile = async () => {
    if (!editForm || !memberId) return;
    setSaving(true);
    try {
      await updateTeamMember(memberId, editForm);
      toast.success('Profile updated successfully');
      setEditing(false);
      setEditForm(null);
      await fetchMember();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!memberId || !member) return;
    if (!window.confirm(`Are you sure you want to remove ${member.full_name} from the team? This action is reversible by an admin.`)) return;
    try {
      await deleteTeamMember(memberId);
      toast.success('Team member removed');
      navigate('/dashboard/teams');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove team member');
    }
  };

  // ── Assign to project ─────────────────────────────────────────────────
  const openAssignForm = async () => {
    try {
      const projects = await getAvailableProjects();
      setAvailableProjects(projects);
      setShowAssignForm(true);
    } catch {
      toast.error('Failed to load projects');
    }
  };

  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !assignForm.project_id) {
      toast.error('Please select a project');
      return;
    }
    setAssigning(true);
    try {
      const payload: CreateAllocationPayload = {
        team_member_id: memberId,
        project_id: assignForm.project_id,
        role_on_project: assignForm.role_on_project,
        allocation_pct: assignForm.allocation_pct,
        hours_estimated: assignForm.hours_estimated,
        start_date: assignForm.start_date || null,
        end_date: assignForm.end_date || null,
        notes: assignForm.notes || null,
      };
      await createAllocation(payload);
      toast.success('Developer assigned to project');
      setShowAssignForm(false);
      setAssignForm({
        project_id: '',
        role_on_project: 'developer',
        allocation_pct: 50,
        hours_estimated: 40,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
      });
      await fetchMember();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign developer');
    } finally {
      setAssigning(false);
    }
  };

  // ── Allocation edit handlers ───────────────────────────────────────────
  const startEditAlloc = (a: AllocationWithProject) => {
    setEditingAllocId(a.id);
    setEditAllocForm({
      role_on_project: a.role_on_project,
      allocation_pct: a.allocation_pct,
      hours_estimated: a.hours_estimated,
      hours_logged: a.hours_logged,
      notes: a.notes ?? '',
    });
  };

  const saveAllocEdit = async () => {
    if (!editingAllocId || !editAllocForm) return;
    try {
      await updateAllocation(editingAllocId, editAllocForm);
      toast.success('Allocation updated');
      setEditingAllocId(null);
      setEditAllocForm(null);
      await fetchMember();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update allocation');
    }
  };

  const handleRemoveAllocation = async (allocId: string, projectName: string) => {
    if (!window.confirm(`Remove ${member?.full_name} from ${projectName}?`)) return;
    try {
      await removeAllocation(allocId);
      toast.success(`Removed from ${projectName}`);
      await fetchMember();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove from project');
    }
  };

  /* ═══════════════════════════════ RENDER ═══════════════════════════════ */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="ml-3 text-gray-400 text-lg">Loading developer profile…</span>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-300 text-lg">{error ?? 'Developer not found'}</p>
        <div className="flex gap-3">
          <button onClick={fetchMember} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
          <button onClick={() => navigate('/dashboard/teams')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Teams
          </button>
        </div>
      </div>
    );
  }

  const RoleIcon = roleIcon[member.role];
  const allocationColor = member.total_allocation_pct > 100 ? 'red' : member.total_allocation_pct >= 80 ? 'amber' : member.total_allocation_pct >= 50 ? 'blue' : 'emerald';

  return (
    <div className="space-y-8 pb-12">
      {/* ─── Back Nav ────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/dashboard/teams')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Teams
      </button>

      {/* ─── Profile Header ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Avatar */}
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-${statusColor[member.status]}-400/80 to-${statusColor[member.status]}-600/80 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg shadow-${statusColor[member.status]}-500/20`}>
            {member.avatar_url ? (
              <img src={member.avatar_url} alt={member.full_name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              member.full_name.split(' ').map(n => n[0]).join('')
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editing && editForm ? (
              /* ─── Edit Form ─── */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                    <input
                      value={editForm.full_name}
                      onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                      title="Full Name"
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Email</label>
                    <input
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      title="Email"
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Role</label>
                    <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value as TeamMemberRole })} title="Role" className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50">
                      {Object.entries(roleLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Department</label>
                    <select value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value as TeamDepartment })} title="Department" className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50">
                      {Object.entries(deptLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Seniority</label>
                    <select value={editForm.seniority} onChange={e => setEditForm({ ...editForm, seniority: e.target.value as Seniority })} title="Seniority" className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50">
                      {Object.entries(seniorityLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as TeamMemberStatus })} title="Status" className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50">
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Hourly Rate ($)</label>
                    <input type="number" value={editForm.hourly_rate} onChange={e => setEditForm({ ...editForm, hourly_rate: Number(e.target.value) })} title="Hourly Rate" className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Availability (hrs/week)</label>
                    <input type="number" value={editForm.availability} onChange={e => setEditForm({ ...editForm, availability: Number(e.target.value) })} title="Availability" className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button onClick={cancelEditing} className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-all">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ─── Display Mode ─── */
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">{member.full_name}</h1>
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold bg-${statusColor[member.status]}-500/10 text-${statusColor[member.status]}-400 border border-${statusColor[member.status]}-500/20`}>
                    {member.status === 'active' ? 'Active' : member.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1.5"><RoleIcon className="w-4 h-4" /> {roleLabel[member.role]} · {seniorityLabel[member.seniority]}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {deptLabel[member.department]}</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {member.email}</span>
                </div>
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {member.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-gray-800/60 border border-gray-700/40 rounded-lg text-xs text-gray-300 font-medium">{s}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {!editing && (
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <button onClick={startEditing} className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 border border-gray-700 hover:border-gray-600 text-white rounded-xl text-sm transition-all">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
              <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl text-sm transition-all">
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Allocation', value: `${member.total_allocation_pct}%`, icon: Target, color: allocationColor },
          { label: 'Active Projects', value: member.active_projects, icon: FolderOpen, color: 'blue' },
          { label: 'Hours Estimated', value: member.totalEstimated, icon: Clock, color: 'cyan' },
          { label: 'Hours Logged', value: member.totalLogged, icon: BarChart3, color: 'purple' },
          { label: 'Hourly Rate', value: `$${member.hourly_rate}`, icon: DollarSign, color: 'emerald' },
          { label: 'Availability', value: `${member.availability}h/wk`, icon: UserCheck, color: 'amber' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 rounded-2xl p-4 transition-all">
              <div className={`p-2 bg-${stat.color}-500/10 rounded-lg w-fit mb-2`}>
                <Icon className={`w-4 h-4 text-${stat.color}-400`} />
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* ─── Allocation Progress Bar ─────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Capacity Utilisation</h3>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full bg-gradient-to-r from-${allocationColor}-500 to-${allocationColor}-400 rounded-full transition-all duration-700`}
            style={{ width: `${Math.min(member.total_allocation_pct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">0%</span>
          <span className={`font-semibold text-${allocationColor}-400`}>{member.total_allocation_pct}% allocated</span>
          <span className="text-gray-500">100%</span>
        </div>
      </div>

      {/* ─── Active Project Assignments ──────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Active Project Assignments
            <span className="text-sm font-normal text-gray-500">({activeAllocations.length})</span>
          </h2>
          <button
            onClick={openAssignForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Assign to Project
          </button>
        </div>

        {/* ─── Assign to Project Form ─── */}
        {showAssignForm && (
          <div className="mb-6 bg-gray-800/30 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Assign {member.full_name} to a Project
            </h3>
            <form onSubmit={submitAssignment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Project *</label>
                  <select
                    value={assignForm.project_id}
                    onChange={e => setAssignForm(prev => ({ ...prev, project_id: e.target.value }))}
                    title="Select Project"
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    required
                  >
                    <option value="">Select a project…</option>
                    {unassignedProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Role on Project</label>
                  <select
                    value={assignForm.role_on_project}
                    onChange={e => setAssignForm(prev => ({ ...prev, role_on_project: e.target.value as ProjectRoleOnProject }))}
                    title="Role on Project"
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    {projectRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Allocation %</label>
                  <input
                    type="number" min={5} max={100} step={5}
                    value={assignForm.allocation_pct}
                    onChange={e => setAssignForm(prev => ({ ...prev, allocation_pct: Number(e.target.value) }))}
                    title="Allocation Percentage"
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Estimated Hours</label>
                  <input
                    type="number" min={1}
                    value={assignForm.hours_estimated}
                    onChange={e => setAssignForm(prev => ({ ...prev, hours_estimated: Number(e.target.value) }))}
                    title="Estimated Hours"
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={assignForm.start_date}
                    onChange={e => setAssignForm(prev => ({ ...prev, start_date: e.target.value }))}
                    title="Start Date"
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={assignForm.end_date}
                    onChange={e => setAssignForm(prev => ({ ...prev, end_date: e.target.value }))}
                    title="End Date"
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                <textarea
                  value={assignForm.notes}
                  onChange={e => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="Any notes about this assignment…"
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              {/* New allocation warning */}
              {assignForm.allocation_pct + member.total_allocation_pct > 100 && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  This will bring {member.full_name}'s total allocation to {assignForm.allocation_pct + member.total_allocation_pct}% — over capacity.
                </div>
              )}

              <div className="flex gap-3">
                <button type="submit" disabled={assigning} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all">
                  {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Assign Developer
                </button>
                <button type="button" onClick={() => setShowAssignForm(false)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-all">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── Active Allocations List ─── */}
        {activeAllocations.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No active project assignments</p>
            <p className="text-gray-600 text-xs mt-1">Click "Assign to Project" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAllocations.map(alloc => {
              const isEditing = editingAllocId === alloc.id;
              const hoursProgress = alloc.hours_estimated > 0 ? Math.min((alloc.hours_logged / alloc.hours_estimated) * 100, 100) : 0;
              return (
                <div key={alloc.id} className="bg-gray-800/20 border border-gray-700/40 rounded-xl p-5 hover:border-gray-600/50 transition-all">
                  {isEditing && editAllocForm ? (
                    /* Inline edit allocation */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/dashboard/projects/${alloc.project_id}`}
                          className="text-lg font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          {alloc.project?.name ?? alloc.project_id}
                        </Link>
                        <div className="flex gap-2">
                          <button onClick={saveAllocEdit} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs transition-all">
                            <Save className="w-3 h-3" /> Save
                          </button>
                          <button onClick={() => { setEditingAllocId(null); setEditAllocForm(null); }} className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs transition-all">
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Role</label>
                          <select value={editAllocForm.role_on_project} onChange={e => setEditAllocForm({ ...editAllocForm, role_on_project: e.target.value as ProjectRoleOnProject })} title="Role" className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50">
                            {projectRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Allocation %</label>
                          <input type="number" min={5} max={100} step={5} value={editAllocForm.allocation_pct} onChange={e => setEditAllocForm({ ...editAllocForm, allocation_pct: Number(e.target.value) })} title="Allocation Percentage" className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Hours Estimated</label>
                          <input type="number" min={1} value={editAllocForm.hours_estimated} onChange={e => setEditAllocForm({ ...editAllocForm, hours_estimated: Number(e.target.value) })} title="Hours Estimated" className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Hours Logged</label>
                          <input type="number" min={0} value={editAllocForm.hours_logged} onChange={e => setEditAllocForm({ ...editAllocForm, hours_logged: Number(e.target.value) })} title="Hours Logged" className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                        <input value={editAllocForm.notes} onChange={e => setEditAllocForm({ ...editAllocForm, notes: e.target.value })} title="Notes" placeholder="Optional notes…" className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>
                  ) : (
                    /* Display mode */
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/dashboard/projects/${alloc.project_id}`}
                            className="text-lg font-semibold text-white hover:text-emerald-400 transition-colors"
                          >
                            {alloc.project?.name ?? alloc.project_id}
                          </Link>
                          {alloc.project?.status && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              alloc.project.status === 'active' ? 'bg-green-500/10 text-green-400' :
                              alloc.project.status === 'planning' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {alloc.project.status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEditAlloc(alloc)} className="p-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors" title="Edit allocation">
                            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <button onClick={() => handleRemoveAllocation(alloc.id, alloc.project?.name ?? 'this project')} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors" title="Remove from project">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-gray-500">Role</span>
                          <p className="text-sm font-medium text-white capitalize">{alloc.role_on_project}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Allocation</span>
                          <p className={`text-sm font-semibold text-${alloc.allocation_pct > 70 ? 'amber' : 'emerald'}-400`}>{alloc.allocation_pct}%</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Period</span>
                          <p className="text-sm text-white">{alloc.start_date?.slice(0, 10) ?? '—'} → {alloc.end_date?.slice(0, 10) ?? 'Ongoing'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Hours</span>
                          <p className="text-sm font-medium text-white">{alloc.hours_logged} / {alloc.hours_estimated}h</p>
                        </div>
                      </div>

                      {/* Hours progress bar */}
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${hoursProgress >= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${hoursProgress}%` }}
                        />
                      </div>

                      {alloc.notes && (
                        <p className="text-xs text-gray-500 mt-2 italic">"{alloc.notes}"</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Allocation History ──────────────────────────────────────── */}
      {historyAllocations.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Assignment History
              <span className="text-sm font-normal text-gray-500">({historyAllocations.length})</span>
            </h2>
            {showHistory ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showHistory && (
            <div className="mt-4 space-y-3">
              {historyAllocations.map(alloc => (
                <div key={alloc.id} className="flex items-center justify-between p-4 bg-gray-800/20 border border-gray-700/30 rounded-xl opacity-70">
                  <div>
                    <span className="font-medium text-white">{alloc.project?.name ?? alloc.project_id}</span>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {alloc.role_on_project} · {alloc.allocation_pct}% · {alloc.hours_logged}/{alloc.hours_estimated}h
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    alloc.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                    alloc.status === 'paused' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {allocStatusLabel[alloc.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Quick Insights ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-emerald-900/20 border border-purple-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Developer Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">Capacity</span>
            </div>
            <p className="text-xs text-gray-300">
              {member.total_allocation_pct >= 100
                ? `${member.full_name} is at ${member.total_allocation_pct}% capacity — fully loaded. Consider redistributing work before adding more assignments.`
                : member.total_allocation_pct >= 70
                  ? `Running at ${member.total_allocation_pct}% utilisation. Roughly ${100 - member.total_allocation_pct}% capacity remains for additional work.`
                  : `Only ${member.total_allocation_pct}% allocated — significant capacity available for new project assignments.`}
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">Productivity</span>
            </div>
            <p className="text-xs text-gray-300">
              {member.totalEstimated > 0
                ? `${Math.round((member.totalLogged / member.totalEstimated) * 100)}% of estimated hours have been logged across ${member.active_projects} active project${member.active_projects !== 1 ? 's' : ''}.${member.totalLogged > member.totalEstimated ? ' Hours are exceeding estimates — review scope.' : ''}`
                : 'No hours data available yet. Assign to a project to start tracking.'}
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">Cost Impact</span>
            </div>
            <p className="text-xs text-gray-300">
              {member.totalLogged > 0
                ? `At $${member.hourly_rate}/hr, ${member.full_name} has contributed ~$${(member.totalLogged * member.hourly_rate).toLocaleString()} in billable work across active assignments. Weekly burn rate: ~$${(member.hourly_rate * member.availability * member.total_allocation_pct / 100).toFixed(0)}/week.`
                : `Hourly rate is $${member.hourly_rate}. Estimated weekly cost at current allocation: $${(member.hourly_rate * member.availability * member.total_allocation_pct / 100).toFixed(0)}/week.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfile;
