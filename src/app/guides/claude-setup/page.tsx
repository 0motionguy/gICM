import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, ArrowRight, Check, Copy, Terminal, Key, Folder, Sparkles, AlertCircle } from "lucide-react";
import { ClaudeIcon } from "@/components/ui/icons";
import Link from "next/link";

export const metadata = {
  title: "Claude Code Setup Guide | gICM",
  description: "Step-by-step guide to set up Claude Code with Opus 4.5 for AI-powered development.",
};

const steps = [
  {
    number: 1,
    title: "Get Your Anthropic API Key",
    description: "Create an account and get your API key from Anthropic Console.",
    content: (
      <div className="space-y-4">
        <p className="text-zinc-400">
          Visit the Anthropic Console to create your API key:
        </p>
        <a
          href="https://console.anthropic.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D97757]/10 border border-[#D97757]/30 text-[#D97757] hover:bg-[#D97757]/20 transition-colors"
        >
          Open Anthropic Console
          <ArrowRight className="w-4 h-4" />
        </a>
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm text-amber-200 font-medium">Keep your API key secure</p>
              <p className="text-xs text-amber-200/70">Never commit your API key to git or share it publicly.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: 2,
    title: "Install Claude Code CLI",
    description: "Install the official Claude Code command-line interface.",
    content: (
      <div className="space-y-4">
        <div className="relative">
          <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
            <code className="text-sm text-[#00F0FF]">npm install -g @anthropic-ai/claude-code</code>
          </pre>
        </div>
        <p className="text-sm text-zinc-500">
          Or use npx to run without installing:
        </p>
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-zinc-400">npx @anthropic-ai/claude-code</code>
        </pre>
      </div>
    ),
  },
  {
    number: 3,
    title: "Configure Environment",
    description: "Set up your API key in your environment variables.",
    content: (
      <div className="space-y-4">
        <p className="text-zinc-400">Add to your shell profile (.bashrc, .zshrc, or .profile):</p>
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-zinc-300">export ANTHROPIC_API_KEY=&quot;sk-ant-api03-...&quot;</code>
        </pre>
        <p className="text-sm text-zinc-500">Or create a .env file in your project:</p>
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-zinc-300">ANTHROPIC_API_KEY=sk-ant-api03-...</code>
        </pre>
      </div>
    ),
  },
  {
    number: 4,
    title: "Initialize Project",
    description: "Set up Claude Code in your project directory.",
    content: (
      <div className="space-y-4">
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-[#00F0FF]">cd your-project{"\n"}claude</code>
        </pre>
        <p className="text-zinc-400">
          This creates a <code className="px-1.5 py-0.5 rounded bg-white/10 text-[#00F0FF]">.claude/</code> directory with your project configuration.
        </p>
      </div>
    ),
  },
  {
    number: 5,
    title: "Install gICM Agents",
    description: "Add powerful agents from the gICM marketplace.",
    content: (
      <div className="space-y-4">
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-[#00F0FF]">npx @gicm/cli add agent/icm-anchor-architect{"\n"}npx @gicm/cli add agent/frontend-fusion-engine{"\n"}npx @gicm/cli add skill/solana-anchor-mastery</code>
        </pre>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#00F0FF] hover:underline"
        >
          Browse all agents in the marketplace
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    ),
  },
];

const tips = [
  {
    title: "Use Opus 4.5 for Complex Tasks",
    description: "For complex reasoning and code generation, Claude Opus 4.5 provides the best results.",
  },
  {
    title: "Enable Prompt Caching",
    description: "Prompt caching can reduce costs by 90% for repeated requests.",
  },
  {
    title: "Organize with Workflows",
    description: "Use gICM workflows to orchestrate multiple agents for complex tasks.",
  },
];

export default function ClaudeSetupPage() {
  return (
    <AuroraBackground className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            All Guides
          </Link>
          <span className="text-sm text-zinc-500">5 steps · 10 min</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-[#D97757]/10 border border-[#D97757]/30 flex items-center justify-center mx-auto mb-6">
            <ClaudeIcon className="w-10 h-10 text-[#D97757]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Claude Code Setup Guide
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Get started with Claude Code and Opus 4.5 - the most capable AI coding assistant.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-16">
          {steps.map((step) => (
            <GlassCard key={step.number} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D97757]/20 border border-[#D97757]/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#D97757] font-bold">{step.number}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{step.description}</p>
                  {step.content}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Tips */}
        <GlassCard className="p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00F0FF]" />
            Pro Tips
          </h2>
          <div className="grid gap-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#00F0FF] mt-0.5" />
                <div>
                  <p className="text-white font-medium">{tip.title}</p>
                  <p className="text-sm text-zinc-400">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Next Steps */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#D97757] text-white font-bold hover:opacity-90 transition-opacity"
          >
            Browse Marketplace
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/guides/vibe-coding"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors"
          >
            Continue to Vibe Coding Guide
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </AuroraBackground>
  );
}
