import { NextResponse } from "next/server";
import { REGISTRY, resolveDependencies } from "@/lib/registry";
import { z } from "zod";

const BundleRequestSchema = z.object({
  itemIds: z.array(z.string().min(1).max(100)).min(1).max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const parseResult = BundleRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { itemIds } = parseResult.data;

    // Get items from registry
    const items = itemIds
      .map((id) => REGISTRY.find((item) => item.id === id))
      .filter(Boolean);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No valid items found" },
        { status: 404 },
      );
    }

    // Resolve all dependencies
    const allItemIds = items.flatMap((item) =>
      item ? resolveDependencies([item.id]).map((i) => i.id) : [],
    );
    const uniqueIds = Array.from(new Set(allItemIds));
    const allItems = uniqueIds
      .map((id) => REGISTRY.find((item) => item.id === id))
      .filter(Boolean);

    // Generate install command
    const command = `npx @gicm/cli add ${allItems.map((item) => `${item!.kind}/${item!.slug}`).join(" ")}`;

    // Calculate stats
    const stats = {
      selectedCount: items.length,
      totalCount: allItems.length,
      dependencyCount: allItems.length - items.length,
      tokenSavings: allItems.reduce(
        (sum, item) => sum + (item!.tokenSavings || 0),
        0,
      ),
      byKind: {
        agent: allItems.filter((i) => i!.kind === "agent").length,
        skill: allItems.filter((i) => i!.kind === "skill").length,
        command: allItems.filter((i) => i!.kind === "command").length,
        mcp: allItems.filter((i) => i!.kind === "mcp").length,
      },
    };

    return NextResponse.json({
      command,
      items: allItems,
      stats,
    });
  } catch (error) {
    console.error("Bundle generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate bundle" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
