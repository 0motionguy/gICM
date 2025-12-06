/**
 * Agent Builder
 *
 * Automatically builds new AI agents from specifications.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { AgentSpec, BuildTask, BuildArtifact, BuildLog } from "../../core/types.js";
import { Logger } from "../../utils/logger.js";

export class AgentBuilder {
  private anthropic: Anthropic;
  private logger: Logger;
  private templatesDir: string;

  constructor(templatesDir: string = "./templates/agents") {
    this.anthropic = new Anthropic();
    this.logger = new Logger("AgentBuilder");
    this.templatesDir = templatesDir;
  }

  /**
   * Build an agent from specification
   */
  async build(spec: AgentSpec): Promise<BuildTask> {
    this.logger.info(`Building agent: ${spec.name}`);

    const task: BuildTask = {
      id: `build-${Date.now()}`,
      opportunityId: "",
      type: "new_agent",
      title: `Build ${spec.name} agent`,
      specification: {
        name: spec.name,
        description: spec.description,
        technology: ["typescript", ...spec.dependencies],
        dependencies: spec.dependencies,
        apis: spec.apis,
        requirements: spec.capabilities,
        acceptanceCriteria: [
          "Agent runs without errors",
          "All inputs are validated",
          "Outputs match specification",
          "Tests pass",
        ],
        files: [
          { path: `src/agents/${spec.slug}/index.ts`, description: "Main agent file" },
          { path: `src/agents/${spec.slug}/types.ts`, description: "Type definitions" },
          { path: `src/agents/${spec.slug}/config.ts`, description: "Configuration" },
          { path: `tests/agents/${spec.slug}.test.ts`, description: "Tests" },
        ],
      },
      status: "building",
      artifacts: [],
      logs: [],
      startedAt: Date.now(),
    };

    try {
      // Generate main agent code
      const mainCode = await this.generateAgentCode(spec);
      task.artifacts.push({
        type: "code",
        path: `src/agents/${spec.slug}/index.ts`,
        content: mainCode,
        language: "typescript",
      });
      this.log(task, "info", "Generated main agent code");

      // Generate types
      const typesCode = await this.generateTypes(spec);
      task.artifacts.push({
        type: "code",
        path: `src/agents/${spec.slug}/types.ts`,
        content: typesCode,
        language: "typescript",
      });
      this.log(task, "info", "Generated type definitions");

      // Generate config
      const configCode = this.generateConfig(spec);
      task.artifacts.push({
        type: "code",
        path: `src/agents/${spec.slug}/config.ts`,
        content: configCode,
        language: "typescript",
      });
      this.log(task, "info", "Generated configuration");

      // Generate tests
      const testCode = await this.generateTests(spec);
      task.artifacts.push({
        type: "test",
        path: `tests/agents/${spec.slug}.test.ts`,
        content: testCode,
        language: "typescript",
      });
      this.log(task, "info", "Generated tests");

      // Generate README
      const readme = this.generateReadme(spec);
      task.artifacts.push({
        type: "docs",
        path: `src/agents/${spec.slug}/README.md`,
        content: readme,
        language: "markdown",
      });
      this.log(task, "info", "Generated documentation");

      task.status = "testing";
      task.completedAt = Date.now();

      this.logger.info(`Agent ${spec.name} built successfully`);
      return task;
    } catch (error) {
      this.log(task, "error", `Build failed: ${error}`);
      task.status = "failed";
      throw error;
    }
  }

  /**
   * Generate main agent code
   */
  private async generateAgentCode(spec: AgentSpec): Promise<string> {
    const prompt = `Generate a complete TypeScript agent for gICM platform.

Agent Specification:
- Name: ${spec.name}
- Slug: ${spec.slug}
- Description: ${spec.description}
- Category: ${spec.category}

Capabilities:
${spec.capabilities.map((c) => `- ${c}`).join("\n")}

Inputs:
${spec.inputs.map((i) => `- ${i.name}: ${i.type} - ${i.description}${i.required ? " (required)" : ""}`).join("\n")}

Outputs:
${spec.outputs.map((o) => `- ${o.name}: ${o.type} - ${o.description}`).join("\n")}

Dependencies: ${spec.dependencies.join(", ") || "none"}
APIs: ${spec.apis.join(", ") || "none"}

Generate a complete, production-ready agent following this structure:

\`\`\`typescript
import { EventEmitter } from "eventemitter3";
import type { ${spec.name}Config, ${spec.name}Input, ${spec.name}Output } from "./types.js";

export interface ${spec.name}Events {
  "started": () => void;
  "completed": (output: ${spec.name}Output) => void;
  "error": (error: Error) => void;
  "progress": (percent: number, message: string) => void;
}

export class ${spec.name}Agent extends EventEmitter<${spec.name}Events> {
  private config: ${spec.name}Config;

  constructor(config: Partial<${spec.name}Config> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async run(input: ${spec.name}Input): Promise<${spec.name}Output> {
    // Implement agent logic
  }

  // Add helper methods
}

export const DEFAULT_CONFIG: ${spec.name}Config = {
  // Default configuration
};
\`\`\`

Requirements:
- Use EventEmitter for lifecycle events
- Validate all inputs
- Handle errors gracefully
- Include progress reporting
- Add JSDoc comments
- Export everything needed

Return ONLY the TypeScript code, no explanations.`;

    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0];
    if (text.type !== "text") throw new Error("Unexpected response");

    // Extract code from response
    const codeMatch = text.text.match(/```typescript\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : text.text;
  }

  /**
   * Generate type definitions
   */
  private async generateTypes(spec: AgentSpec): Promise<string> {
    const prompt = `Generate TypeScript type definitions for this agent:

Agent: ${spec.name}
Inputs: ${JSON.stringify(spec.inputs, null, 2)}
Outputs: ${JSON.stringify(spec.outputs, null, 2)}
Default Config: ${JSON.stringify(spec.defaultConfig, null, 2)}

Generate:
- ${spec.name}Config interface
- ${spec.name}Input interface
- ${spec.name}Output interface
- Any helper types needed

Return ONLY TypeScript code.`;

    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0];
    if (text.type !== "text") throw new Error("Unexpected response");

    const codeMatch = text.text.match(/```typescript\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : text.text;
  }

  /**
   * Generate configuration
   */
  private generateConfig(spec: AgentSpec): string {
    return `/**
 * ${spec.name} Agent Configuration
 */

import type { ${spec.name}Config } from "./types.js";

export const DEFAULT_CONFIG: ${spec.name}Config = ${JSON.stringify(spec.defaultConfig, null, 2)};

export function createConfig(overrides: Partial<${spec.name}Config> = {}): ${spec.name}Config {
  return { ...DEFAULT_CONFIG, ...overrides };
}
`;
  }

  /**
   * Generate tests
   */
  private async generateTests(spec: AgentSpec): Promise<string> {
    const prompt = `Generate Vitest tests for this agent:

Agent: ${spec.name}
Description: ${spec.description}
Inputs: ${JSON.stringify(spec.inputs, null, 2)}
Outputs: ${JSON.stringify(spec.outputs, null, 2)}

Generate comprehensive tests:
- Constructor tests
- Input validation tests
- Success case tests
- Error handling tests
- Event emission tests

Use Vitest (describe, it, expect, vi).
Return ONLY TypeScript test code.`;

    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0];
    if (text.type !== "text") throw new Error("Unexpected response");

    const codeMatch = text.text.match(/```typescript\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : text.text;
  }

  /**
   * Generate README documentation
   */
  private generateReadme(spec: AgentSpec): string {
    return `# ${spec.name} Agent

${spec.description}

## Category
${spec.category}

## Capabilities
${spec.capabilities.map((c) => `- ${c}`).join("\n")}

## Installation

\`\`\`bash
npm install @gicm/agents
\`\`\`

## Usage

\`\`\`typescript
import { ${spec.name}Agent } from "@gicm/agents";

const agent = new ${spec.name}Agent({
  // configuration
});

const result = await agent.run({
  // inputs
});
\`\`\`

## Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
${spec.inputs.map((i) => `| ${i.name} | ${i.type} | ${i.required ? "Yes" : "No"} | ${i.description} |`).join("\n")}

## Outputs

| Name | Type | Description |
|------|------|-------------|
${spec.outputs.map((o) => `| ${o.name} | ${o.type} | ${o.description} |`).join("\n")}

## Events

- \`started\` - Emitted when agent starts
- \`progress\` - Emitted with progress updates
- \`completed\` - Emitted with final output
- \`error\` - Emitted on errors

## License
${spec.license}
`;
  }

  /**
   * Log to build task
   */
  private log(
    task: BuildTask,
    level: BuildLog["level"],
    message: string,
    details?: unknown
  ): void {
    task.logs.push({
      timestamp: Date.now(),
      level,
      message,
      details,
    });

    if (level === "error") {
      this.logger.error(message);
    } else {
      this.logger.info(message);
    }
  }
}
