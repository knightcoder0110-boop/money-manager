import api from './client';
import { MonthlyTrend, CategoryAnalytics, TopCategory } from '../types';

export async function getMonthlyTrends(months: number = 6): Promise<MonthlyTrend[]> {
  const { data } = await api.get('/analytics/monthly-trends', { params: { months } });
  return data;
}

export async function getCategoryBreakdown(
  year: number,
  month: number,
  categoryId?: string
): Promise<CategoryAnalytics[]> {
  const { data } = await api.get('/analytics/category-breakdown', {
    params: { year, month, category_id: categoryId },
  });
  return data;
}

export async function getTopCategories(
  dateFrom?: string,
  dateTo?: string,
  limit: number = 10
): Promise<TopCategory[]> {
  const { data } = await api.get('/analytics/top-categories', {
    params: { date_from: dateFrom, date_to: dateTo, limit },
  });
  return data;
}
