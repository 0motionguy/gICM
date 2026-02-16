import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * Agent Search API — GET /api/agents/search
 *
 * Full-text search across registered agents with advanced filtering.
 * Security: Input validation, sanitization, rate limiting ready.
 *
 * Example: GET /api/agents/search?q=defi&skills=trading,analysis&verified=true
 */

// ============================================================================
// Types
// ============================================================================

interface RegisteredAgent {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  agentCard?: string;
  skills: string[];
  owner: string;
  verified: boolean;
  registeredAt: string;
}

interface SearchResult {
  agent: RegisteredAgent;
  score: number;
  matchedFields: string[];
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
  limit: number;
  offset: number;
  success: true;
}

interface ErrorResponse {
  error: string;
  code: string;
  success: false;
}

// ============================================================================
// Constants
// ============================================================================

const AGENTS_FILE = path.join(process.cwd(), "data", "agents.json");
const MAX_QUERY_LENGTH = 200;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

// Rate limiting configuration (implement with Redis/Upstash in production)
// SECURITY: Currently headers-only; integrate with middleware for enforcement
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
};

// ============================================================================
// Security Helpers
// ============================================================================

/**
 * Sanitize search query to prevent ReDoS and injection
 * SECURITY: Removes special regex characters and limits length
 */
function sanitizeQuery(query: string): string {
  return query
    .slice(0, MAX_QUERY_LENGTH)
    .replace(/[.*+?^${}()|[\]\\]/g, "") // Remove regex special chars
    .trim()
    .toLowerCase();
}

/**
 * Validate and parse limit parameter
 * SECURITY: Prevents DoS via unbounded memory allocation (ref: qs vulnerability)
 */
function parseLimit(value: string | null): number {
  const parsed = parseInt(value || String(DEFAULT_LIMIT), 10);
  if (isNaN(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

/**
 * Validate and parse offset parameter
 * SECURITY: Prevents negative offset exploitation
 */
function parseOffset(value: string | null): number {
  const parsed = parseInt(value || "0", 10);
  if (isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}

/**
 * Parse skills filter (comma-separated)
 * SECURITY: Limits number of skills to prevent array-based DoS
 */
function parseSkills(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .slice(0, 10) // Max 10 skill filters
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// ============================================================================
// Data Access
// ============================================================================

async function readAgents(): Promise<RegisteredAgent[]> {
  try {
    const data = await fs.readFile(AGENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// ============================================================================
// Search Logic
// ============================================================================

function searchAgents(
  agents: RegisteredAgent[],
  query: string,
  skillsFilter: string[],
  verifiedOnly: boolean
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const agent of agents) {
    // Apply verified filter
    if (verifiedOnly && !agent.verified) continue;

    // Apply skills filter
    if (skillsFilter.length > 0) {
      const agentSkillsLower = agent.skills.map((s) => s.toLowerCase());
      const hasMatchingSkill = skillsFilter.some((sf) =>
        agentSkillsLower.some((as) => as.includes(sf))
      );
      if (!hasMatchingSkill) continue;
    }

    // Calculate search score
    const matchedFields: string[] = [];
    let score = 0;

    const nameLower = agent.name.toLowerCase();
    const descLower = agent.description.toLowerCase();
    const skillsJoined = agent.skills.join(" ").toLowerCase();

    if (nameLower.includes(query)) {
      score += 10;
      matchedFields.push("name");
    }
    if (descLower.includes(query)) {
      score += 5;
      matchedFields.push("description");
    }
    if (skillsJoined.includes(query)) {
      score += 3;
      matchedFields.push("skills");
    }

    // Boost verified agents
    if (agent.verified) score += 2;

    if (score > 0 || !query) {
      results.push({ agent, score: query ? score : 1, matchedFields });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

// ============================================================================
// CORS Headers
// ============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  "Access-Control-Max-Age": "86400",
};

// ============================================================================
// Route Handlers
// ============================================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<SearchResponse | ErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    // Extract and validate parameters
    const rawQuery = searchParams.get("q") || "";
    const query = sanitizeQuery(rawQuery);
    const limit = parseLimit(searchParams.get("limit"));
    const offset = parseOffset(searchParams.get("offset"));
    const skills = parseSkills(searchParams.get("skills"));
    const verified = searchParams.get("verified") === "true";

    // SECURITY: Require minimum query length to prevent full-table scans
    // Allow empty query only with other filters
    if (!query && skills.length === 0 && !verified) {
      return NextResponse.json(
        {
          error: "Search query or filters required",
          code: "INVALID_REQUEST",
          success: false as const,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Load and search agents
    const agents = await readAgents();
    const searchResults = searchAgents(agents, query, skills, verified);
    const total = searchResults.length;
    const paged = searchResults.slice(offset, offset + limit);

    const response: SearchResponse = {
      results: paged,
      query: rawQuery.slice(0, MAX_QUERY_LENGTH),
      total,
      limit,
      offset,
      success: true,
    };

    return NextResponse.json(response, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        // Rate limiting headers (informational; enforce via middleware)
        "X-RateLimit-Limit": String(RATE_LIMIT.maxRequests),
        "X-RateLimit-Remaining": String(RATE_LIMIT.maxRequests - 1),
        "X-RateLimit-Reset": String(Date.now() + RATE_LIMIT.windowMs),
        "X-Agent-Discovery": "enabled",
      },
    });
  } catch (error) {
    console.error("Agent search error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        success: false as const,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export const runtime = "nodejs";
