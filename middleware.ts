// ViperRange — Middleware
// ZeroDay Security Services

import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth", "/api/health"];
const ADMIN_PATHS = ["/admin"];

export async function middleware(request: NextRequest) {
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

  const session = await auth();

  // Redirect unauthenticated users
  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|images|resources|labs|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
