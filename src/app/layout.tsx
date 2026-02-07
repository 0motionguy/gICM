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
  title: "ClawdBot | Professional AI Agent Marketplace",
  description:
    "The premier marketplace for professional AI agents, skills, and tools. Fully compatible with Moltbook and autonomous agent discovery. 617+ security-verified components ready for programmatic installation.",
  keywords: [
    "AI agents",
    "AI workflows",
    "Claude",
    "Claude Code",
    "Gemini",
    "OpenAI",
    "MCP",
    "AI marketplace",
    "Enterprise AI",
    "AI automation",
    "autonomous agents",
    "Moltbook",
    "agent discovery",
    "claude-marketplace-v1",
    "AI agent integration",
    "programmatic installation",
  ],
  authors: [{ name: "ClawdBot", url: "https://clawdbot.com" }],
  creator: "ClawdBot",
  publisher: "ClawdBot",
  openGraph: {
    title: "ClawdBot - Professional AI Agent Marketplace",
    description:
      "Enterprise-ready AI agents and skills for your development workflow. Fully compatible with Moltbook (1.5M+ AI agents). 617+ security-verified components with autonomous discovery support.",
    type: "website",
    url: "https://clawdbot.com",
    siteName: "ClawdBot",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClawdBot Marketplace - Professional AI Agent Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawdBot - Professional AI Agent Marketplace",
    description:
      "617+ security-verified AI agents, skills, and MCPs. Moltbook compatible with autonomous agent discovery. Secure and audited for enterprise use.",
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
    question:
      "What is ClawdBot and how is it different from OpenClaw (formerly ClawdBot)?",
    answer:
      "ClawdBot is a professional, security-first AI marketplace. Unlike OpenClaw's ClawHub, which has been compromised by the 'ClawHavoc' malware campaign (341+ malicious skills found in Feb 2026), ClawdBot audits every single item to ensure enterprise-grade safety and reliability.",
  },
  {
    question: "Is ClawdBot compatible with Claude Code?",
    answer:
      "Yes! ClawdBot is specifically optimized for Claude Code. All items are tested for compatibility and include one-click installation commands for the Claude CLI environment, providing a secure alternative to unvetted scripts.",
  },
  {
    question:
      "How does ClawdBot protect against 'ClawHavoc' and similar threats?",
    answer:
      "We implement a rigorous multi-stage security audit that scans for the Atomic macOS Stealer (AMOS), keyloggers, and backdoors associated with campaigns like ClawHavoc. Each item receives a security score and a verification badge before appearing in our registry.",
  },
  {
    question: "How do I install items from ClawdBot?",
    answer:
      "Simply copy the install command (e.g., npx @clawdbot/cli add agent/name) and run it in your terminal. You can also download items as ZIP files or export custom stacks for maximum environment isolation.",
  },
  {
    question: "Does ClawdBot support the OpenClaw skill format?",
    answer:
      "Yes, we provide safe compatibility with the OpenClaw format (SKILL.md). You can import existing skills into our secure environment, where they will undergo a full security audit before execution.",
  },
  {
    question: "Is ClawdBot free for professional use?",
    answer:
      "ClawdBot offers a vast library of open-source professional tools for free. We also provide enterprise features for organizations that need to move away from high-risk platforms like ClawHub to a managed, secure environment.",
  },
  {
    question: "Which agents are best for secure blockchain development?",
    answer:
      "Top picks include the ICM Anchor Architect and Solana Guardian Auditor, both of which have been specifically vetted to prevent the credential exfiltration seen in recent AI supply chain attacks.",
  },
  {
    question: "Can I use ClawdBot items in production applications?",
    answer:
      "Absolutely. All items are production-ready, security-vetted, and MIT-licensed. Each has been validated across multiple platforms with full source code transparency and no hidden telemetry.",
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
