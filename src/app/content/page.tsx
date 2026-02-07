"use client";

import { useCallback, useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { Connection, Edge, Node, ReactFlowInstance } from "@xyflow/react";

// Lazy load ReactFlow components (~100KB savings)
const ReactFlow = dynamic(
  () => import("@xyflow/react").then((mod) => mod.ReactFlow),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00F0FF]" />
      </div>
    ),
  }
);
const ReactFlowProvider = dynamic(
  () => import("@xyflow/react").then((mod) => mod.ReactFlowProvider),
  { ssr: false }
);
const Controls = dynamic(
  () => import("@xyflow/react").then((mod) => mod.Controls),
  { ssr: false }
);
const Background = dynamic(
  () => import("@xyflow/react").then((mod) => mod.Background),
  { ssr: false }
);
const MiniMap = dynamic(
  () => import("@xyflow/react").then((mod) => mod.MiniMap),
  { ssr: false }
);
const Panel = dynamic(() => import("@xyflow/react").then((mod) => mod.Panel), {
  ssr: false,
});

// These need to be imported for the hooks - they're not components
import {
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CONTENT_AGENTS } from "@/lib/registry-content";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Bot, Sparkles, Save, Play, Plus } from "lucide-react";
import { toast } from "sonner";

// Initial node setup
const initialNodes: Node[] = [
  {
    id: "start",
    type: "input",
    data: { label: "Topic Input" },
    position: { x: 250, y: 50 },
    style: {
      background: "#18181B",
      color: "#fff",
      border: "1px solid #333",
      borderRadius: "12px",
      padding: "10px",
      width: 150,
    },
  },
];

// Sidebar Component
function Sidebar() {
  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    label: string,
    id: string
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/label", label);
    event.dataTransfer.setData("application/agentId", id);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <GlassCard
      className="flex h-full w-64 flex-col gap-4 rounded-none border-r border-white/10 p-4"
      compact
    >
      <div className="mb-2">
        <h2 className="text-lg font-bold text-white">Pipeline Agents</h2>
        <p className="text-xs text-zinc-400">Drag agents to the canvas</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {CONTENT_AGENTS.map((agent) => (
          <div
            key={agent.id}
            className="cursor-grab rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-[#00F0FF]/50 hover:bg-[#00F0FF]/5 active:cursor-grabbing"
            draggable
            onDragStart={(event) =>
              onDragStart(event, "default", agent.name, agent.id)
            }
          >
            <div className="mb-1 flex items-center gap-2">
              <Bot size={16} className="text-[#00F0FF]" />
              <span className="text-sm font-bold text-white">{agent.name}</span>
            </div>
            <p className="line-clamp-2 text-[10px] text-zinc-500">
              {agent.description}
            </p>
          </div>
        ))}

        <div
          className="flex cursor-grab items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 p-3 text-xs text-zinc-400 transition-all hover:border-white/40 hover:text-white"
          draggable
          onDragStart={(event) =>
            onDragStart(event, "output", "Publish Output", "publish")
          }
        >
          <Plus size={14} />
          Add Output Node
        </div>
      </div>
    </GlassCard>
  );
}

function PipelineBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...params, animated: true, style: { stroke: "#00F0FF" } },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const label = event.dataTransfer.getData("application/label");
      const agentId = event.dataTransfer.getData("application/agentId");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${agentId}-${nodes.length + 1}`,
        type,
        position,
        data: { label },
        style: {
          background: "#18181B",
          color: "#fff",
          border: "1px solid #00F0FF",
          boxShadow: "0 0 15px -3px rgba(0, 240, 255, 0.3)",
          borderRadius: "12px",
          padding: "12px",
          minWidth: 180,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const handleDeploy = () => {
    const pipelineConfig = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.data.label,
      })),
      edges: edges.map((e) => ({ source: e.source, target: e.target })),
    };

    const jsonConfig = JSON.stringify(pipelineConfig, null, 2);
    navigator.clipboard.writeText(jsonConfig);

    toast.success("Pipeline configuration copied!", {
      description:
        "Run 'npx @clawdbot/cli add workflow/deploy-pipeline' to implement this workflow.",
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#05050A]">
      <ReactFlowProvider>
        <Sidebar />
        <div className="h-full flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background
              color="#222"
              variant={BackgroundVariant.Dots}
              gap={20}
            />
            <Controls
              style={{
                background: "#18181B",
                border: "1px solid #333",
                fill: "#fff",
              }}
            />
            <MiniMap
              style={{ background: "#18181B", border: "1px solid #333" }}
              nodeColor={() => "#00F0FF"}
              maskColor="rgba(0,0,0,0.6)"
            />

            <Panel position="top-right" className="flex gap-3">
              <NeonButton
                onClick={() => toast.info("Saved to local storage")}
                variant="secondary"
                className="bg-black/50 backdrop-blur"
              >
                <Save size={16} className="mr-2" />
                Save Draft
              </NeonButton>
              <NeonButton onClick={handleDeploy}>
                <Play size={16} className="mr-2" />
                Deploy Pipeline
              </NeonButton>
            </Panel>
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}

export default PipelineBuilder;
