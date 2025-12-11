# Contributing Skills to gICM Marketplace

> Complete guide for creating, testing, and submitting skills to the gICM Marketplace.

## Overview

Skills are the foundational building blocks of the gICM ecosystem. They provide domain expertise that Claude, Gemini, and OpenAI models can use to deliver better responses. This guide covers everything you need to create production-quality skills.

```
Skill Creation Pipeline
=======================

1. DESIGN          2. IMPLEMENT        3. TEST           4. SUBMIT
+-----------+      +-----------+       +-----------+     +-----------+
| Define    |  ->  | Write v2  |  ->   | Validate  | ->  | Create PR |
| Purpose   |      | Schema    |       | & Test    |     | & Review  |
+-----------+      +-----------+       +-----------+     +-----------+
     |                  |                   |                  |
     v                  v                   v                  v
  Trigger           3-Level            Quality Gate      Publishing
  Patterns          Content            Checks
```

---

## Prerequisites

Before creating a skill, ensure you have:

1. **Node.js 18+** installed
2. **pnpm** package manager
3. **gICM repository** cloned
4. **TypeScript** familiarity
5. **Domain expertise** in your skill area

```bash
# Clone the repository
git clone https://github.com/icm-motion/gICM.git
cd gICM

# Install dependencies
pnpm install

# Build packages
pnpm build
```

---

## Quick Start: Create Your First Skill

### Step 1: Generate Scaffold

```bash
# Use the CLI to create a skill scaffold
npx @gicm/cli create skill my-awesome-skill

# Or manually create the file
touch .claude/skills/my-awesome-skill.md
```

### Step 2: Define the Skill Structure

Create your skill following the v2 schema:

```typescript
// src/lib/registry.ts - Add your skill definition

{
  id: "my-awesome-skill",
  kind: "skill",
  name: "My Awesome Skill",
  slug: "my-awesome-skill",
  description: "Brief description (max 200 chars)",
  longDescription: "Detailed description of what the skill does...",
  category: "Development", // See categories below
  tags: ["TypeScript", "API", "Backend"],
  install: "npx @gicm/cli add skill/my-awesome-skill",
  files: [".claude/skills/my-awesome-skill.md"],
  tokenSavings: 78, // Percentage vs naive approach

  // v2 Fields
  skillId: "my-awesome-skill",
  progressiveDisclosure: {
    level1Tokens: 90,
    level2Tokens: 2500,
    level3Estimate: 8000
  }
}
```

### Step 3: Write the Skill Content

Create `.claude/skills/my-awesome-skill.md`:

````markdown
# My Awesome Skill

## Level 1: Metadata

**Skill ID:** my-awesome-skill
**Version:** 1.0.0
**Author:** Your Name
**Category:** Development
**Tags:** TypeScript, API, Backend

### Trigger Patterns

- "create REST API"
- "design API endpoint"
- "build backend service"

---

## Level 2: Instructions

You are an expert at [domain]. When helping users with [task], follow these principles:

### Core Capabilities

1. **Capability One** - Description
2. **Capability Two** - Description
3. **Capability Three** - Description

### Best Practices

- Always validate input with Zod
- Use proper error handling
- Follow RESTful conventions

### Example Interaction

**User:** Create a user registration endpoint
**Assistant:** Here's a type-safe user registration endpoint...

```typescript
// Example code
```
````

### Constraints

- Never expose sensitive data
- Always use parameterized queries
- Validate all user input

---

## Level 3: Resources

### Templates

- `templates/api-endpoint.ts`
- `templates/validation-schema.ts`

### References

- [API Design Guidelines](https://docs.example.com)
- [TypeScript Best Practices](https://docs.example.com)

### External APIs

- None required for this skill

````

---

## v2 Schema Requirements

### Skill ID Rules

Your `skillId` must follow these rules:

| Rule | Valid | Invalid |
|------|-------|---------|
| Lowercase only | `my-skill` | `My-Skill` |
| Alphanumeric + hyphens | `api-v2-expert` | `api_v2_expert` |
| No leading/trailing hyphens | `my-skill` | `-my-skill-` |
| Max 64 characters | `solana-anchor-expert` | (too long) |
| No reserved words | `api-expert` | `claude-expert` |

**Reserved words that cannot appear:**
- `anthropic`
- `claude`
- `official`

### Token Budget Guidelines

| Level | Target | Max | Content |
|-------|--------|-----|---------|
| Level 1 | ~100 | 200 | Metadata + trigger patterns |
| Level 2 | ~2,500 | 5,000 | Instructions + examples |
| Level 3 | ~10,000 | Unlimited | Resources + templates |

### Category Options

Choose from these categories:

| Category | Description |
|----------|-------------|
| Development | General programming skills |
| Blockchain | Solana, Ethereum, DeFi |
| Frontend | React, Next.js, UI/UX |
| Backend | APIs, databases, servers |
| DevOps | CI/CD, deployment, infrastructure |
| Security | Auditing, vulnerabilities |
| Data | Analytics, ML, data pipelines |
| Documentation | Technical writing, READMEs |

---

## Writing Effective Trigger Patterns

Trigger patterns are how skills get matched to user queries. Good patterns are specific enough to avoid false positives but general enough to catch relevant queries.

### Best Practices

```typescript
// GOOD: Specific and varied
triggerPatterns: [
  "create REST API endpoint",
  "build GraphQL resolver",
  "design API schema",
  "implement CRUD operations",
  "add authentication to API"
]

// BAD: Too generic (will match everything)
triggerPatterns: [
  "help me",
  "code",
  "build something"
]

// BAD: Too specific (won't match variations)
triggerPatterns: [
  "create a POST /users endpoint with Zod validation in TypeScript"
]
````

### Pattern Guidelines

1. **Use 5-15 patterns** per skill
2. **Mix specificity levels** - some specific, some general
3. **Include action verbs** - "create", "build", "design", "fix"
4. **Cover synonyms** - "API" vs "endpoint" vs "route"
5. **Include error scenarios** - "fix API error", "debug endpoint"

---

## Writing System Prompts

The Level 2 system prompt is the heart of your skill. It should be comprehensive but concise.

### Structure Template

```markdown
## Level 2: Instructions

You are an expert [role] specializing in [domain]. Your expertise includes:

### Core Capabilities

[List 3-5 primary capabilities]

### Methodology

When approaching [task type], follow this process:

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Best Practices

- [Practice 1 with brief explanation]
- [Practice 2 with brief explanation]
- [Practice 3 with brief explanation]

### Code Patterns

[Include 1-2 key code patterns users will need]

### Common Pitfalls

- [Pitfall 1]: [How to avoid]
- [Pitfall 2]: [How to avoid]

### Output Format

When generating code:

- Always include TypeScript types
- Add JSDoc comments
- Include error handling
```

### Token Optimization Tips

1. **Be concise** - Every word should earn its place
2. **Use bullet points** - More scannable than paragraphs
3. **Include code snippets** - They're worth a thousand words
4. **Avoid redundancy** - Don't repeat information
5. **Use references** - Link to Level 3 for detailed docs

---

## Multi-Platform Support

All skills should work across Claude, Gemini, and OpenAI. Here's how to ensure compatibility:

### Create Platform-Specific Files

```
.claude/skills/my-skill.md    # Claude version (primary)
.gemini/skills/my-skill.md    # Gemini version
.openai/skills/my-skill.md    # OpenAI version
```

### Use the Conversion Scripts

```bash
# Convert from Claude to other platforms
npx tsx scripts/convert-skills-multi-platform.ts

# Or manually convert
npx @gicm/cli convert skill/my-skill --to=gemini
```

### Platform-Specific Considerations

| Platform | Considerations                                      |
| -------- | --------------------------------------------------- |
| Claude   | Full MCP support, artifacts, thinking tags          |
| Gemini   | 1M token context, no MCP, code execution sandbox    |
| OpenAI   | Function calling, no MCP, different reasoning style |

### Transformation Rules

The conversion scripts apply these transformations:

```typescript
// Claude -> Gemini/OpenAI transformations:
// 1. Remove <thinking> tags -> internal reasoning
// 2. Remove MCP tool references
// 3. Update model name references
// 4. Add platform-specific headers
```

---

## Testing Your Skill

### Validation Checklist

Before submitting, verify:

- [ ] Skill ID follows naming rules
- [ ] No reserved words in ID or name
- [ ] Level 1 < 200 tokens
- [ ] Level 2 < 5,000 tokens
- [ ] Trigger patterns are effective
- [ ] Code examples work correctly
- [ ] Multi-platform files exist
- [ ] Registry entry is complete

### Run Validation

```bash
# Validate skill structure
npx @gicm/cli validate skill/my-awesome-skill

# Run tests
pnpm test:run -- --grep "skill"

# Check token counts
npx @gicm/cli analyze skill/my-awesome-skill
```

### Manual Testing

```bash
# Test in Claude Desktop
# 1. Add to .claude/skills/ directory
# 2. Restart Claude Desktop
# 3. Test with trigger phrases
# 4. Verify skill is detected and loaded
```

---

## Submitting Your Skill

### 1. Fork and Branch

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/gICM.git

# Create a feature branch
git checkout -b feat/add-my-awesome-skill
```

### 2. Add Your Files

```bash
# Add skill content
git add .claude/skills/my-awesome-skill.md
git add .gemini/skills/my-awesome-skill.md
git add .openai/skills/my-awesome-skill.md

# Add registry entry (if modifying registry.ts)
git add src/lib/registry.ts

# Commit
git commit -m "feat: add my-awesome-skill for [domain]"
```

### 3. Create Pull Request

```bash
# Push to your fork
git push origin feat/add-my-awesome-skill

# Create PR on GitHub with this template:
```

**PR Template:**

```markdown
## Summary

- Add new skill: `my-awesome-skill`
- Category: [Development/Blockchain/etc.]
- Token budget: L1: 90 | L2: 2500 | L3: 8000

## What does this skill do?

[Brief description of the skill's purpose and capabilities]

## Test plan

- [ ] Validated with `@gicm/cli validate`
- [ ] Tested trigger patterns in Claude Desktop
- [ ] Multi-platform files generated
- [ ] Code examples verified

## Checklist

- [ ] Follows v2 schema
- [ ] No reserved words in skillId
- [ ] Token budgets within limits
- [ ] All platforms supported
```

### 4. Review Process

1. **Automated checks** - CI validates schema and tokens
2. **Code review** - Team reviews content quality
3. **Testing** - Skill tested in Claude Desktop
4. **Publishing** - Merged to main, auto-published

---

## Skill Examples

### Minimal Skill (Development)

```typescript
// Registry entry
{
  id: "express-api-basics",
  kind: "skill",
  name: "Express API Basics",
  slug: "express-api-basics",
  description: "Build REST APIs with Express.js and TypeScript",
  category: "Backend",
  tags: ["Express", "Node.js", "REST", "TypeScript"],
  install: "npx @gicm/cli add skill/express-api-basics",
  files: [".claude/skills/express-api-basics.md"],
  tokenSavings: 72,
  skillId: "express-api-basics",
  progressiveDisclosure: {
    level1Tokens: 85,
    level2Tokens: 1800,
    level3Estimate: 5000
  }
}
```

### Advanced Skill (Blockchain)

```typescript
// Registry entry
{
  id: "solana-bonding-curves",
  kind: "skill",
  name: "Solana Bonding Curve Expert",
  slug: "solana-bonding-curves",
  description: "Design and implement bonding curves for Solana token launches",
  longDescription: "Expert knowledge in constant product, linear, and exponential bonding curves with Anchor framework...",
  category: "Blockchain",
  tags: ["Solana", "Anchor", "DeFi", "Bonding Curve", "AMM"],
  install: "npx @gicm/cli add skill/solana-bonding-curves",
  files: [".claude/skills/solana-bonding-curves.md"],
  tokenSavings: 81,
  skillId: "solana-bonding-curves",
  progressiveDisclosure: {
    level1Tokens: 95,
    level2Tokens: 3200,
    level3Estimate: 12000
  },
  resources: {
    scripts: ["scripts/deploy-curve.sh"],
    templates: ["templates/constant-product.rs", "templates/linear-curve.rs"],
    references: ["docs/bonding-math.md"]
  },
  codeExecution: {
    sandbox: true,
    networkAccess: false,
    preinstalledPackages: ["@coral-xyz/anchor"]
  }
}
```

---

## Quality Guidelines

### Content Quality

| Aspect           | Requirement                     |
| ---------------- | ------------------------------- |
| **Accuracy**     | All code examples must work     |
| **Completeness** | Cover common use cases          |
| **Clarity**      | Clear, unambiguous instructions |
| **Conciseness**  | No unnecessary content          |
| **Currency**     | Use latest patterns/APIs        |

### Code Quality

```typescript
// GOOD: Complete, typed, handles errors
async function createUser(data: CreateUserInput): Promise<User> {
  const validated = CreateUserSchema.parse(data);

  try {
    const user = await db.user.create({ data: validated });
    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ConflictError("User already exists");
    }
    throw error;
  }
}

// BAD: Incomplete, untyped, no error handling
async function createUser(data) {
  return await db.user.create({ data });
}
```

### Documentation Quality

1. **Include "why"** - Not just "what"
2. **Add context** - When to use vs. alternatives
3. **Show tradeoffs** - Pros and cons
4. **Link references** - External docs for deep dives

---

## Maintenance

After your skill is published:

1. **Monitor issues** - Watch for bug reports
2. **Update regularly** - Keep patterns current
3. **Improve from feedback** - Iterate on user suggestions
4. **Track metrics** - Check install/remix counts

### Updating a Skill

```bash
# Update skill content
vim .claude/skills/my-skill.md

# Bump version in the skill file
# Version: 1.0.0 -> 1.1.0

# Create PR with changes
git commit -m "fix(my-skill): update patterns for better matching"
```

---

## Need Help?

- **Discord:** [discord.gg/opus67](https://discord.gg/opus67)
- **GitHub Issues:** [github.com/icm-motion/gICM/issues](https://github.com/icm-motion/gICM/issues)
- **Documentation:** [docs.opus67.com](https://docs.opus67.com)

---

## See Also

- [Marketplace V2 Schema](./MARKETPLACE-V2.md) - Complete schema documentation
- [MCP Integration](./MCP-INTEGRATION.md) - MCP server documentation
- [Multi-Platform](./MULTI_PLATFORM.md) - Cross-platform support
