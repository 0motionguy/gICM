import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | gICM",
  description:
    "gICM terms of service - guidelines for using our free, open-source AI marketplace.",
  openGraph: {
    title: "Terms of Service | gICM",
    description:
      "Terms and conditions for using gICM - the universal AI workflow marketplace.",
    url: "https://gicm.app/terms",
    images: [
      {
        url: "/api/og?title=Terms%20of%20Service&kind=tool",
        width: 1200,
        height: 630,
        alt: "gICM Terms of Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | gICM",
    description: "Terms and conditions for using gICM",
    images: ["/api/og?title=Terms%20of%20Service&kind=tool"],
  },
  alternates: {
    canonical: "https://gicm.app/terms",
  },
};

export default function TermsPage() {
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
            Back to Aether Catalog
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
        <GlassCard className="p-8 md:p-12">
          <h1 className="mb-4 font-display text-4xl font-bold text-white">
            Terms of Service
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
                1. Agreement to Terms
              </h2>
              <p className="leading-relaxed text-zinc-300">
                By accessing or using Aether ("Service", "Platform"), you agree
                to be bound by these Terms of Service ("Terms"). If you disagree
                with any part of these terms, you do not have permission to
                access the Service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                2. Description of Service
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                Aether is a marketplace platform that provides:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  A curated catalog of Claude AI agents, skills, commands, MCP
                  servers, and settings
                </li>
                <li>AI-powered stack building recommendations</li>
                <li>
                  Tools for discovering, comparing, and organizing development
                  resources
                </li>
                <li>Community-driven ratings and reviews</li>
              </ul>
              <p className="mt-3 leading-relaxed text-zinc-300">
                The Service is currently in beta/alpha testing phase. Features
                and availability may change without notice.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                3. User Accounts and Waitlist
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                To access certain features, you may need to join our waitlist or
                request alpha access:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>You must provide accurate and complete information</li>
                <li>
                  You are responsible for maintaining the security of your
                  account
                </li>
                <li>You must be at least 13 years old to use the Service</li>
                <li>
                  One account per person; no automated or bot registrations
                </li>
                <li>
                  We reserve the right to refuse service or terminate accounts
                  at our discretion
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                4. Acceptable Use
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                You agree NOT to:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  Use the Service for any illegal purpose or to violate any laws
                </li>
                <li>
                  Attempt to gain unauthorized access to our systems or other
                  users' accounts
                </li>
                <li>Upload malware, viruses, or malicious code</li>
                <li>
                  Scrape, crawl, or automatically extract data from the Service
                </li>
                <li>Impersonate others or provide false information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                5. Content and Intellectual Property
              </h2>
              <div className="space-y-3 text-zinc-300">
                <div>
                  <h3 className="mb-2 font-bold text-white">5.1 Our Content</h3>
                  <p className="leading-relaxed">
                    The Service and its original content (excluding
                    user-generated content and third-party items), features, and
                    functionality are owned by Aether and are protected by
                    international copyright, trademark, and other intellectual
                    property laws.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-bold text-white">
                    5.2 Registry Items
                  </h3>
                  <p className="leading-relaxed">
                    Items in the Aether marketplace (agents, skills, commands,
                    etc.) are provided by third parties and are subject to their
                    own licenses. We do not claim ownership of these items. Each
                    item's license terms are specified in its individual
                    listing.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-bold text-white">
                    5.3 User-Generated Content
                  </h3>
                  <p className="leading-relaxed">
                    By sharing stacks, reviews, or other content on Aether, you
                    grant us a worldwide, non-exclusive, royalty-free license to
                    use, reproduce, and distribute that content in connection
                    with the Service.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                6. AI Features and Recommendations
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                Our AI-powered features (stack builder, recommendations) are
                provided "as is":
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  AI recommendations are suggestions only and may not be
                  suitable for all use cases
                </li>
                <li>
                  We do not guarantee the accuracy, completeness, or reliability
                  of AI-generated content
                </li>
                <li>
                  You are responsible for evaluating AI recommendations before
                  implementation
                </li>
                <li>
                  AI features require an Anthropic API key and are subject to
                  Anthropic's terms of service
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                7. Third-Party Links and Services
              </h2>
              <p className="leading-relaxed text-zinc-300">
                The Service may contain links to third-party websites,
                repositories (GitHub), or services. We are not responsible for
                the content, privacy policies, or practices of third-party
                sites. Your use of third-party services is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                8. Disclaimers and Limitations
              </h2>
              <div className="space-y-3 text-zinc-300">
                <div>
                  <h3 className="mb-2 font-bold text-white">
                    8.1 Service Availability
                  </h3>
                  <p className="leading-relaxed">
                    The Service is provided "AS IS" and "AS AVAILABLE" without
                    warranties of any kind. We do not guarantee uninterrupted or
                    error-free service. The platform is in beta and may contain
                    bugs or limitations.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-bold text-white">8.2 No Warranty</h3>
                  <p className="leading-relaxed">
                    We make no warranties about the accuracy, reliability, or
                    suitability of any marketplace items. Each item is provided
                    by third parties and is used at your own risk.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-bold text-white">
                    8.3 Limitation of Liability
                  </h3>
                  <p className="leading-relaxed">
                    To the maximum extent permitted by law, Aether shall not be
                    liable for any indirect, incidental, special, consequential,
                    or punitive damages resulting from your use of the Service,
                    including loss of data, revenue, or profits.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                9. Alpha/Beta Testing
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                If you are granted alpha or beta access:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  Features are experimental and may be unstable or incomplete
                </li>
                <li>Your feedback helps improve the Service</li>
                <li>Access may be revoked at any time</li>
                <li>Data may be reset during testing phases</li>
                <li>
                  You agree to report bugs and security issues responsibly
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                10. Pricing and Payments
              </h2>
              <p className="leading-relaxed text-zinc-300">
                Currently, Aether is free to use during alpha/beta. Future
                pricing will be communicated clearly before any charges are
                implemented. If we introduce paid features, you will have the
                option to opt-in before being charged.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                11. Termination
              </h2>
              <p className="leading-relaxed text-zinc-300">
                We reserve the right to terminate or suspend your access to the
                Service immediately, without prior notice, for any reason,
                including breach of these Terms. Upon termination, your right to
                use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                12. Changes to Terms
              </h2>
              <p className="leading-relaxed text-zinc-300">
                We reserve the right to modify these Terms at any time. We will
                notify users of material changes by updating the "Last updated"
                date. Your continued use of the Service after changes
                constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                13. Governing Law
              </h2>
              <p className="leading-relaxed text-zinc-300">
                These Terms shall be governed by and construed in accordance
                with applicable international laws. Any disputes shall be
                resolved through binding arbitration or in courts of competent
                jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                14. Contact Information
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                For questions about these Terms, please contact us:
              </p>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-zinc-300">
                <p>
                  <strong className="text-white">Email:</strong>{" "}
                  legal@aether.dev
                </p>
                <p>
                  <strong className="text-white">GitHub:</strong>{" "}
                  github.com/Kermit457/gICM
                </p>
              </div>
            </section>

            <section className="mt-12 border-t border-white/10 pt-8">
              <h2 className="mb-3 text-2xl font-bold text-white">
                15. Severability
              </h2>
              <p className="leading-relaxed text-zinc-300">
                If any provision of these Terms is found to be unenforceable or
                invalid, that provision will be limited or eliminated to the
                minimum extent necessary, and the remaining provisions will
                remain in full force and effect.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-3 text-2xl font-bold text-white">
                16. Entire Agreement
              </h2>
              <p className="leading-relaxed text-zinc-300">
                These Terms, together with our Privacy Policy, constitute the
                entire agreement between you and Aether regarding the Service
                and supersede all prior agreements and understandings.
              </p>
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
                href="/privacy"
                className="rounded-lg border border-white/20 px-6 py-3 font-bold text-white transition-colors hover:bg-white/5"
              >
                View Privacy Policy
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    </AuroraBackground>
  );
}
