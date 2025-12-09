import * as vscode from "vscode";

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

// Sample skills - full list would be loaded from registry
const skillCategories: Record<string, Skill[]> = {
  Blockchain: [
    {
      id: "solana-anchor-expert",
      name: "Solana Anchor Expert",
      category: "Blockchain",
      description: "Anchor framework, PDAs, CPIs",
    },
    {
      id: "bonding-curve-master",
      name: "Bonding Curve Master",
      category: "Blockchain",
      description: "Token economics, AMM curves",
    },
    {
      id: "evm-solidity-expert",
      name: "EVM Solidity Expert",
      category: "Blockchain",
      description: "Smart contracts, gas optimization",
    },
    {
      id: "smart-contract-auditor",
      name: "Smart Contract Auditor",
      category: "Blockchain",
      description: "Security analysis, vulnerability detection",
    },
    {
      id: "defi-data-analyst",
      name: "DeFi Data Analyst",
      category: "Blockchain",
      description: "On-chain analytics, TVL tracking",
    },
  ],
  Frontend: [
    {
      id: "nextjs-14-expert",
      name: "Next.js 14 Expert",
      category: "Frontend",
      description: "App Router, RSC, SSR/SSG",
    },
    {
      id: "react-typescript-master",
      name: "React TypeScript Master",
      category: "Frontend",
      description: "Type-safe components, hooks",
    },
    {
      id: "tailwind-css-pro",
      name: "Tailwind CSS Pro",
      category: "Frontend",
      description: "Utility-first styling, responsive design",
    },
    {
      id: "shadcn-ui-expert",
      name: "shadcn/ui Expert",
      category: "Frontend",
      description: "Radix primitives, component patterns",
    },
    {
      id: "web3-wallet-integration",
      name: "Web3 Wallet Integration",
      category: "Frontend",
      description: "Wallet adapters, signing",
    },
  ],
  Backend: [
    {
      id: "nodejs-api-architect",
      name: "Node.js API Architect",
      category: "Backend",
      description: "Express/Fastify, REST/GraphQL",
    },
    {
      id: "database-schema-expert",
      name: "Database Schema Expert",
      category: "Backend",
      description: "Postgres, migrations, indexes",
    },
    {
      id: "redis-caching-pro",
      name: "Redis Caching Pro",
      category: "Backend",
      description: "Caching strategies, pub/sub",
    },
    {
      id: "graphql-api-designer",
      name: "GraphQL API Designer",
      category: "Backend",
      description: "Schema design, resolvers",
    },
    {
      id: "websocket-realtime",
      name: "WebSocket Realtime",
      category: "Backend",
      description: "Socket.io, real-time updates",
    },
  ],
  DevOps: [
    {
      id: "docker-kubernetes-pro",
      name: "Docker/Kubernetes Pro",
      category: "DevOps",
      description: "Containerization, orchestration",
    },
    {
      id: "ci-cd-automation",
      name: "CI/CD Automation",
      category: "DevOps",
      description: "GitHub Actions, deployment",
    },
    {
      id: "aws-infrastructure",
      name: "AWS Infrastructure",
      category: "DevOps",
      description: "EC2, Lambda, RDS, S3",
    },
  ],
};

export class SkillItem extends vscode.TreeItem {
  constructor(public readonly skill: Skill) {
    super(skill.name, vscode.TreeItemCollapsibleState.None);
    this.description = skill.description;
    this.tooltip = `${skill.name}\n${skill.description}`;
    this.iconPath = new vscode.ThemeIcon("symbol-method");
    this.contextValue = "skill";

    this.command = {
      command: "opus67.loadSkill",
      title: "Load Skill",
      arguments: [this],
    };
  }
}

export class CategoryItem extends vscode.TreeItem {
  constructor(
    public readonly category: string,
    public readonly skills: Skill[],
  ) {
    super(category, vscode.TreeItemCollapsibleState.Expanded);
    this.description = `${skills.length} skills`;
    this.iconPath = new vscode.ThemeIcon("folder");
    this.contextValue = "category";
  }
}

export class SkillTreeProvider
  implements vscode.TreeDataProvider<SkillItem | CategoryItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    SkillItem | CategoryItem | undefined | null | void
  > = new vscode.EventEmitter<
    SkillItem | CategoryItem | undefined | null | void
  >();
  readonly onDidChangeTreeData: vscode.Event<
    SkillItem | CategoryItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SkillItem | CategoryItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: CategoryItem): Thenable<(SkillItem | CategoryItem)[]> {
    if (!element) {
      // Return categories
      return Promise.resolve(
        Object.entries(skillCategories).map(
          ([category, skills]) => new CategoryItem(category, skills),
        ),
      );
    }

    // Return skills in category
    return Promise.resolve(element.skills.map((skill) => new SkillItem(skill)));
  }

  getSkills(): SkillItem[] {
    return Object.values(skillCategories)
      .flat()
      .map((skill) => new SkillItem(skill));
  }
}
