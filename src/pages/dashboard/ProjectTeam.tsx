// ============================================================================
// TechMate — Project Team Management Page
// Full-page team management for a single project.
// Admins can view assigned members, add new ones, reassign roles, and remove.
// No modals — everything happens inline on this page.
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, Plus, Trash2, Edit3, Save, X, Loader2,
  AlertCircle, RefreshCw, CheckCircle2, Search, UserPlus,
  Briefcase, Code2, Star, Shield, Palette, Terminal,
  ChevronDown, ChevronUp, Clock, Target, Zap,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { ProjectRoleOnProject, TeamMemberRole, Seniority } from '../../types/database.types';
import {
  fetchProjectTeam,
  createAllocation,
  updateAllocation,
  removeAllocation,
  type ProjectTeamMember,
  type AvailableMember,
  type CreateAllocationPayload,
} from '../../services/teams.service';
import { getProjectById } from '../../services/admin.service';

/* ────────────── Label maps ────────────── */
const roleLabel: Record<TeamMemberRole, string> = { developer: 'Developer', designer: 'Designer', tech_lead: 'Tech Lead', devops: 'DevOps', qa: 'QA', pm: 'PM' };
const seniorityLabel: Record<Seniority, string> = { junior: 'Junior', mid: 'Mid', senior: 'Senior', lead: 'Lead', principal: 'Principal' };
const roleIcon: Record<TeamMemberRole, React.ElementType> = { developer: Code2, designer: Palette, tech_lead: Star, devops: Terminal, qa: Shield, pm: Briefcase };
const projectRoles: { value: ProjectRoleOnProject; label: string }[] = [
  { value: 'developer', label: 'Developer' },
  { value: 'lead', label: 'Lead' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'designer', label: 'Designer' },
  { value: 'qa', label: 'QA' },
];

/* ────────────── Component ────────────── */
const ProjectTeam: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // ── Data ──
  const [projectName, setProjectName] = useState('');
  const [team, setTeam] = useState<ProjectTeamMember[]>([]);
  const [available, setAvailable] = useState<AvailableMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Add member form ──
  const [showAddForm, setShowAddForm] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [addForm, setAddForm] = useState<{
    team_member_id: string;
    role_on_project: ProjectRoleOnProject;
    allocation_pct: number;
    hours_estimated: number;
    start_date: string;
    end_date: string;
    notes: string;
  }>({
    team_member_id: '',
    role_on_project: 'developer',
    allocation_pct: 50,
    hours_estimated: 40,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  });
  const [adding, setAdding] = useState(false);

  // ── Inline edit ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    role_on_project: ProjectRoleOnProject;
    allocation_pct: number;
    hours_estimated: number;
    hours_logged: number;
    notes: string;
  } | null>(null);

  // ── Show available members expanded ──
  const [expandAvailable, setExpandAvailable] = useState(false);

  // ── Data fetching ──
  const fetchData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [teamData, projectData] = await Promise.all([
        fetchProjectTeam(projectId),
        getProjectById(projectId),
      ]);
      setTeam(teamData.team);
      setAvailable(teamData.available);
      if (projectData.data) {
        setProjectName(projectData.data.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project team');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filtered available members ──
  const filteredAvailable = useMemo(() => {
    if (!addSearch.trim()) return available;
    const q = addSearch.toLowerCase();
    return available.filter(m =>
      m.full_name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.skills.some(s => s.toLowerCase().includes(q))
    );
  }, [available, addSearch]);

  // ── Add member handler ──
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !addForm.team_member_id) {
      toast.error('Please select a team member');
      return;
    }
    setAdding(true);
    try {
      const payload: CreateAllocationPayload = {
        team_member_id: addForm.team_member_id,
        project_id: projectId,
        role_on_project: addForm.role_on_project,
        allocation_pct: addForm.allocation_pct,
        hours_estimated: addForm.hours_estimated,
        start_date: addForm.start_date || null,
        end_date: addForm.end_date || null,
        notes: addForm.notes || null,
      };
      await createAllocation(payload);
      toast.success('Developer added to project');
      setShowAddForm(false);
      setAddForm({
        team_member_id: '',
        role_on_project: 'developer',
        allocation_pct: 50,
        hours_estimated: 40,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
      });
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add developer');
    } finally {
      setAdding(false);
    }
  };

  // ── Quick-assign (one-click with defaults) ──
  const quickAssign = async (memberId: string, memberName: string) => {
    if (!projectId) return;
    try {
      await createAllocation({
        team_member_id: memberId,
        project_id: projectId,
        role_on_project: 'developer',
        allocation_pct: 50,
        hours_estimated: 40,
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,
        notes: null,
      });
      toast.success(`${memberName} assigned to project`);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign developer');
    }
  };

  // ── Edit handlers ──
  const startEdit = (m: ProjectTeamMember) => {
    setEditingId(m.allocation_id);
    setEditForm({
      role_on_project: m.role_on_project,
      allocation_pct: m.allocation_pct,
      hours_estimated: m.hours_estimated,
      hours_logged: m.hours_logged,
      notes: m.notes ?? '',
    });
  };

  const saveEdit = async () => {
    if (!editingId || !editForm) return;
    try {
      await updateAllocation(editingId, editForm);
      toast.success('Allocation updated');
      setEditingId(null);
      setEditForm(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleRemove = async (allocId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from this project?`)) return;
    try {
      await removeAllocation(allocId);
      toast.success(`${name} removed from project`);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Remove failed');
    }
  };

  /* ═══════════════════════════════ RENDER ═══════════════════════════════ */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="ml-3 text-gray-400 text-lg">Loading project team…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-300 text-lg">{error}</p>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
          <button onClick={() => navigate(`/dashboard/projects/${projectId}`)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Project
          </button>
        </div>
      </div>
    );
  }

  // ── Summary stats ──
  const totalAlloc = team.reduce((s, m) => s + m.allocation_pct, 0);
  const totalHoursEst = team.reduce((s, m) => s + m.hours_estimated, 0);
  const totalHoursLog = team.reduce((s, m) => s + m.hours_logged, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* ─── Back Nav ─── */}
      <button
        onClick={() => navigate(`/dashboard/projects/${projectId}`)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {projectName || 'Project'}
      </button>

      {/* ─── Header ─── */}
      <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-7 h-7 text-emerald-400" />
              Team for {projectName || '…'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {team.length} member{team.length !== 1 ? 's' : ''} assigned · {available.length} available
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20 self-start"
          >
            <Plus className="w-4 h-4" /> Add Team Member
          </button>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Team Size', value: team.length, icon: Users, color: 'blue' },
          { label: 'Total Allocation', value: `${totalAlloc}%`, icon: Target, color: totalAlloc > 500 ? 'red' : 'emerald' },
          { label: 'Hours Estimated', value: totalHoursEst, icon: Clock, color: 'cyan' },
          { label: 'Hours Logged', value: totalHoursLog, icon: BarChart3, color: 'purple' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-4 transition-all">
              <div className={`p-2 bg-${stat.color}-500/10 rounded-lg w-fit mb-2`}>
                <Icon className={`w-4 h-4 text-${stat.color}-400`} />
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* ─── Add Member Form ─── */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/40 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            Add Developer to {projectName}
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="text-xs text-gray-400 mb-1 block">Select Team Member *</label>
                <select
                  value={addForm.team_member_id}
                  onChange={e => setAddForm(prev => ({ ...prev, team_member_id: e.target.value }))}
                  title="Select Team Member"
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  required
                >
                  <option value="">Choose a team member…</option>
                  {available.map(m => (
                    <option key={m.team_member_id} value={m.team_member_id}>
                      {m.full_name} — {roleLabel[m.role]} ({seniorityLabel[m.seniority]}) · {m.total_allocation_pct}% allocated · {m.skills.slice(0, 3).join(', ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Role on Project</label>
                <select value={addForm.role_on_project} onChange={e => setAddForm(prev => ({ ...prev, role_on_project: e.target.value as ProjectRoleOnProject }))} title="Role on Project" className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50">
                  {projectRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Allocation %</label>
                <input type="number" min={5} max={100} step={5} value={addForm.allocation_pct} onChange={e => setAddForm(prev => ({ ...prev, allocation_pct: Number(e.target.value) }))} title="Allocation Percentage" className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Estimated Hours</label>
                <input type="number" min={1} value={addForm.hours_estimated} onChange={e => setAddForm(prev => ({ ...prev, hours_estimated: Number(e.target.value) }))} title="Estimated Hours" className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                <input type="date" value={addForm.start_date} onChange={e => setAddForm(prev => ({ ...prev, start_date: e.target.value }))} title="Start Date" className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">End Date</label>
                <input type="date" value={addForm.end_date} onChange={e => setAddForm(prev => ({ ...prev, end_date: e.target.value }))} title="End Date" className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                <input value={addForm.notes} onChange={e => setAddForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes…" className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={adding} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Add to Project
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-all">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Assigned Team Members ─── */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-emerald-400" />
          Assigned Team Members
          <span className="text-sm font-normal text-gray-500">({team.length})</span>
        </h2>

        {team.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No team members assigned yet</p>
            <p className="text-gray-600 text-xs mt-1">Click "Add Team Member" or quick-assign from the available pool below</p>
          </div>
        ) : (
          <div className="space-y-4">
            {team.map(m => {
              const isEditing = editingId === m.allocation_id;
              const RoleIcon = roleIcon[m.role];
              const hoursProgress = m.hours_estimated > 0 ? Math.min((m.hours_logged / m.hours_estimated) * 100, 100) : 0;

              return (
                <div key={m.allocation_id} className="bg-gray-800/20 border border-gray-700/40 rounded-xl p-5 hover:border-gray-600/50 transition-all">
                  {isEditing && editForm ? (
                    /* ── Inline Edit ── */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Link to={`/dashboard/teams/${m.team_member_id}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/80 to-emerald-600/80 flex items-center justify-center text-white font-bold text-sm">
                            {m.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-lg font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">{m.full_name}</span>
                        </Link>
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs transition-all"><Save className="w-3 h-3" /> Save</button>
                          <button onClick={() => { setEditingId(null); setEditForm(null); }} className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs transition-all"><X className="w-3 h-3" /> Cancel</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Role</label>
                          <select value={editForm.role_on_project} onChange={e => setEditForm({ ...editForm, role_on_project: e.target.value as ProjectRoleOnProject })} title="Role" className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50">
                            {projectRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Allocation %</label>
                          <input type="number" min={5} max={100} step={5} value={editForm.allocation_pct} onChange={e => setEditForm({ ...editForm, allocation_pct: Number(e.target.value) })} title="Allocation Percentage" className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Hours Estimated</label>
                          <input type="number" min={1} value={editForm.hours_estimated} onChange={e => setEditForm({ ...editForm, hours_estimated: Number(e.target.value) })} title="Hours Estimated" className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Hours Logged</label>
                          <input type="number" min={0} value={editForm.hours_logged} onChange={e => setEditForm({ ...editForm, hours_logged: Number(e.target.value) })} title="Hours Logged" className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Display Mode ── */
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Link to={`/dashboard/teams/${m.team_member_id}`} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/80 to-emerald-600/80 flex items-center justify-center text-white font-bold text-sm">
                              {m.full_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{m.full_name}</div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <RoleIcon className="w-3 h-3" />
                                {roleLabel[m.role]} · {seniorityLabel[m.seniority]}
                              </div>
                            </div>
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(m)} className="p-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors" title="Edit allocation">
                            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <button onClick={() => handleRemove(m.allocation_id, m.full_name)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors" title="Remove from project">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                        <div>
                          <span className="text-xs text-gray-500">Project Role</span>
                          <p className="text-sm font-medium text-white capitalize">{m.role_on_project}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Allocation</span>
                          <p className={`text-sm font-semibold text-${m.allocation_pct > 70 ? 'amber' : 'emerald'}-400`}>{m.allocation_pct}%</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Period</span>
                          <p className="text-sm text-white">{m.start_date?.slice(0, 10) ?? '—'} → {m.end_date?.slice(0, 10) ?? 'Ongoing'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Hours</span>
                          <p className="text-sm font-medium text-white">{m.hours_logged} / {m.hours_estimated}h</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Skills</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {m.skills.slice(0, 3).map(s => (
                              <span key={s} className="px-1.5 py-0.5 bg-gray-800/50 rounded text-[10px] text-gray-300">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Hours progress bar */}
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${hoursProgress >= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${hoursProgress}%` }}
                        />
                      </div>
                      {m.notes && <p className="text-xs text-gray-500 mt-2 italic">"{m.notes}"</p>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Available Pool ─── */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <button onClick={() => setExpandAvailable(!expandAvailable)} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            Available Developers
            <span className="text-sm font-normal text-gray-500">({available.length})</span>
          </h2>
          {expandAvailable ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandAvailable && (
          <div className="mt-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={addSearch}
                onChange={e => setAddSearch(e.target.value)}
                placeholder="Search by name, role, or skill…"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {filteredAvailable.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                {available.length === 0 ? 'All team members are already assigned to this project.' : 'No matching developers found.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAvailable.map(m => {
                  const RoleIcon = roleIcon[m.role];
                  const allocColor = m.total_allocation_pct >= 80 ? 'amber' : m.total_allocation_pct >= 50 ? 'blue' : 'emerald';
                  return (
                    <div key={m.team_member_id} className="bg-gray-800/20 border border-gray-700/40 rounded-xl p-4 hover:border-gray-600/50 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <Link to={`/dashboard/teams/${m.team_member_id}`} className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400/80 to-blue-600/80 flex items-center justify-center text-white font-bold text-xs">
                            {m.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm group-hover:text-emerald-400 transition-colors">{m.full_name}</div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <RoleIcon className="w-3 h-3" /> {roleLabel[m.role]} · {seniorityLabel[m.seniority]}
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={() => quickAssign(m.team_member_id, m.full_name)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-all"
                          title="Quick-assign with default settings"
                        >
                          <Plus className="w-3 h-3" /> Assign
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {m.skills.slice(0, 4).map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-gray-800/50 rounded text-[10px] text-gray-300">{s}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Current allocation</span>
                        <span className={`font-semibold text-${allocColor}-400`}>{m.total_allocation_pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1">
                        <div className={`h-full bg-${allocColor}-500 rounded-full`} style={{ width: `${Math.min(m.total_allocation_pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTeam;
