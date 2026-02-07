/**
 * Points & Gamification System
 * Track user progress, achievements, and rewards
 */

export type PointAction =
  // Installation actions
  | "install_agent"
  | "install_skill"
  | "install_command"
  | "install_mcp"
  | "install_setting"
  // Stack actions
  | "create_stack"
  | "fork_stack"
  | "share_stack"
  | "import_stack"
  | "verify_installation"
  // Social actions
  | "share_social"
  | "invite_user"
  | "join_waitlist"
  // Engagement
  | "daily_visit"
  | "complete_profile"
  | "first_gist_export";

export interface PointsConfig {
  action: PointAction;
  points: number;
  label: string;
  description: string;
  category: "install" | "stack" | "social" | "engagement";
  icon?: string;
  maxDaily?: number; // Max times per day this action can earn points
  oneTime?: boolean; // Can only earn once ever
}

export const POINTS_CONFIG: Record<PointAction, PointsConfig> = {
  // Installation (10-25 points)
  install_agent: {
    action: "install_agent",
    points: 15,
    label: "Install Agent",
    description: "Installed a specialized agent",
    category: "install",
    icon: "🤖",
  },
  install_skill: {
    action: "install_skill",
    points: 10,
    label: "Install Skill",
    description: "Installed a progressive skill",
    category: "install",
    icon: "⚡",
  },
  install_command: {
    action: "install_command",
    points: 10,
    label: "Install Command",
    description: "Installed a command",
    category: "install",
    icon: "⌘",
  },
  install_mcp: {
    action: "install_mcp",
    points: 20,
    label: "Install MCP",
    description: "Integrated an MCP server",
    category: "install",
    icon: "🔌",
  },
  install_setting: {
    action: "install_setting",
    points: 5,
    label: "Apply Setting",
    description: "Applied a production setting",
    category: "install",
    icon: "⚙️",
  },

  // Stack actions (25-100 points)
  create_stack: {
    action: "create_stack",
    points: 50,
    label: "Create Stack",
    description: "Created a custom stack configuration",
    category: "stack",
    icon: "📦",
  },
  fork_stack: {
    action: "fork_stack",
    points: 30,
    label: "Fork Stack",
    description: "Forked and customized a stack",
    category: "stack",
    icon: "🍴",
  },
  share_stack: {
    action: "share_stack",
    points: 40,
    label: "Share Stack",
    description: "Shared your stack with others",
    category: "stack",
    icon: "🔗",
  },
  import_stack: {
    action: "import_stack",
    points: 25,
    label: "Import Stack",
    description: "Imported a community stack",
    category: "stack",
    icon: "⬇️",
  },
  verify_installation: {
    action: "verify_installation",
    points: 15,
    label: "Verify Install",
    description: "Verified installation success",
    category: "install",
    icon: "✅",
  },

  // Social actions (50-200 points)
  share_social: {
    action: "share_social",
    points: 50,
    label: "Social Share",
    description: "Shared on social media",
    category: "social",
    icon: "📢",
    maxDaily: 3,
  },
  invite_user: {
    action: "invite_user",
    points: 100,
    label: "Invite User",
    description: "Successfully invited a new user",
    category: "social",
    icon: "👥",
  },
  join_waitlist: {
    action: "join_waitlist",
    points: 25,
    label: "Join Waitlist",
    description: "Joined the alpha waitlist",
    category: "engagement",
    icon: "🎟️",
    oneTime: true,
  },

  // Engagement (10-50 points)
  daily_visit: {
    action: "daily_visit",
    points: 10,
    label: "Daily Visit",
    description: "Visited ClawdBot today",
    category: "engagement",
    icon: "📅",
    maxDaily: 1,
  },
  complete_profile: {
    action: "complete_profile",
    points: 50,
    label: "Complete Profile",
    description: "Completed your profile",
    category: "engagement",
    icon: "👤",
    oneTime: true,
  },
  first_gist_export: {
    action: "first_gist_export",
    points: 75,
    label: "First Gist Export",
    description: "Exported your first stack to GitHub Gist",
    category: "stack",
    icon: "🎉",
    oneTime: true,
  },
};

export interface PointsTransaction {
  id: string;
  action: PointAction;
  points: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserLevel {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  badge: string;
  color: string;
  perks?: string[];
}

export const LEVELS: UserLevel[] = [
  {
    level: 0,
    name: "Newcomer",
    minPoints: 0,
    maxPoints: 99,
    badge: "🌱",
    color: "#64748b",
    perks: ["Access to basic registry items"],
  },
  {
    level: 1,
    name: "Explorer",
    minPoints: 100,
    maxPoints: 249,
    badge: "🔍",
    color: "#3b82f6",
    perks: ["Create up to 3 stacks", "Basic sharing"],
  },
  {
    level: 2,
    name: "Builder",
    minPoints: 250,
    maxPoints: 499,
    badge: "🛠️",
    color: "#8b5cf6",
    perks: ["Create unlimited stacks", "GitHub Gist export", "Priority support"],
  },
  {
    level: 3,
    name: "Architect",
    minPoints: 500,
    maxPoints: 999,
    badge: "🏗️",
    color: "#ec4899",
    perks: ["Featured stacks", "Custom badges", "Analytics dashboard"],
  },
  {
    level: 4,
    name: "Master",
    minPoints: 1000,
    maxPoints: 2499,
    badge: "⭐",
    color: "#f59e0b",
    perks: ["Verified creator badge", "Early access to features", "Revenue sharing"],
  },
  {
    level: 5,
    name: "Legend",
    minPoints: 2500,
    maxPoints: Infinity,
    badge: "👑",
    color: "#84cc16",
    perks: [
      "Legendary status",
      "Exclusive community access",
      "Direct input on roadmap",
      "Custom agent training",
    ],
  },
];

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  requirement: string;
  category: "install" | "stack" | "social" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Installation achievements
  {
    id: "first_install",
    name: "First Steps",
    description: "Installed your first item",
    icon: "🎯",
    points: 10,
    requirement: "install_any_1",
    category: "install",
    rarity: "common",
  },
  {
    id: "agent_collector",
    name: "Agent Collector",
    description: "Installed 10 agents",
    icon: "🤖",
    points: 100,
    requirement: "install_agent_10",
    category: "install",
    rarity: "rare",
  },
  {
    id: "skill_master",
    name: "Skill Master",
    description: "Installed 20 skills",
    icon: "⚡",
    points: 150,
    requirement: "install_skill_20",
    category: "install",
    rarity: "rare",
  },
  {
    id: "mcp_expert",
    name: "MCP Expert",
    description: "Integrated 5 MCP servers",
    icon: "🔌",
    points: 200,
    requirement: "install_mcp_5",
    category: "install",
    rarity: "epic",
  },

  // Stack achievements
  {
    id: "stack_creator",
    name: "Stack Creator",
    description: "Created your first stack",
    icon: "📦",
    points: 50,
    requirement: "create_stack_1",
    category: "stack",
    rarity: "common",
  },
  {
    id: "stack_curator",
    name: "Stack Curator",
    description: "Created 5 different stacks",
    icon: "🎨",
    points: 200,
    requirement: "create_stack_5",
    category: "stack",
    rarity: "rare",
  },
  {
    id: "remix_pioneer",
    name: "Remix Pioneer",
    description: "Forked 3 community stacks",
    icon: "🍴",
    points: 100,
    requirement: "fork_stack_3",
    category: "stack",
    rarity: "rare",
  },

  // Social achievements
  {
    id: "influencer",
    name: "Influencer",
    description: "Your stack was forked 10 times",
    icon: "🌟",
    points: 500,
    requirement: "stack_forked_10",
    category: "social",
    rarity: "epic",
  },
  {
    id: "viral",
    name: "Viral",
    description: "Your stack was shared 50 times",
    icon: "🚀",
    points: 1000,
    requirement: "stack_shared_50",
    category: "social",
    rarity: "legendary",
  },
  {
    id: "community_champion",
    name: "Community Champion",
    description: "Invited 5 users who joined",
    icon: "👥",
    points: 500,
    requirement: "invite_user_5",
    category: "social",
    rarity: "epic",
  },

  // Special achievements
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Joined during alpha",
    icon: "🎟️",
    points: 100,
    requirement: "join_alpha",
    category: "special",
    rarity: "rare",
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "7 day visit streak",
    icon: "🔥",
    points: 100,
    requirement: "daily_streak_7",
    category: "special",
    rarity: "rare",
  },
  {
    id: "streak_30",
    name: "Month Master",
    description: "30 day visit streak",
    icon: "💎",
    points: 500,
    requirement: "daily_streak_30",
    category: "special",
    rarity: "epic",
  },
  {
    id: "perfect_install",
    name: "Perfect Install",
    description: "10 verified installations with 100% success",
    icon: "✨",
    points: 200,
    requirement: "verify_install_perfect_10",
    category: "install",
    rarity: "epic",
  },
];

export interface UserPoints {
  totalPoints: number;
  currentLevel: UserLevel;
  nextLevel: UserLevel | null;
  pointsToNextLevel: number;
  transactions: PointsTransaction[];
  achievements: string[]; // Achievement IDs
  stats: {
    agentsInstalled: number;
    skillsInstalled: number;
    commandsInstalled: number;
    mcpsInstalled: number;
    stacksCreated: number;
    stacksForked: number;
    stacksShared: number;
    dailyStreak: number;
    longestStreak: number;
    lastVisit: string;
  };
}

/**
 * Generate transaction ID
 */
export function generateTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get user level from total points
 */
export function getUserLevel(totalPoints: number): UserLevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Get next level
 */
export function getNextLevel(currentLevel: UserLevel): UserLevel | null {
  const currentIndex = LEVELS.findIndex((l) => l.level === currentLevel.level);
  if (currentIndex === -1 || currentIndex === LEVELS.length - 1) {
    return null;
  }
  return LEVELS[currentIndex + 1];
}

/**
 * Calculate points to next level
 */
export function getPointsToNextLevel(
  totalPoints: number,
  currentLevel: UserLevel
): number {
  const nextLevel = getNextLevel(currentLevel);
  if (!nextLevel) return 0;
  return Math.max(0, nextLevel.minPoints - totalPoints);
}

/**
 * Award points for action
 */
export function awardPoints(
  action: PointAction,
  metadata?: Record<string, any>
): PointsTransaction {
  const config = POINTS_CONFIG[action];

  const transaction: PointsTransaction = {
    id: generateTransactionId(),
    action,
    points: config.points,
    timestamp: new Date().toISOString(),
    metadata,
  };

  return transaction;
}

/**
 * Check if action can earn points (respects daily limits and one-time rules)
 */
export function canEarnPoints(
  action: PointAction,
  userPoints: UserPoints
): { can: boolean; reason?: string } {
  const config = POINTS_CONFIG[action];

  // Check one-time actions
  if (config.oneTime) {
    const hasEarned = userPoints.transactions.some((t) => t.action === action);
    if (hasEarned) {
      return { can: false, reason: "Already earned (one-time action)" };
    }
  }

  // Check daily limits
  if (config.maxDaily) {
    const today = new Date().toISOString().split("T")[0];
    const todayCount = userPoints.transactions.filter(
      (t) => t.action === action && t.timestamp.startsWith(today)
    ).length;

    if (todayCount >= config.maxDaily) {
      return { can: false, reason: `Daily limit reached (${config.maxDaily}/day)` };
    }
  }

  return { can: true };
}

/**
 * Check achievements
 */
export function checkAchievements(userPoints: UserPoints): Achievement[] {
  const unlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach((achievement) => {
    // Skip if already unlocked
    if (userPoints.achievements.includes(achievement.id)) {
      return;
    }

    let earned = false;

    // Parse requirement
    const req = achievement.requirement;

    if (req.startsWith("install_agent_")) {
      const required = parseInt(req.split("_")[2]);
      earned = userPoints.stats.agentsInstalled >= required;
    } else if (req.startsWith("install_skill_")) {
      const required = parseInt(req.split("_")[2]);
      earned = userPoints.stats.skillsInstalled >= required;
    } else if (req.startsWith("install_mcp_")) {
      const required = parseInt(req.split("_")[2]);
      earned = userPoints.stats.mcpsInstalled >= required;
    } else if (req.startsWith("create_stack_")) {
      const required = parseInt(req.split("_")[2]);
      earned = userPoints.stats.stacksCreated >= required;
    } else if (req.startsWith("fork_stack_")) {
      const required = parseInt(req.split("_")[2]);
      earned = userPoints.stats.stacksForked >= required;
    } else if (req.startsWith("daily_streak_")) {
      const required = parseInt(req.split("_")[2]);
      earned = userPoints.stats.dailyStreak >= required;
    } else if (req === "install_any_1") {
      const totalInstalls =
        userPoints.stats.agentsInstalled +
        userPoints.stats.skillsInstalled +
        userPoints.stats.commandsInstalled +
        userPoints.stats.mcpsInstalled;
      earned = totalInstalls >= 1;
    }

    if (earned) {
      unlocked.push({
        ...achievement,
        unlockedAt: new Date().toISOString(),
      });
    }
  });

  return unlocked;
}

/**
 * Get user points from localStorage
 */
export function getUserPoints(): UserPoints {
  try {
    const data = localStorage.getItem("gicm_user_points");
    if (data) {
      const parsed = JSON.parse(data);
      const currentLevel = getUserLevel(parsed.totalPoints);
      const nextLevel = getNextLevel(currentLevel);
      const pointsToNextLevel = getPointsToNextLevel(parsed.totalPoints, currentLevel);

      return {
        ...parsed,
        currentLevel,
        nextLevel,
        pointsToNextLevel,
      };
    }
  } catch (error) {
    console.error("Failed to load user points:", error);
  }

  // Return default
  const defaultLevel = LEVELS[0];
  return {
    totalPoints: 0,
    currentLevel: defaultLevel,
    nextLevel: LEVELS[1],
    pointsToNextLevel: LEVELS[1].minPoints,
    transactions: [],
    achievements: [],
    stats: {
      agentsInstalled: 0,
      skillsInstalled: 0,
      commandsInstalled: 0,
      mcpsInstalled: 0,
      stacksCreated: 0,
      stacksForked: 0,
      stacksShared: 0,
      dailyStreak: 0,
      longestStreak: 0,
      lastVisit: new Date().toISOString(),
    },
  };
}

/**
 * Save user points to localStorage
 */
export function saveUserPoints(userPoints: UserPoints): void {
  try {
    localStorage.setItem("gicm_user_points", JSON.stringify(userPoints));
  } catch (error) {
    console.error("Failed to save user points:", error);
  }
}

/**
 * Add transaction and update stats
 */
export function addTransaction(
  transaction: PointsTransaction,
  statUpdate?: Partial<UserPoints["stats"]>
): UserPoints {
  const userPoints = getUserPoints();

  // Check if can earn points
  const check = canEarnPoints(transaction.action, userPoints);
  if (!check.can) {
    console.warn(`Cannot earn points: ${check.reason}`);
    return userPoints;
  }

  // Add transaction
  userPoints.transactions.push(transaction);
  userPoints.totalPoints += transaction.points;

  // Update stats if provided
  if (statUpdate) {
    userPoints.stats = {
      ...userPoints.stats,
      ...statUpdate,
    };
  }

  // Check for new achievements
  const newAchievements = checkAchievements(userPoints);
  newAchievements.forEach((achievement) => {
    userPoints.achievements.push(achievement.id);
    userPoints.totalPoints += achievement.points;
  });

  // Update level
  userPoints.currentLevel = getUserLevel(userPoints.totalPoints);
  userPoints.nextLevel = getNextLevel(userPoints.currentLevel);
  userPoints.pointsToNextLevel = getPointsToNextLevel(
    userPoints.totalPoints,
    userPoints.currentLevel
  );

  // Save
  saveUserPoints(userPoints);

  return userPoints;
}

/**
 * Update daily streak
 */
export function updateDailyStreak(): UserPoints {
  const userPoints = getUserPoints();
  const today = new Date().toISOString().split("T")[0];
  const lastVisit = new Date(userPoints.stats.lastVisit).toISOString().split("T")[0];

  // Check if already visited today
  if (today === lastVisit) {
    return userPoints;
  }

  // Check if streak continues (visited yesterday)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const isConsecutive = lastVisit === yesterday;

  if (isConsecutive) {
    userPoints.stats.dailyStreak += 1;
  } else {
    userPoints.stats.dailyStreak = 1;
  }

  // Update longest streak
  if (userPoints.stats.dailyStreak > userPoints.stats.longestStreak) {
    userPoints.stats.longestStreak = userPoints.stats.dailyStreak;
  }

  // Update last visit
  userPoints.stats.lastVisit = new Date().toISOString();

  // Award daily visit points
  const transaction = awardPoints("daily_visit");
  return addTransaction(transaction);
}
