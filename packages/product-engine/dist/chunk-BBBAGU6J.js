// src/index.ts
import { CronJob as CronJob2 } from "cron";

// src/discovery/index.ts
import { CronJob } from "cron";

// src/discovery/sources/competitors.ts
import axios from "axios";
import * as cheerio from "cheerio";

// src/utils/llm.ts
import Anthropic from "@anthropic-ai/sdk";
var anthropicClient = null;
function getAnthropicClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic();
  }
  return anthropicClient;
}
async function generateText(options) {
  const client = getAnthropicClient();
  const messages = [
    { role: "user", content: options.prompt }
  ];
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: options.maxTokens || 4e3,
    system: options.systemPrompt,
    messages
  });
  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }
  return content.text;
}
async function generateJSON(options) {
  const text = await generateText({
    ...options,
    prompt: `${options.prompt}

Respond with valid JSON only, no other text.`
  });
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) {
    throw new Error("No JSON found in response");
  }
  return JSON.parse(match[0]);
}

// src/utils/logger.ts
import pino from "pino";
var Logger = class {
  pino;
  context;
  constructor(context) {
    this.context = context;
    this.pino = pino({
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard"
        }
      }
    });
  }
  info(message, data) {
    this.pino.info({ context: this.context, ...data }, message);
  }
  warn(message, data) {
    this.pino.warn({ context: this.context, ...data }, message);
  }
  error(message, data) {
    this.pino.error({ context: this.context, ...data }, message);
  }
  debug(message, data) {
    this.pino.debug({ context: this.context, ...data }, message);
  }
};

// src/discovery/sources/competitors.ts
var COMPETITORS = [
  { name: "Cursor", url: "https://cursor.com", changelog: "https://changelog.cursor.com" },
  { name: "Replit", url: "https://replit.com", changelog: "https://blog.replit.com" },
  { name: "v0", url: "https://v0.dev", changelog: "https://v0.dev" },
  { name: "Bolt", url: "https://bolt.new", changelog: "https://bolt.new" },
  { name: "Lovable", url: "https://lovable.dev", changelog: "https://lovable.dev" }
];
var CompetitorDiscovery = class {
  logger;
  knownFeatures = /* @__PURE__ */ new Map();
  constructor() {
    this.logger = new Logger("CompetitorDiscovery");
  }
  /**
   * Discover competitor features
   */
  async discover() {
    this.logger.info("Scanning competitors...");
    const opportunities = [];
    for (const competitor of COMPETITORS) {
      try {
        const features = await this.scanCompetitor(competitor);
        for (const feature of features) {
          if (feature.weHaveIt) continue;
          const key = `${competitor.name}-${feature.feature}`;
          if (this.knownFeatures.has(key)) continue;
          this.knownFeatures.set(key, feature);
          if (feature.priority !== "ignore") {
            const opp = this.featureToOpportunity(feature);
            opportunities.push(opp);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to scan ${competitor.name}: ${error}`);
      }
    }
    this.logger.info(`Found ${opportunities.length} competitor features to consider`);
    return opportunities;
  }
  /**
   * Scan a single competitor
   */
  async scanCompetitor(competitor) {
    let content = "";
    try {
      const response = await axios.get(competitor.changelog, {
        timeout: 1e4,
        headers: { "User-Agent": "gICM-ProductEngine/1.0" }
      });
      const $ = cheerio.load(response.data);
      content = $("body").text().slice(0, 5e3);
    } catch {
      try {
        const response = await axios.get(competitor.url, {
          timeout: 1e4,
          headers: { "User-Agent": "gICM-ProductEngine/1.0" }
        });
        const $ = cheerio.load(response.data);
        content = $("body").text().slice(0, 5e3);
      } catch {
        return [];
      }
    }
    try {
      const features = await generateJSON({
        prompt: `Analyze this content from ${competitor.name} (an AI coding tool competitor to gICM).

Content:
${content}

gICM is an AI-powered development platform with:
- AI agents for trading, research, content
- React component library
- Solana/Web3 focus
- Context engine for codebase understanding

Extract any notable features or capabilities. For each:
1. Feature name
2. Brief description
3. Does gICM likely have this? (yes/no)
4. Priority for gICM to build (must_have/nice_to_have/ignore)

Return as JSON array:
[
  {
    "feature": "feature name",
    "description": "what it does",
    "weHaveIt": false,
    "priority": "must_have"
  }
]

Only include genuine product features, not marketing fluff.`
      });
      return features.map((f) => ({
        competitor: competitor.name,
        feature: f.feature,
        description: f.description,
        weHaveIt: f.weHaveIt,
        priority: f.priority,
        userReception: "neutral"
      }));
    } catch (error) {
      this.logger.error(`LLM analysis failed: ${error}`);
      return [];
    }
  }
  /**
   * Convert feature to opportunity
   */
  featureToOpportunity(feature) {
    return {
      id: `opp-comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: "competitor",
      sourceUrl: COMPETITORS.find((c) => c.name === feature.competitor)?.url,
      type: "new_feature",
      title: `Add ${feature.feature} (from ${feature.competitor})`,
      description: feature.description,
      scores: {
        userDemand: feature.priority === "must_have" ? 80 : 50,
        competitiveValue: 85,
        technicalFit: 70,
        effort: 60,
        impact: feature.priority === "must_have" ? 80 : 50,
        overall: 0
      },
      analysis: {
        whatItDoes: feature.description,
        whyItMatters: `${feature.competitor} has this feature. Users may expect it.`,
        howToBuild: "Analyze competitor implementation and build gICM version",
        risks: ["May not fit gICM's focus", "Effort may be higher than estimated"],
        dependencies: [],
        estimatedEffort: "1-2 weeks"
      },
      status: "discovered",
      priority: feature.priority === "must_have" ? "high" : "medium",
      discoveredAt: Date.now()
    };
  }
};

// src/discovery/sources/github.ts
import axios2 from "axios";
var GitHubDiscovery = class {
  logger;
  seenRepos = /* @__PURE__ */ new Set();
  constructor() {
    this.logger = new Logger("GitHubDiscovery");
  }
  /**
   * Discover opportunities from GitHub
   */
  async discover() {
    this.logger.info("Scanning GitHub trends...");
    const opportunities = [];
    const queries = [
      "ai coding assistant",
      "claude code",
      "llm developer tools",
      "solana typescript",
      "react component library",
      "vibe coding"
    ];
    for (const query of queries) {
      try {
        const repos = await this.searchRepos(query);
        for (const repo of repos) {
          if (this.seenRepos.has(repo.full_name)) continue;
          this.seenRepos.add(repo.full_name);
          const opp = await this.analyzeRepo(repo);
          if (opp) {
            opportunities.push(opp);
          }
        }
      } catch (error) {
        this.logger.error(`GitHub search failed for "${query}": ${error}`);
      }
    }
    this.logger.info(`Found ${opportunities.length} GitHub opportunities`);
    return opportunities;
  }
  /**
   * Search GitHub repos
   */
  async searchRepos(query) {
    const token = process.env.GITHUB_TOKEN;
    const headers = {
      Accept: "application/vnd.github.v3+json"
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await axios2.get("https://api.github.com/search/repositories", {
      params: {
        q: query,
        sort: "stars",
        order: "desc",
        per_page: 10
      },
      headers,
      timeout: 1e4
    });
    return response.data.items || [];
  }
  /**
   * Analyze if a repo represents an opportunity
   */
  async analyzeRepo(repo) {
    if (repo.stargazers_count < 100) return null;
    try {
      const analysis = await generateJSON({
        prompt: `Analyze this GitHub repo for gICM opportunities:

Repo: ${repo.full_name}
Description: ${repo.description || "No description"}
Stars: ${repo.stargazers_count}
Language: ${repo.language}
Topics: ${repo.topics?.join(", ") || "None"}
URL: ${repo.html_url}

gICM is an AI-powered development platform with:
- AI agents for trading, research, content
- React component library
- Solana/Web3 focus

Could we integrate this, learn from it, or build something similar?

Return JSON:
{
  "isRelevant": true/false,
  "opportunityType": "new_agent" | "new_component" | "new_feature" | "integration" | null,
  "title": "<opportunity title if relevant>",
  "description": "<what we could build/learn>",
  "priority": "high" | "medium" | "low"
}`
      });
      if (!analysis.isRelevant || !analysis.opportunityType) {
        return null;
      }
      return {
        id: `opp-gh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: "github",
        sourceUrl: repo.html_url,
        type: analysis.opportunityType,
        title: analysis.title,
        description: analysis.description,
        scores: {
          userDemand: 60,
          competitiveValue: 70,
          technicalFit: 75,
          effort: 60,
          impact: 65,
          overall: 0
        },
        analysis: {
          whatItDoes: repo.description || analysis.description,
          whyItMatters: `Trending on GitHub with ${repo.stargazers_count} stars`,
          howToBuild: "Study the repo and implement gICM version",
          risks: ["May require significant effort", "License compatibility"],
          dependencies: [],
          estimatedEffort: "1-2 weeks"
        },
        status: "discovered",
        priority: analysis.priority,
        discoveredAt: Date.now()
      };
    } catch {
      return null;
    }
  }
};

// src/discovery/sources/hackernews.ts
import axios3 from "axios";
var HackerNewsDiscovery = class {
  logger;
  seenItems = /* @__PURE__ */ new Set();
  constructor() {
    this.logger = new Logger("HackerNewsDiscovery");
  }
  /**
   * Discover opportunities from Hacker News
   */
  async discover() {
    this.logger.info("Scanning Hacker News...");
    const opportunities = [];
    try {
      const topStories = await this.getTopStories();
      for (const story of topStories) {
        if (this.seenItems.has(story.id)) continue;
        this.seenItems.add(story.id);
        const opp = await this.analyzeStory(story);
        if (opp) {
          opportunities.push(opp);
        }
      }
    } catch (error) {
      this.logger.error(`HN discovery failed: ${error}`);
    }
    this.logger.info(`Found ${opportunities.length} HN opportunities`);
    return opportunities;
  }
  /**
   * Get top stories from HN
   */
  async getTopStories() {
    const response = await axios3.get("https://hacker-news.firebaseio.com/v0/topstories.json", {
      timeout: 1e4
    });
    const storyIds = response.data.slice(0, 30);
    const stories = [];
    for (const id of storyIds) {
      try {
        const itemResponse = await axios3.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          timeout: 5e3
        });
        if (itemResponse.data && itemResponse.data.type === "story") {
          stories.push(itemResponse.data);
        }
      } catch {
      }
    }
    return stories;
  }
  /**
   * Analyze if a story represents an opportunity
   */
  async analyzeStory(story) {
    if (story.score < 50) return null;
    try {
      const analysis = await generateJSON({
        prompt: `Analyze this Hacker News story for gICM opportunities:

Title: ${story.title}
URL: ${story.url || "No URL"}
Score: ${story.score}
Comments: ${story.descendants || 0}

gICM is an AI-powered development platform with:
- AI agents for trading, research, content
- React component library
- Solana/Web3 focus
- Claude Code integration

Is this relevant? Could we build something inspired by this discussion?

Return JSON:
{
  "isRelevant": true/false,
  "opportunityType": "new_agent" | "new_component" | "new_feature" | "improvement" | null,
  "title": "<opportunity title if relevant>",
  "description": "<what we could build>",
  "priority": "high" | "medium" | "low"
}`
      });
      if (!analysis.isRelevant || !analysis.opportunityType) {
        return null;
      }
      return {
        id: `opp-hn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: "hackernews",
        sourceUrl: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        type: analysis.opportunityType,
        title: analysis.title,
        description: analysis.description,
        scores: {
          userDemand: 55,
          competitiveValue: 60,
          technicalFit: 65,
          effort: 60,
          impact: 55,
          overall: 0
        },
        analysis: {
          whatItDoes: analysis.description,
          whyItMatters: `Trending on HN with ${story.score} points`,
          howToBuild: "Research the topic and implement gICM version",
          risks: ["May be a passing trend", "Scope unclear"],
          dependencies: [],
          estimatedEffort: "1 week"
        },
        status: "discovered",
        priority: analysis.priority,
        discoveredAt: Date.now()
      };
    } catch {
      return null;
    }
  }
};

// src/discovery/evaluator.ts
var OpportunityEvaluator = class {
  logger;
  constructor() {
    this.logger = new Logger("Evaluator");
  }
  /**
   * Evaluate an opportunity
   */
  async evaluate(opportunity) {
    this.logger.info(`Evaluating: ${opportunity.title}`);
    try {
      const analysis = await generateJSON({
        prompt: `Evaluate this product opportunity for gICM (an AI-powered development platform):

Title: ${opportunity.title}
Description: ${opportunity.description}
Source: ${opportunity.source}
Type: ${opportunity.type}

gICM Context:
- AI agents for trading, research, content generation
- React component library with 100+ components
- Solana/Web3 focus
- Competes with Cursor, Replit, v0, Bolt

Score each 0-100:
- userDemand: How many users want this?
- competitiveValue: Does this differentiate us from competitors?
- technicalFit: How well does it fit our TypeScript/React/Solana stack?
- effort: How easy to build? (100 = very easy, 0 = very hard)
- impact: How much does it improve gICM?

Return JSON:
{
  "scores": { userDemand, competitiveValue, technicalFit, effort, impact },
  "analysis": {
    "whatItDoes": "<1 sentence>",
    "whyItMatters": "<1 sentence>",
    "howToBuild": "<1-2 sentences>",
    "risks": ["<risk1>", "<risk2>"],
    "dependencies": ["<dep1>"],
    "estimatedEffort": "<e.g., '1 week', '2-3 days'>"
  },
  "priority": "<critical|high|medium|low>"
}`
      });
      const { userDemand, competitiveValue, technicalFit, effort, impact } = analysis.scores;
      const overall = Math.round(
        userDemand * 0.25 + competitiveValue * 0.2 + technicalFit * 0.15 + effort * 0.15 + impact * 0.25
      );
      opportunity.scores = {
        ...analysis.scores,
        overall
      };
      opportunity.analysis = analysis.analysis;
      opportunity.priority = analysis.priority;
      opportunity.status = "evaluated";
      opportunity.evaluatedAt = Date.now();
      this.logger.info(`Evaluated: ${opportunity.title} - Score: ${overall}, Priority: ${analysis.priority}`);
      return opportunity;
    } catch (error) {
      this.logger.error(`Evaluation failed: ${error}`);
      opportunity.scores = {
        userDemand: 50,
        competitiveValue: 50,
        technicalFit: 50,
        effort: 50,
        impact: 50,
        overall: 50
      };
      opportunity.analysis = {
        whatItDoes: opportunity.description,
        whyItMatters: "Needs manual evaluation",
        howToBuild: "Needs manual planning",
        risks: ["Automated evaluation failed"],
        dependencies: [],
        estimatedEffort: "Unknown"
      };
      opportunity.priority = "medium";
      opportunity.status = "evaluated";
      opportunity.evaluatedAt = Date.now();
      return opportunity;
    }
  }
  /**
   * Re-evaluate all opportunities
   */
  async reEvaluateAll(opportunities) {
    const results = [];
    for (const opp of opportunities) {
      const evaluated = await this.evaluate(opp);
      results.push(evaluated);
    }
    return results;
  }
};

// src/discovery/index.ts
var DiscoveryManager = class {
  logger;
  evaluator;
  competitors;
  github;
  hackernews;
  opportunities = /* @__PURE__ */ new Map();
  cronJob;
  constructor() {
    this.logger = new Logger("Discovery");
    this.evaluator = new OpportunityEvaluator();
    this.competitors = new CompetitorDiscovery();
    this.github = new GitHubDiscovery();
    this.hackernews = new HackerNewsDiscovery();
  }
  /**
   * Start discovery schedule
   */
  start() {
    this.cronJob = new CronJob("0 */6 * * *", async () => {
      await this.runDiscovery();
    });
    this.cronJob.start();
    this.logger.info("Discovery manager started");
  }
  /**
   * Stop discovery
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }
  /**
   * Run full discovery cycle
   */
  async runDiscovery() {
    this.logger.info("Running discovery cycle...");
    const newOpportunities = [];
    const [compOpps, ghOpps, hnOpps] = await Promise.all([
      this.discoverFromSource("competitor"),
      this.discoverFromSource("github"),
      this.discoverFromSource("hackernews")
    ]);
    newOpportunities.push(...compOpps, ...ghOpps, ...hnOpps);
    for (const opp of newOpportunities) {
      const evaluated = await this.evaluator.evaluate(opp);
      this.opportunities.set(evaluated.id, evaluated);
    }
    const highPriority = newOpportunities.filter((o) => o.priority === "high" || o.priority === "critical");
    this.logger.info(`Discovery complete: ${newOpportunities.length} opportunities found, ${highPriority.length} high priority`);
    return newOpportunities;
  }
  /**
   * Discover from a specific source
   */
  async discoverFromSource(source) {
    try {
      switch (source) {
        case "competitor":
          return this.competitors.discover();
        case "github":
          return this.github.discover();
        case "hackernews":
          return this.hackernews.discover();
        default:
          return [];
      }
    } catch (error) {
      this.logger.error(`Discovery from ${source} failed: ${error}`);
      return [];
    }
  }
  /**
   * Get prioritized backlog
   */
  getBacklog() {
    return Array.from(this.opportunities.values()).filter((o) => o.status === "evaluated" || o.status === "approved").sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.scores.overall - a.scores.overall;
    });
  }
  /**
   * Get opportunity by ID
   */
  getOpportunity(id) {
    return this.opportunities.get(id);
  }
  /**
   * Approve opportunity for building
   */
  approveOpportunity(id) {
    const opp = this.opportunities.get(id);
    if (opp) {
      opp.status = "approved";
      opp.approvedAt = Date.now();
      this.logger.info(`Approved opportunity: ${opp.title}`);
    }
  }
  /**
   * Reject opportunity
   */
  rejectOpportunity(id, reason) {
    const opp = this.opportunities.get(id);
    if (opp) {
      opp.status = "rejected";
      opp.analysis.risks.push(`Rejected: ${reason}`);
      this.logger.info(`Rejected opportunity: ${opp.title} - ${reason}`);
    }
  }
};

// src/builder/agents/agent-builder.ts
import * as fs from "fs/promises";
import * as path from "path";

// src/builder/agents/templates.ts
var AGENT_TEMPLATES = {
  /**
   * Basic agent template
   */
  basic: {
    name: "Basic Agent",
    description: "Simple agent with LLM integration",
    files: [
      {
        path: "src/index.ts",
        content: `/**
 * {{NAME}} Agent
 *
 * {{DESCRIPTION}}
 */

import Anthropic from "@anthropic-ai/sdk";

export class {{CLASS_NAME}}Agent {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async run(input: string): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: input }],
      system: \`You are the {{NAME}} agent. {{DESCRIPTION}}\`,
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }
    return "";
  }
}

export default {{CLASS_NAME}}Agent;
`
      },
      {
        path: "src/types.ts",
        content: `/**
 * {{NAME}} Agent Types
 */

export interface {{CLASS_NAME}}Config {
  // Add configuration options here
}

export interface {{CLASS_NAME}}Result {
  success: boolean;
  data: unknown;
  error?: string;
}
`
      },
      {
        path: "package.json",
        content: `{
  "name": "@gicm/{{PACKAGE_NAME}}-agent",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsup src/index.ts --format esm --dts --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
`
      }
    ],
    dependencies: ["@anthropic-ai/sdk"],
    devDependencies: ["tsup", "typescript", "vitest"]
  },
  /**
   * Tool-using agent template
   */
  tool_agent: {
    name: "Tool Agent",
    description: "Agent with tool/function calling capability",
    files: [
      {
        path: "src/index.ts",
        content: `/**
 * {{NAME}} Agent
 *
 * {{DESCRIPTION}}
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Tool, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";

export interface AgentTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

export class {{CLASS_NAME}}Agent {
  private client: Anthropic;
  private tools: Map<string, AgentTool> = new Map();

  constructor() {
    this.client = new Anthropic();
  }

  registerTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  private getToolDefinitions(): Tool[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema as Tool["input_schema"],
    }));
  }

  async run(input: string): Promise<string> {
    const messages: Anthropic.Messages.MessageParam[] = [
      { role: "user", content: input },
    ];

    let response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      tools: this.getToolDefinitions(),
      messages,
      system: \`You are the {{NAME}} agent. {{DESCRIPTION}}\`,
    });

    // Handle tool calls
    while (response.stop_reason === "tool_use") {
      const toolUses = response.content.filter((c) => c.type === "tool_use");
      const toolResults: ToolResultBlockParam[] = [];

      for (const toolUse of toolUses) {
        if (toolUse.type !== "tool_use") continue;

        const tool = this.tools.get(toolUse.name);
        if (!tool) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: \`Unknown tool: \${toolUse.name}\`,
            is_error: true,
          });
          continue;
        }

        try {
          const result = await tool.execute(toolUse.input as Record<string, unknown>);
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(result),
          });
        } catch (error) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: \`Error: \${error}\`,
            is_error: true,
          });
        }
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });

      response = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        tools: this.getToolDefinitions(),
        messages,
        system: \`You are the {{NAME}} agent. {{DESCRIPTION}}\`,
      });
    }

    const textContent = response.content.find((c) => c.type === "text");
    return textContent?.type === "text" ? textContent.text : "";
  }
}

export default {{CLASS_NAME}}Agent;
`
      }
    ],
    dependencies: ["@anthropic-ai/sdk"],
    devDependencies: ["tsup", "typescript", "vitest"]
  },
  /**
   * Trading agent template
   */
  trading_agent: {
    name: "Trading Agent",
    description: "Agent for DeFi/trading operations",
    files: [
      {
        path: "src/index.ts",
        content: `/**
 * {{NAME}} Trading Agent
 *
 * {{DESCRIPTION}}
 */

import Anthropic from "@anthropic-ai/sdk";
import { Connection, PublicKey } from "@solana/web3.js";

export interface TradingConfig {
  rpcUrl: string;
  walletAddress?: string;
}

export class {{CLASS_NAME}}Agent {
  private client: Anthropic;
  private connection: Connection;
  private walletAddress?: PublicKey;

  constructor(config: TradingConfig) {
    this.client = new Anthropic();
    this.connection = new Connection(config.rpcUrl);
    if (config.walletAddress) {
      this.walletAddress = new PublicKey(config.walletAddress);
    }
  }

  async analyze(token: string): Promise<{
    recommendation: "buy" | "sell" | "hold";
    confidence: number;
    reasoning: string;
  }> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: \`Analyze token \${token} for trading opportunities.
Provide a recommendation (buy/sell/hold), confidence (0-100), and reasoning.\`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return { recommendation: "hold", confidence: 0, reasoning: "No analysis" };
    }

    // Parse response (simplified)
    const text = content.text.toLowerCase();
    return {
      recommendation: text.includes("buy") ? "buy" : text.includes("sell") ? "sell" : "hold",
      confidence: 50,
      reasoning: content.text,
    };
  }

  async getBalance(): Promise<number> {
    if (!this.walletAddress) return 0;
    return this.connection.getBalance(this.walletAddress);
  }
}

export default {{CLASS_NAME}}Agent;
`
      }
    ],
    dependencies: ["@anthropic-ai/sdk", "@solana/web3.js"],
    devDependencies: ["tsup", "typescript", "vitest"]
  },
  /**
   * Research agent template
   */
  research_agent: {
    name: "Research Agent",
    description: "Agent for web research and analysis",
    files: [
      {
        path: "src/index.ts",
        content: `/**
 * {{NAME}} Research Agent
 *
 * {{DESCRIPTION}}
 */

import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import * as cheerio from "cheerio";

export interface ResearchResult {
  topic: string;
  summary: string;
  sources: string[];
  keyFindings: string[];
  confidence: number;
}

export class {{CLASS_NAME}}Agent {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async research(topic: string, sources?: string[]): Promise<ResearchResult> {
    // Fetch content from sources if provided
    let context = "";
    const usedSources: string[] = [];

    if (sources?.length) {
      for (const url of sources.slice(0, 3)) {
        try {
          const { data } = await axios.get(url, { timeout: 10000 });
          const $ = cheerio.load(data);
          const text = $("body").text().slice(0, 3000);
          context += \`\\n\\nSource (\${url}):\\n\${text}\`;
          usedSources.push(url);
        } catch {
          // Skip failed sources
        }
      }
    }

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: \`Research the following topic: \${topic}

\${context ? \`Available context:\\n\${context}\` : ""}

Provide:
1. A comprehensive summary
2. Key findings (bullet points)
3. Confidence level (0-100)\`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return {
        topic,
        summary: "Research failed",
        sources: usedSources,
        keyFindings: [],
        confidence: 0,
      };
    }

    return {
      topic,
      summary: content.text,
      sources: usedSources,
      keyFindings: [],
      confidence: 75,
    };
  }
}

export default {{CLASS_NAME}}Agent;
`
      }
    ],
    dependencies: ["@anthropic-ai/sdk", "axios", "cheerio"],
    devDependencies: ["tsup", "typescript", "vitest", "@types/cheerio"]
  }
};
function getTemplate(name) {
  return AGENT_TEMPLATES[name];
}

// src/builder/agents/agent-builder.ts
var DEFAULT_CONFIG = {
  outputDir: "packages",
  autoInstall: true
};
var AgentBuilder = class {
  logger;
  config;
  constructor(config = {}) {
    this.logger = new Logger("AgentBuilder");
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Design agent from opportunity
   */
  async designAgent(opportunity) {
    this.logger.info(`Designing agent for: ${opportunity.title}`);
    const spec = await generateJSON({
      prompt: `Design an AI agent based on this opportunity:

Title: ${opportunity.title}
Description: ${opportunity.description}
Type: ${opportunity.type}
Source: ${opportunity.source}

The agent will be part of gICM, an AI-powered development platform with:
- AI agents for trading, research, content generation
- React component library
- Solana/Web3 focus

Design the agent with:
1. A clear name (e.g., "MarketAnalysis", "CodeReview")
2. Description of what it does
3. List of capabilities
4. Tools/functions it needs
5. Dependencies (npm packages)
6. Template type: "basic" | "tool_agent" | "trading_agent" | "research_agent"

Return JSON:
{
  "name": "AgentName",
  "description": "What it does",
  "capabilities": ["cap1", "cap2"],
  "tools": [
    { "name": "toolName", "description": "what it does", "inputSchema": { "type": "object", "properties": {} } }
  ],
  "dependencies": ["package1"],
  "templateType": "basic"
}`
    });
    return {
      name: spec.name,
      description: spec.description,
      capabilities: spec.capabilities,
      tools: spec.tools,
      dependencies: spec.dependencies,
      testCases: [
        {
          name: "basic_functionality",
          input: "Test the agent's basic functionality",
          expectedBehavior: "Agent should respond appropriately"
        }
      ]
    };
  }
  /**
   * Build agent from spec
   */
  async buildAgent(spec) {
    const taskId = `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const packageName = this.toPackageName(spec.name);
    const outputPath = path.join(this.config.outputDir, `${packageName}-agent`);
    this.logger.info(`Building agent: ${spec.name} at ${outputPath}`);
    const task = {
      id: taskId,
      opportunityId: "",
      type: "agent",
      spec,
      status: "in_progress",
      progress: 0,
      startedAt: Date.now(),
      logs: []
    };
    try {
      await fs.mkdir(outputPath, { recursive: true });
      await fs.mkdir(path.join(outputPath, "src"), { recursive: true });
      task.logs.push(`Created directory: ${outputPath}`);
      task.progress = 10;
      const templateName = this.selectTemplate(spec);
      const template = getTemplate(templateName) || AGENT_TEMPLATES.basic;
      task.logs.push(`Using template: ${templateName}`);
      task.progress = 20;
      for (const file of template.files) {
        const content = this.applyTemplate(file.content, spec);
        const filePath = path.join(outputPath, file.path);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
        task.logs.push(`Created: ${file.path}`);
      }
      task.progress = 50;
      if (spec.tools.length > 0) {
        const toolsContent = await this.generateToolsFile(spec);
        await fs.writeFile(path.join(outputPath, "src", "tools.ts"), toolsContent);
        task.logs.push("Generated tools.ts");
      }
      task.progress = 70;
      const testsContent = await this.generateTests(spec);
      await fs.writeFile(path.join(outputPath, "src", "index.test.ts"), testsContent);
      task.logs.push("Generated tests");
      task.progress = 85;
      await fs.writeFile(
        path.join(outputPath, "tsconfig.json"),
        JSON.stringify(
          {
            extends: "../../tsconfig.json",
            compilerOptions: {
              outDir: "./dist",
              rootDir: "./src"
            },
            include: ["src/**/*"]
          },
          null,
          2
        )
      );
      task.progress = 95;
      task.status = "completed";
      task.progress = 100;
      task.completedAt = Date.now();
      task.outputPath = outputPath;
      task.logs.push("Build completed successfully!");
      this.logger.info(`Agent ${spec.name} built successfully`);
    } catch (error) {
      task.status = "failed";
      task.error = String(error);
      task.logs.push(`Build failed: ${error}`);
      this.logger.error(`Build failed: ${error}`);
    }
    return task;
  }
  /**
   * Generate tools file
   */
  async generateToolsFile(spec) {
    const toolsCode = await generateText({
      prompt: `Generate TypeScript tool implementations for an AI agent.

Agent: ${spec.name}
Description: ${spec.description}

Tools needed:
${spec.tools.map((t) => `- ${t.name}: ${t.description}`).join("\n")}

Generate a tools.ts file with:
1. Proper TypeScript types
2. Implementation for each tool
3. Error handling
4. Export all tools

Return only the TypeScript code.`
    });
    return toolsCode;
  }
  /**
   * Generate test file
   */
  async generateTests(spec) {
    return `/**
 * ${spec.name} Agent Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ${this.toClassName(spec.name)}Agent } from "./index.js";

describe("${spec.name}Agent", () => {
  let agent: ${this.toClassName(spec.name)}Agent;

  beforeEach(() => {
    agent = new ${this.toClassName(spec.name)}Agent();
  });

  it("should instantiate correctly", () => {
    expect(agent).toBeDefined();
  });

${spec.testCases.map(
      (tc) => `
  it("${tc.name}", async () => {
    const result = await agent.run("${tc.input}");
    expect(result).toBeDefined();
    // ${tc.expectedBehavior}
  });`
    ).join("\n")}
});
`;
  }
  /**
   * Select appropriate template
   */
  selectTemplate(spec) {
    const nameLower = spec.name.toLowerCase();
    const descLower = spec.description.toLowerCase();
    if (nameLower.includes("trading") || descLower.includes("trading") || descLower.includes("defi")) {
      return "trading_agent";
    }
    if (nameLower.includes("research") || descLower.includes("research") || descLower.includes("analyze")) {
      return "research_agent";
    }
    if (spec.tools.length > 0) {
      return "tool_agent";
    }
    return "basic";
  }
  /**
   * Apply template variables
   */
  applyTemplate(content, spec) {
    return content.replace(/\{\{NAME\}\}/g, spec.name).replace(/\{\{DESCRIPTION\}\}/g, spec.description).replace(/\{\{CLASS_NAME\}\}/g, this.toClassName(spec.name)).replace(/\{\{PACKAGE_NAME\}\}/g, this.toPackageName(spec.name));
  }
  /**
   * Convert name to class name
   */
  toClassName(name) {
    return name.split(/[-_\s]+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
  }
  /**
   * Convert name to package name
   */
  toPackageName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  /**
   * Full build pipeline from opportunity
   */
  async buildFromOpportunity(opportunity) {
    const spec = await this.designAgent(opportunity);
    const task = await this.buildAgent(spec);
    task.opportunityId = opportunity.id;
    return task;
  }
};

// src/quality/testing.ts
import * as fs2 from "fs/promises";
import * as path2 from "path";
import { spawn } from "child_process";
var DEFAULT_CONFIG2 = {
  timeout: 6e4,
  coverage: true,
  watch: false
};
var TestRunner = class {
  logger;
  config;
  constructor(config = {}) {
    this.logger = new Logger("TestRunner");
    this.config = { ...DEFAULT_CONFIG2, ...config };
  }
  /**
   * Run tests for a built task
   */
  async runTests(task) {
    if (!task.outputPath) {
      return {
        passed: false,
        total: 0,
        failures: 0,
        coverage: 0,
        duration: 0,
        details: []
      };
    }
    this.logger.info(`Running tests for: ${task.outputPath}`);
    const startTime = Date.now();
    try {
      const testsExist = await this.testsExist(task.outputPath);
      if (!testsExist) {
        this.logger.warn("No tests found");
        return {
          passed: false,
          total: 0,
          failures: 0,
          coverage: 0,
          duration: 0,
          details: [{ name: "setup", status: "skipped", message: "No tests found" }]
        };
      }
      await this.installDeps(task.outputPath);
      const result = await this.runVitest(task.outputPath);
      return {
        passed: result.failures === 0,
        total: result.total,
        failures: result.failures,
        coverage: result.coverage,
        duration: Date.now() - startTime,
        details: result.details
      };
    } catch (error) {
      this.logger.error(`Test run failed: ${error}`);
      return {
        passed: false,
        total: 0,
        failures: 1,
        coverage: 0,
        duration: Date.now() - startTime,
        details: [{ name: "execution", status: "failed", message: String(error) }]
      };
    }
  }
  /**
   * Check if tests exist
   */
  async testsExist(projectPath) {
    try {
      const srcDir = path2.join(projectPath, "src");
      const files = await fs2.readdir(srcDir);
      return files.some((f) => f.includes(".test.") || f.includes(".spec."));
    } catch {
      return false;
    }
  }
  /**
   * Install dependencies
   */
  async installDeps(projectPath) {
    return new Promise((resolve, reject) => {
      const proc = spawn("npm", ["install"], {
        cwd: projectPath,
        shell: true,
        stdio: "pipe"
      });
      let stderr = "";
      proc.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
      proc.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install failed: ${stderr}`));
        }
      });
      proc.on("error", reject);
    });
  }
  /**
   * Run vitest
   */
  async runVitest(projectPath) {
    return new Promise((resolve) => {
      const args = ["run", "--reporter=json"];
      if (this.config.coverage) {
        args.push("--coverage");
      }
      const proc = spawn("npx", ["vitest", ...args], {
        cwd: projectPath,
        shell: true,
        stdio: "pipe",
        timeout: this.config.timeout
      });
      let stdout = "";
      let stderr = "";
      proc.stdout?.on("data", (data) => {
        stdout += data.toString();
      });
      proc.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
      proc.on("close", (code) => {
        try {
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            resolve({
              total: result.numTotalTests || 0,
              failures: result.numFailedTests || 0,
              coverage: 0,
              // Would need coverage report parsing
              details: result.testResults?.flatMap(
                (tr) => tr.assertionResults.map((ar) => ({
                  name: ar.title,
                  status: ar.status === "passed" ? "passed" : "failed",
                  message: ar.failureMessages?.join("\n")
                }))
              ) || []
            });
          } else {
            resolve({
              total: 1,
              failures: code === 0 ? 0 : 1,
              coverage: 0,
              details: [
                {
                  name: "test suite",
                  status: code === 0 ? "passed" : "failed",
                  message: stderr || stdout
                }
              ]
            });
          }
        } catch {
          resolve({
            total: 1,
            failures: code === 0 ? 0 : 1,
            coverage: 0,
            details: [
              {
                name: "test suite",
                status: code === 0 ? "passed" : "failed",
                message: stderr || stdout
              }
            ]
          });
        }
      });
      proc.on("error", (err) => {
        resolve({
          total: 0,
          failures: 1,
          coverage: 0,
          details: [{ name: "execution", status: "failed", message: err.message }]
        });
      });
    });
  }
  /**
   * Generate test report
   */
  generateReport(results) {
    const lines = [
      "# Test Results",
      "",
      `**Status:** ${results.passed ? "\u2705 PASSED" : "\u274C FAILED"}`,
      `**Total:** ${results.total} tests`,
      `**Failures:** ${results.failures}`,
      `**Coverage:** ${results.coverage}%`,
      `**Duration:** ${results.duration}ms`,
      "",
      "## Details",
      ""
    ];
    for (const detail of results.details) {
      const icon = detail.status === "passed" ? "\u2705" : detail.status === "failed" ? "\u274C" : "\u23ED\uFE0F";
      lines.push(`- ${icon} ${detail.name}`);
      if (detail.message) {
        lines.push(`  - ${detail.message.slice(0, 100)}`);
      }
    }
    return lines.join("\n");
  }
};

// src/quality/review.ts
import * as fs3 from "fs/promises";
import * as path3 from "path";
var DEFAULT_CONFIG3 = {
  checkSecurity: true,
  checkPerformance: true,
  checkStyle: true,
  checkBestPractices: true
};
var CodeReviewer = class {
  logger;
  config;
  constructor(config = {}) {
    this.logger = new Logger("CodeReviewer");
    this.config = { ...DEFAULT_CONFIG3, ...config };
  }
  /**
   * Review a built task
   */
  async review(task) {
    if (!task.outputPath) {
      return {
        approved: false,
        score: 0,
        issues: [{ severity: "error", file: "", line: 0, message: "No output path" }],
        suggestions: []
      };
    }
    this.logger.info(`Reviewing code at: ${task.outputPath}`);
    try {
      const files = await this.getSourceFiles(task.outputPath);
      const allIssues = [];
      const allSuggestions = [];
      let totalScore = 0;
      for (const file of files) {
        const review = await this.reviewFile(file.path, file.content);
        allIssues.push(
          ...review.issues.map((i) => ({
            ...i,
            file: path3.relative(task.outputPath, file.path)
          }))
        );
        allSuggestions.push(...review.suggestions);
        totalScore += review.score;
      }
      const avgScore = files.length > 0 ? totalScore / files.length : 0;
      const hasBlockers = allIssues.some((i) => i.severity === "error");
      return {
        approved: !hasBlockers && avgScore >= 70,
        score: Math.round(avgScore),
        issues: allIssues,
        suggestions: [...new Set(allSuggestions)].slice(0, 10)
      };
    } catch (error) {
      this.logger.error(`Review failed: ${error}`);
      return {
        approved: false,
        score: 0,
        issues: [{ severity: "error", file: "", line: 0, message: String(error) }],
        suggestions: []
      };
    }
  }
  /**
   * Get all source files
   */
  async getSourceFiles(projectPath) {
    const files = [];
    const srcDir = path3.join(projectPath, "src");
    try {
      const entries = await fs3.readdir(srcDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
          const filePath = path3.join(srcDir, entry.name);
          const content = await fs3.readFile(filePath, "utf-8");
          files.push({ path: filePath, content });
        }
      }
    } catch {
    }
    return files;
  }
  /**
   * Review a single file
   */
  async reviewFile(filePath, content) {
    const fileName = path3.basename(filePath);
    this.logger.debug(`Reviewing file: ${fileName}`);
    if (fileName.includes(".test.") || fileName.includes(".spec.")) {
      return { score: 100, issues: [], suggestions: [] };
    }
    const checks = [];
    if (this.config.checkSecurity) checks.push("security vulnerabilities");
    if (this.config.checkPerformance) checks.push("performance issues");
    if (this.config.checkStyle) checks.push("code style");
    if (this.config.checkBestPractices) checks.push("best practices");
    const review = await generateJSON({
      prompt: `Review this TypeScript file for a gICM AI agent:

File: ${fileName}

\`\`\`typescript
${content.slice(0, 8e3)}
\`\`\`

Check for:
${checks.map((c) => `- ${c}`).join("\n")}

gICM context:
- AI agents for trading, research, content
- Uses Anthropic SDK
- TypeScript with strict mode
- Focus on Solana/Web3

Provide:
1. Overall score (0-100)
2. Issues found with severity, line number, message
3. Improvement suggestions

Return JSON:
{
  "score": 85,
  "issues": [
    { "severity": "warning", "line": 10, "message": "description" }
  ],
  "suggestions": ["suggestion1", "suggestion2"]
}`
    });
    return review;
  }
  /**
   * Generate review report
   */
  generateReport(results) {
    const lines = [
      "# Code Review Report",
      "",
      `**Status:** ${results.approved ? "\u2705 APPROVED" : "\u274C CHANGES REQUESTED"}`,
      `**Score:** ${results.score}/100`,
      ""
    ];
    if (results.issues.length > 0) {
      lines.push("## Issues", "");
      const errors = results.issues.filter((i) => i.severity === "error");
      const warnings = results.issues.filter((i) => i.severity === "warning");
      const infos = results.issues.filter((i) => i.severity === "info");
      if (errors.length > 0) {
        lines.push("### \u274C Errors", "");
        for (const issue of errors) {
          lines.push(`- **${issue.file}:${issue.line}** - ${issue.message}`);
        }
        lines.push("");
      }
      if (warnings.length > 0) {
        lines.push("### \u26A0\uFE0F Warnings", "");
        for (const issue of warnings) {
          lines.push(`- **${issue.file}:${issue.line}** - ${issue.message}`);
        }
        lines.push("");
      }
      if (infos.length > 0) {
        lines.push("### \u2139\uFE0F Info", "");
        for (const issue of infos) {
          lines.push(`- **${issue.file}:${issue.line}** - ${issue.message}`);
        }
        lines.push("");
      }
    }
    if (results.suggestions.length > 0) {
      lines.push("## Suggestions", "");
      for (const suggestion of results.suggestions) {
        lines.push(`- ${suggestion}`);
      }
    }
    return lines.join("\n");
  }
  /**
   * Quick security check
   */
  async securityCheck(content) {
    const patterns = [
      { pattern: /eval\s*\(/, message: "Use of eval() detected" },
      { pattern: /new\s+Function\s*\(/, message: "Dynamic function creation" },
      { pattern: /process\.env\.\w+\s*\+/, message: "Env var concatenation" },
      { pattern: /child_process/, message: "Child process usage" },
      { pattern: /exec\s*\(|execSync\s*\(/, message: "Shell execution" },
      { pattern: /__dirname|__filename/, message: "File path exposure" },
      { pattern: /\.innerHTML\s*=/, message: "innerHTML assignment (XSS risk)" }
    ];
    const issues = [];
    for (const { pattern, message } of patterns) {
      if (pattern.test(content)) {
        issues.push(message);
      }
    }
    return {
      safe: issues.length === 0,
      issues
    };
  }
};

// src/quality/index.ts
var DEFAULT_GATE_CONFIG = {
  minTestScore: 80,
  minReviewScore: 70,
  requireTests: true,
  requireReview: true
};
var QualityGate = class {
  logger;
  testRunner;
  reviewer;
  config;
  constructor(config = {}, testConfig = {}, reviewConfig = {}) {
    this.logger = new Logger("QualityGate");
    this.config = { ...DEFAULT_GATE_CONFIG, ...config };
    this.testRunner = new TestRunner(testConfig);
    this.reviewer = new CodeReviewer(reviewConfig);
  }
  /**
   * Run full quality check
   */
  async check(task) {
    this.logger.info(`Running quality gate for: ${task.id}`);
    let testResults = null;
    let reviewResults = null;
    let testPassed = true;
    let reviewPassed = true;
    if (this.config.requireTests) {
      testResults = await this.testRunner.runTests(task);
      const testScore = testResults.total > 0 ? (testResults.total - testResults.failures) / testResults.total * 100 : 0;
      testPassed = testScore >= this.config.minTestScore;
      this.logger.info(`Tests: ${testPassed ? "PASSED" : "FAILED"} (${testScore}%)`);
    }
    if (this.config.requireReview) {
      reviewResults = await this.reviewer.review(task);
      reviewPassed = reviewResults.score >= this.config.minReviewScore;
      this.logger.info(`Review: ${reviewPassed ? "PASSED" : "FAILED"} (${reviewResults.score})`);
    }
    const passed = testPassed && reviewPassed;
    const report = this.generateReport({
      passed,
      testResults,
      reviewResults,
      testPassed,
      reviewPassed
    });
    return { passed, testResults, reviewResults, report };
  }
  /**
   * Quick quality check (review only)
   */
  async quickCheck(task) {
    const reviewResults = await this.reviewer.review(task);
    const passed = reviewResults.score >= this.config.minReviewScore;
    return { passed, reviewResults };
  }
  /**
   * Generate quality report
   */
  generateReport(results) {
    const lines = [
      "# Quality Gate Report",
      "",
      `## Overall: ${results.passed ? "\u2705 PASSED" : "\u274C FAILED"}`,
      ""
    ];
    if (results.testResults) {
      lines.push(
        "### Tests",
        `- Status: ${results.testPassed ? "\u2705 PASSED" : "\u274C FAILED"}`,
        `- Total: ${results.testResults.total}`,
        `- Failures: ${results.testResults.failures}`,
        `- Duration: ${results.testResults.duration}ms`,
        ""
      );
    }
    if (results.reviewResults) {
      lines.push(
        "### Code Review",
        `- Status: ${results.reviewPassed ? "\u2705 PASSED" : "\u274C FAILED"}`,
        `- Score: ${results.reviewResults.score}/100`,
        `- Issues: ${results.reviewResults.issues.length}`,
        ""
      );
      if (results.reviewResults.issues.length > 0) {
        lines.push("#### Top Issues:");
        for (const issue of results.reviewResults.issues.slice(0, 5)) {
          const icon = issue.severity === "error" ? "\u274C" : issue.severity === "warning" ? "\u26A0\uFE0F" : "\u2139\uFE0F";
          lines.push(`- ${icon} ${issue.file}:${issue.line} - ${issue.message}`);
        }
        lines.push("");
      }
    }
    return lines.join("\n");
  }
};

// src/index.ts
var ProductEngine = class {
  logger;
  config;
  discovery;
  agentBuilder;
  qualityGate;
  discoveryCron;
  buildCron;
  activeBuild = null;
  recentBuilds = [];
  status = {
    running: false,
    startedAt: null,
    metrics: {
      discovered: 0,
      built: 0,
      deployed: 0,
      failed: 0,
      avgBuildTime: 0,
      avgQualityScore: 0
    },
    backlog: [],
    activeBuild: null,
    recentBuilds: []
  };
  constructor(config) {
    this.logger = new Logger("ProductEngine");
    this.config = {
      discovery: {
        enabled: config?.discovery?.enabled ?? true,
        sources: config?.discovery?.sources || ["competitor", "github", "hackernews"],
        intervalHours: config?.discovery?.intervalHours || 6
      },
      building: {
        autoApprove: config?.building?.autoApprove ?? false,
        autoBuild: config?.building?.autoBuild ?? true,
        outputDir: config?.building?.outputDir || "packages"
      },
      quality: {
        minTestScore: config?.quality?.minTestScore || 80,
        minReviewScore: config?.quality?.minReviewScore || 70,
        requireApproval: config?.quality?.requireApproval ?? true
      },
      deployment: {
        autoDeploy: config?.deployment?.autoDeploy ?? false,
        registry: config?.deployment?.registry || "npm",
        notifications: config?.deployment?.notifications ?? true
      }
    };
    this.discovery = new DiscoveryManager();
    this.agentBuilder = new AgentBuilder({
      outputDir: this.config.building.outputDir
    });
    this.qualityGate = new QualityGate({
      minTestScore: this.config.quality.minTestScore,
      minReviewScore: this.config.quality.minReviewScore
    });
  }
  /**
   * Start the Product Engine
   */
  async start() {
    this.logger.info("Starting Product Engine...");
    try {
      if (this.config.discovery.enabled) {
        this.discovery.start();
        this.discoveryCron = new CronJob2(`0 */${this.config.discovery.intervalHours} * * *`, async () => {
          await this.runDiscovery();
        });
        this.discoveryCron.start();
      }
      if (this.config.building.autoBuild) {
        this.buildCron = new CronJob2("0 * * * *", async () => {
          await this.processNextBuild();
        });
        this.buildCron.start();
      }
      this.status.running = true;
      this.status.startedAt = Date.now();
      this.logger.info("Product Engine started successfully!");
      this.logger.info(`- Discovery: every ${this.config.discovery.intervalHours}h`);
      this.logger.info(`- Sources: ${this.config.discovery.sources.join(", ")}`);
      this.logger.info(`- Auto-build: ${this.config.building.autoBuild}`);
    } catch (error) {
      this.logger.error(`Failed to start: ${error}`);
      throw error;
    }
  }
  /**
   * Stop the Product Engine
   */
  stop() {
    this.logger.info("Stopping Product Engine...");
    this.discovery.stop();
    if (this.discoveryCron) {
      this.discoveryCron.stop();
    }
    if (this.buildCron) {
      this.buildCron.stop();
    }
    this.status.running = false;
    this.logger.info("Product Engine stopped");
  }
  /**
   * Run discovery cycle
   */
  async runDiscovery() {
    this.logger.info("Running discovery...");
    const opportunities = await this.discovery.runDiscovery();
    this.status.metrics.discovered += opportunities.length;
    this.status.backlog = this.discovery.getBacklog();
    this.logger.info(`Discovery complete: ${opportunities.length} new opportunities`);
    return opportunities;
  }
  /**
   * Process next build from backlog
   */
  async processNextBuild() {
    if (this.activeBuild) {
      this.logger.info("Build already in progress");
      return null;
    }
    const backlog = this.discovery.getBacklog();
    const approved = backlog.filter((o) => o.status === "approved");
    if (approved.length === 0) {
      if (this.config.building.autoApprove) {
        const highPriority = backlog.find(
          (o) => o.status === "evaluated" && (o.priority === "critical" || o.priority === "high")
        );
        if (highPriority) {
          this.discovery.approveOpportunity(highPriority.id);
          return this.buildOpportunity(highPriority);
        }
      }
      this.logger.info("No approved opportunities to build");
      return null;
    }
    return this.buildOpportunity(approved[0]);
  }
  /**
   * Build an opportunity
   */
  async buildOpportunity(opportunity) {
    this.logger.info(`Building: ${opportunity.title}`);
    this.activeBuild = {
      id: `build-${Date.now()}`,
      opportunityId: opportunity.id,
      type: "agent",
      spec: {
        name: opportunity.title.replace(/\s+/g, ""),
        description: opportunity.description,
        capabilities: [],
        tools: [],
        dependencies: [],
        testCases: []
      },
      status: "in_progress",
      progress: 0,
      startedAt: Date.now(),
      logs: []
    };
    this.status.activeBuild = this.activeBuild;
    try {
      const task = await this.agentBuilder.buildFromOpportunity(opportunity);
      this.activeBuild = task;
      if (task.status === "completed") {
        this.logger.info("Running quality checks...");
        const quality = await this.qualityGate.check(task);
        if (quality.passed) {
          this.logger.info(`Build passed quality gate (score: ${quality.reviewResults?.score})`);
          this.status.metrics.built++;
          this.status.metrics.avgQualityScore = (this.status.metrics.avgQualityScore * (this.status.metrics.built - 1) + (quality.reviewResults?.score || 0)) / this.status.metrics.built;
          opportunity.status = "building";
        } else {
          this.logger.warn("Build failed quality gate");
          task.status = "failed";
          task.error = "Failed quality gate";
          this.status.metrics.failed++;
        }
      } else {
        this.status.metrics.failed++;
      }
      this.recentBuilds.unshift(task);
      if (this.recentBuilds.length > 10) {
        this.recentBuilds.pop();
      }
      this.status.recentBuilds = this.recentBuilds;
      const completedBuilds = this.recentBuilds.filter((b) => b.completedAt);
      if (completedBuilds.length > 0) {
        this.status.metrics.avgBuildTime = completedBuilds.reduce((sum, b) => sum + (b.completedAt - b.startedAt), 0) / completedBuilds.length;
      }
      return task;
    } finally {
      this.activeBuild = null;
      this.status.activeBuild = null;
    }
  }
  /**
   * Approve an opportunity for building
   */
  approveOpportunity(id) {
    this.discovery.approveOpportunity(id);
  }
  /**
   * Reject an opportunity
   */
  rejectOpportunity(id, reason) {
    this.discovery.rejectOpportunity(id, reason);
  }
  /**
   * Get current status
   */
  getStatus() {
    this.status.backlog = this.discovery.getBacklog();
    return { ...this.status };
  }
  /**
   * Get backlog
   */
  getBacklog() {
    return this.discovery.getBacklog();
  }
  /**
   * Get opportunity by ID
   */
  getOpportunity(id) {
    return this.discovery.getOpportunity(id);
  }
};

export {
  Logger,
  CompetitorDiscovery,
  GitHubDiscovery,
  HackerNewsDiscovery,
  OpportunityEvaluator,
  DiscoveryManager,
  AgentBuilder,
  TestRunner,
  CodeReviewer,
  QualityGate,
  ProductEngine
};
