import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, ArrowRight, Rocket, Sparkles, Code2, Zap, CheckCircle2, MessageSquare, Terminal, Layers } from "lucide-react";
import { ClaudeIcon, GeminiIcon, OpenAIIcon } from "@/components/ui/icons";
import Link from "next/link";

export const metadata = {
  title: "Vibe Coding Guide | gICM - Start Building with AI",
  description: "Complete beginner guide to AI-assisted development. Learn to build full-stack apps with natural language using Claude, Gemini, or GPT.",
};

const steps = [
  {
    number: 1,
    title: "Choose Your AI Model",
    description: "Pick the AI that fits your needs. You can use multiple!",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/guides/claude-setup" className="p-4 rounded-lg bg-[#D97757]/10 border border-[#D97757]/30 hover:bg-[#D97757]/20 transition-colors group">
          <ClaudeIcon className="w-8 h-8 text-[#D97757] mb-2" />
          <h4 className="font-bold text-white mb-1">Claude (Recommended)</h4>
          <p className="text-xs text-zinc-400">Best for complex coding and reasoning</p>
          <span className="text-xs text-[#D97757] group-hover:underline">Setup Guide →</span>
        </Link>
        <Link href="/guides/gemini-setup" className="p-4 rounded-lg bg-[#4E82EE]/10 border border-[#4E82EE]/30 hover:bg-[#4E82EE]/20 transition-colors group">
          <GeminiIcon className="w-8 h-8 text-[#4E82EE] mb-2" />
          <h4 className="font-bold text-white mb-1">Gemini</h4>
          <p className="text-xs text-zinc-400">Fast multimodal with code execution</p>
          <span className="text-xs text-[#4E82EE] group-hover:underline">Setup Guide →</span>
        </Link>
        <Link href="/guides/openai-setup" className="p-4 rounded-lg bg-[#10A37F]/10 border border-[#10A37F]/30 hover:bg-[#10A37F]/20 transition-colors group">
          <OpenAIIcon className="w-8 h-8 text-[#10A37F] mb-2" />
          <h4 className="font-bold text-white mb-1">OpenAI GPT</h4>
          <p className="text-xs text-zinc-400">Great function calling and DALL-E</p>
          <span className="text-xs text-[#10A37F] group-hover:underline">Setup Guide →</span>
        </Link>
      </div>
    ),
  },
  {
    number: 2,
    title: "Install gICM CLI",
    description: "One command to access 400+ AI agents and skills.",
    content: (
      <div className="space-y-4">
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-[#00F0FF]">npm install -g @gicm/cli</code>
        </pre>
        <p className="text-sm text-zinc-500">Or use npx (no install needed):</p>
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-zinc-400">npx @gicm/cli --help</code>
        </pre>
      </div>
    ),
  },
  {
    number: 3,
    title: "Start a New Project",
    description: "Create a project folder and initialize it.",
    content: (
      <div className="space-y-4">
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-zinc-300">{`mkdir my-app && cd my-app
npm init -y
npx @gicm/cli init`}</code>
        </pre>
        <p className="text-sm text-zinc-400">
          This creates your project structure with AI configuration files.
        </p>
      </div>
    ),
  },
  {
    number: 4,
    title: "Add Agents for Your Stack",
    description: "Install specialized AI agents for your tech stack.",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400 mb-3">Example: Building a Next.js + Solana DeFi app</p>
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-[#00F0FF]">{`# Frontend agent
npx @gicm/cli add agent/frontend-fusion-engine

# Blockchain agent
npx @gicm/cli add agent/icm-anchor-architect

# Security auditor
npx @gicm/cli add agent/solana-guardian-auditor

# Add skills
npx @gicm/cli add skill/solana-anchor-mastery
npx @gicm/cli add skill/nextjs-app-router-patterns`}</code>
        </pre>
      </div>
    ),
  },
  {
    number: 5,
    title: "Start Vibe Coding!",
    description: "Describe what you want to build in natural language.",
    content: (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-gradient-to-r from-[#D97757]/10 via-[#4E82EE]/10 to-[#10A37F]/10 border border-white/10">
          <div className="flex items-start gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-[#00F0FF] mt-0.5" />
            <div>
              <p className="text-white font-medium mb-2">Example prompt:</p>
              <p className="text-sm text-zinc-300 italic">
                &quot;Create a token launch page with a bonding curve chart, wallet connection button,
                and real-time price updates. Use Next.js App Router with Tailwind and connect to Solana devnet.&quot;
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm text-zinc-400">
          Your installed agents will collaborate to generate production-ready code based on your description.
        </p>
      </div>
    ),
  },
];

const tips = [
  {
    icon: Sparkles,
    title: "Be Specific",
    description: "The more detail you provide, the better the output. Include tech stack, styling preferences, and features.",
  },
  {
    icon: Layers,
    title: "Use Multiple Agents",
    description: "Combine agents for full-stack development. Frontend + Backend + Security = complete app.",
  },
  {
    icon: Terminal,
    title: "Iterate Quickly",
    description: "Start simple, then add complexity. AI works best with incremental changes.",
  },
  {
    icon: Code2,
    title: "Review Generated Code",
    description: "AI-generated code is a starting point. Always review and understand what it creates.",
  },
];

const projectIdeas = [
  "Token launch platform with bonding curves",
  "NFT marketplace with royalty enforcement",
  "DeFi dashboard with portfolio tracking",
  "DAO voting interface with on-chain governance",
  "Cross-chain bridge UI",
  "Wallet analytics dashboard",
];

export default function VibeCodingPage() {
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
          <span className="text-sm text-zinc-500">Beginner · 20 min</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D97757]/20 via-[#4E82EE]/20 to-[#10A37F]/20 border border-white/20 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-[#00F0FF]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Start Vibe Coding
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Build full-stack applications with natural language. Describe what you want,
            and let AI agents generate production-ready code.
          </p>
        </div>

        {/* What is Vibe Coding */}
        <GlassCard className="p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00F0FF]" />
            What is Vibe Coding?
          </h2>
          <p className="text-zinc-400 mb-4">
            Vibe coding is a new paradigm where you describe your application in natural language,
            and AI generates the code for you. Instead of writing every line manually, you:
          </p>
          <ul className="space-y-2">
            {[
              "Describe your vision in plain English",
              "Let specialized AI agents generate code",
              "Review, refine, and iterate",
              "Ship faster than ever before",
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
                {item}
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step) => (
            <GlassCard key={step.number} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D97757]/20 via-[#4E82EE]/20 to-[#10A37F]/20 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00F0FF] font-bold">{step.number}</span>
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
            Pro Tips for Vibe Coding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <tip.icon className="w-5 h-5 text-[#00F0FF] mt-0.5" />
                <div>
                  <p className="font-medium text-white">{tip.title}</p>
                  <p className="text-xs text-zinc-400">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Project Ideas */}
        <GlassCard className="p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Project Ideas to Get Started</h2>
          <div className="flex flex-wrap gap-2">
            {projectIdeas.map((idea, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300"
              >
                {idea}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* CTA */}
        <div className="text-center">
          <p className="text-zinc-400 mb-4">
            Ready to start building?
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] text-white font-bold hover:opacity-90 transition-opacity"
            >
              Browse 400+ Agents
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/guides/claude-setup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors"
            >
              Setup Claude (Recommended)
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    </AuroraBackground>
  );
}
