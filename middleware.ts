import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // opus67.com -> show /opus67 page content (rewrite, not redirect)
  if (hostname.includes("opus67.com")) {
    if (request.nextUrl.pathname === "/") {
      return NextResponse.rewrite(new URL("/opus67", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
