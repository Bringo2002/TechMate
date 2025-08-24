// src/types/auth.d.ts

// Response returned by login/signup API
export interface AuthResponse {
  token: string;
  user?: User; // optional, if backend returns user info
}

// User object
export interface User {
  id: string;
  name: string;
  email: string;
  // Add more fields if needed, e.g., role, avatar
}

// Shape of form data for login
export interface LoginFormData {
  email: string;
  password: string;
}

// Shape of form data for signup
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string; // Optional, used only on frontend for validation
}

// Hook return type
export interface AuthHook {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

// Error shape returned by backend
export interface AuthError {
  error: string;
  message?: string;
  statusCode?: number;
}
