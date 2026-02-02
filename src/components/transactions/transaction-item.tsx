"use client";

import { cn, formatCurrency, formatDateShort } from "@/lib/utils";
import { NECESSITY_COLORS, TRANSACTION_TYPE_COLORS } from "@/lib/constants";
import type { TransactionWithDetails } from "@/types";

interface TransactionItemProps {
  transaction: TransactionWithDetails;
  onClick?: (transaction: TransactionWithDetails) => void;
  className?: string;
}

export function TransactionItem({
  transaction,
  onClick,
  className,
}: TransactionItemProps) {
  const typeColors = TRANSACTION_TYPE_COLORS[transaction.type];
  const necessityColors = transaction.necessity
    ? NECESSITY_COLORS[transaction.necessity]
    : null;

  return (
    <button
      type="button"
      onClick={() => onClick?.(transaction)}
      className={cn(
        "flex items-center gap-3 w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted",
        className
      )}
    >
      {/* Category icon */}
      <div
        className="flex items-center justify-center size-10 rounded-xl text-lg"
        style={{ backgroundColor: transaction.category?.color ? `${transaction.category.color}20` : undefined }}
      >
        {transaction.category?.icon ?? "?"}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {transaction.note || transaction.category?.name || "Transaction"}
          </p>
          <span
            className={cn(
              "text-sm font-semibold font-mono tabular-nums shrink-0",
              typeColors.text
            )}
          >
            {typeColors.prefix}
            {formatCurrency(transaction.amount)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {transaction.category?.name}
            {transaction.subcategory && ` > ${transaction.subcategory.name}`}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            &middot;
          </span>
          {necessityColors && (
            <span
              className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                necessityColors.bg,
                necessityColors.text
              )}
            >
              {transaction.necessity}
            </span>
          )}
          <span className="text-xs text-muted-foreground shrink-0 ml-auto">
            {formatDateShort(transaction.transaction_date)}
          </span>
        </div>
      </div>
    </button>
  );
}
