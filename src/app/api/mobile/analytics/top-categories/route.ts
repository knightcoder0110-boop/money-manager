import { NextRequest } from "next/server";
import { validateMobileAuth, unauthorized } from "../../_auth";
import { getTopCategories } from "@/actions/analytics";

export async function GET(request: NextRequest) {
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);

    const params: {
      date_from?: string;
      date_to?: string;
      limit?: number;
    } = {};

    if (searchParams.has("date_from"))
      params.date_from = searchParams.get("date_from")!;
    if (searchParams.has("date_to"))
      params.date_to = searchParams.get("date_to")!;
    if (searchParams.has("limit"))
      params.limit = parseInt(searchParams.get("limit")!, 10);

    const data = await getTopCategories(params);
    return Response.json(data);
  } catch (error) {
    console.error("Mobile top categories error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
