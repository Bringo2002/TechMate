import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface AuthResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

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
const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
    return res.data;
  } catch (err: any) {
    console.error("Signup error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Signup failed");
  }
};

// Logout user (optional backend call)
const logout = async (): Promise<void> => {
  try {
    // If backend has a logout endpoint, call it here
    // await axios.post(`${API_URL}/auth/logout`);
    localStorage.removeItem("authToken");
  } catch (err: any) {
    console.warn("Logout error:", err.response?.data || err.message);
  }
};

// Verify JWT token with backend
const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const res = await axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.valid === true;
  } catch (err) {
    if (typeof err === "object" && err !== null && "response" in err) {
      // @ts-ignore
      console.warn("Token verification failed:", err.response?.data || err.message);
    } else {
      console.warn("Token verification failed:", (err as Error).message);
    }
    return false;
  }
};

export default {
  login,
  signup,
  logout,
  verifyToken,
};
