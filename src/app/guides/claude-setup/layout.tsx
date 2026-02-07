import type { Metadata } from "next";
import {
  generateHowToSchema,
  generateArticleSchema,
  safeJsonLd,
} from "@/lib/seo/json-ld";

const CLAUDE_SETUP_STEPS = [
  {
    name: "Get Anthropic API Key",
    text: "Visit console.anthropic.com and create an account. Navigate to API Keys and generate a new key. Copy this key - you'll need it for configuration.",
  },
  {
    name: "Install Claude Code CLI",
    text: "Run: npm install -g @anthropic-ai/claude-code. This installs the official Claude Code command-line interface globally on your system.",
  },
  {
    name: "Configure Environment",
    text: "Set your ANTHROPIC_API_KEY environment variable. On Mac/Linux: export ANTHROPIC_API_KEY='your-key'. On Windows: setx ANTHROPIC_API_KEY 'your-key'",
  },
  {
    name: "Initialize Project",
    text: "Run the 'claude' command in your project directory. This creates the .claude/ folder structure and configuration files.",
  },
  {
    name: "Install ClawdBot Agents",
    text: "Use @clawdbot/cli to add agents: npx @clawdbot/cli add agent/context-sculptor. Browse clawdbot.com to discover 100+ agents for your workflow.",
  },
];

export const metadata: Metadata = {
  title: "How to Setup Claude Code | Complete Guide | ClawdBot",
  description:
    "Step-by-step guide to install and configure Claude Code CLI with ClawdBot agents. Get started with AI-powered development in 5 minutes.",
  keywords: [
    "Claude Code setup",
    "Claude CLI",
    "Anthropic API",
    "AI development",
    "ClawdBot agents",
    "Claude installation",
  ],
  openGraph: {
    title: "How to Setup Claude Code - Complete Installation Guide",
    description:
      "Step-by-step guide to install Claude Code CLI and configure ClawdBot agents for AI-powered development.",
    url: "https://clawdbot.com/guides/claude-setup",
    images: [
      {
        url: "/api/og?title=Claude%20Setup%20Guide&kind=skill",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Code Setup Guide | ClawdBot",
    description:
      "Complete guide to installing Claude Code CLI with ClawdBot agents",
    images: ["/api/og?title=Claude%20Setup%20Guide&kind=skill"],
  },
  alternates: {
    canonical: "https://clawdbot.com/guides/claude-setup",
  },
};

export default function ClaudeSetupLayout({
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
              "How to Setup Claude Code with ClawdBot",
              "Complete step-by-step guide to installing Claude Code CLI, configuring your API key, and adding powerful ClawdBot agents to supercharge your AI development workflow.",
              CLAUDE_SETUP_STEPS
            )
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            generateArticleSchema(
              "How to Setup Claude Code | Complete Guide | ClawdBot",
              "Step-by-step guide to install and configure Claude Code CLI with ClawdBot agents. Get started with AI-powered development in 5 minutes.",
              "https://clawdbot.com/guides/claude-setup",
              "2024-01-01",
              "2024-12-11"
            )
          ),
        }}
      />
      {children}
    </>
  );
}
