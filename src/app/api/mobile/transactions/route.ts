import { NextRequest } from "next/server";
import { validateMobileAuth, unauthorized } from "../_auth";
import { getTransactions, createTransaction } from "@/actions/transactions";

export async function GET(request: NextRequest) {
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);

    const filters: Record<string, unknown> = {};
    if (searchParams.has("type")) filters.type = searchParams.get("type");
    if (searchParams.has("category_id"))
      filters.category_id = searchParams.get("category_id");
    if (searchParams.has("subcategory_id"))
      filters.subcategory_id = searchParams.get("subcategory_id");
    if (searchParams.has("necessity"))
      filters.necessity = searchParams.get("necessity");
    if (searchParams.has("event_id"))
      filters.event_id = searchParams.get("event_id");
    if (searchParams.has("date_from"))
      filters.date_from = searchParams.get("date_from");
    if (searchParams.has("date_to"))
      filters.date_to = searchParams.get("date_to");
    if (searchParams.has("search"))
      filters.search = searchParams.get("search");
    if (searchParams.has("limit"))
      filters.limit = parseInt(searchParams.get("limit")!, 10);
    if (searchParams.has("offset"))
      filters.offset = parseInt(searchParams.get("offset")!, 10);

    const data = await getTransactions(
      filters as Parameters<typeof getTransactions>[0]
    );
    return Response.json(data);
  } catch (error) {
    console.error("Mobile get transactions error:", error);
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
    const result = await createTransaction(body);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Mobile create transaction error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
