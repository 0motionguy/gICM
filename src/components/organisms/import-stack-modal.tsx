"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GitFork,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import type { RegistryItem } from "@/types/registry";
import type { StackConfig } from "@/lib/remix";
import { decodeStackFromURL, saveStackPreset } from "@/lib/remix";

interface ImportStackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (stack: StackConfig) => void;
  initialEncodedData?: string;
}

export function ImportStackModal({
  open,
  onOpenChange,
  onImportComplete,
  initialEncodedData,
}: ImportStackModalProps) {
  const [input, setInput] = useState(initialEncodedData || "");
  const [loading, setLoading] = useState(false);
  const [decodedStack, setDecodedStack] = useState<StackConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle decode
  const handleDecode = () => {
    if (!input.trim()) {
      setError("Please enter a URL or encoded stack data");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Extract encoded part from URL if full URL provided
      let encoded = input.trim();

      if (encoded.includes("import=")) {
        const match = encoded.match(/import=([^&]+)/);
        if (match) {
          encoded = match[1];
        }
      }

      // Decode the stack
      const stack = decodeStackFromURL(encoded);

      setDecodedStack(stack);
      toast.success("Stack decoded successfully!");
    } catch (err) {
      setError("Invalid stack data. Please check the URL or encoded string.");
      toast.error("Failed to decode stack");
    } finally {
      setLoading(false);
    }
  };

  // Handle import
  const handleImport = () => {
    if (!decodedStack) return;

    try {
      // Save to presets
      saveStackPreset(decodedStack);

      toast.success("Stack imported successfully!", {
        description: `Added "${decodedStack.name}" to your presets`,
      });

      // Call completion callback
      if (onImportComplete) {
        onImportComplete(decodedStack);
      }

      // Close modal and reset
      onOpenChange(false);
      setTimeout(() => {
        setInput("");
        setDecodedStack(null);
        setError(null);
      }, 300);
    } catch (err) {
      toast.error("Failed to import stack", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  // Auto-decode if initial data provided
  useState(() => {
    if (initialEncodedData && open) {
      handleDecode();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-lime-300" />
            Import Stack
          </DialogTitle>
          <DialogDescription>
            Import a stack from a share URL or encoded configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input */}
          <div>
            <Label htmlFor="import-input" className="text-sm font-medium text-black">
              Share URL or Encoded Data
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="import-input"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                placeholder="https://clawdbot.com/stack?import=... or encoded string"
                className="font-mono text-sm"
              />
              <Button
                onClick={handleDecode}
                disabled={loading || !input.trim()}
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Decode"
                )}
              </Button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-xs text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Decoded Stack Preview */}
          {decodedStack && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Stack Decoded Successfully
                    </p>
                    <p className="text-xs text-green-700">
                      Review the details below and click "Import Stack" to add it to your presets
                    </p>
                  </div>
                </div>
              </div>

              {/* Stack Details */}
              <div className="border border-zinc-200 rounded-lg p-4 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-black">{decodedStack.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {decodedStack.items.length} items
                    </Badge>
                    {decodedStack.version && (
                      <Badge variant="outline" className="text-xs">
                        v{decodedStack.version}
                      </Badge>
                    )}
                  </div>
                  {decodedStack.description && (
                    <p className="text-sm text-zinc-600">{decodedStack.description}</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200">
                  {decodedStack.author && (
                    <div className="flex items-center gap-2 text-xs">
                      <User className="w-4 h-4 text-zinc-400" />
                      <div>
                        <p className="text-zinc-500">Author</p>
                        <p className="font-medium text-black">{decodedStack.author}</p>
                      </div>
                    </div>
                  )}

                  {decodedStack.createdAt && (
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <div>
                        <p className="text-zinc-500">Created</p>
                        <p className="font-medium text-black">
                          {new Date(decodedStack.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {decodedStack.remixedFrom && (
                    <div className="flex items-center gap-2 text-xs col-span-2">
                      <GitFork className="w-4 h-4 text-lime-600" />
                      <div>
                        <p className="text-zinc-500">Remixed From</p>
                        <p className="font-medium text-lime-700">{decodedStack.remixedFrom}</p>
                      </div>
                    </div>
                  )}

                  {decodedStack.remixCount !== undefined && decodedStack.remixCount > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <GitFork className="w-4 h-4 text-zinc-400" />
                      <div>
                        <p className="text-zinc-500">Remixes</p>
                        <p className="font-medium text-black">{decodedStack.remixCount}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {decodedStack.tags && decodedStack.tags.length > 0 && (
                  <div className="pt-3 border-t border-zinc-200">
                    <p className="text-xs font-medium text-zinc-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {decodedStack.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="pt-3 border-t border-zinc-200">
                  <p className="text-xs font-medium text-zinc-500 mb-2">
                    Items ({decodedStack.items.length})
                  </p>
                  <div className="max-h-32 overflow-y-auto border border-zinc-200 rounded-lg p-2 space-y-1">
                    {decodedStack.items.map((itemId, idx) => (
                      <div
                        key={idx}
                        className="text-xs py-1 px-2 hover:bg-zinc-50 rounded font-mono"
                      >
                        {itemId}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Warning if already exists */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-900">
                    <p className="font-medium mb-1">Note</p>
                    <p>
                      If a preset with the same ID already exists, it will be updated with this
                      configuration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions when no decoded stack */}
          {!decodedStack && !error && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-sm text-zinc-600">
              <p className="font-medium text-black mb-2">How to import:</p>
              <ol className="list-decimal list-inside space-y-1.5 ml-2">
                <li>Paste a share URL (e.g., https://clawdbot.com/stack?import=...)</li>
                <li>Or paste the encoded stack data directly</li>
                <li>Click "Decode" to preview the stack</li>
                <li>Click "Import Stack" to add it to your presets</li>
              </ol>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setTimeout(() => {
                setInput("");
                setDecodedStack(null);
                setError(null);
              }, 300);
            }}
          >
            Cancel
          </Button>
          {decodedStack && (
            <Button onClick={handleImport}>
              <Download className="w-4 h-4 mr-2" />
              Import Stack
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
