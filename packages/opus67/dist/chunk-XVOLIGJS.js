import { existsSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, relative } from 'path';
import { createHash } from 'crypto';

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

export { ContextIndexer };
