import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "../../_auth";
import { getCategoryBreakdown } from "@/actions/analytics";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") ?? "", 10);
    const month = parseInt(searchParams.get("month") ?? "", 10);

    if (isNaN(year) || isNaN(month)) {
      return Response.json(
        { error: "year and month query parameters are required" },
        { status: 400 }
      );
    }

    const category_id = searchParams.get("category_id") ?? undefined;

    const data = await getCategoryBreakdown({ year, month, category_id }, user.id);
    return Response.json(data);
  } catch (error) {
    console.error("Mobile category breakdown error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
