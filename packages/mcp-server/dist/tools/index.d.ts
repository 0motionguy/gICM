/**
 * MCP Tools for gICM Context Engine
 */
export declare const tools: {
    search_components: {
        description: string;
        parameters: {
            query: {
                type: string;
                description: string;
            };
            kind: {
                type: string;
                description: string;
                enum: string[];
                optional: boolean;
            };
            platform: {
                type: string;
                description: string;
                enum: string[];
                optional: boolean;
            };
            limit: {
                type: string;
                description: string;
                default: number;
                optional: boolean;
            };
        };
    };
    search_codebase: {
        description: string;
        parameters: {
            query: {
                type: string;
                description: string;
            };
            repository: {
                type: string;
                description: string;
                optional: boolean;
            };
            language: {
                type: string;
                description: string;
                optional: boolean;
            };
            limit: {
                type: string;
                description: string;
                default: number;
                optional: boolean;
            };
        };
    };
    get_file_context: {
        description: string;
        parameters: {
            repository: {
                type: string;
                description: string;
            };
            file_path: {
                type: string;
                description: string;
            };
            start_line: {
                type: string;
                description: string;
            };
            end_line: {
                type: string;
                description: string;
            };
        };
    };
    index_repository: {
        description: string;
        parameters: {
            url: {
                type: string;
                description: string;
            };
            branch: {
                type: string;
                description: string;
                default: string;
                optional: boolean;
            };
        };
    };
};
export declare function handleToolCall(name: string, args: Record<string, unknown>): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=index.d.ts.map