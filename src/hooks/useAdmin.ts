// ============================================================================
// TechMate useAdmin Hook
// Admin dashboard data with auto-refresh
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { AdminDashboardMetrics, GrowthDataPoint, RevenueDataPoint } from '../types/api.types';
import type { ProjectRow, OrderRow, ProfileRow, RequestRow, ServiceCategoryRow, ActivityLogRow, ActivityLogRowWithProfile } from '../types/database.types';
import * as adminService from '../services/admin.service';

interface AdminDashboardData {
    metrics: AdminDashboardMetrics | null;
    userGrowth: GrowthDataPoint[];
    revenueByMonth: RevenueDataPoint[];
    recentProjects: ProjectRow[];
    recentOrders: OrderRow[];
    recentUsers: ProfileRow[];
    openRequests: RequestRow[];
    serviceCategories: ServiceCategoryRow[];
    revenueStats: {
        totalRevenue: number;
        paidRevenue: number;
        pendingRevenue: number;
        overdueRevenue: number;
        monthlyRevenue: number;
    };
    recentActivity: ActivityLogRowWithProfile[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useAdmin(): AdminDashboardData {
    const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
    const [userGrowth, setUserGrowth] = useState<GrowthDataPoint[]>([]);
    const [revenueByMonth, setRevenueByMonth] = useState<RevenueDataPoint[]>([]);
    const [recentProjects, setRecentProjects] = useState<ProjectRow[]>([]);
    const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
    const [recentUsers, setRecentUsers] = useState<ProfileRow[]>([]);
    const [openRequests, setOpenRequests] = useState<RequestRow[]>([]);
    const [serviceCategories, setServiceCategories] = useState<ServiceCategoryRow[]>([]);
    const [revenueStats, setRevenueStats] = useState({
        totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0, overdueRevenue: 0, monthlyRevenue: 0,
    });
    const [recentActivity, setRecentActivity] = useState<ActivityLogRowWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [
                metricsRes,
                growthRes,
                revenueRes,
                projectsRes,
                ordersRes,
                usersRes,
                requestsRes,
                categories,
                revStats,
                activityRes,
            ] = await Promise.all([
                adminService.getAdminMetrics(),
                adminService.getUserGrowth(12),
                adminService.getRevenueByMonth(12),
                adminService.getRecentProjects(10),
                adminService.getRecentOrders(10),
                adminService.getRecentUsers(10),
                adminService.getOpenRequests(10),
                adminService.getServiceCategories(),
                adminService.getRevenueStats(),
                adminService.getRecentActivity(10),
            ]);

            setMetrics(metricsRes.data);
            setUserGrowth(growthRes.data ?? []);
            setRevenueByMonth(revenueRes.data ?? []);
            setRecentProjects(projectsRes.data ?? []);
            setRecentOrders(ordersRes.data ?? []);
            setRecentUsers(usersRes.data ?? []);
            setOpenRequests(requestsRes.data ?? []);
            setServiceCategories(categories);
            setRevenueStats(revStats);
            setRecentActivity(activityRes.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load admin data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        metrics,
        userGrowth,
        revenueByMonth,
        recentProjects,
        recentOrders,
        recentUsers,
        openRequests,
        serviceCategories,
        revenueStats,
        recentActivity,
        loading,
        error,
        refresh: fetchAll,
    };
}

export default useAdmin;
