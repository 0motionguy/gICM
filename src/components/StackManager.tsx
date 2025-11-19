"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Eye,
  X,
  Check,
  GitCompare,
} from "lucide-react";
import { useStackCollections } from "@/lib/store/stack-collections";
import { formatDistanceToNow } from "date-fns";

interface StackManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StackManager({ isOpen, onClose }: StackManagerProps) {
  const {
    stacks,
    activeStackId,
    createStack,
    deleteStack,
    renameStack,
    duplicateStack,
    setActiveStack,
    getItemCount,
  } = useStackCollections();

  const [newStackName, setNewStackName] = useState("");
  const [editingStackId, setEditingStackId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateStack = () => {
    if (!newStackName.trim()) return;

    createStack(newStackName.trim());
    setNewStackName("");
    setIsCreating(false);
  };

  const handleRename = (stackId: string) => {
    if (!editingName.trim()) {
      setEditingStackId(null);
      return;
    }

    renameStack(stackId, editingName.trim());
    setEditingStackId(null);
    setEditingName("");
  };

  const handleDuplicate = (stackId: string) => {
    duplicateStack(stackId);
  };

  const handleDelete = (stackId: string) => {
    if (confirm("Are you sure you want to delete this stack?")) {
      deleteStack(stackId);
    }
  };

  const handleSwitch = (stackId: string) => {
    setActiveStack(stackId);
  };

  const startEditing = (stackId: string, currentName: string) => {
    setEditingStackId(stackId);
    setEditingName(currentName);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-gradient-to-br from-lime-50 to-emerald-50 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/10 bg-white/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-black grid place-items-center">
              <Layers className="w-5 h-5 text-lime-300" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black">Stack Collections</h2>
              <p className="text-sm text-black/60">{stacks.length} stacks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            aria-label="Close stack manager"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-88px)] overflow-y-auto p-6 space-y-4">
          {/* Create New Stack */}
          <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-4">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-black/30 text-black/80 hover:border-black/60 hover:bg-black/5 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Create New Stack</span>
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newStackName}
                  onChange={(e) => setNewStackName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateStack();
                    if (e.key === "Escape") {
                      setIsCreating(false);
                      setNewStackName("");
                    }
                  }}
                  placeholder="Enter stack name..."
                  className="w-full px-4 py-2 rounded-lg border border-black/40 bg-white outline-none text-sm focus:border-black/80"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateStack}
                    disabled={!newStackName.trim()}
                    className="flex-1 px-4 py-2 rounded-lg bg-black text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 transition-colors"
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewStackName("");
                    }}
                    className="px-4 py-2 rounded-lg border border-black/40 text-black/80 hover:bg-black/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stack List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {stacks.map((stack) => {
                const isActive = stack.id === activeStackId;
                const itemCount = getItemCount(stack.id);
                const isEditing = editingStackId === stack.id;

                return (
                  <motion.div
                    key={stack.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`rounded-xl border ${
                      isActive
                        ? "border-black/80 bg-gradient-to-br from-lime-100 to-emerald-100"
                        : "border-black/20 bg-white/90"
                    } backdrop-blur p-4 shadow-sm hover:shadow-md transition-all`}
                  >
                    {/* Stack Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(stack.id);
                              if (e.key === "Escape") {
                                setEditingStackId(null);
                                setEditingName("");
                              }
                            }}
                            onBlur={() => handleRename(stack.id)}
                            className="w-full px-2 py-1 rounded border border-black/40 text-base font-bold text-black outline-none focus:border-black/80"
                            autoFocus
                          />
                        ) : (
                          <h3 className="text-base font-bold text-black truncate">
                            {stack.name}
                          </h3>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-black/60">
                          <span>{itemCount} items</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(stack.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      {isActive && (
                        <div className="px-2 py-1 rounded-full bg-lime-300 text-black text-xs font-bold">
                          Active
                        </div>
                      )}
                    </div>

                    {/* Stack Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {!isActive && (
                        <button
                          onClick={() => handleSwitch(stack.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-black/90 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Switch
                        </button>
                      )}

                      <button
                        onClick={() => startEditing(stack.id, stack.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/40 text-black/80 text-xs hover:bg-black/5 transition-colors"
                        title="Rename"
                        aria-label="Rename stack"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(stack.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/40 text-black/80 text-xs hover:bg-black/5 transition-colors"
                        title="Duplicate"
                        aria-label="Duplicate stack"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {}}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/40 text-black/80 text-xs hover:bg-black/5 transition-colors"
                        title="Compare"
                        aria-label="Compare stack"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(stack.id)}
                        disabled={stacks.length === 1}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400 text-red-600 text-xs hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                        aria-label="Delete stack"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {stacks.length === 0 && (
              <div className="text-center py-12 text-black/60">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No stacks yet</p>
                <p className="text-xs mt-1">Create your first stack to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
