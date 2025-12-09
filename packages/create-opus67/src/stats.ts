/**
 * OPUS 67 Stats - Single Source of Truth
 * All component counts should reference this file
 */

export const OPUS67_STATS = {
  skills: 141,
  mcps: 83,
  modes: 30,
  agents: 107,
} as const;

export type InstallStats = typeof OPUS67_STATS;

export const VERSION = "6.1.0";
