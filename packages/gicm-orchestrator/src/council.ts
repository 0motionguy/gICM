/**
 * @gicm/orchestrator - Council
 * 3-stage peer review deliberation (Karpathy-style):
 *   Stage 1: Independent responses
 *   Stage 2: Peer ranking (anonymized)
 *   Stage 3: Chairman synthesis
 */

import { EventEmitter } from "node:events";
import type {
  AgentInstance,
  AgentExecutor,
  TaskDefinition,
  TaskResult,
  Vote,
  VotingRound,
} from "./types.js";
import {
  aggregateRankings,
  determineConsensus,
  type RankingEntry,
} from "./ranking.js";
import { selectStrategy, generateSynthesisPrompt } from "./synthesis.js";
import type { ConsensusLevel } from "./types.js";

// =============================================================================
// TYPES
// =============================================================================

export interface CouncilResponse {
  memberId: string;
  content: string;
  confidence: number;
}

export interface PeerRanking {
  rankerId: string;
  rankings: RankingEntry[];
}

export interface DeliberationResult {
  finalAnswer: string;
  rankings: PeerRanking[];
  consensusLevel: ConsensusLevel;
  stages: {
    stage1: CouncilResponse[];
    stage2: PeerRanking[];
    stage3: { chairman: string; synthesis: string };
  };
}

// =============================================================================
// COUNCIL
// =============================================================================

export class Council extends EventEmitter {
  private executor: AgentExecutor;

  constructor(executor: AgentExecutor) {
    super();
    this.executor = executor;
  }

  /**
   * Run a full 3-stage deliberation among council members.
   *
   * Stage 1: Each member independently responds to the task.
   * Stage 2: Each member reviews and ranks all other responses (anonymized).
   * Stage 3: The highest-ranked member synthesizes the final answer.
   */
  async deliberate(
    task: TaskDefinition,
    members: AgentInstance[]
  ): Promise<DeliberationResult> {
    if (members.length < 2) {
      throw new Error("Council requires at least 2 members");
    }

    // -------------------------------------------------------------------------
    // Stage 1: Independent responses
    // -------------------------------------------------------------------------
    this.emit("stage:start", 1, "Gathering independent responses");

    const stage1Responses = await this.stage1(task, members);

    this.emit("stage:complete", 1);

    // -------------------------------------------------------------------------
    // Stage 2: Peer review and ranking
    // -------------------------------------------------------------------------
    this.emit("stage:start", 2, "Peer review and ranking");

    const stage2Rankings = await this.stage2(task, members, stage1Responses);

    this.emit("stage:complete", 2);

    // -------------------------------------------------------------------------
    // Stage 3: Chairman synthesis
    // -------------------------------------------------------------------------
    this.emit("stage:start", 3, "Chairman synthesis");

    // Aggregate rankings to find the best member
    const allEntries: RankingEntry[] = stage2Rankings.flatMap(
      (r) => r.rankings
    );
    const aggregated = aggregateRankings(allEntries);
    const consensusLevel = determineConsensus(aggregated);

    // Chairman = highest-ranked member
    let chairmanId = members[0].id;
    let bestScore = -1;
    for (const [respId, score] of aggregated) {
      if (score > bestScore) {
        bestScore = score;
        chairmanId = respId;
      }
    }

    const chairman = members.find((m) => m.id === chairmanId) ?? members[0];

    // Build synthesis
    const strategy = selectStrategy(consensusLevel);
    const synthPrompt = generateSynthesisPrompt(
      strategy,
      stage1Responses,
      allEntries
    );

    // Ask chairman to synthesize
    const synthesisTask: TaskDefinition = {
      id: `${task.id}-synthesis`,
      description: synthPrompt,
      priority: task.priority,
    };

    const synthesisResult = await this.executor.execute(
      chairman,
      synthesisTask
    );

    this.emit("stage:complete", 3);

    return {
      finalAnswer: synthesisResult.output ?? "",
      rankings: stage2Rankings,
      consensusLevel,
      stages: {
        stage1: stage1Responses,
        stage2: stage2Rankings,
        stage3: {
          chairman: chairmanId,
          synthesis: synthesisResult.output ?? "",
        },
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Stage 1: Independent responses (parallel)
  // ---------------------------------------------------------------------------

  private async stage1(
    task: TaskDefinition,
    members: AgentInstance[]
  ): Promise<CouncilResponse[]> {
    const prompt = this.createDeliberationPrompt(task);

    const independentTask: TaskDefinition = {
      ...task,
      id: `${task.id}-stage1`,
      description: prompt,
    };

    const results = await Promise.all(
      members.map(async (member) => {
        const result = await this.executor.execute(member, independentTask);
        const confidence = this.extractConfidence(result.output ?? "");
        return {
          memberId: member.id,
          content: result.output ?? "",
          confidence,
        } satisfies CouncilResponse;
      })
    );

    return results;
  }

  // ---------------------------------------------------------------------------
  // Stage 2: Peer review and ranking
  // ---------------------------------------------------------------------------

  private async stage2(
    task: TaskDefinition,
    members: AgentInstance[],
    responses: CouncilResponse[]
  ): Promise<PeerRanking[]> {
    const rankings: PeerRanking[] = [];

    for (const member of members) {
      // Each member reviews all OTHER responses (anonymized)
      const otherResponses = responses.filter((r) => r.memberId !== member.id);

      const reviewPrompt = this.createPeerReviewPrompt(task, otherResponses);

      const reviewTask: TaskDefinition = {
        ...task,
        id: `${task.id}-review-${member.id}`,
        description: reviewPrompt,
      };

      const result = await this.executor.execute(member, reviewTask);
      const parsed = this.parseRankingFromOutput(
        result.output ?? "",
        otherResponses
      );

      rankings.push({
        rankerId: member.id,
        rankings: parsed,
      });
    }

    return rankings;
  }

  // ---------------------------------------------------------------------------
  // Prompt generators
  // ---------------------------------------------------------------------------

  createDeliberationPrompt(task: TaskDefinition): string {
    return [
      "STAGE 1: INDEPENDENT ANALYSIS",
      "",
      `TASK: ${task.description}`,
      "",
      "Provide your independent analysis. Be thorough but concise.",
      "Include your confidence level (0-1) at the end.",
      "Format: [Your analysis...] Confidence: X.XX",
    ].join("\n");
  }

  createPeerReviewPrompt(
    task: TaskDefinition,
    responses: CouncilResponse[]
  ): string {
    const responsesText = responses
      .map((r, i) => `Response ${String.fromCharCode(65 + i)}:\n${r.content}`)
      .join("\n\n---\n\n");

    return [
      "STAGE 2: PEER REVIEW",
      "",
      `Review these responses to: "${task.description}"`,
      "",
      responsesText,
      "",
      "Rank each response (best first). For each provide:",
      "- Rank (1 = best)",
      "- Score (1-10)",
      "- Brief feedback",
      "",
      "Format:",
      "1. Response X (Score: Y/10) - [feedback]",
    ].join("\n");
  }

  createSynthesisPrompt(
    task: TaskDefinition,
    responses: CouncilResponse[],
    rankings: PeerRanking[]
  ): string {
    const responsesText = responses
      .map(
        (r, i) =>
          `${String.fromCharCode(65 + i)}. [${r.memberId}] (Confidence: ${r.confidence.toFixed(2)})\n${r.content}`
      )
      .join("\n\n");

    const rankingsText = rankings
      .map(
        (r) =>
          `Reviewer ${r.rankerId}: ${r.rankings.map((rk) => `${rk.responseId}(${rk.score})`).join(", ")}`
      )
      .join("\n");

    return [
      "STAGE 3: CHAIRMAN SYNTHESIS",
      "",
      `QUESTION: ${task.description}`,
      "",
      "RESPONSES:",
      responsesText,
      "",
      "RANKINGS:",
      rankingsText,
      "",
      "Synthesize the best answer combining top insights.",
    ].join("\n");
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private extractConfidence(text: string): number {
    const match = text.match(/Confidence:\s*([\d.]+)/i);
    return match ? parseFloat(match[1]) : 0.75;
  }

  private parseRankingFromOutput(
    text: string,
    responses: CouncilResponse[]
  ): RankingEntry[] {
    const entries: RankingEntry[] = [];

    // Try structured format: "1. Response A (Score: 8/10)"
    const pattern = /(\d+)\.\s*Response\s+(\w)\s*\(Score:\s*(\d+)/gi;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const letterIndex = match[2].toUpperCase().charCodeAt(0) - 65;
      if (letterIndex >= 0 && letterIndex < responses.length) {
        entries.push({
          responseId: responses[letterIndex].memberId,
          rank: parseInt(match[1]),
          score: parseInt(match[3]),
        });
      }
    }

    // Fallback: assign equal scores if parsing failed
    if (entries.length === 0) {
      for (const resp of responses) {
        entries.push({
          responseId: resp.memberId,
          rank: 1,
          score: 5,
        });
      }
    }

    return entries;
  }
}
