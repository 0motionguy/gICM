import { z } from 'zod';

/**
 * Core Types for Commit Agent
 *
 * Zod schemas + TypeScript types for git operations, commit messages, and results
 */

declare const FileChangeTypeSchema: z.ZodEnum<["added", "modified", "deleted", "renamed", "copied"]>;
type FileChangeType = z.infer<typeof FileChangeTypeSchema>;
declare const FileChangeSchema: z.ZodObject<{
    path: z.ZodString;
    type: z.ZodEnum<["added", "modified", "deleted", "renamed", "copied"]>;
    linesAdded: z.ZodDefault<z.ZodNumber>;
    linesRemoved: z.ZodDefault<z.ZodNumber>;
    binary: z.ZodDefault<z.ZodBoolean>;
    oldPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "added" | "modified" | "deleted" | "renamed" | "copied";
    linesAdded: number;
    linesRemoved: number;
    binary: boolean;
    oldPath?: string | undefined;
}, {
    path: string;
    type: "added" | "modified" | "deleted" | "renamed" | "copied";
    linesAdded?: number | undefined;
    linesRemoved?: number | undefined;
    binary?: boolean | undefined;
    oldPath?: string | undefined;
}>;
type FileChange = z.infer<typeof FileChangeSchema>;
declare const DiffSummarySchema: z.ZodObject<{
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        type: z.ZodEnum<["added", "modified", "deleted", "renamed", "copied"]>;
        linesAdded: z.ZodDefault<z.ZodNumber>;
        linesRemoved: z.ZodDefault<z.ZodNumber>;
        binary: z.ZodDefault<z.ZodBoolean>;
        oldPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded: number;
        linesRemoved: number;
        binary: boolean;
        oldPath?: string | undefined;
    }, {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded?: number | undefined;
        linesRemoved?: number | undefined;
        binary?: boolean | undefined;
        oldPath?: string | undefined;
    }>, "many">;
    totalLinesAdded: z.ZodNumber;
    totalLinesRemoved: z.ZodNumber;
    totalFilesChanged: z.ZodNumber;
    diffContent: z.ZodString;
    staged: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    staged: boolean;
    files: {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded: number;
        linesRemoved: number;
        binary: boolean;
        oldPath?: string | undefined;
    }[];
    totalLinesAdded: number;
    totalLinesRemoved: number;
    totalFilesChanged: number;
    diffContent: string;
}, {
    staged: boolean;
    files: {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded?: number | undefined;
        linesRemoved?: number | undefined;
        binary?: boolean | undefined;
        oldPath?: string | undefined;
    }[];
    totalLinesAdded: number;
    totalLinesRemoved: number;
    totalFilesChanged: number;
    diffContent: string;
}>;
type DiffSummary = z.infer<typeof DiffSummarySchema>;
declare const GitStatusSchema: z.ZodObject<{
    branch: z.ZodString;
    ahead: z.ZodDefault<z.ZodNumber>;
    behind: z.ZodDefault<z.ZodNumber>;
    staged: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        type: z.ZodEnum<["added", "modified", "deleted", "renamed", "copied"]>;
        linesAdded: z.ZodDefault<z.ZodNumber>;
        linesRemoved: z.ZodDefault<z.ZodNumber>;
        binary: z.ZodDefault<z.ZodBoolean>;
        oldPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded: number;
        linesRemoved: number;
        binary: boolean;
        oldPath?: string | undefined;
    }, {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded?: number | undefined;
        linesRemoved?: number | undefined;
        binary?: boolean | undefined;
        oldPath?: string | undefined;
    }>, "many">;
    unstaged: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        type: z.ZodEnum<["added", "modified", "deleted", "renamed", "copied"]>;
        linesAdded: z.ZodDefault<z.ZodNumber>;
        linesRemoved: z.ZodDefault<z.ZodNumber>;
        binary: z.ZodDefault<z.ZodBoolean>;
        oldPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded: number;
        linesRemoved: number;
        binary: boolean;
        oldPath?: string | undefined;
    }, {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded?: number | undefined;
        linesRemoved?: number | undefined;
        binary?: boolean | undefined;
        oldPath?: string | undefined;
    }>, "many">;
    untracked: z.ZodArray<z.ZodString, "many">;
    isClean: z.ZodBoolean;
    hasRemote: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    branch: string;
    ahead: number;
    behind: number;
    staged: {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded: number;
        linesRemoved: number;
        binary: boolean;
        oldPath?: string | undefined;
    }[];
    unstaged: {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded: number;
        linesRemoved: number;
        binary: boolean;
        oldPath?: string | undefined;
    }[];
    untracked: string[];
    isClean: boolean;
    hasRemote: boolean;
}, {
    branch: string;
    staged: {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded?: number | undefined;
        linesRemoved?: number | undefined;
        binary?: boolean | undefined;
        oldPath?: string | undefined;
    }[];
    unstaged: {
        path: string;
        type: "added" | "modified" | "deleted" | "renamed" | "copied";
        linesAdded?: number | undefined;
        linesRemoved?: number | undefined;
        binary?: boolean | undefined;
        oldPath?: string | undefined;
    }[];
    untracked: string[];
    isClean: boolean;
    hasRemote: boolean;
    ahead?: number | undefined;
    behind?: number | undefined;
}>;
type GitStatus = z.infer<typeof GitStatusSchema>;
declare const ConventionalTypeSchema: z.ZodEnum<["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]>;
type ConventionalType = z.infer<typeof ConventionalTypeSchema>;
declare const CommitMessageSchema: z.ZodObject<{
    type: z.ZodEnum<["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]>;
    scope: z.ZodOptional<z.ZodString>;
    subject: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    footer: z.ZodOptional<z.ZodString>;
    breaking: z.ZodDefault<z.ZodBoolean>;
    coAuthors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
    subject: string;
    breaking: boolean;
    coAuthors: string[];
    scope?: string | undefined;
    body?: string | undefined;
    footer?: string | undefined;
}, {
    type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
    subject: string;
    scope?: string | undefined;
    body?: string | undefined;
    footer?: string | undefined;
    breaking?: boolean | undefined;
    coAuthors?: string[] | undefined;
}>;
type CommitMessage = z.infer<typeof CommitMessageSchema>;
declare const GeneratedMessageSchema: z.ZodObject<{
    message: z.ZodObject<{
        type: z.ZodEnum<["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]>;
        scope: z.ZodOptional<z.ZodString>;
        subject: z.ZodString;
        body: z.ZodOptional<z.ZodString>;
        footer: z.ZodOptional<z.ZodString>;
        breaking: z.ZodDefault<z.ZodBoolean>;
        coAuthors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
        subject: string;
        breaking: boolean;
        coAuthors: string[];
        scope?: string | undefined;
        body?: string | undefined;
        footer?: string | undefined;
    }, {
        type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
        subject: string;
        scope?: string | undefined;
        body?: string | undefined;
        footer?: string | undefined;
        breaking?: boolean | undefined;
        coAuthors?: string[] | undefined;
    }>;
    fullText: z.ZodString;
    confidence: z.ZodNumber;
    reasoning: z.ZodString;
    alternatives: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]>;
        scope: z.ZodOptional<z.ZodString>;
        subject: z.ZodString;
        body: z.ZodOptional<z.ZodString>;
        footer: z.ZodOptional<z.ZodString>;
        breaking: z.ZodDefault<z.ZodBoolean>;
        coAuthors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
        subject: string;
        breaking: boolean;
        coAuthors: string[];
        scope?: string | undefined;
        body?: string | undefined;
        footer?: string | undefined;
    }, {
        type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
        subject: string;
        scope?: string | undefined;
        body?: string | undefined;
        footer?: string | undefined;
        breaking?: boolean | undefined;
        coAuthors?: string[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    message: {
        type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
        subject: string;
        breaking: boolean;
        coAuthors: string[];
        scope?: string | undefined;
        body?: string | undefined;
        footer?: string | undefined;
    };
    fullText: string;
    confidence: number;
    reasoning: string;
    alternatives?: {
        type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
        subject: string;
        breaking: boolean;
        coAuthors: string[];
        scope?: string | undefined;
        body?: string | undefined;
        footer?: string | undefined;
    }[] | undefined;
}, {
    message: {
        type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
        subject: string;
        scope?: string | undefined;
        body?: string | undefined;
        footer?: string | undefined;
        breaking?: boolean | undefined;
        coAuthors?: string[] | undefined;
    };
    fullText: string;
    confidence: number;
    reasoning: string;
    alternatives?: {
        type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
        subject: string;
        scope?: string | undefined;
        body?: string | undefined;
        footer?: string | undefined;
        breaking?: boolean | undefined;
        coAuthors?: string[] | undefined;
    }[] | undefined;
}>;
type GeneratedMessage = z.infer<typeof GeneratedMessageSchema>;
declare const CommitRequestSchema: z.ZodObject<{
    staged: z.ZodDefault<z.ZodBoolean>;
    all: z.ZodDefault<z.ZodBoolean>;
    files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    message: z.ZodOptional<z.ZodString>;
    push: z.ZodDefault<z.ZodBoolean>;
    createPr: z.ZodDefault<z.ZodBoolean>;
    prTitle: z.ZodOptional<z.ZodString>;
    prBody: z.ZodOptional<z.ZodString>;
    prBase: z.ZodDefault<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
    amend: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    push: boolean;
    staged: boolean;
    all: boolean;
    createPr: boolean;
    prBase: string;
    dryRun: boolean;
    amend: boolean;
    message?: string | undefined;
    files?: string[] | undefined;
    prTitle?: string | undefined;
    prBody?: string | undefined;
}, {
    push?: boolean | undefined;
    message?: string | undefined;
    staged?: boolean | undefined;
    files?: string[] | undefined;
    all?: boolean | undefined;
    createPr?: boolean | undefined;
    prTitle?: string | undefined;
    prBody?: string | undefined;
    prBase?: string | undefined;
    dryRun?: boolean | undefined;
    amend?: boolean | undefined;
}>;
type CommitRequest = z.infer<typeof CommitRequestSchema>;
declare const CommitResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    commitHash: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodObject<{
        message: z.ZodObject<{
            type: z.ZodEnum<["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]>;
            scope: z.ZodOptional<z.ZodString>;
            subject: z.ZodString;
            body: z.ZodOptional<z.ZodString>;
            footer: z.ZodOptional<z.ZodString>;
            breaking: z.ZodDefault<z.ZodBoolean>;
            coAuthors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            breaking: boolean;
            coAuthors: string[];
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
        }, {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
            breaking?: boolean | undefined;
            coAuthors?: string[] | undefined;
        }>;
        fullText: z.ZodString;
        confidence: z.ZodNumber;
        reasoning: z.ZodString;
        alternatives: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]>;
            scope: z.ZodOptional<z.ZodString>;
            subject: z.ZodString;
            body: z.ZodOptional<z.ZodString>;
            footer: z.ZodOptional<z.ZodString>;
            breaking: z.ZodDefault<z.ZodBoolean>;
            coAuthors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            breaking: boolean;
            coAuthors: string[];
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
        }, {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
            breaking?: boolean | undefined;
            coAuthors?: string[] | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        message: {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            breaking: boolean;
            coAuthors: string[];
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
        };
        fullText: string;
        confidence: number;
        reasoning: string;
        alternatives?: {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            breaking: boolean;
            coAuthors: string[];
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
        }[] | undefined;
    }, {
        message: {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
            breaking?: boolean | undefined;
            coAuthors?: string[] | undefined;
        };
        fullText: string;
        confidence: number;
        reasoning: string;
        alternatives?: {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
            breaking?: boolean | undefined;
            coAuthors?: string[] | undefined;
        }[] | undefined;
    }>>;
    diff: z.ZodOptional<z.ZodObject<{
        files: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            type: z.ZodEnum<["added", "modified", "deleted", "renamed", "copied"]>;
            linesAdded: z.ZodDefault<z.ZodNumber>;
            linesRemoved: z.ZodDefault<z.ZodNumber>;
            binary: z.ZodDefault<z.ZodBoolean>;
            oldPath: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            type: "added" | "modified" | "deleted" | "renamed" | "copied";
            linesAdded: number;
            linesRemoved: number;
            binary: boolean;
            oldPath?: string | undefined;
        }, {
            path: string;
            type: "added" | "modified" | "deleted" | "renamed" | "copied";
            linesAdded?: number | undefined;
            linesRemoved?: number | undefined;
            binary?: boolean | undefined;
            oldPath?: string | undefined;
        }>, "many">;
        totalLinesAdded: z.ZodNumber;
        totalLinesRemoved: z.ZodNumber;
        totalFilesChanged: z.ZodNumber;
        diffContent: z.ZodString;
        staged: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        staged: boolean;
        files: {
            path: string;
            type: "added" | "modified" | "deleted" | "renamed" | "copied";
            linesAdded: number;
            linesRemoved: number;
            binary: boolean;
            oldPath?: string | undefined;
        }[];
        totalLinesAdded: number;
        totalLinesRemoved: number;
        totalFilesChanged: number;
        diffContent: string;
    }, {
        staged: boolean;
        files: {
            path: string;
            type: "added" | "modified" | "deleted" | "renamed" | "copied";
            linesAdded?: number | undefined;
            linesRemoved?: number | undefined;
            binary?: boolean | undefined;
            oldPath?: string | undefined;
        }[];
        totalLinesAdded: number;
        totalLinesRemoved: number;
        totalFilesChanged: number;
        diffContent: string;
    }>>;
    pushed: z.ZodDefault<z.ZodBoolean>;
    prUrl: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    riskScore: z.ZodOptional<z.ZodNumber>;
    approvalRequired: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    pushed: boolean;
    approvalRequired: boolean;
    message?: {
        message: {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            breaking: boolean;
            coAuthors: string[];
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
        };
        fullText: string;
        confidence: number;
        reasoning: string;
        alternatives?: {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            breaking: boolean;
            coAuthors: string[];
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
        }[] | undefined;
    } | undefined;
    commitHash?: string | undefined;
    diff?: {
        staged: boolean;
        files: {
            path: string;
            type: "added" | "modified" | "deleted" | "renamed" | "copied";
            linesAdded: number;
            linesRemoved: number;
            binary: boolean;
            oldPath?: string | undefined;
        }[];
        totalLinesAdded: number;
        totalLinesRemoved: number;
        totalFilesChanged: number;
        diffContent: string;
    } | undefined;
    prUrl?: string | undefined;
    error?: string | undefined;
    riskScore?: number | undefined;
}, {
    success: boolean;
    message?: {
        message: {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
            breaking?: boolean | undefined;
            coAuthors?: string[] | undefined;
        };
        fullText: string;
        confidence: number;
        reasoning: string;
        alternatives?: {
            type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";
            subject: string;
            scope?: string | undefined;
            body?: string | undefined;
            footer?: string | undefined;
            breaking?: boolean | undefined;
            coAuthors?: string[] | undefined;
        }[] | undefined;
    } | undefined;
    commitHash?: string | undefined;
    diff?: {
        staged: boolean;
        files: {
            path: string;
            type: "added" | "modified" | "deleted" | "renamed" | "copied";
            linesAdded?: number | undefined;
            linesRemoved?: number | undefined;
            binary?: boolean | undefined;
            oldPath?: string | undefined;
        }[];
        totalLinesAdded: number;
        totalLinesRemoved: number;
        totalFilesChanged: number;
        diffContent: string;
    } | undefined;
    pushed?: boolean | undefined;
    prUrl?: string | undefined;
    error?: string | undefined;
    riskScore?: number | undefined;
    approvalRequired?: boolean | undefined;
}>;
type CommitResult = z.infer<typeof CommitResultSchema>;
declare const PushOptionsSchema: z.ZodObject<{
    remote: z.ZodDefault<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    force: z.ZodDefault<z.ZodBoolean>;
    setUpstream: z.ZodDefault<z.ZodBoolean>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dryRun: boolean;
    remote: string;
    force: boolean;
    setUpstream: boolean;
    branch?: string | undefined;
}, {
    branch?: string | undefined;
    dryRun?: boolean | undefined;
    remote?: string | undefined;
    force?: boolean | undefined;
    setUpstream?: boolean | undefined;
}>;
type PushOptions = z.infer<typeof PushOptionsSchema>;
declare const PushResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    remote: z.ZodString;
    branch: z.ZodString;
    commits: z.ZodNumber;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    branch: string;
    success: boolean;
    remote: string;
    commits: number;
    error?: string | undefined;
}, {
    branch: string;
    success: boolean;
    remote: string;
    commits: number;
    error?: string | undefined;
}>;
type PushResult = z.infer<typeof PushResultSchema>;
declare const PROptionsSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    base: z.ZodDefault<z.ZodString>;
    head: z.ZodOptional<z.ZodString>;
    draft: z.ZodDefault<z.ZodBoolean>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dryRun: boolean;
    base: string;
    draft: boolean;
    body?: string | undefined;
    title?: string | undefined;
    head?: string | undefined;
}, {
    body?: string | undefined;
    dryRun?: boolean | undefined;
    title?: string | undefined;
    base?: string | undefined;
    head?: string | undefined;
    draft?: boolean | undefined;
}>;
type PROptions = z.infer<typeof PROptionsSchema>;
declare const PRResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    url: z.ZodOptional<z.ZodString>;
    number: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    number?: number | undefined;
    error?: string | undefined;
    url?: string | undefined;
    title?: string | undefined;
}, {
    success: boolean;
    number?: number | undefined;
    error?: string | undefined;
    url?: string | undefined;
    title?: string | undefined;
}>;
type PRResult = z.infer<typeof PRResultSchema>;
declare const CommitRiskFactorSchema: z.ZodObject<{
    name: z.ZodString;
    score: z.ZodNumber;
    weight: z.ZodNumber;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    score: number;
    weight: number;
    reason: string;
}, {
    name: string;
    score: number;
    weight: number;
    reason: string;
}>;
type CommitRiskFactor = z.infer<typeof CommitRiskFactorSchema>;
declare const CommitRiskAssessmentSchema: z.ZodObject<{
    totalScore: z.ZodNumber;
    factors: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        score: z.ZodNumber;
        weight: z.ZodNumber;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        score: number;
        weight: number;
        reason: string;
    }, {
        name: string;
        score: number;
        weight: number;
        reason: string;
    }>, "many">;
    recommendation: z.ZodEnum<["auto_execute", "queue_approval", "escalate", "reject"]>;
    criticalPaths: z.ZodArray<z.ZodString, "many">;
    isBreakingChange: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    criticalPaths: string[];
    totalScore: number;
    factors: {
        name: string;
        score: number;
        weight: number;
        reason: string;
    }[];
    recommendation: "auto_execute" | "queue_approval" | "escalate" | "reject";
    isBreakingChange: boolean;
}, {
    criticalPaths: string[];
    totalScore: number;
    factors: {
        name: string;
        score: number;
        weight: number;
        reason: string;
    }[];
    recommendation: "auto_execute" | "queue_approval" | "escalate" | "reject";
    isBreakingChange: boolean;
}>;
type CommitRiskAssessment = z.infer<typeof CommitRiskAssessmentSchema>;
declare const CommitAgentConfigSchema: z.ZodObject<{
    name: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    llmProvider: z.ZodDefault<z.ZodEnum<["openai", "anthropic", "gemini"]>>;
    llmModel: z.ZodOptional<z.ZodString>;
    apiKey: z.ZodOptional<z.ZodString>;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    verbose: z.ZodDefault<z.ZodBoolean>;
    conventionalCommits: z.ZodDefault<z.ZodBoolean>;
    signCommits: z.ZodDefault<z.ZodBoolean>;
    includeCoAuthors: z.ZodDefault<z.ZodBoolean>;
    coAuthorName: z.ZodDefault<z.ZodString>;
    coAuthorEmail: z.ZodDefault<z.ZodString>;
    maxMessageLength: z.ZodDefault<z.ZodNumber>;
    autoCommitMaxLines: z.ZodDefault<z.ZodNumber>;
    autoCommitMaxFiles: z.ZodDefault<z.ZodNumber>;
    criticalPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    llmProvider: "openai" | "anthropic" | "gemini";
    temperature: number;
    maxTokens: number;
    verbose: boolean;
    conventionalCommits: boolean;
    signCommits: boolean;
    includeCoAuthors: boolean;
    coAuthorName: string;
    coAuthorEmail: string;
    maxMessageLength: number;
    autoCommitMaxLines: number;
    autoCommitMaxFiles: number;
    criticalPaths: string[];
    description?: string | undefined;
    llmModel?: string | undefined;
    apiKey?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    llmProvider?: "openai" | "anthropic" | "gemini" | undefined;
    llmModel?: string | undefined;
    apiKey?: string | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    verbose?: boolean | undefined;
    conventionalCommits?: boolean | undefined;
    signCommits?: boolean | undefined;
    includeCoAuthors?: boolean | undefined;
    coAuthorName?: string | undefined;
    coAuthorEmail?: string | undefined;
    maxMessageLength?: number | undefined;
    autoCommitMaxLines?: number | undefined;
    autoCommitMaxFiles?: number | undefined;
    criticalPaths?: string[] | undefined;
}>;
type CommitAgentConfig = z.infer<typeof CommitAgentConfigSchema>;

export { CommitAgentConfigSchema as A, type CommitRiskAssessment as C, type DiffSummary as D, type FileChange as F, type GitStatus as G, type PROptions as P, type PRResult as a, type GeneratedMessage as b, type CommitMessage as c, type CommitAgentConfig as d, type CommitRequest as e, type CommitResult as f, type PushOptions as g, type PushResult as h, FileChangeTypeSchema as i, type FileChangeType as j, FileChangeSchema as k, DiffSummarySchema as l, GitStatusSchema as m, ConventionalTypeSchema as n, type ConventionalType as o, CommitMessageSchema as p, GeneratedMessageSchema as q, CommitRequestSchema as r, CommitResultSchema as s, PushOptionsSchema as t, PushResultSchema as u, PROptionsSchema as v, PRResultSchema as w, CommitRiskFactorSchema as x, type CommitRiskFactor as y, CommitRiskAssessmentSchema as z };
