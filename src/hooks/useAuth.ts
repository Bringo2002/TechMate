import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";

interface SignupResult {
  session: Session | null;
  user: User | null;
}

interface AuthHook {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
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
        setUser(session?.user ?? null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const role = (data as Record<string, unknown>)?.role as string | undefined;
      setUserRole(role);
      return role;
    } catch (err: unknown) {
      console.error("fetchUserRole error:", err instanceof Error ? err.message : err);
      return undefined;
    }
  }, []);


  const handleAuthError = (error: unknown) => {
    console.error("Auth error:", error);
    const err = error as Record<string, unknown>;
    let message = (err?.message as string) || "An unexpected error occurred.";

    // Check for network/timeout errors (Supabase 522 or similar)
    if (err?.message === "Failed to fetch" || err?.status === 522 || err?.status === 504) {
      message = "Connection to server failed. The database might be sleeping (paused) or you are offline. Please try again in a moment.";
    }

    return message;
  };

  // ✅ Login with email + password
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        setIsAuthenticated(!!data.session);

        if (data.user) {
          setUser(data.user);
          const role = await fetchUserRole(data.user.id);
          if (role === "admin") navigate("/dashboard");
          else navigate("/user");
        }
      } catch (err: unknown) {
        throw new Error(handleAuthError(err));
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
        if (error) throw error;

        setIsAuthenticated(!!data.session);

        // Create profile with default role
        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email,
              role: "user" as const, // normal user by default
              user_type: "client" as const,
              is_admin: false,
              is_active: true,
              email_verified: false,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              metadata: {},
            } as any);

          if (profileError) {
            // If profile creation fails due to network, we should still allow the user to be 'signed up' but warn them
            console.error("Profile creation failed:", profileError);
          }

          await fetchUserRole(data.user.id);

        }

        // Auto-login after signup
        if (data.user) {
          setUser(data.user);
          await supabase.auth.signInWithPassword({ email, password });
          navigate("/user"); // redirect to user dashboard
        }

        return { session: data.session, user: data.user };
      } catch (err: unknown) {
        throw new Error(handleAuthError(err));
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
      if (error) throw error;

      setIsAuthenticated(false);
      setUser(null);
      setUserRole(undefined);
      navigate("/login");
    } catch (err: unknown) {
      console.warn("Logout error:", handleAuthError(err));
    }
  }, [navigate]);

  // ✅ Verify current session
  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const isValid = !!data.session;
      setIsAuthenticated(isValid);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await fetchUserRole(data.session.user.id);
      }

      return isValid;
    } catch (err: unknown) {
      console.warn("Session check failed:", handleAuthError(err));
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, [fetchUserRole]);


  // ✅ Google OAuth login/signup
  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      throw new Error(handleAuthError(err));
    }
  }, []);

  const signupWithGoogle = loginWithGoogle;

  // ✅ Password Reset Request
  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
    } catch (err: unknown) {
      throw new Error(handleAuthError(err));
    }
  }, []);

  // ✅ Confirm Password Reset
  const confirmPasswordReset = useCallback(async (_token: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch (err: unknown) {
      throw new Error(handleAuthError(err));
    }
  }, []);

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
