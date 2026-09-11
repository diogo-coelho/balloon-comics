import { AuthUser } from '@/types/auth';
import { create } from 'zustand';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;

  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setAuthReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthReady: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  setAuthReady: (ready) =>
    set({
      isAuthReady: ready,
    }),
}));