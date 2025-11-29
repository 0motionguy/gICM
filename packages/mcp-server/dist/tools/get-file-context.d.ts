/**
 * Get specific lines from an indexed file
 */
interface FileContext {
    repo: string;
    file_path: string;
    start_line: number;
    end_line: number;
    content: string;
    found: boolean;
}
export declare function getFileContext(repository: string, filePath: string, startLine: number, endLine: number): Promise<FileContext>;
export {};
//# sourceMappingURL=get-file-context.d.ts.map