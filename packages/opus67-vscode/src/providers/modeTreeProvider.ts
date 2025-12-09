import * as vscode from "vscode";

interface Mode {
  id: string;
  name: string;
  description: string;
  icon: string;
  triggers: string[];
}

const modes: Mode[] = [
  {
    id: "auto",
    name: "AUTO",
    description: "Intelligent mode selection",
    icon: "symbol-event",
    triggers: ["default"],
  },
  {
    id: "ultra",
    name: "ULTRA",
    description: "Maximum reasoning for architecture",
    icon: "rocket",
    triggers: ["architecture", "system design"],
  },
  {
    id: "think",
    name: "THINK",
    description: "Deep analysis and debugging",
    icon: "lightbulb",
    triggers: ["debug", "analyze"],
  },
  {
    id: "build",
    name: "BUILD",
    description: "Production code generation",
    icon: "tools",
    triggers: ["create", "implement"],
  },
  {
    id: "vibe",
    name: "VIBE",
    description: "Rapid prototyping",
    icon: "zap",
    triggers: ["quick", "prototype"],
  },
  {
    id: "light",
    name: "LIGHT",
    description: "Simple questions and syntax",
    icon: "light-bulb",
    triggers: ["how to", "syntax"],
  },
  {
    id: "creative",
    name: "CREATIVE",
    description: "Visual design and UI",
    icon: "paintcan",
    triggers: ["design", "ui"],
  },
  {
    id: "data",
    name: "DATA",
    description: "Analytics and market data",
    icon: "graph",
    triggers: ["analyze data", "market"],
  },
  {
    id: "audit",
    name: "AUDIT",
    description: "Security review",
    icon: "shield",
    triggers: ["security", "audit"],
  },
  {
    id: "swarm",
    name: "SWARM",
    description: "Multi-agent parallel execution",
    icon: "organization",
    triggers: ["parallel", "full build"],
  },
];

export class ModeItem extends vscode.TreeItem {
  constructor(
    public readonly mode: Mode,
    public readonly isActive: boolean,
  ) {
    super(mode.name, vscode.TreeItemCollapsibleState.None);
    this.description = mode.description;
    this.tooltip = `${mode.name}: ${mode.description}\nTriggers: ${mode.triggers.join(", ")}`;
    this.iconPath = new vscode.ThemeIcon(mode.icon);
    this.contextValue = isActive ? "activeMode" : "mode";

    if (isActive) {
      this.description = `${mode.description} (active)`;
    }

    this.command = {
      command: "opus67.switchMode",
      title: "Switch Mode",
      arguments: [mode.id],
    };
  }
}

export class ModeTreeProvider implements vscode.TreeDataProvider<ModeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    ModeItem | undefined | null | void
  > = new vscode.EventEmitter<ModeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    ModeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private activeMode = "auto";

  setActiveMode(mode: string) {
    this.activeMode = mode;
    this.refresh();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ModeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): Thenable<ModeItem[]> {
    return Promise.resolve(
      modes.map((mode) => new ModeItem(mode, mode.id === this.activeMode)),
    );
  }
}
