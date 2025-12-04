import * as fs5 from 'fs';
import * as path from 'path';
import { parse } from 'yaml';

// src/intelligence/skill-metadata.ts
function normalizeSynergies(synergies) {
  const defaults = { amplifying: [], conflicting: [] };
  if (!synergies || typeof synergies !== "object") return defaults;
  const syn = synergies;
  return {
    amplifying: Array.isArray(syn.amplifying) ? syn.amplifying : Array.isArray(syn.amplifies) ? syn.amplifies : [],
    conflicting: Array.isArray(syn.conflicting) ? syn.conflicting : Array.isArray(syn.conflicts) ? syn.conflicts : [],
    redundant: Array.isArray(syn.redundant) ? syn.redundant : Array.isArray(syn.works_well_with) ? syn.works_well_with : void 0
  };
}
function normalizeCapabilities(capabilities) {
  if (!capabilities) return [];
  if (Array.isArray(capabilities)) {
    return capabilities;
  }
  if (typeof capabilities === "object" && capabilities !== null) {
    const cap = capabilities;
    if ("can" in cap && Array.isArray(cap.can)) {
      return cap.can.map((item) => {
        if (typeof item === "object" && item !== null) {
          const entries = Object.entries(item);
          if (entries.length > 0) {
            const [action, details] = entries[0];
            if (typeof details === "object" && details !== null) {
              const d = details;
              return {
                action,
                confidence: typeof d.confidence === "number" ? d.confidence : 0.5,
                requires_mcp: Array.isArray(d.requires_mcp) ? d.requires_mcp : void 0
              };
            }
          }
        }
        return { action: String(item), confidence: 0.5 };
      });
    }
  }
  return [];
}
var SkillMetadataLoader = class {
  metadataDir;
  cache = /* @__PURE__ */ new Map();
  indexLoaded = false;
  constructor(metadataDir) {
    const baseDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
    const possiblePaths = [
      metadataDir,
      path.join(baseDir, "../skills/metadata"),
      // From dist/
      path.join(baseDir, "../../skills/metadata"),
      // From dist/intelligence/
      path.resolve(process.cwd(), "packages/opus67/skills/metadata"),
      // Absolute fallback
      path.resolve(process.cwd(), "skills/metadata")
      // CWD relative
    ].filter(Boolean);
    this.metadataDir = possiblePaths.find((p) => {
      try {
        return fs5.existsSync(p);
      } catch {
        return false;
      }
    }) || possiblePaths[0];
  }
  /**
   * Load all skill metadata files into memory
   */
  async loadAll() {
    if (this.indexLoaded && this.cache.size > 0) {
      return this.cache;
    }
    try {
      const files = fs5.readdirSync(this.metadataDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
      for (const file of files) {
        const filePath = path.join(this.metadataDir, file);
        const content = fs5.readFileSync(filePath, "utf-8");
        const raw = parse(content);
        if (raw.id) {
          const metadata = {
            ...raw,
            capabilities: normalizeCapabilities(raw.capabilities),
            synergies: normalizeSynergies(raw.synergies)
          };
          this.cache.set(raw.id, metadata);
        }
      }
      this.indexLoaded = true;
    } catch (error) {
      console.error(`[SkillMetadata] Could not load from ${this.metadataDir}:`, error);
    }
    return this.cache;
  }
  /**
   * Get metadata for a specific skill
   */
  async get(skillId) {
    if (this.cache.has(skillId)) {
      return this.cache.get(skillId);
    }
    const filePath = path.join(this.metadataDir, `${skillId}.yaml`);
    try {
      if (fs5.existsSync(filePath)) {
        const content = fs5.readFileSync(filePath, "utf-8");
        const raw = parse(content);
        const metadata = {
          ...raw,
          capabilities: normalizeCapabilities(raw.capabilities),
          synergies: normalizeSynergies(raw.synergies)
        };
        this.cache.set(skillId, metadata);
        return metadata;
      }
    } catch (error) {
      console.error(`[SkillMetadata] Failed to load ${skillId}:`, error);
    }
    return null;
  }
  /**
   * Get all loaded skill IDs
   */
  getLoadedSkillIds() {
    return Array.from(this.cache.keys());
  }
  /**
   * Check if a skill can perform an action
   * Priority: capabilities > what_it_does > what_it_cannot
   * This ensures positive matches are found before negative exclusions
   */
  async canDo(skillId, action) {
    const metadata = await this.get(skillId);
    if (!metadata) {
      return {
        can: false,
        confidence: 0,
        reasoning: `No metadata found for skill: ${skillId}`
      };
    }
    const actionLower = action.toLowerCase();
    const actionWords = actionLower.split(/\s+/);
    const capabilities = metadata.capabilities ?? [];
    for (const cap of capabilities) {
      const capLower = cap.action.toLowerCase();
      if (actionLower.includes(capLower) || capLower.includes(actionLower)) {
        return {
          can: true,
          confidence: cap.confidence,
          reasoning: `Skill can perform: ${cap.action}`,
          requires_mcp: cap.requires_mcp
        };
      }
      for (const word of actionWords) {
        if (word.length >= 3 && capLower.includes(word)) {
          return {
            can: true,
            confidence: cap.confidence * 0.9,
            // Slightly lower confidence for word match
            reasoning: `Skill capability matches "${word}": ${cap.action}`,
            requires_mcp: cap.requires_mcp
          };
        }
      }
    }
    const whatItDoes = metadata.semantic?.what_it_does ?? [];
    for (const canDoItem of whatItDoes) {
      const canDoLower = canDoItem.toLowerCase();
      if (actionLower.includes(canDoLower) || canDoLower.includes(actionLower)) {
        return {
          can: true,
          confidence: 0.7,
          reasoning: `Skill description includes: ${canDoItem}`
        };
      }
      for (const word of actionWords) {
        if (word.length >= 3 && canDoLower.includes(word)) {
          return {
            can: true,
            confidence: 0.6,
            reasoning: `Skill description matches "${word}": ${canDoItem}`
          };
        }
      }
    }
    const whatItCannot = metadata.semantic?.what_it_cannot ?? [];
    for (const cannot of whatItCannot) {
      const cannotLower = cannot.toLowerCase();
      if (actionLower === cannotLower || actionLower.length > 5 && cannotLower.startsWith(actionLower) || actionLower.length > 5 && actionLower.startsWith(cannotLower.split(" ")[0])) {
        return {
          can: false,
          confidence: 0.9,
          reasoning: `Skill explicitly cannot: ${cannot}`
        };
      }
    }
    const purpose = metadata.semantic?.purpose?.toLowerCase() ?? "";
    for (const word of actionWords) {
      if (word.length >= 4 && purpose.includes(word)) {
        return {
          can: true,
          confidence: 0.5,
          reasoning: `Skill purpose mentions "${word}"`
        };
      }
    }
    return {
      can: false,
      confidence: 0.3,
      reasoning: `Action not found in skill capabilities or limitations`
    };
  }
  /**
   * Get anti-hallucination warning if query triggers a rule
   */
  async getAntiHallucinationWarning(skillId, query) {
    const metadata = await this.get(skillId);
    if (!metadata) return null;
    const queryLower = query.toLowerCase();
    let rules = metadata.anti_hallucination;
    if (!Array.isArray(rules)) {
      if (rules && typeof rules === "object" && "rules" in rules) {
        rules = rules.rules;
      } else {
        return null;
      }
    }
    if (!Array.isArray(rules)) return null;
    for (const rule of rules) {
      try {
        const regex = new RegExp(rule.trigger, "i");
        if (regex.test(query)) {
          return rule.response;
        }
      } catch {
        if (queryLower.includes(rule.trigger.toLowerCase())) {
          return rule.response;
        }
      }
    }
    return null;
  }
  /**
   * Get synergy information for skill combinations
   */
  async getSynergies(skillIds) {
    const result = {
      amplifying: [],
      conflicting: [],
      score: 1
    };
    for (const skillId of skillIds) {
      const metadata = await this.get(skillId);
      if (!metadata) continue;
      for (const amp of metadata.synergies.amplifying) {
        if (skillIds.includes(amp)) {
          result.amplifying.push({
            skills: [skillId, amp],
            reason: `${skillId} works well with ${amp}`
          });
          result.score += 0.1;
        }
      }
      for (const conflict of metadata.synergies.conflicting) {
        if (skillIds.includes(conflict)) {
          result.conflicting.push({
            skills: [skillId, conflict],
            reason: `${skillId} conflicts with ${conflict}`
          });
          result.score -= 0.2;
        }
      }
    }
    result.score = Math.max(0, Math.min(1, result.score));
    return result;
  }
  /**
   * Get statistics about loaded metadata
   */
  getStats() {
    let withCapabilities = 0;
    let withAntiHallucination = 0;
    let withExamples = 0;
    for (const metadata of this.cache.values()) {
      if (metadata.capabilities?.length > 0) withCapabilities++;
      if (metadata.anti_hallucination?.length > 0) withAntiHallucination++;
      if (metadata.examples?.length > 0) withExamples++;
    }
    return {
      totalSkills: this.cache.size,
      withCapabilities,
      withAntiHallucination,
      withExamples
    };
  }
};
var instance = null;
function getSkillMetadataLoader() {
  if (!instance) {
    instance = new SkillMetadataLoader();
  }
  return instance;
}
function resetSkillMetadataLoader() {
  instance = null;
}

// src/intelligence/capability-matrix.ts
var ACTION_PATTERNS = {
  // Solana/Blockchain
  "deploy": ["Deploy smart contract", "Deploy program"],
  "swap": ["Execute token swap", "Jupiter integration", "token swap"],
  "stake": ["Staking operations", "Validator delegation"],
  "mint": ["Mint tokens", "Create NFT"],
  "transfer": ["Transfer tokens", "Send SOL"],
  "sign": ["Sign transaction", "Sign message"],
  "wallet": ["Wallet integration", "Connect wallet"],
  "transaction": ["Build transaction", "Sign transaction"],
  "solana": ["Solana development", "SPL tokens"],
  "anchor": ["Anchor framework", "IDL generation"],
  // DeFi
  "defi": ["DeFi integration", "Yield farming", "Liquidity pools", "token swap"],
  "trading": ["Trading strategies", "Price analysis", "token swap"],
  "liquidity": ["Liquidity provision", "Pool management"],
  "yield": ["Yield optimization", "APY calculation"],
  "amm": ["AMM integration", "Liquidity pools"],
  "dex": ["DEX integration", "Swap routing"],
  // NFT
  "nft": ["NFT operations", "Metadata creation", "Mint NFT"],
  "metadata": ["Metadata management", "JSON standards"],
  "collection": ["NFT collections", "Batch operations"],
  // Frontend
  "build ui": ["Write React components", "Create UI"],
  "style": ["Write Tailwind classes", "CSS styling"],
  "animate": ["Create animations", "Framer Motion"],
  "form": ["Build forms", "Form validation"],
  "table": ["Create data tables", "Data display"],
  "react": ["React components", "Hooks", "State management"],
  "nextjs": ["Next.js pages", "API routes", "Server components"],
  "component": ["UI components", "React components"],
  // Backend
  "api": ["Design REST APIs", "API endpoints"],
  "database": ["Design database schemas", "Database operations"],
  "auth": ["Set up authentication", "JWT/OAuth"],
  "cache": ["Implement caching", "Redis operations"],
  "websocket": ["WebSocket integration", "Real-time"],
  "server": ["Backend server", "API development"],
  "graphql": ["GraphQL schema", "Resolvers"],
  // Infrastructure
  "docker": ["Docker containers", "Containerization"],
  "kubernetes": ["Kubernetes deployment", "K8s config"],
  "ci/cd": ["CI/CD pipeline", "GitHub Actions"],
  "deployment": ["Deployment automation", "Production deploy"],
  "aws": ["AWS services", "Cloud infrastructure"],
  "terraform": ["Infrastructure as code", "Terraform config"],
  // AI/ML
  "ai": ["AI integration", "LLM prompts", "Model inference"],
  "llm": ["LLM integration", "Prompt engineering"],
  "embedding": ["Vector embeddings", "Semantic search"],
  "rag": ["RAG pipeline", "Context retrieval"],
  "agent": ["AI agent", "Autonomous systems"],
  // Security
  "audit": ["Security audit", "Code review"],
  "security": ["Security implementation", "Vulnerability scan"],
  "penetration": ["Penetration testing", "Security assessment"],
  // Data
  "analytics": ["Data analytics", "Metrics tracking"],
  "visualization": ["Data visualization", "Charts"],
  "pipeline": ["Data pipeline", "ETL process"],
  // General
  "test": ["Write tests", "Test coverage"],
  "debug": ["Debug issues", "Fix errors"],
  "refactor": ["Refactor code", "Clean up"],
  "document": ["Write documentation", "API docs"],
  "type": ["Design type systems", "TypeScript types"],
  "typescript": ["TypeScript development", "Type definitions"],
  "optimize": ["Performance optimization", "Code optimization"]
};
var CapabilityMatrix = class {
  loader;
  initialized = false;
  constructor(loader) {
    this.loader = loader || getSkillMetadataLoader();
  }
  /**
   * Initialize the capability matrix (load all skill metadata)
   */
  async initialize() {
    if (this.initialized) return;
    await this.loader.loadAll();
    this.initialized = true;
  }
  /**
   * Check if a specific skill can perform an action
   */
  async canDo(skillId, action) {
    const result = await this.loader.canDo(skillId, action);
    const warning = await this.loader.getAntiHallucinationWarning(skillId, action);
    return {
      ...result,
      warnings: warning ? [warning] : void 0
    };
  }
  /**
   * Validate if a set of skills can handle a task
   */
  async validateTask(task, skillIds) {
    await this.initialize();
    const analysis = this.analyzeTask(task);
    const allWarnings = [];
    const missingCapabilities = [];
    const suggestedSkills = [];
    let totalConfidence = 0;
    let matchedCount = 0;
    for (const requiredCap of analysis.requiredCapabilities) {
      let capabilityFound = false;
      for (const skillId of skillIds) {
        const check = await this.canDo(skillId, requiredCap);
        if (check.can) {
          capabilityFound = true;
          totalConfidence += check.confidence;
          matchedCount++;
          if (check.warnings) {
            allWarnings.push(...check.warnings);
          }
          break;
        }
      }
      if (!capabilityFound) {
        missingCapabilities.push(requiredCap);
        const suggestions = await this.findSkillsForCapability(requiredCap);
        suggestedSkills.push(...suggestions.slice(0, 2));
      }
    }
    const synergies = await this.loader.getSynergies(skillIds);
    for (const conflict of synergies.conflicting) {
      allWarnings.push(`Conflict: ${conflict.skills.join(" vs ")}`);
    }
    const avgConfidence = matchedCount > 0 ? totalConfidence / matchedCount : 0;
    return {
      isValid: missingCapabilities.length === 0,
      confidence: avgConfidence,
      missingCapabilities,
      warnings: allWarnings,
      suggestedSkills: [...new Set(suggestedSkills)],
      synergyScore: synergies.score
    };
  }
  /**
   * Find the best skills for a given task
   * Uses action patterns when available, falls back to direct word matching
   */
  async findBestSkills(task, maxResults = 5) {
    await this.initialize();
    const analysis = this.analyzeTask(task);
    const matches = [];
    const skillIds = this.loader.getLoadedSkillIds();
    const taskWords = task.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
    for (const skillId of skillIds) {
      const metadata = await this.loader.get(skillId);
      if (!metadata) continue;
      const matchedCapabilities = [];
      const missingCapabilities = [];
      const warnings = [];
      let totalConfidence = 0;
      for (const cap of analysis.requiredCapabilities) {
        const check = await this.canDo(skillId, cap);
        if (check.can) {
          matchedCapabilities.push(cap);
          totalConfidence += check.confidence;
          if (check.warnings) {
            warnings.push(...check.warnings);
          }
        } else {
          missingCapabilities.push(cap);
        }
      }
      if (analysis.requiredCapabilities.length === 0 || matchedCapabilities.length === 0) {
        for (const word of taskWords) {
          const check = await this.canDo(skillId, word);
          if (check.can && !matchedCapabilities.includes(word)) {
            matchedCapabilities.push(word);
            totalConfidence += check.confidence;
            if (check.warnings) {
              warnings.push(...check.warnings);
            }
          }
        }
      }
      const totalRequirements = Math.max(analysis.requiredCapabilities.length, taskWords.length, 1);
      const matchRatio = matchedCapabilities.length / totalRequirements;
      const avgConfidence = matchedCapabilities.length > 0 ? totalConfidence / matchedCapabilities.length : 0;
      const score = matchRatio * 0.6 + avgConfidence * 0.4;
      if (score > 0.05) {
        matches.push({
          skillId,
          score,
          confidence: avgConfidence,
          matchedCapabilities,
          missingCapabilities,
          antiHallucinationWarnings: warnings
        });
      }
    }
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, maxResults);
  }
  /**
   * Get all warnings for a task + skills combination
   */
  async getAllWarnings(task, skillIds) {
    const warnings = [];
    for (const skillId of skillIds) {
      const warning = await this.loader.getAntiHallucinationWarning(skillId, task);
      if (warning) {
        warnings.push(`[${skillId}] ${warning}`);
      }
    }
    const synergies = await this.loader.getSynergies(skillIds);
    for (const conflict of synergies.conflicting) {
      warnings.push(`Skill conflict: ${conflict.skills.join(" and ")} - ${conflict.reason}`);
    }
    return warnings;
  }
  /**
   * Pre-flight check before code generation
   */
  async preFlightCheck(task, skillIds) {
    const validation = await this.validateTask(task, skillIds);
    const allWarnings = await this.getAllWarnings(task, skillIds);
    const blockers = [];
    const recommendations = [];
    const criticalPatterns = [
      { pattern: /deploy.*mainnet/i, message: "Cannot deploy to mainnet - use devnet first" },
      { pattern: /sign.*transaction/i, message: "Cannot sign transactions - user wallet required" },
      { pattern: /access.*private.*key/i, message: "Cannot access private keys" },
      { pattern: /execute.*real.*trade/i, message: "Cannot execute real trades - simulation only" },
      { pattern: /send.*actual.*funds/i, message: "Cannot send real funds" }
    ];
    for (const { pattern, message } of criticalPatterns) {
      if (pattern.test(task)) {
        blockers.push(message);
      }
    }
    if (validation.suggestedSkills.length > 0) {
      recommendations.push(`Consider adding skills: ${validation.suggestedSkills.join(", ")}`);
    }
    if (validation.confidence < 0.7 && validation.confidence > 0) {
      recommendations.push("Low confidence - consider breaking task into smaller steps");
    }
    if (validation.synergyScore < 0.8) {
      recommendations.push("Skill synergy could be improved - check for conflicts");
    }
    return {
      pass: blockers.length === 0 && validation.isValid,
      confidence: validation.confidence,
      blockers,
      warnings: [...allWarnings, ...validation.warnings],
      recommendations
    };
  }
  /**
   * Analyze a task to extract required capabilities
   */
  analyzeTask(task) {
    const taskLower = task.toLowerCase();
    const detectedActions = [];
    const requiredCapabilities = [];
    for (const [pattern, capabilities] of Object.entries(ACTION_PATTERNS)) {
      if (taskLower.includes(pattern)) {
        detectedActions.push(pattern);
        requiredCapabilities.push(...capabilities);
      }
    }
    const keywords = taskLower.split(/\s+/);
    for (const keyword of keywords) {
      if (ACTION_PATTERNS[keyword]) {
        if (!detectedActions.includes(keyword)) {
          detectedActions.push(keyword);
          requiredCapabilities.push(...ACTION_PATTERNS[keyword]);
        }
      }
    }
    let complexity = "low";
    if (requiredCapabilities.length > 5 || task.length > 200) {
      complexity = "high";
    } else if (requiredCapabilities.length > 2 || task.length > 100) {
      complexity = "medium";
    }
    let suggestedMode = "BUILD";
    if (taskLower.includes("review") || taskLower.includes("audit")) {
      suggestedMode = "REVIEW";
    } else if (taskLower.includes("design") || taskLower.includes("architect")) {
      suggestedMode = "ARCHITECT";
    } else if (taskLower.includes("debug") || taskLower.includes("fix")) {
      suggestedMode = "DEBUG";
    }
    return {
      task,
      detectedActions,
      complexity,
      requiredCapabilities: [...new Set(requiredCapabilities)],
      suggestedMode
    };
  }
  /**
   * Find skills that can provide a specific capability
   */
  async findSkillsForCapability(capability) {
    const matching = [];
    const skillIds = this.loader.getLoadedSkillIds();
    for (const skillId of skillIds) {
      const check = await this.canDo(skillId, capability);
      if (check.can) {
        matching.push({ skillId, confidence: check.confidence });
      }
    }
    matching.sort((a, b) => b.confidence - a.confidence);
    return matching.map((m) => m.skillId);
  }
  /**
   * Get matrix statistics
   */
  async getStats() {
    await this.initialize();
    const stats = this.loader.getStats();
    let totalCapabilities = 0;
    let totalAntiHallucinationRules = 0;
    const coverageByCategory = {};
    const skillIds = this.loader.getLoadedSkillIds();
    for (const skillId of skillIds) {
      const metadata = await this.loader.get(skillId);
      if (!metadata) continue;
      totalCapabilities += metadata.capabilities?.length || 0;
      totalAntiHallucinationRules += metadata.anti_hallucination?.length || 0;
      const category = skillId.split("-")[0];
      coverageByCategory[category] = (coverageByCategory[category] || 0) + 1;
    }
    return {
      totalSkills: stats.totalSkills,
      totalCapabilities,
      totalAntiHallucinationRules,
      coverageByCategory
    };
  }
};
var instance2 = null;
function getCapabilityMatrix() {
  if (!instance2) {
    instance2 = new CapabilityMatrix();
  }
  return instance2;
}
function resetCapabilityMatrix() {
  instance2 = null;
}
var SynergyGraph = class {
  nodes = /* @__PURE__ */ new Map();
  edges = [];
  adjacencyList = /* @__PURE__ */ new Map();
  initialized = false;
  constructor() {
  }
  /**
   * Initialize the graph from skill metadata and synergies.yaml
   */
  async initialize(synergiesPath) {
    if (this.initialized) return;
    await this.loadFromSkillMetadata();
    if (synergiesPath) {
      await this.loadFromYaml(synergiesPath);
    } else {
      const defaultPath = path.join(
        path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
        "../../config/synergies.yaml"
      );
      if (fs5.existsSync(defaultPath)) {
        await this.loadFromYaml(defaultPath);
      }
    }
    this.initialized = true;
  }
  /**
   * Load synergies from skill metadata files
   */
  async loadFromSkillMetadata() {
    const loader = getSkillMetadataLoader();
    await loader.loadAll();
    const skillIds = loader.getLoadedSkillIds();
    for (const skillId of skillIds) {
      const metadata = await loader.get(skillId);
      if (!metadata) continue;
      const category = this.extractCategory(skillId);
      this.nodes.set(skillId, {
        id: skillId,
        name: metadata.name || skillId,
        tier: metadata.tier || 3,
        category,
        connections: 0
      });
      if (metadata.synergies) {
        for (const amp of metadata.synergies.amplifying || []) {
          this.addEdge({
            from: skillId,
            to: amp,
            type: "amplifying",
            weight: 0.8,
            bidirectional: true
          });
        }
        for (const conflict of metadata.synergies.conflicting || []) {
          this.addEdge({
            from: skillId,
            to: conflict,
            type: "conflicting",
            weight: 0.9,
            bidirectional: true
          });
        }
        for (const redundant of metadata.synergies.redundant || []) {
          this.addEdge({
            from: skillId,
            to: redundant,
            type: "redundant",
            weight: 0.7,
            bidirectional: true
          });
        }
      }
    }
    this.updateConnectionCounts();
  }
  /**
   * Load additional synergies from YAML file
   */
  async loadFromYaml(filePath) {
    try {
      const content = fs5.readFileSync(filePath, "utf-8");
      const definitions = parse(content);
      for (const synergy of definitions.cross_category || []) {
        this.addEdge({
          from: synergy.from,
          to: synergy.to,
          type: synergy.type,
          weight: synergy.weight || 0.8,
          reason: synergy.reason,
          bidirectional: true
        });
      }
      this.updateConnectionCounts();
    } catch (error) {
      console.error(`[SynergyGraph] Could not load synergies.yaml:`, error);
    }
  }
  /**
   * Add an edge to the graph
   */
  addEdge(edge) {
    const existingIndex = this.edges.findIndex(
      (e) => e.from === edge.from && e.to === edge.to || edge.bidirectional && e.from === edge.to && e.to === edge.from
    );
    if (existingIndex === -1) {
      this.edges.push(edge);
      if (!this.adjacencyList.has(edge.from)) {
        this.adjacencyList.set(edge.from, []);
      }
      this.adjacencyList.get(edge.from).push(edge);
      if (edge.bidirectional) {
        if (!this.adjacencyList.has(edge.to)) {
          this.adjacencyList.set(edge.to, []);
        }
        this.adjacencyList.get(edge.to).push({
          ...edge,
          from: edge.to,
          to: edge.from
        });
      }
    }
  }
  /**
   * Update connection counts for all nodes
   */
  updateConnectionCounts() {
    for (const [id, edges] of this.adjacencyList) {
      const node = this.nodes.get(id);
      if (node) {
        node.connections = edges.length;
      }
    }
  }
  /**
   * Extract category from skill ID
   */
  extractCategory(skillId) {
    const categoryMap = {
      "solana": "blockchain",
      "anchor": "blockchain",
      "bonding": "blockchain",
      "jupiter": "blockchain",
      "evm": "blockchain",
      "smart": "blockchain",
      "token": "blockchain",
      "defi": "blockchain",
      "wallet": "blockchain",
      "nextjs": "frontend",
      "react": "frontend",
      "tailwind": "frontend",
      "shadcn": "frontend",
      "framer": "frontend",
      "vibe": "frontend",
      "nodejs": "backend",
      "api": "backend",
      "database": "backend",
      "redis": "backend",
      "graphql": "backend",
      "websocket": "backend",
      "docker": "devops",
      "kubernetes": "devops",
      "ci": "devops",
      "aws": "devops",
      "typescript": "core",
      "javascript": "core"
    };
    const firstWord = skillId.split("-")[0].toLowerCase();
    return categoryMap[firstWord] || "other";
  }
  /**
   * Get synergy score for a combination of skills
   */
  async getCombinationScore(skillIds) {
    await this.initialize();
    const reasoning = [];
    let amplifications = 0;
    let conflicts = 0;
    let redundancies = 0;
    for (let i = 0; i < skillIds.length; i++) {
      for (let j = i + 1; j < skillIds.length; j++) {
        const skill1 = skillIds[i];
        const skill2 = skillIds[j];
        const edges = this.getEdgesBetween(skill1, skill2);
        for (const edge of edges) {
          switch (edge.type) {
            case "amplifying":
              amplifications++;
              reasoning.push(`\u2713 ${skill1} + ${skill2}: amplifying (${edge.reason || "good synergy"})`);
              break;
            case "conflicting":
              conflicts++;
              reasoning.push(`\u2717 ${skill1} + ${skill2}: conflicting (${edge.reason || "may cause issues"})`);
              break;
            case "redundant":
              redundancies++;
              reasoning.push(`\u2248 ${skill1} + ${skill2}: redundant (${edge.reason || "overlapping capabilities"})`);
              break;
          }
        }
      }
    }
    let score = 0.5;
    score += Math.min(amplifications * 0.1, 0.4);
    score -= conflicts * 0.2;
    score -= redundancies * 0.05;
    score = Math.max(0, Math.min(1, score));
    return {
      skills: skillIds,
      score,
      amplifications,
      conflicts,
      redundancies,
      reasoning
    };
  }
  /**
   * Get edges between two skills
   */
  getEdgesBetween(skill1, skill2) {
    const edges1 = this.adjacencyList.get(skill1) || [];
    return edges1.filter((e) => e.to === skill2);
  }
  /**
   * Find optimal skill combination for a task
   */
  async findOptimalCombination(candidateSkills, maxSkills = 5) {
    await this.initialize();
    if (candidateSkills.length <= maxSkills) {
      return this.getCombinationScore(candidateSkills);
    }
    let bestCombination = [];
    let bestScore = 0;
    for (const startSkill of candidateSkills) {
      const combination = [startSkill];
      for (const candidate of candidateSkills) {
        if (combination.includes(candidate)) continue;
        if (combination.length >= maxSkills) break;
        const testCombination = [...combination, candidate];
        const score = await this.getCombinationScore(testCombination);
        if (score.conflicts === 0) {
          combination.push(candidate);
        }
      }
      const finalScore = await this.getCombinationScore(combination);
      if (finalScore.score > bestScore) {
        bestScore = finalScore.score;
        bestCombination = combination;
      }
    }
    return this.getCombinationScore(bestCombination);
  }
  /**
   * Get skills that amplify a given skill
   */
  async getAmplifyingSkills(skillId) {
    await this.initialize();
    const edges = this.adjacencyList.get(skillId) || [];
    return edges.filter((e) => e.type === "amplifying").map((e) => e.to);
  }
  /**
   * Get skills that conflict with a given skill
   */
  async getConflictingSkills(skillId) {
    await this.initialize();
    const edges = this.adjacencyList.get(skillId) || [];
    return edges.filter((e) => e.type === "conflicting").map((e) => e.to);
  }
  /**
   * Get all skills in a category
   */
  async getSkillsByCategory(category) {
    await this.initialize();
    const skills = [];
    for (const node of this.nodes.values()) {
      if (node.category === category) {
        skills.push(node);
      }
    }
    return skills.sort((a, b) => a.tier - b.tier);
  }
  /**
   * Get graph statistics
   */
  async getStats() {
    await this.initialize();
    const categoryCounts = {};
    let totalConnections = 0;
    for (const node of this.nodes.values()) {
      categoryCounts[node.category] = (categoryCounts[node.category] || 0) + 1;
      totalConnections += node.connections;
    }
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length,
      amplifyingEdges: this.edges.filter((e) => e.type === "amplifying").length,
      conflictingEdges: this.edges.filter((e) => e.type === "conflicting").length,
      redundantEdges: this.edges.filter((e) => e.type === "redundant").length,
      categoryCounts,
      avgConnectionsPerNode: this.nodes.size > 0 ? totalConnections / this.nodes.size : 0
    };
  }
  /**
   * Export graph as JSON for visualization
   */
  async exportForVisualization() {
    await this.initialize();
    const nodes = Array.from(this.nodes.values()).map((n) => ({
      id: n.id,
      label: n.name,
      group: n.category,
      tier: n.tier
    }));
    const edges = this.edges.map((e) => ({
      from: e.from,
      to: e.to,
      type: e.type,
      weight: e.weight
    }));
    return { nodes, edges };
  }
};
var instance3 = null;
function getSynergyGraph() {
  if (!instance3) {
    instance3 = new SynergyGraph();
  }
  return instance3;
}
function resetSynergyGraph() {
  instance3 = null;
}
var MCPValidator = class {
  registry = {
    version: "1.0.0",
    servers: /* @__PURE__ */ new Map()
  };
  initialized = false;
  constructor() {
  }
  /**
   * Initialize the validator from endpoints.yaml
   */
  async initialize(endpointsPath) {
    if (this.initialized) return;
    const configPath = endpointsPath || path.join(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
      "../../config/endpoints.yaml"
    );
    try {
      if (fs5.existsSync(configPath)) {
        const content = fs5.readFileSync(configPath, "utf-8");
        const data = parse(content);
        this.registry.version = data.version;
        for (const server of data.servers || []) {
          this.registry.servers.set(server.id, server);
        }
      }
    } catch (error) {
      console.error("[MCPValidator] Could not load endpoints.yaml:", error);
    }
    this.initialized = true;
  }
  /**
   * Validate an MCP tool call
   */
  async validate(serverId, toolName, params) {
    await this.initialize();
    const errors = [];
    const warnings = [];
    const suggestions = [];
    const server = this.registry.servers.get(serverId);
    if (!server) {
      const knownServers = Array.from(this.registry.servers.keys());
      errors.push(`Unknown MCP server: ${serverId}`);
      if (knownServers.length > 0) {
        suggestions.push(`Known servers: ${knownServers.join(", ")}`);
      }
      return { valid: false, errors, warnings, suggestions };
    }
    for (const rule of server.anti_hallucination || []) {
      const toolLower = toolName.toLowerCase();
      if (toolLower.includes(rule.toLowerCase())) {
        errors.push(`${server.name} cannot: ${rule}`);
      }
    }
    const endpoint = server.endpoints.find((e) => e.name === toolName);
    if (!endpoint) {
      const availableTools = server.endpoints.map((e) => e.name);
      errors.push(`Unknown tool: ${toolName} on ${server.name}`);
      suggestions.push(`Available tools: ${availableTools.join(", ")}`);
      return { valid: false, errors, warnings, suggestions };
    }
    const paramValidation = this.validateParameters(endpoint, params);
    errors.push(...paramValidation.errors);
    warnings.push(...paramValidation.warnings);
    if (endpoint.rate_limit) {
      warnings.push(`Rate limit: ${endpoint.rate_limit}`);
    }
    if (endpoint.requires_auth) {
      warnings.push("This endpoint requires authentication");
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      endpoint
    };
  }
  /**
   * Validate parameters against endpoint definition
   */
  validateParameters(endpoint, params) {
    const errors = [];
    const warnings = [];
    for (const param of endpoint.parameters) {
      if (param.required && !(param.name in params)) {
        errors.push(`Missing required parameter: ${param.name}`);
        continue;
      }
      const value = params[param.name];
      if (value === void 0) continue;
      const actualType = typeof value;
      const expectedType = param.type.toLowerCase();
      if (expectedType === "string" && actualType !== "string") {
        errors.push(`Parameter ${param.name} should be string, got ${actualType}`);
      } else if (expectedType === "number" && actualType !== "number") {
        errors.push(`Parameter ${param.name} should be number, got ${actualType}`);
      } else if (expectedType === "boolean" && actualType !== "boolean") {
        errors.push(`Parameter ${param.name} should be boolean, got ${actualType}`);
      } else if (expectedType === "array" && !Array.isArray(value)) {
        errors.push(`Parameter ${param.name} should be array, got ${actualType}`);
      }
      if (param.enum && !param.enum.includes(String(value))) {
        errors.push(`Parameter ${param.name} must be one of: ${param.enum.join(", ")}`);
      }
      if (param.validation && typeof value === "string") {
        try {
          const regex = new RegExp(param.validation);
          if (!regex.test(value)) {
            errors.push(`Parameter ${param.name} failed validation: ${param.validation}`);
          }
        } catch {
        }
      }
    }
    const knownParams = new Set(endpoint.parameters.map((p) => p.name));
    for (const paramName of Object.keys(params)) {
      if (!knownParams.has(paramName)) {
        warnings.push(`Unknown parameter: ${paramName}`);
      }
    }
    return { errors, warnings };
  }
  /**
   * Get all available tools for a server
   */
  async getServerTools(serverId) {
    await this.initialize();
    const server = this.registry.servers.get(serverId);
    if (!server) return [];
    return server.endpoints.map((e) => e.name);
  }
  /**
   * Get endpoint documentation
   */
  async getEndpointDoc(serverId, toolName) {
    await this.initialize();
    const server = this.registry.servers.get(serverId);
    if (!server) return null;
    return server.endpoints.find((e) => e.name === toolName) || null;
  }
  /**
   * Search for tools by capability
   */
  async searchTools(capability) {
    await this.initialize();
    const results = [];
    const capLower = capability.toLowerCase();
    for (const [serverId, server] of this.registry.servers) {
      for (const endpoint of server.endpoints) {
        let relevance = 0;
        if (endpoint.name.toLowerCase().includes(capLower)) {
          relevance += 0.5;
        }
        if (endpoint.description.toLowerCase().includes(capLower)) {
          relevance += 0.3;
        }
        if (server.description.toLowerCase().includes(capLower)) {
          relevance += 0.2;
        }
        if (relevance > 0) {
          results.push({
            serverId,
            serverName: server.name,
            tool: endpoint,
            relevance
          });
        }
      }
    }
    results.sort((a, b) => b.relevance - a.relevance);
    return results;
  }
  /**
   * Get common errors for a server
   */
  async getCommonErrors(serverId) {
    await this.initialize();
    const server = this.registry.servers.get(serverId);
    return server?.common_errors || [];
  }
  /**
   * Check if a tool exists anywhere
   */
  async toolExists(toolName) {
    await this.initialize();
    const servers = [];
    for (const [serverId, server] of this.registry.servers) {
      if (server.endpoints.some((e) => e.name === toolName)) {
        servers.push(serverId);
      }
    }
    return {
      exists: servers.length > 0,
      servers
    };
  }
  /**
   * Get anti-hallucination warnings for a server
   */
  async getAntiHallucinationRules(serverId) {
    await this.initialize();
    const server = this.registry.servers.get(serverId);
    return server?.anti_hallucination || [];
  }
  /**
   * Get registry statistics
   */
  async getStats() {
    await this.initialize();
    let totalEndpoints = 0;
    let totalParameters = 0;
    const serversByCategory = {};
    for (const server of this.registry.servers.values()) {
      totalEndpoints += server.endpoints.length;
      serversByCategory[server.category] = (serversByCategory[server.category] || 0) + 1;
      for (const endpoint of server.endpoints) {
        totalParameters += endpoint.parameters.length;
      }
    }
    return {
      totalServers: this.registry.servers.size,
      totalEndpoints,
      totalParameters,
      serversByCategory
    };
  }
  /**
   * Get all server IDs
   */
  async getServerIds() {
    await this.initialize();
    return Array.from(this.registry.servers.keys());
  }
};
var instance4 = null;
function getMCPValidator() {
  if (!instance4) {
    instance4 = new MCPValidator();
  }
  return instance4;
}
function resetMCPValidator() {
  instance4 = null;
}
var KnowledgeStore = class {
  config;
  cache = /* @__PURE__ */ new Map();
  initialized = false;
  // Sub-systems
  skillLoader;
  capabilityMatrix;
  synergyGraph;
  mcpValidator;
  // Stats
  cacheHits = 0;
  cacheMisses = 0;
  constructor(config) {
    this.config = {
      mode: config?.mode || this.detectMode(),
      dataDir: config?.dataDir || this.getDefaultDataDir(),
      sqlitePath: config?.sqlitePath,
      cacheEnabled: config?.cacheEnabled ?? true,
      cacheTTL: config?.cacheTTL || 5 * 60 * 1e3
      // 5 minutes default
    };
    this.skillLoader = getSkillMetadataLoader();
    this.capabilityMatrix = getCapabilityMatrix();
    this.synergyGraph = getSynergyGraph();
    this.mcpValidator = getMCPValidator();
  }
  /**
   * Initialize all knowledge systems
   */
  async initialize() {
    if (this.initialized) return;
    const start = Date.now();
    await this.skillLoader.loadAll();
    await this.capabilityMatrix.initialize();
    await this.synergyGraph.initialize();
    await this.mcpValidator.initialize();
    this.initialized = true;
    const elapsed = Date.now() - start;
    console.log(`[KnowledgeStore] Initialized in ${elapsed}ms (mode: ${this.config.mode})`);
  }
  // ===========================================================================
  // SKILL QUERIES
  // ===========================================================================
  /**
   * Get skill metadata with caching
   */
  async getSkill(skillId) {
    const cacheKey = `skill:${skillId}`;
    const start = Date.now();
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        data: cached,
        fromCache: true,
        latencyMs: Date.now() - start
      };
    }
    const data = await this.skillLoader.get(skillId);
    if (data) {
      this.setCache(cacheKey, data);
    }
    return {
      data,
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }
  /**
   * Check if skill can perform action
   */
  async canSkillDo(skillId, action) {
    const start = Date.now();
    const result = await this.capabilityMatrix.canDo(skillId, action);
    return {
      data: result,
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }
  /**
   * Find best skills for a task
   */
  async findSkillsForTask(task, maxResults = 5) {
    const cacheKey = `skills-for-task:${task.slice(0, 50)}`;
    const start = Date.now();
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        data: cached,
        fromCache: true,
        latencyMs: Date.now() - start
      };
    }
    const matches = await this.capabilityMatrix.findBestSkills(task, maxResults);
    const data = matches.map((m) => ({
      skillId: m.skillId,
      score: m.score,
      matchedCapabilities: m.matchedCapabilities
    }));
    this.setCache(cacheKey, data);
    return {
      data,
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }
  // ===========================================================================
  // SYNERGY QUERIES
  // ===========================================================================
  /**
   * Get synergy score for skill combination
   */
  async getSynergyScore(skillIds) {
    const cacheKey = `synergy:${skillIds.sort().join(",")}`;
    const start = Date.now();
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        data: cached,
        fromCache: true,
        latencyMs: Date.now() - start
      };
    }
    const result = await this.synergyGraph.getCombinationScore(skillIds);
    const data = {
      score: result.score,
      amplifications: result.amplifications,
      conflicts: result.conflicts,
      reasoning: result.reasoning
    };
    this.setCache(cacheKey, data);
    return {
      data,
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }
  /**
   * Get skills that work well with given skill
   */
  async getAmplifyingSkills(skillId) {
    return this.synergyGraph.getAmplifyingSkills(skillId);
  }
  /**
   * Get skills that conflict with given skill
   */
  async getConflictingSkills(skillId) {
    return this.synergyGraph.getConflictingSkills(skillId);
  }
  // ===========================================================================
  // MCP QUERIES
  // ===========================================================================
  /**
   * Validate MCP tool call
   */
  async validateMCPCall(serverId, toolName, params) {
    const start = Date.now();
    const result = await this.mcpValidator.validate(serverId, toolName, params);
    return {
      data: {
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings
      },
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }
  /**
   * Search for MCP tools by capability
   */
  async searchMCPTools(capability) {
    const start = Date.now();
    const results = await this.mcpValidator.searchTools(capability);
    return {
      data: results.map((r) => ({
        serverId: r.serverId,
        toolName: r.tool.name,
        description: r.tool.description
      })),
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }
  /**
   * Get available tools for MCP server
   */
  async getMCPServerTools(serverId) {
    return this.mcpValidator.getServerTools(serverId);
  }
  // ===========================================================================
  // PRE-FLIGHT CHECK
  // ===========================================================================
  /**
   * Comprehensive pre-flight check before code generation
   */
  async preFlightCheck(task, skillIds) {
    const start = Date.now();
    await this.initialize();
    const result = await this.capabilityMatrix.preFlightCheck(task, skillIds);
    const synergyResult = await this.getSynergyScore(skillIds);
    if (synergyResult.data && synergyResult.data.score < 0.5) {
      result.warnings.push(`Low synergy score (${synergyResult.data.score.toFixed(2)})`);
      result.warnings.push(...synergyResult.data.reasoning);
    }
    return {
      ...result,
      latencyMs: Date.now() - start
    };
  }
  // ===========================================================================
  // CACHE MANAGEMENT
  // ===========================================================================
  /**
   * Get from cache with TTL check
   */
  getFromCache(key) {
    if (!this.config.cacheEnabled) return null;
    const entry = this.cache.get(key);
    if (!entry) {
      this.cacheMisses++;
      return null;
    }
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheMisses++;
      return null;
    }
    this.cacheHits++;
    return entry.data;
  }
  /**
   * Set cache entry
   */
  setCache(key, data, ttl) {
    if (!this.config.cacheEnabled) return;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTTL
    });
  }
  /**
   * Clear all cache entries
   */
  clearCache() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
  // ===========================================================================
  // STATISTICS
  // ===========================================================================
  /**
   * Get comprehensive knowledge store statistics
   */
  async getStats() {
    await this.initialize();
    const skillStats = this.skillLoader.getStats();
    const synergyStats = await this.synergyGraph.getStats();
    const mcpStats = await this.mcpValidator.getStats();
    const capStats = await this.capabilityMatrix.getStats();
    return {
      skills: {
        total: skillStats.totalSkills,
        withCapabilities: skillStats.withCapabilities,
        withAntiHallucination: skillStats.withAntiHallucination,
        byCategory: capStats.coverageByCategory
      },
      synergies: {
        totalEdges: synergyStats.totalEdges,
        amplifying: synergyStats.amplifyingEdges,
        conflicting: synergyStats.conflictingEdges
      },
      mcps: {
        totalServers: mcpStats.totalServers,
        totalEndpoints: mcpStats.totalEndpoints
      },
      storage: {
        mode: this.config.mode,
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses
      }
    };
  }
  // ===========================================================================
  // HELPERS
  // ===========================================================================
  /**
   * Detect storage mode from environment
   */
  detectMode() {
    const env = process.env.OPUS67_STORAGE_MODE;
    if (env === "sqlite" || env === "json" || env === "hybrid") {
      return env;
    }
    return process.env.NODE_ENV === "production" ? "sqlite" : "json";
  }
  /**
   * Get default data directory
   */
  getDefaultDataDir() {
    return path.join(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
      "../../data"
    );
  }
  /**
   * Get storage configuration
   */
  getConfig() {
    return { ...this.config };
  }
};
var instance5 = null;
function getKnowledgeStore() {
  if (!instance5) {
    instance5 = new KnowledgeStore();
  }
  return instance5;
}
function resetKnowledgeStore() {
  instance5 = null;
}
async function lookupSkill(skillId) {
  const store = getKnowledgeStore();
  await store.initialize();
  const result = await store.getSkill(skillId);
  return result.data;
}
async function canDo(skillId, action) {
  const store = getKnowledgeStore();
  await store.initialize();
  const result = await store.canSkillDo(skillId, action);
  return result.data?.can ?? false;
}
async function getSynergy(skillIds) {
  const store = getKnowledgeStore();
  await store.initialize();
  const result = await store.getSynergyScore(skillIds);
  return result.data?.score ?? 0;
}
async function validateMCP(serverId, toolName, params) {
  const store = getKnowledgeStore();
  await store.initialize();
  const result = await store.validateMCPCall(serverId, toolName, params);
  return result.data?.valid ?? false;
}
var SCHEMA = `
-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier INTEGER DEFAULT 3,
  token_cost INTEGER DEFAULT 5000,
  category TEXT,
  purpose TEXT,
  capabilities_json TEXT,
  what_it_does_json TEXT,
  what_it_cannot_json TEXT,
  anti_hallucination_json TEXT,
  synergies_json TEXT,
  examples_json TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS skills_fts USING fts5(
  id,
  name,
  purpose,
  capabilities_text,
  what_it_does_text,
  what_it_cannot_text,
  content='skills',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS skills_ai AFTER INSERT ON skills BEGIN
  INSERT INTO skills_fts(rowid, id, name, purpose, capabilities_text, what_it_does_text, what_it_cannot_text)
  VALUES (
    NEW.rowid,
    NEW.id,
    NEW.name,
    NEW.purpose,
    NEW.capabilities_json,
    NEW.what_it_does_json,
    NEW.what_it_cannot_json
  );
END;

CREATE TRIGGER IF NOT EXISTS skills_ad AFTER DELETE ON skills BEGIN
  INSERT INTO skills_fts(skills_fts, rowid, id, name, purpose, capabilities_text, what_it_does_text, what_it_cannot_text)
  VALUES (
    'delete',
    OLD.rowid,
    OLD.id,
    OLD.name,
    OLD.purpose,
    OLD.capabilities_json,
    OLD.what_it_does_json,
    OLD.what_it_cannot_json
  );
END;

CREATE TRIGGER IF NOT EXISTS skills_au AFTER UPDATE ON skills BEGIN
  INSERT INTO skills_fts(skills_fts, rowid, id, name, purpose, capabilities_text, what_it_does_text, what_it_cannot_text)
  VALUES (
    'delete',
    OLD.rowid,
    OLD.id,
    OLD.name,
    OLD.purpose,
    OLD.capabilities_json,
    OLD.what_it_does_json,
    OLD.what_it_cannot_json
  );
  INSERT INTO skills_fts(rowid, id, name, purpose, capabilities_text, what_it_does_text, what_it_cannot_text)
  VALUES (
    NEW.rowid,
    NEW.id,
    NEW.name,
    NEW.purpose,
    NEW.capabilities_json,
    NEW.what_it_does_json,
    NEW.what_it_cannot_json
  );
END;

-- Synergies table
CREATE TABLE IF NOT EXISTS synergies (
  from_skill TEXT NOT NULL,
  to_skill TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('amplifying', 'conflicting', 'redundant')),
  weight REAL DEFAULT 0.8,
  reason TEXT,
  PRIMARY KEY (from_skill, to_skill, type)
);

-- MCP Endpoints table
CREATE TABLE IF NOT EXISTS mcp_endpoints (
  server_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  description TEXT,
  parameters_json TEXT,
  returns TEXT,
  rate_limit TEXT,
  requires_auth INTEGER DEFAULT 0,
  PRIMARY KEY (server_id, tool_name)
);

-- MCP Servers table
CREATE TABLE IF NOT EXISTS mcp_servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT,
  description TEXT,
  category TEXT,
  anti_hallucination_json TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_tier ON skills(tier);
CREATE INDEX IF NOT EXISTS idx_synergies_from ON synergies(from_skill);
CREATE INDEX IF NOT EXISTS idx_synergies_to ON synergies(to_skill);
CREATE INDEX IF NOT EXISTS idx_mcp_endpoints_server ON mcp_endpoints(server_id);
`;
var SQLiteStore = class {
  config;
  db = null;
  initialized = false;
  constructor(config) {
    this.config = {
      dbPath: config?.dbPath || this.getDefaultDbPath(),
      enableFTS: config?.enableFTS ?? true,
      cacheSize: config?.cacheSize || 8192,
      // 8MB cache
      walMode: config?.walMode ?? true
    };
  }
  /**
   * Initialize the database
   */
  async initialize() {
    if (this.initialized) return;
    try {
      const BetterSqlite3 = await import('better-sqlite3');
      const Database = BetterSqlite3.default || BetterSqlite3;
      const dbDir = path.dirname(this.config.dbPath);
      if (!fs5.existsSync(dbDir)) {
        fs5.mkdirSync(dbDir, { recursive: true });
      }
      this.db = new Database(this.config.dbPath);
      const db = this.db;
      if (this.config.walMode) {
        db.pragma("journal_mode = WAL");
      }
      db.pragma(`cache_size = -${this.config.cacheSize}`);
      db.pragma("synchronous = NORMAL");
      db.pragma("temp_store = MEMORY");
      db.exec(SCHEMA);
      this.initialized = true;
      console.log(`[SQLiteStore] Initialized at ${this.config.dbPath}`);
    } catch (error) {
      console.error("[SQLiteStore] Failed to initialize:", error);
      console.error("[SQLiteStore] Install better-sqlite3: pnpm add better-sqlite3");
      throw error;
    }
  }
  /**
   * Insert or update a skill
   */
  upsertSkill(skill) {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO skills (
        id, name, tier, token_cost, category, purpose,
        capabilities_json, what_it_does_json, what_it_cannot_json,
        anti_hallucination_json, synergies_json, examples_json,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const category = this.extractCategory(skill.id);
    stmt.run(
      skill.id,
      skill.name || skill.id,
      skill.tier || 3,
      skill.token_cost || 5e3,
      category,
      skill.semantic.purpose,
      JSON.stringify(skill.capabilities || []),
      JSON.stringify(skill.semantic.what_it_does || []),
      JSON.stringify(skill.semantic.what_it_cannot || []),
      JSON.stringify(skill.anti_hallucination || []),
      JSON.stringify(skill.synergies || {}),
      JSON.stringify(skill.examples || [])
    );
  }
  /**
   * Get skill by ID
   */
  getSkill(skillId) {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    const row = db.prepare("SELECT * FROM skills WHERE id = ?").get(skillId);
    if (!row) return null;
    return this.rowToMetadata(row);
  }
  /**
   * Full-text search skills
   */
  searchSkills(query, limit = 10) {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    const results = db.prepare(`
      SELECT
        skills.id as skillId,
        skills.name,
        bm25(skills_fts) as rank,
        snippet(skills_fts, 2, '<mark>', '</mark>', '...', 32) as snippet
      FROM skills_fts
      JOIN skills ON skills.id = skills_fts.id
      WHERE skills_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `).all(query, limit);
    return results;
  }
  /**
   * Get all skills
   */
  getAllSkills() {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    const rows = db.prepare("SELECT * FROM skills").all();
    return rows.map((row) => this.rowToMetadata(row));
  }
  /**
   * Get skills by category
   */
  getSkillsByCategory(category) {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    const rows = db.prepare("SELECT * FROM skills WHERE category = ?").all(category);
    return rows.map((row) => this.rowToMetadata(row));
  }
  /**
   * Insert synergy
   */
  insertSynergy(fromSkill, toSkill, type, weight = 0.8, reason) {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    db.prepare(`
      INSERT OR REPLACE INTO synergies (from_skill, to_skill, type, weight, reason)
      VALUES (?, ?, ?, ?, ?)
    `).run(fromSkill, toSkill, type, weight, reason || null);
  }
  /**
   * Get synergies for a skill
   */
  getSynergies(skillId) {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    return db.prepare(`
      SELECT to_skill as toSkill, type, weight, reason
      FROM synergies
      WHERE from_skill = ?
    `).all(skillId);
  }
  /**
   * Insert MCP server
   */
  insertMCPServer(server) {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    db.prepare(`
      INSERT OR REPLACE INTO mcp_servers (id, name, version, description, category, anti_hallucination_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      server.id,
      server.name,
      server.version || null,
      server.description,
      server.category,
      JSON.stringify(server.antiHallucination || [])
    );
  }
  /**
   * Insert MCP endpoint
   */
  insertMCPEndpoint(serverId, endpoint) {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    db.prepare(`
      INSERT OR REPLACE INTO mcp_endpoints (
        server_id, tool_name, description, parameters_json, returns, rate_limit, requires_auth
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      serverId,
      endpoint.name,
      endpoint.description,
      JSON.stringify(endpoint.parameters),
      endpoint.returns,
      endpoint.rateLimit || null,
      endpoint.requiresAuth ? 1 : 0
    );
  }
  /**
   * Search MCP tools
   */
  searchMCPTools(query) {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    return db.prepare(`
      SELECT server_id as serverId, tool_name as toolName, description
      FROM mcp_endpoints
      WHERE tool_name LIKE ? OR description LIKE ?
      LIMIT 20
    `).all(`%${query}%`, `%${query}%`);
  }
  /**
   * Get database statistics
   */
  getStats() {
    if (!this.db) throw new Error("Database not initialized");
    const db = this.db;
    const skillCount = db.prepare("SELECT COUNT(*) as count FROM skills").get().count;
    const synergyCount = db.prepare("SELECT COUNT(*) as count FROM synergies").get().count;
    const mcpServerCount = db.prepare("SELECT COUNT(*) as count FROM mcp_servers").get().count;
    const mcpEndpointCount = db.prepare("SELECT COUNT(*) as count FROM mcp_endpoints").get().count;
    let dbSizeKB = 0;
    try {
      const stats = fs5.statSync(this.config.dbPath);
      dbSizeKB = Math.round(stats.size / 1024);
    } catch {
    }
    return {
      skillCount,
      synergyCount,
      mcpServerCount,
      mcpEndpointCount,
      dbSizeKB
    };
  }
  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
  /**
   * Convert database row to metadata object
   */
  rowToMetadata(row) {
    return {
      id: row.id,
      name: row.name,
      tier: row.tier,
      token_cost: row.token_cost,
      semantic: {
        purpose: row.purpose,
        what_it_does: JSON.parse(row.what_it_does_json || "[]"),
        what_it_cannot: JSON.parse(row.what_it_cannot_json || "[]")
      },
      capabilities: JSON.parse(row.capabilities_json || "[]"),
      anti_hallucination: JSON.parse(row.anti_hallucination_json || "[]"),
      synergies: JSON.parse(row.synergies_json || "{}"),
      examples: JSON.parse(row.examples_json || "[]")
    };
  }
  /**
   * Extract category from skill ID
   */
  extractCategory(skillId) {
    const categoryMap = {
      "solana": "blockchain",
      "anchor": "blockchain",
      "bonding": "blockchain",
      "jupiter": "blockchain",
      "evm": "blockchain",
      "smart": "blockchain",
      "token": "blockchain",
      "defi": "blockchain",
      "wallet": "blockchain",
      "helius": "blockchain",
      "nextjs": "frontend",
      "react": "frontend",
      "tailwind": "frontend",
      "shadcn": "frontend",
      "framer": "frontend",
      "vibe": "frontend",
      "zustand": "frontend",
      "tanstack": "frontend",
      "responsive": "frontend",
      "nodejs": "backend",
      "api": "backend",
      "database": "backend",
      "redis": "backend",
      "graphql": "backend",
      "websocket": "backend",
      "fastify": "backend",
      "docker": "devops",
      "kubernetes": "devops",
      "ci": "devops",
      "aws": "devops",
      "test": "devops",
      "typescript": "core",
      "javascript": "core"
    };
    const firstWord = skillId.split("-")[0].toLowerCase();
    return categoryMap[firstWord] || "other";
  }
  /**
   * Get default database path
   */
  getDefaultDbPath() {
    return path.join(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
      "../../data/opus67.db"
    );
  }
};
var instance6 = null;
function getSQLiteStore() {
  if (!instance6) {
    instance6 = new SQLiteStore();
  }
  return instance6;
}
function resetSQLiteStore() {
  if (instance6) {
    instance6.close();
  }
  instance6 = null;
}

// src/intelligence/confidence-scorer.ts
var THRESHOLDS = {
  proceed: 0.6,
  // Below this, block execution
  gradeA: 0.9,
  gradeB: 0.75,
  gradeC: 0.6,
  gradeD: 0.4
};
var WEIGHTS = {
  skillCoverage: 0.25,
  capabilityMatch: 0.3,
  antiHallucination: 0.2,
  synergyScore: 0.1,
  taskClarity: 0.1,
  complexity: 0.05
};
var ConfidenceScorer = class {
  skillLoader = getSkillMetadataLoader();
  capabilityMatrix = getCapabilityMatrix();
  synergyGraph = getSynergyGraph();
  /**
   * Score confidence for a task with given skills
   */
  async score(task, skillIds) {
    const profile = await this.buildTaskProfile(task, skillIds);
    const factors = await this.calculateFactors(profile);
    const score = this.calculateWeightedScore(factors);
    const grade = this.scoreToGrade(score);
    const { warnings, recommendations } = this.generateFeedback(factors, profile);
    return {
      score,
      grade,
      factors,
      warnings,
      recommendations,
      canProceed: score >= THRESHOLDS.proceed && profile.triggeredWarnings.length === 0
    };
  }
  /**
   * Build profile for a task
   */
  async buildTaskProfile(task, skillIds) {
    await this.skillLoader.loadAll();
    const taskAnalysis = this.capabilityMatrix.analyzeTask(task);
    const triggeredWarnings = [];
    for (const skillId of skillIds) {
      const warning = await this.skillLoader.getAntiHallucinationWarning(skillId, task);
      if (warning) {
        triggeredWarnings.push(`[${skillId}] ${warning}`);
      }
    }
    return {
      task,
      skills: skillIds,
      detectedCapabilities: taskAnalysis.requiredCapabilities,
      triggeredWarnings,
      complexity: this.estimateComplexity(task, taskAnalysis.requiredCapabilities)
    };
  }
  /**
   * Calculate confidence factors
   */
  async calculateFactors(profile) {
    const skillCoverage = profile.skills.length > 0 ? Math.min(1, profile.skills.length / Math.max(1, Math.ceil(profile.detectedCapabilities.length / 3))) : 0;
    let capabilityMatch = 0;
    if (profile.skills.length > 0 && profile.detectedCapabilities.length > 0) {
      let matchedCount = 0;
      let totalConfidence = 0;
      for (const cap of profile.detectedCapabilities) {
        for (const skillId of profile.skills) {
          const check = await this.capabilityMatrix.canDo(skillId, cap);
          if (check.can) {
            matchedCount++;
            totalConfidence += check.confidence;
            break;
          }
        }
      }
      const matchRatio = matchedCount / profile.detectedCapabilities.length;
      const avgConfidence = matchedCount > 0 ? totalConfidence / matchedCount : 0;
      capabilityMatch = matchRatio * 0.7 + avgConfidence * 0.3;
    } else if (profile.detectedCapabilities.length === 0) {
      capabilityMatch = 0.7;
    }
    const warningPenalty = Math.min(1, profile.triggeredWarnings.length * 0.25);
    const antiHallucination = 1 - warningPenalty;
    let synergyScore = 1;
    if (profile.skills.length > 1) {
      const synergies = await this.synergyGraph.getCombinationScore(profile.skills);
      synergyScore = synergies.score;
    }
    const taskClarity = this.estimateTaskClarity(profile.task);
    const complexity = 1 - profile.complexity * 0.5;
    return {
      skillCoverage,
      capabilityMatch,
      antiHallucination,
      synergyScore,
      taskClarity,
      complexity
    };
  }
  /**
   * Calculate weighted confidence score
   */
  calculateWeightedScore(factors) {
    return factors.skillCoverage * WEIGHTS.skillCoverage + factors.capabilityMatch * WEIGHTS.capabilityMatch + factors.antiHallucination * WEIGHTS.antiHallucination + factors.synergyScore * WEIGHTS.synergyScore + factors.taskClarity * WEIGHTS.taskClarity + factors.complexity * WEIGHTS.complexity;
  }
  /**
   * Convert score to letter grade
   */
  scoreToGrade(score) {
    if (score >= THRESHOLDS.gradeA) return "A";
    if (score >= THRESHOLDS.gradeB) return "B";
    if (score >= THRESHOLDS.gradeC) return "C";
    if (score >= THRESHOLDS.gradeD) return "D";
    return "F";
  }
  /**
   * Generate warnings and recommendations
   */
  generateFeedback(factors, profile) {
    const warnings = [];
    const recommendations = [];
    warnings.push(...profile.triggeredWarnings);
    if (factors.skillCoverage < 0.5) {
      warnings.push("Low skill coverage for this task");
      recommendations.push("Consider adding more relevant skills");
    }
    if (factors.capabilityMatch < 0.5) {
      warnings.push("Skills may not fully cover required capabilities");
      recommendations.push("Review task requirements against skill capabilities");
    }
    if (factors.synergyScore < 0.5) {
      warnings.push("Potential conflicts between selected skills");
      recommendations.push("Check skill synergies and remove conflicting skills");
    }
    if (factors.taskClarity < 0.5) {
      recommendations.push("Consider breaking task into smaller, clearer steps");
    }
    if (factors.complexity < 0.5) {
      recommendations.push("Complex task - consider using BUILD mode with thorough approach");
    }
    return { warnings, recommendations };
  }
  /**
   * Estimate task complexity (0-1, higher = more complex)
   */
  estimateComplexity(task, capabilities) {
    let complexity = 0;
    if (task.length > 500) complexity += 0.3;
    else if (task.length > 200) complexity += 0.15;
    if (capabilities.length > 5) complexity += 0.3;
    else if (capabilities.length > 2) complexity += 0.15;
    const complexKeywords = [
      "architecture",
      "design",
      "refactor",
      "optimize",
      "security",
      "production",
      "deploy",
      "scale",
      "migrate",
      "integrate"
    ];
    const taskLower = task.toLowerCase();
    for (const keyword of complexKeywords) {
      if (taskLower.includes(keyword)) {
        complexity += 0.1;
      }
    }
    return Math.min(1, complexity);
  }
  /**
   * Estimate task clarity (0-1, higher = clearer)
   */
  estimateTaskClarity(task) {
    let clarity = 0.5;
    if (task.length < 20) {
      clarity -= 0.2;
    }
    if (task.length > 500) {
      clarity -= 0.1;
    }
    const specificTerms = [
      "create",
      "add",
      "implement",
      "fix",
      "update",
      "remove",
      "component",
      "function",
      "api",
      "endpoint",
      "page",
      "feature"
    ];
    const taskLower = task.toLowerCase();
    for (const term of specificTerms) {
      if (taskLower.includes(term)) {
        clarity += 0.1;
      }
    }
    if (task.includes("/") || task.includes(".ts") || task.includes(".tsx")) {
      clarity += 0.15;
    }
    return Math.max(0, Math.min(1, clarity));
  }
  /**
   * Quick confidence check (returns just score and canProceed)
   */
  async quickCheck(task, skillIds) {
    const result = await this.score(task, skillIds);
    return {
      score: result.score,
      canProceed: result.canProceed
    };
  }
  /**
   * Get confidence factors explanation
   */
  explainFactors(factors) {
    const explanations = [];
    explanations.push(`Skill Coverage: ${(factors.skillCoverage * 100).toFixed(0)}% - How well skills cover the task`);
    explanations.push(`Capability Match: ${(factors.capabilityMatch * 100).toFixed(0)}% - Skills have required capabilities`);
    explanations.push(`Anti-Hallucination: ${(factors.antiHallucination * 100).toFixed(0)}% - No triggered warnings`);
    explanations.push(`Synergy Score: ${(factors.synergyScore * 100).toFixed(0)}% - Skills work well together`);
    explanations.push(`Task Clarity: ${(factors.taskClarity * 100).toFixed(0)}% - Task is well-defined`);
    explanations.push(`Complexity Factor: ${(factors.complexity * 100).toFixed(0)}% - Task manageable`);
    return explanations;
  }
};
var instance7 = null;
function getConfidenceScorer() {
  if (!instance7) {
    instance7 = new ConfidenceScorer();
  }
  return instance7;
}
function resetConfidenceScorer() {
  instance7 = null;
}
var TFIDFVectorizer = class {
  vocabulary = /* @__PURE__ */ new Map();
  idf = /* @__PURE__ */ new Map();
  documents = /* @__PURE__ */ new Map();
  initialized = false;
  /**
   * Tokenize text into terms
   */
  tokenize(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, " ").split(/\s+/).filter((t) => t.length > 2).filter((t) => !this.isStopWord(t));
  }
  /**
   * Check if word is a stop word
   */
  isStopWord(word) {
    const stopWords = /* @__PURE__ */ new Set([
      "the",
      "and",
      "for",
      "with",
      "can",
      "use",
      "into",
      "from",
      "that",
      "this",
      "will",
      "your",
      "are",
      "was",
      "were",
      "been",
      "have",
      "has",
      "had",
      "not",
      "but",
      "what",
      "all",
      "when"
    ]);
    return stopWords.has(word);
  }
  /**
   * Build vocabulary and IDF from documents
   */
  fit(documents) {
    const docCount = documents.size;
    const termDocFreq = /* @__PURE__ */ new Map();
    let vocabIndex = 0;
    for (const [_, text] of documents) {
      const terms = new Set(this.tokenize(text));
      for (const term of terms) {
        if (!this.vocabulary.has(term)) {
          this.vocabulary.set(term, vocabIndex++);
        }
        termDocFreq.set(term, (termDocFreq.get(term) || 0) + 1);
      }
    }
    for (const [term, docFreq] of termDocFreq) {
      this.idf.set(term, Math.log(docCount / (1 + docFreq)) + 1);
    }
    this.initialized = true;
  }
  /**
   * Transform text to TF-IDF vector
   */
  transform(text) {
    const vector = new Array(this.vocabulary.size).fill(0);
    const terms = this.tokenize(text);
    const termFreq = /* @__PURE__ */ new Map();
    for (const term of terms) {
      termFreq.set(term, (termFreq.get(term) || 0) + 1);
    }
    for (const [term, tf] of termFreq) {
      const idx = this.vocabulary.get(term);
      if (idx !== void 0) {
        const idf = this.idf.get(term) || 1;
        vector[idx] = tf * idf;
      }
    }
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }
    return vector;
  }
  /**
   * Fit and transform documents
   */
  fitTransform(documents) {
    this.fit(documents);
    const vectors = /* @__PURE__ */ new Map();
    for (const [id, text] of documents) {
      vectors.set(id, this.transform(text));
    }
    return vectors;
  }
  /**
   * Get vocabulary size
   */
  getVocabSize() {
    return this.vocabulary.size;
  }
};
var SimilaritySearch = class {
  vectorizer;
  vectors = /* @__PURE__ */ new Map();
  skillTexts = /* @__PURE__ */ new Map();
  cachePath;
  initialized = false;
  constructor(cachePath) {
    this.vectorizer = new TFIDFVectorizer();
    this.cachePath = cachePath || this.getDefaultCachePath();
  }
  /**
   * Initialize from skill metadata
   */
  async initialize() {
    if (this.initialized) return;
    if (await this.loadFromCache()) {
      this.initialized = true;
      return;
    }
    const loader = getSkillMetadataLoader();
    await loader.loadAll();
    const skillIds = loader.getLoadedSkillIds();
    for (const skillId of skillIds) {
      const metadata = await loader.get(skillId);
      if (!metadata) continue;
      const text = this.buildSkillText(metadata);
      this.skillTexts.set(skillId, text);
    }
    this.vectors = this.vectorizer.fitTransform(this.skillTexts);
    await this.saveToCache();
    this.initialized = true;
  }
  /**
   * Build searchable text from skill metadata
   */
  buildSkillText(metadata) {
    const parts = [
      metadata.id,
      metadata.name || "",
      metadata.semantic?.purpose || "",
      ...metadata.semantic?.what_it_does || [],
      ...metadata.capabilities?.map((c) => c.action) || []
    ];
    return parts.join(" ").toLowerCase();
  }
  /**
   * Search for similar skills
   */
  async search(query, topK = 5) {
    await this.initialize();
    const queryVector = this.vectorizer.transform(query.toLowerCase());
    const results = [];
    for (const [skillId, vector] of this.vectors) {
      const score = this.cosineSimilarity(queryVector, vector);
      results.push({ skillId, score });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }
  /**
   * Search with metadata included
   */
  async searchWithMetadata(query, topK = 5) {
    const results = await this.search(query, topK);
    const loader = getSkillMetadataLoader();
    for (const result of results) {
      result.metadata = await loader.get(result.skillId) || void 0;
    }
    return results;
  }
  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }
  /**
   * Load vectors from cache
   */
  async loadFromCache() {
    try {
      if (!fs5.existsSync(this.cachePath)) {
        return false;
      }
      const data = JSON.parse(fs5.readFileSync(this.cachePath, "utf-8"));
      const cacheAge = Date.now() - new Date(data.createdAt).getTime();
      const maxAge = 24 * 60 * 60 * 1e3;
      if (cacheAge > maxAge) {
        return false;
      }
      const docs = /* @__PURE__ */ new Map();
      for (const emb of data.embeddings) {
        docs.set(emb.skillId, emb.text);
        this.skillTexts.set(emb.skillId, emb.text);
      }
      this.vectors = this.vectorizer.fitTransform(docs);
      console.log(`[SimilaritySearch] Loaded ${data.embeddings.length} embeddings from cache`);
      return true;
    } catch (error) {
      console.error("[SimilaritySearch] Failed to load cache:", error);
      return false;
    }
  }
  /**
   * Save vectors to cache
   */
  async saveToCache() {
    try {
      const dir = path.dirname(this.cachePath);
      if (!fs5.existsSync(dir)) {
        fs5.mkdirSync(dir, { recursive: true });
      }
      const embeddings = [];
      for (const [skillId, text] of this.skillTexts) {
        const vector = this.vectors.get(skillId) || [];
        embeddings.push({
          skillId,
          vector,
          text,
          timestamp: Date.now()
        });
      }
      const cache = {
        version: "1.0.0",
        dimension: this.vectorizer.getVocabSize(),
        embeddings,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      fs5.writeFileSync(this.cachePath, JSON.stringify(cache, null, 2));
      console.log(`[SimilaritySearch] Saved ${embeddings.length} embeddings to cache`);
    } catch (error) {
      console.error("[SimilaritySearch] Failed to save cache:", error);
    }
  }
  /**
   * Clear cache and reinitialize
   */
  async refresh() {
    try {
      if (fs5.existsSync(this.cachePath)) {
        fs5.unlinkSync(this.cachePath);
      }
    } catch {
    }
    this.initialized = false;
    this.vectors.clear();
    this.skillTexts.clear();
    await this.initialize();
  }
  /**
   * Get statistics
   */
  getStats() {
    return {
      skillCount: this.vectors.size,
      vocabSize: this.vectorizer.getVocabSize(),
      cacheExists: fs5.existsSync(this.cachePath)
    };
  }
  /**
   * Get default cache path
   */
  getDefaultCachePath() {
    return path.join(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
      "../../data/embeddings-cache.json"
    );
  }
};
var instance8 = null;
function getSimilaritySearch() {
  if (!instance8) {
    instance8 = new SimilaritySearch();
  }
  return instance8;
}
function resetSimilaritySearch() {
  instance8 = null;
}

// src/intelligence/skill-search.ts
var DEFAULT_CONFIG = {
  qdrant: {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName: "opus67_skills",
    vectorSize: 384
    // all-MiniLM-L6-v2 dimension
  },
  embeddingModel: "local",
  topK: 5,
  minScore: 0.3
};
var LocalEmbeddings = class {
  vocabulary = /* @__PURE__ */ new Map();
  idf = /* @__PURE__ */ new Map();
  dimension = 384;
  tokenize(text) {
    const words = text.toLowerCase().replace(/[^\w\s-]/g, " ").split(/\s+/).filter((t) => t.length > 2);
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(`${words[i]}_${words[i + 1]}`);
    }
    return [...words, ...bigrams];
  }
  fit(documents) {
    const docCount = documents.length;
    const termDocFreq = /* @__PURE__ */ new Map();
    let vocabIndex = 0;
    for (const doc of documents) {
      const terms = new Set(this.tokenize(doc));
      for (const term of terms) {
        if (!this.vocabulary.has(term)) {
          this.vocabulary.set(term, vocabIndex++);
        }
        termDocFreq.set(term, (termDocFreq.get(term) || 0) + 1);
      }
    }
    for (const [term, docFreq] of termDocFreq) {
      this.idf.set(term, Math.log(docCount / (1 + docFreq)) + 1);
    }
  }
  embed(text) {
    const fullVector = new Array(this.vocabulary.size).fill(0);
    const terms = this.tokenize(text);
    const termFreq = /* @__PURE__ */ new Map();
    for (const term of terms) {
      termFreq.set(term, (termFreq.get(term) || 0) + 1);
    }
    for (const [term, tf] of termFreq) {
      const idx = this.vocabulary.get(term);
      if (idx !== void 0) {
        const idf = this.idf.get(term) || 1;
        fullVector[idx] = tf * idf;
      }
    }
    const vector = new Array(this.dimension).fill(0);
    for (let i = 0; i < fullVector.length; i++) {
      if (fullVector[i] !== 0) {
        const bucket = i % this.dimension;
        vector[bucket] += fullVector[i];
      }
    }
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }
    return vector;
  }
};
var QdrantClient = class {
  url;
  collectionName;
  constructor(config) {
    this.url = config.url;
    this.collectionName = config.collectionName;
  }
  async createCollection(vectorSize) {
    try {
      await fetch(`${this.url}/collections/${this.collectionName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vectors: {
            size: vectorSize,
            distance: "Cosine"
          }
        })
      });
    } catch (error) {
      console.log("[SkillSearch] Collection exists or created");
    }
  }
  async upsertPoints(points) {
    const response = await fetch(`${this.url}/collections/${this.collectionName}/points`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: points.map((p, idx) => ({
          id: idx,
          vector: p.vector,
          payload: { ...p.payload, _id: p.id }
        }))
      })
    });
    if (!response.ok) {
      throw new Error(`Qdrant upsert failed: ${response.statusText}`);
    }
  }
  async search(vector, topK) {
    const response = await fetch(`${this.url}/collections/${this.collectionName}/points/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vector,
        limit: topK,
        with_payload: true
      })
    });
    if (!response.ok) {
      throw new Error(`Qdrant search failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.result;
  }
  async collectionExists() {
    try {
      const response = await fetch(`${this.url}/collections/${this.collectionName}`);
      return response.ok;
    } catch {
      return false;
    }
  }
  async getPointCount() {
    try {
      const response = await fetch(`${this.url}/collections/${this.collectionName}`);
      if (!response.ok) return 0;
      const data = await response.json();
      return data.result.points_count || 0;
    } catch {
      return 0;
    }
  }
};
var SkillSearch = class {
  config;
  embeddings;
  qdrant = null;
  skillVectors = /* @__PURE__ */ new Map();
  initialized = false;
  useQdrant = false;
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.embeddings = new LocalEmbeddings();
    if (this.config.qdrant) {
      this.qdrant = new QdrantClient(this.config.qdrant);
    }
  }
  /**
   * Initialize search engine
   */
  async initialize() {
    if (this.initialized) return;
    if (this.qdrant) {
      try {
        const exists = await this.qdrant.collectionExists();
        const pointCount = exists ? await this.qdrant.getPointCount() : 0;
        if (exists && pointCount > 0) {
          this.useQdrant = true;
          console.log(`[SkillSearch] Using Qdrant with ${pointCount} vectors`);
          this.initialized = true;
          return;
        }
      } catch (error) {
        console.log("[SkillSearch] Qdrant not available, using local embeddings");
      }
    }
    await this.buildLocalIndex();
    this.initialized = true;
  }
  /**
   * Build local index from skill metadata
   */
  async buildLocalIndex() {
    const loader = getSkillMetadataLoader();
    await loader.loadAll();
    const skillIds = loader.getLoadedSkillIds();
    const documents = [];
    const skills = [];
    for (const skillId of skillIds) {
      const metadata = await loader.get(skillId);
      if (!metadata) continue;
      const text = this.buildSearchText(metadata);
      documents.push(text);
      skills.push(metadata);
    }
    this.embeddings.fit(documents);
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const vector = this.embeddings.embed(documents[i]);
      this.skillVectors.set(skill.id, {
        id: skill.id,
        vector,
        payload: {
          skillId: skill.id,
          name: skill.name || skill.id,
          description: skill.semantic?.purpose || "",
          triggers: skill.triggers || [],
          capabilities: skill.capabilities?.map((c) => c.action) || [],
          category: skill.semantic?.category || "general",
          tier: skill.tier || 2
        }
      });
    }
    if (this.qdrant && this.skillVectors.size > 0) {
      try {
        await this.qdrant.createCollection(this.config.qdrant.vectorSize);
        await this.qdrant.upsertPoints(
          Array.from(this.skillVectors.values()).map((sv) => ({
            id: sv.id,
            vector: sv.vector,
            payload: sv.payload
          }))
        );
        this.useQdrant = true;
        console.log(`[SkillSearch] Indexed ${this.skillVectors.size} skills in Qdrant`);
      } catch (error) {
        console.log("[SkillSearch] Could not index in Qdrant, using local search");
      }
    }
    console.log(`[SkillSearch] Built local index with ${this.skillVectors.size} skills`);
  }
  /**
   * Build searchable text from skill metadata
   */
  buildSearchText(metadata) {
    const parts = [
      metadata.id,
      metadata.name || "",
      metadata.semantic?.purpose || "",
      ...metadata.semantic?.what_it_does || [],
      ...metadata.triggers || [],
      ...metadata.capabilities?.map((c) => c.action) || [],
      ...metadata.capabilities?.map((c) => c.description) || []
    ];
    return parts.filter(Boolean).join(" ").toLowerCase();
  }
  /**
   * Search for skills matching a query
   */
  async searchSkills(query, topK) {
    await this.initialize();
    const k = topK || this.config.topK;
    const queryVector = this.embeddings.embed(query.toLowerCase());
    if (this.useQdrant && this.qdrant) {
      return this.searchQdrant(queryVector, k);
    }
    return this.searchLocal(queryVector, k);
  }
  /**
   * Search using Qdrant
   */
  async searchQdrant(vector, topK) {
    const results = await this.qdrant.search(vector, topK);
    return results.filter((r) => r.score >= this.config.minScore).map((r) => ({
      skillId: r.payload._id || r.payload.skillId,
      name: r.payload.name || "",
      score: r.score,
      description: r.payload.description || "",
      triggers: r.payload.triggers || [],
      capabilities: r.payload.capabilities || []
    }));
  }
  /**
   * Search using local vectors
   */
  searchLocal(queryVector, topK) {
    const results = [];
    for (const skill of this.skillVectors.values()) {
      const score = this.cosineSimilarity(queryVector, skill.vector);
      if (score >= this.config.minScore) {
        results.push({ skill, score });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK).map((r) => ({
      skillId: r.skill.payload.skillId,
      name: r.skill.payload.name,
      score: r.score,
      description: r.skill.payload.description,
      triggers: r.skill.payload.triggers,
      capabilities: r.skill.payload.capabilities
    }));
  }
  /**
   * Calculate cosine similarity
   */
  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }
  /**
   * Get skill by ID
   */
  async getSkillById(skillId) {
    await this.initialize();
    const skill = this.skillVectors.get(skillId);
    if (!skill) return null;
    return {
      skillId: skill.payload.skillId,
      name: skill.payload.name,
      score: 1,
      description: skill.payload.description,
      triggers: skill.payload.triggers,
      capabilities: skill.payload.capabilities
    };
  }
  /**
   * Index all skills (rebuild index)
   */
  async indexAllSkills() {
    this.initialized = false;
    this.skillVectors.clear();
    this.useQdrant = false;
    await this.buildLocalIndex();
    return {
      indexed: this.skillVectors.size,
      errors: 0
    };
  }
  /**
   * Get search statistics
   */
  getStats() {
    return {
      skillCount: this.skillVectors.size,
      useQdrant: this.useQdrant,
      qdrantUrl: this.config.qdrant?.url || null,
      initialized: this.initialized
    };
  }
};
var instance9 = null;
function getSkillSearch() {
  if (!instance9) {
    instance9 = new SkillSearch();
  }
  return instance9;
}
function resetSkillSearch() {
  instance9 = null;
}

// src/intelligence/index.ts
async function initIntelligence() {
  const store = getKnowledgeStore();
  await store.initialize();
  getSimilaritySearch().initialize().catch(() => {
  });
}
async function scoreConfidence(task, skillIds) {
  const scorer = getConfidenceScorer();
  const result = await scorer.score(task, skillIds);
  return {
    score: result.score,
    grade: result.grade,
    canProceed: result.canProceed,
    warnings: result.warnings
  };
}
async function findSimilarSkills(query, topK = 5) {
  const search = getSimilaritySearch();
  await search.initialize();
  return search.search(query, topK);
}
async function preFlightCheck(task, skillIds) {
  const store = getKnowledgeStore();
  await store.initialize();
  return store.preFlightCheck(task, skillIds);
}
async function findBestSkills(task, maxResults = 5) {
  const store = getKnowledgeStore();
  await store.initialize();
  const result = await store.findSkillsForTask(task, maxResults);
  return result.data || [];
}
async function getIntelligenceStats() {
  const store = getKnowledgeStore();
  await store.initialize();
  const stats = await store.getStats();
  return {
    skills: {
      total: stats.skills.total,
      withCapabilities: stats.skills.withCapabilities
    },
    synergies: {
      totalEdges: stats.synergies.totalEdges,
      amplifying: stats.synergies.amplifying,
      conflicting: stats.synergies.conflicting
    },
    mcps: {
      totalServers: stats.mcps.totalServers,
      totalEndpoints: stats.mcps.totalEndpoints
    },
    storage: {
      mode: stats.storage.mode,
      cacheHits: stats.storage.cacheHits,
      cacheMisses: stats.storage.cacheMisses
    }
  };
}

export { CapabilityMatrix, ConfidenceScorer, KnowledgeStore, MCPValidator, SQLiteStore, SimilaritySearch, SkillMetadataLoader, SkillSearch, SynergyGraph, TFIDFVectorizer, canDo, findBestSkills, findSimilarSkills, getCapabilityMatrix, getConfidenceScorer, getIntelligenceStats, getKnowledgeStore, getMCPValidator, getSQLiteStore, getSimilaritySearch, getSkillMetadataLoader, getSkillSearch, getSynergy, getSynergyGraph, initIntelligence, lookupSkill, preFlightCheck, resetCapabilityMatrix, resetConfidenceScorer, resetKnowledgeStore, resetMCPValidator, resetSQLiteStore, resetSimilaritySearch, resetSkillMetadataLoader, resetSkillSearch, resetSynergyGraph, scoreConfidence, validateMCP };
