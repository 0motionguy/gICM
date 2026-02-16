/**
 * @fileoverview AWCN Event Logger
 * Append-only NDJSON logger for tracking system events.
 * Logs to ~/.openclaw/awcn/logs/events.ndjson
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Severity levels for log events
 */
export type Severity = "DEBUG" | "INFO" | "HIGH" | "ERROR" | "CRITICAL";

/**
 * Structure of a log event
 */
export interface LogEvent {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Event severity level */
  severity: Severity;
  /** Name of the agent that generated the event */
  agent: string;
  /** Event type/name */
  event: string;
  /** Additional event details */
  details: Record<string, unknown>;
  /** Searchable tags */
  tags: string[];
}

/**
 * Default log directory path
 */
const DEFAULT_LOG_DIR = path.join(os.homedir(), ".openclaw", "awcn", "logs");

/**
 * Default log file name
 */
const DEFAULT_LOG_FILE = "events.ndjson";

/**
 * Logger configuration
 */
let logDir = DEFAULT_LOG_DIR;
let logFile = DEFAULT_LOG_FILE;

/**
 * Configure the logger's output directory and file
 * @param dir - Directory path for log files
 * @param file - Log file name (default: events.ndjson)
 */
export function configureLogger(
  dir: string,
  file: string = DEFAULT_LOG_FILE
): void {
  logDir = dir;
  logFile = file;
}

/**
 * Reset logger to default configuration
 */
export function resetLoggerConfig(): void {
  logDir = DEFAULT_LOG_DIR;
  logFile = DEFAULT_LOG_FILE;
}

/**
 * Get the current log file path
 * @returns Full path to the log file
 */
export function getLogPath(): string {
  return path.join(logDir, logFile);
}

/**
 * Ensure the log directory exists, creating it recursively if needed
 * @throws Error if directory cannot be created
 */
function ensureLogDirectory(): void {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Log an event to the NDJSON log file
 *
 * @param severity - Event severity level (DEBUG, INFO, HIGH, ERROR, CRITICAL)
 * @param agent - Name of the agent generating the event
 * @param event - Event type or name
 * @param details - Additional event details as key-value pairs
 * @param tags - Array of searchable tags
 * @returns The logged event object
 *
 * @example
 * ```typescript
 * logEvent('INFO', 'orchestrator', 'task_started', { taskId: '123' }, ['task', 'start']);
 * ```
 *
 * @example
 * ```typescript
 * logEvent('ERROR', 'wallet-agent', 'transaction_failed', {
 *   txHash: '0x...',
 *   error: 'Insufficient funds'
 * }, ['wallet', 'transaction', 'error']);
 * ```
 */
export function logEvent(
  severity: Severity,
  agent: string,
  event: string,
  details: Record<string, unknown> = {},
  tags: string[] = []
): LogEvent {
  // Validate inputs
  if (!agent || typeof agent !== "string") {
    throw new Error("Agent name must be a non-empty string");
  }
  if (!event || typeof event !== "string") {
    throw new Error("Event name must be a non-empty string");
  }
  if (!Array.isArray(tags)) {
    throw new Error("Tags must be an array");
  }
  if (
    typeof details !== "object" ||
    details === null ||
    Array.isArray(details)
  ) {
    throw new Error("Details must be an object");
  }

  const logEntry: LogEvent = {
    timestamp: new Date().toISOString(),
    severity,
    agent,
    event,
    details,
    tags,
  };

  // Ensure directory exists before writing
  ensureLogDirectory();

  // Append to NDJSON file (newline-delimited JSON)
  const logPath = getLogPath();
  const line = JSON.stringify(logEntry) + "\n";
  fs.appendFileSync(logPath, line, "utf8");

  return logEntry;
}

/**
 * Convenience method for DEBUG level logs
 */
export function logDebug(
  agent: string,
  event: string,
  details: Record<string, unknown> = {},
  tags: string[] = []
): LogEvent {
  return logEvent("DEBUG", agent, event, details, tags);
}

/**
 * Convenience method for INFO level logs
 */
export function logInfo(
  agent: string,
  event: string,
  details: Record<string, unknown> = {},
  tags: string[] = []
): LogEvent {
  return logEvent("INFO", agent, event, details, tags);
}

/**
 * Convenience method for HIGH level logs
 */
export function logHigh(
  agent: string,
  event: string,
  details: Record<string, unknown> = {},
  tags: string[] = []
): LogEvent {
  return logEvent("HIGH", agent, event, details, tags);
}

/**
 * Convenience method for ERROR level logs
 */
export function logError(
  agent: string,
  event: string,
  details: Record<string, unknown> = {},
  tags: string[] = []
): LogEvent {
  return logEvent("ERROR", agent, event, details, tags);
}

/**
 * Convenience method for CRITICAL level logs
 */
export function logCritical(
  agent: string,
  event: string,
  details: Record<string, unknown> = {},
  tags: string[] = []
): LogEvent {
  return logEvent("CRITICAL", agent, event, details, tags);
}

/**
 * Read all events from the log file
 * @returns Array of LogEvent objects
 */
export function readEvents(): LogEvent[] {
  const logPath = getLogPath();
  if (!fs.existsSync(logPath)) {
    return [];
  }

  const content = fs.readFileSync(logPath, "utf8");
  const lines = content.trim().split("\n").filter(Boolean);

  return lines.map((line) => JSON.parse(line) as LogEvent);
}

/**
 * Query events by severity, agent, or tags
 * @param filter - Filter criteria
 * @returns Filtered array of LogEvent objects
 */
export function queryEvents(filter: {
  severity?: Severity;
  agent?: string;
  tags?: string[];
  since?: Date;
  until?: Date;
}): LogEvent[] {
  const events = readEvents();

  return events.filter((event) => {
    if (filter.severity && event.severity !== filter.severity) {
      return false;
    }
    if (filter.agent && event.agent !== filter.agent) {
      return false;
    }
    if (filter.tags && filter.tags.length > 0) {
      const hasAllTags = filter.tags.every((tag) => event.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }
    if (filter.since) {
      const eventDate = new Date(event.timestamp);
      if (eventDate < filter.since) {
        return false;
      }
    }
    if (filter.until) {
      const eventDate = new Date(event.timestamp);
      if (eventDate > filter.until) {
        return false;
      }
    }
    return true;
  });
}
