import type { RegistryItem } from "@/types/registry";

export const CONTENT_AGENTS: RegistryItem[] = [
  {
    id: "content-gemini-seo",
    kind: "agent",
    name: "Gemini SEO Master",
    slug: "gemini-seo",
    description: "SEO content optimizer using Gemini 3.0 Pro's 2M context window.",
    longDescription: "Analyzes top 20 SERP results and generates comprehensive, keyword-optimized articles that outrank competitors. Uses semantic keyword clustering and schema markup generation.",
    category: "Content Pipelines",
    tags: ["Gemini", "SEO", "Content", "Marketing"],
    install: "npx @gicm/cli add agent:gemini-seo",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "gemini-2.0-flash", "gemini-3.0-pro", "gpt-4o"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "content-claude-writer",
    kind: "agent",
    name: "Claude Ghostwriter",
    slug: "claude-writer",
    description: "Long-form content specialist mimicking human tone and nuance.",
    longDescription: "Specialized in writing essays, technical documentation, and thought leadership pieces. Trained to avoid 'AI-isms' and maintain a consistent brand voice across long documents.",
    category: "Content Pipelines",
    tags: ["Claude", "Writing", "Content", "Blog"],
    install: "npx @gicm/cli add agent:claude-writer",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "gemini-2.0-flash", "gemini-3.0-pro", "gpt-4o"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "content-video-script-pro",
    kind: "agent",
    name: "Video Script Pro",
    slug: "video-script-pro",
    description: "YouTube script generator with hook, retention, and CTA optimization.",
    category: "Content Pipelines",
    tags: ["Universal", "Video", "YouTube", "Script"],
    install: "npx @gicm/cli add agent:video-script-pro",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "gemini-2.0-flash", "gemini-3.0-pro", "gpt-4o"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 80,
      status: "VERIFIED",
    },
  },
];
