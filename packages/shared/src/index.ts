export const AGENTS = [
  { id: "andy", name: "Andy", color: "#00F0FF", role: "Main Agent" },
  { id: "scout", name: "Scout", color: "#FF6B35", role: "Intelligence" },
  { id: "voice", name: "Voice", color: "#4ECDC4", role: "Growth" },
  { id: "ops", name: "Ops", color: "#95E1D3", role: "Operations" },
  { id: "trader", name: "Trader", color: "#F38181", role: "Trading" },
] as const;

export type AgentId = (typeof AGENTS)[number]["id"];
export type Agent = (typeof AGENTS)[number];

export interface Event {
  timestamp: string;
  severity: string;
  message: string;
  agent?: string;
  tag?: string;
  data?: unknown;
}

export interface Budget {
  daily: number;
  used: number;
}
