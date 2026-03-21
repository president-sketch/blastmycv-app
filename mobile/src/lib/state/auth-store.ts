import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  headline?: string;
}

interface AuthState {
  authToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (authToken: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (authToken, user) => set({ authToken, user, isAuthenticated: true }),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
      logout: () => set({ authToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'blastmycv-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Backward compat: persisted data may use old `sessionCookie` key name
      merge: (persisted: unknown, current: AuthState): AuthState => {
        const p = persisted as Partial<AuthState & { sessionCookie?: string | null }>;
        return {
          ...current,
          ...p,
          // Accept legacy `sessionCookie` field from older persisted data
          authToken: p.authToken ?? p.sessionCookie ?? current.authToken,
        };
      },
    }
  )
);
