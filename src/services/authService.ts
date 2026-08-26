// ============================================================================
// TechMate Auth Service
// All auth operations via NestJS backend API
// ============================================================================

import api, { setTokens, clearTokens, getRefreshToken } from '../lib/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface MessageResponse {
  message: string;
}

/* ========== AUTH SERVICE ========== */

// Login user
const login = async (email: string, password: string): Promise<AuthResponse> => {
  const data = await api.post<AuthResponse>('/auth/login', { email, password }, { skipAuth: true });
  setTokens(data.accessToken, data.refreshToken);
  return data;
};

// Signup user
const signup = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const data = await api.post<AuthResponse>('/auth/register', { name, email, password }, { skipAuth: true });
  setTokens(data.accessToken, data.refreshToken);
  return data;
};

/* ========== PASSWORD RESET ========== */
const requestPasswordReset = async (email: string): Promise<MessageResponse> => {
  return api.post<MessageResponse>('/auth/reset-password', { email }, { skipAuth: true });
};

const confirmPasswordReset = async (
  token: string,
  newPassword: string,
): Promise<MessageResponse> => {
  return api.post<MessageResponse>('/auth/reset-password/confirm', { token, newPassword }, { skipAuth: true });
};

// Logout user
const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch {
    // Ignore errors during logout
  }
  clearTokens();
};

// Get current user (verify session is valid)
const getMe = async (): Promise<User> => {
  return api.get<User>('/auth/me');
};

// Verify session token
const verifyToken = async (): Promise<boolean> => {
  try {
    await getMe();
    return true;
  } catch {
    clearTokens();
    return false;
  }
};

// Google OAuth — redirect to backend
const getGoogleAuthUrl = (): string => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return `${apiBase}/auth/google`;
};

export default {
  login,
  signup,
  logout,
  getMe,
  verifyToken,
  requestPasswordReset,
  confirmPasswordReset,
  getGoogleAuthUrl,
};

export type { User, AuthResponse, MessageResponse };
