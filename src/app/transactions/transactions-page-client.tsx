"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getTransactions } from "@/actions/transactions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TRANSACTION_TYPE_COLORS } from "@/lib/constants";
import type { TransactionWithDetails, TransactionType, Necessity } from "@/types";

interface TransactionsPageClientProps {
  initialTransactions: TransactionWithDetails[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  filters: {
    type?: TransactionType;
    category_id?: string;
    necessity?: Necessity;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
}

export default function TransactionsPageClient({
  initialTransactions,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  filters,
}: TransactionsPageClientProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(initialTransactions);
  const [page, setPage] = useState(currentPage);
  const [isPending, startTransition] = useTransition();
  const hasMore = page < totalPages;

  function handleLoadMore() {
    startTransition(async () => {
      const nextPage = page + 1;
      const result = await getTransactions({
        ...filters,
        limit: pageSize,
        offset: (nextPage - 1) * pageSize,
      });
      setTransactions((prev) => [...prev, ...result.data]);
      setPage(nextPage);
    });
  }

  // Group transactions by date
  const grouped = transactions.reduce<Record<string, TransactionWithDetails[]>>((acc, txn) => {
    const date = txn.transaction_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(txn);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-zinc-400 text-lg mb-1">No transactions found</p>
        <p className="text-zinc-500 text-sm">
          Try adjusting your filters or add your first transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="px-4 py-2 text-sm text-zinc-500">
        {totalCount} transaction{totalCount !== 1 ? "s" : ""}
      </div>

      {sortedDates.map((date) => (
        <div key={date}>
          <div className="px-4 py-2 text-xs font-medium text-zinc-500 bg-zinc-900/50 sticky top-0">
            {formatDate(date)}
          </div>
          <div className="divide-y divide-zinc-800">
            {grouped[date].map((txn) => (
              <TransactionRow key={txn.id} txn={txn} onClick={() => router.push(`/edit/${txn.id}`)} />
            ))}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center py-6">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="px-6 py-2 text-sm font-medium rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

function TransactionRow({ txn, onClick }: { txn: TransactionWithDetails; onClick: () => void }) {
  const typeColor = TRANSACTION_TYPE_COLORS[txn.type];
  const categoryName = txn.category?.name ?? (txn.type === "expense" ? "Expense" : "Income");
  const categoryIcon = txn.category?.icon;
  const categoryColor = txn.category?.color;

  const secondaryParts: string[] = [];
  if (txn.subcategory?.name) secondaryParts.push(txn.subcategory.name);
  if (txn.event?.name) secondaryParts.push(txn.event.name);
  if (txn.note) secondaryParts.push(txn.note);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Category icon */}
      <div
        className="flex items-center justify-center size-8 rounded-full text-sm shrink-0"
        style={{ backgroundColor: categoryColor ? `${categoryColor}20` : "rgb(39 39 42)" }}
      >
        {categoryIcon ?? categoryName.charAt(0)}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-zinc-100 truncate">
            {categoryName}
          </p>
          <span
            className={`text-sm font-mono tabular-nums font-medium shrink-0 ${typeColor.text}`}
          >
            {typeColor.prefix}
            {formatCurrency(txn.amount)}
          </span>
        </div>
        {secondaryParts.length > 0 && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">
            {secondaryParts.join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
