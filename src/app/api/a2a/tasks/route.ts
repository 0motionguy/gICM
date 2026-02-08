import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchItems, getItemById, REGISTRY } from "@/lib/registry";

/**
 * A2A Task Endpoint — POST /api/a2a/tasks
 *
 * Implements the A2A task lifecycle for agent-to-agent communication.
 * Agents submit tasks (search, install, verify) and get structured results.
 *
 * Task flow: submitted → working → completed
 */

const TaskInputSchema = z.object({
  skill: z.enum(["search-skills", "install-skill", "verify-skill"]),
  input: z.string().min(1).max(500),
});

function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function handleSearch(query: string) {
  const results = searchItems(query).slice(0, 20);
  return {
    results: results.map((item) => ({
      id: item.id,
      name: item.name,
      kind: item.kind,
      description: item.description,
      install: item.install,
      tags: item.tags,
      ecosystem: item.openClaw?.category || "clawdbot-exclusive",
      clawHubInstall: item.openClaw?.clawHubInstall || null,
      securityScore: item.security?.securityScore ?? null,
      auditStatus: item.audit?.status || null,
    })),
    total: results.length,
    registry: "clawdbot.com",
  };
}

function handleInstall(input: string) {
  // Try to find by ID, slug, or name
  const item =
    getItemById(input) ||
    REGISTRY.find(
      (i) => i.slug === input || i.name.toLowerCase() === input.toLowerCase()
    );

  if (!item) {
    return { error: "Item not found", query: input };
  }

  // Block high-threat items
  if (
    item.security?.threatLevel === "high" ||
    item.security?.threatLevel === "critical"
  ) {
    return {
      error: "Item blocked due to security concerns",
      threatLevel: item.security.threatLevel,
    };
  }

  return {
    id: item.id,
    name: item.name,
    kind: item.kind,
    install: item.install,
    clawHubInstall: item.openClaw?.clawHubInstall || null,
    ecosystem: item.openClaw?.category || "clawdbot-exclusive",
    envKeys: item.envKeys || [],
    dependencies: item.dependencies || [],
  };
}

function handleVerify(input: string) {
  const item =
    getItemById(input) ||
    REGISTRY.find(
      (i) => i.slug === input || i.name.toLowerCase() === input.toLowerCase()
    );

  if (!item) {
    return { error: "Item not found", query: input };
  }

  return {
    id: item.id,
    name: item.name,
    auditStatus: item.audit?.status || "UNVERIFIED",
    qualityScore: item.audit?.qualityScore ?? null,
    securityScore: item.security?.securityScore ?? null,
    threatLevel: item.security?.threatLevel || "unknown",
    vulnerabilities: item.security?.vulnerabilities?.length || 0,
    malwarePatterns: item.security?.malwarePatterns?.length || 0,
    lastScanned: item.security?.lastScanned || null,
    lastAudited: item.audit?.lastAudited || null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = TaskInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid task input",
          details: parsed.error.flatten(),
          expected: {
            skill: "search-skills | install-skill | verify-skill",
            input: "string (1-500 chars)",
          },
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { skill, input } = parsed.data;
    const taskId = generateTaskId();

    let result;
    switch (skill) {
      case "search-skills":
        result = handleSearch(input);
        break;
      case "install-skill":
        result = handleInstall(input);
        break;
      case "verify-skill":
        result = handleVerify(input);
        break;
    }

    const task = {
      id: taskId,
      status: "completed" as const,
      skill,
      input,
      result,
      metadata: {
        registry: "clawdbot.com",
        protocol: "a2a-v1",
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(task, {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("A2A task error:", error);
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
    "X-Agent-Discovery": "enabled",
    "X-Protocol": "a2a-v1",
  };
}

export const runtime = "nodejs";
