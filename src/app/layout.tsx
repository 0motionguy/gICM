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
