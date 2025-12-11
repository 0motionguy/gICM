import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // opus67.com -> show /opus67 page
  if (hostname.includes("opus67.com")) {
    const url = request.nextUrl.clone();

    // Only redirect root path, let other paths through
    if (url.pathname === "/") {
      url.pathname = "/opus67";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
