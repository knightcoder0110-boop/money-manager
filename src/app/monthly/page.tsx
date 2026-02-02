import { getCategoryBreakdown, getMonthlyTrends } from "@/actions/analytics";
import { getDailySpending } from "@/actions/dashboard";
import { AppShell } from "@/components/layout/app-shell";
import { MonthlyPageClient } from "./monthly-page-client";

interface MonthlyPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function MonthlyPage({ searchParams }: MonthlyPageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;

  const [categoryBreakdown, dailySpending, monthlyTrends] = await Promise.all([
    getCategoryBreakdown({ year, month }),
    getDailySpending({ year, month }),
    getMonthlyTrends(6),
  ]);

  const totalExpense = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
  const totalNecessary = categoryBreakdown.reduce(
    (sum, c) => sum + c.necessary,
    0
  );
  const totalUnnecessary = categoryBreakdown.reduce(
    (sum, c) => sum + c.unnecessary,
    0
  );
  const totalDebatable = categoryBreakdown.reduce(
    (sum, c) => sum + c.debatable,
    0
  );

  const monthlyTrendForThisMonth = monthlyTrends.find(
    (t) => t.month === `${year}-${String(month).padStart(2, "0")}`
  );
  const totalIncome = monthlyTrendForThisMonth?.income ?? 0;

  const categoryBreakdownForPie = categoryBreakdown.map((c) => ({
    category_id: c.id,
    category_name: c.name,
    category_icon: c.icon,
    category_color: c.color,
    total: c.total,
  }));

  return (
    <AppShell>
      <MonthlyPageClient
        year={year}
        month={month}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        totalNecessary={totalNecessary}
        totalUnnecessary={totalUnnecessary}
        totalDebatable={totalDebatable}
        categoryBreakdown={categoryBreakdownForPie}
        topCategories={categoryBreakdown}
        dailySpending={dailySpending}
        monthlyTrends={monthlyTrends}
      />
    </AppShell>
  );
}
