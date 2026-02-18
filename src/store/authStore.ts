// src/store/authStore.ts
import { create } from "zustand";


import type { ProfileRow } from "../types/database.types";

interface AuthState {
  token: string | null;
  user: ProfileRow | null;
  setAuth: (token: string, user: ProfileRow) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));
