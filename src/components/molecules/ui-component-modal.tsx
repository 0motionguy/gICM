"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Copy, Terminal, ExternalLink, Code2, Eye, Package, FileCode } from "lucide-react";
import type { UIComponent } from "@/types/registry";
import { toast } from "sonner";
import { CodeDisplay } from "@/components/ui/code-display";
import { PREVIEW_COMPONENTS } from "@/components/registry";

interface UIComponentModalProps {
  item: UIComponent | null;
  isOpen: boolean;
  onClose: () => void;
}

// Library colors
const libraryColors: Record<string, string> = {
  "Aceternity UI": "#00F0FF",
  "Magic UI": "#7C3AED",
  "shadcn/ui": "#FFFFFF",
  "ClawdBot": "#00F0FF",
  "UIverse": "#FF6B6B",
};

export function UIComponentModal({ item, isOpen, onClose }: UIComponentModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedDeps, setCopiedDeps] = useState(false);

  if (!item) return null;

  const libraryColor = libraryColors[item.credit.library] || "#71717A";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(item.code.component);
      setCopiedCode(true);
      toast.success("Component code copied!");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyDeps = async () => {
    try {
      const deps = item.code.dependencies.join(" ");
      await navigator.clipboard.writeText(`npm install ${deps}`);
      setCopiedDeps(true);
      toast.success("Install command copied!");
      setTimeout(() => setCopiedDeps(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl bg-[#0A0A0B] border border-white/10 p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <VisuallyHidden>
          <DialogTitle>{item.name}</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-white font-display">{item.name}</h2>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: `${libraryColor}40`,
                    color: libraryColor,
                    backgroundColor: `${libraryColor}10`,
                  }}
                >
                  {item.credit.library}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{item.description}</p>

              {/* Tags */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {item.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b border-white/10 bg-black/20">
            <TabsList className="bg-transparent border-0 p-0 h-12 gap-6">
              <TabsTrigger
                value="code"
                className="bg-transparent border-0 text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00F0FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00F0FF] rounded-none h-full px-0 flex items-center gap-2 transition-colors"
              >
                <Code2 size={14} /> Code
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="bg-transparent border-0 text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00F0FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00F0FF] rounded-none h-full px-0 flex items-center gap-2 transition-colors"
              >
                <Eye size={14} /> Preview
              </TabsTrigger>
              <TabsTrigger
                value="install"
                className="bg-transparent border-0 text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00F0FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00F0FF] rounded-none h-full px-0 flex items-center gap-2 transition-colors"
              >
                <Terminal size={14} /> Install
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Code Tab */}
          <TabsContent value="code" className="flex-1 m-0 overflow-auto p-6">
            <CodeDisplay
              code={item.code.component}
              filename={item.code.filename}
              maxHeight="500px"
            />

            {/* CSS if available */}
            {item.code.css && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FileCode size={14} className="text-[#FF0080]" />
                  Required CSS
                </h4>
                <CodeDisplay
                  code={item.code.css}
                  filename="globals.css (add this)"
                  language="css"
                  maxHeight="200px"
                />
              </div>
            )}
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 m-0 overflow-auto">
            <div data-testid="modal-preview" className="h-full min-h-[400px] bg-zinc-950 flex items-center justify-center p-8">
              <ComponentPreview item={item} />
            </div>
          </TabsContent>

          {/* Install Tab */}
          <TabsContent value="install" className="flex-1 m-0 overflow-auto p-6 space-y-6">
            {/* Dependencies */}
            {item.code.dependencies.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Package size={14} className="text-[#7000FF]" />
                  Dependencies
                </h4>
                <div className="relative group">
                  <div className="p-4 rounded-xl bg-[#050505] border border-white/5 font-mono text-sm">
                    <div className="flex items-start gap-2 text-zinc-300">
                      <span className="text-[#00F0FF] select-none">$</span>
                      <span>
                        <span className="text-zinc-500">npm install</span>{" "}
                        <span className="text-white">{item.code.dependencies.join(" ")}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyDeps}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copiedDeps ? (
                      <Check size={16} className="text-[#00F0FF]" />
                    ) : (
                      <Copy size={16} className="text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Usage Example */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Code2 size={14} className="text-[#00F0FF]" />
                Usage Example
              </h4>
              <CodeDisplay
                code={item.code.usage}
                maxHeight="250px"
              />
            </div>

            {/* Tech Stack */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {item.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#7000FF]/10 border border-[#7000FF]/20 text-[#A78BFA]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Credit */}
            <div className="pt-4 border-t border-white/5">
              <a
                href={item.credit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${libraryColor}20` }}
                >
                  <ExternalLink size={16} style={{ color: libraryColor }} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-zinc-400">Original source</div>
                  <div className="text-sm font-medium text-white group-hover:text-[#00F0FF] transition-colors">
                    {item.credit.library}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                  {item.credit.license}
                </span>
              </a>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {item.code.filename} • {item.code.component.split("\n").length} lines
          </div>
          <Button onClick={handleCopyCode} className="bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 font-bold">
            {copiedCode ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
            {copiedCode ? "Copied!" : "Copy Component"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Component Preview - renders REAL React components
function ComponentPreview({ item }: { item: UIComponent }) {
  // Check if we have a real preview component
  const PreviewComponent = PREVIEW_COMPONENTS[item.id];

  if (PreviewComponent) {
    return <PreviewComponent />;
  }

  // Fallback for components without preview
  return (
    <div className="text-center space-y-4">
      <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[#00F0FF]/20 to-[#7000FF]/20 flex items-center justify-center">
        <Eye size={40} className="text-[#00F0FF]" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{item.name}</h3>
        <p className="text-sm text-zinc-400 mt-1">Preview not available</p>
      </div>
    </div>
  );
}

export default UIComponentModal;
