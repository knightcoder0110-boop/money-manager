import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "../../_auth";
import {
  getEventWithTransactions,
  updateEvent,
  deleteEvent,
} from "@/actions/events";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const data = await getEventWithTransactions(id, user.id);

    if (!data) {
      return Response.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return Response.json({
      event: data.event,
      transactions: data.transactions,
      total: data.total,
      category_breakdown: data.breakdown,
    });
  } catch (error) {
    console.error("Mobile get event error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateEvent(id, body, user.id);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result.data);
  } catch (error) {
    console.error("Mobile update event error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const result = await deleteEvent(id, user.id);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Mobile delete event error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
