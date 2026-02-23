import type {
    ProjectStatus,
    Priority,
    ProjectType,
    OrderStatus,
    OrderType,
    InvoiceStatus,
    RequestStatus,
    InquiryStatus,
    TicketStatus,
    TicketCategory,
    TicketPriority,
    UserRole,
    UserType
} from './database.types';

// ============================================================================
// Pagination
// ============================================================================
export interface PaginationParams {
    page?: number;
    pageSize?: number;
    offset?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
}

// ============================================================================
// Sorting
// ============================================================================
export interface SortParams {
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

// ============================================================================
// Filters
// ============================================================================
export interface DateRangeFilter {
    from?: string;
    to?: string;
}

export interface ProjectFilters {
    status?: ProjectStatus;
    priority?: Priority;
    type?: ProjectType | string;
    search?: string;
    userId?: string;
    dateRange?: DateRangeFilter;
}

export interface OrderFilters {
    status?: OrderStatus;
    priority?: Priority;
    type?: OrderType;
    search?: string;
    userId?: string;
    dateRange?: DateRangeFilter;
}

export interface UserFilters {
    role?: UserRole;
    userType?: UserType;
    isActive?: boolean;
    search?: string;
    dateRange?: DateRangeFilter;
}

export interface InvoiceFilters {
    status?: InvoiceStatus;
    userId?: string;
    dateRange?: DateRangeFilter;
}

export interface RequestFilters {
    status?: RequestStatus;
    category?: string;
    priority?: Priority;
    isPublic?: boolean;
    search?: string;
    dateRange?: DateRangeFilter;
}

export interface NotificationFilters {
    type?: string;
    isRead?: boolean;
    category?: string;
}

export interface MessageFilters {
    search?: string;
    isRead?: boolean;
    contactId?: string;
}

export interface TicketFilters {
    status?: TicketStatus;
    category?: TicketCategory;
    priority?: TicketPriority;
    search?: string;
}

export interface InquiryFilters {
    status?: InquiryStatus;
    assigned_to?: string;
    priority?: Priority;
    project_type?: ProjectType;
}

// ============================================================================
// Query Options (combines pagination, sorting, filtering)
// ============================================================================
export interface QueryOptions<TFilter = Record<string, unknown>> {
    pagination?: PaginationParams;
    sort?: SortParams;
    filters?: TFilter;
}

// ============================================================================
// Service Response Wrapper
// ============================================================================
export interface ServiceResponse<T> {
    data: T | null;
    error: ServiceError | null;
    count?: number;
}

export interface ServiceError {
    code: string;
    message: string;
    details?: string;
    hint?: string;
    statusCode?: number;
}

// ============================================================================
// Admin Dashboard Metrics
// ============================================================================
export interface AdminDashboardMetrics {
    total_users: number;
    active_users: number;
    new_users_this_month: number;
    total_projects: number;
    active_projects: number;
    total_orders: number;
    active_orders: number;
    completed_orders: number;
    total_revenue: number;
    pending_revenue: number;
    total_requests: number;
    open_requests: number;
    total_messages: number;
    open_tickets: number;
    avg_project_health: number;
    avg_order_progress: number;
}

export interface UserStats {
    total_projects: number;
    active_projects: number;
    total_orders: number;
    active_orders: number;
    completed_orders: number;
    total_spent: number;
    total_budget: number;
    pending_invoices: number;
    total_invoiced: number;
    unread_notifications: number;
    unread_messages: number;
    open_tickets: number;
}

export interface GrowthDataPoint {
    month: string;
    count: number;
}

export interface RevenueDataPoint {
    month: string;
    revenue: number;
}

// ============================================================================
// Real-time Event Types
// ============================================================================
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T> {
    eventType: RealtimeEvent;
    new: T;
    old: T;
}

// ============================================================================
// Auth Types (extending existing)
// ============================================================================
export interface AuthUser {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    is_admin: boolean;
}

export interface SessionInfo {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
}
