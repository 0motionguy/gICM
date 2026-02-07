import type { RegistryItem } from "@/types/registry";

/**
 * SUPERPOWERS Registry - Obra Workflow Methodologies
 *
 * These are advanced AI workflow skills based on the obra/superpowers
 * methodology. Each skill represents a structured approach to common
 * development tasks, enabling systematic execution with high consistency.
 *
 * @see https://github.com/obra/superpowers
 */
export const SUPERPOWERS: RegistryItem[] = [
  // ============================================================================
  // 1. TEST-DRIVEN DEVELOPMENT
  // ============================================================================
  {
    id: "superpower-test-driven-development",
    kind: "skill",
    name: "Test-Driven Development",
    slug: "superpower-test-driven-development",
    description:
      "RED-GREEN-REFACTOR cycle methodology. Write failing tests first, implement minimal code to pass, then refactor. 94% token savings.",
    longDescription: `Structured TDD workflow implementing the classic RED-GREEN-REFACTOR cycle:

**RED Phase**: Write a failing test that defines the desired behavior. The test must fail for the right reason - verifying the feature doesn't exist yet.

**GREEN Phase**: Write the minimum code necessary to make the test pass. No premature optimization, no additional features. Just make it work.

**REFACTOR Phase**: Clean up the implementation while keeping all tests green. Remove duplication, improve naming, extract abstractions.

**Key Principles**:
- Tests are documentation - they explain what the code should do
- Small increments - one test at a time, one behavior at a time
- No production code without a failing test
- Refactoring is safe when tests pass

**Workflow Integration**:
- Works with systematic-debugging for when tests reveal unexpected failures
- Pairs with writing-plans for larger TDD projects
- Supports parallel execution via dispatching-parallel-agents for test suites`,
    category: "Workflow",
    tags: [
      "Workflow",
      "Methodology",
      "Testing",
      "TDD",
      "Quality",
      "Development",
    ],
    dependencies: [],
    files: [
      ".claude/skills/superpower-test-driven-development/SKILL.md",
      ".gemini/skills/superpower-test-driven-development/SKILL.md",
      ".openai/skills/superpower-test-driven-development/SKILL.md",
    ],
    install: "npx @clawdbot/cli add skill/superpower-test-driven-development",
    tokenSavings: 94,
    installs: 2341,
    remixes: 876,
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    progressiveDisclosure: {
      level1Tokens: 45,
      level2Tokens: 3200,
      level3Estimate: 8500,
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 92,
      status: "VERIFIED",
    },
  },

  // ============================================================================
  // 2. SYSTEMATIC DEBUGGING
  // ============================================================================
  {
    id: "superpower-systematic-debugging",
    kind: "skill",
    name: "Systematic Debugging",
    slug: "superpower-systematic-debugging",
    description:
      "4-phase root cause analysis methodology. Observe, hypothesize, experiment, verify. 91% token savings.",
    longDescription: `Structured debugging workflow using scientific method principles:

**Phase 1 - OBSERVE**: Gather all available evidence before forming hypotheses.
- Collect error messages, stack traces, logs
- Note exact reproduction steps
- Document expected vs actual behavior
- Identify when the bug was introduced (git bisect)

**Phase 2 - HYPOTHESIZE**: Form testable theories about the root cause.
- List possible causes ranked by probability
- Consider recent changes that might be related
- Check for known patterns (null refs, race conditions, etc.)
- Avoid confirmation bias - consider all evidence

**Phase 3 - EXPERIMENT**: Test hypotheses systematically.
- One variable at a time
- Create minimal reproduction cases
- Add strategic logging/breakpoints
- Verify fix doesn't introduce new issues

**Phase 4 - VERIFY**: Confirm the fix and prevent regression.
- Write a test that would have caught this bug
- Document the root cause and solution
- Check for similar patterns elsewhere
- Update monitoring if applicable

**Anti-Patterns to Avoid**:
- Shotgun debugging (random changes hoping something works)
- Fixing symptoms instead of root causes
- Skipping verification phase`,
    category: "Workflow",
    tags: [
      "Workflow",
      "Methodology",
      "Debugging",
      "Root Cause Analysis",
      "Quality",
    ],
    dependencies: [],
    files: [
      ".claude/skills/superpower-systematic-debugging/SKILL.md",
      ".gemini/skills/superpower-systematic-debugging/SKILL.md",
      ".openai/skills/superpower-systematic-debugging/SKILL.md",
    ],
    install: "npx @clawdbot/cli add skill/superpower-systematic-debugging",
    tokenSavings: 91,
    installs: 1987,
    remixes: 712,
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    progressiveDisclosure: {
      level1Tokens: 42,
      level2Tokens: 2800,
      level3Estimate: 7200,
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 94,
      status: "VERIFIED",
    },
  },

  // ============================================================================
  // 3. BRAINSTORMING
  // ============================================================================
  {
    id: "superpower-brainstorming",
    kind: "skill",
    name: "Brainstorming",
    slug: "superpower-brainstorming",
    description:
      "Socratic design refinement with structured critique. Divergent thinking, then convergent analysis. 89% token savings.",
    longDescription: `Structured brainstorming methodology using Socratic questioning:

**Phase 1 - DIVERGENT THINKING**: Generate as many ideas as possible.
- No criticism during idea generation
- Build on others' ideas ("yes, and...")
- Encourage wild ideas - they spark practical ones
- Quantity over quality initially

**Phase 2 - CLARIFICATION**: Understand each idea fully.
- Ask "What problem does this solve?"
- Identify assumptions being made
- Explore edge cases and constraints
- Define success criteria

**Phase 3 - CRITIQUE**: Structured analysis of each option.
- Devil's advocate perspective
- Technical feasibility assessment
- Resource and timeline implications
- Risk identification

**Phase 4 - SYNTHESIS**: Combine best elements into refined solutions.
- Merge complementary ideas
- Address critiques constructively
- Prioritize based on constraints
- Create actionable next steps

**Socratic Questions to Use**:
- "What would have to be true for this to work?"
- "What's the strongest argument against this?"
- "How would this fail?"
- "What are we optimizing for?"
- "What would a 10x simpler version look like?"

**Output Format**:
Produces ranked options with pros/cons, leading to a recommended approach with clear rationale.`,
    category: "Workflow",
    tags: [
      "Workflow",
      "Methodology",
      "Design",
      "Ideation",
      "Architecture",
      "Decision Making",
    ],
    dependencies: [],
    files: [
      ".claude/skills/superpower-brainstorming/SKILL.md",
      ".gemini/skills/superpower-brainstorming/SKILL.md",
      ".openai/skills/superpower-brainstorming/SKILL.md",
    ],
    install: "npx @clawdbot/cli add skill/superpower-brainstorming",
    tokenSavings: 89,
    installs: 1654,
    remixes: 598,
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    progressiveDisclosure: {
      level1Tokens: 48,
      level2Tokens: 3400,
      level3Estimate: 9100,
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 88,
      status: "VERIFIED",
    },
  },

  // ============================================================================
  // 4. WRITING PLANS
  // ============================================================================
  {
    id: "superpower-writing-plans",
    kind: "skill",
    name: "Writing Plans",
    slug: "superpower-writing-plans",
    description:
      "Implementation planning with milestones and checkpoints. Break complex work into executable chunks. 93% token savings.",
    longDescription: `Structured planning methodology for complex implementations:

**Phase 1 - SCOPE DEFINITION**: Clearly define what's in and out of scope.
- Identify the core problem being solved
- List explicit non-goals
- Define acceptance criteria
- Estimate complexity and timeline

**Phase 2 - DECOMPOSITION**: Break work into atomic, verifiable tasks.
- Each task should be completable in one session
- Tasks should be independently testable
- Dependencies between tasks are explicit
- Critical path is identified

**Phase 3 - MILESTONE PLANNING**: Group tasks into meaningful milestones.
- Each milestone delivers demonstrable value
- Milestones enable early feedback
- Risk is front-loaded (hard problems first)
- Each milestone has clear success criteria

**Phase 4 - CHECKPOINT DESIGN**: Build in verification points.
- Define "done" for each task
- Include review/testing requirements
- Plan for rollback if needed
- Document assumptions to validate

**Plan Structure**:
\`\`\`
# Implementation Plan: [Feature Name]

## Overview
- Problem: ...
- Solution: ...
- Timeline: ...

## Milestones
### M1: [Name] (Est: X hours)
- [ ] Task 1.1: ...
- [ ] Task 1.2: ...
Checkpoint: [How to verify M1 is complete]

### M2: [Name] (Est: Y hours)
...

## Risks & Mitigations
- Risk 1: ... Mitigation: ...

## Out of Scope
- ...
\`\`\`

**Integration**:
- Feeds into executing-plans for systematic execution
- Works with brainstorming for design decisions
- Supports parallel execution planning`,
    category: "Workflow",
    tags: [
      "Workflow",
      "Methodology",
      "Planning",
      "Project Management",
      "Architecture",
    ],
    dependencies: [],
    files: [
      ".claude/skills/superpower-writing-plans/SKILL.md",
      ".gemini/skills/superpower-writing-plans/SKILL.md",
      ".openai/skills/superpower-writing-plans/SKILL.md",
    ],
    install: "npx @clawdbot/cli add skill/superpower-writing-plans",
    tokenSavings: 93,
    installs: 2156,
    remixes: 834,
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    progressiveDisclosure: {
      level1Tokens: 46,
      level2Tokens: 3600,
      level3Estimate: 10200,
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 95,
      status: "VERIFIED",
    },
  },

  // ============================================================================
  // 5. EXECUTING PLANS
  // ============================================================================
  {
    id: "superpower-executing-plans",
    kind: "skill",
    name: "Executing Plans",
    slug: "superpower-executing-plans",
    description:
      "Batch execution of planned tasks with verification at each step. Systematic progress through milestones. 90% token savings.",
    longDescription: `Systematic execution methodology for implementation plans:

**Execution Protocol**:

**Step 1 - CONTEXT LOADING**: Before starting any task:
- Review the full plan for context
- Understand where this task fits
- Load relevant dependencies
- Verify prerequisites are met

**Step 2 - TASK EXECUTION**: For each task:
- State what you're about to do
- Execute the minimal change
- Verify the change works
- Update progress tracking

**Step 3 - CHECKPOINT VERIFICATION**: At each milestone:
- Run all relevant tests
- Verify acceptance criteria
- Document any deviations from plan
- Get explicit approval before continuing

**Step 4 - PROGRESS TRACKING**: Maintain execution state:
- Mark completed tasks
- Note blockers or issues
- Update time estimates
- Flag risks encountered

**Execution Rules**:
- Never skip verification steps
- One task at a time (no parallel changes)
- If blocked, stop and surface the blocker
- If plan needs adjustment, propose changes first

**Progress Format**:
\`\`\`
## Execution Status

### Current Task
- Task: [Task ID and description]
- Status: [In Progress / Blocked / Complete]
- Notes: [Any relevant observations]

### Completed
- [x] Task 1.1: ... (verified)
- [x] Task 1.2: ... (verified)

### Remaining
- [ ] Task 1.3: ...
- [ ] Task 2.1: ...

### Blockers
- [If any]
\`\`\`

**Integration**:
- Consumes plans from writing-plans
- Uses systematic-debugging when issues arise
- Can dispatch to parallel-agents for independent tasks`,
    category: "Workflow",
    tags: [
      "Workflow",
      "Methodology",
      "Execution",
      "Project Management",
      "Implementation",
    ],
    dependencies: ["superpower-writing-plans"],
    files: [
      ".claude/skills/superpower-executing-plans/SKILL.md",
      ".gemini/skills/superpower-executing-plans/SKILL.md",
      ".openai/skills/superpower-executing-plans/SKILL.md",
    ],
    install: "npx @clawdbot/cli add skill/superpower-executing-plans",
    tokenSavings: 90,
    installs: 1876,
    remixes: 692,
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    progressiveDisclosure: {
      level1Tokens: 44,
      level2Tokens: 3100,
      level3Estimate: 8800,
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 91,
      status: "VERIFIED",
    },
  },

  // ============================================================================
  // 6. DISPATCHING PARALLEL AGENTS
  // ============================================================================
  {
    id: "superpower-dispatching-parallel-agents",
    kind: "skill",
    name: "Dispatching Parallel Agents",
    slug: "superpower-dispatching-parallel-agents",
    description:
      "Concurrent workflow dispatch for independent tasks. Coordinate multiple agents working in parallel. 87% token savings.",
    longDescription: `Methodology for coordinating parallel agent execution:

**When to Parallelize**:
- Tasks are independent (no shared state)
- Tasks don't have sequential dependencies
- Combined time savings exceed coordination overhead
- Results can be merged cleanly

**Dispatch Protocol**:

**Phase 1 - TASK ANALYSIS**: Identify parallelization opportunities.
- Map dependencies between tasks
- Identify independent task groups
- Estimate execution time per task
- Calculate parallelization speedup

**Phase 2 - AGENT ASSIGNMENT**: Allocate tasks to agents.
- Match task requirements to agent capabilities
- Balance workload across agents
- Define clear boundaries for each agent
- Establish communication protocol

**Phase 3 - CONTEXT PREPARATION**: Set up each agent for success.
- Provide minimal necessary context
- Define expected output format
- Specify coordination checkpoints
- Establish error handling protocol

**Phase 4 - DISPATCH & MONITOR**: Execute and coordinate.
- Launch agents with clear instructions
- Monitor for blockers or failures
- Handle inter-agent communication
- Collect and merge results

**Dispatch Template**:
\`\`\`
## Parallel Dispatch Plan

### Task Groups
- Group A (Agent 1): [Tasks that can run together]
- Group B (Agent 2): [Different independent tasks]
- Group C (Agent 3): [More independent tasks]

### Dependencies
- Groups A, B, C are independent
- Group D depends on A completing
- Final merge after all complete

### Coordination Points
- Checkpoint 1: After Groups A, B, C complete
- Checkpoint 2: After Group D completes
- Final: Merge all results

### Error Handling
- If agent fails: [recovery strategy]
- If conflict detected: [resolution strategy]
\`\`\`

**Anti-Patterns**:
- Parallelizing tasks with hidden dependencies
- Over-parallelizing (coordination overhead exceeds gains)
- Insufficient context leading to inconsistent results`,
    category: "Workflow",
    tags: [
      "Workflow",
      "Methodology",
      "Parallelization",
      "Orchestration",
      "Multi-Agent",
    ],
    dependencies: [],
    files: [
      ".claude/skills/superpower-dispatching-parallel-agents/SKILL.md",
      ".gemini/skills/superpower-dispatching-parallel-agents/SKILL.md",
      ".openai/skills/superpower-dispatching-parallel-agents/SKILL.md",
    ],
    install:
      "npx @clawdbot/cli add skill/superpower-dispatching-parallel-agents",
    tokenSavings: 87,
    installs: 1423,
    remixes: 534,
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    progressiveDisclosure: {
      level1Tokens: 52,
      level2Tokens: 3800,
      level3Estimate: 11500,
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 86,
      status: "VERIFIED",
    },
  },

  // ============================================================================
  // 7. SUBAGENT-DRIVEN DEVELOPMENT
  // ============================================================================
  {
    id: "superpower-subagent-driven-development",
    kind: "skill",
    name: "Subagent-Driven Development",
    slug: "superpower-subagent-driven-development",
    description:
      "Fast iteration with specialized subagents. Delegate focused tasks to purpose-built agents. 92% token savings.",
    longDescription: `Methodology for leveraging subagents for rapid development:

**Core Concept**:
Decompose complex work into focused subtasks, each handled by a specialized subagent. The orchestrating agent maintains context and coordinates results.

**When to Use Subagents**:
- Task requires deep expertise in a specific domain
- Main context would be polluted by detailed work
- Work can be cleanly isolated
- Results can be validated independently

**Subagent Types**:

1. **Specialist Agents**: Deep expertise in one area
   - TypeScript type expert
   - SQL optimization expert
   - Security auditor
   - Test writer

2. **Worker Agents**: Execute repetitive tasks
   - File migration
   - Bulk refactoring
   - Documentation generation
   - Test generation

3. **Validator Agents**: Verify work quality
   - Code reviewer
   - Test runner
   - Lint checker
   - Security scanner

**Delegation Protocol**:

**Step 1 - TASK DEFINITION**: Create a clear, bounded task.
\`\`\`
## Subagent Task

### Objective
[One sentence describing the goal]

### Context
[Minimal context needed - no more]

### Inputs
[Specific files/data to work with]

### Expected Output
[Exact format and content expected]

### Constraints
[Boundaries and limitations]
\`\`\`

**Step 2 - DISPATCH**: Send task to appropriate subagent.
- Choose agent based on task requirements
- Provide only necessary context
- Set clear success criteria
- Define timeout/limits

**Step 3 - VALIDATE**: Verify subagent output.
- Check output matches expected format
- Verify correctness of results
- Test integration with main work
- Iterate if needed

**Step 4 - INTEGRATE**: Merge results into main context.
- Apply subagent changes
- Update progress tracking
- Document any deviations
- Continue with next task

**Best Practices**:
- Keep subagent context minimal
- Validate before integrating
- Use specialist agents for complex domains
- Don't over-delegate simple tasks`,
    category: "Workflow",
    tags: [
      "Workflow",
      "Methodology",
      "Subagents",
      "Delegation",
      "Fast Iteration",
    ],
    dependencies: [],
    files: [
      ".claude/skills/superpower-subagent-driven-development/SKILL.md",
      ".gemini/skills/superpower-subagent-driven-development/SKILL.md",
      ".openai/skills/superpower-subagent-driven-development/SKILL.md",
    ],
    install:
      "npx @clawdbot/cli add skill/superpower-subagent-driven-development",
    tokenSavings: 92,
    installs: 1734,
    remixes: 645,
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    progressiveDisclosure: {
      level1Tokens: 50,
      level2Tokens: 3500,
      level3Estimate: 9800,
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 90,
      status: "VERIFIED",
    },
  },

  // ============================================================================
  // 8. USING GIT WORKTREES
  // ============================================================================
  {
    id: "superpower-using-git-worktrees",
    kind: "skill",
    name: "Using Git Worktrees",
    slug: "superpower-using-git-worktrees",
    description:
      "Parallel branch development with git worktrees. Work on multiple features simultaneously without stashing. 88% token savings.",
    longDescription: `Methodology for parallel development using git worktrees:

**What are Git Worktrees?**
Git worktrees allow you to check out multiple branches simultaneously in different directories, all sharing the same git repository. No more stashing or context switching.

**When to Use Worktrees**:
- Working on multiple features in parallel
- Need to test/compare different branches
- Reviewing PRs while working on your own code
- Running long builds while continuing development
- Maintaining stable and dev versions simultaneously

**Setup Protocol**:

**Step 1 - CREATE WORKTREE STRUCTURE**:
\`\`\`bash
# Main repo structure
project/
  main/           # Main worktree (main branch)
  feature-auth/   # Worktree for auth feature
  feature-api/    # Worktree for API feature
  hotfix-123/     # Worktree for hotfix

# Create worktrees
cd project/main
git worktree add ../feature-auth feature/auth
git worktree add ../feature-api feature/api
git worktree add -b hotfix/123 ../hotfix-123
\`\`\`

**Step 2 - WORKFLOW MANAGEMENT**:
\`\`\`bash
# List all worktrees
git worktree list

# Remove when done (branch persists)
git worktree remove ../feature-auth

# Prune stale worktrees
git worktree prune
\`\`\`

**Step 3 - PARALLEL DEVELOPMENT PATTERN**:
1. Create worktree for each active feature
2. Run tests/builds in separate terminals
3. Easily compare implementations across branches
4. Merge when ready without switching

**Best Practices**:

1. **Naming Convention**:
   - Use descriptive directory names matching branch purpose
   - Keep worktrees in sibling directories or a dedicated parent

2. **Shared Dependencies**:
   - Each worktree needs its own node_modules
   - Consider pnpm or yarn workspaces for efficiency
   - Be aware of shared git hooks

3. **Cleanup**:
   - Remove worktrees when merging branches
   - Regularly prune to clean up stale references
   - Don't accumulate too many active worktrees

4. **IDE Support**:
   - Open each worktree as a separate project
   - VSCode handles worktrees well
   - Some tools may need path adjustments

**Integration with Other Superpowers**:
- Use with dispatching-parallel-agents for concurrent development
- Supports executing-plans across multiple features
- Enables parallel testing with systematic-debugging

**Commands Reference**:
\`\`\`bash
git worktree add <path> <branch>     # Create worktree
git worktree add -b <new> <path>     # Create with new branch
git worktree list                     # List all worktrees
git worktree remove <path>            # Remove worktree
git worktree prune                    # Clean up stale
git worktree move <old> <new>         # Move worktree
\`\`\``,
    category: "Workflow",
    tags: [
      "Workflow",
      "Methodology",
      "Git",
      "Version Control",
      "Parallel Development",
    ],
    dependencies: [],
    files: [
      ".claude/skills/superpower-using-git-worktrees/SKILL.md",
      ".gemini/skills/superpower-using-git-worktrees/SKILL.md",
      ".openai/skills/superpower-using-git-worktrees/SKILL.md",
    ],
    install: "npx @clawdbot/cli add skill/superpower-using-git-worktrees",
    tokenSavings: 88,
    installs: 1289,
    remixes: 478,
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    progressiveDisclosure: {
      level1Tokens: 47,
      level2Tokens: 3300,
      level3Estimate: 9400,
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 89,
      status: "VERIFIED",
    },
  },
];

/**
 * Get all superpowers by category
 */
export function getSuperpowersByTag(tag: string): RegistryItem[] {
  return SUPERPOWERS.filter((item) =>
    item.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get a specific superpower by ID
 */
export function getSuperpower(id: string): RegistryItem | undefined {
  return SUPERPOWERS.find((item) => item.id === id);
}

/**
 * Get total token savings estimate for superpowers
 */
export function getTotalTokenSavings(): number {
  const totalSavings = SUPERPOWERS.reduce(
    (acc, item) => acc + (item.tokenSavings || 0),
    0
  );
  return Math.round(totalSavings / SUPERPOWERS.length);
}
