import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Star,
  GitBranch,
  Users,
  Zap,
  Rocket,
  Trophy,
  TrendingUp,
  Calendar,
  ExternalLink,
  Heart
} from "lucide-react";
import { ClaudeIcon, GeminiIcon, OpenAIIcon } from "@/components/ui/icons";
import Link from "next/link";

export const metadata = {
  title: "Project Showcase | ClawdBot - Built with AI Agents",
  description: "Discover amazing projects built with ClawdBot AI agents. Get inspired, learn from real implementations, and share your own creations.",
};

interface Project {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  thumbnail?: string;
  author: string;
  authorAvatar?: string;
  platform: "claude" | "gemini" | "openai" | "multi";
  agents: string[];
  tags: string[];
  upvotes: number;
  stars: number;
  forks: number;
  demoUrl?: string;
  repoUrl?: string;
  featured: boolean;
  createdAt: string;
}

const projects: Project[] = [
  {
    id: "pump-fun-clone",
    name: "PumpFun Clone",
    description: "Full-featured token launchpad with bonding curves, real-time charts, and wallet integration on Solana.",
    longDescription: "A complete implementation of a token launch platform featuring dynamic bonding curves, real-time price updates, and seamless Phantom wallet integration. Built in 48 hours using Claude Code.",
    author: "CryptoBuilder",
    platform: "claude",
    agents: ["icm-anchor-architect", "frontend-fusion-engine", "solana-guardian-auditor"],
    tags: ["Solana", "DeFi", "Bonding Curve", "Next.js"],
    upvotes: 342,
    stars: 156,
    forks: 45,
    demoUrl: "https://example.com/demo",
    repoUrl: "https://github.com/example/pump-clone",
    featured: true,
    createdAt: "2024-11-15",
  },
  {
    id: "defi-dashboard",
    name: "DeFi Portfolio Tracker",
    description: "Multi-chain portfolio dashboard with real-time P&L, impermanent loss calculator, and yield farming analytics.",
    author: "DegenDev",
    platform: "multi",
    agents: ["frontend-fusion-engine", "defi-integration-architect", "database-schema-oracle"],
    tags: ["DeFi", "Analytics", "Multi-chain", "React"],
    upvotes: 256,
    stars: 89,
    forks: 23,
    demoUrl: "https://example.com/defi-dash",
    featured: true,
    createdAt: "2024-11-10",
  },
  {
    id: "nft-marketplace",
    name: "NFT Marketplace v2",
    description: "Gas-optimized NFT marketplace with royalty enforcement, collection offers, and sweep functionality.",
    author: "NFT_Artisan",
    platform: "claude",
    agents: ["gas-optimization-specialist", "smart-contract-auditor", "frontend-fusion-engine"],
    tags: ["NFT", "Marketplace", "EVM", "Gas Optimization"],
    upvotes: 189,
    stars: 67,
    forks: 18,
    repoUrl: "https://github.com/example/nft-market",
    featured: false,
    createdAt: "2024-11-08",
  },
  {
    id: "ai-code-reviewer",
    name: "AI Code Review Bot",
    description: "Automated PR review bot that uses Gemini for multimodal code analysis and visual regression testing.",
    author: "DevToolsGuru",
    platform: "gemini",
    agents: ["gemini-visual-builder", "gemini-code-executor", "gemini-research-agent"],
    tags: ["DevTools", "CI/CD", "Code Review", "Automation"],
    upvotes: 178,
    stars: 92,
    forks: 31,
    demoUrl: "https://example.com/ai-reviewer",
    repoUrl: "https://github.com/example/ai-reviewer",
    featured: true,
    createdAt: "2024-11-05",
  },
  {
    id: "trading-bot",
    name: "ICM Trading Bot",
    description: "Automated memecoin trading bot with whale tracking, sentiment analysis, and risk management.",
    author: "AlgoTrader",
    platform: "claude",
    agents: ["whale-tracker", "sentiment-analyzer", "risk-manager", "sniper-bot"],
    tags: ["Trading", "Bot", "DeFi", "Automation"],
    upvotes: 421,
    stars: 203,
    forks: 87,
    featured: true,
    createdAt: "2024-11-01",
  },
  {
    id: "ai-voice-app",
    name: "Voice-First AI Assistant",
    description: "Real-time voice assistant using OpenAI Realtime API with natural conversation and code generation.",
    author: "VoiceDevPro",
    platform: "openai",
    agents: ["openai-reasoning-pro", "openai-assistant-builder"],
    tags: ["Voice", "Realtime", "OpenAI", "WebRTC"],
    upvotes: 134,
    stars: 45,
    forks: 12,
    demoUrl: "https://example.com/voice-ai",
    featured: false,
    createdAt: "2024-10-28",
  },
  {
    id: "dao-governance",
    name: "DAO Governance Suite",
    description: "Complete DAO management platform with proposal creation, voting, treasury management, and analytics.",
    author: "DAOBuilder",
    platform: "claude",
    agents: ["smart-contract-auditor", "frontend-fusion-engine", "database-schema-oracle"],
    tags: ["DAO", "Governance", "Web3", "Treasury"],
    upvotes: 167,
    stars: 78,
    forks: 22,
    repoUrl: "https://github.com/example/dao-suite",
    featured: false,
    createdAt: "2024-10-25",
  },
  {
    id: "multimodal-docs",
    name: "Visual Documentation Generator",
    description: "Generate interactive documentation from code screenshots and diagrams using Gemini multimodal.",
    author: "DocsEngineer",
    platform: "gemini",
    agents: ["gemini-visual-builder", "gemini-vibe-coder"],
    tags: ["Documentation", "Multimodal", "Developer Tools"],
    upvotes: 98,
    stars: 34,
    forks: 8,
    demoUrl: "https://example.com/visual-docs",
    featured: false,
    createdAt: "2024-10-20",
  },
];

const featuredProjects = projects.filter(p => p.featured);
const recentProjects = [...projects].sort((a, b) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);
const topProjects = [...projects].sort((a, b) => b.upvotes - a.upvotes);

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "claude":
      return <ClaudeIcon className="w-4 h-4 text-[#D97757]" />;
    case "gemini":
      return <GeminiIcon className="w-4 h-4 text-[#4E82EE]" />;
    case "openai":
      return <OpenAIIcon className="w-4 h-4 text-[#10A37F]" />;
    default:
      return (
        <div className="flex -space-x-1">
          <ClaudeIcon className="w-3 h-3 text-[#D97757]" />
          <GeminiIcon className="w-3 h-3 text-[#4E82EE]" />
          <OpenAIIcon className="w-3 h-3 text-[#10A37F]" />
        </div>
      );
  }
};

const ProjectCard = ({ project, size = "default" }: { project: Project; size?: "default" | "large" }) => {
  const isLarge = size === "large";

  return (
    <GlassCard className={`p-5 group hover:border-white/20 transition-all duration-300 ${isLarge ? "col-span-2" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D97757]/20 via-[#4E82EE]/20 to-[#10A37F]/20 border border-white/10 flex items-center justify-center">
            <PlatformIcon platform={project.platform} />
          </div>
          <div>
            <h3 className="font-bold text-white group-hover:text-[#00F0FF] transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-zinc-500">by {project.author}</p>
          </div>
        </div>
        <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
          <Heart className="w-3 h-3 text-red-400" />
          <span className="text-zinc-400">{project.upvotes}</span>
        </button>
      </div>

      <p className={`text-sm text-zinc-400 mb-4 ${isLarge ? "" : "line-clamp-2"}`}>
        {isLarge ? project.longDescription || project.description : project.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.tags.slice(0, isLarge ? 6 : 4).map((tag, index) => (
          <span key={index} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-zinc-400">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {project.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            {project.forks}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#00F0FF] hover:underline"
            >
              Demo <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
            >
              Code <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {isLarge && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-zinc-500 mb-2">Built with:</p>
          <div className="flex flex-wrap gap-1.5">
            {project.agents.map((agent, index) => (
              <Link
                key={index}
                href={`/items/${agent}`}
                className="px-2 py-0.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] text-xs hover:bg-[#00F0FF]/20 transition-colors"
              >
                {agent}
              </Link>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default function ProjectsPage() {
  return (
    <AuroraBackground className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Marketplace
          </Link>
          <Link
            href="/guides/vibe-coding"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Rocket className="w-4 h-4" />
            Start Building
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 mb-6">
            <Trophy className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#00F0FF] font-bold text-sm tracking-wide">
              Project Showcase
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
            Built with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F]">
              ClawdBot Agents
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Discover amazing projects built by the community using AI agents.
            Get inspired, learn from real implementations, and share your own creations.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{projects.length}</p>
              <p className="text-xs text-zinc-500">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{projects.reduce((sum, p) => sum + p.upvotes, 0).toLocaleString()}</p>
              <p className="text-xs text-zinc-500">Total Upvotes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{projects.reduce((sum, p) => sum + p.stars, 0)}</p>
              <p className="text-xs text-zinc-500">GitHub Stars</p>
            </div>
          </div>
        </div>

        {/* Featured Projects */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Featured Projects
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.slice(0, 1).map((project) => (
              <ProjectCard key={project.id} project={project} size="large" />
            ))}
            {featuredProjects.slice(1, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Trending Projects */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00F0FF]" />
              Trending This Week
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProjects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Recent Projects */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              Recently Added
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProjects.slice(0, 4).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <GlassCard className="p-8 text-center">
          <Zap className="w-12 h-12 text-[#00F0FF] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Build Your Own Project
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-6">
            Start building amazing projects with 400+ AI agents. From DeFi protocols to
            AI assistants, our agents help you ship faster than ever.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/guides/vibe-coding"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] text-white font-bold hover:opacity-90 transition-opacity"
            >
              <Rocket className="w-5 h-5" />
              Start Vibe Coding
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors"
            >
              Browse All Agents
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </GlassCard>
      </main>
    </AuroraBackground>
  );
}
