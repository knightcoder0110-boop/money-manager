"use client";

import { cn, formatDate } from "@/lib/utils";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { TransactionWithDetails } from "@/types";

interface TransactionListProps {
  transactions: TransactionWithDetails[];
  onItemClick?: (transaction: TransactionWithDetails) => void;
  isLoading?: boolean;
  groupByDate?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function TransactionList({
  transactions,
  onItemClick,
  isLoading = false,
  groupByDate = true,
  emptyMessage = "No transactions yet.",
  className,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  if (!groupByDate) {
    return (
      <div className={cn("space-y-0.5", className)}>
        {transactions.map((t) => (
          <TransactionItem key={t.id} transaction={t} onClick={onItemClick} />
        ))}
      </div>
    );
  }

  // Group transactions by date
  const grouped: Record<string, TransactionWithDetails[]> = {};
  for (const t of transactions) {
    const dateKey = t.transaction_date;
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(t);
  }

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className={cn("space-y-4", className)}>
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-3 py-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {formatDate(date)}
            </p>
          </div>
          <div className="space-y-0.5">
            {grouped[date].map((t) => (
              <TransactionItem key={t.id} transaction={t} onClick={onItemClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
