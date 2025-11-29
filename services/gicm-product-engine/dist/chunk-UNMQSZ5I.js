// src/index.ts
import { CronJob as CronJob2 } from "cron";

// src/discovery/index.ts
import { CronJob } from "cron";

// src/utils/logger.ts
import pino from "pino";
var Logger = class {
  logger;
  context;
  constructor(context) {
    this.context = context;
    this.logger = pino({
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
    this.logger.info({ context: this.context, ...data }, message);
  }
  warn(message, data) {
    this.logger.warn({ context: this.context, ...data }, message);
  }
  error(message, data) {
    this.logger.error({ context: this.context, ...data }, message);
  }
  debug(message, data) {
    this.logger.debug({ context: this.context, ...data }, message);
  }
};

// src/discovery/sources/user-feedback.ts
var UserFeedbackDiscovery = class {
  logger;
  feedbackQueue = [];
  constructor() {
    this.logger = new Logger("UserFeedback");
  }
  /**
   * Discover opportunities from user feedback
   */
  async discover() {
    this.logger.info("Scanning user feedback...");
    const opportunities = [];
    for (const feedback of this.feedbackQueue) {
      if (feedback.processed) continue;
      const opportunity = this.feedbackToOpportunity(feedback);
      opportunities.push(opportunity);
      feedback.processed = true;
      feedback.opportunityId = opportunity.id;
    }
    this.logger.info(`Found ${opportunities.length} opportunities from feedback`);
    return opportunities;
  }
  /**
   * Add feedback to queue
   */
  addFeedback(feedback) {
    const newFeedback = {
      ...feedback,
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      processed: false,
      createdAt: Date.now()
    };
    this.feedbackQueue.push(newFeedback);
    this.logger.info(`Added feedback: ${feedback.title}`);
    return newFeedback;
  }
  /**
   * Convert feedback to opportunity
   */
  feedbackToOpportunity(feedback) {
    const typeMap = {
      feature_request: "new_feature",
      bug_report: "bug_fix",
      improvement: "improvement",
      question: "improvement"
    };
    return {
      id: `opp-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: "user_feedback",
      type: typeMap[feedback.type],
      title: feedback.title,
      description: feedback.description,
      scores: {
        userDemand: Math.min(100, 50 + feedback.upvotes * 5),
        competitiveValue: 60,
        technicalFit: 70,
        effort: 60,
        impact: Math.min(100, 50 + feedback.comments * 3),
        overall: 0
      },
      analysis: {
        whatItDoes: feedback.description,
        whyItMatters: `Requested by user${feedback.upvotes > 0 ? ` with ${feedback.upvotes} upvotes` : ""}`,
        howToBuild: "Analyze requirements and implement",
        risks: [],
        dependencies: [],
        estimatedEffort: "1 week"
      },
      status: "discovered",
      priority: feedback.upvotes > 10 ? "high" : feedback.upvotes > 5 ? "medium" : "low",
      discoveredAt: Date.now()
    };
  }
  /**
   * Get pending feedback
   */
  getPendingFeedback() {
    return this.feedbackQueue.filter((f) => !f.processed);
  }
};

// src/discovery/sources/competitors.ts
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import * as cheerio from "cheerio";
var COMPETITORS = [
  { name: "Cursor", url: "https://cursor.com", changelog: "https://cursor.com/changelog" },
  { name: "Replit", url: "https://replit.com", changelog: "https://blog.replit.com" },
  { name: "v0", url: "https://v0.dev", changelog: "https://v0.dev/changelog" },
  { name: "Bolt", url: "https://bolt.new", changelog: "https://bolt.new/changelog" },
  { name: "Lovable", url: "https://lovable.dev", changelog: "https://lovable.dev/changelog" }
];
var CompetitorDiscovery = class {
  anthropic;
  logger;
  knownFeatures = /* @__PURE__ */ new Map();
  constructor() {
    this.anthropic = new Anthropic();
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
      const response = await axios.get(competitor.changelog, { timeout: 1e4 });
      const $ = cheerio.load(response.data);
      content = $("body").text().slice(0, 5e3);
    } catch {
      try {
        const response = await axios.get(competitor.url, { timeout: 1e4 });
        const $ = cheerio.load(response.data);
        content = $("body").text().slice(0, 5e3);
      } catch {
        return [];
      }
    }
    const prompt = `Analyze this content from ${competitor.name} (an AI coding tool competitor to gICM).

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

Only include genuine product features, not marketing fluff.`;
    try {
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1e3,
        messages: [{ role: "user", content: prompt }]
      });
      const text = response.content[0];
      if (text.type !== "text") return [];
      const match = text.text.match(/\[[\s\S]*\]/);
      if (!match) return [];
      const features = JSON.parse(match[0]);
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
import { Octokit } from "octokit";
var SEARCH_QUERIES = [
  "ai agent typescript",
  "solana defi",
  "react components web3",
  "trading bot crypto",
  "llm tools"
];
var GitHubDiscovery = class {
  octokit;
  logger;
  seenRepos = /* @__PURE__ */ new Set();
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.logger = new Logger("GitHubDiscovery");
  }
  /**
   * Discover opportunities from GitHub
   */
  async discover() {
    this.logger.info("Scanning GitHub trends...");
    const opportunities = [];
    for (const query of SEARCH_QUERIES) {
      try {
        const repos = await this.searchRepos(query);
        for (const repo of repos) {
          if (this.seenRepos.has(repo.full_name)) continue;
          this.seenRepos.add(repo.full_name);
          const opportunity = this.repoToOpportunity(repo);
          if (opportunity) {
            opportunities.push(opportunity);
          }
        }
      } catch (error) {
        this.logger.error(`Search failed for "${query}": ${error}`);
      }
    }
    this.logger.info(`Found ${opportunities.length} opportunities from GitHub`);
    return opportunities;
  }
  /**
   * Search GitHub repos
   */
  async searchRepos(query) {
    try {
      const response = await this.octokit.rest.search.repos({
        q: `${query} created:>2024-01-01 stars:>100`,
        sort: "stars",
        order: "desc",
        per_page: 10
      });
      return response.data.items.map((item) => ({
        full_name: item.full_name,
        name: item.name,
        description: item.description,
        html_url: item.html_url,
        stargazers_count: item.stargazers_count,
        topics: item.topics || [],
        language: item.language,
        created_at: item.created_at
      }));
    } catch (error) {
      this.logger.error(`GitHub API error: ${error}`);
      return [];
    }
  }
  /**
   * Convert repo to opportunity
   */
  repoToOpportunity(repo) {
    const relevantKeywords = ["agent", "ai", "llm", "solana", "web3", "trading", "defi", "component"];
    const isRelevant = relevantKeywords.some((kw) => repo.name.toLowerCase().includes(kw)) || relevantKeywords.some((kw) => repo.description?.toLowerCase().includes(kw)) || repo.topics.some((t) => relevantKeywords.includes(t.toLowerCase()));
    if (!isRelevant) return null;
    let type = "new_feature";
    if (repo.name.toLowerCase().includes("agent") || repo.topics.includes("ai-agent")) {
      type = "new_agent";
    } else if (repo.name.toLowerCase().includes("component") || repo.topics.includes("react")) {
      type = "new_component";
    }
    return {
      id: `opp-gh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: "github",
      sourceUrl: repo.html_url,
      type,
      title: `Integrate ideas from ${repo.name}`,
      description: repo.description || `Popular ${repo.language || "project"} with ${repo.stargazers_count} stars`,
      scores: {
        userDemand: Math.min(100, 30 + Math.log10(repo.stargazers_count) * 20),
        competitiveValue: 70,
        technicalFit: repo.language === "TypeScript" ? 90 : 60,
        effort: 50,
        impact: Math.min(100, 30 + Math.log10(repo.stargazers_count) * 15),
        overall: 0
      },
      analysis: {
        whatItDoes: repo.description || "See repository for details",
        whyItMatters: `Popular project with ${repo.stargazers_count} stars`,
        howToBuild: "Analyze repository and adapt concepts for gICM",
        risks: ["License compatibility", "May not fit gICM architecture"],
        dependencies: [],
        estimatedEffort: "1-2 weeks"
      },
      status: "discovered",
      priority: repo.stargazers_count > 1e3 ? "high" : "medium",
      discoveredAt: Date.now()
    };
  }
};

// src/discovery/sources/hackernews.ts
import axios2 from "axios";
var HN_API = "https://hacker-news.firebaseio.com/v0";
var RELEVANT_KEYWORDS = [
  "ai agent",
  "llm",
  "claude",
  "gpt",
  "solana",
  "web3",
  "defi",
  "trading bot",
  "react component",
  "typescript",
  "developer tools"
];
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
      const topStoriesResponse = await axios2.get(`${HN_API}/topstories.json`);
      const topStoryIds = topStoriesResponse.data.slice(0, 100);
      const storyPromises = topStoryIds.slice(0, 20).map(
        (id) => axios2.get(`${HN_API}/item/${id}.json`).then((r) => r.data)
      );
      const stories = await Promise.all(storyPromises);
      for (const story of stories) {
        if (!story || this.seenItems.has(story.id)) continue;
        const isRelevant = RELEVANT_KEYWORDS.some(
          (kw) => story.title.toLowerCase().includes(kw) || story.url?.toLowerCase().includes(kw)
        );
        if (!isRelevant) continue;
        this.seenItems.add(story.id);
        const opportunity = this.storyToOpportunity(story);
        opportunities.push(opportunity);
      }
    } catch (error) {
      this.logger.error(`HN API error: ${error}`);
    }
    this.logger.info(`Found ${opportunities.length} opportunities from HN`);
    return opportunities;
  }
  /**
   * Convert HN story to opportunity
   */
  storyToOpportunity(story) {
    let type = "new_feature";
    const titleLower = story.title.toLowerCase();
    if (titleLower.includes("agent") || titleLower.includes("ai bot")) {
      type = "new_agent";
    } else if (titleLower.includes("component") || titleLower.includes("ui")) {
      type = "new_component";
    } else if (titleLower.includes("integration") || titleLower.includes("api")) {
      type = "integration";
    }
    return {
      id: `opp-hn-${story.id}`,
      source: "hackernews",
      sourceUrl: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      type,
      title: `Research: ${story.title}`,
      description: `Trending on HN with ${story.score} points and ${story.descendants || 0} comments`,
      scores: {
        userDemand: Math.min(100, 30 + Math.log10(story.score) * 25),
        competitiveValue: 65,
        technicalFit: 70,
        effort: 50,
        impact: Math.min(100, 30 + (story.descendants || 0) / 5),
        overall: 0
      },
      analysis: {
        whatItDoes: story.title,
        whyItMatters: `Trending discussion on HN (${story.score} points)`,
        howToBuild: "Research the topic and identify actionable improvements for gICM",
        risks: ["May be hype-driven", "Relevance to gICM unclear"],
        dependencies: [],
        estimatedEffort: "Research: 1 day, Implementation: varies"
      },
      status: "discovered",
      priority: story.score > 200 ? "high" : story.score > 100 ? "medium" : "low",
      discoveredAt: Date.now()
    };
  }
};

// src/discovery/evaluator.ts
import Anthropic2 from "@anthropic-ai/sdk";
var OpportunityEvaluator = class {
  anthropic;
  logger;
  constructor() {
    this.anthropic = new Anthropic2();
    this.logger = new Logger("Evaluator");
  }
  /**
   * Evaluate an opportunity
   */
  async evaluate(opportunity) {
    try {
      const prompt = `Evaluate this product opportunity for gICM (an AI-powered development platform).

Opportunity:
- Title: ${opportunity.title}
- Description: ${opportunity.description}
- Source: ${opportunity.source}
- Type: ${opportunity.type}

gICM is:
- AI-powered development platform
- Has AI agents for trading, research, content creation
- React component library
- Solana/Web3 focus
- Context engine for codebase understanding

Score each dimension 0-100:
1. userDemand: How many users would want this?
2. competitiveValue: Does this differentiate us from competitors?
3. technicalFit: How well does it fit our TypeScript/React/Solana stack?
4. effort: How easy to build? (100 = very easy, 0 = very hard)
5. impact: How much does it improve gICM?

Also provide analysis:
- whatItDoes: Brief description of the feature
- whyItMatters: Business value
- howToBuild: Technical approach
- risks: Potential problems
- estimatedEffort: "1 day", "1 week", "2 weeks", "1 month"

Determine priority: critical, high, medium, or low

Return as JSON:
{
  "scores": {
    "userDemand": 70,
    "competitiveValue": 80,
    "technicalFit": 90,
    "effort": 60,
    "impact": 75
  },
  "analysis": {
    "whatItDoes": "...",
    "whyItMatters": "...",
    "howToBuild": "...",
    "risks": ["...", "..."],
    "estimatedEffort": "1 week"
  },
  "priority": "high"
}`;
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1e3,
        messages: [{ role: "user", content: prompt }]
      });
      const text = response.content[0];
      if (text.type !== "text") {
        return this.applyDefaultScores(opportunity);
      }
      const match = text.text.match(/\{[\s\S]*\}/);
      if (!match) {
        return this.applyDefaultScores(opportunity);
      }
      const evaluation = JSON.parse(match[0]);
      const overall = evaluation.scores.userDemand * 0.25 + evaluation.scores.competitiveValue * 0.2 + evaluation.scores.technicalFit * 0.15 + evaluation.scores.effort * 0.15 + evaluation.scores.impact * 0.25;
      opportunity.scores = {
        ...evaluation.scores,
        overall: Math.round(overall)
      };
      opportunity.analysis = {
        ...evaluation.analysis,
        dependencies: opportunity.analysis?.dependencies || []
      };
      opportunity.priority = evaluation.priority;
      opportunity.status = "evaluated";
      opportunity.evaluatedAt = Date.now();
      this.logger.info(
        `Evaluated: ${opportunity.title} (score: ${opportunity.scores.overall})`
      );
      return opportunity;
    } catch (error) {
      this.logger.error(`Evaluation failed: ${error}`);
      return this.applyDefaultScores(opportunity);
    }
  }
  /**
   * Apply default scores when evaluation fails
   */
  applyDefaultScores(opportunity) {
    opportunity.scores = {
      userDemand: 50,
      competitiveValue: 50,
      technicalFit: 70,
      effort: 50,
      impact: 50,
      overall: 54
    };
    opportunity.status = "evaluated";
    opportunity.evaluatedAt = Date.now();
    opportunity.priority = "medium";
    return opportunity;
  }
};

// src/discovery/index.ts
var DiscoveryManager = class {
  logger;
  evaluator;
  userFeedback;
  competitors;
  github;
  hackernews;
  opportunities = /* @__PURE__ */ new Map();
  cronJob;
  constructor() {
    this.logger = new Logger("Discovery");
    this.evaluator = new OpportunityEvaluator();
    this.userFeedback = new UserFeedbackDiscovery();
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
    const [userOpps, compOpps, ghOpps, hnOpps] = await Promise.all([
      this.discoverFromSource("user_feedback"),
      this.discoverFromSource("competitor"),
      this.discoverFromSource("github"),
      this.discoverFromSource("hackernews")
    ]);
    newOpportunities.push(...userOpps, ...compOpps, ...ghOpps, ...hnOpps);
    for (const opp of newOpportunities) {
      const evaluated = await this.evaluator.evaluate(opp);
      this.opportunities.set(evaluated.id, evaluated);
    }
    const highPriority = newOpportunities.filter(
      (o) => o.priority === "high" || o.priority === "critical"
    );
    this.logger.info(
      `Discovery complete: ${newOpportunities.length} opportunities found, ${highPriority.length} high priority`
    );
    return newOpportunities;
  }
  /**
   * Discover from a specific source
   */
  async discoverFromSource(source) {
    try {
      switch (source) {
        case "user_feedback":
          return this.userFeedback.discover();
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
  /**
   * Add user feedback
   */
  addUserFeedback(feedback) {
    return this.userFeedback.addFeedback(feedback);
  }
};

// src/builder/agents/agent-builder.ts
import Anthropic3 from "@anthropic-ai/sdk";
var AgentBuilder = class {
  anthropic;
  logger;
  templatesDir;
  constructor(templatesDir = "./templates/agents") {
    this.anthropic = new Anthropic3();
    this.logger = new Logger("AgentBuilder");
    this.templatesDir = templatesDir;
  }
  /**
   * Build an agent from specification
   */
  async build(spec) {
    this.logger.info(`Building agent: ${spec.name}`);
    const task = {
      id: `build-${Date.now()}`,
      opportunityId: "",
      type: "new_agent",
      title: `Build ${spec.name} agent`,
      specification: {
        name: spec.name,
        description: spec.description,
        technology: ["typescript", ...spec.dependencies],
        dependencies: spec.dependencies,
        apis: spec.apis,
        requirements: spec.capabilities,
        acceptanceCriteria: [
          "Agent runs without errors",
          "All inputs are validated",
          "Outputs match specification",
          "Tests pass"
        ],
        files: [
          { path: `src/agents/${spec.slug}/index.ts`, description: "Main agent file" },
          { path: `src/agents/${spec.slug}/types.ts`, description: "Type definitions" },
          { path: `src/agents/${spec.slug}/config.ts`, description: "Configuration" },
          { path: `tests/agents/${spec.slug}.test.ts`, description: "Tests" }
        ]
      },
      status: "building",
      artifacts: [],
      logs: [],
      startedAt: Date.now()
    };
    try {
      const mainCode = await this.generateAgentCode(spec);
      task.artifacts.push({
        type: "code",
        path: `src/agents/${spec.slug}/index.ts`,
        content: mainCode,
        language: "typescript"
      });
      this.log(task, "info", "Generated main agent code");
      const typesCode = await this.generateTypes(spec);
      task.artifacts.push({
        type: "code",
        path: `src/agents/${spec.slug}/types.ts`,
        content: typesCode,
        language: "typescript"
      });
      this.log(task, "info", "Generated type definitions");
      const configCode = this.generateConfig(spec);
      task.artifacts.push({
        type: "code",
        path: `src/agents/${spec.slug}/config.ts`,
        content: configCode,
        language: "typescript"
      });
      this.log(task, "info", "Generated configuration");
      const testCode = await this.generateTests(spec);
      task.artifacts.push({
        type: "test",
        path: `tests/agents/${spec.slug}.test.ts`,
        content: testCode,
        language: "typescript"
      });
      this.log(task, "info", "Generated tests");
      const readme = this.generateReadme(spec);
      task.artifacts.push({
        type: "docs",
        path: `src/agents/${spec.slug}/README.md`,
        content: readme,
        language: "markdown"
      });
      this.log(task, "info", "Generated documentation");
      task.status = "testing";
      task.completedAt = Date.now();
      this.logger.info(`Agent ${spec.name} built successfully`);
      return task;
    } catch (error) {
      this.log(task, "error", `Build failed: ${error}`);
      task.status = "failed";
      throw error;
    }
  }
  /**
   * Generate main agent code
   */
  async generateAgentCode(spec) {
    const prompt = `Generate a complete TypeScript agent for gICM platform.

Agent Specification:
- Name: ${spec.name}
- Slug: ${spec.slug}
- Description: ${spec.description}
- Category: ${spec.category}

Capabilities:
${spec.capabilities.map((c) => `- ${c}`).join("\n")}

Inputs:
${spec.inputs.map((i) => `- ${i.name}: ${i.type} - ${i.description}${i.required ? " (required)" : ""}`).join("\n")}

Outputs:
${spec.outputs.map((o) => `- ${o.name}: ${o.type} - ${o.description}`).join("\n")}

Dependencies: ${spec.dependencies.join(", ") || "none"}
APIs: ${spec.apis.join(", ") || "none"}

Generate a complete, production-ready agent following this structure:

\`\`\`typescript
import { EventEmitter } from "eventemitter3";
import type { ${spec.name}Config, ${spec.name}Input, ${spec.name}Output } from "./types.js";

export interface ${spec.name}Events {
  "started": () => void;
  "completed": (output: ${spec.name}Output) => void;
  "error": (error: Error) => void;
  "progress": (percent: number, message: string) => void;
}

export class ${spec.name}Agent extends EventEmitter<${spec.name}Events> {
  private config: ${spec.name}Config;

  constructor(config: Partial<${spec.name}Config> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async run(input: ${spec.name}Input): Promise<${spec.name}Output> {
    // Implement agent logic
  }

  // Add helper methods
}

export const DEFAULT_CONFIG: ${spec.name}Config = {
  // Default configuration
};
\`\`\`

Requirements:
- Use EventEmitter for lifecycle events
- Validate all inputs
- Handle errors gracefully
- Include progress reporting
- Add JSDoc comments
- Export everything needed

Return ONLY the TypeScript code, no explanations.`;
    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4e3,
      messages: [{ role: "user", content: prompt }]
    });
    const text = response.content[0];
    if (text.type !== "text") throw new Error("Unexpected response");
    const codeMatch = text.text.match(/```typescript\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : text.text;
  }
  /**
   * Generate type definitions
   */
  async generateTypes(spec) {
    const prompt = `Generate TypeScript type definitions for this agent:

Agent: ${spec.name}
Inputs: ${JSON.stringify(spec.inputs, null, 2)}
Outputs: ${JSON.stringify(spec.outputs, null, 2)}
Default Config: ${JSON.stringify(spec.defaultConfig, null, 2)}

Generate:
- ${spec.name}Config interface
- ${spec.name}Input interface
- ${spec.name}Output interface
- Any helper types needed

Return ONLY TypeScript code.`;
    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1e3,
      messages: [{ role: "user", content: prompt }]
    });
    const text = response.content[0];
    if (text.type !== "text") throw new Error("Unexpected response");
    const codeMatch = text.text.match(/```typescript\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : text.text;
  }
  /**
   * Generate configuration
   */
  generateConfig(spec) {
    return `/**
 * ${spec.name} Agent Configuration
 */

import type { ${spec.name}Config } from "./types.js";

export const DEFAULT_CONFIG: ${spec.name}Config = ${JSON.stringify(spec.defaultConfig, null, 2)};

export function createConfig(overrides: Partial<${spec.name}Config> = {}): ${spec.name}Config {
  return { ...DEFAULT_CONFIG, ...overrides };
}
`;
  }
  /**
   * Generate tests
   */
  async generateTests(spec) {
    const prompt = `Generate Vitest tests for this agent:

Agent: ${spec.name}
Description: ${spec.description}
Inputs: ${JSON.stringify(spec.inputs, null, 2)}
Outputs: ${JSON.stringify(spec.outputs, null, 2)}

Generate comprehensive tests:
- Constructor tests
- Input validation tests
- Success case tests
- Error handling tests
- Event emission tests

Use Vitest (describe, it, expect, vi).
Return ONLY TypeScript test code.`;
    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2e3,
      messages: [{ role: "user", content: prompt }]
    });
    const text = response.content[0];
    if (text.type !== "text") throw new Error("Unexpected response");
    const codeMatch = text.text.match(/```typescript\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : text.text;
  }
  /**
   * Generate README documentation
   */
  generateReadme(spec) {
    return `# ${spec.name} Agent

${spec.description}

## Category
${spec.category}

## Capabilities
${spec.capabilities.map((c) => `- ${c}`).join("\n")}

## Installation

\`\`\`bash
npm install @gicm/agents
\`\`\`

## Usage

\`\`\`typescript
import { ${spec.name}Agent } from "@gicm/agents";

const agent = new ${spec.name}Agent({
  // configuration
});

const result = await agent.run({
  // inputs
});
\`\`\`

## Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
${spec.inputs.map((i) => `| ${i.name} | ${i.type} | ${i.required ? "Yes" : "No"} | ${i.description} |`).join("\n")}

## Outputs

| Name | Type | Description |
|------|------|-------------|
${spec.outputs.map((o) => `| ${o.name} | ${o.type} | ${o.description} |`).join("\n")}

## Events

- \`started\` - Emitted when agent starts
- \`progress\` - Emitted with progress updates
- \`completed\` - Emitted with final output
- \`error\` - Emitted on errors

## License
${spec.license}
`;
  }
  /**
   * Log to build task
   */
  log(task, level, message, details) {
    task.logs.push({
      timestamp: Date.now(),
      level,
      message,
      details
    });
    if (level === "error") {
      this.logger.error(message);
    } else {
      this.logger.info(message);
    }
  }
};

// src/index.ts
var ProductEngine = class {
  config;
  logger;
  discovery;
  agentBuilder;
  cronJobs = [];
  isRunning = false;
  constructor(config) {
    this.config = config;
    this.logger = new Logger("ProductEngine");
    this.discovery = new DiscoveryManager();
    this.agentBuilder = new AgentBuilder();
  }
  /**
   * Start the product engine
   */
  async start() {
    if (this.isRunning) return;
    this.logger.info("Starting gICM Product Engine...");
    this.isRunning = true;
    if (this.config.enableDiscovery) {
      this.discovery.start();
      if (this.config.discoveryInterval) {
        const processJob = new CronJob2(this.config.discoveryInterval, async () => {
          await this.processBacklog();
        });
        processJob.start();
        this.cronJobs.push(processJob);
      }
    }
    this.logger.info("Product Engine running");
    this.printStatus();
  }
  /**
   * Stop the product engine
   */
  async stop() {
    if (!this.isRunning) return;
    this.logger.info("Stopping Product Engine...");
    this.discovery.stop();
    for (const job of this.cronJobs) {
      job.stop();
    }
    this.cronJobs = [];
    this.isRunning = false;
    this.logger.info("Product Engine stopped");
  }
  /**
   * Process the backlog
   */
  async processBacklog() {
    const backlog = this.discovery.getBacklog();
    for (const opportunity of backlog) {
      if (this.config.enableAutoBuilding && opportunity.scores.overall >= this.config.autoApproveThreshold && opportunity.status === "evaluated") {
        this.discovery.approveOpportunity(opportunity.id);
      }
      if (opportunity.status === "approved") {
        await this.buildOpportunity(opportunity);
      }
    }
  }
  /**
   * Build an opportunity
   */
  async buildOpportunity(opportunity) {
    this.logger.info(`Building: ${opportunity.title}`);
    try {
      if (opportunity.type === "new_agent") {
        const spec = this.opportunityToAgentSpec(opportunity);
        const task = await this.agentBuilder.build(spec);
        for (const artifact of task.artifacts) {
          this.logger.info(`Created: ${artifact.path}`);
        }
      }
      opportunity.status = "deployed";
      opportunity.completedAt = Date.now();
    } catch (error) {
      this.logger.error(`Build failed: ${error}`);
      opportunity.status = "evaluated";
    }
  }
  /**
   * Convert opportunity to agent spec
   */
  opportunityToAgentSpec(opportunity) {
    const name = opportunity.title.replace(/^Add |^Build |^Create |^Research: /, "").replace(/\s+/g, "").replace(/Agent$/, "") + "Agent";
    return {
      name,
      slug: name.toLowerCase().replace(/agent$/, "").replace(/[^a-z0-9]/g, "-") + "-agent",
      description: opportunity.description,
      category: "automation",
      capabilities: [opportunity.analysis.whatItDoes],
      inputs: [
        {
          name: "input",
          type: "Record<string, any>",
          description: "Agent input",
          required: true
        }
      ],
      outputs: [{ name: "result", type: "Record<string, any>", description: "Agent output" }],
      dependencies: [],
      apis: [],
      defaultConfig: {},
      version: "1.0.0",
      author: "gICM",
      license: "MIT"
    };
  }
  /**
   * Run discovery manually
   */
  async runDiscovery() {
    return this.discovery.runDiscovery();
  }
  /**
   * Get backlog
   */
  getBacklog() {
    return this.discovery.getBacklog();
  }
  /**
   * Build agent from spec
   */
  async buildAgent(spec) {
    const task = await this.agentBuilder.build(spec);
    console.log("\n\u{1F916} Agent Built:");
    console.log("\u2550".repeat(50));
    console.log(`Name: ${spec.name}`);
    console.log(`Files created: ${task.artifacts.length}`);
    for (const artifact of task.artifacts) {
      console.log(`  - ${artifact.path}`);
    }
    console.log("\u2550".repeat(50) + "\n");
  }
  /**
   * Print status
   */
  printStatus() {
    const backlog = this.discovery.getBacklog();
    console.log("\n\u{1F527} gICM Product Engine Status");
    console.log("\u2550".repeat(50));
    console.log(`
\u{1F50D} Discovery:`);
    console.log(`   Enabled: ${this.config.enableDiscovery ? "\u2705" : "\u274C"}`);
    console.log(`   Interval: ${this.config.discoveryInterval || "manual"}`);
    console.log(`
\u{1F4CB} Backlog:`);
    console.log(`   Total: ${backlog.length}`);
    console.log(
      `   High priority: ${backlog.filter((o) => o.priority === "high" || o.priority === "critical").length}`
    );
    console.log(`   Approved: ${backlog.filter((o) => o.status === "approved").length}`);
    console.log(`
\u{1F3D7}\uFE0F Building:`);
    console.log(`   Auto-build: ${this.config.enableAutoBuilding ? "\u2705" : "\u274C"}`);
    console.log(`   Auto-approve threshold: ${this.config.autoApproveThreshold}`);
    console.log(`
\u{1F680} Deployment:`);
    console.log(`   Auto-deploy: ${this.config.enableAutoDeploy ? "\u2705" : "\u274C"}`);
    console.log("\u2550".repeat(50) + "\n");
  }
  /**
   * Get metrics
   */
  async getMetrics() {
    return {
      growth: {
        newAgents: 0,
        newComponents: 0,
        improvements: 0
      }
    };
  }
  /**
   * Get discovery manager
   */
  getDiscovery() {
    return this.discovery;
  }
  /**
   * Check if running
   */
  isEngineRunning() {
    return this.isRunning;
  }
};

export {
  Logger,
  UserFeedbackDiscovery,
  CompetitorDiscovery,
  GitHubDiscovery,
  HackerNewsDiscovery,
  OpportunityEvaluator,
  DiscoveryManager,
  AgentBuilder,
  ProductEngine
};
