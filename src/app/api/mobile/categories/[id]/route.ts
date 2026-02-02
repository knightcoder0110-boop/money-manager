import { NextRequest } from "next/server";
import { validateMobileAuth, unauthorized } from "../../_auth";
import { updateCategory, deleteCategory } from "@/actions/categories";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateCategory(id, body);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result.data);
  } catch (error) {
    console.error("Mobile update category error:", error);
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
  if (!(await validateMobileAuth(request))) return unauthorized();

  try {
    const { id } = await params;
    const result = await deleteCategory(id);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Mobile delete category error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
