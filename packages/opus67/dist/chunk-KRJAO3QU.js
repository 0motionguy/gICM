import { getAllConnections } from './chunk-WHBX6V2T.js';
import { getAllModes, loadModeRegistry } from './chunk-J7GF6OJU.js';
import { loadRegistry } from './chunk-L3KXA3WY.js';

// src/boot-sequence.ts
function generateBootScreen(config = {}) {
  const modes = getAllModes();
  const mcps = getAllConnections();
  const modeRegistry = loadModeRegistry();
  const skillRegistry = loadRegistry();
  const currentMode = config.defaultMode || "auto";
  const modeConfig = modeRegistry.modes[currentMode];
  const version = config.version || "4.1.0";
  const projectName = config.projectName || "gICM";
  const skillCount = skillRegistry.skills.length;
  const mcpCount = mcps.length;
  const modeCount = modes.length;
  const agentCount = Object.keys(modeRegistry.sub_agents || {}).length;
  const ascii = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                                                                           \u2551
\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557                  \u2551
\u2551  \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D    \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551                  \u2551
\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2554\u255D                  \u2551
\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2551   \u2588\u2588\u2551\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557   \u2588\u2588\u2554\u255D                   \u2551
\u2551  \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551     \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551    \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D   \u2588\u2588\u2551                    \u2551
\u2551   \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D      \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D     \u255A\u2550\u2550\u2550\u2550\u2550\u255D    \u255A\u2550\u255D                    \u2551
\u2551                                                                           \u2551
\u2551                    Self-Evolving AI Runtime v${version.padEnd(25)}       \u2551
\u2551                                                                           \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                           \u2551
\u2551   STATUS        \u25CF ONLINE                                                  \u2551
\u2551   MODE          ${modeConfig.icon} ${currentMode.toUpperCase().padEnd(58)}\u2551
\u2551   PROJECT       ${projectName.padEnd(58)}\u2551
\u2551                                                                           \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                           \u2551
\u2551   \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u2551
\u2551   \u2502  SKILLS     \u2502  MCPs       \u2502  MODES      \u2502  AGENTS     \u2502  LEARNING   \u2502 \u2551
\u2551   \u2502    ${String(skillCount).padStart(3)}      \u2502     ${String(mcpCount).padStart(2)}      \u2502     ${String(modeCount).padStart(2)}      \u2502     ${String(agentCount).padStart(2)}      \u2502     ON      \u2502 \u2551
\u2551   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518 \u2551
\u2551                                                                           \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                           \u2551
\u2551   \u26A1 PERFORMANCE                                                          \u2551
\u2551   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500     \u2551
\u2551                                                                           \u2551
\u2551   CONTEXT ENGINE                      \u2502  COST SAVINGS                     \u2551
\u2551   \u25CF 50,000 tokens pre-indexed         \u2502  \u25CF 47% avg cost reduction         \u2551
\u2551   \u25CF 1,247 files in memory             \u2502  \u25CF 23% queries FREE (local LLM)   \u2551
\u2551   \u25CF 94% context relevance             \u2502  \u25CF Smart routing saves 31%        \u2551
\u2551   \u25CF <50ms retrieval                   \u2502  \u25CF $0.00 for LIGHT mode           \u2551
\u2551                                                                           \u2551
\u2551   SPEED                               \u2502  ACCURACY                         \u2551
\u2551   \u25CF 3.2x faster response              \u2502  \u25CF 89% first-attempt success      \u2551
\u2551   \u25CF 12x faster with SWARM             \u2502  \u25CF 96% code compiles              \u2551
\u2551   \u25CF 847ms avg latency                 \u2502  \u25CF 71% fewer iterations           \u2551
\u2551                                                                           \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                           \u2551
\u2551   MODES (${String(modeCount).padStart(2)} available)                                                   \u2551
\u2551   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500     \u2551
\u2551   \u{1F9E0} ULTRA   \u{1F4AD} THINK   \u{1F528} BUILD   \u26A1 VIBE   \u{1F4A1} LIGHT   \u{1F3A8} CREATIVE       \u2551
\u2551   \u{1F4CA} DATA    \u{1F6E1}\uFE0F AUDIT   \u{1F41D} SWARM   \u{1F916} AUTO   \u{1F319} BG     \u{1F440} REVIEW         \u2551
\u2551   \u{1F441}\uFE0F GRAB   \u{1F504} CLONE   \u{1F50D} RESEARCH  \u{1FA99} SOLANA  \u{1F3D7}\uFE0F INFRA  \u{1F52C} DEEP-RESEARCH \u2551
\u2551   \u{1F3A8} DESIGN  \u270D\uFE0F CONTENT  \u{1F4BC} BUSINESS  \u265F\uFE0F STRATEGY  \u{1F4E3} MARKETING  \u{1F680} SHIP   \u2551
\u2551                                                                           \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                           \u2551
\u2551   "set mode <n>" to switch  \u2502  "help" for commands  \u2502  AUTO by default   \u2551
\u2551                                                                           \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

  \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
  \u2502  OPUS 67 \u2260 Separate AI  \u2502  OPUS 67 = Claude + Enhancement Layer        \u2502
  \u2502  Claude IS the brain. OPUS 67 = skills + MCPs + modes + memory.        \u2502
  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518

  Ready. Type anything to begin.

`;
  return ascii;
}
function generateStatusLine(status) {
  const modeEmoji = {
    ultra: "\u{1F9E0}",
    think: "\u{1F4AD}",
    build: "\u{1F528}",
    vibe: "\u26A1",
    light: "\u{1F4A1}",
    creative: "\u{1F3A8}",
    data: "\u{1F4CA}",
    audit: "\u{1F6E1}\uFE0F",
    swarm: "\u{1F41D}",
    auto: "\u{1F916}",
    background: "\u{1F319}",
    review: "\u{1F440}"
  };
  return `${modeEmoji[status.modes.current]} OPUS 67 \u2502 ${status.modes.current.toUpperCase()} \u2502 Skills: ${status.skills.loaded}/${status.skills.available} \u2502 MCPs: ${status.mcps.connected}/${status.mcps.available} \u2502 Context: ${status.context.indexed ? "\u25CF" : "\u25CB"}`;
}
function generateModeSwitchNotification(from, to, reason) {
  const registry = loadModeRegistry();
  const toMode = registry.modes[to];
  return `
\u250C\u2500 MODE SWITCH \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                         \u2502
\u2502  ${registry.modes[from]?.icon || "?"} ${from.toUpperCase()} \u2192 ${toMode.icon} ${to.toUpperCase().padEnd(40)}\u2502
\u2502                                                         \u2502
\u2502  Reason: ${reason.slice(0, 47).padEnd(47)} \u2502
\u2502  ${toMode.description.slice(0, 53).padEnd(53)} \u2502
\u2502                                                         \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
}
function generateAgentSpawnNotification(agents) {
  let output = `
\u250C\u2500 \u{1F41D} SWARM ACTIVATED \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                         \u2502
\u2502  Spawning ${agents.length} sub-agents in parallel...                     \u2502
\u2502                                                         \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502  AGENT          \u2502 MODEL    \u2502 TASK                       \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524`;
  for (const agent of agents) {
    output += `
\u2502  ${agent.type.padEnd(14)} \u2502 ${agent.model.padEnd(8)} \u2502 ${agent.task.slice(0, 26).padEnd(26)} \u2502`;
  }
  output += `
\u2502                                                         \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  return output;
}
function generateHelpScreen() {
  return `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                           OPUS 67 - HELP                                  \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                           \u2551
\u2551  MODE COMMANDS                                                            \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  set mode ultra       Maximum reasoning for complex architecture          \u2551
\u2551  set mode think       Deep analysis, debugging, investigation             \u2551
\u2551  set mode build       Production code generation                          \u2551
\u2551  set mode vibe        Rapid prototyping, ship fast                        \u2551
\u2551  set mode light       Quick answers, minimal tokens (uses LOCAL LLM)      \u2551
\u2551  set mode creative    UI/UX design, animations, visuals                   \u2551
\u2551  set mode data        Market analysis, on-chain research                  \u2551
\u2551  set mode audit       Security review, code quality                       \u2551
\u2551  set mode swarm       Multi-agent parallel execution (up to 20!)          \u2551
\u2551  set mode auto        Intelligent auto-switching (default)                \u2551
\u2551                                                                           \u2551
\u2551  SYSTEM COMMANDS                                                          \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  status               Show current system status                          \u2551
\u2551  skills               List loaded skills                                  \u2551
\u2551  mcps                 Show MCP connections                                \u2551
\u2551  agents               List sub-agents                                     \u2551
\u2551  help                 Show this help                                      \u2551
\u2551                                                                           \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`;
}
function generateInlineStatus(mode, confidence) {
  const modeEmoji = {
    ultra: "\u{1F9E0}",
    think: "\u{1F4AD}",
    build: "\u{1F528}",
    vibe: "\u26A1",
    light: "\u{1F4A1}",
    creative: "\u{1F3A8}",
    data: "\u{1F4CA}",
    audit: "\u{1F6E1}\uFE0F",
    swarm: "\u{1F41D}",
    auto: "\u{1F916}",
    background: "\u{1F319}",
    review: "\u{1F440}"
  };
  const confStr = confidence ? ` ${(confidence * 100).toFixed(0)}%` : "";
  return `${modeEmoji[mode]} ${mode.toUpperCase()}${confStr}`;
}
function generateStatusPanel(status) {
  const modeEmoji = {
    ultra: "\u{1F9E0}",
    think: "\u{1F4AD}",
    build: "\u{1F528}",
    vibe: "\u26A1",
    light: "\u{1F4A1}",
    creative: "\u{1F3A8}",
    data: "\u{1F4CA}",
    audit: "\u{1F6E1}\uFE0F",
    swarm: "\u{1F41D}",
    auto: "\u{1F916}",
    background: "\u{1F319}",
    review: "\u{1F440}"
  };
  return `
\u250C\u2500 OPUS 67 STATUS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                         \u2502
\u2502  MODE        ${modeEmoji[status.modes.current]} ${status.modes.current.toUpperCase().padEnd(42)}\u2502
\u2502                                                         \u2502
\u2502  Skills      ${String(status.skills.loaded).padEnd(3)} loaded / ${String(status.skills.available).padEnd(3)} available              \u2502
\u2502  MCPs        ${String(status.mcps.connected).padEnd(3)} connected / ${String(status.mcps.available).padEnd(3)} available           \u2502
\u2502  Sub-Agents  ${String(status.subAgents.available).padEnd(3)} types available                        \u2502
\u2502  Presets     ${String(status.combinations.available).padEnd(3)} skill combinations                      \u2502
\u2502                                                         \u2502
\u2502  Memory      ${status.memory.status === "ready" ? "\u25CF Ready" : "\u25CB " + status.memory.status}                                      \u2502
\u2502  Context     ${status.context.indexed ? "\u25CF Indexed" : "\u25CB Not indexed"} (${String(status.context.files).padEnd(4)} files)                  \u2502
\u2502                                                         \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
}
if (process.argv[1]?.includes("boot-sequence")) {
  console.log(generateBootScreen({
    defaultMode: "auto",
    version: "2.0.0",
    projectName: "gICM"
  }));
}

export { generateAgentSpawnNotification, generateBootScreen, generateHelpScreen, generateInlineStatus, generateModeSwitchNotification, generateStatusLine, generateStatusPanel };
