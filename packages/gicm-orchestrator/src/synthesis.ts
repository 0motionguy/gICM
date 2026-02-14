/**
 * @gicm/orchestrator - Synthesis
 * 4 strategies for combining council responses into a final answer
 */

import type { ConsensusLevel } from "./types.js";
import type { RankingEntry } from "./ranking.js";

// =============================================================================
// TYPES
// =============================================================================

export interface SynthesisStrategy {
  name: string;
  description: string;
}

export interface CouncilResponseSummary {
  memberId: string;
  content: string;
  confidence: number;
}

export interface SynthesisResult {
  strategy: string;
  content: string;
  confidence: number;
  contributors: string[];
}

// =============================================================================
// STRATEGIES
// =============================================================================

export const SYNTHESIS_STRATEGIES: SynthesisStrategy[] = [
  {
    name: "best-of-n",
    description: "Pick the highest-ranked response as the final answer",
  },
  {
    name: "merge-top",
    description: "Merge the top 2-3 responses into a combined answer",
  },
  {
    name: "consensus-filter",
    description: "Keep only points where the majority of responses agree",
  },
  {
    name: "debate-resolution",
    description: "Identify disagreements and resolve via evidence weight",
  },
];

// =============================================================================
// STRATEGY SELECTION
// =============================================================================

/**
 * Auto-select a synthesis strategy based on consensus level.
 *
 *   unanimous / strong  -> best-of-n
 *   moderate            -> merge-top
 *   weak                -> consensus-filter
 *   split               -> debate-resolution
 */
export function selectStrategy(
  consensusLevel: ConsensusLevel
): SynthesisStrategy {
  switch (consensusLevel) {
    case "unanimous":
    case "strong":
      return SYNTHESIS_STRATEGIES.find((s) => s.name === "best-of-n")!;
    case "moderate":
      return SYNTHESIS_STRATEGIES.find((s) => s.name === "merge-top")!;
    case "weak":
      return SYNTHESIS_STRATEGIES.find((s) => s.name === "consensus-filter")!;
    case "split":
      return SYNTHESIS_STRATEGIES.find((s) => s.name === "debate-resolution")!;
    default:
      return SYNTHESIS_STRATEGIES[0];
  }
}

// =============================================================================
// PROMPT GENERATION
// =============================================================================

/**
 * Generate a synthesis prompt for the chairman to use.
 */
export function generateSynthesisPrompt(
  strategy: SynthesisStrategy,
  responses: CouncilResponseSummary[],
  rankings: RankingEntry[]
): string {
  const responsesText = responses
    .map(
      (r, i) =>
        `Response ${String.fromCharCode(65 + i)} [${r.memberId}] (confidence: ${r.confidence.toFixed(2)}):\n${r.content}`
    )
    .join("\n\n---\n\n");

  const rankingsText = rankings
    .map(
      (r) =>
        `${r.responseId}: rank=${r.rank}, score=${r.score}${r.feedback ? ` (${r.feedback})` : ""}`
    )
    .join("\n");

  const strategyInstructions = getStrategyInstructions(strategy.name);

  return [
    "SYNTHESIS TASK",
    "",
    `Strategy: ${strategy.name} - ${strategy.description}`,
    "",
    "RESPONSES:",
    responsesText,
    "",
    "RANKINGS:",
    rankingsText,
    "",
    "INSTRUCTIONS:",
    strategyInstructions,
    "",
    "Provide a synthesized final answer.",
  ].join("\n");
}

/**
 * Get detailed instructions for each strategy.
 */
function getStrategyInstructions(strategyName: string): string {
  switch (strategyName) {
    case "best-of-n":
      return "Select the highest-ranked response. You may make minor improvements but preserve the core answer.";
    case "merge-top":
      return "Combine the strongest elements from the top 2-3 responses into a unified answer. Resolve any inconsistencies.";
    case "consensus-filter":
      return "Extract only the points where a majority of responses agree. Flag any contested claims.";
    case "debate-resolution":
      return "Identify the key disagreements between responses. For each disagreement, evaluate the evidence and reasoning on each side. Provide a resolution.";
    default:
      return "Synthesize the best possible answer from all responses.";
  }
}

// =============================================================================
// RESPONSE PARSING
// =============================================================================

/**
 * Parse a synthesis response text into a structured result.
 */
export function parseSynthesisResponse(
  text: string,
  strategyName: string = "best-of-n"
): SynthesisResult {
  // Extract confidence
  const confidenceMatch = text.match(/Confidence:\s*([\d.]+)/i);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75;

  // Extract contributors
  const contributorsMatch = text.match(
    /(?:Contributors?|Best Contributors?):\s*(.+?)(?:\n|$)/i
  );
  const contributors = contributorsMatch
    ? contributorsMatch[1].split(/[,\s]+/).filter((c) => c.length > 0)
    : [];

  // Content is the main body (strip metadata lines)
  const content = text
    .replace(/Confidence:\s*[\d.]+/gi, "")
    .replace(/(?:Contributors?|Best Contributors?):\s*.+/gi, "")
    .trim();

  return {
    strategy: strategyName,
    content,
    confidence,
    contributors,
  };
}
