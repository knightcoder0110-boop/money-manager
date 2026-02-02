"use server";

import type { DailySpending, TransactionWithDetails, CategoryBreakdownItem } from "@/types";

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
  return {
    balance: 0,
    today_expense: 0,
    today_income: 0,
    month_expense: 0,
    month_income: 0,
    month_necessary: 0,
    month_unnecessary: 0,
    month_debatable: 0,
    budget_mode: { active: false, daily_limit: 0, today_remaining: 0 },
    recent_transactions: [],
    category_breakdown: [],
  };
}

export async function getDailySpending(params: {
  year: number;
  month: number;
}): Promise<DailySpending[]> {
  return [];
}
