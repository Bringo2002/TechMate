// ============================================================================
// TechMate useOrders Hook
// Order data fetching for both admin and user views
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { OrderRow } from '../types/database.types';
import type { OrderFilters, QueryOptions } from '../types/api.types';
import * as ordersService from '../services/orders.service';

interface UseOrdersOptions {
    userId?: string;
    autoFetch?: boolean;
    filters?: OrderFilters;
    page?: number;
    pageSize?: number;
}

interface UseOrdersReturn {
    orders: OrderRow[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    stats: {
        total: number;
        active: number;
        completed: number;
        totalSpent: number;
        totalBudget: number;
    };
    refresh: () => Promise<void>;
    setPage: (page: number) => void;
    setFilters: (filters: OrderFilters) => void;
    createOrder: typeof ordersService.createOrder;
    updateOrder: typeof ordersService.updateOrder;
    updateOrderStatus: typeof ordersService.updateOrderStatus;
    deleteOrder: typeof ordersService.deleteOrder;
}

export function useOrders(options?: UseOrdersOptions): UseOrdersReturn {
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(options?.page ?? 1);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState<OrderFilters>(options?.filters ?? {});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0, active: 0, completed: 0, totalSpent: 0, totalBudget: 0,
    });

    const pageSize = options?.pageSize ?? 20;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (options?.userId) {
                const { data, error: err } = await ordersService.getUserOrders(options.userId);
                if (err) throw new Error(err.message);
                setOrders(data ?? []);
                setTotal(data?.length ?? 0);
            } else {
                const queryOptions: QueryOptions<OrderFilters> = {
                    pagination: { page: currentPage, pageSize },
                    sort: { sortBy: 'created_at', sortDirection: 'desc' },
                    filters: { ...filters, ...(options?.filters ?? {}) },
                };
                const { data, error: err } = await ordersService.getOrders(queryOptions);
                if (err) throw new Error(err.message);
                if (data) {
                    setOrders(data.data);
                    setTotal(data.total);
                    setTotalPages(data.totalPages);
                }
            }

            const s = await ordersService.getOrderStats(options?.userId);
            setStats(s);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [options?.userId, currentPage, pageSize, filters]);

    useEffect(() => {
        if (options?.autoFetch !== false) {
            fetchOrders();
        }
    }, [fetchOrders, options?.autoFetch]);

    return {
        orders,
        total,
        page: currentPage,
        totalPages,
        loading,
        error,
        stats,
        refresh: fetchOrders,
        setPage: setCurrentPage,
        setFilters,
        createOrder: ordersService.createOrder,
        updateOrder: ordersService.updateOrder,
        updateOrderStatus: ordersService.updateOrderStatus,
        deleteOrder: ordersService.deleteOrder,
    };
}

export default useOrders;
