import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "@/lib/contract/types";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "eximia-gate-dev-secret-change-in-production");
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || "eximia-gate-refresh-secret-change-in-production");

export async function signAccessToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(SECRET);
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload.sub as string;
  } catch {
    return null;
  }
}
