import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "../../_auth";
import { getBalanceData } from "@/actions/dashboard";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const data = await getBalanceData(user.id);
    return Response.json(data);
  } catch (error) {
    console.error("Mobile dashboard balance error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
