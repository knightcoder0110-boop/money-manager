"use client";

import { useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  CategoryBreakdownItem,
  CategoryAnalytics,
  DailySpending,
  MonthlyTrend,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { NecessityBarChart } from "@/components/charts/necessity-bar-chart";
import { DailyBarChart } from "@/components/charts/daily-bar-chart";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthlyPageClientProps {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  totalNecessary: number;
  totalUnnecessary: number;
  totalDebatable: number;
  categoryBreakdown: CategoryBreakdownItem[];
  topCategories: CategoryAnalytics[];
  dailySpending: DailySpending[];
  monthlyTrends: MonthlyTrend[];
}

export function MonthlyPageClient({
  year,
  month,
  totalIncome,
  totalExpense,
  totalNecessary,
  totalUnnecessary,
  totalDebatable,
  categoryBreakdown,
  topCategories,
  dailySpending,
  monthlyTrends,
}: MonthlyPageClientProps) {
  const router = useRouter();
  const savings = totalIncome - totalExpense;
  const isPositiveSavings = savings >= 0;

  function navigateMonth(direction: "prev" | "next") {
    let newMonth = month;
    let newYear = year;
    if (direction === "prev") {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    } else {
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }
    router.push(`/monthly?year=${newYear}&month=${newMonth}`);
  }

  const sortedCategories = [...topCategories].sort((a, b) => b.total - a.total);
  const maxCategoryTotal =
    sortedCategories.length > 0 ? sortedCategories[0].total : 0;

  return (
    <div className="flex flex-col gap-4 pb-24 px-4">
      {/* Month Selector */}
      <div className="flex items-center justify-between py-4">
        <button
          onClick={() => navigateMonth("prev")}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {MONTH_NAMES[month - 1]} {year}
        </h1>
        <button
          onClick={() => navigateMonth("next")}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Income / Expense / Savings Summary */}
      <Card>
        <CardContent className="space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Income</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-green-400">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expenses</span>
            <span className="font-mono tabular-nums text-sm font-semibold text-red-400">
              {formatCurrency(totalExpense)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-sm font-medium">
              {isPositiveSavings ? "Saved" : "Overspent"}
            </span>
            <span
              className={cn(
                "font-mono tabular-nums text-sm font-bold",
                isPositiveSavings ? "text-green-400" : "text-red-400"
              )}
            >
              {formatCurrency(Math.abs(savings))}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Category Pie Chart */}
      <CategoryPieChart data={categoryBreakdown} />

      {/* Necessity Breakdown */}
      <NecessityBarChart
        necessary={totalNecessary}
        unnecessary={totalUnnecessary}
        debatable={totalDebatable}
      />

      {/* Savings Insight */}
      {totalUnnecessary > 0 && (
        <Card className="border-amber-900/50 bg-amber-950/30">
          <CardContent className="flex items-start gap-3 pt-4">
            <Lightbulb className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-200/80">
              If you cut <span className="font-semibold text-amber-300">all</span>{" "}
              unnecessary spending, you&apos;d save{" "}
              <span className="font-mono font-semibold text-amber-300">
                {formatCurrency(totalUnnecessary)}
              </span>{" "}
              extra this month.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Daily Spending Bar Chart */}
      <DailyBarChart data={dailySpending} />

      {/* Monthly Trend Chart */}
      <MonthlyTrendChart data={monthlyTrends} />

      {/* Top Categories */}
      {sortedCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedCategories.slice(0, 8).map((cat) => {
              const pct =
                maxCategoryTotal > 0
                  ? (cat.total / maxCategoryTotal) * 100
                  : 0;
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="font-mono tabular-nums text-sm text-muted-foreground">
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cat.color || "#3B82F6",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
