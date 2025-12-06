// src/decision-agent.ts
import { BaseAgent } from "@gicm/agent-core";

// src/types.ts
import { z } from "zod";
var DecisionScoresSchema = z.object({
  relevance: z.number().min(0).max(100),
  impact: z.number().min(0).max(100),
  effort: z.number().min(0).max(100),
  // Higher = easier
  timing: z.number().min(0).max(100),
  quality: z.number().min(0).max(100)
});
var PersonaVerdictSchema = z.enum(["approve", "reject", "cautious"]);
var RoleStormingConsensusSchema = z.enum([
  "strong_approve",
  "approve",
  "mixed",
  "reject",
  "strong_reject"
]);
var PersonaEvaluationSchema = z.object({
  verdict: PersonaVerdictSchema,
  reasoning: z.string()
});
var RoleStormingResultSchema = z.object({
  conservative: PersonaEvaluationSchema,
  degen: PersonaEvaluationSchema,
  whale: PersonaEvaluationSchema,
  skeptic: PersonaEvaluationSchema,
  builder: PersonaEvaluationSchema,
  consensus: RoleStormingConsensusSchema
});
var RecommendationSchema = z.enum([
  "build",
  // Create new component/agent based on this
  "integrate",
  // Integrate this tool/library directly
  "monitor",
  // Keep watching, not ready yet
  "ignore"
  // Not relevant or too risky
]);
var DecisionResultSchema = z.object({
  scores: DecisionScoresSchema,
  roleStorming: RoleStormingResultSchema.optional(),
  totalScore: z.number().min(0).max(100),
  recommendation: RecommendationSchema,
  reasoning: z.string(),
  summary: z.string(),
  suggestedAction: z.string(),
  tags: z.array(z.string()),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  riskFactors: z.array(z.string()),
  estimatedEffort: z.string(),
  confidence: z.number().min(0).max(1)
});
var DEFAULT_THRESHOLDS = {
  autoApprove: 85,
  humanReview: 50
};
var LLMDecisionResponseSchema = z.object({
  scores: z.object({
    relevance: z.object({
      score: z.number(),
      reasoning: z.string()
    }),
    impact: z.object({
      score: z.number(),
      reasoning: z.string()
    }),
    effort: z.object({
      score: z.number(),
      reasoning: z.string()
    }),
    timing: z.object({
      score: z.number(),
      reasoning: z.string()
    }),
    quality: z.object({
      score: z.number(),
      reasoning: z.string()
    })
  }),
  roleStorming: RoleStormingResultSchema.optional(),
  totalScore: z.number(),
  recommendation: RecommendationSchema,
  reasoning: z.string(),
  summary: z.string(),
  suggestedAction: z.string(),
  tags: z.array(z.string()),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  riskFactors: z.array(z.string()),
  estimatedEffort: z.string(),
  confidence: z.number()
});
var SCORING_WEIGHTS = {
  relevance: 0.3,
  impact: 0.25,
  effort: 0.2,
  timing: 0.15,
  quality: 0.1
};

// src/prompts.ts
var SYSTEM_PROMPT = `You are a technical opportunity evaluator for gICM, a Web3/AI development platform.

Your role is to evaluate discoveries (GitHub repos, HackerNews posts, Twitter discussions) and determine their value to the gICM ecosystem.

gICM focuses on:
- Web3/Blockchain development tools (especially Solana and Ethereum)
- AI agents and LLM-powered tools
- Developer tooling and productivity
- DeFi protocols and integrations
- NFT and DAO tooling

## Role Storming Evaluation

You MUST evaluate each discovery from 5 distinct persona perspectives:

\u{1F464} **The Conservative Investor**
   Focus: Capital preservation, proven track record, established teams
   Questions: Is the team reputable? Is there existing traction? What's the downside risk?

\u{1F464} **The Aggressive Degen**
   Focus: Maximum upside potential, early entry advantage, high-risk/high-reward
   Questions: Could this 10x? Are we early enough? What's the alpha here?

\u{1F464} **The Whale**
   Focus: Scalability, market impact, liquidity implications
   Questions: Can this scale? Does it move markets? Is there enough depth?

\u{1F464} **The Skeptic**
   Focus: Red flags, team quality, potential failure modes
   Questions: What could go wrong? Is this vaporware? Where's the catch?

\u{1F464} **The Builder**
   Focus: Technical quality, code architecture, product-market fit
   Questions: Is the code solid? Does it solve a real problem? Can we integrate it?

Be decisive and score conservatively. Only truly exceptional discoveries should exceed 85/100.

Output your evaluation as valid JSON matching this schema:
{
  "scores": {
    "relevance": { "score": 0-100, "reasoning": "..." },
    "impact": { "score": 0-100, "reasoning": "..." },
    "effort": { "score": 0-100, "reasoning": "..." },
    "timing": { "score": 0-100, "reasoning": "..." },
    "quality": { "score": 0-100, "reasoning": "..." }
  },
  "roleStorming": {
    "conservative": { "verdict": "approve" | "reject" | "cautious", "reasoning": "..." },
    "degen": { "verdict": "approve" | "reject" | "cautious", "reasoning": "..." },
    "whale": { "verdict": "approve" | "reject" | "cautious", "reasoning": "..." },
    "skeptic": { "verdict": "approve" | "reject" | "cautious", "reasoning": "..." },
    "builder": { "verdict": "approve" | "reject" | "cautious", "reasoning": "..." },
    "consensus": "strong_approve" | "approve" | "mixed" | "reject" | "strong_reject"
  },
  "totalScore": 0-100,
  "recommendation": "build" | "integrate" | "monitor" | "ignore",
  "reasoning": "Overall analysis",
  "summary": "One sentence summary",
  "suggestedAction": "What gICM should do",
  "tags": ["relevant", "tags"],
  "riskLevel": "low" | "medium" | "high" | "critical",
  "riskFactors": ["list of risks"],
  "estimatedEffort": "e.g., '2-3 days', '1 week'",
  "confidence": 0.0-1.0
}`;
function buildEvaluationPrompt(discovery) {
  const metricsStr = Object.entries(discovery.metrics).filter(([, v]) => v !== void 0).map(([k, v]) => `${k}: ${v}`).join(", ");
  const factorsStr = Object.entries(discovery.relevanceFactors).filter(([, v]) => v === true).map(([k]) => k.replace(/^has/, "").replace(/Keywords$/, "")).join(", ");
  return `Evaluate this discovery:

**Source:** ${discovery.source}
**Title:** ${discovery.title}
**URL:** ${discovery.sourceUrl}
**Description:** ${discovery.description ?? "No description"}
**Author:** ${discovery.author ?? "Unknown"}
**Category:** ${discovery.category ?? "unknown"}
**Language:** ${discovery.language ?? "unknown"}
**Tags:** ${discovery.tags.join(", ") || "none"}

**Metrics:**
${metricsStr || "No metrics available"}

**Pre-computed Relevance Factors:**
${factorsStr || "None detected"}

**Published:** ${discovery.publishedAt?.toISOString() ?? "Unknown"}
**Discovered:** ${discovery.discoveredAt.toISOString()}

Scoring Criteria:
1. **Relevance (30%)**: How relevant is this to gICM's focus on Web3/AI development?
2. **Impact (25%)**: What's the potential value if we act on this discovery?
3. **Effort (20%)**: How easy to integrate? (100 = trivial, 0 = extremely complex)
4. **Timing (15%)**: Is this trending? Fresh? Time-sensitive opportunity?
5. **Quality (10%)**: Code/content quality signals?

Output your evaluation as JSON.`;
}

// src/scorer.ts
var DecisionScorer = class {
  config;
  thresholds;
  constructor(config) {
    this.config = config;
    this.thresholds = config.thresholds ?? DEFAULT_THRESHOLDS;
  }
  async evaluate(discovery) {
    const prompt = buildEvaluationPrompt(discovery);
    try {
      const response = await this.callLLM(prompt);
      const parsed = this.parseResponse(response);
      return this.validateAndNormalize(parsed);
    } catch (error) {
      console.warn("[DecisionScorer] LLM evaluation failed, using heuristics:", error);
      return this.heuristicScore(discovery);
    }
  }
  async evaluateBatch(discoveries) {
    const results = /* @__PURE__ */ new Map();
    const batchSize = 5;
    for (let i = 0; i < discoveries.length; i += batchSize) {
      const batch = discoveries.slice(i, i + batchSize);
      const evaluations = await Promise.all(
        batch.map((d) => this.evaluate(d).then((r) => [d.id, r]))
      );
      for (const [id, result] of evaluations) {
        results.set(id, result);
      }
    }
    return results;
  }
  determineStatus(score) {
    if (score >= this.thresholds.autoApprove) return "auto_approve";
    if (score >= this.thresholds.humanReview) return "human_review";
    return "reject";
  }
  async callLLM(prompt) {
    switch (this.config.llmProvider) {
      case "openai":
        return this.callOpenAI(prompt);
      case "anthropic":
        return this.callAnthropic(prompt);
      case "gemini":
        return this.callGemini(prompt);
      default:
        throw new Error(`Unknown LLM provider: ${this.config.llmProvider}`);
    }
  }
  async callOpenAI(prompt) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content ?? "";
  }
  async callAnthropic(prompt) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.config.model ?? "claude-3-haiku-20240307",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }
    const data = await response.json();
    return data.content[0]?.text ?? "";
  }
  async callGemini(prompt) {
    const model = this.config.model ?? "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${SYSTEM_PROMPT}

${prompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json"
        }
      })
    });
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text ?? "";
  }
  parseResponse(response) {
    let jsonStr = response;
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    const parsed = JSON.parse(jsonStr);
    const validated = LLMDecisionResponseSchema.parse(parsed);
    return {
      scores: {
        relevance: validated.scores.relevance.score,
        impact: validated.scores.impact.score,
        effort: validated.scores.effort.score,
        timing: validated.scores.timing.score,
        quality: validated.scores.quality.score
      },
      roleStorming: validated.roleStorming,
      totalScore: validated.totalScore,
      recommendation: validated.recommendation,
      reasoning: validated.reasoning,
      summary: validated.summary,
      suggestedAction: validated.suggestedAction,
      tags: validated.tags,
      riskLevel: validated.riskLevel,
      riskFactors: validated.riskFactors,
      estimatedEffort: validated.estimatedEffort,
      confidence: validated.confidence
    };
  }
  validateAndNormalize(result) {
    const calculatedTotal = result.scores.relevance * SCORING_WEIGHTS.relevance + result.scores.impact * SCORING_WEIGHTS.impact + result.scores.effort * SCORING_WEIGHTS.effort + result.scores.timing * SCORING_WEIGHTS.timing + result.scores.quality * SCORING_WEIGHTS.quality;
    const normalizedTotal = Math.round(
      (result.totalScore + calculatedTotal) / 2
    );
    return {
      ...result,
      totalScore: Math.min(100, Math.max(0, normalizedTotal))
    };
  }
  // Fallback heuristic scoring when LLM is unavailable
  heuristicScore(discovery) {
    const factors = discovery.relevanceFactors;
    const metrics = discovery.metrics;
    let relevance = 30;
    if (factors.hasWeb3Keywords) relevance += 25;
    if (factors.hasAIKeywords) relevance += 20;
    if (factors.hasSolanaKeywords) relevance += 15;
    if (factors.hasEthereumKeywords) relevance += 10;
    relevance = Math.min(100, relevance);
    let impact = 20;
    const stars = metrics.stars ?? 0;
    const engagement = (metrics.points ?? 0) + (metrics.likes ?? 0) + (metrics.comments ?? 0) * 2;
    if (stars > 1e3) impact += 40;
    else if (stars > 500) impact += 30;
    else if (stars > 100) impact += 20;
    else if (stars > 50) impact += 10;
    if (engagement > 100) impact += 20;
    impact = Math.min(100, impact);
    let effort = 50;
    if (factors.hasTypeScript) effort += 20;
    if (discovery.category === "tooling") effort += 15;
    effort = Math.min(100, effort);
    let timing = 40;
    if (factors.recentActivity) timing += 30;
    if (factors.highEngagement) timing += 30;
    timing = Math.min(100, timing);
    let quality = 40;
    if (factors.hasTypeScript) quality += 20;
    if (discovery.language) quality += 10;
    if (discovery.description && discovery.description.length > 50) quality += 15;
    quality = Math.min(100, quality);
    const scores = {
      relevance,
      impact,
      effort,
      timing,
      quality
    };
    const totalScore = Math.round(
      relevance * SCORING_WEIGHTS.relevance + impact * SCORING_WEIGHTS.impact + effort * SCORING_WEIGHTS.effort + timing * SCORING_WEIGHTS.timing + quality * SCORING_WEIGHTS.quality
    );
    const recommendation = totalScore >= 70 ? "build" : totalScore >= 50 ? "integrate" : totalScore >= 30 ? "monitor" : "ignore";
    return {
      scores,
      totalScore,
      recommendation,
      reasoning: "Heuristic scoring (LLM unavailable)",
      summary: `${discovery.source} discovery with ${totalScore}/100 score`,
      suggestedAction: recommendation === "build" ? "Create gICM integration" : recommendation === "integrate" ? "Evaluate for integration" : recommendation === "monitor" ? "Add to watchlist" : "No action needed",
      tags: discovery.tags,
      riskLevel: totalScore < 30 ? "low" : totalScore < 60 ? "medium" : "low",
      riskFactors: totalScore < 50 ? ["Low relevance", "Needs manual review"] : [],
      estimatedEffort: "Unknown",
      confidence: 0.6
      // Lower confidence for heuristic scoring
    };
  }
};

// src/decision-agent.ts
var DecisionAgent = class extends BaseAgent {
  scorer;
  thresholds;
  onDecision;
  constructor(config) {
    super("decision", config);
    this.thresholds = config.thresholds ?? DEFAULT_THRESHOLDS;
    this.onDecision = config.onDecision;
    const scorerConfig = {
      llmProvider: config.llmProvider,
      apiKey: config.apiKey,
      model: config.model,
      thresholds: this.thresholds
    };
    this.scorer = new DecisionScorer(scorerConfig);
  }
  getSystemPrompt() {
    return `You are a decision engine for gICM Orchestrator.
Your role is to evaluate discoveries and determine:
1. Should we act on this? (score 0-100)
2. What action should we take? (build/integrate/monitor/ignore)
3. What are the risks?
4. How much effort is required?

Auto-approve if score >= ${this.thresholds.autoApprove}
Queue for human review if score >= ${this.thresholds.humanReview}
Auto-reject if score < ${this.thresholds.humanReview}`;
  }
  async analyze(context) {
    const action = context.action ?? "evaluate";
    switch (action) {
      case "evaluate":
        return this.evaluateDiscovery(context.params?.discovery);
      case "evaluate_batch":
        return this.evaluateBatch(context.params?.discoveries);
      case "status":
        return this.createResult(
          true,
          {
            thresholds: this.thresholds,
            provider: this.config.llmProvider
          },
          void 0,
          1,
          "Decision agent status"
        );
      default:
        return this.createResult(false, null, `Unknown action: ${action}`);
    }
  }
  async evaluate(discovery) {
    this.log(`Evaluating: ${discovery.title}`);
    const result = await this.scorer.evaluate(discovery);
    const status = this.scorer.determineStatus(result.totalScore);
    this.log(
      `Score: ${result.totalScore}/100 | Status: ${status} | Recommendation: ${result.recommendation}`
    );
    if (this.onDecision) {
      await this.onDecision(discovery, result, status);
    }
    return { discovery, result, status };
  }
  async evaluateMany(discoveries) {
    this.log(`Evaluating ${discoveries.length} discoveries`);
    const results = [];
    for (const discovery of discoveries) {
      const scored = await this.evaluate(discovery);
      results.push(scored);
    }
    results.sort((a, b) => b.result.totalScore - a.result.totalScore);
    const approved = results.filter((r) => r.status === "auto_approve").length;
    const review = results.filter((r) => r.status === "human_review").length;
    const rejected = results.filter((r) => r.status === "reject").length;
    this.log(
      `Results: ${approved} auto-approved, ${review} for review, ${rejected} rejected`
    );
    return results;
  }
  async evaluateDiscovery(discovery) {
    if (!discovery) {
      return this.createResult(false, null, "No discovery provided");
    }
    try {
      const scored = await this.evaluate(discovery);
      return this.createResult(
        true,
        scored,
        void 0,
        scored.result.confidence,
        `Evaluated "${discovery.title}": ${scored.result.totalScore}/100 (${scored.status})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return this.createResult(false, null, message);
    }
  }
  async evaluateBatch(discoveries) {
    if (!discoveries || discoveries.length === 0) {
      return this.createResult(false, null, "No discoveries provided");
    }
    try {
      const results = await this.evaluateMany(discoveries);
      const summary = {
        total: results.length,
        autoApproved: results.filter((r) => r.status === "auto_approve"),
        forReview: results.filter((r) => r.status === "human_review"),
        rejected: results.filter((r) => r.status === "reject"),
        topDiscoveries: results.slice(0, 5)
      };
      return this.createResult(
        true,
        summary,
        void 0,
        0.9,
        `Evaluated ${results.length} discoveries: ${summary.autoApproved.length} auto-approved, ${summary.forReview.length} for review`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return this.createResult(false, null, message);
    }
  }
  // Convenience methods for filtering
  getAutoApproved(results) {
    return results.filter((r) => r.status === "auto_approve");
  }
  getForReview(results) {
    return results.filter((r) => r.status === "human_review");
  }
  getRejected(results) {
    return results.filter((r) => r.status === "reject");
  }
  // Update thresholds dynamically
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
    this.log(`Updated thresholds: ${JSON.stringify(this.thresholds)}`);
  }
};
export {
  DEFAULT_THRESHOLDS,
  DecisionAgent,
  DecisionResultSchema,
  DecisionScorer,
  DecisionScoresSchema,
  LLMDecisionResponseSchema,
  PersonaEvaluationSchema,
  PersonaVerdictSchema,
  RecommendationSchema,
  RoleStormingConsensusSchema,
  RoleStormingResultSchema,
  SCORING_WEIGHTS,
  SYSTEM_PROMPT,
  buildEvaluationPrompt
};
//# sourceMappingURL=index.js.map