"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { hashPassword, verifyPassword } from "@/lib/auth/hash";
import { clearSessionCookie } from "@/lib/auth/session";

export async function setAppLockPassword(
  newPassword: string,
  currentPassword?: string
): Promise<{ error: string | null }> {
  const supabase = createServerClient();

  // Check if there's an existing password
  const { data: existing } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "app_lock")
    .single();

  const current = existing?.value as { password_hash?: string; enabled?: boolean } | null;

  // If password already set, verify current password
  if (current?.enabled && current?.password_hash) {
    if (!currentPassword) {
      return { error: "Current password is required" };
    }
    if (!verifyPassword(currentPassword, current.password_hash)) {
      return { error: "Current password is incorrect" };
    }
  }

  const password_hash = hashPassword(newPassword);

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: "app_lock", value: { password_hash, enabled: true } },
      { onConflict: "key" }
    );

  if (error) {
    console.error("setAppLockPassword error:", error.message);
    return { error: "Failed to set password. Please try again." };
  }

  revalidatePath("/settings");
  return { error: null };
}

export async function removeAppLockPassword(
  currentPassword: string
): Promise<{ error: string | null }> {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "app_lock")
    .single();

  const current = existing?.value as { password_hash?: string; enabled?: boolean } | null;

  if (!current?.enabled || !current?.password_hash) {
    return { error: "No password is set" };
  }

  if (!verifyPassword(currentPassword, current.password_hash)) {
    return { error: "Current password is incorrect" };
  }

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: "app_lock", value: { password_hash: null, enabled: false } },
      { onConflict: "key" }
    );

  if (error) {
    console.error("removeAppLockPassword error:", error.message);
    return { error: "Failed to remove password. Please try again." };
  }

  // Clear the session cookie so the lock state is clean
  await clearSessionCookie();

  revalidatePath("/settings");
  return { error: null };
}
