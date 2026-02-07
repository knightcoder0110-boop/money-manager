import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Validate Supabase JWT from mobile app and return the authenticated user.
 * Mobile sends: Authorization: Bearer <supabase-jwt>
 */
export async function getAuthUser(
  request: NextRequest
): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);

  // Create a Supabase client with the user's JWT to verify it
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;

  return { id: user.id, email: user.email ?? "" };
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
