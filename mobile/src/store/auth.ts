import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const SERVER_URL_KEY = 'server_url';
const DEFAULT_SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || '';

interface AuthStore {
  session: Session | null;
  isLoading: boolean;
  serverUrl: string;

  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setServerUrl: (url: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  isLoading: true,
  serverUrl: DEFAULT_SERVER_URL,

  initialize: async () => {
    try {
      // Load server URL from AsyncStorage
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const storedUrl = await AsyncStorage.getItem(SERVER_URL_KEY);

      // Get current Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      set({
        session,
        serverUrl: storedUrl || DEFAULT_SERVER_URL,
        isLoading: false,
      });

      // Listen for auth state changes (token refresh, sign out, etc.)
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session });
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setSession: (session) => set({ session }),

  setServerUrl: async (url: string) => {
    const normalized = url.replace(/\/$/, '');
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem(SERVER_URL_KEY, normalized);
    set({ serverUrl: normalized });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
