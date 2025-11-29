/**
 * Blog Post Generator
 *
 * AI-powered blog content generation for gICM.
 */

import type { BlogPost, BlogCategory } from "../core/types.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger("BlogGenerator");

// ============================================================================
// TEMPLATES
// ============================================================================

const BLOG_TEMPLATES: Record<BlogCategory, {
  titleTemplate: string;
  structure: string[];
  keywords: string[];
}> = {
  tutorial: {
    titleTemplate: "How to {action} with gICM",
    structure: [
      "Introduction - What you'll learn",
      "Prerequisites",
      "Step-by-step instructions",
      "Code examples",
      "Common pitfalls",
      "Conclusion & next steps",
    ],
    keywords: ["tutorial", "guide", "how to", "gICM"],
  },
  announcement: {
    titleTemplate: "Introducing {feature}",
    structure: [
      "What's new",
      "Why we built this",
      "Key features",
      "How to get started",
      "What's next",
    ],
    keywords: ["announcement", "new feature", "launch", "gICM"],
  },
  comparison: {
    titleTemplate: "gICM vs {competitor}: Complete comparison",
    structure: [
      "Overview of both tools",
      "Feature comparison table",
      "Pricing comparison",
      "Use case recommendations",
      "Verdict",
    ],
    keywords: ["comparison", "vs", "alternative", "review"],
  },
  guide: {
    titleTemplate: "Complete Guide to {topic}",
    structure: [
      "Introduction",
      "Core concepts",
      "Detailed walkthrough",
      "Best practices",
      "Advanced tips",
      "Conclusion",
    ],
    keywords: ["guide", "complete", "comprehensive", "explained"],
  },
  "case-study": {
    titleTemplate: "How {company} achieved {result} with gICM",
    structure: [
      "Background",
      "The challenge",
      "The solution",
      "Implementation details",
      "Results & metrics",
      "Key takeaways",
    ],
    keywords: ["case study", "success story", "results", "roi"],
  },
  "thought-leadership": {
    titleTemplate: "{trend} and the future of {topic}",
    structure: [
      "The current landscape",
      "Emerging trends",
      "Our perspective",
      "Predictions",
      "What this means for you",
    ],
    keywords: ["future", "trends", "predictions", "thought leadership"],
  },
  changelog: {
    titleTemplate: "gICM Changelog - {version}",
    structure: [
      "New features",
      "Improvements",
      "Bug fixes",
      "Breaking changes",
      "Migration guide",
    ],
    keywords: ["changelog", "release notes", "update", "version"],
  },
};

// ============================================================================
// GENERATOR
// ============================================================================

export interface GenerateBlogPostOptions {
  category: BlogCategory;
  topic: string;
  keywords?: string[];
  targetWordCount?: number;
  tone?: "professional" | "casual" | "technical";
}

export interface BlogGeneratorConfig {
  llmProvider: "anthropic" | "openai";
  model?: string;
}

export class BlogGenerator {
  private config: BlogGeneratorConfig;

  constructor(config: BlogGeneratorConfig) {
    this.config = config;
  }

  /**
   * Generate a blog post prompt for AI
   */
  generatePrompt(options: GenerateBlogPostOptions): string {
    const template = BLOG_TEMPLATES[options.category];
    const wordCount = options.targetWordCount ?? 1500;
    const tone = options.tone ?? "professional";

    return `
You are writing a blog post for gICM, an AI-powered development platform.

## Topic
${options.topic}

## Category
${options.category}

## Title Template
${template.titleTemplate}

## Structure
${template.structure.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Requirements
- Word count: ${wordCount}-${wordCount + 500} words
- Tone: ${tone}
- Include code examples where relevant
- SEO-optimized for keywords: ${[...template.keywords, ...(options.keywords ?? [])].join(", ")}
- Include a compelling meta description (150-160 characters)
- End with a clear call-to-action for gICM

## Output Format
Return the blog post in the following JSON format:
{
  "title": "...",
  "slug": "...",
  "excerpt": "150-200 character excerpt",
  "content": "Full markdown content",
  "seo": {
    "title": "SEO title (60 chars max)",
    "description": "Meta description (160 chars max)",
    "keywords": ["keyword1", "keyword2", ...]
  },
  "tags": ["tag1", "tag2", ...],
  "readingTime": estimated_minutes
}
    `.trim();
  }

  /**
   * Generate blog post ideas for a topic
   */
  generateIdeas(topic: string, count: number = 5): string[] {
    return Object.entries(BLOG_TEMPLATES).map(([category, template]) => {
      return template.titleTemplate
        .replace("{action}", `build ${topic}`)
        .replace("{feature}", topic)
        .replace("{competitor}", "Cursor")
        .replace("{topic}", topic)
        .replace("{company}", "Company")
        .replace("{result}", "10x productivity")
        .replace("{trend}", topic)
        .replace("{version}", "v2.0");
    });
  }

  /**
   * Create a draft blog post object
   */
  createDraft(
    generated: {
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      seo: { title: string; description: string; keywords: string[] };
      tags: string[];
      readingTime: number;
    },
    category: BlogCategory
  ): BlogPost {
    const wordCount = generated.content.split(/\s+/).length;

    return {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: generated.title,
      slug: generated.slug,
      excerpt: generated.excerpt,
      content: generated.content,
      author: "gICM AI",
      category,
      tags: generated.tags,
      seo: generated.seo,
      images: [],
      readingTime: generated.readingTime,
      wordCount,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Get template for a category
   */
  getTemplate(category: BlogCategory) {
    return BLOG_TEMPLATES[category];
  }

  /**
   * Get all available categories
   */
  getCategories(): BlogCategory[] {
    return Object.keys(BLOG_TEMPLATES) as BlogCategory[];
  }
}

// Export singleton factory
export function createBlogGenerator(config: BlogGeneratorConfig): BlogGenerator {
  return new BlogGenerator(config);
}
