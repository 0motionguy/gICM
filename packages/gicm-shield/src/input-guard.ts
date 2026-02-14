/**
 * Input Guard for @gicm/shield
 * Prompt injection detection for AI agents
 */

import type { InputGuardConfig, InputGuardResult } from "./types.js";

// ============================================================================
// Built-in Injection Patterns
// ============================================================================

const DEFAULT_PATTERNS: RegExp[] = [
  // System prompt override attempts
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/i,
  /disregard\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/i,
  /forget\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/i,

  // Role injection
  /you\s+are\s+now\s+(?:a|an)\s+\w+/i,
  /act\s+as\s+(?:a|an)\s+\w+/i,
  /pretend\s+to\s+be\s+(?:a|an)\s+\w+/i,
  /simulate\s+(?:a|an)\s+\w+/i,

  // Instruction manipulation
  /new\s+instructions?:\s*/i,
  /system\s+message:\s*/i,
  /override\s+instructions?/i,
  /replace\s+(the\s+)?system\s+prompt/i,

  // Jailbreak attempts
  /developer\s+mode/i,
  /admin\s+mode/i,
  /sudo\s+mode/i,

  // Base64/encoding attempts (simplified detection)
  /\\x[0-9a-f]{2}/i,
  /(?:base64|decode|encode)\s*\(['"]/i,

  // Prompt leakage attempts
  /(?:show|reveal|display|tell\s+me)\s+(?:your|the)\s+(?:system\s+)?(?:prompt|instructions?|rules?)/i,
  /what\s+(?:are|is)\s+your\s+(?:system\s+)?(?:prompt|instructions?|rules?)/i,
];

// ============================================================================
// InputGuard Class
// ============================================================================

export class InputGuard {
  private readonly config: Required<InputGuardConfig>;
  private readonly patterns: RegExp[];
  private stats = {
    totalChecks: 0,
    blocked: 0,
    sanitized: 0,
  };

  constructor(config?: Partial<InputGuardConfig>) {
    this.config = {
      maxLength: config?.maxLength ?? 10000,
      blockPatterns: config?.blockPatterns ?? [],
      sanitize: config?.sanitize ?? false,
    };

    // Combine default patterns with custom ones
    this.patterns = [...DEFAULT_PATTERNS, ...this.config.blockPatterns];
  }

  checkInput(input: string): InputGuardResult {
    this.stats.totalChecks++;

    const threats: string[] = [];
    let score = 0;

    // Check length
    if (input.length > this.config.maxLength) {
      threats.push(`Input exceeds maximum length of ${this.config.maxLength}`);
      score += 0.3;
    }

    // Check patterns
    for (const pattern of this.patterns) {
      if (pattern.test(input)) {
        const patternName = this.getPatternDescription(pattern);
        threats.push(patternName);
        score += 0.15;
      }
    }

    // Cap score at 1.0
    score = Math.min(score, 1.0);

    const safe = threats.length === 0;

    if (!safe) {
      this.stats.blocked++;
    }

    const result: InputGuardResult = {
      safe,
      threats,
      score,
    };

    // Sanitize if requested
    if (this.config.sanitize && !safe) {
      result.sanitized = this.sanitizeInput(input);
      this.stats.sanitized++;
    }

    return result;
  }

  private sanitizeInput(input: string): string {
    let sanitized = input;

    // Remove suspected injection patterns
    for (const pattern of this.patterns) {
      sanitized = sanitized.replace(pattern, "[REMOVED]");
    }

    // Truncate to max length
    if (sanitized.length > this.config.maxLength) {
      sanitized = sanitized.slice(0, this.config.maxLength) + "...";
    }

    return sanitized;
  }

  private getPatternDescription(pattern: RegExp): string {
    const source = pattern.source;

    if (
      source.includes("ignore") ||
      source.includes("disregard") ||
      source.includes("forget")
    ) {
      return "Instruction override attempt";
    }
    if (
      source.includes("you\\s+are\\s+now") ||
      source.includes("act\\s+as") ||
      source.includes("pretend")
    ) {
      return "Role injection attempt";
    }
    if (
      source.includes("new\\s+instructions") ||
      source.includes("system\\s+message")
    ) {
      return "Instruction manipulation";
    }
    if (
      source.includes("developer") ||
      source.includes("admin") ||
      source.includes("sudo")
    ) {
      return "Jailbreak attempt";
    }
    if (source.includes("\\\\x") || source.includes("base64")) {
      return "Encoding-based injection";
    }
    if (
      source.includes("show") ||
      source.includes("reveal") ||
      source.includes("what")
    ) {
      return "Prompt leakage attempt";
    }

    return "Suspicious pattern detected";
  }

  getStats() {
    return { ...this.stats };
  }

  addPattern(pattern: RegExp): void {
    this.patterns.push(pattern);
  }

  resetStats(): void {
    this.stats = {
      totalChecks: 0,
      blocked: 0,
      sanitized: 0,
    };
  }
}
