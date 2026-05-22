import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  const isAuthEndpoint = String(config.url || '').startsWith('/auth/');
  if (token && !isAuthEndpoint) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message = String(error.response?.data?.message || '');
    if ([401, 403].includes(error.response?.status) || message.includes('JWT expired')) {
      useAuthStore.getState().clearSession();
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    if (!navigator.onLine && error.config?.method !== 'get') {
      const { queueOfflineRequest } = await import('../utils/offlineDb.js');
      await queueOfflineRequest(error.config);
    }
    return Promise.reject(error);
  }
);
