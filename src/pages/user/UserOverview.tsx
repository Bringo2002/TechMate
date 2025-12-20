import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Package, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  Calendar,
  Activity,
  ChevronRight,
  Zap,
  DollarSign,
  Sparkles,
  Target,
  Send,
  Brain,
  Code,
  Palette,
  Smartphone,
  Eye,
  TrendingUp,
  Download,
  FileText,
  CreditCard,
  Video,
  HelpCircle,
  CheckSquare,
  AlertCircle,
  ExternalLink,
  Paperclip
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type OrderStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
type UpdateType = 'completed' | 'progress' | 'message' | 'review' | 'warning' | 'live';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type ProjectType = 'website' | 'app' | 'consulting' | 'design' | 'backend' | 'fullstack';

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'warning' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  actionLabel?: string;
}

interface Deliverable {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  fileUrl?: string;
  fileSize?: string;
  fileType?: string;
}

interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  description: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  meetingLink?: string;
}

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: Priority;
  createdAt: string;
  lastUpdate: string;
}

interface Order {
  id: number;
  title: string;
  description?: string;
  status: OrderStatus;
  progress: number;
  dueDate: string;
  lastUpdate: string;
  priority?: Priority;
  category?: string;
  type: ProjectType;
  healthScore: number;
  budget: number;
  spent: number;
  deliverables: Deliverable[];
  nextMilestone?: string;
  invoices?: Invoice[];
  meetings?: Meeting[];
  supportTickets?: SupportTicket[];
}

interface Update {
  id: number;
  type: UpdateType;
  message: string;
  time: string;
  timestamp: Date;
  orderId?: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isLive?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getHealthScoreColor = (score: number): string => {
  if (score >= 80) return 'from-emerald-400 to-green-400';
  if (score >= 60) return 'from-blue-400 to-cyan-400';
  if (score >= 40) return 'from-yellow-400 to-orange-400';
  return 'from-red-400 to-pink-400';
};

const getProjectTypeIcon = (type: ProjectType) => {
  const icons = {
    website: Code,
    app: Smartphone,
    consulting: Brain,
    design: Palette,
    backend: Activity,
    fullstack: Zap
  };
  return icons[type] || Package;
};

const getStatusColor = (status: string) => {
  const colors = {
    completed: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    paid: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    in_progress: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    pending: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    overdue: 'text-red-400 bg-red-500/20 border-red-500/30',
    open: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    resolved: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
  };
  return colors[status as keyof typeof colors] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
};

// ============================================================================
// DELIVERABLES COMPONENT
// ============================================================================

interface DeliverableItemProps {
  deliverable: Deliverable;
}

const DeliverableItem: React.FC<DeliverableItemProps> = ({ deliverable }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-all group">
    <div className="flex items-center gap-3 flex-1">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        deliverable.status === 'completed' 
          ? 'bg-emerald-500/20 border border-emerald-500/30' 
          : 'bg-slate-700/50 border border-slate-600/30'
      }`}>
        {deliverable.status === 'completed' ? (
          <CheckCircle size={18} className="text-emerald-400" />
        ) : (
          <FileText size={18} className="text-gray-400" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-200">{deliverable.name}</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {deliverable.fileSize && deliverable.fileType && 
            `${deliverable.fileType} • ${deliverable.fileSize}`
          }
          {!deliverable.fileSize && `Due ${new Date(deliverable.dueDate).toLocaleDateString()}`}
        </p>
      </div>
    </div>
    {deliverable.status === 'completed' && deliverable.fileUrl && (
      <button className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg flex items-center gap-2 transition-all group-hover:scale-105">
        <Download size={14} />
        Download
      </button>
    )}
    {deliverable.status !== 'completed' && (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(deliverable.status)}`}>
        {deliverable.status === 'in_progress' ? 'In Progress' : 'Pending'}
      </span>
    )}
  </div>
);

// ============================================================================
// INVOICE COMPONENT
// ============================================================================

interface InvoiceItemProps {
  invoice: Invoice;
}

const InvoiceItem: React.FC<InvoiceItemProps> = ({ invoice }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-all group">
    <div className="flex items-center gap-3 flex-1">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        invoice.status === 'paid' 
          ? 'bg-emerald-500/20 border border-emerald-500/30' 
          : invoice.status === 'overdue'
          ? 'bg-red-500/20 border border-red-500/30'
          : 'bg-amber-500/20 border border-amber-500/30'
      }`}>
        <CreditCard size={18} className={
          invoice.status === 'paid' ? 'text-emerald-400' : 
          invoice.status === 'overdue' ? 'text-red-400' : 'text-amber-400'
        } />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-200">{invoice.description}</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {invoice.status === 'paid' 
            ? `Paid ${new Date(invoice.paidDate!).toLocaleDateString()}`
            : `Due ${new Date(invoice.dueDate).toLocaleDateString()}`
          }
        </p>
      </div>
      <div className="text-right mr-4">
        <p className="text-lg font-bold text-gray-200">${invoice.amount.toLocaleString()}</p>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(invoice.status)}`}>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
      </div>
    </div>
    <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-gray-300 text-xs font-medium rounded-lg flex items-center gap-2 transition-all">
      <Download size={14} />
      PDF
    </button>
  </div>
);

// ============================================================================
// MEETING COMPONENT
// ============================================================================

interface MeetingItemProps {
  meeting: Meeting;
}

const MeetingItem: React.FC<MeetingItemProps> = ({ meeting }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-all group">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
        <Video size={18} className="text-indigo-400" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-200">{meeting.title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
        </p>
      </div>
    </div>
    {meeting.meetingLink && (
      <button className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg flex items-center gap-2 transition-all group-hover:scale-105">
        <ExternalLink size={14} />
        Join
      </button>
    )}
  </div>
);

// ============================================================================
// SUPPORT TICKET COMPONENT
// ============================================================================

interface SupportTicketItemProps {
  ticket: SupportTicket;
}

const SupportTicketItem: React.FC<SupportTicketItemProps> = ({ ticket }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-all group cursor-pointer">
    <div className="flex items-center gap-3 flex-1">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        ticket.status === 'resolved' 
          ? 'bg-emerald-500/20 border border-emerald-500/30' 
          : 'bg-amber-500/20 border border-amber-500/30'
      }`}>
        <HelpCircle size={18} className={ticket.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'} />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-200">{ticket.title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">Updated {ticket.lastUpdate}</p>
      </div>
      <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(ticket.status)}`}>
        {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
      </span>
    </div>
    <ChevronRight size={18} className="text-gray-500 ml-2" />
  </div>
);

// ============================================================================
// AI INSIGHTS COMPONENT
// ============================================================================

interface AIInsightCardProps {
  insight: AIInsight;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight }) => {
  const typeStyles = {
    prediction: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30',
    recommendation: 'from-emerald-500/10 to-green-500/10 border-emerald-500/30',
    warning: 'from-amber-500/10 to-orange-500/10 border-amber-500/30',
    opportunity: 'from-purple-500/10 to-pink-500/10 border-purple-500/30'
  };

  const textStyles = {
    prediction: 'text-blue-400',
    recommendation: 'text-emerald-400',
    warning: 'text-amber-400',
    opportunity: 'text-purple-400'
  };

  return (
    <div className={`group relative bg-gradient-to-br ${typeStyles[insight.type]} border rounded-2xl p-5 backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900/50 flex items-center justify-center backdrop-blur-xl">
              <Sparkles size={16} className={textStyles[insight.type]} />
            </div>
            <h4 className={`font-semibold text-sm ${textStyles[insight.type]}`}>{insight.title}</h4>
          </div>
          <span className="text-xs px-3 py-1.5 bg-slate-900/50 backdrop-blur-xl rounded-full font-medium text-gray-400">
            {insight.confidence}%
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">{insight.description}</p>
        {insight.action && (
          <button className="text-xs font-medium px-4 py-2 bg-slate-900/50 hover:bg-slate-800/50 backdrop-blur-xl rounded-xl transition-all flex items-center gap-2 group-hover:gap-3 text-gray-300">
            {insight.actionLabel || 'Take Action'}
            <ChevronRight size={14} className="transition-all" />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// PROJECT CARD
// ============================================================================

interface ProjectCardProps {
  order: Order;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ order, onClick }) => {
  const ProjectIcon = getProjectTypeIcon(order.type);
  const budgetPercentage = (order.spent / order.budget) * 100;

  return (
    <div 
      onClick={onClick}
      className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-900/60 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform duration-300">
              <ProjectIcon size={22} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-gray-100 group-hover:text-indigo-300 transition-all mb-1">
                {order.title}
              </h3>
              <p className="text-xs text-gray-500 font-medium">{order.category}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Progress</span>
            <span className="text-sm font-bold text-gray-200">{order.progress}%</span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden backdrop-blur-xl">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-indigo-500/30"
              style={{ width: `${order.progress}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30 backdrop-blur-xl mb-4">
          <p className="text-xs text-gray-400 mb-2 font-medium">Budget</p>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-base font-bold text-gray-100">${order.spent.toLocaleString()}</span>
            <span className="text-xs text-gray-500">/ ${order.budget.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-700/30 rounded-full h-1.5 overflow-hidden backdrop-blur-xl">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${budgetPercentage > 90 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-emerald-400 to-green-400'}`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
        </div>

        {order.nextMilestone && (
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-3 mb-4 backdrop-blur-xl">
            <p className="text-xs text-indigo-300 font-semibold flex items-center gap-2">
              <Target size={14} />
              Next: {order.nextMilestone}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-slate-700/30">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar size={13} />
            Due {new Date(order.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span className="font-medium">Updated {order.lastUpdate}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LIVE ACTIVITY
// ============================================================================

interface LiveUpdateProps {
  update: Update;
}

const LiveUpdate: React.FC<LiveUpdateProps> = ({ update }) => {
  const Icon = update.icon;
  
  return (
    <div className="group relative flex items-start gap-3 p-4 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl hover:bg-slate-900/60 transition-all duration-300 overflow-hidden hover:scale-[1.02]">
      {update.isLive && (
        <>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50"></div>
        </>
      )}
      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-xl transition-all duration-300 group-hover:scale-110 ${
        update.isLive 
          ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30' 
          : 'bg-slate-800/50 border border-slate-700/30'
      }`}>
        <Icon width={18} height={18} className={update.isLive ? 'text-indigo-400' : 'text-gray-400'} />
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-sm text-gray-300 leading-relaxed font-medium">{update.message}</p>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-xs text-gray-500 font-medium">{update.time}</p>
          {update.isLive && (
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/20 rounded-full backdrop-blur-xl border border-indigo-500/30">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              New
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UserOverview: React.FC = () => {
  const [userName] = useState('Alex');
  const [isLoading, setIsLoading] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'deliverables' | 'invoices' | 'meetings' | 'support'>('deliverables');

  const [activeOrders] = useState<Order[]>([
    { 
      id: 1, 
      title: 'E-commerce Platform Redesign', 
      category: 'Web Development',
      type: 'fullstack',
      status: 'in_progress', 
      progress: 67, 
      dueDate: '2025-01-15', 
      lastUpdate: '2 hours ago',
      priority: 'high',
      healthScore: 85,
      budget: 15000,
      spent: 9800,
      nextMilestone: 'Payment Gateway Integration',
      deliverables: [
        { id: '1', name: 'Homepage Design Mockups', status: 'completed', dueDate: '2025-01-05', fileUrl: '/files/homepage.pdf', fileSize: '2.4 MB', fileType: 'PDF' },
        { id: '2', name: 'Product Catalog Module', status: 'in_progress', dueDate: '2025-01-12' },
        { id: '3', name: 'Payment Integration Docs', status: 'pending', dueDate: '2025-01-15' }
      ],
      invoices: [
        { id: 'INV-001', amount: 5000, status: 'paid', dueDate: '2024-12-01', paidDate: '2024-11-28', description: 'Project Deposit (30%)' },
        { id: 'INV-002', amount: 4800, status: 'paid', dueDate: '2024-12-15', paidDate: '2024-12-14', description: 'Milestone 1 Payment' },
        { id: 'INV-003', amount: 5200, status: 'pending', dueDate: '2025-01-20', description: 'Final Payment (Balance)' }
      ],
      meetings: [
        { id: 'MTG-001', title: 'Weekly Progress Review', date: '2025-01-05', time: '2:00 PM', attendees: ['Project Manager', 'You'], meetingLink: 'https://meet.example.com/abc123' },
        { id: 'MTG-002', title: 'Payment Gateway Discussion', date: '2025-01-08', time: '10:00 AM', attendees: ['Tech Lead', 'You'] }
      ],
      supportTickets: [
        { id: 'TKT-001', title: 'Header logo size adjustment', status: 'resolved', priority: 'low', createdAt: '2024-12-28', lastUpdate: '1 day ago' },
        { id: 'TKT-002', title: 'Mobile menu not collapsing', status: 'in_progress', priority: 'medium', createdAt: '2024-12-30', lastUpdate: '3 hours ago' }
      ]
    },
    { 
      id: 2, 
      title: 'Mobile Banking App', 
      category: 'Mobile Development',
      type: 'app',
      status: 'review', 
      progress: 92, 
      dueDate: '2025-01-10', 
      lastUpdate: '1 day ago',
      priority: 'urgent',
      healthScore: 72,
      budget: 25000,
      spent: 23500,
      nextMilestone: 'Security Audit & Final Approval',
      deliverables: [
        { id: '1', name: 'iOS App Build v1.0', status: 'completed', dueDate: '2024-12-20', fileUrl: '/files/ios-build.zip', fileSize: '45 MB', fileType: 'ZIP' },
        { id: '2', name: 'Android App Build v1.0', status: 'completed', dueDate: '2025-01-05', fileUrl: '/files/android-build.apk', fileSize: '38 MB', fileType: 'APK' },
        { id: '3', name: 'Security Audit Report', status: 'in_progress', dueDate: '2025-01-10' }
      ],
      invoices: [
        { id: 'INV-004', amount: 10000, status: 'paid', dueDate: '2024-11-01', paidDate: '2024-10-28', description: 'Initial Deposit (40%)' },
        { id: 'INV-005', amount: 13500, status: 'paid', dueDate: '2024-12-10', paidDate: '2024-12-08', description: 'Development Milestone' },
        { id: 'INV-006', amount: 1500, status: 'pending', dueDate: '2025-01-15', description: 'Final Testing & Deployment' }
      ],
      meetings: [],
      supportTickets: []
    },
    { 
      id: 3, 
      title: 'Brand Strategy Consulting', 
      category: 'Consulting',
      type: 'consulting',
      status: 'pending', 
      progress: 15, 
      dueDate: '2025-02-01', 
      lastUpdate: '3 days ago',
      priority: 'medium',
      healthScore: 58,
      budget: 8000,
      spent: 1200,
      nextMilestone: 'Market Research Completion',
      deliverables: [
        { id: '1', name: 'Initial Brand Assessment', status: 'completed', dueDate: '2024-12-15', fileUrl: '/files/assessment.pdf', fileSize: '1.8 MB', fileType: 'PDF' },
        { id: '2', name: 'Market Research Report', status: 'in_progress', dueDate: '2025-01-15' },
        { id: '3', name: 'Brand Strategy Document', status: 'pending', dueDate: '2025-02-01' }
      ],
      invoices: [
        { id: 'INV-007', amount: 1200, status: 'paid', dueDate: '2024-12-10', paidDate: '2024-12-09', description: 'Consultation Retainer' },
        { id: 'INV-008', amount: 6800, status: 'pending', dueDate: '2025-02-05', description: 'Final Deliverable Payment' }
      ],
      meetings: [
        { id: 'MTG-003', title: 'Strategy Workshop', date: '2025-01-12', time: '3:00 PM', attendees: ['Strategy Lead', 'You'], meetingLink: 'https://meet.example.com/xyz789' }
      ],
      supportTickets: []
    }
  ]);

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Payment Due Soon',
      description: 'You have an invoice of $5,200 due on January 20th for the E-commerce project. Set up auto-pay to never miss a deadline.',
      confidence: 95,
      action: 'view-invoice',
      actionLabel: 'View Invoice'
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Review Ready',
      description: 'Mobile Banking App builds are complete and awaiting your review. Provide feedback to keep the project moving forward.',
      confidence: 92,
      action: 'review',
      actionLabel: 'Review Now'
    },
    {
      id: '3',
      type: 'prediction',
      title: 'Ahead of Schedule',
      description: 'Your E-commerce project is tracking 3-5 days ahead. This is a great time to discuss additional features or early launch.',
      confidence: 78,
      action: 'view-options',
      actionLabel: 'Explore Options'
    },
    {
      id: '4',
      type: 'opportunity',
      title: 'Ongoing Maintenance Available',
      description: 'Post-launch maintenance packages ensure your app stays secure and up-to-date. 85% of clients add this service.',
      confidence: 81,
      action: 'learn-more',
      actionLabel: 'Learn More'
    }
  ]);

  const [liveUpdates] = useState<Update[]>([
    { 
      id: 1, 
      type: 'completed', 
      message: 'Payment Gateway Integration milestone completed - ready for your review', 
      time: 'Just now',
      timestamp: new Date(),
      orderId: 1,
      icon: CheckCircle,
      isLive: true
    },
    { 
      id: 2, 
      type: 'progress', 
      message: 'Your Mobile Banking App has progressed to 92% completion', 
      time: '5 minutes ago',
      timestamp: new Date(),
      orderId: 2,
      icon: TrendingUp,
      isLive: true
    },
    { 
      id: 3, 
      type: 'message', 
      message: 'Message from your project manager: "Your feedback on the homepage design would be great!"', 
      time: '1 hour ago',
      timestamp: new Date(),
      orderId: 1,
      icon: MessageSquare
    },
    { 
      id: 4, 
      type: 'review', 
      message: 'Checkout Flow Design is ready for your approval', 
      time: '2 hours ago',
      timestamp: new Date(),
      orderId: 1,
      icon: Eye
    },
    { 
      id: 5, 
      type: 'completed', 
      message: 'Brand Strategy initial assessment delivered - view your deliverables', 
      time: '1 day ago',
      timestamp: new Date(),
      orderId: 3,
      icon: CheckCircle
    }
  ]);

  // Aggregate all items for the main sections
  const allDeliverables = activeOrders.flatMap(order => 
    order.deliverables.map(d => ({ ...d, projectTitle: order.title }))
  );
  const allInvoices = activeOrders.flatMap(order => 
    order.invoices?.map(i => ({ ...i, projectTitle: order.title })) || []
  );
  const allMeetings = activeOrders.flatMap(order => 
    order.meetings?.map(m => ({ ...m, projectTitle: order.title })) || []
  );
  const allTickets = activeOrders.flatMap(order => 
    order.supportTickets?.map(t => ({ ...t, projectTitle: order.title })) || []
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center relative">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
          <div className="relative w-20 h-20 border-4 border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-spin mx-auto mb-6" style={{ backgroundClip: 'padding-box' }}>
            <div className="absolute inset-1 bg-slate-950 rounded-full"></div>
          </div>
          <p className="text-gray-300 font-medium text-lg mb-2">Loading your projects...</p>
          <p className="text-sm text-indigo-400 font-medium flex items-center justify-center gap-2">
            <Sparkles size={14} className="animate-pulse" />
            Powered by AI
          </p>
        </div>
      </div>
    );
  }

  const totalBudget = activeOrders.reduce((sum, o) => sum + o.budget, 0);
  const totalSpent = activeOrders.reduce((sum, o) => sum + o.spent, 0);
  const avgHealthScore = Math.round(activeOrders.reduce((sum, o) => sum + o.healthScore, 0) / activeOrders.length);
  const pendingInvoices = allInvoices.filter(inv => inv.status === 'pending');
  const upcomingMeetings = allMeetings.filter(m => new Date(m.date) >= new Date());

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div 
          className="absolute w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
          style={{
            top: '10%',
            left: mousePosition.x * 0.01 + '%',
            transition: 'all 0.3s ease-out'
          }}
        ></div>
        <div 
          className="absolute w-[400px] h-[400px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          style={{
            bottom: '20%',
            right: mousePosition.x * 0.01 + '%',
            transition: 'all 0.3s ease-out'
          }}
        ></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="relative group">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-2 flex items-center gap-3">
                Welcome back, {userName}! 
                <span className="text-3xl">👋</span>
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                Your project health score: 
                <span className="relative inline-flex items-center">
                  <span className="text-indigo-400 font-bold text-xl">{avgHealthScore}/100</span>
                  <Sparkles size={16} className="ml-1 text-amber-400 animate-pulse" />
                </span>
              </p>
            </div>
            <button className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 hover:-translate-y-0.5">
              <Plus size={22} />
              <span>New Project</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-900/60 transition-all duration-500 hover:scale-105 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform duration-300">
                    <Package className="text-indigo-400" size={24} />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                    <TrendingUp size={16} />
                    <span>Active</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1">Your Projects</p>
                <p className="text-4xl font-bold text-gray-100">{activeOrders.length}</p>
              </div>
            </div>
            
            <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-900/60 transition-all duration-500 hover:scale-105 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="text-emerald-400" size={24} />
                  </div>
                  <span className="text-xs text-gray-400 font-medium px-3 py-1 bg-slate-800/50 rounded-full backdrop-blur-xl">
                    {((totalSpent/totalBudget)*100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Investment</p>
                <p className="text-4xl font-bold text-gray-100">
                  ${totalSpent.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">of ${totalBudget.toLocaleString()} budget</p>
              </div>
            </div>
            
            <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-900/60 transition-all duration-500 hover:scale-105 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform duration-300">
                    <Brain className="text-purple-400" size={24} />
                  </div>
                  <Sparkles className="text-amber-400 animate-pulse" size={18} />
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1">Health Score</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {avgHealthScore}
                </p>
                <div className="mt-3 h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${avgHealthScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-900/60 transition-all duration-500 hover:scale-105 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="text-amber-400" size={24} />
                  </div>
                  {upcomingMeetings.length > 0 && (
                    <div className="flex items-center gap-1 text-indigo-400 text-sm font-medium">
                      <Clock size={16} />
                      <span>Soon</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1">Upcoming Meetings</p>
                <p className="text-4xl font-bold text-gray-100">{upcomingMeetings.length}</p>
                {pendingInvoices.length > 0 && (
                  <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {pendingInvoices.length} payment{pendingInvoices.length > 1 ? 's' : ''} due
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          {showAIInsights && aiInsights.length > 0 && (
            <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8 overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center backdrop-blur-xl">
                      <Sparkles size={18} className="text-indigo-400" />
                    </div>
                    AI Insights
                    <span className="text-xs font-normal text-gray-400 ml-2 px-3 py-1.5 bg-slate-800/50 rounded-full backdrop-blur-xl border border-slate-700/30">
                      {aiInsights.length} insights
                    </span>
                  </h2>
                  <button 
                    onClick={() => setShowAIInsights(false)}
                    className="text-sm text-gray-400 hover:text-gray-200 transition-colors px-4 py-2 bg-slate-800/50 hover:bg-slate-800/70 rounded-xl backdrop-blur-xl"
                  >
                    Dismiss All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.map(insight => (
                    <AIInsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Projects */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center backdrop-blur-xl">
                      <Package size={18} className="text-indigo-400" />
                    </div>
                    Your Projects
                  </h2>
                </div>
                <div className="space-y-4">
                  {activeOrders.map(order => (
                    <ProjectCard 
                      key={order.id} 
                      order={order}
                      onClick={() => console.log(`View project ${order.id}`)}
                    />
                  ))}
                </div>
              </div>

              {/* Tabbed Section - Deliverables, Invoices, etc */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8">
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('deliverables')}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === 'deliverables'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800/70 hover:text-gray-200'
                    }`}
                  >
                    <Download size={16} />
                    Deliverables
                  </button>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === 'invoices'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800/70 hover:text-gray-200'
                    }`}
                  >
                    <CreditCard size={16} />
                    Invoices
                    {pendingInvoices.length > 0 && (
                      <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {pendingInvoices.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('meetings')}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === 'meetings'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800/70 hover:text-gray-200'
                    }`}
                  >
                    <Video size={16} />
                    Meetings
                  </button>
                  <button
                    onClick={() => setActiveTab('support')}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === 'support'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800/70 hover:text-gray-200'
                    }`}
                  >
                    <HelpCircle size={16} />
                    Support
                  </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-3">
                  {activeTab === 'deliverables' && (
                    <>
                      {allDeliverables.length > 0 ? (
                        allDeliverables.map((deliverable, idx) => (
                          <DeliverableItem key={`${deliverable.id}-${idx}`} deliverable={deliverable} />
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <FileText size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No deliverables yet</p>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'invoices' && (
                    <>
                      {allInvoices.length > 0 ? (
                        allInvoices.map((invoice, idx) => (
                          <InvoiceItem key={`${invoice.id}-${idx}`} invoice={invoice} />
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No invoices yet</p>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'meetings' && (
                    <>
                      {allMeetings.length > 0 ? (
                        allMeetings.map((meeting, idx) => (
                          <MeetingItem key={`${meeting.id}-${idx}`} meeting={meeting} />
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Video size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No upcoming meetings</p>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'support' && (
                    <>
                      {allTickets.length > 0 ? (
                        allTickets.map((ticket, idx) => (
                          <SupportTicketItem key={`${ticket.id}-${idx}`} ticket={ticket} />
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="mb-4">No support tickets</p>
                          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all">
                            Create New Ticket
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Activity & Messages Column */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center backdrop-blur-xl">
                    <MessageSquare size={18} className="text-indigo-400" />
                  </div>
                  Recent Activity
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {liveUpdates.map(update => (
                    <LiveUpdate key={update.id} update={update} />
                  ))}
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
                  <HelpCircle size={20} className="text-indigo-400" />
                  Need Help?
                </h3>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text"
                    placeholder="Ask a question or report an issue..."
                    className="flex-1 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/20" title="Send Message">
                    <Send size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-slate-800/50 hover:bg-slate-800/70 text-gray-300 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2">
                    <Video size={14} />
                    Schedule Call
                  </button>
                  <button className="px-3 py-2 bg-slate-800/50 hover:bg-slate-800/70 text-gray-300 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2">
                    <FileText size={14} />
                    View Docs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.6);
        }
      `}</style>
    </div>
  );
};

export default UserOverview;