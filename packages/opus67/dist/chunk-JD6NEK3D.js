import { loadModeRegistry } from './chunk-J7GF6OJU.js';

// src/modes/complexity.ts
function calculateComplexityScore(context, registry) {
  const { query, activeFiles = [], fileCount = 1 } = context;
  const factors = registry.complexity_scoring.factors;
  let score = 0;
  const queryLower = query.toLowerCase();
  const highKeywords = factors.keyword_complexity.high;
  const mediumKeywords = factors.keyword_complexity.medium;
  const lowKeywords = factors.keyword_complexity.low;
  if (highKeywords.some((k) => queryLower.includes(k))) {
    score += 8 * factors.keyword_complexity.weight;
  } else if (mediumKeywords.some((k) => queryLower.includes(k))) {
    score += 5 * factors.keyword_complexity.weight;
  } else if (lowKeywords.some((k) => queryLower.includes(k))) {
    score += 2 * factors.keyword_complexity.weight;
  }
  if (fileCount > 10) {
    score += 10 * factors.file_scope.weight;
  } else if (fileCount > 5) {
    score += 7 * factors.file_scope.weight;
  } else if (fileCount > 1) {
    score += 4 * factors.file_scope.weight;
  } else {
    score += 2 * factors.file_scope.weight;
  }
  const hasRust = activeFiles.some((f) => f.endsWith(".rs"));
  const hasTsx = activeFiles.some((f) => f.endsWith(".tsx"));
  const hasTs = activeFiles.some((f) => f.endsWith(".ts"));
  if (hasRust) {
    score += 8 * factors.domain_depth.weight;
  } else if (hasTsx && hasTs) {
    score += 6 * factors.domain_depth.weight;
  } else if (hasTsx) {
    score += 4 * factors.domain_depth.weight;
  } else {
    score += 2 * factors.domain_depth.weight;
  }
  if (queryLower.includes("architecture") || queryLower.includes("system design")) {
    score += 10 * factors.task_type.weight;
  } else if (queryLower.includes("feature") || queryLower.includes("implement")) {
    score += 6 * factors.task_type.weight;
  } else if (queryLower.includes("component") || queryLower.includes("build")) {
    score += 4 * factors.task_type.weight;
  } else if (queryLower.includes("fix") || queryLower.includes("update")) {
    score += 2 * factors.task_type.weight;
  } else {
    score += 1 * factors.task_type.weight;
  }
  return Math.min(10, Math.max(1, Math.round(score)));
}

// src/modes/detection.ts
function checkModeTriggers(mode, context, complexityScore) {
  const { query, activeFiles = [], fileCount = 1 } = context;
  const queryLower = query.toLowerCase();
  const triggers = mode.auto_trigger_when;
  const reasons = [];
  let matchCount = 0;
  let totalChecks = 0;
  if (triggers.keywords) {
    totalChecks++;
    const matchedKeywords = triggers.keywords.filter((k) => queryLower.includes(k.toLowerCase()));
    if (matchedKeywords.length > 0) {
      matchCount++;
      reasons.push(`keywords: ${matchedKeywords.join(", ")}`);
    }
  }
  if (triggers.task_patterns) {
    totalChecks++;
    for (const pattern of triggers.task_patterns) {
      const regex = new RegExp(pattern.replace(/\.\*/g, ".*"), "i");
      if (regex.test(query)) {
        matchCount++;
        reasons.push(`pattern: ${pattern}`);
        break;
      }
    }
  }
  if (triggers.file_types && activeFiles.length > 0) {
    totalChecks++;
    const matchedTypes = triggers.file_types.filter(
      (ft) => activeFiles.some((f) => f.endsWith(ft))
    );
    if (matchedTypes.length > 0) {
      matchCount++;
      reasons.push(`file_types: ${matchedTypes.join(", ")}`);
    }
  }
  if (triggers.complexity_score) {
    totalChecks++;
    const scoreCondition = triggers.complexity_score;
    let matches = false;
    if (scoreCondition.startsWith(">=")) {
      matches = complexityScore >= parseInt(scoreCondition.slice(2).trim());
    } else if (scoreCondition.startsWith(">")) {
      matches = complexityScore > parseInt(scoreCondition.slice(1).trim());
    } else if (scoreCondition.includes("-")) {
      const [min, max] = scoreCondition.split("-").map((s) => parseInt(s.trim()));
      matches = complexityScore >= min && complexityScore <= max;
    }
    if (matches) {
      matchCount++;
      reasons.push(`complexity: ${complexityScore} (${scoreCondition})`);
    }
  }
  if (triggers.message_length) {
    totalChecks++;
    const wordCount = query.split(/\s+/).length;
    if (triggers.message_length.includes("< 50") && wordCount < 50) {
      matchCount++;
      reasons.push(`short message: ${wordCount} words`);
    }
  }
  if (triggers.file_count) {
    totalChecks++;
    if (triggers.file_count.includes("> 5") && fileCount > 5) {
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
function detectMode(context) {
  const registry = loadModeRegistry();
  const complexityScore = calculateComplexityScore(context, registry);
  if (context.userPreference && context.userPreference !== "auto") {
    const mode2 = registry.modes[context.userPreference];
    return {
      mode: context.userPreference,
      confidence: 1,
      reasons: ["user preference"],
      complexity_score: complexityScore,
      suggested_skills: mode2.skills_priority,
      suggested_mcps: mode2.mcp_priority || [],
      sub_agents_recommended: mode2.sub_agents.enabled ? mode2.sub_agents.types || [] : []
    };
  }
  const modeScores = [];
  const autoMode = registry.modes.auto;
  const modeWeights = autoMode.mode_weights || {};
  for (const [modeName, mode2] of Object.entries(registry.modes)) {
    if (modeName === "auto") continue;
    const result = checkModeTriggers(mode2, context, complexityScore);
    const weight = modeWeights[modeName] || 1.5;
    const score = result.confidence / weight;
    if (result.matches) {
      modeScores.push({ mode: modeName, score, result });
    }
  }
  modeScores.sort((a, b) => b.score - a.score);
  const selected = modeScores[0];
  const fallbackMode = autoMode.fallback_mode || "build";
  if (!selected) {
    const mode2 = registry.modes[fallbackMode];
    return {
      mode: fallbackMode,
      confidence: 0.5,
      reasons: ["fallback - no strong signals"],
      complexity_score: complexityScore,
      suggested_skills: mode2.skills_priority,
      suggested_mcps: mode2.mcp_priority || [],
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

export { checkModeTriggers, detectMode };
