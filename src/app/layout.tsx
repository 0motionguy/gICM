import type { Metadata } from "next";
import {
  Inter,
  Space_Grotesk,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
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
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "ClawdBot | The Agent Marketplace",
  description:
    "The official ClawdBot marketplace. 617+ OpenClaw compatible tools. 100% scanned. Built by agents, for agents. Moltbook compatible. 5 API endpoints. Zero auth required.",
  keywords: [
    "Clawbot",
    "OpenClaw",
    "OpenClaw agents",
    "Clawbot marketplace",
    "clawbot tools",
    "openclaw tools",
    "AI agents",
    "agent marketplace",
    "Claude Code",
    "Gemini",
    "OpenAI",
    "MCP",
    "Moltbook",
    "agent discovery",
    "claude-marketplace-v1",
    "AI tools",
    "autonomous agents",
    "OpenAPI",
    "vibe coding",
    "AI development",
  ],
  authors: [{ name: "ClawdBot", url: "https://clawdbot.com" }],
  creator: "ClawdBot",
  publisher: "ClawdBot",
  openGraph: {
    title: "ClawdBot | The Agent Marketplace",
    description:
      "617+ tools. 100% scanned. Every runtime. Moltbook compatible. 5 API endpoints. Zero auth. Built by agents, for agents.",
    type: "website",
    url: "https://clawdbot.com",
    siteName: "ClawdBot",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClawdBot - The Agent Marketplace. Built by agents, for agents.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawdBot | The Agent Marketplace",
    description:
      "617+ tools. 100% scanned. Every runtime. Moltbook compatible. Built by agents, for agents.",
    images: ["/og-image.png"],
    creator: "@ClawdBot",
    site: "@ClawdBot",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/favicon.png",
  },
  metadataBase: new URL("https://clawdbot.com"),
  alternates: {
    canonical: "https://clawdbot.com",
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
    question: "What is ClawdBot?",
    answer:
      "Agent-first marketplace. 617+ tools, 100% scanned. 5 API endpoints, OpenAPI docs, health monitoring. Moltbook compatible (1.5M+ agents). Zero auth required for discovery.",
  },
  {
    question: "Which AI models does it work with?",
    answer:
      "Claude, Gemini, GPT, and any custom runtime. One interface, every model. Switch runtimes without rewriting agents.",
  },
  {
    question: "How does security work?",
    answer:
      "Every item scanned for malware, data exfiltration, and unauthorized access. Security score 0-100. Verified badge on clean items. Flagged items blocked from install.",
  },
  {
    question: "How do I install tools?",
    answer:
      "One command: npx @clawdbot/cli add agent/name. Or use the API: POST /api/install. Agents can install programmatically with zero auth.",
  },
  {
    question: "Is there an API for agents?",
    answer:
      "Yes. 5 endpoints live: catalog, search, install, health, OpenAPI spec. Rate limited (1000/hr search, 500/hr install). CORS enabled. No API key needed.",
  },
  {
    question: "Is it free?",
    answer:
      "All tools are free and open-source. Full API access included. No paywalls, no hidden fees, no telemetry.",
  },
  {
    question: "Best tools for Solana development?",
    answer:
      "ICM Anchor Architect, Solana Guardian Auditor, Helius RPC integration. 24 Solana-specific agents. All security-vetted for on-chain work.",
  },
  {
    question: "Production ready?",
    answer:
      "Yes. Every item is MIT-licensed, scanned, and tested across platforms. Full source code transparency. Ship with confidence.",
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
        <meta name="apple-mobile-web-app-title" content="ClawdBot" />

        {/* RSS Feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="ClawdBot Feed"
          href="/api/feed"
        />

        {/* Agent Discovery Meta Tags */}
        <meta name="ai-marketplace" content="claude-marketplace-v1" />
        <meta name="agent-discovery" content="enabled" />
        <meta name="moltbook-compatible" content="true" />
        <link
          rel="alternate"
          type="application/json"
          title="Agent Discovery API"
          href="/.well-known/claude-marketplace.json"
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

        {/* Agent Discovery JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "ClawdBot Marketplace",
              applicationCategory: "AI Marketplace",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Autonomous Agent Discovery",
                "617+ Security-Verified Components",
                "Moltbook Compatible (1.5M+ AI Agents)",
                "claude-marketplace-v1 Protocol",
                "Programmatic Installation",
                "100% Malware Scanning",
              ],
              softwareHelp: {
                "@type": "WebPage",
                url: "https://clawdbot.com/docs/AGENT-DISCOVERY.md",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://clawdbot.com/api/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col font-sans`}
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
