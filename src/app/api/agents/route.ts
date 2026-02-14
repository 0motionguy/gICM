import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * Agent Discovery API — GET /api/agents
 *
 * Discover registered agents. Filter by skill, verified status.
 * Example: GET /api/agents?skill=defi&verified=true
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");
    const verified = searchParams.get("verified");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100
    );
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let agents = await readAgents();

    // Filter by skill
    if (skill) {
      const skillLower = skill.toLowerCase();
      agents = agents.filter((a) =>
        a.skills.some((s) => s.toLowerCase().includes(skillLower))
      );
    }

    // Filter by verified status
    if (verified === "true") {
      agents = agents.filter((a) => a.verified);
    } else if (verified === "false") {
      agents = agents.filter((a) => !a.verified);
    }

    const total = agents.length;
    const paged = agents.slice(offset, offset + limit);

    return NextResponse.json(
      {
        agents: paged,
        total,
        limit,
        offset,
        registry: "clawdbot.com",
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Agent discovery error:", error);
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
