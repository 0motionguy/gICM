import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // opus67.com or www.opus67.com → show /opus67 content
  if (
    (host === "opus67.com" || host === "www.opus67.com") &&
    pathname === "/"
  ) {
    return NextResponse.rewrite(new URL("/opus67", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
