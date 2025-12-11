import type { Metadata } from "next";
import { generateHowToSchema, safeJsonLd } from "@/lib/seo/json-ld";

const VIBE_CODING_STEPS = [
  {
    name: "Set Up Your Environment",
    text: "Install Claude Code CLI and configure your ANTHROPIC_API_KEY. Run 'npx create-opus67@latest' to add OPUS 67 enhancements for maximum vibe coding capability.",
  },
  {
    name: "Choose Your Development Stack",
    text: "Describe your project to the AI Stack Builder at gicm.app/build. Get personalized recommendations for agents, skills, and tools based on your tech stack.",
  },
  {
    name: "Start Vibe Coding Session",
    text: "Launch Claude Code in your terminal. Describe what you want to build in natural language. The AI handles implementation details while you focus on the vision.",
  },
  {
    name: "Iterate with AI Feedback",
    text: "Review AI-generated code, provide feedback, and refine. Use progressive disclosure - start simple and add complexity as needed. Let the AI handle boilerplate.",
  },
  {
    name: "Deploy and Ship",
    text: "Use gICM deployment agents for automated CI/CD setup, security scanning, and production deployment. Ship faster with AI-powered DevOps assistance.",
  },
];

export const metadata: Metadata = {
  title: "Vibe Coding Guide | Build with AI Flow State | gICM",
  description:
    "Master vibe coding - the art of building software through natural language conversation with AI. Ship 10x faster while staying in flow state.",
  keywords: [
    "vibe coding",
    "AI pair programming",
    "Claude Code",
    "AI development",
    "natural language coding",
    "flow state programming",
  ],
  openGraph: {
    title: "Vibe Coding - The Future of AI-Powered Development",
    description:
      "Learn vibe coding: build software through natural conversation with AI. Ship 10x faster while staying in creative flow.",
    url: "https://gicm.app/guides/vibe-coding",
    images: [
      {
        url: "/api/og?title=Vibe%20Coding%20Guide&kind=skill",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Coding Guide | gICM",
    description: "Master AI-powered development and ship 10x faster",
    images: ["/api/og?title=Vibe%20Coding%20Guide&kind=skill"],
  },
  alternates: {
    canonical: "https://gicm.app/guides/vibe-coding",
  },
};

export default function VibeCodingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            generateHowToSchema(
              "How to Master Vibe Coding",
              "Complete guide to vibe coding - building software through natural language AI conversation. Learn to ship 10x faster while staying in creative flow state.",
              VIBE_CODING_STEPS
            )
          ),
        }}
      />
      {children}
    </>
  );
}
