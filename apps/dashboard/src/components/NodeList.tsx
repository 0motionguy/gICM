interface FleetNode {
  id: string;
  name: string;
  status: "online" | "offline" | "degraded";
}

interface NodeListProps {
  nodes: FleetNode[];
}

const STATUS_STYLES = {
  online: "bg-green-500/20 text-green-400",
  offline: "bg-red-500/20 text-red-400",
  degraded: "bg-yellow-500/20 text-yellow-400",
} as const;

export function NodeList({ nodes }: NodeListProps) {
  return (
    <section className="space-y-4 rounded-lg bg-gray-800 p-6">
      <h2 className="text-sm font-medium uppercase tracking-wide text-gray-400">
        Nodes
      </h2>
      <ul className="space-y-3">
        {nodes.map((node) => (
          <li
            key={node.id}
            className="flex items-center justify-between rounded-md bg-gray-700/50 px-4 py-3"
          >
            <span className="font-medium text-white">{node.name}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[node.status]}`}
            >
              {node.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
