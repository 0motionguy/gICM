/**
 * Agent Builder
 *
 * Automatically builds new agents from opportunities.
 */

import * as fs from "fs/promises";
import * as path from "path";
import type { AgentSpec, BuildTask, Opportunity } from "../../core/types.js";
import { generateJSON, generateText } from "../../utils/llm.js";
import { Logger } from "../../utils/logger.js";
import { getTemplate, type AgentTemplate, AGENT_TEMPLATES } from "./templates.js";

export interface AgentBuilderConfig {
  outputDir: string;
  autoInstall: boolean;
}

const DEFAULT_CONFIG: AgentBuilderConfig = {
  outputDir: "packages",
  autoInstall: true,
};

export class AgentBuilder {
  private logger: Logger;
  private config: AgentBuilderConfig;

  constructor(config: Partial<AgentBuilderConfig> = {}) {
    this.logger = new Logger("AgentBuilder");
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Design agent from opportunity
   */
  async designAgent(opportunity: Opportunity): Promise<AgentSpec> {
    this.logger.info(`Designing agent for: ${opportunity.title}`);

    const spec = await generateJSON<{
      name: string;
      description: string;
      capabilities: string[];
      tools: Array<{
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
      }>;
      dependencies: string[];
      templateType: string;
    }>({
      prompt: `Design an AI agent based on this opportunity:

Title: ${opportunity.title}
Description: ${opportunity.description}
Type: ${opportunity.type}
Source: ${opportunity.source}

The agent will be part of gICM, an AI-powered development platform with:
- AI agents for trading, research, content generation
- React component library
- Solana/Web3 focus

Design the agent with:
1. A clear name (e.g., "MarketAnalysis", "CodeReview")
2. Description of what it does
3. List of capabilities
4. Tools/functions it needs
5. Dependencies (npm packages)
6. Template type: "basic" | "tool_agent" | "trading_agent" | "research_agent"

Return JSON:
{
  "name": "AgentName",
  "description": "What it does",
  "capabilities": ["cap1", "cap2"],
  "tools": [
    { "name": "toolName", "description": "what it does", "inputSchema": { "type": "object", "properties": {} } }
  ],
  "dependencies": ["package1"],
  "templateType": "basic"
}`,
    });

    return {
      name: spec.name,
      description: spec.description,
      capabilities: spec.capabilities,
      tools: spec.tools,
      dependencies: spec.dependencies,
      testCases: [
        {
          name: "basic_functionality",
          input: "Test the agent's basic functionality",
          expectedBehavior: "Agent should respond appropriately",
        },
      ],
    };
  }

  /**
   * Build agent from spec
   */
  async buildAgent(spec: AgentSpec): Promise<BuildTask> {
    const taskId = `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const packageName = this.toPackageName(spec.name);
    const outputPath = path.join(this.config.outputDir, `${packageName}-agent`);

    this.logger.info(`Building agent: ${spec.name} at ${outputPath}`);

    const task: BuildTask = {
      id: taskId,
      opportunityId: "",
      type: "agent",
      spec,
      status: "in_progress",
      progress: 0,
      startedAt: Date.now(),
      logs: [],
    };

    try {
      // Create directory
      await fs.mkdir(outputPath, { recursive: true });
      await fs.mkdir(path.join(outputPath, "src"), { recursive: true });
      task.logs.push(`Created directory: ${outputPath}`);
      task.progress = 10;

      // Determine template
      const templateName = this.selectTemplate(spec);
      const template = getTemplate(templateName) || AGENT_TEMPLATES.basic;
      task.logs.push(`Using template: ${templateName}`);
      task.progress = 20;

      // Generate files from template
      for (const file of template.files) {
        const content = this.applyTemplate(file.content, spec);
        const filePath = path.join(outputPath, file.path);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
        task.logs.push(`Created: ${file.path}`);
      }
      task.progress = 50;

      // Generate additional tools if specified
      if (spec.tools.length > 0) {
        const toolsContent = await this.generateToolsFile(spec);
        await fs.writeFile(path.join(outputPath, "src", "tools.ts"), toolsContent);
        task.logs.push("Generated tools.ts");
      }
      task.progress = 70;

      // Generate tests
      const testsContent = await this.generateTests(spec);
      await fs.writeFile(path.join(outputPath, "src", "index.test.ts"), testsContent);
      task.logs.push("Generated tests");
      task.progress = 85;

      // Create tsconfig
      await fs.writeFile(
        path.join(outputPath, "tsconfig.json"),
        JSON.stringify(
          {
            extends: "../../tsconfig.json",
            compilerOptions: {
              outDir: "./dist",
              rootDir: "./src",
            },
            include: ["src/**/*"],
          },
          null,
          2
        )
      );
      task.progress = 95;

      task.status = "completed";
      task.progress = 100;
      task.completedAt = Date.now();
      task.outputPath = outputPath;
      task.logs.push("Build completed successfully!");

      this.logger.info(`Agent ${spec.name} built successfully`);
    } catch (error) {
      task.status = "failed";
      task.error = String(error);
      task.logs.push(`Build failed: ${error}`);
      this.logger.error(`Build failed: ${error}`);
    }

    return task;
  }

  /**
   * Generate tools file
   */
  private async generateToolsFile(spec: AgentSpec): Promise<string> {
    const toolsCode = await generateText({
      prompt: `Generate TypeScript tool implementations for an AI agent.

Agent: ${spec.name}
Description: ${spec.description}

Tools needed:
${spec.tools.map((t) => `- ${t.name}: ${t.description}`).join("\n")}

Generate a tools.ts file with:
1. Proper TypeScript types
2. Implementation for each tool
3. Error handling
4. Export all tools

Return only the TypeScript code.`,
    });

    return toolsCode;
  }

  /**
   * Generate test file
   */
  private async generateTests(spec: AgentSpec): Promise<string> {
    return `/**
 * ${spec.name} Agent Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ${this.toClassName(spec.name)}Agent } from "./index.js";

describe("${spec.name}Agent", () => {
  let agent: ${this.toClassName(spec.name)}Agent;

  beforeEach(() => {
    agent = new ${this.toClassName(spec.name)}Agent();
  });

  it("should instantiate correctly", () => {
    expect(agent).toBeDefined();
  });

${spec.testCases
  .map(
    (tc) => `
  it("${tc.name}", async () => {
    const result = await agent.run("${tc.input}");
    expect(result).toBeDefined();
    // ${tc.expectedBehavior}
  });`
  )
  .join("\n")}
});
`;
  }

  /**
   * Select appropriate template
   */
  private selectTemplate(spec: AgentSpec): string {
    const nameLower = spec.name.toLowerCase();
    const descLower = spec.description.toLowerCase();

    if (nameLower.includes("trading") || descLower.includes("trading") || descLower.includes("defi")) {
      return "trading_agent";
    }
    if (nameLower.includes("research") || descLower.includes("research") || descLower.includes("analyze")) {
      return "research_agent";
    }
    if (spec.tools.length > 0) {
      return "tool_agent";
    }
    return "basic";
  }

  /**
   * Apply template variables
   */
  private applyTemplate(content: string, spec: AgentSpec): string {
    return content
      .replace(/\{\{NAME\}\}/g, spec.name)
      .replace(/\{\{DESCRIPTION\}\}/g, spec.description)
      .replace(/\{\{CLASS_NAME\}\}/g, this.toClassName(spec.name))
      .replace(/\{\{PACKAGE_NAME\}\}/g, this.toPackageName(spec.name));
  }

  /**
   * Convert name to class name
   */
  private toClassName(name: string): string {
    return name
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }

  /**
   * Convert name to package name
   */
  private toPackageName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Full build pipeline from opportunity
   */
  async buildFromOpportunity(opportunity: Opportunity): Promise<BuildTask> {
    const spec = await this.designAgent(opportunity);
    const task = await this.buildAgent(spec);
    task.opportunityId = opportunity.id;
    return task;
  }
}
