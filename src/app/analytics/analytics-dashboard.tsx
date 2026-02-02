"use client";

import type { MonthlyTrend, TopCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PiggyBank, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

interface AnalyticsDashboardProps {
  trends: MonthlyTrend[];
  topCategories: TopCategory[];
}

function formatMonthLabel(month: string): string {
  const [, m] = month.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[parseInt(m, 10) - 1] || month;
}

export default function AnalyticsDashboard({ trends, topCategories }: AnalyticsDashboardProps) {
  const chartData = trends.map((t) => ({
    month: formatMonthLabel(t.month),
    income: t.income,
    expense: t.expense,
    savings: t.savings,
    unnecessary: t.unnecessary,
  }));

  const latestTrend = trends[trends.length - 1];
  const totalUnnecessary = trends.reduce((sum, t) => sum + t.unnecessary, 0);
  const totalSavings = trends.reduce((sum, t) => sum + t.savings, 0);

  const maxCategoryTotal = topCategories.length > 0 ? Math.max(...topCategories.map((c) => c.total)) : 1;

  return (
    <div className="p-4 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto text-red-400 mb-1" />
            <p className="text-xs text-muted-foreground">Latest Expense</p>
            <p className="font-mono text-sm tabular-nums font-medium">
              {latestTrend ? formatCurrency(latestTrend.expense) : "--"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-green-400 mb-1" />
            <p className="text-xs text-muted-foreground">Latest Income</p>
            <p className="font-mono text-sm tabular-nums font-medium">
              {latestTrend ? formatCurrency(latestTrend.income) : "--"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <PiggyBank className="h-5 w-5 mx-auto text-blue-400 mb-1" />
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="font-mono text-sm tabular-nums font-medium">
              {formatCurrency(totalSavings)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No data yet. Start tracking your income and expenses!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="month" tick={{ fill: "#A1A1AA", fontSize: 12 }} />
                <YAxis tick={{ fill: "#A1A1AA", fontSize: 12 }} width={50} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181B",
                    border: "1px solid #27272A",
                    borderRadius: "8px",
                    color: "#FAFAFA",
                  }}
                />
                <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-green-500 inline-block rounded" /> Income
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Expense
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Savings
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Unnecessary Spending Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unnecessary Spending</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No data yet.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="month" tick={{ fill: "#A1A1AA", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#A1A1AA", fontSize: 12 }} width={50} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181B",
                      border: "1px solid #27272A",
                      borderRadius: "8px",
                      color: "#FAFAFA",
                    }}
                  />
                  <Bar dataKey="unnecessary" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Total unnecessary: {formatCurrency(totalUnnecessary)}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Top Spending Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Top Spending Categories</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No spending data yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topCategories.map((cat, index) => (
                <div key={`${cat.category_name}-${index}`} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{cat.category_icon}</span>
                      <span>{cat.category_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums">{formatCurrency(cat.total)}</span>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {cat.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(cat.total / maxCategoryTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
