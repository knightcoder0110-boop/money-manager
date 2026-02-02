import { NextRequest } from "next/server";
import { validateMobileAuth, unauthorized } from "../../_auth";
import { createSubcategory } from "@/actions/categories";

export async function POST(request: NextRequest) {
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const body = await request.json();
    const result = await createSubcategory(body);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Mobile create subcategory error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
