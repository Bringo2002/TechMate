
// ============================================================================
// TechMate Database Types - Phase 1 Updated
// TypeScript types matching the Supabase database schema
// NEW: Agency model types added for client_inquiries, proposals, assignments, updates
// ============================================================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            client_inquiries: {
                Row: ClientInquiryRow;
                Insert: ClientInquiryInsert;
                Update: ClientInquiryUpdate;
                Relationships: [];
            };
            profiles: {
                Row: ProfileRow;
                Insert: ProfileInsert;
                Update: ProfileUpdate;
                Relationships: [];
            };
            businesses: {
                Row: BusinessRow;
                Insert: BusinessInsert;
                Update: BusinessUpdate;
                Relationships: [];
            };
            projects: {
                Row: ProjectRow;
                Insert: ProjectInsert;
                Update: ProjectUpdate;
                Relationships: [];
            };
            orders: {
                Row: OrderRow;
                Insert: OrderInsert;
                Update: OrderUpdate;
                Relationships: [];
            };
            deliverables: {
                Row: DeliverableRow;
                Insert: DeliverableInsert;
                Update: DeliverableUpdate;
                Relationships: [];
            };
            invoices: {
                Row: InvoiceRow;
                Insert: InvoiceInsert;
                Update: InvoiceUpdate;
                Relationships: [];
            };
            requests: {
                Row: RequestRow;
                Insert: RequestInsert;
                Update: RequestUpdate;
                Relationships: [];
            };
            responses: {
                Row: ResponseRow;
                Insert: ResponseInsert;
                Update: ResponseUpdate;
                Relationships: [];
            };
            /*
            proposals: {
                Row: ProposalRow;
                Insert: ProposalInsert;
                Update: ProposalUpdate;
                Relationships: [];
            };
            project_assignments: {
                Row: ProjectAssignmentRow;
                Insert: ProjectAssignmentInsert;
                Update: ProjectAssignmentUpdate;
                Relationships: [];
            };
            project_updates: {
                Row: ProjectUpdateRow;
                Insert: ProjectUpdateInsert;
                Update: ProjectUpdateUpdate;
                Relationships: [];
            };
            */
            notifications: {
                Row: NotificationRow;
                Insert: NotificationInsert;
                Update: NotificationUpdate;
                Relationships: [];
            };
            messages: {
                Row: MessageRow;
                Insert: MessageInsert;
                Update: MessageUpdate;
                Relationships: [];
            };
            activity_logs: {
                Row: ActivityLogRow;
                Insert: ActivityLogInsert;
                Update: ActivityLogUpdate;
                Relationships: [];
            };
            admin_metrics: {
                Row: AdminMetricRow;
                Insert: AdminMetricInsert;
                Update: AdminMetricUpdate;
                Relationships: [];
            };
            service_categories: {
                Row: ServiceCategoryRow;
                Insert: ServiceCategoryInsert;
                Update: ServiceCategoryUpdate;
                Relationships: [];
            };
            user_settings: {
                Row: UserSettingsRow;
                Insert: UserSettingsInsert;
                Update: UserSettingsUpdate;
                Relationships: [];
            };
            support_tickets: {
                Row: SupportTicketRow;
                Insert: SupportTicketInsert;
                Update: SupportTicketUpdate;
                Relationships: [];
            };
            team_members: {
                Row: TeamMemberRow;
                Insert: TeamMemberInsert;
                Update: TeamMemberUpdate;
                Relationships: [];
            };
            developer_allocations: {
                Row: DeveloperAllocationRow;
                Insert: DeveloperAllocationInsert;
                Update: DeveloperAllocationUpdate;
                Relationships: [];
            };
            environments: {
                Row: EnvironmentRow;
                Insert: EnvironmentInsert;
                Update: EnvironmentUpdate;
                Relationships: [];
            };
            deployments: {
                Row: DeploymentRow;
                Insert: DeploymentInsert;
                Update: DeploymentUpdate;
                Relationships: [];
            };
            deployment_stages: {
                Row: DeploymentStageRow;
                Insert: DeploymentStageInsert;
                Update: DeploymentStageUpdate;
                Relationships: [];
            };
            deployment_insights: {
                Row: DeploymentInsightRow;
                Insert: DeploymentInsightInsert;
                Update: DeploymentInsightUpdate;
                Relationships: [];
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
            get_deployment_metrics: {
                Args: { days_back?: number };
                Returns: Json;
            };
            get_today_deployment_summary: {
                Args: Record<string, never>;
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
export type InquiryStatus = 'new' | 'reviewing' | 'discovery_call_scheduled' | 'discovery_call_completed' | 'quoted' | 'proposal_sent' | 'accepted' | 'declined' | 'on_hold';
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
export type AssignmentStatus = 'assigned' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'cancelled';
export type ProjectType = 'website' | 'web_app' | 'mobile_app' | 'custom_software' | 'consulting' | 'maintenance' | 'other';
export type UpdateType = 'progress' | 'milestone' | 'blocker' | 'completed' | 'delayed' | 'general';
export type RiskLevel = 'low' | 'medium' | 'high';

// ============================================================================
// PROFILES (Updated)
// ============================================================================
export type ProfileRow = {
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
    internal_role: string | null;
    hourly_rate: number | null;
    availability_hours_per_week: number | null;
    skills: string[] | null;
    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
};

export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at' | 'full_name' | 'avatar_url' | 'username' | 'phone' | 'bio' | 'company' | 'job_title' | 'location' | 'website' | 'last_login_at' | 'internal_role' | 'hourly_rate' | 'availability_hours_per_week' | 'skills' | 'deleted_at' | 'metadata' | 'timezone' | 'user_type' | 'is_admin' | 'is_active' | 'email_verified' | 'role'> & {
    created_at?: string;
    updated_at?: string;
    full_name?: string | null;
    avatar_url?: string | null;
    username?: string | null;
    phone?: string | null;
    bio?: string | null;
    company?: string | null;
    job_title?: string | null;
    location?: string | null;
    website?: string | null;
    last_login_at?: string | null;
    internal_role?: string | null;
    hourly_rate?: number | null;
    availability_hours_per_week?: number | null;
    skills?: string[] | null;
    deleted_at?: string | null;
    metadata?: Json;
    timezone?: string;
    user_type?: UserType;
    is_admin?: boolean;
    is_active?: boolean;
    email_verified?: boolean;
    role?: UserRole;
};

export type ProfileUpdate = Partial<Omit<ProfileRow, 'id' | 'created_at'>>;

// ============================================================================
// BUSINESSES (Unchanged)
// ============================================================================
export type BusinessRow = {
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
};

export type BusinessInsert = Omit<BusinessRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type BusinessUpdate = Partial<Omit<BusinessRow, 'id' | 'created_at'>>;

// ============================================================================
// PROJECTS (Updated)
// ============================================================================
export type ProjectRow = {
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
    // Optional dashboard specific fields (computed or metadata-extracted)
    blockers?: string | null;
    risks?: string[] | null;
    opportunities?: string[] | null;
    techStack?: string[] | null;
    metrics?: { commits: number; prs: number; bugs: number; tests: number } | null;
    nextMilestone?: string | null;
    predictedCompletion?: string | null;
};

export type ProjectInsert = Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type ProjectUpdate = Partial<Omit<ProjectRow, 'id' | 'created_at'>>;

export type ProjectRowWithClient = ProjectRow & {
    profiles?: {
        email: string;
        full_name: string | null;
    } | null;
};

// ============================================================================
// ORDERS (NEWly restored)
// ============================================================================
export type OrderRow = {
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
};

export type OrderInsert = Omit<OrderRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type OrderUpdate = Partial<Omit<OrderRow, 'id' | 'created_at'>>;

// ============================================================================
// CLIENT INQUIRIES (NEW)
// ============================================================================
export type ClientInquiryRow = {
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
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
};

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

export type ClientInquiryWithClient = ClientInquiryRow & {
    client: {
        id: string;
        full_name: string | null;
        email: string;
        company: string | null;
        phone?: string | null;
        avatar_url: string | null;
    } | null;
};

// ============================================================================
// DELIVERABLES (Unchanged)
// ============================================================================
export type DeliverableRow = {
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
};

export type DeliverableInsert = Omit<DeliverableRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type DeliverableUpdate = Partial<Omit<DeliverableRow, 'id' | 'created_at'>>;

// ============================================================================
// INVOICES (Unchanged)
// ============================================================================
export type InvoiceRow = {
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
};

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
export type RequestRow = {
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
};

export type RequestInsert = Omit<RequestRow, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'responses_count'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type RequestUpdate = Partial<Omit<RequestRow, 'id' | 'created_at' | 'views_count' | 'responses_count'>>;

// ============================================================================
// RESPONSES (OLD - Will be deprecated in Phase 7)
// ============================================================================
export type ResponseRow = {
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
};

export type ResponseInsert = Omit<ResponseRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type ResponseUpdate = Partial<Omit<ResponseRow, 'id' | 'created_at'>>;

// ============================================================================
// NOTIFICATIONS (Unchanged)
// ============================================================================
export type NotificationRow = {
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
};

export type NotificationInsert = Omit<NotificationRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type NotificationUpdate = Partial<Pick<NotificationRow, 'is_read' | 'read_at'>>;

// ============================================================================
// MESSAGES (Unchanged)
// ============================================================================
export type MessageRow = {
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
};

export type MessageInsert = {
    id?: string;
    sender_id: string;
    recipient_id: string;
    subject?: string | null;
    content: string;
    thread_id?: string | null;
    request_id?: string | null;
    project_id?: string | null;
    is_read?: boolean;
    read_at?: string | null;
    attachments?: Json;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    metadata?: Json;
};

export type MessageUpdate = Partial<Omit<MessageRow, 'id' | 'created_at'>>;

// ============================================================================
// ACTIVITY LOGS (Unchanged)
// ============================================================================
export type ActivityLogRow = {
    id: string;
    user_id: string | null;
    entity_type: string;
    entity_id: string | null;
    action: string;
    changes: Json;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
};

export type ActivityLogInsert = Omit<ActivityLogRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type ActivityLogUpdate = Partial<Omit<ActivityLogRow, 'id' | 'created_at'>>;

export type ActivityLogRowWithProfile = ActivityLogRow & {
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
        email: string;
    } | null;
};


// ============================================================================
// ADMIN METRICS (Unchanged)
// ============================================================================
export type AdminMetricRow = {
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
};

export type AdminMetricInsert = Omit<AdminMetricRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type AdminMetricUpdate = Partial<Omit<AdminMetricRow, 'id' | 'created_at'>>;

// ============================================================================
// SERVICE CATEGORIES (Unchanged)
// ============================================================================
export type ServiceCategoryRow = {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
};

export type ServiceCategoryInsert = Omit<ServiceCategoryRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type ServiceCategoryUpdate = Partial<Omit<ServiceCategoryRow, 'id' | 'created_at'>>;

// ============================================================================
// USER SETTINGS (Unchanged)
// ============================================================================
export type UserSettingsRow = {
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
};

export type UserSettingsInsert = Omit<UserSettingsRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type UserSettingsUpdate = Partial<Omit<UserSettingsRow, 'id' | 'user_id' | 'created_at'>>;

// ============================================================================
// SUPPORT TICKETS (Unchanged)
// ============================================================================
export type SupportTicketRow = {
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
};

export type SupportTicketInsert = Omit<SupportTicketRow, 'id' | 'created_at' | 'updated_at' | 'description' | 'assigned_to' | 'resolved_at' | 'deleted_at' | 'metadata' | 'status' | 'priority'> & {
    id?: string;
    description?: string | null;
    status?: TicketStatus;
    priority?: TicketPriority;
    assigned_to?: string | null;
    resolved_at?: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    metadata?: Json;
};

export type SupportTicketUpdate = Partial<Omit<SupportTicketRow, 'id' | 'created_at'>>;

// ============================================================================
// Helper Types for Agency Model
// ============================================================================

// Deliverable object structure (used in JSONB fields)
export type Deliverable = {
    id: string;
    name: string;
    description?: string;
    due_date?: string;
    status?: 'pending' | 'in_progress' | 'completed';
};

// Milestone object structure (used in proposals)
export type Milestone = {
    id: string;
    name: string;
    description?: string;
    deadline?: string;
    payment_percentage?: number;
};

// Payment schedule item (used in proposals)
export type PaymentScheduleItem = {
    milestone: string;
    amount: number;
    percentage: number;
    due_date?: string;
};

// Requirement object (used in inquiries)
export type Requirement = {
    id: string;
    description: string;
    priority?: 'must_have' | 'should_have' | 'nice_to_have';
};

// Attachment object (used in multiple tables)
export type Attachment = {
    id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
};

// Statistics return types
export type InquiryStats = {
    total_inquiries: number;
    new_inquiries?: number;
    in_review?: number;
    quoted?: number;
    accepted: number;
    declined: number;
    pending?: number;
    avg_response_time_hours?: number;
};

export type DeveloperStats = {
    total_assignments: number;
    assigned: number;
    in_progress: number;
    review: number;
    completed: number;
    blocked: number;
    total_hours_estimated: number;
    total_hours_actual: number;
    overdue_tasks: number;
};

// ============================================================================
// TEAM MEMBERS
// ============================================================================
export type TeamMemberRole = 'developer' | 'designer' | 'tech_lead' | 'devops' | 'qa' | 'pm';
export type TeamDepartment = 'engineering' | 'design' | 'qa' | 'devops' | 'management';
export type Seniority = 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
export type TeamMemberStatus = 'active' | 'on_leave' | 'inactive';
export type AllocationStatus = 'active' | 'completed' | 'paused' | 'removed';
export type ProjectRoleOnProject = 'developer' | 'lead' | 'reviewer' | 'designer' | 'qa';

export type TeamMemberRow = {
    id: string;
    profile_id: string | null;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: TeamMemberRole;
    department: TeamDepartment;
    seniority: Seniority;
    skills: string[];
    hourly_rate: number;
    availability: number;
    status: TeamMemberStatus;
    joined_at: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type TeamMemberInsert = Omit<TeamMemberRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type TeamMemberUpdate = Partial<Omit<TeamMemberRow, 'id' | 'created_at'>>;

export type DeveloperAllocationRow = {
    id: string;
    team_member_id: string;
    project_id: string;
    role_on_project: ProjectRoleOnProject;
    allocation_pct: number;
    hours_estimated: number;
    hours_logged: number;
    start_date: string | null;
    end_date: string | null;
    status: AllocationStatus;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type DeveloperAllocationInsert = Omit<DeveloperAllocationRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type DeveloperAllocationUpdate = Partial<Omit<DeveloperAllocationRow, 'id' | 'created_at'>>;

// Joined types for UI
export type TeamMemberWithAllocations = TeamMemberRow & {
    allocations: (DeveloperAllocationRow & {
        project?: { id: string; name: string; status: string } | null;
    })[];
    total_allocation_pct: number;
    active_projects: number;
};

export type TeamWorkloadSummary = {
    team_member_id: string;
    full_name: string;
    role: TeamMemberRole;
    department: TeamDepartment;
    seniority: Seniority;
    availability: number;
    member_status: TeamMemberStatus;
    active_projects: number;
    total_allocation_pct: number;
    total_hours_estimated: number;
    total_hours_logged: number;
};

// ============================================================================
// ENVIRONMENTS
// ============================================================================
export type EnvironmentType = 'production' | 'staging' | 'development' | 'preview';
export type EnvironmentStatus = 'healthy' | 'degraded' | 'down' | 'deploying';

export type EnvironmentRow = {
    id: string;
    name: string;
    type: EnvironmentType;
    status: EnvironmentStatus;
    version: string | null;
    url: string | null;
    region: string;
    uptime: number;
    response_time: number;
    error_rate: number;
    traffic: number;
    instances: number;
    last_deployed_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    metadata: Json;
};

export type EnvironmentInsert = Omit<EnvironmentRow, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type EnvironmentUpdate = Partial<Omit<EnvironmentRow, 'id' | 'created_at'>>;

// ============================================================================
// DEPLOYMENTS
// ============================================================================
export type DeploymentStatus = 'pending' | 'building' | 'testing' | 'deploying' | 'success' | 'failed' | 'rolled-back' | 'cancelled';
export type DeploymentStage = 'queue' | 'clone' | 'build' | 'test' | 'deploy' | 'verify' | 'complete';
export type DeploymentTrigger = 'manual' | 'push' | 'merge' | 'schedule' | 'rollback' | 'webhook';

export type DeploymentBuildMetrics = {
    buildTime?: number;
    testsPassed?: number;
    testsTotal?: number;
    coverage?: number;
    bundleSize?: number;
};

export type DeploymentLighthouse = {
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
};

export type DeploymentRow = {
    id: string;
    deploy_number: number;
    project_id: string | null;
    environment_id: string | null;
    project_name: string;
    environment_name: string;
    status: DeploymentStatus;
    progress: number;
    current_stage: DeploymentStage;
    branch: string | null;
    commit_hash: string | null;
    commit_message: string | null;
    triggered_by: string | null;
    triggered_by_name: string | null;
    trigger_type: DeploymentTrigger;
    build_metrics: DeploymentBuildMetrics | Json;
    lighthouse: DeploymentLighthouse | Json;
    started_at: string | null;
    completed_at: string | null;
    duration: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: Json;
};

export type DeploymentInsert = Omit<DeploymentRow, 'id' | 'deploy_number' | 'created_at' | 'updated_at'> & {
    id?: string;
    deploy_number?: number;
    created_at?: string;
    updated_at?: string;
};

export type DeploymentUpdate = Partial<Omit<DeploymentRow, 'id' | 'deploy_number' | 'created_at'>>;

// ============================================================================
// DEPLOYMENT STAGES
// ============================================================================
export type DeploymentStageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export type DeploymentStageRow = {
    id: string;
    deployment_id: string;
    name: string;
    stage_order: number;
    status: DeploymentStageStatus;
    duration: number | null;
    logs: string[] | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    metadata: Json;
};

export type DeploymentStageInsert = Omit<DeploymentStageRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type DeploymentStageUpdate = Partial<Omit<DeploymentStageRow, 'id' | 'created_at' | 'deployment_id'>>;

// ============================================================================
// DEPLOYMENT INSIGHTS
// ============================================================================
export type InsightType = 'prediction' | 'optimization' | 'alert' | 'recommendation';
export type InsightPriority = 'critical' | 'high' | 'medium' | 'low';

export type DeploymentInsightRow = {
    id: string;
    deployment_id: string | null;
    type: InsightType;
    priority: InsightPriority;
    title: string;
    description: string | null;
    impact: string | null;
    confidence: number;
    action_label: string | null;
    is_dismissed: boolean;
    created_at: string;
    metadata: Json;
};

export type DeploymentInsightInsert = Omit<DeploymentInsightRow, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type DeploymentInsightUpdate = Partial<Omit<DeploymentInsightRow, 'id' | 'created_at'>>;

// ============================================================================
// DEPLOYMENT JOINED TYPES (for UI)
// ============================================================================
export type DeploymentWithStages = DeploymentRow & {
    stages: DeploymentStageRow[];
};

export type DeploymentMetricsResult = {
    total_deployments: number;
    successful_deployments: number;
    failed_deployments: number;
    success_rate: number;
    avg_duration: number;
    deploys_today: number;
    active_instances: number;
    total_regions: number;
};

export type TodayDeploymentSummary = {
    total: number;
    success: number;
    failed: number;
    in_progress: number;
    rolled_back: number;
};
