"use client";

import { useEffect, useState, useCallback } from "react";
import { getSetting } from "@/actions/settings";
import type { BudgetModeSettings } from "@/types";

const DEFAULT_BUDGET_MODE: BudgetModeSettings = {
  active: false,
  daily_limit: 0,
  activated_at: null,
};

export function useBudgetMode() {
  const [budgetMode, setBudgetMode] = useState<BudgetModeSettings>(DEFAULT_BUDGET_MODE);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const value = await getSetting("budget_mode");
      if (value && typeof value === "object") {
        setBudgetMode(value as BudgetModeSettings);
      }
    } catch {
      // Silently fail — default is budget mode off
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { budgetMode, isLoading, refresh };
}
