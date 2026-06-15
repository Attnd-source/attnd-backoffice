import "server-only";
import { cookies } from "next/headers";
import { signSession, verifyToken, SESSION_COOKIE, type SessionUser } from "./jwt";

export type { SessionUser } from "./jwt";
export { SESSION_COOKIE, verifyToken } from "./jwt";

export async function createSession(user: SessionUser) {
  const token = await signSession(user);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function destroySession() {
  cookies().set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifyToken(token);
}
