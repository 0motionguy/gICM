/**
 * Sample/Starter Stacks
 * Pre-configured stacks to help new users get started quickly
 */

import type { StackConfig } from "./remix";
import { nanoid } from "nanoid";

export const SAMPLE_STACKS: StackConfig[] = [
  {
    id: "ptc-tool-search-stack",
    name: "PTC + Tool Search Tool",
    description:
      "Programmatic Tool Calling with dynamic tool discovery. 85% context reduction + 37% token savings. Orchestrate 513+ agents via code pipelines.",
    items: [
      // Core PTC components
      "ptc-coordinator",
      "tool-search-api",
      "pipeline-risk-classifier",
      // Agent templates for PTC
      "hunter-agent",
      "defi-agent",
      "decision-agent",
      "audit-agent",
      "wallet-agent",
      // Supporting infrastructure
      "context-engine-mcp",
      "autonomy-engine",
    ],
    tags: ["ptc", "tool-search", "orchestration", "ai-agents", "context-reduction", "advanced"],
    createdAt: new Date("2025-01-30").toISOString(),
    updatedAt: new Date("2025-01-30").toISOString(),
    author: "ClawdBot Team",
    version: "1.0.0",
    featured: true,
  },
  {
    id: "sample-solana-starter",
    name: "Solana Development Starter",
    description:
      "Essential tools for building on Solana - perfect for beginners starting their Web3 journey",
    items: [
      "icm-anchor-architect",
      "solana-agent-kit",
      "helius-rpc",
      "anchor-init",
      "deploy-solana",
      "anchor-test",
    ],
    tags: ["solana", "web3", "beginner", "starter"],
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
    author: "ClawdBot Team",
    version: "1.0.0",
  },
  {
    id: "sample-defi-builder",
    name: "DeFi Protocol Builder",
    description:
      "Complete stack for building secure DeFi protocols with security auditing and gas optimization",
    items: [
      "solana-guardian-auditor",
      "icm-anchor-architect",
      "foundry-testing-expert",
      "gas-optimization-specialist",
      "uniswap-v3-integration-specialist",
      "anchor-deploy",
      "estimate-gas",
      "security-audit",
      "helius-rpc",
      "solana-agent-kit",
    ],
    tags: ["defi", "security", "advanced", "solana"],
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
    author: "ClawdBot Team",
    version: "1.0.0",
  },
  {
    id: "sample-fullstack-web3",
    name: "Full-Stack Web3 App",
    description:
      "Frontend + Backend + Blockchain integration for building complete Web3 applications",
    items: [
      "frontend-fusion-engine",
      "backend-api-specialist",
      "ethersjs-integration-architect",
      "postgres-mcp",
      "github-mcp",
      "component-gen",
      "refactor",
      "test-generate-cases",
      "deploy-kubernetes",
    ],
    tags: ["fullstack", "web3", "intermediate", "react"],
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
    author: "ClawdBot Team",
    version: "1.0.0",
  },
  {
    id: "sample-nft-marketplace",
    name: "NFT Marketplace & Launchpad",
    description:
      "Build NFT marketplaces and launchpads with Metaplex, compressed NFTs, and analytics",
    items: [
      "icm-anchor-architect",
      "frontend-fusion-engine",
      "graph-protocol-indexer",
      "solana-agent-kit",
      "helius-rpc",
      "anchor-init",
      "deploy-solana",
      "component-gen",
    ],
    tags: ["nft", "marketplace", "solana", "intermediate"],
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
    author: "ClawdBot Team",
    version: "1.0.0",
  },
  {
    id: "sample-testing-automation",
    name: "Testing & QA Automation",
    description:
      "Comprehensive testing stack with unit tests, E2E tests, and security audits",
    items: [
      "test-automation-engineer",
      "e2e-testing-specialist",
      "unit-test-generator",
      "foundry-testing-expert",
      "test-generate-cases",
      "test-coverage",
      "security-audit",
      "performance-audit",
    ],
    tags: ["testing", "qa", "security", "beginner"],
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-01").toISOString(),
    author: "ClawdBot Team",
    version: "1.0.0",
  },
];

/**
 * Get a sample stack by ID
 */
export function getSampleStackById(id: string): StackConfig | null {
  return SAMPLE_STACKS.find((stack) => stack.id === id) || null;
}

/**
 * Get all sample stacks
 */
export function getAllSampleStacks(): StackConfig[] {
  return SAMPLE_STACKS;
}

/**
 * Check if a stack ID is a sample stack
 */
export function isSampleStack(id: string): boolean {
  return SAMPLE_STACKS.some((stack) => stack.id === id);
}

/**
 * Clone a sample stack with a new ID for a user
 */
export function cloneSampleStack(
  sampleId: string,
  options?: { name?: string; author?: string }
): StackConfig | null {
  const sample = getSampleStackById(sampleId);
  if (!sample) return null;

  const now = new Date().toISOString();

  return {
    ...sample,
    id: nanoid(),
    name: options?.name || `${sample.name} (My Copy)`,
    author: options?.author || undefined,
    remixedFrom: sample.id,
    createdAt: now,
    updatedAt: now,
  };
}
