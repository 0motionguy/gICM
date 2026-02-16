/**
 * MCP Gateway Routes
 *
 * REST endpoints for the MCP-to-REST proxy.
 * Agents call these to use MCP tools without native MCP support.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getMCPManager } from "./manager.js";
import { MCPToolCallRequestSchema } from "./types.js";

export async function mcpRoutes(fastify: FastifyInstance): Promise<void> {
  const manager = getMCPManager();

  // Load config on route registration
  manager.loadConfig();

  // =========================================================================
  // GET /api/mcp/servers — List all configured MCP servers
  // =========================================================================
  fastify.get(
    "/api/mcp/servers",
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const status = manager.getStatus();
      return reply.send(status);
    }
  );

  // =========================================================================
  // GET /api/mcp/status — Quick health check
  // =========================================================================
  fastify.get(
    "/api/mcp/status",
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const status = manager.getStatus();
      return reply.send({
        ok: true,
        servers: status.stats.totalServers,
        running: status.stats.running,
        tools: status.stats.totalTools,
        calls: status.stats.totalCalls,
      });
    }
  );

  // =========================================================================
  // GET /api/mcp/:server/tools — List tools for a server
  // =========================================================================
  fastify.get<{ Params: { server: string } }>(
    "/api/mcp/:server/tools",
    async (request, reply) => {
      const { server } = request.params;

      try {
        const tools = await manager.getTools(server);
        return reply.send({ server, tools });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return reply.status(404).send({ error: message });
      }
    }
  );

  // =========================================================================
  // POST /api/mcp/:server/:tool — Call a tool
  // =========================================================================
  fastify.post<{ Params: { server: string; tool: string } }>(
    "/api/mcp/:server/:tool",
    async (request, reply) => {
      const { server, tool } = request.params;

      let args: Record<string, unknown> = {};
      try {
        const parsed = MCPToolCallRequestSchema.safeParse(request.body);
        if (parsed.success) {
          args = parsed.data.arguments;
        } else if (request.body && typeof request.body === "object") {
          // Allow passing args directly in body (convenience)
          args = request.body as Record<string, unknown>;
        }
      } catch {
        // Empty args is fine
      }

      try {
        const start = Date.now();
        const result = await manager.callTool(server, tool, args);
        const duration = Date.now() - start;

        return reply.send({
          server,
          tool,
          duration,
          result,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return reply.status(500).send({
          server,
          tool,
          error: message,
        });
      }
    }
  );

  // =========================================================================
  // POST /api/mcp/:server/restart — Force restart a server
  // =========================================================================
  fastify.post<{ Params: { server: string } }>(
    "/api/mcp/:server/restart",
    async (request, reply) => {
      const { server } = request.params;

      try {
        await manager.restartServer(server);
        return reply.send({ ok: true, server, message: `${server} restarted` });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return reply.status(500).send({ error: message });
      }
    }
  );
}
