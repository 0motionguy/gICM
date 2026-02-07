import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "Privacy Policy | ClawdBot",
  description:
    "ClawdBot privacy policy - how we handle your data. We collect minimal data and never sell your information.",
  openGraph: {
    title: "Privacy Policy | ClawdBot",
    description:
      "ClawdBot privacy policy - how we handle your data with transparency and respect.",
    url: "https://clawdbot.com/privacy",
    images: [
      {
        url: "/api/og?title=Privacy%20Policy&kind=tool",
        width: 1200,
        height: 630,
        alt: "ClawdBot Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | ClawdBot",
    description: "ClawdBot privacy policy - how we handle your data",
    images: ["/api/og?title=Privacy%20Policy&kind=tool"],
  },
  alternates: {
    canonical: "https://clawdbot.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <AuroraBackground className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 py-4 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to ClawdBot
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
        <GlassCard className="p-8 md:p-12">
          <h1 className="mb-4 font-display text-4xl font-bold text-white">
            Privacy Policy
          </h1>
          <p className="mb-8 text-sm text-zinc-500">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                1. Introduction
              </h2>
              <p className="leading-relaxed text-zinc-300">
                Welcome to ClawdBot ("we", "our", or "us"). We are committed to
                protecting your personal information and your right to privacy.
                This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you visit our marketplace
                platform.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                2. Information We Collect
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                We collect information that you provide directly to us when
                using ClawdBot:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  <strong className="text-white">Email Address:</strong> When
                  you join our waitlist or sign up for alpha access
                </li>
                <li>
                  <strong className="text-white">Usage Data:</strong>{" "}
                  Information about how you interact with our marketplace,
                  including items viewed, searches performed, and stacks created
                </li>
                <li>
                  <strong className="text-white">Analytics Data:</strong> We
                  collect anonymous analytics data to improve our service,
                  including page views, session duration, and feature usage
                </li>
                <li>
                  <strong className="text-white">Device Information:</strong>{" "}
                  Browser type, operating system, and IP address for security
                  and service improvement
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                3. How We Use Your Information
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                We use the information we collect to:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>Provide, maintain, and improve our marketplace services</li>
                <li>Process waitlist registrations and alpha key requests</li>
                <li>
                  Send you updates about ClawdBot, including new features and
                  marketplace items
                </li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>
                  Detect, prevent, and address technical issues and security
                  threats
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                4. Data Storage and Security
              </h2>
              <p className="leading-relaxed text-zinc-300">
                We implement appropriate technical and organizational security
                measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
                However, no internet transmission is completely secure, and we
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                5. Third-Party Services
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                ClawdBot may integrate with third-party services, including:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  <strong className="text-white">Anthropic Claude AI:</strong>{" "}
                  For AI-powered stack building features
                </li>
                <li>
                  <strong className="text-white">Analytics Providers:</strong>{" "}
                  To understand usage patterns and improve our service
                </li>
                <li>
                  <strong className="text-white">
                    Infrastructure Providers:
                  </strong>{" "}
                  For hosting and deployment (Vercel, AWS)
                </li>
              </ul>
              <p className="mt-3 leading-relaxed text-zinc-300">
                These third parties have their own privacy policies. We are not
                responsible for their privacy practices.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                6. Cookies and Tracking
              </h2>
              <p className="leading-relaxed text-zinc-300">
                We use local storage and cookies to enhance your experience,
                remember your preferences (such as theme settings and stack
                selections), and collect analytics data. You can control cookie
                settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                7. Your Rights
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  <strong className="text-white">Access:</strong> Request access
                  to your personal data
                </li>
                <li>
                  <strong className="text-white">Correction:</strong> Request
                  correction of inaccurate data
                </li>
                <li>
                  <strong className="text-white">Deletion:</strong> Request
                  deletion of your personal data
                </li>
                <li>
                  <strong className="text-white">Opt-out:</strong> Unsubscribe
                  from marketing communications
                </li>
                <li>
                  <strong className="text-white">Data Portability:</strong>{" "}
                  Request a copy of your data in a structured format
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                8. Children's Privacy
              </h2>
              <p className="leading-relaxed text-zinc-300">
                ClawdBot is not intended for children under the age of 13. We do not
                knowingly collect personal information from children under 13.
                If you believe we have collected information from a child under
                13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                9. Changes to This Policy
              </h2>
              <p className="leading-relaxed text-zinc-300">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                10. Contact Us
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                If you have questions about this Privacy Policy or our privacy
                practices, please contact us at:
              </p>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-zinc-300">
                <p>
                  <strong className="text-white">Email:</strong>{" "}
                  privacy@clawdbot.com
                </p>
                <p>
                  <strong className="text-white">GitHub:</strong>{" "}
                  github.com/Kermit457/ClawdBot
                </p>
              </div>
            </section>

            <section className="mt-12 border-t border-white/10 pt-8">
              <h2 className="mb-3 text-2xl font-bold text-white">
                GDPR Compliance (EU Users)
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                If you are located in the European Economic Area (EEA), you have
                certain data protection rights under GDPR. We process your
                personal data based on:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  <strong className="text-white">Consent:</strong> When you sign
                  up for our waitlist or services
                </li>
                <li>
                  <strong className="text-white">Legitimate Interest:</strong>{" "}
                  To improve our services and prevent fraud
                </li>
                <li>
                  <strong className="text-white">Contract Performance:</strong>{" "}
                  To provide services you've requested
                </li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="mb-3 text-2xl font-bold text-white">
                CCPA Compliance (California Users)
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                California residents have additional rights under the California
                Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>Right to know what personal information is collected</li>
                <li>
                  Right to know if personal information is sold or disclosed
                </li>
                <li>
                  Right to opt-out of the sale of personal information (we do
                  not sell personal data)
                </li>
                <li>Right to deletion of personal information</li>
                <li>
                  Right to non-discrimination for exercising your privacy rights
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-wrap gap-4">
              <Link
                href="/"
                className="rounded-lg bg-gradient-to-r from-[#00F0FF] to-[#7000FF] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
              >
                Return to Home
              </Link>
              <Link
                href="/terms"
                className="rounded-lg border border-white/20 px-6 py-3 font-bold text-white transition-colors hover:bg-white/5"
              >
                View Terms of Service
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    </AuroraBackground>
  );
}
