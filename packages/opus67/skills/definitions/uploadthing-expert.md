# UploadThing Expert

> **ID:** `uploadthing-expert`
> **Tier:** 2
> **Token Cost:** 5000
> **MCP Connections:** None

## What This Skill Does

This skill provides comprehensive expertise in implementing file uploads with UploadThing, a modern file upload service designed for Next.js applications. It covers everything from basic setup to advanced patterns including presigned URLs, image optimization, server-side processing, and database integration with Prisma.

UploadThing simplifies file uploads by handling:
- Infrastructure (storage, CDN, processing)
- Security (signed URLs, access control)
- Type-safety (end-to-end TypeScript)
- Optimization (image transformations, thumbnails)
- Progress tracking and error handling

## When to Use

Use this skill when you need to:

- **Set up file uploads** in a Next.js application (App Router or Pages Router)
- **Implement upload UI** with pre-built or custom components
- **Process files server-side** after upload completion
- **Manage uploaded files** (list, delete, generate URLs)
- **Optimize images** with automatic transformations
- **Integrate uploads with your database** (Prisma, Drizzle, etc.)
- **Build custom upload flows** with presigned URLs
- **Handle multiple file types** with different configurations
- **Implement user-specific uploads** with metadata and access control
- **Debug upload issues** or optimize performance

## Core Capabilities

### 1. File Router Setup

The file router is the heart of UploadThing configuration. It defines upload endpoints with specific rules.

#### Installation and Configuration

\`\`\`bash
npm install uploadthing @uploadthing/react
\`\`\`

\`\`\`typescript
// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  profilePicture: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.userId },
        data: { profileImage: file.url },
      });
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
\`\`\`

### 2. Upload Components

UploadThing provides pre-built React components and hooks for easy integration.

\`\`\`typescript
// src/components/upload-button.tsx
"use client";

import { UploadButton } from "@/lib/uploadthing";

export function SimpleUploadButton() {
  return (
    <UploadButton
      endpoint="profilePicture"
      onClientUploadComplete={(res) => {
        console.log("Files:", res);
        alert("Upload Completed");
      }}
      onUploadError={(error: Error) => {
        alert(\`ERROR! \${error.message}\`);
      }}
    />
  );
}
\`\`\`

### 3. Server-Side Handling

Server-side processing happens in the file router's \`onUploadComplete\` callback.

\`\`\`typescript
// Server actions
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteFile(fileKey: string) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  const file = await prisma.document.findFirst({
    where: { fileKey, userId: user.id },
  });

  if (!file) throw new Error("File not found");

  await utapi.deleteFiles(fileKey);
  await prisma.document.delete({
    where: { id: file.id },
  });

  return { success: true };
}
\`\`\`

### 4. File Management

Managing uploaded files programmatically with the UTApi.

\`\`\`typescript
// src/lib/uploadthing-server.ts
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi({
  apiKey: process.env.UPLOADTHING_SECRET,
});

// Delete files
await utapi.deleteFiles(fileKey);

// List files
const files = await utapi.listFiles();
\`\`\`

### 5. Presigned URLs

For advanced upload flows, generate presigned URLs for direct uploads.

\`\`\`typescript
// Generate presigned URL
const presignedUrl = await utapi.getPresignedUrl({
  fileName,
  fileType,
  metadata: {
    userId: user.id,
    uploadedAt: new Date().toISOString(),
  },
});
\`\`\`

### 6. Image Optimization

UploadThing provides automatic image optimization and transformations.

\`\`\`typescript
// src/lib/image-utils.ts
export function getOptimizedImageUrl(
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpg" | "png";
    fit?: "contain" | "cover" | "fill" | "inside" | "outside";
  } = {}
) {
  const url = new URL(baseUrl);
  const params = new URLSearchParams();

  if (options.width) params.set("w", options.width.toString());
  if (options.height) params.set("h", options.height.toString());
  if (options.quality) params.set("q", options.quality.toString());
  if (options.format) params.set("f", options.format);
  if (options.fit) params.set("fit", options.fit);

  url.search = params.toString();
  return url.toString();
}

export function getThumbnailUrl(baseUrl: string, size: number = 200) {
  return getOptimizedImageUrl(baseUrl, {
    width: size,
    height: size,
    fit: "cover",
    quality: 80,
    format: "webp",
  });
}
\`\`\`

## Real-World Examples

### Example 1: Profile Picture Upload with Crop

Complete implementation of profile picture upload with image cropping featuring react-image-crop, real-time preview, database integration, and automatic cleanup of old images.

**Key Features:**
- Client-side image cropping before upload
- Database integration with Prisma
- Automatic deletion of old profile pictures
- Optimized image loading with thumbnails
- User feedback with toast notifications

### Example 2: Multi-File Document Upload

Complete document management system with drag-and-drop upload, progress tracking, file listing, and deletion capabilities.

**Key Features:**
- Batch file upload with progress tracking
- File type validation and size limits
- Database-backed file management
- Download and preview functionality
- Secure file deletion with ownership verification

## Related Skills

- **next-app-router** - Next.js App Router patterns and server components
- **prisma-expert** - Database schema design and queries with Prisma
- **react-hook-form-expert** - Form handling with validation
- **tailwind-expert** - Styling upload components
- **zod-expert** - Input validation for upload endpoints

## Further Reading

- [UploadThing Documentation](https://docs.uploadthing.com)
- [UploadThing GitHub](https://github.com/pingdotgg/uploadthing)
- [File Upload Best Practices](https://docs.uploadthing.com/getting-started/best-practices)
- [Image Optimization Guide](https://docs.uploadthing.com/api-reference/image-optimization)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
