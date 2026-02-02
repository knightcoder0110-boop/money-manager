import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'app_session_token';
const SERVER_URL_KEY = 'server_url';

interface AuthStore {
  isLocked: boolean;
  token: string | null;
  serverUrl: string;
  isLoading: boolean;
  hasPassword: boolean;

  initialize: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  setServerUrl: (url: string) => Promise<void>;
  lock: () => void;
  unlock: (token: string) => Promise<void>;
  setHasPassword: (val: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isLocked: true,
  token: null,
  serverUrl: '',
  isLoading: true,
  hasPassword: false,

  initialize: async () => {
    try {
      const [token, serverUrl] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(SERVER_URL_KEY),
      ]);
      set({
        token,
        serverUrl: serverUrl || '',
        isLocked: !token,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setToken: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, isLocked: false });
  },

  clearToken: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, isLocked: true });
  },

  setServerUrl: async (url: string) => {
    const normalized = url.replace(/\/$/, '');
    await SecureStore.setItemAsync(SERVER_URL_KEY, normalized);
    set({ serverUrl: normalized });
  },

  lock: () => set({ isLocked: true }),

  unlock: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, isLocked: false });
  },

  setHasPassword: (val: boolean) => set({ hasPassword: val }),
}));
