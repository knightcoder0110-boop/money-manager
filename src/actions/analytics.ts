"use server";

import type { MonthlyTrend, CategoryAnalytics, TopCategory } from "@/types";

export async function getMonthlyTrends(months?: number): Promise<MonthlyTrend[]> {
  // Stub
  return [];
}

export async function getCategoryBreakdown(params: {
  year: number;
  month: number;
  category_id?: string;
}): Promise<CategoryAnalytics[]> {
  // Stub
  return [];
}

export async function getTopCategories(params?: {
  date_from?: string;
  date_to?: string;
  limit?: number;
}): Promise<TopCategory[]> {
  // Stub
  return [];
}
