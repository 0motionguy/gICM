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
  Heart,
} from "lucide-react";
import { ClaudeIcon, GeminiIcon, OpenAIIcon } from "@/components/ui/icons";
import Link from "next/link";

export const metadata = {
  title: "Projects | ClawdBot - Shipped with Agents",
  description:
    "Real projects shipped with ClawdBot agents. DeFi, NFTs, AI bots, dApps. See what agents can build.",
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
    description:
      "Full-featured token launchpad with bonding curves, real-time charts, and wallet integration on Solana.",
    longDescription:
      "A complete implementation of a token launch platform featuring dynamic bonding curves, real-time price updates, and seamless Phantom wallet integration. Built in 48 hours using Claude Code.",
    author: "CryptoBuilder",
    platform: "claude",
    agents: [
      "icm-anchor-architect",
      "frontend-fusion-engine",
      "solana-guardian-auditor",
    ],
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
    description:
      "Multi-chain portfolio dashboard with real-time P&L, impermanent loss calculator, and yield farming analytics.",
    author: "DegenDev",
    platform: "multi",
    agents: [
      "frontend-fusion-engine",
      "defi-integration-architect",
      "database-schema-oracle",
    ],
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
    description:
      "Gas-optimized NFT marketplace with royalty enforcement, collection offers, and sweep functionality.",
    author: "NFT_Artisan",
    platform: "claude",
    agents: [
      "gas-optimization-specialist",
      "smart-contract-auditor",
      "frontend-fusion-engine",
    ],
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
    description:
      "Automated PR review bot that uses Gemini for multimodal code analysis and visual regression testing.",
    author: "DevToolsGuru",
    platform: "gemini",
    agents: [
      "gemini-visual-builder",
      "gemini-code-executor",
      "gemini-research-agent",
    ],
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
    description:
      "Automated memecoin trading bot with whale tracking, sentiment analysis, and risk management.",
    author: "AlgoTrader",
    platform: "claude",
    agents: [
      "whale-tracker",
      "sentiment-analyzer",
      "risk-manager",
      "sniper-bot",
    ],
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
    description:
      "Real-time voice assistant using OpenAI Realtime API with natural conversation and code generation.",
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
    description:
      "Complete DAO management platform with proposal creation, voting, treasury management, and analytics.",
    author: "DAOBuilder",
    platform: "claude",
    agents: [
      "smart-contract-auditor",
      "frontend-fusion-engine",
      "database-schema-oracle",
    ],
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
    description:
      "Generate interactive documentation from code screenshots and diagrams using Gemini multimodal.",
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

const featuredProjects = projects.filter((p) => p.featured);
const recentProjects = [...projects].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);
const topProjects = [...projects].sort((a, b) => b.upvotes - a.upvotes);

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "claude":
      return <ClaudeIcon className="h-4 w-4 text-[#D97757]" />;
    case "gemini":
      return <GeminiIcon className="h-4 w-4 text-[#4E82EE]" />;
    case "openai":
      return <OpenAIIcon className="h-4 w-4 text-[#10A37F]" />;
    default:
      return (
        <div className="flex -space-x-1">
          <ClaudeIcon className="h-3 w-3 text-[#D97757]" />
          <GeminiIcon className="h-3 w-3 text-[#4E82EE]" />
          <OpenAIIcon className="h-3 w-3 text-[#10A37F]" />
        </div>
      );
  }
};

const ProjectCard = ({
  project,
  size = "default",
}: {
  project: Project;
  size?: "default" | "large";
}) => {
  const isLarge = size === "large";

  return (
    <GlassCard
      className={`group p-5 transition-all duration-300 hover:border-white/20 ${isLarge ? "col-span-2" : ""}`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#D97757]/20 via-[#4E82EE]/20 to-[#10A37F]/20">
            <PlatformIcon platform={project.platform} />
          </div>
          <div>
            <h3 className="font-bold text-white transition-colors group-hover:text-[#00F0FF]">
              {project.name}
            </h3>
            <p className="text-xs text-zinc-500">by {project.author}</p>
          </div>
        </div>
        <button className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-sm transition-colors hover:bg-white/10">
          <Heart className="h-3 w-3 text-red-400" />
          <span className="text-zinc-400">{project.upvotes}</span>
        </button>
      </div>

      <p
        className={`mb-4 text-sm text-zinc-400 ${isLarge ? "" : "line-clamp-2"}`}
      >
        {isLarge
          ? project.longDescription || project.description
          : project.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {project.tags.slice(0, isLarge ? 6 : 4).map((tag, index) => (
          <span
            key={index}
            className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {project.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
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
              Demo <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
            >
              Code <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {isLarge && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="mb-2 text-xs text-zinc-500">Built with:</p>
          <div className="flex flex-wrap gap-1.5">
            {project.agents.map((agent, index) => (
              <Link
                key={index}
                href={`/items/${agent}`}
                className="rounded-full bg-[#00F0FF]/10 px-2 py-0.5 text-xs text-[#00F0FF] transition-colors hover:bg-[#00F0FF]/20"
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
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Marketplace
          </Link>
          <Link
            href="/guides/vibe-coding"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <Rocket className="h-4 w-4" />
            Start Building
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-2">
            <Trophy className="h-4 w-4 text-[#00F0FF]" />
            <span className="text-sm font-bold tracking-wide text-[#00F0FF]">
              Project Showcase
            </span>
          </div>

          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-white md:text-6xl">
            Shipped with{" "}
            <span className="bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] bg-clip-text text-transparent">
              agents.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-zinc-400">
            Real projects. Real agents. DeFi, NFTs, AI bots, dApps.
          </p>

          {/* Stats */}
          <div className="mb-12 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{projects.length}</p>
              <p className="text-xs text-zinc-500">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                {projects
                  .reduce((sum, p) => sum + p.upvotes, 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500">Total Upvotes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                {projects.reduce((sum, p) => sum + p.stars, 0)}
              </p>
              <p className="text-xs text-zinc-500">GitHub Stars</p>
            </div>
          </div>
        </div>

        {/* Featured Projects */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Star className="h-5 w-5 text-yellow-400" />
              Featured Projects
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <TrendingUp className="h-5 w-5 text-[#00F0FF]" />
              Trending This Week
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topProjects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Recent Projects */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Calendar className="h-5 w-5 text-green-400" />
              Recently Added
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recentProjects.slice(0, 4).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <GlassCard className="p-8 text-center">
          <Zap className="mx-auto mb-4 h-12 w-12 text-[#00F0FF]" />
          <h2 className="mb-3 text-2xl font-bold text-white">Your turn.</h2>
          <p className="mx-auto mb-6 max-w-xl text-zinc-400">
            617+ tools. Pick your agents. Ship something.
          </p>
          <div className="flex flex-col justify-center gap-4 md:flex-row">
            <Link
              href="/guides/vibe-coding"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D97757] via-[#4E82EE] to-[#10A37F] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
            >
              <Rocket className="h-5 w-5" />
              Start Building
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-bold text-white transition-colors hover:bg-white/5"
            >
              Browse All Agents
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </GlassCard>
      </main>
    </AuroraBackground>
  );
}
