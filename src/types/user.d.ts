// src/types/user.d.ts

export interface User {
  id: string;               // Unique user ID
  name: string;             // Full name
  email: string;            // Email address
  role?: 'user' | 'admin';  // Optional role for admin/user distinction
  createdAt?: string;       // Optional creation timestamp
  updatedAt?: string;       // Optional last updated timestamp
}

// API response when logging in or signing up
export interface AuthResponse {
  token: string;            // JWT token or session token
  user: User;               // User object
}

// Optional: login credentials type
export interface LoginCredentials {
  email: string;
  password: string;
}

// Optional: signup credentials type
export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}
