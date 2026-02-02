"use server";

export async function getSetting(key: string): Promise<unknown> {
  // Stub
  return null;
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  // Stub
  return {};
}

export async function updateSetting(
  key: string,
  value: unknown
): Promise<{ error: string | null }> {
  // Stub
  return { error: "Not implemented" };
}

export async function toggleBudgetMode(
  active: boolean,
  daily_limit?: number
): Promise<{ error: string | null }> {
  // Stub
  return { error: "Not implemented" };
}
