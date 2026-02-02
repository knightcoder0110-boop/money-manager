"use client";

import { useEffect, useState, useCallback } from "react";
import { getCategories } from "@/actions/categories";
import type { CategoryWithSubs, TransactionType } from "@/types";

export function useCategories(type?: TransactionType) {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCategories({
        include_subcategories: true,
        type,
      });
      setCategories(data);
    } catch {
      // Silently fail — will show empty categories
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, isLoading, refresh };
}
