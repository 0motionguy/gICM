import type { Metadata } from "next";
import { Inter, Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/styles/dashboard-animations.css";
import { StackBuilderWidget } from "@/components/StackBuilderWidget";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { KeyboardShortcuts } from "@/components/ui/keyboard-shortcuts";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "Aether | The Universal AI Workflow Marketplace",
  description: "The cross-chain marketplace for AI agents, skills, and workflows. Compatible with Claude, Gemini, and OpenAI.",
  openGraph: {
    title: "gICM://SEND - The AI Marketplace for Web3 Builders",
    description: "Build your custom AI dev stack with 91 agents, 96 skills, 93 commands, and 82 MCP integrations. Progressive Disclosure saves 88-92% tokens.",
    type: "website",
    url: "https://gicm.io",
    siteName: "gICM",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "gICM Marketplace - 91 Agents, 96 Skills, Progressive Disclosure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "gICM://SEND - The AI Marketplace for Web3 Builders",
    description: "91 agents • 96 skills • 93 commands • 82 MCPs • 88-92% token savings",
    images: ["/og-image.png"],
    creator: "@icm_motion",
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL("https://gicm.io"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cache-busting key to force fresh CSS load
  const cacheKey = Date.now();

  return (
    <html lang="en" suppressHydrationWarning key={cacheKey}>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${plusJakarta.variable} font-sans flex flex-col min-h-screen`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <StackBuilderWidget />
            <KeyboardShortcuts />
            <Toaster position="bottom-right" richColors closeButton />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
