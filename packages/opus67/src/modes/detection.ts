/**
 * OPUS 67 Mode Detection
 * Detect the best mode based on context
 */

import type { Mode, ModeContext, DetectionResult, ModeName, TriggerMatchResult } from './types.js';
import { loadModeRegistry } from './registry.js';
import { calculateComplexityScore } from './complexity.js';

/**
 * Check if mode triggers match the context
 */
export function checkModeTriggers(
  mode: Mode,
  context: ModeContext,
  complexityScore: number
): TriggerMatchResult {
  const { query, activeFiles = [], fileCount = 1 } = context;
  const queryLower = query.toLowerCase();
  const triggers = mode.auto_trigger_when;
  const reasons: string[] = [];
  let matchCount = 0;
  let totalChecks = 0;

  // Check keywords
  if (triggers.keywords) {
    totalChecks++;
    const matchedKeywords = triggers.keywords.filter(k => queryLower.includes(k.toLowerCase()));
    if (matchedKeywords.length > 0) {
      matchCount++;
      reasons.push(`keywords: ${matchedKeywords.join(', ')}`);
    }
  }

  // Check task patterns
  if (triggers.task_patterns) {
    totalChecks++;
    for (const pattern of triggers.task_patterns) {
      const regex = new RegExp(pattern.replace(/\.\*/g, '.*'), 'i');
      if (regex.test(query)) {
        matchCount++;
        reasons.push(`pattern: ${pattern}`);
        break;
      }
    }
  }

  // Check file types
  if (triggers.file_types && activeFiles.length > 0) {
    totalChecks++;
    const matchedTypes = triggers.file_types.filter(ft =>
      activeFiles.some(f => f.endsWith(ft))
    );
    if (matchedTypes.length > 0) {
      matchCount++;
      reasons.push(`file_types: ${matchedTypes.join(', ')}`);
    }
  }

  // Check complexity score
  if (triggers.complexity_score) {
    totalChecks++;
    const scoreCondition = triggers.complexity_score;
    let matches = false;

    if (scoreCondition.startsWith('>=')) {
      matches = complexityScore >= parseInt(scoreCondition.slice(2).trim());
    } else if (scoreCondition.startsWith('>')) {
      matches = complexityScore > parseInt(scoreCondition.slice(1).trim());
    } else if (scoreCondition.includes('-')) {
      const [min, max] = scoreCondition.split('-').map(s => parseInt(s.trim()));
      matches = complexityScore >= min && complexityScore <= max;
    }

    if (matches) {
      matchCount++;
      reasons.push(`complexity: ${complexityScore} (${scoreCondition})`);
    }
  }

  // Check message length
  if (triggers.message_length) {
    totalChecks++;
    const wordCount = query.split(/\s+/).length;
    if (triggers.message_length.includes('< 50') && wordCount < 50) {
      matchCount++;
      reasons.push(`short message: ${wordCount} words`);
    }
  }

  // Check file count
  if (triggers.file_count) {
    totalChecks++;
    if (triggers.file_count.includes('> 5') && fileCount > 5) {
      matchCount++;
      reasons.push(`many files: ${fileCount}`);
    }
  }

  return {
    matches: matchCount > 0,
    confidence: totalChecks > 0 ? matchCount / totalChecks : 0,
    reasons
  };
}

/**
 * Detect the best mode for given context
 */
export function detectMode(context: ModeContext): DetectionResult {
  const registry = loadModeRegistry();
  const complexityScore = calculateComplexityScore(context, registry);

  // If user has preference, weight it heavily
  if (context.userPreference && context.userPreference !== 'auto') {
    const mode = registry.modes[context.userPreference];
    return {
      mode: context.userPreference,
      confidence: 1.0,
      reasons: ['user preference'],
      complexity_score: complexityScore,
      suggested_skills: mode.skills_priority,
      suggested_mcps: mode.mcp_priority || [],
      sub_agents_recommended: mode.sub_agents.enabled ? mode.sub_agents.types || [] : []
    };
  }

  // Score each mode
  type ModeScore = { mode: ModeName; score: number; result: TriggerMatchResult };
  const modeScores: ModeScore[] = [];
  const autoMode = registry.modes.auto;
  const modeWeights = (autoMode as any).mode_weights || {};

  for (const [modeName, mode] of Object.entries(registry.modes)) {
    if (modeName === 'auto') continue;

    const result = checkModeTriggers(mode, context, complexityScore);
    const weight = modeWeights[modeName] || 1.5;
    const score = result.confidence / weight;

    if (result.matches) {
      modeScores.push({ mode: modeName as ModeName, score, result });
    }
  }

  // Sort by score (higher is better)
  modeScores.sort((a, b) => b.score - a.score);

  // Select best mode or fallback
  const selected = modeScores[0];
  const fallbackMode = (autoMode as any).fallback_mode || 'build';

  if (!selected) {
    const mode = registry.modes[fallbackMode];
    return {
      mode: fallbackMode as ModeName,
      confidence: 0.5,
      reasons: ['fallback - no strong signals'],
      complexity_score: complexityScore,
      suggested_skills: mode.skills_priority,
      suggested_mcps: mode.mcp_priority || [],
      sub_agents_recommended: []
    };
  }

  const mode = registry.modes[selected.mode];
  return {
    mode: selected.mode,
    confidence: selected.result.confidence,
    reasons: selected.result.reasons,
    complexity_score: complexityScore,
    suggested_skills: mode.skills_priority,
    suggested_mcps: mode.mcp_priority || [],
    sub_agents_recommended: mode.sub_agents.enabled ? mode.sub_agents.types || [] : []
  };
}
