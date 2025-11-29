/**
 * Search gICM marketplace components
 */
interface SearchResult {
    id: string;
    name: string;
    kind: string;
    description: string;
    category: string;
    tags: string[];
    install: string;
    score: number;
}
export declare function searchComponents(query: string, kind?: string, platform?: string, limit?: number): Promise<{
    results: SearchResult[];
    query: string;
    total: number;
}>;
export {};
//# sourceMappingURL=search-components.d.ts.map