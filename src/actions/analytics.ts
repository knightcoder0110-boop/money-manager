"use server";

import type { CategoryAnalytics, MonthlyTrend } from "@/types";

export async function getMonthlyTrends(
  months?: number
): Promise<MonthlyTrend[]> {
  // Stub — will be implemented by the server actions agent
  void months;
  return [];
}

export async function getCategoryBreakdown(params: {
  year: number;
  month: number;
  category_id?: string;
}): Promise<CategoryAnalytics[]> {
  // Stub — will be implemented by the server actions agent
  void params;
  return [];
}
