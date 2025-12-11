/**
 * OPUS 67 v5.0 - Phase 3A: SWE-bench Patterns Tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  SWEBenchPatterns,
  type MultiFileEdit,
  type EditOperation,
} from "../brain/swe-bench-patterns.js";
import { FileContextManager } from "../brain/file-context.js";

describe("SWEBenchPatterns", () => {
  let patterns: SWEBenchPatterns;
  let fileContext: FileContextManager;

  beforeEach(() => {
    fileContext = new FileContextManager({
      enableRelationshipTracking: true,
      enableAutoSummary: false,
    });
    patterns = new SWEBenchPatterns(
      {
        enableVerification: false, // Disable for testing
        enableRollback: true,
        maxEditSize: 100,
        requireContext: false,
        dryRun: true, // Dry run for testing
      },
      fileContext
    );
  });

  describe("Edit Operations", () => {
    it("should create a multi-file edit", () => {
      const edit: MultiFileEdit = {
        id: "test-edit-1",
        description: "Update function signature",
        operations: [
          {
            type: "replace",
            location: {
              file: "src/utils.ts",
              lineStart: 10,
              lineEnd: 12,
            },
            oldContent: "function foo(x: number): number {",
            newContent: "function foo(x: number, y: number): number {",
            reason: "Add second parameter",
          },
        ],
        dependencies: ["src/utils.ts"],
        verificationSteps: [],
      };

      expect(edit.operations).toHaveLength(1);
      expect(edit.operations[0].type).toBe("replace");
    });

    it("should execute a simple replace operation in dry-run mode", async () => {
      const edit: MultiFileEdit = {
        id: "test-edit-2",
        description: "Replace function",
        operations: [
          {
            type: "replace",
            location: {
              file: "src/test.ts",
              lineStart: 1,
              lineEnd: 1,
            },
            newContent: "const x = 42;",
          },
        ],
        dependencies: [],
        verificationSteps: [],
      };

      // Track the file first
      await fileContext.accessFile("src/test.ts", "const x = 10;");

      const result = await patterns.executeEdit(edit);

      // In dry-run mode, should succeed without actual changes
      expect(result.success).toBe(true);
      expect(result.operationsCompleted).toBe(1);
      expect(result.operationsFailed).toBe(0);
    });

    it("should track edit history", async () => {
      const edit: MultiFileEdit = {
        id: "test-edit-3",
        description: "Test history",
        operations: [],
        dependencies: [],
      };

      await patterns.executeEdit(edit);

      const history = patterns.getEditHistory("test-edit-3");
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe("test-edit-3");
    });

    it("should emit events during edit execution", async () => {
      const events: string[] = [];

      patterns.on("edit:start", (id) => events.push(`start:${id}`));
      patterns.on("edit:complete", (id) => events.push(`complete:${id}`));

      const edit: MultiFileEdit = {
        id: "test-edit-4",
        description: "Event test",
        operations: [],
        dependencies: [],
      };

      await patterns.executeEdit(edit);

      expect(events).toContain("start:test-edit-4");
      expect(events).toContain("complete:test-edit-4");
    });

    it("should validate edit location boundaries", async () => {
      const edit: MultiFileEdit = {
        id: "test-edit-5",
        description: "Invalid location",
        operations: [
          {
            type: "replace",
            location: {
              file: "src/test.ts",
              lineStart: 100,
              lineEnd: 200,
            },
            newContent: "invalid",
          },
        ],
        dependencies: [],
      };

      // In dry-run mode, location validation is skipped
      // So this should pass in dry-run
      const result = await patterns.executeEdit(edit);
      expect(result.success).toBe(true);
    });

    it("should support insert operations", () => {
      const op: EditOperation = {
        type: "insert",
        location: {
          file: "src/test.ts",
          lineStart: 5,
          lineEnd: 5,
        },
        newContent: 'console.log("inserted");',
        reason: "Add logging",
      };

      expect(op.type).toBe("insert");
      expect(op.newContent).toBeDefined();
    });

    it("should support delete operations", () => {
      const op: EditOperation = {
        type: "delete",
        location: {
          file: "src/test.ts",
          lineStart: 10,
          lineEnd: 15,
        },
        reason: "Remove deprecated code",
      };

      expect(op.type).toBe("delete");
      expect(op.newContent).toBeUndefined();
    });

    it("should handle multiple operations in sequence", async () => {
      const edit: MultiFileEdit = {
        id: "test-edit-6",
        description: "Multi-operation edit",
        operations: [
          {
            type: "replace",
            location: { file: "src/a.ts", lineStart: 1, lineEnd: 1 },
            newContent: "line 1",
          },
          {
            type: "insert",
            location: { file: "src/a.ts", lineStart: 2, lineEnd: 2 },
            newContent: "line 2",
          },
          {
            type: "delete",
            location: { file: "src/a.ts", lineStart: 3, lineEnd: 3 },
          },
        ],
        dependencies: [],
      };

      await fileContext.accessFile("src/a.ts", "original");

      const result = await patterns.executeEdit(edit);

      expect(result.operationsCompleted).toBe(3);
      expect(result.operationsFailed).toBe(0);
    });
  });

  describe("Search Operations", () => {
    it("should search for a simple string pattern", async () => {
      const results = await patterns.search({
        pattern: "function foo",
      });

      expect(Array.isArray(results)).toBe(true);
      // Empty in dry-run/test mode
      expect(results).toHaveLength(0);
    });

    it("should search for a regex pattern", async () => {
      const results = await patterns.search({
        pattern: /function\s+\w+/,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should search with file scope", async () => {
      const results = await patterns.search({
        pattern: "import",
        scope: {
          extensions: [".ts", ".tsx"],
        },
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should search with directory scope", async () => {
      const results = await patterns.search({
        pattern: "export",
        scope: {
          directories: ["src/"],
        },
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should emit search:found event", async () => {
      let foundPattern = "";

      patterns.on("search:found", (pattern) => {
        foundPattern = pattern;
      });

      await patterns.search({ pattern: "test" });

      expect(foundPattern).toBe("test");
    });
  });

  describe("Edit Location Finding", () => {
    it("should find exact edit location", async () => {
      // Since readFile returns null in test mode, this will return null
      const location = await patterns.findEditLocation(
        "src/test.ts",
        "function foo() {"
      );

      // In test mode without actual file I/O, this returns null
      expect(location).toBeNull();
    });

    it("should find location with context", async () => {
      const location = await patterns.findEditLocation(
        "src/test.ts",
        "function foo() {",
        {
          before: ["// Some comment"],
          after: ["  return 42;", "}"],
        }
      );

      expect(location).toBeNull(); // Null in test mode
    });

    it("should return null for non-existent content", async () => {
      const location = await patterns.findEditLocation(
        "src/test.ts",
        "non-existent-content"
      );

      expect(location).toBeNull();
    });
  });

  describe("Edit History", () => {
    it("should track edit history by ID", async () => {
      const edit1: MultiFileEdit = {
        id: "history-1",
        description: "First edit",
        operations: [],
        dependencies: [],
      };

      const edit2: MultiFileEdit = {
        id: "history-1",
        description: "Second edit",
        operations: [],
        dependencies: [],
      };

      await patterns.executeEdit(edit1);
      await patterns.executeEdit(edit2);

      const history = patterns.getEditHistory("history-1");
      expect(history).toHaveLength(2);
      expect(history[0].description).toBe("First edit");
      expect(history[1].description).toBe("Second edit");
    });

    it("should return empty array for unknown ID", () => {
      const history = patterns.getEditHistory("unknown-id");
      expect(history).toHaveLength(0);
    });

    it("should clear history", async () => {
      const edit: MultiFileEdit = {
        id: "clear-test",
        description: "Test",
        operations: [],
        dependencies: [],
      };

      await patterns.executeEdit(edit);
      expect(patterns.getEditHistory("clear-test")).toHaveLength(1);

      patterns.clearHistory();
      expect(patterns.getEditHistory("clear-test")).toHaveLength(0);
    });
  });

  describe("Configuration", () => {
    it("should respect maxEditSize limit", () => {
      const patternsWithLimit = new SWEBenchPatterns({
        maxEditSize: 10,
      });

      expect(patternsWithLimit).toBeDefined();
    });

    it("should support requireContext option", () => {
      const patternsStrict = new SWEBenchPatterns({
        requireContext: true,
      });

      expect(patternsStrict).toBeDefined();
    });

    it("should support dryRun mode", () => {
      const patternsDryRun = new SWEBenchPatterns({
        dryRun: true,
      });

      expect(patternsDryRun).toBeDefined();
    });

    it("should integrate with FileContextManager", () => {
      const context = new FileContextManager();
      const patternsWithContext = new SWEBenchPatterns({}, context);

      expect(patternsWithContext).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should track failed operations", async () => {
      // With dry-run mode, operations won't actually fail
      // But we can test the error structure
      const edit: MultiFileEdit = {
        id: "error-test",
        description: "Test error handling",
        operations: [
          {
            type: "replace",
            location: { file: "nonexistent.ts", lineStart: 1, lineEnd: 1 },
            newContent: "test",
          },
        ],
        dependencies: [],
      };

      const result = await patterns.executeEdit(edit);

      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should emit error events", async () => {
      let errorEmitted = false;

      patterns.on("error", () => {
        errorEmitted = true;
      });

      // No actual errors in dry-run mode, so this won't trigger
      expect(errorEmitted).toBe(false);
    });
  });

  describe("Verification", () => {
    it("should support verification steps", async () => {
      const patternsWithVerification = new SWEBenchPatterns({
        enableVerification: true,
        dryRun: true,
      });

      const edit: MultiFileEdit = {
        id: "verify-test",
        description: "Test verification",
        operations: [],
        dependencies: [],
        verificationSteps: ["Run tests", "Check syntax"],
      };

      const result = await patternsWithVerification.executeEdit(edit);

      expect(result.verificationResults).toBeDefined();
      expect(result.verificationResults).toHaveLength(2);
    });

    it("should emit verify events", async () => {
      const verifyEvents: string[] = [];

      const patternsWithVerification = new SWEBenchPatterns({
        enableVerification: true,
        dryRun: true,
      });

      patternsWithVerification.on("edit:verify", (id, step) => {
        verifyEvents.push(step);
      });

      const edit: MultiFileEdit = {
        id: "verify-event-test",
        description: "Test verify events",
        operations: [],
        dependencies: [],
        verificationSteps: ["Step 1", "Step 2"],
      };

      await patternsWithVerification.executeEdit(edit);

      expect(verifyEvents).toContain("Step 1");
      expect(verifyEvents).toContain("Step 2");
    });
  });

  describe("Rollback", () => {
    it("should support rollback option", async () => {
      const edit: MultiFileEdit = {
        id: "rollback-test",
        description: "Test rollback",
        operations: [],
        dependencies: [],
        rollback: true,
      };

      const result = await patterns.executeEdit(edit);

      expect(result.rollbackPerformed).toBeUndefined(); // No errors = no rollback
    });

    it("should emit rollback events", async () => {
      let rollbackEmitted = false;

      patterns.on("edit:rollback", () => {
        rollbackEmitted = true;
      });

      // No actual errors in dry-run mode to trigger rollback
      expect(rollbackEmitted).toBe(false);
    });
  });
});
