// ============================================================================
// TechMate useAuth Hook
// Auth state management via NestJS JWT backend
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import type { User } from "../services/authService";
import { getAccessToken, setTokens, clearTokens } from "../lib/apiClient";

interface AuthHook {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  userRole?: string;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<{ user: User | null }>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  signupWithGoogle?: () => Promise<void>;
}

export const useAuth = (): AuthHook => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  // Handle forced logout from apiClient (401 refresh failure)
  useEffect(() => {
    const handleForceLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(undefined);
      navigate("/login");
    };

    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, [navigate]);



  // 🔄 Check session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getMe();
        setIsAuthenticated(true);
        setUser(userData);
        setUserRole(userData.role);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(undefined);
        clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleAuthError = (error: unknown) => {
    const err = error as Record<string, unknown>;
    let message = (err?.message as string) || "An unexpected error occurred.";

    if (err?.message === "Failed to fetch") {
      message =
        "Connection to server failed. Please check if the backend is running and try again.";
    }

    return message;
  };

  // ✅ Login with email + password
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const data = await authService.login(email, password);

        setIsAuthenticated(true);
        setUser(data.user);
        setUserRole(data.user.role);

        if (data.user.role === "ADMIN") navigate("/dashboard");
        else navigate("/user");
      } catch (err: unknown) {
        throw new Error(handleAuthError(err));
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // ✅ Signup with email + password
  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ user: User | null }> => {
      setLoading(true);
      try {
        const data = await authService.signup(name, email, password);

        setIsAuthenticated(true);
        setUser(data.user);
        setUserRole(data.user.role);

        navigate("/user");
        return { user: data.user };
      } catch (err: unknown) {
        throw new Error(handleAuthError(err));
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // ✅ Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err: unknown) {
      console.warn("Logout error:", handleAuthError(err));
    }

    setIsAuthenticated(false);
    setUser(null);
    setUserRole(undefined);
    navigate("/login");
  }, [navigate]);

  // ✅ Verify current session
  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const userData = await authService.getMe();
      setIsAuthenticated(true);
      setUser(userData);
      setUserRole(userData.role);
      return true;
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(undefined);
      clearTokens();
      return false;
    }
  }, []);

  // ✅ Google OAuth login — redirects to backend
  const loginWithGoogle = useCallback(async () => {
    window.location.href = authService.getGoogleAuthUrl();
  }, []);

  const signupWithGoogle = loginWithGoogle;

  // ✅ Password Reset Request
  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      await authService.requestPasswordReset(email);
    } catch (err: unknown) {
      throw new Error(handleAuthError(err));
    }
  }, []);

  // ✅ Confirm Password Reset
  const confirmPasswordReset = useCallback(
    async (token: string, newPassword: string) => {
      try {
        await authService.confirmPasswordReset(token, newPassword);
      } catch (err: unknown) {
        throw new Error(handleAuthError(err));
      }
    },
    []
  );

  return {
    isAuthenticated,
    loading,
    user,
    userRole,
    login,
    signup,
    logout,
    verifyToken,
    requestPasswordReset,
    confirmPasswordReset,
    loginWithGoogle,
    signupWithGoogle,
  };
};
