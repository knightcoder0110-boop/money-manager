import api from './client';
import { ActionResult } from '../types';

export async function getSettings(): Promise<Record<string, unknown>> {
  const { data } = await api.get('/settings');
  return data;
}

export async function updateSetting(key: string, value: unknown): Promise<ActionResult> {
  const { data } = await api.put('/settings', { key, value });
  return data;
}

export async function toggleBudgetMode(active: boolean, dailyLimit?: number): Promise<ActionResult> {
  const { data } = await api.post('/settings/budget-mode', { active, daily_limit: dailyLimit });
  return data;
}
