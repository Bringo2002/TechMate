import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';
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

                // Parallel data fetching
                const [
                    { data: profile },
                    { data: orders },
                    { data: invoices },
                    { data: deliverables } // Fetching all deliverables for now, usually you'd filter by user's orders
                ] = await Promise.all([
                    supabase.from('profiles').select('*').eq('id', user.id).single(),
                    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                    supabase.from('invoices').select('*').eq('user_id', user.id).order('due_date', { ascending: true }),
                    // This is a bit complex in standard Supabase without a join or view, 
                    // but for now let's assume deliverables are fetched via a join or we fetch all and filter client side 
                    // (which is bad for perf but okay for MVP with RLS). 
                    // BETTER: Fetch deliverables for the specific orders we just got.
                    // But RLS on deliverables usually checks against order_id -> user_id, so we can just select *.
                    supabase.from('deliverables').select('*')
                ]);

                setData({
                    profile,
                    orders: orders || [],
                    invoices: invoices || [],
                    deliverables: deliverables || [],
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
