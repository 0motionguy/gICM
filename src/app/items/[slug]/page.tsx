import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Copy,
  Check,
  Terminal,
  Calendar,
  Download,
  Shield,
  Zap,
  Layout,
  Box,
  GitFork,
  ExternalLink,
  Github,
  Cpu,
  Monitor,
  Sparkles,
} from "lucide-react";
import { ClaudeIcon, GeminiIcon, OpenAIIcon } from "@/components/ui/icons";
import { REGISTRY, resolveDependencies, getItemById } from "@/lib/registry";
import type { RegistryItem } from "@/types/registry";
import { QualityScore } from "@/components/molecules/quality-score";
import { InstallCard } from "@/components/molecules/install-card";
import { AgentPromptViewer } from "@/components/molecules/agent-prompt-viewer";
import { readFileSync } from "fs";
import { join } from "path";
import { formatProductName } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { MODEL_VERSIONS } from "@/lib/model-versions";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  safeJsonLd,
} from "@/lib/seo/json-ld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ISR: Revalidate every hour for fresh content while enabling static generation
export const revalidate = 3600;

export async function generateStaticParams() {
  return REGISTRY.map((item) => ({ slug: item.slug }));
}

function getItemBySlug(slug: string) {
  return REGISTRY.find((item) => item.slug === slug);
}

// SEO: Generate dynamic metadata for each item page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item) {
    return { title: "Item Not Found | ClawdBot" };
  }

  const kindLabels: Record<string, string> = {
    agent: "AI Agent",
    skill: "Skill",
    mcp: "MCP Server",
    command: "Command",
  };

  const kindLabel = kindLabels[item.kind] || item.kind;
  const title = `${formatProductName(item.name)} - ${kindLabel} | ClawdBot Marketplace`;
  const description =
    item.description ||
    `${formatProductName(item.name)} is a ${kindLabel} available on ClawdBot, the universal AI workflow marketplace.`;

  return {
    title,
    description,
    keywords: [
      item.name,
      item.kind,
      "AI",
      "Claude",
      "Gemini",
      "OpenAI",
      "workflow",
      "automation",
      ...(item.tags || []),
    ],
    openGraph: {
      title: `${formatProductName(item.name)} - ${kindLabel}`,
      description,
      type: "website",
      url: `https://clawdbot.com/items/${item.slug}`,
      siteName: "ClawdBot",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(item.name)}&kind=${item.kind}`,
          width: 1200,
          height: 630,
          alt: `${item.name} - ${kindLabel}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${formatProductName(item.name)} - ${kindLabel}`,
      description,
      creator: "@icm_motion",
      images: [
        `/api/og?title=${encodeURIComponent(item.name)}&kind=${item.kind}`,
      ],
    },
    alternates: {
      canonical: `https://clawdbot.com/items/${item.slug}`,
    },
  };
}

function readPromptFile(filePath: string): string | null {
  try {
    const fullPath = join(process.cwd(), filePath);
    return readFileSync(fullPath, "utf-8");
  } catch (error) {
    return null;
  }
}

const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

export default async function ItemDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const promptContent = item.files?.[0] ? readPromptFile(item.files[0]) : null;
  const relatedItems = REGISTRY.filter(
    (i) => i.category === item.category && i.id !== item.id
  ).slice(0, 3);
  const dependencies = (item.dependencies || [])
    .map((depId) => getItemById(depId))
    .filter(Boolean);

  // Calculate used-by items (items that depend on this one)
  const usedByItems = REGISTRY.filter(
    (i) => i.dependencies?.includes(item.id) && i.id !== item.id
  ).slice(0, 6);

  // Generate breadcrumbs based on item category
  const categoryLabels: Record<string, string> = {
    agent: "Agents",
    skill: "Skills",
    mcp: "MCPs",
    command: "Commands",
  };

  const breadcrumbs = [
    { name: "ClawdBot", url: "https://clawdbot.com" },
    {
      name: categoryLabels[item.kind] || item.kind,
      url: `https://clawdbot.com/?kind=${item.kind}`,
    },
    { name: item.name, url: `https://clawdbot.com/items/${item.slug}` },
  ];

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(generateProductSchema(item)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />
      <AuroraBackground className="min-h-screen bg-[#0A0A0B] font-sans text-white">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-4 md:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to ClawdBot Catalog
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 mx-auto max-w-6xl space-y-8 px-6 py-12 md:px-8">
          {/* Hero Section */}
          <GlassCard className="p-8 md:p-10">
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
              <div className="flex flex-1 gap-6">
                <div className="grid h-24 w-24 flex-shrink-0 place-items-center rounded-3xl border border-white/10 bg-gradient-to-br from-[#00F0FF]/20 to-[#7000FF]/20 shadow-[0_0_30px_-10px_rgba(0,240,255,0.3)]">
                  <span className="font-display text-5xl font-bold text-white">
                    {item.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                      {formatProductName(item.name)}
                    </h1>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-300">
                      {item.kind}
                    </span>
                  </div>
                  <p className="text-base font-medium text-zinc-400">
                    {item.category}
                  </p>
                  <p className="max-w-3xl text-lg leading-relaxed text-zinc-300">
                    {item.longDescription || item.description}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <QualityScore item={item} size="lg" />
              </div>
            </div>

            {/* Universal Compatibility Section (BIG VISUALS) */}
            <div className="mt-8 border-t border-white/10 pt-8">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                <Zap size={16} className="text-[#00F0FF]" /> Universal
                Compatibility
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Claude Card */}
                <div className="flex items-center gap-4 rounded-xl border border-[#D97757]/20 bg-[#D97757]/10 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D97757]/20">
                    <ClaudeIcon className="h-6 w-6 text-[#D97757]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#D97757]">
                      {MODEL_VERSIONS.claude.name}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {MODEL_VERSIONS.claude.models}
                    </div>
                  </div>
                </div>

                {/* Gemini Card */}
                <div className="flex items-center gap-4 rounded-xl border border-[#4E82EE]/20 bg-[#4E82EE]/10 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4E82EE]/20">
                    <GeminiIcon className="h-6 w-6 text-[#4E82EE]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#4E82EE]">
                      {MODEL_VERSIONS.gemini.name}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {MODEL_VERSIONS.gemini.models}
                    </div>
                  </div>
                </div>

                {/* OpenAI Card */}
                <div className="flex items-center gap-4 rounded-xl border border-[#10A37F]/20 bg-[#10A37F]/10 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#10A37F]/20">
                    <OpenAIIcon className="h-6 w-6 text-[#10A37F]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#10A37F]">
                      {MODEL_VERSIONS.openai.name}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {MODEL_VERSIONS.openai.models}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/5 pt-8 md:grid-cols-4">
              <div>
                <div className="font-display text-3xl font-bold text-white">
                  {formatNumber(item.installs || 0)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                  <Download size={12} /> Installs
                </div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-white">
                  {formatNumber(item.remixes || 0)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                  <GitFork size={12} /> Remixes
                </div>
              </div>
              {item.tokenSavings && (
                <div>
                  <div className="font-display text-3xl font-bold text-[#00F0FF]">
                    {item.tokenSavings}%
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Token Savings
                  </div>
                </div>
              )}
              <div>
                <div className="font-display text-3xl font-bold text-white">
                  {(item.dependencies || []).length}
                </div>
                <div className="mt-1 text-xs text-zinc-500">Dependencies</div>
              </div>
            </div>
          </GlassCard>

          {/* Installation Card */}
          <InstallCard item={item} />

          {/* Full Agent Prompt */}
          {promptContent && (
            <AgentPromptViewer
              content={promptContent}
              fileName={item.files?.[0]}
            />
          )}

          {/* Dependencies Section */}
          {dependencies.length > 0 && (
            <GlassCard className="space-y-6">
              <h3 className="text-lg font-bold text-white">
                Required Dependencies
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dependencies.map((dep) => (
                  <Link
                    href={`/items/${dep.slug}`}
                    key={dep.id}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-[#00F0FF]/30 hover:bg-white/10 hover:shadow-[0_0_20px_-5px_rgba(0,240,255,0.3)]"
                  >
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white">
                      {dep.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-white">
                        {formatProductName(dep.name)}
                      </div>
                      <div className="truncate text-xs text-zinc-400">
                        {dep.kind}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Used By Section */}
          {usedByItems.length > 0 && (
            <GlassCard className="space-y-6">
              <h3 className="text-lg font-bold text-white">Used By</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {usedByItems.map((relItem) => (
                  <Link
                    href={`/items/${relItem.slug}`}
                    key={relItem.id}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-[#00F0FF]/30 hover:bg-white/10 hover:shadow-[0_0_20px_-5px_rgba(0,240,255,0.3)]"
                  >
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white">
                      {relItem.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-white">
                        {formatProductName(relItem.name)}
                      </div>
                      <div className="truncate text-xs text-zinc-400">
                        {relItem.kind}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Related & Dependencies */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Metadata */}
            <GlassCard className="h-fit space-y-4" compact>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Related */}
            <div className="space-y-4">
              {relatedItems.length > 0 && (
                <>
                  <h3 className="font-display text-lg font-bold text-white">
                    Related Items
                  </h3>
                  <div className="grid gap-4">
                    {relatedItems.map((related) => (
                      <Link key={related.id} href={`/items/${related.slug}`}>
                        <GlassCard
                          compact
                          hoverEffect
                          className="flex items-center gap-4 p-4"
                        >
                          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white">
                            {related.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-white">
                              {formatProductName(related.name)}
                            </div>
                            <div className="truncate text-xs text-zinc-500">
                              {related.description}
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </AuroraBackground>
    </>
  );
}
