/**
 * SEO Content Optimizer
 *
 * Analyze and optimize content for search engines.
 */

import type { BlogPost } from "../core/types.js";
import { generateJSON } from "../utils/llm.js";
import { Logger } from "../utils/logger.js";

export interface SEOAnalysis {
  score: number; // 0-100
  issues: SEOIssue[];
  suggestions: string[];
  meta: {
    titleScore: number;
    descriptionScore: number;
    keywordDensity: number;
    readability: number;
    headingStructure: number;
  };
}

export interface SEOIssue {
  type: "error" | "warning" | "info";
  message: string;
  fix?: string;
}

export class SEOOptimizer {
  private logger: Logger;

  constructor() {
    this.logger = new Logger("SEOOptimizer");
  }

  /**
   * Analyze content for SEO
   */
  async analyze(content: string, targetKeywords: string[]): Promise<SEOAnalysis> {
    this.logger.info("Analyzing content for SEO...");

    // Basic metrics
    const wordCount = content.split(/\s+/).length;
    const headings = content.match(/^#{1,6}\s.+$/gm) || [];
    const links = content.match(/\[.+\]\(.+\)/g) || [];

    // Keyword density
    const keywordCounts = targetKeywords.map((kw) => {
      const regex = new RegExp(kw, "gi");
      return (content.match(regex) || []).length;
    });
    const avgKeywordDensity =
      keywordCounts.reduce((a, b) => a + b, 0) / wordCount / targetKeywords.length;

    // Use LLM for deeper analysis
    const llmAnalysis = await generateJSON<{
      titleScore: number;
      descriptionScore: number;
      readabilityScore: number;
      headingStructureScore: number;
      issues: Array<{ type: "error" | "warning" | "info"; message: string; fix?: string }>;
      suggestions: string[];
    }>({
      prompt: `Analyze this content for SEO:

Content (first 2000 chars):
${content.slice(0, 2000)}

Target keywords: ${targetKeywords.join(", ")}

Analyze:
1. Title effectiveness (0-100)
2. Meta description potential (0-100)
3. Readability (0-100)
4. Heading structure (0-100)
5. Issues found (errors, warnings, info)
6. Improvement suggestions

Return JSON:
{
  "titleScore": 80,
  "descriptionScore": 70,
  "readabilityScore": 85,
  "headingStructureScore": 75,
  "issues": [
    { "type": "warning", "message": "issue description", "fix": "how to fix" }
  ],
  "suggestions": ["suggestion1", "suggestion2"]
}`,
    });

    // Calculate overall score
    const overallScore = Math.round(
      (llmAnalysis.titleScore +
        llmAnalysis.descriptionScore +
        llmAnalysis.readabilityScore +
        llmAnalysis.headingStructureScore +
        Math.min(avgKeywordDensity * 1000, 100)) /
        5
    );

    // Add basic checks
    const issues: SEOIssue[] = [...llmAnalysis.issues];

    if (wordCount < 300) {
      issues.push({
        type: "warning",
        message: "Content is too short (< 300 words)",
        fix: "Add more valuable content to improve ranking potential",
      });
    }

    if (headings.length < 3) {
      issues.push({
        type: "warning",
        message: "Not enough headings for structure",
        fix: "Add H2/H3 headings to break up content",
      });
    }

    if (links.length < 2) {
      issues.push({
        type: "info",
        message: "Few internal/external links",
        fix: "Add relevant links to other content",
      });
    }

    if (avgKeywordDensity < 0.005) {
      issues.push({
        type: "warning",
        message: "Low keyword density",
        fix: "Naturally include target keywords more often",
      });
    } else if (avgKeywordDensity > 0.03) {
      issues.push({
        type: "warning",
        message: "Keyword stuffing detected",
        fix: "Reduce keyword frequency to avoid penalties",
      });
    }

    return {
      score: overallScore,
      issues,
      suggestions: llmAnalysis.suggestions,
      meta: {
        titleScore: llmAnalysis.titleScore,
        descriptionScore: llmAnalysis.descriptionScore,
        keywordDensity: avgKeywordDensity,
        readability: llmAnalysis.readabilityScore,
        headingStructure: llmAnalysis.headingStructureScore,
      },
    };
  }

  /**
   * Optimize content for SEO
   */
  async optimize(
    content: string,
    targetKeywords: string[],
    analysis: SEOAnalysis
  ): Promise<string> {
    this.logger.info("Optimizing content for SEO...");

    if (analysis.score >= 85) {
      this.logger.info("Content already well-optimized");
      return content;
    }

    const optimized = await generateJSON<{ optimizedContent: string }>({
      prompt: `Optimize this content for SEO without changing its meaning or style:

Original content:
${content}

Target keywords: ${targetKeywords.join(", ")}

Issues to fix:
${analysis.issues.map((i) => `- ${i.message}`).join("\n")}

Suggestions:
${analysis.suggestions.join("\n")}

Make improvements while:
- Keeping the same voice and style
- Not keyword stuffing
- Maintaining natural flow
- Keeping all technical accuracy

Return JSON: { "optimizedContent": "the full optimized content" }`,
    });

    return optimized.optimizedContent;
  }

  /**
   * Generate meta tags
   */
  async generateMeta(
    content: string,
    targetKeywords: string[]
  ): Promise<{
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    twitterTitle: string;
    twitterDescription: string;
  }> {
    return generateJSON({
      prompt: `Generate SEO meta tags for this content:

Content (first 1000 chars):
${content.slice(0, 1000)}

Target keywords: ${targetKeywords.join(", ")}

Generate:
1. Title (50-60 chars, include primary keyword)
2. Meta description (150-160 chars, compelling)
3. OG title (slightly different, engaging)
4. OG description
5. Twitter title
6. Twitter description

Return JSON:
{
  "title": "...",
  "description": "...",
  "ogTitle": "...",
  "ogDescription": "...",
  "twitterTitle": "...",
  "twitterDescription": "..."
}`,
    });
  }

  /**
   * Analyze blog post specifically
   */
  async analyzeBlogPost(post: BlogPost): Promise<SEOAnalysis> {
    const fullContent = `# ${post.title}\n\n${post.content}`;
    const keywords = post.seo?.keywords || post.tags;

    return this.analyze(fullContent, keywords);
  }

  /**
   * Generate schema markup
   */
  async generateSchema(post: BlogPost): Promise<Record<string, unknown>> {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      author: {
        "@type": "Person",
        name: post.author,
      },
      datePublished: new Date(post.publishedAt || Date.now()).toISOString(),
      keywords: post.tags.join(", "),
      articleSection: post.category,
    };
  }

  /**
   * Check URL SEO
   */
  analyzeUrl(url: string): {
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    if (url.length > 75) {
      issues.push("URL is too long");
      score -= 10;
    }

    if (!/^[a-z0-9-/]+$/.test(url)) {
      issues.push("URL contains special characters");
      score -= 15;
    }

    if (url.includes("--")) {
      issues.push("URL has consecutive hyphens");
      score -= 5;
    }

    if (url.split("/").some((s) => s.length > 50)) {
      issues.push("URL segment too long");
      score -= 10;
    }

    return { score: Math.max(0, score), issues };
  }
}
