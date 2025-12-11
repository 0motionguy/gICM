import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // opus67.com or www.opus67.com -> rewrite to /opus67
  if (host.includes("opus67.com") && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/opus67", request.url));
  }

  return NextResponse.next();
}

// Only run on root path
export const config = {
  matcher: "/",
};
