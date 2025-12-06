/**
 * Type declarations for @gicm/integration-hub
 */
declare module "@gicm/integration-hub" {
  export function getHub(): {
    engineStarted(name: string): void;
    heartbeat(name: string): void;
    publish(source: string, type: string, payload: Record<string, unknown>): void;
  } | null;
}
