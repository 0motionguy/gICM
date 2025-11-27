import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, ArrowRight, Check, Sparkles, AlertCircle, Zap, Code2, Image } from "lucide-react";
import { GeminiIcon } from "@/components/ui/icons";
import Link from "next/link";

export const metadata = {
  title: "Gemini AI Setup Guide | gICM",
  description: "Step-by-step guide to set up Google Gemini 2.0 Flash for multimodal AI development.",
};

const steps = [
  {
    number: 1,
    title: "Get Your Gemini API Key",
    description: "Create an API key from Google AI Studio.",
    content: (
      <div className="space-y-4">
        <p className="text-zinc-400">
          Visit Google AI Studio to create your free API key:
        </p>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4E82EE]/10 border border-[#4E82EE]/30 text-[#4E82EE] hover:bg-[#4E82EE]/20 transition-colors"
        >
          Open Google AI Studio
          <ArrowRight className="w-4 h-4" />
        </a>
        <div className="p-4 rounded-lg bg-[#4E82EE]/10 border border-[#4E82EE]/30">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#4E82EE] mt-0.5" />
            <div>
              <p className="text-sm text-[#4E82EE] font-medium">Free tier available</p>
              <p className="text-xs text-[#4E82EE]/70">Gemini offers a generous free tier for development.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: 2,
    title: "Install Gemini CLI (Optional)",
    description: "Install the Gemini CLI for terminal-based workflows.",
    content: (
      <div className="space-y-4">
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-[#00F0FF]">npm install -g @google/gemini-cli</code>
        </pre>
        <p className="text-sm text-zinc-500">
          Or use the SDK directly in your code:
        </p>
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-zinc-400">npm install @google/generative-ai</code>
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
          <code className="text-sm text-zinc-300">export GEMINI_API_KEY=&quot;AIzaSy...&quot;</code>
        </pre>
        <p className="text-sm text-zinc-500">Or in your .env file:</p>
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-zinc-300">GEMINI_API_KEY=AIzaSy...</code>
        </pre>
      </div>
    ),
  },
  {
    number: 4,
    title: "Quick Start Code",
    description: "Test your setup with a simple API call.",
    content: (
      <div className="space-y-4">
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto text-xs">
          <code className="text-zinc-300">{`import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const result = await model.generateContent("Hello, Gemini!");
console.log(result.response.text());`}</code>
        </pre>
      </div>
    ),
  },
  {
    number: 5,
    title: "Install gICM Gemini Agents",
    description: "Add Gemini-optimized agents from the marketplace.",
    content: (
      <div className="space-y-4">
        <pre className="p-4 rounded-lg bg-black/50 border border-white/10 overflow-x-auto">
          <code className="text-sm text-[#00F0FF]">npx @gicm/cli add agent/gemini-vibe-coder --platform=gemini{"\n"}npx @gicm/cli add agent/gemini-visual-builder --platform=gemini</code>
        </pre>
        <Link
          href="/?platform=gemini"
          className="inline-flex items-center gap-2 text-sm text-[#00F0FF] hover:underline"
        >
          Browse all Gemini agents
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    ),
  },
];

const features = [
  {
    icon: Zap,
    title: "Native Code Execution",
    description: "Run Python code in a sandboxed environment directly within Gemini.",
  },
  {
    icon: Image,
    title: "Multimodal Generation",
    description: "Generate images alongside code and text in a single response.",
  },
  {
    icon: Code2,
    title: "1M Token Context",
    description: "Process entire codebases with Gemini's massive context window.",
  },
];

export default function GeminiSetupPage() {
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
          <div className="w-20 h-20 rounded-2xl bg-[#4E82EE]/10 border border-[#4E82EE]/30 flex items-center justify-center mx-auto mb-6">
            <GeminiIcon className="w-10 h-10 text-[#4E82EE]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Gemini AI Setup Guide
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Get started with Gemini 2.0 Flash - ultra-fast multimodal AI with native code execution.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {features.map((feature, index) => (
            <GlassCard key={index} className="p-4 text-center">
              <feature.icon className="w-8 h-8 text-[#4E82EE] mx-auto mb-2" />
              <h3 className="font-bold text-white text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-zinc-400">{feature.description}</p>
            </GlassCard>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-16">
          {steps.map((step) => (
            <GlassCard key={step.number} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#4E82EE]/20 border border-[#4E82EE]/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#4E82EE] font-bold">{step.number}</span>
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

        {/* Next Steps */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/?platform=gemini"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#4E82EE] text-white font-bold hover:opacity-90 transition-opacity"
          >
            Browse Gemini Agents
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/guides/openai-setup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors"
          >
            Continue to OpenAI Setup
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </AuroraBackground>
  );
}
