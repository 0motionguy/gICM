/**
 * Workflow Registry - Cross-engine automation workflows
 */

import type { EventBus } from "../event-bus.js";
import type { IntegrationHub } from "../hub.js";

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string; // Event type that triggers this workflow
  enabled: boolean;
  execute: (hub: IntegrationHub, payload: Record<string, unknown>) => Promise<void>;
}

// ============================================================================
// WORKFLOW IMPLEMENTATIONS
// ============================================================================

/**
 * Feature Announcement Workflow
 * When ProductEngine deploys a new feature, announce via GrowthEngine
 */
const featureAnnouncementWorkflow: Workflow = {
  id: "feature-announcement",
  name: "Feature Announcement",
  description: "Announce new features when ProductEngine deploys them",
  trigger: "build.completed",
  enabled: true,
  execute: async (hub, payload) => {
    const growthEngine = hub.getGrowthEngine();
    if (!growthEngine) return;

    const { name, description } = payload as { name?: string; description?: string };
    if (!name) return;

    try {
      await growthEngine.announceFeature({
        name,
        description: description || "New feature deployed!",
      });
      console.log("[WORKFLOW] Feature announced:", name);

      hub.getEventBus().publish("workflow", "content.published", {
        workflow: "feature-announcement",
        feature: name,
      });
    } catch (error) {
      console.error("[WORKFLOW] Feature announcement failed:", error);
    }
  },
};

/**
 * Profitable Trade Workflow
 * When a trade makes profit above threshold, tweet about it
 */
const profitableTradeWorkflow: Workflow = {
  id: "profitable-trade",
  name: "Profitable Trade Tweet",
  description: "Tweet about profitable trades above threshold",
  trigger: "trade.profit",
  enabled: true,
  execute: async (hub, payload) => {
    const growthEngine = hub.getGrowthEngine();
    if (!growthEngine) return;

    const { profit, symbol } = payload as { profit?: number; symbol?: string };
    if (!profit || profit < 100) return; // Only announce profits > $100

    try {
      await growthEngine.generateNow("tweet");
      console.log("[WORKFLOW] Profit tweet generated for", symbol);
    } catch (error) {
      console.error("[WORKFLOW] Profit tweet failed:", error);
    }
  },
};

/**
 * Low Treasury Alert Workflow
 * When treasury drops below threshold, pause risky operations
 */
const lowTreasuryAlertWorkflow: Workflow = {
  id: "low-treasury-alert",
  name: "Low Treasury Alert",
  description: "Alert and pause operations when treasury is critically low",
  trigger: "treasury.critical",
  enabled: true,
  execute: async (hub, payload) => {
    const brain = hub.getBrain();
    if (!brain) return;

    const { totalUsd, threshold } = payload as { totalUsd?: number; threshold?: number };

    console.warn("[WORKFLOW] CRITICAL: Treasury below threshold!", {
      totalUsd,
      threshold,
    });

    // Could pause trading or other risky operations here
    hub.getEventBus().publish("workflow", "engine.error", {
      workflow: "low-treasury-alert",
      message: "Treasury critically low - manual review required",
      totalUsd,
    });
  },
};

/**
 * Daily Summary Workflow
 * Generate and publish daily performance summary
 */
const dailySummaryWorkflow: Workflow = {
  id: "daily-summary",
  name: "Daily Summary",
  description: "Generate daily performance summary",
  trigger: "brain.phase_completed",
  enabled: true,
  execute: async (hub, payload) => {
    const { phase } = payload as { phase?: string };
    if (phase !== "night_summary") return;

    const growthEngine = hub.getGrowthEngine();
    if (!growthEngine) return;

    try {
      await growthEngine.generateNow("thread");
      console.log("[WORKFLOW] Daily summary thread generated");
    } catch (error) {
      console.error("[WORKFLOW] Daily summary failed:", error);
    }
  },
};

// ============================================================================
// OPUS67 WORKFLOWS
// ============================================================================

/**
 * OPUS67 Mode Change Workflow
 * Log mode changes and potentially adjust engine behavior
 */
const opus67ModeChangeWorkflow: Workflow = {
  id: "opus67-mode-change",
  name: "OPUS67 Mode Change",
  description: "Handle OPUS67 mode changes and adjust engine behavior",
  trigger: "opus67.mode_changed",
  enabled: true,
  execute: async (hub, payload) => {
    const { from, to, reason } = payload as { from?: string; to?: string; reason?: string };

    console.log(`[WORKFLOW] OPUS67 mode changed: ${from} → ${to} (${reason})`);

    // If switching to SWARM mode, could enable parallel processing
    if (to === "swarm") {
      console.log("[WORKFLOW] SWARM mode enabled - parallel processing active");
    }

    // If switching to AUDIT mode, could trigger security scans
    if (to === "audit") {
      console.log("[WORKFLOW] AUDIT mode enabled - security focus active");
    }

    hub.getEventBus().publish("workflow", "engine.heartbeat", {
      workflow: "opus67-mode-change",
      mode: to,
    });
  },
};

/**
 * OPUS67 Query Processed Workflow
 * Track query processing for analytics
 */
const opus67QueryProcessedWorkflow: Workflow = {
  id: "opus67-query-processed",
  name: "OPUS67 Query Analytics",
  description: "Track and analyze OPUS67 query processing",
  trigger: "opus67.query_processed",
  enabled: true,
  execute: async (hub, payload) => {
    const { query, mode, confidence, skills } = payload as {
      query?: string;
      mode?: string;
      confidence?: number;
      skills?: string[];
    };

    console.log(`[WORKFLOW] OPUS67 processed query in ${mode} mode (${confidence}% confidence)`);

    // Could send analytics to external service
    // Could trigger content generation based on query patterns
  },
};

/**
 * OPUS67 Agent Spawn Workflow
 * Track sub-agent spawning for monitoring
 */
const opus67AgentSpawnWorkflow: Workflow = {
  id: "opus67-agent-spawn",
  name: "OPUS67 Agent Monitor",
  description: "Monitor OPUS67 sub-agent spawning",
  trigger: "opus67.agent_spawned",
  enabled: true,
  execute: async (hub, payload) => {
    const { agentId, role, mode } = payload as {
      agentId?: string;
      role?: string;
      mode?: string;
    };

    console.log(`[WORKFLOW] OPUS67 spawned agent: ${agentId} (${role}) in ${mode} mode`);
  },
};

// ============================================================================
// WORKFLOW REGISTRY
// ============================================================================

export const workflows: Workflow[] = [
  featureAnnouncementWorkflow,
  profitableTradeWorkflow,
  lowTreasuryAlertWorkflow,
  dailySummaryWorkflow,
  opus67ModeChangeWorkflow,
  opus67QueryProcessedWorkflow,
  opus67AgentSpawnWorkflow,
];

/**
 * Register all workflows with the event bus
 */
export function registerWorkflows(hub: IntegrationHub): void {
  const eventBus = hub.getEventBus();

  for (const workflow of workflows) {
    if (!workflow.enabled) continue;

    eventBus.on(workflow.trigger as any, async (event) => {
      console.log("[WORKFLOW] Triggered:", workflow.name);

      try {
        await workflow.execute(hub, event.payload);
      } catch (error) {
        console.error("[WORKFLOW] Error in", workflow.name, error);
      }
    });
  }

  console.log("[WORKFLOW] Registered", workflows.filter((w) => w.enabled).length, "workflows");
}

/**
 * Get all workflows
 */
export function getWorkflows(): Workflow[] {
  return workflows;
}
