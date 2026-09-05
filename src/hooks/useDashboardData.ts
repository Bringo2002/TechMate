import { useState, useEffect } from 'react';
import * as ordersService from '../services/orders.service';
import * as invoicesService from '../services/invoices.service';
import authService from '../services/authService';

export interface DashboardData {
    profile: Record<string, unknown> | null;
    orders: Record<string, unknown>[];
    invoices: Record<string, unknown>[];
    deliverables: Record<string, unknown>[];
    loading: boolean;
    error: string | null;
}

export const useDashboardData = () => {
    const [data, setData] = useState<DashboardData>({
        profile: null,
        orders: [],
        invoices: [],
        deliverables: [],
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await authService.getMe();

                if (!user) {
                    throw new Error('No user found');
                }

                const [ordersRes, invoicesRes] = await Promise.all([
                  ordersService.getUserOrders(user.id),
                  invoicesService.getUserInvoices(user.id),
                ]);

                setData({
                  profile: user as any,
                  orders: ordersRes.data || [],
                  invoices: invoicesRes.data || [],
                  deliverables: [],
                  loading: false,
                  error: null
                });

            } catch (err: unknown) {
                console.error('Error fetching dashboard data:', err);
                setData(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Unknown error' }));
            }
        };

        fetchData();
    }, []);

    return data;
};
