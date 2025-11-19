"use client";

import { useState } from "react";
import { Palette, Bot, Zap, Terminal, Plug, Settings, Workflow } from "lucide-react";
import { AGENTS, SKILLS, COMMANDS, MCPS } from "@/lib/registry";
import { SETTINGS } from "@/lib/settings-registry";
import { WORKFLOWS } from "@/lib/workflows";
import { DESIGN_ASSETS } from "@/lib/registry-design";
import { ScrambleText } from "@/components/ui/scramble-text";

export type MenuCategory = "all" | "agents" | "skills" | "commands" | "settings" | "mcp" | "workflows" | "design";

interface MenuBuilderProps {
  selected: MenuCategory;
  onSelect: (category: MenuCategory) => void;
}

const MENU_ITEMS = [
  {
    id: "all" as MenuCategory,
    label: "All",
    icon: null,
    count: AGENTS.length + SKILLS.length + COMMANDS.length + MCPS.length + SETTINGS.length + WORKFLOWS.length + DESIGN_ASSETS.length,
  },
  {
    id: "agents" as MenuCategory,
    label: "Agents",
    icon: Bot,
    count: AGENTS.length,
  },
  {
    id: "skills" as MenuCategory,
    label: "Skills",
    icon: Zap,
    count: SKILLS.length,
  },
  {
    id: "commands" as MenuCategory,
    label: "Commands",
    icon: Terminal,
    count: COMMANDS.length,
  },
  {
    id: "settings" as MenuCategory,
    label: "Settings",
    icon: Settings,
    count: SETTINGS.length,
  },
  {
    id: "mcp" as MenuCategory,
    label: "MCP",
    icon: Plug,
    count: MCPS.length,
  },
  {
    id: "design" as MenuCategory,
    label: "Design",
    icon: Palette,
    count: DESIGN_ASSETS.length,
  },
  {
    id: "workflows" as MenuCategory,
    label: "Workflows",
    icon: Workflow,
    count: WORKFLOWS.length,
  },
];

/**
 * MenuBuilder Component
 * Horizontal navigation menu for selecting item types
 * Aether Theme Adjusted
 */
export function MenuBuilder({ selected, onSelect }: MenuBuilderProps) {
  const [hoveredId, setHoveredId] = useState<MenuCategory | null>(null);

  return (
    <div className="sticky top-0 z-40 py-2">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Horizontal scrollable menu */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 px-2 border border-white/10 bg-[#0A0A0B]/80 backdrop-blur-xl rounded-xl shadow-xl">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = selected === item.id;
            const isHovered = hoveredId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap
                  transition-all duration-200
                  ${isActive
                    ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 shadow-[0_0_15px_-5px_rgba(0,240,255,0.3)]"
                    : "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                {Icon && <Icon size={16} />}
                <span className="inline-block">
                  {isHovered ? (
                    <ScrambleText text={item.label} trigger="hover" duration={250} />
                  ) : (
                    item.label
                  )}
                </span>
                {item.count > 0 && (
                  <span
                    className={`
                      ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                      ${isActive
                        ? "bg-[#00F0FF]/20 text-[#00F0FF]"
                        : "bg-white/10 text-zinc-500 group-hover:text-zinc-300"
                      }
                    `}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
