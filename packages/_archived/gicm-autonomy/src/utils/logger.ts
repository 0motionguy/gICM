/**
 * Simple Logger
 */

export class Logger {
  private prefix: string;

  constructor(name: string) {
    this.prefix = "[" + name + "]";
  }

  info(message: string): void {
    console.log(this.prefix, message);
  }

  warn(message: string): void {
    console.warn(this.prefix, "WARN:", message);
  }

  error(message: string): void {
    console.error(this.prefix, "ERROR:", message);
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(this.prefix, "DEBUG:", message);
    }
  }
}
