import type { Metadata } from "next";
import { generateFAQSchema, safeJsonLd } from "@/lib/seo/json-ld";

const BUILD_PAGE_FAQS = [
  {
    question: "What is the AI Stack Builder?",
    answer:
      "The AI Stack Builder uses Claude to analyze your project requirements and recommend the perfect combination of agents, skills, and tools from our 617+ item marketplace. It's like having an AI architect design your development stack.",
  },
  {
    question: "How does the stack recommendation work?",
    answer:
      "Describe your project in natural language - mention your tech stack, requirements, and goals. Claude analyzes your description and recommends items based on category compatibility, tag matching, and common usage patterns.",
  },
  {
    question: "How many components are available?",
    answer:
      "ClawdBot offers 617+ components: 108 AI agents, 120 skills, 93 commands, and 95 MCP integrations. All are free, open-source, and work across Claude, Gemini, and OpenAI.",
  },
];

export const metadata: Metadata = {
  title: "AI Stack Builder | ClawdBot - Build Your Perfect AI Dev Stack",
  description:
    "Describe your project and let Claude recommend the perfect combination of AI agents, skills, and tools. Build with 617+ components across Claude, Gemini, and OpenAI.",
  keywords: [
    "AI stack builder",
    "AI development tools",
    "Claude agents",
    "AI workflow builder",
    "MCP servers",
    "AI automation",
    "AI stack recommendation",
    "cross-platform AI",
    "Gemini compatible",
    "OpenAI compatible",
    "AI component library",
    "development workflow",
    "AI architecture",
    "stack configuration",
  ],
  openGraph: {
    title: "AI Stack Builder - Build Your Perfect AI Dev Stack",
    description:
      "Describe your project and get AI-powered recommendations for agents, skills, and tools. 400+ components available.",
    url: "https://clawdbot.com/build",
    images: ["/api/og?title=AI%20Stack%20Builder&kind=tool"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Stack Builder | ClawdBot",
    description:
      "Build your perfect AI dev stack with Claude-powered recommendations",
    images: ["/api/og?title=AI%20Stack%20Builder&kind=tool"],
  },
  alternates: {
    canonical: "https://clawdbot.com/build",
  },
};

export default function BuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(generateFAQSchema(BUILD_PAGE_FAQS)),
        }}
      />
      {children}
    </>
  );
}
