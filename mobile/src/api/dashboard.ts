import api from './client';
import { DashboardData, DailySpending } from '../types';

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get('/dashboard');
  return data;
}

export async function getBalance(): Promise<{ balance: number; budget_mode: { active: boolean; daily_limit: number } }> {
  const { data } = await api.get('/dashboard/balance');
  return data;
}

export async function getDailySpending(year: number, month: number): Promise<DailySpending[]> {
  const { data } = await api.get('/dashboard/daily-spending', { params: { year, month } });
  return data;
}
