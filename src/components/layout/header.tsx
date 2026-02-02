"use client";

import { formatCurrency } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  balance: number;
  budgetMode: {
    active: boolean;
    daily_limit: number;
    today_remaining: number;
  };
}

export function Header({ balance, budgetMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Current Balance</span>
          <span className="text-xl font-bold font-mono tabular-nums text-foreground">
            {formatCurrency(balance)}
          </span>
        </div>
        {budgetMode.active && (
          <Badge
            variant="destructive"
            className="flex items-center gap-1.5 bg-red-900 text-red-400 border-red-700 px-3 py-1"
          >
            <AlertTriangle className="size-3.5" />
            <span className="text-xs font-semibold">BUDGET MODE</span>
          </Badge>
        )}
      </div>
      {budgetMode.active && (
        <div className="bg-red-950/50 border-t border-red-900/50 px-4 py-1.5">
          <p className="text-xs text-red-400 font-medium text-center">
            Daily limit: {formatCurrency(budgetMode.daily_limit)} &middot; Remaining today:{" "}
            <span
              className={
                budgetMode.today_remaining <= 0
                  ? "text-red-300 font-bold"
                  : "text-green-400"
              }
            >
              {formatCurrency(budgetMode.today_remaining)}
            </span>
          </p>
        </div>
      )}
    </header>
  );
}
