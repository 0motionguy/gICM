"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Download,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Zap,
  Bot,
  Terminal,
  Plug,
} from "lucide-react";
import Link from "next/link";
import { decodeStackFromURL, type StackConfig } from "@/lib/remix";
import { useBundleStore } from "@/lib/store/bundle";
import { REGISTRY, getItemById } from "@/lib/registry";
import { toast } from "sonner";

const getKindIcon = (kind: string) => {
  switch (kind) {
    case "agent":
      return Bot;
    case "skill":
      return Zap;
    case "command":
      return Terminal;
    case "mcp":
      return Plug;
    default:
      return Package;
  }
};

function StackImportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stackConfig, setStackConfig] = useState<StackConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const { addItem, clearBundle } = useBundleStore();

  useEffect(() => {
    const importParam = searchParams.get("import");
    if (importParam) {
      try {
        const config = decodeStackFromURL(importParam);
        setStackConfig(config);
      } catch (err) {
        setError("Invalid or corrupted stack URL. Please check the link.");
      }
    } else {
      setError("No stack data found in URL.");
    }
  }, [searchParams]);

  const resolvedItems =
    stackConfig?.items.map((id) => getItemById(id)).filter(Boolean) || [];

  const missingItems =
    stackConfig?.items.filter((id) => !getItemById(id)) || [];

  const handleImport = async () => {
    if (!stackConfig) return;

    setIsImporting(true);

    // Simulate a brief loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Clear existing bundle and add all items
    clearBundle();
    resolvedItems.forEach((item) => {
      if (item) addItem(item);
    });

    setImported(true);
    setIsImporting(false);

    toast.success(`Imported ${resolvedItems.length} items!`, {
      description: stackConfig.name,
    });

    // Redirect to home after a brief delay
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Import Failed</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!stackConfig) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-500/20 to-emerald-500/20 border border-lime-500/30 flex items-center justify-center mx-auto mb-6"
          >
            <Package className="w-10 h-10 text-lime-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {stackConfig.name}
          </h1>
          {stackConfig.description && (
            <p className="text-zinc-400 max-w-lg mx-auto">
              {stackConfig.description}
            </p>
          )}
          {stackConfig.author && (
            <p className="text-sm text-zinc-500 mt-2">
              Shared by {stackConfig.author}
            </p>
          )}
        </div>

        {/* Stack Contents */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">
              Stack Contents ({resolvedItems.length} items)
            </h2>
          </div>
          <div className="divide-y divide-zinc-800 max-h-[400px] overflow-y-auto">
            {resolvedItems.map((item) => {
              if (!item) return null;
              const Icon = getKindIcon(item.kind);
              return (
                <div
                  key={item.id}
                  className="p-4 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-zinc-500 truncate">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400">
                    {item.kind}
                  </span>
                </div>
              );
            })}
          </div>

          {missingItems.length > 0 && (
            <div className="p-4 bg-amber-500/10 border-t border-amber-500/20">
              <p className="text-sm text-amber-400">
                {missingItems.length} item(s) not found in registry
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleImport}
            disabled={isImporting || imported}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
              imported
                ? "bg-lime-500 text-black"
                : isImporting
                  ? "bg-zinc-700 text-zinc-400 cursor-wait"
                  : "bg-lime-500 hover:bg-lime-400 text-black"
            }`}
          >
            {imported ? (
              <>
                <Check className="w-5 h-5" />
                Imported!
              </>
            ) : isImporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Import to My Stack
              </>
            )}
          </button>

          <Link
            href="/"
            className="px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* Metadata */}
        {stackConfig.tags && stackConfig.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {stackConfig.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StackImportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
        </div>
      }
    >
      <StackImportContent />
    </Suspense>
  );
}
