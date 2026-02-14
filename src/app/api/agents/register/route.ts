import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";

/**
 * Agent Registration API — POST /api/agents/register
 *
 * External agents register themselves on ClawdBot for discovery.
 * Stored in data/agents.json (MVP — Supabase migration later).
 */

const RegisterSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, "Invalid characters in name"),
  description: z.string().min(10).max(500),
  endpoint: z.string().url(),
  agentCard: z.string().url().optional(),
  skills: z.array(z.string().min(1).max(50)).min(1).max(20),
  owner: z.string().min(3).max(200),
});

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

async function writeAgents(agents: RegisteredAgent[]): Promise<void> {
  await fs.writeFile(AGENTS_FILE, JSON.stringify(agents, null, 2), "utf-8");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid registration data",
          details: parsed.error.flatten(),
          expected: {
            name: "string (2-100 chars, alphanumeric)",
            description: "string (10-500 chars)",
            endpoint: "valid URL",
            agentCard: "valid URL (optional)",
            skills: "string[] (1-20 items)",
            owner: "string (3-200 chars, wallet or email)",
          },
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const agents = await readAgents();

    // Check for duplicate endpoint
    const existing = agents.find((a) => a.endpoint === parsed.data.endpoint);
    if (existing) {
      return NextResponse.json(
        {
          error: "Agent already registered with this endpoint",
          existingId: existing.id,
        },
        { status: 409, headers: corsHeaders() }
      );
    }

    const newAgent: RegisteredAgent = {
      id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: parsed.data.name,
      description: parsed.data.description,
      endpoint: parsed.data.endpoint,
      agentCard: parsed.data.agentCard,
      skills: parsed.data.skills,
      owner: parsed.data.owner,
      verified: false,
      registeredAt: new Date().toISOString(),
    };

    agents.push(newAgent);
    await writeAgents(agents);

    return NextResponse.json(
      {
        status: "registered",
        agent: newAgent,
        discovery: {
          listEndpoint: "/api/agents",
          detailEndpoint: `/api/agents/${newAgent.id}`,
        },
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Agent registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export const runtime = "nodejs";
