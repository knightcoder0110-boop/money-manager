import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Supabase JWT and base URL
api.interceptors.request.use((config) => {
  const { session, serverUrl } = useAuthStore.getState();

  if (serverUrl) {
    config.baseURL = `${serverUrl}/api/mobile`;
  }

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// Response interceptor: handle 401 by signing out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().signOut();
    }
    return Promise.reject(error);
  }
);

export default api;
