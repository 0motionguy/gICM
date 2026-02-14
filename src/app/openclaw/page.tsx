import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Box,
  Terminal,
  Shield,
  Zap,
  ExternalLink,
  Cpu,
  Globe,
  Code2,
  Users,
} from "lucide-react";
import { REGISTRY } from "@/lib/registry";
import { GlassCard } from "@/components/ui/glass-card";
import { AuroraBackground } from "@/components/ui/aurora-background";

export const metadata: Metadata = {
  title: "OpenClaw Ecosystem | ClawdBot",
  description:
    "ClawdBot in the OpenClaw ecosystem. 14 items on ClawHub, A2A agent discovery, MCP server integration. 617+ verified AI tools.",
  openGraph: {
    title: "OpenClaw Ecosystem | ClawdBot",
    description:
      "ClawdBot in the OpenClaw ecosystem. 14 items on ClawHub, A2A agent discovery, MCP integration.",
  },
};

export default function OpenClawPage() {
  const totalItems = REGISTRY.length;
  const clawHubItems = REGISTRY.filter(
    (i) => i.openClaw?.category === "clawdhub-native"
  );
  const exclusiveItems = REGISTRY.filter(
    (i) => i.openClaw?.category === "clawdbot-exclusive"
  );

  return (
    <AuroraBackground className="min-h-screen bg-[#0A0A0B] font-sans text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-4 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to ClawdBot
          </Link>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-8 px-6 py-12 md:px-8">
        {/* Hero */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10">
              <Box className="h-6 w-6 text-[#00F0FF]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                OpenClaw Ecosystem
              </h1>
              <p className="text-sm text-zinc-500">
                How ClawdBot fits in the agent interoperability landscape
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">
            ClawdBot is an AI agent marketplace with{" "}
            <span className="font-semibold text-white">
              {totalItems}+ tools
            </span>
            .{" "}
            <span className="font-semibold text-[#00F0FF]">
              {clawHubItems.length} items
            </span>{" "}
            are available on ClawHub (OpenClaw ecosystem). The rest are
            ClawdBot-exclusive agent prompts and configs.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Total Tools", value: totalItems, color: "text-white" },
            {
              label: "On ClawHub",
              value: clawHubItems.length,
              color: "text-[#00F0FF]",
            },
            {
              label: "Exclusive",
              value: exclusiveItems.length,
              color: "text-zinc-400",
            },
            { label: "Scanned", value: "100%", color: "text-[#7000FF]" },
          ].map((stat, i) => (
            <GlassCard key={i} compact className="text-center">
              <div className={`font-mono text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-zinc-500">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Discovery Protocols */}
        <GlassCard className="space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Globe size={20} className="text-[#00F0FF]" />
            Agent Discovery Protocols
          </h2>
          <p className="text-sm text-zinc-400">
            ClawdBot supports multiple discovery protocols so any AI agent can
            find and use our tools.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {/* A2A */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Zap size={16} className="text-[#00F0FF]" />
                <span className="font-semibold text-white">
                  A2A (Agent-to-Agent)
                </span>
              </div>
              <code className="block rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-[#00F0FF]">
                GET /.well-known/agent.json
              </code>
              <p className="mt-2 text-xs text-zinc-500">
                Google/Linux Foundation standard. Any A2A client discovers
                ClawdBot automatically.
              </p>
            </div>

            {/* Claude Marketplace */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Code2 size={16} className="text-[#D97757]" />
                <span className="font-semibold text-white">
                  Claude Marketplace
                </span>
              </div>
              <code className="block rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-[#D97757]">
                GET /.well-known/claude-marketplace.json
              </code>
              <p className="mt-2 text-xs text-zinc-500">
                Anthropic protocol. Claude Code instances discover all{" "}
                {totalItems}+ tools.
              </p>
            </div>

            {/* A2A Tasks */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Terminal size={16} className="text-[#7000FF]" />
                <span className="font-semibold text-white">A2A Tasks API</span>
              </div>
              <code className="block rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-[#7000FF]">
                POST /api/a2a/tasks
              </code>
              <p className="mt-2 text-xs text-zinc-500">
                Submit search, install, or verify tasks. Agents interact
                programmatically.
              </p>
            </div>

            {/* OpenAPI */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Shield size={16} className="text-[#10A37F]" />
                <span className="font-semibold text-white">OpenAPI Spec</span>
              </div>
              <code className="block rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-[#10A37F]">
                GET /openapi.json
              </code>
              <p className="mt-2 text-xs text-zinc-500">
                Full API documentation. Machine-readable schema for any client.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* ClawHub Items */}
        <GlassCard className="space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Box size={20} className="text-[#00F0FF]" />
            Items on ClawHub ({clawHubItems.length})
          </h2>
          <p className="text-sm text-zinc-400">
            These items map to real ClawHub skills and can be installed via{" "}
            <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[#00F0FF]">
              npx clawdhub install
            </code>
            .
          </p>

          <div className="space-y-2">
            {clawHubItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.slug}`}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-[#00F0FF]/20 hover:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <div className="font-medium text-white">{item.name}</div>
                  <div className="truncate text-xs text-zinc-500">
                    {item.openClaw?.clawHubSlug}
                  </div>
                </div>
                <code className="hidden shrink-0 rounded bg-black/40 px-2 py-1 font-mono text-[10px] text-[#00F0FF] sm:block">
                  {item.openClaw?.clawHubInstall}
                </code>
              </Link>
            ))}
          </div>
        </GlassCard>

        {/* MCP Config */}
        <GlassCard className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Cpu size={20} className="text-[#D97757]" />
            MCP Server Config
          </h2>
          <p className="text-sm text-zinc-400">
            Add ClawdBot as an MCP server in Claude Code or any MCP-compatible
            client.
          </p>
          <div className="rounded-xl border border-white/5 bg-[#050505] p-4">
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-zinc-300">
              {`{
  "mcpServers": {
    "clawdbot": {
      "command": "npx",
      "args": ["@clawdbot/mcp-server@latest"]
    }
  }
}`}
            </pre>
          </div>
          <p className="text-xs text-zinc-600">
            Note: The @clawdbot/mcp-server package is coming soon. In the
            meantime, use the REST API directly.
          </p>
        </GlassCard>

        {/* Quick API Reference */}
        <GlassCard className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Terminal size={20} className="text-[#7000FF]" />
            Quick API Reference
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Search",
                cmd: 'curl "https://clawdbot.com/api/search?q=solana"',
              },
              {
                label: "ClawHub items",
                cmd: 'curl "https://clawdbot.com/api/registry?ecosystem=clawdhub-native"',
              },
              {
                label: "A2A Task",
                cmd: `curl -X POST "https://clawdbot.com/api/a2a/tasks" -H "Content-Type: application/json" -d '{"skill":"search-skills","input":"defi"}'`,
              },
              {
                label: "Health",
                cmd: 'curl "https://clawdbot.com/api/health"',
              },
            ].map((api) => (
              <div key={api.label}>
                <div className="mb-1 text-xs font-semibold text-zinc-400">
                  {api.label}
                </div>
                <code className="block overflow-x-auto rounded-lg bg-[#050505] px-3 py-2 font-mono text-xs text-[#00F0FF]">
                  {api.cmd}
                </code>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Agent Registration */}
        <GlassCard className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Users size={20} className="text-[#10A37F]" />
            Agent Registration
          </h2>
          <p className="text-sm text-zinc-400">
            Register your AI agent on ClawdBot so other agents can discover and
            interact with it.
          </p>
          <div className="rounded-xl border border-white/5 bg-[#050505] p-4">
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-zinc-300">
              {`curl -X POST "https://clawdbot.com/api/agents/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "MyDeFiAgent",
    "description": "Automated yield farming agent",
    "endpoint": "https://my-agent.example.com",
    "agentCard": "https://my-agent.example.com/.well-known/agent.json",
    "skills": ["defi", "yield", "solana"],
    "owner": "wallet-or-email"
  }'`}
            </pre>
          </div>
          <div className="space-y-2 text-xs text-zinc-500">
            <div>
              <span className="font-semibold text-zinc-400">
                Discover agents:
              </span>{" "}
              <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[#00F0FF]">
                GET /api/agents?skill=defi
              </code>
            </div>
            <div>
              <span className="font-semibold text-zinc-400">
                Agent details:
              </span>{" "}
              <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[#00F0FF]">
                GET /api/agents/{"<agentId>"}
              </code>
            </div>
          </div>
        </GlassCard>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          <a
            href="/.well-known/agent.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            A2A Agent Card <ExternalLink size={14} />
          </a>
          <a
            href="/.well-known/claude-marketplace.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            Claude Marketplace <ExternalLink size={14} />
          </a>
          <a
            href="/openapi.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            OpenAPI Spec <ExternalLink size={14} />
          </a>
          <a
            href="/SKILL.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            SKILL.md <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </AuroraBackground>
  );
}
