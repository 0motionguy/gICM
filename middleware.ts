import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // opus67.com or www.opus67.com → show /opus67 content
  if (host.includes("opus67.com") && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/opus67";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
