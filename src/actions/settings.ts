"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export async function getSetting(key: string): Promise<unknown> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    console.error("getSetting error:", error.message);
    return null;
  }

  return data?.value ?? null;
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("settings")
    .select("key, value");

  if (error) {
    console.error("getAllSettings error:", error.message);
    return {};
  }

  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function updateSetting(
  key: string,
  value: unknown
): Promise<{ error: string | null }> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) {
    console.error("updateSetting error:", error.message);
    return { error: "Failed to update setting. Please try again." };
  }

  revalidatePath("/");
  return { error: null };
}

export async function toggleBudgetMode(
  active: boolean,
  daily_limit?: number
): Promise<{ error: string | null }> {
  const supabase = createServerClient();

  // Read current budget_mode setting
  const { data: current } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "budget_mode")
    .single();

  const currentValue = (current?.value as Record<string, unknown>) ?? {
    active: false,
    daily_limit: 500,
    activated_at: null,
  };

  const newValue = {
    ...currentValue,
    active,
    daily_limit: daily_limit ?? currentValue.daily_limit ?? 500,
    activated_at: active ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from("settings")
    .upsert({ key: "budget_mode", value: newValue }, { onConflict: "key" });

  if (error) {
    console.error("toggleBudgetMode error:", error.message);
    return { error: "Failed to toggle budget mode. Please try again." };
  }

  revalidatePath("/");
  return { error: null };
}
