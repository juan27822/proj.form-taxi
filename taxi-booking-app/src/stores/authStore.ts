import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin } from '../api';
import { Credentials } from '../types';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      isLoading: true, // Set initial state to true
      error: null,
      login: async (credentials: Credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken } = await apiLogin(credentials);
          set({ token: accessToken, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
          const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false, token: null, isAuthenticated: false });
          throw error; // Re-lanzamos el error para que el formulario lo pueda capturar
        }
      },
      logout: () => {
        set({ token: null, isAuthenticated: false });
      },
      clearError: () => set({ error: null }),
    }),
    { 
      name: 'auth-storage', 
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
      // This is called after hydration is complete
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      }
    }
  )
);