/**
 * Simple Logger
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger {
  private name: string;
  private level: LogLevel;

  constructor(name: string, level: LogLevel = "info") {
    this.name = name;
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private format(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}`;
  }

  debug(message: string): void {
    if (this.shouldLog("debug")) {
      console.debug(this.format("debug", message));
    }
  }

  info(message: string): void {
    if (this.shouldLog("info")) {
      console.info(this.format("info", message));
    }
  }

  warn(message: string): void {
    if (this.shouldLog("warn")) {
      console.warn(this.format("warn", message));
    }
  }

  error(message: string): void {
    if (this.shouldLog("error")) {
      console.error(this.format("error", message));
    }
  }
}
