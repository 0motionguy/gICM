import type { RegistryItem } from "@/types/registry";

export const DESIGN_ASSETS: RegistryItem[] = [
  {
    id: "design-glass-card",
    kind: "component",
    name: "Glass Card",
    slug: "glass-card",
    description: "Premium frosted glass effect card with inner glow and hover state.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Card", "Glassmorphism"],
    install: "npx @gicm/cli add component/glass-card",
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
  {
    id: "design-aurora-bg",
    kind: "component",
    name: "Aurora Background",
    slug: "aurora-background",
    description: "Animated ambient background with flowing gradient mesh.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Background", "Animation"],
    install: "npx @gicm/cli add component/aurora-background",
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
  {
    id: "design-neon-button",
    kind: "component",
    name: "Neon Button",
    slug: "neon-button",
    description: "High-visibility action button with neon glow and pulse effect.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Button", "Neon"],
    install: "npx @gicm/cli add component/neon-button",
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
  {
    id: "design-animated-grid",
    kind: "component",
    name: "Animated Grid",
    slug: "animated-grid",
    description: "Cyberpunk-style perspective grid background with infinite scrolling animation.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Background", "Animation", "3D"],
    install: "npx @gicm/cli add component/animated-grid",
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
