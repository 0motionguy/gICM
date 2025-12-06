# Technical Content Writer
> **ID:** `content-writer` | **Tier:** 3 | **Token Cost:** 4500 | **MCP:** notion

## What This Skill Does

Master technical content creation including tutorials, API documentation, blog posts, and README files. Apply structured writing patterns, SEO optimization, and developer-focused communication to produce high-quality technical content that educates and engages readers.

## When to Use

- Writing technical tutorials with step-by-step instructions
- Creating comprehensive API documentation
- Drafting developer-focused blog posts
- Building README files for open-source projects
- Writing changelog entries and release notes
- Creating user guides and onboarding documentation

## Core Capabilities

### 1. Technical Tutorial Writing

#### Tutorial Structure Template

```markdown
# [Tutorial Title]: [Specific Outcome]

> Learn how to [action] with [technology] in [timeframe/steps]

## Prerequisites

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Basic understanding of [concept]
- [ ] [Tool/Account] set up

## What You'll Build

[Screenshot or diagram of final result]

In this tutorial, you'll create a [description] that:
- Feature 1
- Feature 2
- Feature 3

## Step 1: [Action Verb] [Component]

[Brief explanation of what this step accomplishes]

```bash
# Command with explanation
npx create-next-app my-project
```

**What's happening:**
- Line 1: [Explanation]
- Line 2: [Explanation]

## Step 2: [Next Action]

[Continue pattern...]

## Common Issues

### Error: [Specific Error Message]

**Cause:** [Why this happens]

**Solution:**
```bash
# Fix command
```

## Next Steps

Now that you've built [project], you can:
- [ ] Add [feature]
- [ ] Deploy to [platform]
- [ ] Explore [related topic]

## Resources

- [Official Documentation](url)
- [Related Tutorial](url)
- [Community Discord](url)
```

#### Tutorial Code Examples

```typescript
// lib/tutorial-content.ts

interface TutorialSection {
  title: string;
  type: 'intro' | 'step' | 'troubleshooting' | 'conclusion';
  content: string;
  code?: {
    language: string;
    snippet: string;
    highlights?: number[]; // Line numbers to highlight
  };
  tips?: string[];
  warnings?: string[];
}

interface Tutorial {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToComplete: string;
  prerequisites: string[];
  sections: TutorialSection[];
  tags: string[];
}

export function generateTutorialMarkdown(tutorial: Tutorial): string {
  let md = `# ${tutorial.title}\n\n`;
  md += `> ${tutorial.description}\n\n`;
  md += `**Difficulty:** ${tutorial.difficulty} | **Time:** ${tutorial.timeToComplete}\n\n`;

  // Prerequisites
  md += `## Prerequisites\n\n`;
  tutorial.prerequisites.forEach((prereq) => {
    md += `- ${prereq}\n`;
  });
  md += '\n';

  // Sections
  let stepNumber = 0;
  tutorial.sections.forEach((section) => {
    if (section.type === 'step') {
      stepNumber++;
      md += `## Step ${stepNumber}: ${section.title}\n\n`;
    } else if (section.type === 'intro') {
      md += `## Overview\n\n`;
    } else if (section.type === 'troubleshooting') {
      md += `## Troubleshooting\n\n`;
    } else {
      md += `## ${section.title}\n\n`;
    }

    md += `${section.content}\n\n`;

    if (section.code) {
      md += `\`\`\`${section.code.language}\n${section.code.snippet}\n\`\`\`\n\n`;
    }

    if (section.tips?.length) {
      section.tips.forEach((tip) => {
        md += `> 💡 **Tip:** ${tip}\n\n`;
      });
    }

    if (section.warnings?.length) {
      section.warnings.forEach((warning) => {
        md += `> ⚠️ **Warning:** ${warning}\n\n`;
      });
    }
  });

  return md;
}
```

### 2. API Documentation

#### API Reference Template

```markdown
# API Reference

## Authentication

All API requests require authentication via Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.example.com/v1/resource
```

## Base URL

```
Production: https://api.example.com/v1
Staging: https://staging-api.example.com/v1
```

## Endpoints

### Create Resource

Creates a new resource in the system.

**Endpoint:** `POST /resources`

**Headers:**
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token |
| Content-Type | string | Yes | application/json |

**Request Body:**
```json
{
  "name": "string (required, 1-100 chars)",
  "description": "string (optional)",
  "type": "enum: basic | premium | enterprise",
  "metadata": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "id": "res_abc123",
  "name": "Example Resource",
  "createdAt": "2024-01-15T10:30:00Z",
  "status": "active"
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 201 | Resource created successfully |
| 400 | Invalid request body |
| 401 | Authentication required |
| 422 | Validation error |

**Example:**
```bash
curl -X POST https://api.example.com/v1/resources \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Resource", "type": "basic"}'
```
```

#### OpenAPI/Swagger Generator

```typescript
// lib/api-docs.ts
import { z } from 'zod';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  tags: string[];
  requestBody?: {
    description: string;
    schema: z.ZodType<any>;
    example: any;
  };
  parameters?: Array<{
    name: string;
    in: 'path' | 'query' | 'header';
    required: boolean;
    description: string;
    schema: z.ZodType<any>;
  }>;
  responses: Record<number, {
    description: string;
    schema?: z.ZodType<any>;
    example?: any;
  }>;
}

export function generateEndpointMarkdown(endpoint: EndpointDoc): string {
  let md = `### ${endpoint.summary}\n\n`;
  md += `${endpoint.description}\n\n`;
  md += `**Endpoint:** \`${endpoint.method} ${endpoint.path}\`\n\n`;

  // Parameters
  if (endpoint.parameters?.length) {
    md += `**Parameters:**\n\n`;
    md += `| Name | In | Required | Description |\n`;
    md += `|------|-----|----------|-------------|\n`;
    endpoint.parameters.forEach((param) => {
      md += `| ${param.name} | ${param.in} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
    });
    md += '\n';
  }

  // Request body
  if (endpoint.requestBody) {
    md += `**Request Body:**\n\n`;
    md += `${endpoint.requestBody.description}\n\n`;
    md += `\`\`\`json\n${JSON.stringify(endpoint.requestBody.example, null, 2)}\n\`\`\`\n\n`;
  }

  // Responses
  md += `**Responses:**\n\n`;
  md += `| Status | Description |\n`;
  md += `|--------|-------------|\n`;
  Object.entries(endpoint.responses).forEach(([code, response]) => {
    md += `| ${code} | ${response.description} |\n`;
  });
  md += '\n';

  return md;
}

// Generate full API reference
export function generateAPIReference(
  title: string,
  version: string,
  baseUrl: string,
  endpoints: EndpointDoc[]
): string {
  let md = `# ${title} API Reference\n\n`;
  md += `**Version:** ${version}\n`;
  md += `**Base URL:** \`${baseUrl}\`\n\n`;
  md += `---\n\n`;

  // Group by tags
  const grouped = endpoints.reduce((acc, endpoint) => {
    const tag = endpoint.tags[0] || 'Other';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(endpoint);
    return acc;
  }, {} as Record<string, EndpointDoc[]>);

  Object.entries(grouped).forEach(([tag, tagEndpoints]) => {
    md += `## ${tag}\n\n`;
    tagEndpoints.forEach((endpoint) => {
      md += generateEndpointMarkdown(endpoint);
      md += `---\n\n`;
    });
  });

  return md;
}
```

### 3. Blog Post Writing

#### Technical Blog Structure

```markdown
# [Catchy Title with Primary Keyword]

*Published: [Date] • [X] min read • By [Author]*

**TL;DR:** [One-sentence summary of the key takeaway]

---

## Introduction

[Hook - Start with a problem, question, or surprising fact]

[Context - Why this matters to the reader]

[Preview - What they'll learn by the end]

## The Problem

[Describe the challenge or pain point]

```typescript
// Bad example - what NOT to do
const data = fetch('/api/data').then(r => r.json());
// Problem: No error handling, no loading state
```

## The Solution

[Introduce your solution with clear explanation]

```typescript
// Good example - recommended approach
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
}
```

### Why This Works

[Explain the reasoning behind the solution]

1. **Benefit 1:** [Explanation]
2. **Benefit 2:** [Explanation]
3. **Benefit 3:** [Explanation]

## Real-World Example

[Show a complete, production-ready implementation]

## Performance Considerations

[Discuss trade-offs, benchmarks, or optimization tips]

## Conclusion

[Summarize key points]

[Call to action - what should the reader do next?]

---

**Want to learn more?** [Related resources/next steps]

*Have questions? [Contact/comments link]*
```

#### Blog Generator

```typescript
// lib/blog-generator.ts

interface BlogPost {
  title: string;
  slug: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  publishDate: Date;
  updatedDate?: Date;
  category: string;
  tags: string[];
  readingTime: number;
  excerpt: string;
  content: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl?: string;
    ogImage: string;
  };
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function generateBlogFrontmatter(post: BlogPost): string {
  return `---
title: "${post.title}"
slug: "${post.slug}"
author: "${post.author.name}"
publishDate: "${post.publishDate.toISOString()}"
${post.updatedDate ? `updatedDate: "${post.updatedDate.toISOString()}"` : ''}
category: "${post.category}"
tags: [${post.tags.map(t => `"${t}"`).join(', ')}]
readingTime: ${post.readingTime}
excerpt: "${post.excerpt}"
seo:
  metaTitle: "${post.seo.metaTitle}"
  metaDescription: "${post.seo.metaDescription}"
  ogImage: "${post.seo.ogImage}"
---

`;
}

export function generateTableOfContents(markdown: string): string {
  const headings = markdown.match(/^#{2,3}\s.+$/gm) || [];

  if (headings.length < 3) return '';

  let toc = '## Table of Contents\n\n';

  headings.forEach((heading) => {
    const level = heading.match(/^#+/)?.[0].length || 2;
    const text = heading.replace(/^#+\s/, '');
    const anchor = text.toLowerCase().replace(/[^\w]+/g, '-');
    const indent = '  '.repeat(level - 2);

    toc += `${indent}- [${text}](#${anchor})\n`;
  });

  return toc + '\n';
}
```

### 4. README Files

#### Comprehensive README Template

```markdown
# Project Name

[![npm version](https://badge.fury.io/js/project-name.svg)](https://www.npmjs.com/package/project-name)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

> One-line description of what this project does

[Demo](https://demo.example.com) • [Documentation](https://docs.example.com) • [Discord](https://discord.gg/xxx)

## Features

- ✅ Feature one with brief description
- ✅ Feature two with brief description
- ✅ Feature three with brief description
- 🚧 Upcoming feature (in development)

## Quick Start

```bash
# Install
npm install project-name

# or with pnpm
pnpm add project-name
```

```typescript
import { feature } from 'project-name';

// Basic usage
const result = feature('input');
console.log(result);
```

## Installation

### Requirements

- Node.js 18+
- pnpm (recommended) or npm

### Package Managers

```bash
# npm
npm install project-name

# pnpm
pnpm add project-name

# yarn
yarn add project-name
```

## Usage

### Basic Example

```typescript
import { ProjectName } from 'project-name';

const instance = new ProjectName({
  option1: 'value',
  option2: true,
});

const result = await instance.doSomething();
```

### Advanced Configuration

```typescript
import { ProjectName, type Config } from 'project-name';

const config: Config = {
  // Detailed configuration options
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
  },
  features: {
    caching: true,
    retries: 3,
  },
};

const instance = new ProjectName(config);
```

### With Next.js

```typescript
// app/api/example/route.ts
import { ProjectName } from 'project-name';

export async function GET() {
  const pn = new ProjectName({ apiKey: process.env.API_KEY });
  const data = await pn.fetch();
  return Response.json(data);
}
```

## API Reference

### `ProjectName`

Main class for interacting with the library.

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | - | Your API key (required) |
| `baseUrl` | `string` | `'https://api.example.com'` | API base URL |
| `timeout` | `number` | `5000` | Request timeout in ms |

#### Methods

##### `.fetch(options)`

Fetches data from the API.

```typescript
const data = await instance.fetch({
  limit: 10,
  offset: 0,
});
```

## Configuration

### Environment Variables

```bash
# .env.local
PROJECT_API_KEY=your_api_key
PROJECT_BASE_URL=https://api.example.com
```

### TypeScript

This library is written in TypeScript and includes type definitions.

```typescript
import type { Config, Result, Options } from 'project-name';
```

## Examples

Check out the [examples directory](./examples) for more detailed examples:

- [Basic Usage](./examples/basic.ts)
- [Next.js Integration](./examples/nextjs/)
- [Error Handling](./examples/error-handling.ts)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/org/project-name.git

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build
```

## License

MIT © [Your Name](https://github.com/yourname)

## Acknowledgments

- [Dependency 1](https://example.com) - For providing X
- [Dependency 2](https://example.com) - For Y feature

---

<p align="center">
  Made with ❤️ by <a href="https://example.com">Your Team</a>
</p>
```

#### README Generator

```typescript
// lib/readme-generator.ts

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  repository: string;
  author: string;
  license: string;
  keywords: string[];
}

interface ReadmeConfig {
  package: PackageInfo;
  features: string[];
  installation: {
    requirements: string[];
    commands: Record<string, string>;
  };
  quickStart: {
    code: string;
    language: string;
  };
  apiReference?: Array<{
    name: string;
    description: string;
    params: Array<{ name: string; type: string; description: string }>;
    returns: string;
    example: string;
  }>;
  contributing?: boolean;
  badges?: string[];
}

export function generateReadme(config: ReadmeConfig): string {
  let md = '';

  // Title and badges
  md += `# ${config.package.name}\n\n`;

  if (config.badges?.length) {
    md += config.badges.join(' ') + '\n\n';
  }

  md += `> ${config.package.description}\n\n`;

  // Features
  md += `## Features\n\n`;
  config.features.forEach((feature) => {
    md += `- ✅ ${feature}\n`;
  });
  md += '\n';

  // Quick Start
  md += `## Quick Start\n\n`;
  md += `\`\`\`${config.quickStart.language}\n${config.quickStart.code}\n\`\`\`\n\n`;

  // Installation
  md += `## Installation\n\n`;
  md += `### Requirements\n\n`;
  config.installation.requirements.forEach((req) => {
    md += `- ${req}\n`;
  });
  md += '\n';

  md += `### Install\n\n`;
  md += `\`\`\`bash\n`;
  Object.entries(config.installation.commands).forEach(([manager, cmd]) => {
    md += `# ${manager}\n${cmd}\n\n`;
  });
  md += `\`\`\`\n\n`;

  // API Reference
  if (config.apiReference?.length) {
    md += `## API Reference\n\n`;
    config.apiReference.forEach((api) => {
      md += `### \`${api.name}\`\n\n`;
      md += `${api.description}\n\n`;

      if (api.params.length) {
        md += `**Parameters:**\n\n`;
        md += `| Name | Type | Description |\n`;
        md += `|------|------|-------------|\n`;
        api.params.forEach((param) => {
          md += `| \`${param.name}\` | \`${param.type}\` | ${param.description} |\n`;
        });
        md += '\n';
      }

      md += `**Returns:** \`${api.returns}\`\n\n`;
      md += `**Example:**\n\n`;
      md += `\`\`\`typescript\n${api.example}\n\`\`\`\n\n`;
    });
  }

  // Contributing
  if (config.contributing) {
    md += `## Contributing\n\n`;
    md += `Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).\n\n`;
  }

  // License
  md += `## License\n\n`;
  md += `${config.package.license} © [${config.package.author}](${config.package.repository})\n`;

  return md;
}
```

### 5. Changelog Writing

#### Keep a Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature description

### Changed
- Updated dependency X to version Y

## [1.2.0] - 2024-01-15

### Added
- Support for TypeScript 5.0
- New `configure()` method for runtime options
- Dark mode support in UI components

### Changed
- Improved error messages for API failures
- Updated documentation with more examples
- Migrated from Jest to Vitest for testing

### Deprecated
- `oldMethod()` is deprecated, use `newMethod()` instead

### Removed
- Dropped support for Node.js 16

### Fixed
- Race condition in concurrent API calls (#123)
- Memory leak in event listeners (#145)
- Incorrect type inference for generic functions

### Security
- Updated `axios` to fix CVE-2023-XXXX
- Added rate limiting to prevent abuse

## [1.1.0] - 2024-01-01

### Added
- Initial stable release
```

#### Changelog Generator

```typescript
// lib/changelog.ts

type ChangeType = 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';

interface Change {
  type: ChangeType;
  description: string;
  issue?: string;
  breaking?: boolean;
}

interface Release {
  version: string;
  date: string;
  changes: Change[];
}

const typeOrder: ChangeType[] = ['added', 'changed', 'deprecated', 'removed', 'fixed', 'security'];

export function generateChangelog(releases: Release[]): string {
  let md = `# Changelog\n\n`;
  md += `All notable changes to this project will be documented in this file.\n\n`;
  md += `The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),\n`;
  md += `and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;

  releases.forEach((release) => {
    md += `## [${release.version}] - ${release.date}\n\n`;

    // Group changes by type
    const grouped = release.changes.reduce((acc, change) => {
      if (!acc[change.type]) acc[change.type] = [];
      acc[change.type].push(change);
      return acc;
    }, {} as Record<ChangeType, Change[]>);

    // Output in standard order
    typeOrder.forEach((type) => {
      const changes = grouped[type];
      if (!changes?.length) return;

      md += `### ${type.charAt(0).toUpperCase() + type.slice(1)}\n\n`;

      changes.forEach((change) => {
        let line = `- ${change.description}`;
        if (change.issue) {
          line += ` (#${change.issue})`;
        }
        if (change.breaking) {
          line = `- **BREAKING:** ${change.description}`;
        }
        md += `${line}\n`;
      });

      md += '\n';
    });
  });

  return md;
}

// Parse git commits into changelog entries
export function parseConventionalCommit(message: string): Change | null {
  const match = message.match(/^(feat|fix|docs|style|refactor|perf|test|chore|breaking)(\(.+\))?!?:\s(.+)/);

  if (!match) return null;

  const [, type, , description] = match;
  const isBreaking = message.includes('!:') || message.toLowerCase().includes('breaking');

  const typeMap: Record<string, ChangeType> = {
    feat: 'added',
    fix: 'fixed',
    breaking: 'changed',
    perf: 'changed',
    refactor: 'changed',
    docs: 'changed',
  };

  return {
    type: typeMap[type] || 'changed',
    description,
    breaking: isBreaking,
  };
}
```

### 6. SEO Optimization

#### Content SEO Patterns

```typescript
// lib/seo-content.ts

interface SEOAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
}

export function analyzeSEO(
  content: string,
  targetKeyword: string,
  metaDescription: string
): SEOAnalysis {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Title analysis
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1] || '';

  if (!title.toLowerCase().includes(targetKeyword.toLowerCase())) {
    issues.push('Target keyword not in title');
    score -= 15;
  }

  if (title.length > 60) {
    issues.push('Title too long (max 60 chars for SEO)');
    score -= 5;
  }

  // Meta description
  if (metaDescription.length < 120) {
    issues.push('Meta description too short (aim for 150-160 chars)');
    score -= 10;
  }

  if (metaDescription.length > 160) {
    issues.push('Meta description too long (max 160 chars)');
    score -= 5;
  }

  if (!metaDescription.toLowerCase().includes(targetKeyword.toLowerCase())) {
    suggestions.push('Consider adding target keyword to meta description');
    score -= 5;
  }

  // Content analysis
  const wordCount = content.split(/\s+/).length;

  if (wordCount < 300) {
    issues.push('Content too short (aim for 1000+ words)');
    score -= 20;
  }

  // Keyword density
  const keywordCount = (content.toLowerCase().match(new RegExp(targetKeyword.toLowerCase(), 'g')) || []).length;
  const density = (keywordCount / wordCount) * 100;

  if (density < 0.5) {
    suggestions.push('Keyword density too low (aim for 1-2%)');
    score -= 5;
  }

  if (density > 3) {
    issues.push('Keyword stuffing detected (reduce keyword usage)');
    score -= 15;
  }

  // Headings analysis
  const h2Count = (content.match(/^##\s/gm) || []).length;
  const h3Count = (content.match(/^###\s/gm) || []).length;

  if (h2Count < 2) {
    suggestions.push('Add more H2 headings for structure');
    score -= 5;
  }

  // Links
  const linkCount = (content.match(/\[.+\]\(.+\)/g) || []).length;

  if (linkCount < 2) {
    suggestions.push('Add internal/external links for credibility');
    score -= 5;
  }

  // Images
  const imageCount = (content.match(/!\[.+\]\(.+\)/g) || []).length;

  if (imageCount < 1) {
    suggestions.push('Add images with alt text');
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
  };
}

export function generateMetaDescription(content: string, maxLength: number = 155): string {
  // Extract first meaningful paragraph
  const paragraphs = content
    .split('\n\n')
    .filter((p) => !p.startsWith('#') && p.trim().length > 50);

  const firstParagraph = paragraphs[0] || '';

  // Clean markdown
  const cleaned = firstParagraph
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Truncate at word boundary
  const truncated = cleaned.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  return truncated.substring(0, lastSpace) + '...';
}
```

## Writing Style Guidelines

### Technical Writing Principles

1. **Clarity over cleverness** - Use simple, direct language
2. **Show, don't just tell** - Include code examples
3. **Progressive disclosure** - Start simple, add complexity
4. **Scannable content** - Use headings, lists, and formatting
5. **Active voice** - "Run the command" not "The command should be run"

### Code Example Best Practices

```typescript
// GOOD: Complete, runnable example
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('active', true);

if (error) throw error;
console.log(data);

// BAD: Incomplete, unclear example
const data = supabase.select('users'); // What is supabase? Where does it come from?
```

## Related Skills

- **notion-navigator** - Publish to Notion
- **markdown-expert** - Advanced markdown
- **seo-specialist** - Search optimization
- **api-design** - API documentation patterns

## Further Reading

- [Google Technical Writing](https://developers.google.com/tech-writing)
- [Write the Docs](https://www.writethedocs.org/)
- [Diátaxis Documentation Framework](https://diataxis.fr/)
- [Microsoft Style Guide](https://docs.microsoft.com/en-us/style-guide/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
