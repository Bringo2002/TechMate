// ============================================================================
// TechMate Requests Service
// Request marketplace CRUD and response management
// ============================================================================

import supabase from '../lib/supabaseClient';
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
    const page = options?.pagination?.page ?? 1;
    const pageSize = options?.pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    let query = supabase
        .from('requests')
        .select('*', { count: 'exact' })
        .is('deleted_at', null);

    const f = options?.filters;
    if (f?.status) query = query.eq('status', f.status);
    if (f?.category) query = query.eq('category', f.category);
    if (f?.priority) query = query.eq('priority', f.priority);
    if (typeof f?.isPublic === 'boolean') query = query.eq('is_public', f.isPublic);
    if (f?.search) {
        query = query.or(`title.ilike.%${f.search}%,description.ilike.%${f.search}%`);
    }
    if (f?.dateRange?.from) query = query.gte('created_at', f.dateRange.from);
    if (f?.dateRange?.to) query = query.lte('created_at', f.dateRange.to);

    const sortBy = options?.sort?.sortBy ?? 'created_at';
    query = query.order(sortBy, { ascending: options?.sort?.sortDirection === 'asc' });
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }

    const total = count ?? 0;
    return {
        data: {
            data: data ?? [],
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            hasMore: offset + pageSize < total,
        },
        error: null,
    };
}

export async function getUserRequests(userId: string): Promise<ServiceResponse<RequestRow[]>> {
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('requester_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

export async function getRequestById(requestId: string): Promise<ServiceResponse<RequestRow>> {
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .is('deleted_at', null)
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

// ============================================================================
// Requests - Write
// ============================================================================
export async function createRequest(request: RequestInsert): Promise<ServiceResponse<RequestRow>> {
    const { data, error } = await supabase
        .from('requests')
        .insert(request)
        .select()
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

export async function updateRequest(
    requestId: string,
    updates: RequestUpdate
): Promise<ServiceResponse<RequestRow>> {
    const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

export async function deleteRequest(requestId: string): Promise<ServiceResponse<null>> {
    const { error } = await supabase
        .from('requests')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', requestId);

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: null, error: null };
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
