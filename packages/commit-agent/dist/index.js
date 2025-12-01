// src/core/types.ts
import { z } from "zod";
var FileChangeTypeSchema = z.enum([
  "added",
  "modified",
  "deleted",
  "renamed",
  "copied"
]);
var FileChangeSchema = z.object({
  path: z.string(),
  type: FileChangeTypeSchema,
  linesAdded: z.number().default(0),
  linesRemoved: z.number().default(0),
  binary: z.boolean().default(false),
  oldPath: z.string().optional()
});
var DiffSummarySchema = z.object({
  files: z.array(FileChangeSchema),
  totalLinesAdded: z.number(),
  totalLinesRemoved: z.number(),
  totalFilesChanged: z.number(),
  diffContent: z.string(),
  staged: z.boolean()
});
var GitStatusSchema = z.object({
  branch: z.string(),
  ahead: z.number().default(0),
  behind: z.number().default(0),
  staged: z.array(FileChangeSchema),
  unstaged: z.array(FileChangeSchema),
  untracked: z.array(z.string()),
  isClean: z.boolean(),
  hasRemote: z.boolean()
});
var ConventionalTypeSchema = z.enum([
  "feat",
  // New feature
  "fix",
  // Bug fix
  "docs",
  // Documentation only
  "style",
  // Code style (formatting, semicolons)
  "refactor",
  // Code change that neither fixes nor adds
  "perf",
  // Performance improvement
  "test",
  // Adding or correcting tests
  "build",
  // Build system or dependencies
  "ci",
  // CI configuration
  "chore",
  // Other changes (maintenance)
  "revert"
  // Revert a previous commit
]);
var CommitMessageSchema = z.object({
  type: ConventionalTypeSchema,
  scope: z.string().optional(),
  subject: z.string().min(1).max(72),
  body: z.string().optional(),
  footer: z.string().optional(),
  breaking: z.boolean().default(false),
  coAuthors: z.array(z.string()).default([])
});
var GeneratedMessageSchema = z.object({
  message: CommitMessageSchema,
  fullText: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  alternatives: z.array(CommitMessageSchema).optional()
});
var CommitRequestSchema = z.object({
  staged: z.boolean().default(true),
  all: z.boolean().default(false),
  files: z.array(z.string()).optional(),
  message: z.string().optional(),
  push: z.boolean().default(false),
  createPr: z.boolean().default(false),
  prTitle: z.string().optional(),
  prBody: z.string().optional(),
  prBase: z.string().default("main"),
  dryRun: z.boolean().default(false),
  amend: z.boolean().default(false)
});
var CommitResultSchema = z.object({
  success: z.boolean(),
  commitHash: z.string().optional(),
  message: GeneratedMessageSchema.optional(),
  diff: DiffSummarySchema.optional(),
  pushed: z.boolean().default(false),
  prUrl: z.string().optional(),
  error: z.string().optional(),
  riskScore: z.number().optional(),
  approvalRequired: z.boolean().default(false)
});
var PushOptionsSchema = z.object({
  remote: z.string().default("origin"),
  branch: z.string().optional(),
  force: z.boolean().default(false),
  setUpstream: z.boolean().default(false),
  dryRun: z.boolean().default(false)
});
var PushResultSchema = z.object({
  success: z.boolean(),
  remote: z.string(),
  branch: z.string(),
  commits: z.number(),
  error: z.string().optional()
});
var PROptionsSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  base: z.string().default("main"),
  head: z.string().optional(),
  draft: z.boolean().default(false),
  dryRun: z.boolean().default(false)
});
var PRResultSchema = z.object({
  success: z.boolean(),
  url: z.string().optional(),
  number: z.number().optional(),
  title: z.string().optional(),
  error: z.string().optional()
});
var CommitRiskFactorSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  reason: z.string()
});
var CommitRiskAssessmentSchema = z.object({
  totalScore: z.number().min(0).max(100),
  factors: z.array(CommitRiskFactorSchema),
  recommendation: z.enum(["auto_execute", "queue_approval", "escalate", "reject"]),
  criticalPaths: z.array(z.string()),
  isBreakingChange: z.boolean()
});
var CommitAgentConfigSchema = z.object({
  name: z.string().default("commit-agent"),
  description: z.string().optional(),
  llmProvider: z.enum(["openai", "anthropic", "gemini"]).default("anthropic"),
  llmModel: z.string().optional(),
  apiKey: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.3),
  maxTokens: z.number().default(2048),
  verbose: z.boolean().default(false),
  conventionalCommits: z.boolean().default(true),
  signCommits: z.boolean().default(false),
  includeCoAuthors: z.boolean().default(true),
  coAuthorName: z.string().default("Claude"),
  coAuthorEmail: z.string().default("noreply@anthropic.com"),
  maxMessageLength: z.number().default(72),
  // Risk thresholds
  autoCommitMaxLines: z.number().default(100),
  autoCommitMaxFiles: z.number().default(5),
  criticalPaths: z.array(z.string()).default([
    "src/core/",
    "src/config/",
    ".env",
    "secrets",
    "credentials",
    "package.json",
    "pnpm-workspace.yaml",
    ".github/workflows/"
  ])
});

// src/core/constants.ts
var RISK_WEIGHTS = {
  linesChanged: 0.3,
  // 30% weight
  filesChanged: 0.2,
  // 20% weight
  criticalPaths: 0.25,
  // 25% weight
  breakingChange: 0.2,
  // 20% weight
  forcePush: 0.05
  // 5% weight (always escalate if present)
};
var RISK_THRESHOLDS = {
  // Lines changed
  linesLow: 50,
  // <50 lines = safe
  linesMedium: 150,
  // 50-150 = low risk
  linesHigh: 300,
  // 150-300 = medium risk
  linesCritical: 500,
  // >500 = high risk
  // Files changed
  filesLow: 3,
  // <3 files = safe
  filesMedium: 7,
  // 3-7 = low risk
  filesHigh: 15,
  // 7-15 = medium risk
  filesCritical: 25,
  // >25 = high risk
  // Decision score thresholds
  autoExecuteMax: 40,
  // 0-40 = auto execute
  queueApprovalMax: 60,
  // 41-60 = queue approval
  escalateMax: 80
  // 61-80 = escalate
  // >80 = reject (or escalate with urgency)
};
var COMMIT_TYPE_DESCRIPTIONS = {
  feat: "A new feature for the user",
  fix: "A bug fix",
  docs: "Documentation only changes",
  style: "Changes that do not affect the meaning of the code (formatting, semicolons)",
  refactor: "A code change that neither fixes a bug nor adds a feature",
  perf: "A code change that improves performance",
  test: "Adding missing tests or correcting existing tests",
  build: "Changes that affect the build system or external dependencies",
  ci: "Changes to CI configuration files and scripts",
  chore: "Other changes that don't modify src or test files",
  revert: "Reverts a previous commit"
};
var CRITICAL_PATH_PATTERNS = [
  // Core infrastructure
  /^src\/core\//,
  /^packages\/agent-core\//,
  /^packages\/autonomy\//,
  // Configuration
  /\.env/,
  /^\.github\/workflows\//,
  /package\.json$/,
  /pnpm-workspace\.yaml$/,
  /tsconfig\.json$/,
  // Security-sensitive
  /secret/i,
  /credential/i,
  /password/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  // Database
  /migration/i,
  /schema\.(sql|prisma|ts)$/
];
var BREAKING_CHANGE_INDICATORS = [
  /^feat!/,
  /^fix!/,
  /BREAKING CHANGE:/i,
  /\bremove\b.*\bapi\b/i,
  /\bdelete\b.*\bendpoint\b/i,
  /\bdeprecate\b/i
];
var DEFAULT_CO_AUTHOR = "Claude <noreply@anthropic.com>";
var COMMIT_FOOTER_TEMPLATE = `
\u{1F916} Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: ${DEFAULT_CO_AUTHOR}
`.trim();

// src/git/operations.ts
import { exec } from "child_process";
import { promisify } from "util";
var execAsync = promisify(exec);
var GitOperations = class {
  cwd;
  timeout;
  constructor(options = {}) {
    this.cwd = options.cwd ?? process.cwd();
    this.timeout = options.timeout ?? 3e4;
  }
  /**
   * Execute a git command
   */
  async exec(args) {
    const command = `git ${args.join(" ")}`;
    try {
      const { stdout } = await execAsync(command, {
        cwd: this.cwd,
        timeout: this.timeout,
        maxBuffer: 10 * 1024 * 1024
        // 10MB buffer for large diffs
      });
      return stdout.trim();
    } catch (error) {
      const err = error;
      throw new Error(err.stderr || err.message);
    }
  }
  /**
   * Get current branch name
   */
  async getCurrentBranch() {
    return this.exec(["rev-parse", "--abbrev-ref", "HEAD"]);
  }
  /**
   * Check if working directory is clean
   */
  async isClean() {
    const output = await this.exec(["status", "--porcelain"]);
    return output.length === 0;
  }
  /**
   * Get comprehensive git status
   */
  async getStatus() {
    const [branch, porcelain, remote] = await Promise.all([
      this.getCurrentBranch(),
      this.exec(["status", "--porcelain=v2", "--branch"]),
      this.exec(["remote"]).catch(() => "")
    ]);
    const lines = porcelain.split("\n").filter(Boolean);
    const staged = [];
    const unstaged = [];
    const untracked = [];
    let ahead = 0;
    let behind = 0;
    for (const line of lines) {
      if (line.startsWith("# branch.ab")) {
        const match = line.match(/\+(\d+) -(\d+)/);
        if (match) {
          ahead = parseInt(match[1], 10);
          behind = parseInt(match[2], 10);
        }
        continue;
      }
      if (line.startsWith("#")) continue;
      if (line.startsWith("?")) {
        untracked.push(line.substring(2));
        continue;
      }
      if (line.startsWith("1") || line.startsWith("2")) {
        const parts = line.split("	");
        const statusPart = parts[0].split(" ");
        const xy = statusPart[1] || "";
        const path = parts[parts.length - 1];
        const indexStatus = xy[0];
        const workStatus = xy[1];
        if (indexStatus !== "." && indexStatus !== "?") {
          staged.push({
            path,
            type: this.parseStatusChar(indexStatus),
            linesAdded: 0,
            linesRemoved: 0,
            binary: false
          });
        }
        if (workStatus !== "." && workStatus !== "?") {
          unstaged.push({
            path,
            type: this.parseStatusChar(workStatus),
            linesAdded: 0,
            linesRemoved: 0,
            binary: false
          });
        }
      }
    }
    return {
      branch,
      ahead,
      behind,
      staged,
      unstaged,
      untracked,
      isClean: staged.length === 0 && unstaged.length === 0 && untracked.length === 0,
      hasRemote: remote.length > 0
    };
  }
  /**
   * Get staged files
   */
  async getStagedFiles() {
    const output = await this.exec(["diff", "--cached", "--name-only"]);
    return output ? output.split("\n").filter(Boolean) : [];
  }
  /**
   * Get diff (staged or all)
   */
  async getDiff(staged = true) {
    const args = ["diff"];
    if (staged) args.push("--cached");
    args.push("--no-color");
    return this.exec(args);
  }
  /**
   * Get diff with statistics
   */
  async getDiffStat(staged = true) {
    const args = ["diff", "--stat"];
    if (staged) args.push("--cached");
    return this.exec(args);
  }
  /**
   * Stage files
   */
  async stage(files) {
    if (files.length === 0) return;
    await this.exec(["add", "--", ...files]);
  }
  /**
   * Stage all changes
   */
  async stageAll() {
    await this.exec(["add", "-A"]);
  }
  /**
   * Unstage files
   */
  async unstage(files) {
    if (files.length === 0) return;
    await this.exec(["reset", "HEAD", "--", ...files]);
  }
  /**
   * Create a commit
   */
  async commit(message, options = {}) {
    const args = ["commit", "-m", message];
    if (options.amend) args.push("--amend");
    await this.exec(args);
    return this.getLastCommitHash();
  }
  /**
   * Get the last commit hash
   */
  async getLastCommitHash() {
    return this.exec(["rev-parse", "HEAD"]);
  }
  /**
   * Get recent commit messages for style reference
   */
  async getRecentCommits(count = 5) {
    const output = await this.exec([
      "log",
      `--format=%s`,
      `-${count}`
    ]);
    return output ? output.split("\n").filter(Boolean) : [];
  }
  /**
   * Push to remote
   */
  async push(options = {}) {
    const remote = options.remote ?? "origin";
    const branch = options.branch ?? await this.getCurrentBranch();
    const args = ["push"];
    if (options.force) args.push("--force");
    if (options.setUpstream) args.push("-u");
    args.push(remote, branch);
    await this.exec(args);
    return { remote, branch };
  }
  /**
   * Check if remote branch exists
   */
  async remoteBranchExists(remote, branch) {
    try {
      await this.exec(["ls-remote", "--exit-code", remote, `refs/heads/${branch}`]);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Get remote URL
   */
  async getRemoteUrl(remote = "origin") {
    return this.exec(["remote", "get-url", remote]);
  }
  /**
   * Parse status character to FileChangeType
   */
  parseStatusChar(char) {
    switch (char.toUpperCase()) {
      case "A":
        return "added";
      case "M":
        return "modified";
      case "D":
        return "deleted";
      case "R":
        return "renamed";
      case "C":
        return "copied";
      default:
        return "modified";
    }
  }
};

// src/git/diff-analyzer.ts
var DiffAnalyzer = class {
  /**
   * Parse raw diff output into structured format
   */
  parseDiff(rawDiff, staged = true, options = {}) {
    const files = this.parseFileChanges(rawDiff);
    const totalLinesAdded = files.reduce((sum, f) => sum + f.linesAdded, 0);
    const totalLinesRemoved = files.reduce((sum, f) => sum + f.linesRemoved, 0);
    let diffContent = rawDiff;
    if (options.maxContentLength && diffContent.length > options.maxContentLength) {
      diffContent = diffContent.substring(0, options.maxContentLength) + "\n... (truncated)";
    }
    return {
      files,
      totalLinesAdded,
      totalLinesRemoved,
      totalFilesChanged: files.length,
      diffContent: options.includeContent !== false ? diffContent : "",
      staged
    };
  }
  /**
   * Parse diff output to extract file changes
   */
  parseFileChanges(rawDiff) {
    const files = [];
    const lines = rawDiff.split("\n");
    let currentFile = null;
    let linesAdded = 0;
    let linesRemoved = 0;
    for (const line of lines) {
      if (line.startsWith("diff --git")) {
        if (currentFile?.path) {
          files.push({
            path: currentFile.path,
            type: currentFile.type ?? "modified",
            linesAdded,
            linesRemoved,
            binary: currentFile.binary ?? false,
            oldPath: currentFile.oldPath
          });
        }
        const match = line.match(/diff --git a\/(.+) b\/(.+)/);
        if (match) {
          currentFile = {
            path: match[2],
            type: "modified",
            binary: false
          };
          if (match[1] !== match[2]) {
            currentFile.oldPath = match[1];
            currentFile.type = "renamed";
          }
        }
        linesAdded = 0;
        linesRemoved = 0;
        continue;
      }
      if (line.startsWith("new file mode")) {
        if (currentFile) currentFile.type = "added";
        continue;
      }
      if (line.startsWith("deleted file mode")) {
        if (currentFile) currentFile.type = "deleted";
        continue;
      }
      if (line.includes("Binary files") || line.includes("GIT binary patch")) {
        if (currentFile) currentFile.binary = true;
        continue;
      }
      if (line.startsWith("+") && !line.startsWith("+++")) {
        linesAdded++;
        continue;
      }
      if (line.startsWith("-") && !line.startsWith("---")) {
        linesRemoved++;
        continue;
      }
    }
    if (currentFile?.path) {
      files.push({
        path: currentFile.path,
        type: currentFile.type ?? "modified",
        linesAdded,
        linesRemoved,
        binary: currentFile.binary ?? false,
        oldPath: currentFile.oldPath
      });
    }
    return files;
  }
  /**
   * Assess risk factors for a diff
   */
  assessRisk(diff, criticalPaths = []) {
    const factors = [];
    const touchedCriticalPaths = [];
    const totalLines = diff.totalLinesAdded + diff.totalLinesRemoved;
    const linesScore = this.calculateLinesScore(totalLines);
    factors.push({
      name: "lines_changed",
      score: linesScore,
      weight: RISK_WEIGHTS.linesChanged,
      reason: `${totalLines} lines changed (+${diff.totalLinesAdded}/-${diff.totalLinesRemoved})`
    });
    const filesScore = this.calculateFilesScore(diff.totalFilesChanged);
    factors.push({
      name: "files_changed",
      score: filesScore,
      weight: RISK_WEIGHTS.filesChanged,
      reason: `${diff.totalFilesChanged} files changed`
    });
    const allCriticalPatterns = [
      ...CRITICAL_PATH_PATTERNS,
      ...criticalPaths.map((p) => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    ];
    for (const file of diff.files) {
      for (const pattern of allCriticalPatterns) {
        if (pattern.test(file.path)) {
          touchedCriticalPaths.push(file.path);
          break;
        }
      }
    }
    const criticalPathsScore = touchedCriticalPaths.length > 0 ? 100 : 0;
    factors.push({
      name: "critical_paths",
      score: criticalPathsScore,
      weight: RISK_WEIGHTS.criticalPaths,
      reason: touchedCriticalPaths.length > 0 ? `Touches critical paths: ${touchedCriticalPaths.slice(0, 3).join(", ")}${touchedCriticalPaths.length > 3 ? "..." : ""}` : "No critical paths affected"
    });
    const isBreaking = this.detectBreakingChange(diff.diffContent);
    const breakingScore = isBreaking ? 100 : 0;
    factors.push({
      name: "breaking_change",
      score: breakingScore,
      weight: RISK_WEIGHTS.breakingChange,
      reason: isBreaking ? "Contains breaking change indicators" : "No breaking changes detected"
    });
    const totalScore = Math.min(
      100,
      factors.reduce((sum, f) => sum + f.score * f.weight, 0)
    );
    let recommendation;
    if (totalScore <= RISK_THRESHOLDS.autoExecuteMax) {
      recommendation = "auto_execute";
    } else if (totalScore <= RISK_THRESHOLDS.queueApprovalMax) {
      recommendation = "queue_approval";
    } else if (totalScore <= RISK_THRESHOLDS.escalateMax) {
      recommendation = "escalate";
    } else {
      recommendation = "reject";
    }
    return {
      totalScore: Math.round(totalScore),
      factors,
      recommendation,
      criticalPaths: touchedCriticalPaths,
      isBreakingChange: isBreaking
    };
  }
  /**
   * Create a summary for LLM context
   */
  createLLMContext(diff, maxLength = 8e3) {
    const sections = [];
    sections.push(`## Summary
- Files changed: ${diff.totalFilesChanged}
- Lines added: ${diff.totalLinesAdded}
- Lines removed: ${diff.totalLinesRemoved}
`);
    const fileList = diff.files.map((f) => {
      const indicator = f.type === "added" ? "+" : f.type === "deleted" ? "-" : f.type === "renamed" ? "\u2192" : "M";
      return `  ${indicator} ${f.path} (+${f.linesAdded}/-${f.linesRemoved})`;
    }).join("\n");
    sections.push(`## Files
${fileList}`);
    let diffContent = diff.diffContent;
    const headerLength = sections.join("\n\n").length;
    const availableLength = maxLength - headerLength - 100;
    if (diffContent.length > availableLength) {
      diffContent = diffContent.substring(0, availableLength) + "\n... (truncated)";
    }
    sections.push(`## Diff
\`\`\`diff
${diffContent}
\`\`\``);
    return sections.join("\n\n");
  }
  /**
   * Calculate risk score based on lines changed
   */
  calculateLinesScore(lines) {
    if (lines <= RISK_THRESHOLDS.linesLow) return 0;
    if (lines <= RISK_THRESHOLDS.linesMedium) return 25;
    if (lines <= RISK_THRESHOLDS.linesHigh) return 50;
    if (lines <= RISK_THRESHOLDS.linesCritical) return 75;
    return 100;
  }
  /**
   * Calculate risk score based on files changed
   */
  calculateFilesScore(files) {
    if (files <= RISK_THRESHOLDS.filesLow) return 0;
    if (files <= RISK_THRESHOLDS.filesMedium) return 25;
    if (files <= RISK_THRESHOLDS.filesHigh) return 50;
    if (files <= RISK_THRESHOLDS.filesCritical) return 75;
    return 100;
  }
  /**
   * Detect breaking change indicators in diff
   */
  detectBreakingChange(diffContent) {
    for (const pattern of BREAKING_CHANGE_INDICATORS) {
      if (pattern.test(diffContent)) return true;
    }
    return false;
  }
};

// src/git/pr-creator.ts
import { exec as exec2 } from "child_process";
import { promisify as promisify2 } from "util";

// src/message/generator.ts
import { createLLMClient } from "@gicm/agent-core";

// src/message/prompts.ts
var COMMIT_MESSAGE_SYSTEM_PROMPT = `You are an expert at writing clear, concise git commit messages following the Conventional Commits specification.

Your task is to analyze code changes and generate appropriate commit messages.

## Conventional Commit Format
\`\`\`
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
\`\`\`

## Commit Types
- feat: A new feature for the user
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (formatting)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests or correcting existing tests
- build: Changes that affect the build system or dependencies
- ci: Changes to CI configuration files and scripts
- chore: Other changes that don't modify src or test files
- revert: Reverts a previous commit

## Rules
1. The description MUST be in imperative mood ("add" not "added", "fix" not "fixed")
2. The description MUST NOT exceed 72 characters
3. The description MUST NOT end with a period
4. Use lowercase for the description (except proper nouns)
5. The body should explain WHAT and WHY, not HOW
6. Use "!" after the type/scope for breaking changes

## Scope Guidelines
- Use the package name for monorepo changes (e.g., "commit-agent", "cli")
- Use the feature area for app changes (e.g., "auth", "api")
- Omit scope if the change is global or unclear

## Examples
- feat(auth): add OAuth2 login support
- fix(api): handle null response from user endpoint
- docs: update installation instructions
- refactor(core): simplify error handling logic
- feat!: remove deprecated getUserById function

Respond with a JSON object containing your analysis.`;
var COMMIT_MESSAGE_USER_PROMPT = (diffContext) => `Analyze the following code changes and generate an appropriate commit message.

${diffContext}

Respond with a JSON object in this exact format:
{
  "type": "feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert",
  "scope": "optional scope or null",
  "subject": "imperative description under 72 chars",
  "body": "optional longer description or null",
  "breaking": false,
  "reasoning": "brief explanation of why you chose this type and description"
}`;
var PR_BODY_SYSTEM_PROMPT = `You are an expert at writing clear, informative pull request descriptions.

Your task is to analyze code changes and generate a comprehensive PR description.

## PR Description Format
\`\`\`markdown
## Summary
Brief overview of what this PR does (1-3 sentences)

## Changes
- Bulleted list of specific changes
- Group related changes together
- Focus on WHAT changed, not HOW

## Testing
- How to test these changes
- Any specific test commands
- Edge cases to consider

## Notes
- Any additional context
- Related issues or PRs
- Breaking changes or migration steps
\`\`\`

## Guidelines
1. Be concise but comprehensive
2. Focus on the user impact
3. Highlight any breaking changes prominently
4. Include testing instructions
5. Reference related issues/PRs if mentioned in commits`;
var PR_BODY_USER_PROMPT = (commits, diffSummary) => `Generate a pull request description for the following changes.

## Commits
${commits.map((c) => `- ${c}`).join("\n")}

## Changes Summary
${diffSummary}

Respond with a JSON object in this exact format:
{
  "title": "PR title (similar to main commit message)",
  "body": "Full markdown PR body following the template",
  "labels": ["optional", "suggested", "labels"]
}`;

// src/message/generator.ts
var MessageGenerator = class {
  llmClient = null;
  diffAnalyzer;
  config;
  constructor(config = {}) {
    this.config = {
      llmProvider: "anthropic",
      temperature: 0.3,
      maxTokens: 2048,
      includeCoAuthor: true,
      coAuthorName: "Claude",
      coAuthorEmail: "noreply@anthropic.com",
      ...config
    };
    this.diffAnalyzer = new DiffAnalyzer();
    if (this.config.apiKey) {
      this.llmClient = createLLMClient({
        provider: this.config.llmProvider,
        model: this.config.llmModel,
        apiKey: this.config.apiKey,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens
      });
    }
  }
  /**
   * Generate a commit message from diff
   */
  async generate(diff) {
    if (!this.llmClient) {
      return this.generateFallback(diff);
    }
    try {
      const context = this.diffAnalyzer.createLLMContext(diff);
      const prompt = COMMIT_MESSAGE_USER_PROMPT(context);
      const response = await this.llmClient.chat([
        { role: "system", content: COMMIT_MESSAGE_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ]);
      const parsed = this.parseJSON(response.content);
      if (!parsed) {
        return this.generateFallback(diff);
      }
      const message = {
        type: parsed.type,
        scope: parsed.scope ?? void 0,
        subject: parsed.subject,
        body: parsed.body ?? void 0,
        breaking: parsed.breaking ?? false,
        coAuthors: this.config.includeCoAuthor ? [`${this.config.coAuthorName} <${this.config.coAuthorEmail}>`] : []
      };
      return {
        message,
        fullText: this.formatMessage(message),
        confidence: 0.9,
        reasoning: parsed.reasoning
      };
    } catch (error) {
      console.error("LLM generation failed, using fallback:", error);
      return this.generateFallback(diff);
    }
  }
  /**
   * Generate PR body from commits and diff
   */
  async generatePRBody(commits, diff) {
    const diffSummary = `${diff.totalFilesChanged} files, +${diff.totalLinesAdded}/-${diff.totalLinesRemoved} lines`;
    if (!this.llmClient) {
      return {
        title: commits[0] || "Update",
        body: this.generateFallbackPRBody(commits, diff),
        labels: []
      };
    }
    try {
      const prompt = PR_BODY_USER_PROMPT(commits, diffSummary);
      const response = await this.llmClient.chat([
        { role: "system", content: PR_BODY_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ]);
      const parsed = this.parseJSON(response.content);
      if (!parsed) {
        return {
          title: commits[0] || "Update",
          body: this.generateFallbackPRBody(commits, diff),
          labels: []
        };
      }
      return parsed;
    } catch (error) {
      console.error("PR body generation failed:", error);
      return {
        title: commits[0] || "Update",
        body: this.generateFallbackPRBody(commits, diff),
        labels: []
      };
    }
  }
  /**
   * Format a CommitMessage to full text
   */
  formatMessage(message) {
    const parts = [];
    let header = message.type;
    if (message.scope) header += `(${message.scope})`;
    if (message.breaking) header += "!";
    header += `: ${message.subject}`;
    parts.push(header);
    if (message.body) {
      parts.push("");
      parts.push(message.body);
    }
    parts.push("");
    parts.push(COMMIT_FOOTER_TEMPLATE);
    return parts.join("\n");
  }
  /**
   * Validate a commit message
   */
  validateMessage(message) {
    const errors = [];
    if (!message.type) {
      errors.push("Missing commit type");
    }
    if (!message.subject) {
      errors.push("Missing commit subject");
    } else {
      if (message.subject.length > 72) {
        errors.push(`Subject too long (${message.subject.length}/72 chars)`);
      }
      if (message.subject.endsWith(".")) {
        errors.push("Subject should not end with a period");
      }
      if (!/^[a-z]/.test(message.subject)) {
        errors.push("Subject should start with lowercase");
      }
    }
    return { valid: errors.length === 0, errors };
  }
  /**
   * Generate fallback commit message without LLM
   */
  generateFallback(diff) {
    let type = "chore";
    let scope;
    const paths = diff.files.map((f) => f.path);
    if (paths.some((p) => p.includes("test") || p.includes("spec"))) {
      type = "test";
    } else if (paths.some((p) => p.endsWith(".md") || p.includes("docs/"))) {
      type = "docs";
    } else if (paths.some((p) => p.includes(".github/") || p.includes("ci"))) {
      type = "ci";
    } else if (paths.some((p) => p.includes("package.json") || p.includes("deps"))) {
      type = "build";
    } else if (diff.files.some((f) => f.type === "added")) {
      type = "feat";
    } else {
      type = "chore";
    }
    const commonPrefix = this.findCommonPrefix(paths);
    if (commonPrefix) {
      scope = commonPrefix.split("/")[0];
      if (scope === "src" || scope === "packages") {
        scope = commonPrefix.split("/")[1] || void 0;
      }
    }
    const action = diff.files[0]?.type === "added" ? "add" : diff.files[0]?.type === "deleted" ? "remove" : "update";
    const target = diff.files.length === 1 ? diff.files[0].path.split("/").pop() : `${diff.files.length} files`;
    const subject = `${action} ${target}`;
    const message = {
      type,
      scope,
      subject: subject.substring(0, 72),
      breaking: false,
      coAuthors: this.config.includeCoAuthor ? [`${this.config.coAuthorName} <${this.config.coAuthorEmail}>`] : []
    };
    return {
      message,
      fullText: this.formatMessage(message),
      confidence: 0.5,
      reasoning: "Generated using file pattern heuristics (no LLM available)"
    };
  }
  /**
   * Generate fallback PR body
   */
  generateFallbackPRBody(commits, diff) {
    return `## Summary
This PR includes ${commits.length} commit(s) affecting ${diff.totalFilesChanged} files.

## Changes
${diff.files.map((f) => `- ${f.type}: \`${f.path}\` (+${f.linesAdded}/-${f.linesRemoved})`).join("\n")}

## Commits
${commits.map((c) => `- ${c}`).join("\n")}

---
\u{1F916} Generated with [Claude Code](https://claude.com/claude-code)
`;
  }
  /**
   * Find common path prefix
   */
  findCommonPrefix(paths) {
    if (paths.length === 0) return "";
    if (paths.length === 1) return paths[0].substring(0, paths[0].lastIndexOf("/"));
    const sorted = paths.slice().sort();
    const first = sorted[0].split("/");
    const last = sorted[sorted.length - 1].split("/");
    const common = [];
    for (let i = 0; i < Math.min(first.length, last.length); i++) {
      if (first[i] === last[i]) {
        common.push(first[i]);
      } else {
        break;
      }
    }
    return common.join("/");
  }
  /**
   * Parse JSON from LLM response
   */
  parseJSON(text) {
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        return JSON.parse(text.substring(start, end + 1));
      }
      return null;
    } catch {
      return null;
    }
  }
};

// src/git/pr-creator.ts
var execAsync2 = promisify2(exec2);
var PRCreator = class {
  cwd;
  timeout;
  messageGenerator;
  constructor(config = {}) {
    this.cwd = config.cwd ?? process.cwd();
    this.timeout = config.timeout ?? 6e4;
    this.messageGenerator = new MessageGenerator({ apiKey: config.apiKey });
  }
  /**
   * Create a pull request using gh CLI
   */
  async create(options = {}) {
    if (options.dryRun) {
      return {
        success: true,
        title: options.title || "PR Title",
        error: "Dry run - PR not created"
      };
    }
    try {
      await this.exec(["gh", "--version"]);
      const args = ["gh", "pr", "create"];
      if (options.title) {
        args.push("--title", options.title);
      }
      if (options.body) {
        args.push("--body", options.body);
      }
      if (options.base) {
        args.push("--base", options.base);
      }
      if (options.head) {
        args.push("--head", options.head);
      }
      if (options.draft) {
        args.push("--draft");
      }
      const output = await this.exec(args);
      const urlMatch = output.match(/https:\/\/github\.com\/[^\s]+\/pull\/\d+/);
      return {
        success: true,
        url: urlMatch?.[0],
        title: options.title
      };
    } catch (error) {
      const err = error;
      return {
        success: false,
        error: err.stderr || err.message
      };
    }
  }
  /**
   * Generate PR title and body from commits and diff
   */
  async generatePR(commits, diff) {
    const result = await this.messageGenerator.generatePRBody(commits, diff);
    return {
      title: result.title,
      body: result.body
    };
  }
  /**
   * Check if there's an existing PR for the current branch
   */
  async existingPR() {
    try {
      const output = await this.exec(["gh", "pr", "view", "--json", "url,number"]);
      const data = JSON.parse(output);
      return {
        exists: true,
        url: data.url,
        number: data.number
      };
    } catch {
      return { exists: false };
    }
  }
  /**
   * Execute a command
   */
  async exec(args) {
    const command = args.join(" ");
    const { stdout } = await execAsync2(command, {
      cwd: this.cwd,
      timeout: this.timeout
    });
    return stdout.trim();
  }
};

// src/commit-agent.ts
import { BaseAgent } from "@gicm/agent-core";
import { z as z2 } from "zod";
var CommitAgent = class extends BaseAgent {
  git;
  diffAnalyzer;
  messageGenerator;
  prCreator;
  commitConfig;
  constructor(config = {}) {
    const validated = CommitAgentConfigSchema.parse(config);
    super("commit-agent", {
      name: validated.name,
      description: validated.description ?? "AI-powered git commit workflow",
      llmProvider: validated.llmProvider,
      llmModel: validated.llmModel,
      apiKey: validated.apiKey,
      temperature: validated.temperature,
      maxTokens: validated.maxTokens,
      verbose: validated.verbose
    });
    this.commitConfig = validated;
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
      coAuthorEmail: validated.coAuthorEmail
    });
    this.prCreator = new PRCreator({ apiKey: validated.apiKey });
    this.initializeTools();
  }
  getSystemPrompt() {
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
  async analyze(context) {
    const action = context.action ?? "status";
    const params = context.params ?? {};
    this.log(`Executing action: ${action}`, params);
    try {
      switch (action) {
        case "status":
          return this.handleStatus();
        case "generate":
          return this.handleGenerate(params.staged);
        case "commit":
          return this.handleCommit(params);
        case "push":
          return this.handlePush(params);
        case "create_pr":
          return this.handleCreatePR(params);
        case "full":
          return this.handleFullWorkflow(params);
        default:
          return this.createResult(false, null, `Unknown action: ${action}`);
      }
    } catch (error) {
      const err = error;
      return this.createResult(false, null, err.message);
    }
  }
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  /**
   * Get current git status
   */
  async getStatus() {
    return this.git.getStatus();
  }
  /**
   * Generate a commit message from current changes
   */
  async generateMessage(staged = true) {
    const diff = await this.getDiff(staged);
    if (diff.files.length === 0) {
      throw new Error(staged ? "No staged changes to commit" : "No changes found");
    }
    return this.messageGenerator.generate(diff);
  }
  /**
   * Get diff with parsed file changes
   */
  async getDiff(staged = true) {
    const rawDiff = await this.git.getDiff(staged);
    return this.diffAnalyzer.parseDiff(rawDiff, staged);
  }
  /**
   * Assess risk of committing changes
   */
  async assessRisk(staged = true) {
    const diff = await this.getDiff(staged);
    return this.diffAnalyzer.assessRisk(diff, this.commitConfig.criticalPaths);
  }
  /**
   * Execute full commit workflow
   */
  async commit(request = {}) {
    if (request.all) {
      await this.git.stageAll();
    } else if (request.files?.length) {
      await this.git.stage(request.files);
    }
    const diff = await this.getDiff(true);
    if (diff.files.length === 0) {
      return {
        success: false,
        error: "No changes staged for commit",
        approvalRequired: false,
        pushed: false
      };
    }
    const risk = this.diffAnalyzer.assessRisk(diff, this.commitConfig.criticalPaths);
    if (risk.recommendation !== "auto_execute" && !request.dryRun) {
      return {
        success: false,
        diff,
        riskScore: risk.totalScore,
        approvalRequired: true,
        pushed: false,
        error: `Risk score ${risk.totalScore} exceeds auto-execute threshold. ${risk.recommendation} recommended.`
      };
    }
    let message;
    if (request.message) {
      message = {
        message: {
          type: "chore",
          subject: request.message,
          breaking: false,
          coAuthors: []
        },
        fullText: request.message,
        confidence: 1,
        reasoning: "User-provided message"
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
        pushed: false
      };
    }
    const commitHash = await this.git.commit(message.fullText, { amend: request.amend });
    const result = {
      success: true,
      commitHash,
      message,
      diff,
      riskScore: risk.totalScore,
      approvalRequired: false,
      pushed: false
    };
    if (request.push) {
      const pushResult = await this.push({ setUpstream: true });
      result.pushed = pushResult.success;
    }
    if (request.createPr && result.pushed) {
      const prResult = await this.createPR({
        title: request.prTitle,
        body: request.prBody,
        base: request.prBase
      });
      result.prUrl = prResult.url;
    }
    return result;
  }
  /**
   * Push to remote
   */
  async push(options = {}) {
    try {
      const { remote, branch } = await this.git.push({
        remote: options.remote,
        branch: options.branch,
        force: options.force,
        setUpstream: options.setUpstream
      });
      return {
        success: true,
        remote,
        branch,
        commits: 1
        // TODO: count actual commits pushed
      };
    } catch (error) {
      const err = error;
      return {
        success: false,
        remote: options.remote ?? "origin",
        branch: options.branch ?? "unknown",
        commits: 0,
        error: err.message
      };
    }
  }
  /**
   * Create a pull request
   */
  async createPR(options = {}) {
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
  initializeTools() {
    this.registerTool({
      name: "get_status",
      description: "Get current git status",
      parameters: z2.object({}),
      execute: async () => this.getStatus()
    });
    this.registerTool({
      name: "generate_message",
      description: "Generate commit message from changes",
      parameters: z2.object({
        staged: z2.boolean().default(true)
      }),
      execute: async (params) => {
        const { staged } = params;
        return this.generateMessage(staged);
      }
    });
    this.registerTool({
      name: "commit",
      description: "Create a commit",
      parameters: z2.object({
        message: z2.string().optional(),
        all: z2.boolean().default(false),
        push: z2.boolean().default(false),
        createPr: z2.boolean().default(false)
      }),
      execute: async (params) => this.commit(params)
    });
  }
  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================
  async handleStatus() {
    const status = await this.getStatus();
    const risk = status.isClean ? null : await this.assessRisk(!status.isClean);
    return this.createResult(
      true,
      { status, risk },
      void 0,
      1,
      `Branch: ${status.branch}, Clean: ${status.isClean}`
    );
  }
  async handleGenerate(staged = true) {
    const message = await this.generateMessage(staged);
    return this.createResult(
      true,
      message,
      void 0,
      message.confidence,
      message.reasoning
    );
  }
  async handleCommit(params) {
    const result = await this.commit(params);
    return this.createResult(
      result.success,
      result,
      result.error,
      result.message?.confidence,
      result.message?.reasoning
    );
  }
  async handlePush(params) {
    const result = await this.push(params);
    return this.createResult(
      result.success,
      result,
      result.error,
      1,
      `Pushed to ${result.remote}/${result.branch}`
    );
  }
  async handleCreatePR(params) {
    const result = await this.createPR(params);
    return this.createResult(
      result.success,
      result,
      result.error,
      1,
      result.url ? `PR created: ${result.url}` : "PR creation failed"
    );
  }
  async handleFullWorkflow(params) {
    const fullParams = {
      ...params,
      all: params.all ?? true,
      push: params.push ?? true,
      createPr: params.createPr ?? false
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
};
export {
  BREAKING_CHANGE_INDICATORS,
  COMMIT_FOOTER_TEMPLATE,
  COMMIT_TYPE_DESCRIPTIONS,
  CRITICAL_PATH_PATTERNS,
  CommitAgent,
  CommitAgentConfigSchema,
  CommitMessageSchema,
  CommitRequestSchema,
  CommitResultSchema,
  CommitRiskAssessmentSchema,
  CommitRiskFactorSchema,
  ConventionalTypeSchema,
  DEFAULT_CO_AUTHOR,
  DiffAnalyzer,
  DiffSummarySchema,
  FileChangeSchema,
  FileChangeTypeSchema,
  GeneratedMessageSchema,
  GitOperations,
  GitStatusSchema,
  MessageGenerator,
  PRCreator,
  PROptionsSchema,
  PRResultSchema,
  PushOptionsSchema,
  PushResultSchema,
  RISK_THRESHOLDS,
  RISK_WEIGHTS
};
//# sourceMappingURL=index.js.map