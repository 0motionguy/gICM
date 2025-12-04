/**
 * OPUS 67 Mode Selector
 * Intelligent auto-detection and manual mode switching
 *
 * Refactored from 515 lines to ~60 lines by extracting:
 * - modes/types.ts: Type definitions
 * - modes/registry.ts: Registry loading
 * - modes/complexity.ts: Complexity scoring
 * - modes/detection.ts: Mode detection
 * - modes/selector.ts: ModeSelector class
 * - modes/display.ts: Display formatting
 */

// Re-export everything from modes module
export type {
  ModeName,
  Mode,
  ModeRegistry,
  DetectionResult,
  ModeContext
} from './modes/types.js';

export {
  loadModeRegistry,
  getMode,
  getAllModes
} from './modes/registry.js';

export { detectMode } from './modes/detection.js';

export {
  ModeSelector,
  modeSelector
} from './modes/selector.js';

export { formatModeDisplay } from './modes/display.js';

// CLI test
if (process.argv[1]?.includes('mode-selector')) {
  const { detectMode } = await import('./modes/detection.js');
  const { getMode } = await import('./modes/registry.js');

  const testQueries = [
    'what is useState',
    'build a landing page with hero section',
    'design the entire system architecture for our new platform',
    'quick fix for this button',
    'analyze this token and find whale wallets',
    'audit the security of this anchor program',
    'create a beautiful animation for page transitions',
    'refactor the entire codebase to use the new design system'
  ];

  console.log('\n🧪 Testing OPUS 67 Mode Detection\n');
  console.log('='.repeat(70));

  for (const query of testQueries) {
    const result = detectMode({ query });
    const mode = getMode(result.mode)!;
    console.log(`\n📝 "${query.slice(0, 50)}..."`);
    console.log(`   ${mode.icon} ${result.mode.toUpperCase()} (${(result.confidence * 100).toFixed(0)}%)`);
    console.log(`   Complexity: ${result.complexity_score}/10`);
    console.log(`   Reasons: ${result.reasons.join(', ')}`);
  }
}
