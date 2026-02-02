"use client";

import type { TransactionWithDetails } from "@/types";
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";

interface TransactionItemProps {
  transaction: TransactionWithDetails;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isExpense = transaction.type === "expense";
  const amount = isExpense ? -transaction.amount : transaction.amount;

  const necessityColors: Record<string, string> = {
    necessary: "text-green-500 bg-green-500/10",
    unnecessary: "text-red-500 bg-red-500/10",
    debatable: "text-amber-500 bg-amber-500/10",
  };

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full text-base shrink-0"
        style={{
          backgroundColor: transaction.category?.color
            ? `${transaction.category.color}20`
            : undefined,
        }}
      >
        {transaction.category?.icon || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">
            {transaction.note || transaction.category?.name || "Transaction"}
          </p>
          <p
            className={cn(
              "text-sm font-semibold font-mono tabular-nums shrink-0",
              isExpense ? "text-red-400" : "text-green-400"
            )}
          >
            {formatCurrency(amount)}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {transaction.category?.name}
            {transaction.subcategory ? ` > ${transaction.subcategory.name}` : ""}
          </span>
          {transaction.necessity && (
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                necessityColors[transaction.necessity] || ""
              )}
            >
              {transaction.necessity.charAt(0).toUpperCase() +
                transaction.necessity.slice(1)}
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto shrink-0">
            {formatDateShort(transaction.transaction_date)}
          </span>
        </div>
      </div>
    </div>
  );
}
