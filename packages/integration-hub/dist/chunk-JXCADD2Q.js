// src/execution/agent-executor.ts
import { EventEmitter } from "eventemitter3";

// src/execution/tool-registry.ts
import { z } from "zod";
var ToolRegistry = class {
  tools = /* @__PURE__ */ new Map();
  initialized = false;
  /**
   * Register all available tools
   */
  initialize() {
    if (this.initialized) return;
    this.register({
      id: "hunter-agent",
      name: "Hunter Agent",
      description: "Discover opportunities from multiple sources (GitHub, Twitter, HN, etc.)",
      category: "research",
      package: "@gicm/hunter-agent",
      agentClass: "HunterAgent",
      defaultConfig: {
        sources: [
          { source: "github", enabled: true },
          { source: "hackernews", enabled: true }
        ]
      },
      inputSchema: z.object({
        sources: z.array(z.string()).optional(),
        action: z.enum(["hunt", "status"]).default("hunt")
      }),
      estimatedCost: 2e-3,
      estimatedTokens: 500
    });
    this.register({
      id: "github-hunter",
      name: "GitHub Hunter",
      description: "Discover trending repositories and projects on GitHub",
      category: "research",
      package: "@gicm/hunter-agent",
      agentClass: "GitHubHunter",
      defaultConfig: {
        source: "github",
        enabled: true
      },
      inputSchema: z.object({
        language: z.string().optional(),
        since: z.enum(["daily", "weekly", "monthly"]).optional()
      }),
      estimatedCost: 1e-3,
      estimatedTokens: 200
    });
    this.register({
      id: "twitter-hunter",
      name: "Twitter Hunter",
      description: "Monitor Twitter for crypto/AI discussions and trends",
      category: "social",
      package: "@gicm/hunter-agent",
      agentClass: "TwitterHunter",
      defaultConfig: {
        source: "twitter",
        enabled: true
      },
      inputSchema: z.object({
        query: z.string().optional(),
        accounts: z.array(z.string()).optional()
      }),
      estimatedCost: 1e-3,
      estimatedTokens: 300,
      requiresApiKey: ["TWITTER_BEARER_TOKEN"]
    });
    this.register({
      id: "wallet-agent",
      name: "Wallet Agent",
      description: "Check wallet balances and manage token accounts",
      category: "wallet",
      package: "@gicm/wallet-agent",
      agentClass: "SolanaWallet",
      defaultConfig: {},
      inputSchema: z.object({
        action: z.enum(["balance", "tokens", "history"]).default("balance"),
        address: z.string().optional()
      }),
      estimatedCost: 0,
      estimatedTokens: 100,
      requiresApiKey: ["SOLANA_RPC_URL"]
    });
    this.register({
      id: "token-balance",
      name: "Token Balance",
      description: "Get token balances for a Solana wallet",
      category: "wallet",
      package: "@gicm/wallet-agent",
      agentClass: "SolanaWallet",
      defaultConfig: {},
      inputSchema: z.object({
        address: z.string(),
        mint: z.string().optional()
      }),
      estimatedCost: 0,
      estimatedTokens: 50
    });
    this.register({
      id: "defi-agent",
      name: "DeFi Agent",
      description: "Analyze DeFi protocols, yields, and opportunities",
      category: "defi",
      package: "@gicm/defi-agent",
      agentClass: "DeFiAgent",
      defaultConfig: {},
      inputSchema: z.object({
        protocol: z.string().optional(),
        chain: z.string().default("solana"),
        action: z.enum(["analyze", "yields", "tvl"]).default("analyze")
      }),
      estimatedCost: 3e-3,
      estimatedTokens: 800
    });
    this.register({
      id: "audit-agent",
      name: "Audit Agent",
      description: "Security audit for smart contracts",
      category: "security",
      package: "@gicm/audit-agent",
      agentClass: "AuditAgent",
      defaultConfig: {},
      inputSchema: z.object({
        contract: z.string(),
        chain: z.string().default("solana"),
        depth: z.enum(["quick", "standard", "deep"]).default("standard")
      }),
      estimatedCost: 0.01,
      estimatedTokens: 2e3
    });
    this.register({
      id: "decision-agent",
      name: "Decision Agent",
      description: "Make trading decisions based on analysis",
      category: "trading",
      package: "@gicm/decision-agent",
      agentClass: "DecisionAgent",
      defaultConfig: {},
      inputSchema: z.object({
        analysis: z.unknown(),
        riskTolerance: z.enum(["low", "medium", "high"]).default("medium"),
        portfolio: z.unknown().optional()
      }),
      estimatedCost: 5e-3,
      estimatedTokens: 1e3
    });
    this.register({
      id: "social-agent",
      name: "Social Agent",
      description: "Social media automation and content scheduling",
      category: "social",
      package: "@gicm/social-agent",
      agentClass: "SocialAgent",
      defaultConfig: {},
      inputSchema: z.object({
        platform: z.enum(["twitter", "discord", "telegram"]),
        action: z.enum(["post", "schedule", "analyze"]),
        content: z.string().optional()
      }),
      estimatedCost: 2e-3,
      estimatedTokens: 400
    });
    this.register({
      id: "blog-generator",
      name: "Blog Generator",
      description: "Generate SEO-optimized blog posts",
      category: "content",
      package: "@gicm/growth-engine",
      agentClass: "BlogGenerator",
      defaultConfig: {},
      inputSchema: z.object({
        topic: z.string(),
        keywords: z.array(z.string()).optional(),
        length: z.enum(["short", "medium", "long"]).default("medium")
      }),
      estimatedCost: 0.02,
      estimatedTokens: 4e3
    });
    this.register({
      id: "tweet-generator",
      name: "Tweet Generator",
      description: "Generate engaging tweets from content",
      category: "content",
      package: "@gicm/growth-engine",
      agentClass: "TweetGenerator",
      defaultConfig: {},
      inputSchema: z.object({
        content: z.string(),
        style: z.enum(["informative", "engaging", "promotional"]).default("engaging"),
        count: z.number().default(5)
      }),
      estimatedCost: 5e-3,
      estimatedTokens: 800
    });
    this.register({
      id: "seo-researcher",
      name: "SEO Researcher",
      description: "Research keywords and SEO opportunities",
      category: "content",
      package: "@gicm/growth-engine",
      agentClass: "KeywordResearcher",
      defaultConfig: {},
      inputSchema: z.object({
        topic: z.string(),
        competitors: z.array(z.string()).optional()
      }),
      estimatedCost: 3e-3,
      estimatedTokens: 600
    });
    this.register({
      id: "sentiment-analyzer",
      name: "Sentiment Analyzer",
      description: "Analyze sentiment from social data",
      category: "analytics",
      package: "@gicm/hunter-agent",
      agentClass: "SentimentAnalyzer",
      defaultConfig: {},
      inputSchema: z.object({
        data: z.unknown(),
        source: z.string().optional()
      }),
      estimatedCost: 2e-3,
      estimatedTokens: 500
    });
    this.register({
      id: "price-oracle",
      name: "Price Oracle",
      description: "Get real-time token prices from multiple sources",
      category: "trading",
      package: "@gicm/defi-agent",
      agentClass: "PriceOracle",
      defaultConfig: {},
      inputSchema: z.object({
        token: z.string(),
        chain: z.string().default("solana")
      }),
      estimatedCost: 0,
      estimatedTokens: 50
    });
    this.register({
      id: "report-generator",
      name: "Report Generator",
      description: "Generate comprehensive analysis reports",
      category: "analytics",
      package: "@gicm/agent-core",
      agentClass: "ReportGenerator",
      defaultConfig: {},
      inputSchema: z.object({
        data: z.unknown(),
        format: z.enum(["markdown", "json", "html"]).default("markdown"),
        sections: z.array(z.string()).optional()
      }),
      estimatedCost: 0.01,
      estimatedTokens: 2e3
    });
    this.register({
      id: "commit-agent",
      name: "Commit Agent",
      description: "AI-powered git commit message generation with full workflow automation (stage, commit, push, PR)",
      category: "content",
      package: "@gicm/commit-agent",
      agentClass: "CommitAgent",
      defaultConfig: {
        conventionalCommits: true,
        includeCoAuthors: true
      },
      inputSchema: z.object({
        action: z.enum(["status", "generate", "commit", "push", "create_pr", "full"]).default("status"),
        all: z.boolean().optional(),
        message: z.string().optional(),
        push: z.boolean().optional(),
        createPr: z.boolean().optional(),
        dryRun: z.boolean().optional(),
        amend: z.boolean().optional()
      }),
      estimatedCost: 5e-3,
      estimatedTokens: 1e3,
      requiresApiKey: ["ANTHROPIC_API_KEY"]
    });
    this.initialized = true;
  }
  /**
   * Register a tool
   */
  register(tool) {
    this.tools.set(tool.id, tool);
  }
  /**
   * Get a tool by ID
   */
  get(id) {
    this.initialize();
    return this.tools.get(id);
  }
  /**
   * Get all tools
   */
  getAll() {
    this.initialize();
    return Array.from(this.tools.values());
  }
  /**
   * Get tools by category
   */
  getByCategory(category) {
    this.initialize();
    return this.getAll().filter((t) => t.category === category);
  }
  /**
   * Search tools by name or description
   */
  search(query) {
    this.initialize();
    const lower = query.toLowerCase();
    return this.getAll().filter(
      (t) => t.name.toLowerCase().includes(lower) || t.description.toLowerCase().includes(lower) || t.id.toLowerCase().includes(lower)
    );
  }
  /**
   * Check if a tool exists
   */
  has(id) {
    this.initialize();
    return this.tools.has(id);
  }
  /**
   * Validate inputs for a tool
   */
  validateInputs(toolId, inputs) {
    const tool = this.get(toolId);
    if (!tool) {
      return { valid: false, error: `Tool not found: ${toolId}` };
    }
    try {
      tool.inputSchema.parse(inputs);
      return { valid: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Validation failed";
      return { valid: false, error: message };
    }
  }
  /**
   * Get estimated cost for executing a tool
   */
  getEstimatedCost(toolId) {
    const tool = this.get(toolId);
    if (!tool) {
      return { cost: 0.01, tokens: 500 };
    }
    return {
      cost: tool.estimatedCost,
      tokens: tool.estimatedTokens
    };
  }
  /**
   * Check if required API keys are available
   */
  checkRequirements(toolId) {
    const tool = this.get(toolId);
    if (!tool || !tool.requiresApiKey) {
      return { ready: true, missing: [] };
    }
    const missing = tool.requiresApiKey.filter((key) => !process.env[key]);
    return {
      ready: missing.length === 0,
      missing
    };
  }
};
var toolRegistry = new ToolRegistry();
function getToolRegistry() {
  return toolRegistry;
}

// src/execution/agent-executor.ts
var agentCache = /* @__PURE__ */ new Map();
var AgentExecutor = class extends EventEmitter {
  config;
  totalTokens = 0;
  totalCost = 0;
  constructor(config = {}) {
    super();
    this.config = {
      timeout: config.timeout ?? 3e4,
      retries: config.retries ?? 0,
      verbose: config.verbose ?? false,
      mockMode: config.mockMode ?? false
    };
  }
  /**
   * Execute a tool with given inputs
   */
  async execute(toolId, inputs, context) {
    const startTime = Date.now();
    this.emit("execution:start", context, toolId);
    const tool = toolRegistry.get(toolId);
    if (!tool) {
      const error = new Error(`Tool not found: ${toolId}`);
      this.emit("execution:error", context, error);
      return {
        success: false,
        data: null,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
    const validation = toolRegistry.validateInputs(toolId, inputs);
    if (!validation.valid) {
      const error = new Error(`Invalid inputs: ${validation.error}`);
      this.emit("execution:error", context, error);
      return {
        success: false,
        data: null,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
    const requirements = toolRegistry.checkRequirements(toolId);
    if (!requirements.ready && !this.config.mockMode) {
      const error = new Error(`Missing required API keys: ${requirements.missing.join(", ")}`);
      this.emit("execution:error", context, error);
      return {
        success: false,
        data: null,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
    if (this.config.mockMode) {
      return this.executeMock(tool.id, inputs, context, startTime);
    }
    let lastError = null;
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      if (attempt > 0) {
        this.emit("execution:retry", context, attempt);
        await this.delay(1e3 * attempt);
      }
      try {
        const result = await this.executeReal(tool.id, tool.package, tool.agentClass, inputs, context);
        result.duration = Date.now() - startTime;
        this.totalTokens += result.tokensUsed ?? 0;
        this.totalCost += result.cost ?? 0;
        this.emit("execution:complete", context, result);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.log(`Attempt ${attempt + 1} failed: ${lastError.message}`);
      }
    }
    this.emit("execution:error", context, lastError);
    return {
      success: false,
      data: null,
      error: lastError.message,
      duration: Date.now() - startTime
    };
  }
  /**
   * Execute a real agent
   */
  async executeReal(toolId, packageName, agentClass, inputs, context) {
    const estimates = toolRegistry.getEstimatedCost(toolId);
    try {
      const agentModule = await this.loadAgentModule(packageName);
      const AgentClass = agentModule[agentClass];
      if (!AgentClass || typeof AgentClass !== "function") {
        throw new Error(`Agent class ${agentClass} not found in ${packageName}`);
      }
      const tool = toolRegistry.get(toolId);
      const config = {
        ...tool?.defaultConfig ?? {},
        verbose: this.config.verbose
      };
      const agent = new AgentClass(config);
      const result = await this.withTimeout(
        agent.analyze({
          action: inputs.action ?? "analyze",
          params: inputs
        }),
        this.config.timeout
      );
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        tokensUsed: estimates.tokens,
        cost: estimates.cost
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to execute ${toolId}: ${message}`);
    }
  }
  /**
   * Execute with mock data (for testing/demo)
   */
  async executeMock(toolId, inputs, _context, startTime) {
    await this.delay(500 + Math.random() * 1e3);
    const estimates = toolRegistry.getEstimatedCost(toolId);
    const mockData = this.generateMockOutput(toolId, inputs);
    this.totalTokens += estimates.tokens;
    this.totalCost += estimates.cost;
    return {
      success: true,
      data: mockData,
      tokensUsed: estimates.tokens,
      cost: estimates.cost,
      duration: Date.now() - startTime
    };
  }
  /**
   * Generate mock output based on tool type
   */
  generateMockOutput(toolId, inputs) {
    const tool = toolRegistry.get(toolId);
    const category = tool?.category ?? "analytics";
    switch (category) {
      case "research":
        return {
          discoveries: [
            {
              title: "Trending: AI Agent Framework",
              source: "github",
              url: "https://github.com/example/ai-agents",
              score: 85,
              relevance: "high"
            },
            {
              title: "New DeFi Protocol Launch",
              source: "twitter",
              url: "https://twitter.com/example/status/123",
              score: 72,
              relevance: "medium"
            }
          ],
          count: 2,
          timestamp: Date.now()
        };
      case "trading":
        return {
          recommendation: "BUY",
          confidence: 0.75,
          analysis: {
            technical: { trend: "bullish", rsi: 45, macd: "positive" },
            fundamental: { tvl: "increasing", users: "growing" },
            sentiment: { score: 0.68, volume: "high" }
          },
          entry: { price: 150.5, size: 0.1 },
          exit: { takeProfit: 165, stopLoss: 142 }
        };
      case "wallet":
        return {
          balance: {
            sol: 12.5,
            usdc: 1500,
            tokens: [
              { mint: "So11111111111111111111111111111111111111112", symbol: "SOL", amount: 12.5 },
              { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", amount: 1500 }
            ]
          },
          address: inputs.address ?? "7xKX..."
        };
      case "security":
        return {
          riskScore: 25,
          riskLevel: "low",
          findings: [
            { severity: "info", title: "No reentrancy detected", description: "Contract is safe from reentrancy" },
            { severity: "warning", title: "Centralized ownership", description: "Single owner has admin rights" }
          ],
          passed: true,
          auditedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      case "content":
        return {
          content: `# ${inputs.topic ?? "AI Agents in Crypto"}

Exploring the intersection of artificial intelligence and blockchain technology...`,
          wordCount: 850,
          readTime: "4 min",
          seoScore: 82,
          keywords: ["AI", "crypto", "blockchain", "agents"]
        };
      case "defi":
        return {
          protocol: inputs.protocol ?? "Jupiter",
          tvl: 45e7,
          tvlChange24h: 5.2,
          apy: 12.5,
          pools: [
            { name: "SOL-USDC", tvl: 12e7, apy: 8.5 },
            { name: "JUP-SOL", tvl: 45e6, apy: 22.3 }
          ]
        };
      case "analytics":
        return {
          summary: "Analysis complete",
          metrics: {
            total: 15,
            positive: 10,
            negative: 3,
            neutral: 2
          },
          sentiment: 0.67,
          trend: "bullish",
          confidence: 0.82
        };
      default:
        return {
          status: "completed",
          result: "Mock execution successful",
          inputs,
          timestamp: Date.now()
        };
    }
  }
  /**
   * Load agent module with caching
   */
  async loadAgentModule(packageName) {
    if (agentCache.has(packageName)) {
      return agentCache.get(packageName);
    }
    try {
      const module = await import(packageName);
      agentCache.set(packageName, module);
      return module;
    } catch (err) {
      throw new Error(`Failed to load package ${packageName}: ${err}`);
    }
  }
  /**
   * Execute with timeout
   */
  async withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error(`Execution timeout after ${ms}ms`)), ms)
      )
    ]);
  }
  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Log helper
   */
  log(message) {
    if (this.config.verbose) {
      console.log(`[AgentExecutor] ${message}`);
    }
  }
  /**
   * Get execution statistics
   */
  getStats() {
    return {
      totalTokens: this.totalTokens,
      totalCost: this.totalCost
    };
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.totalTokens = 0;
    this.totalCost = 0;
  }
};
function createAgentExecutor(config) {
  return new AgentExecutor(config);
}
var defaultExecutor = null;
function getAgentExecutor() {
  if (!defaultExecutor) {
    defaultExecutor = new AgentExecutor({ mockMode: true });
  }
  return defaultExecutor;
}

export {
  toolRegistry,
  getToolRegistry,
  AgentExecutor,
  createAgentExecutor,
  getAgentExecutor
};
//# sourceMappingURL=chunk-JXCADD2Q.js.map