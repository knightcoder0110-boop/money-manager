import { NextRequest } from "next/server";

export async function validateMobileAuth(
  request: NextRequest
): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);

  // Same HMAC verification as middleware.ts
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [random, expiryStr, hmac] = parts;
  const payload = `${random}.${expiryStr}`;

  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hmac !== expected) return false;

  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) return false;

  return true;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
