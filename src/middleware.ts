import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/lock", "/api/auth/verify", "/api/auth/grant", "/api/mobile/"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname === "/manifest.json") return true;
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|webmanifest)$/)) return true;
  return false;
}

async function verifyToken(token: string): Promise<boolean> {
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("app_session")?.value;
  if (token && (await verifyToken(token))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/lock";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
