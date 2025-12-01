import { G as GitStatus, D as DiffSummary, F as FileChange, C as CommitRiskAssessment, P as PROptions, a as PRResult, b as GeneratedMessage, c as CommitMessage, d as CommitAgentConfig, e as CommitRequest, f as CommitResult, g as PushOptions, h as PushResult } from './types-IMH_luwC.js';
export { A as CommitAgentConfigSchema, p as CommitMessageSchema, r as CommitRequestSchema, s as CommitResultSchema, z as CommitRiskAssessmentSchema, y as CommitRiskFactor, x as CommitRiskFactorSchema, o as ConventionalType, n as ConventionalTypeSchema, l as DiffSummarySchema, k as FileChangeSchema, j as FileChangeType, i as FileChangeTypeSchema, q as GeneratedMessageSchema, m as GitStatusSchema, v as PROptionsSchema, w as PRResultSchema, t as PushOptionsSchema, u as PushResultSchema } from './types-IMH_luwC.js';
import { BaseAgent, AgentContext, AgentResult } from '@gicm/agent-core';
import 'zod';

/**
 * Constants for Commit Agent
 *
 * Risk weights, thresholds, and conventional commit mappings
 */
declare const RISK_WEIGHTS: {
    readonly linesChanged: 0.3;
    readonly filesChanged: 0.2;
    readonly criticalPaths: 0.25;
    readonly breakingChange: 0.2;
    readonly forcePush: 0.05;
};
declare const RISK_THRESHOLDS: {
    readonly linesLow: 50;
    readonly linesMedium: 150;
    readonly linesHigh: 300;
    readonly linesCritical: 500;
    readonly filesLow: 3;
    readonly filesMedium: 7;
    readonly filesHigh: 15;
    readonly filesCritical: 25;
    readonly autoExecuteMax: 40;
    readonly queueApprovalMax: 60;
    readonly escalateMax: 80;
};
declare const COMMIT_TYPE_DESCRIPTIONS: Record<string, string>;
declare const CRITICAL_PATH_PATTERNS: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
declare const BREAKING_CHANGE_INDICATORS: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
declare const DEFAULT_CO_AUTHOR = "Claude <noreply@anthropic.com>";
declare const COMMIT_FOOTER_TEMPLATE: string;

/**
 * Git Operations
 *
 * Executes git commands safely with structured output
 */

interface GitExecOptions {
    cwd?: string;
    timeout?: number;
}
declare class GitOperations {
    private cwd;
    private timeout;
    constructor(options?: GitExecOptions);
    /**
     * Execute a git command
     */
    exec(args: string[]): Promise<string>;
    /**
     * Get current branch name
     */
    getCurrentBranch(): Promise<string>;
    /**
     * Check if working directory is clean
     */
    isClean(): Promise<boolean>;
    /**
     * Get comprehensive git status
     */
    getStatus(): Promise<GitStatus>;
    /**
     * Get staged files
     */
    getStagedFiles(): Promise<string[]>;
    /**
     * Get diff (staged or all)
     */
    getDiff(staged?: boolean): Promise<string>;
    /**
     * Get diff with statistics
     */
    getDiffStat(staged?: boolean): Promise<string>;
    /**
     * Stage files
     */
    stage(files: string[]): Promise<void>;
    /**
     * Stage all changes
     */
    stageAll(): Promise<void>;
    /**
     * Unstage files
     */
    unstage(files: string[]): Promise<void>;
    /**
     * Create a commit
     */
    commit(message: string, options?: {
        amend?: boolean;
    }): Promise<string>;
    /**
     * Get the last commit hash
     */
    getLastCommitHash(): Promise<string>;
    /**
     * Get recent commit messages for style reference
     */
    getRecentCommits(count?: number): Promise<string[]>;
    /**
     * Push to remote
     */
    push(options?: {
        remote?: string;
        branch?: string;
        force?: boolean;
        setUpstream?: boolean;
    }): Promise<{
        remote: string;
        branch: string;
    }>;
    /**
     * Check if remote branch exists
     */
    remoteBranchExists(remote: string, branch: string): Promise<boolean>;
    /**
     * Get remote URL
     */
    getRemoteUrl(remote?: string): Promise<string>;
    /**
     * Parse status character to FileChangeType
     */
    private parseStatusChar;
}

/**
 * Diff Analyzer
 *
 * Parses git diffs and extracts meaningful information for LLM context
 */

interface DiffParseOptions {
    includeContent?: boolean;
    maxContentLength?: number;
}
declare class DiffAnalyzer {
    /**
     * Parse raw diff output into structured format
     */
    parseDiff(rawDiff: string, staged?: boolean, options?: DiffParseOptions): DiffSummary;
    /**
     * Parse diff output to extract file changes
     */
    parseFileChanges(rawDiff: string): FileChange[];
    /**
     * Assess risk factors for a diff
     */
    assessRisk(diff: DiffSummary, criticalPaths?: string[]): CommitRiskAssessment;
    /**
     * Create a summary for LLM context
     */
    createLLMContext(diff: DiffSummary, maxLength?: number): string;
    /**
     * Calculate risk score based on lines changed
     */
    private calculateLinesScore;
    /**
     * Calculate risk score based on files changed
     */
    private calculateFilesScore;
    /**
     * Detect breaking change indicators in diff
     */
    private detectBreakingChange;
}

/**
 * PR Creator
 *
 * Creates pull requests via GitHub CLI (gh)
 */

interface PRCreatorConfig {
    cwd?: string;
    timeout?: number;
    apiKey?: string;
}
declare class PRCreator {
    private cwd;
    private timeout;
    private messageGenerator;
    constructor(config?: PRCreatorConfig);
    /**
     * Create a pull request using gh CLI
     */
    create(options?: Partial<PROptions>): Promise<PRResult>;
    /**
     * Generate PR title and body from commits and diff
     */
    generatePR(commits: string[], diff: DiffSummary): Promise<{
        title: string;
        body: string;
    }>;
    /**
     * Check if there's an existing PR for the current branch
     */
    existingPR(): Promise<{
        exists: boolean;
        url?: string;
        number?: number;
    }>;
    /**
     * Execute a command
     */
    private exec;
}

/**
 * Message Generator
 *
 * AI-powered commit message generation using LLM
 */

interface GeneratorConfig {
    llmProvider?: "openai" | "anthropic" | "gemini";
    llmModel?: string;
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
    includeCoAuthor?: boolean;
    coAuthorName?: string;
    coAuthorEmail?: string;
}
declare class MessageGenerator {
    private llmClient;
    private diffAnalyzer;
    private config;
    constructor(config?: GeneratorConfig);
    /**
     * Generate a commit message from diff
     */
    generate(diff: DiffSummary): Promise<GeneratedMessage>;
    /**
     * Generate PR body from commits and diff
     */
    generatePRBody(commits: string[], diff: DiffSummary): Promise<{
        title: string;
        body: string;
        labels: string[];
    }>;
    /**
     * Format a CommitMessage to full text
     */
    formatMessage(message: CommitMessage): string;
    /**
     * Validate a commit message
     */
    validateMessage(message: CommitMessage): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Generate fallback commit message without LLM
     */
    private generateFallback;
    /**
     * Generate fallback PR body
     */
    private generateFallbackPRBody;
    /**
     * Find common path prefix
     */
    private findCommonPrefix;
    /**
     * Parse JSON from LLM response
     */
    private parseJSON;
}

/**
 * Commit Agent
 *
 * AI-powered git commit message generation with full workflow automation
 */

declare class CommitAgent extends BaseAgent {
    private git;
    private diffAnalyzer;
    private messageGenerator;
    private prCreator;
    private commitConfig;
    constructor(config?: Partial<CommitAgentConfig>);
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    /**
     * Get current git status
     */
    getStatus(): Promise<GitStatus>;
    /**
     * Generate a commit message from current changes
     */
    generateMessage(staged?: boolean): Promise<GeneratedMessage>;
    /**
     * Get diff with parsed file changes
     */
    getDiff(staged?: boolean): Promise<DiffSummary>;
    /**
     * Assess risk of committing changes
     */
    assessRisk(staged?: boolean): Promise<CommitRiskAssessment>;
    /**
     * Execute full commit workflow
     */
    commit(request?: Partial<CommitRequest>): Promise<CommitResult>;
    /**
     * Push to remote
     */
    push(options?: Partial<PushOptions>): Promise<PushResult>;
    /**
     * Create a pull request
     */
    createPR(options?: Partial<PROptions>): Promise<PRResult>;
    private initializeTools;
    private handleStatus;
    private handleGenerate;
    private handleCommit;
    private handlePush;
    private handleCreatePR;
    private handleFullWorkflow;
}

export { BREAKING_CHANGE_INDICATORS, COMMIT_FOOTER_TEMPLATE, COMMIT_TYPE_DESCRIPTIONS, CRITICAL_PATH_PATTERNS, CommitAgent, CommitAgentConfig, CommitMessage, CommitRequest, CommitResult, CommitRiskAssessment, DEFAULT_CO_AUTHOR, DiffAnalyzer, DiffSummary, FileChange, GeneratedMessage, GitOperations, GitStatus, MessageGenerator, PRCreator, PROptions, PRResult, PushOptions, PushResult, RISK_THRESHOLDS, RISK_WEIGHTS };
