/**
 * OPUS 67 Complexity Scoring
 * Calculate task complexity based on context
 */

import type { ModeContext, ModeRegistry } from './types.js';

/**
 * Calculate complexity score for a query (1-10)
 */
export function calculateComplexityScore(context: ModeContext, registry: ModeRegistry): number {
  const { query, activeFiles = [], fileCount = 1 } = context;
  const factors = registry.complexity_scoring.factors;
  let score = 0;
  const queryLower = query.toLowerCase();

  // Keyword complexity
  const highKeywords = factors.keyword_complexity.high as string[];
  const mediumKeywords = factors.keyword_complexity.medium as string[];
  const lowKeywords = factors.keyword_complexity.low as string[];

  if (highKeywords.some(k => queryLower.includes(k))) {
    score += 8 * factors.keyword_complexity.weight;
  } else if (mediumKeywords.some(k => queryLower.includes(k))) {
    score += 5 * factors.keyword_complexity.weight;
  } else if (lowKeywords.some(k => queryLower.includes(k))) {
    score += 2 * factors.keyword_complexity.weight;
  }

  // File scope scoring
  if (fileCount > 10) {
    score += 10 * factors.file_scope.weight;
  } else if (fileCount > 5) {
    score += 7 * factors.file_scope.weight;
  } else if (fileCount > 1) {
    score += 4 * factors.file_scope.weight;
  } else {
    score += 2 * factors.file_scope.weight;
  }

  // Domain depth based on file types
  const hasRust = activeFiles.some(f => f.endsWith('.rs'));
  const hasTsx = activeFiles.some(f => f.endsWith('.tsx'));
  const hasTs = activeFiles.some(f => f.endsWith('.ts'));

  if (hasRust) {
    score += 8 * factors.domain_depth.weight;
  } else if (hasTsx && hasTs) {
    score += 6 * factors.domain_depth.weight;
  } else if (hasTsx) {
    score += 4 * factors.domain_depth.weight;
  } else {
    score += 2 * factors.domain_depth.weight;
  }

  // Task type estimation
  if (queryLower.includes('architecture') || queryLower.includes('system design')) {
    score += 10 * factors.task_type.weight;
  } else if (queryLower.includes('feature') || queryLower.includes('implement')) {
    score += 6 * factors.task_type.weight;
  } else if (queryLower.includes('component') || queryLower.includes('build')) {
    score += 4 * factors.task_type.weight;
  } else if (queryLower.includes('fix') || queryLower.includes('update')) {
    score += 2 * factors.task_type.weight;
  } else {
    score += 1 * factors.task_type.weight;
  }

  return Math.min(10, Math.max(1, Math.round(score)));
}
