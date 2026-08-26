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
import api from '../lib/apiClient';

export async function getOrders(
    _options?: QueryOptions<OrderFilters>
): Promise<ServiceResponse<PaginatedResponse<OrderRow>>> {
    try {
        const res = await api.get<OrderRow[]>('/bookings');
        const data = Array.isArray(res) ? res : [];
        return {
            data: {
                data,
                total: data.length,
                page: 1,
                pageSize: 20,
                totalPages: 1,
                hasMore: false,
            },
            error: null,
        };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getUserOrders(_userId: string): Promise<ServiceResponse<OrderRow[]>> {
    try {
        const data = await api.get<OrderRow[]>('/bookings');
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getOrderById(orderId: string): Promise<ServiceResponse<OrderRow>> {
    try {
        const data = await api.get<OrderRow>(`/bookings/${orderId}`);
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

// ============================================================================
// Orders - Write
// ============================================================================
export async function createOrder(order: OrderInsert): Promise<ServiceResponse<OrderRow>> {
    try {
        const data = await api.post<OrderRow>('/bookings', order);
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function updateOrder(
    orderId: string,
    updates: OrderUpdate
): Promise<ServiceResponse<OrderRow>> {
    try {
        const data = await api.put<OrderRow>(`/bookings/${orderId}`, updates);
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function updateOrderStatus(
    orderId: string,
    status: OrderRow['status']
): Promise<ServiceResponse<OrderRow>> {
    return updateOrder(orderId, { status });
}

export async function deleteOrder(orderId: string): Promise<ServiceResponse<null>> {
    try {
        await api.delete(`/bookings/${orderId}`);
        return { data: null, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
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
