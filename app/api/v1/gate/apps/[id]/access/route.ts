import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { AccessSchema } from "@/lib/validators/schemas";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const payload = await verifyAccessToken(authHeader.slice(7));
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const { id: appId } = await params;
  const body = await req.json();
  const parsed = AccessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const app = store.findAppById(appId);
  if (!app) return NextResponse.json({ error: "App not found", code: "APP_NOT_FOUND" }, { status: 404 });

  const user = store.findUserById(parsed.data.user_id);
  if (!user) return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });

  if (parsed.data.action === "grant") {
    store.grantAccess(parsed.data.user_id, appId, payload.sub);
    return NextResponse.json({ message: `Access granted to ${user.name} for ${app.name}` });
  } else {
    store.revokeAccess(parsed.data.user_id, appId);
    return NextResponse.json({ message: `Access revoked for ${user.name} from ${app.name}` });
  }
}
