import { NextResponse } from "next/server";
import { RefreshSchema } from "@/lib/validators/schemas";
import { store } from "@/lib/db/store";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RefreshSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Refresh token required", code: "VALIDATION_ERROR" }, { status: 422 });
    }

    const userId = await verifyRefreshToken(parsed.data.refresh_token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid refresh token", code: "INVALID_REFRESH_TOKEN" }, { status: 401 });
    }

    const user = store.findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
    }

    store.revokeRefreshToken(parsed.data.refresh_token);

    const apps = store.getUserAppSlugs(user.id);
    const token = await signAccessToken({ sub: user.id, email: user.email, name: user.name, role: user.role, apps, scopes: user.role === "admin" ? ["read", "write", "admin"] : ["read", "write"] });
    const refresh_token = await signRefreshToken(user.id);
    store.storeRefreshToken(refresh_token, user.id);

    store.addLog({ user_id: user.id, action: "refresh", ip: req.headers.get("x-forwarded-for") || "0.0.0.0", user_agent: req.headers.get("user-agent") || "", success: true });

    return NextResponse.json({ token, refresh_token });
  } catch {
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
