/**
 * gICM API Route Example
 * Demonstrates proper API route structure with Zod validation
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// ============================================
// Schema Definitions (always at top)
// ============================================

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  category: z.enum(["automation", "analysis", "generation", "integration"]),
  price: z.number().min(0, "Price cannot be negative"),
  features: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================
// GET Handler
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    // Initialize Supabase client
    const supabase = createClient();

    // Build query with filters
    let query = supabase
      .from("agents")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    // Apply optional filters
    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
      );
    }

    if (params.category) {
      query = query.eq("category", params.category);
    }

    if (params.minPrice !== undefined) {
      query = query.gte("price", params.minPrice);
    }

    if (params.maxPrice !== undefined) {
      query = query.lte("price", params.maxPrice);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch agents" },
        { status: 500 }
      );
    }

    // Return paginated response
    return NextResponse.json({
      data,
      meta: {
        total: count ?? 0,
        limit: params.limit,
        offset: params.offset,
        hasMore: (count ?? 0) > params.offset + params.limit,
      },
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid parameters",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// POST Handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const data = createAgentSchema.parse(body);

    // Initialize Supabase client
    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Insert new agent
    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        ...data,
        slug,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "An agent with this name already exists" },
          { status: 409 }
        );
      }

      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create agent" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: agent }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
