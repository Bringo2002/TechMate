// ============================================================================
// TechMate Requests Service
// Request marketplace CRUD and response management
// ============================================================================

import api from '../lib/apiClient';
import type { RequestRow, RequestInsert, RequestUpdate, ResponseRow } from '../types/database.types';
import type {
    PaginatedResponse,
    QueryOptions,
    RequestFilters,
    ServiceResponse,
} from '../types/api.types';

// ============================================================================
// Requests - Read
// ============================================================================
export async function getRequests(
    options?: QueryOptions<RequestFilters>
): Promise<ServiceResponse<PaginatedResponse<RequestRow>>> {
    try {
        const userId = options?.filters?.search ? undefined : undefined;
        const res = await api.get<RequestRow[]>('/requests', {
            ...(userId ? { params: { userId } } : {}),
        });
        const data = Array.isArray(res) ? res : [];
        const page = options?.pagination?.page ?? 1;
        const pageSize = options?.pagination?.pageSize ?? 20;
        return {
            data: {
                data,
                total: data.length,
                page,
                pageSize,
                totalPages: Math.ceil(data.length / pageSize),
                hasMore: false,
            },
            error: null,
        };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getUserRequests(userId: string): Promise<ServiceResponse<RequestRow[]>> {
    try {
        const data = await api.get<RequestRow[]>(`/requests?userId=${userId}`);
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getRequestById(requestId: string): Promise<ServiceResponse<RequestRow>> {
    try {
        const data = await api.get<RequestRow>(`/requests/${requestId}`);
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

// ============================================================================
// Requests - Write
// ============================================================================
export async function createRequest(request: RequestInsert): Promise<ServiceResponse<RequestRow>> {
    try {
        const data = await api.post<RequestRow>('/requests', request);
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function updateRequest(
    requestId: string,
    updates: RequestUpdate
): Promise<ServiceResponse<RequestRow>> {
    try {
        const data = await api.put<RequestRow>(`/requests/${requestId}`, updates);
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function deleteRequest(requestId: string): Promise<ServiceResponse<null>> {
    try {
        await api.delete(`/requests/${requestId}`);
        return { data: null, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

// ============================================================================
// Responses to Requests
// ============================================================================
export async function getRequestResponses(requestId: string): Promise<ServiceResponse<ResponseRow[]>> {
    const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('request_id', requestId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

export async function acceptResponse(
    requestId: string,
    responseId: string
): Promise<ServiceResponse<RequestRow>> {
    // Update the response status
    await supabase
        .from('responses')
        .update({ status: 'accepted' })
        .eq('id', responseId);

    // Reject all other responses
    await supabase
        .from('responses')
        .update({ status: 'rejected' })
        .eq('request_id', requestId)
        .neq('id', responseId)
        .eq('status', 'pending');

    // Update the request
    return updateRequest(requestId, {
        accepted_response_id: responseId,
        status: 'in_progress',
    });
}

// ============================================================================
// Real-time
// ============================================================================
export function subscribeToRequests(
    onRequest: (request: RequestRow) => void
) {
    const channel = supabase
        .channel('requests:all')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'requests',
            },
            (payload) => {
                onRequest(payload.new as RequestRow);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
