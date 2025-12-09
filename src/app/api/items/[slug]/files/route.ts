import { NextResponse } from "next/server";
import { getItemBySlug } from "@/lib/registry";
import { z } from "zod";

const SlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Invalid slug format");

// Security constants
const ALLOWED_EXTENSIONS = [
  ".md",
  ".ts",
  ".tsx",
  ".json",
  ".js",
  ".yaml",
  ".yml",
  ".txt",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const FETCH_TIMEOUT = 10000; // 10 seconds
const ALLOWED_PATH_PREFIX = "claude/";

function isValidFilePath(filePath: string): boolean {
  // Reject path traversal attempts
  if (filePath.includes("..")) return false;
  if (filePath.includes("//")) return false;
  if (filePath.startsWith("/")) return false;

  // Check extension
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
    filePath.endsWith(ext),
  );
  if (!hasValidExtension) return false;

  return true;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Validate slug
  const parseResult = SlugSchema.safeParse(slug);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
  }

  const item = getItemBySlug(parseResult.data);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  try {
    const files: { path: string; content: string }[] = [];

    // Get the base URL from the request and validate it
    const requestUrl = new URL(request.url);
    const baseUrl = requestUrl.origin;

    // Validate origin is the same host (prevent SSRF)
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://gicm.dev",
      "https://www.gicm.dev",
      process.env.NEXT_PUBLIC_BASE_URL,
    ].filter(Boolean);

    if (
      !allowedOrigins.some((origin) => baseUrl.startsWith(origin as string))
    ) {
      console.warn(`Blocked request from unexpected origin: ${baseUrl}`);
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 },
      );
    }

    for (const filePath of item.files || []) {
      // Validate file path for security
      const publicPath = filePath.replace(".claude/", "claude/");

      if (!isValidFilePath(publicPath)) {
        console.warn(`Skipping invalid file path: ${filePath}`);
        continue;
      }

      // Ensure path stays within allowed prefix
      if (!publicPath.startsWith(ALLOWED_PATH_PREFIX)) {
        console.warn(`Skipping file outside allowed prefix: ${filePath}`);
        continue;
      }

      try {
        const publicUrl = `${baseUrl}/${publicPath}`;

        // Validate URL structure
        const fetchUrl = new URL(publicUrl);
        if (fetchUrl.origin !== baseUrl) {
          console.warn(`URL origin mismatch: ${publicUrl}`);
          continue;
        }

        // Fetch with timeout and no redirect following
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(publicUrl, {
          signal: controller.signal,
          redirect: "error", // Don't follow redirects
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Check content length before reading
        const contentLength = response.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
          console.warn(`File too large: ${filePath} (${contentLength} bytes)`);
          continue;
        }

        // Verify content type is text-based
        const contentType = response.headers.get("content-type") || "";
        if (
          !contentType.includes("text/") &&
          !contentType.includes("application/json") &&
          !contentType.includes("application/javascript")
        ) {
          console.warn(`Invalid content type for ${filePath}: ${contentType}`);
          continue;
        }

        const content = await response.text();

        // Double-check size after reading
        if (content.length > MAX_FILE_SIZE) {
          console.warn(`File content too large: ${filePath}`);
          continue;
        }

        // Extract relative path after .claude/
        const relativePath = filePath.split(".claude/")[1] || filePath;

        files.push({
          path: relativePath,
          content,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.warn(`Fetch timeout for file: ${filePath}`);
        } else {
          console.warn(`Could not fetch file: ${filePath}`, error);
        }
        // Continue with other files
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files found for this item" },
        { status: 404 },
      );
    }

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error reading files:", error);
    return NextResponse.json(
      { error: "Failed to read files" },
      { status: 500 },
    );
  }
}

export const runtime = "edge";
