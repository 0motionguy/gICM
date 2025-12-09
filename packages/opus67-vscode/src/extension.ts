import * as vscode from "vscode";
import { ModeTreeProvider, ModeItem } from "./providers/modeTreeProvider";
import { SkillTreeProvider, SkillItem } from "./providers/skillTreeProvider";
import { AgentTreeProvider, AgentItem } from "./providers/agentTreeProvider";

let statusBarItem: vscode.StatusBarItem;
let currentMode = "auto";

const modeIcons: Record<string, string> = {
  auto: "$(symbol-event)",
  ultra: "$(rocket)",
  think: "$(lightbulb)",
  build: "$(tools)",
  vibe: "$(zap)",
  light: "$(light-bulb)",
  creative: "$(paintcan)",
  data: "$(graph)",
  audit: "$(shield)",
  swarm: "$(organization)",
};

export function activate(context: vscode.ExtensionContext) {
  console.log("OPUS 67 v6.1.0 activated");

  // Initialize providers
  const modeProvider = new ModeTreeProvider();
  const skillProvider = new SkillTreeProvider();
  const agentProvider = new AgentTreeProvider();

  // Register tree views
  vscode.window.registerTreeDataProvider("opus67.modes", modeProvider);
  vscode.window.registerTreeDataProvider("opus67.skills", skillProvider);
  vscode.window.registerTreeDataProvider("opus67.agents", agentProvider);

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusBarItem.command = "opus67.switchMode";
  updateStatusBar();
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("opus67.switchMode", async () => {
      const modes = [
        "auto",
        "ultra",
        "think",
        "build",
        "vibe",
        "light",
        "creative",
        "data",
        "audit",
        "swarm",
      ];
      const modeDescriptions: Record<string, string> = {
        auto: "Intelligent mode selection",
        ultra: "Maximum reasoning for architecture",
        think: "Deep analysis and debugging",
        build: "Production code generation",
        vibe: "Rapid prototyping",
        light: "Simple questions and syntax",
        creative: "Visual design and UI",
        data: "Analytics and market data",
        audit: "Security review",
        swarm: "Multi-agent parallel execution",
      };

      const items = modes.map((mode) => ({
        label: `${modeIcons[mode]} ${mode.toUpperCase()}`,
        description: modeDescriptions[mode],
        mode,
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: "Select OPUS 67 Mode",
      });

      if (selected) {
        currentMode = selected.mode;
        updateStatusBar();
        vscode.window.showInformationMessage(
          `OPUS 67: Mode set to ${currentMode.toUpperCase()}`,
        );
        modeProvider.setActiveMode(currentMode);
      }
    }),

    vscode.commands.registerCommand(
      "opus67.loadSkill",
      async (skill?: SkillItem) => {
        if (skill) {
          vscode.window.showInformationMessage(
            `OPUS 67: Loaded skill "${skill.label}"`,
          );
          return;
        }

        const skills = skillProvider.getSkills();
        const items = skills.map((s) => ({
          label: s.label as string,
          description: typeof s.description === "string" ? s.description : "",
        }));

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: "Select Skill to Load",
        });

        if (selected) {
          vscode.window.showInformationMessage(
            `OPUS 67: Loaded skill "${selected.label}"`,
          );
        }
      },
    ),

    vscode.commands.registerCommand(
      "opus67.spawnAgent",
      async (agent?: AgentItem) => {
        if (agent) {
          vscode.window.showInformationMessage(
            `OPUS 67: Spawning agent "${agent.label}"`,
          );
          return;
        }

        const agents = agentProvider.getAgents();
        const items = agents.map((a) => ({
          label: a.label as string,
          description: typeof a.description === "string" ? a.description : "",
        }));

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: "Select Agent to Spawn",
        });

        if (selected) {
          vscode.window.showInformationMessage(
            `OPUS 67: Spawning agent "${selected.label}"`,
          );
        }
      },
    ),

    vscode.commands.registerCommand("opus67.showDashboard", () => {
      const panel = vscode.window.createWebviewPanel(
        "opus67Dashboard",
        "OPUS 67 Dashboard",
        vscode.ViewColumn.One,
        { enableScripts: true },
      );

      panel.webview.html = getDashboardHtml();
    }),

    vscode.commands.registerCommand("opus67.refresh", () => {
      modeProvider.refresh();
      skillProvider.refresh();
      agentProvider.refresh();
      vscode.window.showInformationMessage("OPUS 67: Refreshed");
    }),
  );

  // Show welcome message
  vscode.window.showInformationMessage(
    "OPUS 67 v6.1.0 ready - 141 skills, 83 MCPs, 30 modes, 107 agents",
  );
}

function updateStatusBar() {
  const icon = modeIcons[currentMode] || "$(symbol-event)";
  statusBarItem.text = `${icon} OPUS 67: ${currentMode.toUpperCase()}`;
  statusBarItem.tooltip = `Current mode: ${currentMode}\nClick to switch modes`;
}

function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OPUS 67 Dashboard</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      padding: 20px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2.5em;
      background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 5px;
    }
    .version {
      color: var(--vscode-descriptionForeground);
      font-size: 1.1em;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 30px 0;
    }
    .stat-card {
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .stat-number {
      font-size: 2.5em;
      font-weight: bold;
      color: var(--vscode-textLink-foreground);
    }
    .stat-label {
      color: var(--vscode-descriptionForeground);
      margin-top: 5px;
    }
    .section {
      margin-top: 30px;
    }
    .section h2 {
      border-bottom: 1px solid var(--vscode-input-border);
      padding-bottom: 10px;
    }
    .modes-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-top: 15px;
    }
    .mode-chip {
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 8px 12px;
      border-radius: 4px;
      text-align: center;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>OPUS 67</h1>
    <div class="version">v6.1.0 "Memory Unified"</div>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-number">141</div>
      <div class="stat-label">Skills</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">83</div>
      <div class="stat-label">MCPs</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">30</div>
      <div class="stat-label">Modes</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">107</div>
      <div class="stat-label">Agents</div>
    </div>
  </div>

  <div class="section">
    <h2>Operating Modes</h2>
    <div class="modes-grid">
      <div class="mode-chip">AUTO</div>
      <div class="mode-chip">ULTRA</div>
      <div class="mode-chip">THINK</div>
      <div class="mode-chip">BUILD</div>
      <div class="mode-chip">VIBE</div>
      <div class="mode-chip">LIGHT</div>
      <div class="mode-chip">CREATIVE</div>
      <div class="mode-chip">DATA</div>
      <div class="mode-chip">AUDIT</div>
      <div class="mode-chip">SWARM</div>
    </div>
  </div>

  <div class="section">
    <h2>Quick Actions</h2>
    <p>Use the sidebar tree views to browse and load skills, modes, and agents.</p>
    <p>Use the status bar (bottom right) to quickly switch modes.</p>
  </div>
</body>
</html>`;
}

export function deactivate() {
  console.log("OPUS 67 deactivated");
}
