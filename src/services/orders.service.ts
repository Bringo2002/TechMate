// ============================================================================
// TechMate Orders Service
// CRUD operations for orders and deliverables
// ============================================================================

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
        const res = await api.get<OrderRow[]>('/orders');
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

export async function getUserOrders(userId: string): Promise<ServiceResponse<OrderRow[]>> {
    try {
        const data = await api.get<OrderRow[]>(`/orders?userId=${userId}`);
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getOrderById(orderId: string): Promise<ServiceResponse<OrderRow>> {
    try {
        const data = await api.get<OrderRow>(`/orders/${orderId}`);
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
        const data = await api.post<OrderRow>('/orders', order);
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
        const data = await api.put<OrderRow>(`/orders/${orderId}`, updates);
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
        await api.delete(`/orders/${orderId}`);
        return { data: null, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

// ============================================================================
// Deliverables
// ============================================================================
export async function getOrderDeliverables(orderId: string): Promise<ServiceResponse<DeliverableRow[]>> {
    try {
        const data = await api.get<DeliverableRow[]>(`/orders/${orderId}/deliverables`);
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

// ============================================================================
// Stats
// ============================================================================
export interface OrderStats {
    total: number;
    active: number;
    completed: number;
    totalSpent: number;
    totalBudget: number;
}

export async function getOrderStats(userId?: string): Promise<OrderStats> {
    const query = userId ? `/orders/stats?userId=${userId}` : '/orders/stats';
    try {
        return await api.get<OrderStats>(query);
    } catch {
        return { total: 0, active: 0, completed: 0, totalSpent: 0, totalBudget: 0 };
    }
}
