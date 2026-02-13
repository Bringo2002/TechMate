// ============================================================================
// TechMate Database Types
// TypeScript types matching the Supabase database schema
// ============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================================================
// Database Schema Type (for typed Supabase client)
// ============================================================================
export interface Database {
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
                Args: { p_months?: number };
                Returns: { month: string; count: number }[];
            };
            get_revenue_by_month: {
                Args: { p_months?: number };
                Returns: { month: string; revenue: number }[];
            };
            is_admin: {
                Args: Record<string, never>;
                Returns: boolean;
            };
        };
    };
}

// ============================================================================
// Enum Types
// ============================================================================
export type UserRole = 'user' | 'admin' | 'moderator';
export type UserType = 'individual' | 'business_owner' | 'developer' | 'admin';
export type ProjectStatus = 'planning' | 'active' | 'review' | 'completed' | 'cancelled' | 'held';
export type OrderStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
export type OrderType = 'website' | 'app' | 'consulting' | 'design' | 'backend' | 'fullstack';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
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

// ============================================================================
// PROFILES
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
// BUSINESSES
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
// PROJECTS
// ============================================================================
export interface ProjectRow {
    id: string;
    user_id: string;
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
    progress: number;
    health_score: number;
    technologies: string[];
    deliverables: Json;
    payment_status: PaymentStatus;
    started_at: string | null;
    completed_at: string | null;
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
// ORDERS
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
// DELIVERABLES
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
// INVOICES
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
// REQUESTS
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
// RESPONSES
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
// NOTIFICATIONS
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
// MESSAGES
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
// ACTIVITY LOGS
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
// ADMIN METRICS
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
// SERVICE CATEGORIES
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
// USER SETTINGS
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
// SUPPORT TICKETS
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
