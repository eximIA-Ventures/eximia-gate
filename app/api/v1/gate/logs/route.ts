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

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || undefined;
  const success = url.searchParams.get("success");

  const logs = store.getLogs(100, {
    action,
    success: success !== null && success !== "" ? success === "true" : undefined,
  });

  const enrichedLogs = logs.map((l) => {
    const user = l.user_id ? store.findUserById(l.user_id) : null;
    return {
      ...l,
      user_name: user?.name || null,
      user_email: user?.email || null,
    };
  });

  return NextResponse.json({ logs: enrichedLogs });
}
