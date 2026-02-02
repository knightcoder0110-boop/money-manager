import { NextRequest } from "next/server";
import { validateMobileAuth, unauthorized } from "../../_auth";
import { getBalanceData } from "@/actions/dashboard";

export async function GET(request: NextRequest) {
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const data = await getBalanceData();
    return Response.json(data);
  } catch (error) {
    console.error("Mobile dashboard balance error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
