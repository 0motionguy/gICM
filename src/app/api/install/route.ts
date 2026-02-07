import { NextResponse } from "next/server";
import { getAllItems } from "@/lib/registry";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item } = body;

    if (!item || typeof item !== "string") {
      return NextResponse.json(
        { error: 'Item parameter is required (format: "category/slug")' },
        { status: 400 }
      );
    }

    // Parse item identifier
    const parts = item.split("/");
    if (parts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid item format. Use "category/slug"' },
        { status: 400 }
      );
    }

    const [category, slug] = parts;

    // Find item in registry
    const allItems = getAllItems();
    const foundItem = allItems.find((i) => i.id === slug || i.id === item);

    if (!foundItem) {
      return NextResponse.json(
        { error: `Item "${item}" not found in marketplace` },
        { status: 404 }
      );
    }

    // Check security status
    if (
      foundItem.security?.threatLevel === "critical" ||
      foundItem.security?.threatLevel === "high"
    ) {
      return NextResponse.json(
        {
          error: "Installation blocked",
          reason: `Item has ${foundItem.security.threatLevel} threat level`,
          security: foundItem.security,
        },
        { status: 403 }
      );
    }

    // Return installation instructions
    const response = {
      success: true,
      item: {
        id: foundItem.id,
        name: foundItem.name,
        category: foundItem.kind,
        description: foundItem.description,
      },
      installation: {
        method: "cli",
        command: `npx @clawdbot/cli add ${foundItem.id}`,
        alternativeCommands: [
          `pnpm dlx @clawdbot/cli add ${foundItem.id}`,
          `bunx @clawdbot/cli add ${foundItem.id}`,
        ],
      },
      source: foundItem.source || "https://clawdbot.com",
      security: foundItem.security || {
        threatLevel: "none",
        securityScore: 100,
      },
      requirements: foundItem.tags || [],
      documentation: `https://clawdbot.com/item/${foundItem.id}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Install API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export const runtime = "nodejs";
