/**
 * OPUS 67 - Self-Evolving AI Runtime
 * Boot sequence and main orchestrator
 *
 * NOW WITH UNIFIED MEMORY!
 * - GraphitiMemory (graph database)
 * - LearningStore (pattern learnings)
 * - MarkdownMemory (.claude/memory files)
 * - HMLR (multi-hop reasoning)
 */

import { ContextIndexer } from "./context/indexer.js";
import { SkillLoader } from "./skills/loader.js";
import { MCPHub } from "./mcp/hub.js";
import { AutonomyEngine } from "./autonomy/engine.js";
import { EventEmitter } from "eventemitter3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  UnifiedMemory,
  createUnifiedMemory,
  MemoryEventConsumer,
  createEventConsumer,
  type MemoryStats,
} from "./memory/unified/index.js";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// TYPES
// =============================================================================

export interface OPUS67Config {
  projectRoot: string;
  skillsPath: string;
  mcpConfigPath: string;
  contextConfig: ContextConfig;
  autonomyLevel: 1 | 2 | 3 | 4;
}

export interface ContextConfig {
  indexPaths: string[];
  excludePatterns: string[];
  maxTokens: number;
  vectorDbPath: string;
}

export interface BootStatus {
  phase:
    | "init"
    | "memory"
    | "context"
    | "skills"
    | "mcp"
    | "autonomy"
    | "ready"
    | "error";
  progress: number;
  message: string;
  timestamp: Date;
}

export interface OPUS67Events {
  "boot:start": () => void;
  "boot:progress": (status: BootStatus) => void;
  "boot:complete": () => void;
  "boot:error": (error: Error) => void;
  "skill:loaded": (skillId: string) => void;
  "mcp:connected": (mcpId: string) => void;
  "task:detected": (taskType: string, skills: string[]) => void;
  // NEW: Memory events
  "memory:ready": (stats: MemoryStats) => void;
  "memory:query": (query: string, resultCount: number) => void;
}

// =============================================================================
// OPUS 67 CORE
// =============================================================================

export class OPUS67 extends EventEmitter<OPUS67Events> {
  private config: OPUS67Config;
  private context: ContextIndexer;
  private skills: SkillLoader;
  private mcp: MCPHub;
  private autonomy: AutonomyEngine;
  private unifiedMemory: UnifiedMemory | null = null;
  private eventConsumer: MemoryEventConsumer | null = null;
  private theDoorPrompt: string = "";
  private isReady: boolean = false;

  constructor(config: OPUS67Config) {
    super();
    this.config = config;
    this.context = new ContextIndexer(config.contextConfig);
    this.skills = new SkillLoader(config.skillsPath);
    this.mcp = new MCPHub(config.mcpConfigPath);
    this.autonomy = new AutonomyEngine({ level: config.autonomyLevel });
  }

  /**
   * Boot sequence - initialize all subsystems
   * NOW WITH UNIFIED MEMORY!
   */
  async boot(): Promise<void> {
    this.emit("boot:start");

    try {
      // Phase 1: Load THE DOOR prompt
      this.updateStatus("init", 0, "Loading THE DOOR orchestrator...");
      await this.loadTheDoor();

      // Phase 2: Initialize UNIFIED MEMORY (NEW!)
      this.updateStatus("memory", 15, "Initializing unified memory system...");
      await this.initializeUnifiedMemory();

      // Phase 3: Index context
      this.updateStatus("context", 30, "Indexing project context...");
      await this.context.index(this.config.projectRoot);

      // Phase 4: Load skills registry
      this.updateStatus("skills", 50, "Loading skills registry...");
      await this.skills.loadRegistry();

      // Phase 5: Connect MCPs
      this.updateStatus("mcp", 70, "Connecting MCP integrations...");
      await this.mcp.connectAll();

      // Phase 6: Initialize autonomy
      this.updateStatus("autonomy", 85, "Initializing autonomy engine...");
      await this.autonomy.initialize();

      // Phase 7: Ready
      this.updateStatus(
        "ready",
        100,
        "THE DOOR IS OPEN. OPUS 67 ONLINE. MEMORY UNIFIED.",
      );
      this.isReady = true;
      this.emit("boot:complete");
    } catch (error) {
      this.updateStatus("error", 0, `Boot failed: ${error}`);
      this.emit("boot:error", error as Error);
      throw error;
    }
  }

  /**
   * Initialize the unified memory system
   * Connects: GraphitiMemory, LearningStore, MarkdownMemory, HMLR
   */
  private async initializeUnifiedMemory(): Promise<void> {
    try {
      this.unifiedMemory = await createUnifiedMemory({
        projectRoot: this.config.projectRoot,
        enableHMLR: true,
        enableNeo4j: true, // Will auto-fallback to local if unavailable
        enableSQLite: true,
        enableClaudeMem: false, // Future
        maxContextTokens: 4000,
        maxResults: 10,
        maxHops: 3,
      });

      // Initialize event consumer and consume any pending events
      this.eventConsumer = createEventConsumer({
        projectRoot: this.config.projectRoot,
      });

      if (this.eventConsumer.hasEvents()) {
        const consumed = await this.eventConsumer.consume(this.unifiedMemory);
        if (consumed.processed > 0) {
          console.log(
            `[OPUS67] Consumed ${consumed.processed} memory events from hooks`,
          );
        }
      }

      const stats = await this.unifiedMemory.getStats();
      this.emit("memory:ready", stats);

      console.log(
        `[OPUS67] Unified Memory: ${stats.totalMemories} memories across ${
          Object.entries(stats.sources).filter(([, s]) => s.available).length
        } sources`,
      );
    } catch (error) {
      console.warn("[OPUS67] Unified memory init failed (non-fatal):", error);
      // Non-fatal - continue boot without unified memory
    }
  }

  /**
   * Load THE DOOR master prompt
   */
  private async loadTheDoor(): Promise<void> {
    const doorPath = join(__dirname, "..", "THE_DOOR.md");
    this.theDoorPrompt = readFileSync(doorPath, "utf-8");
  }

  /**
   * Process a user task - auto-loads skills, connects MCPs, injects context
   */
  async processTask(input: string): Promise<TaskContext> {
    if (!this.isReady) {
      throw new Error("OPUS 67 not initialized. Call boot() first.");
    }

    // 1. Detect task type and required skills
    const taskAnalysis = await this.analyzeTask(input);
    this.emit("task:detected", taskAnalysis.type, taskAnalysis.skills);

    // 2. Load relevant skills
    const loadedSkills = await this.skills.loadForTask(taskAnalysis.skills);
    for (const skill of loadedSkills) {
      this.emit("skill:loaded", skill.id);
    }

    // 3. Connect required MCPs
    const connectedMCPs = await this.mcp.connectForSkills(taskAnalysis.skills);
    for (const mcp of connectedMCPs) {
      this.emit("mcp:connected", mcp.id);
    }

    // 4. Retrieve relevant context
    const relevantContext = await this.context.retrieve(input);

    // 5. Build full prompt context
    return {
      theDoor: this.theDoorPrompt,
      context: relevantContext,
      skills: loadedSkills,
      mcpTools: this.mcp.getAvailableTools(),
      input,
    };
  }

  /**
   * Analyze task to determine required skills
   */
  private async analyzeTask(input: string): Promise<TaskAnalysis> {
    const lowerInput = input.toLowerCase();
    const detectedSkills: string[] = [];
    const registry = this.skills.getRegistry();

    // Check each skill's triggers
    for (const skill of registry.skills) {
      let matched = false;

      // Check keywords
      for (const keyword of skill.triggers.keywords || []) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          matched = true;
          break;
        }
      }

      // Check file extensions mentioned
      for (const ext of skill.triggers.extensions || []) {
        if (lowerInput.includes(ext)) {
          matched = true;
          break;
        }
      }

      if (matched && !detectedSkills.includes(skill.id)) {
        detectedSkills.push(skill.id);
      }
    }

    // Limit to max concurrent skills
    const maxSkills = registry.loading?.max_concurrent_skills || 5;
    const prioritized = detectedSkills.slice(0, maxSkills);

    return {
      type: this.classifyTaskType(lowerInput),
      skills: prioritized,
      confidence: prioritized.length > 0 ? 0.8 : 0.3,
    };
  }

  /**
   * Classify task type for routing
   */
  private classifyTaskType(input: string): string {
    if (
      input.includes("code") ||
      input.includes("implement") ||
      input.includes("build")
    ) {
      return "development";
    }
    if (
      input.includes("research") ||
      input.includes("analyze") ||
      input.includes("find")
    ) {
      return "research";
    }
    if (
      input.includes("deploy") ||
      input.includes("launch") ||
      input.includes("migrate")
    ) {
      return "operations";
    }
    if (
      input.includes("test") ||
      input.includes("audit") ||
      input.includes("review")
    ) {
      return "quality";
    }
    return "general";
  }

  /**
   * Update boot status
   */
  private updateStatus(
    phase: BootStatus["phase"],
    progress: number,
    message: string,
  ): void {
    const status: BootStatus = {
      phase,
      progress,
      message,
      timestamp: new Date(),
    };
    this.emit("boot:progress", status);
    console.log(`[OPUS67] ${phase.toUpperCase()}: ${message} (${progress}%)`);
  }

  // Getters
  get ready(): boolean {
    return this.isReady;
  }

  get contextStats() {
    return this.context.getStats();
  }

  get loadedSkills() {
    return this.skills.getLoaded();
  }

  get connectedMCPs() {
    return this.mcp.getConnected();
  }

  /**
   * Get unified memory instance
   */
  get memory(): UnifiedMemory | null {
    return this.unifiedMemory;
  }

  /**
   * Get memory stats
   */
  async getMemoryStats(): Promise<MemoryStats | null> {
    if (!this.unifiedMemory) return null;
    return this.unifiedMemory.getStats();
  }

  /**
   * Query unified memory
   */
  async queryMemory(query: string, limit = 10) {
    if (!this.unifiedMemory) {
      console.warn("[OPUS67] Unified memory not available");
      return [];
    }
    const results = await this.unifiedMemory.query({ query, limit });
    this.emit("memory:query", query, results.length);
    return results;
  }

  /**
   * Get context from unified memory for a topic
   */
  async getMemoryContext(topic: string, maxTokens = 4000) {
    if (!this.unifiedMemory) {
      return { results: [], sources: {}, tokenEstimate: 0, query: topic };
    }
    return this.unifiedMemory.getContext(topic, maxTokens);
  }

  /**
   * Perform multi-hop reasoning query
   */
  async multiHopQuery(query: string, maxHops = 3) {
    if (!this.unifiedMemory) {
      console.warn("[OPUS67] Unified memory not available for multi-hop");
      return [];
    }
    return this.unifiedMemory.multiHopQuery(query, maxHops);
  }
}

// =============================================================================
// SUPPORTING TYPES
// =============================================================================

interface TaskAnalysis {
  type: string;
  skills: string[];
  confidence: number;
}

interface TaskContext {
  theDoor: string;
  context: RetrievedContext;
  skills: LoadedSkill[];
  mcpTools: MCPTool[];
  input: string;
}

interface RetrievedContext {
  files: Array<{ path: string; content: string }>;
  memories: Array<{ key: string; value: string }>;
  history: Array<{ role: string; content: string }>;
  tokens: number;
}

interface LoadedSkill {
  id: string;
  name: string;
  knowledge: string;
  capabilities: string[];
}

interface MCPTool {
  id: string;
  name: string;
  description: string;
  mcp: string;
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export async function createOPUS67(projectRoot: string): Promise<OPUS67> {
  const config: OPUS67Config = {
    projectRoot,
    skillsPath: join(__dirname, "..", "skills", "registry.yaml"),
    mcpConfigPath: join(__dirname, "..", "mcp", "connections.yaml"),
    contextConfig: {
      indexPaths: [projectRoot],
      excludePatterns: ["node_modules", ".git", "dist", ".next"],
      maxTokens: 50000,
      vectorDbPath: join(projectRoot, ".opus67", "vectors"),
    },
    autonomyLevel: 2, // Bounded autonomy
  };

  const opus = new OPUS67(config);
  await opus.boot();
  return opus;
}

// =============================================================================
// CLI ENTRY
// =============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const projectRoot = process.argv[2] || process.cwd();

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                        OPUS 67                                 ║
║              Self-Evolving AI Runtime                          ║
║                   UNIFIED MEMORY                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  createOPUS67(projectRoot)
    .then(async (opus) => {
      console.log("\n✅ OPUS 67 initialized successfully");
      console.log(
        `   Context: ${opus.contextStats.totalTokens} tokens indexed`,
      );
      console.log(`   Skills: ${opus.loadedSkills.length} loaded`);
      console.log(`   MCPs: ${opus.connectedMCPs.length} connected`);

      // Display memory stats
      const memStats = await opus.getMemoryStats();
      if (memStats) {
        const sources = Object.entries(memStats.sources)
          .filter(([, s]) => s.available)
          .map(([name, s]) => `${name}(${s.count})`);
        console.log(
          `   Memory: ${memStats.totalMemories} total [${sources.join(", ")}]`,
        );
        console.log(
          `   HMLR: ${memStats.backends.hmlr ? "ENABLED" : "disabled"}`,
        );
      }

      console.log("\n🚪 THE DOOR IS OPEN. MEMORY UNIFIED.\n");
    })
    .catch((error) => {
      console.error("\n❌ OPUS 67 boot failed:", error.message);
      process.exit(1);
    });
}

export default OPUS67;
