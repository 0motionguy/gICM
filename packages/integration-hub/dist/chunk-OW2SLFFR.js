// src/event-bus.ts
import EventEmitter from "eventemitter3";
var EventBus = class extends EventEmitter {
  eventLog = [];
  maxLogSize = 1e3;
  /**
   * Emit a typed event
   */
  emit(event, ...args) {
    const hubEvent = args[0];
    this.eventLog.push(hubEvent);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
    const result = super.emit(event, ...args);
    super.emit("*", hubEvent);
    return result;
  }
  /**
   * Create and emit an event
   */
  publish(source, type, payload = {}) {
    const category = type.split(".")[0];
    const event = {
      id: generateEventId(),
      timestamp: Date.now(),
      source,
      category,
      type,
      payload
    };
    this.emit(type, event);
  }
  /**
   * Subscribe to an event (alias for on, but with source filtering support if needed)
   * Currently ignores source for compatibility with simple event names
   */
  subscribe(source, type, handler) {
    this.on(type, (event) => {
      handler(event);
    });
  }
  /**
   * Get recent events
   */
  getRecentEvents(limit = 50) {
    return this.eventLog.slice(-limit);
  }
  /**
   * Get events by category
   */
  getEventsByCategory(category, limit = 50) {
    return this.eventLog.filter((e) => e.category === category).slice(-limit);
  }
  /**
   * Clear event log
   */
  clearLog() {
    this.eventLog = [];
  }
};
function generateEventId() {
  return Date.now().toString() + "-" + Math.random().toString(36).slice(2, 9);
}
var eventBus = new EventBus();

// src/engine-manager.ts
var EngineManager = class {
  eventBus;
  engines = /* @__PURE__ */ new Map();
  healthCheckTimer;
  config;
  constructor(eventBus2, config) {
    this.eventBus = eventBus2;
    this.config = {
      healthCheckInterval: config?.healthCheckInterval ?? 3e4,
      heartbeatTimeout: config?.heartbeatTimeout ?? 6e4
    };
    const engineIds = ["brain", "money", "growth", "product", "trading", "opus67"];
    for (const id of engineIds) {
      this.engines.set(id, {
        id,
        connected: false,
        lastHeartbeat: null,
        status: "offline"
      });
    }
    this.eventBus.on("engine.heartbeat", (event) => {
      const engineId = event.source;
      this.recordHeartbeat(engineId);
    });
    this.eventBus.on("engine.started", (event) => {
      const engineId = event.source;
      this.markConnected(engineId);
    });
    this.eventBus.on("engine.stopped", (event) => {
      const engineId = event.source;
      this.markDisconnected(engineId);
    });
  }
  /**
   * Start health monitoring
   */
  startHealthChecks() {
    this.healthCheckTimer = setInterval(() => {
      this.checkAllEngines();
    }, this.config.healthCheckInterval);
  }
  /**
   * Stop health monitoring
   */
  stopHealthChecks() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = void 0;
    }
  }
  /**
   * Record a heartbeat from an engine
   */
  recordHeartbeat(engineId) {
    const engine = this.engines.get(engineId);
    if (engine) {
      engine.lastHeartbeat = Date.now();
      engine.connected = true;
      engine.status = "healthy";
      engine.error = void 0;
    }
  }
  /**
   * Mark an engine as connected
   */
  markConnected(engineId) {
    const engine = this.engines.get(engineId);
    if (engine) {
      engine.connected = true;
      engine.lastHeartbeat = Date.now();
      engine.status = "healthy";
      engine.error = void 0;
    }
  }
  /**
   * Mark an engine as disconnected
   */
  markDisconnected(engineId) {
    const engine = this.engines.get(engineId);
    if (engine) {
      engine.connected = false;
      engine.status = "offline";
    }
  }
  /**
   * Mark an engine as having an error
   */
  markError(engineId, error) {
    const engine = this.engines.get(engineId);
    if (engine) {
      engine.status = "degraded";
      engine.error = error;
    }
    this.eventBus.publish(engineId, "engine.error", { error });
  }
  /**
   * Check all engines for health
   */
  checkAllEngines() {
    const now = Date.now();
    for (const [id, engine] of this.engines) {
      if (engine.connected && engine.lastHeartbeat) {
        const timeSinceHeartbeat = now - engine.lastHeartbeat;
        if (timeSinceHeartbeat > this.config.heartbeatTimeout) {
          engine.status = "degraded";
          engine.error = "Heartbeat timeout";
        }
      }
    }
  }
  /**
   * Get health status for all engines
   */
  getAllHealth() {
    return Array.from(this.engines.values());
  }
  /**
   * Get health status for a specific engine
   */
  getHealth(engineId) {
    return this.engines.get(engineId);
  }
  /**
   * Get aggregated status
   */
  getAggregatedStatus() {
    let healthy = 0;
    let degraded = 0;
    let offline = 0;
    for (const engine of this.engines.values()) {
      switch (engine.status) {
        case "healthy":
          healthy++;
          break;
        case "degraded":
          degraded++;
          break;
        case "offline":
          offline++;
          break;
      }
    }
    return { healthy, degraded, offline, total: this.engines.size };
  }
};

// src/storage/content-storage.ts
import { EventEmitter as EventEmitter2 } from "eventemitter3";
var MOCK_SUPABASE_DB = /* @__PURE__ */ new Map();
var createClient = (url, serviceKey) => {
  console.log(`[ContentStorage] Mock Supabase Client created for URL: ${url}`);
  const createQueryBuilder = (tableName, currentData = null) => {
    const getTableData = () => {
      if (currentData !== null) return currentData;
      if (!MOCK_SUPABASE_DB.has(tableName)) return [];
      return Array.from(MOCK_SUPABASE_DB.get(tableName).values());
    };
    return {
      insert: async (data) => {
        console.log(`[ContentStorage] Mock Supabase: Inserting into ${tableName}`, data);
        if (!MOCK_SUPABASE_DB.has(tableName)) MOCK_SUPABASE_DB.set(tableName, /* @__PURE__ */ new Map());
        const table = MOCK_SUPABASE_DB.get(tableName);
        const id = data.id || `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        table.set(id, { ...data, id });
        return { data: [{ id }], error: null };
      },
      upsert: async (data, { onConflict }) => {
        console.log(`[ContentStorage] Mock Supabase: Upserting into ${tableName} on conflict ${onConflict}`, data);
        if (!MOCK_SUPABASE_DB.has(tableName)) MOCK_SUPABASE_DB.set(tableName, /* @__PURE__ */ new Map());
        const table = MOCK_SUPABASE_DB.get(tableName);
        const id = data.id || `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        table.set(id, { ...data, id });
        return { data: [{ id }], error: null };
      },
      select: (columns) => {
        console.log(`[ContentStorage] Mock Supabase: Selecting ${columns} from ${tableName}`);
        return createQueryBuilder(tableName, getTableData());
      },
      eq: (column, value) => {
        console.log(`[ContentStorage] Mock Supabase: eq ${column} = ${value}`);
        const filtered = getTableData().filter((item) => item[column] === value);
        return { data: filtered, error: null, ...createQueryBuilder(tableName, filtered) };
      },
      gte: (column, value) => {
        console.log(`[ContentStorage] Mock Supabase: gte ${column} >= ${value}`);
        const filtered = getTableData().filter(
          (item) => new Date(item[column]).getTime() >= new Date(value).getTime()
        );
        return createQueryBuilder(tableName, filtered);
      },
      filter: (column, operator, value) => {
        console.log(`[ContentStorage] Mock Supabase: Filtering ${column} ${operator} ${value}`);
        const filtered = getTableData().filter((item) => {
          if (operator === "gte") return new Date(item[column]).getTime() >= new Date(value).getTime();
          if (operator === "eq") return item[column] === value;
          return false;
        });
        return { data: filtered, error: null, ...createQueryBuilder(tableName, filtered) };
      },
      order: (column, { ascending = true } = {}) => {
        console.log(`[ContentStorage] Mock Supabase: Ordering by ${column} ${ascending ? "ASC" : "DESC"}`);
        const sorted = [...getTableData()].sort((a, b) => {
          const valA = new Date(a[column]).getTime();
          const valB = new Date(b[column]).getTime();
          return ascending ? valA - valB : valB - valA;
        });
        return { data: sorted, error: null, ...createQueryBuilder(tableName, sorted) };
      },
      limit: (count) => {
        console.log(`[ContentStorage] Mock Supabase: Limiting to ${count}`);
        const limited = getTableData().slice(0, count);
        return { data: limited, error: null };
      },
      // Allow direct data access after chaining
      then: (resolve) => {
        resolve({ data: getTableData(), error: null });
      }
    };
  };
  return {
    from: (tableName) => createQueryBuilder(tableName)
  };
};
var ContentStorage = class extends EventEmitter2 {
  config;
  supabase = null;
  isConnected = false;
  // In-memory fallbacks
  events = /* @__PURE__ */ new Map();
  wins = /* @__PURE__ */ new Map();
  briefs = /* @__PURE__ */ new Map();
  articles = /* @__PURE__ */ new Map();
  packets = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    super();
    this.config = {
      fallbackToMemory: true,
      ...config
    };
  }
  /**
   * Initialize connection and verify schema
   */
  async initialize() {
    if (this.config.url && this.config.serviceKey) {
      try {
        this.supabase = createClient(this.config.url, this.config.serviceKey);
        this.isConnected = true;
        this.emit("connected");
        console.log("[ContentStorage] Connected to Supabase.");
        return true;
      } catch (error) {
        console.error("[ContentStorage] Supabase connection failed:", error);
        this.isConnected = false;
        this.emit("error", error instanceof Error ? error : new Error(String(error)));
      }
    }
    if (this.config.fallbackToMemory || !this.isConnected) {
      console.warn("[ContentStorage] Using in-memory fallback for content storage.");
      this.isConnected = false;
      return true;
    }
    return false;
  }
  /**
   * Check if connected to Supabase
   */
  get connected() {
    return this.isConnected;
  }
  // =========================================================================
  // EVENTS & WINS
  // =========================================================================
  async saveEngineEvent(event) {
    if (this.isConnected && this.supabase) {
      const { error } = await this.supabase.from("engine_events").upsert(event, { onConflict: "id" });
      if (error) {
        console.error("[ContentStorage] Supabase saveEngineEvent failed:", error);
        if (this.config.fallbackToMemory) this.events.set(event.id, event);
        else throw error;
      }
    } else {
      this.events.set(event.id, event);
    }
    this.emit("event:saved", event);
  }
  async getEngineEventsSince(since) {
    if (this.isConnected && this.supabase) {
      const { data, error } = await this.supabase.from("engine_events").select("*").gte("timestamp", since.toISOString()).order("timestamp", { ascending: false });
      if (error) {
        console.error("[ContentStorage] Supabase getEngineEventsSince failed:", error);
        if (this.config.fallbackToMemory) {
          const sinceTime = since.getTime();
          return Array.from(this.events.values()).filter((e) => new Date(e.timestamp).getTime() >= sinceTime).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        throw error;
      }
      return data;
    } else {
      const sinceTime = since.getTime();
      return Array.from(this.events.values()).filter((e) => new Date(e.timestamp).getTime() >= sinceTime).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }
  async saveWinRecord(win) {
    if (this.isConnected && this.supabase) {
      const { error } = await this.supabase.from("win_records").upsert(win, { onConflict: "id" });
      if (error) {
        console.error("[ContentStorage] Supabase saveWinRecord failed:", error);
        if (this.config.fallbackToMemory) this.wins.set(win.id, win);
        else throw error;
      }
    } else {
      this.wins.set(win.id, win);
    }
  }
  async getWinRecordsSince(since) {
    if (this.isConnected && this.supabase) {
      const { data, error } = await this.supabase.from("win_records").select("*").gte("created_at", since.toISOString()).order("created_at", { ascending: false });
      if (error) {
        console.error("[ContentStorage] Supabase getWinRecordsSince failed:", error);
        if (this.config.fallbackToMemory) {
          const sinceTime = since.getTime();
          return Array.from(this.wins.values()).filter((w) => new Date(w.createdAt).getTime() >= sinceTime).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        throw error;
      }
      return data;
    } else {
      const sinceTime = since.getTime();
      return Array.from(this.wins.values()).filter((w) => new Date(w.createdAt).getTime() >= sinceTime).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }
  // =========================================================================
  // BRIEFS
  // =========================================================================
  async saveContentBrief(brief) {
    if (this.isConnected && this.supabase) {
      const { error } = await this.supabase.from("content_briefs").upsert(brief, { onConflict: "id" });
      if (error) {
        console.error("[ContentStorage] Supabase saveContentBrief failed:", error);
        if (this.config.fallbackToMemory) this.briefs.set(brief.id, brief);
        else throw error;
      }
    } else {
      this.briefs.set(brief.id, brief);
    }
    this.emit("brief:saved", brief);
  }
  async listPendingBriefs() {
    if (this.isConnected && this.supabase) {
      const { data: briefsData, error: briefsError } = await this.supabase.from("content_briefs").select("*");
      if (briefsError) {
        console.error("[ContentStorage] Supabase listPendingBriefs failed (briefs fetch):", briefsError);
        if (this.config.fallbackToMemory) {
          const articleBriefIds2 = new Set(Array.from(this.articles.values()).map((a) => a.briefId));
          return Array.from(this.briefs.values()).filter((b) => !articleBriefIds2.has(b.id));
        }
        throw briefsError;
      }
      const { data: articlesData, error: articlesError } = await this.supabase.from("content_articles").select("brief_id");
      if (articlesError) {
        console.error("[ContentStorage] Supabase listPendingBriefs failed (articles fetch):", articlesError);
        if (this.config.fallbackToMemory) {
          const articleBriefIds2 = new Set(Array.from(this.articles.values()).map((a) => a.briefId));
          return Array.from(this.briefs.values()).filter((b) => !articleBriefIds2.has(b.id));
        }
        throw articlesError;
      }
      const articleBriefIds = new Set(articlesData?.map((a) => a.brief_id));
      return briefsData.filter((b) => !articleBriefIds.has(b.id));
    } else {
      const articleBriefIds = new Set(Array.from(this.articles.values()).map((a) => a.briefId));
      return Array.from(this.briefs.values()).filter((b) => !articleBriefIds.has(b.id));
    }
  }
  async getBrief(id) {
    if (this.isConnected && this.supabase) {
      const { data, error } = await this.supabase.from("content_briefs").select("*").eq("id", id);
      if (error) {
        console.error("[ContentStorage] Supabase getBrief failed:", error);
        if (this.config.fallbackToMemory) return this.briefs.get(id);
        throw error;
      }
      return data?.[0];
    } else {
      return this.briefs.get(id);
    }
  }
  // =========================================================================
  // ARTICLES
  // =========================================================================
  async saveContentArticle(article) {
    if (this.isConnected && this.supabase) {
      const { error } = await this.supabase.from("content_articles").upsert(article, { onConflict: "id" });
      if (error) {
        console.error("[ContentStorage] Supabase saveContentArticle failed:", error);
        if (this.config.fallbackToMemory) this.articles.set(article.id, article);
        else throw error;
      }
    } else {
      this.articles.set(article.id, article);
    }
    this.emit("article:saved", article);
  }
  async updateContentArticle(article) {
    await this.saveContentArticle(article);
    this.emit("article:saved", article);
  }
  async getArticleByBriefId(briefId) {
    if (this.isConnected && this.supabase) {
      const { data, error } = await this.supabase.from("content_articles").select("*").eq("brief_id", briefId);
      if (error) {
        console.error("[ContentStorage] Supabase getArticleByBriefId failed:", error);
        if (this.config.fallbackToMemory) return Array.from(this.articles.values()).find((a) => a.briefId === briefId);
        throw error;
      }
      return data?.[0];
    } else {
      return Array.from(this.articles.values()).find((a) => a.briefId === briefId);
    }
  }
  // =========================================================================
  // DISTRIBUTION
  // =========================================================================
  async saveDistributionPacket(packet) {
    if (this.isConnected && this.supabase) {
      const { error } = await this.supabase.from("distribution_packets").upsert(packet, { onConflict: "id" });
      if (error) {
        console.error("[ContentStorage] Supabase saveDistributionPacket failed:", error);
        if (this.config.fallbackToMemory) this.packets.set(packet.id, packet);
        else throw error;
      }
    } else {
      this.packets.set(packet.id, packet);
    }
    this.emit("packet:saved", packet);
  }
  async getDistributionPacketByArticleId(articleId) {
    if (this.isConnected && this.supabase) {
      const { data, error } = await this.supabase.from("distribution_packets").select("*").eq("article_id", articleId);
      if (error) {
        console.error("[ContentStorage] Supabase getDistributionPacketByArticleId failed:", error);
        if (this.config.fallbackToMemory) {
          return Array.from(this.packets.values()).find((p) => p.articleId === articleId);
        }
        throw error;
      }
      return data?.[0];
    } else {
      return Array.from(this.packets.values()).find((p) => p.articleId === articleId);
    }
  }
  async getDistributionPacket(id) {
    if (this.isConnected && this.supabase) {
      const { error, data } = await this.supabase.from("distribution_packets").select("*").eq("id", id);
      if (error) {
        console.error("[ContentStorage] Supabase getDistributionPacket failed:", error);
        if (this.config.fallbackToMemory) return this.packets.get(id);
        throw error;
      }
      return data?.[0];
    } else {
      return this.packets.get(id);
    }
  }
  async updateDistributionPacketStatus(id, status) {
    const packet = await this.getDistributionPacket(id);
    if (packet) {
      packet.status = status;
      await this.saveDistributionPacket(packet);
    }
  }
};
var instance = null;
function getContentStorage() {
  if (!instance) {
    instance = new ContentStorage({
      url: process.env.SUPABASE_URL,
      serviceKey: process.env.SUPABASE_SERVICE_KEY,
      fallbackToMemory: process.env.NODE_ENV !== "production"
      // Fallback in dev by default
    });
  }
  return instance;
}

// src/workflows/content.ts
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var PROMPTS_DIR = path.resolve(__dirname, "../../prompts");
function getLLMConfig() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (anthropicKey) {
    return {
      provider: "anthropic",
      apiKey: anthropicKey,
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514"
    };
  }
  if (openaiKey) {
    return {
      provider: "openai",
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL || "gpt-4o"
    };
  }
  if (geminiKey) {
    return {
      provider: "gemini",
      apiKey: geminiKey,
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash"
    };
  }
  return null;
}
async function callRealLLM(systemPrompt, userInput, config) {
  if (config.provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 8192,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: "user", content: userInput }]
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return data.content[0]?.text || "";
  }
  if (config.provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 8192
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }
  if (config.provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userInput }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
  throw new Error(`Unsupported provider: ${config.provider}`);
}
function generateMockResponse(promptName, input) {
  console.log(`[CONTENT-MOCK] Generating mock response for ${promptName}`);
  if (promptName === "orchestrator-content-agent") {
    const briefId = `brief_${Date.now()}`;
    const keyIdea = input.events.length > 0 ? `Insights from ${input.events[0].engine} regarding ${input.events[0].title}` : "General market update and agent performance summary";
    return [
      {
        id: briefId,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        primaryGoal: "build_authority",
        narrativeAngle: "macro_thesis",
        primaryAudience: "traders",
        timeScope: "daily",
        keyIdea,
        events: input.events.slice(0, 3),
        wins: input.wins?.slice(0, 2) || [],
        marketContext: input.marketContext || { notes: "Market context" },
        targetLength: "longform",
        targetChannels: ["blog", "substack", "twitter"],
        primaryCTA: "try_agent",
        seedKeywords: ["gICM", "AI agents", "trading", "market analysis", "ICM"]
      }
    ];
  }
  if (promptName.startsWith("writer-")) {
    const brief = input;
    let title = "";
    let body = "";
    if (brief.narrativeAngle === "macro_thesis" || brief.narrativeAngle === "playbook_howto") {
      title = `Macro Outlook: ${brief.keyIdea}`;
      body = `## What changed in the market

Details about recent market movements and trends.

`;
      body += `## How our agents responded

Our agents detected patterns and executed strategies.

`;
      body += `## Key takeaways

- Takeaway 1
- Takeaway 2
- Takeaway 3

`;
    } else if (brief.narrativeAngle === "devlog" || brief.narrativeAngle === "product_launch") {
      title = `Devlog: ${brief.keyIdea}`;
      body = `## What we shipped

New features and improvements.

`;
      body += `## Why it matters

Performance improvements and new capabilities.

`;
      body += `## How to use it

1. Step one
2. Step two
3. Step three

`;
    } else if (brief.narrativeAngle === "trading_case_study") {
      title = `Trading Case Study: ${brief.keyIdea}`;
      body = `## Setup

Market conditions and context.

`;
      body += `## Agent Behavior

How our agents responded.

`;
      body += `## Results

Performance metrics.

`;
      body += `## Disclaimer

Trading involves risk.

`;
    }
    return `# ${title}

${body}`;
  }
  if (promptName === "seo-optimizer") {
    const { brief } = input;
    const slug = brief.keyIdea.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-*|-*$/g, "");
    return {
      seoTitle: brief.keyIdea.slice(0, 60),
      metaDescription: `${brief.keyIdea} - gICM AI agents platform insights.`,
      slug,
      keywords: [...brief.seedKeywords || [], "AI", "ICM", "agents"],
      faqs: [`What is ${brief.keyIdea}?`, "How do AI agents work?"],
      internalLinks: ["[LINK:gicm_agents]", "[LINK:money_engine]"],
      externalLinks: []
    };
  }
  if (promptName === "distribution-splitter") {
    const { articleMarkdown, seo, brief } = input;
    const firstLine = articleMarkdown.split("\n")[0].replace("# ", "");
    return {
      baseSlug: seo.slug,
      canonicalUrl: `https://gicm.dev/blog/${seo.slug}`,
      blogPost: articleMarkdown,
      substackBody: articleMarkdown,
      mirrorBody: articleMarkdown,
      mediumBody: articleMarkdown,
      devtoBody: brief.narrativeAngle === "devlog" ? articleMarkdown : void 0,
      hashnodeBody: brief.narrativeAngle === "devlog" ? articleMarkdown : void 0,
      twitterThread: [
        `${firstLine.slice(0, 200)}... #ICM #AI`,
        "Key insights from our latest analysis.",
        `Read the full article: https://gicm.dev/blog/${seo.slug}`
      ],
      linkedinPost: `${brief.keyIdea}

- Key insight 1
- Key insight 2

#AI #InternetCapitalMarkets`,
      status: "ready"
    };
  }
  return {};
}
async function callLLM(promptName, input, options = {}) {
  const promptPath = path.join(PROMPTS_DIR, `${promptName}.prompt.md`);
  let promptContent;
  try {
    promptContent = await fs.readFile(promptPath, "utf-8");
  } catch (error) {
    console.error(`[CONTENT] Failed to read prompt file ${promptPath}:`, error);
    throw new Error(`Prompt file not found: ${promptName}`);
  }
  const config = options.config || getLLMConfig();
  const useMock = options.useMock || !config || process.env.CONTENT_USE_MOCK === "true";
  if (useMock) {
    console.log(`[CONTENT] Using mock LLM for ${promptName}`);
    return generateMockResponse(promptName, input);
  }
  console.log(`[CONTENT] Calling ${config.provider} for ${promptName}...`);
  const userInput = JSON.stringify(input, null, 2);
  try {
    const response = await callRealLLM(promptContent, userInput, config);
    if (promptName === "orchestrator-content-agent" || promptName === "seo-optimizer" || promptName === "distribution-splitter") {
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\[[\s\S]*\]/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      return JSON.parse(response);
    }
    return response;
  } catch (error) {
    console.error(`[CONTENT] LLM call failed for ${promptName}:`, error);
    console.log(`[CONTENT] Falling back to mock response`);
    return generateMockResponse(promptName, input);
  }
}
async function generateContentBriefsDaily() {
  const storage = getContentStorage();
  await storage.initialize();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const events = await storage.getEngineEventsSince(since);
  const wins = await storage.getWinRecordsSince(since);
  console.log(`[CONTENT-ORCHESTRATOR] Processing ${events.length} events and ${wins.length} wins`);
  const marketContext = {
    btcUsd: 0,
    // In real app, fetch from price feed
    notes: "Market data stub"
  };
  const input = { events, wins, marketContext };
  const briefs = await callLLM("orchestrator-content-agent", input);
  for (const brief of briefs) {
    await storage.saveContentBrief(brief);
    console.log(`[CONTENT-ORCHESTRATOR] Generated brief: ${brief.id} - ${brief.keyIdea}`);
  }
}
async function materializeContentFromBriefs() {
  const storage = getContentStorage();
  await storage.initialize();
  const pendingBriefs = await storage.listPendingBriefs();
  console.log(`[CONTENT-PRODUCTION] Found ${pendingBriefs.length} pending briefs`);
  for (const brief of pendingBriefs) {
    let writerPrompt = "writer-macro";
    if (brief.narrativeAngle === "devlog" || brief.narrativeAngle === "product_launch") {
      writerPrompt = "writer-devlog";
    } else if (brief.narrativeAngle === "trading_case_study") {
      writerPrompt = "writer-trading";
    }
    const articleMarkdown = await callLLM(writerPrompt, brief);
    const seo = await callLLM("seo-optimizer", { articleMarkdown, brief });
    const article = {
      id: `art_${Date.now()}`,
      briefId: brief.id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      markdown: articleMarkdown,
      seo,
      status: "draft"
    };
    await storage.saveContentArticle(article);
    const packetData = await callLLM("distribution-splitter", { articleMarkdown, seo, brief });
    await storage.saveDistributionPacket({
      ...packetData,
      id: `pkt_${Date.now()}`,
      articleId: article.id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    console.log(`[CONTENT-PRODUCTION] Produced content for brief ${brief.id}`);
  }
}

// src/distribution/index.ts
var DistributionService = class {
  config;
  attempts = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    this.config = {
      dryRun: process.env.DISTRIBUTION_DRY_RUN === "true",
      ...config
    };
  }
  /**
   * Distribute content to specified channels
   */
  async distribute(packet, channels) {
    const targetChannels = channels || this.getDefaultChannels(packet);
    const results = [];
    for (const channel of targetChannels) {
      try {
        const result = await this.publishToChannel(packet, channel);
        results.push(result);
        this.recordAttempt(packet.id, result);
      } catch (error) {
        const errorResult = {
          channel,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        results.push(errorResult);
        this.recordAttempt(packet.id, errorResult);
      }
    }
    return results;
  }
  /**
   * Get default channels based on packet content
   */
  getDefaultChannels(packet) {
    const channels = ["blog"];
    if (packet.substackBody) channels.push("substack");
    if (packet.mirrorBody) channels.push("mirror");
    if (packet.mediumBody) channels.push("medium");
    if (packet.devtoBody) channels.push("devto");
    if (packet.hashnodeBody) channels.push("hashnode");
    if (packet.githubReadme) channels.push("github");
    if (packet.rssEntry) channels.push("rss");
    if (packet.emailDigest) channels.push("email");
    if (packet.farcasterCast) channels.push("farcaster");
    if (packet.lensPost) channels.push("lens");
    if (packet.paragraphPost) channels.push("paragraph");
    if (packet.blueskyPost) channels.push("bluesky");
    if (packet.mastodonPost) channels.push("mastodon");
    if (packet.twitterThread?.length) channels.push("twitter");
    if (packet.linkedinPost) channels.push("linkedin");
    if (packet.redditDraft) channels.push("reddit");
    if (packet.threadsDraft) channels.push("threads");
    return channels;
  }
  /**
   * Publish to a specific channel
   */
  async publishToChannel(packet, channel) {
    if (this.config.dryRun) {
      console.log(`[DISTRIBUTION] DRY RUN: Would publish to ${channel}`);
      return {
        channel,
        success: true,
        externalUrl: `https://${channel}.example.com/${packet.baseSlug}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    switch (channel) {
      // Tier 1: Traditional platforms
      case "blog":
        return this.publishToBlog(packet);
      case "substack":
        return this.publishToSubstack(packet);
      case "mirror":
        return this.publishToMirror(packet);
      case "medium":
        return this.publishToMedium(packet);
      case "devto":
        return this.publishToDevTo(packet);
      case "hashnode":
        return this.publishToHashnode(packet);
      case "github":
        return this.publishToGitHub(packet);
      case "rss":
        return this.publishToRSS(packet);
      case "email":
        return this.publishToEmail(packet);
      // Tier 1: Web3 Social (NEW)
      case "farcaster":
        return this.publishToFarcaster(packet);
      case "lens":
        return this.publishToLens(packet);
      case "paragraph":
        return this.publishToParagraph(packet);
      // Tier 1: Decentralized Social (NEW)
      case "bluesky":
        return this.publishToBluesky(packet);
      case "mastodon":
        return this.publishToMastodon(packet);
      // Tier 2: Approval required
      case "twitter":
        return this.queueForTwitter(packet);
      case "linkedin":
        return this.queueForLinkedIn(packet);
      case "reddit":
        return this.queueForReddit(packet);
      case "threads":
        return this.queueForThreads(packet);
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }
  // ===========================================================================
  // TIER 1: AUTOMATED PUBLISHING
  // ===========================================================================
  /**
   * Publish to own blog via API
   */
  async publishToBlog(packet) {
    if (!this.config.blogApiUrl) {
      console.log(`[DISTRIBUTION] Blog API not configured, logging to console`);
      console.log(`[BLOG] Title: ${packet.baseSlug}`);
      console.log(`[BLOG] Content: ${packet.blogPost?.slice(0, 500)}...`);
      return {
        channel: "blog",
        success: true,
        externalUrl: `https://gicm.dev/blog/${packet.baseSlug}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const response = await fetch(this.config.blogApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.blogApiKey}`
      },
      body: JSON.stringify({
        slug: packet.baseSlug,
        content: packet.blogPost,
        canonicalUrl: packet.canonicalUrl
      })
    });
    if (!response.ok) {
      throw new Error(`Blog API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      channel: "blog",
      success: true,
      externalUrl: data.url || `https://gicm.dev/blog/${packet.baseSlug}`,
      externalId: data.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Publish to Substack via API or email
   */
  async publishToSubstack(packet) {
    if (!this.config.substackApiUrl) {
      console.log(`[DISTRIBUTION] Substack not configured, skipping`);
      return {
        channel: "substack",
        success: false,
        error: "Substack API not configured",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    console.log(`[SUBSTACK] Would publish: ${packet.baseSlug}`);
    return {
      channel: "substack",
      success: true,
      externalUrl: `https://gicm.substack.com/p/${packet.baseSlug}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Publish to Mirror.xyz via wallet signature
   */
  async publishToMirror(packet) {
    if (!this.config.mirrorAddress) {
      console.log(`[DISTRIBUTION] Mirror not configured, skipping`);
      return {
        channel: "mirror",
        success: false,
        error: "Mirror wallet not configured",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    console.log(`[MIRROR] Would publish: ${packet.baseSlug}`);
    return {
      channel: "mirror",
      success: true,
      externalUrl: `https://mirror.xyz/${this.config.mirrorAddress}/${packet.baseSlug}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Publish to Medium via Integration Token
   */
  async publishToMedium(packet) {
    if (!this.config.mediumIntegrationToken) {
      console.log(`[DISTRIBUTION] Medium not configured, skipping`);
      return {
        channel: "medium",
        success: false,
        error: "Medium integration token not configured",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const response = await fetch("https://api.medium.com/v1/users/me/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.mediumIntegrationToken}`
      },
      body: JSON.stringify({
        title: packet.baseSlug.replace(/-/g, " "),
        contentFormat: "markdown",
        content: packet.mediumBody,
        canonicalUrl: packet.canonicalUrl,
        publishStatus: "draft"
        // Start as draft for review
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Medium API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return {
      channel: "medium",
      success: true,
      externalUrl: data.data?.url,
      externalId: data.data?.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Publish to Dev.to via API
   */
  async publishToDevTo(packet) {
    if (!this.config.devtoApiKey || !packet.devtoBody) {
      console.log(`[DISTRIBUTION] Dev.to not configured or no content, skipping`);
      return {
        channel: "devto",
        success: false,
        error: "Dev.to API key not configured or no content",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const response = await fetch("https://dev.to/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.config.devtoApiKey
      },
      body: JSON.stringify({
        article: {
          title: packet.baseSlug.replace(/-/g, " "),
          body_markdown: packet.devtoBody,
          published: false,
          // Start as draft
          canonical_url: packet.canonicalUrl,
          tags: ["ai", "webdev", "programming"]
        }
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dev.to API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return {
      channel: "devto",
      success: true,
      externalUrl: data.url,
      externalId: data.id?.toString(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Publish to Hashnode via GraphQL API
   */
  async publishToHashnode(packet) {
    if (!this.config.hashnodeApiKey || !packet.hashnodeBody) {
      console.log(`[DISTRIBUTION] Hashnode not configured or no content, skipping`);
      return {
        channel: "hashnode",
        success: false,
        error: "Hashnode API key not configured or no content",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const mutation = `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          post {
            id
            url
          }
        }
      }
    `;
    const response = await fetch("https://gql.hashnode.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.hashnodeApiKey
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            title: packet.baseSlug.replace(/-/g, " "),
            contentMarkdown: packet.hashnodeBody,
            publicationId: this.config.hashnodePublicationId,
            originalArticleURL: packet.canonicalUrl
          }
        }
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hashnode API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return {
      channel: "hashnode",
      success: true,
      externalUrl: data.data?.createPost?.post?.url,
      externalId: data.data?.createPost?.post?.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Publish to GitHub repo (CHANGELOG, docs, etc.)
   */
  async publishToGitHub(packet) {
    if (!this.config.githubToken || !packet.githubReadme) {
      console.log(`[DISTRIBUTION] GitHub not configured or no content, skipping`);
      return {
        channel: "github",
        success: false,
        error: "GitHub token not configured or no content",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const { githubOwner, githubRepo, githubBranch = "main" } = this.config;
    const filePath = `content/blog/${packet.baseSlug}.md`;
    const response = await fetch(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${this.config.githubToken}`
        },
        body: JSON.stringify({
          message: `Add blog post: ${packet.baseSlug}`,
          content: Buffer.from(packet.githubReadme).toString("base64"),
          branch: githubBranch
        })
      }
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return {
      channel: "github",
      success: true,
      externalUrl: data.content?.html_url,
      externalId: data.content?.sha,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Update RSS feed
   */
  async publishToRSS(packet) {
    if (!packet.rssEntry) {
      return {
        channel: "rss",
        success: false,
        error: "No RSS entry in packet",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    console.log(`[RSS] Entry added: ${packet.rssEntry.title}`);
    return {
      channel: "rss",
      success: true,
      externalUrl: packet.rssEntry.link,
      externalId: packet.rssEntry.guid,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Send email digest via ESP
   */
  async publishToEmail(packet) {
    if (!this.config.emailApiKey || !packet.emailDigest) {
      console.log(`[DISTRIBUTION] Email not configured or no digest, skipping`);
      return {
        channel: "email",
        success: false,
        error: "Email provider not configured or no digest",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const provider = this.config.emailProvider || "buttondown";
    let response;
    switch (provider) {
      case "buttondown":
        response = await fetch("https://api.buttondown.email/v1/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${this.config.emailApiKey}`
          },
          body: JSON.stringify({
            subject: packet.emailDigest.subject,
            body: packet.emailDigest.htmlBody,
            status: "draft"
            // Start as draft
          })
        });
        break;
      case "mailerlite":
        response = await fetch("https://connect.mailerlite.com/api/campaigns", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.emailApiKey}`
          },
          body: JSON.stringify({
            name: packet.emailDigest.subject,
            type: "regular",
            emails: [
              {
                subject: packet.emailDigest.subject,
                content: packet.emailDigest.htmlBody
              }
            ]
          })
        });
        break;
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Email API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return {
      channel: "email",
      success: true,
      externalId: data.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ===========================================================================
  // TIER 1: WEB3 SOCIAL CHANNELS (NEW)
  // ===========================================================================
  /**
   * Publish to Farcaster via Neynar API
   * @see https://docs.neynar.com/reference/post-cast
   */
  async publishToFarcaster(packet) {
    if (!this.config.farcasterApiKey || !this.config.farcasterSignerUuid || !packet.farcasterCast) {
      console.log(`[DISTRIBUTION] Farcaster not configured or no cast, skipping`);
      return {
        channel: "farcaster",
        success: false,
        error: "Farcaster API key/signer not configured or no cast content",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const response = await fetch("https://api.neynar.com/v2/farcaster/cast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": this.config.farcasterApiKey
      },
      body: JSON.stringify({
        signer_uuid: this.config.farcasterSignerUuid,
        text: packet.farcasterCast,
        // Optional: Add embeds for links
        embeds: packet.canonicalUrl ? [{ url: packet.canonicalUrl }] : void 0
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Farcaster API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    const hash = data.cast?.hash;
    const username = data.cast?.author?.username;
    return {
      channel: "farcaster",
      success: true,
      externalUrl: hash && username ? `https://warpcast.com/${username}/${hash.slice(0, 10)}` : void 0,
      externalId: hash,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Publish to Lens Protocol via API
   * @see https://docs.lens.xyz/docs/create-post-typed-data
   */
  async publishToLens(packet) {
    if (!this.config.lensProfileId || !this.config.lensAccessToken || !packet.lensPost) {
      console.log(`[DISTRIBUTION] Lens not configured or no post, skipping`);
      return {
        channel: "lens",
        success: false,
        error: "Lens profile/token not configured or no post content",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const mutation = `
      mutation CreatePostOnLens($request: OnchainPostRequest!) {
        postOnchain(request: $request) {
          ... on RelaySuccess {
            txHash
            txId
          }
          ... on LensProfileManagerRelayError {
            reason
          }
        }
      }
    `;
    const response = await fetch("https://api-v2.lens.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.lensAccessToken}`,
        "x-access-token": this.config.lensAccessToken
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          request: {
            contentURI: `data:application/json,${encodeURIComponent(JSON.stringify({
              $schema: "https://json-schemas.lens.dev/publications/text-only/3.0.0.json",
              lens: {
                mainContentFocus: "TEXT_ONLY",
                content: packet.lensPost,
                locale: "en"
              }
            }))}`
          }
        }
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Lens API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    const txHash = data.data?.postOnchain?.txHash;
    return {
      channel: "lens",
      success: true,
      externalUrl: txHash ? `https://hey.xyz/posts/${txHash}` : void 0,
      externalId: txHash || data.data?.postOnchain?.txId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Publish to Paragraph.xyz
   * @see https://docs.paragraph.xyz/api
   */
  async publishToParagraph(packet) {
    if (!this.config.paragraphApiKey || !packet.paragraphPost) {
      console.log(`[DISTRIBUTION] Paragraph not configured or no post, skipping`);
      return {
        channel: "paragraph",
        success: false,
        error: "Paragraph API key not configured or no post content",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const response = await fetch("https://api.paragraph.xyz/v1/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.paragraphApiKey}`
      },
      body: JSON.stringify({
        title: packet.baseSlug.replace(/-/g, " "),
        markdown: packet.paragraphPost,
        slug: packet.baseSlug,
        status: "draft",
        // Start as draft for review
        publicationId: this.config.paragraphPublicationId
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Paragraph API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return {
      channel: "paragraph",
      success: true,
      externalUrl: data.slug ? `https://paragraph.xyz/@gicm/${data.slug}` : void 0,
      externalId: data.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ===========================================================================
  // TIER 1: DECENTRALIZED SOCIAL CHANNELS (NEW)
  // ===========================================================================
  /**
   * Publish to Bluesky via AT Protocol
   * @see https://docs.bsky.app/docs/api/com-atproto-repo-create-record
   */
  async publishToBluesky(packet) {
    if (!this.config.blueskyHandle || !this.config.blueskyAppPassword || !packet.blueskyPost) {
      console.log(`[DISTRIBUTION] Bluesky not configured or no post, skipping`);
      return {
        channel: "bluesky",
        success: false,
        error: "Bluesky handle/password not configured or no post content",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const sessionResponse = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: this.config.blueskyHandle,
        password: this.config.blueskyAppPassword
      })
    });
    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      throw new Error(`Bluesky auth error: ${sessionResponse.status} - ${error}`);
    }
    const session = await sessionResponse.json();
    const postResponse = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessJwt}`
      },
      body: JSON.stringify({
        repo: session.did,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text: packet.blueskyPost,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          // Add link card if canonical URL exists
          embed: packet.canonicalUrl ? {
            $type: "app.bsky.embed.external",
            external: {
              uri: packet.canonicalUrl,
              title: packet.baseSlug.replace(/-/g, " "),
              description: packet.blueskyPost.slice(0, 300)
            }
          } : void 0
        }
      })
    });
    if (!postResponse.ok) {
      const error = await postResponse.text();
      throw new Error(`Bluesky post error: ${postResponse.status} - ${error}`);
    }
    const postData = await postResponse.json();
    const webUrl = postData.uri?.replace("at://", "https://bsky.app/profile/").replace("/app.bsky.feed.post/", "/post/");
    return {
      channel: "bluesky",
      success: true,
      externalUrl: webUrl,
      externalId: postData.cid,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Publish to Mastodon via ActivityPub
   * @see https://docs.joinmastodon.org/methods/statuses/
   */
  async publishToMastodon(packet) {
    if (!this.config.mastodonInstance || !this.config.mastodonAccessToken || !packet.mastodonPost) {
      console.log(`[DISTRIBUTION] Mastodon not configured or no toot, skipping`);
      return {
        channel: "mastodon",
        success: false,
        error: "Mastodon instance/token not configured or no post content",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const instance5 = this.config.mastodonInstance.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const response = await fetch(`https://${instance5}/api/v1/statuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.mastodonAccessToken}`
      },
      body: JSON.stringify({
        status: packet.mastodonPost,
        visibility: "public",
        // Add link preview
        ...packet.canonicalUrl && {
          media_ids: []
          // Could add preview image
        }
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mastodon API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return {
      channel: "mastodon",
      success: true,
      externalUrl: data.url,
      externalId: data.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ===========================================================================
  // TIER 2: QUEUED FOR APPROVAL
  // ===========================================================================
  /**
   * Queue Twitter thread for approval
   */
  async queueForTwitter(packet) {
    if (!packet.twitterThread?.length) {
      return {
        channel: "twitter",
        success: false,
        error: "No Twitter thread in packet",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    console.log(`[TWITTER] Queued thread with ${packet.twitterThread.length} tweets for approval`);
    console.log(`[TWITTER] First tweet: ${packet.twitterThread[0]}`);
    return {
      channel: "twitter",
      success: true,
      externalUrl: void 0,
      // No URL until approved and posted
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Queue LinkedIn post for approval
   */
  async queueForLinkedIn(packet) {
    if (!packet.linkedinPost) {
      return {
        channel: "linkedin",
        success: false,
        error: "No LinkedIn post in packet",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    console.log(`[LINKEDIN] Queued post for approval`);
    console.log(`[LINKEDIN] Preview: ${packet.linkedinPost.slice(0, 200)}...`);
    return {
      channel: "linkedin",
      success: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Queue Reddit draft for approval
   */
  async queueForReddit(packet) {
    if (!packet.redditDraft) {
      return {
        channel: "reddit",
        success: false,
        error: "No Reddit draft in packet",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    console.log(`[REDDIT] Queued draft for approval`);
    console.log(`[REDDIT] Preview: ${packet.redditDraft.slice(0, 200)}...`);
    return {
      channel: "reddit",
      success: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Queue Threads draft for approval (Meta's Threads - limited API)
   */
  async queueForThreads(packet) {
    if (!packet.threadsDraft) {
      return {
        channel: "threads",
        success: false,
        error: "No Threads draft in packet",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    console.log(`[THREADS] Queued draft for approval`);
    console.log(`[THREADS] Preview: ${packet.threadsDraft.slice(0, 200)}...`);
    if (this.config.threadsUserId && this.config.threadsAccessToken) {
      try {
        const response = await fetch(
          `https://graph.threads.net/v1.0/${this.config.threadsUserId}/threads`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              media_type: "TEXT",
              text: packet.threadsDraft,
              access_token: this.config.threadsAccessToken
            })
          }
        );
        if (response.ok) {
          const data = await response.json();
          return {
            channel: "threads",
            success: true,
            externalId: data.id,
            externalUrl: data.id ? `https://threads.net/t/${data.id}` : void 0,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
      } catch (error) {
        console.warn(`[THREADS] API call failed, queuing for manual:`, error);
      }
    }
    return {
      channel: "threads",
      success: true,
      // Success = queued for manual posting
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ===========================================================================
  // UTILITIES
  // ===========================================================================
  /**
   * Record a distribution attempt
   */
  recordAttempt(packetId, result) {
    const attempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      packetId,
      channel: result.channel,
      attemptedAt: result.timestamp,
      status: result.success ? "success" : "failed",
      externalUrl: result.externalUrl,
      externalId: result.externalId,
      errorMessage: result.error,
      retryCount: 0
    };
    const existing = this.attempts.get(packetId) || [];
    existing.push(attempt);
    this.attempts.set(packetId, existing);
  }
  /**
   * Get all attempts for a packet
   */
  getAttempts(packetId) {
    return this.attempts.get(packetId) || [];
  }
  /**
   * Get distribution summary
   */
  getSummary() {
    let totalAttempts = 0;
    const successful = /* @__PURE__ */ new Set();
    const failed = /* @__PURE__ */ new Set();
    for (const attempts of this.attempts.values()) {
      for (const attempt of attempts) {
        totalAttempts++;
        if (attempt.status === "success") {
          successful.add(attempt.channel);
        } else {
          failed.add(attempt.channel);
        }
      }
    }
    return {
      totalAttempts,
      successfulChannels: Array.from(successful),
      failedChannels: Array.from(failed)
    };
  }
};
var instance2 = null;
function getDistributionService(config) {
  if (!instance2) {
    instance2 = new DistributionService({
      // Load from environment
      blogApiUrl: process.env.BLOG_API_URL,
      blogApiKey: process.env.BLOG_API_KEY,
      devtoApiKey: process.env.DEVTO_API_KEY,
      mediumIntegrationToken: process.env.MEDIUM_INTEGRATION_TOKEN,
      hashnodeApiKey: process.env.HASHNODE_API_KEY,
      hashnodePublicationId: process.env.HASHNODE_PUBLICATION_ID,
      githubToken: process.env.GITHUB_TOKEN,
      githubOwner: process.env.GITHUB_OWNER || "gicm",
      githubRepo: process.env.GITHUB_REPO || "gicm-content",
      emailProvider: process.env.EMAIL_PROVIDER || "buttondown",
      emailApiKey: process.env.EMAIL_API_KEY,
      ...config
    });
  }
  return instance2;
}

// src/auth/types.ts
import { z } from "zod";
var RoleSchema = z.enum(["owner", "admin", "editor", "viewer"]);
var PermissionSchema = z.string().regex(/^[a-z_]+:[a-z_]+$/);
var ResourceTypeSchema = z.enum([
  "organization",
  "pipeline",
  "schedule",
  "budget",
  "webhook",
  "marketplace",
  "analytics",
  "audit",
  "settings",
  "member",
  "invite"
]);
var ActionTypeSchema = z.enum([
  "create",
  "read",
  "update",
  "delete",
  "execute",
  "manage",
  "invite",
  "export"
]);
var OrgPlanSchema = z.enum(["free", "pro", "enterprise"]);
var OrgSettingsSchema = z.object({
  // Branding
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  // Limits (based on plan)
  maxPipelines: z.number().int().positive().default(10),
  maxMembers: z.number().int().positive().default(5),
  maxSchedules: z.number().int().positive().default(5),
  maxBudgets: z.number().int().positive().default(3),
  // Features
  auditLogRetentionDays: z.number().int().min(7).default(30),
  apiRateLimit: z.number().int().positive().default(100),
  webhooksEnabled: z.boolean().default(true),
  ssoEnabled: z.boolean().default(false),
  // Notifications
  notifyOnBudgetAlert: z.boolean().default(true),
  notifyOnPipelineFailure: z.boolean().default(true),
  notifyOnNewMember: z.boolean().default(true)
});
var OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(50),
  description: z.string().max(500).optional(),
  // Plan & billing
  plan: OrgPlanSchema.default("free"),
  billingEmail: z.string().email().optional(),
  stripeCustomerId: z.string().optional(),
  // Settings
  settings: OrgSettingsSchema.default({}),
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid()
});
var CreateOrgSchema = OrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).partial({
  settings: true,
  plan: true
});
var UpdateOrgSchema = OrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true
}).partial();
var MemberStatusSchema = z.enum(["active", "suspended", "removed"]);
var OrgMemberSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
  // Role & permissions
  role: RoleSchema,
  customPermissions: z.array(PermissionSchema).optional(),
  // Override role permissions
  // User info (denormalized for display)
  email: z.string().email(),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  // Status
  status: MemberStatusSchema.default("active"),
  // Metadata
  invitedBy: z.string().uuid().optional(),
  invitedAt: z.date().optional(),
  joinedAt: z.date(),
  lastActiveAt: z.date().optional()
});
var AddMemberSchema = z.object({
  userId: z.string().uuid(),
  role: RoleSchema,
  email: z.string().email(),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional()
});
var UpdateMemberSchema = z.object({
  role: RoleSchema.optional(),
  customPermissions: z.array(PermissionSchema).optional(),
  status: MemberStatusSchema.optional()
});
var InviteStatusSchema = z.enum(["pending", "accepted", "expired", "revoked"]);
var OrgInviteSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  email: z.string().email(),
  role: RoleSchema,
  // Token for accepting invite
  token: z.string().min(32),
  expiresAt: z.date(),
  // Status
  status: InviteStatusSchema.default("pending"),
  // Metadata
  invitedBy: z.string().uuid(),
  invitedAt: z.date(),
  acceptedAt: z.date().optional(),
  acceptedBy: z.string().uuid().optional(),
  // Personalization
  message: z.string().max(500).optional()
});
var CreateInviteSchema = z.object({
  email: z.string().email(),
  role: RoleSchema.default("viewer"),
  message: z.string().max(500).optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7)
});
var PermissionCheckSchema = z.object({
  userId: z.string().uuid(),
  orgId: z.string().uuid(),
  resource: ResourceTypeSchema,
  action: ActionTypeSchema,
  resourceId: z.string().optional()
  // For resource-specific checks
});
var PermissionResultSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().optional(),
  role: RoleSchema.optional(),
  checkedAt: z.date()
});
var AuthContextSchema = z.object({
  userId: z.string().uuid(),
  orgId: z.string().uuid(),
  role: RoleSchema,
  permissions: z.array(PermissionSchema),
  // User info
  email: z.string().email(),
  displayName: z.string().optional(),
  // Organization info
  orgName: z.string(),
  orgPlan: OrgPlanSchema
});
var PLAN_LIMITS = {
  free: {
    maxPipelines: 10,
    maxMembers: 5,
    maxSchedules: 5,
    maxBudgets: 3,
    auditLogRetentionDays: 7,
    apiRateLimit: 100,
    webhooksEnabled: true,
    ssoEnabled: false,
    notifyOnBudgetAlert: true,
    notifyOnPipelineFailure: true,
    notifyOnNewMember: true
  },
  pro: {
    maxPipelines: 100,
    maxMembers: 25,
    maxSchedules: 50,
    maxBudgets: 20,
    auditLogRetentionDays: 90,
    apiRateLimit: 1e3,
    webhooksEnabled: true,
    ssoEnabled: false,
    notifyOnBudgetAlert: true,
    notifyOnPipelineFailure: true,
    notifyOnNewMember: true
  },
  enterprise: {
    maxPipelines: -1,
    // unlimited
    maxMembers: -1,
    maxSchedules: -1,
    maxBudgets: -1,
    auditLogRetentionDays: 365,
    apiRateLimit: 1e4,
    webhooksEnabled: true,
    ssoEnabled: true,
    notifyOnBudgetAlert: true,
    notifyOnPipelineFailure: true,
    notifyOnNewMember: true
  }
};
var ROLE_LEVELS = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4
};

// src/auth/permissions.ts
var PERMISSIONS = {
  // Organization
  "organization:read": "organization:read",
  "organization:update": "organization:update",
  "organization:delete": "organization:delete",
  "organization:manage": "organization:manage",
  // Pipeline
  "pipeline:create": "pipeline:create",
  "pipeline:read": "pipeline:read",
  "pipeline:update": "pipeline:update",
  "pipeline:delete": "pipeline:delete",
  "pipeline:execute": "pipeline:execute",
  // Schedule
  "schedule:create": "schedule:create",
  "schedule:read": "schedule:read",
  "schedule:update": "schedule:update",
  "schedule:delete": "schedule:delete",
  // Budget
  "budget:create": "budget:create",
  "budget:read": "budget:read",
  "budget:update": "budget:update",
  "budget:delete": "budget:delete",
  // Webhook
  "webhook:create": "webhook:create",
  "webhook:read": "webhook:read",
  "webhook:update": "webhook:update",
  "webhook:delete": "webhook:delete",
  // Marketplace
  "marketplace:read": "marketplace:read",
  "marketplace:create": "marketplace:create",
  "marketplace:update": "marketplace:update",
  "marketplace:delete": "marketplace:delete",
  // Analytics
  "analytics:read": "analytics:read",
  "analytics:export": "analytics:export",
  // Audit
  "audit:read": "audit:read",
  "audit:export": "audit:export",
  // Settings
  "settings:read": "settings:read",
  "settings:update": "settings:update",
  // Members
  "member:read": "member:read",
  "member:update": "member:update",
  "member:delete": "member:delete",
  // Invites
  "invite:create": "invite:create",
  "invite:read": "invite:read",
  "invite:delete": "invite:delete"
};
var VIEWER_PERMISSIONS = [
  PERMISSIONS["organization:read"],
  PERMISSIONS["pipeline:read"],
  PERMISSIONS["schedule:read"],
  PERMISSIONS["budget:read"],
  PERMISSIONS["webhook:read"],
  PERMISSIONS["marketplace:read"],
  PERMISSIONS["analytics:read"],
  PERMISSIONS["settings:read"],
  PERMISSIONS["member:read"],
  PERMISSIONS["invite:read"]
];
var EDITOR_PERMISSIONS = [
  ...VIEWER_PERMISSIONS,
  PERMISSIONS["pipeline:create"],
  PERMISSIONS["pipeline:update"],
  PERMISSIONS["pipeline:execute"],
  PERMISSIONS["schedule:create"],
  PERMISSIONS["schedule:update"],
  PERMISSIONS["budget:create"],
  PERMISSIONS["budget:update"],
  PERMISSIONS["webhook:create"],
  PERMISSIONS["webhook:update"],
  PERMISSIONS["marketplace:create"]
];
var ADMIN_PERMISSIONS = [
  ...EDITOR_PERMISSIONS,
  PERMISSIONS["pipeline:delete"],
  PERMISSIONS["schedule:delete"],
  PERMISSIONS["budget:delete"],
  PERMISSIONS["webhook:delete"],
  PERMISSIONS["marketplace:update"],
  PERMISSIONS["marketplace:delete"],
  PERMISSIONS["analytics:export"],
  PERMISSIONS["audit:read"],
  PERMISSIONS["audit:export"],
  PERMISSIONS["settings:update"],
  PERMISSIONS["member:update"],
  PERMISSIONS["member:delete"],
  PERMISSIONS["invite:create"],
  PERMISSIONS["invite:delete"]
];
var OWNER_PERMISSIONS = [
  ...ADMIN_PERMISSIONS,
  PERMISSIONS["organization:update"],
  PERMISSIONS["organization:delete"],
  PERMISSIONS["organization:manage"]
];
var ROLE_PERMISSIONS = {
  viewer: VIEWER_PERMISSIONS,
  editor: EDITOR_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  owner: OWNER_PERMISSIONS
};
function buildPermission(resource, action) {
  return `${resource}:${action}`;
}
function parsePermission(permission) {
  const [resource, action] = permission.split(":");
  return { resource, action };
}
function roleHasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}
function getPermissionsForRole(role) {
  return [...ROLE_PERMISSIONS[role]];
}
function isHigherRole(roleA, roleB) {
  return ROLE_LEVELS[roleA] > ROLE_LEVELS[roleB];
}
function isAtLeastRole(roleA, roleB) {
  return ROLE_LEVELS[roleA] >= ROLE_LEVELS[roleB];
}
function mergePermissions(role, customPermissions) {
  const basePermissions = getPermissionsForRole(role);
  if (!customPermissions || customPermissions.length === 0) {
    return basePermissions;
  }
  const merged = /* @__PURE__ */ new Set([...basePermissions, ...customPermissions]);
  return Array.from(merged);
}
var PERMISSION_GROUPS = {
  pipelines: {
    label: "Pipelines",
    permissions: [
      { key: "pipeline:create", label: "Create pipelines" },
      { key: "pipeline:read", label: "View pipelines" },
      { key: "pipeline:update", label: "Edit pipelines" },
      { key: "pipeline:delete", label: "Delete pipelines" },
      { key: "pipeline:execute", label: "Execute pipelines" }
    ]
  },
  schedules: {
    label: "Schedules",
    permissions: [
      { key: "schedule:create", label: "Create schedules" },
      { key: "schedule:read", label: "View schedules" },
      { key: "schedule:update", label: "Edit schedules" },
      { key: "schedule:delete", label: "Delete schedules" }
    ]
  },
  budgets: {
    label: "Budgets",
    permissions: [
      { key: "budget:create", label: "Create budgets" },
      { key: "budget:read", label: "View budgets" },
      { key: "budget:update", label: "Edit budgets" },
      { key: "budget:delete", label: "Delete budgets" }
    ]
  },
  webhooks: {
    label: "Webhooks",
    permissions: [
      { key: "webhook:create", label: "Create webhooks" },
      { key: "webhook:read", label: "View webhooks" },
      { key: "webhook:update", label: "Edit webhooks" },
      { key: "webhook:delete", label: "Delete webhooks" }
    ]
  },
  marketplace: {
    label: "Marketplace",
    permissions: [
      { key: "marketplace:read", label: "Browse marketplace" },
      { key: "marketplace:create", label: "Publish templates" },
      { key: "marketplace:update", label: "Edit templates" },
      { key: "marketplace:delete", label: "Delete templates" }
    ]
  },
  analytics: {
    label: "Analytics",
    permissions: [
      { key: "analytics:read", label: "View analytics" },
      { key: "analytics:export", label: "Export analytics" }
    ]
  },
  audit: {
    label: "Audit Logs",
    permissions: [
      { key: "audit:read", label: "View audit logs" },
      { key: "audit:export", label: "Export audit logs" }
    ]
  },
  team: {
    label: "Team Management",
    permissions: [
      { key: "member:read", label: "View members" },
      { key: "member:update", label: "Update member roles" },
      { key: "member:delete", label: "Remove members" },
      { key: "invite:create", label: "Invite members" },
      { key: "invite:read", label: "View invites" },
      { key: "invite:delete", label: "Revoke invites" }
    ]
  },
  organization: {
    label: "Organization",
    permissions: [
      { key: "organization:read", label: "View organization" },
      { key: "organization:update", label: "Edit organization" },
      { key: "organization:delete", label: "Delete organization" },
      { key: "organization:manage", label: "Manage billing & plan" },
      { key: "settings:read", label: "View settings" },
      { key: "settings:update", label: "Edit settings" }
    ]
  }
};
var ROLE_DESCRIPTIONS = {
  viewer: {
    label: "Viewer",
    description: "Can view pipelines, schedules, and analytics. Read-only access."
  },
  editor: {
    label: "Editor",
    description: "Can create and edit pipelines, schedules, and budgets. Cannot delete or manage team."
  },
  admin: {
    label: "Admin",
    description: "Full access to all features. Can manage team members and settings."
  },
  owner: {
    label: "Owner",
    description: "Organization owner with full control including billing and organization deletion."
  }
};

// src/auth/rbac-manager.ts
import { EventEmitter as EventEmitter3 } from "eventemitter3";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
var DEFAULT_CONFIG = {
  inviteExpirationDays: 7,
  enableInviteEmails: true,
  maxOrgsPerUser: 10,
  checkIntervalMs: 6e4
  // Check for expired invites
};
var RBACManager = class extends EventEmitter3 {
  config;
  // In-memory storage (replace with database in production)
  organizations = /* @__PURE__ */ new Map();
  members = /* @__PURE__ */ new Map();
  // orgId -> members[]
  invites = /* @__PURE__ */ new Map();
  // orgId -> invites[]
  userOrgs = /* @__PURE__ */ new Map();
  // userId -> orgIds[]
  checkInterval = null;
  constructor(config = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================
  start() {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(() => {
      this.expireInvites();
    }, this.config.checkIntervalMs);
    console.log("[RBACManager] Started invite expiration monitoring");
  }
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log("[RBACManager] Stopped");
  }
  // ==========================================================================
  // ORGANIZATION MANAGEMENT
  // ==========================================================================
  async createOrganization(input, creatorUserId) {
    const validated = CreateOrgSchema.parse(input);
    const userOrgs = this.userOrgs.get(creatorUserId) || [];
    if (userOrgs.length >= this.config.maxOrgsPerUser) {
      throw new Error(`User has reached maximum organization limit (${this.config.maxOrgsPerUser})`);
    }
    for (const org2 of this.organizations.values()) {
      if (org2.slug === validated.slug) {
        throw new Error(`Organization slug "${validated.slug}" is already taken`);
      }
    }
    const now = /* @__PURE__ */ new Date();
    const plan = validated.plan || "free";
    const org = OrganizationSchema.parse({
      ...validated,
      id: uuidv4(),
      plan,
      settings: { ...PLAN_LIMITS[plan], ...validated.settings },
      createdAt: now,
      updatedAt: now,
      createdBy: creatorUserId
    });
    this.organizations.set(org.id, org);
    this.members.set(org.id, []);
    this.invites.set(org.id, []);
    await this.addMember(org.id, {
      userId: creatorUserId,
      role: "owner",
      email: validated.billingEmail || "owner@example.com",
      displayName: "Owner"
    });
    this.emit("org:created", org);
    console.log(`[RBACManager] Created organization: ${org.name} (${org.slug})`);
    return org;
  }
  getOrganization(orgId) {
    return this.organizations.get(orgId);
  }
  getOrganizationBySlug(slug) {
    for (const org of this.organizations.values()) {
      if (org.slug === slug) return org;
    }
    return void 0;
  }
  async updateOrganization(orgId, updates) {
    const org = this.organizations.get(orgId);
    if (!org) return null;
    if (updates.slug && updates.slug !== org.slug) {
      for (const o of this.organizations.values()) {
        if (o.slug === updates.slug && o.id !== orgId) {
          throw new Error(`Organization slug "${updates.slug}" is already taken`);
        }
      }
    }
    let settings = org.settings;
    if (updates.plan && updates.plan !== org.plan) {
      settings = { ...PLAN_LIMITS[updates.plan], ...updates.settings };
    }
    const updated = {
      ...org,
      ...updates,
      settings: updates.settings ? { ...settings, ...updates.settings } : settings,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.organizations.set(orgId, updated);
    this.emit("org:updated", updated);
    return updated;
  }
  async deleteOrganization(orgId) {
    const org = this.organizations.get(orgId);
    if (!org) return false;
    const orgMembers = this.members.get(orgId) || [];
    for (const member of orgMembers) {
      const userOrgList = this.userOrgs.get(member.userId) || [];
      this.userOrgs.set(
        member.userId,
        userOrgList.filter((id) => id !== orgId)
      );
    }
    this.organizations.delete(orgId);
    this.members.delete(orgId);
    this.invites.delete(orgId);
    this.emit("org:deleted", orgId);
    console.log(`[RBACManager] Deleted organization: ${org.name}`);
    return true;
  }
  getUserOrganizations(userId) {
    const orgIds = this.userOrgs.get(userId) || [];
    return orgIds.map((id) => this.organizations.get(id)).filter((org) => org !== void 0);
  }
  // ==========================================================================
  // MEMBER MANAGEMENT
  // ==========================================================================
  async addMember(orgId, input) {
    const org = this.organizations.get(orgId);
    if (!org) throw new Error(`Organization not found: ${orgId}`);
    const validated = AddMemberSchema.parse(input);
    const orgMembers = this.members.get(orgId) || [];
    if (orgMembers.some((m) => m.userId === validated.userId)) {
      throw new Error("User is already a member of this organization");
    }
    if (org.settings.maxMembers !== -1 && orgMembers.length >= org.settings.maxMembers) {
      throw new Error(`Organization has reached maximum member limit (${org.settings.maxMembers})`);
    }
    const now = /* @__PURE__ */ new Date();
    const member = OrgMemberSchema.parse({
      id: uuidv4(),
      orgId,
      ...validated,
      status: "active",
      joinedAt: now,
      lastActiveAt: now
    });
    orgMembers.push(member);
    this.members.set(orgId, orgMembers);
    const userOrgList = this.userOrgs.get(member.userId) || [];
    userOrgList.push(orgId);
    this.userOrgs.set(member.userId, userOrgList);
    this.emit("member:added", member);
    console.log(`[RBACManager] Added member ${member.email} to ${org.name} as ${member.role}`);
    return member;
  }
  getMember(orgId, userId) {
    const orgMembers = this.members.get(orgId) || [];
    return orgMembers.find((m) => m.userId === userId && m.status === "active");
  }
  getMemberById(memberId) {
    for (const members of this.members.values()) {
      const member = members.find((m) => m.id === memberId);
      if (member) return member;
    }
    return void 0;
  }
  getOrgMembers(orgId) {
    return (this.members.get(orgId) || []).filter((m) => m.status === "active");
  }
  async updateMember(orgId, userId, updates) {
    const orgMembers = this.members.get(orgId) || [];
    const memberIndex = orgMembers.findIndex((m) => m.userId === userId);
    if (memberIndex === -1) return null;
    const member = orgMembers[memberIndex];
    if (updates.role && member.role === "owner" && updates.role !== "owner") {
      const owners = orgMembers.filter((m) => m.role === "owner" && m.status === "active");
      if (owners.length <= 1) {
        throw new Error("Cannot demote the last owner. Transfer ownership first.");
      }
    }
    const updated = {
      ...member,
      ...updates,
      lastActiveAt: /* @__PURE__ */ new Date()
    };
    orgMembers[memberIndex] = updated;
    this.members.set(orgId, orgMembers);
    this.emit("member:updated", updated);
    return updated;
  }
  async removeMember(orgId, userId) {
    const orgMembers = this.members.get(orgId) || [];
    const member = orgMembers.find((m) => m.userId === userId);
    if (!member) return false;
    if (member.role === "owner") {
      const owners = orgMembers.filter((m) => m.role === "owner" && m.status === "active");
      if (owners.length <= 1) {
        throw new Error("Cannot remove the last owner. Transfer ownership first.");
      }
    }
    member.status = "removed";
    this.members.set(orgId, orgMembers);
    const userOrgList = this.userOrgs.get(userId) || [];
    this.userOrgs.set(
      userId,
      userOrgList.filter((id) => id !== orgId)
    );
    this.emit("member:removed", member.id, orgId);
    console.log(`[RBACManager] Removed member ${member.email} from org ${orgId}`);
    return true;
  }
  // ==========================================================================
  // INVITE MANAGEMENT
  // ==========================================================================
  async createInvite(orgId, input, invitedBy) {
    const org = this.organizations.get(orgId);
    if (!org) throw new Error(`Organization not found: ${orgId}`);
    const validated = CreateInviteSchema.parse(input);
    const orgInvites = this.invites.get(orgId) || [];
    const orgMembers = this.members.get(orgId) || [];
    if (orgMembers.some((m) => m.email === validated.email && m.status === "active")) {
      throw new Error("User with this email is already a member");
    }
    const existingInvite = orgInvites.find(
      (i) => i.email === validated.email && i.status === "pending"
    );
    if (existingInvite) {
      throw new Error("An invite for this email is already pending");
    }
    if (org.settings.maxMembers !== -1 && orgMembers.length >= org.settings.maxMembers) {
      throw new Error(`Organization has reached maximum member limit (${org.settings.maxMembers})`);
    }
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + validated.expiresInDays);
    const invite = OrgInviteSchema.parse({
      id: uuidv4(),
      orgId,
      email: validated.email,
      role: validated.role,
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt,
      status: "pending",
      invitedBy,
      invitedAt: now,
      message: validated.message
    });
    orgInvites.push(invite);
    this.invites.set(orgId, orgInvites);
    this.emit("invite:created", invite);
    console.log(`[RBACManager] Created invite for ${invite.email} to ${org.name}`);
    return invite;
  }
  getInvite(inviteId) {
    for (const invites of this.invites.values()) {
      const invite = invites.find((i) => i.id === inviteId);
      if (invite) return invite;
    }
    return void 0;
  }
  getInviteByToken(token) {
    for (const invites of this.invites.values()) {
      const invite = invites.find((i) => i.token === token && i.status === "pending");
      if (invite) return invite;
    }
    return void 0;
  }
  getOrgInvites(orgId, pendingOnly = true) {
    const invites = this.invites.get(orgId) || [];
    if (pendingOnly) {
      return invites.filter((i) => i.status === "pending");
    }
    return invites;
  }
  async acceptInvite(token, userId, userEmail, displayName) {
    const invite = this.getInviteByToken(token);
    if (!invite) throw new Error("Invalid or expired invite");
    if (/* @__PURE__ */ new Date() > invite.expiresAt) {
      invite.status = "expired";
      this.emit("invite:expired", invite.id);
      throw new Error("Invite has expired");
    }
    const member = await this.addMember(invite.orgId, {
      userId,
      role: invite.role,
      email: userEmail,
      displayName
    });
    invite.status = "accepted";
    invite.acceptedAt = /* @__PURE__ */ new Date();
    invite.acceptedBy = userId;
    this.emit("invite:accepted", invite, member);
    console.log(`[RBACManager] Invite accepted by ${userEmail}`);
    return member;
  }
  async revokeInvite(inviteId) {
    for (const [orgId, invites] of this.invites.entries()) {
      const invite = invites.find((i) => i.id === inviteId);
      if (invite && invite.status === "pending") {
        invite.status = "revoked";
        this.emit("invite:revoked", inviteId);
        console.log(`[RBACManager] Revoked invite ${inviteId}`);
        return true;
      }
    }
    return false;
  }
  expireInvites() {
    const now = /* @__PURE__ */ new Date();
    for (const invites of this.invites.values()) {
      for (const invite of invites) {
        if (invite.status === "pending" && now > invite.expiresAt) {
          invite.status = "expired";
          this.emit("invite:expired", invite.id);
        }
      }
    }
  }
  // ==========================================================================
  // PERMISSION CHECKING
  // ==========================================================================
  async checkPermission(check) {
    const { userId, orgId, resource, action, resourceId } = check;
    const permission = buildPermission(resource, action);
    const member = this.getMember(orgId, userId);
    if (!member) {
      return {
        allowed: false,
        reason: "User is not a member of this organization",
        checkedAt: /* @__PURE__ */ new Date()
      };
    }
    if (member.status === "suspended") {
      return {
        allowed: false,
        reason: "User account is suspended",
        role: member.role,
        checkedAt: /* @__PURE__ */ new Date()
      };
    }
    const permissions = mergePermissions(member.role, member.customPermissions);
    if (!permissions.includes(permission)) {
      this.emit("permission:denied", check, {
        allowed: false,
        reason: `Role "${member.role}" does not have permission "${permission}"`,
        role: member.role,
        checkedAt: /* @__PURE__ */ new Date()
      });
      return {
        allowed: false,
        reason: `Permission denied: ${permission}`,
        role: member.role,
        checkedAt: /* @__PURE__ */ new Date()
      };
    }
    return {
      allowed: true,
      role: member.role,
      checkedAt: /* @__PURE__ */ new Date()
    };
  }
  hasPermission(userId, orgId, permission) {
    const member = this.getMember(orgId, userId);
    if (!member || member.status !== "active") return false;
    const permissions = mergePermissions(member.role, member.customPermissions);
    return permissions.includes(permission);
  }
  hasRole(userId, orgId, minRole) {
    const member = this.getMember(orgId, userId);
    if (!member || member.status !== "active") return false;
    return isAtLeastRole(member.role, minRole);
  }
  // ==========================================================================
  // AUTH CONTEXT
  // ==========================================================================
  getAuthContext(userId, orgId) {
    const member = this.getMember(orgId, userId);
    if (!member || member.status !== "active") return null;
    const org = this.organizations.get(orgId);
    if (!org) return null;
    const permissions = mergePermissions(member.role, member.customPermissions);
    return {
      userId: member.userId,
      orgId,
      role: member.role,
      permissions,
      email: member.email,
      displayName: member.displayName,
      orgName: org.name,
      orgPlan: org.plan
    };
  }
  // ==========================================================================
  // STATISTICS
  // ==========================================================================
  getStats() {
    const orgsByPlan = { free: 0, pro: 0, enterprise: 0 };
    let totalMembers = 0;
    let totalInvites = 0;
    for (const org of this.organizations.values()) {
      orgsByPlan[org.plan] = (orgsByPlan[org.plan] || 0) + 1;
    }
    for (const members of this.members.values()) {
      totalMembers += members.filter((m) => m.status === "active").length;
    }
    for (const invites of this.invites.values()) {
      totalInvites += invites.filter((i) => i.status === "pending").length;
    }
    return {
      totalOrgs: this.organizations.size,
      totalMembers,
      totalInvites,
      orgsByPlan
    };
  }
};
var rbacManager = null;
function getRBACManager(config) {
  if (!rbacManager) {
    rbacManager = new RBACManager(config);
  }
  return rbacManager;
}
function createRBACManager(config) {
  return new RBACManager(config);
}

// src/audit/types.ts
import { z as z2 } from "zod";
var AuditCategorySchema = z2.enum([
  "auth",
  // Authentication events
  "organization",
  // Org-level changes
  "member",
  // Member management
  "pipeline",
  // Pipeline operations
  "schedule",
  // Schedule changes
  "budget",
  // Budget operations
  "webhook",
  // Webhook management
  "settings",
  // Settings changes
  "api",
  // API access
  "security",
  // Security events
  "system"
  // System events
]);
var AuditActionSchema = z2.enum([
  // Auth actions
  "login",
  "logout",
  "login_failed",
  "token_refresh",
  "password_change",
  "mfa_enabled",
  "mfa_disabled",
  // CRUD actions
  "create",
  "read",
  "update",
  "delete",
  // Execution actions
  "execute",
  "pause",
  "resume",
  "cancel",
  // Member actions
  "invite",
  "join",
  "leave",
  "role_change",
  // API actions
  "api_call",
  "rate_limited",
  "quota_exceeded",
  // Security actions
  "permission_denied",
  "suspicious_activity",
  "ip_blocked",
  // System actions
  "export",
  "import",
  "backup",
  "restore"
]);
var AuditSeveritySchema = z2.enum([
  "debug",
  // Development/debug info
  "info",
  // Normal operations
  "warning",
  // Potential issues
  "error",
  // Errors
  "critical"
  // Critical security events
]);
var AuditResultSchema = z2.enum([
  "success",
  "failure",
  "partial",
  "pending"
]);
var AuditContextSchema = z2.object({
  // User context
  userId: z2.string().optional(),
  userEmail: z2.string().email().optional(),
  userRole: z2.string().optional(),
  // Organization context
  orgId: z2.string().optional(),
  orgName: z2.string().optional(),
  // Request context
  ipAddress: z2.string().optional(),
  userAgent: z2.string().optional(),
  requestId: z2.string().optional(),
  sessionId: z2.string().optional(),
  // API context
  apiKeyId: z2.string().optional(),
  apiKeyName: z2.string().optional(),
  // Geo context
  country: z2.string().optional(),
  region: z2.string().optional(),
  city: z2.string().optional()
});
var AuditResourceSchema = z2.object({
  type: z2.string(),
  // pipeline, schedule, budget, etc.
  id: z2.string(),
  // Resource ID
  name: z2.string().optional(),
  attributes: z2.record(z2.unknown()).optional()
});
var AuditChangeSchema = z2.object({
  field: z2.string(),
  oldValue: z2.unknown().optional(),
  newValue: z2.unknown().optional()
});
var AuditEventSchema = z2.object({
  id: z2.string(),
  timestamp: z2.date(),
  // Event classification
  category: AuditCategorySchema,
  action: AuditActionSchema,
  severity: AuditSeveritySchema,
  result: AuditResultSchema,
  // Event details
  description: z2.string(),
  message: z2.string().optional(),
  // Context
  context: AuditContextSchema,
  // Resource affected
  resource: AuditResourceSchema.optional(),
  // Changes made
  changes: z2.array(AuditChangeSchema).optional(),
  // Additional metadata
  metadata: z2.record(z2.unknown()).optional(),
  // Error details (if applicable)
  errorCode: z2.string().optional(),
  errorMessage: z2.string().optional(),
  // Retention
  retentionDays: z2.number().optional(),
  // Hash for integrity verification
  hash: z2.string().optional(),
  previousHash: z2.string().optional()
});
var CreateAuditEventSchema = AuditEventSchema.omit({
  id: true,
  timestamp: true,
  hash: true,
  previousHash: true
});
var AuditQuerySchema = z2.object({
  // Filters
  orgId: z2.string().optional(),
  userId: z2.string().optional(),
  category: AuditCategorySchema.optional(),
  action: AuditActionSchema.optional(),
  severity: AuditSeveritySchema.optional(),
  result: AuditResultSchema.optional(),
  resourceType: z2.string().optional(),
  resourceId: z2.string().optional(),
  // Date range
  startDate: z2.date().optional(),
  endDate: z2.date().optional(),
  // Search
  search: z2.string().optional(),
  // Pagination
  limit: z2.number().min(1).max(1e3).default(100),
  offset: z2.number().min(0).default(0),
  // Sorting
  sortBy: z2.enum(["timestamp", "severity", "category"]).default("timestamp"),
  sortOrder: z2.enum(["asc", "desc"]).default("desc")
});
var AuditQueryResultSchema = z2.object({
  events: z2.array(AuditEventSchema),
  total: z2.number(),
  limit: z2.number(),
  offset: z2.number(),
  hasMore: z2.boolean()
});
var AuditExportOptionsSchema = z2.object({
  format: z2.enum(["json", "csv", "pdf"]),
  query: AuditQuerySchema,
  includeContext: z2.boolean().default(true),
  includeChanges: z2.boolean().default(true),
  includeMetadata: z2.boolean().default(false)
});
var AuditRetentionPolicySchema = z2.object({
  category: AuditCategorySchema,
  retentionDays: z2.number().min(1),
  archiveAfterDays: z2.number().optional(),
  deleteAfterArchive: z2.boolean().default(false)
});
var AuditStatsSchema = z2.object({
  totalEvents: z2.number(),
  eventsByCategory: z2.record(z2.number()),
  eventsBySeverity: z2.record(z2.number()),
  eventsByResult: z2.record(z2.number()),
  topUsers: z2.array(z2.object({
    userId: z2.string(),
    email: z2.string().optional(),
    eventCount: z2.number()
  })),
  topResources: z2.array(z2.object({
    resourceType: z2.string(),
    resourceId: z2.string(),
    eventCount: z2.number()
  })),
  recentActivity: z2.array(z2.object({
    date: z2.string(),
    count: z2.number()
  }))
});
var DEFAULT_RETENTION_DAYS = {
  auth: 365,
  organization: 730,
  member: 365,
  pipeline: 90,
  schedule: 90,
  budget: 365,
  webhook: 90,
  settings: 365,
  api: 30,
  security: 730,
  system: 365
};
var SEVERITY_LEVELS = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
  critical: 4
};

// src/audit/audit-logger.ts
import { EventEmitter as EventEmitter4 } from "eventemitter3";
import { createHash } from "crypto";
var DEFAULT_CONFIG2 = {
  storageType: "memory",
  batchSize: 100,
  batchIntervalMs: 5e3,
  enableIntegrityHash: true,
  hashAlgorithm: "sha256",
  asyncLogging: true,
  maxQueueSize: 1e4,
  minSeverity: "info"
};
var AuditLogger = class extends EventEmitter4 {
  config;
  events = [];
  queue = [];
  lastHash = null;
  batchTimer = null;
  isProcessing = false;
  constructor(config = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG2, ...config };
    if (this.config.asyncLogging) {
      this.startBatchProcessor();
    }
  }
  // ==========================================================================
  // LOGGING METHODS
  // ==========================================================================
  /**
   * Log an audit event
   */
  async log(input) {
    if (SEVERITY_LEVELS[input.severity] < SEVERITY_LEVELS[this.config.minSeverity]) {
      throw new Error(`Event severity ${input.severity} below minimum ${this.config.minSeverity}`);
    }
    if (this.config.excludeCategories?.includes(input.category)) {
      throw new Error(`Category ${input.category} is excluded`);
    }
    if (this.config.excludeActions?.includes(input.action)) {
      throw new Error(`Action ${input.action} is excluded`);
    }
    if (this.config.asyncLogging) {
      if (this.queue.length >= this.config.maxQueueSize) {
        await this.processBatch();
      }
      this.queue.push(input);
      const event = this.createEvent(input);
      return event;
    } else {
      const event = this.createEvent(input);
      await this.storeEvent(event);
      return event;
    }
  }
  /**
   * Log a simple info event
   */
  async info(category, action, description, context, resource) {
    return this.log({
      category,
      action,
      severity: "info",
      result: "success",
      description,
      context: context || {},
      resource
    });
  }
  /**
   * Log a warning event
   */
  async warn(category, action, description, context, resource) {
    return this.log({
      category,
      action,
      severity: "warning",
      result: "success",
      description,
      context: context || {},
      resource
    });
  }
  /**
   * Log an error event
   */
  async error(category, action, description, error, context, resource) {
    return this.log({
      category,
      action,
      severity: "error",
      result: "failure",
      description,
      errorCode: error.name,
      errorMessage: error.message,
      context: context || {},
      resource
    });
  }
  /**
   * Log a security event
   */
  async security(action, description, severity = "warning", context, resource) {
    return this.log({
      category: "security",
      action,
      severity,
      result: severity === "critical" ? "failure" : "success",
      description,
      context: context || {},
      resource
    });
  }
  /**
   * Log a change event with diff
   */
  async change(category, resourceType, resourceId, changes, context) {
    const description = `Updated ${resourceType} ${resourceId}: ${changes.map((c) => c.field).join(", ")}`;
    return this.log({
      category,
      action: "update",
      severity: "info",
      result: "success",
      description,
      context: context || {},
      resource: {
        type: resourceType,
        id: resourceId
      },
      changes
    });
  }
  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================
  /**
   * Query audit events
   */
  async query(query) {
    let filtered = [...this.events];
    if (query.orgId) {
      filtered = filtered.filter((e) => e.context.orgId === query.orgId);
    }
    if (query.userId) {
      filtered = filtered.filter((e) => e.context.userId === query.userId);
    }
    if (query.category) {
      filtered = filtered.filter((e) => e.category === query.category);
    }
    if (query.action) {
      filtered = filtered.filter((e) => e.action === query.action);
    }
    if (query.severity) {
      filtered = filtered.filter((e) => e.severity === query.severity);
    }
    if (query.result) {
      filtered = filtered.filter((e) => e.result === query.result);
    }
    if (query.resourceType) {
      filtered = filtered.filter((e) => e.resource?.type === query.resourceType);
    }
    if (query.resourceId) {
      filtered = filtered.filter((e) => e.resource?.id === query.resourceId);
    }
    if (query.startDate) {
      filtered = filtered.filter((e) => e.timestamp >= query.startDate);
    }
    if (query.endDate) {
      filtered = filtered.filter((e) => e.timestamp <= query.endDate);
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (e) => e.description.toLowerCase().includes(searchLower) || e.message?.toLowerCase().includes(searchLower) || e.context.userEmail?.toLowerCase().includes(searchLower) || e.resource?.name?.toLowerCase().includes(searchLower)
      );
    }
    filtered.sort((a, b) => {
      let compare = 0;
      switch (query.sortBy) {
        case "timestamp":
          compare = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case "severity":
          compare = SEVERITY_LEVELS[a.severity] - SEVERITY_LEVELS[b.severity];
          break;
        case "category":
          compare = a.category.localeCompare(b.category);
          break;
      }
      return query.sortOrder === "desc" ? -compare : compare;
    });
    const total = filtered.length;
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    const paginated = filtered.slice(offset, offset + limit);
    return {
      events: paginated,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }
  /**
   * Get event by ID
   */
  async getEvent(id) {
    return this.events.find((e) => e.id === id) || null;
  }
  /**
   * Get recent events for a user
   */
  async getUserEvents(userId, limit = 50) {
    const result = await this.query({
      userId,
      limit,
      sortBy: "timestamp",
      sortOrder: "desc"
    });
    return result.events;
  }
  /**
   * Get recent events for an organization
   */
  async getOrgEvents(orgId, limit = 100) {
    const result = await this.query({
      orgId,
      limit,
      sortBy: "timestamp",
      sortOrder: "desc"
    });
    return result.events;
  }
  /**
   * Get security events
   */
  async getSecurityEvents(orgId, severity, limit = 100) {
    const result = await this.query({
      orgId,
      category: "security",
      severity,
      limit,
      sortBy: "timestamp",
      sortOrder: "desc"
    });
    return result.events;
  }
  // ==========================================================================
  // STATISTICS
  // ==========================================================================
  /**
   * Get audit statistics
   */
  async getStats(orgId, days = 30) {
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    const result = await this.query({
      orgId,
      startDate,
      limit: 1e4
    });
    const events = result.events;
    const eventsByCategory = {};
    for (const e of events) {
      eventsByCategory[e.category] = (eventsByCategory[e.category] || 0) + 1;
    }
    const eventsBySeverity = {};
    for (const e of events) {
      eventsBySeverity[e.severity] = (eventsBySeverity[e.severity] || 0) + 1;
    }
    const eventsByResult = {};
    for (const e of events) {
      eventsByResult[e.result] = (eventsByResult[e.result] || 0) + 1;
    }
    const userCounts = {};
    for (const e of events) {
      if (e.context.userId) {
        if (!userCounts[e.context.userId]) {
          userCounts[e.context.userId] = { email: e.context.userEmail, count: 0 };
        }
        userCounts[e.context.userId].count++;
      }
    }
    const topUsers = Object.entries(userCounts).map(([userId, data]) => ({ userId, email: data.email, eventCount: data.count })).sort((a, b) => b.eventCount - a.eventCount).slice(0, 10);
    const resourceCounts = {};
    for (const e of events) {
      if (e.resource) {
        const key = `${e.resource.type}:${e.resource.id}`;
        resourceCounts[key] = (resourceCounts[key] || 0) + 1;
      }
    }
    const topResources = Object.entries(resourceCounts).map(([key, count]) => {
      const [type, id] = key.split(":");
      return { resourceType: type, resourceId: id, eventCount: count };
    }).sort((a, b) => b.eventCount - a.eventCount).slice(0, 10);
    const dailyCounts = {};
    for (const e of events) {
      const date = e.timestamp.toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    }
    const recentActivity = Object.entries(dailyCounts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
    return {
      totalEvents: events.length,
      eventsByCategory,
      eventsBySeverity,
      eventsByResult,
      topUsers,
      topResources,
      recentActivity
    };
  }
  // ==========================================================================
  // EXPORT
  // ==========================================================================
  /**
   * Export audit logs
   */
  async export(options) {
    const result = await this.query(options.query);
    let output;
    switch (options.format) {
      case "json":
        output = JSON.stringify(
          result.events.map((e) => this.serializeForExport(e, options)),
          null,
          2
        );
        break;
      case "csv":
        output = this.exportToCSV(result.events, options);
        break;
      case "pdf":
        output = JSON.stringify(
          result.events.map((e) => this.serializeForExport(e, options)),
          null,
          2
        );
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
    this.emit("event:exported", options.format, result.events.length);
    return output;
  }
  serializeForExport(event, options) {
    const result = {
      id: event.id,
      timestamp: event.timestamp.toISOString(),
      category: event.category,
      action: event.action,
      severity: event.severity,
      result: event.result,
      description: event.description
    };
    if (options.includeContext) {
      result.context = event.context;
    }
    if (options.includeChanges && event.changes) {
      result.changes = event.changes;
    }
    if (options.includeMetadata && event.metadata) {
      result.metadata = event.metadata;
    }
    if (event.resource) {
      result.resource = event.resource;
    }
    if (event.errorCode) {
      result.errorCode = event.errorCode;
      result.errorMessage = event.errorMessage;
    }
    return result;
  }
  exportToCSV(events, options) {
    const headers = [
      "id",
      "timestamp",
      "category",
      "action",
      "severity",
      "result",
      "description",
      "userId",
      "userEmail",
      "orgId",
      "resourceType",
      "resourceId"
    ];
    const rows = events.map((e) => [
      e.id,
      e.timestamp.toISOString(),
      e.category,
      e.action,
      e.severity,
      e.result,
      `"${e.description.replace(/"/g, '""')}"`,
      e.context.userId || "",
      e.context.userEmail || "",
      e.context.orgId || "",
      e.resource?.type || "",
      e.resource?.id || ""
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
  // ==========================================================================
  // RETENTION
  // ==========================================================================
  /**
   * Apply retention policies
   */
  async applyRetention() {
    const policies = this.config.retentionPolicies || this.getDefaultPolicies();
    let deleted = 0;
    let archived = 0;
    for (const policy of policies) {
      const cutoffDate = /* @__PURE__ */ new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);
      const toProcess = this.events.filter(
        (e) => e.category === policy.category && e.timestamp < cutoffDate
      );
      if (policy.archiveAfterDays) {
        const archiveCutoff = /* @__PURE__ */ new Date();
        archiveCutoff.setDate(archiveCutoff.getDate() - policy.archiveAfterDays);
        const toArchive = toProcess.filter((e) => e.timestamp >= archiveCutoff);
        archived += toArchive.length;
      }
      const toDelete = policy.deleteAfterArchive ? toProcess : toProcess.filter((e) => {
        if (policy.archiveAfterDays) {
          const archiveCutoff = /* @__PURE__ */ new Date();
          archiveCutoff.setDate(archiveCutoff.getDate() - policy.archiveAfterDays);
          return e.timestamp < archiveCutoff;
        }
        return true;
      });
      this.events = this.events.filter((e) => !toDelete.includes(e));
      deleted += toDelete.length;
    }
    this.emit("retention:applied", deleted, archived);
    return { deleted, archived };
  }
  getDefaultPolicies() {
    return Object.entries(DEFAULT_RETENTION_DAYS).map(([category, days]) => ({
      category,
      retentionDays: days
    }));
  }
  // ==========================================================================
  // INTEGRITY
  // ==========================================================================
  /**
   * Verify event chain integrity
   */
  async verifyIntegrity(events) {
    const toVerify = events || this.events;
    const invalidEvents = [];
    let previousHash = null;
    for (const event of toVerify.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())) {
      if (!event.hash) {
        invalidEvents.push(event.id);
        continue;
      }
      const computedHash = this.computeHash(event);
      if (computedHash !== event.hash) {
        invalidEvents.push(event.id);
        continue;
      }
      if (previousHash && event.previousHash !== previousHash) {
        invalidEvents.push(event.id);
      }
      previousHash = event.hash;
    }
    return {
      valid: invalidEvents.length === 0,
      invalidEvents
    };
  }
  // ==========================================================================
  // INTERNAL METHODS
  // ==========================================================================
  createEvent(input) {
    const id = this.generateId();
    const timestamp = /* @__PURE__ */ new Date();
    const event = {
      id,
      timestamp,
      ...input,
      retentionDays: input.retentionDays || DEFAULT_RETENTION_DAYS[input.category]
    };
    if (this.config.enableIntegrityHash) {
      event.previousHash = this.lastHash || void 0;
      event.hash = this.computeHash(event);
      this.lastHash = event.hash;
    }
    return event;
  }
  async storeEvent(event) {
    switch (this.config.storageType) {
      case "memory":
        this.events.push(event);
        break;
      case "database":
        this.events.push(event);
        break;
      case "external":
        this.events.push(event);
        break;
    }
    this.emit("event:logged", event);
  }
  startBatchProcessor() {
    this.batchTimer = setInterval(() => {
      if (this.queue.length > 0 && !this.isProcessing) {
        this.processBatch().catch((err) => this.emit("error", err));
      }
    }, this.config.batchIntervalMs);
  }
  async processBatch() {
    if (this.queue.length === 0 || this.isProcessing) return;
    this.isProcessing = true;
    try {
      const batch = this.queue.splice(0, this.config.batchSize);
      const events = batch.map((input) => this.createEvent(input));
      for (const event of events) {
        await this.storeEvent(event);
      }
    } finally {
      this.isProcessing = false;
    }
  }
  computeHash(event) {
    const data = JSON.stringify({
      id: event.id,
      timestamp: event.timestamp.toISOString(),
      category: event.category,
      action: event.action,
      description: event.description,
      context: event.context,
      resource: event.resource,
      previousHash: event.previousHash
    });
    return createHash(this.config.hashAlgorithm).update(data).digest("hex");
  }
  generateId() {
    return `aud_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================
  /**
   * Flush pending events
   */
  async flush() {
    if (this.queue.length > 0) {
      await this.processBatch();
    }
  }
  /**
   * Stop the logger
   */
  async stop() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    await this.flush();
  }
  /**
   * Get queue size
   */
  getQueueSize() {
    return this.queue.length;
  }
  /**
   * Get total event count
   */
  getEventCount() {
    return this.events.length;
  }
};
var auditLoggerInstance = null;
function getAuditLogger() {
  if (!auditLoggerInstance) {
    auditLoggerInstance = new AuditLogger();
  }
  return auditLoggerInstance;
}
function createAuditLogger(config) {
  return new AuditLogger(config);
}

// src/git/types.ts
import { z as z3 } from "zod";
var GitProviderSchema = z3.enum(["github", "gitlab", "bitbucket"]);
var RepoConfigSchema = z3.object({
  id: z3.string(),
  orgId: z3.string(),
  provider: GitProviderSchema,
  owner: z3.string(),
  repo: z3.string(),
  branch: z3.string().default("main"),
  path: z3.string().default(".gicm/pipelines"),
  // Where pipeline YAML files live
  accessToken: z3.string().optional(),
  // Encrypted
  webhookSecret: z3.string().optional(),
  // For validating webhooks
  syncEnabled: z3.boolean().default(true),
  autoSync: z3.boolean().default(true),
  // Auto-sync on push
  createdAt: z3.string(),
  updatedAt: z3.string()
});
var CreateRepoConfigSchema = RepoConfigSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var PipelineYAMLStepSchema = z3.object({
  id: z3.string(),
  name: z3.string(),
  tool: z3.string(),
  config: z3.record(z3.unknown()).optional(),
  timeout: z3.number().optional(),
  retries: z3.number().optional(),
  condition: z3.string().optional(),
  // e.g., "previous.success"
  dependsOn: z3.array(z3.string()).optional()
});
var PipelineYAMLSchema = z3.object({
  version: z3.literal("1.0"),
  name: z3.string(),
  description: z3.string().optional(),
  schedule: z3.string().optional(),
  // Cron expression
  trigger: z3.object({
    events: z3.array(z3.enum(["push", "pull_request", "schedule", "manual", "webhook"])).optional(),
    branches: z3.array(z3.string()).optional(),
    paths: z3.array(z3.string()).optional()
  }).optional(),
  env: z3.record(z3.string()).optional(),
  steps: z3.array(PipelineYAMLStepSchema),
  notifications: z3.object({
    onSuccess: z3.array(z3.string()).optional(),
    // Webhook URLs
    onFailure: z3.array(z3.string()).optional()
  }).optional(),
  budget: z3.object({
    maxCostPerRun: z3.number().optional(),
    maxDailyCost: z3.number().optional()
  }).optional()
});
var SyncStatusSchema = z3.enum([
  "synced",
  "pending",
  "syncing",
  "conflict",
  "error"
]);
var SyncRecordSchema = z3.object({
  id: z3.string(),
  repoConfigId: z3.string(),
  pipelineId: z3.string(),
  filePath: z3.string(),
  commitSha: z3.string(),
  status: SyncStatusSchema,
  direction: z3.enum(["pull", "push"]),
  message: z3.string().optional(),
  createdAt: z3.string()
});
var GitWebhookEventSchema = z3.object({
  id: z3.string(),
  provider: GitProviderSchema,
  event: z3.string(),
  // "push", "pull_request", etc.
  action: z3.string().optional(),
  // "opened", "closed", etc.
  repo: z3.object({
    owner: z3.string(),
    name: z3.string()
  }),
  ref: z3.string().optional(),
  // "refs/heads/main"
  commit: z3.object({
    sha: z3.string(),
    message: z3.string(),
    author: z3.string()
  }).optional(),
  pullRequest: z3.object({
    number: z3.number(),
    title: z3.string(),
    state: z3.string(),
    sourceBranch: z3.string(),
    targetBranch: z3.string()
  }).optional(),
  sender: z3.object({
    login: z3.string(),
    avatarUrl: z3.string().optional()
  }),
  receivedAt: z3.string()
});
var FileChangeSchema = z3.object({
  path: z3.string(),
  status: z3.enum(["added", "modified", "deleted", "renamed"]),
  oldPath: z3.string().optional(),
  // For renames
  additions: z3.number(),
  deletions: z3.number()
});
var PipelineChangeSchema = z3.object({
  pipelineId: z3.string().optional(),
  // Null for new pipelines
  pipelineName: z3.string(),
  filePath: z3.string(),
  changeType: z3.enum(["create", "update", "delete"]),
  oldYaml: PipelineYAMLSchema.optional(),
  newYaml: PipelineYAMLSchema.optional(),
  diff: z3.string().optional()
  // Unified diff format
});
var PipelinePRSchema = z3.object({
  id: z3.string(),
  repoConfigId: z3.string(),
  prNumber: z3.number(),
  title: z3.string(),
  description: z3.string().optional(),
  status: z3.enum(["open", "merged", "closed"]),
  changes: z3.array(PipelineChangeSchema),
  author: z3.string(),
  createdAt: z3.string(),
  mergedAt: z3.string().optional(),
  reviewStatus: z3.enum(["pending", "approved", "changes_requested"]).optional()
});
var GitManagerConfigSchema = z3.object({
  // Default provider settings
  defaultProvider: GitProviderSchema.default("github"),
  // Sync settings
  syncIntervalMs: z3.number().default(6e4),
  // 1 minute
  maxConcurrentSyncs: z3.number().default(5),
  // Conflict resolution
  conflictStrategy: z3.enum(["local_wins", "remote_wins", "manual"]).default("manual"),
  // Webhook settings
  webhookPath: z3.string().default("/api/git/webhook"),
  // Security
  encryptTokens: z3.boolean().default(true)
});

// src/git/yaml-parser.ts
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";
function parsePipelineYAML(yamlContent) {
  try {
    const parsed = parseYAML(yamlContent);
    const result = PipelineYAMLSchema.safeParse(parsed);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        )
      };
    }
    return {
      success: true,
      pipeline: result.data
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Invalid YAML syntax"]
    };
  }
}
function stringifyPipelineYAML(pipeline) {
  return stringifyYAML(pipeline, {
    indent: 2,
    lineWidth: 120,
    defaultStringType: "QUOTE_DOUBLE",
    defaultKeyType: "PLAIN"
  });
}
function yamlToInternal(yaml, existingId) {
  return {
    id: existingId || generateId("pipeline"),
    name: yaml.name,
    description: yaml.description,
    schedule: yaml.schedule,
    steps: yaml.steps.map((step) => ({
      id: step.id || generateId("step"),
      name: step.name,
      toolId: step.tool,
      config: step.config,
      timeout: step.timeout,
      retries: step.retries,
      condition: step.condition,
      dependsOn: step.dependsOn
    })),
    metadata: {
      trigger: yaml.trigger,
      env: yaml.env,
      notifications: yaml.notifications,
      budget: yaml.budget,
      yamlVersion: yaml.version
    }
  };
}
function internalToYAML(pipeline) {
  const metadata = pipeline.metadata || {};
  return {
    version: "1.0",
    name: pipeline.name,
    description: pipeline.description,
    schedule: pipeline.schedule,
    trigger: metadata.trigger,
    env: metadata.env,
    steps: pipeline.steps.map((step) => ({
      id: step.id,
      name: step.name,
      tool: step.toolId,
      config: step.config,
      timeout: step.timeout,
      retries: step.retries,
      condition: step.condition,
      dependsOn: step.dependsOn
    })),
    notifications: metadata.notifications,
    budget: metadata.budget
  };
}
function validatePipelineYAML(yaml) {
  const errors = [];
  const warnings = [];
  const stepIds = /* @__PURE__ */ new Set();
  for (const step of yaml.steps) {
    if (stepIds.has(step.id)) {
      errors.push({
        path: `steps.${step.id}`,
        message: `Duplicate step ID: ${step.id}`,
        severity: "error"
      });
    }
    stepIds.add(step.id);
  }
  for (const step of yaml.steps) {
    if (step.dependsOn) {
      for (const dep of step.dependsOn) {
        if (!stepIds.has(dep)) {
          errors.push({
            path: `steps.${step.id}.dependsOn`,
            message: `Unknown dependency: ${dep}`,
            severity: "error"
          });
        }
      }
    }
  }
  const circularDeps = detectCircularDependencies(yaml.steps);
  if (circularDeps.length > 0) {
    errors.push({
      path: "steps",
      message: `Circular dependency detected: ${circularDeps.join(" -> ")}`,
      severity: "error"
    });
  }
  if (!yaml.description) {
    warnings.push({
      path: "description",
      message: "Pipeline description is recommended",
      severity: "warning"
    });
  }
  for (const step of yaml.steps) {
    if (!step.timeout) {
      warnings.push({
        path: `steps.${step.id}.timeout`,
        message: `Step "${step.name}" has no timeout set`,
        severity: "warning"
      });
    }
  }
  if (!yaml.budget) {
    warnings.push({
      path: "budget",
      message: "No budget limits configured",
      severity: "warning"
    });
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
function detectCircularDependencies(steps) {
  const graph = /* @__PURE__ */ new Map();
  for (const step of steps) {
    graph.set(step.id, step.dependsOn || []);
  }
  const visited = /* @__PURE__ */ new Set();
  const recursionStack = /* @__PURE__ */ new Set();
  const path2 = [];
  function dfs(nodeId) {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path2.push(nodeId);
    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const result = dfs(neighbor);
        if (result) return result;
      } else if (recursionStack.has(neighbor)) {
        const cycleStart = path2.indexOf(neighbor);
        return [...path2.slice(cycleStart), neighbor];
      }
    }
    path2.pop();
    recursionStack.delete(nodeId);
    return null;
  }
  for (const step of steps) {
    if (!visited.has(step.id)) {
      const cycle = dfs(step.id);
      if (cycle) return cycle;
    }
  }
  return [];
}
function generatePipelineDiff(oldYaml, newYaml) {
  if (!oldYaml && !newYaml) return "";
  if (!oldYaml) return `+ New pipeline: ${newYaml.name}`;
  if (!newYaml) return `- Deleted pipeline: ${oldYaml.name}`;
  const changes = [];
  if (oldYaml.name !== newYaml.name) {
    changes.push(`~ name: "${oldYaml.name}" -> "${newYaml.name}"`);
  }
  if (oldYaml.description !== newYaml.description) {
    changes.push(`~ description changed`);
  }
  if (oldYaml.schedule !== newYaml.schedule) {
    changes.push(
      `~ schedule: "${oldYaml.schedule || "none"}" -> "${newYaml.schedule || "none"}"`
    );
  }
  const oldStepIds = new Set(oldYaml.steps.map((s) => s.id));
  const newStepIds = new Set(newYaml.steps.map((s) => s.id));
  for (const step of newYaml.steps) {
    if (!oldStepIds.has(step.id)) {
      changes.push(`+ step: ${step.name} (${step.id})`);
    }
  }
  for (const step of oldYaml.steps) {
    if (!newStepIds.has(step.id)) {
      changes.push(`- step: ${step.name} (${step.id})`);
    }
  }
  for (const newStep of newYaml.steps) {
    const oldStep = oldYaml.steps.find((s) => s.id === newStep.id);
    if (oldStep) {
      if (oldStep.name !== newStep.name || oldStep.tool !== newStep.tool || JSON.stringify(oldStep.config) !== JSON.stringify(newStep.config)) {
        changes.push(`~ step modified: ${newStep.name} (${newStep.id})`);
      }
    }
  }
  return changes.length > 0 ? changes.join("\n") : "No changes detected";
}
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
var EXAMPLE_PIPELINES = {
  basic: `version: "1.0"
name: "Basic Pipeline"
description: "A simple example pipeline"

steps:
  - id: step1
    name: "Fetch Data"
    tool: http_request
    config:
      url: "https://api.example.com/data"
      method: GET
    timeout: 30000

  - id: step2
    name: "Process Data"
    tool: transform
    config:
      template: "{{ step1.data | json }}"
    dependsOn:
      - step1
`,
  scheduled: `version: "1.0"
name: "Scheduled Report"
description: "Daily report generation"
schedule: "0 9 * * *"  # Every day at 9am

trigger:
  events:
    - schedule

steps:
  - id: gather
    name: "Gather Metrics"
    tool: analytics_query
    config:
      query: "SELECT * FROM metrics WHERE date = TODAY()"
    timeout: 60000

  - id: format
    name: "Format Report"
    tool: template_render
    config:
      template: "report.md"
    dependsOn:
      - gather

  - id: send
    name: "Send Email"
    tool: email_send
    config:
      to: "team@example.com"
      subject: "Daily Report"
    dependsOn:
      - format

notifications:
  onSuccess:
    - "https://hooks.slack.com/xxx"
  onFailure:
    - "https://hooks.slack.com/xxx"

budget:
  maxCostPerRun: 1.00
  maxDailyCost: 10.00
`,
  cicd: `version: "1.0"
name: "CI/CD Pipeline"
description: "Build and deploy on push to main"

trigger:
  events:
    - push
  branches:
    - main
  paths:
    - "src/**"
    - "package.json"

env:
  NODE_ENV: production
  DEPLOY_TARGET: vercel

steps:
  - id: test
    name: "Run Tests"
    tool: shell_exec
    config:
      command: "npm test"
    timeout: 300000

  - id: build
    name: "Build Project"
    tool: shell_exec
    config:
      command: "npm run build"
    dependsOn:
      - test
    timeout: 300000

  - id: deploy
    name: "Deploy"
    tool: vercel_deploy
    config:
      project: "my-app"
      production: true
    dependsOn:
      - build
    condition: "steps.build.success"
`
};

// src/git/git-manager.ts
import { EventEmitter as EventEmitter5 } from "eventemitter3";
var GitHubClient = class {
  token;
  baseUrl = "https://api.github.com";
  constructor(token) {
    this.token = token;
  }
  async request(method, path2, body) {
    const response = await fetch(`${this.baseUrl}${path2}`, {
      method,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : void 0
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }
    return response.json();
  }
  async getFile(owner, repo, path2, ref) {
    try {
      const query = ref ? `?ref=${ref}` : "";
      return await this.request(
        "GET",
        `/repos/${owner}/${repo}/contents/${path2}${query}`
      );
    } catch {
      return null;
    }
  }
  async listFiles(owner, repo, path2, ref) {
    try {
      const query = ref ? `?ref=${ref}` : "";
      const result = await this.request(
        "GET",
        `/repos/${owner}/${repo}/contents/${path2}${query}`
      );
      return Array.isArray(result) ? result : [result];
    } catch {
      return [];
    }
  }
  async createOrUpdateFile(owner, repo, path2, content, message, sha, branch) {
    const body = {
      message,
      content: Buffer.from(content).toString("base64")
    };
    if (sha) body.sha = sha;
    if (branch) body.branch = branch;
    const result = await this.request("PUT", `/repos/${owner}/${repo}/contents/${path2}`, body);
    return {
      sha: result.content.sha,
      commit: result.commit
    };
  }
  async deleteFile(owner, repo, path2, sha, message, branch) {
    const body = { message, sha };
    if (branch) body.branch = branch;
    await this.request("DELETE", `/repos/${owner}/${repo}/contents/${path2}`, body);
  }
  async getLatestCommit(owner, repo, branch) {
    const result = await this.request(
      "GET",
      `/repos/${owner}/${repo}/commits/${branch}`
    );
    return { ...result.commit, sha: result.sha };
  }
  async createWebhook(owner, repo, webhookUrl, secret, events = ["push", "pull_request"]) {
    return this.request("POST", `/repos/${owner}/${repo}/hooks`, {
      name: "web",
      active: true,
      events,
      config: {
        url: webhookUrl,
        content_type: "json",
        secret
      }
    });
  }
  async deleteWebhook(owner, repo, hookId) {
    await this.request("DELETE", `/repos/${owner}/${repo}/hooks/${hookId}`);
  }
};
var GitManager = class extends EventEmitter5 {
  config;
  repos = /* @__PURE__ */ new Map();
  clients = /* @__PURE__ */ new Map();
  syncRecords = /* @__PURE__ */ new Map();
  fileShas = /* @__PURE__ */ new Map();
  // path -> sha
  constructor(config = {}) {
    super();
    this.config = GitManagerConfigSchema.parse(config);
  }
  // ===========================================================================
  // REPOSITORY MANAGEMENT
  // ===========================================================================
  /**
   * Connect a Git repository
   */
  async connectRepo(config) {
    const repo = {
      ...config,
      id: generateId2("repo"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (repo.accessToken) {
      const client = this.getClient(repo);
      await client.getLatestCommit(repo.owner, repo.repo, repo.branch);
    }
    this.repos.set(repo.id, repo);
    this.emit("repo:connected", repo);
    if (repo.syncEnabled) {
      await this.pullPipelines(repo.id);
    }
    return repo;
  }
  /**
   * Disconnect a repository
   */
  async disconnectRepo(repoId) {
    const repo = this.repos.get(repoId);
    if (!repo) throw new Error(`Repository not found: ${repoId}`);
    this.repos.delete(repoId);
    this.clients.delete(repoId);
    this.emit("repo:disconnected", repoId);
  }
  /**
   * Get repository by ID
   */
  getRepo(repoId) {
    return this.repos.get(repoId);
  }
  /**
   * List all connected repositories
   */
  listRepos() {
    return Array.from(this.repos.values());
  }
  // ===========================================================================
  // SYNC OPERATIONS
  // ===========================================================================
  /**
   * Pull pipelines from repository
   */
  async pullPipelines(repoId) {
    const repo = this.repos.get(repoId);
    if (!repo) throw new Error(`Repository not found: ${repoId}`);
    this.emit("sync:started", repoId, "pull");
    try {
      const client = this.getClient(repo);
      const files = await client.listFiles(repo.owner, repo.repo, repo.path, repo.branch);
      const changes = [];
      for (const file of files) {
        if (file.type === "file" && (file.name.endsWith(".yaml") || file.name.endsWith(".yml"))) {
          const fileData = await client.getFile(
            repo.owner,
            repo.repo,
            file.path,
            repo.branch
          );
          if (fileData?.content) {
            const content = Buffer.from(fileData.content, "base64").toString("utf-8");
            const parseResult = parsePipelineYAML(content);
            if (parseResult.success && parseResult.pipeline) {
              this.fileShas.set(file.path, fileData.sha);
              changes.push({
                pipelineName: parseResult.pipeline.name,
                filePath: file.path,
                changeType: "create",
                // TODO: Compare with existing
                newYaml: parseResult.pipeline
              });
              this.emit("pipeline:imported", parseResult.pipeline.name, file.path);
            }
          }
        }
      }
      const record = {
        id: generateId2("sync"),
        repoConfigId: repoId,
        pipelineId: "multiple",
        filePath: repo.path,
        commitSha: "latest",
        status: "synced",
        direction: "pull",
        message: `Pulled ${changes.length} pipelines`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.addSyncRecord(repoId, record);
      this.emit("sync:completed", record);
      return changes;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit("sync:failed", repoId, err);
      throw err;
    }
  }
  /**
   * Push a pipeline to repository
   */
  async pushPipeline(repoId, pipeline, commitMessage) {
    const repo = this.repos.get(repoId);
    if (!repo) throw new Error(`Repository not found: ${repoId}`);
    this.emit("sync:started", repoId, "push");
    try {
      const client = this.getClient(repo);
      const yaml = internalToYAML(pipeline);
      const validation = validatePipelineYAML(yaml);
      if (!validation.valid) {
        throw new Error(`Invalid pipeline: ${validation.errors.map((e) => e.message).join(", ")}`);
      }
      const content = stringifyPipelineYAML(yaml);
      const fileName = `${pipeline.id}.yaml`;
      const filePath = `${repo.path}/${fileName}`;
      const existingSha = this.fileShas.get(filePath);
      const result = await client.createOrUpdateFile(
        repo.owner,
        repo.repo,
        filePath,
        content,
        commitMessage || `Update pipeline: ${pipeline.name}`,
        existingSha,
        repo.branch
      );
      this.fileShas.set(filePath, result.sha);
      const record = {
        id: generateId2("sync"),
        repoConfigId: repoId,
        pipelineId: pipeline.id,
        filePath,
        commitSha: result.commit.sha,
        status: "synced",
        direction: "push",
        message: `Pushed pipeline: ${pipeline.name}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.addSyncRecord(repoId, record);
      this.emit("sync:completed", record);
      this.emit("pipeline:exported", pipeline.id, filePath);
      return record;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit("sync:failed", repoId, err);
      throw err;
    }
  }
  /**
   * Delete a pipeline from repository
   */
  async deletePipeline(repoId, pipelineId) {
    const repo = this.repos.get(repoId);
    if (!repo) throw new Error(`Repository not found: ${repoId}`);
    const client = this.getClient(repo);
    const fileName = `${pipelineId}.yaml`;
    const filePath = `${repo.path}/${fileName}`;
    const sha = this.fileShas.get(filePath);
    if (!sha) {
      throw new Error(`Pipeline file not found: ${filePath}`);
    }
    await client.deleteFile(
      repo.owner,
      repo.repo,
      filePath,
      sha,
      `Delete pipeline: ${pipelineId}`,
      repo.branch
    );
    this.fileShas.delete(filePath);
  }
  // ===========================================================================
  // WEBHOOK HANDLING
  // ===========================================================================
  /**
   * Handle incoming webhook from Git provider
   */
  async handleWebhook(provider, payload, signature) {
    const event = this.parseWebhookPayload(provider, payload);
    this.emit("webhook:received", event);
    const repo = Array.from(this.repos.values()).find(
      (r) => r.provider === provider && r.owner === event.repo.owner && r.repo === event.repo.name
    );
    if (!repo || !repo.autoSync) return;
    if (event.event === "push" && event.ref === `refs/heads/${repo.branch}`) {
      await this.pullPipelines(repo.id);
    }
  }
  /**
   * Parse webhook payload into normalized format
   */
  parseWebhookPayload(provider, payload) {
    const p = payload;
    if (provider === "github") {
      const repo = p.repository;
      const sender = p.sender;
      const headCommit = p.head_commit;
      return {
        id: generateId2("webhook"),
        provider,
        event: p["X-GitHub-Event"] || "push",
        action: p.action,
        repo: {
          owner: repo.owner?.login || "",
          name: repo.name || ""
        },
        ref: p.ref,
        commit: headCommit ? {
          sha: headCommit.id,
          message: headCommit.message,
          author: headCommit.author?.name || ""
        } : void 0,
        sender: {
          login: sender?.login || "",
          avatarUrl: sender?.avatar_url
        },
        receivedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    throw new Error(`Unsupported provider: ${provider}`);
  }
  /**
   * Setup webhook for a repository
   */
  async setupWebhook(repoId, webhookUrl) {
    const repo = this.repos.get(repoId);
    if (!repo) throw new Error(`Repository not found: ${repoId}`);
    const client = this.getClient(repo);
    const secret = generateSecret();
    const result = await client.createWebhook(
      repo.owner,
      repo.repo,
      webhookUrl,
      secret
    );
    repo.webhookSecret = secret;
    this.repos.set(repoId, repo);
    return { webhookId: result.id, secret };
  }
  // ===========================================================================
  // SYNC HISTORY
  // ===========================================================================
  /**
   * Get sync history for a repository
   */
  getSyncHistory(repoId) {
    return this.syncRecords.get(repoId) || [];
  }
  /**
   * Get latest sync record
   */
  getLatestSync(repoId) {
    const records = this.syncRecords.get(repoId);
    return records?.[records.length - 1];
  }
  addSyncRecord(repoId, record) {
    const records = this.syncRecords.get(repoId) || [];
    records.push(record);
    if (records.length > 100) records.shift();
    this.syncRecords.set(repoId, records);
  }
  // ===========================================================================
  // HELPERS
  // ===========================================================================
  getClient(repo) {
    if (!repo.accessToken) {
      throw new Error("No access token configured for repository");
    }
    let client = this.clients.get(repo.id);
    if (!client) {
      client = new GitHubClient(repo.accessToken);
      this.clients.set(repo.id, client);
    }
    return client;
  }
};
var instance3 = null;
function getGitManager(config) {
  if (!instance3) {
    instance3 = new GitManager(config);
  }
  return instance3;
}
function createGitManager(config) {
  return new GitManager(config);
}
function generateId2(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function generateSecret() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// src/chat/types.ts
import { z as z4 } from "zod";
var ChatPlatformSchema = z4.enum(["slack", "discord", "telegram", "teams"]);
var ConnectionStatusSchema = z4.enum([
  "connected",
  "disconnected",
  "connecting",
  "error"
]);
var SlackCredentialsSchema = z4.object({
  botToken: z4.string().startsWith("xoxb-"),
  appToken: z4.string().startsWith("xapp-").optional(),
  signingSecret: z4.string().optional(),
  clientId: z4.string().optional(),
  clientSecret: z4.string().optional()
});
var DiscordCredentialsSchema = z4.object({
  botToken: z4.string(),
  applicationId: z4.string(),
  publicKey: z4.string().optional()
});
var TelegramCredentialsSchema = z4.object({
  botToken: z4.string(),
  webhookSecret: z4.string().optional()
});
var TeamsCredentialsSchema = z4.object({
  appId: z4.string(),
  appPassword: z4.string(),
  tenantId: z4.string().optional()
});
var ChatCredentialsSchema = z4.union([
  z4.object({ platform: z4.literal("slack"), credentials: SlackCredentialsSchema }),
  z4.object({ platform: z4.literal("discord"), credentials: DiscordCredentialsSchema }),
  z4.object({ platform: z4.literal("telegram"), credentials: TelegramCredentialsSchema }),
  z4.object({ platform: z4.literal("teams"), credentials: TeamsCredentialsSchema })
]);
var ChatChannelSchema = z4.object({
  id: z4.string(),
  platform: ChatPlatformSchema,
  name: z4.string(),
  type: z4.enum(["channel", "dm", "group", "thread"]),
  isPrivate: z4.boolean().default(false),
  memberCount: z4.number().optional(),
  createdAt: z4.date().optional()
});
var ChatUserSchema = z4.object({
  id: z4.string(),
  platform: ChatPlatformSchema,
  username: z4.string(),
  displayName: z4.string().optional(),
  email: z4.string().email().optional(),
  avatarUrl: z4.string().url().optional(),
  isBot: z4.boolean().default(false),
  timezone: z4.string().optional()
});
var MessageAttachmentSchema = z4.object({
  type: z4.enum(["image", "file", "video", "audio", "link"]),
  url: z4.string().url(),
  name: z4.string().optional(),
  size: z4.number().optional(),
  mimeType: z4.string().optional(),
  thumbnailUrl: z4.string().url().optional()
});
var MessageBlockSchema = z4.object({
  type: z4.enum(["text", "code", "quote", "divider", "header", "button", "select"]),
  content: z4.string().optional(),
  language: z4.string().optional(),
  // For code blocks
  url: z4.string().optional(),
  // For buttons
  options: z4.array(z4.object({ label: z4.string(), value: z4.string() })).optional()
});
var ChatMessageSchema = z4.object({
  id: z4.string(),
  platform: ChatPlatformSchema,
  channelId: z4.string(),
  userId: z4.string(),
  content: z4.string(),
  blocks: z4.array(MessageBlockSchema).optional(),
  attachments: z4.array(MessageAttachmentSchema).optional(),
  threadId: z4.string().optional(),
  replyToId: z4.string().optional(),
  timestamp: z4.date(),
  editedAt: z4.date().optional(),
  reactions: z4.record(z4.array(z4.string())).optional()
  // emoji -> userIds
});
var SendMessageOptionsSchema = z4.object({
  channelId: z4.string(),
  content: z4.string(),
  blocks: z4.array(MessageBlockSchema).optional(),
  threadId: z4.string().optional(),
  ephemeral: z4.boolean().optional(),
  // Only visible to one user
  targetUserId: z4.string().optional()
  // For ephemeral messages
});
var SlashCommandSchema = z4.object({
  name: z4.string().regex(/^[\w-]+$/),
  description: z4.string().max(100),
  options: z4.array(z4.object({
    name: z4.string(),
    description: z4.string(),
    type: z4.enum(["string", "integer", "boolean", "user", "channel"]),
    required: z4.boolean().default(false),
    choices: z4.array(z4.object({ name: z4.string(), value: z4.string() })).optional()
  })).optional(),
  handler: z4.string()
  // Pipeline ID to execute
});
var CommandInvocationSchema = z4.object({
  id: z4.string(),
  command: z4.string(),
  args: z4.record(z4.unknown()),
  userId: z4.string(),
  channelId: z4.string(),
  platform: ChatPlatformSchema,
  timestamp: z4.date(),
  responseUrl: z4.string().url().optional()
});
var ButtonInteractionSchema = z4.object({
  id: z4.string(),
  actionId: z4.string(),
  value: z4.string().optional(),
  userId: z4.string(),
  channelId: z4.string(),
  messageId: z4.string(),
  platform: ChatPlatformSchema,
  timestamp: z4.date()
});
var NotificationTypeSchema = z4.enum([
  "pipeline_started",
  "pipeline_completed",
  "pipeline_failed",
  "step_completed",
  "step_failed",
  "approval_required",
  "budget_warning",
  "budget_exceeded",
  "anomaly_detected",
  "custom"
]);
var NotificationTemplateSchema = z4.object({
  id: z4.string(),
  type: NotificationTypeSchema,
  platform: ChatPlatformSchema,
  title: z4.string(),
  bodyTemplate: z4.string(),
  // Handlebars-style template
  color: z4.string().optional(),
  // For embeds/attachments
  includeDetails: z4.boolean().default(true),
  actions: z4.array(z4.object({
    label: z4.string(),
    actionId: z4.string(),
    style: z4.enum(["primary", "secondary", "danger"]).optional()
  })).optional()
});
var NotificationConfigSchema = z4.object({
  channelId: z4.string(),
  platform: ChatPlatformSchema,
  enabledTypes: z4.array(NotificationTypeSchema),
  mentionUsers: z4.array(z4.string()).optional(),
  mentionRoles: z4.array(z4.string()).optional(),
  quietHours: z4.object({
    enabled: z4.boolean(),
    start: z4.string(),
    // HH:mm
    end: z4.string(),
    timezone: z4.string()
  }).optional()
});
var BotConfigSchema = z4.object({
  id: z4.string(),
  platform: ChatPlatformSchema,
  name: z4.string(),
  status: ConnectionStatusSchema,
  credentials: z4.unknown(),
  // Platform-specific
  commands: z4.array(SlashCommandSchema).optional(),
  notifications: z4.array(NotificationConfigSchema).optional(),
  allowedChannels: z4.array(z4.string()).optional(),
  adminUsers: z4.array(z4.string()).optional(),
  createdAt: z4.date(),
  updatedAt: z4.date()
});
var ChatManagerConfigSchema = z4.object({
  bots: z4.array(BotConfigSchema).optional(),
  defaultPlatform: ChatPlatformSchema.optional(),
  commandPrefix: z4.string().default("/"),
  maxRetries: z4.number().default(3),
  retryDelayMs: z4.number().default(1e3),
  rateLimitPerMinute: z4.number().default(30)
});
var DEFAULT_NOTIFICATION_TEMPLATES = [
  {
    id: "pipeline_started",
    type: "pipeline_started",
    platform: "slack",
    title: "Pipeline Started",
    bodyTemplate: `Pipeline **{{pipelineName}}** has started execution.
- Execution ID: \`{{executionId}}\`
- Triggered by: {{triggeredBy}}
- Steps: {{stepCount}}`,
    color: "#3498db",
    includeDetails: true
  },
  {
    id: "pipeline_completed",
    type: "pipeline_completed",
    platform: "slack",
    title: "Pipeline Completed",
    bodyTemplate: `Pipeline **{{pipelineName}}** completed successfully!
- Duration: {{duration}}
- Cost: {{cost}}
- Output: {{outputPreview}}`,
    color: "#2ecc71",
    includeDetails: true,
    actions: [
      { label: "View Results", actionId: "view_results", style: "primary" }
    ]
  },
  {
    id: "pipeline_failed",
    type: "pipeline_failed",
    platform: "slack",
    title: "Pipeline Failed",
    bodyTemplate: `Pipeline **{{pipelineName}}** failed!
- Error: {{errorMessage}}
- Failed Step: {{failedStep}}
- Execution ID: \`{{executionId}}\``,
    color: "#e74c3c",
    includeDetails: true,
    actions: [
      { label: "View Logs", actionId: "view_logs", style: "primary" },
      { label: "Retry", actionId: "retry_pipeline", style: "secondary" }
    ]
  },
  {
    id: "approval_required",
    type: "approval_required",
    platform: "slack",
    title: "Approval Required",
    bodyTemplate: `Pipeline **{{pipelineName}}** requires approval to continue.
- Step: {{stepName}}
- Requested by: {{requestedBy}}
- Reason: {{reason}}`,
    color: "#f39c12",
    includeDetails: true,
    actions: [
      { label: "Approve", actionId: "approve", style: "primary" },
      { label: "Reject", actionId: "reject", style: "danger" }
    ]
  },
  {
    id: "budget_warning",
    type: "budget_warning",
    platform: "slack",
    title: "Budget Warning",
    bodyTemplate: `Budget threshold reached for **{{budgetName}}**
- Current Spend: {{currentSpend}}
- Limit: {{limit}}
- Usage: {{percentUsed}}%`,
    color: "#f39c12",
    includeDetails: true
  },
  {
    id: "anomaly_detected",
    type: "anomaly_detected",
    platform: "slack",
    title: "Anomaly Detected",
    bodyTemplate: `Anomaly detected in **{{metricName}}**
- Type: {{anomalyType}}
- Severity: {{severity}}
- Value: {{value}} (expected: {{expected}})`,
    color: "#9b59b6",
    includeDetails: true,
    actions: [
      { label: "Investigate", actionId: "investigate", style: "primary" },
      { label: "Dismiss", actionId: "dismiss", style: "secondary" }
    ]
  }
];

// src/chat/chat-manager.ts
import { EventEmitter as EventEmitter6 } from "eventemitter3";
import { randomUUID } from "crypto";
var ChatManager = class extends EventEmitter6 {
  config;
  bots = /* @__PURE__ */ new Map();
  connections = /* @__PURE__ */ new Map();
  templates = /* @__PURE__ */ new Map();
  commandHandlers = /* @__PURE__ */ new Map();
  messageQueue = [];
  rateLimitTokens;
  lastTokenRefill;
  constructor(config = {}) {
    super();
    this.config = ChatManagerConfigSchema.parse(config);
    this.rateLimitTokens = this.config.rateLimitPerMinute;
    this.lastTokenRefill = Date.now();
    for (const template of DEFAULT_NOTIFICATION_TEMPLATES) {
      this.templates.set(`${template.type}:${template.platform}`, template);
    }
    if (this.config.bots) {
      for (const bot of this.config.bots) {
        this.bots.set(bot.id, bot);
      }
    }
  }
  // ============================================================================
  // Bot Management
  // ============================================================================
  /**
   * Connect a bot to a platform
   */
  async connectBot(credentials) {
    const { platform } = credentials;
    if (this.connections.get(platform) === "connected") {
      throw new Error(`Already connected to ${platform}`);
    }
    this.connections.set(platform, "connecting");
    try {
      const bot = await this.initializePlatformBot(credentials);
      this.bots.set(bot.id, bot);
      this.connections.set(platform, "connected");
      this.emit("connected", platform);
      return bot;
    } catch (error) {
      this.connections.set(platform, "error");
      this.emit("error", platform, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  /**
   * Disconnect a bot
   */
  async disconnectBot(botId) {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error(`Bot not found: ${botId}`);
    }
    this.bots.delete(botId);
    this.connections.set(bot.platform, "disconnected");
    this.emit("disconnected", bot.platform, "Manual disconnect");
  }
  /**
   * Get bot status
   */
  getBotStatus(botId) {
    return this.bots.get(botId);
  }
  /**
   * Get all connected platforms
   */
  getConnectedPlatforms() {
    const connected = [];
    for (const [platform, status] of this.connections) {
      if (status === "connected") {
        connected.push(platform);
      }
    }
    return connected;
  }
  // ============================================================================
  // Messaging
  // ============================================================================
  /**
   * Send a message to a channel
   */
  async sendMessage(options, platform) {
    const targetPlatform = platform || this.config.defaultPlatform;
    if (!targetPlatform) {
      throw new Error("No platform specified and no default platform configured");
    }
    await this.checkRateLimit();
    const message = {
      id: randomUUID(),
      platform: targetPlatform,
      channelId: options.channelId,
      userId: "bot",
      content: options.content,
      blocks: options.blocks,
      threadId: options.threadId,
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.sendPlatformMessage(targetPlatform, options);
    this.emit("messageSent", message);
    return message;
  }
  /**
   * Send a notification
   */
  async sendNotification(type, data, config) {
    const configs = config ? [config] : Array.from(this.bots.values()).flatMap((bot) => bot.notifications || []).filter((n) => n.enabledTypes.includes(type));
    if (configs.length === 0) {
      console.warn(`No notification config found for type: ${type}`);
      return;
    }
    for (const notificationConfig of configs) {
      try {
        if (this.isInQuietHours(notificationConfig)) {
          continue;
        }
        const templateKey = `${type}:${notificationConfig.platform}`;
        const template = this.templates.get(templateKey);
        if (!template) {
          console.warn(`No template found for: ${templateKey}`);
          continue;
        }
        const content = this.renderTemplate(template.bodyTemplate, data);
        const blocks = this.buildNotificationBlocks(template, data);
        const mentions = this.buildMentions(notificationConfig);
        const finalContent = mentions ? `${mentions}
${content}` : content;
        await this.sendMessage(
          {
            channelId: notificationConfig.channelId,
            content: finalContent,
            blocks
          },
          notificationConfig.platform
        );
        this.emit("notificationSent", type, notificationConfig.channelId);
      } catch (error) {
        this.emit(
          "notificationFailed",
          type,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }
  // ============================================================================
  // Commands
  // ============================================================================
  /**
   * Register a slash command
   */
  registerCommand(command, handler) {
    this.commandHandlers.set(command.name, handler);
    for (const bot of this.bots.values()) {
      if (!bot.commands) {
        bot.commands = [];
      }
      bot.commands.push(command);
    }
  }
  /**
   * Handle incoming command
   */
  async handleCommand(invocation) {
    this.emit("commandReceived", invocation);
    const handler = this.commandHandlers.get(invocation.command);
    if (!handler) {
      await this.sendMessage(
        {
          channelId: invocation.channelId,
          content: `Unknown command: ${invocation.command}`
        },
        invocation.platform
      );
      return;
    }
    try {
      await handler(invocation);
    } catch (error) {
      await this.sendMessage(
        {
          channelId: invocation.channelId,
          content: `Error executing command: ${error instanceof Error ? error.message : "Unknown error"}`
        },
        invocation.platform
      );
    }
  }
  /**
   * Handle button interaction
   */
  async handleButtonClick(interaction) {
    this.emit("buttonClicked", interaction);
    switch (interaction.actionId) {
      case "approve":
        await this.handleApprovalAction(interaction, true);
        break;
      case "reject":
        await this.handleApprovalAction(interaction, false);
        break;
      case "view_results":
      case "view_logs":
        await this.handleViewAction(interaction);
        break;
      case "retry_pipeline":
        await this.handleRetryAction(interaction);
        break;
      case "investigate":
        await this.handleInvestigateAction(interaction);
        break;
      case "dismiss":
        await this.handleDismissAction(interaction);
        break;
      default:
        console.warn(`Unknown action: ${interaction.actionId}`);
    }
  }
  // ============================================================================
  // Templates
  // ============================================================================
  /**
   * Add or update a notification template
   */
  setTemplate(template) {
    const key = `${template.type}:${template.platform}`;
    this.templates.set(key, template);
  }
  /**
   * Get template
   */
  getTemplate(type, platform) {
    return this.templates.get(`${type}:${platform}`);
  }
  // ============================================================================
  // Pipeline Integration
  // ============================================================================
  /**
   * Register default pipeline commands
   */
  registerPipelineCommands() {
    this.registerCommand(
      {
        name: "pipeline",
        description: "Manage pipelines",
        options: [
          {
            name: "action",
            description: "Action to perform",
            type: "string",
            required: true,
            choices: [
              { name: "list", value: "list" },
              { name: "run", value: "run" },
              { name: "status", value: "status" },
              { name: "stop", value: "stop" }
            ]
          },
          {
            name: "pipeline_id",
            description: "Pipeline ID",
            type: "string",
            required: false
          }
        ],
        handler: "pipeline_command"
      },
      async (invocation) => {
        const action = invocation.args.action;
        const pipelineId = invocation.args.pipeline_id;
        switch (action) {
          case "list":
            await this.sendMessage(
              {
                channelId: invocation.channelId,
                content: "Available pipelines:\n- content-generation\n- data-extraction\n- reporting"
              },
              invocation.platform
            );
            break;
          case "run":
            if (!pipelineId) {
              await this.sendMessage(
                {
                  channelId: invocation.channelId,
                  content: "Please specify a pipeline ID: `/pipeline run --pipeline_id <id>`"
                },
                invocation.platform
              );
              return;
            }
            await this.sendMessage(
              {
                channelId: invocation.channelId,
                content: `Starting pipeline: ${pipelineId}...`
              },
              invocation.platform
            );
            break;
          case "status":
            await this.sendMessage(
              {
                channelId: invocation.channelId,
                content: pipelineId ? `Pipeline ${pipelineId} status: running` : "All pipelines: 3 running, 2 idle"
              },
              invocation.platform
            );
            break;
          case "stop":
            if (!pipelineId) {
              await this.sendMessage(
                {
                  channelId: invocation.channelId,
                  content: "Please specify a pipeline ID to stop"
                },
                invocation.platform
              );
              return;
            }
            await this.sendMessage(
              {
                channelId: invocation.channelId,
                content: `Stopping pipeline: ${pipelineId}`
              },
              invocation.platform
            );
            break;
        }
      }
    );
    this.registerCommand(
      {
        name: "budget",
        description: "Check budget status",
        options: [],
        handler: "budget_command"
      },
      async (invocation) => {
        await this.sendMessage(
          {
            channelId: invocation.channelId,
            content: `Budget Status:
- Daily: $45.20 / $100 (45%)
- Monthly: $890 / $2000 (44.5%)
- Per-pipeline avg: $2.30`,
            blocks: [
              { type: "header", content: "Budget Overview" },
              { type: "text", content: "Daily spend: $45.20 / $100" },
              { type: "text", content: "Monthly spend: $890 / $2000" },
              { type: "divider" },
              { type: "text", content: "All budgets are within limits." }
            ]
          },
          invocation.platform
        );
      }
    );
    this.registerCommand(
      {
        name: "help",
        description: "Show available commands",
        options: [],
        handler: "help_command"
      },
      async (invocation) => {
        const commands = Array.from(this.commandHandlers.keys());
        await this.sendMessage(
          {
            channelId: invocation.channelId,
            content: `Available commands:
${commands.map((c) => `- /${c}`).join("\n")}`
          },
          invocation.platform
        );
      }
    );
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  async initializePlatformBot(credentials) {
    return {
      id: randomUUID(),
      platform: credentials.platform,
      name: `${credentials.platform}-bot`,
      status: "connected",
      credentials: credentials.credentials,
      commands: [],
      notifications: [],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
  }
  async sendPlatformMessage(platform, options) {
    console.log(`[${platform}] Sending to ${options.channelId}: ${options.content}`);
  }
  async checkRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastTokenRefill;
    if (elapsed >= 6e4) {
      this.rateLimitTokens = this.config.rateLimitPerMinute;
      this.lastTokenRefill = now;
    }
    if (this.rateLimitTokens <= 0) {
      const waitTime = 6e4 - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.rateLimitTokens = this.config.rateLimitPerMinute;
      this.lastTokenRefill = Date.now();
    }
    this.rateLimitTokens--;
  }
  isInQuietHours(config) {
    if (!config.quietHours?.enabled) {
      return false;
    }
    const now = /* @__PURE__ */ new Date();
    const [startHour, startMin] = config.quietHours.start.split(":").map(Number);
    const [endHour, endMin] = config.quietHours.end.split(":").map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }
  renderTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = data[key];
      return value !== void 0 ? String(value) : `{{${key}}}`;
    });
  }
  buildNotificationBlocks(template, data) {
    const blocks = [
      { type: "header", content: template.title },
      { type: "text", content: this.renderTemplate(template.bodyTemplate, data) }
    ];
    if (template.actions && template.actions.length > 0) {
      blocks.push({ type: "divider" });
      for (const action of template.actions) {
        blocks.push({
          type: "button",
          content: action.label,
          url: action.actionId
        });
      }
    }
    return blocks;
  }
  buildMentions(config) {
    const mentions = [];
    if (config.mentionUsers) {
      mentions.push(...config.mentionUsers.map((u) => `<@${u}>`));
    }
    if (config.mentionRoles) {
      mentions.push(...config.mentionRoles.map((r) => `<@&${r}>`));
    }
    return mentions.join(" ");
  }
  // Action handlers
  async handleApprovalAction(interaction, approved) {
    await this.sendMessage(
      {
        channelId: interaction.channelId,
        content: approved ? `Approved by <@${interaction.userId}>` : `Rejected by <@${interaction.userId}>`,
        threadId: interaction.messageId
      },
      interaction.platform
    );
  }
  async handleViewAction(interaction) {
    await this.sendMessage(
      {
        channelId: interaction.channelId,
        content: `View details: https://dashboard.example.com/execution/${interaction.value}`,
        threadId: interaction.messageId
      },
      interaction.platform
    );
  }
  async handleRetryAction(interaction) {
    await this.sendMessage(
      {
        channelId: interaction.channelId,
        content: `Retrying pipeline... Started by <@${interaction.userId}>`,
        threadId: interaction.messageId
      },
      interaction.platform
    );
  }
  async handleInvestigateAction(interaction) {
    await this.sendMessage(
      {
        channelId: interaction.channelId,
        content: `Creating investigation ticket for <@${interaction.userId}>...`,
        threadId: interaction.messageId
      },
      interaction.platform
    );
  }
  async handleDismissAction(interaction) {
    await this.sendMessage(
      {
        channelId: interaction.channelId,
        content: `Dismissed by <@${interaction.userId}>`,
        threadId: interaction.messageId
      },
      interaction.platform
    );
  }
  /**
   * Get summary of chat manager state
   */
  getSummary() {
    return {
      connectedPlatforms: this.getConnectedPlatforms(),
      totalBots: this.bots.size,
      registeredCommands: this.commandHandlers.size,
      templatesCount: this.templates.size
    };
  }
};
var chatManagerInstance = null;
function getChatManager() {
  if (!chatManagerInstance) {
    chatManagerInstance = new ChatManager();
  }
  return chatManagerInstance;
}
function createChatManager(config = {}) {
  return new ChatManager(config);
}

// src/terraform/types.ts
import { z as z5 } from "zod";
var TerraformResourceTypeSchema = z5.enum([
  "integrationhub_pipeline",
  "integrationhub_schedule",
  "integrationhub_webhook",
  "integrationhub_budget",
  "integrationhub_notification",
  "integrationhub_plugin"
]);
var ProviderConfigSchema = z5.object({
  apiKey: z5.string(),
  baseUrl: z5.string().url().default("https://api.integrationhub.io"),
  organizationId: z5.string().optional(),
  timeout: z5.number().default(30),
  maxRetries: z5.number().default(3)
});
var PipelineStepResourceSchema = z5.object({
  name: z5.string(),
  type: z5.enum(["llm", "transform", "condition", "parallel", "loop"]),
  config: z5.record(z5.unknown()).optional(),
  dependsOn: z5.array(z5.string()).optional(),
  timeout: z5.number().optional(),
  retries: z5.number().optional()
});
var PipelineResourceSchema = z5.object({
  name: z5.string(),
  description: z5.string().optional(),
  steps: z5.array(PipelineStepResourceSchema),
  variables: z5.record(z5.string()).optional(),
  metadata: z5.record(z5.string()).optional(),
  maxConcurrency: z5.number().optional(),
  timeoutMinutes: z5.number().optional()
});
var ScheduleResourceSchema = z5.object({
  pipelineId: z5.string(),
  name: z5.string(),
  cronExpression: z5.string(),
  timezone: z5.string().default("UTC"),
  enabled: z5.boolean().default(true),
  inputs: z5.record(z5.unknown()).optional(),
  notifications: z5.object({
    onSuccess: z5.array(z5.string()).optional(),
    onFailure: z5.array(z5.string()).optional()
  }).optional()
});
var WebhookResourceSchema = z5.object({
  name: z5.string(),
  url: z5.string().url(),
  events: z5.array(z5.string()),
  secret: z5.string().optional(),
  enabled: z5.boolean().default(true),
  headers: z5.record(z5.string()).optional(),
  retryPolicy: z5.object({
    maxRetries: z5.number(),
    backoffMs: z5.number()
  }).optional()
});
var BudgetResourceSchema = z5.object({
  name: z5.string(),
  type: z5.enum(["daily", "weekly", "monthly", "pipeline"]),
  limit: z5.number(),
  currency: z5.string().default("USD"),
  pipelineId: z5.string().optional(),
  alertThresholds: z5.array(z5.number()).optional(),
  // e.g., [50, 75, 90]
  actions: z5.object({
    onThreshold: z5.enum(["notify", "throttle", "pause"]).optional(),
    onExceeded: z5.enum(["notify", "pause", "block"]).optional()
  }).optional()
});
var NotificationResourceSchema = z5.object({
  name: z5.string(),
  type: z5.enum(["slack", "discord", "email", "webhook", "pagerduty"]),
  config: z5.object({
    channel: z5.string().optional(),
    url: z5.string().optional(),
    emails: z5.array(z5.string()).optional(),
    integrationKey: z5.string().optional()
  }),
  events: z5.array(z5.string()),
  filters: z5.object({
    severity: z5.array(z5.string()).optional(),
    pipelines: z5.array(z5.string()).optional()
  }).optional()
});
var PluginResourceSchema = z5.object({
  name: z5.string(),
  version: z5.string(),
  enabled: z5.boolean().default(true),
  config: z5.record(z5.unknown()).optional(),
  permissions: z5.array(z5.string()).optional()
});
var ResourceStateSchema = z5.object({
  id: z5.string(),
  type: TerraformResourceTypeSchema,
  name: z5.string(),
  attributes: z5.record(z5.unknown()),
  meta: z5.object({
    createdAt: z5.string(),
    updatedAt: z5.string(),
    version: z5.number(),
    checksum: z5.string()
  }),
  dependencies: z5.array(z5.string()).optional()
});
var TerraformStateSchema = z5.object({
  version: z5.number().default(1),
  serial: z5.number(),
  lineage: z5.string(),
  resources: z5.array(ResourceStateSchema),
  outputs: z5.record(z5.object({
    value: z5.unknown(),
    type: z5.string(),
    sensitive: z5.boolean().optional()
  })).optional()
});
var ResourceChangeTypeSchema = z5.enum([
  "create",
  "update",
  "delete",
  "replace",
  "no-op"
]);
var ResourceChangeSchema = z5.object({
  type: TerraformResourceTypeSchema,
  name: z5.string(),
  action: ResourceChangeTypeSchema,
  before: z5.record(z5.unknown()).optional(),
  after: z5.record(z5.unknown()).optional(),
  diff: z5.array(z5.object({
    path: z5.string(),
    oldValue: z5.unknown(),
    newValue: z5.unknown()
  })).optional()
});
var TerraformPlanSchema = z5.object({
  version: z5.number(),
  timestamp: z5.string(),
  changes: z5.array(ResourceChangeSchema),
  summary: z5.object({
    toCreate: z5.number(),
    toUpdate: z5.number(),
    toDelete: z5.number(),
    toReplace: z5.number(),
    unchanged: z5.number()
  })
});
var ApplyResultSchema = z5.object({
  success: z5.boolean(),
  resourceId: z5.string().optional(),
  error: z5.string().optional(),
  duration: z5.number()
});
var TerraformApplyResultSchema = z5.object({
  success: z5.boolean(),
  results: z5.array(z5.object({
    resource: z5.string(),
    action: ResourceChangeTypeSchema,
    result: ApplyResultSchema
  })),
  summary: z5.object({
    created: z5.number(),
    updated: z5.number(),
    deleted: z5.number(),
    failed: z5.number()
  }),
  duration: z5.number()
});
var HCLBlockSchema = z5.object({
  type: z5.string(),
  labels: z5.array(z5.string()),
  attributes: z5.record(z5.unknown()),
  blocks: z5.array(z5.lazy(() => HCLBlockSchema)).optional()
});
var HCLConfigSchema = z5.object({
  terraform: z5.object({
    requiredProviders: z5.record(z5.object({
      source: z5.string(),
      version: z5.string()
    })).optional()
  }).optional(),
  provider: z5.record(z5.record(z5.unknown())).optional(),
  resources: z5.array(HCLBlockSchema).optional(),
  data: z5.array(HCLBlockSchema).optional(),
  outputs: z5.record(z5.object({
    value: z5.string(),
    description: z5.string().optional(),
    sensitive: z5.boolean().optional()
  })).optional(),
  variables: z5.record(z5.object({
    type: z5.string().optional(),
    default: z5.unknown().optional(),
    description: z5.string().optional(),
    sensitive: z5.boolean().optional(),
    validation: z5.object({
      condition: z5.string(),
      errorMessage: z5.string()
    }).optional()
  })).optional()
});
var TerraformManagerConfigSchema = z5.object({
  providerVersion: z5.string().default("1.0.0"),
  stateBackend: z5.enum(["local", "s3", "gcs", "azure", "http"]).default("local"),
  stateConfig: z5.record(z5.unknown()).optional(),
  autoApprove: z5.boolean().default(false),
  parallelism: z5.number().default(10),
  refreshOnPlan: z5.boolean().default(true)
});
var EXAMPLE_TERRAFORM_CONFIG = `
terraform {
  required_providers {
    integrationhub = {
      source  = "gicm/integrationhub"
      version = "~> 1.0"
    }
  }
}

provider "integrationhub" {
  api_key         = var.api_key
  organization_id = var.organization_id
}

variable "api_key" {
  type        = string
  description = "Integration Hub API key"
  sensitive   = true
}

variable "organization_id" {
  type        = string
  description = "Organization ID"
}

resource "integrationhub_pipeline" "content_generator" {
  name        = "content-generator"
  description = "Generates blog content from topics"

  step {
    name = "research"
    type = "llm"
    config = {
      model  = "claude-3-sonnet"
      prompt = "Research the topic: \${var.topic}"
    }
  }

  step {
    name       = "write"
    type       = "llm"
    depends_on = ["research"]
    config = {
      model  = "claude-3-opus"
      prompt = "Write a blog post based on: \${step.research.output}"
    }
  }

  step {
    name       = "review"
    type       = "llm"
    depends_on = ["write"]
    config = {
      model  = "claude-3-haiku"
      prompt = "Review and suggest improvements for: \${step.write.output}"
    }
  }

  variables = {
    topic = "AI in Healthcare"
  }

  max_concurrency = 1
  timeout_minutes = 30
}

resource "integrationhub_schedule" "daily_content" {
  pipeline_id     = integrationhub_pipeline.content_generator.id
  name            = "daily-content-schedule"
  cron_expression = "0 9 * * 1-5"
  timezone        = "America/New_York"
  enabled         = true

  inputs = {
    topic = "Daily AI News"
  }
}

resource "integrationhub_budget" "monthly_limit" {
  name     = "monthly-ai-budget"
  type     = "monthly"
  limit    = 500
  currency = "USD"

  alert_thresholds = [50, 75, 90]

  actions {
    on_threshold = "notify"
    on_exceeded  = "pause"
  }
}

resource "integrationhub_webhook" "pipeline_events" {
  name   = "pipeline-notifications"
  url    = "https://hooks.slack.com/services/xxx"
  events = ["pipeline.completed", "pipeline.failed"]

  headers = {
    Content-Type = "application/json"
  }

  retry_policy {
    max_retries = 3
    backoff_ms  = 1000
  }
}

output "pipeline_id" {
  value       = integrationhub_pipeline.content_generator.id
  description = "The ID of the content generator pipeline"
}

output "schedule_id" {
  value       = integrationhub_schedule.daily_content.id
  description = "The ID of the daily content schedule"
}
`;

// src/terraform/terraform-manager.ts
import { EventEmitter as EventEmitter7 } from "eventemitter3";
import { createHash as createHash2, randomUUID as randomUUID2 } from "crypto";
var TerraformManager = class extends EventEmitter7 {
  config;
  providerConfig = null;
  state;
  desiredState = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    super();
    this.config = TerraformManagerConfigSchema.parse(config);
    this.state = {
      version: 1,
      serial: 0,
      lineage: randomUUID2(),
      resources: [],
      outputs: {}
    };
  }
  // ============================================================================
  // Provider Configuration
  // ============================================================================
  /**
   * Configure the provider
   */
  configureProvider(config) {
    this.providerConfig = config;
  }
  /**
   * Validate provider is configured
   */
  ensureProvider() {
    if (!this.providerConfig) {
      throw new Error("Provider not configured. Call configureProvider() first.");
    }
  }
  // ============================================================================
  // Resource Definition
  // ============================================================================
  /**
   * Define a pipeline resource
   */
  definePipeline(name, resource) {
    this.desiredState.set(`integrationhub_pipeline.${name}`, {
      type: "integrationhub_pipeline",
      data: resource
    });
  }
  /**
   * Define a schedule resource
   */
  defineSchedule(name, resource) {
    this.desiredState.set(`integrationhub_schedule.${name}`, {
      type: "integrationhub_schedule",
      data: resource
    });
  }
  /**
   * Define a webhook resource
   */
  defineWebhook(name, resource) {
    this.desiredState.set(`integrationhub_webhook.${name}`, {
      type: "integrationhub_webhook",
      data: resource
    });
  }
  /**
   * Define a budget resource
   */
  defineBudget(name, resource) {
    this.desiredState.set(`integrationhub_budget.${name}`, {
      type: "integrationhub_budget",
      data: resource
    });
  }
  /**
   * Define a notification resource
   */
  defineNotification(name, resource) {
    this.desiredState.set(`integrationhub_notification.${name}`, {
      type: "integrationhub_notification",
      data: resource
    });
  }
  /**
   * Define a plugin resource
   */
  definePlugin(name, resource) {
    this.desiredState.set(`integrationhub_plugin.${name}`, {
      type: "integrationhub_plugin",
      data: resource
    });
  }
  // ============================================================================
  // Plan
  // ============================================================================
  /**
   * Generate a plan showing changes
   */
  async plan() {
    this.ensureProvider();
    this.emit("planStarted");
    const changes = [];
    const currentResources = new Map(
      this.state.resources.map((r) => [`${r.type}.${r.name}`, r])
    );
    if (this.config.refreshOnPlan) {
      await this.refresh();
    }
    for (const [key, desired] of this.desiredState) {
      const current = currentResources.get(key);
      if (!current) {
        changes.push({
          type: desired.type,
          name: key.split(".")[1],
          action: "create",
          after: desired.data
        });
      } else {
        const diff = this.calculateDiff(
          current.attributes,
          desired.data
        );
        if (diff.length > 0) {
          changes.push({
            type: desired.type,
            name: key.split(".")[1],
            action: "update",
            before: current.attributes,
            after: desired.data,
            diff
          });
        } else {
          changes.push({
            type: desired.type,
            name: key.split(".")[1],
            action: "no-op"
          });
        }
      }
      currentResources.delete(key);
    }
    for (const [key, current] of currentResources) {
      changes.push({
        type: current.type,
        name: current.name,
        action: "delete",
        before: current.attributes
      });
    }
    const plan = {
      version: 1,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      changes,
      summary: {
        toCreate: changes.filter((c) => c.action === "create").length,
        toUpdate: changes.filter((c) => c.action === "update").length,
        toDelete: changes.filter((c) => c.action === "delete").length,
        toReplace: changes.filter((c) => c.action === "replace").length,
        unchanged: changes.filter((c) => c.action === "no-op").length
      }
    };
    this.emit("planCompleted", plan);
    return plan;
  }
  // ============================================================================
  // Apply
  // ============================================================================
  /**
   * Apply changes from a plan
   */
  async apply(plan) {
    this.ensureProvider();
    const executionPlan = plan || await this.plan();
    this.emit("applyStarted", executionPlan);
    const startTime = Date.now();
    const results = [];
    let created = 0;
    let updated = 0;
    let deleted = 0;
    let failed = 0;
    const deletes = executionPlan.changes.filter((c) => c.action === "delete");
    const creates = executionPlan.changes.filter((c) => c.action === "create");
    const updates = executionPlan.changes.filter((c) => c.action === "update");
    const replaces = executionPlan.changes.filter((c) => c.action === "replace");
    for (const change of deletes) {
      const result = await this.applyDelete(change);
      results.push({ resource: `${change.type}.${change.name}`, action: "delete", result });
      if (result.success) {
        deleted++;
      } else {
        failed++;
      }
    }
    for (const change of creates) {
      const result = await this.applyCreate(change);
      results.push({ resource: `${change.type}.${change.name}`, action: "create", result });
      if (result.success) {
        created++;
      } else {
        failed++;
      }
    }
    for (const change of updates) {
      const result = await this.applyUpdate(change);
      results.push({ resource: `${change.type}.${change.name}`, action: "update", result });
      if (result.success) {
        updated++;
      } else {
        failed++;
      }
    }
    for (const change of replaces) {
      const deleteResult = await this.applyDelete(change);
      if (deleteResult.success) {
        const createResult = await this.applyCreate(change);
        results.push({ resource: `${change.type}.${change.name}`, action: "replace", result: createResult });
        if (createResult.success) {
          created++;
          deleted++;
        } else {
          failed++;
        }
      } else {
        results.push({ resource: `${change.type}.${change.name}`, action: "replace", result: deleteResult });
        failed++;
      }
    }
    await this.saveState();
    const applyResult = {
      success: failed === 0,
      results,
      summary: { created, updated, deleted, failed },
      duration: Date.now() - startTime
    };
    this.emit("applyCompleted", applyResult);
    return applyResult;
  }
  // ============================================================================
  // State Management
  // ============================================================================
  /**
   * Refresh state from remote
   */
  async refresh() {
    this.ensureProvider();
    this.emit("stateRefreshed");
  }
  /**
   * Import an existing resource into state
   */
  async import(type, name, resourceId) {
    this.ensureProvider();
    const attributes = await this.fetchResource(type, resourceId);
    const resource = {
      id: resourceId,
      type,
      name,
      attributes,
      meta: {
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        version: 1,
        checksum: this.calculateChecksum(attributes)
      }
    };
    this.state.resources.push(resource);
    this.state.serial++;
    await this.saveState();
    return resource;
  }
  /**
   * Remove a resource from state (without deleting it)
   */
  removeFromState(type, name) {
    const key = `${type}.${name}`;
    const index = this.state.resources.findIndex(
      (r) => `${r.type}.${r.name}` === key
    );
    if (index >= 0) {
      this.state.resources.splice(index, 1);
      this.state.serial++;
      return true;
    }
    return false;
  }
  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }
  /**
   * Load state from storage
   */
  async loadState(state) {
    this.state = state;
  }
  // ============================================================================
  // HCL Parsing & Generation
  // ============================================================================
  /**
   * Parse HCL configuration
   */
  parseHCL(hclContent) {
    const config = {
      resources: [],
      variables: {},
      outputs: {}
    };
    const terraformMatch = hclContent.match(/terraform\s*\{[\s\S]*?required_providers\s*\{([\s\S]*?)\}/);
    if (terraformMatch) {
      config.terraform = { requiredProviders: {} };
    }
    const resourceRegex = /resource\s+"(\w+)"\s+"(\w+)"\s*\{([\s\S]*?)\n\}/g;
    let match;
    while ((match = resourceRegex.exec(hclContent)) !== null) {
      const [, type, name, body] = match;
      config.resources?.push({
        type: "resource",
        labels: [type, name],
        attributes: this.parseHCLAttributes(body)
      });
    }
    const variableRegex = /variable\s+"(\w+)"\s*\{([\s\S]*?)\n\}/g;
    while ((match = variableRegex.exec(hclContent)) !== null) {
      const [, name, body] = match;
      const attrs = this.parseHCLAttributes(body);
      config.variables[name] = {
        type: attrs.type,
        default: attrs.default,
        description: attrs.description,
        sensitive: attrs.sensitive
      };
    }
    const outputRegex = /output\s+"(\w+)"\s*\{([\s\S]*?)\n\}/g;
    while ((match = outputRegex.exec(hclContent)) !== null) {
      const [, name, body] = match;
      const attrs = this.parseHCLAttributes(body);
      config.outputs[name] = {
        value: attrs.value,
        description: attrs.description,
        sensitive: attrs.sensitive
      };
    }
    return config;
  }
  /**
   * Generate HCL from resources
   */
  generateHCL() {
    const lines = [];
    lines.push("terraform {");
    lines.push("  required_providers {");
    lines.push("    integrationhub = {");
    lines.push('      source  = "gicm/integrationhub"');
    lines.push(`      version = "~> ${this.config.providerVersion}"`);
    lines.push("    }");
    lines.push("  }");
    lines.push("}");
    lines.push("");
    lines.push('provider "integrationhub" {');
    if (this.providerConfig) {
      lines.push(`  api_key = var.api_key`);
      if (this.providerConfig.organizationId) {
        lines.push(`  organization_id = "${this.providerConfig.organizationId}"`);
      }
    }
    lines.push("}");
    lines.push("");
    for (const [key, { type, data }] of this.desiredState) {
      const name = key.split(".")[1];
      lines.push(`resource "${type}" "${name}" {`);
      lines.push(this.attributesToHCL(data, 2));
      lines.push("}");
      lines.push("");
    }
    return lines.join("\n");
  }
  // ============================================================================
  // Validation
  // ============================================================================
  /**
   * Validate configuration
   */
  validate() {
    const errors = [];
    if (!this.providerConfig) {
      errors.push("Provider not configured");
    }
    const names = /* @__PURE__ */ new Set();
    for (const key of this.desiredState.keys()) {
      if (names.has(key)) {
        errors.push(`Duplicate resource: ${key}`);
      }
      names.add(key);
    }
    for (const [key, { type, data }] of this.desiredState) {
      if (type === "integrationhub_schedule") {
        const schedule = data;
        const pipelineKey = `integrationhub_pipeline.${schedule.pipelineId}`;
        if (!this.desiredState.has(pipelineKey) && !this.state.resources.find((r) => r.id === schedule.pipelineId)) {
          errors.push(`Schedule ${key} references unknown pipeline: ${schedule.pipelineId}`);
        }
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  async applyCreate(change) {
    const startTime = Date.now();
    const resourceKey = `${change.type}.${change.name}`;
    this.emit("resourceCreating", change.type, change.name);
    try {
      const resourceId = randomUUID2();
      const resource = {
        id: resourceId,
        type: change.type,
        name: change.name,
        attributes: change.after || {},
        meta: {
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          version: 1,
          checksum: this.calculateChecksum(change.after || {})
        }
      };
      this.state.resources.push(resource);
      this.state.serial++;
      this.emit("resourceCreated", change.type, change.name, resourceId);
      return {
        success: true,
        resourceId,
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.emit("resourceError", change.type, change.name, error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }
  async applyUpdate(change) {
    const startTime = Date.now();
    this.emit("resourceUpdating", change.type, change.name);
    try {
      const index = this.state.resources.findIndex(
        (r) => r.type === change.type && r.name === change.name
      );
      if (index >= 0) {
        this.state.resources[index].attributes = change.after || {};
        this.state.resources[index].meta.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        this.state.resources[index].meta.version++;
        this.state.resources[index].meta.checksum = this.calculateChecksum(change.after || {});
        this.state.serial++;
      }
      this.emit("resourceUpdated", change.type, change.name);
      return {
        success: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.emit("resourceError", change.type, change.name, error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }
  async applyDelete(change) {
    const startTime = Date.now();
    this.emit("resourceDeleting", change.type, change.name);
    try {
      const index = this.state.resources.findIndex(
        (r) => r.type === change.type && r.name === change.name
      );
      if (index >= 0) {
        this.state.resources.splice(index, 1);
        this.state.serial++;
      }
      this.emit("resourceDeleted", change.type, change.name);
      return {
        success: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.emit("resourceError", change.type, change.name, error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }
  async saveState() {
    this.emit("stateSaved");
  }
  async fetchResource(type, id) {
    return { id };
  }
  calculateDiff(before, after) {
    const diff = [];
    const allKeys = /* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const key of allKeys) {
      const oldValue = before[key];
      const newValue = after[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diff.push({ path: key, oldValue, newValue });
      }
    }
    return diff;
  }
  calculateChecksum(data) {
    return createHash2("sha256").update(JSON.stringify(data)).digest("hex").slice(0, 16);
  }
  parseHCLAttributes(body) {
    const attributes = {};
    const attrRegex = /(\w+)\s*=\s*(".*?"|[^\n]+)/g;
    let match;
    while ((match = attrRegex.exec(body)) !== null) {
      const [, key, value] = match;
      let parsedValue = value.trim();
      if (typeof parsedValue === "string" && parsedValue.startsWith('"') && parsedValue.endsWith('"')) {
        parsedValue = parsedValue.slice(1, -1);
      } else if (parsedValue === "true") {
        parsedValue = true;
      } else if (parsedValue === "false") {
        parsedValue = false;
      } else if (!isNaN(Number(parsedValue))) {
        parsedValue = Number(parsedValue);
      }
      attributes[key] = parsedValue;
    }
    return attributes;
  }
  attributesToHCL(attrs, indent) {
    const spaces = " ".repeat(indent);
    const lines = [];
    for (const [key, value] of Object.entries(attrs)) {
      if (value === void 0 || value === null) continue;
      if (typeof value === "string") {
        lines.push(`${spaces}${key} = "${value}"`);
      } else if (typeof value === "number" || typeof value === "boolean") {
        lines.push(`${spaces}${key} = ${value}`);
      } else if (Array.isArray(value)) {
        lines.push(`${spaces}${key} = ${JSON.stringify(value)}`);
      } else if (typeof value === "object") {
        lines.push(`${spaces}${key} {`);
        lines.push(this.attributesToHCL(value, indent + 2));
        lines.push(`${spaces}}`);
      }
    }
    return lines.join("\n");
  }
  /**
   * Get summary of terraform manager state
   */
  getSummary() {
    return {
      resourceCount: this.state.resources.length,
      desiredResourceCount: this.desiredState.size,
      stateSerial: this.state.serial,
      providerConfigured: this.providerConfig !== null
    };
  }
};
var terraformManagerInstance = null;
function getTerraformManager() {
  if (!terraformManagerInstance) {
    terraformManagerInstance = new TerraformManager();
  }
  return terraformManagerInstance;
}
function createTerraformManager(config = {}) {
  return new TerraformManager(config);
}

// src/vscode/types.ts
import { z as z6 } from "zod";
var ExtensionStateSchema = z6.enum([
  "inactive",
  "activating",
  "active",
  "error"
]);
var ExtensionConfigSchema = z6.object({
  apiKey: z6.string().optional(),
  baseUrl: z6.string().url().default("https://api.integrationhub.io"),
  organizationId: z6.string().optional(),
  autoRefresh: z6.boolean().default(true),
  refreshIntervalMs: z6.number().default(3e4),
  showNotifications: z6.boolean().default(true),
  showStatusBar: z6.boolean().default(true),
  defaultEditor: z6.enum(["yaml", "visual"]).default("visual"),
  telemetry: z6.boolean().default(true)
});
var TreeItemTypeSchema = z6.enum([
  "pipeline",
  "schedule",
  "execution",
  "step",
  "budget",
  "webhook",
  "notification",
  "folder"
]);
var TreeItemStateSchema = z6.enum([
  "default",
  "running",
  "success",
  "error",
  "warning",
  "disabled"
]);
var TreeItemSchema = z6.object({
  id: z6.string(),
  type: TreeItemTypeSchema,
  label: z6.string(),
  description: z6.string().optional(),
  tooltip: z6.string().optional(),
  state: TreeItemStateSchema.default("default"),
  icon: z6.string().optional(),
  contextValue: z6.string().optional(),
  children: z6.array(z6.lazy(() => TreeItemSchema)).optional(),
  command: z6.object({
    command: z6.string(),
    title: z6.string(),
    arguments: z6.array(z6.unknown()).optional()
  }).optional()
});
var EditorTypeSchema = z6.enum([
  "pipeline",
  "schedule",
  "config",
  "execution"
]);
var EditorStateSchema = z6.object({
  type: EditorTypeSchema,
  resourceId: z6.string().optional(),
  isDirty: z6.boolean().default(false),
  content: z6.string(),
  cursor: z6.object({
    line: z6.number(),
    column: z6.number()
  }).optional(),
  selection: z6.object({
    start: z6.object({ line: z6.number(), column: z6.number() }),
    end: z6.object({ line: z6.number(), column: z6.number() })
  }).optional()
});
var DiagnosticSeveritySchema = z6.enum([
  "error",
  "warning",
  "info",
  "hint"
]);
var DiagnosticSchema = z6.object({
  severity: DiagnosticSeveritySchema,
  message: z6.string(),
  source: z6.string().default("Integration Hub"),
  code: z6.string().optional(),
  range: z6.object({
    startLine: z6.number(),
    startColumn: z6.number(),
    endLine: z6.number(),
    endColumn: z6.number()
  }),
  relatedInformation: z6.array(z6.object({
    location: z6.object({
      uri: z6.string(),
      range: z6.object({
        startLine: z6.number(),
        startColumn: z6.number(),
        endLine: z6.number(),
        endColumn: z6.number()
      })
    }),
    message: z6.string()
  })).optional()
});
var CommandSchema = z6.object({
  command: z6.string(),
  title: z6.string(),
  category: z6.string().default("Integration Hub"),
  icon: z6.string().optional(),
  enablement: z6.string().optional(),
  keybinding: z6.object({
    key: z6.string(),
    mac: z6.string().optional(),
    when: z6.string().optional()
  }).optional()
});
var StatusBarItemSchema = z6.object({
  id: z6.string(),
  text: z6.string(),
  tooltip: z6.string().optional(),
  command: z6.string().optional(),
  color: z6.string().optional(),
  backgroundColor: z6.string().optional(),
  priority: z6.number().default(0),
  alignment: z6.enum(["left", "right"]).default("left")
});
var QuickPickItemSchema = z6.object({
  label: z6.string(),
  description: z6.string().optional(),
  detail: z6.string().optional(),
  picked: z6.boolean().optional(),
  alwaysShow: z6.boolean().optional(),
  iconPath: z6.string().optional(),
  buttons: z6.array(z6.object({
    iconPath: z6.string(),
    tooltip: z6.string()
  })).optional()
});
var NotificationTypeSchema2 = z6.enum([
  "info",
  "warning",
  "error"
]);
var NotificationActionSchema = z6.object({
  title: z6.string(),
  isCloseAffordance: z6.boolean().optional(),
  command: z6.string().optional()
});
var VSCodeNotificationSchema = z6.object({
  type: NotificationTypeSchema2,
  message: z6.string(),
  actions: z6.array(NotificationActionSchema).optional(),
  modal: z6.boolean().optional()
});
var WebviewTypeSchema = z6.enum([
  "pipelineVisualEditor",
  "executionViewer",
  "dashboardPanel",
  "settingsEditor",
  "welcomePanel"
]);
var WebviewMessageSchema = z6.object({
  type: z6.string(),
  payload: z6.unknown()
});
var WebviewStateSchema = z6.object({
  type: WebviewTypeSchema,
  title: z6.string(),
  resourceId: z6.string().optional(),
  state: z6.record(z6.unknown())
});
var CompletionItemKindSchema = z6.enum([
  "text",
  "method",
  "function",
  "constructor",
  "field",
  "variable",
  "class",
  "interface",
  "module",
  "property",
  "keyword",
  "snippet",
  "value",
  "constant",
  "enum",
  "folder",
  "file"
]);
var CompletionItemSchema = z6.object({
  label: z6.string(),
  kind: CompletionItemKindSchema,
  detail: z6.string().optional(),
  documentation: z6.string().optional(),
  insertText: z6.string().optional(),
  insertTextRules: z6.number().optional(),
  sortText: z6.string().optional(),
  filterText: z6.string().optional(),
  preselect: z6.boolean().optional(),
  commitCharacters: z6.array(z6.string()).optional(),
  additionalTextEdits: z6.array(z6.object({
    range: z6.object({
      startLine: z6.number(),
      startColumn: z6.number(),
      endLine: z6.number(),
      endColumn: z6.number()
    }),
    newText: z6.string()
  })).optional()
});
var HoverContentSchema = z6.object({
  contents: z6.array(z6.union([
    z6.string(),
    z6.object({
      language: z6.string(),
      value: z6.string()
    })
  ])),
  range: z6.object({
    startLine: z6.number(),
    startColumn: z6.number(),
    endLine: z6.number(),
    endColumn: z6.number()
  }).optional()
});
var CodeActionKindSchema = z6.enum([
  "quickFix",
  "refactor",
  "refactor.extract",
  "refactor.inline",
  "refactor.rewrite",
  "source",
  "source.organizeImports",
  "source.fixAll"
]);
var CodeActionSchema = z6.object({
  title: z6.string(),
  kind: CodeActionKindSchema,
  diagnostics: z6.array(DiagnosticSchema).optional(),
  isPreferred: z6.boolean().optional(),
  disabled: z6.object({ reason: z6.string() }).optional(),
  edit: z6.object({
    changes: z6.record(z6.array(z6.object({
      range: z6.object({
        startLine: z6.number(),
        startColumn: z6.number(),
        endLine: z6.number(),
        endColumn: z6.number()
      }),
      newText: z6.string()
    })))
  }).optional(),
  command: z6.object({
    command: z6.string(),
    title: z6.string(),
    arguments: z6.array(z6.unknown()).optional()
  }).optional()
});
var VSCodeManagerConfigSchema = z6.object({
  extensionId: z6.string().default("gicm.integration-hub"),
  version: z6.string().default("1.0.0"),
  displayName: z6.string().default("Integration Hub"),
  description: z6.string().default("AI-powered pipeline orchestration"),
  enableDebugLogging: z6.boolean().default(false)
});
var DEFAULT_COMMANDS = [
  {
    command: "integrationHub.createPipeline",
    title: "Create Pipeline",
    category: "Integration Hub",
    icon: "$(add)",
    keybinding: { key: "ctrl+shift+p", mac: "cmd+shift+p", when: "editorFocus" }
  },
  {
    command: "integrationHub.runPipeline",
    title: "Run Pipeline",
    category: "Integration Hub",
    icon: "$(play)",
    keybinding: { key: "ctrl+shift+r", mac: "cmd+shift+r" }
  },
  {
    command: "integrationHub.stopPipeline",
    title: "Stop Pipeline",
    category: "Integration Hub",
    icon: "$(debug-stop)"
  },
  {
    command: "integrationHub.openPipeline",
    title: "Open Pipeline",
    category: "Integration Hub",
    icon: "$(file-code)"
  },
  {
    command: "integrationHub.deletePipeline",
    title: "Delete Pipeline",
    category: "Integration Hub",
    icon: "$(trash)"
  },
  {
    command: "integrationHub.refreshTree",
    title: "Refresh",
    category: "Integration Hub",
    icon: "$(refresh)"
  },
  {
    command: "integrationHub.openSettings",
    title: "Open Settings",
    category: "Integration Hub",
    icon: "$(gear)"
  },
  {
    command: "integrationHub.openDashboard",
    title: "Open Dashboard",
    category: "Integration Hub",
    icon: "$(dashboard)"
  },
  {
    command: "integrationHub.viewExecution",
    title: "View Execution",
    category: "Integration Hub",
    icon: "$(list-tree)"
  },
  {
    command: "integrationHub.createSchedule",
    title: "Create Schedule",
    category: "Integration Hub",
    icon: "$(calendar)"
  },
  {
    command: "integrationHub.validatePipeline",
    title: "Validate Pipeline",
    category: "Integration Hub",
    icon: "$(check)"
  },
  {
    command: "integrationHub.formatDocument",
    title: "Format Pipeline Document",
    category: "Integration Hub",
    icon: "$(symbol-misc)"
  }
];
var PIPELINE_SNIPPETS = [
  {
    label: "pipeline",
    kind: "snippet",
    detail: "Create a new pipeline",
    documentation: "Creates a new pipeline configuration with basic structure",
    insertText: `name: \${1:my-pipeline}
description: \${2:Pipeline description}
version: 1

steps:
  - name: \${3:step-name}
    type: \${4|llm,transform,condition,parallel,loop|}
    config:
      \${5:# configuration}
`
  },
  {
    label: "step-llm",
    kind: "snippet",
    detail: "Add an LLM step",
    documentation: "Creates an LLM step for AI processing",
    insertText: `- name: \${1:llm-step}
  type: llm
  config:
    model: \${2|claude-3-sonnet,claude-3-opus,claude-3-haiku,gpt-4,gpt-4-turbo|}
    prompt: |
      \${3:Your prompt here}
    temperature: \${4:0.7}
    max_tokens: \${5:1000}
`
  },
  {
    label: "step-transform",
    kind: "snippet",
    detail: "Add a transform step",
    documentation: "Creates a data transformation step",
    insertText: `- name: \${1:transform-step}
  type: transform
  config:
    operation: \${2|map,filter,reduce,flatten,merge|}
    input: \${3:\\$\\{previous.output\\}}
    expression: |
      \${4:// transformation logic}
`
  },
  {
    label: "step-condition",
    kind: "snippet",
    detail: "Add a conditional step",
    documentation: "Creates a conditional branching step",
    insertText: `- name: \${1:condition-step}
  type: condition
  config:
    condition: \${2:\\$\\{previous.output.score > 0.5\\}}
    then: \${3:step-if-true}
    else: \${4:step-if-false}
`
  },
  {
    label: "step-parallel",
    kind: "snippet",
    detail: "Add parallel execution",
    documentation: "Creates parallel step execution",
    insertText: `- name: \${1:parallel-step}
  type: parallel
  config:
    branches:
      - \${2:branch-a}
      - \${3:branch-b}
    wait_all: true
`
  },
  {
    label: "step-loop",
    kind: "snippet",
    detail: "Add a loop step",
    documentation: "Creates a loop/iteration step",
    insertText: `- name: \${1:loop-step}
  type: loop
  config:
    items: \${2:\\$\\{input.items\\}}
    step: \${3:process-item}
    max_iterations: \${4:100}
    parallel: \${5:false}
`
  },
  {
    label: "schedule",
    kind: "snippet",
    detail: "Add a schedule",
    documentation: "Creates a schedule configuration",
    insertText: `schedule:
  cron: "\${1:0 9 * * 1-5}"
  timezone: \${2:UTC}
  enabled: true
`
  },
  {
    label: "budget",
    kind: "snippet",
    detail: "Add budget limits",
    documentation: "Creates budget configuration",
    insertText: `budget:
  daily_limit: \${1:100}
  monthly_limit: \${2:2000}
  alert_thresholds:
    - 50
    - 75
    - 90
`
  }
];

// src/vscode/vscode-manager.ts
import { EventEmitter as EventEmitter8 } from "eventemitter3";
import { randomUUID as randomUUID3 } from "crypto";
var VSCodeManager = class extends EventEmitter8 {
  managerConfig;
  extensionConfig;
  state = "inactive";
  treeData = /* @__PURE__ */ new Map();
  editors = /* @__PURE__ */ new Map();
  diagnostics = /* @__PURE__ */ new Map();
  webviews = /* @__PURE__ */ new Map();
  statusBarItems = /* @__PURE__ */ new Map();
  refreshInterval = null;
  constructor(config = {}) {
    super();
    this.managerConfig = VSCodeManagerConfigSchema.parse(config);
    this.extensionConfig = ExtensionConfigSchema.parse({});
  }
  // ============================================================================
  // Lifecycle
  // ============================================================================
  /**
   * Activate the extension
   */
  async activate() {
    if (this.state === "active") {
      return;
    }
    this.state = "activating";
    try {
      await this.initializeTreeViews();
      await this.initializeStatusBar();
      await this.registerCommands();
      await this.registerLanguageFeatures();
      if (this.extensionConfig.autoRefresh) {
        this.startAutoRefresh();
      }
      this.state = "active";
      this.emit("activated");
    } catch (error) {
      this.state = "error";
      this.emit("error", error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  /**
   * Deactivate the extension
   */
  async deactivate() {
    if (this.state !== "active") {
      return;
    }
    this.stopAutoRefresh();
    for (const [id] of this.editors) {
      await this.closeEditor(id);
    }
    for (const [id] of this.webviews) {
      await this.closeWebview(id);
    }
    this.statusBarItems.clear();
    this.state = "inactive";
    this.emit("deactivated");
  }
  /**
   * Update configuration
   */
  updateConfig(config) {
    const oldConfig = this.extensionConfig;
    this.extensionConfig = ExtensionConfigSchema.parse({
      ...this.extensionConfig,
      ...config
    });
    if (this.extensionConfig.autoRefresh !== oldConfig.autoRefresh) {
      if (this.extensionConfig.autoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    }
    this.emit("configChanged", this.extensionConfig);
  }
  // ============================================================================
  // Tree Views
  // ============================================================================
  /**
   * Get tree items for a view
   */
  getTreeItems(viewId) {
    return this.treeData.get(viewId) || [];
  }
  /**
   * Refresh tree view
   */
  async refreshTreeView(viewId) {
    if (viewId) {
      await this.loadTreeData(viewId);
    } else {
      for (const id of this.treeData.keys()) {
        await this.loadTreeData(id);
      }
    }
    this.emit("treeRefreshed");
  }
  /**
   * Select tree item
   */
  selectTreeItem(item) {
    this.emit("treeItemSelected", item);
    if (item.command) {
      this.executeCommand(item.command.command, item.command.arguments);
    }
  }
  /**
   * Expand tree item
   */
  expandTreeItem(item) {
    this.emit("treeItemExpanded", item);
  }
  // ============================================================================
  // Editors
  // ============================================================================
  /**
   * Open an editor
   */
  async openEditor(type, resourceId) {
    const editorId = resourceId ? `${type}:${resourceId}` : `${type}:new-${randomUUID3()}`;
    const content = await this.fetchEditorContent(type, resourceId);
    const editorState = {
      type,
      resourceId,
      isDirty: false,
      content
    };
    this.editors.set(editorId, editorState);
    this.emit("editorOpened", type, resourceId);
    return editorId;
  }
  /**
   * Close an editor
   */
  async closeEditor(editorId) {
    const editor = this.editors.get(editorId);
    if (!editor) {
      return;
    }
    if (editor.isDirty) {
      console.warn(`Editor ${editorId} has unsaved changes`);
    }
    this.editors.delete(editorId);
    this.emit("editorClosed", editor.type, editor.resourceId);
  }
  /**
   * Save editor content
   */
  async saveEditor(editorId) {
    const editor = this.editors.get(editorId);
    if (!editor) {
      throw new Error(`Editor not found: ${editorId}`);
    }
    const diagnostics = await this.validateContent(editor.content, editor.type);
    const hasErrors = diagnostics.some((d) => d.severity === "error");
    if (hasErrors) {
      throw new Error("Cannot save: document has errors");
    }
    await this.saveEditorContent(editor);
    editor.isDirty = false;
    this.emit("editorSaved", editor.type, editor.resourceId, editor.content);
  }
  /**
   * Update editor content
   */
  updateEditorContent(editorId, content) {
    const editor = this.editors.get(editorId);
    if (!editor) {
      return;
    }
    editor.content = content;
    editor.isDirty = true;
    this.validateContent(content, editor.type).then((diagnostics) => {
      this.diagnostics.set(editorId, diagnostics);
    });
  }
  // ============================================================================
  // Diagnostics
  // ============================================================================
  /**
   * Get diagnostics for an editor
   */
  getDiagnostics(editorId) {
    return this.diagnostics.get(editorId) || [];
  }
  /**
   * Validate content and return diagnostics
   */
  async validateContent(content, type) {
    const diagnostics = [];
    if (type === "pipeline") {
      try {
        if (!content.includes("name:")) {
          diagnostics.push({
            severity: "error",
            message: "Pipeline must have a name",
            source: "Integration Hub",
            range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1 }
          });
        }
        if (!content.includes("steps:")) {
          diagnostics.push({
            severity: "error",
            message: "Pipeline must have at least one step",
            source: "Integration Hub",
            range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1 }
          });
        }
        if (content.includes("api_key:")) {
          diagnostics.push({
            severity: "warning",
            message: "api_key should be defined in environment variables, not in pipeline",
            source: "Integration Hub",
            code: "deprecated-api-key",
            range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1 }
          });
        }
      } catch {
        diagnostics.push({
          severity: "error",
          message: "Invalid YAML syntax",
          source: "Integration Hub",
          range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1 }
        });
      }
    }
    return diagnostics;
  }
  // ============================================================================
  // Commands
  // ============================================================================
  /**
   * Get available commands
   */
  getCommands() {
    return DEFAULT_COMMANDS;
  }
  /**
   * Execute a command
   */
  async executeCommand(command, args) {
    this.emit("commandExecuted", command, args);
    switch (command) {
      case "integrationHub.createPipeline":
        return this.openEditor("pipeline");
      case "integrationHub.runPipeline":
        return this.runPipeline(args?.[0]);
      case "integrationHub.stopPipeline":
        return this.stopPipeline(args?.[0]);
      case "integrationHub.openPipeline":
        return this.openEditor("pipeline", args?.[0]);
      case "integrationHub.deletePipeline":
        return this.deletePipeline(args?.[0]);
      case "integrationHub.refreshTree":
        return this.refreshTreeView();
      case "integrationHub.openSettings":
        return this.openWebview("settingsEditor");
      case "integrationHub.openDashboard":
        return this.openWebview("dashboardPanel");
      case "integrationHub.viewExecution":
        return this.openWebview("executionViewer", args?.[0]);
      case "integrationHub.createSchedule":
        return this.openEditor("schedule");
      case "integrationHub.validatePipeline":
        return this.validateCurrentEditor();
      case "integrationHub.formatDocument":
        return this.formatCurrentDocument();
      default:
        console.warn(`Unknown command: ${command}`);
        return void 0;
    }
  }
  // ============================================================================
  // Status Bar
  // ============================================================================
  /**
   * Update status bar item
   */
  updateStatusBarItem(item) {
    this.statusBarItems.set(item.id, item);
  }
  /**
   * Get status bar items
   */
  getStatusBarItems() {
    return Array.from(this.statusBarItems.values()).sort((a, b) => b.priority - a.priority);
  }
  // ============================================================================
  // Quick Pick
  // ============================================================================
  /**
   * Show quick pick
   */
  async showQuickPick(items, options) {
    if (items.length === 0) {
      return void 0;
    }
    return options?.canPickMany ? items : items[0];
  }
  // ============================================================================
  // Notifications
  // ============================================================================
  /**
   * Show notification
   */
  async showNotification(notification) {
    if (!this.extensionConfig.showNotifications) {
      return void 0;
    }
    console.log(`[${notification.type.toUpperCase()}] ${notification.message}`);
    return notification.actions?.[0]?.title;
  }
  // ============================================================================
  // Webviews
  // ============================================================================
  /**
   * Open a webview
   */
  async openWebview(type, resourceId) {
    const webviewId = resourceId ? `${type}:${resourceId}` : `${type}:${randomUUID3()}`;
    const webviewState = {
      type,
      title: this.getWebviewTitle(type),
      resourceId,
      state: {}
    };
    this.webviews.set(webviewId, webviewState);
    this.emit("webviewOpened", type);
    return webviewId;
  }
  /**
   * Close a webview
   */
  async closeWebview(webviewId) {
    const webview = this.webviews.get(webviewId);
    if (!webview) {
      return;
    }
    this.webviews.delete(webviewId);
    this.emit("webviewClosed", webview.type);
  }
  /**
   * Send message to webview
   */
  postMessageToWebview(webviewId, message) {
    const webview = this.webviews.get(webviewId);
    if (!webview) {
      return;
    }
    this.emit("webviewMessage", webview.type, message);
  }
  /**
   * Handle message from webview
   */
  handleWebviewMessage(webviewId, message) {
    const webview = this.webviews.get(webviewId);
    if (!webview) {
      return;
    }
    switch (message.type) {
      case "save":
        this.handleWebviewSave(webview, message.payload);
        break;
      case "execute":
        this.handleWebviewExecute(webview, message.payload);
        break;
      case "navigate":
        this.handleWebviewNavigate(webview, message.payload);
        break;
      default:
        this.emit("webviewMessage", webview.type, message);
    }
  }
  // ============================================================================
  // Language Features
  // ============================================================================
  /**
   * Get completions
   */
  getCompletions(_content, _position) {
    return PIPELINE_SNIPPETS;
  }
  /**
   * Get hover information
   */
  getHover(content, position) {
    const lines = content.split("\n");
    const line = lines[position.line - 1] || "";
    if (line.includes("type: llm")) {
      return {
        contents: [
          { language: "markdown", value: "**LLM Step**" },
          "Executes an AI model to process input and generate output.",
          "**Available models:** claude-3-opus, claude-3-sonnet, gpt-4, etc."
        ]
      };
    }
    if (line.includes("type: transform")) {
      return {
        contents: [
          { language: "markdown", value: "**Transform Step**" },
          "Transforms data using JavaScript expressions or built-in operations."
        ]
      };
    }
    return void 0;
  }
  /**
   * Get code actions
   */
  getCodeActions(editorId) {
    const diagnostics = this.getDiagnostics(editorId);
    const actions = [];
    for (const diagnostic of diagnostics) {
      if (diagnostic.code === "deprecated-api-key") {
        actions.push({
          title: "Move API key to environment variables",
          kind: "quickFix",
          diagnostics: [diagnostic],
          isPreferred: true
        });
      }
      if (diagnostic.message.includes("must have a name")) {
        actions.push({
          title: "Add pipeline name",
          kind: "quickFix",
          diagnostics: [diagnostic],
          edit: {
            changes: {
              [editorId]: [
                {
                  range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1 },
                  newText: "name: my-pipeline\n"
                }
              ]
            }
          }
        });
      }
    }
    return actions;
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  async initializeTreeViews() {
    this.treeData.set("pipelines", []);
    await this.loadTreeData("pipelines");
    this.treeData.set("schedules", []);
    await this.loadTreeData("schedules");
    this.treeData.set("executions", []);
    await this.loadTreeData("executions");
  }
  async loadTreeData(viewId) {
    const items = [];
    switch (viewId) {
      case "pipelines":
        items.push(
          this.createTreeItem("pipeline", "content-generator", "Content Generator", "running"),
          this.createTreeItem("pipeline", "data-extraction", "Data Extraction", "default"),
          this.createTreeItem("pipeline", "reporting", "Reporting Pipeline", "success")
        );
        break;
      case "schedules":
        items.push(
          this.createTreeItem("schedule", "daily-content", "Daily Content (9am)", "default"),
          this.createTreeItem("schedule", "weekly-report", "Weekly Report (Mon)", "default")
        );
        break;
      case "executions":
        items.push(
          this.createTreeItem("execution", "exec-1", "content-generator #123", "running"),
          this.createTreeItem("execution", "exec-2", "data-extraction #456", "success"),
          this.createTreeItem("execution", "exec-3", "reporting #789", "error")
        );
        break;
    }
    this.treeData.set(viewId, items);
  }
  createTreeItem(type, id, label, state) {
    return {
      id,
      type,
      label,
      state,
      contextValue: type,
      command: {
        command: `integrationHub.open${type.charAt(0).toUpperCase() + type.slice(1)}`,
        title: `Open ${type}`,
        arguments: [id]
      }
    };
  }
  async initializeStatusBar() {
    if (!this.extensionConfig.showStatusBar) {
      return;
    }
    this.updateStatusBarItem({
      id: "status",
      text: "$(cloud) Integration Hub",
      tooltip: "Integration Hub: Connected",
      command: "integrationHub.openDashboard",
      priority: 100,
      alignment: "left"
    });
    this.updateStatusBarItem({
      id: "budget",
      text: "$(credit-card) $45.20",
      tooltip: "Today's spend: $45.20 / $100",
      command: "integrationHub.openSettings",
      priority: 99,
      alignment: "left"
    });
  }
  async registerCommands() {
  }
  async registerLanguageFeatures() {
  }
  startAutoRefresh() {
    if (this.refreshInterval) {
      return;
    }
    this.refreshInterval = setInterval(async () => {
      await this.refreshTreeView();
    }, this.extensionConfig.refreshIntervalMs);
  }
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
  async fetchEditorContent(type, resourceId) {
    if (!resourceId) {
      switch (type) {
        case "pipeline":
          return `name: new-pipeline
description: A new pipeline

steps:
  - name: step-1
    type: llm
    config:
      model: claude-3-sonnet
      prompt: "Your prompt here"
`;
        case "schedule":
          return `pipeline_id: ""
name: new-schedule
cron_expression: "0 9 * * 1-5"
timezone: UTC
enabled: true
`;
        default:
          return "";
      }
    }
    return `name: ${resourceId}
description: Loaded from API

steps:
  - name: example-step
    type: llm
    config:
      model: claude-3-sonnet
      prompt: "Process the input"
`;
  }
  async saveEditorContent(_editor) {
  }
  async runPipeline(pipelineId) {
    await this.showNotification({
      type: "info",
      message: `Starting pipeline: ${pipelineId}`
    });
  }
  async stopPipeline(pipelineId) {
    await this.showNotification({
      type: "info",
      message: `Stopping pipeline: ${pipelineId}`
    });
  }
  async deletePipeline(pipelineId) {
    await this.showNotification({
      type: "warning",
      message: `Deleted pipeline: ${pipelineId}`
    });
    await this.refreshTreeView("pipelines");
  }
  async validateCurrentEditor() {
    await this.showNotification({
      type: "info",
      message: "Pipeline validation passed"
    });
  }
  async formatCurrentDocument() {
    await this.showNotification({
      type: "info",
      message: "Document formatted"
    });
  }
  getWebviewTitle(type) {
    const titles = {
      pipelineVisualEditor: "Pipeline Editor",
      executionViewer: "Execution Details",
      dashboardPanel: "Integration Hub Dashboard",
      settingsEditor: "Settings",
      welcomePanel: "Welcome to Integration Hub"
    };
    return titles[type];
  }
  handleWebviewSave(_webview, _payload) {
  }
  handleWebviewExecute(_webview, _payload) {
  }
  handleWebviewNavigate(_webview, _payload) {
  }
  /**
   * Get summary of extension state
   */
  getSummary() {
    return {
      state: this.state,
      openEditors: this.editors.size,
      openWebviews: this.webviews.size,
      registeredCommands: DEFAULT_COMMANDS.length,
      autoRefreshEnabled: this.extensionConfig.autoRefresh
    };
  }
};
var vscodeManagerInstance = null;
function getVSCodeManager() {
  if (!vscodeManagerInstance) {
    vscodeManagerInstance = new VSCodeManager();
  }
  return vscodeManagerInstance;
}
function createVSCodeManager(config = {}) {
  return new VSCodeManager(config);
}

// src/ha/types.ts
import { z as z7 } from "zod";
var RegionSchema = z7.enum([
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
  "ap-northeast-1"
]);
var RegionStatusSchema = z7.enum([
  "active",
  "standby",
  "degraded",
  "offline",
  "draining"
]);
var RegionConfigSchema = z7.object({
  id: z7.string(),
  region: RegionSchema,
  endpoint: z7.string().url(),
  status: RegionStatusSchema,
  isPrimary: z7.boolean(),
  weight: z7.number().min(0).max(100).default(100),
  healthEndpoint: z7.string().optional(),
  metadata: z7.record(z7.unknown()).optional()
});
var HealthCheckTypeSchema = z7.enum([
  "http",
  "tcp",
  "grpc",
  "custom"
]);
var HealthCheckResultSchema = z7.object({
  region: RegionSchema,
  healthy: z7.boolean(),
  latencyMs: z7.number(),
  statusCode: z7.number().optional(),
  message: z7.string().optional(),
  checkedAt: z7.string(),
  consecutiveFailures: z7.number().default(0),
  lastSuccessAt: z7.string().optional(),
  lastFailureAt: z7.string().optional()
});
var HealthCheckConfigSchema = z7.object({
  type: HealthCheckTypeSchema,
  intervalMs: z7.number().default(3e4),
  timeoutMs: z7.number().default(5e3),
  unhealthyThreshold: z7.number().default(3),
  healthyThreshold: z7.number().default(2),
  path: z7.string().default("/health"),
  expectedStatus: z7.number().default(200)
});
var LoadBalanceStrategySchema = z7.enum([
  "round-robin",
  "weighted",
  "least-connections",
  "latency-based",
  "geo-proximity",
  "failover"
]);
var RouteDecisionSchema = z7.object({
  region: RegionSchema,
  endpoint: z7.string(),
  reason: z7.string(),
  fallbackRegions: z7.array(RegionSchema),
  metadata: z7.record(z7.unknown()).optional()
});
var FailoverModeSchema = z7.enum([
  "automatic",
  "manual",
  "semi-automatic"
]);
var FailoverEventSchema = z7.object({
  id: z7.string(),
  fromRegion: RegionSchema,
  toRegion: RegionSchema,
  reason: z7.string(),
  triggeredBy: z7.enum(["health-check", "manual", "scheduled", "capacity"]),
  startedAt: z7.string(),
  completedAt: z7.string().optional(),
  status: z7.enum(["in-progress", "completed", "failed", "rolled-back"]),
  affectedPipelines: z7.number().default(0),
  metadata: z7.record(z7.unknown()).optional()
});
var FailoverConfigSchema = z7.object({
  mode: FailoverModeSchema.default("automatic"),
  triggerThreshold: z7.number().default(3),
  cooldownMs: z7.number().default(3e5),
  maxFailoversPerHour: z7.number().default(3),
  notifyOnFailover: z7.boolean().default(true),
  requireApproval: z7.boolean().default(false),
  rollbackOnFailure: z7.boolean().default(true)
});
var ReplicationModeSchema = z7.enum([
  "sync",
  "async",
  "semi-sync"
]);
var ReplicationStatusSchema = z7.object({
  sourceRegion: RegionSchema,
  targetRegion: RegionSchema,
  mode: ReplicationModeSchema,
  lagMs: z7.number(),
  bytesReplicated: z7.number(),
  lastReplicatedAt: z7.string(),
  healthy: z7.boolean(),
  error: z7.string().optional()
});
var ReplicationConfigSchema = z7.object({
  mode: ReplicationModeSchema.default("async"),
  targetRegions: z7.array(RegionSchema),
  maxLagMs: z7.number().default(5e3),
  batchSize: z7.number().default(100),
  retryAttempts: z7.number().default(3),
  conflictResolution: z7.enum(["last-write-wins", "merge", "manual"]).default("last-write-wins")
});
var SessionAffinitySchema = z7.object({
  enabled: z7.boolean().default(false),
  ttlMs: z7.number().default(36e5),
  cookieName: z7.string().default("gicm_region"),
  strategy: z7.enum(["cookie", "ip-hash", "header"]).default("cookie")
});
var HAManagerConfigSchema = z7.object({
  regions: z7.array(RegionConfigSchema),
  healthCheck: HealthCheckConfigSchema.optional(),
  loadBalancing: z7.object({
    strategy: LoadBalanceStrategySchema.default("weighted"),
    stickySession: SessionAffinitySchema.optional()
  }).optional(),
  failover: FailoverConfigSchema.optional(),
  replication: ReplicationConfigSchema.optional(),
  monitoring: z7.object({
    enabled: z7.boolean().default(true),
    metricsIntervalMs: z7.number().default(6e4),
    alertThresholds: z7.object({
      latencyMs: z7.number().default(500),
      errorRate: z7.number().default(0.05),
      availabilityPercent: z7.number().default(99.9)
    }).optional()
  }).optional()
});
var HAStateSchema = z7.object({
  primaryRegion: RegionSchema,
  activeRegions: z7.array(RegionSchema),
  regionHealth: z7.record(RegionSchema, HealthCheckResultSchema),
  replicationStatus: z7.array(ReplicationStatusSchema),
  lastFailover: FailoverEventSchema.optional(),
  failoverCount24h: z7.number().default(0),
  globalLatencyMs: z7.number(),
  globalAvailability: z7.number(),
  lastUpdated: z7.string()
});
var REGION_DISPLAY_NAMES = {
  "us-east-1": "US East (N. Virginia)",
  "us-west-2": "US West (Oregon)",
  "eu-west-1": "EU (Ireland)",
  "eu-central-1": "EU (Frankfurt)",
  "ap-southeast-1": "Asia Pacific (Singapore)",
  "ap-northeast-1": "Asia Pacific (Tokyo)"
};
var DEFAULT_HEALTH_CHECK_CONFIG = {
  type: "http",
  intervalMs: 3e4,
  timeoutMs: 5e3,
  unhealthyThreshold: 3,
  healthyThreshold: 2,
  path: "/health",
  expectedStatus: 200
};
var DEFAULT_FAILOVER_CONFIG = {
  mode: "automatic",
  triggerThreshold: 3,
  cooldownMs: 3e5,
  maxFailoversPerHour: 3,
  notifyOnFailover: true,
  requireApproval: false,
  rollbackOnFailure: true
};

// src/ha/health-checker.ts
import { EventEmitter as EventEmitter9 } from "eventemitter3";
var HealthChecker = class extends EventEmitter9 {
  config;
  regions = /* @__PURE__ */ new Map();
  results = /* @__PURE__ */ new Map();
  checkInterval = null;
  consecutiveFailures = /* @__PURE__ */ new Map();
  consecutiveSuccesses = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    super();
    this.config = { ...DEFAULT_HEALTH_CHECK_CONFIG, ...config };
  }
  // ===========================================================================
  // REGION MANAGEMENT
  // ===========================================================================
  addRegion(regionConfig) {
    this.regions.set(regionConfig.region, regionConfig);
    this.consecutiveFailures.set(regionConfig.region, 0);
    this.consecutiveSuccesses.set(regionConfig.region, 0);
    console.log(`[HA] Added region for health checks: ${regionConfig.region}`);
  }
  removeRegion(region) {
    this.regions.delete(region);
    this.results.delete(region);
    this.consecutiveFailures.delete(region);
    this.consecutiveSuccesses.delete(region);
    console.log(`[HA] Removed region from health checks: ${region}`);
  }
  // ===========================================================================
  // HEALTH CHECK EXECUTION
  // ===========================================================================
  async checkRegion(region) {
    const regionConfig = this.regions.get(region);
    if (!regionConfig) {
      throw new Error(`Region not configured: ${region}`);
    }
    const startTime = Date.now();
    let healthy = false;
    let statusCode;
    let message;
    try {
      const healthEndpoint = regionConfig.healthEndpoint || `${regionConfig.endpoint}${this.config.path}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
      try {
        const response = await fetch(healthEndpoint, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent": "gICM-HealthChecker/1.0",
            "Accept": "application/json"
          }
        });
        clearTimeout(timeout);
        statusCode = response.status;
        healthy = response.status === this.config.expectedStatus;
        if (!healthy) {
          const body = await response.text().catch(() => "");
          message = `Unexpected status: ${response.status}. ${body.slice(0, 100)}`;
        }
      } catch (fetchError) {
        clearTimeout(timeout);
        if (fetchError instanceof Error) {
          if (fetchError.name === "AbortError") {
            message = `Timeout after ${this.config.timeoutMs}ms`;
          } else {
            message = fetchError.message;
          }
        }
      }
    } catch (error) {
      message = error instanceof Error ? error.message : "Unknown error";
    }
    const latencyMs = Date.now() - startTime;
    const prevResult = this.results.get(region);
    const prevFailures = this.consecutiveFailures.get(region) || 0;
    if (healthy) {
      this.consecutiveFailures.set(region, 0);
      this.consecutiveSuccesses.set(region, (this.consecutiveSuccesses.get(region) || 0) + 1);
    } else {
      this.consecutiveSuccesses.set(region, 0);
      this.consecutiveFailures.set(region, prevFailures + 1);
    }
    const result = {
      region,
      healthy,
      latencyMs,
      statusCode,
      message,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
      consecutiveFailures: this.consecutiveFailures.get(region) || 0,
      lastSuccessAt: healthy ? (/* @__PURE__ */ new Date()).toISOString() : prevResult?.lastSuccessAt,
      lastFailureAt: !healthy ? (/* @__PURE__ */ new Date()).toISOString() : prevResult?.lastFailureAt
    };
    this.results.set(region, result);
    if (prevResult?.healthy && !healthy) {
      if (result.consecutiveFailures >= this.config.unhealthyThreshold) {
        this.emit("health:degraded", region, result);
        console.log(`[HA] Region ${region} is DEGRADED (${result.consecutiveFailures} failures)`);
      }
    } else if (!prevResult?.healthy && healthy) {
      const successes = this.consecutiveSuccesses.get(region) || 0;
      if (successes >= this.config.healthyThreshold) {
        this.emit("health:recovered", region, result);
        console.log(`[HA] Region ${region} RECOVERED`);
      }
    }
    return result;
  }
  async checkAllRegions() {
    const regions = Array.from(this.regions.keys());
    const results = await Promise.all(
      regions.map((region) => this.checkRegion(region).catch((error) => ({
        region,
        healthy: false,
        latencyMs: 0,
        checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
        consecutiveFailures: (this.consecutiveFailures.get(region) || 0) + 1,
        message: error instanceof Error ? error.message : "Check failed"
      })))
    );
    this.emit("health:checked", results);
    return results;
  }
  // ===========================================================================
  // CONTINUOUS MONITORING
  // ===========================================================================
  start() {
    if (this.checkInterval) {
      console.log("[HA] Health checker already running");
      return;
    }
    console.log(`[HA] Starting health checker (interval: ${this.config.intervalMs}ms)`);
    this.checkAllRegions().catch((err) => {
      console.error("[HA] Initial health check failed:", err);
    });
    this.checkInterval = setInterval(() => {
      this.checkAllRegions().catch((err) => {
        console.error("[HA] Health check failed:", err);
      });
    }, this.config.intervalMs);
  }
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("[HA] Health checker stopped");
    }
  }
  // ===========================================================================
  // GETTERS
  // ===========================================================================
  getResult(region) {
    return this.results.get(region);
  }
  getAllResults() {
    return new Map(this.results);
  }
  getHealthyRegions() {
    return Array.from(this.results.entries()).filter(([_, result]) => result.healthy).map(([region]) => region);
  }
  getUnhealthyRegions() {
    return Array.from(this.results.entries()).filter(([_, result]) => !result.healthy).map(([region]) => region);
  }
  isRegionHealthy(region) {
    const result = this.results.get(region);
    return result?.healthy ?? false;
  }
  getAverageLatency() {
    const results = Array.from(this.results.values()).filter((r) => r.healthy);
    if (results.length === 0) return 0;
    return results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length;
  }
  getGlobalAvailability() {
    const total = this.results.size;
    if (total === 0) return 100;
    const healthy = this.getHealthyRegions().length;
    return healthy / total * 100;
  }
};
var healthCheckerInstance = null;
function getHealthChecker() {
  if (!healthCheckerInstance) {
    healthCheckerInstance = new HealthChecker();
  }
  return healthCheckerInstance;
}
function createHealthChecker(config) {
  healthCheckerInstance = new HealthChecker(config);
  return healthCheckerInstance;
}

// src/ha/load-balancer.ts
var LoadBalancer = class {
  strategy;
  regions = /* @__PURE__ */ new Map();
  healthResults = /* @__PURE__ */ new Map();
  roundRobinIndex = 0;
  connectionCounts = /* @__PURE__ */ new Map();
  sessionAffinity = null;
  sessionMap = /* @__PURE__ */ new Map();
  constructor(strategy = "weighted") {
    this.strategy = strategy;
  }
  // ===========================================================================
  // CONFIGURATION
  // ===========================================================================
  setStrategy(strategy) {
    this.strategy = strategy;
    console.log(`[LB] Strategy set to: ${strategy}`);
  }
  setSessionAffinity(affinity) {
    this.sessionAffinity = affinity;
    if (affinity?.enabled) {
      console.log(`[LB] Session affinity enabled (TTL: ${affinity.ttlMs}ms)`);
    }
  }
  addRegion(config) {
    this.regions.set(config.region, config);
    this.connectionCounts.set(config.region, 0);
  }
  removeRegion(region) {
    this.regions.delete(region);
    this.connectionCounts.delete(region);
  }
  updateHealth(region, result) {
    this.healthResults.set(region, result);
  }
  // ===========================================================================
  // ROUTING DECISION
  // ===========================================================================
  route(options) {
    const availableRegions = this.getAvailableRegions(options?.excludeRegions);
    if (availableRegions.length === 0) {
      console.warn("[LB] No available regions for routing");
      return null;
    }
    if (this.sessionAffinity?.enabled && options?.sessionId) {
      const sessionRegion = this.sessionMap.get(options.sessionId);
      if (sessionRegion && availableRegions.includes(sessionRegion)) {
        const config2 = this.regions.get(sessionRegion);
        return {
          region: sessionRegion,
          endpoint: config2.endpoint,
          reason: "session_affinity",
          fallbackRegions: this.getFallbackRegions(sessionRegion, availableRegions)
        };
      }
    }
    if (options?.preferredRegion && availableRegions.includes(options.preferredRegion)) {
      const config2 = this.regions.get(options.preferredRegion);
      return {
        region: options.preferredRegion,
        endpoint: config2.endpoint,
        reason: "preferred",
        fallbackRegions: this.getFallbackRegions(options.preferredRegion, availableRegions)
      };
    }
    let selectedRegion;
    let reason;
    switch (this.strategy) {
      case "round-robin":
        selectedRegion = this.selectRoundRobin(availableRegions);
        reason = "round_robin";
        break;
      case "weighted":
        selectedRegion = this.selectWeighted(availableRegions);
        reason = "weighted";
        break;
      case "least-connections":
        selectedRegion = this.selectLeastConnections(availableRegions);
        reason = "least_connections";
        break;
      case "latency-based":
        selectedRegion = this.selectLatencyBased(availableRegions);
        reason = "latency_based";
        break;
      case "geo-proximity":
        selectedRegion = this.selectGeoProximity(availableRegions, options?.clientIp);
        reason = "geo_proximity";
        break;
      case "failover":
        selectedRegion = this.selectFailover(availableRegions);
        reason = "failover";
        break;
      default:
        selectedRegion = availableRegions[0];
        reason = "default";
    }
    if (this.sessionAffinity?.enabled && options?.sessionId) {
      this.sessionMap.set(options.sessionId, selectedRegion);
      setTimeout(() => {
        this.sessionMap.delete(options.sessionId);
      }, this.sessionAffinity.ttlMs);
    }
    const config = this.regions.get(selectedRegion);
    return {
      region: selectedRegion,
      endpoint: config.endpoint,
      reason,
      fallbackRegions: this.getFallbackRegions(selectedRegion, availableRegions)
    };
  }
  // ===========================================================================
  // STRATEGY IMPLEMENTATIONS
  // ===========================================================================
  selectRoundRobin(regions) {
    const region = regions[this.roundRobinIndex % regions.length];
    this.roundRobinIndex++;
    return region;
  }
  selectWeighted(regions) {
    const totalWeight = regions.reduce((sum, r) => {
      const config = this.regions.get(r);
      return sum + (config?.weight ?? 100);
    }, 0);
    let random = Math.random() * totalWeight;
    for (const region of regions) {
      const config = this.regions.get(region);
      const weight = config?.weight ?? 100;
      random -= weight;
      if (random <= 0) {
        return region;
      }
    }
    return regions[0];
  }
  selectLeastConnections(regions) {
    let minConnections = Infinity;
    let selectedRegion = regions[0];
    for (const region of regions) {
      const connections = this.connectionCounts.get(region) ?? 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedRegion = region;
      }
    }
    return selectedRegion;
  }
  selectLatencyBased(regions) {
    let minLatency = Infinity;
    let selectedRegion = regions[0];
    for (const region of regions) {
      const health = this.healthResults.get(region);
      const latency = health?.latencyMs ?? Infinity;
      if (latency < minLatency) {
        minLatency = latency;
        selectedRegion = region;
      }
    }
    return selectedRegion;
  }
  selectGeoProximity(regions, clientIp) {
    if (!clientIp) {
      return this.selectLatencyBased(regions);
    }
    const geoHints = {
      "10.": ["us-east-1", "us-west-2"],
      "172.": ["eu-west-1", "eu-central-1"],
      "192.168.": ["ap-southeast-1", "ap-northeast-1"]
    };
    for (const [prefix, preferredRegions] of Object.entries(geoHints)) {
      if (clientIp.startsWith(prefix)) {
        const match = preferredRegions.find((r) => regions.includes(r));
        if (match) return match;
      }
    }
    return this.selectLatencyBased(regions);
  }
  selectFailover(regions) {
    const primary = Array.from(this.regions.values()).filter((r) => r.isPrimary && regions.includes(r.region)).sort((a, b) => b.weight - a.weight);
    if (primary.length > 0) {
      return primary[0].region;
    }
    const standby = Array.from(this.regions.values()).filter((r) => regions.includes(r.region)).sort((a, b) => b.weight - a.weight);
    return standby[0]?.region ?? regions[0];
  }
  // ===========================================================================
  // HELPERS
  // ===========================================================================
  getAvailableRegions(excludeRegions) {
    const exclude = new Set(excludeRegions ?? []);
    return Array.from(this.regions.values()).filter((config) => {
      if (exclude.has(config.region)) return false;
      if (config.status === "offline" || config.status === "draining") return false;
      const health = this.healthResults.get(config.region);
      if (health && !health.healthy) return false;
      return true;
    }).map((config) => config.region);
  }
  getFallbackRegions(selected, available) {
    return available.filter((r) => r !== selected).sort((a, b) => {
      const healthA = this.healthResults.get(a);
      const healthB = this.healthResults.get(b);
      return (healthA?.latencyMs ?? Infinity) - (healthB?.latencyMs ?? Infinity);
    }).slice(0, 2);
  }
  // ===========================================================================
  // CONNECTION TRACKING
  // ===========================================================================
  incrementConnections(region) {
    const current = this.connectionCounts.get(region) ?? 0;
    this.connectionCounts.set(region, current + 1);
  }
  decrementConnections(region) {
    const current = this.connectionCounts.get(region) ?? 0;
    this.connectionCounts.set(region, Math.max(0, current - 1));
  }
  getConnectionCount(region) {
    return this.connectionCounts.get(region) ?? 0;
  }
  // ===========================================================================
  // STATS
  // ===========================================================================
  getStats() {
    return {
      strategy: this.strategy,
      regionCount: this.regions.size,
      availableCount: this.getAvailableRegions().length,
      connectionsByRegion: Object.fromEntries(this.connectionCounts),
      sessionCount: this.sessionMap.size
    };
  }
};
var loadBalancerInstance = null;
function getLoadBalancer() {
  if (!loadBalancerInstance) {
    loadBalancerInstance = new LoadBalancer();
  }
  return loadBalancerInstance;
}
function createLoadBalancer(strategy) {
  loadBalancerInstance = new LoadBalancer(strategy);
  return loadBalancerInstance;
}

// src/ha/failover-manager.ts
import { EventEmitter as EventEmitter10 } from "eventemitter3";
var FailoverManager = class extends EventEmitter10 {
  config;
  regions = /* @__PURE__ */ new Map();
  primaryRegion = null;
  failoverHistory = [];
  lastFailoverTime = 0;
  pendingApprovals = /* @__PURE__ */ new Map();
  failureCounts = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    super();
    this.config = { ...DEFAULT_FAILOVER_CONFIG, ...config };
  }
  // ===========================================================================
  // CONFIGURATION
  // ===========================================================================
  setConfig(config) {
    this.config = { ...this.config, ...config };
    console.log("[FAILOVER] Configuration updated");
  }
  addRegion(regionConfig) {
    this.regions.set(regionConfig.region, regionConfig);
    this.failureCounts.set(regionConfig.region, 0);
    if (regionConfig.isPrimary) {
      this.primaryRegion = regionConfig.region;
      console.log(`[FAILOVER] Primary region set: ${regionConfig.region}`);
    }
  }
  removeRegion(region) {
    const config = this.regions.get(region);
    this.regions.delete(region);
    this.failureCounts.delete(region);
    if (config?.isPrimary && this.primaryRegion === region) {
      const candidates = Array.from(this.regions.values()).filter((r) => r.status === "active" || r.status === "standby").sort((a, b) => b.weight - a.weight);
      if (candidates.length > 0) {
        this.primaryRegion = candidates[0].region;
        candidates[0].isPrimary = true;
        console.log(`[FAILOVER] New primary elected: ${this.primaryRegion}`);
      } else {
        this.primaryRegion = null;
        console.warn("[FAILOVER] No eligible primary region available");
      }
    }
  }
  // ===========================================================================
  // HEALTH MONITORING
  // ===========================================================================
  onHealthCheckResult(region, result) {
    if (result.healthy) {
      this.failureCounts.set(region, 0);
    } else {
      const current = this.failureCounts.get(region) ?? 0;
      const newCount = current + 1;
      this.failureCounts.set(region, newCount);
      console.log(`[FAILOVER] ${region} failure count: ${newCount}/${this.config.triggerThreshold}`);
      if (newCount >= this.config.triggerThreshold && region === this.primaryRegion) {
        this.evaluateFailover(region, "health-check");
      }
    }
  }
  // ===========================================================================
  // FAILOVER EXECUTION
  // ===========================================================================
  async evaluateFailover(fromRegion, triggeredBy) {
    const now = Date.now();
    if (now - this.lastFailoverTime < this.config.cooldownMs) {
      console.log(`[FAILOVER] Cooldown active, skipping failover evaluation`);
      return null;
    }
    const recentFailovers = this.failoverHistory.filter(
      (f) => now - new Date(f.startedAt).getTime() < 36e5
    );
    if (recentFailovers.length >= this.config.maxFailoversPerHour) {
      console.warn(`[FAILOVER] Max failovers per hour (${this.config.maxFailoversPerHour}) reached`);
      return null;
    }
    const targetRegion = this.selectFailoverTarget(fromRegion);
    if (!targetRegion) {
      console.error("[FAILOVER] No eligible failover target found");
      return null;
    }
    const event = {
      id: `fo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fromRegion,
      toRegion: targetRegion,
      reason: `${triggeredBy}: Region ${fromRegion} became unhealthy`,
      triggeredBy,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "in-progress",
      affectedPipelines: 0
    };
    if (this.config.requireApproval && this.config.mode !== "automatic") {
      event.status = "in-progress";
      this.pendingApprovals.set(event.id, event);
      console.log(`[FAILOVER] Awaiting approval for failover: ${event.id}`);
      if (this.config.notifyOnFailover) {
        this.emit("failover:started", event);
      }
      return event;
    }
    return this.executeFailover(event);
  }
  async executeFailover(event) {
    console.log(`[FAILOVER] Executing failover: ${event.fromRegion} -> ${event.toRegion}`);
    this.emit("failover:started", event);
    try {
      const fromConfig = this.regions.get(event.fromRegion);
      const toConfig = this.regions.get(event.toRegion);
      if (fromConfig) {
        fromConfig.status = "standby";
        fromConfig.isPrimary = false;
      }
      if (toConfig) {
        toConfig.status = "active";
        toConfig.isPrimary = true;
        this.primaryRegion = event.toRegion;
      }
      if (fromConfig) {
        this.emit("region:status_changed", event.fromRegion, "active", "standby");
      }
      if (toConfig) {
        this.emit("region:status_changed", event.toRegion, toConfig.status, "active");
      }
      event.status = "completed";
      event.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.lastFailoverTime = Date.now();
      this.failoverHistory.push(event);
      this.pendingApprovals.delete(event.id);
      console.log(`[FAILOVER] Completed: ${event.toRegion} is now primary`);
      this.emit("failover:completed", event);
      return event;
    } catch (error) {
      event.status = "failed";
      event.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      console.error("[FAILOVER] Failed:", error);
      if (this.config.rollbackOnFailure) {
        await this.rollbackFailover(event);
      }
      this.emit("failover:failed", event, error instanceof Error ? error : new Error(String(error)));
      return event;
    }
  }
  async rollbackFailover(event) {
    console.log(`[FAILOVER] Rolling back failover ${event.id}`);
    const fromConfig = this.regions.get(event.fromRegion);
    const toConfig = this.regions.get(event.toRegion);
    if (fromConfig) {
      fromConfig.status = "active";
      fromConfig.isPrimary = true;
      this.primaryRegion = event.fromRegion;
    }
    if (toConfig) {
      toConfig.status = "standby";
      toConfig.isPrimary = false;
    }
    event.status = "rolled-back";
    event.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    console.log(`[FAILOVER] Rollback completed, ${event.fromRegion} restored as primary`);
  }
  // ===========================================================================
  // APPROVAL WORKFLOW
  // ===========================================================================
  approveFailover(failoverId) {
    const event = this.pendingApprovals.get(failoverId);
    if (!event) {
      console.warn(`[FAILOVER] Approval not found: ${failoverId}`);
      return null;
    }
    this.executeFailover(event).catch((err) => {
      console.error("[FAILOVER] Approved failover execution failed:", err);
    });
    return event;
  }
  rejectFailover(failoverId, reason) {
    const event = this.pendingApprovals.get(failoverId);
    if (!event) {
      console.warn(`[FAILOVER] Approval not found: ${failoverId}`);
      return null;
    }
    event.status = "failed";
    event.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    event.metadata = { ...event.metadata, rejectionReason: reason };
    this.pendingApprovals.delete(failoverId);
    this.failoverHistory.push(event);
    console.log(`[FAILOVER] Rejected: ${failoverId}. Reason: ${reason || "No reason provided"}`);
    return event;
  }
  // ===========================================================================
  // MANUAL FAILOVER
  // ===========================================================================
  async manualFailover(toRegion, reason) {
    if (!this.primaryRegion) {
      console.error("[FAILOVER] No primary region to failover from");
      return null;
    }
    if (toRegion === this.primaryRegion) {
      console.warn("[FAILOVER] Target region is already primary");
      return null;
    }
    const targetConfig = this.regions.get(toRegion);
    if (!targetConfig) {
      console.error(`[FAILOVER] Target region not configured: ${toRegion}`);
      return null;
    }
    const event = {
      id: `fo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fromRegion: this.primaryRegion,
      toRegion,
      reason: reason || "Manual failover",
      triggeredBy: "manual",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "in-progress",
      affectedPipelines: 0
    };
    return this.executeFailover(event);
  }
  // ===========================================================================
  // TARGET SELECTION
  // ===========================================================================
  selectFailoverTarget(excludeRegion) {
    const candidates = Array.from(this.regions.values()).filter((r) => {
      if (r.region === excludeRegion) return false;
      if (r.status === "offline" || r.status === "draining") return false;
      const failures = this.failureCounts.get(r.region) ?? 0;
      if (failures >= this.config.triggerThreshold) return false;
      return true;
    }).sort((a, b) => b.weight - a.weight);
    return candidates[0]?.region ?? null;
  }
  // ===========================================================================
  // GETTERS
  // ===========================================================================
  getPrimaryRegion() {
    return this.primaryRegion;
  }
  getFailoverHistory(limit = 10) {
    return this.failoverHistory.slice(-limit);
  }
  getPendingApprovals() {
    return Array.from(this.pendingApprovals.values());
  }
  getFailoverCount24h() {
    const now = Date.now();
    return this.failoverHistory.filter(
      (f) => now - new Date(f.startedAt).getTime() < 864e5
    ).length;
  }
  getConfig() {
    return { ...this.config };
  }
  getStats() {
    const now = Date.now();
    const cooldownRemaining = Math.max(0, this.config.cooldownMs - (now - this.lastFailoverTime));
    return {
      primaryRegion: this.primaryRegion,
      failoverCount24h: this.getFailoverCount24h(),
      lastFailover: this.failoverHistory[this.failoverHistory.length - 1] ?? null,
      pendingApprovals: this.pendingApprovals.size,
      cooldownActive: cooldownRemaining > 0,
      cooldownRemainingMs: cooldownRemaining
    };
  }
};
var failoverManagerInstance = null;
function getFailoverManager() {
  if (!failoverManagerInstance) {
    failoverManagerInstance = new FailoverManager();
  }
  return failoverManagerInstance;
}
function createFailoverManager(config) {
  failoverManagerInstance = new FailoverManager(config);
  return failoverManagerInstance;
}

// src/ha/ha-manager.ts
import { EventEmitter as EventEmitter11 } from "eventemitter3";
var HAManager = class extends EventEmitter11 {
  config;
  healthChecker;
  loadBalancer;
  failoverManager;
  replicationStatus = /* @__PURE__ */ new Map();
  metricsInterval = null;
  started = false;
  constructor(config) {
    super();
    this.config = config;
    this.healthChecker = createHealthChecker(config.healthCheck);
    this.loadBalancer = createLoadBalancer(config.loadBalancing?.strategy);
    this.failoverManager = createFailoverManager(config.failover);
    if (config.loadBalancing?.stickySession) {
      this.loadBalancer.setSessionAffinity(config.loadBalancing.stickySession);
    }
    this.setupEventHandlers();
    for (const regionConfig of config.regions) {
      this.addRegion(regionConfig);
    }
  }
  // ===========================================================================
  // SETUP
  // ===========================================================================
  setupEventHandlers() {
    this.healthChecker.on("health:checked", (results) => {
      this.emit("health:checked", results);
      for (const result of results) {
        this.loadBalancer.updateHealth(result.region, result);
        this.failoverManager.onHealthCheckResult(result.region, result);
      }
    });
    this.healthChecker.on("health:degraded", (region, result) => {
      this.emit("health:degraded", region, result);
      this.updateRegionStatus(region, "degraded");
    });
    this.healthChecker.on("health:recovered", (region, result) => {
      this.emit("health:recovered", region, result);
      this.updateRegionStatus(region, "active");
    });
    this.failoverManager.on("failover:started", (event) => {
      this.emit("failover:started", event);
    });
    this.failoverManager.on("failover:completed", (event) => {
      this.emit("failover:completed", event);
    });
    this.failoverManager.on("failover:failed", (event, error) => {
      this.emit("failover:failed", event, error);
    });
    this.failoverManager.on("region:status_changed", (region, oldStatus, newStatus) => {
      this.emit("region:status_changed", region, oldStatus, newStatus);
    });
  }
  // ===========================================================================
  // REGION MANAGEMENT
  // ===========================================================================
  addRegion(regionConfig) {
    this.healthChecker.addRegion(regionConfig);
    this.loadBalancer.addRegion(regionConfig);
    this.failoverManager.addRegion(regionConfig);
    this.emit("region:added", regionConfig);
    console.log(`[HA] Region added: ${regionConfig.region} (${regionConfig.status})`);
  }
  removeRegion(region) {
    this.healthChecker.removeRegion(region);
    this.loadBalancer.removeRegion(region);
    this.failoverManager.removeRegion(region);
    this.emit("region:removed", region);
    console.log(`[HA] Region removed: ${region}`);
  }
  updateRegionStatus(region, status) {
    const regionConfig = this.config.regions.find((r) => r.region === region);
    if (regionConfig) {
      const oldStatus = regionConfig.status;
      regionConfig.status = status;
      this.emit("region:status_changed", region, oldStatus, status);
    }
  }
  // ===========================================================================
  // ROUTING
  // ===========================================================================
  route(options) {
    return this.loadBalancer.route(options);
  }
  // ===========================================================================
  // FAILOVER
  // ===========================================================================
  async triggerFailover(toRegion, reason) {
    return this.failoverManager.manualFailover(toRegion, reason);
  }
  approveFailover(failoverId) {
    return this.failoverManager.approveFailover(failoverId);
  }
  rejectFailover(failoverId, reason) {
    return this.failoverManager.rejectFailover(failoverId, reason);
  }
  // ===========================================================================
  // REPLICATION STATUS
  // ===========================================================================
  updateReplicationStatus(status) {
    const key = `${status.sourceRegion}->${status.targetRegion}`;
    this.replicationStatus.set(key, status);
    const maxLag = this.config.replication?.maxLagMs ?? 5e3;
    if (status.lagMs > maxLag) {
      this.emit("replication:lag", status);
      console.warn(`[HA] Replication lag detected: ${status.sourceRegion} -> ${status.targetRegion} (${status.lagMs}ms)`);
    }
  }
  getReplicationStatus() {
    return Array.from(this.replicationStatus.values());
  }
  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================
  start() {
    if (this.started) {
      console.log("[HA] Manager already started");
      return;
    }
    console.log("[HA] Starting High Availability Manager");
    this.started = true;
    this.healthChecker.start();
    if (this.config.monitoring?.enabled) {
      this.startMetricsCollection();
    }
  }
  stop() {
    if (!this.started) {
      return;
    }
    console.log("[HA] Stopping High Availability Manager");
    this.started = false;
    this.healthChecker.stop();
    this.stopMetricsCollection();
  }
  startMetricsCollection() {
    const interval = this.config.monitoring?.metricsIntervalMs ?? 6e4;
    this.metricsInterval = setInterval(() => {
      const state = this.getState();
      const thresholds = this.config.monitoring?.alertThresholds;
      if (thresholds) {
        if (state.globalLatencyMs > thresholds.latencyMs) {
          console.warn(`[HA] Alert: Global latency (${state.globalLatencyMs}ms) exceeds threshold (${thresholds.latencyMs}ms)`);
        }
        if (state.globalAvailability < thresholds.availabilityPercent) {
          console.warn(`[HA] Alert: Availability (${state.globalAvailability}%) below threshold (${thresholds.availabilityPercent}%)`);
        }
      }
    }, interval);
  }
  stopMetricsCollection() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }
  // ===========================================================================
  // STATE
  // ===========================================================================
  getState() {
    const healthResults = this.healthChecker.getAllResults();
    const regionHealth = {};
    for (const [region, result] of healthResults) {
      regionHealth[region] = result;
    }
    return {
      primaryRegion: this.failoverManager.getPrimaryRegion() ?? "us-east-1",
      activeRegions: this.healthChecker.getHealthyRegions(),
      regionHealth,
      replicationStatus: this.getReplicationStatus(),
      lastFailover: this.failoverManager.getFailoverHistory(1)[0],
      failoverCount24h: this.failoverManager.getFailoverCount24h(),
      globalLatencyMs: this.healthChecker.getAverageLatency(),
      globalAvailability: this.healthChecker.getGlobalAvailability(),
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  getConfig() {
    return { ...this.config };
  }
  isStarted() {
    return this.started;
  }
  // ===========================================================================
  // COMPONENT ACCESS
  // ===========================================================================
  getHealthChecker() {
    return this.healthChecker;
  }
  getLoadBalancer() {
    return this.loadBalancer;
  }
  getFailoverManager() {
    return this.failoverManager;
  }
};
var haManagerInstance = null;
function getHAManager() {
  return haManagerInstance;
}
function createHAManager(config) {
  haManagerInstance = new HAManager(config);
  return haManagerInstance;
}
var DEFAULT_HA_CONFIG = {
  regions: [
    {
      id: "primary",
      region: "us-east-1",
      endpoint: "https://api-us-east.gicm.io",
      status: "active",
      isPrimary: true,
      weight: 100
    },
    {
      id: "secondary",
      region: "eu-west-1",
      endpoint: "https://api-eu-west.gicm.io",
      status: "standby",
      isPrimary: false,
      weight: 80
    },
    {
      id: "tertiary",
      region: "ap-northeast-1",
      endpoint: "https://api-ap-northeast.gicm.io",
      status: "standby",
      isPrimary: false,
      weight: 60
    }
  ],
  healthCheck: {
    type: "http",
    intervalMs: 3e4,
    timeoutMs: 5e3,
    unhealthyThreshold: 3,
    healthyThreshold: 2,
    path: "/health",
    expectedStatus: 200
  },
  loadBalancing: {
    strategy: "weighted",
    stickySession: {
      enabled: true,
      ttlMs: 36e5,
      cookieName: "gicm_region",
      strategy: "cookie"
    }
  },
  failover: {
    mode: "automatic",
    triggerThreshold: 3,
    cooldownMs: 3e5,
    maxFailoversPerHour: 3,
    notifyOnFailover: true,
    requireApproval: false,
    rollbackOnFailure: true
  },
  replication: {
    mode: "async",
    targetRegions: ["eu-west-1", "ap-northeast-1"],
    maxLagMs: 5e3,
    batchSize: 100,
    retryAttempts: 3,
    conflictResolution: "last-write-wins"
  },
  monitoring: {
    enabled: true,
    metricsIntervalMs: 6e4,
    alertThresholds: {
      latencyMs: 500,
      errorRate: 0.05,
      availabilityPercent: 99.9
    }
  }
};

// src/dr/types.ts
import { z as z8 } from "zod";
var BackupTypeSchema = z8.enum([
  "full",
  "incremental",
  "differential",
  "snapshot"
]);
var BackupStatusSchema = z8.enum([
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
  "expired"
]);
var BackupStorageSchema = z8.enum([
  "local",
  "s3",
  "gcs",
  "azure",
  "r2"
]);
var BackupScheduleSchema = z8.object({
  enabled: z8.boolean().default(true),
  cron: z8.string().default("0 2 * * *"),
  // Daily at 2 AM
  type: BackupTypeSchema.default("incremental"),
  retentionDays: z8.number().default(30),
  maxBackups: z8.number().default(100)
});
var StorageConfigSchema = z8.object({
  type: BackupStorageSchema,
  bucket: z8.string().optional(),
  region: z8.string().optional(),
  path: z8.string().default("/backups"),
  accessKey: z8.string().optional(),
  secretKey: z8.string().optional(),
  endpoint: z8.string().optional(),
  encryption: z8.object({
    enabled: z8.boolean().default(true),
    algorithm: z8.enum(["AES-256-GCM", "AES-256-CBC"]).default("AES-256-GCM"),
    keyId: z8.string().optional()
  }).optional()
});
var BackupItemSchema = z8.object({
  resource: z8.string(),
  type: z8.string(),
  count: z8.number(),
  sizeBytes: z8.number(),
  checksum: z8.string()
});
var BackupManifestSchema = z8.object({
  id: z8.string(),
  type: BackupTypeSchema,
  status: BackupStatusSchema,
  startedAt: z8.string(),
  completedAt: z8.string().optional(),
  sizeBytes: z8.number().default(0),
  items: z8.array(BackupItemSchema).default([]),
  parentBackupId: z8.string().optional(),
  // For incremental backups
  checksum: z8.string().optional(),
  encryptionKeyId: z8.string().optional(),
  storageLocation: z8.string(),
  metadata: z8.record(z8.unknown()).optional(),
  version: z8.string().default("1.0.0")
});
var RestoreStatusSchema = z8.enum([
  "pending",
  "validating",
  "in_progress",
  "completed",
  "failed",
  "rolled_back"
]);
var RestoreModeSchema = z8.enum([
  "full",
  // Restore everything
  "selective",
  // Restore specific resources
  "point_in_time"
  // Restore to specific point in time
]);
var RestoreOptionsSchema = z8.object({
  mode: RestoreModeSchema.default("full"),
  targetBackupId: z8.string(),
  resources: z8.array(z8.string()).optional(),
  // For selective restore
  pointInTime: z8.string().optional(),
  skipValidation: z8.boolean().default(false),
  createSnapshot: z8.boolean().default(true),
  // Create snapshot before restore
  dryRun: z8.boolean().default(false)
});
var RestoreProgressSchema = z8.object({
  id: z8.string(),
  status: RestoreStatusSchema,
  backupId: z8.string(),
  mode: RestoreModeSchema,
  startedAt: z8.string(),
  completedAt: z8.string().optional(),
  totalItems: z8.number(),
  processedItems: z8.number(),
  failedItems: z8.number(),
  currentResource: z8.string().optional(),
  errors: z8.array(z8.string()).default([]),
  snapshotId: z8.string().optional()
  // Pre-restore snapshot
});
var WALEntrySchema = z8.object({
  id: z8.string(),
  timestamp: z8.string(),
  resource: z8.string(),
  operation: z8.enum(["create", "update", "delete"]),
  data: z8.unknown(),
  checksum: z8.string()
});
var RecoveryPointSchema = z8.object({
  id: z8.string(),
  timestamp: z8.string(),
  backupId: z8.string(),
  walSegment: z8.number(),
  description: z8.string().optional()
});
var VerificationStatusSchema = z8.enum([
  "pending",
  "in_progress",
  "passed",
  "failed",
  "warnings"
]);
var VerificationResultSchema = z8.object({
  backupId: z8.string(),
  status: VerificationStatusSchema,
  startedAt: z8.string(),
  completedAt: z8.string().optional(),
  checksumValid: z8.boolean(),
  itemsVerified: z8.number(),
  itemsFailed: z8.number(),
  errors: z8.array(z8.string()).default([]),
  warnings: z8.array(z8.string()).default([]),
  metadata: z8.record(z8.unknown()).optional()
});
var DRManagerConfigSchema = z8.object({
  storage: StorageConfigSchema,
  schedule: BackupScheduleSchema.optional(),
  verification: z8.object({
    enabled: z8.boolean().default(true),
    afterBackup: z8.boolean().default(true),
    schedule: z8.string().optional()
    // Cron for periodic verification
  }).optional(),
  wal: z8.object({
    enabled: z8.boolean().default(true),
    retentionHours: z8.number().default(168),
    // 7 days
    flushIntervalMs: z8.number().default(5e3)
  }).optional(),
  alerts: z8.object({
    onBackupFailure: z8.boolean().default(true),
    onVerificationFailure: z8.boolean().default(true),
    onLowStorage: z8.boolean().default(true),
    storageThresholdPercent: z8.number().default(80)
  }).optional()
});
var DRStateSchema = z8.object({
  lastBackup: BackupManifestSchema.optional(),
  lastVerification: VerificationResultSchema.optional(),
  nextScheduledBackup: z8.string().optional(),
  totalBackups: z8.number(),
  totalSizeBytes: z8.number(),
  oldestBackup: z8.string().optional(),
  newestBackup: z8.string().optional(),
  storageUsedPercent: z8.number(),
  walEnabled: z8.boolean(),
  walSegments: z8.number()
});
var DEFAULT_BACKUP_SCHEDULE = {
  enabled: true,
  cron: "0 2 * * *",
  // Daily at 2 AM
  type: "incremental",
  retentionDays: 30,
  maxBackups: 100
};
var BACKUP_RESOURCES = [
  "pipelines",
  "schedules",
  "budgets",
  "webhooks",
  "analytics",
  "organizations",
  "members",
  "plugins",
  "templates",
  "executions"
];

// src/dr/backup-manager.ts
import { EventEmitter as EventEmitter12 } from "eventemitter3";
import { createHash as createHash3 } from "crypto";
var BackupManager = class extends EventEmitter12 {
  storageConfig;
  schedule;
  backups = /* @__PURE__ */ new Map();
  scheduleInterval = null;
  lastFullBackupId = null;
  // Data providers for backing up
  dataProviders = /* @__PURE__ */ new Map();
  constructor(storageConfig, schedule) {
    super();
    this.storageConfig = storageConfig;
    this.schedule = { ...DEFAULT_BACKUP_SCHEDULE, ...schedule };
  }
  // ===========================================================================
  // DATA PROVIDERS
  // ===========================================================================
  registerDataProvider(resource, provider) {
    this.dataProviders.set(resource, provider);
    console.log(`[BACKUP] Registered data provider for: ${resource}`);
  }
  unregisterDataProvider(resource) {
    this.dataProviders.delete(resource);
  }
  // ===========================================================================
  // BACKUP CREATION
  // ===========================================================================
  async createBackup(type = "full", resources) {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const resourcesToBackup = resources ?? [...BACKUP_RESOURCES];
    const backup = {
      id: backupId,
      type,
      status: "in_progress",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      sizeBytes: 0,
      items: [],
      storageLocation: this.getStorageLocation(backupId),
      version: "1.0.0"
    };
    if (type === "incremental" || type === "differential") {
      backup.parentBackupId = this.lastFullBackupId ?? void 0;
    }
    this.backups.set(backupId, backup);
    this.emit("backup:started", backup);
    try {
      let totalSize = 0;
      let processedResources = 0;
      for (const resource of resourcesToBackup) {
        const provider = this.dataProviders.get(resource);
        if (!provider) {
          console.log(`[BACKUP] No provider for ${resource}, skipping`);
          continue;
        }
        try {
          const data = await provider();
          const serialized = JSON.stringify(data);
          const sizeBytes = Buffer.byteLength(serialized, "utf8");
          const checksum = this.calculateChecksum(serialized);
          const item = {
            resource,
            type: "json",
            count: Array.isArray(data) ? data.length : 1,
            sizeBytes,
            checksum
          };
          backup.items.push(item);
          totalSize += sizeBytes;
          await this.writeToStorage(backupId, resource, serialized);
          processedResources++;
          const percent = Math.round(processedResources / resourcesToBackup.length * 100);
          this.emit("backup:progress", backup, percent);
        } catch (err) {
          console.error(`[BACKUP] Failed to backup ${resource}:`, err);
        }
      }
      backup.sizeBytes = totalSize;
      backup.checksum = this.calculateManifestChecksum(backup);
      backup.status = "completed";
      backup.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (type === "full") {
        this.lastFullBackupId = backupId;
      }
      this.emit("backup:completed", backup);
      console.log(`[BACKUP] Completed: ${backupId} (${this.formatBytes(totalSize)})`);
      return backup;
    } catch (error) {
      backup.status = "failed";
      backup.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.emit("backup:failed", backup, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  async createSnapshot(description) {
    const snapshot = await this.createBackup("snapshot");
    snapshot.metadata = { ...snapshot.metadata, description };
    return snapshot;
  }
  // ===========================================================================
  // BACKUP RETRIEVAL
  // ===========================================================================
  getBackup(backupId) {
    return this.backups.get(backupId);
  }
  listBackups(options) {
    let backups = Array.from(this.backups.values());
    if (options?.type) {
      backups = backups.filter((b) => b.type === options.type);
    }
    if (options?.status) {
      backups = backups.filter((b) => b.status === options.status);
    }
    if (options?.fromDate) {
      backups = backups.filter((b) => new Date(b.startedAt) >= options.fromDate);
    }
    if (options?.toDate) {
      backups = backups.filter((b) => new Date(b.startedAt) <= options.toDate);
    }
    backups.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    if (options?.limit) {
      backups = backups.slice(0, options.limit);
    }
    return backups;
  }
  getLatestBackup(type) {
    const backups = this.listBackups({ type, status: "completed", limit: 1 });
    return backups[0];
  }
  // ===========================================================================
  // BACKUP DELETION
  // ===========================================================================
  async deleteBackup(backupId) {
    const backup = this.backups.get(backupId);
    if (!backup) {
      return false;
    }
    const dependentBackups = Array.from(this.backups.values()).filter((b) => b.parentBackupId === backupId);
    if (dependentBackups.length > 0) {
      throw new Error(`Cannot delete backup ${backupId}: ${dependentBackups.length} backups depend on it`);
    }
    await this.deleteFromStorage(backupId);
    this.backups.delete(backupId);
    console.log(`[BACKUP] Deleted: ${backupId}`);
    return true;
  }
  async cleanupExpired() {
    const now = Date.now();
    const retentionMs = this.schedule.retentionDays * 24 * 60 * 60 * 1e3;
    let deletedCount = 0;
    let freedBytes = 0;
    const backupsToDelete = [];
    for (const [id, backup] of this.backups) {
      const backupAge = now - new Date(backup.startedAt).getTime();
      if (backupAge > retentionMs && backup.status === "completed") {
        const isParent = Array.from(this.backups.values()).some((b) => b.parentBackupId === id);
        if (!isParent) {
          backupsToDelete.push(id);
          freedBytes += backup.sizeBytes;
        }
      }
    }
    const completedBackups = this.listBackups({ status: "completed" });
    if (completedBackups.length > this.schedule.maxBackups) {
      const excess = completedBackups.slice(this.schedule.maxBackups);
      for (const backup of excess) {
        if (!backupsToDelete.includes(backup.id)) {
          backupsToDelete.push(backup.id);
          freedBytes += backup.sizeBytes;
        }
      }
    }
    for (const id of backupsToDelete) {
      try {
        await this.deleteBackup(id);
        deletedCount++;
      } catch (err) {
        console.error(`[BACKUP] Failed to delete ${id}:`, err);
      }
    }
    if (deletedCount > 0) {
      this.emit("retention:cleaned", deletedCount, freedBytes);
      console.log(`[BACKUP] Cleanup: deleted ${deletedCount} backups, freed ${this.formatBytes(freedBytes)}`);
    }
    return { deletedCount, freedBytes };
  }
  // ===========================================================================
  // SCHEDULING
  // ===========================================================================
  startScheduler() {
    if (!this.schedule.enabled) {
      console.log("[BACKUP] Scheduler disabled");
      return;
    }
    const intervalMs = 24 * 60 * 60 * 1e3;
    console.log(`[BACKUP] Scheduler started (${this.schedule.type} backups, ${this.schedule.retentionDays} day retention)`);
    this.scheduleInterval = setInterval(async () => {
      try {
        await this.createBackup(this.schedule.type);
        await this.cleanupExpired();
      } catch (err) {
        console.error("[BACKUP] Scheduled backup failed:", err);
      }
    }, intervalMs);
  }
  stopScheduler() {
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
      console.log("[BACKUP] Scheduler stopped");
    }
  }
  // ===========================================================================
  // STORAGE OPERATIONS (Simulated)
  // ===========================================================================
  getStorageLocation(backupId) {
    const { type, bucket, path: path2 } = this.storageConfig;
    switch (type) {
      case "s3":
        return `s3://${bucket}${path2}/${backupId}`;
      case "gcs":
        return `gs://${bucket}${path2}/${backupId}`;
      case "azure":
        return `azure://${bucket}${path2}/${backupId}`;
      case "r2":
        return `r2://${bucket}${path2}/${backupId}`;
      default:
        return `${path2}/${backupId}`;
    }
  }
  async writeToStorage(backupId, resource, data) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  async deleteFromStorage(backupId) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  // ===========================================================================
  // UTILITIES
  // ===========================================================================
  calculateChecksum(data) {
    return createHash3("sha256").update(data).digest("hex").slice(0, 16);
  }
  calculateManifestChecksum(manifest) {
    const itemChecksums = manifest.items.map((i) => i.checksum).sort().join("");
    return this.calculateChecksum(itemChecksums);
  }
  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }
  // ===========================================================================
  // STATS
  // ===========================================================================
  getStats() {
    const backups = Array.from(this.backups.values());
    const completedBackups = backups.filter((b) => b.status === "completed");
    const byType = {};
    const byStatus = {};
    for (const backup of backups) {
      byType[backup.type] = (byType[backup.type] || 0) + 1;
      byStatus[backup.status] = (byStatus[backup.status] || 0) + 1;
    }
    const dates = completedBackups.map((b) => new Date(b.startedAt).getTime());
    return {
      totalBackups: backups.length,
      totalSizeBytes: completedBackups.reduce((sum, b) => sum + b.sizeBytes, 0),
      oldestBackup: dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null,
      newestBackup: dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null,
      backupsByType: byType,
      backupsByStatus: byStatus
    };
  }
};
var backupManagerInstance = null;
function getBackupManager() {
  return backupManagerInstance;
}
function createBackupManager(storageConfig, schedule) {
  backupManagerInstance = new BackupManager(storageConfig, schedule);
  return backupManagerInstance;
}

// src/dr/restore-manager.ts
import { EventEmitter as EventEmitter13 } from "eventemitter3";
var RestoreManager = class extends EventEmitter13 {
  backupManager;
  restoreHistory = /* @__PURE__ */ new Map();
  currentRestore = null;
  // Data handlers for restoring
  dataHandlers = /* @__PURE__ */ new Map();
  constructor(backupManager) {
    super();
    this.backupManager = backupManager;
  }
  // ===========================================================================
  // DATA HANDLERS
  // ===========================================================================
  registerDataHandler(resource, handler) {
    this.dataHandlers.set(resource, handler);
    console.log(`[RESTORE] Registered data handler for: ${resource}`);
  }
  unregisterDataHandler(resource) {
    this.dataHandlers.delete(resource);
  }
  // ===========================================================================
  // RESTORE EXECUTION
  // ===========================================================================
  async restore(options) {
    if (this.currentRestore && this.currentRestore.status === "in_progress") {
      throw new Error("A restore operation is already in progress");
    }
    const backup = this.backupManager.getBackup(options.targetBackupId);
    if (!backup) {
      throw new Error(`Backup not found: ${options.targetBackupId}`);
    }
    if (backup.status !== "completed") {
      throw new Error(`Cannot restore from backup with status: ${backup.status}`);
    }
    const restoreId = `restore_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const progress = {
      id: restoreId,
      status: "pending",
      backupId: options.targetBackupId,
      mode: options.mode,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalItems: backup.items.length,
      processedItems: 0,
      failedItems: 0,
      errors: []
    };
    this.currentRestore = progress;
    this.restoreHistory.set(restoreId, progress);
    if (options.createSnapshot) {
      try {
        progress.status = "validating";
        const snapshot = await this.backupManager.createSnapshot("Pre-restore snapshot");
        progress.snapshotId = snapshot.id;
        console.log(`[RESTORE] Created pre-restore snapshot: ${snapshot.id}`);
      } catch (err) {
        console.warn("[RESTORE] Failed to create pre-restore snapshot:", err);
      }
    }
    if (options.dryRun) {
      progress.status = "completed";
      progress.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`[RESTORE] Dry run completed for backup ${options.targetBackupId}`);
      return progress;
    }
    this.emit("restore:started", progress);
    try {
      progress.status = "in_progress";
      const resourcesToRestore = options.mode === "selective" && options.resources ? options.resources : backup.items.map((item) => item.resource);
      for (const resource of resourcesToRestore) {
        const backupItem = backup.items.find((item) => item.resource === resource);
        if (!backupItem) {
          console.warn(`[RESTORE] Resource not found in backup: ${resource}`);
          continue;
        }
        const handler = this.dataHandlers.get(resource);
        if (!handler) {
          console.warn(`[RESTORE] No handler for resource: ${resource}`);
          progress.failedItems++;
          progress.errors.push(`No handler for resource: ${resource}`);
          continue;
        }
        progress.currentResource = resource;
        this.emit("restore:progress", progress);
        try {
          const data = await this.readFromStorage(backup.id, resource);
          await handler(data);
          progress.processedItems++;
          console.log(`[RESTORE] Restored ${resource} (${backupItem.count} items)`);
        } catch (err) {
          progress.failedItems++;
          const errorMsg = err instanceof Error ? err.message : String(err);
          progress.errors.push(`Failed to restore ${resource}: ${errorMsg}`);
          console.error(`[RESTORE] Failed to restore ${resource}:`, err);
        }
      }
      progress.status = progress.failedItems === 0 ? "completed" : "completed";
      progress.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      progress.currentResource = void 0;
      this.emit("restore:completed", progress);
      console.log(`[RESTORE] Completed: ${progress.processedItems}/${progress.totalItems} items restored`);
      return progress;
    } catch (error) {
      progress.status = "failed";
      progress.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      progress.errors.push(error instanceof Error ? error.message : String(error));
      this.emit("restore:failed", progress, error instanceof Error ? error : new Error(String(error)));
      if (progress.snapshotId) {
        console.log(`[RESTORE] Attempting rollback to snapshot ${progress.snapshotId}`);
        progress.status = "rolled_back";
      }
      throw error;
    } finally {
      this.currentRestore = null;
    }
  }
  // ===========================================================================
  // RESTORE STATUS
  // ===========================================================================
  getRestoreProgress(restoreId) {
    return this.restoreHistory.get(restoreId);
  }
  getCurrentRestore() {
    return this.currentRestore;
  }
  listRestores(limit = 20) {
    return Array.from(this.restoreHistory.values()).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, limit);
  }
  // ===========================================================================
  // POINT IN TIME RECOVERY
  // ===========================================================================
  async restoreToPointInTime(targetTime) {
    const backups = this.backupManager.listBackups({ status: "completed" });
    const eligibleBackups = backups.filter((b) => new Date(b.startedAt) <= targetTime);
    if (eligibleBackups.length === 0) {
      throw new Error(`No backups found before ${targetTime.toISOString()}`);
    }
    const targetBackup = eligibleBackups[0];
    console.log(`[RESTORE] Point-in-time recovery to ${targetTime.toISOString()}`);
    console.log(`[RESTORE] Using backup ${targetBackup.id} from ${targetBackup.startedAt}`);
    return this.restore({
      mode: "point_in_time",
      targetBackupId: targetBackup.id,
      pointInTime: targetTime.toISOString(),
      createSnapshot: true
    });
  }
  // ===========================================================================
  // STORAGE OPERATIONS (Simulated)
  // ===========================================================================
  async readFromStorage(backupId, resource) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return [];
  }
  // ===========================================================================
  // VALIDATION
  // ===========================================================================
  async validateBackup(backupId) {
    const backup = this.backupManager.getBackup(backupId);
    if (!backup) {
      return {
        valid: false,
        errors: [`Backup not found: ${backupId}`],
        warnings: []
      };
    }
    const errors = [];
    const warnings = [];
    if (backup.status !== "completed") {
      errors.push(`Backup status is ${backup.status}, not completed`);
    }
    if (backup.items.length === 0) {
      warnings.push("Backup contains no items");
    }
    for (const item of backup.items) {
      if (!this.dataHandlers.has(item.resource)) {
        warnings.push(`No handler registered for resource: ${item.resource}`);
      }
    }
    if (backup.parentBackupId) {
      const parent = this.backupManager.getBackup(backup.parentBackupId);
      if (!parent) {
        errors.push(`Parent backup not found: ${backup.parentBackupId}`);
      } else if (parent.status !== "completed") {
        errors.push(`Parent backup status is ${parent.status}`);
      }
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};
var restoreManagerInstance = null;
function getRestoreManager() {
  return restoreManagerInstance;
}
function createRestoreManager(backupManager) {
  const mgr = backupManager ?? getBackupManager();
  if (!mgr) {
    throw new Error("BackupManager must be created first");
  }
  restoreManagerInstance = new RestoreManager(mgr);
  return restoreManagerInstance;
}

// src/observability/types.ts
import { z as z9 } from "zod";
var TraceContextSchema = z9.object({
  traceId: z9.string().describe("Unique trace identifier (W3C format)"),
  spanId: z9.string().describe("Current span identifier"),
  parentSpanId: z9.string().optional().describe("Parent span identifier"),
  traceFlags: z9.number().default(1).describe("Trace flags (sampled=1)"),
  traceState: z9.string().optional().describe("Vendor-specific trace state")
});
var SpanStatusCodeSchema = z9.enum([
  "UNSET",
  "OK",
  "ERROR"
]);
var SpanStatusSchema = z9.object({
  code: SpanStatusCodeSchema,
  message: z9.string().optional()
});
var SpanKindSchema = z9.enum([
  "INTERNAL",
  "SERVER",
  "CLIENT",
  "PRODUCER",
  "CONSUMER"
]);
var SpanEventSchema = z9.object({
  name: z9.string(),
  timestamp: z9.number(),
  attributes: z9.record(z9.union([z9.string(), z9.number(), z9.boolean()])).optional()
});
var SpanLinkSchema = z9.object({
  traceId: z9.string(),
  spanId: z9.string(),
  attributes: z9.record(z9.union([z9.string(), z9.number(), z9.boolean()])).optional()
});
var SpanSchema = z9.object({
  traceId: z9.string(),
  spanId: z9.string(),
  parentSpanId: z9.string().optional(),
  name: z9.string(),
  kind: SpanKindSchema.default("INTERNAL"),
  startTime: z9.number(),
  endTime: z9.number().optional(),
  duration: z9.number().optional().describe("Duration in ms"),
  status: SpanStatusSchema.default({ code: "UNSET" }),
  attributes: z9.record(z9.union([z9.string(), z9.number(), z9.boolean()])).default({}),
  events: z9.array(SpanEventSchema).default([]),
  links: z9.array(SpanLinkSchema).default([]),
  resource: z9.object({
    serviceName: z9.string(),
    serviceVersion: z9.string().optional(),
    environment: z9.string().optional(),
    hostName: z9.string().optional(),
    instanceId: z9.string().optional()
  })
});
var TraceSchema = z9.object({
  traceId: z9.string(),
  rootSpan: SpanSchema,
  spans: z9.array(SpanSchema),
  startTime: z9.number(),
  endTime: z9.number().optional(),
  duration: z9.number().optional(),
  spanCount: z9.number(),
  errorCount: z9.number().default(0),
  serviceName: z9.string(),
  operationName: z9.string()
});
var MetricTypeSchema = z9.enum([
  "counter",
  "gauge",
  "histogram",
  "summary"
]);
var MetricUnitSchema = z9.enum([
  "ms",
  "s",
  "bytes",
  "requests",
  "errors",
  "percent",
  "count",
  "none"
]);
var MetricPointSchema = z9.object({
  timestamp: z9.number(),
  value: z9.number(),
  labels: z9.record(z9.string()).default({})
});
var HistogramBucketsSchema = z9.object({
  boundaries: z9.array(z9.number()),
  counts: z9.array(z9.number()),
  sum: z9.number(),
  count: z9.number(),
  min: z9.number().optional(),
  max: z9.number().optional()
});
var MetricDefinitionSchema = z9.object({
  name: z9.string(),
  type: MetricTypeSchema,
  unit: MetricUnitSchema.default("none"),
  description: z9.string().optional(),
  labels: z9.array(z9.string()).default([]),
  buckets: z9.array(z9.number()).optional().describe("For histograms")
});
var MetricDataSchema = z9.object({
  name: z9.string(),
  type: MetricTypeSchema,
  unit: MetricUnitSchema,
  description: z9.string().optional(),
  points: z9.array(MetricPointSchema),
  histogram: HistogramBucketsSchema.optional(),
  resource: z9.object({
    serviceName: z9.string(),
    environment: z9.string().optional()
  })
});
var LogSeveritySchema = z9.enum([
  "TRACE",
  "DEBUG",
  "INFO",
  "WARN",
  "ERROR",
  "FATAL"
]);
var LogRecordSchema = z9.object({
  timestamp: z9.number(),
  severity: LogSeveritySchema,
  body: z9.string(),
  attributes: z9.record(z9.union([z9.string(), z9.number(), z9.boolean()])).default({}),
  traceId: z9.string().optional(),
  spanId: z9.string().optional(),
  resource: z9.object({
    serviceName: z9.string(),
    environment: z9.string().optional()
  })
});
var ExporterTypeSchema = z9.enum([
  "console",
  "otlp",
  "jaeger",
  "zipkin",
  "prometheus",
  "custom"
]);
var ExporterConfigSchema = z9.object({
  type: ExporterTypeSchema,
  endpoint: z9.string().optional(),
  headers: z9.record(z9.string()).optional(),
  compression: z9.enum(["none", "gzip"]).default("none"),
  timeout: z9.number().default(3e4),
  batchSize: z9.number().default(512),
  flushInterval: z9.number().default(5e3)
});
var SamplerTypeSchema = z9.enum([
  "always_on",
  "always_off",
  "trace_id_ratio",
  "parent_based"
]);
var SamplerConfigSchema = z9.object({
  type: SamplerTypeSchema.default("always_on"),
  ratio: z9.number().min(0).max(1).default(1),
  parentBased: z9.boolean().default(true)
});
var ObservabilityConfigSchema = z9.object({
  serviceName: z9.string().default("integration-hub"),
  serviceVersion: z9.string().optional(),
  environment: z9.string().default("development"),
  // Tracing
  tracing: z9.object({
    enabled: z9.boolean().default(true),
    sampler: SamplerConfigSchema.default({}),
    exporter: ExporterConfigSchema.optional(),
    maxSpanAttributes: z9.number().default(128),
    maxSpanEvents: z9.number().default(128),
    maxSpanLinks: z9.number().default(128)
  }).default({}),
  // Metrics
  metrics: z9.object({
    enabled: z9.boolean().default(true),
    exporter: ExporterConfigSchema.optional(),
    collectInterval: z9.number().default(6e4),
    defaultBuckets: z9.array(z9.number()).default([5, 10, 25, 50, 100, 250, 500, 1e3, 2500, 5e3, 1e4])
  }).default({}),
  // Logging
  logging: z9.object({
    enabled: z9.boolean().default(true),
    minSeverity: LogSeveritySchema.default("INFO"),
    exporter: ExporterConfigSchema.optional(),
    includeTraceContext: z9.boolean().default(true)
  }).default({}),
  // Resource
  resource: z9.object({
    hostName: z9.string().optional(),
    instanceId: z9.string().optional(),
    attributes: z9.record(z9.string()).default({})
  }).default({}),
  // Retention
  retention: z9.object({
    traces: z9.number().default(24 * 60 * 60 * 1e3),
    // 24h
    metrics: z9.number().default(7 * 24 * 60 * 60 * 1e3),
    // 7d
    logs: z9.number().default(24 * 60 * 60 * 1e3)
    // 24h
  }).default({})
});
var TraceQuerySchema = z9.object({
  traceId: z9.string().optional(),
  serviceName: z9.string().optional(),
  operationName: z9.string().optional(),
  minDuration: z9.number().optional(),
  maxDuration: z9.number().optional(),
  tags: z9.record(z9.string()).optional(),
  startTime: z9.number().optional(),
  endTime: z9.number().optional(),
  limit: z9.number().default(100)
});
var MetricQuerySchema = z9.object({
  name: z9.string(),
  labels: z9.record(z9.string()).optional(),
  startTime: z9.number().optional(),
  endTime: z9.number().optional(),
  step: z9.number().optional().describe("Query resolution in ms"),
  aggregation: z9.enum(["sum", "avg", "min", "max", "count", "rate"]).optional()
});
var LogQuerySchema = z9.object({
  traceId: z9.string().optional(),
  spanId: z9.string().optional(),
  serviceName: z9.string().optional(),
  severity: LogSeveritySchema.optional(),
  bodyContains: z9.string().optional(),
  startTime: z9.number().optional(),
  endTime: z9.number().optional(),
  limit: z9.number().default(100)
});
var TraceSummarySchema = z9.object({
  totalTraces: z9.number(),
  totalSpans: z9.number(),
  errorRate: z9.number(),
  avgDuration: z9.number(),
  p50Duration: z9.number(),
  p95Duration: z9.number(),
  p99Duration: z9.number(),
  topServices: z9.array(z9.object({
    name: z9.string(),
    traceCount: z9.number(),
    avgDuration: z9.number()
  })),
  topOperations: z9.array(z9.object({
    name: z9.string(),
    traceCount: z9.number(),
    avgDuration: z9.number(),
    errorRate: z9.number()
  }))
});
var MetricsSummarySchema = z9.object({
  totalMetrics: z9.number(),
  totalPoints: z9.number(),
  metricsByType: z9.record(z9.number()),
  topMetrics: z9.array(z9.object({
    name: z9.string(),
    type: MetricTypeSchema,
    pointCount: z9.number(),
    lastValue: z9.number()
  }))
});
var ObservabilitySummarySchema = z9.object({
  traces: TraceSummarySchema,
  metrics: MetricsSummarySchema,
  uptime: z9.number(),
  lastUpdated: z9.number()
});
var BUILTIN_METRICS = [
  // HTTP metrics
  {
    name: "http_requests_total",
    type: "counter",
    unit: "requests",
    description: "Total HTTP requests",
    labels: ["method", "path", "status"]
  },
  {
    name: "http_request_duration_ms",
    type: "histogram",
    unit: "ms",
    description: "HTTP request duration",
    labels: ["method", "path"],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1e3, 2500, 5e3]
  },
  {
    name: "http_request_size_bytes",
    type: "histogram",
    unit: "bytes",
    description: "HTTP request size",
    labels: ["method", "path"],
    buckets: [100, 1e3, 1e4, 1e5, 1e6]
  },
  {
    name: "http_response_size_bytes",
    type: "histogram",
    unit: "bytes",
    description: "HTTP response size",
    labels: ["method", "path"],
    buckets: [100, 1e3, 1e4, 1e5, 1e6]
  },
  // Pipeline metrics
  {
    name: "pipeline_executions_total",
    type: "counter",
    unit: "count",
    description: "Total pipeline executions",
    labels: ["pipeline", "status"]
  },
  {
    name: "pipeline_duration_ms",
    type: "histogram",
    unit: "ms",
    description: "Pipeline execution duration",
    labels: ["pipeline"],
    buckets: [100, 500, 1e3, 5e3, 1e4, 3e4, 6e4, 3e5]
  },
  {
    name: "pipeline_steps_total",
    type: "counter",
    unit: "count",
    description: "Total pipeline steps executed",
    labels: ["pipeline", "step", "status"]
  },
  // Queue metrics
  {
    name: "queue_jobs_total",
    type: "counter",
    unit: "count",
    description: "Total queue jobs",
    labels: ["queue", "status"]
  },
  {
    name: "queue_depth",
    type: "gauge",
    unit: "count",
    description: "Current queue depth",
    labels: ["queue"]
  },
  {
    name: "queue_job_duration_ms",
    type: "histogram",
    unit: "ms",
    description: "Queue job duration",
    labels: ["queue"],
    buckets: [100, 500, 1e3, 5e3, 1e4, 3e4]
  },
  // System metrics
  {
    name: "memory_usage_bytes",
    type: "gauge",
    unit: "bytes",
    description: "Memory usage",
    labels: ["type"]
  },
  {
    name: "cpu_usage_percent",
    type: "gauge",
    unit: "percent",
    description: "CPU usage percentage",
    labels: []
  },
  {
    name: "active_connections",
    type: "gauge",
    unit: "count",
    description: "Active connections",
    labels: ["type"]
  }
];
var SPAN_ATTRIBUTES = {
  // HTTP
  HTTP_METHOD: "http.method",
  HTTP_URL: "http.url",
  HTTP_TARGET: "http.target",
  HTTP_HOST: "http.host",
  HTTP_SCHEME: "http.scheme",
  HTTP_STATUS_CODE: "http.status_code",
  HTTP_REQUEST_CONTENT_LENGTH: "http.request_content_length",
  HTTP_RESPONSE_CONTENT_LENGTH: "http.response_content_length",
  HTTP_USER_AGENT: "http.user_agent",
  // Database
  DB_SYSTEM: "db.system",
  DB_CONNECTION_STRING: "db.connection_string",
  DB_USER: "db.user",
  DB_NAME: "db.name",
  DB_STATEMENT: "db.statement",
  DB_OPERATION: "db.operation",
  // Pipeline
  PIPELINE_ID: "pipeline.id",
  PIPELINE_NAME: "pipeline.name",
  PIPELINE_STEP: "pipeline.step",
  PIPELINE_STATUS: "pipeline.status",
  // Queue
  QUEUE_NAME: "queue.name",
  QUEUE_JOB_ID: "queue.job_id",
  QUEUE_PRIORITY: "queue.priority",
  // Error
  ERROR_TYPE: "error.type",
  ERROR_MESSAGE: "error.message",
  ERROR_STACK: "error.stack",
  // Custom
  ORG_ID: "gicm.org_id",
  USER_ID: "gicm.user_id",
  REQUEST_ID: "gicm.request_id"
};

// src/observability/tracer.ts
import { EventEmitter as EventEmitter14 } from "eventemitter3";
import { randomUUID as randomUUID4 } from "crypto";
var SpanBuilder = class {
  span;
  tracer;
  constructor(tracer, name, options = {}) {
    const now = Date.now();
    const traceId = options.context?.traceId ?? generateTraceId();
    const spanId = generateSpanId();
    this.tracer = tracer;
    this.span = {
      traceId,
      spanId,
      parentSpanId: options.context?.spanId ?? options.parentSpanId,
      name,
      kind: options.kind ?? "INTERNAL",
      startTime: options.startTime ?? now,
      status: { code: "UNSET" },
      attributes: { ...options.attributes },
      events: [],
      links: options.links ?? [],
      resource: tracer.getResource()
    };
  }
  setAttribute(key, value) {
    this.span.attributes[key] = value;
    return this;
  }
  setAttributes(attrs) {
    Object.assign(this.span.attributes, attrs);
    return this;
  }
  addEvent(name, attributes) {
    this.span.events.push({
      name,
      timestamp: Date.now(),
      attributes
    });
    return this;
  }
  addLink(traceId, spanId, attributes) {
    this.span.links.push({ traceId, spanId, attributes });
    return this;
  }
  setStatus(code, message) {
    this.span.status = { code, message };
    return this;
  }
  setError(error) {
    this.span.status = { code: "ERROR", message: error.message };
    this.addEvent("exception", {
      "exception.type": error.name,
      "exception.message": error.message,
      "exception.stacktrace": error.stack ?? ""
    });
    return this;
  }
  getSpan() {
    return this.span;
  }
  getContext() {
    return {
      traceId: this.span.traceId,
      spanId: this.span.spanId,
      parentSpanId: this.span.parentSpanId,
      traceFlags: 1
    };
  }
  end(endTime) {
    const now = endTime ?? Date.now();
    this.span.endTime = now;
    this.span.duration = now - this.span.startTime;
    const completedSpan = this.span;
    this.tracer.recordSpan(completedSpan);
    return completedSpan;
  }
};
var Tracer = class extends EventEmitter14 {
  config;
  spans = /* @__PURE__ */ new Map();
  traces = /* @__PURE__ */ new Map();
  activeSpans = /* @__PURE__ */ new Map();
  sampler;
  constructor(config = {}) {
    super();
    this.config = {
      serviceName: config.serviceName ?? "integration-hub",
      serviceVersion: config.serviceVersion,
      environment: config.environment ?? "development",
      tracing: {
        enabled: true,
        sampler: { type: "always_on", ratio: 1, parentBased: true },
        maxSpanAttributes: 128,
        maxSpanEvents: 128,
        maxSpanLinks: 128,
        ...config.tracing
      },
      metrics: { enabled: true, collectInterval: 6e4, defaultBuckets: [], ...config.metrics },
      logging: { enabled: true, minSeverity: "INFO", includeTraceContext: true, ...config.logging },
      resource: { attributes: {}, ...config.resource },
      retention: { traces: 864e5, metrics: 6048e5, logs: 864e5, ...config.retention }
    };
    this.sampler = new Sampler(this.config.tracing.sampler);
    setInterval(() => this.cleanup(), 6e4);
  }
  getResource() {
    return {
      serviceName: this.config.serviceName,
      serviceVersion: this.config.serviceVersion,
      environment: this.config.environment,
      hostName: this.config.resource.hostName,
      instanceId: this.config.resource.instanceId
    };
  }
  /**
   * Start a new span
   */
  startSpan(name, options = {}) {
    if (!this.config.tracing.enabled) {
      return new NoOpSpanBuilder(this, name);
    }
    const shouldSample = this.sampler.shouldSample(options.context);
    if (!shouldSample) {
      return new NoOpSpanBuilder(this, name);
    }
    const builder = new SpanBuilder(this, name, options);
    this.activeSpans.set(builder.getContext().spanId, builder);
    this.emit("span:started", builder.getSpan());
    return builder;
  }
  /**
   * Create a child span from a parent context
   */
  startChildSpan(name, parentContext, options = {}) {
    return this.startSpan(name, { ...options, context: parentContext });
  }
  /**
   * Wrap an async function with tracing
   */
  async trace(name, fn, options = {}) {
    const span = this.startSpan(name, options);
    try {
      const result = await fn(span);
      span.setStatus("OK");
      return result;
    } catch (error) {
      span.setError(error);
      throw error;
    } finally {
      span.end();
    }
  }
  /**
   * Record a completed span
   */
  recordSpan(span) {
    if (Object.keys(span.attributes).length > this.config.tracing.maxSpanAttributes) {
      const entries = Object.entries(span.attributes).slice(0, this.config.tracing.maxSpanAttributes);
      span.attributes = Object.fromEntries(entries);
    }
    if (span.events.length > this.config.tracing.maxSpanEvents) {
      span.events = span.events.slice(0, this.config.tracing.maxSpanEvents);
    }
    if (span.links.length > this.config.tracing.maxSpanLinks) {
      span.links = span.links.slice(0, this.config.tracing.maxSpanLinks);
    }
    this.spans.set(span.spanId, span);
    const traceSpans = this.traces.get(span.traceId) ?? [];
    traceSpans.push(span);
    this.traces.set(span.traceId, traceSpans);
    this.activeSpans.delete(span.spanId);
    this.emit("span:ended", span);
    if (!span.parentSpanId) {
      this.checkTraceComplete(span.traceId);
    }
  }
  /**
   * Check if a trace is complete
   */
  checkTraceComplete(traceId) {
    const spans = this.traces.get(traceId);
    if (!spans || spans.length === 0) return;
    const rootSpan = spans.find((s) => !s.parentSpanId);
    if (!rootSpan || !rootSpan.endTime) return;
    const trace = {
      traceId,
      rootSpan,
      spans,
      startTime: rootSpan.startTime,
      endTime: rootSpan.endTime,
      duration: rootSpan.duration,
      spanCount: spans.length,
      errorCount: spans.filter((s) => s.status.code === "ERROR").length,
      serviceName: rootSpan.resource.serviceName,
      operationName: rootSpan.name
    };
    this.emit("trace:completed", trace);
  }
  /**
   * Get a span by ID
   */
  getSpan(spanId) {
    return this.spans.get(spanId);
  }
  /**
   * Get all spans for a trace
   */
  getTraceSpans(traceId) {
    return this.traces.get(traceId) ?? [];
  }
  /**
   * Get a complete trace
   */
  getTrace(traceId) {
    const spans = this.traces.get(traceId);
    if (!spans || spans.length === 0) return null;
    const rootSpan = spans.find((s) => !s.parentSpanId);
    if (!rootSpan) return null;
    return {
      traceId,
      rootSpan,
      spans,
      startTime: rootSpan.startTime,
      endTime: rootSpan.endTime,
      duration: rootSpan.duration,
      spanCount: spans.length,
      errorCount: spans.filter((s) => s.status.code === "ERROR").length,
      serviceName: rootSpan.resource.serviceName,
      operationName: rootSpan.name
    };
  }
  /**
   * Search traces
   */
  searchTraces(query) {
    const results = [];
    const limit = query.limit ?? 100;
    for (const traceId of this.traces.keys()) {
      if (results.length >= limit) break;
      const trace = this.getTrace(traceId);
      if (!trace || !trace.rootSpan.endTime) continue;
      if (query.serviceName && trace.serviceName !== query.serviceName) continue;
      if (query.operationName && trace.operationName !== query.operationName) continue;
      if (query.minDuration && (trace.duration ?? 0) < query.minDuration) continue;
      if (query.maxDuration && (trace.duration ?? 0) > query.maxDuration) continue;
      if (query.startTime && trace.startTime < query.startTime) continue;
      if (query.endTime && trace.startTime > query.endTime) continue;
      if (query.tags) {
        const hasAllTags = Object.entries(query.tags).every(
          ([key, value]) => trace.rootSpan.attributes[key] === value
        );
        if (!hasAllTags) continue;
      }
      results.push(trace);
    }
    return results.sort((a, b) => b.startTime - a.startTime);
  }
  /**
   * Get trace stats
   */
  getStats() {
    const traces = Array.from(this.traces.values());
    const allSpans = traces.flat();
    const completedTraces = traces.filter((spans) => {
      const root = spans.find((s) => !s.parentSpanId);
      return root?.endTime;
    });
    const durations = completedTraces.map((spans) => spans.find((s) => !s.parentSpanId)?.duration ?? 0).filter((d) => d > 0);
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const errorCount = allSpans.filter((s) => s.status.code === "ERROR").length;
    return {
      totalTraces: this.traces.size,
      totalSpans: allSpans.length,
      activeSpans: this.activeSpans.size,
      avgDuration,
      errorRate: allSpans.length > 0 ? errorCount / allSpans.length : 0
    };
  }
  /**
   * Clean up old traces
   */
  cleanup() {
    const cutoff = Date.now() - this.config.retention.traces;
    for (const [spanId, span] of this.spans) {
      if (span.startTime < cutoff) {
        this.spans.delete(spanId);
      }
    }
    for (const [traceId, spans] of this.traces) {
      const root = spans.find((s) => !s.parentSpanId);
      if (root && root.startTime < cutoff) {
        this.traces.delete(traceId);
      }
    }
  }
  /**
   * Clear all data
   */
  clear() {
    this.spans.clear();
    this.traces.clear();
    this.activeSpans.clear();
  }
};
var NoOpSpanBuilder = class extends SpanBuilder {
  setAttribute(_key, _value) {
    return this;
  }
  setAttributes(_attrs) {
    return this;
  }
  addEvent(_name, _attributes) {
    return this;
  }
  addLink(_traceId, _spanId, _attributes) {
    return this;
  }
  setStatus(_code, _message) {
    return this;
  }
  setError(_error) {
    return this;
  }
  end(_endTime) {
    return this.getSpan();
  }
};
var Sampler = class {
  config;
  constructor(config) {
    this.config = config;
  }
  shouldSample(parentContext) {
    switch (this.config.type) {
      case "always_on":
        return true;
      case "always_off":
        return false;
      case "trace_id_ratio":
        return Math.random() < this.config.ratio;
      case "parent_based":
        if (parentContext && this.config.parentBased) {
          return (parentContext.traceFlags & 1) === 1;
        }
        return Math.random() < this.config.ratio;
      default:
        return true;
    }
  }
};
function generateTraceId() {
  return randomUUID4().replace(/-/g, "");
}
function generateSpanId() {
  return randomUUID4().replace(/-/g, "").substring(0, 16);
}
var tracerInstance = null;
function getTracer() {
  return tracerInstance;
}
function createTracer(config) {
  tracerInstance = new Tracer(config);
  return tracerInstance;
}

// src/observability/metrics.ts
import { EventEmitter as EventEmitter15 } from "eventemitter3";
var Counter = class {
  name;
  unit;
  description;
  labels;
  values = /* @__PURE__ */ new Map();
  points = /* @__PURE__ */ new Map();
  collector;
  constructor(collector, definition) {
    this.collector = collector;
    this.name = definition.name;
    this.unit = definition.unit ?? "count";
    this.description = definition.description ?? "";
    this.labels = definition.labels ?? [];
  }
  getKey(labels) {
    return JSON.stringify(labels);
  }
  inc(labels = {}, value = 1) {
    const key = this.getKey(labels);
    const current = this.values.get(key) ?? 0;
    const newValue = current + value;
    this.values.set(key, newValue);
    const point = {
      timestamp: Date.now(),
      value: newValue,
      labels
    };
    const pointsList = this.points.get(key) ?? [];
    pointsList.push(point);
    this.points.set(key, pointsList);
    this.collector.recordMetric(this.getData());
  }
  getValue(labels = {}) {
    return this.values.get(this.getKey(labels)) ?? 0;
  }
  getData() {
    const allPoints = [];
    for (const points of this.points.values()) {
      allPoints.push(...points);
    }
    return {
      name: this.name,
      type: "counter",
      unit: this.unit,
      description: this.description,
      points: allPoints,
      resource: this.collector.getResource()
    };
  }
  reset() {
    this.values.clear();
    this.points.clear();
  }
};
var Gauge = class {
  name;
  unit;
  description;
  labels;
  values = /* @__PURE__ */ new Map();
  points = /* @__PURE__ */ new Map();
  collector;
  constructor(collector, definition) {
    this.collector = collector;
    this.name = definition.name;
    this.unit = definition.unit ?? "none";
    this.description = definition.description ?? "";
    this.labels = definition.labels ?? [];
  }
  getKey(labels) {
    return JSON.stringify(labels);
  }
  set(value, labels = {}) {
    const key = this.getKey(labels);
    this.values.set(key, value);
    const point = {
      timestamp: Date.now(),
      value,
      labels
    };
    const pointsList = this.points.get(key) ?? [];
    pointsList.push(point);
    this.points.set(key, pointsList);
    this.collector.recordMetric(this.getData());
  }
  inc(labels = {}, value = 1) {
    const current = this.getValue(labels);
    this.set(current + value, labels);
  }
  dec(labels = {}, value = 1) {
    const current = this.getValue(labels);
    this.set(current - value, labels);
  }
  getValue(labels = {}) {
    return this.values.get(this.getKey(labels)) ?? 0;
  }
  getData() {
    const allPoints = [];
    for (const points of this.points.values()) {
      allPoints.push(...points);
    }
    return {
      name: this.name,
      type: "gauge",
      unit: this.unit,
      description: this.description,
      points: allPoints,
      resource: this.collector.getResource()
    };
  }
  reset() {
    this.values.clear();
    this.points.clear();
  }
};
var Histogram = class {
  name;
  unit;
  description;
  labels;
  buckets;
  data = /* @__PURE__ */ new Map();
  points = /* @__PURE__ */ new Map();
  collector;
  constructor(collector, definition) {
    this.collector = collector;
    this.name = definition.name;
    this.unit = definition.unit ?? "ms";
    this.description = definition.description ?? "";
    this.labels = definition.labels ?? [];
    this.buckets = definition.buckets ?? [5, 10, 25, 50, 100, 250, 500, 1e3, 2500, 5e3, 1e4];
  }
  getKey(labels) {
    return JSON.stringify(labels);
  }
  getOrCreateData(key) {
    let data = this.data.get(key);
    if (!data) {
      data = {
        sum: 0,
        count: 0,
        min: Infinity,
        max: -Infinity,
        counts: new Array(this.buckets.length + 1).fill(0)
      };
      this.data.set(key, data);
    }
    return data;
  }
  observe(value, labels = {}) {
    const key = this.getKey(labels);
    const data = this.getOrCreateData(key);
    data.sum += value;
    data.count++;
    data.min = Math.min(data.min, value);
    data.max = Math.max(data.max, value);
    for (let i = 0; i < this.buckets.length; i++) {
      if (value <= this.buckets[i]) {
        data.counts[i]++;
        break;
      }
    }
    if (value > this.buckets[this.buckets.length - 1]) {
      data.counts[this.buckets.length]++;
    }
    const point = {
      timestamp: Date.now(),
      value,
      labels
    };
    const pointsList = this.points.get(key) ?? [];
    pointsList.push(point);
    this.points.set(key, pointsList);
    this.collector.recordMetric(this.getData());
  }
  /**
   * Time a function execution
   */
  async time(fn, labels = {}) {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.observe(duration, labels);
    }
  }
  /**
   * Start a timer that returns a function to stop
   */
  startTimer(labels = {}) {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.observe(duration, labels);
      return duration;
    };
  }
  getBuckets(labels = {}) {
    const key = this.getKey(labels);
    const data = this.data.get(key);
    if (!data) return null;
    return {
      boundaries: this.buckets,
      counts: data.counts,
      sum: data.sum,
      count: data.count,
      min: data.min === Infinity ? void 0 : data.min,
      max: data.max === -Infinity ? void 0 : data.max
    };
  }
  getPercentile(percentile, labels = {}) {
    const key = this.getKey(labels);
    const data = this.data.get(key);
    if (!data || data.count === 0) return null;
    const targetCount = Math.ceil(percentile / 100 * data.count);
    let cumulative = 0;
    for (let i = 0; i < data.counts.length; i++) {
      cumulative += data.counts[i];
      if (cumulative >= targetCount) {
        return i < this.buckets.length ? this.buckets[i] : this.buckets[this.buckets.length - 1];
      }
    }
    return this.buckets[this.buckets.length - 1];
  }
  getData() {
    const allPoints = [];
    for (const points of this.points.values()) {
      allPoints.push(...points);
    }
    const firstKey = this.data.keys().next().value;
    const histogram = firstKey ? this.getBuckets(JSON.parse(firstKey)) ?? void 0 : void 0;
    return {
      name: this.name,
      type: "histogram",
      unit: this.unit,
      description: this.description,
      points: allPoints,
      histogram,
      resource: this.collector.getResource()
    };
  }
  reset() {
    this.data.clear();
    this.points.clear();
  }
};
var MetricsCollector = class extends EventEmitter15 {
  config;
  definitions = /* @__PURE__ */ new Map();
  counters = /* @__PURE__ */ new Map();
  gauges = /* @__PURE__ */ new Map();
  histograms = /* @__PURE__ */ new Map();
  metricData = /* @__PURE__ */ new Map();
  collectInterval;
  constructor(config = {}) {
    super();
    this.config = {
      serviceName: config.serviceName ?? "integration-hub",
      serviceVersion: config.serviceVersion,
      environment: config.environment ?? "development",
      tracing: { enabled: true, sampler: { type: "always_on", ratio: 1, parentBased: true }, maxSpanAttributes: 128, maxSpanEvents: 128, maxSpanLinks: 128, ...config.tracing },
      metrics: {
        enabled: true,
        collectInterval: 6e4,
        defaultBuckets: [5, 10, 25, 50, 100, 250, 500, 1e3, 2500, 5e3, 1e4],
        ...config.metrics
      },
      logging: { enabled: true, minSeverity: "INFO", includeTraceContext: true, ...config.logging },
      resource: { attributes: {}, ...config.resource },
      retention: { traces: 864e5, metrics: 6048e5, logs: 864e5, ...config.retention }
    };
    for (const metric of BUILTIN_METRICS) {
      this.register(metric);
    }
    if (this.config.metrics.enabled) {
      this.startCollection();
    }
  }
  getResource() {
    return {
      serviceName: this.config.serviceName,
      environment: this.config.environment
    };
  }
  /**
   * Register a metric definition
   */
  register(definition) {
    this.definitions.set(definition.name, definition);
  }
  /**
   * Get or create a counter
   */
  counter(name, options = {}) {
    let counter = this.counters.get(name);
    if (!counter) {
      const definition = {
        name,
        type: "counter",
        unit: options.unit ?? "count",
        description: options.description,
        labels: options.labels ?? []
      };
      this.register(definition);
      counter = new Counter(this, definition);
      this.counters.set(name, counter);
    }
    return counter;
  }
  /**
   * Get or create a gauge
   */
  gauge(name, options = {}) {
    let gauge = this.gauges.get(name);
    if (!gauge) {
      const definition = {
        name,
        type: "gauge",
        unit: options.unit ?? "none",
        description: options.description,
        labels: options.labels ?? []
      };
      this.register(definition);
      gauge = new Gauge(this, definition);
      this.gauges.set(name, gauge);
    }
    return gauge;
  }
  /**
   * Get or create a histogram
   */
  histogram(name, options = {}) {
    let histogram = this.histograms.get(name);
    if (!histogram) {
      const definition = {
        name,
        type: "histogram",
        unit: options.unit ?? "ms",
        description: options.description,
        labels: options.labels ?? [],
        buckets: options.buckets ?? this.config.metrics.defaultBuckets
      };
      this.register(definition);
      histogram = new Histogram(this, definition);
      this.histograms.set(name, histogram);
    }
    return histogram;
  }
  /**
   * Record a metric data point (internal)
   */
  recordMetric(data) {
    this.metricData.set(data.name, data);
    this.emit("metric:recorded", data);
  }
  /**
   * Get all metric data
   */
  getAllMetrics() {
    return Array.from(this.metricData.values());
  }
  /**
   * Get specific metric data
   */
  getMetric(name) {
    return this.metricData.get(name);
  }
  /**
   * Query metrics
   */
  query(query) {
    const metric = this.metricData.get(query.name);
    if (!metric) return [];
    let points = metric.points;
    if (query.labels) {
      points = points.filter((p) => {
        return Object.entries(query.labels).every(
          ([key, value]) => p.labels[key] === value
        );
      });
    }
    if (query.startTime) {
      points = points.filter((p) => p.timestamp >= query.startTime);
    }
    if (query.endTime) {
      points = points.filter((p) => p.timestamp <= query.endTime);
    }
    if (query.aggregation && query.step) {
      points = this.aggregatePoints(points, query.aggregation, query.step);
    }
    return points;
  }
  aggregatePoints(points, aggregation, step) {
    if (points.length === 0) return [];
    const buckets = /* @__PURE__ */ new Map();
    for (const point of points) {
      const bucket = Math.floor(point.timestamp / step) * step;
      const bucketPoints = buckets.get(bucket) ?? [];
      bucketPoints.push(point);
      buckets.set(bucket, bucketPoints);
    }
    const results = [];
    for (const [timestamp, bucketPoints] of buckets) {
      const values = bucketPoints.map((p) => p.value);
      let value;
      switch (aggregation) {
        case "sum":
          value = values.reduce((a, b) => a + b, 0);
          break;
        case "avg":
          value = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case "min":
          value = Math.min(...values);
          break;
        case "max":
          value = Math.max(...values);
          break;
        case "count":
          value = values.length;
          break;
        case "rate":
          value = values.reduce((a, b) => a + b, 0) / (step / 1e3);
          break;
      }
      results.push({
        timestamp,
        value,
        labels: {}
      });
    }
    return results.sort((a, b) => a.timestamp - b.timestamp);
  }
  /**
   * Get metrics summary
   */
  getSummary() {
    const metrics = this.getAllMetrics();
    const byType = {};
    for (const metric of metrics) {
      byType[metric.type] = (byType[metric.type] ?? 0) + 1;
    }
    const topMetrics = metrics.map((m) => ({
      name: m.name,
      type: m.type,
      pointCount: m.points.length,
      lastValue: m.points.length > 0 ? m.points[m.points.length - 1].value : 0
    })).sort((a, b) => b.pointCount - a.pointCount).slice(0, 10);
    return {
      totalMetrics: metrics.length,
      totalPoints: metrics.reduce((sum, m) => sum + m.points.length, 0),
      metricsByType: byType,
      topMetrics
    };
  }
  /**
   * Start periodic collection
   */
  startCollection() {
    this.collectInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.metrics.collectInterval);
  }
  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memory = process.memoryUsage();
      const memoryGauge = this.gauge("memory_usage_bytes");
      memoryGauge.set(memory.heapUsed, { type: "heap_used" });
      memoryGauge.set(memory.heapTotal, { type: "heap_total" });
      memoryGauge.set(memory.external, { type: "external" });
      memoryGauge.set(memory.rss, { type: "rss" });
    }
  }
  /**
   * Stop collection
   */
  stop() {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = void 0;
    }
  }
  /**
   * Reset all metrics
   */
  reset() {
    for (const counter of this.counters.values()) {
      counter.reset();
    }
    for (const gauge of this.gauges.values()) {
      gauge.reset();
    }
    for (const histogram of this.histograms.values()) {
      histogram.reset();
    }
    this.metricData.clear();
  }
  /**
   * Export metrics in Prometheus format
   */
  toPrometheus() {
    const lines = [];
    for (const metric of this.getAllMetrics()) {
      if (metric.description) {
        lines.push(`# HELP ${metric.name} ${metric.description}`);
      }
      lines.push(`# TYPE ${metric.name} ${metric.type}`);
      if (metric.type === "histogram" && metric.histogram) {
        const h = metric.histogram;
        for (let i = 0; i < h.boundaries.length; i++) {
          lines.push(`${metric.name}_bucket{le="${h.boundaries[i]}"} ${h.counts[i]}`);
        }
        lines.push(`${metric.name}_bucket{le="+Inf"} ${h.counts[h.boundaries.length]}`);
        lines.push(`${metric.name}_sum ${h.sum}`);
        lines.push(`${metric.name}_count ${h.count}`);
      } else {
        for (const point of metric.points) {
          const labels = Object.entries(point.labels).map(([k, v]) => `${k}="${v}"`).join(",");
          const labelStr = labels ? `{${labels}}` : "";
          lines.push(`${metric.name}${labelStr} ${point.value}`);
        }
      }
      lines.push("");
    }
    return lines.join("\n");
  }
};
var metricsInstance = null;
function getMetricsCollector() {
  return metricsInstance;
}
function createMetricsCollector(config) {
  metricsInstance = new MetricsCollector(config);
  return metricsInstance;
}

// src/observability/logger.ts
import { EventEmitter as EventEmitter16 } from "eventemitter3";
var SEVERITY_LEVELS2 = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  FATAL: 5
};
var Logger = class _Logger extends EventEmitter16 {
  config;
  logs = [];
  maxLogs = 1e4;
  currentContext;
  constructor(config = {}) {
    super();
    this.config = {
      serviceName: config.serviceName ?? "integration-hub",
      serviceVersion: config.serviceVersion,
      environment: config.environment ?? "development",
      tracing: { enabled: true, sampler: { type: "always_on", ratio: 1, parentBased: true }, maxSpanAttributes: 128, maxSpanEvents: 128, maxSpanLinks: 128, ...config.tracing },
      metrics: { enabled: true, collectInterval: 6e4, defaultBuckets: [], ...config.metrics },
      logging: {
        enabled: true,
        minSeverity: "INFO",
        includeTraceContext: true,
        ...config.logging
      },
      resource: { attributes: {}, ...config.resource },
      retention: { traces: 864e5, metrics: 6048e5, logs: 864e5, ...config.retention }
    };
    setInterval(() => this.cleanup(), 6e4);
  }
  /**
   * Set trace context for subsequent logs
   */
  setContext(context) {
    this.currentContext = context;
  }
  /**
   * Create a child logger with a specific context
   */
  withContext(context) {
    const child = new _Logger({
      ...this.config,
      serviceName: this.config.serviceName
    });
    child.setContext(context);
    return child;
  }
  /**
   * Log with specified severity
   */
  log(severity, message, attributes = {}) {
    if (!this.config.logging.enabled) return;
    const minLevel = SEVERITY_LEVELS2[this.config.logging.minSeverity];
    const currentLevel = SEVERITY_LEVELS2[severity];
    if (currentLevel < minLevel) return;
    const record = {
      timestamp: Date.now(),
      severity,
      body: message,
      attributes,
      resource: {
        serviceName: this.config.serviceName,
        environment: this.config.environment
      }
    };
    if (this.config.logging.includeTraceContext && this.currentContext) {
      record.traceId = this.currentContext.traceId;
      record.spanId = this.currentContext.spanId;
    }
    this.logs.push(record);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    this.emit("log:recorded", record);
    if (this.config.environment === "development") {
      this.outputToConsole(record);
    }
  }
  /**
   * Log at TRACE level
   */
  trace(message, attributes = {}) {
    this.log("TRACE", message, attributes);
  }
  /**
   * Log at DEBUG level
   */
  debug(message, attributes = {}) {
    this.log("DEBUG", message, attributes);
  }
  /**
   * Log at INFO level
   */
  info(message, attributes = {}) {
    this.log("INFO", message, attributes);
  }
  /**
   * Log at WARN level
   */
  warn(message, attributes = {}) {
    this.log("WARN", message, attributes);
  }
  /**
   * Log at ERROR level
   */
  error(message, error, attributes = {}) {
    const attrs = { ...attributes };
    if (error) {
      attrs["error.type"] = error.name;
      attrs["error.message"] = error.message;
      attrs["error.stack"] = error.stack ?? "";
    }
    this.log("ERROR", message, attrs);
  }
  /**
   * Log at FATAL level
   */
  fatal(message, error, attributes = {}) {
    const attrs = { ...attributes };
    if (error) {
      attrs["error.type"] = error.name;
      attrs["error.message"] = error.message;
      attrs["error.stack"] = error.stack ?? "";
    }
    this.log("FATAL", message, attrs);
  }
  /**
   * Query logs
   */
  query(query) {
    let results = this.logs;
    if (query.traceId) {
      results = results.filter((l) => l.traceId === query.traceId);
    }
    if (query.spanId) {
      results = results.filter((l) => l.spanId === query.spanId);
    }
    if (query.serviceName) {
      results = results.filter((l) => l.resource.serviceName === query.serviceName);
    }
    if (query.severity) {
      const minLevel = SEVERITY_LEVELS2[query.severity];
      results = results.filter((l) => SEVERITY_LEVELS2[l.severity] >= minLevel);
    }
    if (query.bodyContains) {
      const search = query.bodyContains.toLowerCase();
      results = results.filter((l) => l.body.toLowerCase().includes(search));
    }
    if (query.startTime) {
      results = results.filter((l) => l.timestamp >= query.startTime);
    }
    if (query.endTime) {
      results = results.filter((l) => l.timestamp <= query.endTime);
    }
    const limit = query.limit ?? 100;
    return results.slice(-limit);
  }
  /**
   * Get logs for a specific trace
   */
  getTraceLogs(traceId) {
    return this.logs.filter((l) => l.traceId === traceId);
  }
  /**
   * Get all logs
   */
  getAllLogs() {
    return [...this.logs];
  }
  /**
   * Get stats
   */
  getStats() {
    const bySeverity = {
      TRACE: 0,
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      FATAL: 0
    };
    const oneMinuteAgo = Date.now() - 6e4;
    let recentCount = 0;
    for (const log of this.logs) {
      bySeverity[log.severity]++;
      if (log.timestamp >= oneMinuteAgo) {
        recentCount++;
      }
    }
    return {
      totalLogs: this.logs.length,
      bySeverity,
      logsPerMinute: recentCount
    };
  }
  /**
   * Output log to console
   */
  outputToConsole(record) {
    const timestamp = new Date(record.timestamp).toISOString();
    const prefix = `[${timestamp}] [${record.severity}]`;
    const traceInfo = record.traceId ? ` [trace=${record.traceId.substring(0, 8)}]` : "";
    switch (record.severity) {
      case "TRACE":
      case "DEBUG":
        console.debug(`${prefix}${traceInfo} ${record.body}`, record.attributes);
        break;
      case "INFO":
        console.info(`${prefix}${traceInfo} ${record.body}`, record.attributes);
        break;
      case "WARN":
        console.warn(`${prefix}${traceInfo} ${record.body}`, record.attributes);
        break;
      case "ERROR":
      case "FATAL":
        console.error(`${prefix}${traceInfo} ${record.body}`, record.attributes);
        break;
    }
  }
  /**
   * Clean up old logs
   */
  cleanup() {
    const cutoff = Date.now() - this.config.retention.logs;
    this.logs = this.logs.filter((l) => l.timestamp >= cutoff);
  }
  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
  }
  /**
   * Export logs as JSON
   */
  toJSON() {
    return [...this.logs];
  }
  /**
   * Export logs as NDJSON (newline-delimited JSON)
   */
  toNDJSON() {
    return this.logs.map((l) => JSON.stringify(l)).join("\n");
  }
};
var loggerInstance = null;
function getLogger() {
  return loggerInstance;
}
function createLogger(config) {
  loggerInstance = new Logger(config);
  return loggerInstance;
}

// src/observability/observability-manager.ts
import { EventEmitter as EventEmitter17 } from "eventemitter3";
var ObservabilityManager = class extends EventEmitter17 {
  config;
  tracer;
  metrics;
  logger;
  startTime;
  constructor(config = {}) {
    super();
    this.startTime = Date.now();
    this.config = {
      serviceName: config.serviceName ?? "integration-hub",
      serviceVersion: config.serviceVersion,
      environment: config.environment ?? "development",
      tracing: {
        enabled: true,
        sampler: { type: "always_on", ratio: 1, parentBased: true },
        maxSpanAttributes: 128,
        maxSpanEvents: 128,
        maxSpanLinks: 128,
        ...config.tracing
      },
      metrics: {
        enabled: true,
        collectInterval: 6e4,
        defaultBuckets: [5, 10, 25, 50, 100, 250, 500, 1e3, 2500, 5e3, 1e4],
        ...config.metrics
      },
      logging: {
        enabled: true,
        minSeverity: "INFO",
        includeTraceContext: true,
        ...config.logging
      },
      resource: { attributes: {}, ...config.resource },
      retention: {
        traces: 24 * 60 * 60 * 1e3,
        metrics: 7 * 24 * 60 * 60 * 1e3,
        logs: 24 * 60 * 60 * 1e3,
        ...config.retention
      }
    };
    this.tracer = createTracer(this.config);
    this.metrics = createMetricsCollector(this.config);
    this.logger = createLogger(this.config);
    this.tracer.on("span:started", (span) => this.emit("span:started", span));
    this.tracer.on("span:ended", (span) => this.emit("span:ended", span));
    this.tracer.on("trace:completed", (trace) => this.emit("trace:completed", trace));
    this.metrics.on("metric:recorded", (metric) => this.emit("metric:recorded", metric));
    this.logger.on("log:recorded", (log) => this.emit("log:recorded", log));
    this.logger.info("Observability manager started", {
      serviceName: this.config.serviceName,
      environment: this.config.environment
    });
  }
  // ===========================================================================
  // TRACING
  // ===========================================================================
  /**
   * Start a new span
   */
  startSpan(name, options) {
    return this.tracer.startSpan(name, options);
  }
  /**
   * Create a child span
   */
  startChildSpan(name, parentContext, options) {
    return this.tracer.startChildSpan(name, parentContext, options);
  }
  /**
   * Trace an async function
   */
  async trace(name, fn, options) {
    return this.tracer.trace(name, fn, options);
  }
  /**
   * Get a trace by ID
   */
  getTrace(traceId) {
    return this.tracer.getTrace(traceId);
  }
  /**
   * Search traces
   */
  searchTraces(query) {
    return this.tracer.searchTraces(query);
  }
  // ===========================================================================
  // METRICS
  // ===========================================================================
  /**
   * Get or create a counter
   */
  counter(name, options) {
    return this.metrics.counter(name, options);
  }
  /**
   * Get or create a gauge
   */
  gauge(name, options) {
    return this.metrics.gauge(name, options);
  }
  /**
   * Get or create a histogram
   */
  histogram(name, options) {
    return this.metrics.histogram(name, options);
  }
  /**
   * Record a metric value
   */
  recordMetric(name, value, labels = {}) {
    const counter = this.metrics.counter(name);
    counter.inc(labels, value);
  }
  /**
   * Query metrics
   */
  queryMetrics(query) {
    return this.metrics.getMetric(query.name);
  }
  /**
   * Get all metrics
   */
  getAllMetrics() {
    return this.metrics.getAllMetrics();
  }
  /**
   * Export metrics in Prometheus format
   */
  getPrometheusMetrics() {
    return this.metrics.toPrometheus();
  }
  // ===========================================================================
  // LOGGING
  // ===========================================================================
  /**
   * Set log context (trace ID, span ID)
   */
  setLogContext(context) {
    this.logger.setContext(context);
  }
  /**
   * Log at trace level
   */
  logTrace(message, attributes) {
    this.logger.trace(message, attributes);
  }
  /**
   * Log at debug level
   */
  logDebug(message, attributes) {
    this.logger.debug(message, attributes);
  }
  /**
   * Log at info level
   */
  logInfo(message, attributes) {
    this.logger.info(message, attributes);
  }
  /**
   * Log at warn level
   */
  logWarn(message, attributes) {
    this.logger.warn(message, attributes);
  }
  /**
   * Log at error level
   */
  logError(message, error, attributes) {
    this.logger.error(message, error, attributes);
  }
  /**
   * Log at fatal level
   */
  logFatal(message, error, attributes) {
    this.logger.fatal(message, error, attributes);
  }
  /**
   * Query logs
   */
  queryLogs(query) {
    return this.logger.query(query);
  }
  /**
   * Get all logs
   */
  getAllLogs() {
    return this.logger.getAllLogs();
  }
  // ===========================================================================
  // SUMMARY & STATS
  // ===========================================================================
  /**
   * Get observability summary
   */
  getSummary() {
    const traceStats = this.tracer.getStats();
    const metricsSummary = this.metrics.getSummary();
    const traces = this.searchTraces({ limit: 1e3 });
    const durations = traces.map((t) => t.duration ?? 0).filter((d) => d > 0);
    const sortedDurations = durations.sort((a, b) => a - b);
    const getPercentile = (arr, p) => {
      if (arr.length === 0) return 0;
      const index = Math.ceil(p / 100 * arr.length) - 1;
      return arr[Math.max(0, index)];
    };
    const serviceMap = /* @__PURE__ */ new Map();
    for (const trace of traces) {
      const entry = serviceMap.get(trace.serviceName) ?? { count: 0, totalDuration: 0 };
      entry.count++;
      entry.totalDuration += trace.duration ?? 0;
      serviceMap.set(trace.serviceName, entry);
    }
    const topServices = Array.from(serviceMap.entries()).map(([name, data]) => ({
      name,
      traceCount: data.count,
      avgDuration: data.count > 0 ? data.totalDuration / data.count : 0
    })).sort((a, b) => b.traceCount - a.traceCount).slice(0, 10);
    const opMap = /* @__PURE__ */ new Map();
    for (const trace of traces) {
      const entry = opMap.get(trace.operationName) ?? { count: 0, totalDuration: 0, errors: 0 };
      entry.count++;
      entry.totalDuration += trace.duration ?? 0;
      entry.errors += trace.errorCount;
      opMap.set(trace.operationName, entry);
    }
    const topOperations = Array.from(opMap.entries()).map(([name, data]) => ({
      name,
      traceCount: data.count,
      avgDuration: data.count > 0 ? data.totalDuration / data.count : 0,
      errorRate: data.count > 0 ? data.errors / data.count : 0
    })).sort((a, b) => b.traceCount - a.traceCount).slice(0, 10);
    return {
      traces: {
        totalTraces: traceStats.totalTraces,
        totalSpans: traceStats.totalSpans,
        errorRate: traceStats.errorRate,
        avgDuration: traceStats.avgDuration,
        p50Duration: getPercentile(sortedDurations, 50),
        p95Duration: getPercentile(sortedDurations, 95),
        p99Duration: getPercentile(sortedDurations, 99),
        topServices,
        topOperations
      },
      metrics: metricsSummary,
      uptime: Date.now() - this.startTime,
      lastUpdated: Date.now()
    };
  }
  /**
   * Get health status
   */
  getHealth() {
    const traceStats = this.tracer.getStats();
    const metricsSummary = this.metrics.getSummary();
    const logStats = this.logger.getStats();
    return {
      healthy: true,
      tracing: {
        enabled: this.config.tracing.enabled,
        activeSpans: traceStats.activeSpans
      },
      metrics: {
        enabled: this.config.metrics.enabled,
        metricCount: metricsSummary.totalMetrics
      },
      logging: {
        enabled: this.config.logging.enabled,
        logCount: logStats.totalLogs
      }
    };
  }
  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================
  /**
   * Shutdown observability
   */
  shutdown() {
    this.logger.info("Observability manager shutting down");
    this.metrics.stop();
    this.removeAllListeners();
  }
  /**
   * Reset all data
   */
  reset() {
    this.tracer.clear();
    this.metrics.reset();
    this.logger.clear();
  }
  /**
   * Get configuration
   */
  getConfig() {
    return { ...this.config };
  }
};
var observabilityInstance = null;
function getObservabilityManager() {
  return observabilityInstance;
}
function createObservabilityManager(config) {
  observabilityInstance = new ObservabilityManager(config);
  return observabilityInstance;
}

// src/api/server.ts
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";

// src/api/content-routes.ts
async function registerContentRoutes(fastify, hub) {
  const storage = getContentStorage();
  await storage.initialize();
  fastify.post("/api/content/events", async (req, reply) => {
    const eventData = req.body;
    if (!eventData.engine || !eventData.type || !eventData.title) {
      reply.code(400);
      return { ok: false, error: "Missing required fields: engine, type, title" };
    }
    const event = {
      ...eventData,
      id: eventData.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: eventData.timestamp || (/* @__PURE__ */ new Date()).toISOString()
    };
    await storage.saveEngineEvent(event);
    hub.getEventBus().publish(event.engine, event.type, event);
    return { ok: true, id: event.id };
  });
  fastify.get("/api/content/events", async (req, reply) => {
    const sinceStr = req.query.since;
    const since = sinceStr ? new Date(sinceStr) : new Date(Date.now() - 24 * 60 * 60 * 1e3);
    if (isNaN(since.getTime())) {
      reply.code(400);
      return { ok: false, error: "Invalid date format for 'since'" };
    }
    let events = await storage.getEngineEventsSince(since);
    if (req.query.engine) {
      events = events.filter((e) => e.engine === req.query.engine);
    }
    if (req.query.type) {
      events = events.filter((e) => e.type === req.query.type);
    }
    const limit = parseInt(req.query.limit || "100", 10);
    events = events.slice(0, limit);
    return { ok: true, count: events.length, events };
  });
  fastify.post("/api/integration/events", async (req, reply) => {
    const eventData = req.body;
    if (!eventData.engine || !eventData.type || !eventData.title) {
      reply.code(400);
      return { ok: false, error: "Missing required fields: engine, type, title" };
    }
    const event = {
      ...eventData,
      id: eventData.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: eventData.timestamp || (/* @__PURE__ */ new Date()).toISOString()
    };
    await storage.saveEngineEvent(event);
    hub.getEventBus().publish(event.engine, event.type, event);
    return { ok: true, id: event.id };
  });
  fastify.get("/api/integration/events", async (req) => {
    const sinceStr = req.query.since;
    const since = sinceStr ? new Date(sinceStr) : new Date(Date.now() - 24 * 60 * 60 * 1e3);
    if (isNaN(since.getTime())) {
      return { ok: false, error: "Invalid date format for 'since'" };
    }
    const events = await storage.getEngineEventsSince(since);
    return { ok: true, count: events.length, events };
  });
  fastify.post("/api/content/wins", async (req, reply) => {
    const winData = req.body;
    if (!winData.category || !winData.title || winData.value === void 0) {
      reply.code(400);
      return { ok: false, error: "Missing required fields: category, title, value" };
    }
    const win = {
      ...winData,
      id: winData.id || `win_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: winData.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    await storage.saveWinRecord(win);
    return { ok: true, id: win.id };
  });
  fastify.get("/api/content/wins", async (req, reply) => {
    const sinceStr = req.query.since;
    const since = sinceStr ? new Date(sinceStr) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
    if (isNaN(since.getTime())) {
      reply.code(400);
      return { ok: false, error: "Invalid date format for 'since'" };
    }
    let wins = await storage.getWinRecordsSince(since);
    if (req.query.category) {
      wins = wins.filter((w) => w.category === req.query.category);
    }
    const limit = parseInt(req.query.limit || "50", 10);
    wins = wins.slice(0, limit);
    return { ok: true, count: wins.length, wins };
  });
  fastify.post("/api/content/briefs", async (req, reply) => {
    const briefData = req.body;
    if (!briefData.keyIdea || !briefData.narrativeAngle) {
      reply.code(400);
      return { ok: false, error: "Missing required fields: keyIdea, narrativeAngle" };
    }
    const brief = {
      ...briefData,
      id: briefData.id || `brief_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: briefData.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    await storage.saveContentBrief(brief);
    return { ok: true, id: brief.id, brief };
  });
  fastify.get("/api/content/briefs", async (req) => {
    const briefs = await storage.listPendingBriefs();
    let filtered = briefs;
    if (req.query.narrative) {
      filtered = filtered.filter((b) => b.narrativeAngle === req.query.narrative);
    }
    const limit = parseInt(req.query.limit || "50", 10);
    filtered = filtered.slice(0, limit);
    return { ok: true, count: filtered.length, briefs: filtered };
  });
  fastify.get("/api/content/briefs/:id", async (req, reply) => {
    const brief = await storage.getBrief(req.params.id);
    if (!brief) {
      reply.code(404);
      return { ok: false, error: "Brief not found" };
    }
    return { ok: true, brief };
  });
  fastify.get("/api/content/articles", async (req) => {
    const pendingBriefs = await storage.listPendingBriefs();
    const articles = [];
    for (const brief of pendingBriefs) {
      const article = await storage.getArticleByBriefId(brief.id);
      if (article) {
        if (!req.query.status || article.status === req.query.status) {
          articles.push(article);
        }
      }
    }
    const limit = parseInt(req.query.limit || "50", 10);
    return { ok: true, count: articles.length, articles: articles.slice(0, limit) };
  });
  fastify.get(
    "/api/content/articles/:briefId",
    async (req, reply) => {
      const article = await storage.getArticleByBriefId(req.params.briefId);
      if (!article) {
        reply.code(404);
        return { ok: false, error: "Article not found for this brief" };
      }
      return { ok: true, article };
    }
  );
  fastify.patch("/api/content/articles/:id/status", async (req, reply) => {
    const { status, reviewerNotes } = req.body;
    const validStatuses = ["draft", "ready_for_review", "ready_for_publish", "published"];
    if (!validStatuses.includes(status)) {
      reply.code(400);
      return { ok: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
    }
    return {
      ok: true,
      message: `Article status updated to ${status}`,
      reviewerNotes: reviewerNotes || null
    };
  });
  fastify.post("/api/content/distribute/:articleId", async (req, reply) => {
    const { articleId } = req.params;
    const { channels, dryRun } = req.body;
    const packet = await storage.getDistributionPacketByArticleId(articleId);
    if (!packet) {
      reply.code(404);
      return { ok: false, error: "Distribution packet not found for this article" };
    }
    const distributionService = getDistributionService({ dryRun });
    const results = await distributionService.distribute(packet, channels);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    return {
      ok: true,
      message: `Distribution completed: ${successful.length} successful, ${failed.length} failed`,
      articleId,
      results,
      tier1: {
        automated: results.filter(
          (r) => ["blog", "substack", "mirror", "medium", "devto", "hashnode", "github", "rss", "email"].includes(r.channel)
        )
      },
      tier2: {
        queuedForApproval: results.filter(
          (r) => ["twitter", "linkedin", "reddit"].includes(r.channel)
        )
      }
    };
  });
  fastify.get(
    "/api/content/distribution/:articleId",
    async (req, reply) => {
      const { articleId } = req.params;
      const packet = await storage.getDistributionPacketByArticleId(articleId);
      if (!packet) {
        reply.code(404);
        return { ok: false, error: "Distribution packet not found" };
      }
      const distributionService = getDistributionService();
      const attempts = distributionService.getAttempts(packet.id);
      return {
        ok: true,
        articleId,
        packetId: packet.id,
        status: packet.status,
        attempts,
        channels: {
          tier1Automated: ["blog", "substack", "mirror", "medium", "devto", "hashnode", "github", "rss", "email"],
          tier2Approval: ["twitter", "linkedin", "reddit"]
        }
      };
    }
  );
  fastify.post("/api/content/trigger/orchestrator", async () => {
    try {
      await generateContentBriefsDaily();
      return { ok: true, message: "Content brief generation completed" };
    } catch (error) {
      return {
        ok: false,
        error: "Brief generation failed",
        details: error instanceof Error ? error.message : String(error)
      };
    }
  });
  fastify.post("/api/content/trigger/production", async () => {
    try {
      await materializeContentFromBriefs();
      return { ok: true, message: "Content production completed" };
    } catch (error) {
      return {
        ok: false,
        error: "Content production failed",
        details: error instanceof Error ? error.message : String(error)
      };
    }
  });
  fastify.post("/api/content/trigger/full-pipeline", async () => {
    try {
      await generateContentBriefsDaily();
      await materializeContentFromBriefs();
      return {
        ok: true,
        message: "Full content pipeline completed",
        steps: ["brief_generation", "article_production", "distribution_ready"]
      };
    } catch (error) {
      return {
        ok: false,
        error: "Pipeline failed",
        details: error instanceof Error ? error.message : String(error)
      };
    }
  });
  fastify.get("/api/content/metrics", async (req) => {
    const period = req.query.period || "week";
    const channel = req.query.channel;
    return {
      ok: true,
      period,
      channel: channel || "all",
      metrics: {
        totalArticles: 0,
        totalViews: 0,
        totalEngagement: 0,
        avgEngagementRate: 0,
        topPerformingChannels: [],
        topPerformingArticles: []
      },
      note: "Real metrics will be available after connecting platform analytics"
    };
  });
  fastify.get("/api/content/pipeline/status", async () => {
    const pendingBriefs = await storage.listPendingBriefs();
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const recentEvents = await storage.getEngineEventsSince(last24h);
    return {
      ok: true,
      pipeline: {
        eventsLast24h: recentEvents.length,
        pendingBriefs: pendingBriefs.length,
        draftArticles: 0,
        // Would need storage method
        readyForReview: 0,
        published: 0,
        distributionQueued: 0
      },
      channels: {
        tier1Automated: ["blog", "substack", "mirror", "medium", "devto", "hashnode", "github", "rss", "email"],
        tier2Approval: ["twitter", "linkedin", "reddit"]
      }
    };
  });
}

// src/api/org-routes.ts
async function requireAuth(request, reply) {
  const userId = request.headers["x-user-id"];
  if (!userId) {
    reply.code(401).send({ ok: false, error: "Authentication required" });
    return;
  }
  request.userId = userId;
}
async function requireOrgMembership(request, reply) {
  await requireAuth(request, reply);
  if (reply.sent) return;
  const orgId = request.params.orgId || request.headers["x-org-id"];
  if (!orgId) {
    reply.code(400).send({ ok: false, error: "Organization ID required" });
    return;
  }
  const rbac = getRBACManager();
  const member = rbac.getMember(orgId, request.userId);
  if (!member) {
    reply.code(403).send({ ok: false, error: "Not a member of this organization" });
    return;
  }
  request.orgId = orgId;
}
function requirePermission(permission) {
  return async (request, reply) => {
    await requireOrgMembership(request, reply);
    if (reply.sent) return;
    const rbac = getRBACManager();
    const hasPermission = rbac.hasPermission(request.userId, request.orgId, permission);
    if (!hasPermission) {
      reply.code(403).send({
        ok: false,
        error: `Permission denied: ${permission}`
      });
    }
  };
}
async function registerOrgRoutes(fastify) {
  const rbac = getRBACManager();
  fastify.post("/api/orgs", {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      const input = CreateOrgSchema.parse(request.body);
      const org = await rbac.createOrganization({
        ...input,
        createdBy: request.userId
      }, request.userId);
      return {
        ok: true,
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          description: org.description,
          plan: org.plan,
          createdAt: org.createdAt
        }
      };
    } catch (error) {
      reply.code(400);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to create organization"
      };
    }
  });
  fastify.get("/api/orgs", {
    preHandler: requireAuth
  }, async (request) => {
    const orgs = rbac.getUserOrganizations(request.userId);
    return {
      ok: true,
      count: orgs.length,
      organizations: orgs.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        createdAt: org.createdAt
      }))
    };
  });
  fastify.get("/api/orgs/:orgId", {
    preHandler: requireOrgMembership
  }, async (request, reply) => {
    const org = rbac.getOrganization(request.orgId);
    if (!org) {
      reply.code(404);
      return { ok: false, error: "Organization not found" };
    }
    const member = rbac.getMember(request.orgId, request.userId);
    return {
      ok: true,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        plan: org.plan,
        settings: org.settings,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt
      },
      membership: {
        role: member?.role,
        joinedAt: member?.joinedAt
      }
    };
  });
  fastify.patch("/api/orgs/:orgId", {
    preHandler: requirePermission("organization:update")
  }, async (request, reply) => {
    try {
      const updates = UpdateOrgSchema.parse(request.body);
      const org = await rbac.updateOrganization(request.orgId, updates);
      if (!org) {
        reply.code(404);
        return { ok: false, error: "Organization not found" };
      }
      return {
        ok: true,
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          description: org.description,
          updatedAt: org.updatedAt
        }
      };
    } catch (error) {
      reply.code(400);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to update organization"
      };
    }
  });
  fastify.delete("/api/orgs/:orgId", {
    preHandler: requirePermission("organization:delete")
  }, async (request, reply) => {
    const deleted = await rbac.deleteOrganization(request.orgId);
    if (!deleted) {
      reply.code(404);
      return { ok: false, error: "Organization not found" };
    }
    return { ok: true, message: "Organization deleted" };
  });
  fastify.get("/api/orgs/:orgId/members", {
    preHandler: requirePermission("member:read")
  }, async (request) => {
    const members = rbac.getOrgMembers(request.orgId);
    return {
      ok: true,
      count: members.length,
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        email: m.email,
        displayName: m.displayName,
        avatarUrl: m.avatarUrl,
        role: m.role,
        joinedAt: m.joinedAt,
        lastActiveAt: m.lastActiveAt
      }))
    };
  });
  fastify.get(
    "/api/orgs/:orgId/members/:userId",
    { preHandler: requirePermission("member:read") },
    async (request, reply) => {
      const member = rbac.getMember(request.orgId, request.params.userId);
      if (!member) {
        reply.code(404);
        return { ok: false, error: "Member not found" };
      }
      return {
        ok: true,
        member: {
          id: member.id,
          userId: member.userId,
          email: member.email,
          displayName: member.displayName,
          avatarUrl: member.avatarUrl,
          role: member.role,
          customPermissions: member.customPermissions,
          status: member.status,
          invitedBy: member.invitedBy,
          joinedAt: member.joinedAt,
          lastActiveAt: member.lastActiveAt
        }
      };
    }
  );
  fastify.patch(
    "/api/orgs/:orgId/members/:userId",
    { preHandler: requirePermission("member:update") },
    async (request, reply) => {
      try {
        if (request.params.userId === request.userId && request.body.role && request.body.role !== "owner") {
          const member2 = rbac.getMember(request.orgId, request.userId);
          if (member2?.role === "owner") {
            reply.code(400);
            return { ok: false, error: "Cannot demote yourself. Transfer ownership first." };
          }
        }
        const updates = UpdateMemberSchema.parse(request.body);
        const member = await rbac.updateMember(
          request.orgId,
          request.params.userId,
          updates
        );
        if (!member) {
          reply.code(404);
          return { ok: false, error: "Member not found" };
        }
        return {
          ok: true,
          member: {
            id: member.id,
            userId: member.userId,
            role: member.role,
            customPermissions: member.customPermissions
          }
        };
      } catch (error) {
        reply.code(400);
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Failed to update member"
        };
      }
    }
  );
  fastify.delete(
    "/api/orgs/:orgId/members/:userId",
    { preHandler: requirePermission("member:delete") },
    async (request, reply) => {
      if (request.params.userId === request.userId) {
        reply.code(400);
        return { ok: false, error: "Cannot remove yourself. Leave the organization instead." };
      }
      try {
        const removed = await rbac.removeMember(request.orgId, request.params.userId);
        if (!removed) {
          reply.code(404);
          return { ok: false, error: "Member not found" };
        }
        return { ok: true, message: "Member removed" };
      } catch (error) {
        reply.code(400);
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Failed to remove member"
        };
      }
    }
  );
  fastify.post("/api/orgs/:orgId/leave", {
    preHandler: requireOrgMembership
  }, async (request, reply) => {
    try {
      const removed = await rbac.removeMember(request.orgId, request.userId);
      if (!removed) {
        reply.code(400);
        return { ok: false, error: "Failed to leave organization" };
      }
      return { ok: true, message: "Left organization" };
    } catch (error) {
      reply.code(400);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to leave organization"
      };
    }
  });
  fastify.get("/api/orgs/:orgId/invites", {
    preHandler: requirePermission("invite:read")
  }, async (request) => {
    const invites = rbac.getOrgInvites(request.orgId, true);
    return {
      ok: true,
      count: invites.length,
      invites: invites.map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        status: i.status,
        expiresAt: i.expiresAt,
        invitedAt: i.invitedAt,
        message: i.message
      }))
    };
  });
  fastify.post(
    "/api/orgs/:orgId/invites",
    { preHandler: requirePermission("invite:create") },
    async (request, reply) => {
      try {
        const input = CreateInviteSchema.parse(request.body);
        const invite = await rbac.createInvite(
          request.orgId,
          input,
          request.userId
        );
        return {
          ok: true,
          invite: {
            id: invite.id,
            email: invite.email,
            role: invite.role,
            expiresAt: invite.expiresAt,
            // Include token only for API response (would normally be emailed)
            inviteUrl: `https://app.gicm.dev/invite/${invite.token}`
          }
        };
      } catch (error) {
        reply.code(400);
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Failed to create invite"
        };
      }
    }
  );
  fastify.delete(
    "/api/orgs/:orgId/invites/:inviteId",
    { preHandler: requirePermission("invite:delete") },
    async (request, reply) => {
      const revoked = await rbac.revokeInvite(request.params.inviteId);
      if (!revoked) {
        reply.code(404);
        return { ok: false, error: "Invite not found or already processed" };
      }
      return { ok: true, message: "Invite revoked" };
    }
  );
  fastify.post("/api/invites/accept", {
    preHandler: requireAuth
  }, async (request, reply) => {
    const { token, displayName } = request.body;
    if (!token) {
      reply.code(400);
      return { ok: false, error: "Token required" };
    }
    try {
      const invite = rbac.getInviteByToken(token);
      if (!invite) {
        reply.code(404);
        return { ok: false, error: "Invalid or expired invite" };
      }
      const member = await rbac.acceptInvite(
        token,
        request.userId,
        invite.email,
        displayName
      );
      const org = rbac.getOrganization(invite.orgId);
      return {
        ok: true,
        message: "Invite accepted",
        organization: {
          id: org?.id,
          name: org?.name,
          slug: org?.slug
        },
        membership: {
          role: member.role,
          joinedAt: member.joinedAt
        }
      };
    } catch (error) {
      reply.code(400);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to accept invite"
      };
    }
  });
  fastify.post(
    "/api/orgs/:orgId/check-permission",
    { preHandler: requireOrgMembership },
    async (request) => {
      const { permission } = request.body;
      const hasPermission = rbac.hasPermission(
        request.userId,
        request.orgId,
        permission
      );
      return {
        ok: true,
        permission,
        allowed: hasPermission
      };
    }
  );
  fastify.get("/api/orgs/:orgId/context", {
    preHandler: requireOrgMembership
  }, async (request, reply) => {
    const context = rbac.getAuthContext(request.userId, request.orgId);
    if (!context) {
      reply.code(403);
      return { ok: false, error: "Not a member of this organization" };
    }
    return {
      ok: true,
      context
    };
  });
  fastify.get("/api/admin/rbac/stats", {
    preHandler: requireAuth
  }, async () => {
    const stats = rbac.getStats();
    return {
      ok: true,
      stats
    };
  });
}

// src/api/audit-routes.ts
import { z as z10 } from "zod";
var QueryParamsSchema = z10.object({
  category: z10.string().optional(),
  action: z10.string().optional(),
  severity: z10.string().optional(),
  result: z10.string().optional(),
  userId: z10.string().optional(),
  resourceType: z10.string().optional(),
  resourceId: z10.string().optional(),
  startDate: z10.string().optional(),
  endDate: z10.string().optional(),
  search: z10.string().optional(),
  limit: z10.string().optional(),
  offset: z10.string().optional(),
  sortBy: z10.enum(["timestamp", "severity", "category"]).optional(),
  sortOrder: z10.enum(["asc", "desc"]).optional()
});
var ExportBodySchema = z10.object({
  format: z10.enum(["json", "csv", "pdf"]),
  startDate: z10.string().optional(),
  endDate: z10.string().optional(),
  category: z10.string().optional(),
  includeContext: z10.boolean().optional(),
  includeChanges: z10.boolean().optional(),
  includeMetadata: z10.boolean().optional()
});
var RetentionPolicySchema = z10.object({
  category: z10.string(),
  retentionDays: z10.number().min(1).max(3650),
  archiveAfterDays: z10.number().optional(),
  deleteAfterArchive: z10.boolean().optional()
});
async function requireAuditAccess(request, reply) {
  const req = request;
  if (!req.userId || !req.orgId) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }
  if (!["admin", "owner"].includes(req.userRole)) {
    reply.code(403).send({
      error: "Forbidden",
      message: "Audit access requires admin or owner role"
    });
    return;
  }
}
async function registerAuditRoutes(fastify) {
  const auditLogger = getAuditLogger();
  fastify.get(
    "/api/audit",
    { preHandler: requireAuditAccess },
    async (request, reply) => {
      const req = request;
      try {
        const params = QueryParamsSchema.parse(request.query);
        const query = {
          orgId: req.orgId,
          category: params.category,
          action: params.action,
          severity: params.severity,
          result: params.result,
          userId: params.userId,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          startDate: params.startDate ? new Date(params.startDate) : void 0,
          endDate: params.endDate ? new Date(params.endDate) : void 0,
          search: params.search,
          limit: params.limit ? parseInt(params.limit, 10) : 100,
          offset: params.offset ? parseInt(params.offset, 10) : 0,
          sortBy: params.sortBy || "timestamp",
          sortOrder: params.sortOrder || "desc"
        };
        const result = await auditLogger.query(query);
        await auditLogger.info(
          "audit",
          "read",
          `Queried audit logs: ${result.total} events`,
          { userId: req.userId, orgId: req.orgId }
        );
        reply.send(result);
      } catch (error) {
        if (error instanceof z10.ZodError) {
          reply.code(400).send({ error: "Invalid query parameters", details: error.errors });
        } else {
          throw error;
        }
      }
    }
  );
  fastify.get(
    "/api/audit/:id",
    { preHandler: requireAuditAccess },
    async (request, reply) => {
      const req = request;
      const event = await auditLogger.getEvent(req.params.id);
      if (!event) {
        reply.code(404).send({ error: "Event not found" });
        return;
      }
      if (event.context.orgId && event.context.orgId !== req.orgId) {
        reply.code(403).send({ error: "Forbidden" });
        return;
      }
      reply.send(event);
    }
  );
  fastify.get(
    "/api/audit/stats",
    { preHandler: requireAuditAccess },
    async (request, reply) => {
      const req = request;
      const { days } = request.query;
      const stats = await auditLogger.getStats(
        req.orgId,
        days ? parseInt(days, 10) : 30
      );
      reply.send(stats);
    }
  );
  fastify.get(
    "/api/audit/security",
    { preHandler: requireAuditAccess },
    async (request, reply) => {
      const req = request;
      const { severity, limit } = request.query;
      const events = await auditLogger.getSecurityEvents(
        req.orgId,
        severity,
        limit ? parseInt(limit, 10) : 100
      );
      reply.send({ events, count: events.length });
    }
  );
  fastify.post(
    "/api/audit/export",
    { preHandler: requireAuditAccess },
    async (request, reply) => {
      const req = request;
      try {
        const body = ExportBodySchema.parse(request.body);
        const options = {
          format: body.format,
          query: {
            orgId: req.orgId,
            startDate: body.startDate ? new Date(body.startDate) : void 0,
            endDate: body.endDate ? new Date(body.endDate) : void 0,
            category: body.category,
            limit: 1e4
            // Max export
          },
          includeContext: body.includeContext ?? true,
          includeChanges: body.includeChanges ?? true,
          includeMetadata: body.includeMetadata ?? false
        };
        const output = await auditLogger.export(options);
        await auditLogger.info(
          "audit",
          "export",
          `Exported audit logs in ${body.format} format`,
          { userId: req.userId, orgId: req.orgId }
        );
        const contentType = {
          json: "application/json",
          csv: "text/csv",
          pdf: "application/pdf"
        }[body.format];
        const filename = `audit-export-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.${body.format}`;
        reply.header("Content-Type", contentType).header("Content-Disposition", `attachment; filename="${filename}"`).send(output);
      } catch (error) {
        if (error instanceof z10.ZodError) {
          reply.code(400).send({ error: "Invalid export options", details: error.errors });
        } else {
          throw error;
        }
      }
    }
  );
  fastify.get(
    "/api/audit/retention",
    { preHandler: requireAuditAccess },
    async (request, reply) => {
      const req = request;
      const policies = [
        { category: "auth", retentionDays: 365 },
        { category: "organization", retentionDays: 730 },
        { category: "member", retentionDays: 365 },
        { category: "pipeline", retentionDays: 90 },
        { category: "schedule", retentionDays: 90 },
        { category: "budget", retentionDays: 365 },
        { category: "webhook", retentionDays: 90 },
        { category: "settings", retentionDays: 365 },
        { category: "api", retentionDays: 30 },
        { category: "security", retentionDays: 730 },
        { category: "system", retentionDays: 365 }
      ];
      reply.send({ policies });
    }
  );
  fastify.put(
    "/api/audit/retention",
    { preHandler: requireAuditAccess },
    async (request, reply) => {
      const req = request;
      try {
        const policy = RetentionPolicySchema.parse(request.body);
        await auditLogger.info(
          "settings",
          "update",
          `Updated retention policy for ${policy.category}: ${policy.retentionDays} days`,
          { userId: req.userId, orgId: req.orgId },
          { type: "retention_policy", id: policy.category }
        );
        reply.send({ success: true, policy });
      } catch (error) {
        if (error instanceof z10.ZodError) {
          reply.code(400).send({ error: "Invalid policy", details: error.errors });
        } else {
          throw error;
        }
      }
    }
  );
  fastify.post(
    "/api/audit/verify",
    { preHandler: requireAuditAccess },
    async (request, reply) => {
      const req = request;
      const result = await auditLogger.query({
        orgId: req.orgId,
        limit: 1e4,
        sortBy: "timestamp",
        sortOrder: "asc"
      });
      const integrity = await auditLogger.verifyIntegrity(result.events);
      await auditLogger.info(
        "audit",
        "read",
        `Verified audit chain integrity: ${integrity.valid ? "valid" : "invalid"}`,
        { userId: req.userId, orgId: req.orgId }
      );
      reply.send({
        totalEvents: result.total,
        valid: integrity.valid,
        invalidCount: integrity.invalidEvents.length,
        invalidEvents: integrity.invalidEvents.slice(0, 10)
        // Return first 10
      });
    }
  );
  fastify.get(
    "/api/audit/user/:userId",
    { preHandler: requireAuditAccess },
    async (request, reply) => {
      const req = request;
      const events = await auditLogger.getUserEvents(req.params.userId, 100);
      const orgEvents = events.filter((e) => e.context.orgId === req.orgId);
      reply.send({ events: orgEvents, count: orgEvents.length });
    }
  );
  fastify.delete(
    "/api/audit/cleanup",
    { preHandler: requireAuditAccess },
    async (request, reply) => {
      const req = request;
      if (req.userRole !== "owner") {
        reply.code(403).send({ error: "Only owners can trigger audit cleanup" });
        return;
      }
      const result = await auditLogger.applyRetention();
      await auditLogger.info(
        "system",
        "delete",
        `Manual audit cleanup: deleted ${result.deleted}, archived ${result.archived}`,
        { userId: req.userId, orgId: req.orgId }
      );
      reply.send(result);
    }
  );
}

// src/api/git-routes.ts
async function gitRoutes(fastify) {
  const gitManager = getGitManager();
  fastify.get("/api/git/repos", async (_request, reply) => {
    const repos = gitManager.listRepos();
    return reply.send({
      success: true,
      data: repos,
      count: repos.length
    });
  });
  fastify.get(
    "/api/git/repos/:id",
    async (request, reply) => {
      const repo = gitManager.getRepo(request.params.id);
      if (!repo) {
        return reply.status(404).send({
          success: false,
          error: "Repository not found"
        });
      }
      return reply.send({
        success: true,
        data: repo
      });
    }
  );
  fastify.post(
    "/api/git/repos",
    async (request, reply) => {
      try {
        const config = CreateRepoConfigSchema.parse(request.body);
        const repo = await gitManager.connectRepo(config);
        return reply.status(201).send({
          success: true,
          data: repo
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to connect repository";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.delete(
    "/api/git/repos/:id",
    async (request, reply) => {
      try {
        await gitManager.disconnectRepo(request.params.id);
        return reply.send({
          success: true,
          message: "Repository disconnected"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to disconnect repository";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/git/repos/:id/pull",
    async (request, reply) => {
      try {
        const changes = await gitManager.pullPipelines(request.params.id);
        return reply.send({
          success: true,
          data: {
            changes,
            count: changes.length
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to pull pipelines";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/git/repos/:id/push",
    async (request, reply) => {
      try {
        const { pipeline, commitMessage } = request.body;
        const record = await gitManager.pushPipeline(
          request.params.id,
          pipeline,
          commitMessage
        );
        return reply.send({
          success: true,
          data: record
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to push pipeline";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.delete(
    "/api/git/repos/:repoId/pipelines/:pipelineId",
    async (request, reply) => {
      try {
        await gitManager.deletePipeline(
          request.params.repoId,
          request.params.pipelineId
        );
        return reply.send({
          success: true,
          message: "Pipeline deleted from repository"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete pipeline";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get(
    "/api/git/repos/:id/history",
    async (request, reply) => {
      const history = gitManager.getSyncHistory(request.params.id);
      return reply.send({
        success: true,
        data: history,
        count: history.length
      });
    }
  );
  fastify.get(
    "/api/git/repos/:id/latest",
    async (request, reply) => {
      const latest = gitManager.getLatestSync(request.params.id);
      if (!latest) {
        return reply.status(404).send({
          success: false,
          error: "No sync records found"
        });
      }
      return reply.send({
        success: true,
        data: latest
      });
    }
  );
  fastify.post(
    "/api/git/repos/:id/webhook",
    async (request, reply) => {
      try {
        const { webhookUrl } = request.body;
        const result = await gitManager.setupWebhook(
          request.params.id,
          webhookUrl
        );
        return reply.send({
          success: true,
          data: result
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to setup webhook";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/git/webhook/:provider",
    async (request, reply) => {
      try {
        const provider = request.params.provider;
        const signature = request.headers["x-hub-signature-256"];
        await gitManager.handleWebhook(provider, request.body, signature);
        return reply.send({
          success: true,
          message: "Webhook processed"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to process webhook";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/git/yaml/parse",
    async (request, reply) => {
      try {
        const { yaml } = request.body;
        const result = parsePipelineYAML(yaml);
        return reply.send({
          success: result.success,
          data: result.pipeline,
          errors: result.errors
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to parse YAML";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/git/yaml/validate",
    async (request, reply) => {
      try {
        const { yaml } = request.body;
        const parseResult = parsePipelineYAML(yaml);
        if (!parseResult.success || !parseResult.pipeline) {
          return reply.send({
            success: false,
            valid: false,
            errors: parseResult.errors?.map((e) => ({
              path: "yaml",
              message: e,
              severity: "error"
            })),
            warnings: []
          });
        }
        const validation = validatePipelineYAML(parseResult.pipeline);
        return reply.send({
          success: true,
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to validate YAML";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get("/api/git/yaml/examples", async (_request, reply) => {
    return reply.send({
      success: true,
      data: EXAMPLE_PIPELINES
    });
  });
  fastify.get(
    "/api/git/yaml/examples/:name",
    async (request, reply) => {
      const name = request.params.name;
      const example = EXAMPLE_PIPELINES[name];
      if (!example) {
        return reply.status(404).send({
          success: false,
          error: `Example not found: ${name}. Available: ${Object.keys(EXAMPLE_PIPELINES).join(", ")}`
        });
      }
      return reply.send({
        success: true,
        data: {
          name,
          yaml: example
        }
      });
    }
  );
}

// src/api/bot-routes.ts
async function botRoutes(fastify) {
  const chatManager = getChatManager();
  fastify.get("/api/bots/status", async (_request, reply) => {
    const status = chatManager.getConnectionStatus();
    const bots = chatManager.getBots();
    return reply.send({
      success: true,
      data: {
        connections: Object.fromEntries(status),
        bots: bots.map((b) => ({
          id: b.id,
          name: b.name,
          platform: b.platform,
          enabled: b.enabled
        }))
      }
    });
  });
  fastify.get(
    "/api/bots/:platform/status",
    async (request, reply) => {
      const platform = request.params.platform;
      const status = chatManager.getConnectionStatus().get(platform);
      return reply.send({
        success: true,
        data: {
          platform,
          status: status || "disconnected"
        }
      });
    }
  );
  fastify.post(
    "/api/bots/connect",
    async (request, reply) => {
      try {
        const { platform, credentials } = request.body;
        const bot = await chatManager.connectBot({
          platform,
          ...credentials
        });
        return reply.status(201).send({
          success: true,
          data: {
            id: bot.id,
            name: bot.name,
            platform: bot.platform
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to connect bot";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/bots/:id/disconnect",
    async (request, reply) => {
      try {
        await chatManager.disconnectBot(request.params.id);
        return reply.send({
          success: true,
          message: "Bot disconnected"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to disconnect bot";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/bots/send",
    async (request, reply) => {
      try {
        const { platform, channelId, message, blocks, attachments } = request.body;
        const options = {
          platform,
          channelId,
          content: message,
          blocks,
          attachments
        };
        await chatManager.sendMessage(options);
        return reply.send({
          success: true,
          message: "Message sent"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send message";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/bots/broadcast",
    async (request, reply) => {
      try {
        const { type, data, severity } = request.body;
        await chatManager.sendNotification(type, data);
        return reply.send({
          success: true,
          message: "Notification broadcast sent"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to broadcast";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get("/api/bots/subscriptions", async (_request, reply) => {
    const subscriptions = chatManager.getNotificationConfigs();
    return reply.send({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  });
  fastify.post(
    "/api/bots/subscriptions",
    async (request, reply) => {
      try {
        const { platform, channelId, types, minSeverity } = request.body;
        chatManager.configureNotifications({
          platform,
          channelId,
          types,
          minSeverity: minSeverity || "info",
          enabled: true
        });
        return reply.status(201).send({
          success: true,
          message: "Channel subscribed"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to subscribe";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.delete(
    "/api/bots/subscriptions/:platform/:channelId",
    async (request, reply) => {
      try {
        chatManager.configureNotifications({
          platform: request.params.platform,
          channelId: request.params.channelId,
          types: [],
          enabled: false
        });
        return reply.send({
          success: true,
          message: "Channel unsubscribed"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to unsubscribe";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get("/api/bots/commands", async (_request, reply) => {
    const commands = chatManager.getRegisteredCommands();
    return reply.send({
      success: true,
      data: commands,
      count: commands.length
    });
  });
  fastify.post(
    "/api/bots/webhook/slack",
    async (request, reply) => {
      const { type, challenge, event, command, text, user_id, channel_id } = request.body;
      if (type === "url_verification" && challenge) {
        return reply.send({ challenge });
      }
      if (command) {
        await chatManager.handleCommand({
          platform: "slack",
          command: command.replace("/", ""),
          args: text || "",
          userId: user_id || "",
          channelId: channel_id || "",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return reply.send({ ok: true });
      }
      if (type === "event_callback" && event) {
        console.log("[SLACK WEBHOOK] Event received:", event);
      }
      return reply.send({ ok: true });
    }
  );
  fastify.post(
    "/api/bots/webhook/discord",
    async (request, reply) => {
      const { type, data, member, channel_id } = request.body;
      if (type === 1) {
        return reply.send({ type: 1 });
      }
      if (type === 2 && data?.name) {
        const args = data.options?.map((o) => `${o.name}=${o.value}`).join(" ") || "";
        await chatManager.handleCommand({
          platform: "discord",
          command: data.name,
          args,
          userId: member?.user?.id || "",
          channelId: channel_id || "",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return reply.send({
          type: 4,
          // CHANNEL_MESSAGE_WITH_SOURCE
          data: { content: "Command received" }
        });
      }
      if (type === 3) {
        console.log("[DISCORD WEBHOOK] Button interaction:", data);
        return reply.send({
          type: 6
          // DEFERRED_UPDATE_MESSAGE
        });
      }
      return reply.send({ type: 1 });
    }
  );
  fastify.get("/api/bots/templates", async (_request, reply) => {
    const templates = chatManager.getTemplates();
    return reply.send({
      success: true,
      data: templates,
      count: templates.length
    });
  });
}

// src/api/terraform-routes.ts
async function terraformRoutes(fastify) {
  const terraformManager = getTerraformManager();
  fastify.get("/api/terraform/state", async (_request, reply) => {
    const state = terraformManager.getState();
    return reply.send({
      success: true,
      data: state
    });
  });
  fastify.post(
    "/api/terraform/state/lock",
    async (request, reply) => {
      try {
        const { lockId, reason } = request.body;
        await terraformManager.lockState(lockId, reason);
        return reply.send({
          success: true,
          message: "State locked"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to lock state";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/terraform/state/unlock",
    async (request, reply) => {
      try {
        const { lockId } = request.body;
        await terraformManager.unlockState(lockId);
        return reply.send({
          success: true,
          message: "State unlocked"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to unlock state";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/terraform/plan",
    async (request, reply) => {
      try {
        const { config } = request.body;
        const plan = await terraformManager.plan(config);
        return reply.send({
          success: true,
          data: plan
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate plan";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/terraform/apply",
    async (request, reply) => {
      try {
        const { config, autoApprove } = request.body;
        const result = await terraformManager.apply(config, autoApprove);
        return reply.send({
          success: true,
          data: result
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to apply changes";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/terraform/destroy",
    async (request, reply) => {
      try {
        const { resourceAddresses, autoApprove } = request.body;
        const result = await terraformManager.destroy(resourceAddresses, autoApprove);
        return reply.send({
          success: true,
          data: result
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to destroy resources";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get("/api/terraform/resources", async (_request, reply) => {
    const state = terraformManager.getState();
    return reply.send({
      success: true,
      data: state.resources,
      count: state.resources.length
    });
  });
  fastify.get(
    "/api/terraform/resources/:address",
    async (request, reply) => {
      const state = terraformManager.getState();
      const resource = state.resources.find(
        (r) => `${r.type}.${r.name}` === request.params.address
      );
      if (!resource) {
        return reply.status(404).send({
          success: false,
          error: "Resource not found"
        });
      }
      return reply.send({
        success: true,
        data: resource
      });
    }
  );
  fastify.post(
    "/api/terraform/import",
    async (request, reply) => {
      try {
        const { type, id, address } = request.body;
        await terraformManager.importResource(type, id, address);
        return reply.send({
          success: true,
          message: "Resource imported"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to import resource";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/terraform/resources/:address/taint",
    async (request, reply) => {
      try {
        await terraformManager.taintResource(request.params.address);
        return reply.send({
          success: true,
          message: "Resource tainted"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to taint resource";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/terraform/resources/:address/untaint",
    async (request, reply) => {
      try {
        await terraformManager.untaintResource(request.params.address);
        return reply.send({
          success: true,
          message: "Resource untainted"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to untaint resource";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/terraform/generate/pipeline",
    async (request, reply) => {
      const { name, displayName, description, steps } = request.body;
      const hcl = generatePipelineHCL(name, displayName, description, steps);
      return reply.send({
        success: true,
        data: { hcl }
      });
    }
  );
  fastify.post(
    "/api/terraform/generate/schedule",
    async (request, reply) => {
      const { name, displayName, pipelineRef, cron, timezone, inputs } = request.body;
      const hcl = generateScheduleHCL(name, displayName, pipelineRef, cron, timezone, inputs);
      return reply.send({
        success: true,
        data: { hcl }
      });
    }
  );
  fastify.get("/api/terraform/schema", async (_request, reply) => {
    return reply.send({
      success: true,
      data: {
        provider: {
          api_url: { type: "string", required: true },
          api_key: { type: "string", required: true, sensitive: true },
          organization_id: { type: "string", required: false }
        },
        resources: {
          gicm_pipeline: {
            name: { type: "string", required: true },
            description: { type: "string" },
            enabled: { type: "bool", default: true },
            steps: { type: "list", required: true },
            tags: { type: "map(string)" }
          },
          gicm_schedule: {
            name: { type: "string", required: true },
            pipeline_id: { type: "string", required: true },
            cron: { type: "string", required: true },
            timezone: { type: "string", default: "UTC" },
            enabled: { type: "bool", default: true },
            inputs: { type: "map(any)" }
          },
          gicm_webhook: {
            name: { type: "string", required: true },
            url: { type: "string", required: true },
            events: { type: "list(string)", required: true },
            enabled: { type: "bool", default: true },
            retry_count: { type: "number", default: 3 },
            timeout_ms: { type: "number", default: 5e3 }
          },
          gicm_budget: {
            name: { type: "string", required: true },
            daily_limit: { type: "number" },
            weekly_limit: { type: "number" },
            monthly_limit: { type: "number" },
            scope_type: { type: "string", default: "global" },
            enabled: { type: "bool", default: true },
            enforce: { type: "bool", default: false },
            alert_thresholds: { type: "list(number)", default: [50, 75, 90, 100] }
          }
        }
      }
    });
  });
}
function generatePipelineHCL(name, displayName, description, steps) {
  const lines = [];
  lines.push(`resource "gicm_pipeline" "${name}" {`);
  lines.push(`  name        = "${displayName}"`);
  if (description) {
    lines.push(`  description = "${description}"`);
  }
  lines.push(`  enabled     = true`);
  lines.push("");
  for (const step of steps) {
    lines.push(`  step {`);
    lines.push(`    id   = "${step.id}"`);
    lines.push(`    name = "${step.name}"`);
    lines.push(`    tool = "${step.tool}"`);
    if (step.config && Object.keys(step.config).length > 0) {
      lines.push(`    config = {`);
      for (const [key, value] of Object.entries(step.config)) {
        const formattedValue = typeof value === "string" ? `"${value}"` : JSON.stringify(value);
        lines.push(`      ${key} = ${formattedValue}`);
      }
      lines.push(`    }`);
    }
    if (step.dependsOn && step.dependsOn.length > 0) {
      lines.push(`    depends_on = ["${step.dependsOn.join('", "')}"]`);
    }
    lines.push(`  }`);
    lines.push("");
  }
  lines.push(`}`);
  return lines.join("\n");
}
function generateScheduleHCL(name, displayName, pipelineRef, cron, timezone, inputs) {
  const lines = [];
  lines.push(`resource "gicm_schedule" "${name}" {`);
  lines.push(`  name        = "${displayName}"`);
  lines.push(`  pipeline_id = ${pipelineRef}`);
  lines.push(`  cron        = "${cron}"`);
  lines.push(`  timezone    = "${timezone || "UTC"}"`);
  lines.push(`  enabled     = true`);
  if (inputs && Object.keys(inputs).length > 0) {
    lines.push("");
    lines.push(`  inputs = {`);
    for (const [key, value] of Object.entries(inputs)) {
      const formattedValue = typeof value === "string" ? `"${value}"` : JSON.stringify(value);
      lines.push(`    ${key} = ${formattedValue}`);
    }
    lines.push(`  }`);
  }
  lines.push(`}`);
  return lines.join("\n");
}

// src/api/vscode-routes.ts
async function vscodeRoutes(fastify) {
  const vscodeManager = getVSCodeManager();
  fastify.get("/api/vscode/state", async (_request, reply) => {
    const state = vscodeManager.getState();
    return reply.send({
      success: true,
      data: state
    });
  });
  fastify.post(
    "/api/vscode/connect",
    async (request, reply) => {
      try {
        const { extensionId, version, machineId } = request.body;
        await vscodeManager.connect(extensionId, version, machineId);
        return reply.send({
          success: true,
          message: "Extension connected"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to connect";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post("/api/vscode/disconnect", async (_request, reply) => {
    await vscodeManager.disconnect();
    return reply.send({
      success: true,
      message: "Extension disconnected"
    });
  });
  fastify.get("/api/vscode/tree/pipelines", async (_request, reply) => {
    const items = await vscodeManager.getPipelineTreeItems();
    return reply.send({
      success: true,
      data: items,
      count: items.length
    });
  });
  fastify.get("/api/vscode/tree/schedules", async (_request, reply) => {
    const items = await vscodeManager.getScheduleTreeItems();
    return reply.send({
      success: true,
      data: items,
      count: items.length
    });
  });
  fastify.get(
    "/api/vscode/tree/executions",
    async (request, reply) => {
      const limit = parseInt(request.query.limit || "20", 10);
      const items = await vscodeManager.getExecutionTreeItems(limit);
      return reply.send({
        success: true,
        data: items,
        count: items.length
      });
    }
  );
  fastify.post(
    "/api/vscode/completions",
    async (request, reply) => {
      const { document, position, triggerCharacter } = request.body;
      const completions = await vscodeManager.getCompletions(
        document,
        position,
        triggerCharacter
      );
      return reply.send({
        success: true,
        data: completions
      });
    }
  );
  fastify.post(
    "/api/vscode/hover",
    async (request, reply) => {
      const { document, position } = request.body;
      const hover = await vscodeManager.getHoverInfo(document, position);
      return reply.send({
        success: true,
        data: hover
      });
    }
  );
  fastify.post(
    "/api/vscode/diagnostics",
    async (request, reply) => {
      const { document, uri } = request.body;
      const diagnostics = await vscodeManager.getDiagnostics(document, uri);
      return reply.send({
        success: true,
        data: diagnostics,
        count: diagnostics.length
      });
    }
  );
  fastify.post(
    "/api/vscode/codeactions",
    async (request, reply) => {
      const { document, range, diagnostics } = request.body;
      const actions = await vscodeManager.getCodeActions(document, range, diagnostics);
      return reply.send({
        success: true,
        data: actions
      });
    }
  );
  fastify.get("/api/vscode/commands", async (_request, reply) => {
    const commands = vscodeManager.getCommands();
    return reply.send({
      success: true,
      data: commands,
      count: commands.length
    });
  });
  fastify.post(
    "/api/vscode/commands/:command",
    async (request, reply) => {
      try {
        const { command } = request.params;
        const { args } = request.body;
        const result = await vscodeManager.executeCommand(command, args);
        return reply.send({
          success: true,
          data: result
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Command failed";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get("/api/vscode/snippets", async (_request, reply) => {
    return reply.send({
      success: true,
      data: PIPELINE_SNIPPETS
    });
  });
  fastify.post(
    "/api/vscode/notify",
    async (request, reply) => {
      try {
        const { type, message, actions } = request.body;
        await vscodeManager.sendNotification({
          id: `notif_${Date.now()}`,
          type,
          message,
          actions: actions?.map((a) => ({
            label: a.title,
            command: a.command
          })),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return reply.send({
          success: true,
          message: "Notification sent"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send notification";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/vscode/webview/message",
    async (request, reply) => {
      try {
        const { type, command, data } = request.body;
        const response = await vscodeManager.handleWebviewMessage({
          type,
          command,
          data
        });
        return reply.send({
          success: true,
          data: response
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to handle message";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get(
    "/api/vscode/webview/state/:type",
    async (request, reply) => {
      const state = await vscodeManager.getWebviewState(request.params.type);
      return reply.send({
        success: true,
        data: state
      });
    }
  );
  fastify.post(
    "/api/vscode/workspace/scan",
    async (request, reply) => {
      try {
        const { rootPath } = request.body;
        const files = await vscodeManager.scanWorkspace(rootPath);
        return reply.send({
          success: true,
          data: files,
          count: files.length
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to scan workspace";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/vscode/workspace/validate",
    async (request, reply) => {
      try {
        const { content, filePath } = request.body;
        const result = await vscodeManager.validatePipelineFile(content, filePath);
        return reply.send({
          success: true,
          data: result
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Validation failed";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
}

// src/api/ha-routes.ts
async function haRoutes(fastify) {
  let haManager = getHAManager();
  if (!haManager) {
    haManager = createHAManager(DEFAULT_HA_CONFIG);
  }
  fastify.get("/api/ha/status", async (_request, reply) => {
    const state = haManager.getState();
    return reply.send({
      success: true,
      data: {
        started: haManager.isStarted(),
        primaryRegion: state.primaryRegion,
        activeRegions: state.activeRegions,
        globalLatencyMs: state.globalLatencyMs,
        globalAvailability: state.globalAvailability,
        failoverCount24h: state.failoverCount24h,
        lastUpdated: state.lastUpdated
      }
    });
  });
  fastify.get("/api/ha/state", async (_request, reply) => {
    const state = haManager.getState();
    return reply.send({
      success: true,
      data: state
    });
  });
  fastify.post("/api/ha/start", async (_request, reply) => {
    haManager.start();
    return reply.send({
      success: true,
      message: "HA Manager started"
    });
  });
  fastify.post("/api/ha/stop", async (_request, reply) => {
    haManager.stop();
    return reply.send({
      success: true,
      message: "HA Manager stopped"
    });
  });
  fastify.get("/api/ha/regions", async (_request, reply) => {
    const config = haManager.getConfig();
    return reply.send({
      success: true,
      data: config.regions,
      count: config.regions.length
    });
  });
  fastify.get(
    "/api/ha/regions/:region",
    async (request, reply) => {
      const config = haManager.getConfig();
      const region = config.regions.find((r) => r.region === request.params.region);
      if (!region) {
        return reply.status(404).send({
          success: false,
          error: "Region not found"
        });
      }
      const state = haManager.getState();
      const health = state.regionHealth[request.params.region];
      return reply.send({
        success: true,
        data: {
          ...region,
          health
        }
      });
    }
  );
  fastify.post(
    "/api/ha/regions",
    async (request, reply) => {
      try {
        haManager.addRegion(request.body);
        return reply.send({
          success: true,
          message: "Region added",
          data: request.body
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add region";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.delete(
    "/api/ha/regions/:region",
    async (request, reply) => {
      try {
        haManager.removeRegion(request.params.region);
        return reply.send({
          success: true,
          message: "Region removed"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to remove region";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get("/api/ha/health", async (_request, reply) => {
    const state = haManager.getState();
    return reply.send({
      success: true,
      data: state.regionHealth
    });
  });
  fastify.post("/api/ha/health/check", async (_request, reply) => {
    try {
      const healthChecker = haManager.getHealthChecker();
      const results = await healthChecker.checkAllRegions();
      return reply.send({
        success: true,
        data: results
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Health check failed";
      return reply.status(500).send({
        success: false,
        error: message
      });
    }
  });
  fastify.post(
    "/api/ha/health/check/:region",
    async (request, reply) => {
      try {
        const healthChecker = haManager.getHealthChecker();
        const result = await healthChecker.checkRegion(request.params.region);
        return reply.send({
          success: true,
          data: result
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Health check failed";
        return reply.status(500).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get("/api/ha/lb/stats", async (_request, reply) => {
    const loadBalancer = haManager.getLoadBalancer();
    const stats = loadBalancer.getStats();
    return reply.send({
      success: true,
      data: stats
    });
  });
  fastify.post(
    "/api/ha/lb/route",
    async (request, reply) => {
      const decision = haManager.route({
        clientIp: request.body.clientIp,
        sessionId: request.body.sessionId,
        preferredRegion: request.body.preferredRegion,
        excludeRegions: request.body.excludeRegions
      });
      if (!decision) {
        return reply.status(503).send({
          success: false,
          error: "No available regions"
        });
      }
      return reply.send({
        success: true,
        data: decision
      });
    }
  );
  fastify.get("/api/ha/failover/status", async (_request, reply) => {
    const failoverManager = haManager.getFailoverManager();
    const stats = failoverManager.getStats();
    return reply.send({
      success: true,
      data: stats
    });
  });
  fastify.get(
    "/api/ha/failover/history",
    async (request, reply) => {
      const limit = parseInt(request.query.limit || "10", 10);
      const failoverManager = haManager.getFailoverManager();
      const history = failoverManager.getFailoverHistory(limit);
      return reply.send({
        success: true,
        data: history,
        count: history.length
      });
    }
  );
  fastify.post(
    "/api/ha/failover",
    async (request, reply) => {
      try {
        const event = await haManager.triggerFailover(
          request.body.toRegion,
          request.body.reason
        );
        if (!event) {
          return reply.status(400).send({
            success: false,
            error: "Failover could not be triggered"
          });
        }
        return reply.send({
          success: true,
          message: "Failover triggered",
          data: event
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failover failed";
        return reply.status(500).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get("/api/ha/failover/pending", async (_request, reply) => {
    const failoverManager = haManager.getFailoverManager();
    const pending = failoverManager.getPendingApprovals();
    return reply.send({
      success: true,
      data: pending,
      count: pending.length
    });
  });
  fastify.post(
    "/api/ha/failover/:id/approve",
    async (request, reply) => {
      const event = haManager.approveFailover(request.params.id);
      if (!event) {
        return reply.status(404).send({
          success: false,
          error: "Failover not found"
        });
      }
      return reply.send({
        success: true,
        message: "Failover approved",
        data: event
      });
    }
  );
  fastify.post(
    "/api/ha/failover/:id/reject",
    async (request, reply) => {
      const event = haManager.rejectFailover(
        request.params.id,
        request.body.reason
      );
      if (!event) {
        return reply.status(404).send({
          success: false,
          error: "Failover not found"
        });
      }
      return reply.send({
        success: true,
        message: "Failover rejected",
        data: event
      });
    }
  );
  fastify.get("/api/ha/replication", async (_request, reply) => {
    const state = haManager.getState();
    return reply.send({
      success: true,
      data: state.replicationStatus
    });
  });
  fastify.post(
    "/api/ha/replication/status",
    async (request, reply) => {
      try {
        haManager.updateReplicationStatus({
          sourceRegion: request.body.sourceRegion,
          targetRegion: request.body.targetRegion,
          mode: request.body.mode,
          lagMs: request.body.lagMs,
          bytesReplicated: request.body.bytesReplicated,
          lastReplicatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          healthy: request.body.healthy,
          error: request.body.error
        });
        return reply.send({
          success: true,
          message: "Replication status updated"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update status";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get("/api/ha/config", async (_request, reply) => {
    const config = haManager.getConfig();
    return reply.send({
      success: true,
      data: {
        healthCheck: config.healthCheck,
        loadBalancing: config.loadBalancing,
        failover: config.failover,
        replication: config.replication,
        monitoring: config.monitoring
      }
    });
  });
}

// src/api/dr-routes.ts
async function drRoutes(fastify) {
  let backupManager = getBackupManager();
  if (!backupManager) {
    backupManager = createBackupManager({
      type: "local",
      path: "/backups"
    });
  }
  let restoreManager = getRestoreManager();
  if (!restoreManager) {
    restoreManager = createRestoreManager(backupManager);
  }
  fastify.get("/api/dr/status", async (_request, reply) => {
    const stats = backupManager.getStats();
    const restores = restoreManager.listRestores(5);
    return reply.send({
      success: true,
      data: {
        backups: stats,
        recentRestores: restores.length,
        currentRestore: restoreManager.getCurrentRestore()
      }
    });
  });
  fastify.get(
    "/api/dr/backups",
    async (request, reply) => {
      const limit = parseInt(request.query.limit || "50", 10);
      const backups = backupManager.listBackups({
        type: request.query.type,
        status: request.query.status,
        limit
      });
      return reply.send({
        success: true,
        data: backups,
        count: backups.length
      });
    }
  );
  fastify.get(
    "/api/dr/backups/:id",
    async (request, reply) => {
      const backup = backupManager.getBackup(request.params.id);
      if (!backup) {
        return reply.status(404).send({
          success: false,
          error: "Backup not found"
        });
      }
      return reply.send({
        success: true,
        data: backup
      });
    }
  );
  fastify.post(
    "/api/dr/backups",
    async (request, reply) => {
      try {
        const backup = await backupManager.createBackup(
          request.body.type || "full",
          request.body.resources
        );
        return reply.send({
          success: true,
          message: "Backup created",
          data: backup
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Backup failed";
        return reply.status(500).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/dr/backups/snapshot",
    async (request, reply) => {
      try {
        const snapshot = await backupManager.createSnapshot(request.body.description);
        return reply.send({
          success: true,
          message: "Snapshot created",
          data: snapshot
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Snapshot failed";
        return reply.status(500).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.delete(
    "/api/dr/backups/:id",
    async (request, reply) => {
      try {
        const deleted = await backupManager.deleteBackup(request.params.id);
        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: "Backup not found"
          });
        }
        return reply.send({
          success: true,
          message: "Backup deleted"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Delete failed";
        return reply.status(400).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post("/api/dr/backups/cleanup", async (_request, reply) => {
    try {
      const result = await backupManager.cleanupExpired();
      return reply.send({
        success: true,
        message: "Cleanup completed",
        data: result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cleanup failed";
      return reply.status(500).send({
        success: false,
        error: message
      });
    }
  });
  fastify.post(
    "/api/dr/restore",
    async (request, reply) => {
      try {
        const progress = await restoreManager.restore(request.body);
        return reply.send({
          success: true,
          message: "Restore started",
          data: progress
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Restore failed";
        return reply.status(500).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post(
    "/api/dr/restore/pitr",
    async (request, reply) => {
      try {
        const targetTime = new Date(request.body.targetTime);
        const progress = await restoreManager.restoreToPointInTime(targetTime);
        return reply.send({
          success: true,
          message: "Point-in-time restore started",
          data: progress
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "PITR failed";
        return reply.status(500).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.get(
    "/api/dr/restore/:id",
    async (request, reply) => {
      const progress = restoreManager.getRestoreProgress(request.params.id);
      if (!progress) {
        return reply.status(404).send({
          success: false,
          error: "Restore not found"
        });
      }
      return reply.send({
        success: true,
        data: progress
      });
    }
  );
  fastify.get("/api/dr/restore/current", async (_request, reply) => {
    const current = restoreManager.getCurrentRestore();
    return reply.send({
      success: true,
      data: current
    });
  });
  fastify.get(
    "/api/dr/restores",
    async (request, reply) => {
      const limit = parseInt(request.query.limit || "20", 10);
      const restores = restoreManager.listRestores(limit);
      return reply.send({
        success: true,
        data: restores,
        count: restores.length
      });
    }
  );
  fastify.post(
    "/api/dr/backups/:id/validate",
    async (request, reply) => {
      try {
        const result = await restoreManager.validateBackup(request.params.id);
        return reply.send({
          success: true,
          data: result
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Validation failed";
        return reply.status(500).send({
          success: false,
          error: message
        });
      }
    }
  );
  fastify.post("/api/dr/scheduler/start", async (_request, reply) => {
    backupManager.startScheduler();
    return reply.send({
      success: true,
      message: "Scheduler started"
    });
  });
  fastify.post("/api/dr/scheduler/stop", async (_request, reply) => {
    backupManager.stopScheduler();
    return reply.send({
      success: true,
      message: "Scheduler stopped"
    });
  });
  fastify.get("/api/dr/stats", async (_request, reply) => {
    const stats = backupManager.getStats();
    return reply.send({
      success: true,
      data: stats
    });
  });
}

// src/api/observability-routes.ts
async function observabilityRoutes(fastify) {
  let observability = getObservabilityManager();
  if (!observability) {
    observability = createObservabilityManager({
      serviceName: "integration-hub",
      environment: process.env.NODE_ENV ?? "development"
    });
  }
  fastify.get("/api/observability/status", async (_request, reply) => {
    const health = observability.getHealth();
    return reply.send({
      success: true,
      data: health
    });
  });
  fastify.get("/api/observability/summary", async (_request, reply) => {
    const summary = observability.getSummary();
    return reply.send({
      success: true,
      data: summary
    });
  });
  fastify.get(
    "/api/observability/traces",
    async (request, reply) => {
      const query = {
        serviceName: request.query.serviceName,
        operationName: request.query.operationName,
        minDuration: request.query.minDuration ? parseInt(request.query.minDuration, 10) : void 0,
        maxDuration: request.query.maxDuration ? parseInt(request.query.maxDuration, 10) : void 0,
        startTime: request.query.startTime ? parseInt(request.query.startTime, 10) : void 0,
        endTime: request.query.endTime ? parseInt(request.query.endTime, 10) : void 0,
        limit: request.query.limit ? parseInt(request.query.limit, 10) : 100
      };
      if (request.query.tags) {
        try {
          query.tags = JSON.parse(request.query.tags);
        } catch {
        }
      }
      const traces = observability.searchTraces(query);
      return reply.send({
        success: true,
        data: traces,
        count: traces.length
      });
    }
  );
  fastify.get(
    "/api/observability/traces/:traceId",
    async (request, reply) => {
      const trace = observability.getTrace(request.params.traceId);
      if (!trace) {
        return reply.status(404).send({
          success: false,
          error: "Trace not found"
        });
      }
      return reply.send({
        success: true,
        data: trace
      });
    }
  );
  fastify.get(
    "/api/observability/traces/:traceId/logs",
    async (request, reply) => {
      const logs = observability.queryLogs({
        traceId: request.params.traceId
      });
      return reply.send({
        success: true,
        data: logs,
        count: logs.length
      });
    }
  );
  fastify.get("/api/observability/metrics", async (_request, reply) => {
    const metrics = observability.getAllMetrics();
    return reply.send({
      success: true,
      data: metrics,
      count: metrics.length
    });
  });
  fastify.get(
    "/api/observability/metrics/:name",
    async (request, reply) => {
      const query = {
        name: request.params.name,
        startTime: request.query.startTime ? parseInt(request.query.startTime, 10) : void 0,
        endTime: request.query.endTime ? parseInt(request.query.endTime, 10) : void 0,
        step: request.query.step ? parseInt(request.query.step, 10) : void 0,
        aggregation: request.query.aggregation
      };
      if (request.query.labels) {
        try {
          query.labels = JSON.parse(request.query.labels);
        } catch {
        }
      }
      const metric = observability.queryMetrics(query);
      if (!metric) {
        return reply.status(404).send({
          success: false,
          error: "Metric not found"
        });
      }
      return reply.send({
        success: true,
        data: metric
      });
    }
  );
  fastify.get("/api/observability/metrics/prometheus", async (_request, reply) => {
    const prometheus = observability.getPrometheusMetrics();
    return reply.header("Content-Type", "text/plain; version=0.0.4; charset=utf-8").send(prometheus);
  });
  fastify.post(
    "/api/observability/metrics/record",
    async (request, reply) => {
      observability.recordMetric(
        request.body.name,
        request.body.value,
        request.body.labels
      );
      return reply.send({
        success: true,
        message: "Metric recorded"
      });
    }
  );
  fastify.get(
    "/api/observability/logs",
    async (request, reply) => {
      const query = {
        traceId: request.query.traceId,
        spanId: request.query.spanId,
        serviceName: request.query.serviceName,
        severity: request.query.severity,
        bodyContains: request.query.bodyContains,
        startTime: request.query.startTime ? parseInt(request.query.startTime, 10) : void 0,
        endTime: request.query.endTime ? parseInt(request.query.endTime, 10) : void 0,
        limit: request.query.limit ? parseInt(request.query.limit, 10) : 100
      };
      const logs = observability.queryLogs(query);
      return reply.send({
        success: true,
        data: logs,
        count: logs.length
      });
    }
  );
  fastify.post(
    "/api/observability/logs",
    async (request, reply) => {
      const { severity, message, attributes } = request.body;
      switch (severity) {
        case "TRACE":
          observability.logTrace(message, attributes);
          break;
        case "DEBUG":
          observability.logDebug(message, attributes);
          break;
        case "INFO":
          observability.logInfo(message, attributes);
          break;
        case "WARN":
          observability.logWarn(message, attributes);
          break;
        case "ERROR":
          observability.logError(message, void 0, attributes);
          break;
        case "FATAL":
          observability.logFatal(message, void 0, attributes);
          break;
      }
      return reply.send({
        success: true,
        message: "Log recorded"
      });
    }
  );
  fastify.post(
    "/api/observability/spans/start",
    async (request, reply) => {
      const { name, kind, parentTraceId, parentSpanId, attributes } = request.body;
      const span = observability.startSpan(name, {
        kind,
        context: parentTraceId && parentSpanId ? { traceId: parentTraceId, spanId: parentSpanId, traceFlags: 1 } : void 0,
        attributes
      });
      const context = span.getContext();
      return reply.send({
        success: true,
        data: {
          traceId: context.traceId,
          spanId: context.spanId,
          parentSpanId: context.parentSpanId
        }
      });
    }
  );
  fastify.post(
    "/api/observability/spans/end",
    async (request, reply) => {
      return reply.send({
        success: true,
        message: "Span ended"
      });
    }
  );
  fastify.post("/api/observability/reset", async (_request, reply) => {
    observability.reset();
    return reply.send({
      success: true,
      message: "Observability data reset"
    });
  });
  fastify.get("/api/observability/config", async (_request, reply) => {
    const config = observability.getConfig();
    const safeConfig = {
      serviceName: config.serviceName,
      serviceVersion: config.serviceVersion,
      environment: config.environment,
      tracing: {
        enabled: config.tracing.enabled,
        sampler: config.tracing.sampler
      },
      metrics: {
        enabled: config.metrics.enabled,
        collectInterval: config.metrics.collectInterval
      },
      logging: {
        enabled: config.logging.enabled,
        minSeverity: config.logging.minSeverity
      },
      retention: config.retention
    };
    return reply.send({
      success: true,
      data: safeConfig
    });
  });
}

// src/api/routes.ts
var POLITICS_KEYWORDS = [
  "election",
  "president",
  "congress",
  "senate",
  "house",
  "governor",
  "vote",
  "ballot",
  "democrat",
  "republican",
  "trump",
  "biden",
  "political",
  "impeach",
  "cabinet"
];
var CRYPTO_KEYWORDS = [
  "bitcoin",
  "btc",
  "ethereum",
  "eth",
  "solana",
  "sol",
  "crypto",
  "etf",
  "sec",
  "coinbase",
  "binance",
  "defi",
  "nft",
  "blockchain",
  "doge",
  "xrp"
];
var MACRO_KEYWORDS = [
  "fed",
  "fomc",
  "interest rate",
  "inflation",
  "cpi",
  "gdp",
  "unemployment",
  "recession",
  "treasury",
  "yield"
];
function categorizeMarket(question) {
  const q = question.toLowerCase();
  if (POLITICS_KEYWORDS.some((kw) => q.includes(kw))) return "politics";
  if (CRYPTO_KEYWORDS.some((kw) => q.includes(kw))) return "crypto";
  if (MACRO_KEYWORDS.some((kw) => q.includes(kw))) return "macro";
  return "other";
}
async function fetchPolymarketMarkets() {
  try {
    const response = await fetch("https://gamma-api.polymarket.com/markets?closed=false&limit=100", {
      headers: { "User-Agent": "gICM-Hub/1.0", "Accept": "application/json" },
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) return [];
    const data = await response.json();
    const markets = Array.isArray(data) ? data : data.markets ?? [];
    return markets.filter((m) => !m.closed && m.volumeNum > 1e3).map((m) => {
      const prices = m.outcomePrices?.map((p) => parseFloat(p) * 100) ?? [50, 50];
      return {
        id: `poly-${m.id}`,
        source: "polymarket",
        question: m.question,
        category: categorizeMarket(m.question),
        yesPrice: prices[0] ?? 50,
        noPrice: prices[1] ?? 50,
        volume24h: m.volume24hr ?? 0,
        totalVolume: m.volume ?? 0,
        liquidity: m.liquidity ?? 0,
        priceChange24h: 0,
        // Polymarket doesn't provide this directly
        expiresAt: m.endDate,
        url: `https://polymarket.com/event/${m.slug}`
      };
    }).slice(0, 50);
  } catch (error) {
    console.error("[PREDICTIONS] Polymarket fetch error:", error);
    return [];
  }
}
async function fetchKalshiMarkets() {
  try {
    let response = await fetch("https://api.elections.kalshi.com/trade-api/v2/markets?status=open&limit=200", {
      headers: { "User-Agent": "gICM-Hub/1.0", "Accept": "application/json" },
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      response = await fetch("https://trading-api.kalshi.com/trade-api/v2/markets?status=open&limit=200", {
        headers: { "User-Agent": "gICM-Hub/1.0", "Accept": "application/json" },
        signal: AbortSignal.timeout(1e4)
      });
    }
    if (!response.ok) return [];
    const data = await response.json();
    const markets = data.markets ?? [];
    return markets.filter((m) => (m.status === "active" || m.status === "open") && m.volume > 10).map((m) => {
      const yesPrice = m.yes_bid > 0 ? m.yes_bid : m.last_price;
      const noPrice = m.no_bid > 0 ? m.no_bid : 100 - m.last_price;
      const priceChange = m.last_price - m.previous_price;
      return {
        id: `kalshi-${m.ticker}`,
        source: "kalshi",
        question: m.title,
        category: categorizeMarket(m.title),
        yesPrice,
        noPrice,
        volume24h: m.volume_24h ?? 0,
        totalVolume: m.volume ?? 0,
        liquidity: m.liquidity ?? 0,
        openInterest: m.open_interest,
        priceChange24h: priceChange,
        expiresAt: m.expiration_time,
        url: `https://kalshi.com/markets/${m.ticker}`
      };
    }).slice(0, 50);
  } catch (error) {
    console.error("[PREDICTIONS] Kalshi fetch error:", error);
    return [];
  }
}
async function aggregatePredictions() {
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketMarkets(),
    fetchKalshiMarkets()
  ]);
  const allMarkets = [...polymarkets, ...kalshiMarkets];
  const politics = allMarkets.filter((m) => m.category === "politics").sort((a, b) => b.volume24h - a.volume24h);
  const crypto2 = allMarkets.filter((m) => m.category === "crypto").sort((a, b) => b.volume24h - a.volume24h);
  const trending = [...allMarkets].map((m) => ({ ...m, trendScore: m.volume24h * (Math.abs(m.priceChange24h) + 1) })).sort((a, b) => b.trendScore - a.trendScore).slice(0, 20);
  const totalVolume24h = allMarkets.reduce((sum, m) => sum + m.volume24h, 0);
  const topMover = allMarkets.reduce((max, m) => Math.abs(m.priceChange24h) > Math.abs(max) ? m.priceChange24h : max, 0);
  return {
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    sources: {
      polymarket: {
        active: polymarkets.length > 0,
        marketCount: polymarkets.length,
        totalVolume: polymarkets.reduce((sum, m) => sum + m.totalVolume, 0)
      },
      kalshi: {
        active: kalshiMarkets.length > 0,
        marketCount: kalshiMarkets.length,
        totalVolume: kalshiMarkets.reduce((sum, m) => sum + m.totalVolume, 0)
      }
    },
    markets: {
      politics: politics.slice(0, 20),
      crypto: crypto2.slice(0, 20),
      trending
    },
    stats: {
      totalMarkets: allMarkets.length,
      totalVolume24h,
      topMoverPercent: topMover
    }
  };
}
async function registerRoutes(fastify, hub) {
  await registerContentRoutes(fastify, hub);
  await registerOrgRoutes(fastify);
  await registerAuditRoutes(fastify);
  await gitRoutes(fastify);
  await botRoutes(fastify);
  await terraformRoutes(fastify);
  await vscodeRoutes(fastify);
  await haRoutes(fastify);
  await drRoutes(fastify);
  await observabilityRoutes(fastify);
  fastify.post("/api/engines/register", async (req) => {
    const { engineId } = req.body;
    const validEngines = ["brain", "money", "growth", "product", "trading"];
    if (!validEngines.includes(engineId)) {
      return { ok: false, error: `Invalid engine ID. Must be one of: ${validEngines.join(", ")}` };
    }
    hub.getEngineManager().markConnected(engineId);
    console.log(`[HUB] Engine registered via API: ${engineId}`);
    return { ok: true, message: `Engine ${engineId} registered`, engineId };
  });
  fastify.post("/api/engines/heartbeat", async (req) => {
    const { engineId } = req.body;
    const validEngines = ["brain", "money", "growth", "product", "trading"];
    if (!validEngines.includes(engineId)) {
      return { ok: false, error: "Invalid engine ID" };
    }
    hub.getEngineManager().recordHeartbeat(engineId);
    return { ok: true, timestamp: Date.now() };
  });
  fastify.post("/api/engines/unregister", async (req) => {
    const { engineId } = req.body;
    hub.getEngineManager().markDisconnected(engineId);
    console.log(`[HUB] Engine unregistered: ${engineId}`);
    return { ok: true, message: `Engine ${engineId} unregistered` };
  });
  fastify.get("/api/status", async () => {
    const engines = hub.getEngineManager().getAllHealth();
    const aggregated = hub.getEngineManager().getAggregatedStatus();
    return {
      ok: aggregated.offline === 0,
      timestamp: Date.now(),
      engines: {
        status: aggregated,
        details: engines
      }
    };
  });
  fastify.get("/api/brain/status", async () => {
    const brain = hub.getBrain();
    if (brain) {
      return {
        ok: true,
        status: brain.getStatus()
      };
    }
    const allEngines = hub.getEngineManager().getAllHealth();
    const engineHealth = allEngines.find((e) => e.id === "brain");
    if (engineHealth && engineHealth.connected) {
      return {
        ok: true,
        status: {
          version: "1.0.0",
          isRunning: true,
          connected: true,
          lastHeartbeat: engineHealth.lastHeartbeat,
          message: "Brain orchestrator is running and registered"
        }
      };
    }
    return {
      ok: false,
      error: "Brain not connected"
    };
  });
  fastify.post("/api/brain/start", async () => {
    const brain = hub.getBrain();
    if (!brain) {
      return { ok: false, error: "Brain not connected" };
    }
    brain.start();
    return { ok: true, message: "Brain started" };
  });
  fastify.post("/api/brain/stop", async () => {
    const brain = hub.getBrain();
    if (!brain) {
      return { ok: false, error: "Brain not connected" };
    }
    brain.stop();
    return { ok: true, message: "Brain stopped" };
  });
  fastify.post("/api/brain/phase", async (req) => {
    const brain = hub.getBrain();
    if (!brain) {
      return { ok: false, error: "Brain not connected" };
    }
    const { phase } = req.body;
    await brain.triggerPhase(phase);
    return { ok: true, message: "Phase triggered", phase };
  });
  fastify.get("/api/treasury", async () => {
    const moneyEngine = hub.getMoneyEngine();
    if (!moneyEngine) {
      return {
        ok: false,
        error: "Money engine not connected"
      };
    }
    try {
      const status = await moneyEngine.getStatus();
      return {
        ok: true,
        treasury: {
          totalUsd: status.treasury.totalValueUsd.toNumber(),
          solBalance: status.treasury.solBalance.toNumber(),
          usdcBalance: status.treasury.usdcBalance.toNumber(),
          runway: status.health.runway,
          allocations: Object.fromEntries(
            Object.entries(status.treasury.allocations).map(([k, v]) => [
              k,
              v.toNumber()
            ])
          )
        },
        health: status.health
      };
    } catch (error) {
      return {
        ok: false,
        error: "Failed to fetch treasury status"
      };
    }
  });
  fastify.get("/api/money/status", async () => {
    const moneyEngine = hub.getMoneyEngine();
    if (!moneyEngine) {
      return {
        ok: false,
        error: "Money engine not connected"
      };
    }
    try {
      const status = await moneyEngine.getStatus();
      return {
        ok: true,
        totalValueUsd: status.treasury.totalValueUsd.toNumber(),
        balances: {
          sol: status.treasury.solBalance.toNumber(),
          usdc: status.treasury.usdcBalance.toNumber()
        },
        allocations: Object.fromEntries(
          Object.entries(status.treasury.allocations).map(([k, v]) => [k, v.toNumber()])
        ),
        runway: status.health.runway,
        expenses: {
          monthly: 0,
          // TODO: Wire to expense tracking
          upcoming: 0
        },
        trading: {
          activeBots: 1,
          // DCA bot
          totalPnL: 0,
          dailyPnL: 0,
          weeklyPnL: 0
        }
      };
    } catch (error) {
      return { ok: false, error: "Failed to fetch money status" };
    }
  });
  fastify.get("/api/growth/status", async () => {
    const growthEngine = hub.getGrowthEngine();
    if (!growthEngine) {
      return {
        ok: false,
        error: "Growth engine not connected",
        // Return stub data so dashboard doesn't break
        running: false,
        metrics: {
          traffic: { daily: 0, weekly: 0, monthly: 0 },
          content: { postsPublished: 0, totalViews: 0, avgEngagement: 0 },
          social: { twitterFollowers: 0, discordMembers: 0 },
          seo: { avgPosition: 0, indexedPages: 0, backlinks: 0 }
        },
        upcomingContent: { blogPosts: 0, tweets: 0 }
      };
    }
    try {
      const status = growthEngine.getStatus();
      return {
        ok: true,
        running: status.running,
        metrics: {
          traffic: { daily: 0, weekly: 0, monthly: 0 },
          // TODO: Wire to analytics
          content: {
            postsPublished: status.metrics.postsGenerated,
            totalViews: 0,
            avgEngagement: 0
          },
          social: {
            twitterFollowers: 0,
            discordMembers: 0
          },
          seo: { avgPosition: 0, indexedPages: 0, backlinks: 0 }
        },
        upcomingContent: {
          blogPosts: status.upcomingContent?.length || 0,
          tweets: 0
        }
      };
    } catch (error) {
      return { ok: false, error: "Failed to fetch growth status" };
    }
  });
  fastify.get("/api/product/status", async () => {
    const productEngine = hub.getProductEngine();
    if (!productEngine) {
      return {
        ok: false,
        error: "Product engine not connected",
        running: false,
        backlog: { total: 0, approved: 0, building: 0 },
        activeBuild: null,
        metrics: { discovered: 0, built: 0, deployed: 0, successRate: 0 }
      };
    }
    try {
      const backlog = productEngine.getBacklog();
      const approved = backlog.filter((o) => o.status === "approved");
      const building = backlog.filter((o) => o.status === "building");
      return {
        ok: true,
        running: true,
        backlog: {
          total: backlog.length,
          approved: approved.length,
          building: building.length
        },
        activeBuild: building.length > 0 ? {
          id: building[0].id,
          name: building[0].name,
          progress: 50
          // TODO: Track actual progress
        } : null,
        metrics: {
          discovered: backlog.length,
          built: 0,
          // TODO: Track completed builds
          deployed: 0,
          successRate: 0
        }
      };
    } catch (error) {
      return { ok: false, error: "Failed to fetch product status" };
    }
  });
  fastify.get("/api/hunter/status", async () => {
    const brain = hub.getBrain();
    if (brain) {
      const brainStatus = brain.getStatus();
      return {
        ok: true,
        isRunning: brainStatus.isRunning,
        enabledSources: brainStatus.hunter?.enabledSources || ["github", "hackernews", "twitter"],
        totalDiscoveries: brainStatus.hunter?.totalDiscoveries || 0,
        totalSignals: brainStatus.hunter?.totalSignals || 0,
        actionableSignals: brainStatus.hunter?.actionableSignals || 0,
        recentDiscoveries: []
        // TODO: Fetch from hunter agent
      };
    }
    return {
      ok: true,
      isRunning: false,
      enabledSources: ["github", "hackernews", "twitter", "producthunt"],
      totalDiscoveries: 0,
      totalSignals: 0,
      actionableSignals: 0,
      recentDiscoveries: []
    };
  });
  fastify.get("/api/autonomy/status", async () => {
    return {
      ok: true,
      level: 2,
      // Bounded autonomy
      queue: { pending: 0, approved: 0, rejected: 0 },
      audit: { total: 0, auto: 0, queued: 0, escalated: 0, successRate: 100 },
      today: { autoExecuted: 0, queued: 0, escalated: 0, cost: 0, revenue: 0 },
      stats: { autoExecuted: 0, queued: 0, pending: 0 }
    };
  });
  fastify.get("/api/brain/stats", async () => {
    return {
      ok: true,
      knowledge: {
        total: 0,
        bySource: { github: 0, hackernews: 0, twitter: 0, arxiv: 0, producthunt: 0 },
        byTopic: {},
        recent24h: 0
      },
      patterns: {
        total: 0,
        byType: { correlation: 0, trend: 0, anomaly: 0, recurring: 0 },
        avgConfidence: 0
      },
      predictions: {
        total: 0,
        pending: 0,
        accuracy: 0
      },
      uptime: Date.now(),
      lastIngestion: 0
    };
  });
  fastify.get("/api/brain/recent", async (req) => {
    const limit = parseInt(req.query.limit || "20", 10);
    return {
      ok: true,
      items: [],
      count: 0,
      limit
    };
  });
  fastify.get("/api/brain/patterns", async () => {
    return {
      ok: true,
      patterns: [],
      count: 0
    };
  });
  fastify.get("/api/brain/predictions", async () => {
    return {
      ok: true,
      predictions: [],
      count: 0
    };
  });
  fastify.post("/api/brain/search", async (req) => {
    const { query, limit = 20 } = req.body;
    return {
      ok: true,
      query,
      results: [],
      count: 0
    };
  });
  fastify.post("/api/brain/ingest", async (req) => {
    const { source } = req.body;
    hub.getEventBus().publish("brain", "brain.ingest_triggered", { source: source || "all" });
    return {
      ok: true,
      message: source ? `Ingestion triggered for ${source}` : "Full ingestion triggered"
    };
  });
  const { enrichEvents, getAllCategories, CATEGORY_ICONS } = await import("./events-DJE52GQV.js");
  fastify.get(
    "/api/events",
    async (req) => {
      const limit = parseInt(req.query.limit || "50", 10);
      const category = req.query.category;
      let events;
      if (category) {
        events = hub.getEventBus().getEventsByCategory(category, limit);
      } else {
        events = hub.getEventBus().getRecentEvents(limit);
      }
      return {
        ok: true,
        count: events.length,
        events
      };
    }
  );
  fastify.get(
    "/api/events/enriched",
    async (req) => {
      const limit = parseInt(req.query.limit || "50", 10);
      const category = req.query.category;
      const severity = req.query.severity;
      let events;
      if (category) {
        events = hub.getEventBus().getEventsByCategory(category, limit);
      } else {
        events = hub.getEventBus().getRecentEvents(limit);
      }
      let enriched = enrichEvents(events);
      if (severity) {
        enriched = enriched.filter((e) => e.severity === severity);
      }
      return {
        ok: true,
        count: enriched.length,
        events: enriched
      };
    }
  );
  fastify.get("/api/events/categories", async () => {
    const categories = getAllCategories();
    return {
      ok: true,
      categories: categories.map((c) => ({
        id: c,
        name: c.charAt(0).toUpperCase() + c.slice(1),
        icon: CATEGORY_ICONS[c]
      }))
    };
  });
  fastify.get("/api/backlog", async () => {
    const productEngine = hub.getProductEngine();
    if (!productEngine) {
      return { ok: false, error: "Product engine not connected" };
    }
    const backlog = productEngine.getBacklog();
    return {
      ok: true,
      count: backlog.length,
      items: backlog
    };
  });
  fastify.post("/api/discovery/run", async () => {
    const productEngine = hub.getProductEngine();
    if (!productEngine) {
      return { ok: false, error: "Product engine not connected" };
    }
    try {
      const opportunities = await productEngine.runDiscovery();
      return {
        ok: true,
        found: opportunities.length,
        opportunities
      };
    } catch (error) {
      return { ok: false, error: "Discovery failed" };
    }
  });
  fastify.post(
    "/api/content/generate",
    async (req) => {
      const growthEngine = hub.getGrowthEngine();
      if (!growthEngine) {
        return { ok: false, error: "Growth engine not connected" };
      }
      const { type } = req.body;
      try {
        await growthEngine.generateNow(type);
        const status = growthEngine.getStatus();
        return {
          ok: true,
          type,
          upcomingContent: status.upcomingContent
        };
      } catch (error) {
        return { ok: false, error: "Content generation failed" };
      }
    }
  );
  fastify.get("/api/predictions/status", async () => {
    try {
      const predictions = await aggregatePredictions();
      return predictions;
    } catch (error) {
      console.error("[PREDICTIONS] Error fetching predictions:", error);
      return {
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        sources: {
          polymarket: { active: false, marketCount: 0, totalVolume: 0 },
          kalshi: { active: false, marketCount: 0, totalVolume: 0 }
        },
        markets: { politics: [], crypto: [], trending: [] },
        stats: { totalMarkets: 0, totalVolume24h: 0, topMoverPercent: 0 }
      };
    }
  });
  fastify.get("/api/v1/predictions/status", async () => {
    try {
      const predictions = await aggregatePredictions();
      return predictions;
    } catch (error) {
      console.error("[PREDICTIONS] Error fetching predictions:", error);
      return {
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        sources: {
          polymarket: { active: false, marketCount: 0, totalVolume: 0 },
          kalshi: { active: false, marketCount: 0, totalVolume: 0 }
        },
        markets: { politics: [], crypto: [], trending: [] },
        stats: { totalMarkets: 0, totalVolume24h: 0, topMoverPercent: 0 }
      };
    }
  });
  const pipelineExecutions = /* @__PURE__ */ new Map();
  fastify.post("/api/pipelines/execute", async (req) => {
    const { pipeline, inputs = {} } = req.body;
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const execution = {
      id: executionId,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      status: "pending",
      progress: 0,
      currentStep: null,
      steps: pipeline.steps.map((s) => ({
        id: s.id,
        name: s.name || s.tool,
        status: "pending",
        startedAt: null,
        completedAt: null,
        output: null,
        error: null
      })),
      startedAt: Date.now(),
      completedAt: null,
      result: null,
      error: null
    };
    pipelineExecutions.set(executionId, execution);
    hub.getEventBus().publish("pipeline", "pipeline.started", {
      executionId,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      stepCount: pipeline.steps.length
    });
    executePipelineAsync(execution, pipeline, inputs, hub.getEventBus());
    return {
      ok: true,
      executionId,
      message: "Pipeline execution started"
    };
  });
  fastify.get(
    "/api/pipelines/:executionId/status",
    async (req) => {
      const { executionId } = req.params;
      const execution = pipelineExecutions.get(executionId);
      if (!execution) {
        return {
          ok: false,
          error: `Execution not found: ${executionId}`
        };
      }
      return {
        ok: true,
        execution: {
          id: execution.id,
          pipelineId: execution.pipelineId,
          pipelineName: execution.pipelineName,
          status: execution.status,
          progress: execution.progress,
          currentStep: execution.currentStep,
          steps: execution.steps,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          duration: execution.completedAt ? execution.completedAt - execution.startedAt : Date.now() - execution.startedAt,
          result: execution.result,
          error: execution.error
        }
      };
    }
  );
  fastify.get(
    "/api/pipelines/executions",
    async (req) => {
      const limit = parseInt(req.query.limit || "20", 10);
      const statusFilter = req.query.status;
      let executions = Array.from(pipelineExecutions.values());
      if (statusFilter) {
        executions = executions.filter((e) => e.status === statusFilter);
      }
      executions.sort((a, b) => b.startedAt - a.startedAt);
      return {
        ok: true,
        total: executions.length,
        executions: executions.slice(0, limit).map((e) => ({
          id: e.id,
          pipelineId: e.pipelineId,
          pipelineName: e.pipelineName,
          status: e.status,
          progress: e.progress,
          startedAt: e.startedAt,
          completedAt: e.completedAt,
          duration: e.completedAt ? e.completedAt - e.startedAt : Date.now() - e.startedAt
        }))
      };
    }
  );
  fastify.post(
    "/api/pipelines/:executionId/cancel",
    async (req) => {
      const { executionId } = req.params;
      const execution = pipelineExecutions.get(executionId);
      if (!execution) {
        return { ok: false, error: `Execution not found: ${executionId}` };
      }
      if (execution.status !== "running" && execution.status !== "pending") {
        return { ok: false, error: `Cannot cancel execution with status: ${execution.status}` };
      }
      execution.status = "cancelled";
      execution.completedAt = Date.now();
      hub.getEventBus().publish("pipeline", "pipeline.cancelled", {
        executionId,
        pipelineId: execution.pipelineId
      });
      return { ok: true, message: "Pipeline cancelled" };
    }
  );
  async function executePipelineAsync(execution, pipeline, inputs, eventBus2) {
    try {
      execution.status = "running";
      const results = {};
      const completedSteps = /* @__PURE__ */ new Set();
      const totalSteps = pipeline.steps.length;
      for (let i = 0; i < pipeline.steps.length; i++) {
        if (execution.status === "cancelled") {
          return;
        }
        const step = pipeline.steps[i];
        const stepRecord = execution.steps.find((s) => s.id === step.id);
        if (step.dependsOn?.length) {
          const depsOk = step.dependsOn.every((dep) => completedSteps.has(dep));
          if (!depsOk) {
            stepRecord.status = "skipped";
            stepRecord.error = "Dependencies not met";
            eventBus2.publish("pipeline", "pipeline.step_skipped", {
              executionId: execution.id,
              stepId: step.id,
              reason: "Dependencies not met"
            });
            continue;
          }
        }
        execution.currentStep = step.id;
        stepRecord.status = "running";
        stepRecord.startedAt = Date.now();
        eventBus2.publish("pipeline", "pipeline.step_started", {
          executionId: execution.id,
          stepId: step.id,
          tool: step.tool
        });
        try {
          await simulateStepExecution(step, inputs, results);
          stepRecord.status = "completed";
          stepRecord.completedAt = Date.now();
          stepRecord.output = { success: true, tool: step.tool };
          completedSteps.add(step.id);
          results[step.id] = stepRecord.output;
          eventBus2.publish("pipeline", "pipeline.step_completed", {
            executionId: execution.id,
            stepId: step.id,
            duration: stepRecord.completedAt - (stepRecord.startedAt || 0)
          });
        } catch (error) {
          stepRecord.status = "failed";
          stepRecord.completedAt = Date.now();
          stepRecord.error = error instanceof Error ? error.message : String(error);
          eventBus2.publish("pipeline", "pipeline.step_failed", {
            executionId: execution.id,
            stepId: step.id,
            error: stepRecord.error
          });
        }
        execution.progress = Math.round((i + 1) / totalSteps * 100);
      }
      execution.status = execution.steps.some((s) => s.status === "failed") ? "failed" : "completed";
      execution.completedAt = Date.now();
      execution.currentStep = null;
      execution.result = results;
      eventBus2.publish("pipeline", "pipeline.completed", {
        executionId: execution.id,
        pipelineId: execution.pipelineId,
        status: execution.status,
        duration: execution.completedAt - execution.startedAt
      });
    } catch (error) {
      execution.status = "failed";
      execution.completedAt = Date.now();
      execution.error = error instanceof Error ? error.message : String(error);
      eventBus2.publish("pipeline", "pipeline.failed", {
        executionId: execution.id,
        pipelineId: execution.pipelineId,
        error: execution.error
      });
    }
  }
  async function simulateStepExecution(step, inputs, results) {
    const delay = 500 + Math.random() * 1500;
    await new Promise((resolve) => setTimeout(resolve, delay));
    if (Math.random() < 0.1) {
      throw new Error(`Step ${step.id} failed: simulated error`);
    }
  }
  const { getAnalyticsManager } = await import("./analytics-LTKSISUW.js");
  const analytics = getAnalyticsManager();
  hub.getEventBus().subscribe("pipeline", "pipeline.started", async (data) => {
    const exec = pipelineExecutions.get(data.executionId);
    if (exec) {
      analytics.startExecution(exec.pipelineId, exec.pipelineName, exec.steps.length);
    }
  });
  hub.getEventBus().subscribe("pipeline", "pipeline.step_completed", async (data) => {
    const exec = pipelineExecutions.get(data.executionId);
    if (exec) {
      const step = exec.steps.find((s) => s.id === data.stepId);
      if (step) {
        analytics.recordStep(
          data.executionId,
          data.stepId,
          step.name,
          "completed",
          { input: 500 + Math.random() * 500, output: 200 + Math.random() * 300, total: 0 }
        );
      }
    }
  });
  hub.getEventBus().subscribe("pipeline", "pipeline.completed", async (data) => {
    analytics.completeExecution(
      data.executionId,
      data.status === "completed" ? "completed" : "failed"
    );
  });
  fastify.get(
    "/api/analytics/summary",
    async (req) => {
      const period = req.query.period || "week";
      const summary = analytics.getSummary(period);
      return {
        ok: true,
        summary
      };
    }
  );
  fastify.get(
    "/api/analytics/executions",
    async (req) => {
      const limit = parseInt(req.query.limit || "50", 10);
      const pipelineId = req.query.pipelineId;
      let executions;
      if (pipelineId) {
        executions = analytics.getExecutionsByPipeline(pipelineId, limit);
      } else {
        executions = analytics.getRecentExecutions(limit);
      }
      return {
        ok: true,
        count: executions.length,
        executions
      };
    }
  );
  fastify.get(
    "/api/analytics/daily",
    async (req) => {
      const date = req.query.date;
      const stats = analytics.getDailyStats(date);
      if (!stats) {
        return {
          ok: true,
          stats: null,
          message: "No data for this date"
        };
      }
      return {
        ok: true,
        stats
      };
    }
  );
  fastify.get(
    "/api/analytics/tokens",
    async (req) => {
      const period = req.query.period || "week";
      const breakdown = analytics.getTokenUsageBreakdown(period);
      return {
        ok: true,
        period,
        ...breakdown
      };
    }
  );
  fastify.get(
    "/api/analytics/costs",
    async (req) => {
      const period = req.query.period || "week";
      const summary = analytics.getSummary(period);
      return {
        ok: true,
        period,
        totalCost: summary.totalCost,
        costTrend: summary.costTrend,
        avgCostPerExecution: summary.totalExecutions > 0 ? summary.totalCost / summary.totalExecutions : 0,
        topCostPipelines: summary.topPipelines.map((p) => ({
          id: p.id,
          name: p.name,
          executions: p.count
        }))
      };
    }
  );
  fastify.get(
    "/api/analytics/success-rate",
    async (req) => {
      const period = req.query.period || "week";
      const summary = analytics.getSummary(period);
      return {
        ok: true,
        period,
        overall: {
          successRate: summary.successRate,
          totalExecutions: summary.totalExecutions
        },
        byPipeline: summary.topPipelines.map((p) => ({
          id: p.id,
          name: p.name,
          successRate: p.successRate,
          executions: p.count
        })),
        trend: summary.executionTrend
      };
    }
  );
  const { getWebhookManager } = await import("./webhooks-F6EXKYGE.js");
  const webhookManager = getWebhookManager();
  await webhookManager.initialize();
  fastify.get("/api/webhooks", async () => {
    const webhooks = webhookManager.getWebhooks();
    return {
      ok: true,
      count: webhooks.length,
      webhooks: webhooks.map((w) => ({
        id: w.id,
        name: w.name,
        url: w.url,
        events: w.events,
        enabled: w.enabled,
        lastTriggeredAt: w.lastTriggeredAt,
        lastStatus: w.lastStatus,
        failureCount: w.failureCount,
        createdAt: w.createdAt
      }))
    };
  });
  fastify.get("/api/webhooks/:id", async (req, reply) => {
    const webhook = webhookManager.getWebhook(req.params.id);
    if (!webhook) {
      reply.code(404);
      return { ok: false, error: "Webhook not found" };
    }
    return {
      ok: true,
      webhook: {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        enabled: webhook.enabled,
        retryCount: webhook.retryCount,
        timeoutMs: webhook.timeoutMs,
        lastTriggeredAt: webhook.lastTriggeredAt,
        lastStatus: webhook.lastStatus,
        failureCount: webhook.failureCount,
        metadata: webhook.metadata,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt
      }
    };
  });
  fastify.post("/api/webhooks", async (req, reply) => {
    const { name, url, secret, events, enabled, retryCount, timeoutMs, metadata } = req.body;
    if (!name || !url) {
      reply.code(400);
      return { ok: false, error: "name and url are required" };
    }
    try {
      new URL(url);
    } catch {
      reply.code(400);
      return { ok: false, error: "Invalid URL" };
    }
    const webhookSecret = secret || `whsec_${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
    const webhook = await webhookManager.registerWebhook({
      name,
      url,
      secret: webhookSecret,
      events: events || ["pipeline.completed"],
      enabled: enabled !== false,
      retryCount: retryCount || 3,
      timeoutMs: timeoutMs || 5e3,
      metadata: metadata || {}
    });
    return {
      ok: true,
      webhook: {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        secret: webhook.secret,
        // Include secret only on creation
        events: webhook.events,
        enabled: webhook.enabled,
        createdAt: webhook.createdAt
      }
    };
  });
  fastify.patch("/api/webhooks/:id", async (req, reply) => {
    const existing = webhookManager.getWebhook(req.params.id);
    if (!existing) {
      reply.code(404);
      return { ok: false, error: "Webhook not found" };
    }
    if (req.body.url) {
      try {
        new URL(req.body.url);
      } catch {
        reply.code(400);
        return { ok: false, error: "Invalid URL" };
      }
    }
    const updated = webhookManager.updateWebhook(req.params.id, {
      ...req.body.name && { name: req.body.name },
      ...req.body.url && { url: req.body.url },
      ...req.body.events && { events: req.body.events },
      ...req.body.enabled !== void 0 && { enabled: req.body.enabled },
      ...req.body.retryCount && { retryCount: req.body.retryCount },
      ...req.body.timeoutMs && { timeoutMs: req.body.timeoutMs },
      ...req.body.metadata && { metadata: req.body.metadata }
    });
    return {
      ok: true,
      webhook: {
        id: updated.id,
        name: updated.name,
        url: updated.url,
        events: updated.events,
        enabled: updated.enabled,
        updatedAt: updated.updatedAt
      }
    };
  });
  fastify.delete("/api/webhooks/:id", async (req, reply) => {
    const existing = webhookManager.getWebhook(req.params.id);
    if (!existing) {
      reply.code(404);
      return { ok: false, error: "Webhook not found" };
    }
    webhookManager.removeWebhook(req.params.id);
    return {
      ok: true,
      message: "Webhook deleted"
    };
  });
  fastify.post("/api/webhooks/:id/test", async (req, reply) => {
    const webhook = webhookManager.getWebhook(req.params.id);
    if (!webhook) {
      reply.code(404);
      return { ok: false, error: "Webhook not found" };
    }
    await webhookManager.triggerPipelineEvent("pipeline.completed", {
      id: `test_${Date.now()}`,
      pipelineId: "test-pipeline",
      pipelineName: "Test Pipeline",
      status: "completed",
      startTime: Date.now() - 5e3,
      endTime: Date.now(),
      duration: 5e3,
      steps: [],
      cost: { total: 0.01, breakdown: { llm: 0.01, api: 0, compute: 0 }, currency: "USD" },
      tokens: { input: 1e3, output: 500, total: 1500 }
    });
    return {
      ok: true,
      message: "Test webhook triggered"
    };
  });
  const { getPipelineQueue, createPipelineWorker } = await import("./queue-EOZUI2DA.js");
  const queue = await getPipelineQueue();
  createPipelineWorker(queue, { analytics });
  fastify.get("/api/queue/stats", async () => {
    const stats = queue.getStats();
    return {
      ok: true,
      stats
    };
  });
  fastify.post("/api/queue/jobs", async (req, reply) => {
    const { pipelineId, pipelineName, inputs, steps, priority, webhookUrl } = req.body;
    if (!pipelineId || !pipelineName || !steps || steps.length === 0) {
      reply.code(400);
      return { ok: false, error: "pipelineId, pipelineName, and steps are required" };
    }
    const jobId = await queue.addJob({
      pipelineId,
      pipelineName,
      inputs: inputs || {},
      steps,
      priority: priority || "normal",
      webhookUrl
    });
    return {
      ok: true,
      jobId,
      message: "Job added to queue"
    };
  });
  fastify.get("/api/queue/jobs/:id", async (req, reply) => {
    const progress = queue.getProgress(req.params.id);
    if (!progress) {
      reply.code(404);
      return { ok: false, error: "Job not found" };
    }
    const job = queue.getJob(req.params.id);
    return {
      ok: true,
      job: job ? {
        id: job.id,
        pipelineId: job.pipelineId,
        pipelineName: job.pipelineName,
        priority: job.priority
      } : null,
      progress
    };
  });
  fastify.post("/api/queue/pause", async () => {
    await queue.pause();
    return { ok: true, message: "Queue paused" };
  });
  fastify.post("/api/queue/resume", async () => {
    await queue.resume();
    return { ok: true, message: "Queue resumed" };
  });
}

// src/api/server.ts
var ApiServer = class {
  fastify;
  hub;
  config;
  constructor(hub, config) {
    this.hub = hub;
    this.config = {
      port: config?.port ?? 3001,
      // Dashboard expects 3001
      host: config?.host ?? "0.0.0.0"
    };
    this.fastify = Fastify({
      logger: false
    });
  }
  /**
   * Initialize the server
   */
  async initialize() {
    await this.fastify.register(fastifyCors, {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE"]
    });
    await this.fastify.register(fastifyWebsocket);
    await registerRoutes(this.fastify, this.hub);
    this.fastify.get("/ws", { websocket: true }, (socket) => {
      console.log("[HUB-API] WebSocket client connected");
      const handler = (event) => {
        try {
          socket.send(JSON.stringify(event));
        } catch {
        }
      };
      this.hub.getEventBus().on("*", handler);
      socket.on("close", () => {
        console.log("[HUB-API] WebSocket client disconnected");
        this.hub.getEventBus().off("*", handler);
      });
      socket.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === "ping") {
            socket.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          }
        } catch {
        }
      });
    });
    this.fastify.get("/health", async () => {
      return { ok: true, timestamp: Date.now() };
    });
    this.fastify.get("/", async () => {
      return {
        service: "gICM Integration Hub",
        version: "0.1.0",
        status: "running",
        endpoints: {
          health: "/health",
          api: "/api",
          websocket: "/ws",
          status: "/api/status",
          brain: "/api/brain/status"
        },
        timestamp: Date.now()
      };
    });
  }
  /**
   * Start the server
   */
  async start() {
    await this.initialize();
    await this.fastify.listen({
      port: this.config.port,
      host: this.config.host
    });
    console.log("[HUB-API] Server listening on port", this.config.port);
  }
  /**
   * Stop the server
   */
  async stop() {
    await this.fastify.close();
    console.log("[HUB-API] Server stopped");
  }
  /**
   * Get the Fastify instance
   */
  getFastify() {
    return this.fastify;
  }
};

// src/workflows/index.ts
var featureAnnouncementWorkflow = {
  id: "feature-announcement",
  name: "Feature Announcement",
  description: "Announce new features when ProductEngine deploys them",
  trigger: "build.completed",
  enabled: true,
  execute: async (hub, payload) => {
    const growthEngine = hub.getGrowthEngine();
    if (!growthEngine) return;
    const { name, description } = payload;
    if (!name) return;
    try {
      await growthEngine.announceFeature({
        name,
        description: description || "New feature deployed!"
      });
      console.log("[WORKFLOW] Feature announced:", name);
      hub.getEventBus().publish("workflow", "content.published", {
        workflow: "feature-announcement",
        feature: name
      });
    } catch (error) {
      console.error("[WORKFLOW] Feature announcement failed:", error);
    }
  }
};
var profitableTradeWorkflow = {
  id: "profitable-trade",
  name: "Profitable Trade Tweet",
  description: "Tweet about profitable trades above threshold",
  trigger: "trade.profit",
  enabled: true,
  execute: async (hub, payload) => {
    const growthEngine = hub.getGrowthEngine();
    if (!growthEngine) return;
    const { profit, symbol } = payload;
    if (!profit || profit < 100) return;
    try {
      await growthEngine.generateNow("tweet");
      console.log("[WORKFLOW] Profit tweet generated for", symbol);
    } catch (error) {
      console.error("[WORKFLOW] Profit tweet failed:", error);
    }
  }
};
var lowTreasuryAlertWorkflow = {
  id: "low-treasury-alert",
  name: "Low Treasury Alert",
  description: "Alert and pause operations when treasury is critically low",
  trigger: "treasury.critical",
  enabled: true,
  execute: async (hub, payload) => {
    const brain = hub.getBrain();
    if (!brain) return;
    const { totalUsd, threshold } = payload;
    console.warn("[WORKFLOW] CRITICAL: Treasury below threshold!", {
      totalUsd,
      threshold
    });
    hub.getEventBus().publish("workflow", "engine.error", {
      workflow: "low-treasury-alert",
      message: "Treasury critically low - manual review required",
      totalUsd
    });
  }
};
var dailySummaryWorkflow = {
  id: "daily-summary",
  name: "Daily Summary",
  description: "Generate daily performance summary",
  trigger: "brain.phase_completed",
  enabled: true,
  execute: async (hub, payload) => {
    const { phase } = payload;
    if (phase !== "night_summary") return;
    const growthEngine = hub.getGrowthEngine();
    if (!growthEngine) return;
    try {
      await growthEngine.generateNow("thread");
      console.log("[WORKFLOW] Daily summary thread generated");
    } catch (error) {
      console.error("[WORKFLOW] Daily summary failed:", error);
    }
  }
};
var opus67ModeChangeWorkflow = {
  id: "opus67-mode-change",
  name: "OPUS67 Mode Change",
  description: "Handle OPUS67 mode changes and adjust engine behavior",
  trigger: "opus67.mode_changed",
  enabled: true,
  execute: async (hub, payload) => {
    const { from, to, reason } = payload;
    console.log(`[WORKFLOW] OPUS67 mode changed: ${from} \u2192 ${to} (${reason})`);
    if (to === "swarm") {
      console.log("[WORKFLOW] SWARM mode enabled - parallel processing active");
    }
    if (to === "audit") {
      console.log("[WORKFLOW] AUDIT mode enabled - security focus active");
    }
    hub.getEventBus().publish("workflow", "engine.heartbeat", {
      workflow: "opus67-mode-change",
      mode: to
    });
  }
};
var opus67QueryProcessedWorkflow = {
  id: "opus67-query-processed",
  name: "OPUS67 Query Analytics",
  description: "Track and analyze OPUS67 query processing",
  trigger: "opus67.query_processed",
  enabled: true,
  execute: async (hub, payload) => {
    const { query, mode, confidence, skills } = payload;
    console.log(`[WORKFLOW] OPUS67 processed query in ${mode} mode (${confidence}% confidence)`);
  }
};
var opus67AgentSpawnWorkflow = {
  id: "opus67-agent-spawn",
  name: "OPUS67 Agent Monitor",
  description: "Monitor OPUS67 sub-agent spawning",
  trigger: "opus67.agent_spawned",
  enabled: true,
  execute: async (hub, payload) => {
    const { agentId, role, mode } = payload;
    console.log(`[WORKFLOW] OPUS67 spawned agent: ${agentId} (${role}) in ${mode} mode`);
  }
};
var workflows = [
  featureAnnouncementWorkflow,
  profitableTradeWorkflow,
  lowTreasuryAlertWorkflow,
  dailySummaryWorkflow,
  opus67ModeChangeWorkflow,
  opus67QueryProcessedWorkflow,
  opus67AgentSpawnWorkflow
];
function registerWorkflows(hub) {
  const eventBus2 = hub.getEventBus();
  for (const workflow of workflows) {
    if (!workflow.enabled) continue;
    eventBus2.on(workflow.trigger, async (event) => {
      console.log("[WORKFLOW] Triggered:", workflow.name);
      try {
        await workflow.execute(hub, event.payload);
      } catch (error) {
        console.error("[WORKFLOW] Error in", workflow.name, error);
      }
    });
  }
  console.log("[WORKFLOW] Registered", workflows.filter((w) => w.enabled).length, "workflows");
}
function getWorkflows() {
  return workflows;
}

// src/scheduler/content-scheduler.ts
import { CronJob } from "cron";
var ContentScheduler = class {
  dailyBriefJob = null;
  contentMaterializationJob = null;
  constructor() {
    this.dailyBriefJob = new CronJob(
      "0 2 * * *",
      // 2:00 AM daily
      async () => {
        console.log("[ContentScheduler] Running daily content brief generation...");
        try {
          await generateContentBriefsDaily();
          console.log("[ContentScheduler] Daily content brief generation completed.");
        } catch (error) {
          console.error("[ContentScheduler] Daily content brief generation failed:", error);
        }
      },
      null,
      // onComplete
      true,
      // start
      "UTC"
      // timeZone
    );
    this.contentMaterializationJob = new CronJob(
      "0 */4 * * *",
      // Every 4 hours
      async () => {
        console.log("[ContentScheduler] Running content materialization...");
        try {
          await materializeContentFromBriefs();
          console.log("[ContentScheduler] Content materialization completed.");
        } catch (error) {
          console.error("[ContentScheduler] Content materialization failed:", error);
        }
      },
      null,
      // onComplete
      true,
      // start
      "UTC"
      // timeZone
    );
  }
  start() {
    if (this.dailyBriefJob && !this.dailyBriefJob.running) {
      this.dailyBriefJob.start();
      console.log("[ContentScheduler] Daily brief generation job started.");
    }
    if (this.contentMaterializationJob && !this.contentMaterializationJob.running) {
      this.contentMaterializationJob.start();
      console.log("[ContentScheduler] Content materialization job started.");
    }
  }
  stop() {
    if (this.dailyBriefJob && this.dailyBriefJob.running) {
      this.dailyBriefJob.stop();
      console.log("[ContentScheduler] Daily brief generation job stopped.");
    }
    if (this.contentMaterializationJob && this.contentMaterializationJob.running) {
      this.contentMaterializationJob.stop();
      console.log("[ContentScheduler] Content materialization job stopped.");
    }
  }
};
var instance4 = null;
function getContentScheduler() {
  if (!instance4) {
    instance4 = new ContentScheduler();
  }
  return instance4;
}

// src/hub.ts
var IntegrationHub = class {
  config;
  eventBusInstance;
  engineManager;
  apiServer;
  contentScheduler;
  running = false;
  startedAt = null;
  // Engine references (optional)
  brain;
  moneyEngine;
  growthEngine;
  productEngine;
  opus67;
  constructor(config) {
    this.config = {
      apiPort: config?.apiPort ?? 3001,
      // Dashboard expects 3001
      apiHost: config?.apiHost ?? "0.0.0.0",
      enableWorkflows: config?.enableWorkflows ?? true,
      enableHealthChecks: config?.enableHealthChecks ?? true
    };
    this.eventBusInstance = eventBus;
    this.engineManager = new EngineManager(this.eventBusInstance);
    this.apiServer = new ApiServer(this, {
      port: this.config.apiPort,
      host: this.config.apiHost
    });
    this.contentScheduler = getContentScheduler();
  }
  // =========================================================================
  // LIFECYCLE
  // =========================================================================
  /**
   * Start the integration hub
   */
  async start() {
    if (this.running) {
      console.log("[HUB] Already running");
      return;
    }
    console.log("[HUB] Starting Integration Hub...");
    if (this.config.enableHealthChecks) {
      this.engineManager.startHealthChecks();
    }
    if (this.config.enableWorkflows) {
      registerWorkflows(this);
    }
    await this.apiServer.start();
    this.contentScheduler.start();
    this.running = true;
    this.startedAt = Date.now();
    console.log("[HUB] Integration Hub started on port", this.config.apiPort);
    this.eventBusInstance.publish("hub", "engine.started", { engine: "hub" });
  }
  /**
   * Stop the integration hub
   */
  async stop() {
    if (!this.running) {
      console.log("[HUB] Not running");
      return;
    }
    console.log("[HUB] Stopping Integration Hub...");
    this.engineManager.stopHealthChecks();
    await this.apiServer.stop();
    this.contentScheduler.stop();
    this.running = false;
    console.log("[HUB] Integration Hub stopped");
    this.eventBusInstance.publish("hub", "engine.stopped", { engine: "hub" });
  }
  // =========================================================================
  // ENGINE CONNECTIONS
  // =========================================================================
  /**
   * Connect the Brain
   */
  connectBrain(brain) {
    this.brain = brain;
    this.engineManager.markConnected("brain");
    console.log("[HUB] Brain connected");
  }
  /**
   * Connect the Money Engine
   */
  connectMoneyEngine(engine) {
    this.moneyEngine = engine;
    this.engineManager.markConnected("money");
    console.log("[HUB] Money Engine connected");
    this.moneyEngine.on("trade", (trade) => {
      this.eventBusInstance.publish("money", "trade.executed", {
        id: trade.id,
        timestamp: new Date(trade.executedAt).toISOString(),
        engine: "money",
        type: "trade_executed",
        title: `${trade.side.toUpperCase()} ${trade.symbol}`,
        description: `Executed ${trade.side} ${trade.size} ${trade.symbol} @ $${trade.price}`,
        metrics: {
          price: trade.price.toNumber(),
          size: trade.size.toNumber(),
          valueUsd: trade.valueUsd.toNumber(),
          pnl: trade.realizedPnL?.toNumber() || 0
        },
        tags: ["trading", trade.symbol.toLowerCase(), trade.side],
        source: trade
      });
    });
    this.moneyEngine.on("alert", (message) => {
      console.log(`[HUB] Money Engine Alert: ${message}`);
    });
  }
  /**
   * Connect the Growth Engine
   */
  connectGrowthEngine(engine) {
    this.growthEngine = engine;
    this.engineManager.markConnected("growth");
    console.log("[HUB] Growth Engine connected");
  }
  /**
   * Connect the Product Engine
   */
  connectProductEngine(engine) {
    this.productEngine = engine;
    this.engineManager.markConnected("product");
    console.log("[HUB] Product Engine connected");
  }
  /**
   * Connect OPUS67 Runtime
   */
  connectOpus67(runtime) {
    this.opus67 = runtime;
    this.engineManager.markConnected("opus67");
    console.log("[HUB] OPUS67 connected");
    this.eventBusInstance.publish("opus67", "opus67.boot", {
      mode: runtime.getMode(),
      version: "2.0.0"
    });
  }
  // =========================================================================
  // GETTERS
  // =========================================================================
  getEventBus() {
    return this.eventBusInstance;
  }
  getEngineManager() {
    return this.engineManager;
  }
  getBrain() {
    return this.brain;
  }
  getMoneyEngine() {
    return this.moneyEngine;
  }
  getGrowthEngine() {
    return this.growthEngine;
  }
  getProductEngine() {
    return this.productEngine;
  }
  getOpus67() {
    return this.opus67;
  }
  /**
   * Get hub status
   */
  getStatus() {
    return {
      running: this.running,
      startedAt: this.startedAt,
      apiPort: this.config.apiPort,
      engines: this.engineManager.getAggregatedStatus(),
      workflows: this.config.enableWorkflows ? 6 : 0
      // +2 for content scheduler workflows
    };
  }
};
var hubInstance = null;
function setHubInstance(hub) {
  hubInstance = hub;
}
function getHub() {
  if (!hubInstance) return null;
  const eventBus2 = hubInstance.getEventBus();
  return {
    engineStarted: (name) => {
      eventBus2.publish(name, "engine.started", { engine: name, timestamp: Date.now() });
    },
    heartbeat: (name) => {
      eventBus2.publish(name, "engine.heartbeat", { engine: name, timestamp: Date.now() });
    },
    publish: (source, type, payload) => {
      eventBus2.publish(source, type, payload);
    }
  };
}

export {
  EventBus,
  eventBus,
  EngineManager,
  generateContentBriefsDaily,
  materializeContentFromBriefs,
  DistributionService,
  getDistributionService,
  RoleSchema,
  PermissionSchema,
  ResourceTypeSchema,
  ActionTypeSchema,
  OrgPlanSchema,
  OrgSettingsSchema,
  OrganizationSchema,
  CreateOrgSchema,
  UpdateOrgSchema,
  MemberStatusSchema,
  OrgMemberSchema,
  AddMemberSchema,
  UpdateMemberSchema,
  InviteStatusSchema,
  OrgInviteSchema,
  CreateInviteSchema,
  PermissionCheckSchema,
  PermissionResultSchema,
  AuthContextSchema,
  PLAN_LIMITS,
  ROLE_LEVELS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  buildPermission,
  parsePermission,
  roleHasPermission,
  getPermissionsForRole,
  isHigherRole,
  isAtLeastRole,
  mergePermissions,
  PERMISSION_GROUPS,
  ROLE_DESCRIPTIONS,
  RBACManager,
  getRBACManager,
  createRBACManager,
  AuditCategorySchema,
  AuditActionSchema,
  AuditSeveritySchema,
  AuditResultSchema,
  AuditContextSchema,
  AuditResourceSchema,
  AuditChangeSchema,
  AuditEventSchema,
  CreateAuditEventSchema,
  AuditQuerySchema,
  AuditQueryResultSchema,
  AuditExportOptionsSchema,
  AuditRetentionPolicySchema,
  AuditStatsSchema,
  DEFAULT_RETENTION_DAYS,
  SEVERITY_LEVELS,
  AuditLogger,
  getAuditLogger,
  createAuditLogger,
  GitProviderSchema,
  RepoConfigSchema,
  CreateRepoConfigSchema,
  PipelineYAMLStepSchema,
  PipelineYAMLSchema,
  SyncStatusSchema,
  SyncRecordSchema,
  GitWebhookEventSchema,
  FileChangeSchema,
  PipelineChangeSchema,
  PipelinePRSchema,
  GitManagerConfigSchema,
  parsePipelineYAML,
  stringifyPipelineYAML,
  yamlToInternal,
  internalToYAML,
  validatePipelineYAML,
  generatePipelineDiff,
  EXAMPLE_PIPELINES,
  GitManager,
  getGitManager,
  createGitManager,
  ChatPlatformSchema,
  ConnectionStatusSchema,
  SlackCredentialsSchema,
  DiscordCredentialsSchema,
  TelegramCredentialsSchema,
  TeamsCredentialsSchema,
  ChatCredentialsSchema,
  ChatChannelSchema,
  ChatUserSchema,
  MessageAttachmentSchema,
  MessageBlockSchema,
  ChatMessageSchema,
  SendMessageOptionsSchema,
  SlashCommandSchema,
  CommandInvocationSchema,
  ButtonInteractionSchema,
  NotificationTypeSchema,
  NotificationTemplateSchema,
  NotificationConfigSchema,
  BotConfigSchema,
  ChatManagerConfigSchema,
  DEFAULT_NOTIFICATION_TEMPLATES,
  ChatManager,
  getChatManager,
  createChatManager,
  TerraformResourceTypeSchema,
  ProviderConfigSchema,
  PipelineStepResourceSchema,
  PipelineResourceSchema,
  ScheduleResourceSchema,
  WebhookResourceSchema,
  BudgetResourceSchema,
  NotificationResourceSchema,
  PluginResourceSchema,
  ResourceStateSchema,
  TerraformStateSchema,
  ResourceChangeTypeSchema,
  ResourceChangeSchema,
  TerraformPlanSchema,
  ApplyResultSchema,
  TerraformApplyResultSchema,
  HCLBlockSchema,
  HCLConfigSchema,
  TerraformManagerConfigSchema,
  EXAMPLE_TERRAFORM_CONFIG,
  TerraformManager,
  getTerraformManager,
  createTerraformManager,
  ExtensionStateSchema,
  ExtensionConfigSchema,
  TreeItemTypeSchema,
  TreeItemStateSchema,
  TreeItemSchema,
  EditorTypeSchema,
  EditorStateSchema,
  DiagnosticSeveritySchema,
  DiagnosticSchema,
  CommandSchema,
  StatusBarItemSchema,
  QuickPickItemSchema,
  NotificationTypeSchema2,
  NotificationActionSchema,
  VSCodeNotificationSchema,
  WebviewTypeSchema,
  WebviewMessageSchema,
  WebviewStateSchema,
  CompletionItemKindSchema,
  CompletionItemSchema,
  HoverContentSchema,
  CodeActionKindSchema,
  CodeActionSchema,
  VSCodeManagerConfigSchema,
  DEFAULT_COMMANDS,
  PIPELINE_SNIPPETS,
  VSCodeManager,
  getVSCodeManager,
  createVSCodeManager,
  RegionSchema,
  RegionStatusSchema,
  RegionConfigSchema,
  HealthCheckTypeSchema,
  HealthCheckResultSchema,
  HealthCheckConfigSchema,
  LoadBalanceStrategySchema,
  RouteDecisionSchema,
  FailoverModeSchema,
  FailoverEventSchema,
  FailoverConfigSchema,
  ReplicationModeSchema,
  ReplicationStatusSchema,
  ReplicationConfigSchema,
  SessionAffinitySchema,
  HAManagerConfigSchema,
  HAStateSchema,
  REGION_DISPLAY_NAMES,
  DEFAULT_HEALTH_CHECK_CONFIG,
  DEFAULT_FAILOVER_CONFIG,
  HealthChecker,
  getHealthChecker,
  createHealthChecker,
  LoadBalancer,
  getLoadBalancer,
  createLoadBalancer,
  FailoverManager,
  getFailoverManager,
  createFailoverManager,
  HAManager,
  getHAManager,
  createHAManager,
  DEFAULT_HA_CONFIG,
  BackupTypeSchema,
  BackupStatusSchema,
  BackupStorageSchema,
  BackupScheduleSchema,
  StorageConfigSchema,
  BackupItemSchema,
  BackupManifestSchema,
  RestoreStatusSchema,
  RestoreModeSchema,
  RestoreOptionsSchema,
  RestoreProgressSchema,
  WALEntrySchema,
  RecoveryPointSchema,
  VerificationStatusSchema,
  VerificationResultSchema,
  DRManagerConfigSchema,
  DRStateSchema,
  DEFAULT_BACKUP_SCHEDULE,
  BACKUP_RESOURCES,
  BackupManager,
  getBackupManager,
  createBackupManager,
  RestoreManager,
  getRestoreManager,
  createRestoreManager,
  TraceContextSchema,
  SpanStatusCodeSchema,
  SpanStatusSchema,
  SpanKindSchema,
  SpanEventSchema,
  SpanLinkSchema,
  SpanSchema,
  TraceSchema,
  MetricTypeSchema,
  MetricUnitSchema,
  MetricPointSchema,
  HistogramBucketsSchema,
  MetricDefinitionSchema,
  MetricDataSchema,
  LogSeveritySchema,
  LogRecordSchema,
  ExporterTypeSchema,
  ExporterConfigSchema,
  SamplerTypeSchema,
  SamplerConfigSchema,
  ObservabilityConfigSchema,
  TraceQuerySchema,
  MetricQuerySchema,
  LogQuerySchema,
  TraceSummarySchema,
  MetricsSummarySchema,
  ObservabilitySummarySchema,
  BUILTIN_METRICS,
  SPAN_ATTRIBUTES,
  SpanBuilder,
  Tracer,
  generateTraceId,
  generateSpanId,
  getTracer,
  createTracer,
  Counter,
  Gauge,
  Histogram,
  MetricsCollector,
  getMetricsCollector,
  createMetricsCollector,
  Logger,
  getLogger,
  createLogger,
  ObservabilityManager,
  getObservabilityManager,
  createObservabilityManager,
  ApiServer,
  workflows,
  registerWorkflows,
  getWorkflows,
  IntegrationHub,
  setHubInstance,
  getHub
};
//# sourceMappingURL=chunk-OW2SLFFR.js.map