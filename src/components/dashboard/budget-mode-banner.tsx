"use client";

import { formatCurrency } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface BudgetModeBannerProps {
  active: boolean;
  dailyLimit: number;
  todayRemaining: number;
}

export function BudgetModeBanner({
  active,
  dailyLimit,
  todayRemaining,
}: BudgetModeBannerProps) {
  if (!active) return null;

  const isOverBudget = todayRemaining <= 0;

  return (
    <div className="mx-4 rounded-lg bg-red-900/80 border border-red-700 px-4 py-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-red-300 uppercase tracking-wide">
            Budget Mode On
          </p>
          <p className="text-xs text-red-400 mt-0.5">
            Daily limit: {formatCurrency(dailyLimit)}
            {" · "}
            {isOverBudget ? (
              <span className="text-red-300 font-semibold">
                Over by {formatCurrency(Math.abs(todayRemaining))}
              </span>
            ) : (
              <span>
                {formatCurrency(todayRemaining)} remaining today
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
