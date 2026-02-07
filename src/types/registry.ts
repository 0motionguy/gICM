import { z } from "zod";

import type {
  ProgressiveDisclosure,
  CodeExecution,
  SkillResources,
} from "./skill-v2";
import {
  ProgressiveDisclosureSchema,
  CodeExecutionSchema,
  SkillResourcesSchema,
} from "./skill-v2";

export const ItemKindSchema = z.enum([
  "agent",
  "skill",
  "command",
  "mcp",
  "setting",
  "workflow",
  "component",
]);

export const RegistryItemSchema = z.object({
  id: z.string(),
  kind: ItemKindSchema,
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  longDescription: z.string().optional(),
  category: z.string(),
  tags: z.array(z.string()),
  dependencies: z.array(z.string()).optional().default([]),
  files: z.array(z.string()).optional().default([]),
  install: z.string(),
  setup: z.string().optional(),
  envKeys: z.array(z.string()).optional().default([]),
  repoPath: z.string().optional(),
  docsUrl: z.string().optional(),
  installs: z.number().optional().default(0),
  remixes: z.number().optional().default(0),
  tokenSavings: z.number().optional(), // for skills (percentage)
  layer: z.enum([".agent", ".claude", ".gemini", ".openai", "docs"]).optional(), // for agents
  modelRecommendation: z
    .enum(["sonnet", "opus", "opus-4.5", "haiku"])
    .optional(), // for agents
  version: z.string().optional(),
  changelog: z.string().optional(),
  screenshot: z.string().optional(),

  // Agent Skills v2 Fields
  skillId: z
    .string()
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)
    .optional(), // For API skill registration
  progressiveDisclosure: ProgressiveDisclosureSchema.optional(),
  codeExecution: CodeExecutionSchema.optional(),
  resources: SkillResourcesSchema.optional(),

  // Universal Agent Protocol (UAP) Fields
  platforms: z.array(z.enum(["claude", "gemini", "openai"])).optional(),
  compatibility: z
    .object({
      models: z.array(
        z.enum([
          "opus-4.5",
          "sonnet-4.5",
          "sonnet",
          "opus",
          "haiku",
          "gemini-2.0-flash",
          "gemini-3.0-pro",
          "gemini-3-pro",
          "gemini-1.5-pro",
          "gpt-4o",
          "gpt-4o-mini",
        ])
      ),
      software: z.array(z.enum(["vscode", "cursor", "terminal", "windsurf"])),
    })
    .optional(),
  implementations: z
    .object({
      claude: z
        .object({
          install: z.string(),
          configFile: z.string().optional(),
        })
        .optional(),
      gemini: z
        .object({
          install: z.string(),
          configFile: z.string().optional(),
        })
        .optional(),
      openai: z
        .object({
          install: z.string(),
          configFile: z.string().optional(),
        })
        .optional(),
    })
    .optional(),

  // Audit metadata
  audit: z
    .object({
      lastAudited: z.string(),
      qualityScore: z.number().min(0).max(100),
      status: z.enum(["VERIFIED", "NEEDS_FIX", "FLAGGED", "DEPRECATED"]),
      issues: z.array(z.string()).optional(),
    })
    .optional(),

  // Security metadata
  security: z
    .object({
      threatLevel: z
        .enum(["none", "low", "medium", "high", "critical"])
        .optional(),
      vulnerabilities: z
        .array(
          z.object({
            id: z.string(),
            severity: z.enum(["critical", "high", "medium", "low"]),
            description: z.string(),
            pattern: z.string().optional(), // Regex pattern that triggered detection
            line: z.number().optional(), // Line number where found
          })
        )
        .optional(),
      malwarePatterns: z.array(z.string()).optional(), // Detected malicious patterns
      requiredPermissions: z.array(z.string()).optional(), // file-access, network, etc.
      sandboxViolations: z.array(z.string()).optional(),
      securityScore: z.number().min(0).max(100).optional(),
      lastScanned: z.string().optional(), // ISO timestamp
    })
    .optional(),
});

// Manual type with proper optionals
export type RegistryItem = {
  id: string;
  kind:
    | "agent"
    | "skill"
    | "command"
    | "mcp"
    | "setting"
    | "workflow"
    | "component";
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  tags: string[];
  dependencies?: string[];
  files?: string[];
  install: string;
  setup?: string;
  envKeys?: string[];
  repoPath?: string;
  docsUrl?: string;
  installs?: number;
  remixes?: number;
  tokenSavings?: number;
  layer?: ".agent" | ".claude" | ".gemini" | ".openai" | "docs";
  modelRecommendation?: "sonnet" | "opus" | "opus-4.5" | "haiku";
  version?: string;
  changelog?: string;
  screenshot?: string;

  // Agent Skills v2 Fields
  skillId?: string; // For API skill registration
  progressiveDisclosure?: ProgressiveDisclosure;
  codeExecution?: CodeExecution;
  resources?: SkillResources;

  // Universal Agent Protocol (UAP) Fields
  platforms?: ("claude" | "gemini" | "openai")[];
  compatibility?: {
    models: (
      | "opus-4.5"
      | "sonnet-4.5"
      | "sonnet"
      | "opus"
      | "haiku"
      | "gemini-2.0-flash"
      | "gemini-3.0-pro"
      | "gemini-3-pro"
      | "gemini-1.5-pro"
      | "gpt-4o"
      | "gpt-4o-mini"
    )[];
    software: ("vscode" | "cursor" | "terminal" | "windsurf")[];
  };
  implementations?: {
    claude?: {
      install: string;
      configFile?: string;
    };
    gemini?: {
      install: string;
      configFile?: string;
    };
    openai?: {
      install: string;
      configFile?: string;
    };
  };

  // Audit metadata
  audit?: {
    lastAudited: string;
    qualityScore: number;
    status: "VERIFIED" | "NEEDS_FIX" | "FLAGGED" | "DEPRECATED";
    issues?: string[];
  };

  // Security metadata
  security?: {
    threatLevel?: "none" | "low" | "medium" | "high" | "critical";
    vulnerabilities?: {
      id: string;
      severity: "critical" | "high" | "medium" | "low";
      description: string;
      pattern?: string; // Regex pattern that triggered detection
      line?: number; // Line number where found
    }[];
    malwarePatterns?: string[]; // Detected malicious patterns
    requiredPermissions?: string[]; // file-access, network, etc.
    sandboxViolations?: string[];
    securityScore?: number; // 0-100
    lastScanned?: string; // ISO timestamp
  };

  // Workflow-specific fields
  steps?: WorkflowStep[];
  orchestrationPattern?: "sequential" | "parallel" | "conditional" | "hybrid";
  triggerPhrase?: string;
  estimatedTime?: string;
  timeSavings?: number; // Workflow time savings percentage
  requiredAgents?: string[];
  requiredCommands?: string[];
  requiredSkills?: string[];
};
export type ItemKind = z.infer<typeof ItemKindSchema>;

// Settings-specific schema
export const SettingCategorySchema = z.enum([
  "Performance",
  "Security",
  "Development",
  "Integration",
  "Monitoring",
  "Optimization",
]);

export const SettingTypeSchema = z.enum([
  "boolean",
  "number",
  "string",
  "object",
  "array",
]);

export const ConfigLocationSchema = z.enum([
  ".claude/settings.json",
  "claude_desktop_config.json",
  ".env",
]);

export const SettingSchema = RegistryItemSchema.extend({
  kind: z.literal("setting"),
  category: SettingCategorySchema,
  settingType: SettingTypeSchema,
  defaultValue: z.any(),
  affectedComponents: z.array(z.string()).optional(), // IDs of agents/skills/mcps affected
  configLocation: ConfigLocationSchema,
  validationSchema: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      enum: z.array(z.any()).optional(),
    })
    .optional(),
  conflictsWith: z.array(z.string()).optional(),
});

export type Setting = z.infer<typeof SettingSchema>;
export type SettingCategory = z.infer<typeof SettingCategorySchema>;
export type SettingType = z.infer<typeof SettingTypeSchema>;

export const BundleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  includes: z.array(z.string()),
  recommended: z.boolean().default(false),
});

export type Bundle = z.infer<typeof BundleSchema>;

// Workflow schemas
export const WorkflowStepSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  agent: z.string().optional(), // Agent ID to invoke
  command: z.string().optional(), // Command slug to run
  skill: z.string().optional(), // Skill ID to activate
  condition: z.string().optional(), // Conditional logic (e.g., "coverage >= 80%")
  parallel: z.boolean().optional().default(false), // Run in parallel with other steps?
  onError: z.enum(["fail", "continue", "retry"]).optional().default("fail"),
  retryCount: z.number().optional(),
});

// Manual type override to make parallel and onError optional in input
export type WorkflowStep = {
  name: string;
  description?: string;
  agent?: string;
  command?: string;
  skill?: string;
  condition?: string;
  parallel?: boolean;
  onError?: "fail" | "continue" | "retry";
  retryCount?: number;
};

export const OrchestrationPatternSchema = z.enum([
  "sequential", // Steps run one after another
  "parallel", // All steps run simultaneously
  "conditional", // Branch based on conditions
  "hybrid", // Mix of above patterns
]);

export const WorkflowSchema = RegistryItemSchema.extend({
  kind: z.literal("workflow"),
  steps: z.array(WorkflowStepSchema),
  orchestrationPattern: OrchestrationPatternSchema,
  triggerPhrase: z.string(), // Natural language activation (e.g., "/deploy-defi")
  estimatedTime: z.string(), // e.g., "2-4 hours"
  requiredAgents: z.array(z.string()).default([]), // Agent IDs needed
  requiredCommands: z.array(z.string()).default([]), // Command slugs needed
  requiredSkills: z.array(z.string()).default([]), // Skill IDs needed
  timeSavings: z.number().optional(), // Percentage time saved vs manual
});

export type Workflow = z.infer<typeof WorkflowSchema>;
export type OrchestrationPattern = z.infer<typeof OrchestrationPatternSchema>;

export interface StackExport {
  name: string;
  created: Date;
  items: RegistryItem[];
  dependencies: RegistryItem[];
}

// === UI COMPONENT TYPES (React UI with actual code) ===

export interface UIComponentCode {
  filename: string; // "aurora-background.tsx"
  component: string; // FULL SOURCE CODE as string
  css?: string; // Optional CSS/Tailwind config
  dependencies: string[]; // ["framer-motion", "clsx"]
  usage: string; // Example usage code
}

export interface UIComponentCredit {
  library: string; // "Aceternity UI" | "Magic UI" | "ClawdBot"
  url: string; // Original source URL
  license: "MIT";
}

export interface UIComponentPreview {
  height: string; // "400px"
  darkMode: boolean;
}

export interface UIComponent {
  id: string; // "design-react-backgrounds-aurora"
  name: string; // "Aurora Background"
  description: string;
  category: "Design";
  subcategory: "React UI";
  tags: string[];
  credit: UIComponentCredit;
  code: UIComponentCode;
  preview: UIComponentPreview;
  tech_stack: string[];
}

// Zod schemas for UIComponent
export const UIComponentCodeSchema = z.object({
  filename: z.string(),
  component: z.string(),
  css: z.string().optional(),
  dependencies: z.array(z.string()),
  usage: z.string(),
});

export const UIComponentCreditSchema = z.object({
  library: z.string(),
  url: z.string(),
  license: z.literal("MIT"),
});

export const UIComponentPreviewSchema = z.object({
  height: z.string(),
  darkMode: z.boolean(),
});

export const UIComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.literal("Design"),
  subcategory: z.literal("React UI"),
  tags: z.array(z.string()),
  credit: UIComponentCreditSchema,
  code: UIComponentCodeSchema,
  preview: UIComponentPreviewSchema,
  tech_stack: z.array(z.string()),
});
