/**
 * Logger utility using Pino
 */

import pino from "pino";

const transport = pino.transport({
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
  },
});

const baseLogger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  transport
);

export class Logger {
  private logger: pino.Logger;

  constructor(name: string) {
    this.logger = baseLogger.child({ name });
  }

  info(message: string, data?: Record<string, unknown>): void {
    if (data) {
      this.logger.info(data, message);
    } else {
      this.logger.info(message);
    }
  }

  warn(message: string, data?: Record<string, unknown>): void {
    if (data) {
      this.logger.warn(data, message);
    } else {
      this.logger.warn(message);
    }
  }

  error(message: string, data?: Record<string, unknown>): void {
    if (data) {
      this.logger.error(data, message);
    } else {
      this.logger.error(message);
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (data) {
      this.logger.debug(data, message);
    } else {
      this.logger.debug(message);
    }
  }
}

export const logger = new Logger("MoneyEngine");
