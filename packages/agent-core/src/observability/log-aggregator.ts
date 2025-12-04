/**
 * Log Aggregator (Phase 14B)
 *
 * Centralized logging with structured output, log levels, and context enrichment.
 * Supports multiple transports (console, file, HTTP) and log correlation with traces.
 */

import { trace, context as otelContext } from '@opentelemetry/api';
import { existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  serviceName: string;
  traceId?: string;
  spanId?: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LogTransport {
  name: string;
  log(entry: LogEntry): void | Promise<void>;
}

export interface LogAggregatorConfig {
  serviceName: string;
  minLevel?: LogLevel;
  transports?: LogTransport[];
  enableTraceCorrelation?: boolean;
  enableConsole?: boolean;
  enableFile?: boolean;
  logDirectory?: string;
  contextEnricher?: (entry: LogEntry) => LogEntry;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  fatal: '\x1b[35m', // Magenta
};

const RESET_COLOR = '\x1b[0m';

/**
 * Console Transport
 */
export class ConsoleTransport implements LogTransport {
  name = 'console';

  log(entry: LogEntry): void {
    const color = LOG_COLORS[entry.level];
    const prefix = `${color}[${entry.level.toUpperCase()}]${RESET_COLOR}`;
    const timestamp = new Date(entry.timestamp).toISOString();

    let message = `${prefix} ${timestamp} [${entry.serviceName}] ${entry.message}`;

    if (entry.traceId) {
      message += ` (trace: ${entry.traceId})`;
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      message += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      message += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\n${entry.error.stack}`;
      }
    }

    console.log(message);
  }
}

/**
 * File Transport
 */
export class FileTransport implements LogTransport {
  name = 'file';
  private logDirectory: string;
  private logFile: string;

  constructor(logDirectory: string) {
    this.logDirectory = logDirectory;

    // Create log directory if it doesn't exist
    if (!existsSync(logDirectory)) {
      mkdirSync(logDirectory, { recursive: true });
    }

    // Create daily log file
    const date = new Date().toISOString().split('T')[0];
    this.logFile = join(logDirectory, `app-${date}.log`);
  }

  log(entry: LogEntry): void {
    const line = JSON.stringify(entry) + '\n';
    appendFileSync(this.logFile, line, 'utf-8');
  }
}

/**
 * HTTP Transport (for log aggregation services like Grafana Loki)
 */
export class HttpTransport implements LogTransport {
  name = 'http';
  private endpoint: string;
  private batchSize: number;
  private batch: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor(endpoint: string, batchSize = 100, flushIntervalMs = 5000) {
    this.endpoint = endpoint;
    this.batchSize = batchSize;

    // Auto-flush on interval
    this.flushInterval = setInterval(() => {
      this.flush();
    }, flushIntervalMs);
  }

  log(entry: LogEntry): void {
    this.batch.push(entry);

    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const logs = [...this.batch];
    this.batch = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      console.error('[HttpTransport] Failed to send logs:', error);
      // Re-add to batch for retry
      this.batch.unshift(...logs);
    }
  }

  destroy(): void {
    clearInterval(this.flushInterval);
    this.flush();
  }
}

/**
 * Log Aggregator
 */
export class LogAggregator {
  private config: Required<LogAggregatorConfig>;
  private transports: LogTransport[] = [];

  constructor(config: LogAggregatorConfig) {
    this.config = {
      minLevel: 'info',
      transports: [],
      enableTraceCorrelation: true,
      enableConsole: true,
      enableFile: false,
      logDirectory: './logs',
      contextEnricher: (entry) => entry,
      ...config,
    };

    this.initializeTransports();
  }

  private initializeTransports(): void {
    // Add default console transport
    if (this.config.enableConsole) {
      this.transports.push(new ConsoleTransport());
    }

    // Add file transport
    if (this.config.enableFile) {
      this.transports.push(new FileTransport(this.config.logDirectory));
    }

    // Add custom transports
    this.transports.push(...this.config.transports);
  }

  /**
   * Log a message
   */
  log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    // Check min level
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return;
    }

    // Build log entry
    let entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      serviceName: this.config.serviceName,
      context,
    };

    // Add trace correlation
    if (this.config.enableTraceCorrelation) {
      const span = trace.getActiveSpan();
      if (span) {
        const spanContext = span.spanContext();
        entry.traceId = spanContext.traceId;
        entry.spanId = spanContext.spanId;
      }
    }

    // Add error details
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Enrich with custom context
    entry = this.config.contextEnricher(entry);

    // Send to all transports
    for (const transport of this.transports) {
      try {
        transport.log(entry);
      } catch (err) {
        console.error(`[LogAggregator] Transport ${transport.name} failed:`, err);
      }
    }
  }

  // Convenience methods
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, errorOrContext?: Error | Record<string, any>, context?: Record<string, any>): void {
    if (errorOrContext instanceof Error) {
      this.log('error', message, context, errorOrContext);
    } else {
      this.log('error', message, errorOrContext);
    }
  }

  fatal(message: string, errorOrContext?: Error | Record<string, any>, context?: Record<string, any>): void {
    if (errorOrContext instanceof Error) {
      this.log('fatal', message, context, errorOrContext);
    } else {
      this.log('fatal', message, errorOrContext);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Record<string, any>): LogAggregator {
    const childConfig = {
      ...this.config,
      contextEnricher: (entry: LogEntry) => {
        const enriched = this.config.contextEnricher(entry);
        return {
          ...enriched,
          context: { ...additionalContext, ...enriched.context },
        };
      },
    };

    return new LogAggregator(childConfig);
  }

  /**
   * Add a new transport
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Remove a transport by name
   */
  removeTransport(name: string): void {
    this.transports = this.transports.filter(t => t.name !== name);
  }

  /**
   * Get all transports
   */
  getTransports(): LogTransport[] {
    return [...this.transports];
  }

  /**
   * Flush all transports (for HTTP transports with buffering)
   */
  async flush(): Promise<void> {
    for (const transport of this.transports) {
      if (transport instanceof HttpTransport) {
        await transport.flush();
      }
    }
  }

  /**
   * Destroy all transports and clean up
   */
  destroy(): void {
    for (const transport of this.transports) {
      if (transport instanceof HttpTransport) {
        transport.destroy();
      }
    }
  }
}

/**
 * Global logger instance (singleton pattern)
 */
let globalLogger: LogAggregator | null = null;

export function initializeLogger(config: LogAggregatorConfig): LogAggregator {
  if (globalLogger) {
    console.warn('[LogAggregator] Global logger already exists');
    return globalLogger;
  }

  globalLogger = new LogAggregator(config);
  return globalLogger;
}

export function getLogger(): LogAggregator {
  if (!globalLogger) {
    // Create a default logger if none exists
    globalLogger = new LogAggregator({
      serviceName: 'default',
      minLevel: 'info',
    });
  }
  return globalLogger;
}

export function destroyLogger(): void {
  if (globalLogger) {
    globalLogger.destroy();
    globalLogger = null;
  }
}
