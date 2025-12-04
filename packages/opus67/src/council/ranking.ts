/**
 * OPUS 67 Council Ranking System
 * Parse and aggregate peer review rankings
 */

import { type CouncilResponse, type PeerRanking } from './council.js';

// Types
export interface RankingScore {
  responseId: string;
  memberId: string;
  model: string;
  totalScore: number;
  avgRank: number;
  avgScore: number;
  rankCount: number;
  confidence: number;
  topRankCount: number;
}

export interface RankingAggregation {
  scores: RankingScore[];
  winner: RankingScore;
  consensusLevel: 'unanimous' | 'strong' | 'moderate' | 'weak' | 'split';
  topPerformers: string[];
  bottomPerformers: string[];
}

export interface RankingCriteria {
  weight: number;
  name: string;
  description: string;
}

// Default ranking criteria
export const DEFAULT_CRITERIA: RankingCriteria[] = [
  { weight: 0.3, name: 'accuracy', description: 'Correctness of the response' },
  { weight: 0.25, name: 'completeness', description: 'Thoroughness of coverage' },
  { weight: 0.2, name: 'clarity', description: 'Clear and understandable' },
  { weight: 0.15, name: 'reasoning', description: 'Quality of reasoning/logic' },
  { weight: 0.1, name: 'creativity', description: 'Novel insights or approaches' },
];

/**
 * Parse ranking text into structured data
 */
export function parseRankingText(text: string): Array<{ id: string; rank: number; score: number; feedback: string }> {
  const rankings: Array<{ id: string; rank: number; score: number; feedback: string }> = [];

  // Match patterns like "1. Response A (Score: 8/10) - Good analysis"
  const pattern = /(\d+)\.\s*Response\s+(\w+)\s*\(Score:\s*(\d+)(?:\/10)?\)\s*[-–]\s*(.+?)(?=\d+\.|$)/gis;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    rankings.push({
      id: `response-${match[2].toUpperCase()}`,
      rank: parseInt(match[1]),
      score: parseInt(match[3]),
      feedback: match[4].trim()
    });
  }

  // Fallback: simpler pattern
  if (rankings.length === 0) {
    const simplePattern = /Response\s+(\w+)[:\s]+(\d+)/gi;
    let rank = 1;
    while ((match = simplePattern.exec(text)) !== null) {
      rankings.push({
        id: `response-${match[1].toUpperCase()}`,
        rank: rank++,
        score: parseInt(match[2]),
        feedback: 'No detailed feedback'
      });
    }
  }

  return rankings;
}

/**
 * Aggregate rankings from multiple reviewers
 */
export function aggregateRankings(
  responses: CouncilResponse[],
  peerRankings: PeerRanking[]
): RankingAggregation {
  const scoreMap = new Map<string, RankingScore>();

  // Initialize scores for each response
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    const responseId = `response-${String.fromCharCode(65 + i)}`;

    scoreMap.set(responseId, {
      responseId,
      memberId: response.memberId,
      model: response.model,
      totalScore: 0,
      avgRank: 0,
      avgScore: 0,
      rankCount: 0,
      confidence: response.confidence,
      topRankCount: 0
    });
  }

  // Aggregate rankings
  for (const peerRanking of peerRankings) {
    for (const ranking of peerRanking.rankings) {
      const score = scoreMap.get(ranking.responseId);
      if (score) {
        score.totalScore += ranking.score;
        score.avgRank = (score.avgRank * score.rankCount + ranking.rank) / (score.rankCount + 1);
        score.rankCount++;
        if (ranking.rank === 1) {
          score.topRankCount++;
        }
      }
    }
  }

  // Calculate averages
  for (const score of scoreMap.values()) {
    if (score.rankCount > 0) {
      score.avgScore = score.totalScore / score.rankCount;
    }
  }

  // Sort by combined score (lower avgRank + higher avgScore = better)
  const scores = Array.from(scoreMap.values())
    .sort((a, b) => {
      // Primary: average rank (lower is better)
      const rankDiff = a.avgRank - b.avgRank;
      if (Math.abs(rankDiff) > 0.5) return rankDiff;

      // Secondary: average score (higher is better)
      return b.avgScore - a.avgScore;
    });

  // Determine consensus level
  const winner = scores[0];
  const topRankPct = winner.topRankCount / peerRankings.length;

  let consensusLevel: RankingAggregation['consensusLevel'];
  if (topRankPct >= 1) {
    consensusLevel = 'unanimous';
  } else if (topRankPct >= 0.75) {
    consensusLevel = 'strong';
  } else if (topRankPct >= 0.5) {
    consensusLevel = 'moderate';
  } else if (topRankPct >= 0.25) {
    consensusLevel = 'weak';
  } else {
    consensusLevel = 'split';
  }

  // Identify top and bottom performers
  const topPerformers = scores.slice(0, Math.ceil(scores.length / 2)).map(s => s.memberId);
  const bottomPerformers = scores.slice(-Math.ceil(scores.length / 2)).map(s => s.memberId);

  return {
    scores,
    winner,
    consensusLevel,
    topPerformers,
    bottomPerformers
  };
}

/**
 * Calculate weighted score based on criteria
 */
export function calculateWeightedScore(
  baseScore: number,
  criteria: RankingCriteria[],
  criteriaScores: Record<string, number>
): number {
  let weightedScore = 0;
  let totalWeight = 0;

  for (const criterion of criteria) {
    const score = criteriaScores[criterion.name] ?? baseScore;
    weightedScore += score * criterion.weight;
    totalWeight += criterion.weight;
  }

  return totalWeight > 0 ? weightedScore / totalWeight : baseScore;
}

/**
 * Detect ranking conflicts
 */
export function detectConflicts(
  peerRankings: PeerRanking[]
): Array<{ responseId: string; conflict: string; severity: 'low' | 'medium' | 'high' }> {
  const conflicts: Array<{ responseId: string; conflict: string; severity: 'low' | 'medium' | 'high' }> = [];

  // Build rank map for each response
  const ranksByResponse = new Map<string, number[]>();

  for (const peerRanking of peerRankings) {
    for (const ranking of peerRanking.rankings) {
      const ranks = ranksByResponse.get(ranking.responseId) || [];
      ranks.push(ranking.rank);
      ranksByResponse.set(ranking.responseId, ranks);
    }
  }

  // Check for conflicts
  for (const [responseId, ranks] of ranksByResponse) {
    if (ranks.length < 2) continue;

    const min = Math.min(...ranks);
    const max = Math.max(...ranks);
    const range = max - min;

    if (range >= ranks.length - 1) {
      conflicts.push({
        responseId,
        conflict: `Ranks range from ${min} to ${max}`,
        severity: range >= ranks.length ? 'high' : 'medium'
      });
    } else if (range >= 2) {
      conflicts.push({
        responseId,
        conflict: `Moderate disagreement (range: ${range})`,
        severity: 'low'
      });
    }
  }

  return conflicts;
}

/**
 * Generate ranking report
 */
export function generateRankingReport(aggregation: RankingAggregation): string {
  let report = `
┌─ RANKING AGGREGATION ───────────────────────────────────────────┐
│                                                                  │
│  CONSENSUS: ${aggregation.consensusLevel.toUpperCase().padEnd(12)}                                    │
│  WINNER: ${aggregation.winner.memberId.padEnd(15)} (${aggregation.winner.model})            │
│                                                                  │
│  RANKINGS                                                        │
│  ────────────────────────────────────────────────────────────    │
│  MEMBER          MODEL              AVG RANK  AVG SCORE  TOP     │
│  ────────────────────────────────────────────────────────────    │`;

  for (const score of aggregation.scores) {
    const isTop = aggregation.topPerformers.includes(score.memberId);
    const marker = isTop ? '★' : ' ';

    report += `
│  ${marker} ${score.memberId.padEnd(13)} ${score.model.padEnd(18)} ${score.avgRank.toFixed(1).padEnd(9)} ${score.avgScore.toFixed(1).padEnd(10)} ${score.topRankCount}      │`;
  }

  report += `
│                                                                  │
│  TOP PERFORMERS: ${aggregation.topPerformers.join(', ').padEnd(40)}  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;

  return report;
}

/**
 * Normalize scores to 0-1 range
 */
export function normalizeScores(scores: RankingScore[]): RankingScore[] {
  if (scores.length === 0) return [];

  const maxScore = Math.max(...scores.map(s => s.avgScore));
  const minScore = Math.min(...scores.map(s => s.avgScore));
  const range = maxScore - minScore || 1;

  return scores.map(s => ({
    ...s,
    avgScore: (s.avgScore - minScore) / range
  }));
}
