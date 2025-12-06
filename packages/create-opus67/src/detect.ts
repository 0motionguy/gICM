import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface DetectedEnvironment {
  id: string;
  name: string;
  detected: boolean;
  path: string;
  configPath: string;
  recommended?: boolean;
}

export interface DetectionResult {
  environments: DetectedEnvironment[];
  recommended: DetectedEnvironment | null;
}

function getClaudeCodePath(): string {
  const home = homedir();
  if (process.platform === 'win32') {
    return join(home, '.claude');
  }
  return join(home, '.claude');
}

function getCursorPath(): string {
  const home = homedir();
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
    return join(appData, 'Cursor');
  } else if (process.platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Cursor');
  }
  return join(home, '.config', 'Cursor');
}

function getVSCodePath(): string {
  const home = homedir();
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
    return join(appData, 'Code');
  } else if (process.platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Code');
  }
  return join(home, '.config', 'Code');
}

function getWindsurfPath(): string {
  const home = homedir();
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
    return join(appData, 'Windsurf');
  } else if (process.platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Windsurf');
  }
  return join(home, '.config', 'windsurf');
}

function getZedPath(): string {
  const home = homedir();
  if (process.platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Zed');
  }
  return join(home, '.config', 'zed');
}

function getReplitPath(): string {
  // Replit uses project-based config
  return process.cwd();
}

function getContinuePath(): string {
  const home = homedir();
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
    return join(appData, 'Continue');
  } else if (process.platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Continue');
  }
  return join(home, '.continue');
}

function getJetBrainsPath(): string {
  const home = homedir();
  if (process.platform === 'win32') {
    // Check common JetBrains installation directories
    return join(home, 'AppData', 'Roaming', 'JetBrains');
  } else if (process.platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'JetBrains');
  }
  return join(home, '.config', 'JetBrains');
}

function getCodeiumPath(): string {
  const home = homedir();
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
    return join(appData, 'Codeium');
  } else if (process.platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Codeium');
  }
  return join(home, '.codeium');
}

function getSupermaven(): string {
  const home = homedir();
  return join(home, '.supermaven');
}

function getAiderPath(): string {
  const home = homedir();
  return join(home, '.aider');
}

export function isCodespaces(): boolean {
  return process.env.CODESPACES === 'true' ||
         process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN !== undefined;
}

export function isGitpod(): boolean {
  return process.env.GITPOD_WORKSPACE_ID !== undefined;
}

export function isReplit(): boolean {
  return process.env.REPL_ID !== undefined || process.env.REPLIT_DEV_DOMAIN !== undefined;
}

export function detectEnvironments(): DetectionResult {
  const inCodespaces = isCodespaces();
  const inGitpod = isGitpod();
  const inReplit = isReplit();

  const environments: DetectedEnvironment[] = [
    // Cloud IDEs (prioritized)
    {
      id: 'codespaces',
      name: 'GitHub Codespaces',
      detected: inCodespaces,
      path: process.cwd(),
      configPath: join(process.cwd(), 'CLAUDE.md'),
      recommended: inCodespaces,
    },
    {
      id: 'gitpod',
      name: 'Gitpod',
      detected: inGitpod,
      path: process.cwd(),
      configPath: join(process.cwd(), 'CLAUDE.md'),
      recommended: inGitpod,
    },
    {
      id: 'replit',
      name: 'Replit',
      detected: inReplit,
      path: getReplitPath(),
      configPath: join(process.cwd(), '.replit'),
      recommended: inReplit,
    },
    // Desktop IDEs with Claude/AI integration
    {
      id: 'claude-code',
      name: 'Claude Code',
      detected: existsSync(getClaudeCodePath()),
      path: getClaudeCodePath(),
      configPath: join(process.cwd(), 'CLAUDE.md'),
      recommended: !inCodespaces && !inGitpod && !inReplit,
    },
    {
      id: 'cursor',
      name: 'Cursor',
      detected: existsSync(getCursorPath()),
      path: getCursorPath(),
      configPath: join(process.cwd(), '.cursorrules'),
    },
    {
      id: 'windsurf',
      name: 'Windsurf',
      detected: existsSync(getWindsurfPath()),
      path: getWindsurfPath(),
      configPath: join(process.cwd(), '.windsurfrules'),
    },
    {
      id: 'continue',
      name: 'Continue.dev',
      detected: existsSync(getContinuePath()),
      path: getContinuePath(),
      configPath: join(getContinuePath(), 'config.json'),
    },
    {
      id: 'aider',
      name: 'Aider',
      detected: existsSync(getAiderPath()),
      path: getAiderPath(),
      configPath: join(getAiderPath(), '.aider.conf.yml'),
    },
    // General purpose IDEs
    {
      id: 'vscode',
      name: 'VS Code',
      detected: existsSync(getVSCodePath()),
      path: getVSCodePath(),
      configPath: join(process.cwd(), '.vscode', 'settings.json'),
    },
    {
      id: 'jetbrains',
      name: 'JetBrains IDEs',
      detected: existsSync(getJetBrainsPath()),
      path: getJetBrainsPath(),
      configPath: join(getJetBrainsPath(), '.opus67.config'),
    },
    {
      id: 'zed',
      name: 'Zed',
      detected: existsSync(getZedPath()),
      path: getZedPath(),
      configPath: join(getZedPath(), 'settings.json'),
    },
    // AI Assistants/Extensions
    {
      id: 'codeium',
      name: 'Codeium',
      detected: existsSync(getCodeiumPath()),
      path: getCodeiumPath(),
      configPath: join(getCodeiumPath(), 'config.json'),
    },
    {
      id: 'supermaven',
      name: 'Supermaven',
      detected: existsSync(getSupermaven()),
      path: getSupermaven(),
      configPath: join(getSupermaven(), 'config.json'),
    },
    // Manual fallback
    {
      id: 'manual',
      name: 'Manual Installation',
      detected: true, // Always available
      path: process.cwd(),
      configPath: join(process.cwd(), '.opus67', 'config.json'),
    },
  ];

  // Find recommended environment
  const recommended = environments.find((e) => e.detected && e.recommended) ||
    environments.find((e) => e.detected && e.id !== 'manual') ||
    environments.find((e) => e.id === 'manual')!;

  return {
    environments,
    recommended,
  };
}

export function getEnvironmentChoices(result: DetectionResult): Array<{ name: string; value: string; hint?: string }> {
  return result.environments
    .filter((env) => env.detected || env.id === 'manual')
    .map((env) => ({
      name: env.name,
      value: env.id,
      hint: env.recommended ? '(Recommended)' : env.detected ? '(Detected)' : undefined,
    }));
}
