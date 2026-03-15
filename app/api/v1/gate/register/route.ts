import { NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validators/schemas";
import { store } from "@/lib/db/store";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { email, password, name } = parsed.data;

    if (store.findUserByEmail(email)) {
      return NextResponse.json({ error: "Email already registered", code: "EMAIL_EXISTS" }, { status: 409 });
    }

    const user = store.createUser({
      email,
      password_hash: hashPassword(password),
      name,
      role: "user",
      avatar_url: null,
    });

    const apps = store.getUserAppSlugs(user.id);
    const token = await signAccessToken({ sub: user.id, email: user.email, name: user.name, role: user.role, apps, scopes: ["read", "write"] });
    const refresh_token = await signRefreshToken(user.id);
    store.storeRefreshToken(refresh_token, user.id);

    store.addLog({ user_id: user.id, action: "register", ip: req.headers.get("x-forwarded-for") || "0.0.0.0", user_agent: req.headers.get("user-agent") || "", success: true });

    return NextResponse.json({
      token,
      refresh_token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url, apps, created_at: user.created_at },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
