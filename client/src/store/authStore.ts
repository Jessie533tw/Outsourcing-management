import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { authAPI, setAuthToken } from '../services/api';
import type { AuthState, LoginCredentials, RegisterData, User } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authAPI.login(credentials);
          setAuthToken(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success(`歡迎回來，${user.name}！`);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authAPI.register(data);
          setAuthToken(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success(`註冊成功，歡迎 ${user.name}！`);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        setAuthToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        toast.success('已安全登出');
      },

      refreshToken: async () => {
        try {
          const { token } = await authAPI.refreshToken();
          setAuthToken(token);
          set({ token });
        } catch (error) {
          // If refresh fails, logout
          get().logout();
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          const { user } = await authAPI.updateProfile(data);
          set({
            user,
            isLoading: false,
          });
          toast.success('個人資料更新成功');
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthToken(state.token);
        }
      },
    }
  )
);