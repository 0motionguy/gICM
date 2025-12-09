"use client";

import { useState, useCallback } from "react";
import type { RegistryItem } from "@/types/registry";
import {
  verifyInstallation,
  verifyMultipleInstallations,
  saveInstallationHistory,
  getInstallationHistory,
  getRecentInstallations,
  isItemInstalled,
  getInstallationStats,
  type InstallationResult,
  type InstallationStatus,
} from "@/lib/install-verification";
import { toast } from "sonner";

export function useInstallVerification() {
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState<InstallationResult[]>([]);
  const [status, setStatus] = useState<Map<string, InstallationStatus>>(
    new Map(),
  );

  /**
   * Verify single item installation
   */
  const verifySingle = useCallback(
    async (
      item: RegistryItem,
      installedItems: string[],
      options?: {
        showToast?: boolean;
        saveHistory?: boolean;
      },
    ): Promise<InstallationResult> => {
      const { showToast = true, saveHistory = true } = options || {};

      setVerifying(true);

      // Update status to installing
      setStatus((prev) =>
        new Map(prev).set(item.id, {
          itemId: item.id,
          status: "installing",
          progress: 0,
          message: "Verifying installation...",
        }),
      );

      try {
        // Simulate progress
        setStatus((prev) =>
          new Map(prev).set(item.id, {
            itemId: item.id,
            status: "installing",
            progress: 50,
            message: "Checking files...",
          }),
        );

        const result = await verifyInstallation(item, installedItems);

        // Update status to success or failed
        setStatus((prev) =>
          new Map(prev).set(item.id, {
            itemId: item.id,
            status: result.success ? "verified" : "failed",
            progress: 100,
            message: result.success
              ? "Installation verified!"
              : "Installation failed",
            result,
          }),
        );

        // Save to history
        if (saveHistory) {
          saveInstallationHistory(result);
        }

        // Show toast
        if (showToast) {
          if (result.success) {
            toast.success(`${item.name} installed successfully!`, {
              description: `${result.filesCreated.length} files created`,
            });
          } else {
            const issues: string[] = [];
            if (result.filesMissing.length > 0) {
              issues.push(`${result.filesMissing.length} files missing`);
            }
            if (result.dependenciesMissing.length > 0) {
              issues.push(
                `${result.dependenciesMissing.length} dependencies missing`,
              );
            }

            toast.error(`${item.name} installation failed`, {
              description: issues.join(", "),
            });
          }
        }

        setResults((prev) => [...prev, result]);
        return result;
      } catch (error) {
        const errorResult: InstallationResult = {
          success: false,
          itemId: item.id,
          itemName: item.name,
          itemKind: item.kind,
          filesCreated: [],
          filesExpected: item.files || [],
          filesMissing: item.files || [],
          dependenciesResolved: false,
          dependenciesMissing: item.dependencies || [],
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
          verificationMethod: "browser-limited",
        };

        setStatus((prev) =>
          new Map(prev).set(item.id, {
            itemId: item.id,
            status: "failed",
            progress: 100,
            message: "Verification failed",
            result: errorResult,
          }),
        );

        if (showToast) {
          toast.error(`Failed to verify ${item.name}`, {
            description:
              error instanceof Error ? error.message : "Unknown error",
          });
        }

        setResults((prev) => [...prev, errorResult]);
        return errorResult;
      } finally {
        setVerifying(false);
      }
    },
    [],
  );

  /**
   * Verify multiple items
   */
  const verifyMultiple = useCallback(
    async (
      items: RegistryItem[],
      installedItems: string[],
      options?: {
        showToast?: boolean;
        saveHistory?: boolean;
      },
    ): Promise<InstallationResult[]> => {
      const { showToast = true, saveHistory = true } = options || {};

      setVerifying(true);
      setResults([]);

      // Initialize status for all items
      items.forEach((item) => {
        setStatus((prev) =>
          new Map(prev).set(item.id, {
            itemId: item.id,
            status: "pending",
            progress: 0,
            message: "Waiting...",
          }),
        );
      });

      try {
        const results = await verifyMultipleInstallations(
          items,
          installedItems,
        );

        // Update status for all items
        results.forEach((result) => {
          setStatus((prev) =>
            new Map(prev).set(result.itemId, {
              itemId: result.itemId,
              status: result.success ? "verified" : "failed",
              progress: 100,
              message: result.success ? "Verified" : "Failed",
              result,
            }),
          );

          // Save to history
          if (saveHistory) {
            saveInstallationHistory(result);
          }
        });

        // Show summary toast
        if (showToast) {
          const successful = results.filter((r) => r.success).length;
          const failed = results.length - successful;

          if (failed === 0) {
            toast.success(`All ${successful} items verified successfully!`);
          } else if (successful === 0) {
            toast.error(`All ${failed} items failed verification`);
          } else {
            toast.warning(`${successful} verified, ${failed} failed`);
          }
        }

        setResults(results);
        return results;
      } catch (error) {
        if (showToast) {
          toast.error("Verification failed", {
            description:
              error instanceof Error ? error.message : "Unknown error",
          });
        }

        return [];
      } finally {
        setVerifying(false);
      }
    },
    [],
  );

  /**
   * Check if item is already installed
   */
  const checkInstalled = useCallback((itemId: string): boolean => {
    return isItemInstalled(itemId);
  }, []);

  /**
   * Get installation history
   */
  const getHistory = useCallback((limit?: number) => {
    return limit ? getRecentInstallations(limit) : getInstallationHistory();
  }, []);

  /**
   * Get installation statistics
   */
  const getStats = useCallback(() => {
    return getInstallationStats();
  }, []);

  /**
   * Clear all results
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setStatus(new Map());
  }, []);

  /**
   * Get status for specific item
   */
  const getItemStatus = useCallback(
    (itemId: string): InstallationStatus | undefined => {
      return status.get(itemId);
    },
    [status],
  );

  return {
    verifying,
    results,
    status,
    verifySingle,
    verifyMultiple,
    checkInstalled,
    getHistory,
    getStats,
    clearResults,
    getItemStatus,
  };
}
