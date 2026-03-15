import { NextResponse } from "next/server";
import { LoginSchema } from "@/lib/validators/schemas";
import { store } from "@/lib/db/store";
import { comparePassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { email, password } = parsed.data;
    const user = store.findUserByEmail(email);

    if (!user || !comparePassword(password, user.password_hash)) {
      store.addLog({ user_id: user?.id || null, action: "login", ip: req.headers.get("x-forwarded-for") || "0.0.0.0", user_agent: req.headers.get("user-agent") || "", success: false });
      return NextResponse.json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    store.updateUser(user.id, { last_login: new Date().toISOString() });

    const apps = store.getUserAppSlugs(user.id);
    const token = await signAccessToken({ sub: user.id, email: user.email, name: user.name, role: user.role, apps, scopes: user.role === "admin" ? ["read", "write", "admin"] : ["read", "write"] });
    const refresh_token = await signRefreshToken(user.id);
    store.storeRefreshToken(refresh_token, user.id);

    store.addLog({ user_id: user.id, action: "login", ip: req.headers.get("x-forwarded-for") || "0.0.0.0", user_agent: req.headers.get("user-agent") || "", success: true });

    return NextResponse.json({
      token,
      refresh_token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url, apps, created_at: user.created_at },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
