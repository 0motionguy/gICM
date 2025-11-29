import {
  BaseAgent,
  type AgentConfig,
  type AgentContext,
  type AgentResult,
  type LLMClient,
  createLLMClient,
} from "@gicm/agent-core";
import type {
  OrchestratorConfig,
  RegisteredAgent,
  Workflow,
  WorkflowStep,
  WorkflowContext,
  WorkflowResult,
  StepResult,
  RoutingDecision,
  AgentType,
} from "./types.js";
import { OrchestratorConfigSchema } from "./types.js";
import { Router } from "./coordination/router.js";
import { SharedMemory } from "./coordination/memory.js";
import { tradingWorkflows } from "./workflows/trading.js";
import { researchWorkflows } from "./workflows/research.js";
import { portfolioWorkflows } from "./workflows/portfolio.js";

export class Orchestrator extends BaseAgent {
  private router: Router;
  private memory: SharedMemory;
  private agents: Map<string, RegisteredAgent> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private runningWorkflows: Map<string, WorkflowContext> = new Map();
  private orchestratorConfig: OrchestratorConfig;
  private llmClient?: LLMClient;

  constructor(config: OrchestratorConfig & AgentConfig) {
    const validatedConfig = OrchestratorConfigSchema.parse(config);
    super("orchestrator", config);

    this.orchestratorConfig = validatedConfig;

    // Initialize LLM client if API key provided
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider ?? "openai",
        model: config.llmModel,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4096,
      });
    }

    this.router = new Router(this.llmClient);
    this.memory = new SharedMemory();

    // Register built-in workflows
    this.registerBuiltInWorkflows();
  }

  private registerBuiltInWorkflows(): void {
    // Trading workflows
    for (const [id, workflow] of Object.entries(tradingWorkflows)) {
      this.workflows.set(id, workflow);
    }

    // Research workflows
    for (const [id, workflow] of Object.entries(researchWorkflows)) {
      this.workflows.set(id, workflow);
    }

    // Portfolio workflows
    for (const [id, workflow] of Object.entries(portfolioWorkflows)) {
      this.workflows.set(id, workflow);
    }
  }

  getSystemPrompt(): string {
    const agents = Array.from(this.agents.values())
      .map((a) => `- ${a.name} (${a.type}): ${a.description}`)
      .join("\n");

    const workflows = Array.from(this.workflows.values())
      .map((w) => `- ${w.name}: ${w.description}`)
      .join("\n");

    return `You are an orchestrator for a multi-agent Web3 platform.

Available Agents:
${agents || "No agents registered"}

Available Workflows:
${workflows}

You can:
1. Route requests to appropriate agents
2. Execute multi-step workflows
3. Coordinate parallel agent execution
4. Maintain shared context between agents

When given a request:
1. Determine if it's a simple single-agent task or requires a workflow
2. For simple tasks, route to the appropriate agent
3. For complex tasks, select or create an appropriate workflow
4. Provide clear status updates and results`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const input = context.userQuery ?? "";

    // Try to match a workflow first
    const workflowMatch = this.matchWorkflow(input);
    if (workflowMatch) {
      const result = await this.executeWorkflow(workflowMatch.workflow, workflowMatch.params);
      return this.createResult(
        result.success,
        { workflow: result },
        result.errors.length > 0 ? result.errors[0]?.error : undefined,
        result.success ? 0.9 : 0.3,
        `Workflow ${result.workflowId} completed`
      );
    }

    // Route to single agent
    const routing = await this.router.route(input);
    if (!routing) {
      return this.createResult(
        false,
        null,
        "Unable to determine how to handle this request",
        0.2,
        "No suitable routing found"
      );
    }

    const agent = this.agents.get(routing.agentId);
    if (!agent) {
      return this.createResult(
        false,
        { routing },
        `Agent ${routing.agentId} not found`,
        0.3,
        "Agent not registered"
      );
    }

    try {
      const result = await agent.agent.analyze(context);
      return this.createResult(
        result.success,
        { agentResult: result, routing },
        result.error,
        result.confidence ?? 0.8,
        `Routed to ${agent.name}`
      );
    } catch (error) {
      return this.createResult(
        false,
        { routing },
        `Error executing agent: ${error}`,
        0,
        "Agent execution failed"
      );
    }
  }

  private matchWorkflow(input: string): { workflow: Workflow; params: Record<string, unknown> } | null {
    const lowerInput = input.toLowerCase();

    // Keyword matching for workflows
    const workflowKeywords: Record<string, string[]> = {
      "research-token": ["research", "analyze token", "due diligence", "investigate"],
      "swap-token": ["swap", "trade", "exchange"],
      "bridge-tokens": ["bridge", "cross-chain", "transfer to"],
      "analyze-portfolio": ["portfolio", "holdings", "my tokens"],
      "nft-collection-analysis": ["nft collection", "analyze nft", "floor price"],
      "dao-governance-analysis": ["dao", "proposal", "governance"],
      "risk-assessment": ["risk", "security assessment", "audit portfolio"],
    };

    for (const [workflowId, keywords] of Object.entries(workflowKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          const workflow = this.workflows.get(workflowId);
          if (workflow) {
            const params = this.extractWorkflowParams(input);
            return { workflow, params };
          }
        }
      }
    }

    return null;
  }

  private extractWorkflowParams(input: string): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    // Extract addresses
    const ethAddress = input.match(/0x[a-fA-F0-9]{40}/);
    if (ethAddress) {
      params.contractAddress = ethAddress[0];
      params.wallet = ethAddress[0];
    }

    // Extract token symbols
    const token = input.match(/\$([A-Z]{2,10})/);
    if (token) {
      params.token = token[1];
    }

    // Extract project/collection names (quoted text)
    const quoted = input.match(/"([^"]+)"/);
    if (quoted) {
      params.projectName = quoted[1];
      params.collectionName = quoted[1];
    }

    return params;
  }

  registerAgent(
    id: string,
    type: AgentType,
    name: string,
    description: string,
    capabilities: string[],
    agent: BaseAgent
  ): void {
    const registered: RegisteredAgent = {
      id,
      type,
      name,
      description,
      capabilities,
      agent,
    };
    this.agents.set(id, registered);
    this.router.registerAgent(registered);
  }

  unregisterAgent(id: string): void {
    this.agents.delete(id);
    this.router.unregisterAgent(id);
  }

  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  async executeWorkflow(
    workflow: Workflow,
    params: Record<string, unknown>
  ): Promise<WorkflowResult> {
    const context: WorkflowContext = {
      workflowId: workflow.id,
      startTime: new Date(),
      results: new Map(),
      memory: new Map(Object.entries(params)),
      errors: [],
    };

    this.runningWorkflows.set(workflow.id, context);

    const startTime = Date.now();
    const stepResults: StepResult[] = [];

    try {
      // Build dependency graph and execute in order
      const executionOrder = this.buildExecutionOrder(workflow.steps);

      for (const batch of executionOrder) {
        // Execute steps in parallel within each batch
        const batchResults = await Promise.all(
          batch.map((step) => this.executeStep(step, context, params))
        );

        stepResults.push(...batchResults);

        // Check for failures
        const failures = batchResults.filter((r) => !r.success);
        if (failures.length > 0 && workflow.onError === "stop") {
          break;
        }
      }

      const success = context.errors.length === 0 ||
        stepResults.every((r) => r.success);

      return {
        workflowId: workflow.id,
        success,
        duration: Date.now() - startTime,
        steps: stepResults,
        errors: context.errors,
        output: this.aggregateResults(context),
      };
    } finally {
      this.runningWorkflows.delete(workflow.id);
    }
  }

  private buildExecutionOrder(steps: WorkflowStep[]): WorkflowStep[][] {
    const batches: WorkflowStep[][] = [];
    const completed = new Set<string>();
    const remaining = [...steps];

    while (remaining.length > 0) {
      const batch: WorkflowStep[] = [];

      for (let i = remaining.length - 1; i >= 0; i--) {
        const step = remaining[i]!;
        const deps = step.dependsOn ?? [];
        const depsCompleted = deps.every((d) => completed.has(d));

        if (depsCompleted) {
          batch.push(step);
          remaining.splice(i, 1);
        }
      }

      if (batch.length === 0 && remaining.length > 0) {
        // Circular dependency or missing dependency
        this.log("Workflow has unresolvable dependencies");
        break;
      }

      if (batch.length > 0) {
        batches.push(batch);
        batch.forEach((s) => completed.add(s.id));
      }
    }

    return batches;
  }

  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext,
    params: Record<string, unknown>
  ): Promise<StepResult> {
    const startTime = Date.now();

    // Check condition
    if (step.condition && !step.condition(context)) {
      return {
        stepId: step.id,
        agentId: step.agentId,
        success: true,
        data: { skipped: true },
        duration: 0,
        timestamp: new Date(),
      };
    }

    const agent = this.agents.get(step.agentId);
    if (!agent) {
      const result: StepResult = {
        stepId: step.id,
        agentId: step.agentId,
        success: false,
        error: `Agent ${step.agentId} not found`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
      context.errors.push({
        stepId: step.id,
        error: result.error!,
        timestamp: new Date(),
        recovered: false,
      });
      return result;
    }

    try {
      // Interpolate params with context values
      const resolvedParams = this.resolveParams(step.params, params, context);

      // Create agent context
      const agentContext: AgentContext = {
        chain: "evm",
        network: "mainnet",
        userQuery: `${step.action}: ${JSON.stringify(resolvedParams)}`,
      };

      // Execute the step
      const data = await agent.agent.analyze(agentContext);

      const result: StepResult = {
        stepId: step.id,
        agentId: step.agentId,
        success: data.success,
        data: data.data,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };

      context.results.set(step.id, result);
      return result;
    } catch (error) {
      const result: StepResult = {
        stepId: step.id,
        agentId: step.agentId,
        success: false,
        error: String(error),
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };

      context.results.set(step.id, result);
      context.errors.push({
        stepId: step.id,
        error: result.error!,
        timestamp: new Date(),
        recovered: false,
      });

      return result;
    }
  }

  private resolveParams(
    stepParams: Record<string, unknown>,
    workflowParams: Record<string, unknown>,
    context: WorkflowContext
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(stepParams)) {
      if (typeof value === "string" && value.startsWith("{{") && value.endsWith("}}")) {
        const paramKey = value.slice(2, -2);
        resolved[key] = workflowParams[paramKey] ?? context.memory.get(paramKey);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private aggregateResults(context: WorkflowContext): unknown {
    const output: Record<string, unknown> = {};

    for (const [stepId, result] of context.results) {
      if (result.success && result.data) {
        output[stepId] = result.data;
      }
    }

    return output;
  }

  getMemory(): SharedMemory {
    return this.memory;
  }

  getRegisteredAgents(): RegisteredAgent[] {
    return Array.from(this.agents.values());
  }

  getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  getRunningWorkflows(): string[] {
    return Array.from(this.runningWorkflows.keys());
  }
}
