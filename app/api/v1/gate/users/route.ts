import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const payload = await verifyAccessToken(authHeader.slice(7));
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const users = store.getAllUsers().map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    avatar_url: u.avatar_url,
    created_at: u.created_at,
    last_login: u.last_login,
    apps: store
      .getUserAccessList(u.id)
      .filter((a) => a.access.status === "active")
      .map((a) => ({
        slug: a.app.slug,
        name: a.app.name,
        app_id: a.app.id,
      })),
  }));

  return NextResponse.json({ users });
}
