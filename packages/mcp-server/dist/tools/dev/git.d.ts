/**
 * dev.git_* tools for MCP server
 *
 * AI-powered git commit workflow tools
 */
/**
 * Get git status with risk assessment
 */
export declare function gitStatus(options?: {
    verbose?: boolean;
}): Promise<{
    status: unknown;
    risk: unknown | null;
}>;
/**
 * Analyze changes and generate commit message
 */
export declare function gitAnalyze(options: {
    staged?: boolean;
}): Promise<unknown>;
/**
 * Create a git commit
 */
export declare function gitCommit(options: {
    message?: string;
    all?: boolean;
    amend?: boolean;
    dryRun?: boolean;
}): Promise<unknown>;
/**
 * Push to remote
 */
export declare function gitPush(options: {
    force?: boolean;
    setUpstream?: boolean;
    branch?: string;
}): Promise<unknown>;
/**
 * Create a pull request
 */
export declare function gitPR(options: {
    title?: string;
    body?: string;
    base?: string;
    draft?: boolean;
}): Promise<unknown>;
/**
 * Tool definitions for dev.git_* namespace
 */
export declare const gitTools: {
    "dev.git_status": {
        description: string;
        parameters: {
            verbose: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.git_analyze": {
        description: string;
        parameters: {
            staged: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.git_commit": {
        description: string;
        parameters: {
            message: {
                type: string;
                description: string;
                optional: boolean;
            };
            all: {
                type: string;
                description: string;
                optional: boolean;
            };
            amend: {
                type: string;
                description: string;
                optional: boolean;
            };
            dry_run: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.git_push": {
        description: string;
        parameters: {
            force: {
                type: string;
                description: string;
                optional: boolean;
            };
            set_upstream: {
                type: string;
                description: string;
                optional: boolean;
            };
            branch: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.git_pr": {
        description: string;
        parameters: {
            title: {
                type: string;
                description: string;
                optional: boolean;
            };
            body: {
                type: string;
                description: string;
                optional: boolean;
            };
            base: {
                type: string;
                description: string;
                optional: boolean;
            };
            draft: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
};
//# sourceMappingURL=git.d.ts.map