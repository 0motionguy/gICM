import type { Metadata } from "next";
import {
  generateOpus67ProductSchema,
  generateFAQSchema,
  generateHowToSchema,
  safeJsonLd,
} from "@/lib/seo/json-ld";

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

const OPUS67_FAQS = [
  {
    question: "What is OPUS 67?",
    answer:
      "OPUS 67 is a self-evolving AI runtime that makes Claude 10x smarter with 141 skills, 83 MCP connections, 30 modes, and 107 agents. It's the most comprehensive AI enhancement system available.",
  },
  {
    question: "How do I install OPUS 67?",
    answer:
      "Run: npx create-opus67@latest - One command installs everything with auto-updates. No complex setup required.",
  },
  {
    question: "What platforms does OPUS 67 support?",
    answer:
      "OPUS 67 works on Windows, macOS, and Linux with any terminal that supports Node.js 18+. It integrates with VS Code, terminal-based workflows, and IDE extensions.",
  },
  {
    question: "How much better is OPUS 67 than vanilla Claude?",
    answer:
      "OPUS 67 achieves 4-6x faster task completion, 88-92% token savings through progressive skills, and adds 141 specialist skills Claude doesn't have by default.",
  },
];

const OPUS67_HOWTO_STEPS = [
  {
    name: "Open Terminal",
    text: "Open your terminal application - Command Prompt, PowerShell, Terminal.app, or any terminal emulator on Linux.",
  },
  {
    name: "Run Install Command",
    text: "Execute: npx create-opus67@latest - This downloads and runs the OPUS 67 installer automatically.",
  },
  {
    name: "Follow Setup Wizard",
    text: "Answer the prompts for installation type (full, minimal, custom) and any preferences for skill categories.",
  },
  {
    name: "Start Using OPUS 67",
    text: "Run the 'claude' command in any project. OPUS 67 auto-detects context and loads relevant skills automatically.",
  },
];

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
      {/* OPUS 67 FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(generateFAQSchema(OPUS67_FAQS)),
        }}
      />
      {/* OPUS 67 HowTo JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            generateHowToSchema(
              "How to Install OPUS 67",
              "Quick installation guide for OPUS 67 - the self-evolving AI runtime with 141 skills",
              OPUS67_HOWTO_STEPS
            )
          ),
        }}
      />
      {children}
    </>
  );
}
