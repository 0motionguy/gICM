/**
 * OPUS 67 v5.0 - Phase 2B: File-Aware Memory System
 *
 * FileContextManager tracks per-file context, cross-file relationships,
 * and provides consistency checking for intelligent code editing.
 */

import { EventEmitter } from "eventemitter3";
import crypto from "crypto";
import path from "path";

/**
 * Metadata about a single file
 */
export interface FileMetadata {
  path: string;
  absolutePath: string;
  hash: string; // Content hash for change detection
  language: string;
  size: number;
  lastModified: Date;
  lastAccessed: Date;
  accessCount: number;

  // Code structure
  imports: string[];
  exports: string[];
  functions: string[];
  classes: string[];
  types: string[];

  // Relationships
  dependencies: Set<string>; // Files this file imports from
  dependents: Set<string>; // Files that import from this file

  // Context
  summary?: string; // AI-generated summary
  purpose?: string; // What this file does
  lastEdit?: {
    timestamp: Date;
    description: string;
    linesChanged: number;
  };
}

/**
 * File relationship types
 */
export type RelationType =
  | "imports"
  | "exports_to"
  | "similar_to"
  | "modified_together"
  | "related_feature";

/**
 * Relationship between two files
 */
export interface FileRelationship {
  from: string;
  to: string;
  type: RelationType;
  strength: number; // 0-1
  metadata?: Record<string, unknown>;
}

/**
 * Consistency check result
 */
export interface ConsistencyCheck {
  file: string;
  passed: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

/**
 * File context events
 */
export interface FileContextEvents {
  "file:accessed": (path: string) => void;
  "file:modified": (path: string, metadata: FileMetadata) => void;
  "file:deleted": (path: string) => void;
  "relationship:discovered": (rel: FileRelationship) => void;
  "consistency:warning": (check: ConsistencyCheck) => void;
  "consistency:error": (check: ConsistencyCheck) => void;
}

/**
 * Configuration for FileContextManager
 */
export interface FileContextConfig {
  maxFiles: number;
  maxSessionFiles?: number;
  enableAutoSummary: boolean;
  enableRelationshipTracking: boolean;
  enableConsistencyChecks: boolean;
  cacheDirectory?: string;
}

const DEFAULT_CONFIG: FileContextConfig = {
  maxFiles: 500,
  enableAutoSummary: true,
  enableRelationshipTracking: true,
  enableConsistencyChecks: true,
};

/**
 * FileContextManager - Tracks per-file context and relationships
 */
export class FileContextManager extends EventEmitter<FileContextEvents> {
  private files: Map<string, FileMetadata> = new Map();
  private relationships: Map<string, Set<FileRelationship>> = new Map();
  private config: FileContextConfig;

  // Session tracking
  private sessionStart: Date;
  private sessionFiles: Set<string> = new Set();

  constructor(config: Partial<FileContextConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionStart = new Date();
  }

  // =========================================================================
  // File Tracking
  // =========================================================================

  /**
   * Register a file access
   */
  async accessFile(filePath: string, content?: string): Promise<FileMetadata> {
    const normalized = this.normalizePath(filePath);

    let metadata = this.files.get(normalized);

    if (!metadata) {
      // First time seeing this file
      metadata = await this.createMetadata(filePath, content);
      this.files.set(normalized, metadata);
      this.sessionFiles.add(normalized);

      // Now update relationships after file is in the map
      if (content && this.config.enableRelationshipTracking) {
        await this.updateRelationships(metadata);

        // Re-check existing files that might now be able to resolve this new file
        await this.recheckDependencies(normalized);
      }
    } else {
      // Update access info
      metadata.lastAccessed = new Date();
      metadata.accessCount++;

      // Check if content changed
      if (content) {
        const newHash = this.hashContent(content);
        if (newHash !== metadata.hash) {
          await this.updateMetadata(metadata, content);
        }
      }
    }

    this.emit("file:accessed", normalized);

    return metadata;
  }

  /**
   * Register a file modification
   */
  async modifyFile(
    filePath: string,
    content: string,
    description: string,
    linesChanged: number
  ): Promise<FileMetadata> {
    const metadata = await this.accessFile(filePath, content);

    metadata.lastEdit = {
      timestamp: new Date(),
      description,
      linesChanged,
    };

    await this.updateMetadata(metadata, content);

    // Run consistency checks if enabled
    if (this.config.enableConsistencyChecks) {
      const check = await this.checkConsistency(filePath);
      if (!check.passed) {
        if (check.errors.length > 0) {
          this.emit("consistency:error", check);
        } else if (check.warnings.length > 0) {
          this.emit("consistency:warning", check);
        }
      }
    }

    this.emit("file:modified", filePath, metadata);

    return metadata;
  }

  /**
   * Delete a file from tracking
   */
  deleteFile(filePath: string): void {
    const normalized = this.normalizePath(filePath);

    // Remove from maps
    this.files.delete(normalized);
    this.relationships.delete(normalized);
    this.sessionFiles.delete(normalized);

    // Remove from other files' dependencies
    for (const metadata of this.files.values()) {
      metadata.dependencies.delete(normalized);
      metadata.dependents.delete(normalized);
    }

    this.emit("file:deleted", normalized);
  }

  // =========================================================================
  // Metadata Management
  // =========================================================================

  /**
   * Create metadata for a new file
   */
  private async createMetadata(
    filePath: string,
    content?: string
  ): Promise<FileMetadata> {
    const normalized = this.normalizePath(filePath);
    const absolutePath = path.resolve(filePath);

    const metadata: FileMetadata = {
      path: normalized,
      absolutePath,
      hash: content ? this.hashContent(content) : "",
      language: this.detectLanguage(filePath),
      size: content?.length || 0,
      lastModified: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      types: [],
      dependencies: new Set(),
      dependents: new Set(),
    };

    if (content) {
      // Analyze content but skip relationship tracking (will do after file is added to map)
      await this.analyzeContent(metadata, content, false);
    }

    return metadata;
  }

  /**
   * Update metadata after content change
   */
  private async updateMetadata(
    metadata: FileMetadata,
    content: string
  ): Promise<void> {
    metadata.hash = this.hashContent(content);
    metadata.size = content.length;
    metadata.lastModified = new Date();

    // Re-analyze content
    await this.analyzeContent(metadata, content);

    // Update relationships
    if (this.config.enableRelationshipTracking) {
      await this.updateRelationships(metadata);
    }
  }

  /**
   * Analyze file content to extract structure
   */
  private async analyzeContent(
    metadata: FileMetadata,
    content: string,
    updateRelationships = true
  ): Promise<void> {
    const { language } = metadata;

    // Extract imports
    metadata.imports = this.extractImports(content, language);

    // Extract exports
    metadata.exports = this.extractExports(content, language);

    // Extract functions
    metadata.functions = this.extractFunctions(content, language);

    // Extract classes
    metadata.classes = this.extractClasses(content, language);

    // Extract types
    metadata.types = this.extractTypes(content, language);

    // Generate summary if enabled
    if (this.config.enableAutoSummary && !metadata.summary) {
      metadata.summary = this.generateSummary(metadata, content);
    }

    // Update relationships if enabled
    if (updateRelationships && this.config.enableRelationshipTracking) {
      await this.updateRelationships(metadata);
    }
  }

  // =========================================================================
  // Relationship Tracking
  // =========================================================================

  /**
   * Update relationships for a file
   */
  private async updateRelationships(metadata: FileMetadata): Promise<void> {
    const { path: filePath, imports } = metadata;

    // Clear old dependencies
    metadata.dependencies.clear();

    // Build new dependencies from imports
    for (const importPath of imports) {
      const resolved = this.resolveImport(filePath, importPath);
      if (resolved) {
        metadata.dependencies.add(resolved);

        // Update the imported file's dependents
        const imported = this.files.get(resolved);
        if (imported) {
          imported.dependents.add(filePath);
        }

        // Create relationship
        const relationship: FileRelationship = {
          from: filePath,
          to: resolved,
          type: "imports",
          strength: 1.0,
        };

        this.addRelationship(relationship);
      }
    }
  }

  /**
   * Re-check existing files that might import the newly added file
   */
  private async recheckDependencies(newFilePath: string): Promise<void> {
    for (const [path, metadata] of this.files) {
      if (path === newFilePath) continue;

      // Re-resolve imports for this file
      await this.updateRelationships(metadata);
    }
  }

  /**
   * Add a relationship
   */
  private addRelationship(rel: FileRelationship): void {
    if (!this.relationships.has(rel.from)) {
      this.relationships.set(rel.from, new Set());
    }

    this.relationships.get(rel.from)!.add(rel);
    this.emit("relationship:discovered", rel);
  }

  /**
   * Get all relationships for a file
   */
  getRelationships(filePath: string): FileRelationship[] {
    const normalized = this.normalizePath(filePath);
    const rels = this.relationships.get(normalized);
    return rels ? Array.from(rels) : [];
  }

  /**
   * Get related files (dependencies + dependents)
   */
  getRelatedFiles(filePath: string, maxDepth = 2): Set<string> {
    const related = new Set<string>();
    const visited = new Set<string>();
    const queue: Array<{ path: string; depth: number }> = [
      { path: filePath, depth: 0 },
    ];

    while (queue.length > 0) {
      const { path: current, depth } = queue.shift()!;

      if (visited.has(current) || depth > maxDepth) {
        continue;
      }

      visited.add(current);
      const metadata = this.files.get(current);

      if (!metadata) continue;

      // Add dependencies
      for (const dep of metadata.dependencies) {
        related.add(dep);
        if (depth + 1 <= maxDepth) {
          queue.push({ path: dep, depth: depth + 1 });
        }
      }

      // Add dependents
      for (const dependent of metadata.dependents) {
        related.add(dependent);
        if (depth + 1 <= maxDepth) {
          queue.push({ path: dependent, depth: depth + 1 });
        }
      }
    }

    related.delete(filePath); // Remove self
    return related;
  }

  // =========================================================================
  // Consistency Checking
  // =========================================================================

  /**
   * Check consistency of a file after modification
   */
  async checkConsistency(filePath: string): Promise<ConsistencyCheck> {
    const normalized = this.normalizePath(filePath);
    const metadata = this.files.get(normalized);

    const check: ConsistencyCheck = {
      file: filePath,
      passed: true,
      warnings: [],
      errors: [],
      suggestions: [],
    };

    if (!metadata) {
      check.passed = false;
      check.errors.push("File not found in context");
      return check;
    }

    // Check 1: Broken imports
    for (const importPath of metadata.imports) {
      const resolved = this.resolveImport(filePath, importPath);
      if (!resolved || !this.files.has(resolved)) {
        check.warnings.push(`Import not found: ${importPath}`);
        check.passed = false;
      }
    }

    // Check 2: Unused exports
    if (metadata.exports.length > 0 && metadata.dependents.size === 0) {
      check.suggestions.push("This file exports code but has no dependents");
    }

    // Check 3: Circular dependencies
    const circular = this.detectCircularDependency(filePath);
    if (circular.length > 0) {
      check.warnings.push(
        `Circular dependency detected: ${circular.join(" -> ")}`
      );
      check.passed = false;
    }

    // Check 4: Type consistency (TypeScript/JavaScript)
    if (
      metadata.language === "typescript" ||
      metadata.language === "javascript"
    ) {
      // Check if imported types exist
      for (const dep of metadata.dependencies) {
        const depMetadata = this.files.get(dep);
        if (depMetadata && depMetadata.exports.length === 0) {
          check.suggestions.push(`Dependency ${dep} has no exports`);
        }
      }
    }

    return check;
  }

  /**
   * Detect circular dependencies
   */
  private detectCircularDependency(
    filePath: string,
    visited = new Set<string>()
  ): string[] {
    if (visited.has(filePath)) {
      return [filePath];
    }

    visited.add(filePath);
    const metadata = this.files.get(filePath);

    if (!metadata) return [];

    for (const dep of metadata.dependencies) {
      // Pass the same visited set (not a copy) to accumulate path
      const cycle = this.detectCircularDependency(dep, visited);
      if (cycle.length > 0) {
        return [filePath, ...cycle];
      }
    }

    return [];
  }

  // =========================================================================
  // Code Analysis Helpers
  // =========================================================================

  /**
   * Extract import statements
   */
  private extractImports(content: string, language: string): string[] {
    const imports: string[] = [];

    if (language === "typescript" || language === "javascript") {
      // Match: import { x } from 'path'
      const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      // Match: import 'path' (bare imports)
      const bareImportRegex = /import\s+['"]([^'"]+)['"]/g;
      while ((match = bareImportRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      // Match: require('path')
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
      while ((match = requireRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    } else if (language === "python") {
      // Match: from x import y
      const fromImportRegex = /^\s*from\s+(\S+)\s+import\s+/gm;
      let match;
      while ((match = fromImportRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      // Match: import x
      const importRegex = /^\s*import\s+(\S+)/gm;
      while ((match = importRegex.exec(content)) !== null) {
        // Handle comma-separated imports
        const modules = match[1].split(",").map((m) => m.trim());
        imports.push(...modules);
      }
    }

    return [...new Set(imports)]; // Unique
  }

  /**
   * Extract export statements
   */
  private extractExports(content: string, language: string): string[] {
    const exports: string[] = [];

    if (language === "typescript" || language === "javascript") {
      // Match: export function name
      const exportRegex =
        /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        exports.push(match[1]);
      }

      // Match: export { x, y }
      const namedExportRegex = /export\s+\{([^}]+)\}/g;
      while ((match = namedExportRegex.exec(content)) !== null) {
        const names = match[1]
          .split(",")
          .map((n) => n.trim().split(/\s+as\s+/)[0]);
        exports.push(...names);
      }
    } else if (language === "python") {
      // Match: def name, class name (top-level only)
      const defRegex = /^(?:def|class)\s+(\w+)/gm;
      let match;
      while ((match = defRegex.exec(content)) !== null) {
        exports.push(match[1]);
      }
    }

    return [...new Set(exports)];
  }

  /**
   * Extract function definitions
   */
  private extractFunctions(content: string, language: string): string[] {
    const functions: string[] = [];

    if (language === "typescript" || language === "javascript") {
      const funcRegex =
        /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g;
      let match;
      while ((match = funcRegex.exec(content)) !== null) {
        functions.push(match[1] || match[2]);
      }
    } else if (language === "python") {
      // Allow optional indentation before def
      const funcRegex = /^\s*def\s+(\w+)/gm;
      let match;
      while ((match = funcRegex.exec(content)) !== null) {
        functions.push(match[1]);
      }
    }

    return functions;
  }

  /**
   * Extract class definitions
   */
  private extractClasses(content: string, language: string): string[] {
    const classes: string[] = [];
    const classRegex = /class\s+(\w+)/g;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[1]);
    }

    return classes;
  }

  /**
   * Extract type definitions
   */
  private extractTypes(content: string, language: string): string[] {
    const types: string[] = [];

    if (language === "typescript") {
      const typeRegex = /(?:type|interface)\s+(\w+)/g;
      let match;
      while ((match = typeRegex.exec(content)) !== null) {
        types.push(match[1]);
      }
    }

    return types;
  }

  /**
   * Generate a summary of the file
   */
  private generateSummary(metadata: FileMetadata, content: string): string {
    const parts: string[] = [];

    if (metadata.classes.length > 0) {
      parts.push(
        `Defines ${metadata.classes.length} class(es): ${metadata.classes.slice(0, 3).join(", ")}`
      );
    }

    if (metadata.functions.length > 0) {
      parts.push(`${metadata.functions.length} function(s)`);
    }

    if (metadata.types.length > 0) {
      parts.push(`${metadata.types.length} type(s)`);
    }

    if (metadata.exports.length > 0) {
      parts.push(`Exports: ${metadata.exports.slice(0, 5).join(", ")}`);
    }

    return parts.length > 0 ? parts.join(". ") : "Code file";
  }

  // =========================================================================
  // Utilities
  // =========================================================================

  /**
   * Normalize file path
   */
  private normalizePath(filePath: string): string {
    return path.normalize(filePath).replace(/\\/g, "/");
  }

  /**
   * Detect language from file extension
   */
  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    const langMap: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".py": "python",
      ".rs": "rust",
      ".go": "go",
      ".java": "java",
      ".cpp": "cpp",
      ".c": "c",
      ".rb": "ruby",
      ".php": "php",
      ".swift": "swift",
      ".kt": "kotlin",
      ".sol": "solidity",
    };

    return langMap[ext] || "unknown";
  }

  /**
   * Resolve an import path to normalized path
   */
  private resolveImport(fromFile: string, importPath: string): string | null {
    // Skip node_modules and external packages
    if (!importPath.startsWith(".")) {
      return null;
    }

    const fromDir = path.dirname(fromFile);
    // Use path.join instead of path.resolve to keep relative paths
    let resolved = path.join(fromDir, importPath);
    resolved = this.normalizePath(resolved);

    // Try adding common extensions
    const extensions = [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.js"];

    for (const ext of extensions) {
      const withExt = resolved + ext;
      if (this.files.has(withExt)) {
        return withExt;
      }
    }

    // Return as-is if no match found
    return resolved;
  }

  /**
   * Hash content for change detection
   */
  private hashContent(content: string): string {
    return crypto
      .createHash("sha256")
      .update(content)
      .digest("hex")
      .slice(0, 16);
  }

  // =========================================================================
  // Query API
  // =========================================================================

  /**
   * Get metadata for a file
   */
  getFile(filePath: string): FileMetadata | undefined {
    return this.files.get(this.normalizePath(filePath));
  }

  /**
   * Get all tracked files
   */
  getAllFiles(): FileMetadata[] {
    return Array.from(this.files.values());
  }

  /**
   * Get files accessed in current session
   */
  getSessionFiles(): FileMetadata[] {
    return Array.from(this.sessionFiles)
      .map((path) => this.files.get(path))
      .filter((f): f is FileMetadata => f !== undefined);
  }

  /**
   * Get files modified in current session
   */
  getModifiedFiles(): FileMetadata[] {
    return this.getSessionFiles().filter(
      (f) => f.lastEdit && f.lastEdit.timestamp >= this.sessionStart
    );
  }

  /**
   * Search files by name pattern
   */
  searchFiles(pattern: string | RegExp): FileMetadata[] {
    const regex =
      typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
    return this.getAllFiles().filter((f) => regex.test(f.path));
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalFiles: this.files.size,
      sessionFiles: this.sessionFiles.size,
      modifiedFiles: this.getModifiedFiles().length,
      totalRelationships: Array.from(this.relationships.values()).reduce(
        (sum, set) => sum + set.size,
        0
      ),
      languages: this.getLanguageBreakdown(),
    };
  }

  /**
   * Get language breakdown
   */
  private getLanguageBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const file of this.files.values()) {
      breakdown[file.language] = (breakdown[file.language] || 0) + 1;
    }

    return breakdown;
  }

  /**
   * Clear all context
   */
  clear(): void {
    this.files.clear();
    this.relationships.clear();
    this.sessionFiles.clear();
    this.sessionStart = new Date();
  }
}

// =========================================================================
// Singleton Pattern
// =========================================================================

let instance: FileContextManager | null = null;

export function createFileContext(
  config?: Partial<FileContextConfig>
): FileContextManager {
  instance = new FileContextManager(config);
  return instance;
}

export function getFileContext(): FileContextManager {
  if (!instance) {
    instance = new FileContextManager();
  }
  return instance;
}
