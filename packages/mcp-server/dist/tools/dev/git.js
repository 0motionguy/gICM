/**
 * dev.git_* tools for MCP server
 *
 * AI-powered git commit workflow tools
 */
// Lazy load commit-agent to avoid dependency issues during build
async function getCommitAgent() {
    const { CommitAgent } = await import("@gicm/commit-agent");
    return CommitAgent;
}
/**
 * Get git status with risk assessment
 */
export async function gitStatus(options = {}) {
    const CommitAgent = await getCommitAgent();
    const agent = new CommitAgent({
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
        verbose: options.verbose,
    });
    const status = await agent.getStatus();
    const risk = status.isClean ? null : await agent.assessRisk();
    return { status, risk };
}
/**
 * Analyze changes and generate commit message
 */
export async function gitAnalyze(options) {
    const CommitAgent = await getCommitAgent();
    const agent = new CommitAgent({
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
    });
    const message = await agent.generateMessage(options.staged ?? true);
    return message;
}
/**
 * Create a git commit
 */
export async function gitCommit(options) {
    const CommitAgent = await getCommitAgent();
    const agent = new CommitAgent({
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
    });
    return agent.commit({
        message: options.message,
        all: options.all,
        amend: options.amend,
        dryRun: options.dryRun,
    });
}
/**
 * Push to remote
 */
export async function gitPush(options) {
    const CommitAgent = await getCommitAgent();
    const agent = new CommitAgent({
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
    });
    return agent.push({
        force: options.force,
        setUpstream: options.setUpstream ?? true,
        branch: options.branch,
    });
}
/**
 * Create a pull request
 */
export async function gitPR(options) {
    const CommitAgent = await getCommitAgent();
    const agent = new CommitAgent({
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
    });
    return agent.createPR({
        title: options.title,
        body: options.body,
        base: options.base,
        draft: options.draft,
    });
}
/**
 * Tool definitions for dev.git_* namespace
 */
export const gitTools = {
    "dev.git_status": {
        description: "Get current git status with risk assessment. Shows staged, unstaged, and untracked files along with a risk score for the changes.",
        parameters: {
            verbose: {
                type: "boolean",
                description: "Show verbose output",
                optional: true,
            },
        },
    },
    "dev.git_analyze": {
        description: "Analyze git diff and generate an AI-powered conventional commit message. Returns suggested message with confidence score and reasoning.",
        parameters: {
            staged: {
                type: "boolean",
                description: "Analyze only staged changes (default: true)",
                optional: true,
            },
        },
    },
    "dev.git_commit": {
        description: "Create a git commit with AI-generated or provided message. Routes through autonomy system for risk assessment.",
        parameters: {
            message: {
                type: "string",
                description: "Override AI-generated message",
                optional: true,
            },
            all: {
                type: "boolean",
                description: "Stage all changes before commit",
                optional: true,
            },
            amend: {
                type: "boolean",
                description: "Amend previous commit",
                optional: true,
            },
            dry_run: {
                type: "boolean",
                description: "Preview without committing",
                optional: true,
            },
        },
    },
    "dev.git_push": {
        description: "Push commits to remote. Force push requires high-risk approval through autonomy system.",
        parameters: {
            force: {
                type: "boolean",
                description: "Force push (dangerous)",
                optional: true,
            },
            set_upstream: {
                type: "boolean",
                description: "Set upstream tracking branch",
                optional: true,
            },
            branch: {
                type: "string",
                description: "Target branch",
                optional: true,
            },
        },
    },
    "dev.git_pr": {
        description: "Create a pull request with AI-generated title and description based on commits and changes.",
        parameters: {
            title: {
                type: "string",
                description: "PR title (auto-generated if not provided)",
                optional: true,
            },
            body: {
                type: "string",
                description: "PR body (auto-generated if not provided)",
                optional: true,
            },
            base: {
                type: "string",
                description: "Base branch (default: main)",
                optional: true,
            },
            draft: {
                type: "boolean",
                description: "Create as draft PR",
                optional: true,
            },
        },
    },
};
//# sourceMappingURL=git.js.map