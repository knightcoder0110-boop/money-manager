"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

interface TodaySummaryProps {
  todayExpense: number;
  todayIncome: number;
}

export function TodaySummary({ todayExpense, todayIncome }: TodaySummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm text-muted-foreground">Today</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-red-500/10 p-1.5">
            <ArrowDown className="h-3.5 w-3.5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="text-sm font-semibold font-mono tabular-nums text-red-400">
              {formatCurrency(todayExpense)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-green-500/10 p-1.5">
            <ArrowUp className="h-3.5 w-3.5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Earned</p>
            <p className="text-sm font-semibold font-mono tabular-nums text-green-400">
              {formatCurrency(todayIncome)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
