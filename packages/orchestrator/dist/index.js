// src/orchestrator.ts
import {
  BaseAgent,
  createLLMClient
} from "@gicm/agent-core";

// src/types.ts
import { z } from "zod";
var OrchestratorConfigSchema = z.object({
  maxConcurrentAgents: z.number().default(5),
  defaultTimeout: z.number().default(3e4),
  // 30 seconds
  enableMemory: z.boolean().default(true)
});

// src/coordination/router.ts
var AGENT_KEYWORDS = {
  wallet: [
    "balance",
    "send",
    "transfer",
    "wallet",
    "address",
    "transaction",
    "sign",
    "approve",
    "spend",
    "holdings",
    "portfolio"
  ],
  defi: [
    "price",
    "swap",
    "dex",
    "liquidity",
    "pool",
    "tvl",
    "volume",
    "trending",
    "market",
    "token",
    "coin",
    "yield",
    "apy",
    "farm"
  ],
  nft: [
    "nft",
    "collection",
    "mint",
    "rarity",
    "floor",
    "opensea",
    "metaplex",
    "magic eden",
    "pfp",
    "trait",
    "art"
  ],
  dao: [
    "dao",
    "governance",
    "proposal",
    "vote",
    "voting",
    "snapshot",
    "tally",
    "realms",
    "treasury",
    "delegate"
  ],
  social: [
    "twitter",
    "telegram",
    "discord",
    "farcaster",
    "sentiment",
    "influencer",
    "post",
    "tweet",
    "social",
    "community",
    "hype"
  ],
  bridge: [
    "bridge",
    "cross-chain",
    "wormhole",
    "layerzero",
    "debridge",
    "transfer between",
    "move to",
    "from ethereum to",
    "to solana"
  ],
  audit: [
    "audit",
    "security",
    "vulnerability",
    "reentrancy",
    "contract",
    "scan",
    "safe",
    "risk",
    "exploit",
    "hack",
    "rug"
  ],
  custom: []
};
var ACTION_MAPPING = {
  "check balance": { agentType: "wallet", action: "get_balance" },
  "get price": { agentType: "defi", action: "get_token_price" },
  "analyze sentiment": { agentType: "social", action: "analyze_sentiment" },
  "audit contract": { agentType: "audit", action: "analyze_contract" },
  "bridge tokens": { agentType: "bridge", action: "find_best_route" },
  "get nft info": { agentType: "nft", action: "get_collection" },
  "check proposals": { agentType: "dao", action: "get_proposals" }
};
var Router = class {
  agents = /* @__PURE__ */ new Map();
  llmClient;
  constructor(llmClient) {
    this.llmClient = llmClient;
  }
  registerAgent(agent) {
    this.agents.set(agent.id, agent);
  }
  unregisterAgent(agentId) {
    this.agents.delete(agentId);
  }
  async route(input) {
    if (this.llmClient) {
      const llmDecision = await this.llmRoute(input);
      if (llmDecision && llmDecision.confidence > 0.7) {
        return llmDecision;
      }
    }
    return this.keywordRoute(input);
  }
  async llmRoute(input) {
    if (!this.llmClient) return null;
    const agentDescriptions = Array.from(this.agents.values()).map((a) => `- ${a.id} (${a.type}): ${a.description}. Capabilities: ${a.capabilities.join(", ")}`).join("\n");
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
}`
        },
        {
          role: "user",
          content: input
        }
      ]);
      return JSON.parse(response.content);
    } catch {
      return null;
    }
  }
  keywordRoute(input) {
    const lowerInput = input.toLowerCase();
    const scores = /* @__PURE__ */ new Map();
    for (const [agentType, keywords] of Object.entries(AGENT_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          score += keyword.length;
        }
      }
      if (score > 0) {
        scores.set(agentType, score);
      }
    }
    if (scores.size === 0) return null;
    const bestType = Array.from(scores.entries()).reduce(
      (best, current) => current[1] > best[1] ? current : best
    )[0];
    const agent = Array.from(this.agents.values()).find((a) => a.type === bestType);
    if (!agent) return null;
    const action = this.inferAction(lowerInput, bestType);
    const maxScore = Math.max(...scores.values());
    const confidence = Math.min(maxScore / 50, 0.9);
    return {
      agentId: agent.id,
      action,
      params: this.extractParams(input),
      confidence,
      reasoning: `Keyword match for ${bestType} agent`
    };
  }
  inferAction(input, agentType) {
    for (const [phrase, mapping] of Object.entries(ACTION_MAPPING)) {
      if (input.includes(phrase) && mapping.agentType === agentType) {
        return mapping.action;
      }
    }
    const defaultActions = {
      wallet: "get_balance",
      defi: "get_token_price",
      nft: "get_collection",
      dao: "get_proposals",
      social: "analyze_sentiment",
      bridge: "find_best_route",
      audit: "analyze_contract",
      custom: "execute"
    };
    return defaultActions[agentType] ?? "analyze";
  }
  extractParams(input) {
    const params = {};
    const ethAddressMatch = input.match(/0x[a-fA-F0-9]{40}/);
    if (ethAddressMatch) {
      params.address = ethAddressMatch[0];
    }
    const solAddressMatch = input.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
    if (solAddressMatch && !ethAddressMatch) {
      params.address = solAddressMatch[0];
    }
    const tokenMatch = input.match(/\$([A-Z]{2,10})/);
    if (tokenMatch) {
      params.token = tokenMatch[1];
    }
    const amountMatch = input.match(/(\d+(?:\.\d+)?)\s*(eth|sol|usdc|usdt)?/i);
    if (amountMatch) {
      params.amount = amountMatch[1];
    }
    return params;
  }
  parseIntent(input) {
    const lowerInput = input.toLowerCase();
    const entities = this.extractParams(input);
    let action = "unknown";
    let confidence = 0.5;
    const actionPatterns = [
      { pattern: /what('s| is) (the )?(price|value)/, action: "get_price", conf: 0.9 },
      { pattern: /check (my )?(balance|holdings)/, action: "get_balance", conf: 0.9 },
      { pattern: /send|transfer/, action: "send", conf: 0.85 },
      { pattern: /bridge|move .* to/, action: "bridge", conf: 0.85 },
      { pattern: /audit|scan|check (contract|security)/, action: "audit", conf: 0.9 },
      { pattern: /sentiment|what .* think/, action: "analyze_sentiment", conf: 0.8 },
      { pattern: /vote|proposal/, action: "governance", conf: 0.85 },
      { pattern: /nft|collection|floor/, action: "nft_info", conf: 0.85 }
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
      entities,
      confidence,
      rawInput: input
    };
  }
  getAvailableAgents() {
    return Array.from(this.agents.values());
  }
};

// src/coordination/memory.ts
var SharedMemory = class {
  store = /* @__PURE__ */ new Map();
  maxEntries;
  defaultTTL;
  constructor(config = {}) {
    this.maxEntries = config.maxEntries ?? 1e3;
    this.defaultTTL = config.defaultTTL ?? 36e5;
  }
  set(key, value, options = {}) {
    if (this.store.size >= this.maxEntries) {
      this.evictOldest();
    }
    this.store.set(key, {
      key,
      value,
      timestamp: /* @__PURE__ */ new Date(),
      ttl: options.ttl ?? this.defaultTTL,
      tags: options.tags ?? []
    });
  }
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }
  has(key) {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return false;
    }
    return true;
  }
  delete(key) {
    return this.store.delete(key);
  }
  getByTag(tag) {
    const results = [];
    for (const entry of this.store.values()) {
      if (this.isExpired(entry)) {
        this.store.delete(entry.key);
        continue;
      }
      if (entry.tags.includes(tag)) {
        results.push(entry);
      }
    }
    return results;
  }
  deleteByTag(tag) {
    let deleted = 0;
    for (const entry of this.store.values()) {
      if (entry.tags.includes(tag)) {
        this.store.delete(entry.key);
        deleted++;
      }
    }
    return deleted;
  }
  isExpired(entry) {
    if (!entry.ttl) return false;
    const age = Date.now() - entry.timestamp.getTime();
    return age > entry.ttl;
  }
  evictOldest() {
    let oldest = null;
    for (const entry of this.store.values()) {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = entry;
      }
    }
    if (oldest) {
      this.store.delete(oldest.key);
    }
  }
  clear() {
    this.store.clear();
  }
  size() {
    for (const entry of this.store.values()) {
      if (this.isExpired(entry)) {
        this.store.delete(entry.key);
      }
    }
    return this.store.size;
  }
  // Get all keys matching a pattern
  keys(pattern) {
    const allKeys = Array.from(this.store.keys());
    if (!pattern) return allKeys;
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    return allKeys.filter((key) => regex.test(key));
  }
  // Context helpers for workflows
  setWorkflowContext(workflowId, stepId, data) {
    this.set(`workflow:${workflowId}:${stepId}`, data, {
      tags: ["workflow", workflowId],
      ttl: 36e5
      // 1 hour
    });
  }
  getWorkflowContext(workflowId, stepId) {
    return this.get(`workflow:${workflowId}:${stepId}`);
  }
  clearWorkflowContext(workflowId) {
    return this.deleteByTag(workflowId);
  }
  // Agent state helpers
  setAgentState(agentId, state) {
    this.set(`agent:${agentId}:state`, state, {
      tags: ["agent", agentId]
    });
  }
  getAgentState(agentId) {
    return this.get(`agent:${agentId}:state`);
  }
  // Conversation/session context
  setSessionContext(sessionId, key, value) {
    this.set(`session:${sessionId}:${key}`, value, {
      tags: ["session", sessionId],
      ttl: 72e5
      // 2 hours
    });
  }
  getSessionContext(sessionId, key) {
    return this.get(`session:${sessionId}:${key}`);
  }
  // Cache helpers
  cached(key, factory, ttl) {
    const existing = this.get(key);
    if (existing !== null) {
      return Promise.resolve(existing);
    }
    return factory().then((value) => {
      this.set(key, value, { ttl });
      return value;
    });
  }
};

// src/workflows/trading.ts
var researchTokenWorkflow = {
  id: "research-token",
  name: "Token Research",
  description: "Comprehensive token research including price, sentiment, and security",
  steps: [
    {
      id: "get-price",
      agentId: "defi",
      action: "get_token_price",
      params: { token: "{{token}}" }
    },
    {
      id: "analyze-sentiment",
      agentId: "social",
      action: "analyze_sentiment",
      params: { query: "{{token}}" },
      dependsOn: ["get-price"]
    },
    {
      id: "check-contract",
      agentId: "audit",
      action: "analyze_contract",
      params: { address: "{{contractAddress}}" },
      dependsOn: ["get-price"]
    },
    {
      id: "get-whale-activity",
      agentId: "defi",
      action: "get_boosted_tokens",
      params: {},
      dependsOn: ["get-price"]
    }
  ],
  onError: "continue"
};
var swapWorkflow = {
  id: "swap-token",
  name: "Token Swap",
  description: "Execute a token swap with safety checks",
  steps: [
    {
      id: "check-balance",
      agentId: "wallet",
      action: "get_balance",
      params: { address: "{{wallet}}", token: "{{fromToken}}" }
    },
    {
      id: "get-quote",
      agentId: "defi",
      action: "get_token_price",
      params: { token: "{{toToken}}" },
      dependsOn: ["check-balance"]
    },
    {
      id: "check-contract-safety",
      agentId: "audit",
      action: "quick_scan",
      params: { address: "{{toToken}}" },
      dependsOn: ["get-quote"]
    },
    {
      id: "execute-swap",
      agentId: "wallet",
      action: "send_transaction",
      params: {
        type: "swap",
        from: "{{fromToken}}",
        to: "{{toToken}}",
        amount: "{{amount}}"
      },
      dependsOn: ["check-contract-safety"],
      condition: (ctx) => {
        const safety = ctx.results.get("check-contract-safety");
        return Boolean(safety?.success && !safety.data?.hasHighRisk);
      }
    }
  ],
  onError: "stop"
};
var bridgeWorkflow = {
  id: "bridge-tokens",
  name: "Cross-Chain Bridge",
  description: "Bridge tokens between chains with best route selection",
  steps: [
    {
      id: "check-source-balance",
      agentId: "wallet",
      action: "get_balance",
      params: {
        address: "{{wallet}}",
        token: "{{sourceToken}}",
        chain: "{{sourceChain}}"
      }
    },
    {
      id: "find-best-route",
      agentId: "bridge",
      action: "find_best_route",
      params: {
        sourceChain: "{{sourceChain}}",
        destChain: "{{destChain}}",
        sourceToken: "{{sourceToken}}",
        destToken: "{{destToken}}",
        amount: "{{amount}}"
      },
      dependsOn: ["check-source-balance"]
    },
    {
      id: "estimate-fees",
      agentId: "bridge",
      action: "estimate_fees",
      params: {},
      dependsOn: ["find-best-route"]
    }
  ],
  onError: "stop"
};
var portfolioAnalysisWorkflow = {
  id: "analyze-portfolio",
  name: "Portfolio Analysis",
  description: "Analyze wallet portfolio across chains",
  steps: [
    {
      id: "get-evm-balance",
      agentId: "wallet",
      action: "get_all_balances",
      params: { address: "{{wallet}}", chain: "evm" }
    },
    {
      id: "get-solana-balance",
      agentId: "wallet",
      action: "get_all_balances",
      params: { address: "{{solanaWallet}}", chain: "solana" }
    },
    {
      id: "get-nft-holdings",
      agentId: "nft",
      action: "get_user_nfts",
      params: { address: "{{wallet}}" }
    },
    {
      id: "calculate-total-value",
      agentId: "defi",
      action: "calculate_portfolio_value",
      params: {},
      dependsOn: ["get-evm-balance", "get-solana-balance", "get-nft-holdings"]
    }
  ],
  onError: "continue"
};
var tradingWorkflows = {
  "research-token": researchTokenWorkflow,
  "swap-token": swapWorkflow,
  "bridge-tokens": bridgeWorkflow,
  "analyze-portfolio": portfolioAnalysisWorkflow
};

// src/workflows/research.ts
var projectDueDiligenceWorkflow = {
  id: "project-due-diligence",
  name: "Project Due Diligence",
  description: "Comprehensive project research and security analysis",
  steps: [
    {
      id: "analyze-contract",
      agentId: "audit",
      action: "analyze_contract",
      params: { address: "{{contractAddress}}" }
    },
    {
      id: "check-social-sentiment",
      agentId: "social",
      action: "analyze_sentiment",
      params: { query: "{{projectName}}" }
    },
    {
      id: "get-token-metrics",
      agentId: "defi",
      action: "get_token_overview",
      params: { token: "{{token}}" }
    },
    {
      id: "check-dao-activity",
      agentId: "dao",
      action: "get_proposals",
      params: { daoId: "{{daoId}}" },
      condition: (ctx) => !!ctx.memory.get("daoId")
    },
    {
      id: "generate-report",
      agentId: "custom",
      action: "summarize_research",
      params: {},
      dependsOn: ["analyze-contract", "check-social-sentiment", "get-token-metrics"]
    }
  ],
  onError: "continue"
};
var nftCollectionAnalysisWorkflow = {
  id: "nft-collection-analysis",
  name: "NFT Collection Analysis",
  description: "Analyze NFT collection with rarity, pricing, and whale tracking",
  steps: [
    {
      id: "get-collection-info",
      agentId: "nft",
      action: "get_collection",
      params: { address: "{{collectionAddress}}" }
    },
    {
      id: "analyze-rarity",
      agentId: "nft",
      action: "analyze_rarity",
      params: {
        collectionAddress: "{{collectionAddress}}",
        tokenId: "{{tokenId}}"
      },
      dependsOn: ["get-collection-info"]
    },
    {
      id: "estimate-price",
      agentId: "nft",
      action: "estimate_price",
      params: {
        collectionAddress: "{{collectionAddress}}",
        tokenId: "{{tokenId}}"
      },
      dependsOn: ["analyze-rarity"]
    },
    {
      id: "track-whales",
      agentId: "nft",
      action: "get_whale_holders",
      params: { collectionAddress: "{{collectionAddress}}" },
      dependsOn: ["get-collection-info"]
    },
    {
      id: "check-social-buzz",
      agentId: "social",
      action: "analyze_sentiment",
      params: { query: "{{collectionName}}" },
      dependsOn: ["get-collection-info"]
    }
  ],
  onError: "continue"
};
var daoGovernanceWorkflow = {
  id: "dao-governance-analysis",
  name: "DAO Governance Analysis",
  description: "Analyze DAO proposals and voting patterns",
  steps: [
    {
      id: "get-dao-info",
      agentId: "dao",
      action: "get_dao",
      params: { id: "{{daoId}}" }
    },
    {
      id: "get-active-proposals",
      agentId: "dao",
      action: "get_proposals",
      params: { daoId: "{{daoId}}", state: "active" },
      dependsOn: ["get-dao-info"]
    },
    {
      id: "summarize-proposals",
      agentId: "dao",
      action: "summarize_proposal",
      params: { proposalId: "{{proposalId}}" },
      dependsOn: ["get-active-proposals"]
    },
    {
      id: "analyze-voting-power",
      agentId: "dao",
      action: "analyze_voting_power",
      params: { daoId: "{{daoId}}" },
      dependsOn: ["get-dao-info"]
    }
  ],
  onError: "continue"
};
var influencerTrackingWorkflow = {
  id: "influencer-tracking",
  name: "Influencer Tracking",
  description: "Track and analyze crypto influencers",
  steps: [
    {
      id: "get-twitter-profile",
      agentId: "social",
      action: "get_user",
      params: { username: "{{twitterHandle}}", platform: "twitter" }
    },
    {
      id: "analyze-influencer",
      agentId: "social",
      action: "analyze_influencer",
      params: { username: "{{twitterHandle}}" },
      dependsOn: ["get-twitter-profile"]
    },
    {
      id: "get-recent-calls",
      agentId: "social",
      action: "search_posts",
      params: {
        query: "from:{{twitterHandle}} $",
        platform: "twitter"
      },
      dependsOn: ["get-twitter-profile"]
    },
    {
      id: "check-farcaster",
      agentId: "social",
      action: "get_user",
      params: { username: "{{farcasterHandle}}", platform: "farcaster" },
      condition: (ctx) => !!ctx.memory.get("farcasterHandle")
    }
  ],
  onError: "continue"
};
var researchWorkflows = {
  "project-due-diligence": projectDueDiligenceWorkflow,
  "nft-collection-analysis": nftCollectionAnalysisWorkflow,
  "dao-governance-analysis": daoGovernanceWorkflow,
  "influencer-tracking": influencerTrackingWorkflow
};

// src/workflows/portfolio.ts
var rebalancePortfolioWorkflow = {
  id: "rebalance-portfolio",
  name: "Portfolio Rebalance",
  description: "Analyze and suggest portfolio rebalancing",
  steps: [
    {
      id: "get-current-holdings",
      agentId: "wallet",
      action: "get_all_balances",
      params: { address: "{{wallet}}" }
    },
    {
      id: "get-token-prices",
      agentId: "defi",
      action: "get_multiple_prices",
      params: { tokens: "{{tokens}}" },
      dependsOn: ["get-current-holdings"]
    },
    {
      id: "calculate-allocations",
      agentId: "custom",
      action: "calculate_allocations",
      params: { targetAllocation: "{{targetAllocation}}" },
      dependsOn: ["get-current-holdings", "get-token-prices"]
    },
    {
      id: "find-best-routes",
      agentId: "bridge",
      action: "compare_bridges",
      params: {},
      dependsOn: ["calculate-allocations"],
      condition: (ctx) => {
        const allocations = ctx.results.get("calculate-allocations");
        return allocations?.data?.needsCrossChain ?? false;
      }
    }
  ],
  onError: "stop"
};
var yieldFarmingWorkflow = {
  id: "yield-farming-analysis",
  name: "Yield Farming Analysis",
  description: "Find and analyze yield farming opportunities",
  steps: [
    {
      id: "get-trending-tokens",
      agentId: "defi",
      action: "get_boosted_tokens",
      params: {}
    },
    {
      id: "analyze-each-token",
      agentId: "defi",
      action: "get_token_overview",
      params: { token: "{{token}}" },
      dependsOn: ["get-trending-tokens"]
    },
    {
      id: "check-contract-safety",
      agentId: "audit",
      action: "analyze_contract",
      params: { address: "{{contractAddress}}" },
      dependsOn: ["analyze-each-token"]
    },
    {
      id: "calculate-apy",
      agentId: "custom",
      action: "calculate_yield",
      params: {},
      dependsOn: ["analyze-each-token"]
    }
  ],
  onError: "continue"
};
var riskAssessmentWorkflow = {
  id: "risk-assessment",
  name: "Portfolio Risk Assessment",
  description: "Comprehensive risk analysis of portfolio",
  steps: [
    {
      id: "get-holdings",
      agentId: "wallet",
      action: "get_all_balances",
      params: { address: "{{wallet}}" }
    },
    {
      id: "audit-contracts",
      agentId: "audit",
      action: "batch_analyze",
      params: { addresses: "{{tokenAddresses}}" },
      dependsOn: ["get-holdings"]
    },
    {
      id: "check-liquidity",
      agentId: "defi",
      action: "check_liquidity",
      params: { tokens: "{{tokens}}" },
      dependsOn: ["get-holdings"]
    },
    {
      id: "analyze-concentration",
      agentId: "custom",
      action: "concentration_analysis",
      params: {},
      dependsOn: ["get-holdings"]
    },
    {
      id: "generate-risk-report",
      agentId: "custom",
      action: "generate_risk_report",
      params: {},
      dependsOn: ["audit-contracts", "check-liquidity", "analyze-concentration"]
    }
  ],
  onError: "continue"
};
var dailyPortfolioUpdateWorkflow = {
  id: "daily-portfolio-update",
  name: "Daily Portfolio Update",
  description: "Daily summary of portfolio changes and market conditions",
  steps: [
    {
      id: "get-portfolio-value",
      agentId: "wallet",
      action: "get_portfolio_value",
      params: { address: "{{wallet}}" }
    },
    {
      id: "get-market-sentiment",
      agentId: "social",
      action: "analyze_sentiment",
      params: { query: "crypto market" }
    },
    {
      id: "get-active-proposals",
      agentId: "dao",
      action: "get_proposals",
      params: { daoId: "{{daoIds}}", state: "active" }
    },
    {
      id: "check-whale-activity",
      agentId: "defi",
      action: "get_boosted_tokens",
      params: {}
    },
    {
      id: "generate-daily-summary",
      agentId: "custom",
      action: "generate_summary",
      params: {},
      dependsOn: [
        "get-portfolio-value",
        "get-market-sentiment",
        "get-active-proposals",
        "check-whale-activity"
      ]
    }
  ],
  onError: "continue"
};
var portfolioWorkflows = {
  "rebalance-portfolio": rebalancePortfolioWorkflow,
  "yield-farming-analysis": yieldFarmingWorkflow,
  "risk-assessment": riskAssessmentWorkflow,
  "daily-portfolio-update": dailyPortfolioUpdateWorkflow
};

// src/orchestrator.ts
var Orchestrator = class extends BaseAgent {
  router;
  memory;
  agents = /* @__PURE__ */ new Map();
  workflows = /* @__PURE__ */ new Map();
  runningWorkflows = /* @__PURE__ */ new Map();
  orchestratorConfig;
  llmClient;
  constructor(config) {
    const validatedConfig = OrchestratorConfigSchema.parse(config);
    super("orchestrator", config);
    this.orchestratorConfig = validatedConfig;
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider ?? "openai",
        model: config.llmModel,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4096
      });
    }
    this.router = new Router(this.llmClient);
    this.memory = new SharedMemory();
    this.registerBuiltInWorkflows();
  }
  registerBuiltInWorkflows() {
    for (const [id, workflow] of Object.entries(tradingWorkflows)) {
      this.workflows.set(id, workflow);
    }
    for (const [id, workflow] of Object.entries(researchWorkflows)) {
      this.workflows.set(id, workflow);
    }
    for (const [id, workflow] of Object.entries(portfolioWorkflows)) {
      this.workflows.set(id, workflow);
    }
  }
  getSystemPrompt() {
    const agents = Array.from(this.agents.values()).map((a) => `- ${a.name} (${a.type}): ${a.description}`).join("\n");
    const workflows = Array.from(this.workflows.values()).map((w) => `- ${w.name}: ${w.description}`).join("\n");
    return `You are an orchestrator for a multi-agent Web3 platform.

Available Agents:
${agents || "No agents registered"}

Available Workflows:
${workflows}

You can:
1. Route requests to appropriate agents
2. Execute multi-step workflows
3. Coordinate parallel agent execution
4. Maintain shared context between agents

When given a request:
1. Determine if it's a simple single-agent task or requires a workflow
2. For simple tasks, route to the appropriate agent
3. For complex tasks, select or create an appropriate workflow
4. Provide clear status updates and results`;
  }
  async analyze(context) {
    const input = context.userQuery ?? "";
    const workflowMatch = this.matchWorkflow(input);
    if (workflowMatch) {
      const result = await this.executeWorkflow(workflowMatch.workflow, workflowMatch.params);
      return this.createResult(
        result.success,
        { workflow: result },
        result.errors.length > 0 ? result.errors[0]?.error : void 0,
        result.success ? 0.9 : 0.3,
        `Workflow ${result.workflowId} completed`
      );
    }
    const routing = await this.router.route(input);
    if (!routing) {
      return this.createResult(
        false,
        null,
        "Unable to determine how to handle this request",
        0.2,
        "No suitable routing found"
      );
    }
    const agent = this.agents.get(routing.agentId);
    if (!agent) {
      return this.createResult(
        false,
        { routing },
        `Agent ${routing.agentId} not found`,
        0.3,
        "Agent not registered"
      );
    }
    try {
      const result = await agent.agent.analyze(context);
      return this.createResult(
        result.success,
        { agentResult: result, routing },
        result.error,
        result.confidence ?? 0.8,
        `Routed to ${agent.name}`
      );
    } catch (error) {
      return this.createResult(
        false,
        { routing },
        `Error executing agent: ${error}`,
        0,
        "Agent execution failed"
      );
    }
  }
  matchWorkflow(input) {
    const lowerInput = input.toLowerCase();
    const workflowKeywords = {
      "research-token": ["research", "analyze token", "due diligence", "investigate"],
      "swap-token": ["swap", "trade", "exchange"],
      "bridge-tokens": ["bridge", "cross-chain", "transfer to"],
      "analyze-portfolio": ["portfolio", "holdings", "my tokens"],
      "nft-collection-analysis": ["nft collection", "analyze nft", "floor price"],
      "dao-governance-analysis": ["dao", "proposal", "governance"],
      "risk-assessment": ["risk", "security assessment", "audit portfolio"]
    };
    for (const [workflowId, keywords] of Object.entries(workflowKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          const workflow = this.workflows.get(workflowId);
          if (workflow) {
            const params = this.extractWorkflowParams(input);
            return { workflow, params };
          }
        }
      }
    }
    return null;
  }
  extractWorkflowParams(input) {
    const params = {};
    const ethAddress = input.match(/0x[a-fA-F0-9]{40}/);
    if (ethAddress) {
      params.contractAddress = ethAddress[0];
      params.wallet = ethAddress[0];
    }
    const token = input.match(/\$([A-Z]{2,10})/);
    if (token) {
      params.token = token[1];
    }
    const quoted = input.match(/"([^"]+)"/);
    if (quoted) {
      params.projectName = quoted[1];
      params.collectionName = quoted[1];
    }
    return params;
  }
  registerAgent(id, type, name, description, capabilities, agent) {
    const registered = {
      id,
      type,
      name,
      description,
      capabilities,
      agent
    };
    this.agents.set(id, registered);
    this.router.registerAgent(registered);
  }
  unregisterAgent(id) {
    this.agents.delete(id);
    this.router.unregisterAgent(id);
  }
  registerWorkflow(workflow) {
    this.workflows.set(workflow.id, workflow);
  }
  async executeWorkflow(workflow, params) {
    const context = {
      workflowId: workflow.id,
      startTime: /* @__PURE__ */ new Date(),
      results: /* @__PURE__ */ new Map(),
      memory: new Map(Object.entries(params)),
      errors: []
    };
    this.runningWorkflows.set(workflow.id, context);
    const startTime = Date.now();
    const stepResults = [];
    try {
      const executionOrder = this.buildExecutionOrder(workflow.steps);
      for (const batch of executionOrder) {
        const batchResults = await Promise.all(
          batch.map((step) => this.executeStep(step, context, params))
        );
        stepResults.push(...batchResults);
        const failures = batchResults.filter((r) => !r.success);
        if (failures.length > 0 && workflow.onError === "stop") {
          break;
        }
      }
      const success = context.errors.length === 0 || stepResults.every((r) => r.success);
      return {
        workflowId: workflow.id,
        success,
        duration: Date.now() - startTime,
        steps: stepResults,
        errors: context.errors,
        output: this.aggregateResults(context)
      };
    } finally {
      this.runningWorkflows.delete(workflow.id);
    }
  }
  buildExecutionOrder(steps) {
    const batches = [];
    const completed = /* @__PURE__ */ new Set();
    const remaining = [...steps];
    while (remaining.length > 0) {
      const batch = [];
      for (let i = remaining.length - 1; i >= 0; i--) {
        const step = remaining[i];
        const deps = step.dependsOn ?? [];
        const depsCompleted = deps.every((d) => completed.has(d));
        if (depsCompleted) {
          batch.push(step);
          remaining.splice(i, 1);
        }
      }
      if (batch.length === 0 && remaining.length > 0) {
        this.log("Workflow has unresolvable dependencies");
        break;
      }
      if (batch.length > 0) {
        batches.push(batch);
        batch.forEach((s) => completed.add(s.id));
      }
    }
    return batches;
  }
  async executeStep(step, context, params) {
    const startTime = Date.now();
    if (step.condition && !step.condition(context)) {
      return {
        stepId: step.id,
        agentId: step.agentId,
        success: true,
        data: { skipped: true },
        duration: 0,
        timestamp: /* @__PURE__ */ new Date()
      };
    }
    const agent = this.agents.get(step.agentId);
    if (!agent) {
      const result = {
        stepId: step.id,
        agentId: step.agentId,
        success: false,
        error: `Agent ${step.agentId} not found`,
        duration: Date.now() - startTime,
        timestamp: /* @__PURE__ */ new Date()
      };
      context.errors.push({
        stepId: step.id,
        error: result.error,
        timestamp: /* @__PURE__ */ new Date(),
        recovered: false
      });
      return result;
    }
    try {
      const resolvedParams = this.resolveParams(step.params, params, context);
      const agentContext = {
        chain: "evm",
        network: "mainnet",
        userQuery: `${step.action}: ${JSON.stringify(resolvedParams)}`
      };
      const data = await agent.agent.analyze(agentContext);
      const result = {
        stepId: step.id,
        agentId: step.agentId,
        success: data.success,
        data: data.data,
        duration: Date.now() - startTime,
        timestamp: /* @__PURE__ */ new Date()
      };
      context.results.set(step.id, result);
      return result;
    } catch (error) {
      const result = {
        stepId: step.id,
        agentId: step.agentId,
        success: false,
        error: String(error),
        duration: Date.now() - startTime,
        timestamp: /* @__PURE__ */ new Date()
      };
      context.results.set(step.id, result);
      context.errors.push({
        stepId: step.id,
        error: result.error,
        timestamp: /* @__PURE__ */ new Date(),
        recovered: false
      });
      return result;
    }
  }
  resolveParams(stepParams, workflowParams, context) {
    const resolved = {};
    for (const [key, value] of Object.entries(stepParams)) {
      if (typeof value === "string" && value.startsWith("{{") && value.endsWith("}}")) {
        const paramKey = value.slice(2, -2);
        resolved[key] = workflowParams[paramKey] ?? context.memory.get(paramKey);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }
  aggregateResults(context) {
    const output = {};
    for (const [stepId, result] of context.results) {
      if (result.success && result.data) {
        output[stepId] = result.data;
      }
    }
    return output;
  }
  getMemory() {
    return this.memory;
  }
  getRegisteredAgents() {
    return Array.from(this.agents.values());
  }
  getWorkflows() {
    return Array.from(this.workflows.values());
  }
  getRunningWorkflows() {
    return Array.from(this.runningWorkflows.keys());
  }
};
export {
  Orchestrator,
  OrchestratorConfigSchema,
  Router,
  SharedMemory,
  portfolioWorkflows,
  researchWorkflows,
  tradingWorkflows
};
//# sourceMappingURL=index.js.map