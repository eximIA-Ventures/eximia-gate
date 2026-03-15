/**
 * eximIA Gate — Middleware Snippet for Consumer Apps
 *
 * Copy this file to your app and use `withGateAuth` to protect routes.
 *
 * Usage in Next.js App Router:
 *
 * ```ts
 * import { withGateAuth } from "@/lib/gate-middleware";
 *
 * export async function GET(req: Request) {
 *   const auth = await withGateAuth(req, "my-app-slug");
 *   if (auth.error) return auth.error;
 *   // auth.user is available
 *   return Response.json({ message: `Hello ${auth.user.name}` });
 * }
 * ```
 */

const GATE_URL = process.env.GATE_URL || "https://gate.eximiaventures.com.br";

interface GateUser {
  sub: string;
  email: string;
  name: string;
  role: string;
  apps: string[];
  scopes: string[];
}

interface AuthResult {
  user: GateUser;
  error?: never;
}

interface AuthError {
  user?: never;
  error: Response;
}

export async function withGateAuth(
  req: Request,
  appSlug: string
): Promise<AuthResult | AuthError> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: Response.json({ error: "Missing authorization header", code: "UNAUTHORIZED" }, { status: 401 }) };
  }

  const token = authHeader.slice(7);

  try {
    const res = await fetch(`${GATE_URL}/api/v1/gate/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { error: Response.json({ error: "Invalid token", code: "INVALID_TOKEN" }, { status: 401 }) };
    }

    const data = await res.json();
    const user = data.user as GateUser;

    if (!user.apps.includes(appSlug)) {
      return { error: Response.json({ error: "Access denied to this app", code: "APP_ACCESS_DENIED" }, { status: 403 }) };
    }

    return { user };
  } catch {
    return { error: Response.json({ error: "Gate service unavailable", code: "GATE_UNAVAILABLE" }, { status: 503 }) };
  }
}
