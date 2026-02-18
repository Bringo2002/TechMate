// ============================================================================
// TechMate Database Types - Phase 1 Updated
// TypeScript types matching the Supabase database schema
// NEW: Agency model types added for client_inquiries, proposals, assignments, updates
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Json = any;

// ============================================================================
// Database Schema Type (for typed Supabase client)
// ============================================================================
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: ProfileRow;
                Insert: ProfileInsert;
                Update: ProfileUpdate;
            };
            businesses: {
                Row: BusinessRow;
                Insert: BusinessInsert;
                Update: BusinessUpdate;
            };
            projects: {
                Row: ProjectRow;
                Insert: ProjectInsert;
                Update: ProjectUpdate;
            };
            orders: {
                Row: OrderRow;
                Insert: OrderInsert;
                Update: OrderUpdate;
            };
            deliverables: {
                Row: DeliverableRow;
                Insert: DeliverableInsert;
                Update: DeliverableUpdate;
            };
            invoices: {
                Row: InvoiceRow;
                Insert: InvoiceInsert;
                Update: InvoiceUpdate;
            };
            // OLD marketplace tables (will be deprecated in Phase 7)
            requests: {
                Row: RequestRow;
                Insert: RequestInsert;
                Update: RequestUpdate;
            };
            responses: {
                Row: ResponseRow;
                Insert: ResponseInsert;
                Update: ResponseUpdate;
            };
            // NEW agency model tables
            client_inquiries: {
                Row: ClientInquiryRow;
                Insert: ClientInquiryInsert;
                Update: ClientInquiryUpdate;
            };
            proposals: {
                Row: ProposalRow;
                Insert: ProposalInsert;
                Update: ProposalUpdate;
            };
            project_assignments: {
                Row: ProjectAssignmentRow;
                Insert: ProjectAssignmentInsert;
                Update: ProjectAssignmentUpdate;
            };
            project_updates: {
                Row: ProjectUpdateRow;
                Insert: ProjectUpdateInsert;
                Update: ProjectUpdateUpdate;
            };
            // Other tables
            notifications: {
                Row: NotificationRow;
                Insert: NotificationInsert;
                Update: NotificationUpdate;
            };
            messages: {
                Row: MessageRow;
                Insert: MessageInsert;
                Update: MessageUpdate;
            };
            activity_logs: {
                Row: ActivityLogRow;
                Insert: ActivityLogInsert;
                Update: never;
            };
            admin_metrics: {
                Row: AdminMetricRow;
                Insert: AdminMetricInsert;
                Update: AdminMetricUpdate;
            };
            service_categories: {
                Row: ServiceCategoryRow;
                Insert: ServiceCategoryInsert;
                Update: ServiceCategoryUpdate;
            };
            user_settings: {
                Row: UserSettingsRow;
                Insert: UserSettingsInsert;
                Update: UserSettingsUpdate;
            };
            support_tickets: {
                Row: SupportTicketRow;
                Insert: SupportTicketInsert;
                Update: SupportTicketUpdate;
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            get_admin_metrics: {
                Args: Record<string, never>;
                Returns: Json;
            };
            get_user_stats: {
                Args: { p_user_id: string };
                Returns: Json;
            };
            get_user_growth: {
                Args: { p_months: number };
                Returns: { month: string; count: number }[];
            };
            get_revenue_by_month: {
                Args: { p_months: number };
                Returns: { month: string; revenue: number }[];
            };
            is_admin: {
                Args: Record<string, never>;
                Returns: boolean;
            };
            // NEW functions
            get_inquiry_stats: {
                Args: { p_user_id?: string | null };
                Returns: Json;
            };
            get_developer_stats: {
                Args: { p_developer_id: string };
                Returns: Json;
            };
        };
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
};

// ============================================================================
// Enum Types (Updated)
// ============================================================================
export type UserRole = 'user' | 'admin' | 'moderator';

// UPDATED: New user types for agency model
export type UserType = 'client' | 'admin' | 'technical_lead' | 'developer' | 'designer';

export type ProjectStatus = 'planning' | 'active' | 'review' | 'completed' | 'on_hold' | 'cancelled';
export type OrderStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
export type OrderType = 'website' | 'app' | 'consulting' | 'design' | 'backend' | 'fullstack';
export type Priority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type RequestStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ResponseStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type DeliverableStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'rejected';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type TicketCategory = 'general' | 'billing' | 'technical' | 'account' | 'feature_request';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type Theme = 'dark' | 'light' | 'system';

// NEW: Agency model specific enums
export type InquiryStatus = 'new' | 'reviewing' | 'discovery_call_scheduled' | 'discovery_call_completed' | 'quoted' | 'proposal_sent' | 'accepted' | 'declined' | 'on_hold';
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
export type AssignmentStatus = 'assigned' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'cancelled';
export type ProjectType = 'website' | 'web_app' | 'mobile_app' | 'custom_software' | 'consulting' | 'maintenance' | 'other';
export type UpdateType = 'progress' | 'milestone' | 'blocker' | 'completed' | 'delayed' | 'general';
export type RiskLevel = 'low' | 'medium' | 'high';

// ============================================================================
// PROFILES (Updated)
// ============================================================================
export interface ProfileRow {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
    phone: string | null;
    bio: string | null;
    company: string | null;
    job_title: string | null;
    location: string | null;
    website: string | null;
    timezone: string;
    role: UserRole;
    user_type: UserType;
    is_admin: boolean;
    is_active: boolean;
    email_verified: boolean;
    last_login_at: string | null;
    // NEW: Agency model fields
    internal_role: string | null; // 'founder', 'senior_dev', 'junior_dev', etc.
    hourly_rate: number | null; // For internal cost tracking
    availability_hours_per_week: number | null;
    skills: string[] | null;
    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'> & {
    created_at?: string;
    updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<ProfileRow, 'id' | 'created_at'>>;

// ============================================================================
// BUSINESSES (Unchanged)
// ============================================================================
export interface BusinessRow {
    id: string;
    owner_id: string;
    name: string;
    industry: string | null;
    description: string | null;
    website: string | null;
    logo_url: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type BusinessInsert = Omit<BusinessRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type BusinessUpdate = Partial<Omit<BusinessRow, 'id' | 'created_at'>>;

// ============================================================================
// PROJECTS (Updated)
// ============================================================================
export interface ProjectRow {
    id: string;
    user_id: string; // This is the client_id
    business_id: string | null;
    name: string;
    client: string | null;
    type: string;
    description: string | null;
    budget: number;
    spent: number;
    deadline: string | null;
    status: ProjectStatus;
    priority: Priority;
    progress: number; // Internal progress
    health_score: number;
    technologies: string[];
    deliverables: Json;
    payment_status: PaymentStatus;
    started_at: string | null;
    completed_at: string | null;
    // NEW: Agency model fields
    inquiry_id: string | null;
    proposal_id: string | null;
    technical_lead_id: string | null;
    client_visible_progress: number; // What client sees (may differ from internal progress)
    internal_notes: string | null; // Private notes not visible to client
    risk_level: RiskLevel | null;
    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type ProjectInsert = Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type ProjectUpdate = Partial<Omit<ProjectRow, 'id' | 'created_at'>>;

// ============================================================================
// CLIENT INQUIRIES (NEW)
// ============================================================================
export interface ClientInquiryRow {
    id: string;
    client_id: string;
    // Inquiry details
    project_type: ProjectType;
    title: string;
    description: string;
    // Budget
    budget_range: string | null;
    budget_min: number | null;
    budget_max: number | null;
    preferred_timeline: string | null;
    deadline: string | null;
    // Workflow
    status: InquiryStatus;
    assigned_to: string | null;
    priority: Priority | null;
    // Additional info
    requirements: Json; // Array of requirement objects
    attachments: Json; // Array of attachment objects
    source: string | null;
    // Tracking
    viewed_by_admin_at: string | null;
    first_response_at: string | null;
    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type ClientInquiryInsert = {
    id?: string;
    client_id: string;
    project_type: ProjectType;
    title: string;
    description: string;
    budget_range?: string | null;
    budget_min?: number | null;
    budget_max?: number | null;
    preferred_timeline?: string | null;
    deadline?: string | null;
    status?: InquiryStatus;
    assigned_to?: string | null;
    priority?: Priority | null;
    requirements?: Json;
    attachments?: Json;
    source?: string | null;
    viewed_by_admin_at?: string | null;
    first_response_at?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    metadata?: Json;
};

export type ClientInquiryUpdate = Partial<Omit<ClientInquiryRow, 'id' | 'created_at'>>;

// ============================================================================
// PROPOSALS (NEW)
// ============================================================================
export interface ProposalRow {
    id: string;
    inquiry_id: string | null;
    proposal_number: string;
    created_by: string;
    // Proposal content
    title: string;
    executive_summary: string | null;
    scope_of_work: string;
    deliverables: Json; // Array of deliverable objects
    timeline_weeks: number;
    milestones: Json; // Array of milestone objects
    assumptions: string | null;
    exclusions: string | null;
    // Pricing
    total_cost: number;
    payment_schedule: Json | null;
    payment_terms: string | null;
    currency: string;
    // Status
    status: ProposalStatus;
    sent_at: string | null;
    viewed_at: string | null;
    responded_at: string | null;
    expires_at: string | null;
    // Client response
    client_notes: string | null;
    rejection_reason: string | null;
    // Version control
    version: number;
    previous_version_id: string | null;
    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type ProposalInsert = Omit<ProposalRow, 'id' | 'proposal_number' | 'created_at' | 'updated_at' | 'version'> & {
    id?: string;
    proposal_number?: string;
    version?: number;
    created_at?: string;
    updated_at?: string;
};

export type ProposalUpdate = Partial<Omit<ProposalRow, 'id' | 'proposal_number' | 'created_at'>>;

// ============================================================================
// PROJECT ASSIGNMENTS (NEW)
// ============================================================================
export interface ProjectAssignmentRow {
    id: string;
    project_id: string;
    assigned_to: string;
    assigned_by: string;
    // Assignment details
    role: string;
    task_description: string | null;
    // Time tracking
    hours_estimated: number | null;
    hours_actual: number;
    // Status
    status: AssignmentStatus;
    priority: Priority | null;
    // Dates
    start_date: string | null;
    due_date: string | null;
    completed_at: string | null;
    // Notes
    notes: string | null;
    blocker_description: string | null;
    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type ProjectAssignmentInsert = Omit<ProjectAssignmentRow, 'id' | 'created_at' | 'updated_at' | 'hours_actual'> & {
    id?: string;
    hours_actual?: number;
    created_at?: string;
    updated_at?: string;
};

export type ProjectAssignmentUpdate = Partial<Omit<ProjectAssignmentRow, 'id' | 'created_at' | 'assigned_by'>>;

// ============================================================================
// PROJECT UPDATES (NEW)
// ============================================================================
export interface ProjectUpdateRow {
    id: string;
    project_id: string;
    created_by: string;
    // Update content
    title: string;
    content: string;
    update_type: UpdateType | null;
    // Visibility
    is_visible_to_client: boolean;
    // Attachments
    attachments: Json;
    // Timestamps
    created_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type ProjectUpdateInsert = Omit<ProjectUpdateRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type ProjectUpdateUpdate = Partial<Omit<ProjectUpdateRow, 'id' | 'created_at' | 'created_by'>>;

// ============================================================================
// ORDERS (Unchanged)
// ============================================================================
export interface OrderRow {
    id: string;
    user_id: string;
    project_id: string | null;
    title: string;
    description: string | null;
    category: string | null;
    type: OrderType;
    status: OrderStatus;
    progress: number;
    priority: Priority;
    budget: number;
    spent: number;
    health_score: number;
    due_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    next_milestone: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type OrderInsert = Omit<OrderRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type OrderUpdate = Partial<Omit<OrderRow, 'id' | 'created_at'>>;

// ============================================================================
// DELIVERABLES (Unchanged)
// ============================================================================
export interface DeliverableRow {
    id: string;
    order_id: string | null;
    project_id: string | null;
    name: string;
    description: string | null;
    status: DeliverableStatus;
    file_url: string | null;
    file_size: number | null;
    file_type: string | null;
    file_name: string | null;
    due_date: string | null;
    completed_at: string | null;
    version: number;
    notes: string | null;
    created_by: string | null;
    reviewed_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type DeliverableInsert = Omit<DeliverableRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type DeliverableUpdate = Partial<Omit<DeliverableRow, 'id' | 'created_at'>>;

// ============================================================================
// INVOICES (Unchanged)
// ============================================================================
export interface InvoiceRow {
    id: string;
    invoice_number: string;
    user_id: string;
    order_id: string | null;
    project_id: string | null;
    amount: number;
    tax_amount: number;
    total_amount: number; // computed column
    currency: string;
    status: InvoiceStatus;
    due_date: string | null;
    sent_date: string | null;
    paid_date: string | null;
    payment_method: string | null;
    payment_reference: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type InvoiceInsert = Omit<InvoiceRow, 'id' | 'invoice_number' | 'total_amount' | 'created_at' | 'updated_at'> & {
    id?: string;
    invoice_number?: string;
    created_at?: string;
    updated_at?: string;
};

export type InvoiceUpdate = Partial<Omit<InvoiceRow, 'id' | 'invoice_number' | 'total_amount' | 'created_at'>>;

// ============================================================================
// REQUESTS (OLD - Will be deprecated in Phase 7)
// ============================================================================
export interface RequestRow {
    id: string;
    requester_id: string;
    business_id: string | null;
    title: string;
    description: string | null;
    category: string | null;
    type: string | null;
    budget: number | null;
    currency: string;
    deadline: string | null;
    priority: Priority;
    status: RequestStatus;
    requirements: Json;
    attachments: Json;
    accepted_response_id: string | null;
    views_count: number;
    responses_count: number;
    is_public: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type RequestInsert = Omit<RequestRow, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'responses_count'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type RequestUpdate = Partial<Omit<RequestRow, 'id' | 'created_at' | 'views_count' | 'responses_count'>>;

// ============================================================================
// RESPONSES (OLD - Will be deprecated in Phase 7)
// ============================================================================
export interface ResponseRow {
    id: string;
    request_id: string;
    responder_id: string;
    proposal: string | null;
    price_offer: number | null;
    currency: string;
    estimated_duration: string | null;
    estimated_completion_date: string | null;
    status: ResponseStatus;
    attachments: Json;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type ResponseInsert = Omit<ResponseRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type ResponseUpdate = Partial<Omit<ResponseRow, 'id' | 'created_at'>>;

// ============================================================================
// NOTIFICATIONS (Unchanged)
// ============================================================================
export interface NotificationRow {
    id: string;
    user_id: string;
    title: string;
    message: string | null;
    type: NotificationType;
    category: string | null;
    link: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    metadata: Json;
}

export type NotificationInsert = Omit<NotificationRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type NotificationUpdate = Partial<Pick<NotificationRow, 'is_read' | 'read_at'>>;

// ============================================================================
// MESSAGES (Unchanged)
// ============================================================================
export interface MessageRow {
    id: string;
    sender_id: string;
    recipient_id: string;
    subject: string | null;
    content: string;
    thread_id: string | null;
    request_id: string | null;
    project_id: string | null;
    is_read: boolean;
    read_at: string | null;
    attachments: Json;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type MessageInsert = Omit<MessageRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type MessageUpdate = Partial<Omit<MessageRow, 'id' | 'created_at'>>;

// ============================================================================
// ACTIVITY LOGS (Unchanged)
// ============================================================================
export interface ActivityLogRow {
    id: string;
    user_id: string | null;
    entity_type: string;
    entity_id: string | null;
    action: string;
    changes: Json;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

export type ActivityLogInsert = Omit<ActivityLogRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

// ============================================================================
// ADMIN METRICS (Unchanged)
// ============================================================================
export interface AdminMetricRow {
    id: string;
    metric_date: string;
    total_users: number;
    active_users: number;
    new_users: number;
    total_projects: number;
    active_projects: number;
    total_orders: number;
    completed_orders: number;
    total_revenue: number;
    pending_revenue: number;
    total_requests: number;
    open_requests: number;
    created_at: string;
    updated_at: string;
    metadata: Json;
}

export type AdminMetricInsert = Omit<AdminMetricRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type AdminMetricUpdate = Partial<Omit<AdminMetricRow, 'id' | 'created_at'>>;

// ============================================================================
// SERVICE CATEGORIES (Unchanged)
// ============================================================================
export interface ServiceCategoryRow {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

export type ServiceCategoryInsert = Omit<ServiceCategoryRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type ServiceCategoryUpdate = Partial<Omit<ServiceCategoryRow, 'id' | 'created_at'>>;

// ============================================================================
// USER SETTINGS (Unchanged)
// ============================================================================
export interface UserSettingsRow {
    id: string;
    user_id: string;
    theme: Theme;
    color_mode: 'vibrant' | 'minimal';
    ai_personality: 'creative' | 'precise' | 'balanced';
    ai_voice: boolean;
    reduce_motion: boolean;
    high_contrast: boolean;
    data_usage: 'low' | 'standard' | 'high';
    auto_save: boolean;
    language: string;
    notification_email: boolean;
    notification_push: boolean;
    notification_sms: boolean;
    created_at: string;
    updated_at: string;
}

export type UserSettingsInsert = Omit<UserSettingsRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type UserSettingsUpdate = Partial<Omit<UserSettingsRow, 'id' | 'user_id' | 'created_at'>>;

// ============================================================================
// SUPPORT TICKETS (Unchanged)
// ============================================================================
export interface SupportTicketRow {
    id: string;
    user_id: string;
    subject: string;
    description: string | null;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    assigned_to: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
}

export type SupportTicketInsert = Omit<SupportTicketRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type SupportTicketUpdate = Partial<Omit<SupportTicketRow, 'id' | 'created_at'>>;

// ============================================================================
// Helper Types for Agency Model
// ============================================================================

// Deliverable object structure (used in JSONB fields)
export interface Deliverable {
    id: string;
    name: string;
    description?: string;
    due_date?: string;
    status?: 'pending' | 'in_progress' | 'completed';
}

// Milestone object structure (used in proposals)
export interface Milestone {
    id: string;
    name: string;
    description?: string;
    deadline?: string;
    payment_percentage?: number;
}

// Payment schedule item (used in proposals)
export interface PaymentScheduleItem {
    milestone: string;
    amount: number;
    percentage: number;
    due_date?: string;
}

// Requirement object (used in inquiries)
export interface Requirement {
    id: string;
    description: string;
    priority?: 'must_have' | 'should_have' | 'nice_to_have';
}

// Attachment object (used in multiple tables)
export interface Attachment {
    id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
}

// Statistics return types
export interface InquiryStats {
    total_inquiries: number;
    new_inquiries?: number;
    in_review?: number;
    quoted?: number;
    accepted: number;
    declined: number;
    pending?: number;
    avg_response_time_hours?: number;
}

export interface DeveloperStats {
    total_assignments: number;
    assigned: number;
    in_progress: number;
    review: number;
    completed: number;
    blocked: number;
    total_hours_estimated: number;
    total_hours_actual: number;
    overdue_tasks: number;
}