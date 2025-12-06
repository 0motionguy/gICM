# Notion Navigator
> **ID:** `notion-navigator` | **Tier:** 3 | **Token Cost:** 4500 | **MCP:** notion

## What This Skill Does

Master Notion API integration for page management, database operations, knowledge base automation, and documentation workflows. Build programmatic interfaces to Notion workspaces with full CRUD operations, filtering, and real-time sync capabilities.

## When to Use

- Managing Notion pages and databases programmatically
- Automating documentation updates from code changes
- Building knowledge base search and indexing systems
- Creating pages from templates or external data
- Syncing data between Notion and other systems
- Implementing content management workflows

## Core Capabilities

### 1. Notion API Setup

#### Installation and Configuration

```bash
# Install Notion SDK
pnpm add @notionhq/client

# For Next.js integration
pnpm add @notionhq/client zod
```

#### Client Initialization

```typescript
// lib/notion.ts
import { Client } from '@notionhq/client';

// Initialize with integration token
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export default notion;

// With custom timeout and retry
const notionWithOptions = new Client({
  auth: process.env.NOTION_API_KEY,
  timeoutMs: 30000,
  notionVersion: '2022-06-28',
});
```

#### Environment Setup

```bash
# .env.local
NOTION_API_KEY="secret_xxx"
NOTION_DATABASE_ID="xxx-xxx-xxx"
NOTION_WORKSPACE_ID="xxx"
```

### 2. Page Management

#### Create Pages

```typescript
// lib/notion/pages.ts
import notion from '../notion';
import { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints';

interface CreatePageInput {
  parentId: string;
  title: string;
  icon?: string;
  cover?: string;
  content?: Array<{
    type: 'paragraph' | 'heading_1' | 'heading_2' | 'heading_3' | 'bulleted_list_item' | 'code';
    text: string;
    language?: string;
  }>;
}

export async function createPage(input: CreatePageInput) {
  const children = input.content?.map((block) => {
    if (block.type === 'code') {
      return {
        object: 'block' as const,
        type: 'code' as const,
        code: {
          rich_text: [{ type: 'text' as const, text: { content: block.text } }],
          language: block.language || 'typescript',
        },
      };
    }

    return {
      object: 'block' as const,
      type: block.type,
      [block.type]: {
        rich_text: [{ type: 'text' as const, text: { content: block.text } }],
      },
    };
  }) || [];

  const page = await notion.pages.create({
    parent: { page_id: input.parentId },
    icon: input.icon ? { type: 'emoji', emoji: input.icon as any } : undefined,
    cover: input.cover ? { type: 'external', external: { url: input.cover } } : undefined,
    properties: {
      title: {
        title: [{ text: { content: input.title } }],
      },
    },
    children: children as any,
  });

  return page;
}

// Create page in database
export async function createDatabasePage(
  databaseId: string,
  properties: Record<string, any>
) {
  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
  });

  return page;
}
```

#### Read Pages

```typescript
// lib/notion/pages.ts (continued)
export async function getPage(pageId: string) {
  const page = await notion.pages.retrieve({ page_id: pageId });
  return page;
}

export async function getPageContent(pageId: string) {
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100,
  });

  return blocks.results;
}

// Recursively get all blocks including nested children
export async function getFullPageContent(pageId: string): Promise<any[]> {
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100,
  });

  const results = await Promise.all(
    blocks.results.map(async (block: any) => {
      if (block.has_children) {
        const children = await getFullPageContent(block.id);
        return { ...block, children };
      }
      return block;
    })
  );

  return results;
}
```

#### Update Pages

```typescript
// lib/notion/pages.ts (continued)
export async function updatePageProperties(
  pageId: string,
  properties: Record<string, any>
) {
  const page = await notion.pages.update({
    page_id: pageId,
    properties,
  });

  return page;
}

export async function updatePageIcon(pageId: string, emoji: string) {
  const page = await notion.pages.update({
    page_id: pageId,
    icon: { type: 'emoji', emoji: emoji as any },
  });

  return page;
}

export async function archivePage(pageId: string) {
  const page = await notion.pages.update({
    page_id: pageId,
    archived: true,
  });

  return page;
}
```

#### Block Operations

```typescript
// lib/notion/blocks.ts
import notion from '../notion';

export async function appendBlocks(pageId: string, blocks: any[]) {
  const result = await notion.blocks.children.append({
    block_id: pageId,
    children: blocks,
  });

  return result;
}

export async function updateBlock(blockId: string, content: any) {
  const block = await notion.blocks.update({
    block_id: blockId,
    ...content,
  });

  return block;
}

export async function deleteBlock(blockId: string) {
  const block = await notion.blocks.delete({
    block_id: blockId,
  });

  return block;
}

// Helper to create common block types
export const BlockFactory = {
  paragraph: (text: string) => ({
    object: 'block' as const,
    type: 'paragraph' as const,
    paragraph: {
      rich_text: [{ type: 'text' as const, text: { content: text } }],
    },
  }),

  heading1: (text: string) => ({
    object: 'block' as const,
    type: 'heading_1' as const,
    heading_1: {
      rich_text: [{ type: 'text' as const, text: { content: text } }],
    },
  }),

  heading2: (text: string) => ({
    object: 'block' as const,
    type: 'heading_2' as const,
    heading_2: {
      rich_text: [{ type: 'text' as const, text: { content: text } }],
    },
  }),

  bulletedList: (items: string[]) =>
    items.map((item) => ({
      object: 'block' as const,
      type: 'bulleted_list_item' as const,
      bulleted_list_item: {
        rich_text: [{ type: 'text' as const, text: { content: item } }],
      },
    })),

  code: (code: string, language: string = 'typescript') => ({
    object: 'block' as const,
    type: 'code' as const,
    code: {
      rich_text: [{ type: 'text' as const, text: { content: code } }],
      language,
    },
  }),

  callout: (text: string, emoji: string = '💡') => ({
    object: 'block' as const,
    type: 'callout' as const,
    callout: {
      rich_text: [{ type: 'text' as const, text: { content: text } }],
      icon: { type: 'emoji', emoji },
    },
  }),

  divider: () => ({
    object: 'block' as const,
    type: 'divider' as const,
    divider: {},
  }),

  toggle: (text: string, children: any[] = []) => ({
    object: 'block' as const,
    type: 'toggle' as const,
    toggle: {
      rich_text: [{ type: 'text' as const, text: { content: text } }],
      children,
    },
  }),
};
```

### 3. Database Operations

#### Query Databases

```typescript
// lib/notion/database.ts
import notion from '../notion';

interface QueryOptions {
  filter?: any;
  sorts?: Array<{
    property: string;
    direction: 'ascending' | 'descending';
  }>;
  pageSize?: number;
  startCursor?: string;
}

export async function queryDatabase(databaseId: string, options: QueryOptions = {}) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: options.filter,
    sorts: options.sorts,
    page_size: options.pageSize || 100,
    start_cursor: options.startCursor,
  });

  return response;
}

// Query all pages (handles pagination)
export async function queryAllPages(databaseId: string, filter?: any) {
  const pages: any[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      start_cursor: cursor,
      page_size: 100,
    });

    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor || undefined : undefined;
  } while (cursor);

  return pages;
}

// Common filter patterns
export const Filters = {
  equals: (property: string, type: string, value: any) => ({
    property,
    [type]: { equals: value },
  }),

  contains: (property: string, value: string) => ({
    property,
    rich_text: { contains: value },
  }),

  checkbox: (property: string, equals: boolean) => ({
    property,
    checkbox: { equals },
  }),

  selectEquals: (property: string, value: string) => ({
    property,
    select: { equals: value },
  }),

  dateAfter: (property: string, date: string) => ({
    property,
    date: { after: date },
  }),

  dateBefore: (property: string, date: string) => ({
    property,
    date: { before: date },
  }),

  and: (...filters: any[]) => ({ and: filters }),
  or: (...filters: any[]) => ({ or: filters }),
};
```

#### Create Database

```typescript
// lib/notion/database.ts (continued)
interface DatabaseProperty {
  type: 'title' | 'rich_text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'url' | 'email' | 'phone_number';
  options?: Array<{ name: string; color?: string }>;
}

export async function createDatabase(
  parentPageId: string,
  title: string,
  properties: Record<string, DatabaseProperty>
) {
  const formattedProperties: Record<string, any> = {};

  for (const [name, config] of Object.entries(properties)) {
    if (config.type === 'select' || config.type === 'multi_select') {
      formattedProperties[name] = {
        [config.type]: {
          options: config.options || [],
        },
      };
    } else {
      formattedProperties[name] = { [config.type]: {} };
    }
  }

  const database = await notion.databases.create({
    parent: { page_id: parentPageId },
    title: [{ text: { content: title } }],
    properties: formattedProperties,
  });

  return database;
}

// Update database schema
export async function updateDatabaseSchema(
  databaseId: string,
  properties: Record<string, any>
) {
  const database = await notion.databases.update({
    database_id: databaseId,
    properties,
  });

  return database;
}
```

### 4. Knowledge Base Search

#### Full-Text Search

```typescript
// lib/notion/search.ts
import notion from '../notion';

interface SearchOptions {
  query: string;
  filter?: {
    property: 'object';
    value: 'page' | 'database';
  };
  sort?: {
    direction: 'ascending' | 'descending';
    timestamp: 'last_edited_time';
  };
  pageSize?: number;
  startCursor?: string;
}

export async function search(options: SearchOptions) {
  const response = await notion.search({
    query: options.query,
    filter: options.filter,
    sort: options.sort,
    page_size: options.pageSize || 20,
    start_cursor: options.startCursor,
  });

  return response;
}

// Search pages only
export async function searchPages(query: string, limit: number = 20) {
  const response = await notion.search({
    query,
    filter: { property: 'object', value: 'page' },
    page_size: limit,
    sort: {
      direction: 'descending',
      timestamp: 'last_edited_time',
    },
  });

  return response.results;
}

// Search within specific database
export async function searchInDatabase(
  databaseId: string,
  searchTerm: string,
  searchProperty: string = 'Name'
) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: searchProperty,
      rich_text: { contains: searchTerm },
    },
  });

  return response.results;
}
```

#### Knowledge Base Index

```typescript
// lib/notion/knowledge-base.ts
import notion from '../notion';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastEdited: string;
}

export async function indexKnowledgeBase(databaseId: string): Promise<KnowledgeArticle[]> {
  const pages = await queryAllPages(databaseId);

  const articles = await Promise.all(
    pages.map(async (page: any) => {
      const content = await getPageContent(page.id);
      const textContent = extractTextFromBlocks(content);

      return {
        id: page.id,
        title: getPropertyValue(page.properties.Name || page.properties.Title),
        content: textContent,
        category: getPropertyValue(page.properties.Category),
        tags: getPropertyValue(page.properties.Tags) || [],
        lastEdited: page.last_edited_time,
      };
    })
  );

  return articles;
}

function extractTextFromBlocks(blocks: any[]): string {
  return blocks
    .map((block: any) => {
      const type = block.type;
      const content = block[type];

      if (content?.rich_text) {
        return content.rich_text.map((rt: any) => rt.plain_text).join('');
      }

      return '';
    })
    .filter(Boolean)
    .join('\n');
}

function getPropertyValue(property: any): any {
  if (!property) return null;

  switch (property.type) {
    case 'title':
      return property.title?.[0]?.plain_text || '';
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || '';
    case 'select':
      return property.select?.name || null;
    case 'multi_select':
      return property.multi_select?.map((s: any) => s.name) || [];
    case 'checkbox':
      return property.checkbox;
    case 'number':
      return property.number;
    case 'date':
      return property.date?.start || null;
    case 'url':
      return property.url;
    default:
      return null;
  }
}
```

### 5. Documentation Automation

#### Auto-Generate Docs from Code

```typescript
// lib/notion/doc-generator.ts
import notion from '../notion';
import { BlockFactory, appendBlocks } from './blocks';

interface FunctionDoc {
  name: string;
  description: string;
  params: Array<{ name: string; type: string; description: string }>;
  returns: { type: string; description: string };
  example?: string;
}

export async function generateFunctionDoc(
  parentPageId: string,
  doc: FunctionDoc
) {
  // Create new page for the function
  const page = await notion.pages.create({
    parent: { page_id: parentPageId },
    icon: { type: 'emoji', emoji: '⚙️' },
    properties: {
      title: { title: [{ text: { content: doc.name } }] },
    },
  });

  // Build content blocks
  const blocks: any[] = [
    BlockFactory.callout(doc.description, '📝'),
    BlockFactory.divider(),
    BlockFactory.heading2('Parameters'),
  ];

  // Add parameter table as list
  if (doc.params.length > 0) {
    blocks.push(
      ...doc.params.map((param) =>
        BlockFactory.paragraph(`• \`${param.name}\` (${param.type}): ${param.description}`)
      )
    );
  } else {
    blocks.push(BlockFactory.paragraph('No parameters'));
  }

  blocks.push(BlockFactory.divider());
  blocks.push(BlockFactory.heading2('Returns'));
  blocks.push(
    BlockFactory.paragraph(`\`${doc.returns.type}\`: ${doc.returns.description}`)
  );

  if (doc.example) {
    blocks.push(BlockFactory.divider());
    blocks.push(BlockFactory.heading2('Example'));
    blocks.push(BlockFactory.code(doc.example, 'typescript'));
  }

  await appendBlocks(page.id, blocks);

  return page;
}

// Batch generate docs for multiple functions
export async function generateAPIReference(
  databaseId: string,
  functions: FunctionDoc[]
) {
  const results = [];

  for (const func of functions) {
    // Create database entry
    const page = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: func.name } }] },
        Type: { select: { name: 'Function' } },
        Status: { select: { name: 'Documented' } },
      },
    });

    // Add content
    const blocks: any[] = [
      BlockFactory.callout(func.description, '📝'),
      BlockFactory.heading2('Signature'),
      BlockFactory.code(
        `function ${func.name}(${func.params.map((p) => `${p.name}: ${p.type}`).join(', ')}): ${func.returns.type}`,
        'typescript'
      ),
    ];

    if (func.example) {
      blocks.push(BlockFactory.heading2('Example'));
      blocks.push(BlockFactory.code(func.example, 'typescript'));
    }

    await appendBlocks(page.id, blocks);
    results.push(page);
  }

  return results;
}
```

#### Changelog Generator

```typescript
// lib/notion/changelog.ts
import notion from '../notion';
import { BlockFactory, appendBlocks } from './blocks';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed';
    description: string;
  }[];
}

const typeEmojis = {
  added: '✨',
  changed: '🔄',
  fixed: '🐛',
  removed: '🗑️',
};

export async function addChangelogEntry(
  changelogPageId: string,
  entry: ChangelogEntry
) {
  const blocks: any[] = [
    BlockFactory.heading2(`v${entry.version} - ${entry.date}`),
  ];

  // Group changes by type
  const grouped = entry.changes.reduce((acc, change) => {
    if (!acc[change.type]) acc[change.type] = [];
    acc[change.type].push(change.description);
    return acc;
  }, {} as Record<string, string[]>);

  for (const [type, descriptions] of Object.entries(grouped)) {
    blocks.push(
      BlockFactory.heading3(`${typeEmojis[type as keyof typeof typeEmojis]} ${type.charAt(0).toUpperCase() + type.slice(1)}`)
    );
    blocks.push(...BlockFactory.bulletedList(descriptions));
  }

  blocks.push(BlockFactory.divider());

  // Prepend new entry at the top (after title)
  await appendBlocks(changelogPageId, blocks);

  return { success: true, version: entry.version };
}
```

### 6. Sync and Webhooks

#### Two-Way Sync Pattern

```typescript
// lib/notion/sync.ts
import notion from '../notion';
import { prisma } from '../prisma'; // Your database

interface SyncConfig {
  notionDatabaseId: string;
  localTable: string;
  propertyMap: Record<string, string>; // notion property -> local field
}

export async function syncFromNotion(config: SyncConfig) {
  const pages = await queryAllPages(config.notionDatabaseId);

  for (const page of pages) {
    const localData: Record<string, any> = {
      notionId: page.id,
      updatedAt: new Date(page.last_edited_time),
    };

    for (const [notionProp, localField] of Object.entries(config.propertyMap)) {
      localData[localField] = getPropertyValue(page.properties[notionProp]);
    }

    // Upsert to local database
    await (prisma as any)[config.localTable].upsert({
      where: { notionId: page.id },
      update: localData,
      create: localData,
    });
  }

  return { synced: pages.length };
}

export async function syncToNotion(config: SyncConfig) {
  const localRecords = await (prisma as any)[config.localTable].findMany({
    where: { notionId: { not: null } },
  });

  for (const record of localRecords) {
    const properties: Record<string, any> = {};

    for (const [notionProp, localField] of Object.entries(config.propertyMap)) {
      properties[notionProp] = formatPropertyValue(
        notionProp,
        record[localField]
      );
    }

    await notion.pages.update({
      page_id: record.notionId,
      properties,
    });
  }

  return { synced: localRecords.length };
}

function formatPropertyValue(propertyName: string, value: any): any {
  // Format based on property type (simplified)
  if (typeof value === 'string') {
    return { rich_text: [{ text: { content: value } }] };
  }
  if (typeof value === 'boolean') {
    return { checkbox: value };
  }
  if (typeof value === 'number') {
    return { number: value };
  }
  return { rich_text: [{ text: { content: String(value) } }] };
}
```

## Real-World Examples

### Example 1: Project Documentation Hub

```typescript
// app/api/docs/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import notion from '@/lib/notion';
import { BlockFactory, appendBlocks } from '@/lib/notion/blocks';

export async function POST(request: NextRequest) {
  const { projectName, description, techStack, features } = await request.json();

  // Create project page
  const projectPage = await notion.pages.create({
    parent: { database_id: process.env.PROJECTS_DB_ID! },
    icon: { type: 'emoji', emoji: '📁' },
    properties: {
      Name: { title: [{ text: { content: projectName } }] },
      Status: { select: { name: 'Active' } },
      'Tech Stack': {
        multi_select: techStack.map((t: string) => ({ name: t })),
      },
    },
  });

  // Add content
  const blocks = [
    BlockFactory.heading1('Overview'),
    BlockFactory.paragraph(description),
    BlockFactory.divider(),
    BlockFactory.heading1('Tech Stack'),
    ...BlockFactory.bulletedList(techStack),
    BlockFactory.divider(),
    BlockFactory.heading1('Features'),
    ...BlockFactory.bulletedList(features),
    BlockFactory.divider(),
    BlockFactory.heading1('Getting Started'),
    BlockFactory.code(
      `git clone https://github.com/org/${projectName}\ncd ${projectName}\npnpm install\npnpm dev`,
      'bash'
    ),
  ];

  await appendBlocks(projectPage.id, blocks);

  return NextResponse.json({
    success: true,
    pageId: projectPage.id,
    url: (projectPage as any).url,
  });
}
```

### Example 2: Knowledge Base Search API

```typescript
// app/api/kb/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchInDatabase } from '@/lib/notion/search';
import { getPageContent } from '@/lib/notion/pages';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  const results = await searchInDatabase(
    process.env.KNOWLEDGE_BASE_DB_ID!,
    query,
    'Title'
  );

  const articles = await Promise.all(
    results.slice(0, 5).map(async (page: any) => {
      const content = await getPageContent(page.id);

      return {
        id: page.id,
        title: page.properties.Title?.title?.[0]?.plain_text || 'Untitled',
        category: page.properties.Category?.select?.name,
        excerpt: extractExcerpt(content, 200),
        url: page.url,
      };
    })
  );

  return NextResponse.json({ articles, total: results.length });
}

function extractExcerpt(blocks: any[], maxLength: number): string {
  const text = blocks
    .filter((b: any) => b.type === 'paragraph')
    .map((b: any) => b.paragraph?.rich_text?.[0]?.plain_text || '')
    .join(' ');

  return text.length > maxLength
    ? text.substring(0, maxLength) + '...'
    : text;
}
```

### Example 3: Meeting Notes Automation

```typescript
// lib/notion/meetings.ts
import notion from './notion';
import { BlockFactory, appendBlocks } from './blocks';

interface MeetingNotes {
  title: string;
  date: string;
  attendees: string[];
  agenda: string[];
  notes: string;
  actionItems: Array<{ task: string; assignee: string; dueDate: string }>;
}

export async function createMeetingNotes(
  meetingsDatabaseId: string,
  meeting: MeetingNotes
) {
  const page = await notion.pages.create({
    parent: { database_id: meetingsDatabaseId },
    icon: { type: 'emoji', emoji: '📝' },
    properties: {
      Name: { title: [{ text: { content: meeting.title } }] },
      Date: { date: { start: meeting.date } },
      Attendees: {
        multi_select: meeting.attendees.map((a) => ({ name: a })),
      },
      Status: { select: { name: 'Completed' } },
    },
  });

  const blocks = [
    BlockFactory.heading2('Agenda'),
    ...BlockFactory.bulletedList(meeting.agenda),
    BlockFactory.divider(),
    BlockFactory.heading2('Notes'),
    BlockFactory.paragraph(meeting.notes),
    BlockFactory.divider(),
    BlockFactory.heading2('Action Items'),
  ];

  // Add action items as to-do blocks
  for (const item of meeting.actionItems) {
    blocks.push({
      object: 'block' as const,
      type: 'to_do' as const,
      to_do: {
        rich_text: [
          { type: 'text' as const, text: { content: `${item.task} (@${item.assignee}, due: ${item.dueDate})` } },
        ],
        checked: false,
      },
    });
  }

  await appendBlocks(page.id, blocks);

  return page;
}
```

## Property Helpers

```typescript
// lib/notion/properties.ts

// Create property values for database pages
export const Properties = {
  title: (text: string) => ({
    title: [{ text: { content: text } }],
  }),

  richText: (text: string) => ({
    rich_text: [{ text: { content: text } }],
  }),

  number: (value: number) => ({ number: value }),

  select: (name: string) => ({ select: { name } }),

  multiSelect: (names: string[]) => ({
    multi_select: names.map((name) => ({ name })),
  }),

  date: (start: string, end?: string) => ({
    date: { start, end },
  }),

  checkbox: (checked: boolean) => ({ checkbox: checked }),

  url: (url: string) => ({ url }),

  email: (email: string) => ({ email }),

  phone: (phone: string) => ({ phone_number: phone }),

  relation: (pageIds: string[]) => ({
    relation: pageIds.map((id) => ({ id })),
  }),
};
```

## Related Skills

- **content-writer** - Technical content creation
- **markdown-expert** - Markdown formatting
- **api-design** - API documentation patterns
- **automation-builder** - Workflow automation

## Further Reading

- [Notion API Documentation](https://developers.notion.com/)
- [Notion SDK for JavaScript](https://github.com/makenotion/notion-sdk-js)
- [Notion API Reference](https://developers.notion.com/reference)
- [Block Types Reference](https://developers.notion.com/reference/block)
- [Property Types Reference](https://developers.notion.com/reference/property-value-object)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
