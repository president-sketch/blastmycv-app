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
  sessionCookie: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (sessionCookie: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sessionCookie: null,
      user: null,
      isAuthenticated: false,
      setAuth: (sessionCookie, user) => set({ sessionCookie, user, isAuthenticated: true }),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
      logout: () => set({ sessionCookie: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'blastmycv-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
