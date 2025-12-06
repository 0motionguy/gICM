# Convex Expert

> **ID:** `convex-expert`
> **Tier:** 2
> **Token Cost:** 5500
> **MCP Connections:** None

## What This Skill Does

Master Convex backend-as-a-service for building real-time, serverless applications. This skill provides comprehensive expertise in schema design, real-time queries, mutations, HTTP actions, authentication integration, and file storage. Convex eliminates the need for traditional backend infrastructure while providing TypeScript type safety, automatic API generation, and built-in real-time subscriptions.

**Key Differentiators:**
- Fully reactive queries with automatic invalidation
- Type-safe end-to-end from schema to frontend
- Built-in optimistic updates and caching
- Serverless functions with zero infrastructure management
- Integrated file storage and authentication
- Live reload during development with instant schema migrations

## When to Use

**Ideal Scenarios:**
- Building real-time collaborative applications (chat, docs, whiteboards)
- Creating dashboards with live data updates
- Developing social platforms with feeds and notifications
- Building task management or project tracking systems
- Creating marketplaces with live inventory updates
- Developing admin panels with real-time monitoring

**Choose Convex When:**
- You need real-time updates without WebSocket complexity
- You want end-to-end TypeScript type safety
- You need rapid prototyping with production-ready infrastructure
- You want automatic API generation from functions
- You need optimistic UI updates out of the box
- You want to avoid managing databases, APIs, and caching layers

**Avoid Convex When:**
- You need complex SQL joins or analytical queries (use PostgreSQL)
- You have extremely high write throughput requirements (>10k writes/sec)
- You need full control over infrastructure and hosting
- You are building batch processing or ETL pipelines
- You require ACID transactions across multiple operations

## Core Capabilities

### 1. Schema Design

Convex uses a schema-first approach with the `v` validator library for defining tables, indexes, and validation rules.

#### Basic Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    clerkId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    isOnline: v.boolean(),
    lastSeen: v.optional(v.number()),
    bio: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_online_status", ["isOnline", "lastSeen"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    isEdited: v.boolean(),
    isDeleted: v.boolean(),
    reactions: v.array(
      v.object({
        userId: v.id("users"),
        emoji: v.string(),
      })
    ),
    readBy: v.array(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_conversation", ["conversationId", "createdAt"])
    .index("by_sender", ["senderId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["conversationId", "isDeleted"],
    }),

  conversations: defineTable({
    name: v.optional(v.string()),
    type: v.union(v.literal("direct"), v.literal("group")),
    participantIds: v.array(v.id("users")),
    adminIds: v.array(v.id("users")),
    imageUrl: v.optional(v.string()),
    lastMessageAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_participant", ["participantIds"])
    .index("by_last_message", ["lastMessageAt"]),
});
```

#### Advanced Schema Patterns

```typescript
// Complex nested objects
export default defineSchema({
  projects: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    settings: v.object({
      visibility: v.union(v.literal("public"), v.literal("private")),
      allowComments: v.boolean(),
      notifications: v.object({
        email: v.boolean(),
        push: v.boolean(),
        frequency: v.union(
          v.literal("instant"),
          v.literal("daily"),
          v.literal("weekly")
        ),
      }),
    }),
    metadata: v.object({
      tags: v.array(v.string()),
      category: v.string(),
      customFields: v.record(v.string(), v.any()),
    }),
    stats: v.object({
      viewCount: v.number(),
      likeCount: v.number(),
      commentCount: v.number(),
    }),
  })
    .index("by_owner", ["ownerId"])
    .index("by_visibility", ["settings.visibility"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    assigneeId: v.optional(v.id("users")),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    dueDate: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    dependencies: v.array(v.id("tasks")),
    attachments: v.array(
      v.object({
        fileId: v.id("_storage"),
        fileName: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
        uploadedAt: v.number(),
      })
    ),
    comments: v.array(
      v.object({
        userId: v.id("users"),
        content: v.string(),
        createdAt: v.number(),
      })
    ),
  })
    .index("by_project", ["projectId", "status"])
    .index("by_assignee", ["assigneeId", "status"])
    .index("by_status", ["status", "priority"])
    .index("by_due_date", ["dueDate"])
    .searchIndex("search_tasks", {
      searchField: "title",
      filterFields: ["projectId", "status", "assigneeId"],
    }),
});
```

#### Validator Helpers

```typescript
// convex/validators.ts
import { v } from "convex/values";

// Reusable validators
export const timestampValidator = v.number();
export const urlValidator = v.string();
export const emailValidator = v.string();

export const userStatusValidator = v.union(
  v.literal("active"),
  v.literal("away"),
  v.literal("busy"),
  v.literal("offline")
);

export const paginationValidator = v.object({
  numItems: v.number(),
  cursor: v.optional(v.string()),
});

export const sortOrderValidator = v.union(v.literal("asc"), v.literal("desc"));

export const dateRangeValidator = v.object({
  start: v.number(),
  end: v.number(),
});

// Type extraction
export type PaginationArgs = typeof paginationValidator.type;
export type SortOrder = typeof sortOrderValidator.type;
```

### 2. Queries & Real-time

Convex queries are automatically reactive and cached. When data changes, all subscribed clients receive updates instantly.

#### Basic Queries

```typescript
// convex/messages.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

// Simple query
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").take(100);
  },
});

// Query with arguments
export const getByConversation = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(limit);
  },
});

// Query with filtering
export const getUnread = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return messages.filter((msg) => !msg.readBy.includes(args.userId));
  },
});
```

#### Advanced Query Patterns

```typescript
// Pagination with cursor
export const getPaginated = query({
  args: {
    conversationId: v.id("conversations"),
    paginationOpts: paginationValidator,
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: await Promise.all(
        results.page.map(async (msg) => {
          const sender = await ctx.db.get(msg.senderId);
          return {
            ...msg,
            sender: sender
              ? {
                  id: sender._id,
                  name: sender.name,
                  imageUrl: sender.imageUrl,
                }
              : null,
          };
        })
      ),
    };
  },
});

// Full-text search
export const search = query({
  args: {
    conversationId: v.id("conversations"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm) return [];

    return await ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q) =>
        q
          .search("content", args.searchTerm)
          .eq("conversationId", args.conversationId)
          .eq("isDeleted", false)
      )
      .take(50);
  },
});

// Aggregation query
export const getStats = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const stats = {
      total: messages.length,
      byType: {
        text: 0,
        image: 0,
        file: 0,
      },
      byUser: new Map<string, number>(),
      averageLength: 0,
      totalReactions: 0,
    };

    let totalLength = 0;
    for (const msg of messages) {
      stats.byType[msg.type]++;
      const userCount = stats.byUser.get(msg.senderId) ?? 0;
      stats.byUser.set(msg.senderId, userCount + 1);
      totalLength += msg.content.length;
      stats.totalReactions += msg.reactions.length;
    }

    stats.averageLength = messages.length > 0 ? totalLength / messages.length : 0;

    return {
      ...stats,
      byUser: Object.fromEntries(stats.byUser),
    };
  },
});

// Joining data
export const getWithDetails = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const participants = await Promise.all(
      conversation.participantIds.map((id) => ctx.db.get(id))
    );

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(50);

    const messagesWithSenders = await Promise.all(
      messages.map(async (msg) => ({
        ...msg,
        sender: await ctx.db.get(msg.senderId),
      }))
    );

    return {
      ...conversation,
      participants: participants.filter((p) => p !== null),
      recentMessages: messagesWithSenders,
    };
  },
});
```

#### Frontend Integration with Next.js

```typescript
// app/chat/[id]/page.tsx
"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef } from "react";

export default function ChatPage({ params }: { params: { id: string } }) {
  const conversationId = params.id as Id<"conversations">;
  const bottomRef = useRef<HTMLDivElement>(null);

  // Real-time query - auto-updates when messages change
  const messages = useQuery(api.messages.getByConversation, {
    conversationId,
    limit: 50,
  });

  // Stats query
  const stats = useQuery(api.messages.getStats, { conversationId });

  // Paginated query
  const {
    results: paginatedMessages,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.messages.getPaginated,
    { conversationId },
    { initialNumItems: 20 }
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages === undefined) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <h1>Chat</h1>
        {stats && (
          <div className="text-sm text-gray-600">
            {stats.total} messages
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {status === "CanLoadMore" && (
          <button onClick={() => loadMore(20)} className="w-full mb-4">
            Load More
          </button>
        )}

        {messages.map((msg) => (
          <div key={msg._id} className="mb-4">
            <div className="font-semibold">{msg.senderId}</div>
            <div>{msg.content}</div>
            <div className="text-xs text-gray-500">
              {new Date(msg.createdAt).toLocaleString()}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
```

### 3. Mutations

Mutations modify data and automatically invalidate affected queries, triggering real-time updates.

#### Basic Mutations

```typescript
// convex/messages.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create message
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      type: args.type,
      fileUrl: args.fileUrl,
      fileName: args.fileName,
      fileSize: args.fileSize,
      isEdited: false,
      isDeleted: false,
      reactions: [],
      readBy: [args.senderId],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update conversation last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

// Update message
export const edit = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
      isEdited: true,
      updatedAt: Date.now(),
    });
  },
});

// Delete message (soft delete)
export const remove = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      content: "[Message deleted]",
      updatedAt: Date.now(),
    });
  },
});
```

#### Advanced Mutation Patterns

```typescript
// Add reaction
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (r) => r.userId === args.userId && r.emoji === args.emoji
    );

    if (existingReaction) {
      // Remove reaction if already exists
      await ctx.db.patch(args.messageId, {
        reactions: message.reactions.filter(
          (r) => !(r.userId === args.userId && r.emoji === args.emoji)
        ),
      });
    } else {
      // Add new reaction
      await ctx.db.patch(args.messageId, {
        reactions: [...message.reactions, { userId: args.userId, emoji: args.emoji }],
      });
    }
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Batch update all unread messages
    const unreadMessages = messages.filter((msg) => !msg.readBy.includes(args.userId));

    await Promise.all(
      unreadMessages.map((msg) =>
        ctx.db.patch(msg._id, {
          readBy: [...msg.readBy, args.userId],
        })
      )
    );

    return unreadMessages.length;
  },
});

// Transaction-like pattern
export const createConversationWithMessage = mutation({
  args: {
    participantIds: v.array(v.id("users")),
    firstMessage: v.string(),
    senderId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Create conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: "direct",
      participantIds: args.participantIds,
      adminIds: [args.senderId],
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create first message
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId: args.senderId,
      content: args.firstMessage,
      type: "text",
      isEdited: false,
      isDeleted: false,
      reactions: [],
      readBy: [args.senderId],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { conversationId, messageId };
  },
});
```

### 4. Actions & HTTP

Actions can call external APIs, perform long-running operations, and make HTTP requests.

#### Basic Actions

```typescript
// convex/actions.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// HTTP request action
export const fetchUserData = action({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch(
      `https://api.example.com/users/${args.userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const data = await response.json();

    // Store in Convex
    await ctx.runMutation(api.users.upsert, {
      externalId: data.id,
      name: data.name,
      email: data.email,
    });

    return data;
  },
});

// Send email action
export const sendNotificationEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: args.to }] }],
        from: { email: "noreply@example.com" },
        subject: args.subject,
        content: [{ type: "text/html", value: args.body }],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return { success: true };
  },
});
```

### 5. Authentication

Convex integrates seamlessly with Clerk, Auth0, and other auth providers through identity tokens.

#### Clerk Integration

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
```

```typescript
// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create user from Clerk
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

// Sync user on first login
export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: identity.name ?? "Unknown",
        email: identity.email ?? "",
        imageUrl: identity.pictureUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name ?? "Unknown",
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl,
      isOnline: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});
```

### 6. File Storage

Convex provides built-in file storage with automatic CDN distribution and integration with queries/mutations.

#### File Upload

```typescript
// convex/files.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save file metadata after upload
export const saveFileMetadata = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      conversationId: args.conversationId,
      uploadedAt: Date.now(),
    });

    return fileId;
  },
});

// Get file URL
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Delete file
export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);

    if (!file) throw new Error("File not found");

    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(args.fileId);
  },
});
```

## Real-World Examples

### Example 1: Real-time Chat App

A complete real-time chat application with typing indicators and read receipts.

```typescript
// Typing indicators
export const startTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ctx.db.patch(user._id, {
      typingIn: args.conversationId,
    });
  },
});

export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u.typingIn === args.conversationId);
  },
});
```

### Example 2: Task Management System

A collaborative task management system with real-time updates and assignments.

```typescript
// convex/tasks.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    assigneeId: v.optional(v.id("users")),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      ...args,
      status: "backlog",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return taskId;
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const getByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return await Promise.all(
      tasks.map(async (task) => ({
        ...task,
        assignee: task.assigneeId ? await ctx.db.get(task.assigneeId) : null,
      }))
    );
  },
});
```

## Related Skills

- **react-advanced**: Build complex React UIs with Convex real-time data
- **nextjs-expert**: Integrate Convex with Next.js App Router
- **typescript-advanced-types**: Leverage Convex's generated TypeScript types
- **auth-patterns**: Implement authentication with Clerk or Auth0
- **websocket-patterns**: Understand real-time alternatives to Convex
- **database-design**: Apply schema design principles to Convex tables

## Further Reading

- [Convex Official Documentation](https://docs.convex.dev/)
- [Convex with Next.js Guide](https://docs.convex.dev/quickstart/nextjs)
- [Convex Auth Integration](https://docs.convex.dev/auth)
- [Real-time Database Patterns](https://docs.convex.dev/database/reading-data)
- [Convex File Storage](https://docs.convex.dev/file-storage)
- [Convex Actions & HTTP](https://docs.convex.dev/functions/actions)
- [Schema Design Best Practices](https://docs.convex.dev/database/schemas)
- [Optimistic Updates Pattern](https://docs.convex.dev/client/react/optimistic-updates)
- [Convex GitHub Examples](https://github.com/get-convex/convex-demos)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
