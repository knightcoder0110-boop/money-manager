"use client";

import type { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function TransactionList({ transactions, hasMore, onLoadMore }: TransactionListProps) {
  return (
    <div className="p-4 text-zinc-400">
      <p>Transaction List (stub — {transactions.length} transactions)</p>
      {hasMore && onLoadMore && (
        <button onClick={onLoadMore} className="text-blue-400 mt-2">Load more</button>
      )}
    </div>
  );
}
