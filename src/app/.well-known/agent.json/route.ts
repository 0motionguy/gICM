import { NextResponse } from "next/server";
import { REGISTRY } from "@/lib/registry";

export const revalidate = 3600;

/**
 * A2A Agent Card — /.well-known/agent.json
 *
 * Makes ClawdBot discoverable by any A2A-compatible client
 * (Google agents, Hashgraph Universal Registry, etc.)
 *
 * Spec: https://google.github.io/A2A/#/documentation
 */
export async function GET() {
  const totalItems = REGISTRY.length;
  const clawHubItems = REGISTRY.filter(
    (i) => i.openClaw?.category === "clawdhub-native"
  ).length;

  const agentCard = {
    name: "ClawdBot Web3 Skills Registry",
    description: `${totalItems}+ verified AI agent tools for Claude, Gemini, and OpenAI. ${clawHubItems} items on ClawHub. 100% security scanned. Web3, Solana, DeFi specialists.`,
    version: "1.0.0",
    url: "https://clawdbot.com",
    provider: {
      organization: "ICM Motion",
      url: "https://clawdbot.com",
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    authentication: {
      schemes: ["none"],
    },
    skills: [
      {
        id: "search-skills",
        name: "Search Web3 Skills",
        description: `Search ${totalItems}+ verified Web3/Solana/DeFi skills for AI agents`,
        inputModes: ["text"],
        outputModes: ["text", "json"],
        examples: [
          "Find Solana wallet skills",
          "Search for DeFi automation tools",
          "List trading agents",
        ],
      },
      {
        id: "install-skill",
        name: "Install Verified Skill",
        description:
          "Get installation instructions for security-audited skills",
        inputModes: ["text"],
        outputModes: ["text", "json"],
      },
      {
        id: "verify-skill",
        name: "Security Verification",
        description:
          "Check if a skill has been security-audited and get its threat level",
        inputModes: ["text"],
        outputModes: ["json"],
      },
    ],
    defaultInputModes: ["text"],
    defaultOutputModes: ["text", "json"],
  };

  return NextResponse.json(agentCard, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
