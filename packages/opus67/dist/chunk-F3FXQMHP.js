import { existsSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, relative } from 'path';
import { createHash } from 'crypto';
import { parse } from 'yaml';
import { EventEmitter } from 'eventemitter3';

// src/context/indexer.ts
var ContextIndexer = class {
  config;
  indexedFiles = /* @__PURE__ */ new Map();
  memories = /* @__PURE__ */ new Map();
  history = [];
  lastIndexed = null;
  // File extensions to index
  indexableExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".rs",
    ".toml",
    ".py",
    ".json",
    ".yaml",
    ".yml",
    ".md",
    ".txt",
    ".sql",
    ".sh",
    ".bash",
    ".css",
    ".scss",
    ".html",
    ".env.example"
  ];
  constructor(config) {
    this.config = config;
  }
  /**
   * Index all files in the project
   */
  async index(projectRoot) {
    console.log(`[ContextIndexer] Indexing: ${projectRoot}`);
    if (!existsSync(this.config.vectorDbPath)) {
      mkdirSync(this.config.vectorDbPath, { recursive: true });
    }
    const startTime = Date.now();
    let filesIndexed = 0;
    let tokensIndexed = 0;
    const files = this.walkDirectory(projectRoot);
    for (const filePath of files) {
      try {
        const indexed = await this.indexFile(filePath, projectRoot);
        if (indexed) {
          this.indexedFiles.set(indexed.relativePath, indexed);
          filesIndexed++;
          tokensIndexed += indexed.tokens;
        }
      } catch (error) {
        console.warn(`[ContextIndexer] Failed to index: ${filePath}`, error);
      }
    }
    this.lastIndexed = /* @__PURE__ */ new Date();
    const elapsed = Date.now() - startTime;
    console.log(`[ContextIndexer] Indexed ${filesIndexed} files (${tokensIndexed} tokens) in ${elapsed}ms`);
    await this.saveIndex();
  }
  /**
   * Walk directory recursively
   */
  walkDirectory(dir) {
    const files = [];
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        if (this.shouldExclude(entry, fullPath)) {
          continue;
        }
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...this.walkDirectory(fullPath));
        } else if (stat.isFile() && this.shouldIndex(entry)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
    }
    return files;
  }
  /**
   * Check if path should be excluded
   */
  shouldExclude(name, fullPath) {
    const alwaysExclude = [
      "node_modules",
      ".git",
      "dist",
      ".next",
      "target",
      "__pycache__",
      ".cache",
      "coverage",
      ".turbo",
      ".vercel"
    ];
    if (alwaysExclude.includes(name)) {
      return true;
    }
    for (const pattern of this.config.excludePatterns) {
      if (fullPath.includes(pattern) || name.includes(pattern)) {
        return true;
      }
    }
    if (name.startsWith(".") && name !== ".env.example") {
      return true;
    }
    return false;
  }
  /**
   * Check if file should be indexed
   */
  shouldIndex(filename) {
    const ext = extname(filename).toLowerCase();
    return this.indexableExtensions.includes(ext);
  }
  /**
   * Index a single file
   */
  async indexFile(filePath, projectRoot) {
    const stat = statSync(filePath);
    if (stat.size > 100 * 1024) {
      return null;
    }
    const content = readFileSync(filePath, "utf-8");
    const relativePath = relative(projectRoot, filePath);
    const hash = createHash("md5").update(content).digest("hex");
    const tokens = this.estimateTokens(content);
    return {
      path: filePath,
      relativePath,
      content,
      hash,
      tokens,
      lastModified: stat.mtime,
      extension: extname(filePath)
    };
  }
  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }
  /**
   * Retrieve relevant context for a query
   */
  async retrieve(query, maxTokens) {
    const budget = maxTokens || this.config.maxTokens;
    const results = {
      files: [],
      memories: [],
      history: [],
      tokens: 0
    };
    const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const scored = [];
    for (const [_, file] of this.indexedFiles) {
      let score = 0;
      const lowerContent = file.content.toLowerCase();
      const lowerPath = file.relativePath.toLowerCase();
      for (const word of queryWords) {
        if (lowerPath.includes(word)) {
          score += 10;
        }
        const matches = (lowerContent.match(new RegExp(word, "g")) || []).length;
        score += Math.min(matches, 5);
      }
      if ([".ts", ".tsx", ".rs"].includes(file.extension)) {
        score *= 1.5;
      }
      if (score > 0) {
        scored.push({ file, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    for (const { file, score } of scored) {
      if (results.tokens + file.tokens > budget) {
        break;
      }
      results.files.push({
        path: file.relativePath,
        content: file.content,
        relevance: score
      });
      results.tokens += file.tokens;
    }
    for (const [key, value] of this.memories) {
      const lowerKey = key.toLowerCase();
      if (queryWords.some((w) => lowerKey.includes(w))) {
        results.memories.push({ key, value });
      }
    }
    results.history = this.history.slice(-10);
    return results;
  }
  /**
   * Add a memory
   */
  remember(key, value) {
    this.memories.set(key, value);
  }
  /**
   * Recall a memory
   */
  recall(key) {
    return this.memories.get(key);
  }
  /**
   * Add to conversation history
   */
  addToHistory(role, content) {
    this.history.push({ role, content });
    if (this.history.length > 50) {
      this.history = this.history.slice(-50);
    }
  }
  /**
   * Save index to disk
   */
  async saveIndex() {
    const indexPath = join(this.config.vectorDbPath, "index.json");
    const data = {
      version: "1.0.0",
      indexed: this.lastIndexed?.toISOString(),
      files: Array.from(this.indexedFiles.entries()).map(([path, file]) => ({
        path,
        hash: file.hash,
        tokens: file.tokens,
        lastModified: file.lastModified.toISOString()
      })),
      totalTokens: this.getStats().totalTokens
    };
    writeFileSync(indexPath, JSON.stringify(data, null, 2));
  }
  /**
   * Get indexer stats
   */
  getStats() {
    let totalTokens = 0;
    for (const file of this.indexedFiles.values()) {
      totalTokens += file.tokens;
    }
    return {
      totalFiles: this.indexedFiles.size,
      totalTokens,
      lastIndexed: this.lastIndexed,
      indexPath: this.config.vectorDbPath
    };
  }
  /**
   * Format context for prompt injection
   */
  formatForPrompt(context) {
    const sections = [];
    if (context.files.length > 0) {
      sections.push("## Relevant Files\n");
      for (const file of context.files) {
        sections.push(`### ${file.path}`);
        sections.push("```" + this.getLanguage(file.path));
        sections.push(file.content);
        sections.push("```\n");
      }
    }
    if (context.memories.length > 0) {
      sections.push("## Memories\n");
      for (const mem of context.memories) {
        sections.push(`- **${mem.key}**: ${mem.value}`);
      }
      sections.push("");
    }
    if (context.history.length > 0) {
      sections.push("## Recent History\n");
      for (const msg of context.history) {
        sections.push(`**${msg.role}**: ${msg.content.slice(0, 100)}...`);
      }
    }
    return sections.join("\n");
  }
  /**
   * Get language identifier for code blocks
   */
  getLanguage(path) {
    const ext = extname(path).toLowerCase();
    const langMap = {
      ".ts": "typescript",
      ".tsx": "tsx",
      ".js": "javascript",
      ".jsx": "jsx",
      ".rs": "rust",
      ".py": "python",
      ".sql": "sql",
      ".json": "json",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".md": "markdown",
      ".sh": "bash",
      ".css": "css",
      ".scss": "scss",
      ".html": "html"
    };
    return langMap[ext] || "";
  }
  /**
   * Clear the index
   */
  clear() {
    this.indexedFiles.clear();
    this.memories.clear();
    this.history = [];
    this.lastIndexed = null;
  }
};
var SkillLoader = class {
  registryPath;
  registry = null;
  loadedSkills = /* @__PURE__ */ new Map();
  knowledgePath;
  constructor(registryPath) {
    this.registryPath = registryPath;
    this.knowledgePath = join(registryPath, "..", "definitions");
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
  async loadForTask(skillIds) {
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
      const loadedSkill = await this.loadSkill(skillId);
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
  async loadSkill(skillId) {
    if (this.loadedSkills.has(skillId)) {
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
    return loaded;
  }
  /**
   * Load a bundle of skills
   */
  async loadBundle(bundleName) {
    if (!this.registry?.bundles?.[bundleName]) {
      throw new Error(`Bundle not found: ${bundleName}`);
    }
    const skillIds = this.registry.bundles[bundleName];
    return this.loadForTask(skillIds);
  }
  /**
   * Find skill definition by ID
   */
  findSkill(skillId) {
    return this.registry?.skills.find((s) => s.id === skillId);
  }
  /**
   * Detect skills needed based on input
   */
  detectSkills(input, filePaths) {
    if (!this.registry) return [];
    const detected = /* @__PURE__ */ new Set();
    const lowerInput = input.toLowerCase();
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
    const sorted = Array.from(detected).sort((a, b) => {
      const skillA = this.findSkill(a);
      const skillB = this.findSkill(b);
      return (skillA?.priority || 99) - (skillB?.priority || 99);
    });
    const maxSkills = this.registry.loading?.max_concurrent_skills || 5;
    return sorted.slice(0, maxSkills);
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
var MCPHub = class extends EventEmitter {
  configPath;
  config = null;
  connected = /* @__PURE__ */ new Map();
  clients = /* @__PURE__ */ new Map();
  constructor(configPath) {
    super();
    this.configPath = configPath;
  }
  /**
   * Load MCP configuration from YAML
   */
  async loadConfig() {
    const content = readFileSync(this.configPath, "utf-8");
    this.config = parse(content);
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

export { AutonomyEngine, ContextIndexer, MCPHub, SkillLoader, loader_default };
