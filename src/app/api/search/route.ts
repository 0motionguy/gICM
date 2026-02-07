import { NextResponse } from "next/server";
import { searchItems } from "@/lib/registry";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const kind = searchParams.get("kind");
  const tag = searchParams.get("tag");

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  let results = searchItems(query);

  // Apply filters
  if (kind) {
    results = results.filter((item) => item.kind === kind);
  }

  if (tag) {
    results = results.filter((item) =>
      item.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  // Add rate limiting headers for agents
  const response = NextResponse.json(results);
  response.headers.set("X-RateLimit-Limit", "1000");
  response.headers.set("X-RateLimit-Remaining", "999");
  response.headers.set("X-RateLimit-Reset", String(Date.now() + 3600000));
  response.headers.set("X-Agent-Discovery", "enabled");

  return response;
}

export const runtime = "nodejs";
