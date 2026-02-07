import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, ArrowRight, Check, Sparkles, Brain, Image, Mic } from "lucide-react";
import { OpenAIIcon } from "@/components/ui/icons";
import Link from "next/link";

export const metadata = {
  title: "OpenAI GPT Setup Guide | ClawdBot",
  description: "Step-by-step guide to set up OpenAI GPT-4o, o1 reasoning, and DALL-E for AI development.",
};

const steps = [
  {
    number: 1,
    title: "Get Your OpenAI API Key",
    description: "Create an account and get your API key from OpenAI Platform.",
    content: (
      <div className="space-y-4">
        <p className="text-zinc-400">
          Visit the OpenAI Platform to create your API key:
        </p>
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10A37F]/10 border border-[#10A37F]/30 text-[#10A37F] hover:bg-[#10A37F]/20 transition-colors"
        >
          Open OpenAI Platform
          <ArrowRight className="w-4 h-4" />
        </a>
        <p className="text-sm text-zinc-500">
          You will need to add billing to use the API beyond free credits.
        </p>
      </div>
    ),
  },
  {
    number: 2,
    title: "Install OpenAI SDK",
    description: "Install the official OpenAI Node.js library.",
    content: (
      <div className="space-y-4">
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-[#00F0FF]">npm install openai</code>
        </pre>
        <p className="text-sm text-zinc-500">
          Or with yarn:
        </p>
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-zinc-400">yarn add openai</code>
        </pre>
      </div>
    ),
  },
  {
    number: 3,
    title: "Configure Environment",
    description: "Set up your API key in environment variables.",
    content: (
      <div className="space-y-4">
        <p className="text-zinc-400">Add to your environment:</p>
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-zinc-300">export OPENAI_API_KEY=&quot;sk-proj-...&quot;</code>
        </pre>
        <p className="text-sm text-zinc-500">Or in your .env file:</p>
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-zinc-300">OPENAI_API_KEY=sk-proj-...</code>
        </pre>
      </div>
    ),
  },
  {
    number: 4,
    title: "Quick Start Code",
    description: "Test your setup with GPT-4o.",
    content: (
      <div className="space-y-4">
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto text-xs">
          <code className="text-zinc-300">{`import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello, GPT!" }],
});

console.log(response.choices[0].message.content);`}</code>
        </pre>
      </div>
    ),
  },
  {
    number: 5,
    title: "Install ClawdBot OpenAI Agents",
    description: "Add GPT-optimized agents from the marketplace.",
    content: (
      <div className="space-y-4">
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-[#00F0FF]">npx @clawdbot/cli add agent/openai-reasoning-pro --platform=openai{"\n"}npx @clawdbot/cli add agent/openai-code-auditor --platform=openai</code>
        </pre>
        <Link
          href="/?platform=openai"
          className="inline-flex items-center gap-2 text-sm text-[#00F0FF] hover:underline"
        >
          Browse all OpenAI agents
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    ),
  },
];

const features = [
  {
    icon: Brain,
    title: "o1 Reasoning",
    description: "Advanced reasoning model for complex multi-step problems.",
  },
  {
    icon: Image,
    title: "DALL-E 3",
    description: "Generate high-quality images from text descriptions.",
  },
  {
    icon: Mic,
    title: "Realtime Voice",
    description: "Real-time voice conversations with WebRTC support.",
  },
];

const models = [
  { name: "GPT-4o", description: "Best for most tasks, fast and capable", cost: "$5/$15 per 1M tokens" },
  { name: "GPT-4o-mini", description: "Cheaper, great for simple tasks", cost: "$0.15/$0.60 per 1M tokens" },
  { name: "o1", description: "Deep reasoning, complex problems", cost: "$15/$60 per 1M tokens" },
  { name: "DALL-E 3", description: "Image generation", cost: "$0.04-$0.12 per image" },
];

export default function OpenAISetupPage() {
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
          <div className="w-20 h-20 rounded-2xl bg-[#10A37F]/10 border border-[#10A37F]/30 flex items-center justify-center mx-auto mb-6">
            <OpenAIIcon className="w-10 h-10 text-[#10A37F]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            OpenAI GPT Setup Guide
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Get started with GPT-4o, o1 reasoning, and DALL-E for powerful AI development.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {features.map((feature, index) => (
            <GlassCard key={index} className="p-4 text-center">
              <feature.icon className="w-8 h-8 text-[#10A37F] mx-auto mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-zinc-400">{feature.description}</p>
            </GlassCard>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step) => (
            <GlassCard key={step.number} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#10A37F]/20 border border-[#10A37F]/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#10A37F] font-bold">{step.number}</span>
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

        {/* Model Pricing */}
        <GlassCard className="p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Model Pricing</h2>
          <div className="grid gap-3">
            {models.map((model, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="font-medium text-white">{model.name}</p>
                  <p className="text-xs text-zinc-400">{model.description}</p>
                </div>
                <span className="text-sm text-[#10A37F] font-mono">{model.cost}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Next Steps */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/?platform=openai"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#10A37F] text-white font-bold hover:opacity-90 transition-opacity"
          >
            Browse OpenAI Agents
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/guides/vibe-coding"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors"
          >
            Continue to Vibe Coding
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </AuroraBackground>
  );
}
