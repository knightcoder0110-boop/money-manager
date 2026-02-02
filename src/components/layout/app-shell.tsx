import { getBalanceData } from "@/actions/dashboard";
import { AppShellClient } from "@/components/layout/app-shell-client";

interface AppShellProps {
  children: React.ReactNode;
  balance?: number;
  budgetMode?: {
    active: boolean;
    daily_limit: number;
    today_remaining: number;
  };
}

export async function AppShell({ children, balance, budgetMode }: AppShellProps) {
  // If balance wasn't explicitly provided, fetch it
  let resolvedBalance = balance;
  let resolvedBudgetMode = budgetMode;

  if (resolvedBalance === undefined) {
    const data = await getBalanceData();
    resolvedBalance = data.balance;
    resolvedBudgetMode = data.budget_mode;
  }

  return (
    <AppShellClient
      balance={resolvedBalance}
      budgetMode={resolvedBudgetMode ?? { active: false, daily_limit: 0, today_remaining: 0 }}
    >
      {children}
    </AppShellClient>
  );
}
