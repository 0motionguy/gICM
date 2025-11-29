/**
 * MCP Resources - List indexed repositories
 */
interface Resource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}
export declare function getResources(): Promise<Resource[]>;
export {};
//# sourceMappingURL=indexed-repos.d.ts.map