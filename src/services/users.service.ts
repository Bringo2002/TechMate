// ============================================================================
// TechMate Users Service
// CRUD and admin operations for user profiles
// ============================================================================

import supabase from '../lib/supabaseClient';
import authService from './authService';
import type { ProfileRow, ProfileUpdate } from '../types/database.types';
import type {
    PaginatedResponse,
    QueryOptions,
    UserFilters,
    ServiceResponse,
} from '../types/api.types';

// ============================================================================
// Helpers
// ============================================================================
function buildUserQuery(filters?: UserFilters) {
    let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .is('deleted_at', null);

    if (filters?.role) query = query.eq('role', filters.role);
    if (filters?.userType) query = query.eq('user_type', filters.userType);
    if (typeof filters?.isActive === 'boolean') query = query.eq('is_active', filters.isActive);
    if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
    }
    if (filters?.dateRange?.from) query = query.gte('created_at', filters.dateRange.from);
    if (filters?.dateRange?.to) query = query.lte('created_at', filters.dateRange.to);

    return query;
}

// ============================================================================
// Read Operations
// ============================================================================
export async function getUsers(
    options?: QueryOptions<UserFilters>
): Promise<ServiceResponse<PaginatedResponse<ProfileRow>>> {
    const page = options?.pagination?.page ?? 1;
    const pageSize = options?.pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    let query = buildUserQuery(options?.filters);

    // Sorting
    const sortBy = options?.sort?.sortBy ?? 'created_at';
    const sortDir = options?.sort?.sortDirection === 'asc';
    query = query.order(sortBy, { ascending: sortDir });

    // Pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
        return { data: null, error: { code: error.code, message: error.message, details: error.details } };
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

export async function getUserById(userId: string): Promise<ServiceResponse<ProfileRow>> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .is('deleted_at', null)
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

export async function getUserByEmail(email: string): Promise<ServiceResponse<ProfileRow>> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .is('deleted_at', null)
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

export async function getCurrentUser(): Promise<ServiceResponse<ProfileRow>> {
    let user;
    try {
        user = await authService.getMe();
    } catch {
        return { data: null, error: { code: 'AUTH_ERROR', message: 'Not authenticated' } };
    }
    if (!user) {
        return { data: null, error: { code: 'AUTH_ERROR', message: 'Not authenticated' } };
    }
    return getUserById(user.id);
}

// ============================================================================
// Update Operations
// ============================================================================
export async function updateProfile(
    userId: string,
    updates: ProfileUpdate
): Promise<ServiceResponse<ProfileRow>> {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { data: null, error: { code: error.code, message: error.message } };
    }
    return { data, error: null };
}

export async function updateLastLogin(userId: string): Promise<void> {
    await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
}

// ============================================================================
// Admin Operations
// ============================================================================
export async function setUserRole(
    userId: string,
    role: 'user' | 'admin' | 'moderator'
): Promise<ServiceResponse<ProfileRow>> {
    return updateProfile(userId, { role, is_admin: role === 'admin' });
}

export async function deactivateUser(userId: string): Promise<ServiceResponse<ProfileRow>> {
    return updateProfile(userId, { is_active: false });
}

export async function reactivateUser(userId: string): Promise<ServiceResponse<ProfileRow>> {
    return updateProfile(userId, { is_active: true });
}

export async function softDeleteUser(userId: string): Promise<ServiceResponse<ProfileRow>> {
    return updateProfile(userId, { deleted_at: new Date().toISOString(), is_active: false });
}

export async function getUserCount(): Promise<number> {
    const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);
    return count ?? 0;
}

export async function getActiveUserCount(): Promise<number> {
    const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('is_active', true);
    return count ?? 0;
}
