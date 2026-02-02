import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import LockScreen from "@/components/auth/lock-screen";

interface LockPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function LockPage({ searchParams }: LockPageProps) {
  const params = await searchParams;

  const supabase = createServerClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "app_lock")
    .maybeSingle();

  const appLock = data?.value as {
    password_hash?: string;
    enabled?: boolean;
  } | null;

  // No password configured — grant session via API route and redirect back
  if (!appLock?.enabled || !appLock?.password_hash) {
    redirect(`/api/auth/grant?from=${encodeURIComponent(params.from || "/")}`);
  }

  return <LockScreen from={params.from} />;
}
