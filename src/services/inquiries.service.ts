// ============================================================================
// Inquiries Service
// API layer for client inquiry management (replaces marketplace requests)
// Now backed by the NestJS API instead of Supabase.
// ============================================================================

import api from '../lib/apiClient';
import type {
    ClientInquiryRow,
    ClientInquiryWithClient,
    ClientInquiryInsert,
    ClientInquiryUpdate,
    InquiryStatus,
} from '../types/database.types';
import type { ServiceResponse, ServiceError, InquiryFilters } from '../types/api.types';
export type { InquiryFilters };

const formatError = (error: unknown): ServiceError => {
    const err = error as Error;
    return { code: 'REQUEST_FAILED', message: err?.message || 'An unknown error occurred' };
};

function buildQuery(params: Record<string, string | undefined>): string {
    const usable = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][];
    if (usable.length === 0) return '';
    return '?' + new URLSearchParams(usable).toString();
}

// ============================================================================
// Query Functions
// ============================================================================

/** Get all inquiries with optional filters (admin view) */
export async function getInquiries(
    filters?: InquiryFilters
): Promise<ServiceResponse<ClientInquiryWithClient[]>> {
    try {
        const query = buildQuery({
            status: filters?.status,
            assigned_to: filters?.assigned_to,
            priority: filters?.priority,
            project_type: filters?.project_type,
        });
        const data = await api.get<ClientInquiryWithClient[]>(`/inquiries${query}`);
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (error) {
        console.error('Error in getInquiries:', error);
        return { data: null, error: formatError(error) };
    }
}

/**
 * Get single inquiry by ID with full details.
 *
 * Two known gaps versus the old Supabase query, flagged rather than
 * silently papered over:
 *  - `assigned_team_member.internal_role` isn't returned — that column
 *    doesn't exist on `profiles` in the real schema, so it never will
 *    be unless it gets added there.
 *  - The nested `proposals` array isn't populated yet — the Proposals
 *    module hasn't been built. It'll start showing up once that lands.
 */
export async function getInquiryById(
    inquiryId: string
): Promise<ServiceResponse<ClientInquiryWithClient>> {
    try {
        const data = await api.get<ClientInquiryWithClient>(`/inquiries/${inquiryId}`);
        return { data, error: null };
    } catch (error) {
        console.error('Error in getInquiryById:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Get inquiries for a specific client */
export async function getClientInquiries(
    clientId: string
): Promise<ServiceResponse<ClientInquiryRow[]>> {
    try {
        const data = await api.get<ClientInquiryRow[]>(`/inquiries/client/${clientId}`);
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (error) {
        console.error('Error in getClientInquiries:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Mutation Functions
// ============================================================================

export async function createInquiry(
    inquiryData: ClientInquiryInsert
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        const data = await api.post<ClientInquiryRow>('/inquiries', inquiryData);
        return { data, error: null };
    } catch (error) {
        console.error('Error in createInquiry:', error);
        return { data: null, error: formatError(error) };
    }
}

export async function updateInquiry(
    inquiryId: string,
    updates: ClientInquiryUpdate
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        const data = await api.put<ClientInquiryRow>(`/inquiries/${inquiryId}`, updates);
        return { data, error: null };
    } catch (error) {
        console.error('Error in updateInquiry:', error);
        return { data: null, error: formatError(error) };
    }
}

/**
 * Update inquiry status. The viewed_by_admin_at side effect (set the
 * first time status moves to 'reviewing') now happens server-side —
 * no need for the two-step read-then-write dance the Supabase version did.
 */
export async function updateInquiryStatus(
    inquiryId: string,
    status: InquiryStatus
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        const data = await api.put<ClientInquiryRow>(`/inquiries/${inquiryId}/status`, { status });
        return { data, error: null };
    } catch (error) {
        console.error('Error in updateInquiryStatus:', error);
        return { data: null, error: formatError(error) };
    }
}

/**
 * Assign inquiry to a team member. The first_response_at side effect
 * now happens server-side too.
 */
export async function assignInquiry(
    inquiryId: string,
    userId: string
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        const data = await api.post<ClientInquiryRow>(`/inquiries/${inquiryId}/assign`, { userId });
        return { data, error: null };
    } catch (error) {
        console.error('Error in assignInquiry:', error);
        return { data: null, error: formatError(error) };
    }
}

export async function unassignInquiry(
    inquiryId: string
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        const data = await api.post<ClientInquiryRow>(`/inquiries/${inquiryId}/unassign`, {});
        return { data, error: null };
    } catch (error) {
        console.error('Error in unassignInquiry:', error);
        return { data: null, error: formatError(error) };
    }
}

export async function deleteInquiry(inquiryId: string): Promise<ServiceResponse<boolean>> {
    try {
        await api.delete(`/inquiries/${inquiryId}`);
        return { data: true, error: null };
    } catch (error) {
        console.error('Error in deleteInquiry:', error);
        return { data: false, error: formatError(error) };
    }
}

// ============================================================================
// Statistics Functions
// ============================================================================

/**
 * Get inquiry statistics.
 * Calls the same get_inquiry_stats(p_user_id) Postgres function the old
 * Supabase RPC call used — the backend calls it directly now instead of
 * reimplementing the aggregation, so this keeps the exact same shape.
 */
export async function getInquiryStats(
    userId?: string
): Promise<ServiceResponse<Record<string, unknown>>> {
    try {
        const query = userId ? `?user_id=${userId}` : '';
        const data = await api.get<Record<string, unknown>>(`/inquiries/stats${query}`);
        return { data, error: null };
    } catch (error) {
        console.error('Error in getInquiryStats:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

/**
 * NOTE: Supabase realtime is gone along with the rest of Supabase, and
 * this backend has no websocket/SSE layer yet. These are now no-op stubs
 * rather than something that silently pretends to still work — any UI
 * relying on live updates will need a manual refresh until a real
 * realtime layer (websocket gateway, polling, or similar) gets built.
 * Flagging this explicitly rather than faking a working subscription.
 */
export function subscribeToInquiries(
    _callback: (payload: Record<string, unknown>) => void
): () => void {
    console.warn(
        '[inquiries.service] subscribeToInquiries: realtime is not implemented in the new backend yet — this is a no-op.'
    );
    return () => {};
}

export function subscribeToInquiry(
    _inquiryId: string,
    _callback: (payload: Record<string, unknown>) => void
): () => void {
    console.warn(
        '[inquiries.service] subscribeToInquiry: realtime is not implemented in the new backend yet — this is a no-op.'
    );
    return () => {};
}
