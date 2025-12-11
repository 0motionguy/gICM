/**
 * OPUS 67 v5.0 - Extended Thinking Integration
 *
 * Hybrid reasoning system leveraging Claude Opus 4.5's extended thinking capabilities.
 * Automatically classifies task complexity and routes to optimal thinking mode.
 *
 * Thinking Modes:
 * - instant:  Simple queries, no extended thinking (0-2 complexity)
 * - standard: Moderate queries, light thinking (~500 tokens) (3-5 complexity)
 * - deep:     Complex queries, substantial thinking (~2K tokens) (6-8 complexity)
 * - maximum:  Critical queries, maximum thinking (~8K tokens) (9-10 complexity)
 */

import Anthropic from "@anthropic-ai/sdk";
import { EventEmitter } from "eventemitter3";
import type { RouteResult } from "../models/router.js";

// Types
export type ThinkingMode = "instant" | "standard" | "deep" | "maximum";
export type ComplexityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ReasoningConfig {
  mode?: ThinkingMode;
  maxThinkingTokens?: number;
  enableChainOfThought?: boolean;
  budgetConstraint?: number; // Max cost in dollars
  anthropicApiKey?: string;
}

export interface ComplexityAnalysis {
  level: ComplexityLevel;
  mode: ThinkingMode;
  reasoning: string;
  factors: {
    multiStep: number; // 0-3: Single step → Multi-day planning
    ambiguity: number; // 0-3: Clear → Highly ambiguous
    depth: number; // 0-3: Surface → Deep analysis required
    criticality: number; // 0-3: Low stakes → Mission critical
  };
  confidence: number; // 0-1
}

export interface ReasoningRequest {
  task: string;
  context?: string;
  systemPrompt?: string;
  forceMode?: ThinkingMode;
  maxTokens?: number;
  temperature?: number;
}

export interface ReasoningResponse {
  content: string;
  thinkingContent?: string;
  complexity: ComplexityAnalysis;
  mode: ThinkingMode;
  tokensUsed: {
    input: number;
    output: number;
    thinking?: number;
  };
  cost: number;
  latencyMs: number;
  model: string;
}

interface ReasoningEvents {
  "complexity:analyzed": (analysis: ComplexityAnalysis) => void;
  "thinking:start": (mode: ThinkingMode) => void;
  "thinking:complete": (response: ReasoningResponse) => void;
  error: (error: Error) => void;
}

/**
 * Complexity classification keywords and patterns
 */
const COMPLEXITY_PATTERNS = {
  simple: [
    "what is",
    "define",
    "explain",
    "list",
    "show me",
    "how to",
    "quick question",
    "simple task",
  ],
  moderate: [
    "analyze",
    "compare",
    "evaluate",
    "design",
    "implement",
    "refactor",
    "optimize",
    "fix",
    "debug",
  ],
  complex: [
    "architect",
    "system design",
    "multi-step",
    "end-to-end",
    "comprehensive",
    "strategic",
    "critical decision",
    "trade-offs",
  ],
  critical: [
    "production",
    "mission critical",
    "security audit",
    "compliance",
    "financial decision",
    "irreversible",
    "high stakes",
    "enterprise",
  ],
};

/**
 * Token budgets for each thinking mode
 */
const THINKING_BUDGETS: Record<ThinkingMode, number> = {
  instant: 0,
  standard: 500,
  deep: 2000,
  maximum: 8000,
};

/**
 * Pricing for Claude Opus 4.5 (per million tokens)
 * Source: Anthropic pricing page (Jan 2025)
 */
const OPUS_45_PRICING = {
  input: 3.0, // $3/M input tokens
  output: 15.0, // $15/M output tokens
  thinking: 3.0, // $3/M thinking tokens (same as input)
};

/**
 * HybridReasoningEngine - Extended thinking orchestrator
 */
export class HybridReasoningEngine extends EventEmitter<ReasoningEvents> {
  private config: Required<ReasoningConfig>;
  private anthropic: Anthropic | null = null;

  constructor(config?: ReasoningConfig) {
    super();

    this.config = {
      mode: config?.mode ?? "standard",
      maxThinkingTokens: config?.maxThinkingTokens ?? 8000,
      enableChainOfThought: config?.enableChainOfThought ?? true,
      budgetConstraint: config?.budgetConstraint ?? 1.0,
      anthropicApiKey:
        config?.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY ?? "",
    };

    // Initialize Anthropic client
    if (this.config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: this.config.anthropicApiKey,
      });
    }
  }

  /**
   * Classify task complexity (1-10 scale)
   */
  async classifyComplexity(
    task: string,
    context?: string
  ): Promise<ComplexityAnalysis> {
    const fullText = `${task} ${context || ""}`.toLowerCase();

    // Score each factor (0-3)
    const factors = {
      multiStep: this.scoreMultiStep(fullText),
      ambiguity: this.scoreAmbiguity(fullText),
      depth: this.scoreDepth(fullText),
      criticality: this.scoreCriticality(fullText),
    };

    // Calculate raw score (0-12)
    const rawScore = Object.values(factors).reduce(
      (sum, score) => sum + score,
      0
    );

    // Map to 1-10 scale
    const level = Math.min(
      10,
      Math.max(1, Math.ceil((rawScore / 12) * 10))
    ) as ComplexityLevel;

    // Determine thinking mode
    const mode = this.complexityToMode(level);

    // Generate reasoning
    const reasoning = this.generateReasoningExplanation(factors, level, mode);

    // Calculate confidence based on keyword matches
    const confidence = this.calculateConfidence(fullText, mode);

    const analysis: ComplexityAnalysis = {
      level,
      mode,
      reasoning,
      factors,
      confidence,
    };

    this.emit("complexity:analyzed", analysis);
    return analysis;
  }

  /**
   * Score multi-step complexity
   */
  private scoreMultiStep(text: string): number {
    let score = 0;

    // Maximum complexity indicators
    if (
      /\b(multi-day|multi-stage|long-horizon|autonomous|entire|full build|sprint)\b/.test(
        text
      )
    )
      score = Math.max(score, 3);
    // High complexity - architecture, system design, comprehensive plans
    if (
      /\b(architecture|system design|microservices|distributed|scalable)\b/.test(
        text
      )
    )
      score = Math.max(score, 3);
    // Security audit/compliance is inherently multi-step
    if (/\b(security audit|compliance|smart contract|defi)\b/.test(text))
      score = Math.max(score, 3);
    if (
      /\b(comprehensive|end-to-end|load balancing|failover|orchestrat|perform)\b/.test(
        text
      )
    )
      score = Math.max(score, 2);
    if (/\b(many|numerous|complex|multi-step|audit)\b/.test(text))
      score = Math.max(score, 2);
    if (
      /\b(few|couple|several|multiple|implement|build|create|design)\b/.test(
        text
      )
    )
      score = Math.max(score, 1);

    // Low complexity indicators - only apply if no higher score
    if (
      score === 0 &&
      /\b(single|one|quick|simple|what|how to|syntax|show me)\b/.test(text)
    )
      return 0;

    // Default: lean towards simple for short queries
    return score > 0 ? score : text.length < 30 ? 0 : 1;
  }

  /**
   * Score ambiguity level
   */
  private scoreAmbiguity(text: string): number {
    // High ambiguity
    if (
      /\b(open-ended|research|investigate|discover|explore approaches)\b/.test(
        text
      )
    )
      return 3;
    if (
      /\b(unclear|ambiguous|uncertain|tradeoffs?|trade-offs?|consider)\b/.test(
        text
      )
    )
      return 2;
    if (/\b(maybe|could|might|various|different)\b/.test(text)) return 1;

    // Low ambiguity
    if (
      /\b(exactly|precisely|specifically|clear|what is|define|explain)\b/.test(
        text
      )
    )
      return 0;

    // Questions are usually clearer
    return /\?/.test(text) ? 0 : 1;
  }

  /**
   * Score required depth
   */
  private scoreDepth(text: string): number {
    let score = 0;

    // Maximum depth - exhaustive analysis, full architecture
    if (/\b(exhaustive|complete|full analysis|deep dive|thorough)\b/.test(text))
      score = Math.max(score, 3);
    // High depth - architecture, system design, scalable
    if (
      /\b(architecture|scalable|system design|load balancing|failover)\b/.test(
        text
      )
    )
      score = Math.max(score, 3);
    // Security audit/smart contract requires deep analysis
    if (/\b(security audit|smart contract|defi|compliance)\b/.test(text))
      score = Math.max(score, 3);
    if (
      /\b(comprehensive|detailed|in-depth|extensive|websocket|audit)\b/.test(
        text
      )
    )
      score = Math.max(score, 2);
    if (/\b(analyze|understand|evaluate|design|implement)\b/.test(text))
      score = Math.max(score, 1);

    // Low depth - only apply if no higher score
    if (
      score === 0 &&
      /\b(surface|brief|overview|summary|quick|what is|how to)\b/.test(text)
    )
      return 0;

    // Short queries are usually simpler
    return score > 0 ? score : text.length < 40 ? 0 : 1;
  }

  /**
   * Score criticality
   */
  private scoreCriticality(text: string): number {
    let score = 0;

    // Maximum criticality - mission-critical, security audit, financial compliance
    if (
      /\b(mission-critical|security audit|financial compliance|irreversible)\b/.test(
        text
      )
    )
      score = Math.max(score, 3);
    // High criticality - security, compliance, production, defi, smart contract
    if (/\b(security|compliance|financial|defi|smart contract)\b/.test(text))
      score = Math.max(score, 3);
    if (/\b(production|audit|critical)\b/.test(text))
      score = Math.max(score, 2);
    if (/\b(important|significant)\b/.test(text)) score = Math.max(score, 1);
    if (/\b(development|staging|implement)\b/.test(text))
      score = Math.max(score, 1);

    // Non-critical - only apply if no higher score
    if (
      score === 0 &&
      /\b(test|experiment|try|draft|example|sample|learn|what is)\b/.test(text)
    )
      return 0;

    return score;
  }

  /**
   * Map complexity level to thinking mode
   */
  private complexityToMode(level: ComplexityLevel): ThinkingMode {
    if (level <= 2) return "instant";
    if (level <= 5) return "standard";
    if (level <= 8) return "deep";
    return "maximum";
  }

  /**
   * Generate reasoning explanation
   */
  private generateReasoningExplanation(
    factors: ComplexityAnalysis["factors"],
    level: ComplexityLevel,
    mode: ThinkingMode
  ): string {
    const parts: string[] = [];

    if (factors.multiStep >= 2) parts.push("multi-step reasoning required");
    if (factors.ambiguity >= 2) parts.push("high ambiguity");
    if (factors.depth >= 2) parts.push("deep analysis needed");
    if (factors.criticality >= 2) parts.push("critical decision");

    const factorSummary =
      parts.length > 0 ? parts.join(", ") : "straightforward task";
    return `Complexity ${level}/10 (${mode} mode): ${factorSummary}`;
  }

  /**
   * Calculate confidence in classification
   */
  private calculateConfidence(text: string, mode: ThinkingMode): number {
    let matches = 0;
    let total = 0;

    const modePatterns =
      mode === "instant"
        ? COMPLEXITY_PATTERNS.simple
        : mode === "standard"
          ? COMPLEXITY_PATTERNS.moderate
          : mode === "deep"
            ? COMPLEXITY_PATTERNS.complex
            : COMPLEXITY_PATTERNS.critical;

    for (const pattern of modePatterns) {
      total++;
      if (text.includes(pattern)) matches++;
    }

    return Math.max(0.5, matches / total); // Minimum 50% confidence
  }

  /**
   * Main reasoning method - processes task with optimal thinking mode
   */
  async reason(request: ReasoningRequest): Promise<ReasoningResponse> {
    const startTime = performance.now();

    if (!this.anthropic) {
      throw new Error("[HybridReasoning] Anthropic API key not configured");
    }

    // 1. Classify complexity
    const complexity = await this.classifyComplexity(
      request.task,
      request.context
    );
    const mode = request.forceMode ?? complexity.mode;

    this.emit("thinking:start", mode);

    // 2. Build system prompt
    const systemPrompt =
      request.systemPrompt ?? this.buildSystemPrompt(mode, complexity);

    // 3. Build messages
    const messages: Anthropic.MessageParam[] = [];

    if (request.context) {
      messages.push({
        role: "user",
        content: request.context,
      });
      messages.push({
        role: "assistant",
        content: "Understood. I'll use this context for the next request.",
      });
    }

    messages.push({
      role: "user",
      content: request.task,
    });

    // 4. Configure thinking budget
    const thinkingBudget = Math.min(
      THINKING_BUDGETS[mode],
      this.config.maxThinkingTokens
    );

    // 5. Make API call
    const baseParams: Anthropic.MessageCreateParamsNonStreaming = {
      model: "claude-opus-4-5-20250929",
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 1.0,
      system: systemPrompt,
      messages,
    };

    // Cast to any for extended thinking features (not in official SDK types yet)
    const apiRequest =
      mode === "instant"
        ? baseParams
        : ({
            ...baseParams,
            thinking: {
              type: "enabled",
              budget_tokens: thinkingBudget,
            },
          } as any);

    const response = await this.anthropic.messages.create(apiRequest);

    // 6. Extract content and thinking
    let content = "";
    let thinkingContent: string | undefined;

    for (const block of response.content) {
      if (block.type === "text") {
        content += block.text;
      } else if ((block as any).type === "thinking") {
        // Cast to any for extended thinking block type
        thinkingContent = (thinkingContent ?? "") + (block as any).thinking;
      }
    }

    // 7. Calculate metrics
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const thinkingTokens =
      mode !== "instant" && "thinking_tokens" in response.usage
        ? ((response.usage as any).thinking_tokens ?? 0)
        : 0;

    const cost = this.calculateCost(inputTokens, outputTokens, thinkingTokens);
    const latencyMs = performance.now() - startTime;

    const result: ReasoningResponse = {
      content,
      thinkingContent,
      complexity,
      mode,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        thinking: thinkingTokens,
      },
      cost,
      latencyMs,
      model: "claude-opus-4-5-20250929",
    };

    this.emit("thinking:complete", result);
    return result;
  }

  /**
   * Build system prompt based on mode and complexity
   */
  private buildSystemPrompt(
    mode: ThinkingMode,
    complexity: ComplexityAnalysis
  ): string {
    const base = `You are OPUS 67 v5.0, powered by Claude Opus 4.5 with extended thinking capabilities.

Current thinking mode: ${mode.toUpperCase()}
Task complexity: ${complexity.level}/10
`;

    const modeInstructions: Record<ThinkingMode, string> = {
      instant: "Provide a quick, direct answer. No extended thinking needed.",
      standard:
        "Think through the problem methodically. Use extended thinking to explore key considerations.",
      deep: "Conduct thorough analysis with extended thinking. Consider multiple approaches, edge cases, and tradeoffs.",
      maximum:
        "Apply maximum extended thinking. This is a critical decision requiring comprehensive reasoning, risk analysis, and strategic planning.",
    };

    return base + modeInstructions[mode];
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(
    inputTokens: number,
    outputTokens: number,
    thinkingTokens: number
  ): number {
    const inputCost = (inputTokens / 1_000_000) * OPUS_45_PRICING.input;
    const outputCost = (outputTokens / 1_000_000) * OPUS_45_PRICING.output;
    const thinkingCost =
      (thinkingTokens / 1_000_000) * OPUS_45_PRICING.thinking;

    return inputCost + outputCost + thinkingCost;
  }

  /**
   * Get mode recommendation for a task
   */
  async recommendMode(
    task: string,
    context?: string
  ): Promise<{
    mode: ThinkingMode;
    complexity: ComplexityLevel;
    reasoning: string;
    estimatedCost: number;
  }> {
    const complexity = await this.classifyComplexity(task, context);

    // Estimate tokens
    const fullText = `${task} ${context || ""}`;
    const inputTokens = Math.ceil(fullText.length / 4);
    const outputTokens = inputTokens * 1.5;
    const thinkingTokens = THINKING_BUDGETS[complexity.mode];

    const estimatedCost = this.calculateCost(
      inputTokens,
      outputTokens,
      thinkingTokens
    );

    return {
      mode: complexity.mode,
      complexity: complexity.level,
      reasoning: complexity.reasoning,
      estimatedCost,
    };
  }

  /**
   * Format reasoning response for display
   */
  formatResponse(response: ReasoningResponse, showThinking = false): string {
    let output = `
╔══════════════════════════════════════════════════════════════════╗
║                  OPUS 67 v5.0 REASONING                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  MODE: ${response.mode.toUpperCase().padEnd(55)} ║
║  COMPLEXITY: ${response.complexity.level}/10 (${response.complexity.reasoning.slice(0, 40).padEnd(40)}) ║
║                                                                  ║
║  TOKENS                                                          ║
║  ────────────────────────────────────────────────────────────    ║
║  Input:    ${String(response.tokensUsed.input).padStart(6)}                                            ║
║  Output:   ${String(response.tokensUsed.output).padStart(6)}                                            ║`;

    if (response.tokensUsed.thinking) {
      output += `
║  Thinking: ${String(response.tokensUsed.thinking).padStart(6)} 🧠                                         ║`;
    }

    output += `
║                                                                  ║
║  PERFORMANCE                                                     ║
║  ────────────────────────────────────────────────────────────    ║
║  Cost:     $${response.cost.toFixed(4).padEnd(47)} ║
║  Latency:  ${response.latencyMs.toFixed(0).padEnd(51)} ms ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

${response.content}`;

    if (showThinking && response.thinkingContent) {
      output += `

─────────────────────────────────────────────────────────────────
🧠 EXTENDED THINKING PROCESS:
─────────────────────────────────────────────────────────────────

${response.thinkingContent}`;
    }

    return output;
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<ReasoningConfig>> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ReasoningConfig>): void {
    this.config = { ...this.config, ...config };

    // Reinitialize Anthropic client if API key changed
    if (config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: config.anthropicApiKey,
      });
    }
  }
}

/**
 * Factory function
 */
export function createReasoningEngine(
  config?: ReasoningConfig
): HybridReasoningEngine {
  return new HybridReasoningEngine(config);
}

/**
 * Global singleton (optional)
 */
let globalEngine: HybridReasoningEngine | null = null;

export function getReasoningEngine(
  config?: ReasoningConfig
): HybridReasoningEngine {
  if (!globalEngine) {
    globalEngine = new HybridReasoningEngine(config);
  }
  return globalEngine;
}
