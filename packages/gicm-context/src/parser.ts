import type { SkillEntry } from "./types.js";

export function parseSkillMd(content: string, path: string): SkillEntry | null {
  // Parse YAML frontmatter between --- delimiters
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length).trim();

  // Simple YAML parsing (no dependency needed)
  const name = extractYamlField(frontmatter, "name") || path;
  const version = extractYamlField(frontmatter, "version");
  const description = extractYamlField(frontmatter, "description") || "";
  const author = extractYamlField(frontmatter, "author");
  const tagsRaw = extractYamlField(frontmatter, "tags") || "[]";
  const tags = parseYamlArray(tagsRaw);

  const id = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const tokens = Math.ceil(content.length / 4);

  return {
    id,
    name,
    description,
    tags,
    content: body,
    tokens,
    path,
    version,
    author,
  };
}

function extractYamlField(yaml: string, field: string): string | undefined {
  const match = yaml.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : undefined;
}

function parseYamlArray(raw: string): string[] {
  // Handle [tag1, tag2, tag3] format
  const match = raw.match(/\[(.*)\]/);
  if (match) {
    return match[1]
      .split(",")
      .map((s) => s.trim().replace(/['"]/g, ""))
      .filter(Boolean);
  }
  return [];
}
