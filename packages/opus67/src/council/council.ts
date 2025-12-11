/**
 * OPUS 67 LLM Council
 * Karpathy-style 3-stage peer review deliberation
 */

import { EventEmitter } from "eventemitter3";
import { router } from "../models/router.js";
import { tokenTracker, type ModelName } from "../benchmark/token-tracker.js";
import { latencyProfiler } from "../benchmark/latency-profiler.js";
import { metricsCollector } from "../benchmark/metrics-collector.js";

// Types
export interface CouncilMember {
  id: string;
  name: string;
  model: ModelName;
  role: "contributor" | "reviewer" | "chairman";
  specialty?: string;
}

export interface CouncilResponse {
  memberId: string;
  model: ModelName;
  content: string;
  confidence: number;
  reasoning?: string;
  tokens: { input: number; output: number };
  duration: number;
}

export interface PeerRanking {
  rankerId: string;
  rankings: Array<{
    responseId: string;
    rank: number;
    score: number;
    feedback: string;
  }>;
}

export interface DeliberationResult {
  question: string;
  stage1Responses: CouncilResponse[];
  stage2Rankings: PeerRanking[];
  stage3Synthesis: {
    finalAnswer: string;
    confidence: number;
    reasoning: string;
    bestContributors: string[];
    dissent?: string;
  };
  metrics: {
    totalDuration: number;
    totalTokens: number;
    totalCost: number;
    consensusScore: number;
  };
}

export interface CouncilConfig {
  members: CouncilMember[];
  chairman: CouncilMember;
  requireUnanimity: boolean;
  minConfidence: number;
  maxRounds: number;
  timeout: number;
}

interface CouncilEvents {
  "stage:start": (stage: 1 | 2 | 3, description: string) => void;
  "stage:complete": (stage: 1 | 2 | 3, duration: number) => void;
  "member:responding": (member: CouncilMember) => void;
  "member:responded": (response: CouncilResponse) => void;
  "deliberation:complete": (result: DeliberationResult) => void;
}

// Default council configuration
const DEFAULT_MEMBERS: CouncilMember[] = [
  {
    id: "gemini",
    name: "Gemini Flash",
    model: "gemini-2.0-flash",
    role: "contributor",
    specialty: "speed",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    model: "deepseek-chat",
    role: "contributor",
    specialty: "code",
  },
  {
    id: "claude-haiku",
    name: "Claude Haiku",
    model: "claude-haiku-3.5",
    role: "contributor",
    specialty: "concise",
  },
];

const DEFAULT_CHAIRMAN: CouncilMember = {
  id: "chairman",
  name: "Claude Sonnet (Chairman)",
  model: "claude-sonnet-4",
  role: "chairman",
  specialty: "synthesis",
};

/**
 * LLMCouncil - Multi-model deliberation system
 */
export class LLMCouncil extends EventEmitter<CouncilEvents> {
  private config: CouncilConfig;
  private executor:
    | ((prompt: string, model: ModelName) => Promise<string>)
    | null = null;

  constructor(config?: Partial<CouncilConfig>) {
    super();
    this.config = {
      members: config?.members ?? DEFAULT_MEMBERS,
      chairman: config?.chairman ?? DEFAULT_CHAIRMAN,
      requireUnanimity: config?.requireUnanimity ?? false,
      minConfidence: config?.minConfidence ?? 0.7,
      maxRounds: config?.maxRounds ?? 1,
      timeout: config?.timeout ?? 60000,
    };
  }

  /**
   * Set the executor function for LLM calls
   */
  setExecutor(
    executor: (prompt: string, model: ModelName) => Promise<string>
  ): void {
    this.executor = executor;
  }

  /**
   * Create a mock executor for testing
   */
  private createMockExecutor(): (
    prompt: string,
    model: ModelName
  ) => Promise<string> {
    return async (prompt: string, model: ModelName): Promise<string> => {
      // Simulate latency
      await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));

      // Generate mock responses based on model
      if (prompt.includes("STAGE 1")) {
        return `[${model}] Analysis: This is a thoughtful response to the question. Key points include efficiency, maintainability, and scalability. Confidence: 0.85`;
      } else if (prompt.includes("STAGE 2")) {
        return `Rankings:
1. Response B (Score: 9/10) - Most comprehensive
2. Response A (Score: 8/10) - Good but less detailed
3. Response C (Score: 7/10) - Concise but missing context`;
      } else if (prompt.includes("STAGE 3")) {
        return `SYNTHESIS: After reviewing all responses, the council recommends a balanced approach combining the thoroughness of Response B with the clarity of Response A. The consensus confidence is 0.88. Key insight: Focus on incremental improvements while maintaining backward compatibility.`;
      }

      return `Response from ${model}: ${prompt.slice(0, 50)}...`;
    };
  }

  /**
   * Stage 1: Independent responses from all members
   */
  private async stage1(question: string): Promise<CouncilResponse[]> {
    this.emit("stage:start", 1, "Gathering independent responses");
    const spanId = latencyProfiler.startSpan("council:stage1");

    const executor = this.executor ?? this.createMockExecutor();
    const responses: CouncilResponse[] = [];

    // Run all members in parallel
    const promises = this.config.members.map(async (member) => {
      this.emit("member:responding", member);
      const memberSpan = latencyProfiler.startSpan(`member:${member.id}`);

      const prompt = `STAGE 1: INDEPENDENT ANALYSIS

You are ${member.name}, an expert in ${member.specialty || "general analysis"}.

QUESTION: ${question}

Provide your independent analysis. Be thorough but concise.
Include your confidence level (0-1) at the end.
Format: [Your analysis...] Confidence: X.XX`;

      const startTime = Date.now();
      const content = await executor(prompt, member.model);
      const duration = latencyProfiler.endSpan(memberSpan);

      // Parse confidence from response
      const confidenceMatch = content.match(/Confidence:\s*([\d.]+)/i);
      const confidence = confidenceMatch
        ? parseFloat(confidenceMatch[1])
        : 0.75;

      // Estimate tokens
      const inputTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(content.length / 4);

      const response: CouncilResponse = {
        memberId: member.id,
        model: member.model,
        content,
        confidence,
        tokens: { input: inputTokens, output: outputTokens },
        duration,
      };

      tokenTracker.record(
        member.id,
        "council-stage1",
        member.model,
        response.tokens
      );
      this.emit("member:responded", response);

      return response;
    });

    const results = await Promise.all(promises);
    responses.push(...results);

    const stage1Duration = latencyProfiler.endSpan(spanId);
    this.emit("stage:complete", 1, stage1Duration);

    return responses;
  }

  /**
   * Stage 2: Peer review and ranking
   */
  private async stage2(
    responses: CouncilResponse[],
    question: string
  ): Promise<PeerRanking[]> {
    this.emit("stage:start", 2, "Peer review and ranking");
    const spanId = latencyProfiler.startSpan("council:stage2");

    const executor = this.executor ?? this.createMockExecutor();
    const rankings: PeerRanking[] = [];

    // Each member ranks others (anonymized)
    const promises = this.config.members.map(async (member) => {
      const memberSpan = latencyProfiler.startSpan(`ranking:${member.id}`);

      // Create anonymized response list (excluding self)
      const otherResponses = responses
        .filter((r) => r.memberId !== member.id)
        .map(
          (r, i) => `Response ${String.fromCharCode(65 + i)}:\n${r.content}`
        );

      const prompt = `STAGE 2: PEER REVIEW

You are ${member.name}. Review and rank these responses to the question:
"${question}"

${otherResponses.join("\n\n---\n\n")}

Rank each response (best first). For each, provide:
- Rank (1 = best)
- Score (1-10)
- Brief feedback

Format:
1. Response X (Score: Y/10) - [feedback]
2. Response X (Score: Y/10) - [feedback]
...`;

      const content = await executor(prompt, member.model);
      latencyProfiler.endSpan(memberSpan);

      // Parse rankings
      const rankingLines =
        content.match(/\d+\.\s*Response\s+(\w)\s*\(Score:\s*(\d+)/gi) || [];
      const parsedRankings = rankingLines.map((line, index) => {
        const match = line.match(/Response\s+(\w)\s*\(Score:\s*(\d+)/i);
        return {
          responseId: match ? `response-${match[1]}` : `response-${index}`,
          rank: index + 1,
          score: match ? parseInt(match[2]) : 5,
          feedback: "Extracted from ranking",
        };
      });

      return {
        rankerId: member.id,
        rankings: parsedRankings,
      };
    });

    const results = await Promise.all(promises);
    rankings.push(...results);

    const stage2Duration = latencyProfiler.endSpan(spanId);
    this.emit("stage:complete", 2, stage2Duration);

    return rankings;
  }

  /**
   * Stage 3: Chairman synthesis
   */
  private async stage3(
    question: string,
    responses: CouncilResponse[],
    rankings: PeerRanking[]
  ): Promise<DeliberationResult["stage3Synthesis"]> {
    this.emit("stage:start", 3, "Chairman synthesis");
    const spanId = latencyProfiler.startSpan("council:stage3");

    const executor = this.executor ?? this.createMockExecutor();
    const chairman = this.config.chairman;

    // Compile all responses and rankings
    const responsesSummary = responses
      .map(
        (r, i) =>
          `${String.fromCharCode(65 + i)}. [${r.model}] (Confidence: ${r.confidence.toFixed(2)})\n${r.content}`
      )
      .join("\n\n");

    const rankingsSummary = rankings
      .map(
        (r) =>
          `Reviewer ${r.rankerId}: ${r.rankings.map((rk) => `${rk.responseId}(${rk.score})`).join(", ")}`
      )
      .join("\n");

    const prompt = `STAGE 3: CHAIRMAN SYNTHESIS

You are the Chairman of this LLM Council. Your role is to synthesize the best answer.

ORIGINAL QUESTION: ${question}

COUNCIL RESPONSES:
${responsesSummary}

PEER RANKINGS:
${rankingsSummary}

Provide the final synthesized answer that:
1. Combines the best insights from all responses
2. Resolves any conflicts or disagreements
3. Adds your own expert perspective
4. Notes any significant dissent

Format your response as:
FINAL ANSWER: [synthesized answer]
CONFIDENCE: [0-1]
REASONING: [why this synthesis is best]
BEST CONTRIBUTORS: [list member IDs]
DISSENT: [any notable disagreements, or "None"]`;

    const content = await executor(prompt, chairman.model);
    latencyProfiler.endSpan(spanId);

    // Parse synthesis
    const finalAnswer =
      content.match(/FINAL ANSWER:\s*(.+?)(?=CONFIDENCE:|$)/is)?.[1]?.trim() ||
      content;
    const confidence = parseFloat(
      content.match(/CONFIDENCE:\s*([\d.]+)/i)?.[1] || "0.8"
    );
    const reasoning =
      content
        .match(/REASONING:\s*(.+?)(?=BEST CONTRIBUTORS:|$)/is)?.[1]
        ?.trim() || "";
    const bestContributors =
      content
        .match(/BEST CONTRIBUTORS:\s*(.+?)(?=DISSENT:|$)/is)?.[1]
        ?.trim()
        .split(/[,\s]+/) || [];
    const dissent = content.match(/DISSENT:\s*(.+?)$/is)?.[1]?.trim();

    // Record chairman tokens
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(content.length / 4);
    tokenTracker.record(chairman.id, "council-stage3", chairman.model, {
      input: inputTokens,
      output: outputTokens,
    });

    this.emit(
      "stage:complete",
      3,
      latencyProfiler.getStats("council:stage3").avg
    );

    return {
      finalAnswer,
      confidence,
      reasoning,
      bestContributors,
      dissent: dissent !== "None" ? dissent : undefined,
    };
  }

  /**
   * Run full deliberation
   */
  async deliberate(question: string): Promise<DeliberationResult> {
    const totalSpan = latencyProfiler.startSpan("council:deliberation");

    // Stage 1: Independent responses
    const stage1Responses = await this.stage1(question);

    // Stage 2: Peer review
    const stage2Rankings = await this.stage2(stage1Responses, question);

    // Stage 3: Synthesis
    const stage3Synthesis = await this.stage3(
      question,
      stage1Responses,
      stage2Rankings
    );

    const totalDuration = latencyProfiler.endSpan(totalSpan);

    // Calculate metrics
    const totalTokens = stage1Responses.reduce(
      (sum, r) => sum + r.tokens.input + r.tokens.output,
      0
    );
    const totalCost = tokenTracker.getTotalCost();

    // Calculate consensus score based on ranking agreement
    const consensusScore = this.calculateConsensus(stage2Rankings);

    metricsCollector.recordCouncilScore(consensusScore);

    const result: DeliberationResult = {
      question,
      stage1Responses,
      stage2Rankings,
      stage3Synthesis,
      metrics: {
        totalDuration,
        totalTokens,
        totalCost,
        consensusScore,
      },
    };

    this.emit("deliberation:complete", result);
    return result;
  }

  /**
   * Calculate consensus score from rankings
   */
  private calculateConsensus(rankings: PeerRanking[]): number {
    if (rankings.length < 2) return 1;

    // Compare ranking orders between reviewers
    let agreements = 0;
    let comparisons = 0;

    for (let i = 0; i < rankings.length; i++) {
      for (let j = i + 1; j < rankings.length; j++) {
        const r1 = rankings[i].rankings;
        const r2 = rankings[j].rankings;

        for (const rank1 of r1) {
          const rank2 = r2.find((r) => r.responseId === rank1.responseId);
          if (rank2) {
            comparisons++;
            if (Math.abs(rank1.rank - rank2.rank) <= 1) {
              agreements++;
            }
          }
        }
      }
    }

    return comparisons > 0 ? agreements / comparisons : 1;
  }

  /**
   * Get council configuration
   */
  getConfig(): CouncilConfig {
    return { ...this.config };
  }

  /**
   * Format deliberation result for display
   */
  formatResult(result: DeliberationResult): string {
    return `
╔══════════════════════════════════════════════════════════════════╗
║                     LLM COUNCIL DELIBERATION                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  QUESTION                                                         ║
║  ─────────────────────────────────────────────────────────────    ║
║  ${result.question.slice(0, 60).padEnd(60)} ║
║                                                                   ║
║  STAGE 1: INDEPENDENT RESPONSES (${result.stage1Responses.length} members)                    ║
║  ─────────────────────────────────────────────────────────────    ║
${result.stage1Responses
  .map(
    (r) =>
      `║  ${r.memberId.padEnd(15)} ${r.model.padEnd(20)} ${(r.confidence * 100).toFixed(0)}% conf  ${r.duration.toFixed(0)}ms ║`
  )
  .join("\n")}
║                                                                   ║
║  STAGE 2: PEER RANKINGS                                           ║
║  ─────────────────────────────────────────────────────────────    ║
║  Consensus Score: ${(result.metrics.consensusScore * 100).toFixed(0)}%                                        ║
║                                                                   ║
║  STAGE 3: CHAIRMAN SYNTHESIS                                      ║
║  ─────────────────────────────────────────────────────────────    ║
║  Confidence: ${(result.stage3Synthesis.confidence * 100).toFixed(0)}%                                            ║
║  Best Contributors: ${result.stage3Synthesis.bestContributors.join(", ").slice(0, 40).padEnd(40)} ║
║                                                                   ║
║  FINAL ANSWER:                                                    ║
║  ${result.stage3Synthesis.finalAnswer.slice(0, 60).padEnd(60)} ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  METRICS                                                          ║
║  ─────────────────────────────────────────────────────────────    ║
║  Duration: ${(result.metrics.totalDuration / 1000).toFixed(2)}s   Tokens: ${result.metrics.totalTokens}   Cost: $${result.metrics.totalCost.toFixed(4)}       ║
╚══════════════════════════════════════════════════════════════════╝`;
  }
}

// Export factory
export function createCouncil(config?: Partial<CouncilConfig>): LLMCouncil {
  return new LLMCouncil(config);
}

// Export default singleton
export const council = new LLMCouncil();
