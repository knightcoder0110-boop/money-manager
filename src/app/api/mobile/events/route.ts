import { NextRequest } from "next/server";
import { validateMobileAuth, unauthorized } from "../_auth";
import { getEventsWithTotals, createEvent } from "@/actions/events";

export async function GET(request: NextRequest) {
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.has("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;
    const offset = searchParams.has("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : undefined;

    const result = await getEventsWithTotals({ limit, offset });

    const data = result.data.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      created_at: event.created_at,
      transaction_count: 0,
      total_spent: event.total_cost,
    }));

    return Response.json({ data, count: result.count });
  } catch (error) {
    console.error("Mobile get events error:", error);
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
    const result = await createEvent(body);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Mobile create event error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
