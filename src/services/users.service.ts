// ============================================================================
// TechMate Users Service
// CRUD and admin operations for user profiles
// ============================================================================

import api from '../lib/apiClient';
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
function buildQuery(filters: Record<string, string | undefined>): string {
    const usable = Object.entries(filters).filter(([, v]) => v !== undefined) as [string, string][];
    if (usable.length === 0) return '';
    return '?' + new URLSearchParams(usable).toString();
}

// ============================================================================
// Read Operations
// ============================================================================
export async function getUsers(
    options?: QueryOptions<UserFilters>
): Promise<ServiceResponse<PaginatedResponse<ProfileRow>>> {
    const page = options?.pagination?.page ?? 1;
    const pageSize = options?.pagination?.pageSize ?? 20;

    try {
        const query = buildQuery({
            role: options?.filters?.role,
            userType: options?.filters?.userType,
            isActive: typeof options?.filters?.isActive === 'boolean' ? String(options.filters.isActive) : undefined,
            search: options?.filters?.search,
            page: String(page),
            pageSize: String(pageSize),
            sortBy: options?.sort?.sortBy,
            sortDir: options?.sort?.sortDirection === 'asc' ? 'ASC' : 'DESC',
        });

        const result = await api.get<{ data: ProfileRow[]; total: number }>(`/users${query}`);
        const total = result.total ?? 0;

        return {
            data: {
                data: result.data ?? [],
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
                hasMore: page * pageSize < total,
            },
            error: null,
        };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getUserById(userId: string): Promise<ServiceResponse<ProfileRow>> {
    try {
        const data = await api.get<ProfileRow>(`/users/${userId}`);
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getUserByEmail(email: string): Promise<ServiceResponse<ProfileRow>> {
    try {
        const result = await api.get<{ data: ProfileRow[]; total: number }>(`/users?email=${encodeURIComponent(email)}`);
        const user = result.data?.[0];
        if (!user) {
            return { data: null, error: { code: 'NOT_FOUND', message: 'User not found' } };
        }
        return { data: user, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
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

/** Updates the CURRENT user's own profile (name/bio/avatarUrl only). */
export async function updateProfile(
    _userId: string,
    updates: ProfileUpdate
): Promise<ServiceResponse<ProfileRow>> {
    try {
        const data = await api.put<ProfileRow>('/users/profile', updates);
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function updateLastLogin(_userId: string): Promise<void> {
    // Handled automatically on auth on NestJS backend
}

// ============================================================================
// Admin Operations
// ============================================================================
// These call PUT/DELETE /users/:id (admin-only, enforced server-side via
// @Roles(Role.ADMIN)) — distinct from updateProfile above, which can only
// ever affect the currently authenticated user. Previously these all
// routed through updateProfile and silently updated the caller instead
// of the target user; that endpoint never existed until now.

export async function setUserRole(
    userId: string,
    role: 'user' | 'admin' | 'moderator'
): Promise<ServiceResponse<ProfileRow>> {
    try {
        const data = await api.put<ProfileRow>(`/users/${userId}`, { role, isAdmin: role === 'admin' });
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function deactivateUser(userId: string): Promise<ServiceResponse<ProfileRow>> {
    try {
        const data = await api.put<ProfileRow>(`/users/${userId}`, { isActive: false });
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function reactivateUser(userId: string): Promise<ServiceResponse<ProfileRow>> {
    try {
        const data = await api.put<ProfileRow>(`/users/${userId}`, { isActive: true });
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function softDeleteUser(userId: string): Promise<ServiceResponse<ProfileRow>> {
    try {
        const data = await api.delete<ProfileRow>(`/users/${userId}`);
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

/** Deletes the CURRENT user's own account. */
export async function deleteOwnAccount(): Promise<ServiceResponse<{ message: string }>> {
    try {
        const data = await api.delete<{ message: string }>('/users/profile');
        return { data, error: null };
    } catch (err: unknown) {
        return { data: null, error: { code: 'API_ERROR', message: (err as Error).message } };
    }
}

export async function getUserCount(): Promise<number> {
    try {
        const result = await api.get<{ data: ProfileRow[]; total: number }>('/users?pageSize=1');
        return result.total ?? 0;
    } catch {
        return 0;
    }
}

export async function getActiveUserCount(): Promise<number> {
    try {
        const result = await api.get<{ data: ProfileRow[]; total: number }>('/users?isActive=true&pageSize=1');
        return result.total ?? 0;
    } catch {
        return 0;
    }
}
