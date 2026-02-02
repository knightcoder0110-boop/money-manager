"use client";

import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";
import { TRANSACTION_TYPE_COLORS } from "@/lib/constants";

interface EventBreakdownProps {
  breakdown: { category_name: string; amount: number }[];
  transactions: Transaction[];
  total: number;
}

export default function EventBreakdown({ breakdown, transactions, total }: EventBreakdownProps) {
  const maxAmount = breakdown.length > 0 ? Math.max(...breakdown.map((b) => b.amount)) : 1;

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      {breakdown.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Breakdown
          </h3>
          <div className="space-y-2">
            {breakdown.map((item) => (
              <div key={item.category_name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.category_name}</span>
                  <span className="font-mono tabular-nums">{formatCurrency(item.amount)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border text-sm font-medium">
            <span>Total</span>
            <span className="font-mono tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      {/* Transaction List */}
      {transactions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            All Expenses
          </h3>
          <div className="space-y-1">
            {transactions.map((tx) => {
              const colors = TRANSACTION_TYPE_COLORS[tx.type];
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
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
        </div>
      )}

      {breakdown.length === 0 && transactions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No expenses linked to this event yet.</p>
          <p className="text-sm mt-1">Add transactions and link them to this event.</p>
        </div>
      )}
    </div>
  );
}
