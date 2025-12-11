import type { Metadata } from "next";
import { Inter, Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import "@/styles/dashboard-animations.css";
import { StackBuilderWidget } from "@/components/StackBuilderWidget";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateFAQSchema,
  safeJsonLd,
} from "@/lib/seo/json-ld";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  preload: true,
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "gICM | The Universal AI Workflow Marketplace",
  description:
    "The cross-chain marketplace for AI agents, skills, and workflows. Compatible with Claude, Gemini, and OpenAI.",
  keywords: [
    "AI agents",
    "AI workflows",
    "Claude",
    "Gemini",
    "OpenAI",
    "MCP",
    "AI marketplace",
    "OPUS 67",
    "AI automation",
  ],
  authors: [{ name: "gICM", url: "https://gicm.app" }],
  creator: "gICM",
  publisher: "gICM",
  openGraph: {
    title: "gICM - The Universal AI Workflow Marketplace",
    description:
      "Build your custom AI dev stack with 91 agents, 96 skills, 93 commands, and 82 MCP integrations. Compatible with Claude, Gemini, and OpenAI.",
    type: "website",
    url: "https://gicm.app",
    siteName: "gICM",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "gICM Marketplace - Universal AI Workflow Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "gICM - The Universal AI Workflow Marketplace",
    description:
      "91 agents • 96 skills • 93 commands • 82 MCPs - Build your AI dev stack",
    images: ["/og-image.png"],
    creator: "@icm_motion",
    site: "@icm_motion",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/favicon.png",
  },
  metadataBase: new URL("https://gicm.app"),
  alternates: {
    canonical: "https://gicm.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

const HOMEPAGE_FAQS = [
  {
    question:
      "What is gICM and how is it different from other AI marketplaces?",
    answer:
      "gICM is the world's first universal cross-platform AI marketplace. Unlike competitors locked to a single ecosystem, gICM lets you install any AI agent, skill, or tool for Claude, Gemini, or OpenAI with a single click. We offer 593+ production-ready items including agents, skills, commands, and MCP integrations.",
  },
  {
    question: "Can I use gICM tools on Claude, Gemini, and OpenAI?",
    answer:
      "Yes! gICM is the only marketplace with true cross-platform compatibility. All agents and skills work universally across Claude, Gemini, and OpenAI through our Universal Bridge technology.",
  },
  {
    question: "What is OPUS 67 and how does it enhance Claude?",
    answer:
      "OPUS 67 is our self-evolving AI runtime with 141 specialist skills, 83 MCP integrations, 30 optimized modes, and 107 agents. It achieves 88-92% token savings. Install with: npx create-opus67@latest",
  },
  {
    question: "How do I install items from gICM?",
    answer:
      "Three ways: (1) CLI: npx @gicm/cli add agent/name, (2) Web UI: browse gicm.app and download ZIP, (3) Direct clone from our gICM-library repository.",
  },
  {
    question: "What are Progressive Skills and how do they save tokens?",
    answer:
      "Progressive Skills load in 30-50 tokens initially, then expand on-demand to 3000-5000 tokens. This achieves 88-92% token savings compared to loading everything upfront.",
  },
  {
    question: "Which gICM agents are best for Solana development?",
    answer:
      "Top picks: ICM Anchor Architect (4.2x faster), Solana Guardian Auditor (security), Frontend Fusion Engine (Next.js + Web3), Gas Optimization Specialist, and DeFi Integration Architect.",
  },
  {
    question: "What payment is required to use gICM?",
    answer:
      "All gICM tools are completely free. Our entire marketplace—593+ items—is open-source with no subscription fees, hidden charges, or licensing restrictions.",
  },
  {
    question: "Can I use gICM items in production applications?",
    answer:
      "Absolutely. All items are production-ready and MIT-licensed. Each has been validated across Claude, Gemini, and OpenAI platforms with full source code transparency.",
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect hints for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* External API preconnects for faster loading */}
        <link rel="preconnect" href="https://api.github.com" />
        <link rel="preconnect" href="https://registry.npmjs.org" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://api.github.com" />
        <link rel="dns-prefetch" href="https://registry.npmjs.org" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="gICM" />

        {/* RSS Feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="gICM Feed"
          href="/api/feed"
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(generateWebsiteSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(generateFAQSchema(HOMEPAGE_FAQS)),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${plusJakarta.variable} flex min-h-screen flex-col font-sans`}
      >
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex-1">{children}</main>
            <Footer />
            <StackBuilderWidget />
            <Toaster position="bottom-right" richColors closeButton />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
      {/* Google Analytics 4 - Add your measurement ID to env */}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
