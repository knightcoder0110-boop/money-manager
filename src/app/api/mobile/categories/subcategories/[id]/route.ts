import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "../../../_auth";
import {
  updateSubcategory,
  deleteSubcategory,
} from "@/actions/categories";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateSubcategory(id, body, user.id);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result.data);
  } catch (error) {
    console.error("Mobile update subcategory error:", error);
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
    const result = await deleteSubcategory(id, user.id);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Mobile delete subcategory error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
