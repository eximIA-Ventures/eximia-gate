import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { UpdateAppSchema } from "@/lib/validators/schemas";

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const payload = await verifyAccessToken(authHeader.slice(7));
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateAppSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const app = store.updateApp(id, parsed.data);
  if (!app) return NextResponse.json({ error: "App not found", code: "APP_NOT_FOUND" }, { status: 404 });

  return NextResponse.json({ app });
}
