import { getSetting } from "@/actions/settings";

export async function GET() {
  try {
    const appLock = (await getSetting("app_lock")) as {
      enabled?: boolean;
      password_hash?: string;
    } | null;

    return Response.json({
      locked: !!appLock?.enabled,
      has_password: !!appLock?.password_hash,
    });
  } catch (error) {
    console.error("Mobile auth status error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
