/**
 * Type declarations for optional dependencies
 * These modules may not be installed, but the code handles their absence gracefully
 */

declare module "neo4j-driver" {
  const neo4j: {
    driver: (
      uri: string,
      auth: { scheme: string; principal: string; credentials: string }
    ) => unknown;
    auth: {
      basic: (
        username: string,
        password: string
      ) => { scheme: string; principal: string; credentials: string };
    };
  };
  export default neo4j;
}

declare module "better-sqlite3" {
  class Database {
    constructor(filename: string);
    pragma(statement: string): void;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    close(): void;
  }
  interface Statement {
    run(...params: unknown[]): RunResult;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    bind(...params: unknown[]): Statement;
  }
  interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }
  export default Database;
}
