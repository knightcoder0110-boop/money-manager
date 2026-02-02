import { NextRequest } from "next/server";
import { validateMobileAuth, unauthorized } from "../_auth";
import { getCategories, createCategory } from "@/actions/categories";

export async function GET(request: NextRequest) {
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);

    const options: {
      include_subcategories?: boolean;
      type?: "expense" | "income";
    } = {};

    if (searchParams.has("include_subcategories")) {
      options.include_subcategories =
        searchParams.get("include_subcategories") !== "false";
    }
    if (searchParams.has("type")) {
      options.type = searchParams.get("type") as "expense" | "income";
    }

    const data = await getCategories(options);
    return Response.json(data);
  } catch (error) {
    console.error("Mobile get categories error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const body = await request.json();
    const result = await createCategory(body);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Mobile create category error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
