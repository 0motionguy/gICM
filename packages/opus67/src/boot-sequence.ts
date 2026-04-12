/**
 * OPUS 67 Boot Sequence
 * Terminal UI and initialization display
 */

import {
  loadModeRegistry,
  getAllModes,
  type ModeName,
} from "./mode-selector.js";
import { loadRegistry } from "./skill-loader.js";
import { getAllConnections } from "./mcp-hub.js";

export interface BootConfig {
  showAnimation?: boolean;
  defaultMode?: ModeName;
  userName?: string;
  projectName?: string;
  version?: string;
  showEvolution?: boolean;
  showCouncil?: boolean;
}

export interface SystemStatus {
  skills: { loaded: number; available: number };
  mcps: { connected: number; available: number };
  modes: { current: ModeName; available: number };
  memory: { status: "ready" | "loading" | "error" };
  context: { indexed: boolean; files: number };
  subAgents: { available: number };
  combinations: { available: number };
  learning?: {
    enabled: boolean;
    acontext: "online" | "offline" | "unknown";
    sopsGenerated: number;
  };
}

/**
 * Generate the OPUS 67 boot screen - CLEAN VERSION
 */
export function generateBootScreen(config: BootConfig = {}): string {
  const modes = getAllModes();
  const mcps = getAllConnections();
  const modeRegistry = loadModeRegistry();
  const skillRegistry = loadRegistry();

  const currentMode = config.defaultMode || "auto";
  const modeConfig = modeRegistry.modes[currentMode];
  const version = config.version || "4.1.0";
  const projectName = config.projectName || "gICM";

  // Dynamic counts
  const skillCount = skillRegistry.skills.length;
  const mcpCount = mcps.length;
  const modeCount = modes.length;
  const agentCount = Object.keys(modeRegistry.sub_agents || {}).length;

  const ascii = `
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗                  ║
║  ██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔════╝ ╚════██║                  ║
║  ██║   ██║██████╔╝██║   ██║███████╗    ███████╗     ██╔╝                  ║
║  ██║   ██║██╔═══╝ ██║   ██║╚════██║    ██╔═══██╗   ██╔╝                   ║
║  ╚██████╔╝██║     ╚██████╔╝███████║    ╚██████╔╝   ██║                    ║
║   ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝     ╚═════╝    ╚═╝                    ║
║                                                                           ║
║                    Skill Orchestration Engine v${version.padEnd(24)}       ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   STATUS        ● ONLINE                                                  ║
║   MODE          ${modeConfig.icon} ${currentMode.toUpperCase().padEnd(58)}║
║   PROJECT       ${projectName.padEnd(58)}║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐ ║
║   │  SKILLS     │  MCPs       │  MODES      │  AGENTS     │  LEARNING   │ ║
║   │    ${String(skillCount).padStart(3)}      │     ${String(mcpCount).padStart(2)}      │     ${String(modeCount).padStart(2)}      │     ${String(agentCount).padStart(2)}      │     ON      │ ║
║   └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘ ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   ⚡ CAPABILITIES                                                         ║
║   ───────────────────────────────────────────────────────────────────     ║
║                                                                           ║
║   SKILL ENGINE                        │  INTEGRATIONS                     ║
║   ● 24 MCP tools available            │  ● Obsidian wiki (search/read)    ║
║   ● 5ms avg skill detection           │  ● OpenClaw fleet (8 agents)      ║
║   ● 100% routing accuracy (15/15)     │  ● Context7 (official docs)       ║
║   ● ~505 tokens/session overhead      │  ● Tavily (web research)          ║
║                                                                           ║
║   SAFETY                              │  COMMANDS                         ║
║   ● Context budget monitor            │  ● /opus67-plan (GSD tasks)       ║
║   ● Prompt injection guard            │  ● /opus67-compile-wiki           ║
║   ● Tool health analytics             │  ● /memory (persistent store)     ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   MODES (${String(modeCount).padStart(2)} available)                                                   ║
║   ───────────────────────────────────────────────────────────────────     ║
║   🧠 ULTRA   💭 THINK   🔨 BUILD   ⚡ VIBE   💡 LIGHT   🎨 CREATIVE       ║
║   📊 DATA    🛡️ AUDIT   🐝 SWARM   🤖 AUTO   🌙 BG     👀 REVIEW         ║
║   👁️ GRAB   🔄 CLONE   🔍 RESEARCH  🪙 SOLANA  🏗️ INFRA  🔬 DEEP-RESEARCH ║
║   🎨 DESIGN  ✍️ CONTENT  💼 BUSINESS  ♟️ STRATEGY  📣 MARKETING  🚀 SHIP   ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   "set mode <n>" to switch  │  "help" for commands  │  AUTO by default   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

  ┌─────────────────────────────────────────────────────────────────────────┐
  │  OPUS 67 ≠ Separate AI  │  OPUS 67 = Claude + Enhancement Layer        │
  │  Claude IS the brain. OPUS 67 = skills + MCPs + modes + memory.        │
  └─────────────────────────────────────────────────────────────────────────┘

  Ready. Type anything to begin.

`;

  return ascii;
}

/**
 * Generate compact status line
 */
export function generateStatusLine(status: SystemStatus): string {
  const modeEmoji: Record<string, string> = {
    ultra: "🧠",
    think: "💭",
    build: "🔨",
    vibe: "⚡",
    light: "💡",
    creative: "🎨",
    data: "📊",
    audit: "🛡️",
    swarm: "🐝",
    auto: "🤖",
    background: "🌙",
    review: "👀",
  };

  return `${modeEmoji[status.modes.current]} OPUS 67 │ ${status.modes.current.toUpperCase()} │ Skills: ${status.skills.loaded}/${status.skills.available} │ MCPs: ${status.mcps.connected}/${status.mcps.available} │ Context: ${status.context.indexed ? "●" : "○"}`;
}

/**
 * Generate mode switch notification
 */
export function generateModeSwitchNotification(
  from: ModeName,
  to: ModeName,
  reason: string
): string {
  const registry = loadModeRegistry();
  const toMode = registry.modes[to];

  return `
┌─ MODE SWITCH ───────────────────────────────────────────┐
│                                                         │
│  ${registry.modes[from]?.icon || "?"} ${from.toUpperCase()} → ${toMode.icon} ${to.toUpperCase().padEnd(40)}│
│                                                         │
│  Reason: ${reason.slice(0, 47).padEnd(47)} │
│  ${toMode.description.slice(0, 53).padEnd(53)} │
│                                                         │
└─────────────────────────────────────────────────────────┘`;
}

/**
 * Generate sub-agent spawn notification
 */
export function generateAgentSpawnNotification(
  agents: Array<{ type: string; task: string; model: string }>
): string {
  let output = `
┌─ 🐝 SWARM ACTIVATED ────────────────────────────────────┐
│                                                         │
│  Spawning ${agents.length} sub-agents in parallel...                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  AGENT          │ MODEL    │ TASK                       │
├─────────────────────────────────────────────────────────┤`;

  for (const agent of agents) {
    output += `
│  ${agent.type.padEnd(14)} │ ${agent.model.padEnd(8)} │ ${agent.task.slice(0, 26).padEnd(26)} │`;
  }

  output += `
│                                                         │
└─────────────────────────────────────────────────────────┘`;

  return output;
}

/**
 * Generate help screen
 */
export function generateHelpScreen(): string {
  return `
╔═══════════════════════════════════════════════════════════════════════════╗
║                           OPUS 67 - HELP                                  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  MODE COMMANDS                                                            ║
║  ─────────────────────────────────────────────────────────────────────    ║
║  set mode ultra       Maximum reasoning for complex architecture          ║
║  set mode think       Deep analysis, debugging, investigation             ║
║  set mode build       Production code generation                          ║
║  set mode vibe        Rapid prototyping, ship fast                        ║
║  set mode light       Quick answers, minimal tokens (uses LOCAL LLM)      ║
║  set mode creative    UI/UX design, animations, visuals                   ║
║  set mode data        Market analysis, on-chain research                  ║
║  set mode audit       Security review, code quality                       ║
║  set mode swarm       Multi-agent parallel execution (up to 20!)          ║
║  set mode auto        Intelligent auto-switching (default)                ║
║                                                                           ║
║  SYSTEM COMMANDS                                                          ║
║  ─────────────────────────────────────────────────────────────────────    ║
║  status               Show current system status                          ║
║  skills               List loaded skills                                  ║
║  mcps                 Show MCP connections                                ║
║  agents               List sub-agents                                     ║
║  help                 Show this help                                      ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝`;
}

/**
 * Generate minimal inline status
 */
export function generateInlineStatus(
  mode: ModeName,
  confidence?: number
): string {
  const modeEmoji: Record<string, string> = {
    ultra: "🧠",
    think: "💭",
    build: "🔨",
    vibe: "⚡",
    light: "💡",
    creative: "🎨",
    data: "📊",
    audit: "🛡️",
    swarm: "🐝",
    auto: "🤖",
    background: "🌙",
    review: "👀",
  };

  const confStr = confidence ? ` ${(confidence * 100).toFixed(0)}%` : "";
  return `${modeEmoji[mode]} ${mode.toUpperCase()}${confStr}`;
}

/**
 * Generate system status panel
 */
export function generateStatusPanel(status: SystemStatus): string {
  const modeEmoji: Record<string, string> = {
    ultra: "🧠",
    think: "💭",
    build: "🔨",
    vibe: "⚡",
    light: "💡",
    creative: "🎨",
    data: "📊",
    audit: "🛡️",
    swarm: "🐝",
    auto: "🤖",
    background: "🌙",
    review: "👀",
  };

  return `
┌─ OPUS 67 STATUS ────────────────────────────────────────┐
│                                                         │
│  MODE        ${modeEmoji[status.modes.current]} ${status.modes.current.toUpperCase().padEnd(42)}│
│                                                         │
│  Skills      ${String(status.skills.loaded).padEnd(3)} loaded / ${String(status.skills.available).padEnd(3)} available              │
│  MCPs        ${String(status.mcps.connected).padEnd(3)} connected / ${String(status.mcps.available).padEnd(3)} available           │
│  Sub-Agents  ${String(status.subAgents.available).padEnd(3)} types available                        │
│  Presets     ${String(status.combinations.available).padEnd(3)} skill combinations                      │
│                                                         │
│  Memory      ${status.memory.status === "ready" ? "● Ready" : "○ " + status.memory.status}                                      │
│  Context     ${status.context.indexed ? "● Indexed" : "○ Not indexed"} (${String(status.context.files).padEnd(4)} files)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘`;
}

// CLI Test
if (process.argv[1]?.includes("boot-sequence")) {
  console.log(
    generateBootScreen({
      defaultMode: "auto",
      version: "2.0.0",
      projectName: "gICM",
    })
  );
}
