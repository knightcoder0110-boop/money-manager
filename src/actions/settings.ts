"use server";

export async function getSetting(_key: string): Promise<unknown> {
  return null;
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  return {};
}

export async function updateSetting(
  _key: string,
  _value: unknown
): Promise<{ error: string | null }> {
  return { error: null };
}

export async function toggleBudgetMode(
  _active: boolean,
  _daily_limit?: number
): Promise<{ error: string | null }> {
  return { error: null };
}
