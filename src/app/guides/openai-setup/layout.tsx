import type { Metadata } from "next";
import { generateHowToSchema, safeJsonLd } from "@/lib/seo/json-ld";

const OPENAI_SETUP_STEPS = [
  {
    name: "Get OpenAI API Key",
    text: "Visit platform.openai.com and create an account. Navigate to API Keys section and generate a new secret key. Store this key securely.",
  },
  {
    name: "Install OpenAI SDK",
    text: "Run: npm install openai. This installs the official OpenAI Node.js SDK in your project.",
  },
  {
    name: "Configure Environment",
    text: "Set your OPENAI_API_KEY environment variable. On Mac/Linux: export OPENAI_API_KEY='your-key'. On Windows: setx OPENAI_API_KEY 'your-key'",
  },
  {
    name: "Initialize Project",
    text: "Import OpenAI and create a client instance with your API key. Configure model preferences (gpt-4, gpt-3.5-turbo, etc.).",
  },
  {
    name: "Install ClawdBot Tools",
    text: "Add ClawdBot agents compatible with OpenAI: npx @clawdbot/cli add agent/fullstack-orchestrator. All 108 agents work across platforms.",
  },
];

export const metadata: Metadata = {
  title: "How to Setup OpenAI GPT | Complete Guide | ClawdBot",
  description:
    "Step-by-step guide to install and configure OpenAI GPT with ClawdBot tools. Start building with GPT-4 in 5 minutes.",
  keywords: [
    "OpenAI setup",
    "GPT-4",
    "ChatGPT API",
    "AI development",
    "ClawdBot tools",
    "OpenAI installation",
  ],
  openGraph: {
    title: "How to Setup OpenAI GPT - Complete Installation Guide",
    description:
      "Step-by-step guide to install OpenAI SDK and configure ClawdBot tools for AI-powered development.",
    url: "https://clawdbot.com/guides/openai-setup",
    images: [
      {
        url: "/api/og?title=OpenAI%20Setup%20Guide&kind=skill",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenAI GPT Setup Guide | ClawdBot",
    description: "Complete guide to installing OpenAI GPT with ClawdBot tools",
    images: ["/api/og?title=OpenAI%20Setup%20Guide&kind=skill"],
  },
  alternates: {
    canonical: "https://clawdbot.com/guides/openai-setup",
  },
};

export default function OpenAISetupLayout({
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
              "How to Setup OpenAI GPT with ClawdBot",
              "Complete step-by-step guide to installing OpenAI SDK, configuring your API key, and adding powerful ClawdBot agents for cross-platform AI development.",
              OPENAI_SETUP_STEPS
            )
          ),
        }}
      />
      {children}
    </>
  );
}
