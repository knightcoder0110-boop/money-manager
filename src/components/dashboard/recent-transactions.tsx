"use client";

import type { TransactionWithDetails } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionItem } from "@/components/transactions/transaction-item";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RecentTransactionsProps {
  transactions: TransactionWithDetails[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-0">
        <CardTitle className="text-sm text-muted-foreground">
          Recent Transactions
        </CardTitle>
        <Link
          href="/transactions"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No transactions yet.
            </p>
            <Link
              href="/add"
              className="text-sm text-primary hover:underline mt-1 inline-block"
            >
              Add your first expense
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
