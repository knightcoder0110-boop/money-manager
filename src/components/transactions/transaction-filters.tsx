"use client";

import type { CategoryWithSubs, TransactionType, Necessity } from "@/types";

interface TransactionFiltersProps {
  categories: CategoryWithSubs[];
  currentType?: TransactionType;
  currentCategory?: string;
  currentNecessity?: Necessity;
  currentDateFrom?: string;
  currentDateTo?: string;
}

export default function TransactionFilters({
  categories,
  currentType,
  currentCategory,
  currentNecessity,
  currentDateFrom,
  currentDateTo,
}: TransactionFiltersProps) {
  return (
    <div className="p-4 text-zinc-400">
      <p>Transaction Filters (stub)</p>
    </div>
  );
}
