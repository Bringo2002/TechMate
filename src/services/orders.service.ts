// ============================================================================
// TechMate Orders Service
// CRUD operations for orders and deliverables
// ============================================================================

import supabase from '../lib/supabaseClient';
import type { OrderRow, OrderInsert, OrderUpdate, DeliverableRow } from '../types/database.types';
import type {
    PaginatedResponse,
    QueryOptions,
    OrderFilters,
    ServiceResponse,
} from '../types/api.types';

// ============================================================================
// Orders - Read
// ============================================================================
export async function getOrders(
    options?: QueryOptions<OrderFilters>
): Promise<ServiceResponse<PaginatedResponse<OrderRow>>> {
    const page = options?.pagination?.page ?? 1;
    const pageSize = options?.pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .is('deleted_at', null);

    const f = options?.filters;
    if (f?.status) query = query.eq('status', f.status);
    if (f?.priority) query = query.eq('priority', f.priority);
    if (f?.type) query = query.eq('type', f.type);
    if (f?.userId) query = query.eq('user_id', f.userId);
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

export async function getUserOrders(userId: string): Promise<ServiceResponse<OrderRow[]>> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

export async function getOrderById(orderId: string): Promise<ServiceResponse<OrderRow>> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .is('deleted_at', null)
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

// ============================================================================
// Orders - Write
// ============================================================================
export async function createOrder(order: OrderInsert): Promise<ServiceResponse<OrderRow>> {
    const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

export async function updateOrder(
    orderId: string,
    updates: OrderUpdate
): Promise<ServiceResponse<OrderRow>> {
    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

export async function updateOrderStatus(
    orderId: string,
    status: OrderRow['status']
): Promise<ServiceResponse<OrderRow>> {
    const updates: OrderUpdate = { status };
    if (status === 'in_progress' && !updates.started_at) {
        updates.started_at = new Date().toISOString();
    }
    if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.progress = 100;
    }
    return updateOrder(orderId, updates);
}

export async function deleteOrder(orderId: string): Promise<ServiceResponse<null>> {
    const { error } = await supabase
        .from('orders')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', orderId);

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: null, error: null };
}

// ============================================================================
// Deliverables
// ============================================================================
export async function getOrderDeliverables(orderId: string): Promise<ServiceResponse<DeliverableRow[]>> {
    const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .eq('order_id', orderId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data: data ?? [], error: null };
}

// ============================================================================
// Stats
// ============================================================================
export async function getOrderStats(userId?: string) {
    let query = supabase.from('orders').select('status, spent, budget', { count: 'exact' }).is('deleted_at', null);
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) return { total: 0, active: 0, completed: 0, totalSpent: 0, totalBudget: 0 };

    const orders = data ?? [];
    return {
        total: orders.length,
        active: orders.filter(o => o.status === 'in_progress' || o.status === 'review').length,
        completed: orders.filter(o => o.status === 'completed').length,
        totalSpent: orders.reduce((sum, o) => sum + (o.spent ?? 0), 0),
        totalBudget: orders.reduce((sum, o) => sum + (o.budget ?? 0), 0),
    };
}
