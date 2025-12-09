/**
 * OPUS 67 Markdown Memory Loader
 * Parses .claude/memory markdown files into unified memory format
 *
 * Handles:
 * - wins/*.md - Achievement records
 * - decisions/*.md - Decision logs
 * - learnings/*.md - Learning notes
 * - context/*.md - Current context files
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  appendFileSync,
  watch,
} from "fs";
import { join, basename } from "path";
import type {
  MemoryAdapter,
  MemorySource,
  UnifiedResult,
  UnifiedQuery,
  WritePayload,
  MarkdownWin,
  MarkdownDecision,
  MarkdownLearning,
} from "./types.js";

// =============================================================================
// TYPES
// =============================================================================

interface ParsedEntry {
  title: string;
  type: string;
  content: string;
  metadata: Record<string, string>;
  timestamp: Date;
  file: string;
}

// =============================================================================
// MARKDOWN LOADER
// =============================================================================

export class MarkdownLoader implements MemoryAdapter {
  readonly source: MemorySource = "markdown";

  private memoryPath: string;
  private entries: Map<string, ParsedEntry> = new Map();
  private initialized = false;
  private watcher: ReturnType<typeof watch> | null = null;

  constructor(memoryPath?: string) {
    // Use CLAUDE_PROJECT_DIR env var for Claude Code integration
    this.memoryPath =
      memoryPath ??
      join(
        process.env.CLAUDE_PROJECT_DIR || process.cwd(),
        ".claude",
        "memory",
      );
  }

  /**
   * Initialize by loading all markdown files
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    if (!existsSync(this.memoryPath)) {
      console.warn(
        `[MarkdownLoader] Memory path not found: ${this.memoryPath}`,
      );
      return false;
    }

    try {
      await this.loadAll();
      this.initialized = true;
      console.log(
        `[MarkdownLoader] Loaded ${this.entries.size} entries from ${this.memoryPath}`,
      );
      return true;
    } catch (error) {
      console.error("[MarkdownLoader] Failed to initialize:", error);
      return false;
    }
  }

  /**
   * Check if adapter is available
   */
  isAvailable(): boolean {
    return this.initialized && existsSync(this.memoryPath);
  }

  /**
   * Load all markdown files from memory directories
   */
  private async loadAll(): Promise<void> {
    const subdirs = ["wins", "decisions", "learnings", "context"];

    for (const subdir of subdirs) {
      const dirPath = join(this.memoryPath, subdir);
      if (!existsSync(dirPath)) continue;

      const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));

      for (const file of files) {
        const filePath = join(dirPath, file);
        await this.loadFile(filePath, subdir);
      }
    }
  }

  /**
   * Load and parse a single markdown file
   */
  private async loadFile(filePath: string, category: string): Promise<void> {
    try {
      const content = readFileSync(filePath, "utf-8");
      const entries = this.parseMarkdown(content, category, filePath);

      for (const entry of entries) {
        const id = `md_${category}_${entry.title.replace(/\s+/g, "_").toLowerCase()}_${entry.timestamp.getTime()}`;
        this.entries.set(id, entry);
      }
    } catch (error) {
      console.warn(`[MarkdownLoader] Failed to load ${filePath}:`, error);
    }
  }

  /**
   * Parse markdown content into entries
   */
  private parseMarkdown(
    content: string,
    category: string,
    file: string,
  ): ParsedEntry[] {
    const entries: ParsedEntry[] = [];
    const lines = content.split("\n");

    let currentEntry: Partial<ParsedEntry> | null = null;
    let contentLines: string[] = [];

    for (const line of lines) {
      // New entry starts with ### heading
      if (line.startsWith("### ")) {
        // Save previous entry
        if (currentEntry?.title) {
          currentEntry.content = contentLines.join("\n").trim();
          entries.push(currentEntry as ParsedEntry);
        }

        // Start new entry
        currentEntry = {
          title: line.replace("### ", "").trim(),
          type: category,
          metadata: {},
          timestamp: new Date(),
          file,
        };
        contentLines = [];
        continue;
      }

      // Parse metadata lines like "- **Type:** value"
      const metaMatch = line.match(/^-\s+\*\*([^:]+):\*\*\s*(.+)$/);
      if (metaMatch && currentEntry) {
        const [, key, value] = metaMatch;
        const normalizedKey = key.toLowerCase().trim();
        currentEntry.metadata![normalizedKey] = value.trim();

        // Extract timestamp
        if (
          normalizedKey === "time" ||
          normalizedKey === "timestamp" ||
          normalizedKey === "date"
        ) {
          const parsed = this.parseTimestamp(value);
          if (parsed) currentEntry.timestamp = parsed;
        }

        continue;
      }

      // Regular content line
      if (currentEntry) {
        contentLines.push(line);
      }
    }

    // Don't forget the last entry
    if (currentEntry?.title) {
      currentEntry.content = contentLines.join("\n").trim();
      entries.push(currentEntry as ParsedEntry);
    }

    return entries;
  }

  /**
   * Parse timestamp from various formats
   */
  private parseTimestamp(value: string): Date | null {
    // Try ISO format first
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) return isoDate;

    // Try time-only format (assumes today)
    const timeMatch = value.match(
      /(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?/i,
    );
    if (timeMatch) {
      const now = new Date();
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const ampm = timeMatch[4]?.toUpperCase();

      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      now.setHours(hours, minutes, seconds, 0);
      return now;
    }

    return null;
  }

  /**
   * Query markdown entries
   */
  async query(
    query: string,
    options?: Partial<UnifiedQuery>,
  ): Promise<UnifiedResult[]> {
    const limit = options?.limit ?? 10;
    const minScore = options?.minScore ?? 0.3;
    const lowerQuery = query.toLowerCase();

    const results: UnifiedResult[] = [];

    for (const [id, entry] of this.entries) {
      // Calculate relevance score
      let score = 0;

      // Title match (highest weight)
      if (entry.title.toLowerCase().includes(lowerQuery)) {
        score += 0.8;
      }

      // Content match
      if (entry.content.toLowerCase().includes(lowerQuery)) {
        score += 0.5;
      }

      // Type/category match
      if (entry.type.toLowerCase().includes(lowerQuery)) {
        score += 0.3;
      }

      // Metadata match
      for (const [key, value] of Object.entries(entry.metadata)) {
        if (
          typeof value === "string" &&
          value.toLowerCase().includes(lowerQuery)
        ) {
          score += 0.2;
        }
      }

      // Boost recent entries
      const ageInDays =
        (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 1) score *= 1.5;
      else if (ageInDays < 7) score *= 1.2;

      // Normalize score
      score = Math.min(1, score);

      if (score >= minScore || query === "") {
        results.push({
          id,
          source: "markdown",
          content: `${entry.title}: ${entry.content}`,
          score: query === "" ? 0.5 : score,
          metadata: {
            type: entry.type,
            key: entry.title,
            timestamp: entry.timestamp,
            path: entry.file,
            ...entry.metadata,
          },
        });
      }
    }

    // Apply time range filter if specified
    if (options?.timeRange) {
      const { start, end } = options.timeRange;
      return results
        .filter((r) => {
          const ts = r.metadata.timestamp;
          if (!ts) return true;
          if (start && ts < start) return false;
          if (end && ts > end) return false;
          return true;
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Write a new entry to markdown
   */
  async write(payload: WritePayload): Promise<string | null> {
    const { type, content, key, metadata } = payload;

    // Determine target file
    let subdir = "learnings";
    if (type === "win") subdir = "wins";
    else if (type === "decision") subdir = "decisions";

    const today = new Date();
    const monthStr = today.toISOString().slice(0, 7); // YYYY-MM
    const targetFile = join(this.memoryPath, subdir, `${monthStr}.md`);

    // Format entry
    const timestamp = today.toLocaleTimeString();
    const title = key ?? content.slice(0, 50).replace(/\n/g, " ");

    let entry = `\n### ${title}\n`;

    // Add metadata
    entry += `- **Type:** ${type}\n`;
    if (metadata) {
      for (const [k, v] of Object.entries(metadata)) {
        entry += `- **${k.charAt(0).toUpperCase() + k.slice(1)}:** ${v}\n`;
      }
    }
    entry += `- **Time:** ${timestamp}\n`;

    // Add content if different from title
    if (content !== title) {
      entry += `\n${content}\n`;
    }

    try {
      appendFileSync(targetFile, entry);

      // Add to local cache
      const id = `md_${subdir}_${title.replace(/\s+/g, "_").toLowerCase()}_${today.getTime()}`;
      this.entries.set(id, {
        title,
        type: subdir,
        content,
        metadata: (metadata as Record<string, string>) ?? {},
        timestamp: today,
        file: targetFile,
      });

      return id;
    } catch (error) {
      console.error("[MarkdownLoader] Failed to write:", error);
      return null;
    }
  }

  /**
   * Watch for file changes
   */
  startWatching(): void {
    if (this.watcher) return;

    this.watcher = watch(
      this.memoryPath,
      { recursive: true },
      async (event, filename) => {
        if (filename?.endsWith(".md")) {
          console.log(`[MarkdownLoader] File changed: ${filename}`);
          // Reload the changed file
          const category = filename.split(/[/\\]/)[0];
          const filePath = join(this.memoryPath, filename);
          if (existsSync(filePath)) {
            await this.loadFile(filePath, category);
          }
        }
      },
    );
  }

  /**
   * Stop watching for changes
   */
  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * Get all wins
   */
  getWins(): MarkdownWin[] {
    return Array.from(this.entries.values())
      .filter((e) => e.type === "wins")
      .map((e) => ({
        title: e.title,
        type: e.metadata.type ?? "general",
        value: parseInt(e.metadata.value ?? "1", 10),
        description: e.content,
        timestamp: e.timestamp,
      }));
  }

  /**
   * Get all decisions
   */
  getDecisions(): MarkdownDecision[] {
    return Array.from(this.entries.values())
      .filter((e) => e.type === "decisions")
      .map((e) => ({
        title: e.title,
        description: e.content,
        rationale: e.metadata.rationale,
        review: e.metadata.review,
        timestamp: e.timestamp,
      }));
  }

  /**
   * Get all learnings
   */
  getLearnings(): MarkdownLearning[] {
    return Array.from(this.entries.values())
      .filter((e) => e.type === "learnings")
      .map((e) => ({
        title: e.title,
        content: e.content,
        category: e.metadata.category,
        timestamp: e.timestamp,
      }));
  }

  /**
   * Get stats
   */
  async getStats(): Promise<{ count: number; lastSync?: Date }> {
    let lastSync: Date | undefined;
    for (const entry of this.entries.values()) {
      if (!lastSync || entry.timestamp > lastSync) {
        lastSync = entry.timestamp;
      }
    }

    return {
      count: this.entries.size,
      lastSync,
    };
  }

  /**
   * Disconnect (stop watching)
   */
  async disconnect(): Promise<void> {
    this.stopWatching();
    this.entries.clear();
    this.initialized = false;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createMarkdownLoader(memoryPath?: string): MarkdownLoader {
  return new MarkdownLoader(memoryPath);
}
