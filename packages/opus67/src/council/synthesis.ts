/**
 * OPUS 67 Council Synthesis
 * Chairman prompts and final answer generation
 */

import { type CouncilResponse, type PeerRanking, type DeliberationResult } from './council.js';
import { type RankingAggregation, aggregateRankings } from './ranking.js';

// Types
export interface SynthesisPrompt {
  role: string;
  context: string;
  instructions: string;
  format: string;
}

export interface SynthesisStrategy {
  name: string;
  description: string;
  weight: number;
  apply: (responses: CouncilResponse[], rankings: RankingAggregation) => string;
}

// Synthesis prompt templates
export const SYNTHESIS_PROMPTS = {
  standard: {
    role: 'You are the Chairman of an LLM Council, responsible for synthesizing the best answer from multiple AI responses.',
    context: `You have received responses from multiple AI models, each with their own perspective and expertise.
Your task is to:
1. Identify the strongest elements from each response
2. Resolve any conflicts or contradictions
3. Synthesize a comprehensive final answer
4. Provide reasoning for your synthesis`,
    instructions: `Analyze all responses carefully. Consider:
- Accuracy and correctness
- Completeness of coverage
- Quality of reasoning
- Clarity of explanation
- Novel insights

Weight the peer rankings but don't blindly follow them - use your judgment.`,
    format: `FINAL ANSWER: [Your synthesized answer]
CONFIDENCE: [0.0-1.0]
REASONING: [Why this synthesis is optimal]
BEST CONTRIBUTORS: [List of member IDs whose insights were most valuable]
DISSENT: [Any significant disagreements to note, or "None"]`
  },

  technical: {
    role: 'You are a Technical Lead synthesizing code review feedback from multiple senior engineers.',
    context: `Multiple expert engineers have reviewed the same technical question.
Your role is to produce a definitive technical recommendation.`,
    instructions: `Focus on:
- Technical accuracy and best practices
- Security implications
- Performance considerations
- Maintainability
- Edge cases mentioned by any reviewer`,
    format: `RECOMMENDATION: [Technical recommendation]
IMPLEMENTATION: [Key implementation details]
RISKS: [Potential risks or caveats]
CONFIDENCE: [0.0-1.0]
CONTRIBUTORS: [Engineers whose input was key]`
  },

  creative: {
    role: 'You are a Creative Director synthesizing ideas from a brainstorming session.',
    context: `Multiple creative minds have contributed ideas on the same challenge.
Your role is to identify the most promising direction while preserving creative energy.`,
    instructions: `Look for:
- Innovative approaches
- Synergies between ideas
- Feasibility balanced with ambition
- Unique perspectives worth preserving`,
    format: `CONCEPT: [Synthesized creative direction]
INSPIRATION: [Key ideas that informed this]
RATIONALE: [Why this direction is compelling]
ALTERNATIVES: [Other promising directions to consider]`
  },

  consensus: {
    role: 'You are a Mediator seeking to build consensus among differing viewpoints.',
    context: `Multiple perspectives have been shared, some conflicting.
Your goal is to find common ground while respecting differences.`,
    instructions: `Identify:
- Points of agreement
- Core disagreements
- Underlying values/priorities
- Potential compromises
- When to acknowledge legitimate disagreement`,
    format: `CONSENSUS: [Points of agreement]
SYNTHESIS: [Recommended path forward]
TRADE-OFFS: [Key trade-offs being made]
DISSENT: [Legitimate disagreements to acknowledge]
NEXT STEPS: [How to proceed]`
  }
};

/**
 * Generate chairman synthesis prompt
 */
export function generateSynthesisPrompt(
  question: string,
  responses: CouncilResponse[],
  rankings: PeerRanking[],
  template: keyof typeof SYNTHESIS_PROMPTS = 'standard'
): string {
  const prompt = SYNTHESIS_PROMPTS[template];
  const aggregation = aggregateRankings(responses, rankings);

  // Format responses
  const responsesSummary = responses.map((r, i) => {
    const label = String.fromCharCode(65 + i);
    const ranking = aggregation.scores.find(s => s.memberId === r.memberId);
    const rankInfo = ranking ? ` [Ranked #${ranking.avgRank.toFixed(1)}, Score: ${ranking.avgScore.toFixed(1)}]` : '';

    return `=== Response ${label} (${r.model})${rankInfo} ===
${r.content}
[Confidence: ${(r.confidence * 100).toFixed(0)}%]`;
  }).join('\n\n');

  // Format rankings
  const rankingsSummary = rankings.map(r =>
    `Reviewer ${r.rankerId}: ${r.rankings.map(rk => `${rk.responseId}(${rk.score}/10)`).join(' > ')}`
  ).join('\n');

  return `${prompt.role}

QUESTION: ${question}

${prompt.context}

=== COUNCIL RESPONSES ===
${responsesSummary}

=== PEER RANKINGS ===
${rankingsSummary}
Consensus Level: ${aggregation.consensusLevel}
Leading Response: ${aggregation.winner.memberId} (${aggregation.winner.model})

=== YOUR TASK ===
${prompt.instructions}

Please provide your synthesis in this format:
${prompt.format}`;
}

/**
 * Parse synthesis response
 */
export function parseSynthesisResponse(response: string): DeliberationResult['stage3Synthesis'] {
  // Extract components using regex
  const finalAnswer = extractSection(response, 'FINAL ANSWER', 'RECOMMENDATION', 'CONCEPT', 'CONSENSUS', 'SYNTHESIS')
    || response.slice(0, 500);

  const confidenceMatch = response.match(/CONFIDENCE:\s*([\d.]+)/i);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75;

  const reasoning = extractSection(response, 'REASONING', 'RATIONALE', 'TRADE-OFFS') || '';

  const contributorsMatch = response.match(/(?:BEST )?CONTRIBUTORS?:\s*(.+?)(?=\n[A-Z]|\n\n|$)/is);
  const bestContributors = contributorsMatch
    ? contributorsMatch[1].split(/[,\s]+/).filter(c => c.length > 0)
    : [];

  const dissentMatch = response.match(/DISSENT:\s*(.+?)(?=\n[A-Z]|\n\n|$)/is);
  const dissent = dissentMatch && !dissentMatch[1].toLowerCase().includes('none')
    ? dissentMatch[1].trim()
    : undefined;

  return {
    finalAnswer: finalAnswer.trim(),
    confidence,
    reasoning: reasoning.trim(),
    bestContributors,
    dissent
  };
}

/**
 * Extract a section from response text
 */
function extractSection(text: string, ...keys: string[]): string | null {
  for (const key of keys) {
    const pattern = new RegExp(`${key}:\\s*(.+?)(?=\\n[A-Z]+:|$)`, 'is');
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

/**
 * Synthesis strategies
 */
export const SYNTHESIS_STRATEGIES: SynthesisStrategy[] = [
  {
    name: 'best-of-n',
    description: 'Select the highest-ranked response with minor enhancements',
    weight: 0.3,
    apply: (responses, rankings) => {
      const best = rankings.winner;
      const response = responses.find(r => r.memberId === best.memberId);
      return response?.content || '';
    }
  },
  {
    name: 'merge-top',
    description: 'Merge insights from top 2-3 responses',
    weight: 0.4,
    apply: (responses, rankings) => {
      const topIds = rankings.topPerformers.slice(0, 3);
      const topResponses = responses.filter(r => topIds.includes(r.memberId));
      return topResponses.map(r => `[${r.memberId}]: ${r.content}`).join('\n\n');
    }
  },
  {
    name: 'consensus-filter',
    description: 'Extract only points where all models agree',
    weight: 0.2,
    apply: (responses) => {
      // Simplified: just note this would extract common themes
      return `Common themes from ${responses.length} responses...`;
    }
  },
  {
    name: 'debate-resolution',
    description: 'Explicitly resolve conflicts between responses',
    weight: 0.1,
    apply: (responses) => {
      return `Resolving debates among ${responses.length} perspectives...`;
    }
  }
];

/**
 * Select best synthesis strategy
 */
export function selectStrategy(
  responses: CouncilResponse[],
  rankings: RankingAggregation
): SynthesisStrategy {
  // If unanimous, just pick the best
  if (rankings.consensusLevel === 'unanimous') {
    return SYNTHESIS_STRATEGIES.find(s => s.name === 'best-of-n')!;
  }

  // If split, need debate resolution
  if (rankings.consensusLevel === 'split' || rankings.consensusLevel === 'weak') {
    return SYNTHESIS_STRATEGIES.find(s => s.name === 'debate-resolution')!;
  }

  // Default: merge top responses
  return SYNTHESIS_STRATEGIES.find(s => s.name === 'merge-top')!;
}

/**
 * Format synthesis for display
 */
export function formatSynthesis(synthesis: DeliberationResult['stage3Synthesis']): string {
  return `
┌─ CHAIRMAN SYNTHESIS ────────────────────────────────────────────┐
│                                                                  │
│  FINAL ANSWER                                                    │
│  ────────────────────────────────────────────────────────────    │
│  ${synthesis.finalAnswer.slice(0, 60).padEnd(60)} │
│  ${synthesis.finalAnswer.slice(60, 120).padEnd(60)} │
│                                                                  │
│  CONFIDENCE: ${(synthesis.confidence * 100).toFixed(0)}%                                             │
│                                                                  │
│  REASONING                                                       │
│  ────────────────────────────────────────────────────────────    │
│  ${synthesis.reasoning.slice(0, 60).padEnd(60)} │
│                                                                  │
│  BEST CONTRIBUTORS: ${synthesis.bestContributors.join(', ').padEnd(40)} │
│  ${synthesis.dissent ? `DISSENT: ${synthesis.dissent.slice(0, 50)}` : 'No dissent noted'.padEnd(58)} │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;
}
