import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, User, Bell, Shield, CreditCard, Palette, 
  Zap, Globe, Code, Database, Lock, Key, Mail, Phone, MapPin,
  Clock, Calendar, Users, Tag, Folder, FileText, Image, Video,
  Download, Upload, Trash2, Save, X, Check, AlertCircle, Info,
  ChevronRight, ChevronDown, Search, Filter, RotateCcw, Copy,
  Eye, EyeOff, Plus, Minus, Edit3, ExternalLink, RefreshCw,
  Smartphone, Monitor, Laptop, Tablet, LogOut, Activity, TrendingUp,
  Package, Terminal, GitBranch, Cloud, Server, Cpu, HardDrive,
  Wifi, Volume2, Moon, Sun, Sparkles, Brain, Target, Award, 
  Fingerprint, Link as LinkIcon, Hash, AtSign, DollarSign, 
  BarChart3, Sliders, Radio, CheckSquare, Command, Webhook,
  GitMerge, Archive, Layers, Box, Boxes, Cpu as CpuIcon,
  HardDrive as Storage, Gauge, BarChart, PieChart, LineChart,
  Flame, Zap as ZapIcon, UserPlus, UserMinus, UserCheck,
  Shield as ShieldIcon, AlertTriangle, CheckCircle, XCircle,
  FileCode, Braces, Variable, Network, Route, Workflow
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  avatar: string;
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  lastTriggered?: string;
}

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  environment: 'production' | 'staging' | 'development' | 'all';
  encrypted: boolean;
}

interface Domain {
  id: string;
  domain: string;
  verified: boolean;
  sslEnabled: boolean;
  environment: string;
  dnsRecords: Array<{ type: string; name: string; value: string }>;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ip: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdvancedVercelSettings() {
  // State Management
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [showAddAPIKey, setShowAddAPIKey] = useState<boolean>(false);
  const [showInviteMember, setShowInviteMember] = useState<boolean>(false);
  const [showAddWebhook, setShowAddWebhook] = useState<boolean>(false);
  const [showAddEnvVar, setShowAddEnvVar] = useState<boolean>(false);
  
  // Mock Data States
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_live_51Hx...xY3z',
      created: '2024-01-15',
      lastUsed: '2 hours ago',
      permissions: ['read', 'write', 'deploy']
    },
    {
      id: '2',
      name: 'Development API',
      key: 'sk_test_51Hx...aB2c',
      created: '2024-02-01',
      lastUsed: '5 days ago',
      permissions: ['read', 'write']
    }
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Brian Mwangi',
      email: 'brian@nyxdev.com',
      role: 'owner',
      avatar: 'BM',
      status: 'active',
      joinedAt: '2023-01-15'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@nyxdev.com',
      role: 'admin',
      avatar: 'SC',
      status: 'active',
      joinedAt: '2023-03-20'
    },
    {
      id: '3',
      name: 'Alex Kim',
      email: 'alex@nyxdev.com',
      role: 'developer',
      avatar: 'AK',
      status: 'active',
      joinedAt: '2023-06-10'
    }
  ]);

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      url: 'https://api.example.com/webhooks',
      events: ['deployment.created', 'deployment.succeeded', 'deployment.failed'],
      secret: 'whsec_***************',
      active: true,
      lastTriggered: '10 minutes ago'
    }
  ]);

  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([
    {
      id: '1',
      key: 'DATABASE_URL',
      value: 'postgresql://***',
      environment: 'production',
      encrypted: true
    },
    {
      id: '2',
      key: 'API_SECRET',
      value: '***************',
      environment: 'all',
      encrypted: true
    }
  ]);

  const [domains, setDomains] = useState<Domain[]>([
    {
      id: '1',
      domain: 'nyxdev.com',
      verified: true,
      sslEnabled: true,
      environment: 'production',
      dnsRecords: [
        { type: 'A', name: '@', value: '76.76.21.21' },
        { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com' }
      ]
    },
    {
      id: '2',
      domain: 'staging.nyxdev.com',
      verified: true,
      sslEnabled: true,
      environment: 'staging',
      dnsRecords: []
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      action: 'API Key Created',
      user: 'brian@nyxdev.com',
      timestamp: '2024-12-21 14:32',
      details: 'Created "Production API" key',
      ip: '102.68.79.12'
    },
    {
      id: '2',
      action: 'Team Member Invited',
      user: 'brian@nyxdev.com',
      timestamp: '2024-12-21 10:15',
      details: 'Invited alex@nyxdev.com as Developer',
      ip: '102.68.79.12'
    }
  ]);

  // ============================================================================
  // CONFIGURATION DATA
  // ============================================================================

  const categories = [
    { id: 'general', name: 'General', icon: User, badge: null },
    { id: 'team', name: 'Team', icon: Users, badge: teamMembers.length },
    { id: 'api', name: 'API Keys', icon: Key, badge: apiKeys.length },
    { id: 'webhooks', name: 'Webhooks', icon: Webhook, badge: webhooks.length },
    { id: 'environment', name: 'Environment', icon: Variable, badge: envVars.length },
    { id: 'domains', name: 'Domains', icon: Globe, badge: domains.length },
    { id: 'integrations', name: 'Integrations', icon: Zap, badge: 12 },
    { id: 'security', name: 'Security', icon: Shield, badge: null },
    { id: 'notifications', name: 'Notifications', icon: Bell, badge: null },
    { id: 'billing', name: 'Billing', icon: CreditCard, badge: null },
    { id: 'usage', name: 'Usage & Limits', icon: Gauge, badge: null },
    { id: 'logs', name: 'Audit Logs', icon: Activity, badge: null },
    { id: 'advanced', name: 'Advanced', icon: Terminal, badge: null }
  ];

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderGeneralSettings = () => (
    <div className="space-y-12">
      {/* Profile Section */}
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Profile</h3>
          <p className="text-sm text-zinc-500">Manage your personal information</p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-zinc-100">Avatar</label>
              <p className="text-sm text-zinc-500">Upload a new avatar or generate one</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-sm font-bold text-white">
                BM
              </div>
              <button className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 rounded-md text-sm font-medium text-zinc-300 transition-all">
                Change
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-zinc-100">Full Name</label>
              <p className="text-sm text-zinc-500">Your display name</p>
            </div>
            <input
              type="text"
              defaultValue="Brian Mwangi"
              title="Full Name Input"
              placeholder="Enter your full name"
              className="w-64 px-3 py-1.5 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-zinc-100">Email</label>
              <p className="text-sm text-zinc-500">Your primary email address</p>
            </div>
            <input
              type="email"
              defaultValue="brian@nyxdev.com"
              title="Email Input"
              placeholder="Enter your email address"
              className="w-64 px-3 py-1.5 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-zinc-100">Username</label>
              <p className="text-sm text-zinc-500">Your unique identifier • nyxdev.com/<span className="text-violet-400">bmwangi</span></p>
            </div>
            <input
              type="text"
              defaultValue="bmwangi"
              title="Username Input"
              placeholder="Enter your username"
              className="w-64 px-3 py-1.5 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 rounded-md text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Preferences</h3>
          <p className="text-sm text-zinc-500">Customize your experience</p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-zinc-100">Theme</label>
              <p className="text-sm text-zinc-500">Choose your interface theme</p>
            </div>
            <div className="flex gap-2">
              {['Light', 'Dark', 'System'].map((theme) => (
                <button
                  key={theme}
                  className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${
                    theme === 'Dark'
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-zinc-100">Timezone</label>
              <p className="text-sm text-zinc-500">Used for timestamps and scheduling</p>
            </div>
            <label htmlFor="timezone-select" className="block text-sm font-medium text-zinc-100">Timezone</label>
            <select id="timezone-select" className="w-64 px-3 py-1.5 bg-black border border-zinc-800 hover:border-zinc-700 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all">
              <option>East Africa Time (GMT+3)</option>
              <option>Eastern Time (GMT-5)</option>
              <option>Pacific Time (GMT-8)</option>
              <option>London (GMT+0)</option>
            </select>
          </div>

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-zinc-100">Language</label>
              <p className="text-sm text-zinc-500">Interface language</p>
            </div>
            <select
              className="w-64 px-3 py-1.5 bg-black border border-zinc-800 hover:border-zinc-700 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              title="Language Selector"
              aria-label="Select Language"
            >
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
              <option>日本語</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 mb-1">Team Members</h3>
          <p className="text-sm text-zinc-500">{teamMembers.length} members in your team</p>
        </div>
        <button
          onClick={() => setShowInviteMember(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="border border-zinc-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-900">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Member</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {teamMembers.map((member) => (
              <tr key={member.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-100">{member.name}</div>
                      <div className="text-xs text-zinc-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    member.role === 'owner' ? 'bg-violet-900/30 text-violet-300 border border-violet-800/50' :
                    member.role === 'admin' ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50' :
                    'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    member.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-zinc-400">{member.joinedAt}</td>
                <td className="px-4 py-4 text-right">
                  <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors" title="More options">
                    <MoreVertical className="w-4 h-4 text-zinc-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Roles & Permissions */}
      <div className="space-y-4">
        <div className="pb-3 border-b border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Roles & Permissions</h3>
          <p className="text-sm text-zinc-500">Control what each role can do</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { role: 'Owner', permissions: ['Full access', 'Manage billing', 'Delete workspace'] },
            { role: 'Admin', permissions: ['Manage team', 'Deploy projects', 'View analytics'] },
            { role: 'Developer', permissions: ['Deploy projects', 'View logs', 'Manage env vars'] },
            { role: 'Viewer', permissions: ['View projects', 'View deployments', 'Read-only access'] }
          ].map((item) => (
            <div key={item.role} className="p-4 border border-zinc-900 rounded-lg">
              <h4 className="text-sm font-semibold text-zinc-100 mb-3">{item.role}</h4>
              <ul className="space-y-2">
                {item.permissions.map((perm, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="w-3 h-3 text-emerald-500" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAPIKeys = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 mb-1">API Keys</h3>
          <p className="text-sm text-zinc-500">Manage your API keys for programmatic access</p>
        </div>
        <button
          onClick={() => setShowAddAPIKey(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </button>
      </div>

      <div className="space-y-4">
        {apiKeys.map((key) => (
          <div key={key.id} className="p-4 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-zinc-100 mb-1">{key.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <code className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-400">
                    {key.key}
                  </code>
                  <button className="p-1 hover:bg-zinc-800 rounded transition-colors" title="More options">
                    <Copy className="w-3 h-3 text-zinc-500" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>Created {key.created}</span>
                  <span>•</span>
                  <span>Last used {key.lastUsed}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 rounded-md text-xs font-medium text-zinc-300 transition-all">
                  Edit
                </button>
                <button className="px-3 py-1.5 border border-red-900/50 text-red-400 hover:bg-red-950/50 hover:border-red-800 rounded-md text-xs font-medium transition-all">
                  Revoke
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {key.permissions.map((perm) => (
                <span key={perm} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* API Documentation */}
      <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-900/30 border border-violet-800/50 rounded-lg">
            <FileCode className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-zinc-100 mb-1">API Documentation</h4>
            <p className="text-sm text-zinc-500 mb-3">Learn how to use the NyxDev API to integrate with your applications</p>
            <a href="#" className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-medium">
              View Documentation
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWebhooks = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 mb-1">Webhooks</h3>
          <p className="text-sm text-zinc-500">Send real-time events to external services</p>
        </div>
        <button
          onClick={() => setShowAddWebhook(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="p-4 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <code className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-400">
                    {webhook.url}
                  </code>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                    webhook.active ? 'bg-emerald-900/30 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${webhook.active ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                    {webhook.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {webhook.lastTriggered && (
                  <p className="text-xs text-zinc-500 mb-2">Last triggered {webhook.lastTriggered}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {webhook.events.map((event) => (
                    <span key={event} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-400">
                      {event}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 rounded-md text-xs font-medium text-zinc-300 transition-all">
                  Test
                </button>
                <button className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 rounded-md text-xs font-medium text-zinc-300 transition-all">
                  Edit
                </button>
                <button className="px-3 py-1.5 border border-red-900/50 text-red-400 hover:bg-red-950/50 hover:border-red-800 rounded-md text-xs font-medium transition-all">
                  Delete
                </button>
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-900">
              <p className="text-xs text-zinc-500">
                Signing Secret: <code className="text-zinc-400 font-mono">{webhook.secret}</code>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEnvironmentVars = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 mb-1">Environment Variables</h3>
          <p className="text-sm text-zinc-500">Manage secrets and configuration</p>
        </div>
        <button
          onClick={() => setShowAddEnvVar(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Variable
        </button>
      </div>

      <div className="border border-zinc-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-900">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Key</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Environment</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {envVars.map((envVar) => (
              <tr key={envVar.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="px-4 py-4">
                  <code className="text-sm font-mono text-zinc-300">{envVar.key}</code>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-zinc-500">{envVar.value}</code>
                    {envVar.encrypted && (
                      <Lock className="w-3 h-3 text-zinc-500" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    envVar.environment === 'production' ? 'bg-red-900/30 text-red-300 border border-red-800/50' :
                    envVar.environment === 'staging' ? 'bg-amber-900/30 text-amber-300 border border-amber-800/50' :
                    envVar.environment === 'development' ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50' :
                    'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}>
                    {envVar.environment}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors" title="View Details">
                      <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                    <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors" title="More options">
                      <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                    <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors" title="More options">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDomains = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 mb-1">Custom Domains</h3>
          <p className="text-sm text-zinc-500">Connect your domains to deployments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Domain
        </button>
      </div>

      <div className="space-y-4">
        {domains.map((domain) => (
          <div key={domain.id} className="p-4 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-zinc-100">{domain.domain}</h4>
                  {domain.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-900/30 text-emerald-300 border border-emerald-800/50 rounded text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  {domain.sslEnabled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-900/30 text-blue-300 border border-blue-800/50 rounded text-xs font-medium">
                      <Lock className="w-3 h-3" />
                      SSL
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">Environment: {domain.environment}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 rounded-md text-xs font-medium text-zinc-300 transition-all">
                  DNS Records
                </button>
                <button className="px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 rounded-md text-xs font-medium text-zinc-300 transition-all">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-zinc-100 mb-1">Integrations</h3>
        <p className="text-sm text-zinc-500">Connect third-party services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'GitHub', description: 'Deploy from repositories', connected: true, icon: GitBranch },
          { name: 'Slack', description: 'Get notifications in Slack', connected: true, icon: Hash },
          { name: 'Vercel', description: 'Deploy to Vercel', connected: true, icon: Terminal },
          { name: 'Google Analytics', description: 'Track visitors', connected: false, icon: BarChart3 },
          { name: 'Sentry', description: 'Error monitoring', connected: true, icon: AlertTriangle },
          { name: 'Stripe', description: 'Payment processing', connected: false, icon: CreditCard },
          { name: 'AWS', description: 'Cloud infrastructure', connected: true, icon: Cloud },
          { name: 'Datadog', description: 'Performance monitoring', connected: false, icon: Activity }
        ].map((integration) => {
          const Icon = integration.icon;
          return (
            <div key={integration.name} className="p-4 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <Icon className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">{integration.name}</h4>
                    <p className="text-xs text-zinc-500">{integration.description}</p>
                  </div>
                </div>
                <button className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  integration.connected
                    ? 'border border-red-900/50 text-red-400 hover:bg-red-950/50'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}>
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-zinc-100 mb-1">Audit Logs</h3>
        <p className="text-sm text-zinc-500">View account activity and security events</p>
      </div>

      <div className="border border-zinc-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-900">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">IP Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-zinc-100">{log.action}</td>
                <td className="px-4 py-4 text-sm text-zinc-400">{log.user}</td>
                <td className="px-4 py-4 text-sm text-zinc-500">{log.details}</td>
                <td className="px-4 py-4 text-sm font-mono text-zinc-500">{log.ip}</td>
                <td className="px-4 py-4 text-sm text-zinc-500">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <button className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 rounded-md text-sm font-medium text-zinc-300 transition-all">
          Load More
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex">
      {/* LEFT SIDEBAR */}
      <div className="w-64 border-r border-zinc-900 flex flex-col">
        <div className="p-6 border-b border-zinc-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-100">Settings</h1>
              <p className="text-xs text-zinc-500">NyxDev Platform</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-zinc-700 rounded-md text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </div>
                {category.badge !== null && (
                  <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-semibold rounded">
                    {category.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900/50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white">
              BM
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-100 truncate">Brian Mwangi</div>
              <div className="text-xs text-zinc-500 truncate">brian@nyxdev.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-100 mb-1">
                {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-sm text-zinc-500">
                Manage your {categories.find(c => c.id === selectedCategory)?.name.toLowerCase()}
              </p>
            </div>

            {hasChanges && (
              <button
                onClick={() => setHasChanges(false)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl px-8 py-8">
            {selectedCategory === 'general' && renderGeneralSettings()}
            {selectedCategory === 'team' && renderTeamSettings()}
            {selectedCategory === 'api' && renderAPIKeys()}
            {selectedCategory === 'webhooks' && renderWebhooks()}
            {selectedCategory === 'environment' && renderEnvironmentVars()}
            {selectedCategory === 'domains' && renderDomains()}
            {selectedCategory === 'integrations' && renderIntegrations()}
            {selectedCategory === 'logs' && renderAuditLogs()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for MoreVertical icon
function MoreVertical({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}