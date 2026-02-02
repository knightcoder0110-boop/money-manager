"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react";

interface MonthSummaryProps {
  monthExpense: number;
  monthIncome: number;
}

export function MonthSummary({ monthExpense, monthIncome }: MonthSummaryProps) {
  const net = monthIncome - monthExpense;
  const isPositive = net >= 0;

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm text-muted-foreground">
          This Month
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-red-500/10 p-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-sm font-semibold font-mono tabular-nums text-red-400">
                {formatCurrency(monthExpense)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-500/10 p-1.5">
              <ArrowUp className="h-3.5 w-3.5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-sm font-semibold font-mono tabular-nums text-green-400">
                {formatCurrency(monthIncome)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <p
            className={cn(
              "text-sm font-semibold font-mono tabular-nums",
              isPositive ? "text-green-400" : "text-red-400"
            )}
          >
            {isPositive ? "Saved" : "Overspent"}{" "}
            {formatCurrency(Math.abs(net))}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
