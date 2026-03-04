import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, ArrowLeft, User, Mail, Briefcase, Code2, Star,
  DollarSign, Clock, Shield, Palette, Terminal, Loader2, CheckCircle2,
  AlertCircle, X, Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type {
  TeamMemberRole, TeamDepartment, Seniority, TeamMemberStatus,
} from '../../types/database.types';
import { addTeamMember, type AddTeamMemberPayload } from '../../services/teams.service';

/* ────────────── Options ────────────── */
const ROLES: { value: TeamMemberRole; label: string; icon: React.ElementType }[] = [
  { value: 'developer', label: 'Developer', icon: Code2 },
  { value: 'designer', label: 'Designer', icon: Palette },
  { value: 'tech_lead', label: 'Tech Lead', icon: Star },
  { value: 'devops', label: 'DevOps', icon: Terminal },
  { value: 'qa', label: 'QA', icon: Shield },
  { value: 'pm', label: 'PM', icon: Briefcase },
];

const DEPARTMENTS: { value: TeamDepartment; label: string }[] = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'qa', label: 'QA' },
  { value: 'devops', label: 'DevOps' },
  { value: 'management', label: 'Management' },
];

const SENIORITY_LEVELS: { value: Seniority; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'principal', label: 'Principal' },
];

const STATUS_OPTIONS: { value: TeamMemberStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'emerald' },
  { value: 'on_leave', label: 'On Leave', color: 'amber' },
  { value: 'inactive', label: 'Inactive', color: 'red' },
];

const POPULAR_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust',
  'AWS', 'Azure', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB',
  'GraphQL', 'REST', 'Figma', 'Tailwind CSS', 'Next.js', 'Vue.js',
  'CI/CD', 'Terraform', 'Redis', 'Elasticsearch',
];

/* ────────────── Component ────────────── */
const AddTeamMember: React.FC = () => {
  const navigate = useNavigate();

  // ── Form state ──────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamMemberRole>('developer');
  const [department, setDepartment] = useState<TeamDepartment>('engineering');
  const [seniority, setSeniority] = useState<Seniority>('mid');
  const [status, setStatus] = useState<TeamMemberStatus>('active');
  const [hourlyRate, setHourlyRate] = useState<number>(75);
  const [availability, setAvailability] = useState<number>(40);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Skill management ───────────────────────────────────────────────────
  const toggleSkill = (skill: string) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill],
    );
  };
  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
    }
    setCustomSkill('');
  };
  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('A valid email is required.'); return; }
    if (skills.length === 0) { setError('Select at least one skill.'); return; }

    setSubmitting(true);
    try {
      const payload: AddTeamMemberPayload = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        department,
        seniority,
        status,
        hourly_rate: hourlyRate,
        availability,
        skills,
      };

      await addTeamMember(payload);
      toast.success(`${fullName.trim()} added to the team!`);
      navigate('/dashboard/teams');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add team member';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [fullName, email, role, department, seniority, status, hourlyRate, availability, skills, navigate]);

  /* ═══════════════════════════════════════════ JSX ═══════════════════════════════════════════ */
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/teams')}
          className="p-2 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors"
          title="Back to Teams"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-emerald-400" />
            Add Team Member
          </h1>
          <p className="text-gray-400 mt-1">Add a new member to your team roster</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto" title="Dismiss error">
            <X className="w-4 h-4 text-red-400 hover:text-red-300" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ────── Personal Info ────── */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-300">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* ────── Role & Department ────── */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            Role & Department
          </h2>

          {/* Role selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Role *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ROLES.map(r => {
                const Icon = r.icon;
                const active = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      active
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Department */}
            <div className="space-y-1.5">
              <label htmlFor="department" className="text-sm font-medium text-gray-300">Department *</label>
              <select
                id="department"
                value={department}
                onChange={e => setDepartment(e.target.value as TeamDepartment)}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            {/* Seniority */}
            <div className="space-y-1.5">
              <label htmlFor="seniority" className="text-sm font-medium text-gray-300">Seniority *</label>
              <select
                id="seniority"
                value={seniority}
                onChange={e => setSeniority(e.target.value as Seniority)}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                {SENIORITY_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium text-gray-300">Status *</label>
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value as TeamMemberStatus)}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ────── Compensation & Availability ────── */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Compensation & Availability
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Hourly Rate */}
            <div className="space-y-1.5">
              <label htmlFor="hourlyRate" className="text-sm font-medium text-gray-300">Hourly Rate ($) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="hourlyRate"
                  type="number"
                  min={0}
                  max={500}
                  value={hourlyRate}
                  onChange={e => setHourlyRate(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500">Standard billing rate per hour</p>
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <label htmlFor="availability" className="text-sm font-medium text-gray-300">Availability (hrs/week) *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="availability"
                  type="number"
                  min={0}
                  max={60}
                  value={availability}
                  onChange={e => setAvailability(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500">Maximum hours available per week</p>
            </div>
          </div>
        </div>

        {/* ────── Skills ────── */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            Skills & Expertise
          </h2>

          {/* Selected skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-medium text-emerald-400"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-emerald-300" title={`Remove ${skill}`}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Popular skills chips */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Click to add popular skills:</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.map(skill => {
                const selected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-gray-800/40 border-gray-700/40 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom skill */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
              placeholder="Add a custom skill…"
              className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={addCustomSkill}
              disabled={!customSkill.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* ────── Actions ────── */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/teams')}
            className="px-6 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:border-gray-600 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Add Team Member
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTeamMember;
