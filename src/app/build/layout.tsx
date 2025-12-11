import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Stack Builder | gICM - Build Your Perfect AI Dev Stack",
  description:
    "Describe your project and let Claude recommend the perfect combination of AI agents, skills, and tools. Build with 400+ components across Claude, Gemini, and OpenAI.",
  keywords: [
    "AI stack builder",
    "AI development tools",
    "Claude agents",
    "AI workflow builder",
    "MCP servers",
    "AI automation",
  ],
  openGraph: {
    title: "AI Stack Builder - Build Your Perfect AI Dev Stack",
    description:
      "Describe your project and get AI-powered recommendations for agents, skills, and tools. 400+ components available.",
    url: "https://gicm.app/build",
    images: ["/api/og?title=AI%20Stack%20Builder&kind=tool"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Stack Builder | gICM",
    description:
      "Build your perfect AI dev stack with Claude-powered recommendations",
    images: ["/api/og?title=AI%20Stack%20Builder&kind=tool"],
  },
  alternates: {
    canonical: "https://gicm.app/build",
  },
};

export default function BuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
