import { NextRequest } from "next/server";
import { verifyPassword } from "@/lib/auth/hash";
import { createSessionToken } from "@/lib/auth/session";
import { getSetting } from "@/actions/settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return Response.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const appLock = (await getSetting("app_lock")) as {
      enabled?: boolean;
      password_hash?: string;
    } | null;

    if (!appLock?.enabled || !appLock?.password_hash) {
      return Response.json(
        { error: "App lock is not enabled" },
        { status: 400 }
      );
    }

    const valid = verifyPassword(password, appLock.password_hash);
    if (!valid) {
      return Response.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    return Response.json({ token });
  } catch (error) {
    console.error("Mobile auth verify error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
