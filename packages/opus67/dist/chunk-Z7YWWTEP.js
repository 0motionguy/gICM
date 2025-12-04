import { detectMode } from './chunk-JD6NEK3D.js';
import { getMode } from './chunk-J7GF6OJU.js';
import { EventEmitter } from 'eventemitter3';

var ModeSelector = class extends EventEmitter {
  currentMode = "auto";
  modeHistory = [];
  constructor() {
    super();
  }
  /**
   * Set mode manually
   */
  setMode(mode) {
    const previousMode = this.currentMode;
    this.currentMode = mode;
    this.emit("mode:change", { from: previousMode, to: mode, manual: true });
  }
  /**
   * Get current mode
   */
  getCurrentMode() {
    return this.currentMode;
  }
  /**
   * Process a query and detect/switch mode
   */
  processQuery(context) {
    const detection = detectMode({
      ...context,
      previousMode: this.currentMode,
      userPreference: this.currentMode !== "auto" ? this.currentMode : void 0
    });
    this.modeHistory.push({
      mode: detection.mode,
      timestamp: /* @__PURE__ */ new Date(),
      query: context.query.slice(0, 100)
    });
    if (this.modeHistory.length > 100) {
      this.modeHistory = this.modeHistory.slice(-100);
    }
    if (detection.mode !== this.currentMode && this.currentMode === "auto") {
      this.emit("mode:change", {
        from: this.currentMode,
        to: detection.mode,
        manual: false,
        detection
      });
    }
    return detection;
  }
  /**
   * Get mode usage statistics
   */
  getStats() {
    const stats = {};
    for (const entry of this.modeHistory) {
      stats[entry.mode] = (stats[entry.mode] || 0) + 1;
    }
    return stats;
  }
  /**
   * Get mode history
   */
  getHistory() {
    return [...this.modeHistory];
  }
  /**
   * Clear history
   */
  clearHistory() {
    this.modeHistory = [];
  }
};
var modeSelector = new ModeSelector();

// src/modes/display.ts
function formatModeDisplay(modeName, detection) {
  const mode = getMode(modeName);
  if (!mode) return `Unknown mode: ${modeName}`;
  let output = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  ${mode.icon} OPUS 67 :: ${mode.name.padEnd(10)} ${detection ? `[${(detection.confidence * 100).toFixed(0)}% confidence]` : ""}
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551  ${mode.description.padEnd(62)} \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551  Token Budget: ${String(mode.token_budget).padEnd(10)} Thinking: ${mode.thinking_depth.padEnd(15)} \u2551
\u2551  Sub-agents: ${mode.sub_agents.enabled ? `Up to ${mode.sub_agents.max_agents}` : "Disabled".padEnd(12)}                                      \u2551`;
  if (detection) {
    output += `
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551  Complexity Score: ${detection.complexity_score}/10                                        \u2551
\u2551  Detected by: ${detection.reasons.slice(0, 2).join(", ").slice(0, 50).padEnd(50)} \u2551`;
  }
  output += `
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`;
  return output;
}

// src/mode-selector.ts
if (process.argv[1]?.includes("mode-selector")) {
  const { detectMode: detectMode2 } = await import('./detection-QNWRHCDU.js');
  const { getMode: getMode2 } = await import('./registry-5ZMEKPMK.js');
  const testQueries = [
    "what is useState",
    "build a landing page with hero section",
    "design the entire system architecture for our new platform",
    "quick fix for this button",
    "analyze this token and find whale wallets",
    "audit the security of this anchor program",
    "create a beautiful animation for page transitions",
    "refactor the entire codebase to use the new design system"
  ];
  console.log("\n\u{1F9EA} Testing OPUS 67 Mode Detection\n");
  console.log("=".repeat(70));
  for (const query of testQueries) {
    const result = detectMode2({ query });
    const mode = getMode2(result.mode);
    console.log(`
\u{1F4DD} "${query.slice(0, 50)}..."`);
    console.log(`   ${mode.icon} ${result.mode.toUpperCase()} (${(result.confidence * 100).toFixed(0)}%)`);
    console.log(`   Complexity: ${result.complexity_score}/10`);
    console.log(`   Reasons: ${result.reasons.join(", ")}`);
  }
}

export { ModeSelector, formatModeDisplay, modeSelector };
