interface MCPServer {
  id: string;
  name: string;
  status: "running" | "stopped" | "error";
}

interface ServerListProps {
  servers: MCPServer[];
}

const STATUS_STYLES = {
  running: "bg-green-500/20 text-green-400",
  stopped: "bg-gray-500/20 text-gray-400",
  error: "bg-red-500/20 text-red-400",
} as const;

export function ServerList({ servers }: ServerListProps) {
  return (
    <section className="space-y-4 rounded-lg bg-gray-800 p-6">
      <h2 className="text-sm font-medium uppercase tracking-wide text-gray-400">
        MCP Servers
      </h2>
      <ul className="space-y-3">
        {servers.map((server) => (
          <li
            key={server.id}
            className="flex items-center justify-between rounded-md bg-gray-700/50 px-4 py-3"
          >
            <span className="font-medium text-white">{server.name}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[server.status]}`}
            >
              {server.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
