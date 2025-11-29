/**
 * Logger utility using Pino
 */

import pino from "pino";

export class Logger {
  private pino: pino.Logger;
  private context: string;

  constructor(context: string) {
    this.context = context;
    this.pino = pino({
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      },
    });
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.pino.info({ context: this.context, ...data }, message);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.pino.warn({ context: this.context, ...data }, message);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.pino.error({ context: this.context, ...data }, message);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.pino.debug({ context: this.context, ...data }, message);
  }
}

export const createLogger = (context: string): Logger => new Logger(context);
