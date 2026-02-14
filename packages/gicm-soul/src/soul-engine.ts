import { EventEmitter } from "node:events";
import type {
  Mode,
  ModeFragment,
  SoulConfig,
  ClassifyResult,
  SoulOutput,
} from "./types.js";
import { MODE_TRIGGERS } from "./modes.js";
import {
  getFragment,
  DEFAULT_FRAGMENTS,
  FULL_SOUL_TOKEN_COST,
} from "./fragments.js";

export class SoulEngine extends EventEmitter {
  private currentMode: Mode;
  private config: SoulConfig;
  private currentFragment: ModeFragment | null = null;

  constructor(config: Partial<SoulConfig> = {}) {
    super();
    this.config = {
      defaultMode: config.defaultMode ?? "BUILD",
      autoSwitch: config.autoSwitch ?? true,
      fragmentsDir: config.fragmentsDir,
      userPrefsPath: config.userPrefsPath,
    };
    this.currentMode = this.config.defaultMode;
    this.currentFragment = getFragment(
      this.currentMode,
      this.config.fragmentsDir
    );
  }

  /**
   * Classify the mode based on message content
   */
  classifyMode(message: string): ClassifyResult {
    const messageLower = message.toLowerCase();
    const scores = new Map<Mode, { score: number; reasons: string[] }>();

    // Initialize scores for all modes
    for (const trigger of MODE_TRIGGERS) {
      scores.set(trigger.mode, { score: 0, reasons: [] });
    }

    // Score based on pattern matches
    for (const trigger of MODE_TRIGGERS) {
      const entry = scores.get(trigger.mode)!;

      // Check regex patterns
      for (const pattern of trigger.patterns) {
        if (pattern.test(message)) {
          entry.score += 5;
          entry.reasons.push(`Matched pattern: ${pattern.source}`);
        }
      }

      // Check keywords
      for (const keyword of trigger.keywords) {
        if (messageLower.includes(keyword.toLowerCase())) {
          entry.score += 1;
          entry.reasons.push(`Matched keyword: "${keyword}"`);
        }
      }
    }

    // Find highest scoring mode
    let bestMode: Mode = this.config.defaultMode;
    let bestScore = 0;
    let bestReasons: string[] = [];

    for (const [mode, { score, reasons }] of scores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestMode = mode;
        bestReasons = reasons;
      }
    }

    // Calculate confidence (0-1)
    // If no matches, confidence is 0 and we use default mode
    const confidence = bestScore > 0 ? Math.min(bestScore / 10, 1) : 0;

    const selectedMode = confidence > 0.3 ? bestMode : this.config.defaultMode;
    const tokensSaved =
      FULL_SOUL_TOKEN_COST - DEFAULT_FRAGMENTS[selectedMode].tokenCost;

    return {
      mode: selectedMode,
      confidence,
      reasons: bestReasons.slice(0, 5), // Top 5 reasons
      tokensSaved,
    };
  }

  /**
   * Resolve mode and build system prompt for a message
   */
  resolve(message: string): SoulOutput {
    const classification = this.classifyMode(message);

    if (this.config.autoSwitch && classification.mode !== this.currentMode) {
      this.switchMode(classification.mode);
      this.emit("mode:detected", {
        mode: classification.mode,
        confidence: classification.confidence,
        reasons: classification.reasons,
      });
    }

    const fragment =
      this.currentFragment ??
      getFragment(this.currentMode, this.config.fragmentsDir);

    const systemPrompt = this.buildSystemPrompt(fragment);
    const tokenCount = fragment.tokenCost;
    const fullTokenCount = FULL_SOUL_TOKEN_COST;
    const savedPercent = Math.round(
      ((fullTokenCount - tokenCount) / fullTokenCount) * 100
    );

    return {
      mode: this.currentMode,
      systemPrompt,
      tokenCount,
      fullTokenCount,
      savedPercent,
    };
  }

  /**
   * Manually switch to a specific mode
   */
  switchMode(mode: Mode): ModeFragment {
    const oldMode = this.currentMode;
    this.currentMode = mode;
    this.currentFragment = getFragment(mode, this.config.fragmentsDir);

    if (oldMode !== mode) {
      this.emit("mode:switched", {
        from: oldMode,
        to: mode,
        fragment: this.currentFragment,
      });
    }

    return this.currentFragment;
  }

  /**
   * Get current active mode
   */
  getCurrentMode(): Mode {
    return this.currentMode;
  }

  /**
   * Get current fragment
   */
  getCurrentFragment(): ModeFragment | null {
    return this.currentFragment;
  }

  /**
   * Get token savings compared to loading full SOUL
   */
  getTokenSavings(): { current: number; full: number; savedPercent: number } {
    const current = this.currentFragment?.tokenCost ?? 0;
    const full = FULL_SOUL_TOKEN_COST;
    const savedPercent = Math.round(((full - current) / full) * 100);

    return { current, full, savedPercent };
  }

  /**
   * Build system prompt from fragment
   */
  private buildSystemPrompt(fragment: ModeFragment): string {
    return `# ${fragment.mode} MODE

${fragment.identity}

## Response Style
${fragment.style}

## Preferred Tools
${fragment.tools.join(", ")}

---

Apply this identity to all responses. Stay in character.`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SoulConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SoulConfig {
    return { ...this.config };
  }
}
