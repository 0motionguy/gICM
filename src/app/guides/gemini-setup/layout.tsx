import type { Metadata } from "next";
import { generateHowToSchema, safeJsonLd } from "@/lib/seo/json-ld";

const GEMINI_SETUP_STEPS = [
  {
    name: "Get Google AI API Key",
    text: "Visit aistudio.google.com and sign in with your Google account. Navigate to 'Get API Key' and create a new API key for your project.",
  },
  {
    name: "Install Gemini CLI",
    text: "Run: npm install -g @google/generative-ai. This installs the official Google Generative AI SDK globally on your system.",
  },
  {
    name: "Configure Environment",
    text: "Set your GOOGLE_API_KEY environment variable. On Mac/Linux: export GOOGLE_API_KEY='your-key'. On Windows: setx GOOGLE_API_KEY 'your-key'",
  },
  {
    name: "Initialize Project",
    text: "Create your project configuration and import the GoogleGenerativeAI class. Initialize with your API key.",
  },
  {
    name: "Install gICM Tools",
    text: "Add gICM skills compatible with Gemini: npx @gicm/cli add skill/typescript-precision-engineer. All 96 skills work cross-platform.",
  },
];

export const metadata: Metadata = {
  title: "How to Setup Gemini AI | Complete Guide | gICM",
  description:
    "Step-by-step guide to install and configure Google Gemini with gICM tools. Start building with Gemini AI in 5 minutes.",
  keywords: [
    "Gemini setup",
    "Google AI",
    "Gemini API",
    "AI development",
    "gICM tools",
    "Gemini installation",
  ],
  openGraph: {
    title: "How to Setup Gemini AI - Complete Installation Guide",
    description:
      "Step-by-step guide to install Gemini AI SDK and configure gICM tools for AI-powered development.",
    url: "https://gicm.app/guides/gemini-setup",
    images: [
      {
        url: "/api/og?title=Gemini%20Setup%20Guide&kind=skill",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gemini AI Setup Guide | gICM",
    description: "Complete guide to installing Gemini AI with gICM tools",
    images: ["/api/og?title=Gemini%20Setup%20Guide&kind=skill"],
  },
  alternates: {
    canonical: "https://gicm.app/guides/gemini-setup",
  },
};

export default function GeminiSetupLayout({
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
              "How to Setup Gemini AI with gICM",
              "Complete step-by-step guide to installing Google Gemini AI SDK, configuring your API key, and adding powerful gICM tools for cross-platform AI development.",
              GEMINI_SETUP_STEPS
            )
          ),
        }}
      />
      {children}
    </>
  );
}
