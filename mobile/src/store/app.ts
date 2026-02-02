import { create } from 'zustand';

interface AppStore {
  currency: { code: string; symbol: string };
  setCurrency: (currency: { code: string; symbol: string }) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currency: { code: 'INR', symbol: '₹' },
  setCurrency: (currency) => set({ currency }),
}));
