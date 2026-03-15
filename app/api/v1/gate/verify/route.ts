import { NextResponse } from "next/server";
import { VerifySchema } from "@/lib/validators/schemas";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { store } from "@/lib/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Token required", code: "VALIDATION_ERROR" }, { status: 422 });
    }

    const payload = await verifyAccessToken(parsed.data.token);

    if (!payload) {
      store.addLog({ user_id: null, action: "verify", ip: req.headers.get("x-forwarded-for") || "0.0.0.0", user_agent: req.headers.get("user-agent") || "", success: false });
      return NextResponse.json({ error: "Invalid or expired token", code: "INVALID_TOKEN" }, { status: 401 });
    }

    const user = store.findUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
    }

    const apps = store.getUserAppSlugs(user.id);

    store.addLog({ user_id: user.id, action: "verify", ip: req.headers.get("x-forwarded-for") || "0.0.0.0", user_agent: req.headers.get("user-agent") || "", success: true });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url, apps, created_at: user.created_at },
      scopes: user.role === "admin" ? ["read", "write", "admin"] : ["read", "write"],
      apps_allowed: apps,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
