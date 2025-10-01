import supabase from "../lib/supabaseClient";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  user?: User;
}

interface MessageResponse {
  message: string;
}

/* ========== AUTH SERVICE ========== */

// Login user
const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return {
    user: data.user
      ? {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || "",
          email: data.user.email || "",
        }
      : undefined,
  };
};

// Signup user
const signup = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }, // ✅ standard key
    },
  });

  if (error) throw new Error(error.message);

  return {
    user: data.user
      ? {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || name,
          email: data.user.email || "",
        }
      : undefined,
  };
};

/* ========== PASSWORD RESET ========== */
const requestPasswordReset = async (email: string): Promise<MessageResponse> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw new Error(error.message);

  return { message: "Password reset email sent successfully" };
};

const confirmPasswordReset = async (
  newPassword: string
): Promise<MessageResponse> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw new Error(error.message);

  return { message: "Password updated successfully" };
};

// Logout user
const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

// Verify session token
const verifyToken = async (): Promise<boolean> => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    await supabase.auth.signOut(); // ✅ force logout if session invalid
    return false;
  }
  return true;
};

export default {
  login,
  signup,
  logout,
  verifyToken,
  requestPasswordReset,
  confirmPasswordReset,
};
