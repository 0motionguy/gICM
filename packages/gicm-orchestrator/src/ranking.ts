/**
 * @gicm/orchestrator - Ranking & Consensus
 * Parse, aggregate, and analyze peer review rankings
 */

import type { ConsensusLevel } from "./types.js";

// =============================================================================
// TYPES
// =============================================================================

export interface RankingEntry {
  responseId: string;
  rank: number;
  score: number;
  feedback?: string;
}

export interface RankingCriteria {
  name: string;
  weight: number;
}

export interface ConflictInfo {
  responseId: string;
  description: string;
  severity: "low" | "medium" | "high";
}

// =============================================================================
// DEFAULT CRITERIA
// =============================================================================

export const DEFAULT_CRITERIA: RankingCriteria[] = [
  { name: "accuracy", weight: 0.3 },
  { name: "completeness", weight: 0.25 },
  { name: "clarity", weight: 0.2 },
  { name: "reasoning", weight: 0.15 },
  { name: "creativity", weight: 0.1 },
];

// =============================================================================
// PARSING
// =============================================================================

/**
 * Parse ranking text into structured RankingEntry[].
 * Supports formats like "1. Response A (Score: 8/10) - feedback"
 */
export function parseRankingText(text: string): RankingEntry[] {
  const entries: RankingEntry[] = [];

  // Primary pattern: "1. Response A (Score: 8/10) - Good analysis"
  const pattern =
    /(\d+)\.\s*Response\s+(\w+)\s*\(Score:\s*(\d+)(?:\/10)?\)\s*[-\u2013]\s*(.+?)(?=\d+\.|$)/gis;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    entries.push({
      responseId: match[2].toUpperCase(),
      rank: parseInt(match[1]),
      score: parseInt(match[3]),
      feedback: match[4].trim(),
    });
  }

  // Fallback: simpler pattern "Response A: 8"
  if (entries.length === 0) {
    const simplePattern = /Response\s+(\w+)[:\s]+(\d+)/gi;
    let rank = 1;
    while ((match = simplePattern.exec(text)) !== null) {
      entries.push({
        responseId: match[1].toUpperCase(),
        rank: rank++,
        score: parseInt(match[2]),
        feedback: undefined,
      });
    }
  }

  return entries;
}

// =============================================================================
// AGGREGATION
// =============================================================================

/**
 * Aggregate rankings from multiple reviewers into a score map.
 * Returns Map<responseId, averageScore>.
 */
export function aggregateRankings(
  rankings: RankingEntry[]
): Map<string, number> {
  const scoreSums = new Map<string, number>();
  const counts = new Map<string, number>();

  for (const entry of rankings) {
    const prev = scoreSums.get(entry.responseId) ?? 0;
    scoreSums.set(entry.responseId, prev + entry.score);
    counts.set(entry.responseId, (counts.get(entry.responseId) ?? 0) + 1);
  }

  const result = new Map<string, number>();
  for (const [id, sum] of scoreSums) {
    result.set(id, sum / (counts.get(id) ?? 1));
  }

  return result;
}

// =============================================================================
// WEIGHTED SCORING
// =============================================================================

/**
 * Calculate a weighted score using given criteria.
 * criteriaScores maps criteria name -> raw score (0-10).
 */
export function calculateWeightedScore(
  criteriaScores: Record<string, number>,
  criteria: RankingCriteria[] = DEFAULT_CRITERIA
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const c of criteria) {
    const score = criteriaScores[c.name];
    if (score !== undefined) {
      weightedSum += score * c.weight;
      totalWeight += c.weight;
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

// =============================================================================
// CONFLICT DETECTION
// =============================================================================

/**
 * Detect conflicts/disagreements across rankings.
 * A conflict occurs when the same response receives widely different ranks.
 */
export function detectConflicts(rankings: RankingEntry[]): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];

  // Group ranks by responseId
  const ranksByResponse = new Map<string, number[]>();
  for (const entry of rankings) {
    const ranks = ranksByResponse.get(entry.responseId) ?? [];
    ranks.push(entry.rank);
    ranksByResponse.set(entry.responseId, ranks);
  }

  for (const [responseId, ranks] of ranksByResponse) {
    if (ranks.length < 2) continue;

    const min = Math.min(...ranks);
    const max = Math.max(...ranks);
    const range = max - min;

    if (range >= 3) {
      conflicts.push({
        responseId,
        description: `Ranks range from ${min} to ${max} (range: ${range})`,
        severity: "high",
      });
    } else if (range >= 2) {
      conflicts.push({
        responseId,
        description: `Moderate disagreement (range: ${range})`,
        severity: "medium",
      });
    } else if (range >= 1) {
      conflicts.push({
        responseId,
        description: `Minor disagreement (range: ${range})`,
        severity: "low",
      });
    }
  }

  return conflicts;
}

// =============================================================================
// CONSENSUS
// =============================================================================

/**
 * Determine consensus level from aggregated scores.
 */
export function determineConsensus(
  aggregated: Map<string, number>
): ConsensusLevel {
  const scores = Array.from(aggregated.values());
  if (scores.length === 0) return "split";

  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const range = max - min;

  // If all scores are very close, it's unanimous/strong
  if (range <= 0.5) return "unanimous";
  if (range <= 1.5) return "strong";
  if (range <= 3) return "moderate";
  if (range <= 5) return "weak";
  return "split";
}

// =============================================================================
// NORMALIZATION
// =============================================================================

/**
 * Normalize a set of scores to the 0-1 range.
 */
export function normalizeScores(
  scores: Map<string, number>
): Map<string, number> {
  const values = Array.from(scores.values());
  if (values.length === 0) return new Map();

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const result = new Map<string, number>();
  for (const [id, score] of scores) {
    result.set(id, (score - min) / range);
  }
  return result;
}
