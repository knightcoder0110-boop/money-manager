import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Category usage tracking for showing frequent categories first
interface CategoryUsage {
  [categoryId: string]: {
    count: number;
    lastUsed: number; // timestamp
  };
}

// Streak tracking for gamification
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null; // YYYY-MM-DD format
  totalTransactions: number;
  milestonesAchieved: number[]; // [7, 30, 100, etc.]
}

// Milestone thresholds for celebrations
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

interface AppStore {
  currency: { code: string; symbol: string };
  setCurrency: (currency: { code: string; symbol: string }) => void;

  // Category usage tracking
  categoryUsage: CategoryUsage;
  incrementCategoryUsage: (categoryId: string) => void;
  getFrequentCategoryIds: (limit?: number) => string[];

  // Last used category per type (expense/income)
  lastCategoryByType: { expense?: string; income?: string };
  setLastCategory: (type: 'expense' | 'income', categoryId: string) => void;

  // Streak tracking
  streak: StreakData;
  updateStreak: (transactionDate: string) => { newMilestone: number | null; isFirstToday: boolean };
  getStreakInfo: () => { current: number; longest: number; total: number };

  // Milestone celebration
  celebrationMilestone: number | null;
  showCelebration: (milestone: number) => void;
  dismissCelebration: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currency: { code: 'INR', symbol: '₹' },
      setCurrency: (currency) => set({ currency }),

      // Category usage
      categoryUsage: {},
      incrementCategoryUsage: (categoryId: string) => {
        set((state) => ({
          categoryUsage: {
            ...state.categoryUsage,
            [categoryId]: {
              count: (state.categoryUsage[categoryId]?.count ?? 0) + 1,
              lastUsed: Date.now(),
            },
          },
        }));
      },
      getFrequentCategoryIds: (limit = 6) => {
        const usage = get().categoryUsage;
        return Object.entries(usage)
          .sort((a, b) => {
            // Sort by count first, then by recency
            if (b[1].count !== a[1].count) {
              return b[1].count - a[1].count;
            }
            return b[1].lastUsed - a[1].lastUsed;
          })
          .slice(0, limit)
          .map(([id]) => id);
      },

      // Last category by type
      lastCategoryByType: {},
      setLastCategory: (type, categoryId) => {
        set((state) => ({
          lastCategoryByType: {
            ...state.lastCategoryByType,
            [type]: categoryId,
          },
        }));
      },

      // Streak tracking
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastLogDate: null,
        totalTransactions: 0,
        milestonesAchieved: [],
      },

      updateStreak: (transactionDate: string) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let newStreak = state.streak.currentStreak;
        let newLongest = state.streak.longestStreak;
        const lastLog = state.streak.lastLogDate;
        const isFirstToday = lastLog !== today;

        // Determine streak based on transaction date and last log
        if (transactionDate === today) {
          if (lastLog === today) {
            // Already logged today, no streak change
          } else if (lastLog === yesterday) {
            // Continuing streak
            newStreak = state.streak.currentStreak + 1;
          } else {
            // Starting fresh or first transaction
            newStreak = 1;
          }
        } else if (transactionDate === yesterday && lastLog !== yesterday && lastLog !== today) {
          // Retroactive entry for yesterday, counts as continuation if we haven't logged yet
          newStreak = state.streak.currentStreak + 1;
        }

        // Update longest streak
        if (newStreak > newLongest) {
          newLongest = newStreak;
        }

        // Check for new milestone
        let newMilestone: number | null = null;
        for (const milestone of STREAK_MILESTONES) {
          if (
            newStreak >= milestone &&
            !state.streak.milestonesAchieved.includes(milestone)
          ) {
            newMilestone = milestone;
            break;
          }
        }

        set((prev) => ({
          streak: {
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastLogDate: transactionDate > (prev.streak.lastLogDate || '') ? transactionDate : prev.streak.lastLogDate,
            totalTransactions: prev.streak.totalTransactions + 1,
            milestonesAchieved: newMilestone
              ? [...prev.streak.milestonesAchieved, newMilestone]
              : prev.streak.milestonesAchieved,
          },
        }));

        return { newMilestone, isFirstToday };
      },

      getStreakInfo: () => {
        const { streak } = get();
        return {
          current: streak.currentStreak,
          longest: streak.longestStreak,
          total: streak.totalTransactions,
        };
      },

      // Milestone celebration
      celebrationMilestone: null,
      showCelebration: (milestone: number) => set({ celebrationMilestone: milestone }),
      dismissCelebration: () => set({ celebrationMilestone: null }),
    }),
    {
      name: 'money-manager-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        categoryUsage: state.categoryUsage,
        lastCategoryByType: state.lastCategoryByType,
        streak: state.streak,
      }),
    }
  )
);
