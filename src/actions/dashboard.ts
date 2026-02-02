"use server";

import type { DashboardData, DailySpending } from "@/types";

export async function getDashboardData(): Promise<DashboardData> {
  // Stub — will be implemented by the server actions agent
  return {
    balance: 0,
    today_expense: 0,
    today_income: 0,
    month_expense: 0,
    month_income: 0,
    month_necessary: 0,
    month_unnecessary: 0,
    month_debatable: 0,
    budget_mode: {
      active: false,
      daily_limit: 0,
      today_remaining: 0,
    },
    recent_transactions: [],
    category_breakdown: [],
  };
}

export async function getDailySpending(params: {
  year: number;
  month: number;
}): Promise<DailySpending[]> {
  // Stub — will be implemented by the server actions agent
  void params;
  return [];
}
