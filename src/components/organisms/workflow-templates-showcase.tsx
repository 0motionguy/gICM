"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Rocket,
  Clock,
  DollarSign,
  TrendingDown,
  CheckCircle,
  ArrowRight,
  Play,
  Download,
  ExternalLink,
  Zap,
  Palette,
  Globe,
  Code2,
  Shield,
  Database,
} from "lucide-react";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  useCase: string;
  timeTraditional: string;
  timeWithGICM: string;
  tokenSavings: string;
  costSavings: string;
  phases: {
    name: string;
    duration: string;
    agents: string[];
    deliverables: string[];
  }[];
  stack: string[];
  videoUrl: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: "solana-defi",
    name: "Solana DeFi Protocol",
    description: "Build a complete DeFi protocol on Solana (AMM, lending, or yield aggregator)",
    icon: Zap,
    color: "text-lime-600",
    bgColor: "bg-lime-50 dark:bg-lime-900/10",
    borderColor: "border-lime-200 dark:border-lime-800",
    useCase: "AMM, Lending Protocol, Yield Aggregator, Liquidity Pools",
    timeTraditional: "8-12 weeks",
    timeWithGICM: "2-4 weeks",
    tokenSavings: "91.2%",
    costSavings: "$35k-55k",
    phases: [
      {
        name: "Protocol Design",
        duration: "1 week",
        agents: ["Anchor Architect", "DeFi Integration Architect", "Smart Contract Auditor"],
        deliverables: ["Architecture diagram", "State schemas", "Security threat model"],
      },
      {
        name: "Smart Contract Development",
        duration: "1 week",
        agents: ["Anchor Architect", "Foundry Testing Expert", "Gas Optimization Specialist"],
        deliverables: ["Core program logic", "Comprehensive test suite", "Optimized contracts"],
      },
      {
        name: "Security Audit",
        duration: "1 week",
        agents: ["Solana Guardian Auditor", "Smart Contract Auditor"],
        deliverables: ["Security audit report", "Vulnerability fixes", "Documentation"],
      },
      {
        name: "Frontend & Deployment",
        duration: "1 week",
        agents: ["Frontend Fusion Engine", "Deployment Strategist"],
        deliverables: ["Production UI", "Mainnet deployment", "Monitoring setup"],
      },
    ],
    stack: [
      "solana-guardian-auditor",
      "icm-anchor-architect",
      "foundry-testing-expert",
      "gas-optimization-specialist",
      "solana-agent-kit",
      "helius-rpc",
      "github",
      "postgres",
    ],
    videoUrl: "https://gicm.io/templates/solana-defi",
    difficulty: "advanced",
    tags: ["Solana", "DeFi", "Smart Contracts", "Anchor"],
  },
  {
    id: "nft-marketplace",
    name: "NFT Marketplace & Launchpad",
    description: "Complete NFT marketplace with minting, trading, and creator tools",
    icon: Palette,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/10",
    borderColor: "border-purple-200 dark:border-purple-800",
    useCase: "NFT Marketplace, Minting Platform, Creator Tools, Collection Launchpad",
    timeTraditional: "10-16 weeks",
    timeWithGICM: "3-5 weeks",
    tokenSavings: "90.9%",
    costSavings: "$60k-85k",
    phases: [
      {
        name: "Smart Contracts & Minting",
        duration: "2 weeks",
        agents: ["Anchor Architect", "ERC Standards Implementer", "Solana Agent Kit"],
        deliverables: ["Candy Machine integration", "cNFT support", "Royalty enforcement"],
      },
      {
        name: "Marketplace Logic",
        duration: "1 week",
        agents: ["Anchor Architect", "Gas Optimization Specialist", "Solana Guardian"],
        deliverables: ["Listing/buying logic", "Offer system", "Royalty distribution"],
      },
      {
        name: "Frontend Development",
        duration: "1 week",
        agents: ["Frontend Fusion Engine", "Performance Profiler", "Bundler Optimizer"],
        deliverables: ["NFT grid UI", "Minting interface", "Collection pages"],
      },
      {
        name: "Indexing & Analytics",
        duration: "1 week",
        agents: ["Graph Protocol Indexer", "Blockchain Indexer", "Database Schema Oracle"],
        deliverables: ["Metadata indexing", "Analytics dashboard", "Trading stats"],
      },
    ],
    stack: [
      "frontend-fusion-engine",
      "icm-anchor-architect",
      "graph-protocol-indexer",
      "blockchain-indexer-specialist",
      "solana-agent-kit",
      "helius-rpc",
      "postgres",
    ],
    videoUrl: "https://gicm.io/templates/nft-marketplace",
    difficulty: "intermediate",
    tags: ["NFT", "Marketplace", "Metaplex", "Frontend"],
  },
  {
    id: "web3-saas",
    name: "Full-Stack Web3 SaaS",
    description: "Subscription-based Web3 service with authentication, payments, and API platform",
    icon: Globe,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/10",
    borderColor: "border-blue-200 dark:border-blue-800",
    useCase: "Analytics Platform, API Service, Web3 Tools, Developer Platform",
    timeTraditional: "12-20 weeks",
    timeWithGICM: "4-6 weeks",
    tokenSavings: "91.0%",
    costSavings: "$90k-140k",
    phases: [
      {
        name: "API Design & Backend",
        duration: "2 weeks",
        agents: ["API Design Architect", "Backend API Specialist", "Database Schema Oracle"],
        deliverables: ["REST API", "Database schema", "Authentication system"],
      },
      {
        name: "Authentication & Payments",
        duration: "1 week",
        agents: ["Security Engineer", "Backend API Specialist", "Fullstack Orchestrator"],
        deliverables: ["Wallet login", "Subscription tiers", "Payment processing"],
      },
      {
        name: "Dashboard & Frontend",
        duration: "1 week",
        agents: ["Frontend Fusion Engine", "Performance Profiler", "Test Automation"],
        deliverables: ["Admin dashboard", "Analytics charts", "E2E tests"],
      },
      {
        name: "DevOps & Monitoring",
        duration: "2 weeks",
        agents: ["DevOps Platform Engineer", "Cloud Architect", "Monitoring Specialist"],
        deliverables: ["CI/CD pipeline", "AWS infrastructure", "Monitoring setup"],
      },
    ],
    stack: [
      "fullstack-orchestrator",
      "api-design-architect",
      "backend-api-specialist",
      "frontend-fusion-engine",
      "database-schema-oracle",
      "devops-platform-engineer",
      "postgres",
      "aws",
    ],
    videoUrl: "https://gicm.io/templates/web3-saas",
    difficulty: "advanced",
    tags: ["SaaS", "API", "Authentication", "Payments"],
  },
];

export function WorkflowTemplatesShowcase() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate>(TEMPLATES[0]);

  return (
    <div className="space-y-8">
      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate.id === template.id;

          return (
            <Card
              key={template.id}
              className={`p-6 cursor-pointer transition-all ${
                isSelected
                  ? `${template.borderColor} shadow-lg`
                  : "border-zinc-200 dark:border-zinc-800 hover:shadow-md"
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-lg ${template.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${template.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-black dark:text-white mb-1">
                    {template.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {template.difficulty}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {template.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Time Saved
                  </span>
                  <span className="font-bold text-lime-600">
                    {template.timeTraditional} → {template.timeWithGICM}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    Token Savings
                  </span>
                  <span className="font-bold text-lime-600">{template.tokenSavings}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Cost Savings
                  </span>
                  <span className="font-bold text-lime-600">{template.costSavings}</span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-lime-600 dark:text-lime-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Selected Template
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Selected Template Details */}
      <Card className="p-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="stack">Stack</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-black dark:text-white mb-2">
                {selectedTemplate.name}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                {selectedTemplate.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedTemplate.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-lime-50 to-emerald-50 dark:from-lime-900/20 dark:to-emerald-900/20 border border-lime-200 dark:border-lime-800 rounded-lg p-6">
              <h3 className="font-bold text-black dark:text-white mb-4">Use Cases</h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {selectedTemplate.useCase}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <Clock className="w-8 h-8 text-lime-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 mb-1">Time to Deploy</p>
                <p className="font-bold text-black dark:text-white">
                  {selectedTemplate.timeWithGICM}
                </p>
              </div>

              <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <TrendingDown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 mb-1">Token Savings</p>
                <p className="font-bold text-black dark:text-white">
                  {selectedTemplate.tokenSavings}
                </p>
              </div>

              <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 mb-1">Cost Savings</p>
                <p className="font-bold text-black dark:text-white">
                  {selectedTemplate.costSavings}
                </p>
              </div>

              <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <Rocket className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 mb-1">Difficulty</p>
                <p className="font-bold text-black dark:text-white capitalize">
                  {selectedTemplate.difficulty}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                disabled
                title="Coming soon - template downloads will be available after launch"
                aria-label="Use this template (coming soon)"
              >
                <Download className="w-4 h-4 mr-2" />
                Use This Template
              </Button>
              <Button variant="outline" asChild>
                <a
                  href="https://github.com/gicm-io/gicm/blob/main/WORKFLOW_TEMPLATES.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Guide
                </a>
              </Button>
            </div>
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value="phases" className="space-y-4">
            {selectedTemplate.phases.map((phase, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-lime-600 dark:text-lime-400">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-black dark:text-white">{phase.name}</h3>
                      <Badge variant="outline">{phase.duration}</Badge>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium text-zinc-500 mb-2">Agents Used:</p>
                      <div className="flex flex-wrap gap-2">
                        {phase.agents.map((agent) => (
                          <Badge key={agent} variant="outline" className="text-xs">
                            <Code2 className="w-3 h-3 mr-1" />
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-zinc-500 mb-2">Deliverables:</p>
                      <ul className="space-y-1">
                        {phase.deliverables.map((deliverable) => (
                          <li key={deliverable} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <CheckCircle className="w-4 h-4 text-lime-600 flex-shrink-0" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Stack Tab */}
          <TabsContent value="stack" className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6">
              <h3 className="font-bold text-black dark:text-white mb-4">
                Stack Configuration ({selectedTemplate.stack.length} items)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedTemplate.stack.map((itemId) => (
                  <Link key={itemId} href={`/items/${itemId}`}>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-lime-300 dark:hover:border-lime-700 transition-all">
                      <div className="w-8 h-8 rounded bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                      </div>
                      <span className="text-sm font-medium text-black dark:text-white">
                        {itemId.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Install Complete Stack
                </Button>
                <Button variant="outline">
                  View Stack Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ROI Tab */}
          <TabsContent value="roi" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold text-black dark:text-white mb-4">
                  Traditional Approach
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Time</span>
                    <span className="font-bold text-red-600">{selectedTemplate.timeTraditional}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Team Size</span>
                    <span className="font-bold text-red-600">5-7 developers</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Token Usage</span>
                    <span className="font-bold text-red-600">245K tokens</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Cost</span>
                    <span className="font-bold text-red-600">$50k-80k</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-lime-50 to-emerald-50 dark:from-lime-900/20 dark:to-emerald-900/20 border-lime-200 dark:border-lime-800">
                <h3 className="font-bold text-black dark:text-white mb-4">
                  With gICM
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Time</span>
                    <span className="font-bold text-lime-600">{selectedTemplate.timeWithGICM}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Team Size</span>
                    <span className="font-bold text-lime-600">1-2 developers</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Token Usage</span>
                    <span className="font-bold text-lime-600">21.6K tokens</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Cost</span>
                    <span className="font-bold text-lime-600">$15k-25k</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-lime-500 to-emerald-500 text-white rounded-lg p-6 text-center">
              <p className="text-sm font-medium mb-2">Total Savings</p>
              <p className="text-4xl font-black mb-2">{selectedTemplate.costSavings}</p>
              <p className="text-sm opacity-90">
                {selectedTemplate.tokenSavings} token reduction • 4x faster delivery
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
