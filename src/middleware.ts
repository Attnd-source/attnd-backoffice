import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/jwt";

// Protect all app routes; allow login + static assets + the file API (which
// does its own auth check).
const PUBLIC = ["/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await verifyToken(token);
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // everything except next internals, static files, the logo, and uploads API
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|api/files).*)"],
};
