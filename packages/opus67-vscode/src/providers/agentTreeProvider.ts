import * as vscode from "vscode";

interface Agent {
  id: string;
  name: string;
  category: string;
  description: string;
}

// Sample agents - full list would be loaded from registry
const agentCategories: Record<string, Agent[]> = {
  "Code Quality": [
    {
      id: "code-reviewer",
      name: "Code Reviewer",
      category: "Code Quality",
      description: "PR review, best practices",
    },
    {
      id: "test-automator",
      name: "Test Automator",
      category: "Code Quality",
      description: "Jest, Vitest, E2E tests",
    },
    {
      id: "security-auditor",
      name: "Security Auditor",
      category: "Code Quality",
      description: "OWASP, vulnerability scanning",
    },
    {
      id: "performance-engineer",
      name: "Performance Engineer",
      category: "Code Quality",
      description: "Optimization, profiling",
    },
  ],
  Web3: [
    {
      id: "solana-anchor-builder",
      name: "Solana Anchor Builder",
      category: "Web3",
      description: "Anchor programs, PDAs",
    },
    {
      id: "evm-contract-builder",
      name: "EVM Contract Builder",
      category: "Web3",
      description: "Solidity, Hardhat, Foundry",
    },
    {
      id: "defi-integrator",
      name: "DeFi Integrator",
      category: "Web3",
      description: "DEX, lending, yield",
    },
    {
      id: "nft-architect",
      name: "NFT Architect",
      category: "Web3",
      description: "Collections, metadata, marketplaces",
    },
  ],
  Frontend: [
    {
      id: "react-component-builder",
      name: "React Component Builder",
      category: "Frontend",
      description: "Components, hooks, patterns",
    },
    {
      id: "ui-designer",
      name: "UI Designer",
      category: "Frontend",
      description: "Tailwind, shadcn, animations",
    },
    {
      id: "state-manager",
      name: "State Manager",
      category: "Frontend",
      description: "Zustand, Redux, Jotai",
    },
  ],
  Backend: [
    {
      id: "api-architect",
      name: "API Architect",
      category: "Backend",
      description: "REST, GraphQL, tRPC",
    },
    {
      id: "database-expert",
      name: "Database Expert",
      category: "Backend",
      description: "Postgres, migrations, queries",
    },
    {
      id: "realtime-specialist",
      name: "Realtime Specialist",
      category: "Backend",
      description: "WebSocket, SSE, pub/sub",
    },
  ],
  DevOps: [
    {
      id: "deployment-engineer",
      name: "Deployment Engineer",
      category: "DevOps",
      description: "CI/CD, Docker, K8s",
    },
    {
      id: "cloud-architect",
      name: "Cloud Architect",
      category: "DevOps",
      description: "AWS, GCP, Vercel",
    },
    {
      id: "devops-troubleshooter",
      name: "DevOps Troubleshooter",
      category: "DevOps",
      description: "Debugging, monitoring",
    },
  ],
};

export class AgentItem extends vscode.TreeItem {
  constructor(public readonly agent: Agent) {
    super(agent.name, vscode.TreeItemCollapsibleState.None);
    this.description = agent.description;
    this.tooltip = `${agent.name}\n${agent.description}`;
    this.iconPath = new vscode.ThemeIcon("person");
    this.contextValue = "agent";

    this.command = {
      command: "opus67.spawnAgent",
      title: "Spawn Agent",
      arguments: [this],
    };
  }
}

export class AgentCategoryItem extends vscode.TreeItem {
  constructor(
    public readonly category: string,
    public readonly agents: Agent[],
  ) {
    super(category, vscode.TreeItemCollapsibleState.Expanded);
    this.description = `${agents.length} agents`;
    this.iconPath = new vscode.ThemeIcon("folder");
    this.contextValue = "agentCategory";
  }
}

export class AgentTreeProvider
  implements vscode.TreeDataProvider<AgentItem | AgentCategoryItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    AgentItem | AgentCategoryItem | undefined | null | void
  > = new vscode.EventEmitter<
    AgentItem | AgentCategoryItem | undefined | null | void
  >();
  readonly onDidChangeTreeData: vscode.Event<
    AgentItem | AgentCategoryItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: AgentItem | AgentCategoryItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: AgentCategoryItem,
  ): Thenable<(AgentItem | AgentCategoryItem)[]> {
    if (!element) {
      // Return categories
      return Promise.resolve(
        Object.entries(agentCategories).map(
          ([category, agents]) => new AgentCategoryItem(category, agents),
        ),
      );
    }

    // Return agents in category
    return Promise.resolve(element.agents.map((agent) => new AgentItem(agent)));
  }

  getAgents(): AgentItem[] {
    return Object.values(agentCategories)
      .flat()
      .map((agent) => new AgentItem(agent));
  }
}
