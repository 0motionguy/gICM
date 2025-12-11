import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { REGISTRY, getItemsByKind } from "@/lib/registry";
import type { RegistryItem, ItemKind } from "@/types/registry";

// ============================================================================
// Registry API - GET /api/registry
// Returns registry items with filtering, pagination, and v2 field support
// ============================================================================

// Query parameter schemas
const SourceSchema = z.enum([
  "anthropic-official",
  "community",
  "verified",
  "all",
]);

const ItemKindQuerySchema = z.enum([
  "agent",
  "skill",
  "command",
  "mcp",
  "setting",
  "workflow",
  "component",
]);

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

const FiltersSchema = z.object({
  kind: ItemKindQuerySchema.optional(),
  source: SourceSchema.optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  platform: z.enum(["claude", "gemini", "openai"]).optional(),
  hasSkillId: z.coerce.boolean().optional(),
  hasProgressiveDisclosure: z.coerce.boolean().optional(),
  auditStatus: z
    .enum(["VERIFIED", "NEEDS_FIX", "FLAGGED", "DEPRECATED"])
    .optional(),
});

// Response types
interface RegistryResponse {
  items: RegistryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  stats: {
    byKind: Record<string, number>;
    bySource: {
      verified: number;
      community: number;
    };
    withV2Fields: number;
  };
}

/**
 * Filters items based on source type.
 */
function filterBySource(
  items: RegistryItem[],
  source: z.infer<typeof SourceSchema>
): RegistryItem[] {
  switch (source) {
    case "anthropic-official":
      // Items with official audit status and high quality
      return items.filter(
        (item) =>
          item.audit?.status === "VERIFIED" && item.audit.qualityScore >= 90
      );
    case "verified":
      // Any verified item
      return items.filter((item) => item.audit?.status === "VERIFIED");
    case "community":
      // Not verified or lower quality score
      return items.filter(
        (item) => !item.audit || item.audit.status !== "VERIFIED"
      );
    case "all":
    default:
      return items;
  }
}

/**
 * Calculates registry statistics.
 */
function calculateStats(items: RegistryItem[]): RegistryResponse["stats"] {
  const byKind: Record<string, number> = {};

  for (const item of items) {
    byKind[item.kind] = (byKind[item.kind] || 0) + 1;
  }

  const verified = items.filter(
    (item) => item.audit?.status === "VERIFIED"
  ).length;
  const community = items.length - verified;

  const withV2Fields = items.filter(
    (item) => item.skillId || item.progressiveDisclosure || item.codeExecution
  ).length;

  return {
    byKind,
    bySource: { verified, community },
    withV2Fields,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if this is a simple request (no params) - return full registry for backward compatibility
    if (searchParams.toString() === "") {
      return NextResponse.json(REGISTRY);
    }

    // Parse pagination
    const paginationResult = PaginationSchema.safeParse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 100,
    });

    if (!paginationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid pagination parameters",
          details: paginationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { page, limit } = paginationResult.data;

    // Parse filters
    const filtersResult = FiltersSchema.safeParse({
      kind: searchParams.get("kind") ?? undefined,
      source: searchParams.get("source") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      platform: searchParams.get("platform") ?? undefined,
      hasSkillId: searchParams.get("hasSkillId") ?? undefined,
      hasProgressiveDisclosure:
        searchParams.get("hasProgressiveDisclosure") ?? undefined,
      auditStatus: searchParams.get("auditStatus") ?? undefined,
    });

    if (!filtersResult.success) {
      return NextResponse.json(
        {
          error: "Invalid filter parameters",
          details: filtersResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const filters = filtersResult.data;

    // Start with all items or filtered by kind
    let items: RegistryItem[] = filters.kind
      ? getItemsByKind(filters.kind as ItemKind)
      : [...REGISTRY];

    // Apply source filter
    if (filters.source) {
      items = filterBySource(items, filters.source);
    }

    // Apply category filter
    if (filters.category) {
      items = items.filter(
        (item) =>
          item.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // Apply tag filter
    if (filters.tag) {
      items = items.filter((item) =>
        item.tags.some((t) =>
          t.toLowerCase().includes(filters.tag!.toLowerCase())
        )
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.tags.some((t) => t.toLowerCase().includes(searchLower)) ||
          item.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply platform filter
    if (filters.platform) {
      items = items.filter(
        (item) => item.platforms?.includes(filters.platform!) ?? false
      );
    }

    // Apply v2 field filters
    if (filters.hasSkillId !== undefined) {
      items = items.filter((item) => !!item.skillId === filters.hasSkillId);
    }

    if (filters.hasProgressiveDisclosure !== undefined) {
      items = items.filter(
        (item) =>
          !!item.progressiveDisclosure === filters.hasProgressiveDisclosure
      );
    }

    // Apply audit status filter
    if (filters.auditStatus) {
      items = items.filter(
        (item) => item.audit?.status === filters.auditStatus
      );
    }

    // Calculate statistics before pagination
    const stats = calculateStats(items);

    // Calculate pagination
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);

    const response: RegistryResponse = {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/registry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
