import type { HuntDiscovery } from "@gicm/hunter-agent";
import {
  DEFAULT_THRESHOLDS,
  type DecisionResult,
  type DecisionScores,
  type DecisionStatus,
  type DecisionThresholds,
  LLMDecisionResponseSchema,
  type Recommendation,
  SCORING_WEIGHTS,
} from "./types.js";
import { buildEvaluationPrompt, SYSTEM_PROMPT } from "./prompts.js";

export interface ScorerConfig {
  llmProvider: "openai" | "anthropic" | "gemini";
  apiKey: string;
  model?: string;
  thresholds?: DecisionThresholds;
}

export class DecisionScorer {
  private config: ScorerConfig;
  private thresholds: DecisionThresholds;

  constructor(config: ScorerConfig) {
    this.config = config;
    this.thresholds = config.thresholds ?? DEFAULT_THRESHOLDS;
  }

  async evaluate(discovery: HuntDiscovery): Promise<DecisionResult> {
    const prompt = buildEvaluationPrompt(discovery);

    try {
      const response = await this.callLLM(prompt);
      const parsed = this.parseResponse(response);
      return this.validateAndNormalize(parsed);
    } catch (error) {
      // Fallback to heuristic scoring if LLM fails
      console.warn("[DecisionScorer] LLM evaluation failed, using heuristics:", error);
      return this.heuristicScore(discovery);
    }
  }

  async evaluateBatch(
    discoveries: HuntDiscovery[]
  ): Promise<Map<string, DecisionResult>> {
    const results = new Map<string, DecisionResult>();

    // Evaluate in parallel with rate limiting
    const batchSize = 5;
    for (let i = 0; i < discoveries.length; i += batchSize) {
      const batch = discoveries.slice(i, i + batchSize);
      const evaluations = await Promise.all(
        batch.map((d) => this.evaluate(d).then((r) => [d.id, r] as const))
      );

      for (const [id, result] of evaluations) {
        results.set(id, result);
      }
    }

    return results;
  }

  determineStatus(score: number): DecisionStatus {
    if (score >= this.thresholds.autoApprove) return "auto_approve";
    if (score >= this.thresholds.humanReview) return "human_review";
    return "reject";
  }

  private async callLLM(prompt: string): Promise<string> {
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

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ?? "";
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model ?? "claude-3-haiku-20240307",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text ?? "";
  }

  private async callGemini(prompt: string): Promise<string> {
    const model = this.config.model ?? "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text ?? "";
  }

  private parseResponse(response: string): DecisionResult {
    // Extract JSON from response
    let jsonStr = response;

    // Try to extract from code blocks
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    // Try to find JSON object
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
        quality: validated.scores.quality.score,
      },
      totalScore: validated.totalScore,
      recommendation: validated.recommendation,
      reasoning: validated.reasoning,
      summary: validated.summary,
      suggestedAction: validated.suggestedAction,
      tags: validated.tags,
      riskLevel: validated.riskLevel,
      riskFactors: validated.riskFactors,
      estimatedEffort: validated.estimatedEffort,
      confidence: validated.confidence,
    };
  }

  private validateAndNormalize(result: DecisionResult): DecisionResult {
    // Recalculate total score with weights
    const calculatedTotal =
      result.scores.relevance * SCORING_WEIGHTS.relevance +
      result.scores.impact * SCORING_WEIGHTS.impact +
      result.scores.effort * SCORING_WEIGHTS.effort +
      result.scores.timing * SCORING_WEIGHTS.timing +
      result.scores.quality * SCORING_WEIGHTS.quality;

    // Use average of LLM total and calculated total
    const normalizedTotal = Math.round(
      (result.totalScore + calculatedTotal) / 2
    );

    return {
      ...result,
      totalScore: Math.min(100, Math.max(0, normalizedTotal)),
    };
  }

  // Fallback heuristic scoring when LLM is unavailable
  private heuristicScore(discovery: HuntDiscovery): DecisionResult {
    const factors = discovery.relevanceFactors;
    const metrics = discovery.metrics;

    // Relevance scoring
    let relevance = 30; // Base score
    if (factors.hasWeb3Keywords) relevance += 25;
    if (factors.hasAIKeywords) relevance += 20;
    if (factors.hasSolanaKeywords) relevance += 15;
    if (factors.hasEthereumKeywords) relevance += 10;
    relevance = Math.min(100, relevance);

    // Impact scoring based on metrics
    let impact = 20;
    const stars = metrics.stars ?? 0;
    const engagement =
      (metrics.points ?? 0) +
      (metrics.likes ?? 0) +
      (metrics.comments ?? 0) * 2;

    if (stars > 1000) impact += 40;
    else if (stars > 500) impact += 30;
    else if (stars > 100) impact += 20;
    else if (stars > 50) impact += 10;

    if (engagement > 100) impact += 20;
    impact = Math.min(100, impact);

    // Effort scoring (higher = easier)
    let effort = 50;
    if (factors.hasTypeScript) effort += 20;
    if (discovery.category === "tooling") effort += 15;
    effort = Math.min(100, effort);

    // Timing scoring
    let timing = 40;
    if (factors.recentActivity) timing += 30;
    if (factors.highEngagement) timing += 30;
    timing = Math.min(100, timing);

    // Quality scoring
    let quality = 40;
    if (factors.hasTypeScript) quality += 20;
    if (discovery.language) quality += 10;
    if (discovery.description && discovery.description.length > 50) quality += 15;
    quality = Math.min(100, quality);

    const scores: DecisionScores = {
      relevance,
      impact,
      effort,
      timing,
      quality,
    };

    const totalScore = Math.round(
      relevance * SCORING_WEIGHTS.relevance +
        impact * SCORING_WEIGHTS.impact +
        effort * SCORING_WEIGHTS.effort +
        timing * SCORING_WEIGHTS.timing +
        quality * SCORING_WEIGHTS.quality
    );

    const recommendation: Recommendation =
      totalScore >= 70
        ? "build"
        : totalScore >= 50
          ? "integrate"
          : totalScore >= 30
            ? "monitor"
            : "ignore";

    return {
      scores,
      totalScore,
      recommendation,
      reasoning: "Heuristic scoring (LLM unavailable)",
      summary: `${discovery.source} discovery with ${totalScore}/100 score`,
      suggestedAction:
        recommendation === "build"
          ? "Create gICM integration"
          : recommendation === "integrate"
            ? "Evaluate for integration"
            : recommendation === "monitor"
              ? "Add to watchlist"
              : "No action needed",
      tags: discovery.tags,
      riskLevel: totalScore < 30 ? "low" : totalScore < 60 ? "medium" : "low",
      riskFactors:
        totalScore < 50 ? ["Low relevance", "Needs manual review"] : [],
      estimatedEffort: "Unknown",
      confidence: 0.6, // Lower confidence for heuristic scoring
    };
  }
}
