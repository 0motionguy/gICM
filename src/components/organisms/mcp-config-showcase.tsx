"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  Zap,
  Shield,
  Code2,
  Database,
  Cloud,
  FileText,
  Search,
  Globe,
  Server,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface MCPConfig {
  id: string;
  name: string;
  description: string;
  useCase: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  config: string;
  envVars: string[];
  quickStart: string;
  performance: {
    responseTime: string;
    rateLimit: string;
    uptime: string;
  };
  pricing: string;
}

const TOP_MCP_CONFIGS: MCPConfig[] = [
  {
    id: "solana-agent-kit",
    name: "Solana Agent Kit",
    description: "Complete Solana blockchain integration with RPC, wallet management, and transaction building",
    useCase: "Solana dApp development, token operations, NFT minting",
    icon: Zap,
    color: "text-lime-600",
    bgColor: "bg-lime-50 dark:bg-lime-900/10",
    config: `{
  "mcpServers": {
    "solana-agent-kit": {
      "command": "npx",
      "args": ["-y", "@sendai/solana-agent-kit"],
      "env": {
        "SOLANA_PRIVATE_KEY": "your_base58_private_key",
        "RPC_URL": "https://rpc.helius.xyz/?api-key=YOUR_KEY",
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}`,
    envVars: ["SOLANA_PRIVATE_KEY", "RPC_URL", "OPENAI_API_KEY"],
    quickStart: `# Get Helius API key from helius.dev
export RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_KEY

# Generate wallet (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Get base58 private key
export SOLANA_PRIVATE_KEY=$(solana-keygen export ~/.config/solana/id.json)`,
    performance: {
      responseTime: "1.2s",
      rateLimit: "100 req/min",
      uptime: "99.9%",
    },
    pricing: "Free",
  },
  {
    id: "helius-rpc",
    name: "Helius RPC",
    description: "Enhanced Solana RPC with webhooks, DAS, and 99.99% uptime",
    useCase: "High-performance Solana data access, real-time blockchain monitoring",
    icon: Server,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/10",
    config: `{
  "mcpServers": {
    "helius": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-helius"],
      "env": {
        "HELIUS_API_KEY": "your_helius_api_key"
      }
    }
  }
}`,
    envVars: ["HELIUS_API_KEY"],
    quickStart: `# Sign up at helius.dev
# Create API key (Free tier: 100k credits/day)
export HELIUS_API_KEY=your_api_key

# Test connection
curl https://rpc.helius.xyz/?api-key=$HELIUS_API_KEY \\
  -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'`,
    performance: {
      responseTime: "0.8s",
      rateLimit: "1000 req/s",
      uptime: "99.99%",
    },
    pricing: "$49/mo",
  },
  {
    id: "github",
    name: "GitHub MCP",
    description: "Complete GitHub integration for code management, PR reviews, and workflow automation",
    useCase: "Code search, PR automation, repository management",
    icon: Code2,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/10",
    config: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    }
  }
}`,
    envVars: ["GITHUB_PERSONAL_ACCESS_TOKEN"],
    quickStart: `# Create token at github.com/settings/tokens
# Required scopes: repo, workflow, read:packages
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...

# Test
gh api user`,
    performance: {
      responseTime: "0.5s",
      rateLimit: "5000 req/hr",
      uptime: "99.95%",
    },
    pricing: "Free",
  },
  {
    id: "postgres",
    name: "PostgreSQL MCP",
    description: "Database operations with connection pooling, query optimization, and safety guards",
    useCase: "Database queries, schema management, data analysis",
    icon: Database,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/10",
    config: `{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/dbname"
      }
    }
  }
}`,
    envVars: ["DATABASE_URL"],
    quickStart: `# Local PostgreSQL
export DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Supabase
export DATABASE_URL=postgresql://postgres.[ref]:[pwd]@[region].pooler.supabase.com:6543/postgres

# Railway
export DATABASE_URL=$RAILWAY_POSTGRESQL_URL`,
    performance: {
      responseTime: "0.2s",
      rateLimit: "Unlimited",
      uptime: "99.99%",
    },
    pricing: "Self-hosted",
  },
  {
    id: "brave-search",
    name: "Brave Search",
    description: "Privacy-first web search with no tracking, perfect for research and documentation lookup",
    useCase: "Web research, documentation search, market analysis",
    icon: Search,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/10",
    config: `{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "BSA..."
      }
    }
  }
}`,
    envVars: ["BRAVE_API_KEY"],
    quickStart: `# Get API key from brave.com/search/api
# Free tier: 2,000 queries/month
export BRAVE_API_KEY=BSA...`,
    performance: {
      responseTime: "1.5s",
      rateLimit: "2000/mo (free)",
      uptime: "99.9%",
    },
    pricing: "Free / $5/mo",
  },
];

export function MCPConfigShowcase() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (config: MCPConfig, type: "config" | "quickstart") => {
    const text = type === "config" ? config.config : config.quickStart;
    await navigator.clipboard.writeText(text);
    setCopiedId(`${config.id}-${type}`);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadAll = () => {
    const allConfigs = TOP_MCP_CONFIGS.map(c => c.config).join("\n\n");
    const blob = new Blob([allConfigs], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gicm-mcp-configs.json";
    a.click();
    toast.success("Configs downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-white mb-2">
            Production-Ready MCP Configs
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Pre-configured, optimized setups for the top 10 MCPs
          </p>
        </div>
        <Button onClick={handleDownloadAll} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      {/* Config Cards */}
      <div className="space-y-4">
        {TOP_MCP_CONFIGS.map((config) => {
          const Icon = config.icon;

          return (
            <Card key={config.id} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-black dark:text-white">
                      {config.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {config.pricing}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    {config.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-zinc-500">
                      ⚡ {config.performance.responseTime}
                    </span>
                    <span className="text-zinc-500">
                      📊 {config.performance.rateLimit}
                    </span>
                    <span className="text-zinc-500">
                      ✓ {config.performance.uptime} uptime
                    </span>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="config" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                  <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="space-y-3">
                  <div className="bg-zinc-900 rounded-lg p-4 relative">
                    <pre className="text-xs text-lime-300 font-mono overflow-x-auto">
                      {config.config}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:text-lime-300"
                      onClick={() => handleCopy(config, "config")}
                    >
                      {copiedId === `${config.id}-config` ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Required Environment Variables:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {config.envVars.map((envVar) => (
                        <Badge key={envVar} variant="outline" className="text-xs">
                          {envVar}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quickstart" className="space-y-3">
                  <div className="bg-zinc-900 rounded-lg p-4 relative">
                    <pre className="text-xs text-lime-300 font-mono overflow-x-auto whitespace-pre-wrap">
                      {config.quickStart}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:text-lime-300"
                      onClick={() => handleCopy(config, "quickstart")}
                    >
                      {copiedId === `${config.id}-quickstart` ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">
                      Use Case:
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-400">
                      {config.useCase}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <Card className="p-6 bg-gradient-to-r from-lime-50 to-emerald-50 dark:from-lime-900/20 dark:to-emerald-900/20 border-lime-200 dark:border-lime-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-lime-300 dark:bg-lime-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-black dark:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-black dark:text-white mb-2">
              Want more MCP configs?
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4">
              We have 82 MCPs in the registry, each with optimized configurations and setup guides.
            </p>
            <div className="flex gap-3">
              <Button>
                Browse All MCPs
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline">
                View Full Guide
                <FileText className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
