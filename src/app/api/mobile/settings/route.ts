import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "../_auth";
import { getAllSettings, updateSetting } from "@/actions/settings";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const data = await getAllSettings(user.id);
    return Response.json(data);
  } catch (error) {
    console.error("Mobile get settings error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof key !== "string") {
      return Response.json(
        { error: "key is required" },
        { status: 400 }
      );
    }

    const result = await updateSetting(key, value, user.id);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Mobile update setting error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
