// src/store/authStore.ts
import { create } from "zustand";
import type { User } from "../services/authService";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem("techmate_access_token"),
  refreshToken: localStorage.getItem("techmate_refresh_token"),
  user: null,
  setAuth: (accessToken, refreshToken, user) => {
    localStorage.setItem("techmate_access_token", accessToken);
    localStorage.setItem("techmate_refresh_token", refreshToken);
    set({ accessToken, refreshToken, user });
  },
  clearAuth: () => {
    localStorage.removeItem("techmate_access_token");
    localStorage.removeItem("techmate_refresh_token");
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));
