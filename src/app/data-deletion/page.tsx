import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "Data Deletion | gICM",
  description:
    "Request deletion of your personal data from gICM. We respect your right to privacy and make data removal simple.",
  openGraph: {
    title: "Data Deletion | gICM",
    description: "Request deletion of your personal data from gICM.",
    url: "https://gicm.app/data-deletion",
    images: [
      {
        url: "/api/og?title=Data%20Deletion&kind=tool",
        width: 1200,
        height: 630,
        alt: "gICM Data Deletion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Deletion | gICM",
    description: "Request deletion of your personal data from gICM",
    images: ["/api/og?title=Data%20Deletion&kind=tool"],
  },
  alternates: {
    canonical: "https://gicm.app/data-deletion",
  },
};

export default function DataDeletionPage() {
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
            Back to gICM
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
        <GlassCard className="p-8 md:p-12">
          <h1 className="mb-4 font-display text-4xl font-bold text-white">
            Data Deletion Request
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
                1. Your Right to Data Deletion
              </h2>
              <p className="leading-relaxed text-zinc-300">
                In accordance with the General Data Protection Regulation
                (GDPR), the California Consumer Privacy Act (CCPA), and other
                applicable data protection laws, you have the right to request
                the deletion of your personal data. gICM ("we", "our", or "us")
                is committed to honoring this right promptly and transparently.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                2. How to Request Data Deletion
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                To request the deletion of your personal data, please contact us
                using one of the following methods:
              </p>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-zinc-300">
                <p className="mb-2">
                  <strong className="text-white">Email:</strong>{" "}
                  privacy@gicm.app
                </p>
                <p className="mb-2">
                  <strong className="text-white">Subject Line:</strong> "Data
                  Deletion Request"
                </p>
                <p>
                  <strong className="text-white">Include:</strong> Your account
                  email address or other identifying information so we can
                  locate your data.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                3. What Data Will Be Deleted
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                Upon receiving a valid deletion request, we will delete the
                following personal data associated with your account:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  <strong className="text-white">Account Information:</strong>{" "}
                  Email address, name, and profile data
                </li>
                <li>
                  <strong className="text-white">Usage Data:</strong>{" "}
                  Interaction history, search queries, and session data
                </li>
                <li>
                  <strong className="text-white">Analytics Data:</strong>{" "}
                  Browsing patterns and feature usage statistics
                </li>
                <li>
                  <strong className="text-white">Communication Data:</strong>{" "}
                  Messages, support tickets, and feedback submitted through our
                  platform
                </li>
                <li>
                  <strong className="text-white">Third-Party Data:</strong> Any
                  data received from connected social media accounts (Facebook,
                  Instagram, WhatsApp) will be deleted from our systems
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                4. Data We May Retain
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                In certain circumstances, we may be required to retain some data
                even after a deletion request. This includes:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  Data required by law or regulatory obligations (e.g., tax
                  records, fraud prevention)
                </li>
                <li>
                  Anonymized or aggregated data that can no longer identify you
                </li>
                <li>
                  Data necessary to resolve disputes or enforce our agreements
                </li>
              </ul>
              <p className="mt-3 leading-relaxed text-zinc-300">
                Any retained data will be kept only as long as legally required
                and will be securely deleted thereafter.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                5. Processing Timeline
              </h2>
              <p className="leading-relaxed text-zinc-300">
                We will acknowledge your deletion request within{" "}
                <strong className="text-white">48 hours</strong> of receipt.
                Your data will be permanently deleted within{" "}
                <strong className="text-white">30 days</strong> of the request
                being verified. You will receive a confirmation email once the
                deletion is complete.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                6. Deletion of Facebook/Meta Platform Data
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                If you connected your Facebook, Instagram, or WhatsApp account
                to our service, you can also request deletion through Meta:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li>
                  Go to your{" "}
                  <strong className="text-white">
                    Facebook Settings &gt; Apps and Websites
                  </strong>
                </li>
                <li>Find gICM in the list and click "Remove"</li>
                <li>
                  Check the box "Delete all posts, photos and videos on Facebook
                  that gICM may have published on your behalf"
                </li>
                <li>Click "Remove" to confirm</li>
              </ul>
              <p className="mt-3 leading-relaxed text-zinc-300">
                When you remove our app from Meta, we automatically receive a
                deauthorization callback and will delete all data associated
                with your Meta account within 30 days.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                7. Verification
              </h2>
              <p className="leading-relaxed text-zinc-300">
                To protect your privacy and prevent unauthorized deletion, we
                may ask you to verify your identity before processing your
                request. This may include confirming your email address or
                providing additional identifying information.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-bold text-white">
                8. Contact Us
              </h2>
              <p className="mb-3 leading-relaxed text-zinc-300">
                If you have questions about data deletion or our privacy
                practices, please contact us:
              </p>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-zinc-300">
                <p className="mb-1">
                  <strong className="text-white">Email:</strong>{" "}
                  privacy@gicm.app
                </p>
                <p className="mb-1">
                  <strong className="text-white">Website:</strong>{" "}
                  https://gicm.app
                </p>
                <p>
                  <strong className="text-white">Response Time:</strong> Within
                  48 hours
                </p>
              </div>
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
