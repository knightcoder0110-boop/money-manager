import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token and base URL
api.interceptors.request.use((config) => {
  const { token, serverUrl } = useAuthStore.getState();

  if (serverUrl) {
    config.baseURL = `${serverUrl}/api/mobile`;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().lock();
    }
    return Promise.reject(error);
  }
);

export default api;
