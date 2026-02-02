"use server";

import { createServerClient } from "@/lib/supabase/server";
import type {
  Transaction,
  TransactionWithDetails,
  CategoryBreakdownItem,
  DailySpending,
  BudgetModeSettings,
} from "@/types";

export async function getDashboardData(): Promise<{
  balance: number;
  today_expense: number;
  today_income: number;
  month_expense: number;
  month_income: number;
  month_necessary: number;
  month_unnecessary: number;
  month_debatable: number;
  budget_mode: {
    active: boolean;
    daily_limit: number;
    today_remaining: number;
  };
  recent_transactions: TransactionWithDetails[];
  category_breakdown: CategoryBreakdownItem[];
}> {
  const supabase = createServerClient();

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  // Run all queries in parallel
  const [
    allTxResult,
    todayTxResult,
    monthTxResult,
    settingsResult,
    recentTxResult,
  ] = await Promise.all([
    // All transactions for balance calculation
    supabase
      .from("transactions")
      .select("type, amount"),
    // Today's transactions
    supabase
      .from("transactions")
      .select("type, amount")
      .eq("transaction_date", today),
    // This month's transactions with category info
    supabase
      .from("transactions")
      .select("type, amount, necessity, category_id, categories(id, name, icon, color)")
      .gte("transaction_date", monthStart)
      .lte("transaction_date", today),
    // Settings
    supabase
      .from("settings")
      .select("key, value")
      .in("key", ["initial_balance", "budget_mode"]),
    // Recent 10 transactions with details
    supabase
      .from("transactions")
      .select("*, categories(*), subcategories(*), events(*)")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // Parse settings
  let initialBalance = 0;
  let budgetModeSettings: BudgetModeSettings = { active: false, daily_limit: 500, activated_at: null };

  for (const setting of settingsResult.data ?? []) {
    if (setting.key === "initial_balance") {
      initialBalance = Number((setting.value as { amount: number })?.amount ?? 0);
    } else if (setting.key === "budget_mode") {
      budgetModeSettings = setting.value as BudgetModeSettings;
    }
  }

  // Calculate balance: initial_balance + SUM(income) - SUM(expense)
  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of allTxResult.data ?? []) {
    const amt = Number(tx.amount);
    if (tx.type === "income") totalIncome += amt;
    else totalExpense += amt;
  }
  const balance = initialBalance + totalIncome - totalExpense;

  // Today totals
  let todayExpense = 0;
  let todayIncome = 0;
  for (const tx of todayTxResult.data ?? []) {
    const amt = Number(tx.amount);
    if (tx.type === "income") todayIncome += amt;
    else todayExpense += amt;
  }

  // Month totals and category breakdown
  let monthExpense = 0;
  let monthIncome = 0;
  let monthNecessary = 0;
  let monthUnnecessary = 0;
  let monthDebatable = 0;
  const categoryTotals = new Map<string, CategoryBreakdownItem>();

  for (const tx of monthTxResult.data ?? []) {
    const amt = Number(tx.amount);
    if (tx.type === "income") {
      monthIncome += amt;
      continue;
    }

    monthExpense += amt;
    if (tx.necessity === "necessary") monthNecessary += amt;
    else if (tx.necessity === "unnecessary") monthUnnecessary += amt;
    else if (tx.necessity === "debatable") monthDebatable += amt;

    // Category breakdown (expenses only)
    const cat = tx.categories as unknown as { id: string; name: string; icon: string; color: string } | null;
    if (cat) {
      const existing = categoryTotals.get(cat.id);
      if (existing) {
        existing.total += amt;
      } else {
        categoryTotals.set(cat.id, {
          category_id: cat.id,
          category_name: cat.name,
          category_icon: cat.icon,
          category_color: cat.color,
          total: amt,
        });
      }
    }
  }

  const category_breakdown = Array.from(categoryTotals.values()).sort(
    (a, b) => b.total - a.total
  );

  // Map recent transactions to TransactionWithDetails
  const recent_transactions: TransactionWithDetails[] = (recentTxResult.data ?? []).map(
    (row: Record<string, unknown>) => {
      const { categories, subcategories, events, ...tx } = row;
      return {
        ...(tx as unknown as Transaction),
        category: categories as TransactionWithDetails["category"],
        subcategory: (subcategories as TransactionWithDetails["subcategory"]) ?? null,
        event: (events as TransactionWithDetails["event"]) ?? null,
      };
    }
  );

  const todayRemaining = budgetModeSettings.daily_limit - todayExpense;

  return {
    balance,
    today_expense: todayExpense,
    today_income: todayIncome,
    month_expense: monthExpense,
    month_income: monthIncome,
    month_necessary: monthNecessary,
    month_unnecessary: monthUnnecessary,
    month_debatable: monthDebatable,
    budget_mode: {
      active: budgetModeSettings.active,
      daily_limit: budgetModeSettings.daily_limit,
      today_remaining: todayRemaining,
    },
    recent_transactions,
    category_breakdown,
  };
}

export async function getDailySpending(params: {
  year: number;
  month: number;
}): Promise<DailySpending[]> {
  const supabase = createServerClient();

  const monthStr = String(params.month).padStart(2, "0");
  const startDate = `${params.year}-${monthStr}-01`;

  // Get last day of month
  const lastDay = new Date(params.year, params.month, 0).getDate();
  const endDate = `${params.year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("transactions")
    .select("transaction_date, amount, necessity")
    .eq("type", "expense")
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .order("transaction_date", { ascending: true });

  if (error) {
    console.error("getDailySpending error:", error.message);
    return [];
  }

  // Aggregate by date
  const dailyMap = new Map<string, DailySpending>();

  // Initialize all days of the month
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${params.year}-${monthStr}-${String(d).padStart(2, "0")}`;
    dailyMap.set(dateStr, { date: dateStr, total: 0, necessary: 0, unnecessary: 0 });
  }

  for (const tx of data ?? []) {
    const dateStr = tx.transaction_date;
    const entry = dailyMap.get(dateStr);
    if (!entry) continue;
    const amt = Number(tx.amount);
    entry.total += amt;
    if (tx.necessity === "necessary") entry.necessary += amt;
    else if (tx.necessity === "unnecessary") entry.unnecessary += amt;
  }

  return Array.from(dailyMap.values());
}
