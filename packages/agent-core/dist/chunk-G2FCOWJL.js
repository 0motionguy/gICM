// src/observability/log-aggregator.ts
import { trace } from "@opentelemetry/api";
import { existsSync, mkdirSync, appendFileSync } from "fs";
import { join } from "path";
var LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
};
var LOG_COLORS = {
  debug: "\x1B[36m",
  // Cyan
  info: "\x1B[32m",
  // Green
  warn: "\x1B[33m",
  // Yellow
  error: "\x1B[31m",
  // Red
  fatal: "\x1B[35m"
  // Magenta
};
var RESET_COLOR = "\x1B[0m";
var ConsoleTransport = class {
  name = "console";
  log(entry) {
    const color = LOG_COLORS[entry.level];
    const prefix = `${color}[${entry.level.toUpperCase()}]${RESET_COLOR}`;
    const timestamp = new Date(entry.timestamp).toISOString();
    let message = `${prefix} ${timestamp} [${entry.serviceName}] ${entry.message}`;
    if (entry.traceId) {
      message += ` (trace: ${entry.traceId})`;
    }
    if (entry.context && Object.keys(entry.context).length > 0) {
      message += `
  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }
    if (entry.error) {
      message += `
  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `
${entry.error.stack}`;
      }
    }
    console.log(message);
  }
};
var FileTransport = class {
  name = "file";
  logDirectory;
  logFile;
  constructor(logDirectory) {
    this.logDirectory = logDirectory;
    if (!existsSync(logDirectory)) {
      mkdirSync(logDirectory, { recursive: true });
    }
    const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    this.logFile = join(logDirectory, `app-${date}.log`);
  }
  log(entry) {
    const line = JSON.stringify(entry) + "\n";
    appendFileSync(this.logFile, line, "utf-8");
  }
};
var HttpTransport = class {
  name = "http";
  endpoint;
  batchSize;
  batch = [];
  flushInterval;
  constructor(endpoint, batchSize = 100, flushIntervalMs = 5e3) {
    this.endpoint = endpoint;
    this.batchSize = batchSize;
    this.flushInterval = setInterval(() => {
      this.flush();
    }, flushIntervalMs);
  }
  log(entry) {
    this.batch.push(entry);
    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }
  async flush() {
    if (this.batch.length === 0) return;
    const logs = [...this.batch];
    this.batch = [];
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs })
      });
    } catch (error) {
      console.error("[HttpTransport] Failed to send logs:", error);
      this.batch.unshift(...logs);
    }
  }
  destroy() {
    clearInterval(this.flushInterval);
    this.flush();
  }
};
var LogAggregator = class _LogAggregator {
  config;
  transports = [];
  constructor(config) {
    this.config = {
      minLevel: "info",
      transports: [],
      enableTraceCorrelation: true,
      enableConsole: true,
      enableFile: false,
      logDirectory: "./logs",
      contextEnricher: (entry) => entry,
      ...config
    };
    this.initializeTransports();
  }
  initializeTransports() {
    if (this.config.enableConsole) {
      this.transports.push(new ConsoleTransport());
    }
    if (this.config.enableFile) {
      this.transports.push(new FileTransport(this.config.logDirectory));
    }
    this.transports.push(...this.config.transports);
  }
  /**
   * Log a message
   */
  log(level, message, context, error) {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return;
    }
    let entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      message,
      serviceName: this.config.serviceName,
      context
    };
    if (this.config.enableTraceCorrelation) {
      const span = trace.getActiveSpan();
      if (span) {
        const spanContext = span.spanContext();
        entry.traceId = spanContext.traceId;
        entry.spanId = spanContext.spanId;
      }
    }
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    entry = this.config.contextEnricher(entry);
    for (const transport of this.transports) {
      try {
        transport.log(entry);
      } catch (err) {
        console.error(`[LogAggregator] Transport ${transport.name} failed:`, err);
      }
    }
  }
  // Convenience methods
  debug(message, context) {
    this.log("debug", message, context);
  }
  info(message, context) {
    this.log("info", message, context);
  }
  warn(message, context) {
    this.log("warn", message, context);
  }
  error(message, errorOrContext, context) {
    if (errorOrContext instanceof Error) {
      this.log("error", message, context, errorOrContext);
    } else {
      this.log("error", message, errorOrContext);
    }
  }
  fatal(message, errorOrContext, context) {
    if (errorOrContext instanceof Error) {
      this.log("fatal", message, context, errorOrContext);
    } else {
      this.log("fatal", message, errorOrContext);
    }
  }
  /**
   * Create a child logger with additional context
   */
  child(additionalContext) {
    const childConfig = {
      ...this.config,
      contextEnricher: (entry) => {
        const enriched = this.config.contextEnricher(entry);
        return {
          ...enriched,
          context: { ...additionalContext, ...enriched.context }
        };
      }
    };
    return new _LogAggregator(childConfig);
  }
  /**
   * Add a new transport
   */
  addTransport(transport) {
    this.transports.push(transport);
  }
  /**
   * Remove a transport by name
   */
  removeTransport(name) {
    this.transports = this.transports.filter((t) => t.name !== name);
  }
  /**
   * Get all transports
   */
  getTransports() {
    return [...this.transports];
  }
  /**
   * Flush all transports (for HTTP transports with buffering)
   */
  async flush() {
    for (const transport of this.transports) {
      if (transport instanceof HttpTransport) {
        await transport.flush();
      }
    }
  }
  /**
   * Destroy all transports and clean up
   */
  destroy() {
    for (const transport of this.transports) {
      if (transport instanceof HttpTransport) {
        transport.destroy();
      }
    }
  }
};
var globalLogger = null;
function initializeLogger(config) {
  if (globalLogger) {
    console.warn("[LogAggregator] Global logger already exists");
    return globalLogger;
  }
  globalLogger = new LogAggregator(config);
  return globalLogger;
}
function getLogger() {
  if (!globalLogger) {
    globalLogger = new LogAggregator({
      serviceName: "default",
      minLevel: "info"
    });
  }
  return globalLogger;
}
function destroyLogger() {
  if (globalLogger) {
    globalLogger.destroy();
    globalLogger = null;
  }
}

export {
  ConsoleTransport,
  FileTransport,
  HttpTransport,
  LogAggregator,
  initializeLogger,
  getLogger,
  destroyLogger
};
//# sourceMappingURL=chunk-G2FCOWJL.js.map