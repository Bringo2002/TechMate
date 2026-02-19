// ============================================================================
// Inquiries Service
// API layer for client inquiry management (replaces marketplace requests)
// ============================================================================

import supabase from '../lib/supabaseClient';
import type {
    ClientInquiryRow,
    ClientInquiryInsert,
    ClientInquiryUpdate,
    InquiryStatus,
    Priority,
    ProjectType
} from '../types/database.types';
import type { ServiceResponse, ServiceError } from '../types/api.types';

// ============================================================================
// Types
// ============================================================================

interface InquiryFilters {
    status?: InquiryStatus;
    assigned_to?: string;
    priority?: Priority;
    project_type?: ProjectType;
}

// Helper to format errors
const formatError = (error: unknown): ServiceError => {
    const err = error as Record<string, string | undefined>;
    return {
        code: err?.code || 'UNKNOWN',
        message: err?.message || 'An unknown error occurred',
        details: err?.details,
        hint: err?.hint
    };
};

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get all inquiries with optional filters (admin view)
 */
export async function getInquiries(
    filters?: InquiryFilters
): Promise<ServiceResponse<ClientInquiryRow[]>> {
    try {
        let query = supabase
            .from('client_inquiries')
            .select(`
        *,
        client:profiles!client_id(
          id,
          full_name,
          email,
          company,
          avatar_url
        )
      `)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.assigned_to) {
            query = query.eq('assigned_to', filters.assigned_to);
        }
        if (filters?.priority) {
            query = query.eq('priority', filters.priority);
        }
        if (filters?.project_type) {
            query = query.eq('project_type', filters.project_type);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { data: data as ClientInquiryRow[], error: null };
    } catch (error) {
        console.error('Error in getInquiries:', error);
        return { data: null, error: formatError(error) };
    }
}

/**
 * Get single inquiry by ID with full details
 */
export async function getInquiryById(
    inquiryId: string
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        const { data, error } = await supabase
            .from('client_inquiries')
            .select(`
        *,
        client:profiles!client_id(
          id,
          full_name,
          email,
          company,
          phone,
          avatar_url
        ),
        assigned_team_member:profiles!assigned_to(
          id,
          full_name,
          email,
          avatar_url,
          internal_role
        ),
        proposals(
          id,
          proposal_number,
          title,
          status,
          total_cost,
          created_at
        )
      `)
            .eq('id', inquiryId)
            .is('deleted_at', null)
            .single();

        if (error) throw error;

        return { data: data as ClientInquiryRow, error: null };
    } catch (error) {
        console.error('Error in getInquiryById:', error);
        return { data: null, error: formatError(error) };
    }
}

/**
 * Get inquiries for a specific client
 */
export async function getClientInquiries(
    clientId: string
): Promise<ServiceResponse<ClientInquiryRow[]>> {
    try {
        const { data, error } = await supabase
            .from('client_inquiries')
            .select('*')
            .eq('client_id', clientId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { data: data as ClientInquiryRow[], error: null };
    } catch (error) {
        console.error('Error in getClientInquiries:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new inquiry
 */
export async function createInquiry(
    inquiryData: ClientInquiryInsert
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        // cast to any to avoid complex schema-driven never errors if some optional fields are missing
        const { data, error } = await supabase
            .from('client_inquiries')
            .insert(inquiryData as unknown as Record<string, unknown>)
            .select()
            .single();

        if (error) throw error;

        return { data: data as ClientInquiryRow, error: null };
    } catch (error) {
        console.error('Error in createInquiry:', error);
        return { data: null, error: formatError(error) };
    }
}

/**
 * Update an inquiry
 */
export async function updateInquiry(
    inquiryId: string,
    updates: ClientInquiryUpdate
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        const { data, error } = await supabase
            .from('client_inquiries')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            } as unknown as Record<string, unknown>)
            .eq('id', inquiryId)
            .select()
            .single();

        if (error) throw error;

        return { data: data as ClientInquiryRow, error: null };
    } catch (error) {
        console.error('Error in updateInquiry:', error);
        return { data: null, error: formatError(error) };
    }
}

/**
 * Update inquiry status
 */
export async function updateInquiryStatus(
    inquiryId: string,
    status: InquiryStatus
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        const updates: Record<string, string> = {
            status,
            updated_at: new Date().toISOString(),
        };

        // Set viewed_by_admin_at when status changes from 'new'
        if (status === 'reviewing') {
            const { data: inquiry } = await supabase
                .from('client_inquiries')
                .select('viewed_by_admin_at')
                .eq('id', inquiryId)
                .single();

            if (inquiry && !(inquiry as Record<string, unknown>).viewed_by_admin_at) {
                updates.viewed_by_admin_at = new Date().toISOString();
            }
        }

        const { data, error } = await supabase
            .from('client_inquiries')
            .update(updates)
            .eq('id', inquiryId)
            .select()
            .single();

        if (error) throw error;

        return { data: data as ClientInquiryRow, error: null };
    } catch (error) {
        console.error('Error in updateInquiryStatus:', error);
        return { data: null, error: formatError(error) };
    }
}

/**
 * Assign inquiry to a team member
 */
export async function assignInquiry(
    inquiryId: string,
    userId: string
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        const updates: Record<string, string> = {
            assigned_to: userId,
            updated_at: new Date().toISOString(),
        };

        // Set first_response_at if not already set
        const { data: inquiry } = await supabase
            .from('client_inquiries')
            .select('first_response_at')
            .eq('id', inquiryId)
            .single();

        if (inquiry && !(inquiry as Record<string, unknown>).first_response_at) {
            updates.first_response_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('client_inquiries')
            .update(updates)
            .eq('id', inquiryId)
            .select()
            .single();

        if (error) throw error;

        return { data: data as ClientInquiryRow, error: null };
    } catch (error) {
        console.error('Error in assignInquiry:', error);
        return { data: null, error: formatError(error) };
    }
}

/**
 * Unassign inquiry from team member
 */
export async function unassignInquiry(
    inquiryId: string
): Promise<ServiceResponse<ClientInquiryRow>> {
    try {
        const { data, error } = await supabase
            .from('client_inquiries')
            .update({
                assigned_to: null,
                updated_at: new Date().toISOString(),
            } as unknown as Record<string, unknown>)
            .eq('id', inquiryId)
            .select()
            .single();

        if (error) throw error;

        return { data: data as ClientInquiryRow, error: null };
    } catch (error) {
        console.error('Error in unassignInquiry:', error);
        return { data: null, error: formatError(error) };
    }
}

/**
 * Delete inquiry (soft delete)
 */
export async function deleteInquiry(
    inquiryId: string
): Promise<ServiceResponse<boolean>> {
    try {
        const { error } = await supabase
            .from('client_inquiries')
            .update({
                deleted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as unknown as Record<string, unknown>)
            .eq('id', inquiryId);

        if (error) throw error;

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
 * Get inquiry statistics
 * @param userId - If provided, gets client-specific stats; if null, gets admin stats
 */
export async function getInquiryStats(
    userId?: string
): Promise<ServiceResponse<Record<string, unknown>>> {
    try {
        // use unknown cast for the object to match the rpc definition which might be strict
        const { data, error } = await supabase
            .rpc('get_inquiry_stats', {
                p_user_id: userId ?? null
            } as unknown as Record<string, unknown>);

        if (error) throw error;

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
 * Subscribe to inquiry changes (real-time updates)
 * @param callback - Function called when inquiries change
 * @returns Unsubscribe function
 */
export function subscribeToInquiries(
    callback: (payload: Record<string, unknown>) => void
): () => void {
    const subscription = supabase
        .channel('client_inquiries_changes')
        .on(
            'postgres_changes',
            {
                event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                schema: 'public',
                table: 'client_inquiries',
            },
            (payload) => {
                console.log('Inquiry change detected:', payload);
                callback(payload);
            }
        )
        .subscribe();

    // Return unsubscribe function
    return () => {
        subscription.unsubscribe();
    };
}

/**
 * Subscribe to a specific inquiry
 * @param inquiryId - ID of the inquiry to watch
 * @param callback - Function called when the inquiry changes
 * @returns Unsubscribe function
 */
export function subscribeToInquiry(
    inquiryId: string,
    callback: (payload: Record<string, unknown>) => void
): () => void {
    const subscription = supabase
        .channel(`inquiry_${inquiryId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'client_inquiries',
                filter: `id=eq.${inquiryId}`,
            },
            (payload) => {
                console.log('Inquiry updated:', payload);
                callback(payload);
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
}