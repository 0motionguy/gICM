/**
 * Commit Agent
 *
 * AI-powered git commit message generation with full workflow automation
 */

import { BaseAgent } from "@gicm/agent-core";
import type { AgentConfig, AgentContext, AgentResult } from "@gicm/agent-core";
import { z } from "zod";
import { GitOperations } from "./git/operations.js";
import { DiffAnalyzer } from "./git/diff-analyzer.js";
import { MessageGenerator } from "./message/generator.js";
import { PRCreator } from "./git/pr-creator.js";
import type {
  CommitAgentConfig,
  CommitRequest,
  CommitResult,
  GeneratedMessage,
  GitStatus,
  DiffSummary,
  PushOptions,
  PushResult,
  PROptions,
  PRResult,
  CommitRiskAssessment,
} from "./core/types.js";
import { CommitAgentConfigSchema } from "./core/types.js";

export class CommitAgent extends BaseAgent {
  private git: GitOperations;
  private diffAnalyzer: DiffAnalyzer;
  private messageGenerator: MessageGenerator;
  private prCreator: PRCreator;
  private commitConfig: CommitAgentConfig;

  constructor(config: Partial<CommitAgentConfig> = {}) {
    const validated = CommitAgentConfigSchema.parse(config);

    super("commit-agent", {
      name: validated.name,
      description: validated.description ?? "AI-powered git commit workflow",
      llmProvider: validated.llmProvider,
      llmModel: validated.llmModel,
      apiKey: validated.apiKey,
      temperature: validated.temperature,
      maxTokens: validated.maxTokens,
      verbose: validated.verbose,
    });

    this.commitConfig = validated;

    // Initialize components
    this.git = new GitOperations();
    this.diffAnalyzer = new DiffAnalyzer();
    this.messageGenerator = new MessageGenerator({
      llmProvider: validated.llmProvider,
      llmModel: validated.llmModel,
      apiKey: validated.apiKey,
      temperature: validated.temperature,
      maxTokens: validated.maxTokens,
      includeCoAuthor: validated.includeCoAuthors,
      coAuthorName: validated.coAuthorName,
      coAuthorEmail: validated.coAuthorEmail,
    });
    this.prCreator = new PRCreator({ apiKey: validated.apiKey });

    // Register tools
    this.initializeTools();
  }

  getSystemPrompt(): string {
    return `You are a commit agent that helps developers create meaningful, well-structured git commits.

You follow the Conventional Commits specification and can:
1. Analyze code changes to understand what was modified
2. Generate appropriate commit messages based on the changes
3. Stage, commit, and push changes
4. Create pull requests with comprehensive descriptions

You always:
- Use imperative mood in commit messages ("add" not "added")
- Keep subject lines under 72 characters
- Provide reasoning for your commit type choices
- Consider the risk level of changes before auto-executing`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const action = (context.action ?? "status") as string;
    const params = context.params ?? {};

    this.log(`Executing action: ${action}`, params);

    try {
      switch (action) {
        case "status":
          return this.handleStatus();

        case "generate":
          return this.handleGenerate(params.staged as boolean);

        case "commit":
          return this.handleCommit(params as CommitRequest);

        case "push":
          return this.handlePush(params as PushOptions);

        case "create_pr":
          return this.handleCreatePR(params as PROptions);

        case "full":
          return this.handleFullWorkflow(params as CommitRequest);

        default:
          return this.createResult(false, null, `Unknown action: ${action}`);
      }
    } catch (error) {
      const err = error as Error;
      return this.createResult(false, null, err.message);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Get current git status
   */
  async getStatus(): Promise<GitStatus> {
    return this.git.getStatus();
  }

  /**
   * Generate a commit message from current changes
   */
  async generateMessage(staged = true): Promise<GeneratedMessage> {
    const diff = await this.getDiff(staged);

    if (diff.files.length === 0) {
      throw new Error(staged ? "No staged changes to commit" : "No changes found");
    }

    return this.messageGenerator.generate(diff);
  }

  /**
   * Get diff with parsed file changes
   */
  async getDiff(staged = true): Promise<DiffSummary> {
    const rawDiff = await this.git.getDiff(staged);
    return this.diffAnalyzer.parseDiff(rawDiff, staged);
  }

  /**
   * Assess risk of committing changes
   */
  async assessRisk(staged = true): Promise<CommitRiskAssessment> {
    const diff = await this.getDiff(staged);
    return this.diffAnalyzer.assessRisk(diff, this.commitConfig.criticalPaths);
  }

  /**
   * Execute full commit workflow
   */
  async commit(request: Partial<CommitRequest> = {}): Promise<CommitResult> {
    // Stage files if requested
    if (request.all) {
      await this.git.stageAll();
    } else if (request.files?.length) {
      await this.git.stage(request.files);
    }

    // Get diff for message generation
    const diff = await this.getDiff(true);

    if (diff.files.length === 0) {
      return {
        success: false,
        error: "No changes staged for commit",
        approvalRequired: false,
        pushed: false,
      };
    }

    // Assess risk
    const risk = this.diffAnalyzer.assessRisk(diff, this.commitConfig.criticalPaths);

    // Check if approval required
    if (risk.recommendation !== "auto_execute" && !request.dryRun) {
      return {
        success: false,
        diff,
        riskScore: risk.totalScore,
        approvalRequired: true,
        pushed: false,
        error: `Risk score ${risk.totalScore} exceeds auto-execute threshold. ${risk.recommendation} recommended.`,
      };
    }

    // Generate or use provided message
    let message: GeneratedMessage;
    if (request.message) {
      message = {
        message: {
          type: "chore",
          subject: request.message,
          breaking: false,
          coAuthors: [],
        },
        fullText: request.message,
        confidence: 1,
        reasoning: "User-provided message",
      };
    } else {
      message = await this.messageGenerator.generate(diff);
    }

    if (request.dryRun) {
      return {
        success: true,
        message,
        diff,
        riskScore: risk.totalScore,
        approvalRequired: false,
        pushed: false,
      };
    }

    // Create commit
    const commitHash = await this.git.commit(message.fullText, { amend: request.amend });

    const result: CommitResult = {
      success: true,
      commitHash,
      message,
      diff,
      riskScore: risk.totalScore,
      approvalRequired: false,
      pushed: false,
    };

    // Push if requested
    if (request.push) {
      const pushResult = await this.push({ setUpstream: true });
      result.pushed = pushResult.success;
    }

    // Create PR if requested
    if (request.createPr && result.pushed) {
      const prResult = await this.createPR({
        title: request.prTitle,
        body: request.prBody,
        base: request.prBase,
      });
      result.prUrl = prResult.url;
    }

    return result;
  }

  /**
   * Push to remote
   */
  async push(options: Partial<PushOptions> = {}): Promise<PushResult> {
    try {
      const { remote, branch } = await this.git.push({
        remote: options.remote,
        branch: options.branch,
        force: options.force,
        setUpstream: options.setUpstream,
      });

      return {
        success: true,
        remote,
        branch,
        commits: 1, // TODO: count actual commits pushed
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        remote: options.remote ?? "origin",
        branch: options.branch ?? "unknown",
        commits: 0,
        error: err.message,
      };
    }
  }

  /**
   * Create a pull request
   */
  async createPR(options: Partial<PROptions> = {}): Promise<PRResult> {
    // Generate PR content if not provided
    if (!options.title || !options.body) {
      const commits = await this.git.getRecentCommits(10);
      const diff = await this.getDiff(false);
      const generated = await this.prCreator.generatePR(commits, diff);

      options.title = options.title ?? generated.title;
      options.body = options.body ?? generated.body;
    }

    return this.prCreator.create(options);
  }

  // ============================================================================
  // TOOL HANDLERS
  // ============================================================================

  private initializeTools(): void {
    this.registerTool({
      name: "get_status",
      description: "Get current git status",
      parameters: z.object({}),
      execute: async () => this.getStatus(),
    });

    this.registerTool({
      name: "generate_message",
      description: "Generate commit message from changes",
      parameters: z.object({
        staged: z.boolean().default(true),
      }),
      execute: async (params) => {
        const { staged } = params as { staged: boolean };
        return this.generateMessage(staged);
      },
    });

    this.registerTool({
      name: "commit",
      description: "Create a commit",
      parameters: z.object({
        message: z.string().optional(),
        all: z.boolean().default(false),
        push: z.boolean().default(false),
        createPr: z.boolean().default(false),
      }),
      execute: async (params) => this.commit(params as CommitRequest),
    });
  }

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  private async handleStatus(): Promise<AgentResult> {
    const status = await this.getStatus();
    const risk = status.isClean ? null : await this.assessRisk(!status.isClean);

    return this.createResult(
      true,
      { status, risk },
      undefined,
      1,
      `Branch: ${status.branch}, Clean: ${status.isClean}`
    );
  }

  private async handleGenerate(staged = true): Promise<AgentResult> {
    const message = await this.generateMessage(staged);
    return this.createResult(
      true,
      message,
      undefined,
      message.confidence,
      message.reasoning
    );
  }

  private async handleCommit(params: CommitRequest): Promise<AgentResult> {
    const result = await this.commit(params);
    return this.createResult(
      result.success,
      result,
      result.error,
      result.message?.confidence,
      result.message?.reasoning
    );
  }

  private async handlePush(params: PushOptions): Promise<AgentResult> {
    const result = await this.push(params);
    return this.createResult(
      result.success,
      result,
      result.error,
      1,
      `Pushed to ${result.remote}/${result.branch}`
    );
  }

  private async handleCreatePR(params: PROptions): Promise<AgentResult> {
    const result = await this.createPR(params);
    return this.createResult(
      result.success,
      result,
      result.error,
      1,
      result.url ? `PR created: ${result.url}` : "PR creation failed"
    );
  }

  private async handleFullWorkflow(params: CommitRequest): Promise<AgentResult> {
    // Full workflow: stage all → generate message → commit → push → create PR
    const fullParams: CommitRequest = {
      ...params,
      all: params.all ?? true,
      push: params.push ?? true,
      createPr: params.createPr ?? false,
    };

    const result = await this.commit(fullParams);
    return this.createResult(
      result.success,
      result,
      result.error,
      result.message?.confidence,
      result.message?.reasoning
    );
  }
}
