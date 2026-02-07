import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "../../_auth";
import {
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/actions/transactions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const data = await getTransaction(id, user.id);

    if (!data) {
      return Response.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("Mobile get transaction error:", error);
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
    const result = await updateTransaction(id, body, user.id);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result.data);
  } catch (error) {
    console.error("Mobile update transaction error:", error);
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
    const result = await deleteTransaction(id, user.id);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Mobile delete transaction error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
