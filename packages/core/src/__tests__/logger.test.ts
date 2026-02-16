/**
 * @fileoverview Unit tests for AWCN Event Logger
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  logEvent,
  logDebug,
  logInfo,
  logHigh,
  logError,
  logCritical,
  readEvents,
  queryEvents,
  configureLogger,
  resetLoggerConfig,
  getLogPath,
  type Severity,
  type LogEvent,
} from "../logger";

describe("AWCN Event Logger", () => {
  let testDir: string;
  let testLogFile: string;

  beforeEach(() => {
    // Create a unique test directory for each test
    testDir = path.join(
      os.tmpdir(),
      "awcn-logger-test-" +
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2)
    );
    testLogFile = "test-events.ndjson";
    configureLogger(testDir, testLogFile);
  });

  afterEach(() => {
    // Clean up test files
    resetLoggerConfig();
    try {
      const logPath = path.join(testDir, testLogFile);
      if (fs.existsSync(logPath)) {
        fs.unlinkSync(logPath);
      }
      if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir, { recursive: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("logEvent", () => {
    it("should create log directory if it does not exist", () => {
      expect(fs.existsSync(testDir)).toBe(false);
      logEvent("INFO", "test-agent", "test_event", {}, []);
      expect(fs.existsSync(testDir)).toBe(true);
    });

    it("should create log file and write event", () => {
      const event = logEvent("INFO", "test-agent", "test_event", {}, []);
      const logPath = getLogPath();
      expect(fs.existsSync(logPath)).toBe(true);

      const content = fs.readFileSync(logPath, "utf8");
      const parsed = JSON.parse(content.trim());
      expect(parsed.agent).toBe("test-agent");
      expect(parsed.event).toBe("test_event");
    });

    it("should return the logged event object", () => {
      const event = logEvent(
        "ERROR",
        "wallet-agent",
        "transaction_failed",
        { txHash: "0x123" },
        ["wallet", "error"]
      );

      expect(event.severity).toBe("ERROR");
      expect(event.agent).toBe("wallet-agent");
      expect(event.event).toBe("transaction_failed");
      expect(event.details).toEqual({ txHash: "0x123" });
      expect(event.tags).toEqual(["wallet", "error"]);
      expect(event.timestamp).toBeDefined();
    });

    it("should write valid ISO timestamp", () => {
      const event = logEvent("INFO", "test-agent", "test_event", {}, []);
      const parsed = new Date(event.timestamp);
      expect(parsed.toISOString()).toBe(event.timestamp);
    });

    it("should append multiple events as NDJSON", () => {
      logEvent("INFO", "agent1", "event1", {}, []);
      logEvent("DEBUG", "agent2", "event2", {}, []);
      logEvent("ERROR", "agent3", "event3", {}, []);

      const logPath = getLogPath();
      const content = fs.readFileSync(logPath, "utf8");
      const lines = content.trim().split("\n");

      expect(lines.length).toBe(3);

      const events = lines.map((line) => JSON.parse(line));
      expect(events[0].agent).toBe("agent1");
      expect(events[1].agent).toBe("agent2");
      expect(events[2].agent).toBe("agent3");
    });

    it("should include all severity levels", () => {
      const severities: Severity[] = [
        "DEBUG",
        "INFO",
        "HIGH",
        "ERROR",
        "CRITICAL",
      ];

      severities.forEach((severity) => {
        const event = logEvent(severity, "test-agent", "test_event", {}, []);
        expect(event.severity).toBe(severity);
      });
    });

    it("should handle complex details objects", () => {
      const details = {
        nested: { deep: { value: 123 } },
        array: [1, 2, 3],
        string: "test",
        number: 42,
        boolean: true,
        nullValue: null,
      };

      const event = logEvent("INFO", "test-agent", "test_event", details, []);
      expect(event.details).toEqual(details);

      const events = readEvents();
      expect(events[0].details).toEqual(details);
    });

    it("should throw error for empty agent name", () => {
      expect(() => logEvent("INFO", "", "test_event", {}, [])).toThrow(
        "Agent name must be a non-empty string"
      );
    });

    it("should throw error for empty event name", () => {
      expect(() => logEvent("INFO", "test-agent", "", {}, [])).toThrow(
        "Event name must be a non-empty string"
      );
    });

    it("should throw error for non-array tags", () => {
      expect(() =>
        logEvent(
          "INFO",
          "test-agent",
          "test_event",
          {},
          "not-array" as unknown as string[]
        )
      ).toThrow("Tags must be an array");
    });

    it("should throw error for non-object details", () => {
      expect(() =>
        logEvent(
          "INFO",
          "test-agent",
          "test_event",
          "not-object" as unknown as Record<string, unknown>,
          []
        )
      ).toThrow("Details must be an object");
    });

    it("should throw error for array details", () => {
      expect(() =>
        logEvent(
          "INFO",
          "test-agent",
          "test_event",
          [] as unknown as Record<string, unknown>,
          []
        )
      ).toThrow("Details must be an object");
    });

    it("should throw error for null details", () => {
      expect(() =>
        logEvent(
          "INFO",
          "test-agent",
          "test_event",
          null as unknown as Record<string, unknown>,
          []
        )
      ).toThrow("Details must be an object");
    });
  });

  describe("convenience methods", () => {
    it("logDebug should log with DEBUG severity", () => {
      const event = logDebug("agent", "event", { key: "value" }, ["tag"]);
      expect(event.severity).toBe("DEBUG");
    });

    it("logInfo should log with INFO severity", () => {
      const event = logInfo("agent", "event", { key: "value" }, ["tag"]);
      expect(event.severity).toBe("INFO");
    });

    it("logHigh should log with HIGH severity", () => {
      const event = logHigh("agent", "event", { key: "value" }, ["tag"]);
      expect(event.severity).toBe("HIGH");
    });

    it("logError should log with ERROR severity", () => {
      const event = logError("agent", "event", { key: "value" }, ["tag"]);
      expect(event.severity).toBe("ERROR");
    });

    it("logCritical should log with CRITICAL severity", () => {
      const event = logCritical("agent", "event", { key: "value" }, ["tag"]);
      expect(event.severity).toBe("CRITICAL");
    });

    it("convenience methods should use default empty details and tags", () => {
      const event = logInfo("agent", "event");
      expect(event.details).toEqual({});
      expect(event.tags).toEqual([]);
    });
  });

  describe("readEvents", () => {
    it("should return empty array when log file does not exist", () => {
      const events = readEvents();
      expect(events).toEqual([]);
    });

    it("should read all events from log file", () => {
      logEvent("INFO", "agent1", "event1", { id: 1 }, ["tag1"]);
      logEvent("ERROR", "agent2", "event2", { id: 2 }, ["tag2"]);

      const events = readEvents();
      expect(events.length).toBe(2);
      expect(events[0].agent).toBe("agent1");
      expect(events[1].agent).toBe("agent2");
    });

    it("should preserve event structure", () => {
      const original = logEvent(
        "CRITICAL",
        "test-agent",
        "critical_event",
        { error: "something bad", code: 500 },
        ["critical", "production"]
      );

      const events = readEvents();
      expect(events[0]).toEqual(original);
    });
  });

  describe("queryEvents", () => {
    beforeEach(() => {
      // Create test events
      logEvent("DEBUG", "agent-a", "debug_event", {}, ["debug"]);
      logEvent("INFO", "agent-a", "info_event", {}, ["info"]);
      logEvent("INFO", "agent-b", "info_event", {}, ["info", "important"]);
      logEvent("ERROR", "agent-b", "error_event", {}, ["error"]);
      logEvent("CRITICAL", "agent-c", "critical_event", {}, [
        "critical",
        "important",
      ]);
    });

    it("should filter by severity", () => {
      const events = queryEvents({ severity: "INFO" });
      expect(events.length).toBe(2);
      expect(events.every((e) => e.severity === "INFO")).toBe(true);
    });

    it("should filter by agent", () => {
      const events = queryEvents({ agent: "agent-a" });
      expect(events.length).toBe(2);
      expect(events.every((e) => e.agent === "agent-a")).toBe(true);
    });

    it("should filter by tags (all tags must match)", () => {
      const events = queryEvents({ tags: ["important"] });
      expect(events.length).toBe(2);

      const events2 = queryEvents({ tags: ["info", "important"] });
      expect(events2.length).toBe(1);
      expect(events2[0].agent).toBe("agent-b");
    });

    it("should filter by multiple criteria", () => {
      const events = queryEvents({ severity: "INFO", agent: "agent-b" });
      expect(events.length).toBe(1);
      expect(events[0].event).toBe("info_event");
    });

    it("should return all events when no filter provided", () => {
      const events = queryEvents({});
      expect(events.length).toBe(5);
    });

    it("should filter by date range", () => {
      const before = new Date();
      before.setSeconds(before.getSeconds() - 1);

      const events = queryEvents({ since: before });
      expect(events.length).toBe(5);

      const future = new Date();
      future.setHours(future.getHours() + 1);

      const noEvents = queryEvents({ since: future });
      expect(noEvents.length).toBe(0);
    });

    it("should filter by until date", () => {
      const past = new Date();
      past.setHours(past.getHours() - 1);

      const noEvents = queryEvents({ until: past });
      expect(noEvents.length).toBe(0);

      const future = new Date();
      future.setHours(future.getHours() + 1);

      const allEvents = queryEvents({ until: future });
      expect(allEvents.length).toBe(5);
    });
  });

  describe("configuration", () => {
    it("getLogPath should return correct path", () => {
      const expectedPath = path.join(testDir, testLogFile);
      expect(getLogPath()).toBe(expectedPath);
    });

    it("configureLogger should change log location", () => {
      const newDir = path.join(os.tmpdir(), "custom-log-dir-" + Date.now());
      const newFile = "custom.ndjson";

      configureLogger(newDir, newFile);
      expect(getLogPath()).toBe(path.join(newDir, newFile));

      // Clean up
      try {
        fs.rmdirSync(newDir, { recursive: true });
      } catch {
        // Ignore
      }
    });

    it("resetLoggerConfig should restore defaults", () => {
      configureLogger("/custom/path", "custom.ndjson");
      resetLoggerConfig();

      const defaultPath = path.join(
        os.homedir(),
        ".openclaw",
        "awcn",
        "logs",
        "events.ndjson"
      );
      expect(getLogPath()).toBe(defaultPath);
    });
  });
});
