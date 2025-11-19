"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard, Search, Layers, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Shortcut {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

const SHORTCUTS: Shortcut[] = [
  {
    keys: ["⌘", "K"],
    description: "Focus search",
    icon: <Search className="w-4 h-4" />,
  },
  {
    keys: ["Esc"],
    description: "Clear search / Close modals",
    icon: <X className="w-4 h-4" />,
  },
  {
    keys: ["⌘", "S"],
    description: "Save current stack",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    keys: ["⌘", "E"],
    description: "Export stack",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    keys: ["?"],
    description: "Toggle this help panel",
    icon: <Keyboard className="w-4 h-4" />,
  },
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle shortcuts panel with "?" key
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        // Don't trigger if typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Close on Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Help Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40 grid place-items-center group"
        title="Keyboard Shortcuts (Press ?)"
        aria-label="Show keyboard shortcuts"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Keyboard className="w-5 h-5" />
      </motion.button>

      {/* Shortcuts Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-lime-400 to-emerald-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Keyboard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Keyboard Shortcuts
                      </h2>
                      <p className="text-xs text-white/80">
                        Navigate faster with these shortcuts
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    aria-label="Close keyboard shortcuts"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Shortcuts List */}
              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                {SHORTCUTS.map((shortcut, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-3 px-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {shortcut.icon && (
                        <div className="text-zinc-600 dark:text-zinc-400">
                          {shortcut.icon}
                        </div>
                      )}
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {shortcut.description}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 text-xs font-mono font-semibold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded shadow-sm text-zinc-700 dark:text-zinc-300"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded">?</kbd> anytime to toggle this panel
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
