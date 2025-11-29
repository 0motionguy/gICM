import type { RegisteredAgent, Intent, RoutingDecision, AgentType } from "../types.js";
import type { LLMClient } from "@gicm/agent-core";

// Keywords for each agent type
const AGENT_KEYWORDS: Record<AgentType, string[]> = {
  wallet: [
    "balance", "send", "transfer", "wallet", "address", "transaction",
    "sign", "approve", "spend", "holdings", "portfolio",
  ],
  defi: [
    "price", "swap", "dex", "liquidity", "pool", "tvl", "volume",
    "trending", "market", "token", "coin", "yield", "apy", "farm",
  ],
  nft: [
    "nft", "collection", "mint", "rarity", "floor", "opensea",
    "metaplex", "magic eden", "pfp", "trait", "art",
  ],
  dao: [
    "dao", "governance", "proposal", "vote", "voting", "snapshot",
    "tally", "realms", "treasury", "delegate",
  ],
  social: [
    "twitter", "telegram", "discord", "farcaster", "sentiment",
    "influencer", "post", "tweet", "social", "community", "hype",
  ],
  bridge: [
    "bridge", "cross-chain", "wormhole", "layerzero", "debridge",
    "transfer between", "move to", "from ethereum to", "to solana",
  ],
  audit: [
    "audit", "security", "vulnerability", "reentrancy", "contract",
    "scan", "safe", "risk", "exploit", "hack", "rug",
  ],
  custom: [],
};

// Action mapping for common intents
const ACTION_MAPPING: Record<string, { agentType: AgentType; action: string }> = {
  "check balance": { agentType: "wallet", action: "get_balance" },
  "get price": { agentType: "defi", action: "get_token_price" },
  "analyze sentiment": { agentType: "social", action: "analyze_sentiment" },
  "audit contract": { agentType: "audit", action: "analyze_contract" },
  "bridge tokens": { agentType: "bridge", action: "find_best_route" },
  "get nft info": { agentType: "nft", action: "get_collection" },
  "check proposals": { agentType: "dao", action: "get_proposals" },
};

export class Router {
  private agents: Map<string, RegisteredAgent> = new Map();
  private llmClient?: LLMClient;

  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient;
  }

  registerAgent(agent: RegisteredAgent): void {
    this.agents.set(agent.id, agent);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  async route(input: string): Promise<RoutingDecision | null> {
    // Try LLM-based routing first
    if (this.llmClient) {
      const llmDecision = await this.llmRoute(input);
      if (llmDecision && llmDecision.confidence > 0.7) {
        return llmDecision;
      }
    }

    // Fall back to keyword-based routing
    return this.keywordRoute(input);
  }

  private async llmRoute(input: string): Promise<RoutingDecision | null> {
    if (!this.llmClient) return null;

    const agentDescriptions = Array.from(this.agents.values())
      .map((a) => `- ${a.id} (${a.type}): ${a.description}. Capabilities: ${a.capabilities.join(", ")}`)
      .join("\n");

    try {
      const response = await this.llmClient.chat([
        {
          role: "system",
          content: `You are a routing system for a multi-agent platform.
Given a user request, determine which agent should handle it and what action to take.

Available agents:
${agentDescriptions}

Return JSON with this exact structure:
{
  "agentId": "string - ID of the agent to use",
  "action": "string - specific action/tool to call",
  "params": { "key": "value" },
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`,
        },
        {
          role: "user",
          content: input,
        },
      ]);

      return JSON.parse(response.content) as RoutingDecision;
    } catch {
      return null;
    }
  }

  private keywordRoute(input: string): RoutingDecision | null {
    const lowerInput = input.toLowerCase();
    const scores = new Map<AgentType, number>();

    // Score each agent type based on keyword matches
    for (const [agentType, keywords] of Object.entries(AGENT_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          score += keyword.length; // Weight by keyword length
        }
      }
      if (score > 0) {
        scores.set(agentType as AgentType, score);
      }
    }

    if (scores.size === 0) return null;

    // Find best matching agent type
    const bestType = Array.from(scores.entries()).reduce((best, current) =>
      current[1] > best[1] ? current : best
    )[0];

    // Find an agent of this type
    const agent = Array.from(this.agents.values()).find((a) => a.type === bestType);
    if (!agent) return null;

    // Try to determine action from input
    const action = this.inferAction(lowerInput, bestType);

    const maxScore = Math.max(...scores.values());
    const confidence = Math.min(maxScore / 50, 0.9); // Normalize confidence

    return {
      agentId: agent.id,
      action,
      params: this.extractParams(input),
      confidence,
      reasoning: `Keyword match for ${bestType} agent`,
    };
  }

  private inferAction(input: string, agentType: AgentType): string {
    // Check common action mappings
    for (const [phrase, mapping] of Object.entries(ACTION_MAPPING)) {
      if (input.includes(phrase) && mapping.agentType === agentType) {
        return mapping.action;
      }
    }

    // Default actions by agent type
    const defaultActions: Record<AgentType, string> = {
      wallet: "get_balance",
      defi: "get_token_price",
      nft: "get_collection",
      dao: "get_proposals",
      social: "analyze_sentiment",
      bridge: "find_best_route",
      audit: "analyze_contract",
      custom: "execute",
    };

    return defaultActions[agentType] ?? "analyze";
  }

  private extractParams(input: string): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    // Extract Ethereum addresses
    const ethAddressMatch = input.match(/0x[a-fA-F0-9]{40}/);
    if (ethAddressMatch) {
      params.address = ethAddressMatch[0];
    }

    // Extract Solana addresses (base58, ~32-44 chars)
    const solAddressMatch = input.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
    if (solAddressMatch && !ethAddressMatch) {
      params.address = solAddressMatch[0];
    }

    // Extract token symbols (uppercase 2-10 chars)
    const tokenMatch = input.match(/\$([A-Z]{2,10})/);
    if (tokenMatch) {
      params.token = tokenMatch[1];
    }

    // Extract amounts
    const amountMatch = input.match(/(\d+(?:\.\d+)?)\s*(eth|sol|usdc|usdt)?/i);
    if (amountMatch) {
      params.amount = amountMatch[1];
    }

    return params;
  }

  parseIntent(input: string): Intent {
    const lowerInput = input.toLowerCase();
    const entities = this.extractParams(input);

    // Determine action from common patterns
    let action = "unknown";
    let confidence = 0.5;

    const actionPatterns: Array<{ pattern: RegExp; action: string; conf: number }> = [
      { pattern: /what('s| is) (the )?(price|value)/, action: "get_price", conf: 0.9 },
      { pattern: /check (my )?(balance|holdings)/, action: "get_balance", conf: 0.9 },
      { pattern: /send|transfer/, action: "send", conf: 0.85 },
      { pattern: /bridge|move .* to/, action: "bridge", conf: 0.85 },
      { pattern: /audit|scan|check (contract|security)/, action: "audit", conf: 0.9 },
      { pattern: /sentiment|what .* think/, action: "analyze_sentiment", conf: 0.8 },
      { pattern: /vote|proposal/, action: "governance", conf: 0.85 },
      { pattern: /nft|collection|floor/, action: "nft_info", conf: 0.85 },
    ];

    for (const { pattern, action: a, conf } of actionPatterns) {
      if (pattern.test(lowerInput)) {
        action = a;
        confidence = conf;
        break;
      }
    }

    return {
      action,
      entities: entities as Record<string, string>,
      confidence,
      rawInput: input,
    };
  }

  getAvailableAgents(): RegisteredAgent[] {
    return Array.from(this.agents.values());
  }
}
