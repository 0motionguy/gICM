/**
 * Blog Post Generator
 *
 * AI-powered blog post generation with SEO optimization.
 */

import slugify from "slugify";
import readingTime from "reading-time";
import type { BlogPost, BlogCategory } from "../../core/types.js";
import { generateText, generateJSON } from "../../utils/llm.js";
import { Logger } from "../../utils/logger.js";

interface GenerateOptions {
  topic: string;
  category: BlogCategory;
  targetKeywords?: string[];
  tone?: "professional" | "casual" | "technical";
  length?: "short" | "medium" | "long";
  includeCodeExamples?: boolean;
}

export class BlogGenerator {
  private logger: Logger;

  constructor() {
    this.logger = new Logger("BlogGenerator");
  }

  /**
   * Generate a complete blog post
   */
  async generate(options: GenerateOptions): Promise<BlogPost> {
    this.logger.info(`Generating blog post: ${options.topic}`);

    // 1. Research keywords if not provided
    const keywords = options.targetKeywords ||
      await this.findKeywords(options.topic, 5);

    this.logger.info(`Target keywords: ${keywords.join(", ")}`);

    // 2. Generate content
    const content = await this.generateContent(options, keywords);

    // 3. Generate title
    const title = await this.generateTitle(options.topic, keywords);

    // 4. Generate excerpt
    const excerpt = await this.generateExcerpt(content);

    // 5. Generate SEO metadata
    const seo = await this.generateSEO(options.topic, content, keywords);

    // 6. Create blog post object
    const slug = slugify(title, { lower: true, strict: true });
    const stats = readingTime(content);

    const post: BlogPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      slug,
      excerpt,
      content,
      author: "gICM Team",
      category: options.category,
      tags: keywords.slice(0, 5),
      seo,
      readingTime: Math.ceil(stats.minutes),
      wordCount: stats.words,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      images: [],
    };

    this.logger.info(`Generated post: ${post.title} (${post.wordCount} words)`);

    return post;
  }

  /**
   * Find relevant keywords for a topic
   */
  private async findKeywords(topic: string, count: number): Promise<string[]> {
    try {
      const result = await generateJSON<string[]>({
        prompt: `Find ${count} relevant SEO keywords for: "${topic}"

Context: gICM is an AI-powered development platform for Solana/Web3 and general coding.

Return as JSON array of strings:
["keyword1", "keyword2", ...]

Focus on keywords developers actually search for.`,
      });

      return result;
    } catch {
      return [topic];
    }
  }

  /**
   * Generate the main content
   */
  private async generateContent(options: GenerateOptions, keywords: string[]): Promise<string> {
    const lengthGuide = {
      short: "800-1200 words",
      medium: "1500-2000 words",
      long: "2500-3500 words",
    };

    const prompt = `Write a comprehensive blog post about: "${options.topic}"

Target audience: Developers interested in AI tools, Solana/Web3 development, and coding automation.

Requirements:
- Length: ${lengthGuide[options.length || "medium"]}
- Tone: ${options.tone || "professional"} but approachable
- Category: ${options.category}
- Must naturally include these keywords: ${keywords.join(", ")}
${options.includeCodeExamples ? "- Include practical code examples with explanations" : ""}

Structure:
1. Compelling introduction that hooks the reader
2. Clear H2 and H3 headers for sections
3. Practical, actionable content
4. ${options.includeCodeExamples ? "Code examples with TypeScript/JavaScript" : "Step-by-step instructions"}
5. Conclusion with clear call-to-action for gICM

Format: Markdown

Important:
- Write for developers, not marketers
- Be specific and technical where appropriate
- Include real-world use cases
- Reference gICM features naturally (not salesy)
- Add value that makes readers want to share`;

    return generateText({
      prompt,
      maxTokens: 4000,
    });
  }

  /**
   * Generate SEO-optimized title
   */
  private async generateTitle(topic: string, keywords: string[]): Promise<string> {
    const text = await generateText({
      prompt: `Generate a compelling, SEO-optimized blog title for: "${topic}"

Requirements:
- 50-60 characters ideal
- Include primary keyword: "${keywords[0]}"
- Make it click-worthy but not clickbait
- Should work for developers/technical audience

Provide just the title, nothing else.`,
      maxTokens: 100,
    });

    return text.trim().replace(/^["']|["']$/g, "");
  }

  /**
   * Generate excerpt
   */
  private async generateExcerpt(content: string): Promise<string> {
    const text = await generateText({
      prompt: `Generate a compelling excerpt/summary for this blog post (150-160 characters, good for meta description):

${content.slice(0, 1000)}...

Provide just the excerpt, nothing else.`,
      maxTokens: 100,
    });

    return text.trim().replace(/^["']|["']$/g, "");
  }

  /**
   * Generate SEO metadata
   */
  private async generateSEO(topic: string, content: string, keywords: string[]): Promise<BlogPost["seo"]> {
    try {
      const result = await generateJSON<{
        title: string;
        description: string;
        keywords: string[];
      }>({
        prompt: `Generate SEO metadata for a blog post about "${topic}":

Content preview:
${content.slice(0, 500)}...

Target keywords: ${keywords.join(", ")}

Return JSON:
{
  "title": "<60 chars, include primary keyword>",
  "description": "<155 chars, compelling, include keyword>",
  "keywords": ["<5-8 relevant keywords>"]
}`,
      });

      return result;
    } catch {
      return {
        title: topic,
        description: content.slice(0, 155),
        keywords,
      };
    }
  }

  /**
   * Generate blog post from template
   */
  async generateFromTemplate(template: BlogTemplate, variables: Record<string, string>): Promise<BlogPost> {
    let topic = template.topicTemplate;
    for (const [key, value] of Object.entries(variables)) {
      topic = topic.replace(`{${key}}`, value);
    }

    return this.generate({
      topic,
      category: template.category,
      targetKeywords: template.defaultKeywords,
      tone: template.tone,
      length: template.length,
      includeCodeExamples: template.includeCode,
    });
  }
}

// Blog templates for different content types
export interface BlogTemplate {
  name: string;
  topicTemplate: string;
  category: BlogCategory;
  defaultKeywords: string[];
  tone: "professional" | "casual" | "technical";
  length: "short" | "medium" | "long";
  includeCode: boolean;
}

export const BLOG_TEMPLATES: BlogTemplate[] = [
  {
    name: "tutorial",
    topicTemplate: "How to {action} with gICM",
    category: "tutorial",
    defaultKeywords: ["gicm", "tutorial", "guide"],
    tone: "technical",
    length: "long",
    includeCode: true,
  },
  {
    name: "comparison",
    topicTemplate: "gICM vs {competitor}: Complete Comparison",
    category: "comparison",
    defaultKeywords: ["gicm", "comparison", "alternative"],
    tone: "professional",
    length: "medium",
    includeCode: false,
  },
  {
    name: "announcement",
    topicTemplate: "Introducing {feature}: {benefit}",
    category: "announcement",
    defaultKeywords: ["gicm", "new feature", "announcement"],
    tone: "casual",
    length: "short",
    includeCode: true,
  },
  {
    name: "thought-leadership",
    topicTemplate: "{trend} and the Future of {topic}",
    category: "thought-leadership",
    defaultKeywords: ["ai", "future", "development"],
    tone: "professional",
    length: "medium",
    includeCode: false,
  },
];
