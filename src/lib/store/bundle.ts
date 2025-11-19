import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RegistryItem } from '@/types/registry';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

export interface BundleItem {
  item: RegistryItem;
  addedAt: string;
}

export interface Stack {
  id: string;
  name: string;
  items: BundleItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface BundleStore {
  isOpen: boolean;

  // New multi-stack state
  stacks: Record<string, Stack>;
  activeStackId: string | null;

  // Legacy actions (operate on active stack)
  addItem: (item: RegistryItem) => void;
  removeItem: (itemId: string) => void;
  clearBundle: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Stack management actions
  createStack: (name: string) => string;
  deleteStack: (stackId: string) => void;
  renameStack: (stackId: string, name: string) => void;
  duplicateStack: (stackId: string) => string;
  setActiveStack: (stackId: string) => void;
  getActiveStack: () => Stack | null;
  addItemToStack: (stackId: string, item: RegistryItem) => void;
  removeItemFromStack: (stackId: string, itemId: string) => void;

  // Computed (operate on active stack)
  itemCount: () => number;
  hasItem: (itemId: string) => boolean;
  getTotalTokenSavings: () => number;
  getAllDependencies: () => RegistryItem[];
}

const DEFAULT_STACK_NAME = 'My Stack';

export const useBundleStore = create<BundleStore>()(
  persist(
    (set, get) => ({
      isOpen: false,

      // Multi-stack state
      stacks: {},
      activeStackId: null,

      // Stack management actions
      createStack: (name) => {
        const stackId = nanoid();
        const now = new Date();

        set((state) => ({
          stacks: {
            ...state.stacks,
            [stackId]: {
              id: stackId,
              name,
              items: [],
              createdAt: now,
              updatedAt: now,
            }
          },
          activeStackId: stackId,
        }));

        toast.success(`Created stack "${name}"`);
        return stackId;
      },

      deleteStack: (stackId) => {
        const stack = get().stacks[stackId];
        if (!stack) {
          toast.error('Stack not found');
          return;
        }

        set((state) => {
          const { [stackId]: deleted, ...remainingStacks } = state.stacks;
          const stackIds = Object.keys(remainingStacks);

          return {
            stacks: remainingStacks,
            activeStackId: state.activeStackId === stackId
              ? (stackIds.length > 0 ? stackIds[0] : null)
              : state.activeStackId
          };
        });

        toast.success(`Deleted stack "${stack.name}"`);
      },

      renameStack: (stackId, name) => {
        const stack = get().stacks[stackId];
        if (!stack) {
          toast.error('Stack not found');
          return;
        }

        set((state) => ({
          stacks: {
            ...state.stacks,
            [stackId]: {
              ...state.stacks[stackId],
              name,
              updatedAt: new Date(),
            }
          }
        }));

        toast.success(`Renamed stack to "${name}"`);
      },

      duplicateStack: (stackId) => {
        const originalStack = get().stacks[stackId];
        if (!originalStack) {
          toast.error('Stack not found');
          return '';
        }

        const newStackId = nanoid();
        const now = new Date();

        set((state) => ({
          stacks: {
            ...state.stacks,
            [newStackId]: {
              id: newStackId,
              name: `${originalStack.name} (Copy)`,
              items: [...originalStack.items],
              createdAt: now,
              updatedAt: now,
            }
          },
          activeStackId: newStackId,
        }));

        toast.success(`Duplicated stack "${originalStack.name}"`);
        return newStackId;
      },

      setActiveStack: (stackId) => {
        const stack = get().stacks[stackId];
        if (!stack) {
          toast.error('Stack not found');
          return;
        }

        set({ activeStackId: stackId });
      },

      getActiveStack: () => {
        const { activeStackId, stacks } = get();
        if (!activeStackId) return null;
        return stacks[activeStackId] || null;
      },

      addItemToStack: (stackId, item) => {
        const stack = get().stacks[stackId];
        if (!stack) {
          toast.error('Stack not found');
          return;
        }

        if (stack.items.some(b => b.item.id === item.id)) {
          toast.info(`${item.name} is already in this stack`);
          return;
        }

        set((state) => ({
          stacks: {
            ...state.stacks,
            [stackId]: {
              ...state.stacks[stackId],
              items: [
                ...state.stacks[stackId].items,
                {
                  item,
                  addedAt: new Date().toISOString()
                }
              ],
              updatedAt: new Date(),
            }
          }
        }));

        toast.success(`Added ${item.name} to ${stack.name}`, {
          description: `${item.kind} • ${item.tokenSavings || 0}% token savings`,
        });
      },

      removeItemFromStack: (stackId, itemId) => {
        const stack = get().stacks[stackId];
        if (!stack) {
          toast.error('Stack not found');
          return;
        }

        const item = stack.items.find(b => b.item.id === itemId)?.item;

        set((state) => ({
          stacks: {
            ...state.stacks,
            [stackId]: {
              ...state.stacks[stackId],
              items: state.stacks[stackId].items.filter((bundleItem) => bundleItem.item.id !== itemId),
              updatedAt: new Date(),
            }
          }
        }));

        if (item) {
          toast.success(`Removed ${item.name} from ${stack.name}`);
        }
      },

      // Legacy actions (operate on active stack)
      addItem: (item) => {
        let { activeStackId, stacks } = get();

        // If no active stack, create default one
        if (!activeStackId || !stacks[activeStackId]) {
          activeStackId = get().createStack(DEFAULT_STACK_NAME);
        }

        get().addItemToStack(activeStackId, item);
      },

      removeItem: (itemId) => {
        const { activeStackId } = get();
        if (!activeStackId) return;

        get().removeItemFromStack(activeStackId, itemId);
      },

      clearBundle: () => {
        const { activeStackId } = get();
        if (!activeStackId) return;

        const stack = get().stacks[activeStackId];
        const count = stack?.items.length || 0;

        set((state) => ({
          stacks: {
            ...state.stacks,
            [activeStackId]: {
              ...state.stacks[activeStackId],
              items: [],
              updatedAt: new Date(),
            }
          }
        }));

        toast.success(`Cleared ${count} items from stack`);
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      itemCount: () => {
        const stack = get().getActiveStack();
        return stack?.items.length || 0;
      },

      hasItem: (itemId) => {
        const stack = get().getActiveStack();
        return stack?.items.some((bundleItem) => bundleItem.item.id === itemId) || false;
      },

      getTotalTokenSavings: () => {
        const stack = get().getActiveStack();
        if (!stack) return 0;

        return stack.items.reduce((total, bundleItem) => {
          return total + (bundleItem.item.tokenSavings || 0);
        }, 0);
      },

      getAllDependencies: () => {
        const stack = get().getActiveStack();
        if (!stack) return [];

        const allDeps = new Set<string>();

        // Collect all unique dependencies
        stack.items.forEach(({ item }) => {
          (item.dependencies || []).forEach(depId => allDeps.add(depId));
        });

        // Remove items that are already in the bundle
        const bundleIds = new Set(stack.items.map(({ item }) => item.id));
        const missingDepIds = Array.from(allDeps).filter(depId => !bundleIds.has(depId));

        // This returns dep IDs; you'd need to resolve them to actual items from registry
        // For now, returning empty array - we'll implement this when building the preview page
        return [];
      }
    }),
    {
      name: 'gicm-bundle-storage',
      partialize: (state) => ({
        stacks: state.stacks,
        activeStackId: state.activeStackId,
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        // Migrate from v0 (old single-stack format) to v1 (multi-stack)
        const state = persistedState as Record<string, unknown>;
        if (version === 0 && state.items && Array.isArray(state.items)) {
          const now = new Date();
          const defaultStackId = nanoid();

          return {
            ...state,
            stacks: {
              [defaultStackId]: {
                id: defaultStackId,
                name: DEFAULT_STACK_NAME,
                items: state.items,
                createdAt: now,
                updatedAt: now,
              }
            },
            activeStackId: defaultStackId,
            items: [], // Clear legacy items after migration
          };
        }

        return state;
      }
    }
  )
);
