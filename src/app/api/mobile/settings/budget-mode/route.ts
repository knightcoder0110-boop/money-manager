import { NextRequest } from "next/server";
import { validateMobileAuth, unauthorized } from "../../_auth";
import { toggleBudgetMode } from "@/actions/settings";

export async function POST(request: NextRequest) {
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const body = await request.json();
    const { active, daily_limit } = body;

    if (typeof active !== "boolean") {
      return Response.json(
        { error: "active (boolean) is required" },
        { status: 400 }
      );
    }

    const result = await toggleBudgetMode(active, daily_limit);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Mobile toggle budget mode error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
