import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // opus67.com -> show /opus67 page content (rewrite, not redirect)
  if (hostname.includes("opus67.com") && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/opus67";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static files, API routes, and Next.js internals
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
