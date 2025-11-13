"use client";

import { useState, useCallback } from "react";
import type { RegistryItem } from "@/types/registry";
import type { StackConfig } from "@/lib/remix";
import { incrementBatchRemixes } from "@/lib/item-stats";
import {
  generateStackId,
  generateShareURL,
  encodeStackToURL,
  decodeStackFromURL,
  forkStack,
  saveStackPreset,
  getStackPresets,
  deleteStackPreset,
  getStackPresetById,
  exportToGist,
  copyToClipboard,
  trackRemix,
  trackShare,
} from "@/lib/remix";
import { toast } from "sonner";

export function useRemix() {
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState<StackConfig[]>([]);

  /**
   * Create a new stack from selected items
   */
  const createStack = useCallback(
    (
      items: string[],
      options: {
        name: string;
        description?: string;
        author?: string;
        tags?: string[];
      }
    ): StackConfig => {
      const now = new Date().toISOString();

      const stack: StackConfig = {
        id: generateStackId(),
        name: options.name,
        description: options.description,
        items,
        createdAt: now,
        updatedAt: now,
        author: options.author,
        tags: options.tags,
        version: "1.0.0",
      };

      return stack;
    },
    []
  );

  /**
   * Save stack to local presets
   */
  const saveStack = useCallback(
    async (stack: StackConfig): Promise<void> => {
      try {
        saveStackPreset(stack);
        loadPresets();
        toast.success("Stack saved!", {
          description: `"${stack.name}" added to your presets`,
        });
      } catch (error) {
        toast.error("Failed to save stack", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    },
    []
  );

  /**
   * Load all presets
   */
  const loadPresets = useCallback(() => {
    const saved = getStackPresets();
    setPresets(saved);
    return saved;
  }, []);

  /**
   * Get preset by ID
   */
  const getPreset = useCallback((stackId: string): StackConfig | null => {
    return getStackPresetById(stackId);
  }, []);

  /**
   * Delete a preset
   */
  const deletePreset = useCallback(
    async (stackId: string): Promise<void> => {
      try {
        deleteStackPreset(stackId);
        loadPresets();
        toast.success("Stack deleted");
      } catch (error) {
        toast.error("Failed to delete stack");
        throw error;
      }
    },
    [loadPresets]
  );

  /**
   * Fork a stack
   */
  const fork = useCallback(
    async (
      originalStack: StackConfig,
      options?: {
        name?: string;
        author?: string;
      }
    ): Promise<StackConfig> => {
      try {
        const forkedStack = forkStack(
          originalStack,
          options?.name,
          options?.author
        );

        saveStackPreset(forkedStack);
        loadPresets();

        await trackRemix(originalStack.id, forkedStack.id, options?.author);

        // Track item-level remixes for all items in the forked stack
        try {
          incrementBatchRemixes(forkedStack.items);
        } catch (error) {
          console.error('Failed to track item remixes:', error);
          // Don't fail the fork operation if stats update fails
        }

        toast.success("Stack forked!", {
          description: `Created "${forkedStack.name}"`,
        });

        return forkedStack;
      } catch (error) {
        toast.error("Failed to fork stack");
        throw error;
      }
    },
    [loadPresets]
  );

  /**
   * Generate share URL
   */
  const share = useCallback(
    async (stack: StackConfig): Promise<string> => {
      try {
        const url = generateShareURL(stack);
        await trackShare(stack.id, "url");
        return url;
      } catch (error) {
        toast.error("Failed to generate share URL");
        throw error;
      }
    },
    []
  );

  /**
   * Copy share URL to clipboard
   */
  const copyShareURL = useCallback(
    async (stack: StackConfig): Promise<void> => {
      try {
        const url = generateShareURL(stack);
        await copyToClipboard(url);
        await trackShare(stack.id, "url");
        toast.success("Share link copied!");
      } catch (error) {
        toast.error("Failed to copy link");
        throw error;
      }
    },
    []
  );

  /**
   * Export stack to GitHub Gist
   */
  const exportGist = useCallback(
    async (
      stack: StackConfig,
      items: RegistryItem[],
      githubToken: string
    ): Promise<{ url: string; id: string }> => {
      setLoading(true);

      try {
        const result = await exportToGist(stack, items, githubToken);
        await trackShare(stack.id, "gist");

        toast.success("Stack exported to Gist!", {
          description: "Your stack is now publicly accessible",
        });

        return result;
      } catch (error) {
        toast.error("Failed to export to Gist", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Import stack from URL or encoded data
   */
  const importStack = useCallback(
    async (encodedData: string): Promise<StackConfig> => {
      setLoading(true);

      try {
        // Extract encoded part from URL if full URL provided
        let encoded = encodedData.trim();

        if (encoded.includes("import=")) {
          const match = encoded.match(/import=([^&]+)/);
          if (match) {
            encoded = match[1];
          }
        }

        const stack = decodeStackFromURL(encoded);

        // Save to presets
        saveStackPreset(stack);
        loadPresets();

        toast.success("Stack imported!", {
          description: `Added "${stack.name}" to your presets`,
        });

        return stack;
      } catch (error) {
        toast.error("Failed to import stack", {
          description: "Invalid stack data",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadPresets]
  );

  /**
   * Encode stack to URL-safe string
   */
  const encode = useCallback((stack: StackConfig): string => {
    return encodeStackToURL(stack);
  }, []);

  /**
   * Decode stack from URL-safe string
   */
  const decode = useCallback((encoded: string): StackConfig => {
    return decodeStackFromURL(encoded);
  }, []);

  /**
   * Download stack as JSON
   */
  const downloadJSON = useCallback((stack: StackConfig): void => {
    const a = document.createElement("a");
    a.href = `data:application/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(stack, null, 2)
    )}`;
    a.download = `${stack.id}.json`;
    a.click();
    toast.success("Stack JSON downloaded");
  }, []);

  /**
   * Create and save a new stack in one operation
   */
  const createAndSave = useCallback(
    async (
      items: string[],
      options: {
        name: string;
        description?: string;
        author?: string;
        tags?: string[];
      }
    ): Promise<StackConfig> => {
      const stack = createStack(items, options);
      await saveStack(stack);
      return stack;
    },
    [createStack, saveStack]
  );

  return {
    loading,
    presets,
    createStack,
    saveStack,
    loadPresets,
    getPreset,
    deletePreset,
    fork,
    share,
    copyShareURL,
    exportGist,
    importStack,
    encode,
    decode,
    downloadJSON,
    createAndSave,
  };
}
