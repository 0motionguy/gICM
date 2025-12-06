import {
  GICMOrchestrator
} from "./chunk-6FHMYDJF.js";

// src/types.ts
import { z } from "zod";
var AutonomyLevelSchema = z.enum([
  "manual",
  // Level 0: Human does everything
  "assisted",
  // Level 1: Agent suggests, human executes
  "supervised",
  // Level 2: Agent proposes, human approves (DEFAULT)
  "delegated",
  // Level 3: Agent executes, human can veto
  "autonomous"
  // Level 4: Fully autonomous
]);

// src/index.ts
import { HunterAgent } from "@gicm/hunter-agent";
import { DecisionAgent } from "@gicm/decision-agent";
import { BuilderAgent } from "@gicm/builder-agent";
import { RefactorAgent } from "@gicm/refactor-agent";
import { DeployerAgent } from "@gicm/deployer-agent";
import { ActivityLogger } from "@gicm/activity-logger";
export {
  ActivityLogger,
  AutonomyLevelSchema,
  BuilderAgent,
  DecisionAgent,
  DeployerAgent,
  GICMOrchestrator,
  HunterAgent,
  RefactorAgent
};
//# sourceMappingURL=index.js.map