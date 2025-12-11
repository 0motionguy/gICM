import type { Metadata } from "next";
import { generateOpus67ProductSchema, safeJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "OPUS 67 - Self-Evolving AI Runtime | 141 Skills, 83 MCPs, 30 Modes",
  description:
    "OPUS 67 makes Claude 10x smarter with 141 skills, 83 MCP connections, 30 modes, and 108 agents. One command installation. Auto-updates included.",
  keywords: [
    "OPUS 67",
    "Claude",
    "AI",
    "MCP",
    "skills",
    "agents",
    "workflow automation",
    "Claude Code",
    "AI runtime",
    "self-evolving",
  ],
  openGraph: {
    title: "OPUS 67 - Self-Evolving AI Runtime",
    description:
      "141 Skills | 83 MCPs | 30 Modes | 108 Agents - Make Claude 10x smarter with one command",
    url: "https://opus67.com",
    siteName: "OPUS 67",
    type: "website",
    images: [
      {
        url: "/api/og?title=OPUS%2067&kind=agent",
        width: 1200,
        height: 630,
        alt: "OPUS 67 - Self-Evolving AI Runtime",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OPUS 67 - Self-Evolving AI Runtime",
    description: "141 Skills | 83 MCPs | 30 Modes | 108 Agents",
    creator: "@icm_motion",
    images: ["/api/og?title=OPUS%2067&kind=agent"],
  },
  alternates: {
    canonical: "https://opus67.com",
  },
};

export default function Opus67Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* OPUS 67 Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(generateOpus67ProductSchema()),
        }}
      />
      {children}
    </>
  );
}
