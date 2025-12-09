"use client";

import { DESIGN_ASSETS } from "@/lib/registry-design";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AnimatedGrid } from "@/components/ui/animated-grid";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SyntaxHighlighter: any = (dynamic as any)(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  { loading: () => <p>Loading...</p>, ssr: false },
);

function ComponentPreview({ componentId }: { componentId: string }) {
  switch (componentId) {
    case "glass-card":
      return <GlassCard className="p-8">Preview</GlassCard>;
    case "aurora-background":
      return (
        <AuroraBackground className="p-8 rounded-lg">Preview</AuroraBackground>
      );
    case "animated-grid":
      return (
        <div className="h-64 rounded-lg overflow-hidden relative">
          <AnimatedGrid />
        </div>
      );
    case "neon-button":
      return <NeonButton>Preview</NeonButton>;
    default:
      return null;
  }
}

export default function DesignPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Design Foundry</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DESIGN_ASSETS.map((item) => (
          <GlassCard key={item.id} className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
            <p className="text-sm text-gray-500 mb-4 flex-grow">
              {item.description}
            </p>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Preview</h3>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ComponentPreview componentId={item.id} />
              </div>
            </div>

            <div className="flex-grow flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Code</h3>
                <button
                  onClick={() => handleCopy(item.id, item.install)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-bold transition-colors"
                >
                  {copiedId === item.id ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <div className="flex-grow" style={{ minHeight: "300px" }}>
                <SyntaxHighlighter
                  language="tsx"
                  style={vscDarkPlus}
                  customStyle={{ height: "100%", overflowY: "auto" }}
                >
                  {item.install}
                </SyntaxHighlighter>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
