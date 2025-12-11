import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { REGISTRY, getItemsByKind } from "@/lib/registry";
import type { RegistryItem } from "@/types/registry";

// ============================================================================
// Skills API - GET /api/skills
// Lists all skills with filtering, pagination, and metadata
// ============================================================================

// Query parameter schemas
const SourceSchema = z.enum([
  "anthropic-official",
  "community",
  "verified",
  "all",
]);

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const FiltersSchema = z.object({
  source: SourceSchema.optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  hasProgressiveDisclosure: z.coerce.boolean().optional(),
  hasCodeExecution: z.coerce.boolean().optional(),
  platform: z.enum(["claude", "gemini", "openai"]).optional(),
});

// Response types
interface SkillMetadata {
  id: string;
  skillId?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  version?: string;
  tokenSavings?: number;
  progressiveDisclosure?: RegistryItem["progressiveDisclosure"];
  platforms?: ("claude" | "gemini" | "openai")[];
  audit?: RegistryItem["audit"];
}

interface SkillsListResponse {
  skills: SkillMetadata[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Extracts skill metadata from a registry item.
 * Returns only the fields needed for skill discovery.
 */
function toSkillMetadata(item: RegistryItem): SkillMetadata {
  return {
    id: item.id,
    skillId: item.skillId,
    name: item.name,
    slug: item.slug,
    description: item.description,
    category: item.category,
    tags: item.tags,
    version: item.version,
    tokenSavings: item.tokenSavings,
    progressiveDisclosure: item.progressiveDisclosure,
    platforms: item.platforms,
    audit: item.audit,
  };
}

/**
 * Filters skills based on source type.
 */
function filterBySource(
  skills: RegistryItem[],
  source: z.infer<typeof SourceSchema>
): RegistryItem[] {
  switch (source) {
    case "anthropic-official":
      // Skills with official audit status
      return skills.filter(
        (s) => s.audit?.status === "VERIFIED" && s.audit.qualityScore >= 90
      );
    case "verified":
      // Any verified skill
      return skills.filter((s) => s.audit?.status === "VERIFIED");
    case "community":
      // Not verified or lower quality score
      return skills.filter((s) => !s.audit || s.audit.status !== "VERIFIED");
    case "all":
    default:
      return skills;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination
    const paginationResult = PaginationSchema.safeParse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
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
      source: searchParams.get("source") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      hasProgressiveDisclosure:
        searchParams.get("hasProgressiveDisclosure") ?? undefined,
      hasCodeExecution: searchParams.get("hasCodeExecution") ?? undefined,
      platform: searchParams.get("platform") ?? undefined,
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

    // Get all skills
    let skills = getItemsByKind("skill");

    // Apply source filter
    if (filters.source) {
      skills = filterBySource(skills, filters.source);
    }

    // Apply category filter
    if (filters.category) {
      skills = skills.filter(
        (s) => s.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // Apply tag filter
    if (filters.tag) {
      skills = skills.filter((s) =>
        s.tags.some((t) => t.toLowerCase().includes(filters.tag!.toLowerCase()))
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      skills = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower) ||
          s.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    // Apply progressive disclosure filter
    if (filters.hasProgressiveDisclosure !== undefined) {
      skills = skills.filter(
        (s) => !!s.progressiveDisclosure === filters.hasProgressiveDisclosure
      );
    }

    // Apply code execution filter
    if (filters.hasCodeExecution !== undefined) {
      skills = skills.filter(
        (s) => !!s.codeExecution === filters.hasCodeExecution
      );
    }

    // Apply platform filter
    if (filters.platform) {
      skills = skills.filter(
        (s) => s.platforms?.includes(filters.platform!) ?? false
      );
    }

    // Calculate pagination
    const total = skills.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedSkills = skills.slice(offset, offset + limit);

    const response: SkillsListResponse = {
      skills: paginatedSkills.map(toSkillMetadata),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/skills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
