/**
 * Index a Git repository
 */
interface IndexResult {
    status: string;
    repository: string;
    message: string;
}
export declare function indexRepository(url: string, branch?: string): Promise<IndexResult>;
export {};
//# sourceMappingURL=index-repository.d.ts.map