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
  userRole?: string;
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
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  // 🔄 Keep auth state in sync with Supabase
  useEffect(() => {
    const initAuth = async () => {
      await verifyToken();
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsAuthenticated(!!session);
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(undefined);
        }
      }
    );

    initAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 🔹 Fetch role from profiles table
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Failed to fetch role:", error.message);
        return undefined;
      }

      setUserRole(data?.role);
      return data?.role;
    } catch (err: any) {
      console.error("fetchUserRole error:", err.message);
      return undefined;
    }
  }, []);

  // ✅ Login with email + password
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);

        setIsAuthenticated(!!data.session);

        if (data.user) {
          const role = await fetchUserRole(data.user.id);
          if (role === "admin") navigate("/dashboard");
          else navigate("/user");
        }
      } catch (err: any) {
        console.error("Login failed:", err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUserRole, navigate]
  );

  // ✅ Signup with email + password
  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<SignupResult> => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw new Error(error.message);

        setIsAuthenticated(!!data.session);

        // Create profile with default role
        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email,
              role: "user", // normal user by default
            });

          if (profileError) throw new Error(profileError.message);

          await fetchUserRole(data.user.id);

          // Auto-login after signup
          await supabase.auth.signInWithPassword({ email, password });
          navigate("/user"); // redirect to user dashboard
        }

        return { session: data.session, user: data.user };
      } catch (err: any) {
        console.error("Signup failed:", err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUserRole, navigate]
  );

  // ✅ Logout
  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);

      setIsAuthenticated(false);
      setUserRole(undefined);
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

      if (data.session?.user) {
        await fetchUserRole(data.session.user.id);
      }

      return isValid;
    } catch (err: any) {
      console.warn("Session check failed:", err.message);
      setIsAuthenticated(false);
      return false;
    }
  }, [fetchUserRole]);

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
        const { error } = await supabase.auth.updateUser({ password: newPassword });
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

  // ✅ Google OAuth login/signup
  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signupWithGoogle = loginWithGoogle;

  return {
    isAuthenticated,
    loading,
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
