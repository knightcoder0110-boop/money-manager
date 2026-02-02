import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/auth/hash";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "app_lock")
      .single();

    if (error || !data?.value) {
      return NextResponse.json({ error: "App lock not configured" }, { status: 400 });
    }

    const appLock = data.value as { password_hash?: string; enabled?: boolean };

    if (!appLock.enabled || !appLock.password_hash) {
      return NextResponse.json({ error: "App lock not enabled" }, { status: 400 });
    }

    if (!verifyPassword(password, appLock.password_hash)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = createSessionToken();
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
