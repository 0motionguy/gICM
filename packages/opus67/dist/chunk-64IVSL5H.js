import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { parse } from 'yaml';
import { join } from 'path';
import { EventEmitter } from 'eventemitter3';
import Anthropic from '@anthropic-ai/sdk';

// src/skills/loader.ts
var SkillLoader = class extends EventEmitter {
  registryPath;
  registry = null;
  loadedSkills = /* @__PURE__ */ new Map();
  knowledgePath;
  evolution = { enabled: false };
  currentTaskContext = "";
  constructor(registryPath) {
    super();
    this.registryPath = registryPath;
    this.knowledgePath = join(registryPath, "..", "definitions");
  }
  /**
   * Enable evolution-based learning integration
   */
  enableEvolution(integration) {
    this.evolution = { ...integration, enabled: true };
    console.log("[SkillLoader] Evolution integration enabled");
  }
  /**
   * Disable evolution integration
   */
  disableEvolution() {
    this.evolution = { enabled: false };
  }
  /**
   * Set current task context for tracking
   */
  setTaskContext(context) {
    this.currentTaskContext = context;
    if (this.evolution.enabled && this.evolution.usageTracker) {
      this.evolution.usageTracker.startSession(context);
    }
  }
  /**
   * End current task/session
   */
  endTask(success) {
    if (this.evolution.enabled && this.evolution.usageTracker) {
      const outcome = success === void 0 ? void 0 : success ? "success" : "failure";
      this.evolution.usageTracker.endSession(outcome);
    }
    this.currentTaskContext = "";
  }
  /**
   * Load the skills registry from YAML
   */
  async loadRegistry() {
    const content = readFileSync(this.registryPath, "utf-8");
    this.registry = parse(content);
    if (this.registry.loading?.always_load) {
      for (const skillId of this.registry.loading.always_load) {
        await this.loadSkill(skillId);
      }
    }
    return this.registry;
  }
  /**
   * Get the raw registry
   */
  getRegistry() {
    if (!this.registry) {
      throw new Error("Registry not loaded. Call loadRegistry() first.");
    }
    return this.registry;
  }
  /**
   * Load skills for a detected task
   */
  async loadForTask(skillIds, trigger = "auto") {
    const loaded = [];
    let totalTokens = 0;
    const budget = this.registry?.loading?.token_budget || 5e4;
    for (const skillId of skillIds) {
      const skill = this.findSkill(skillId);
      if (!skill) continue;
      if (totalTokens + skill.tokens > budget) {
        console.warn(`[SkillLoader] Token budget exceeded, skipping ${skillId}`);
        break;
      }
      const loadedSkill = await this.loadSkill(skillId, trigger);
      if (loadedSkill) {
        loaded.push(loadedSkill);
        totalTokens += loadedSkill.tokens;
      }
    }
    return loaded;
  }
  /**
   * Load a single skill by ID
   */
  async loadSkill(skillId, trigger = "auto") {
    if (this.loadedSkills.has(skillId)) {
      this.trackSkillUsage(skillId, this.loadedSkills.get(skillId).name, trigger);
      return this.loadedSkills.get(skillId);
    }
    const skill = this.findSkill(skillId);
    if (!skill) {
      console.warn(`[SkillLoader] Skill not found: ${skillId}`);
      return null;
    }
    if (this.registry?.loading?.manual_only?.includes(skillId)) {
      console.warn(`[SkillLoader] Skill ${skillId} is manual-only`);
      return null;
    }
    let knowledge = skill.knowledge || "";
    const knowledgeFile = join(this.knowledgePath, `${skillId}.md`);
    if (existsSync(knowledgeFile)) {
      knowledge = readFileSync(knowledgeFile, "utf-8");
    }
    const loaded = {
      id: skill.id,
      name: skill.name,
      knowledge,
      capabilities: skill.capabilities,
      tokens: skill.tokens
    };
    this.loadedSkills.set(skillId, loaded);
    console.log(`[SkillLoader] Loaded: ${skill.name} (${skill.tokens} tokens)`);
    this.trackSkillUsage(skillId, skill.name, trigger);
    this.emit("skill:loaded", loaded, trigger);
    return loaded;
  }
  /**
   * Track skill usage for evolution learning
   */
  trackSkillUsage(skillId, skillName, trigger) {
    if (!this.evolution.enabled || !this.evolution.usageTracker) return;
    this.evolution.usageTracker.trackSkill(skillId, skillName, {
      trigger,
      taskContext: this.currentTaskContext,
      metadata: {
        loadedSkills: Array.from(this.loadedSkills.keys())
      }
    });
  }
  /**
   * Load a bundle of skills
   */
  async loadBundle(bundleName) {
    if (!this.registry?.bundles?.[bundleName]) {
      throw new Error(`Bundle not found: ${bundleName}`);
    }
    const skillIds = this.registry.bundles[bundleName];
    const loaded = await this.loadForTask(skillIds, "bundle");
    this.emit("bundle:loaded", bundleName, loaded);
    return loaded;
  }
  /**
   * Find skill definition by ID
   */
  findSkill(skillId) {
    return this.registry?.skills.find((s) => s.id === skillId);
  }
  /**
   * Detect skills needed based on input (with optional evolution-enhanced selection)
   */
  detectSkills(input, filePaths) {
    if (!this.registry) return [];
    const detected = /* @__PURE__ */ new Set();
    const lowerInput = input.toLowerCase();
    this.currentTaskContext = input;
    for (const skill of this.registry.skills) {
      if (skill.priority > (this.registry.loading?.priority_threshold || 3)) {
        continue;
      }
      let matched = false;
      for (const keyword of skill.triggers.keywords || []) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          matched = true;
          break;
        }
      }
      if (!matched && filePaths) {
        for (const ext of skill.triggers.extensions || []) {
          if (filePaths.some((p) => p.endsWith(ext))) {
            matched = true;
            break;
          }
        }
      }
      if (!matched && filePaths) {
        for (const dir of skill.triggers.directories || []) {
          if (filePaths.some((p) => p.includes(dir))) {
            matched = true;
            break;
          }
        }
      }
      if (matched) {
        detected.add(skill.id);
      }
    }
    let sorted = Array.from(detected).sort((a, b) => {
      const skillA = this.findSkill(a);
      const skillB = this.findSkill(b);
      return (skillA?.priority || 99) - (skillB?.priority || 99);
    });
    if (this.evolution.enabled && this.evolution.adaptiveMatcher) {
      sorted = this.enhanceWithLearnings(sorted, input, filePaths);
    }
    const maxSkills = this.registry.loading?.max_concurrent_skills || 5;
    const result = sorted.slice(0, maxSkills);
    this.emit("skill:detected", result, input);
    return result;
  }
  /**
   * Enhance skill selection using evolution learnings
   */
  enhanceWithLearnings(skillIds, taskContext, filePaths) {
    if (!this.evolution.adaptiveMatcher) return skillIds;
    const entities = skillIds.map((id) => {
      const skill = this.findSkill(id);
      return {
        id,
        type: "skill",
        name: skill?.name ?? id,
        baseScore: 1 / (skill?.priority ?? 1)
        // Higher priority = higher score
      };
    });
    const scores = this.evolution.adaptiveMatcher.enhanceScores(entities, {
      taskContext,
      filePaths,
      currentEntities: entities.map((e) => ({ type: e.type, id: e.id }))
    });
    const suggestions = this.evolution.adaptiveMatcher.getSuggestions(
      entities.map((e) => ({ type: e.type, id: e.id })),
      { taskContext, filePaths }
    );
    for (const suggestion of suggestions) {
      if (suggestion.confidence > 0.6 && suggestion.entityType === "skill") {
        if (!scores.find((s) => s.entityId === suggestion.entityId)) {
          scores.push({
            entityId: suggestion.entityId,
            entityType: "skill",
            baseScore: 0.5,
            learningBoost: suggestion.confidence,
            appliedLearnings: [],
            finalScore: suggestion.confidence
          });
        }
      }
    }
    const enhanced = scores.sort((a, b) => b.finalScore - a.finalScore).map((s) => s.entityId);
    if (JSON.stringify(skillIds) !== JSON.stringify(enhanced)) {
      this.emit("evolution:enhanced", skillIds, enhanced);
    }
    return enhanced;
  }
  /**
   * Get warnings from evolution learnings
   */
  getEvolutionWarnings() {
    if (!this.evolution.enabled || !this.evolution.adaptiveMatcher) return [];
    const currentEntities = Array.from(this.loadedSkills.keys()).map((id) => ({
      type: "skill",
      id
    }));
    return this.evolution.adaptiveMatcher.getWarnings(currentEntities, {
      taskContext: this.currentTaskContext
    });
  }
  /**
   * Get skill suggestions from evolution learnings
   */
  getEvolutionSuggestions() {
    if (!this.evolution.enabled || !this.evolution.adaptiveMatcher) return [];
    const currentEntities = Array.from(this.loadedSkills.keys()).map((id) => ({
      type: "skill",
      id
    }));
    return this.evolution.adaptiveMatcher.getSuggestions(currentEntities, {
      taskContext: this.currentTaskContext
    }).map((s) => ({
      skillId: s.entityId,
      reason: s.reason,
      confidence: s.confidence
    }));
  }
  /**
   * Get required MCP connections for loaded skills
   */
  getRequiredMCPs() {
    const mcps = /* @__PURE__ */ new Set();
    for (const [_, skill] of this.loadedSkills) {
      const def = this.findSkill(skill.id);
      if (def?.mcp_connections) {
        def.mcp_connections.forEach((m) => mcps.add(m));
      }
    }
    return Array.from(mcps);
  }
  /**
   * Get list of loaded skills
   */
  getLoaded() {
    return Array.from(this.loadedSkills.values());
  }
  /**
   * Unload a skill
   */
  unload(skillId) {
    return this.loadedSkills.delete(skillId);
  }
  /**
   * Unload all non-essential skills
   */
  cleanup() {
    const alwaysLoad = this.registry?.loading?.always_load || [];
    for (const [skillId] of this.loadedSkills) {
      if (!alwaysLoad.includes(skillId)) {
        this.loadedSkills.delete(skillId);
      }
    }
  }
  /**
   * Get stats
   */
  getStats() {
    let tokens = 0;
    for (const skill of this.loadedSkills.values()) {
      tokens += skill.tokens;
    }
    return {
      total: this.registry?.skills.length || 0,
      loaded: this.loadedSkills.size,
      tokens
    };
  }
  /**
   * Format loaded skills for prompt injection
   */
  formatForPrompt() {
    if (this.loadedSkills.size === 0) {
      return "";
    }
    const sections = [];
    sections.push("## Active Skills\n");
    for (const skill of this.loadedSkills.values()) {
      sections.push(`### ${skill.name}`);
      sections.push(`**Capabilities:** ${skill.capabilities.join(", ")}`);
      if (skill.knowledge) {
        sections.push(`
${skill.knowledge}`);
      }
      sections.push("---\n");
    }
    return sections.join("\n");
  }
};
var loader_default = SkillLoader;
var DynamicToolDiscovery = class extends EventEmitter {
  config;
  anthropic = null;
  toolLibrary = /* @__PURE__ */ new Map();
  constructor(config) {
    super();
    this.config = {
      maxResults: config?.maxResults ?? 5,
      threshold: config?.threshold ?? 0.3,
      enableAISearch: config?.enableAISearch ?? true,
      anthropicApiKey: config?.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY ?? ""
    };
    if (this.config.anthropicApiKey && this.config.enableAISearch) {
      this.anthropic = new Anthropic({
        apiKey: this.config.anthropicApiKey
      });
    }
  }
  /**
   * Register available MCP connections
   */
  registerConnections(connections) {
    for (const conn of connections) {
      this.toolLibrary.set(conn.id, conn);
    }
  }
  /**
   * Discover relevant tools for a task
   */
  async discoverTools(task) {
    this.emit("discovery:start", task);
    if (this.anthropic && this.config.enableAISearch) {
      try {
        return await this.aiPoweredDiscovery(task);
      } catch (error) {
        console.warn("[DynamicToolDiscovery] AI discovery failed, falling back:", error);
        this.emit("discovery:fallback", "AI discovery unavailable, using semantic matching");
      }
    }
    return await this.semanticDiscovery(task);
  }
  /**
   * AI-powered discovery using Claude's understanding
   */
  async aiPoweredDiscovery(task) {
    if (!this.anthropic) {
      throw new Error("Anthropic client not initialized");
    }
    const toolDescriptions = Array.from(this.toolLibrary.values()).map((conn) => ({
      id: conn.id,
      name: conn.name,
      category: conn.category,
      tools: conn.tools.map((t) => `${t.name}: ${t.description}`).join("; ")
    }));
    const prompt = `Analyze this task and identify the most relevant MCP tools:

Task: "${task}"

Available MCPs:
${toolDescriptions.map((t) => `- ${t.id} (${t.name}): ${t.tools}`).join("\n")}

Return a JSON array of the top ${this.config.maxResults} most relevant MCP IDs with relevance scores (0-1) and reasoning.

Format:
[
  { "id": "jupiter", "score": 0.95, "reason": "Direct Jupiter API access for Solana DEX" },
  ...
]`;
    const response = await this.anthropic.messages.create({
      model: "claude-opus-4-5-20250929",
      max_tokens: 1e3,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    let content = "";
    for (const block of response.content) {
      if (block.type === "text") {
        content += block.text;
      }
    }
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    const matches = JSON.parse(jsonMatch[0]);
    const relevantMatches = matches.filter((m) => m.score >= this.config.threshold).slice(0, this.config.maxResults);
    const connections = relevantMatches.map((m) => this.toolLibrary.get(m.id)).filter((c) => c !== void 0);
    const relevanceScores = new Map(
      relevantMatches.map((m) => [m.id, m.score])
    );
    const reasoning = relevantMatches.map((m) => `${m.id} (${(m.score * 100).toFixed(0)}%): ${m.reason}`).join("\n");
    const result = {
      connections,
      relevanceScores,
      reasoning,
      method: "ai_powered"
    };
    this.emit("discovery:complete", result);
    return result;
  }
  /**
   * Semantic discovery using keyword matching and heuristics
   */
  async semanticDiscovery(task) {
    const taskLower = task.toLowerCase();
    const matches = [];
    for (const [id, conn] of this.toolLibrary) {
      let score = 0;
      const reasons = [];
      if (taskLower.includes(conn.category.toLowerCase())) {
        score += 0.2;
        reasons.push(`category match (${conn.category})`);
      }
      const nameWords = conn.name.toLowerCase().split(/[\s-_]/);
      for (const word of nameWords) {
        if (word.length > 3 && taskLower.includes(word)) {
          score += 0.3;
          reasons.push(`name match (${word})`);
          break;
        }
      }
      for (const tool of conn.tools) {
        const descWords = tool.description.toLowerCase().split(/\s+/);
        const taskWords = taskLower.split(/\s+/);
        const overlap = descWords.filter((w) => taskWords.includes(w) && w.length > 3);
        if (overlap.length > 0) {
          const toolScore = Math.min(0.5, overlap.length * 0.1);
          score += toolScore;
          reasons.push(`tool match: ${tool.name}`);
        }
      }
      if (conn.priority >= 4) {
        score += 0.1;
        reasons.push("high priority");
      }
      if (score >= this.config.threshold) {
        matches.push({
          conn,
          score: Math.min(score, 1),
          reason: reasons.join(", ")
        });
      }
    }
    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, this.config.maxResults);
    const connections = topMatches.map((m) => m.conn);
    const relevanceScores = new Map(
      topMatches.map((m) => [m.conn.id, m.score])
    );
    const reasoning = topMatches.length > 0 ? topMatches.map((m) => `${m.conn.id} (${(m.score * 100).toFixed(0)}%): ${m.reason}`).join("\n") : "No relevant tools found above threshold";
    const result = {
      connections,
      relevanceScores,
      reasoning,
      method: "semantic"
    };
    this.emit("discovery:complete", result);
    return result;
  }
  /**
   * Keyword-based discovery (fastest, least accurate)
   */
  keywordDiscovery(task) {
    const taskLower = task.toLowerCase();
    const matches = [];
    for (const [id, conn] of this.toolLibrary) {
      if (taskLower.includes(conn.id.toLowerCase()) || taskLower.includes(conn.name.toLowerCase()) || taskLower.includes(conn.category.toLowerCase())) {
        matches.push({ conn, score: 0.8 });
      }
    }
    const connections = matches.slice(0, this.config.maxResults).map((m) => m.conn);
    const relevanceScores = new Map(
      matches.slice(0, this.config.maxResults).map((m) => [m.conn.id, m.score])
    );
    return {
      connections,
      relevanceScores,
      reasoning: connections.length > 0 ? `Found ${connections.length} keyword matches` : "No keyword matches found",
      method: "keyword"
    };
  }
  /**
   * Get all registered connections
   */
  getAllConnections() {
    return Array.from(this.toolLibrary.values());
  }
  /**
   * Get connection by ID
   */
  getConnection(id) {
    return this.toolLibrary.get(id);
  }
  /**
   * Clear tool library
   */
  clear() {
    this.toolLibrary.clear();
  }
  /**
   * Get configuration
   */
  getConfig() {
    return Object.freeze({ ...this.config });
  }
  /**
   * Update configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    if (config.anthropicApiKey && this.config.enableAISearch) {
      this.anthropic = new Anthropic({
        apiKey: config.anthropicApiKey
      });
    }
  }
};
function createDiscovery(config) {
  return new DynamicToolDiscovery(config);
}
var globalDiscovery = null;
function getDiscovery(config) {
  if (!globalDiscovery) {
    globalDiscovery = new DynamicToolDiscovery(config);
  }
  return globalDiscovery;
}
var MCPHub = class extends EventEmitter {
  configPath;
  config = null;
  connected = /* @__PURE__ */ new Map();
  clients = /* @__PURE__ */ new Map();
  discovery;
  // v5.0: Dynamic tool discovery
  constructor(configPath) {
    super();
    this.configPath = configPath;
    this.discovery = createDiscovery();
  }
  /**
   * Load MCP configuration from YAML
   */
  async loadConfig() {
    const content = readFileSync(this.configPath, "utf-8");
    this.config = parse(content);
    if (this.config.connections) {
      this.discovery.registerConnections(this.config.connections);
    }
    return this.config;
  }
  /**
   * Connect to all "always" MCPs
   */
  async connectAll() {
    if (!this.config) {
      await this.loadConfig();
    }
    const alwaysConnect = this.config?.auto_connect?.always || [];
    for (const mcpId of alwaysConnect) {
      await this.connect(mcpId);
    }
    if (alwaysConnect.length === 0) {
      console.log("[MCPHub] No auto-connect MCPs configured (this is OK)");
    }
  }
  /**
   * Connect to a specific MCP
   */
  async connect(mcpId) {
    const mcp = this.findMCP(mcpId);
    if (!mcp) {
      console.warn(`[MCPHub] MCP not found: ${mcpId}`);
      return false;
    }
    if (mcp.status === "disabled") {
      console.warn(`[MCPHub] MCP disabled: ${mcpId}`);
      return false;
    }
    if (this.connected.has(mcpId)) {
      return true;
    }
    this.emit("mcp:connecting", mcpId);
    try {
      const client = await this.createClient(mcp);
      this.clients.set(mcpId, client);
      await client.ping();
      mcp.status = "connected";
      this.connected.set(mcpId, mcp);
      this.emit("mcp:connected", mcpId);
      console.log(`[MCPHub] Connected: ${mcp.name}`);
      return true;
    } catch (error) {
      mcp.status = "error";
      this.emit("mcp:error", mcpId, error);
      console.error(`[MCPHub] Failed to connect ${mcpId}:`, error);
      return false;
    }
  }
  /**
   * Connect MCPs required by specific skills
   */
  async connectForSkills(skillIds) {
    const connectedMCPs = [];
    for (const skillId of skillIds) {
      const requiredMCPs = this.config?.auto_connect.on_skill[skillId] || [];
      for (const mcpId of requiredMCPs) {
        if (!this.connected.has(mcpId)) {
          const success = await this.connect(mcpId);
          if (success) {
            connectedMCPs.push(this.connected.get(mcpId));
          }
        }
      }
    }
    return connectedMCPs;
  }
  /**
   * Connect a group of MCPs
   */
  async connectGroup(groupName) {
    const group = this.config?.groups[groupName];
    if (!group) {
      throw new Error(`Group not found: ${groupName}`);
    }
    for (const mcpId of group) {
      await this.connect(mcpId);
    }
  }
  /**
   * v5.0: Discover and connect relevant MCPs for a task
   *
   * This is the dynamic discovery method that analyzes the task
   * and connects only relevant MCPs instead of all 84.
   */
  async discoverAndConnect(task) {
    if (!this.config) {
      await this.loadConfig();
    }
    const result = await this.discovery.discoverTools(task);
    for (const conn of result.connections) {
      if (!this.connected.has(conn.id)) {
        await this.connect(conn.id);
      }
    }
    return result;
  }
  /**
   * Get discovery engine (for advanced usage)
   */
  getDiscovery() {
    return this.discovery;
  }
  /**
   * Create client based on transport type
   */
  async createClient(mcp) {
    switch (mcp.transport) {
      case "http":
        return new HTTPMCPClient(mcp);
      case "graphql":
        return new GraphQLMCPClient(mcp);
      case "pg":
        return new PostgresMCPClient(mcp);
      case "sdk":
        return new SDKMCPClient(mcp);
      default:
        return new GenericMCPClient(mcp);
    }
  }
  /**
   * Call a tool on a connected MCP
   */
  async callTool(mcpId, toolName, params) {
    const client = this.clients.get(mcpId);
    if (!client) {
      throw new Error(`MCP not connected: ${mcpId}`);
    }
    const mcp = this.connected.get(mcpId);
    const tool = mcp.tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName} on ${mcpId}`);
    }
    this.emit("tool:called", mcpId, toolName, params);
    try {
      const result = await client.call(tool, params);
      this.emit("tool:result", mcpId, toolName, result);
      return result;
    } catch (error) {
      console.error(`[MCPHub] Tool call failed ${mcpId}.${toolName}:`, error);
      throw error;
    }
  }
  /**
   * Get all available tools from connected MCPs
   */
  getAvailableTools() {
    const tools = [];
    for (const [mcpId, mcp] of this.connected) {
      for (const tool of mcp.tools) {
        tools.push({
          id: `${mcpId}.${tool.name}`,
          name: tool.name,
          description: tool.description,
          mcp: mcpId
        });
      }
    }
    return tools;
  }
  /**
   * Find MCP definition by ID
   */
  findMCP(mcpId) {
    return this.config?.connections.find((c) => c.id === mcpId);
  }
  /**
   * Get list of connected MCPs
   */
  getConnected() {
    return Array.from(this.connected.values());
  }
  /**
   * Disconnect from an MCP
   */
  async disconnect(mcpId) {
    const client = this.clients.get(mcpId);
    if (client) {
      await client.disconnect();
      this.clients.delete(mcpId);
    }
    this.connected.delete(mcpId);
    this.emit("mcp:disconnected", mcpId);
  }
  /**
   * Disconnect from all MCPs
   */
  async disconnectAll() {
    for (const mcpId of this.connected.keys()) {
      await this.disconnect(mcpId);
    }
  }
  /**
   * Get connection stats
   */
  getStats() {
    return {
      total: this.config?.connections.length || 0,
      connected: this.connected.size,
      available_tools: this.getAvailableTools().length
    };
  }
  /**
   * Format MCP tools for prompt injection
   */
  formatForPrompt() {
    const tools = this.getAvailableTools();
    if (tools.length === 0) {
      return "";
    }
    const lines = ["## Available MCP Tools\n"];
    const byMCP = {};
    for (const tool of tools) {
      if (!byMCP[tool.mcp]) {
        byMCP[tool.mcp] = [];
      }
      byMCP[tool.mcp].push(tool);
    }
    for (const [mcpId, mcpTools] of Object.entries(byMCP)) {
      const mcp = this.connected.get(mcpId);
      lines.push(`### ${mcp?.name || mcpId}`);
      for (const tool of mcpTools) {
        lines.push(`- **${tool.name}**: ${tool.description}`);
      }
      lines.push("");
    }
    return lines.join("\n");
  }
};
var MCPClient = class {
  mcp;
  constructor(mcp) {
    this.mcp = mcp;
  }
  getAuthHeader() {
    if (!this.mcp.auth || this.mcp.auth.type === "none") {
      return {};
    }
    const apiKey = process.env[this.mcp.auth.env_var];
    if (!apiKey) {
      console.warn(`[MCPClient] Missing env var: ${this.mcp.auth.env_var}`);
      return {};
    }
    switch (this.mcp.auth.type) {
      case "api_key":
        return { [this.mcp.auth.header || "Authorization"]: apiKey };
      case "bearer":
        return { Authorization: `Bearer ${apiKey}` };
      case "bot":
        return { Authorization: `Bot ${apiKey}` };
      default:
        return {};
    }
  }
};
var HTTPMCPClient = class extends MCPClient {
  async ping() {
    return true;
  }
  async call(tool, params) {
    let url = `${this.mcp.base_url}${tool.endpoint || ""}`;
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, String(value));
    }
    const method = tool.method || "GET";
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader()
    };
    const response = await fetch(url, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(params) : void 0
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
  async disconnect() {
  }
};
var GraphQLMCPClient = class extends MCPClient {
  async ping() {
    return true;
  }
  async call(tool, params) {
    const response = await fetch(this.mcp.base_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader()
      },
      body: JSON.stringify({
        query: tool.query,
        variables: params
      })
    });
    if (!response.ok) {
      throw new Error(`GraphQL ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    return result.data;
  }
  async disconnect() {
  }
};
var PostgresMCPClient = class extends MCPClient {
  pool = null;
  // Would be pg.Pool in real implementation
  async ping() {
    return true;
  }
  async call(tool, params) {
    return { message: "PostgreSQL client - implement with pg package" };
  }
  async disconnect() {
  }
};
var SDKMCPClient = class extends MCPClient {
  async ping() {
    return true;
  }
  async call(tool, params) {
    return { message: `SDK client for ${this.mcp.name} - implement with package` };
  }
  async disconnect() {
  }
};
var GenericMCPClient = class extends MCPClient {
  async ping() {
    return true;
  }
  async call(tool, params) {
    return { message: `Generic client for ${this.mcp.name}` };
  }
  async disconnect() {
  }
};
var AutonomyEngine = class {
  config;
  logs = [];
  patterns = [];
  suggestions = [];
  logPath;
  constructor(config) {
    this.config = {
      level: config.level,
      logPath: config.logPath || ".opus67/logs",
      maxLogEntries: config.maxLogEntries || 1e3,
      patternAnalysisInterval: config.patternAnalysisInterval || 36e5
      // 1 hour
    };
    this.logPath = this.config.logPath;
  }
  /**
   * Initialize the autonomy engine
   */
  async initialize() {
    if (!existsSync(this.logPath)) {
      mkdirSync(this.logPath, { recursive: true });
    }
    await this.loadLogs();
    if (this.config.patternAnalysisInterval > 0) {
      setInterval(() => {
        this.analyzePatterns();
      }, this.config.patternAnalysisInterval);
    }
    console.log(`[AutonomyEngine] Initialized at level ${this.config.level}`);
  }
  /**
   * Log an interaction
   */
  logInteraction(log) {
    const id = this.generateId();
    const entry = {
      ...log,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.logs.push(entry);
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs = this.logs.slice(-this.config.maxLogEntries);
    }
    this.saveLogs().catch(console.error);
    return id;
  }
  /**
   * Record user feedback for an interaction
   */
  recordFeedback(logId, feedback) {
    const log = this.logs.find((l) => l.id === logId);
    if (log) {
      log.userFeedback = feedback;
      this.saveLogs().catch(console.error);
    }
  }
  /**
   * Analyze patterns in logs
   */
  analyzePatterns() {
    const newPatterns = [];
    const taskCounts = /* @__PURE__ */ new Map();
    for (const log of this.logs.slice(-100)) {
      const count = taskCounts.get(log.taskType) || 0;
      taskCounts.set(log.taskType, count + 1);
    }
    for (const [taskType, count] of taskCounts) {
      if (count >= 10) {
        newPatterns.push({
          id: `frequent_${taskType}`,
          type: "frequent_task",
          description: `Task type "${taskType}" appears frequently (${count} times in last 100 interactions)`,
          frequency: count,
          lastSeen: /* @__PURE__ */ new Date(),
          suggestedAction: `Consider creating optimized workflow for ${taskType} tasks`
        });
      }
    }
    const failedTasks = this.logs.filter((l) => !l.success && l.skillsUsed.length === 0);
    const failedTaskTypes = /* @__PURE__ */ new Map();
    for (const log of failedTasks.slice(-50)) {
      const count = failedTaskTypes.get(log.taskType) || 0;
      failedTaskTypes.set(log.taskType, count + 1);
    }
    for (const [taskType, count] of failedTaskTypes) {
      if (count >= 3) {
        newPatterns.push({
          id: `gap_${taskType}`,
          type: "skill_gap",
          description: `Potential skill gap: ${taskType} tasks failing without loaded skills`,
          frequency: count,
          lastSeen: /* @__PURE__ */ new Date(),
          suggestedAction: `Create new skill to handle ${taskType} tasks`
        });
      }
    }
    const errorMessages = /* @__PURE__ */ new Map();
    for (const log of this.logs.filter((l) => l.errorMessage)) {
      const msg = log.errorMessage.slice(0, 50);
      const count = errorMessages.get(msg) || 0;
      errorMessages.set(msg, count + 1);
    }
    for (const [error, count] of errorMessages) {
      if (count >= 3) {
        newPatterns.push({
          id: `error_${this.generateId()}`,
          type: "recurring_error",
          description: `Recurring error: "${error}"`,
          frequency: count,
          lastSeen: /* @__PURE__ */ new Date(),
          suggestedAction: "Investigate and add error handling or prevention"
        });
      }
    }
    const slowTasks = this.logs.filter((l) => l.executionTimeMs > 1e4);
    if (slowTasks.length >= 5) {
      const avgTime = slowTasks.reduce((sum, l) => sum + l.executionTimeMs, 0) / slowTasks.length;
      newPatterns.push({
        id: "slow_tasks",
        type: "optimization",
        description: `${slowTasks.length} tasks took >10s (avg ${Math.round(avgTime / 1e3)}s)`,
        frequency: slowTasks.length,
        lastSeen: /* @__PURE__ */ new Date(),
        suggestedAction: "Consider caching, parallel processing, or simpler approaches"
      });
    }
    this.patterns = newPatterns;
    return newPatterns;
  }
  /**
   * Generate skill suggestions based on patterns
   */
  generateSkillSuggestions() {
    const suggestions = [];
    for (const pattern of this.patterns) {
      if (pattern.type === "skill_gap") {
        suggestions.push({
          id: `suggestion_${this.generateId()}`,
          name: `${pattern.description.split(":")[1]?.trim() || "new"}-specialist`,
          reason: pattern.description,
          triggers: [pattern.description.toLowerCase()],
          confidence: Math.min(pattern.frequency * 0.1, 0.9),
          createdAt: /* @__PURE__ */ new Date()
        });
      }
    }
    this.suggestions = suggestions;
    return suggestions;
  }
  /**
   * Get autonomy stats
   */
  getStats() {
    const total = this.logs.length;
    const successful = this.logs.filter((l) => l.success).length;
    const avgTime = total > 0 ? this.logs.reduce((sum, l) => sum + l.executionTimeMs, 0) / total : 0;
    return {
      totalInteractions: total,
      successRate: total > 0 ? successful / total : 0,
      avgExecutionTime: avgTime,
      patterns: this.patterns.length,
      suggestions: this.suggestions.length
    };
  }
  /**
   * Get recent logs
   */
  getRecentLogs(limit = 10) {
    return this.logs.slice(-limit);
  }
  /**
   * Get patterns
   */
  getPatterns() {
    return this.patterns;
  }
  /**
   * Get suggestions
   */
  getSuggestions() {
    return this.suggestions;
  }
  /**
   * Load logs from disk
   */
  async loadLogs() {
    const logFile = join(this.logPath, "interactions.json");
    if (existsSync(logFile)) {
      try {
        const data = JSON.parse(readFileSync(logFile, "utf-8"));
        this.logs = data.logs || [];
        this.patterns = data.patterns || [];
        console.log(`[AutonomyEngine] Loaded ${this.logs.length} logs`);
      } catch (error) {
        console.warn("[AutonomyEngine] Failed to load logs:", error);
      }
    }
  }
  /**
   * Save logs to disk
   */
  async saveLogs() {
    const logFile = join(this.logPath, "interactions.json");
    const data = {
      version: "1.0.0",
      lastSaved: (/* @__PURE__ */ new Date()).toISOString(),
      logs: this.logs.slice(-this.config.maxLogEntries),
      patterns: this.patterns
    };
    writeFileSync(logFile, JSON.stringify(data, null, 2));
  }
  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
  /**
   * Format stats for display
   */
  formatStats() {
    const stats = this.getStats();
    return `
## Autonomy Engine Stats

- **Level:** ${this.config.level}
- **Total Interactions:** ${stats.totalInteractions}
- **Success Rate:** ${(stats.successRate * 100).toFixed(1)}%
- **Avg Execution Time:** ${Math.round(stats.avgExecutionTime)}ms
- **Detected Patterns:** ${stats.patterns}
- **Skill Suggestions:** ${stats.suggestions}
    `.trim();
  }
};

export { AutonomyEngine, DynamicToolDiscovery, MCPHub, SkillLoader, createDiscovery, getDiscovery, loader_default };
