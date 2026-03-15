import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { CreateAppSchema } from "@/lib/validators/schemas";

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const payload = await verifyAccessToken(authHeader.slice(7));
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });

  return NextResponse.json({ apps: store.getAllApps() });
}

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const parsed = CreateAppSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  if (store.findAppBySlug(parsed.data.slug)) {
    return NextResponse.json({ error: "App slug already exists", code: "SLUG_EXISTS" }, { status: 409 });
  }

  const app = store.createApp({ ...parsed.data, status: "active" });
  return NextResponse.json({ app }, { status: 201 });
}
