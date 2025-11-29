/**
 * Search indexed code repositories
 */
interface CodeSearchResult {
    repo: string;
    file_path: string;
    language: string;
    start_line: number;
    end_line: number;
    content: string;
    score: number;
}
export declare function searchCodebase(query: string, repository?: string, language?: string, limit?: number): Promise<{
    results: CodeSearchResult[];
    query: string;
    total: number;
}>;
export {};
//# sourceMappingURL=search-codebase.d.ts.map