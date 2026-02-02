"use client";

import { useState, useTransition } from "react";
import type { CategoryWithSubs, CategoryAnalytics, Transaction } from "@/types";
import { getCategoryBreakdown } from "@/actions/analytics";
import { getTransactions } from "@/actions/transactions";
import { formatCurrency, getMonthDateRange } from "@/lib/utils";
import { TRANSACTION_TYPE_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryDeepDiveProps {
  category: CategoryWithSubs;
  subcategoryBreakdown: CategoryAnalytics[];
  transactions: Transaction[];
  initialYear: number;
  initialMonth: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CategoryDeepDive({
  category,
  subcategoryBreakdown: initialBreakdown,
  transactions: initialTransactions,
  initialYear,
  initialMonth,
}: CategoryDeepDiveProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [breakdown, setBreakdown] = useState(initialBreakdown);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isPending, startTransition] = useTransition();

  function changeMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setYear(newYear);
    setMonth(newMonth);

    startTransition(async () => {
      const { start, end } = getMonthDateRange(newYear, newMonth);
      const [bd, tx] = await Promise.all([
        getCategoryBreakdown({ year: newYear, month: newMonth, category_id: category.id }),
        getTransactions({ category_id: category.id, date_from: start, date_to: end, limit: 50 }),
      ]);
      setBreakdown(bd);
      setTransactions(tx.data);
    });
  }

  const totalSpent = breakdown.reduce((sum, b) => sum + b.total, 0);
  const maxAmount = breakdown.length > 0 ? Math.max(...breakdown.map((b) => b.total)) : 1;

  return (
    <div className="p-4 space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className={`font-medium ${isPending ? "opacity-50" : ""}`}>
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Total */}
      <div className="text-center">
        <p className="text-3xl font-mono font-bold tabular-nums">{formatCurrency(totalSpent)}</p>
        <p className="text-sm text-muted-foreground">spent this month</p>
      </div>

      {/* Subcategory Breakdown */}
      {breakdown.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Subcategory Breakdown
          </h3>
          <div className="space-y-2">
            {breakdown.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({item.transaction_count} txns)
                    </span>
                  </div>
                  <span className="font-mono tabular-nums">{formatCurrency(item.total)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.total / maxAmount) * 100}%`,
                      backgroundColor: item.color || category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Transactions
        </h3>
        {transactions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            No transactions for this category this month.
          </p>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => {
              const colors = TRANSACTION_TYPE_COLORS[tx.type];
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm">{tx.note || "No note"}</p>
                    <p className="text-xs text-muted-foreground">{tx.transaction_date}</p>
                  </div>
                  <span className={`font-mono text-sm tabular-nums ${colors.text}`}>
                    {colors.prefix}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
