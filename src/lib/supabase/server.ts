import { createServerClient as createSSRClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Cookie-based Supabase client for web requests.
 * Uses anon key + RLS — user only sees their own data.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can fail in Server Components (read-only cookies).
            // This is fine — middleware will refresh the session.
          }
        },
      },
    }
  );
}

/**
 * Service-role Supabase client — bypasses RLS.
 * Use ONLY for admin operations (seeding, migrations, etc.).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Get the currently authenticated user from the session cookie.
 * Throws if not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  return user;
}

// Keep backward-compatible export — but now it's the admin client.
// Server actions will migrate to use createAuthClient() + getCurrentUser().
export function createServerClient() {
  return createAdminClient();
}
