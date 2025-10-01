import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";

interface SignupResult {
  session: any | null;
  user: any | null;
}

interface AuthHook {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<SignupResult>;
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
  const [loading, setLoading] = useState<boolean>(true);

  // 🔄 Keep auth state in sync with Supabase
  useEffect(() => {
    const initAuth = async () => {
      await verifyToken();
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    initAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Login with email + password
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      setIsAuthenticated(!!data.session);
    } catch (err: any) {
      console.error("Login failed:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Signup with email + password (returns session + user)
  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<SignupResult> => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }, // store user name in metadata
          },
        });

        if (error) throw new Error(error.message);

        setIsAuthenticated(!!data.session);

        return {
          session: data.session,
          user: data.user,
        };
      } catch (err: any) {
        console.error("Signup failed:", err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ✅ Logout
  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);

      setIsAuthenticated(false);
      navigate("/login");
    } catch (err: any) {
      console.warn("Logout error:", err.message);
    }
  }, [navigate]);

  // ✅ Verify current session
  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error(error.message);

      const isValid = !!data.session;
      setIsAuthenticated(isValid);
      return isValid;
    } catch (err: any) {
      console.warn("Session check failed:", err.message);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // ✅ Request password reset
  const requestPasswordReset = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw new Error(error.message);
    } catch (err: any) {
      console.error("Request password reset failed:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Confirm password reset
  const confirmPasswordReset = useCallback(
    async (_token: string, newPassword: string) => {
      setLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw new Error(error.message);
      } catch (err: any) {
        console.error("Confirm password reset failed:", err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // (Optional) Google OAuth login
  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signupWithGoogle = loginWithGoogle;

  return {
    isAuthenticated,
    loading,
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
