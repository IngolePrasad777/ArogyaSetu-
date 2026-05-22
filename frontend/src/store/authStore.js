import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      profile: null,
      setSession: (session) => set({ accessToken: session.accessToken, refreshToken: session.refreshToken, profile: session.profile }),
      clearSession: () => set({ accessToken: null, refreshToken: null, profile: null })
    }),
    { name: 'arogyasetu-auth' }
  )
);
