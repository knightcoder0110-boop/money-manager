import { getDashboardData } from "@/actions/dashboard";
import { AppShell } from "@/components/layout/app-shell";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { BudgetModeBanner } from "@/components/dashboard/budget-mode-banner";
import { TodaySummary } from "@/components/dashboard/today-summary";
import { MonthSummary } from "@/components/dashboard/month-summary";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { QuickAddFab } from "@/components/dashboard/quick-add-fab";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <AppShell balance={data.balance} budgetMode={data.budget_mode}>
      <div className="flex flex-col gap-4 pb-24">
        <BalanceCard balance={data.balance} />

        <BudgetModeBanner
          active={data.budget_mode.active}
          dailyLimit={data.budget_mode.daily_limit}
          todayRemaining={data.budget_mode.today_remaining}
        />

        <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2">
          <TodaySummary
            todayExpense={data.today_expense}
            todayIncome={data.today_income}
          />
          <MonthSummary
            monthExpense={data.month_expense}
            monthIncome={data.month_income}
          />
        </div>

        <div className="px-4">
          <RecentTransactions transactions={data.recent_transactions} />
        </div>
      </div>

      <QuickAddFab />
    </AppShell>
  );
}
