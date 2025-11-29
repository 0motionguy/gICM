/**
 * Get specific lines from an indexed file
 */
import { getQdrantClient } from "../utils/qdrant.js";
export async function getFileContext(repository, filePath, startLine, endLine) {
    const qdrant = getQdrantClient();
    // Validate line range
    const maxLines = 200;
    if (endLine - startLine > maxLines) {
        endLine = startLine + maxLines;
    }
    // Search for chunks that overlap with the requested range
    const searchResult = await qdrant.scroll("code_chunks", {
        filter: {
            must: [
                { key: "repo", match: { value: repository } },
                { key: "file_path", match: { value: filePath } },
            ],
        },
        limit: 100,
    });
    if (!searchResult.points || searchResult.points.length === 0) {
        return {
            repo: repository,
            file_path: filePath,
            start_line: startLine,
            end_line: endLine,
            content: "",
            found: false,
        };
    }
    // Find chunks that overlap with the requested range
    const overlappingChunks = searchResult.points.filter((p) => {
        const chunkStart = p.payload?.start_line;
        const chunkEnd = p.payload?.end_line;
        return chunkStart <= endLine && chunkEnd >= startLine;
    });
    if (overlappingChunks.length === 0) {
        return {
            repo: repository,
            file_path: filePath,
            start_line: startLine,
            end_line: endLine,
            content: "",
            found: false,
        };
    }
    // Sort by start line and combine
    overlappingChunks.sort((a, b) => a.payload?.start_line - b.payload?.start_line);
    // Extract the requested lines from combined content
    const allLines = [];
    const seenLines = new Set();
    for (const chunk of overlappingChunks) {
        const content = chunk.payload?.content;
        const chunkStart = chunk.payload?.start_line;
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
            const lineNum = chunkStart + idx;
            if (lineNum >= startLine && lineNum <= endLine && !seenLines.has(lineNum)) {
                seenLines.add(lineNum);
                allLines.push(`${lineNum}: ${line}`);
            }
        });
    }
    return {
        repo: repository,
        file_path: filePath,
        start_line: startLine,
        end_line: endLine,
        content: allLines.join("\n"),
        found: true,
    };
}
//# sourceMappingURL=get-file-context.js.map