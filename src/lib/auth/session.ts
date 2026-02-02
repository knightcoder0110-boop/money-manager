import { createHmac, randomBytes } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "app_session";
const SESSION_DAYS = 7;

function getSecret(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY!;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("hex");
}

export function createSessionToken(): string {
  const random = randomBytes(16).toString("hex");
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${random}.${expiry}`;
  const hmac = sign(payload);
  return `${payload}.${hmac}`;
}

export function verifySessionToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [random, expiryStr, hmac] = parts;
  const payload = `${random}.${expiryStr}`;
  const expected = sign(payload);
  if (hmac !== expected) return false;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) return false;
  return true;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
