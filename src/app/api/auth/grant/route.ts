import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from") || "/";
  const token = createSessionToken();
  await setSessionCookie(token);

  const url = request.nextUrl.clone();
  url.pathname = from;
  url.search = "";
  return NextResponse.redirect(url);
}
