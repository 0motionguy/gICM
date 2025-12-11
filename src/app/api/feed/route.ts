import { NextResponse } from "next/server";
import { REGISTRY } from "@/lib/registry";

// XML escape helper
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  // Sort by lastAudited date (most recent first) and take top 20
  const recentItems = [...REGISTRY]
    .filter((item) => item.audit?.lastAudited)
    .sort((a, b) => {
      const dateA = new Date(a.audit?.lastAudited || "").getTime();
      const dateB = new Date(b.audit?.lastAudited || "").getTime();
      return dateB - dateA;
    })
    .slice(0, 20);

  // Build RSS 2.0 feed with Atom namespace
  const rssItems = recentItems
    .map((item) => {
      const link = `https://gicm.app/items/${item.slug}`;
      const pubDate = item.audit?.lastAudited
        ? new Date(item.audit.lastAudited).toUTCString()
        : new Date().toUTCString();

      return `    <item>
      <title>${escapeXml(item.name)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(item.description)}</description>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <category>${escapeXml(item.kind)}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>gICM - Universal AI Workflow Marketplace</title>
    <link>https://gicm.app</link>
    <description>Latest AI agents, skills, and workflows for Claude, Gemini, and OpenAI</description>
    <atom:link href="https://gicm.app/api/feed" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const runtime = "nodejs";
export const dynamic = "force-static";
