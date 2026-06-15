// Edge-safe JWT helpers (jose only — no next/headers, no server-only).
// Safe to import from middleware AND server components.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "attnd_session";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-change-me-to-a-long-random-string-please-1234567890"
);

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}
