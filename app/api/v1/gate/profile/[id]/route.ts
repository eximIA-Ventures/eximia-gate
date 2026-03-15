import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { UpdateProfileSchema } from "@/lib/validators/schemas";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = store.findUserById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
  }

  const apps = store.getUserApps(user.id);
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    apps: apps.map((a) => ({ slug: a.slug, name: a.name, icon: a.icon, url: a.url })),
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const payload = await verifyAccessToken(authHeader.slice(7));
  if (!payload || (payload.sub !== id && payload.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const user = store.updateUser(id, parsed.data);
  if (!user) {
    return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url });
}
