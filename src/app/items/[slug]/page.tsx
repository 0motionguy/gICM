import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Terminal, Calendar, Download, Shield, Zap, Layout, Box, GitFork, ExternalLink, Github, Cpu, Monitor, Sparkles } from "lucide-react";
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return REGISTRY.map((item) => ({ slug: item.slug }));
}

function getItemBySlug(slug: string) {
  return REGISTRY.find((item) => item.slug === slug);
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
  const relatedItems = REGISTRY.filter((i) => i.category === item.category && i.id !== item.id).slice(0, 3);
  const dependencies = (item.dependencies || []).map((depId) => getItemById(depId)).filter(Boolean);

  return (
    <AuroraBackground className="min-h-screen bg-[#0A0A0B] text-white font-sans">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Aether Catalog
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 space-y-8">
        {/* Hero Section */}
        <GlassCard className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="flex gap-6 flex-1">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-[#00F0FF]/20 to-[#7000FF]/20 border border-white/10 grid place-items-center flex-shrink-0 shadow-[0_0_30px_-10px_rgba(0,240,255,0.3)]">
                <span className="font-display font-bold text-5xl text-white">
                  {item.name.charAt(0)}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                    {formatProductName(item.name)}
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium uppercase tracking-wider">
                    {item.kind}
                  </span>
                </div>
                <p className="text-base text-zinc-400 font-medium">{item.category}</p>
                <p className="text-lg text-zinc-300 leading-relaxed max-w-3xl">
                  {item.longDescription || item.description}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <QualityScore item={item} size="lg" />
            </div>
          </div>

          {/* Universal Compatibility Section (BIG VISUALS) */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap size={16} className="text-[#00F0FF]" /> Universal Compatibility
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Claude Card */}
                <div className="p-4 rounded-xl bg-[#D97757]/10 border border-[#D97757]/20 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#D97757]/20 flex items-center justify-center">
                        <ClaudeIcon className="w-6 h-6 text-[#D97757]" />
                    </div>
                    <div>
                        <div className="font-bold text-[#D97757]">Claude</div>
                        <div className="text-xs text-zinc-400">3.5 Sonnet • Opus</div>
                    </div>
                </div>

                {/* Gemini Card */}
                <div className="p-4 rounded-xl bg-[#4E82EE]/10 border border-[#4E82EE]/20 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#4E82EE]/20 flex items-center justify-center">
                        <GeminiIcon className="w-6 h-6 text-[#4E82EE]" />
                    </div>
                    <div>
                        <div className="font-bold text-[#4E82EE]">Gemini</div>
                        <div className="text-xs text-zinc-400">3.0 Pro • 1.5 Flash</div>
                    </div>
                </div>

                {/* OpenAI Card */}
                <div className="p-4 rounded-xl bg-[#10A37F]/10 border border-[#10A37F]/20 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#10A37F]/20 flex items-center justify-center">
                        <OpenAIIcon className="w-6 h-6 text-[#10A37F]" />
                    </div>
                    <div>
                        <div className="font-bold text-[#10A37F]">OpenAI</div>
                        <div className="text-xs text-zinc-400">GPT-5.1 Codex • GPT-4o</div>
                    </div>
                </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-3xl font-display font-bold text-white">{formatNumber(item.installs || 0)}</div>
              <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                <Download size={12} /> Installs
              </div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-white">{formatNumber(item.remixes || 0)}</div>
              <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                <GitFork size={12} /> Remixes
              </div>
            </div>
            {item.tokenSavings && (
              <div>
                <div className="text-3xl font-display font-bold text-[#00F0FF]">{item.tokenSavings}%</div>
                <div className="text-xs text-zinc-500 mt-1">Token Savings</div>
              </div>
            )}
            <div>
              <div className="text-3xl font-display font-bold text-white">{(item.dependencies || []).length}</div>
              <div className="text-xs text-zinc-500 mt-1">Dependencies</div>
            </div>
          </div>
        </GlassCard>

        {/* Installation Card */}
        <InstallCard item={item} />

        {/* Full Agent Prompt */}
        {promptContent && (
          <AgentPromptViewer content={promptContent} fileName={item.files?.[0]} />
        )}

        {/* Related & Dependencies */}
        <div className="grid md:grid-cols-2 gap-8">
            {/* Metadata */}
            <GlassCard className="space-y-4 h-fit" compact>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Tags</h3>
                <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium">
                    {tag}
                    </span>
                ))}
                </div>
            </GlassCard>
            
             {/* Related */}
             <div className="space-y-4">
                 {relatedItems.length > 0 && (
                     <>
                        <h3 className="text-lg font-display font-bold text-white">Related Items</h3>
                        <div className="grid gap-4">
                        {relatedItems.map((related) => (
                            <Link key={related.id} href={`/items/${related.slug}`}>
                            <GlassCard compact hoverEffect className="flex items-center gap-4 p-4">
                                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-white">
                                {related.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                <div className="text-sm font-bold text-white truncate">{formatProductName(related.name)}</div>
                                <div className="text-xs text-zinc-500 truncate">{related.description}</div>
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
  );
}