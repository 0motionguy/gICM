import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * Agent Detail API — GET /api/agents/[agentId]
 *
 * Get details for a specific registered agent.
 */

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

const AGENTS_FILE = path.join(process.cwd(), "data", "agents.json");

async function readAgents(): Promise<RegisteredAgent[]> {
  try {
    const data = await fs.readFile(AGENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const agents = await readAgents();
    const agent = agents.find((a) => a.id === agentId);

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found", id: agentId },
        {
          status: 404,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    return NextResponse.json(
      { agent },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Agent detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export const runtime = "nodejs";
