"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const isNegative = balance < 0;

  return (
    <Card className="border-0 bg-transparent shadow-none py-4">
      <CardContent className="flex flex-col items-center gap-1 px-6">
        <p
          className={cn(
            "text-4xl font-bold font-mono tabular-nums tracking-tight",
            isNegative ? "text-red-500" : "text-green-500"
          )}
        >
          {formatCurrency(balance)}
        </p>
        <p className="text-sm text-muted-foreground">Current Balance</p>
      </CardContent>
    </Card>
  );
}
