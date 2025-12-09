"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Copy,
  Check,
  Github,
  Link2,
  X,
  Loader2,
  ExternalLink,
  GitFork,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  StackConfig,
  generateShareURL,
  exportToGist,
  forkStack,
  saveStackPreset,
  copyToClipboard,
  trackShare,
} from "@/lib/remix";
import { useBundleStore } from "@/lib/store/bundle";
import { REGISTRY, getItemById } from "@/lib/registry";

interface ShareRemixPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stackConfig?: StackConfig | null;
}

export function ShareRemixPanel({
  isOpen,
  onClose,
  stackConfig,
}: ShareRemixPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isExportingGist, setIsExportingGist] = useState(false);
  const [gistUrl, setGistUrl] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState("");
  const [showGithubInput, setShowGithubInput] = useState(false);
  const [isForkMode, setIsForkMode] = useState(false);
  const [forkName, setForkName] = useState("");

  const { items: bundleItems } = useBundleStore();

  // Create stack config from current bundle if not provided
  const currentConfig: StackConfig = stackConfig || {
    id: `stack_${Date.now()}`,
    name: "My Stack",
    description: "A custom gICM stack",
    items: bundleItems.map((item) => item.id),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: "1.0.0",
  };

  const shareUrl = generateShareURL(currentConfig);

  const handleCopyUrl = async () => {
    try {
      await copyToClipboard(shareUrl);
      setCopied(true);
      toast.success("Share URL copied to clipboard!");
      trackShare(currentConfig.id, "url");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleExportGist = async () => {
    if (!githubToken) {
      setShowGithubInput(true);
      return;
    }

    setIsExportingGist(true);
    try {
      const items = currentConfig.items
        .map((id) => getItemById(id))
        .filter(Boolean) as typeof REGISTRY;

      const result = await exportToGist(currentConfig, items, githubToken);
      setGistUrl(result.url);
      toast.success("Stack exported to GitHub Gist!");
      trackShare(currentConfig.id, "gist");
    } catch (error) {
      toast.error("Failed to export to GitHub Gist");
      console.error(error);
    } finally {
      setIsExportingGist(false);
    }
  };

  const handleFork = () => {
    if (!forkName.trim()) {
      toast.error("Please enter a name for your fork");
      return;
    }

    const forkedStack = forkStack(currentConfig, forkName.trim());
    saveStackPreset(forkedStack);
    toast.success(`Created fork: ${forkedStack.name}`);
    setIsForkMode(false);
    setForkName("");
    onClose();
  };

  const handleDownloadJson = () => {
    const items = currentConfig.items
      .map((id) => getItemById(id))
      .filter(Boolean);

    const exportData = {
      ...currentConfig,
      exportedAt: new Date().toISOString(),
      itemDetails: items.map((item) => ({
        id: item?.id,
        name: item?.name,
        kind: item?.kind,
        install: item?.install,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentConfig.name.replace(/\s+/g, "-").toLowerCase()}-stack.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Stack exported as JSON!");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
      >
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime-500/10 border border-lime-500/20">
                <Share2 className="w-5 h-5 text-lime-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Share & Remix</h2>
                <p className="text-sm text-zinc-400">
                  {currentConfig.items.length} items in stack
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Share URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Share URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 font-mono truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    copied
                      ? "bg-lime-500 text-black"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-800 pt-4">
              <p className="text-sm text-zinc-500 mb-3">Export options</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Export to Gist */}
                <button
                  onClick={handleExportGist}
                  disabled={isExportingGist}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                >
                  {isExportingGist ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Github className="w-4 h-4" />
                  )}
                  GitHub Gist
                </button>

                {/* Download JSON */}
                <button
                  onClick={handleDownloadJson}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </button>
              </div>
            </div>

            {/* GitHub Token Input */}
            <AnimatePresence>
              {showGithubInput && !gistUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-sm font-medium text-zinc-300">
                    GitHub Token
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 font-mono placeholder:text-zinc-600"
                  />
                  <p className="text-xs text-zinc-500">
                    Need a token?{" "}
                    <a
                      href="https://github.com/settings/tokens/new?description=gICM%20Stack%20Export&scopes=gist"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lime-400 hover:underline"
                    >
                      Create one here
                    </a>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gist URL Result */}
            <AnimatePresence>
              {gistUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-lime-500/10 border border-lime-500/20 rounded-lg"
                >
                  <p className="text-sm text-lime-400 font-medium mb-2">
                    Gist created successfully!
                  </p>
                  <a
                    href={gistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white hover:text-lime-400 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on GitHub
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fork Section */}
            <div className="border-t border-zinc-800 pt-4">
              <p className="text-sm text-zinc-500 mb-3">Create a copy</p>
              {!isForkMode ? (
                <button
                  onClick={() => setIsForkMode(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  <GitFork className="w-4 h-4" />
                  Fork this Stack
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={forkName}
                    onChange={(e) => setForkName(e.target.value)}
                    placeholder="Enter fork name..."
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleFork}
                      className="flex-1 px-4 py-3 bg-lime-500 hover:bg-lime-400 text-black font-medium rounded-lg transition-colors"
                    >
                      Create Fork
                    </button>
                    <button
                      onClick={() => {
                        setIsForkMode(false);
                        setForkName("");
                      }}
                      className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
