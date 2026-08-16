// ViperRange — Middleware (Edge-Compatible)
// ZeroDay Security Services

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth", "/api/health"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, images, and favicons
  if (
    pathname.startsWith("/images/") ||
    pathname.startsWith("/resources/") ||
    pathname.startsWith("/labs/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Check auth session cookie in edge runtime
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value;

  // Redirect unauthenticated users
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|images|resources|labs|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
