import { NextRequest } from "next/server";
import { validateMobileAuth, unauthorized } from "../../_auth";
import { getMonthlyTrends } from "@/actions/analytics";

export async function GET(request: NextRequest) {
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const months = searchParams.has("months")
      ? parseInt(searchParams.get("months")!, 10)
      : undefined;

    const data = await getMonthlyTrends(months);
    return Response.json(data);
  } catch (error) {
    console.error("Mobile monthly trends error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
