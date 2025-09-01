// src/services/authService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user?: User;
}

interface MessageResponse {
  message: string;
}

/* ========== AUTH SERVICE ========== */

// Login user
const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    return res.data;
  } catch (err: any) {
    console.error("Login error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Login failed");
  }
};

// Signup user
const signup = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
    return res.data;
  } catch (err: any) {
    console.error("Signup error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Signup failed");
  }
};

// Logout user
const logout = async (): Promise<void> => {
  try {
    // Optional: notify backend if needed
    // await axios.post(`${API_URL}/auth/logout`);
    localStorage.removeItem("authToken");
  } catch (err: any) {
    console.warn("Logout error:", err.response?.data || err.message);
  }
};

// Verify JWT token
const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const res = await axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.valid === true;
  } catch (err: any) {
    console.warn("Token verification failed:", err.response?.data || err.message);
    return false;
  }
};

/* ========== PASSWORD RESET ========== */

// Step 1: Request password reset email
const requestPasswordReset = async (email: string): Promise<MessageResponse> => {
  try {
    const res = await axios.post(`${API_URL}/auth/reset-password`, { email });
    return res.data;
  } catch (err: any) {
    console.error("Password reset request error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Password reset request failed");
  }
};

// Step 2: Confirm reset with token + new password
const confirmPasswordReset = async (
  token: string,
  newPassword: string
): Promise<MessageResponse> => {
  try {
    const res = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
      newPassword,
    });
    return res.data;
  } catch (err: any) {
    console.error("Password reset confirm error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Password reset confirmation failed");
  }
};

/* ========== EXPORTS ========== */
export default {
  login,
  signup,
  logout,
  verifyToken,
  requestPasswordReset,
  confirmPasswordReset,
};
