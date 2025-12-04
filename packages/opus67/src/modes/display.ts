/**
 * OPUS 67 Mode Display
 * Format modes for terminal display
 */

import type { ModeName, DetectionResult } from './types.js';
import { getMode } from './registry.js';

/**
 * Format mode for display
 */
export function formatModeDisplay(modeName: ModeName, detection?: DetectionResult): string {
  const mode = getMode(modeName);
  if (!mode) return `Unknown mode: ${modeName}`;

  let output = `
╔══════════════════════════════════════════════════════════════════╗
║  ${mode.icon} OPUS 67 :: ${mode.name.padEnd(10)} ${detection ? `[${(detection.confidence * 100).toFixed(0)}% confidence]` : ''}
╠══════════════════════════════════════════════════════════════════╣
║  ${mode.description.padEnd(62)} ║
╠══════════════════════════════════════════════════════════════════╣
║  Token Budget: ${String(mode.token_budget).padEnd(10)} Thinking: ${mode.thinking_depth.padEnd(15)} ║
║  Sub-agents: ${mode.sub_agents.enabled ? `Up to ${mode.sub_agents.max_agents}` : 'Disabled'.padEnd(12)}                                      ║`;

  if (detection) {
    output += `
╠══════════════════════════════════════════════════════════════════╣
║  Complexity Score: ${detection.complexity_score}/10                                        ║
║  Detected by: ${detection.reasons.slice(0, 2).join(', ').slice(0, 50).padEnd(50)} ║`;
  }

  output += `
╚══════════════════════════════════════════════════════════════════╝`;

  return output;
}

/**
 * Format compact mode status
 */
export function formatModeCompact(modeName: ModeName): string {
  const mode = getMode(modeName);
  if (!mode) return `[?] ${modeName}`;
  return `${mode.icon} ${mode.name}`;
}

/**
 * Format mode list
 */
export function formatModeList(modes: Array<{ id: ModeName; name: string; icon: string }>): string {
  return modes.map(m => `${m.icon} ${m.id.padEnd(15)} - ${m.name}`).join('\n');
}
