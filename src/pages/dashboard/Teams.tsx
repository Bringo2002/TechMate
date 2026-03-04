import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Filter, UserPlus, Clock, Briefcase, Star,
  BarChart3, AlertCircle, CheckCircle2, Code2, Palette, Shield, Terminal,
  TrendingUp, Eye, MoreHorizontal, Zap, Target, Brain, RefreshCw, Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type {
  TeamMemberRole, TeamDepartment,
  Seniority, TeamMemberStatus,
} from '../../types/database.types';
import { useTeams } from '../../hooks/useTeams';
import type { MemberWithWorkload, AllocationWithProject, ProjectRef } from '../../services/teams.service';

/* ────────────── palette ────────────── */
const COLORS = {
  emerald: '#10b981', blue: '#3b82f6', purple: '#8b5cf6',
  amber: '#f59e0b', cyan: '#06b6d4', pink: '#ec4899',
  red: '#ef4444', lime: '#84cc16',
  grid: '#1f2937', axis: '#6b7280',
};
const PIE_PALETTE = [COLORS.emerald, COLORS.blue, COLORS.purple, COLORS.amber, COLORS.cyan, COLORS.pink, COLORS.red, COLORS.lime];

/* ────────────── dark tooltip ────────────── */
const DarkTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 text-xs shadow-xl backdrop-blur">
      {label && <div className="text-gray-400 mb-1.5 font-medium">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-semibold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ────────────── label helpers ────────────── */
const roleLabel: Record<TeamMemberRole, string> = { developer: 'Developer', designer: 'Designer', tech_lead: 'Tech Lead', devops: 'DevOps', qa: 'QA', pm: 'PM' };
const deptLabel: Record<TeamDepartment, string> = { engineering: 'Engineering', design: 'Design', qa: 'QA', devops: 'DevOps', management: 'Management' };
const seniorityLabel: Record<Seniority, string> = { junior: 'Junior', mid: 'Mid', senior: 'Senior', lead: 'Lead', principal: 'Principal' };
const statusColor: Record<TeamMemberStatus, string> = { active: 'emerald', on_leave: 'amber', inactive: 'red' };
const roleIcon: Record<TeamMemberRole, React.ElementType> = { developer: Code2, designer: Palette, tech_lead: Star, devops: Terminal, qa: Shield, pm: Briefcase };

/* ────────────── mock data removed — real data from useTeams hook ────────────── */

/* ─────────────────────────────── component ─────────────────────────────── */
const Teams: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useTeams();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<TeamMemberRole | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState<TeamDepartment | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TeamMemberStatus | 'all'>('all');
  const [view, setView] = useState<'roster' | 'allocation'>('roster');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Alias for conciseness — stable refs when data is null
  const members: MemberWithWorkload[] = useMemo(() => data?.members ?? [], [data]);
  const projects: ProjectRef[] = useMemo(() => data?.projects ?? [], [data]);
  const allocations: AllocationWithProject[] = useMemo(() => data?.allocations ?? [], [data]);

  // ─── derived ────────────────────────────────────────────────────────────────
  const membersWithWorkload = members;

  const filtered = useMemo(() =>
    membersWithWorkload.filter(m => {
      if (search && !m.full_name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase()) && !m.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
      if (roleFilter !== 'all' && m.role !== roleFilter) return false;
      if (deptFilter !== 'all' && m.department !== deptFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      return true;
    }),
  [membersWithWorkload, search, roleFilter, deptFilter, statusFilter]);

  // ─── chart data ─────────────────────────────────────────────────────────────
  const workloadBarData = useMemo(() =>
    membersWithWorkload
      .filter(m => m.status === 'active')
      .map(m => ({
        name: m.full_name.split(' ')[0],
        allocated: m.total_allocation_pct,
        available: Math.max(0, 100 - m.total_allocation_pct),
      })),
  [membersWithWorkload]);

  const rolePieData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => { counts[roleLabel[m.role]] = (counts[roleLabel[m.role]] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [members]);

  const deptPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => { counts[deptLabel[m.department]] = (counts[deptLabel[m.department]] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [members]);

  const skillRadarData = useMemo(() => {
    const skillMap: Record<string, number> = {};
    members.forEach(m => m.skills.forEach(s => { skillMap[s] = (skillMap[s] || 0) + 1; }));
    return Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));
  }, [members]);

  const projectAllocationData = useMemo(() => {
    // Use only projects that have at least one active allocation
    const activeAllocs = allocations.filter(a => a.status === 'active');
    const projectIds = [...new Set(activeAllocs.map(a => a.project_id))];
    return projectIds.map(pid => {
      const proj = projects.find(p => p.id === pid);
      const pAllocs = activeAllocs.filter(a => a.project_id === pid);
      const totalHoursEst = pAllocs.reduce((s, a) => s + a.hours_estimated, 0);
      const totalHoursLog = pAllocs.reduce((s, a) => s + a.hours_logged, 0);
      const pName = proj?.name ?? pid.slice(0, 8);
      return { name: pName.length > 12 ? pName.slice(0, 12) + '…' : pName, members: pAllocs.length, hoursEstimated: totalHoursEst, hoursLogged: totalHoursLog };
    });
  }, [allocations, projects]);

  // ─── summary KPIs ──────────────────────────────────────────────────────────
  const activeCount = data?.kpis.activeCount ?? 0;
  const onLeaveCount = data?.kpis.onLeaveCount ?? 0;
  const avgAllocation = data?.kpis.avgAllocation ?? 0;
  const overallocated = data?.kpis.overallocated ?? 0;
  const underutilised = data?.kpis.underutilised ?? 0;
  const activeProjectsCount = data?.kpis.activeProjectsCount ?? 0;

  const kpis = [
    { label: 'Active Members', value: activeCount, icon: Users, color: 'emerald' },
    { label: 'On Leave', value: onLeaveCount, icon: Clock, color: 'amber' },
    { label: 'Avg Allocation', value: `${avgAllocation}%`, icon: BarChart3, color: 'blue' },
    { label: 'Over-allocated', value: overallocated, icon: AlertCircle, color: 'red' },
    { label: 'Under-utilised', value: underutilised, icon: Target, color: 'purple' },
    { label: 'Active Projects', value: activeProjectsCount, icon: Briefcase, color: 'cyan' },
  ];

  // ─── selected member detail ─────────────────────────────────────────────────
  const detail = selectedMember ? membersWithWorkload.find(m => m.id === selectedMember) : null;

  /* ═══════════════════════════════════════════════ JSX ═══════════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="ml-3 text-gray-400 text-lg">Loading team data…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-300 text-lg">{error}</p>
        <button onClick={refetch} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            Teams &amp; Developer Allocation
          </h1>
          <p className="text-gray-400">Monitor workload, skills, and project assignments across your team</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refetch} className="p-2 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors" title="Refresh data">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-xl p-1">
            {(['roster', 'allocation'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === v ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
              >
                {v === 'roster' ? 'Team Roster' : 'Allocations'}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard/teams/add-member')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            title="Add Team Member"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Add Member</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 rounded-2xl p-4 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 bg-${kpi.color}-500/10 rounded-lg`}>
                  <Icon className={`w-4 h-4 text-${kpi.color}-400`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-gray-400 mt-1">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, or skill…"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as TeamMemberRole | 'all')} className="px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50" title="Filter by role">
          <option value="all">All Roles</option>
          {(Object.keys(roleLabel) as TeamMemberRole[]).map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value as TeamDepartment | 'all')} className="px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50" title="Filter by department">
          <option value="all">All Depts</option>
          {(Object.keys(deptLabel) as TeamDepartment[]).map(d => <option key={d} value={d}>{deptLabel[d]}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TeamMemberStatus | 'all')} className="px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50" title="Filter by status">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Filter className="w-3.5 h-3.5" />
          {filtered.length}/{members.length}
        </div>
      </div>

      {view === 'roster' ? (
        <>
          {/* ═══════════ ROSTER VIEW ═══════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(member => {
              const RoleIcon = roleIcon[member.role];
              const allocationColor = member.total_allocation_pct > 100 ? 'red' : member.total_allocation_pct >= 80 ? 'amber' : member.total_allocation_pct >= 50 ? 'blue' : 'emerald';
              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member.id === selectedMember ? null : member.id)}
                  className={`group relative bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border rounded-2xl p-5 transition-all cursor-pointer ${selectedMember === member.id ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-gray-800/50 hover:border-gray-700/50'}`}
                >
                  {/* Status dot */}
                  <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-${statusColor[member.status]}-400`} />
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${statusColor[member.status]}-400/80 to-${statusColor[member.status]}-600/80 flex items-center justify-center text-white font-bold text-lg`}>
                      {member.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{member.full_name}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <RoleIcon className="w-3 h-3" />
                        {roleLabel[member.role]} · {seniorityLabel[member.seniority]}
                      </div>
                    </div>
                  </div>
                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {member.skills.slice(0, 4).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-gray-800/60 border border-gray-700/40 rounded-md text-[10px] text-gray-300 font-medium">{s}</span>
                    ))}
                    {member.skills.length > 4 && <span className="px-2 py-0.5 text-[10px] text-gray-500">+{member.skills.length - 4}</span>}
                  </div>
                  {/* Allocation bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-400">Allocation</span>
                      <span className={`font-semibold text-${allocationColor}-400`}>{member.total_allocation_pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r from-${allocationColor}-500 to-${allocationColor}-400 rounded-full transition-all`} style={{ width: `${Math.min(member.total_allocation_pct, 100)}%` }} />
                    </div>
                  </div>
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-gray-800/30 rounded-lg">
                      <div className="font-bold text-white">{member.active_projects}</div>
                      <div className="text-gray-500">Projects</div>
                    </div>
                    <div className="p-2 bg-gray-800/30 rounded-lg">
                      <div className="font-bold text-white">{member.availability}h</div>
                      <div className="text-gray-500">Avail/wk</div>
                    </div>
                    <div className="p-2 bg-gray-800/30 rounded-lg">
                      <div className="font-bold text-white">${member.hourly_rate}</div>
                      <div className="text-gray-500">Rate/hr</div>
                    </div>
                  </div>
                  {/* Quick actions */}
                  <div className="flex items-center justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedMember(member.id === selectedMember ? null : member.id); }}
                      className="p-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="View member details"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/dashboard/teams/add-member`); }}
                      className="p-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="Add new member"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MEMBER DETAIL SLIDE */}
          {detail && (
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  {detail.full_name} — Project Assignments
                </h3>
                <button onClick={() => setSelectedMember(null)} className="text-sm text-gray-400 hover:text-white" title="Close detail">Close</button>
              </div>
              {detail.allocations.length === 0 ? (
                <p className="text-gray-500 text-sm">No active allocations.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detail.allocations.map(a => (
                    <div key={a.id} className="p-4 bg-gray-800/30 border border-gray-700/40 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{a.project?.name ?? a.project_id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${a.allocation_pct > 70 ? 'amber' : 'emerald'}-500/10 text-${a.allocation_pct > 70 ? 'amber' : 'emerald'}-400 font-semibold`}>{a.allocation_pct}%</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">{a.role_on_project} · {a.start_date?.slice(0, 10)} → {a.end_date?.slice(0, 10) ?? '—'}</div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Hours logged</span>
                        <span className="text-white font-semibold">{a.hours_logged}/{a.hours_estimated}h</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((a.hours_logged / a.hours_estimated) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* ═══════════ ALLOCATION VIEW ═══════════ */
        <>
          {/* Allocation Matrix */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 overflow-x-auto">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Allocation Matrix
            </h3>
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="pb-3 pr-4 font-medium">Member</th>
                  {projects.map(p => (
                    <th key={p.id} className="pb-3 px-2 text-center font-medium whitespace-nowrap">{p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name}</th>
                  ))}
                  <th className="pb-3 pl-4 text-center font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(member => {
                  const totalPct = member.total_allocation_pct;
                  return (
                    <tr key={member.id} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br from-${statusColor[member.status]}-400/80 to-${statusColor[member.status]}-600/80 flex items-center justify-center text-white font-bold text-[10px]`}>
                            {member.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="text-white font-medium">{member.full_name}</div>
                        </div>
                      </td>
                      {projects.map(p => {
                        const alloc = allocations.find(a => a.team_member_id === member.id && a.project_id === p.id && a.status === 'active');
                        return (
                          <td key={p.id} className="py-3 px-2 text-center">
                            {alloc ? (
                              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${alloc.allocation_pct >= 80 ? 'bg-red-500/10 text-red-400' : alloc.allocation_pct >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {alloc.allocation_pct}%
                              </span>
                            ) : (
                              <span className="text-gray-700">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 pl-4 text-center">
                        <span className={`font-bold ${totalPct > 100 ? 'text-red-400' : totalPct >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{totalPct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Workload Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Workload Distribution
              </h3>
              <p className="text-sm text-gray-400 mb-4">Allocated vs available capacity per team member</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workloadBarData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
                  <XAxis type="number" domain={[0, 120]} stroke={COLORS.axis} tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} />
                  <YAxis dataKey="name" type="category" stroke={COLORS.axis} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                  <Bar dataKey="allocated" name="Allocated" stackId="a" fill={COLORS.blue} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="available" name="Available" stackId="a" fill={COLORS.emerald} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                Project Resourcing
              </h3>
              <p className="text-sm text-gray-400 mb-4">Hours estimated vs logged per project</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectAllocationData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="name" stroke={COLORS.axis} tick={{ fontSize: 10 }} />
                  <YAxis stroke={COLORS.axis} tick={{ fontSize: 11 }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                  <Bar dataKey="hoursEstimated" name="Estimated Hrs" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hoursLogged" name="Logged Hrs" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ═════════════ Charts (always visible) ═════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team by Role Pie */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            Team by Role
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={rolePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                {rolePieData.map((_e, i) => <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {rolePieData.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_PALETTE[i % PIE_PALETTE.length] }} />
                <span className="text-gray-400">{r.name}</span>
                <span className="ml-auto font-semibold text-gray-300">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Pie */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            By Department
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={deptPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                {deptPieData.map((_e, i) => <Cell key={i} fill={PIE_PALETTE[(i + 2) % PIE_PALETTE.length]} />)}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {deptPieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_PALETTE[(i + 2) % PIE_PALETTE.length] }} />
                <span className="text-gray-400">{d.name}</span>
                <span className="ml-auto font-semibold text-gray-300">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills Radar */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Brain className="w-5 h-5 text-pink-400" />
            Team Skill Coverage
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={skillRadarData}>
              <PolarGrid stroke={COLORS.grid} />
              <PolarAngleAxis dataKey="skill" tick={{ fill: COLORS.axis, fontSize: 10 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Members" dataKey="count" stroke={COLORS.emerald} fill={COLORS.emerald} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-emerald-900/20 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Team Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Capacity Forecast</span>
                </div>
                <p className="text-xs text-gray-300">
                  {activeCount > 0
                    ? `Team capacity is at ${avgAllocation}% utilisation. You can take on approximately ${Math.max(0, Math.round((100 - avgAllocation) * activeCount / 100))} more full-time project slots this quarter.`
                    : 'No active team members yet. Add members to see capacity insights.'}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">Risk Alerts</span>
                </div>
                <p className="text-xs text-gray-300">
                  {overallocated > 0
                    ? `${overallocated} team member${overallocated > 1 ? 's are' : ' is'} over-allocated (>100%). Consider redistributing workload to avoid burnout.`
                    : onLeaveCount > 0
                      ? `${onLeaveCount} member${onLeaveCount > 1 ? 's are' : ' is'} currently on leave. Ensure project coverage is maintained.`
                      : 'No risk alerts. All team members are within healthy allocation ranges.'}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">Delivery Health</span>
                </div>
                <p className="text-xs text-gray-300">
                  {(() => {
                    const totalEst = membersWithWorkload.reduce((s, m) => s + m.totalEstimated, 0);
                    const totalLog = membersWithWorkload.reduce((s, m) => s + m.totalLogged, 0);
                    const pct = totalEst > 0 ? Math.round((totalLog / totalEst) * 100) : 0;
                    return totalEst > 0
                      ? `Aggregate hours logged are at ${pct}% of estimates across ${activeProjectsCount} active project${activeProjectsCount !== 1 ? 's' : ''}. ${pct >= 80 ? 'Nearing completion targets.' : pct >= 40 ? 'Delivery is progressing on track.' : 'Still in early stages of execution.'}`
                      : 'No hours data available yet. Allocations will populate as projects progress.';
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams;
