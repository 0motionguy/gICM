# Example Validation Report

This is an example of what the validation report output looks like.

## Command

```bash
npx tsx scripts/validate-registry.ts
```

## Sample Output

```
🔍 Validating gICM Registry...

================================================================================
REGISTRY DEPENDENCY VALIDATION REPORT
================================================================================

Generated: 2025-12-12T10:30:45.123Z

SUMMARY
--------------------------------------------------------------------------------
Total Items:              450
Items with Dependencies:  312
Items Valid:              445
Items with Issues:        5
Errors:                   3
Warnings:                 2

DEPENDENCY STATISTICS
--------------------------------------------------------------------------------
Coverage:                 69%
Missing Dependencies:     2
Circular Dependencies:    1
Orphaned Items:           15

COVERAGE BY KIND
--------------------------------------------------------------------------------
agent                56/56 (100%)
skill                142/142 (100%)
command              45/67 (67%)
mcp                  69/83 (83%)
setting              0/5 (0%)
workflow             0/4 (0%)

ISSUES
--------------------------------------------------------------------------------

ERRORS (3)

[MISSING_DEPENDENCY] Deploy Command (command/deploy-test)
  Dependency "hardhat-deployment-specialist" does not exist in registry
  Suggestion: Remove invalid dependency or add missing item to registry

[MISSING_DEPENDENCY] Security Audit Command (command/audit-security)
  Dependency "security-auditor-pro" does not exist in registry
  Suggestion: Remove invalid dependency or add missing item to registry

[CIRCULAR_DEPENDENCY] Frontend Fusion Engine (frontend-fusion-engine)
  Circular dependency detected: frontend-fusion-engine -> typescript-precision-engineer -> code-quality-enforcer -> frontend-fusion-engine
  Suggestion: Break the circular dependency chain


WARNINGS (2)

[INVALID_ID_FORMAT] Test Agent (test_agent_1)
  Dependency "Test_Dependency" has invalid ID format (should be kebab-case)
  Suggestion: Ensure dependency IDs follow kebab-case format

[SLUG_INSTEAD_OF_ID] DeFi Integration Agent (defi-integration-architect)
  Dependency "anchor-architect" appears to be a slug instead of an ID
  Suggestion: Use ID "icm-anchor-architect" instead of slug "anchor-architect"


INFO (15)

[ORPHANED_ITEM] Experimental Feature A (experimental-feature-a)
  Item has no dependencies and nothing depends on it

[ORPHANED_ITEM] Legacy Command X (legacy-command-x)
  Item has no dependencies and nothing depends on it

... (13 more orphaned items)


FIX SUGGESTIONS
--------------------------------------------------------------------------------
Deploy Command (command/deploy-test)
  Action: remove_dependency
  Current: "hardhat-deployment-specialist"
  Reason: Dependency does not exist in registry

Security Audit Command (command/audit-security)
  Action: remove_dependency
  Current: "security-auditor-pro"
  Reason: Dependency does not exist in registry

DeFi Integration Agent (defi-integration-architect)
  Action: update_dependency
  Current: "anchor-architect"
  Suggested: "icm-anchor-architect"
  Reason: Slug used instead of ID


MOST DEPENDED ON (Top 10)
--------------------------------------------------------------------------------
TypeScript Precision Engineer                    47 dependents
Rust Systems Architect                           32 dependents
Code Quality Enforcer                            28 dependents
API Architecture Patterns                        25 dependents
Database Optimization                            22 dependents
Solana Guardian Auditor                          20 dependents
Security Best Practices                          18 dependents
Testing Automation                               15 dependents
Documentation Generator                          12 dependents
Error Handling Patterns                          10 dependents


MOST DEPENDENCIES (Top 10)
--------------------------------------------------------------------------------
Fullstack Orchestrator                           8 dependencies
DeFi Integration Architect                       6 dependencies
Frontend Fusion Engine                           5 dependencies
ICM Anchor Architect                             4 dependencies
EVM Security Auditor                             4 dependencies
Deploy Production Workflow                       12 dependencies
Launch Token Workflow                            10 dependencies
Code Review Command                              3 dependencies
Gas Optimization Specialist                      3 dependencies
Database Schema Oracle                           2 dependencies

================================================================================


DETAILED BREAKDOWNS
================================================================================

Items with Missing Dependencies (2):
  - Deploy Command (command/deploy-test)
    Missing: hardhat-deployment-specialist
  - Security Audit Command (command/audit-security)
    Missing: security-auditor-pro

Items with Circular Dependencies (3):
  - Frontend Fusion Engine (frontend-fusion-engine)
    Path: frontend-fusion-engine → typescript-precision-engineer → code-quality-enforcer → frontend-fusion-engine
  - TypeScript Precision Engineer (typescript-precision-engineer)
    Path: frontend-fusion-engine → typescript-precision-engineer → code-quality-enforcer → frontend-fusion-engine
  - Code Quality Enforcer (code-quality-enforcer)
    Path: frontend-fusion-engine → typescript-precision-engineer → code-quality-enforcer → frontend-fusion-engine

Orphaned Items (15):
  - Experimental Feature A (experimental-feature-a) [agent]
  - Legacy Command X (legacy-command-x) [command]
  - Test Skill Beta (test-skill-beta) [skill]
  - Deprecated MCP Old (mcp-old-service) [mcp]
  - Unused Setting Alpha (setting-alpha) [setting]
  - Draft Workflow Z (workflow-draft-z) [workflow]
  - Prototype Agent 1 (prototype-agent-1) [agent]
  - Old Integration (old-integration) [skill]
  - Sunset Command (sunset-command) [command]
  - Archived MCP (archived-mcp) [mcp]
  - Test Feature (test-feature) [skill]
  - Sample Agent (sample-agent) [agent]
  - Demo Command (demo-command) [command]
  - Trial Skill (trial-skill) [skill]
  - Experimental MCP (experimental-mcp) [mcp]

================================================================================


❌ Validation failed with 3 errors and 2 warnings
```

## Interpretation

### Summary Section

- **Total Items**: Total number of items in the registry
- **Items with Dependencies**: How many items have at least one dependency
- **Items Valid**: Items without any validation issues
- **Items with Issues**: Items with at least one issue
- **Errors**: Critical issues that must be fixed
- **Warnings**: Non-critical issues that should be reviewed

### Coverage Statistics

- **Coverage**: Percentage of items with dependencies (69% is good)
- **Missing Dependencies**: Items referencing non-existent dependencies
- **Circular Dependencies**: Dependency loops that need to be broken
- **Orphaned Items**: Items that are isolated (informational)

### Coverage by Kind

Shows dependency coverage per item type:

- **100%** = All items of this type have dependencies (agents, skills)
- **67%** = Some items lack dependencies (commands)
- **0%** = No items have dependencies yet (settings, workflows)

### Issues Section

#### Errors (Must Fix)

1. **Missing Dependencies**: Remove or fix these dependencies
2. **Circular Dependencies**: Break the loop by removing one link
3. **Self-References**: Remove the self-reference

#### Warnings (Should Review)

1. **Invalid ID Format**: Use kebab-case IDs
2. **Slug Instead of ID**: Replace slugs with proper IDs

#### Info (Optional)

1. **Orphaned Items**: Consider adding dependencies or removing if unused

### Fix Suggestions

Actionable recommendations for each error:

- **remove_dependency**: Delete the invalid dependency
- **update_dependency**: Replace current value with suggested value
- **add_dependency**: Add missing dependencies

### Most Depended On

Items that are critical to the ecosystem - breaking changes here affect many items.

### Most Dependencies

Complex items that rely on many other items - more likely to have dependency issues.

## Strict Mode Output

```bash
npx tsx scripts/validate-registry.ts --strict
```

**Success:**

```
🔍 Validating gICM Registry...

✅ Registry validation passed with no errors!
```

**Failure:**

```
🔍 Validating gICM Registry...

❌ Validation failed with error:
Registry validation failed with 3 errors:

[Full validation report shown here...]

Process exited with code 1
```

## JSON Output

```bash
npx tsx scripts/validate-registry.ts --json
```

```json
{
  "timestamp": "2025-12-12T10:30:45.123Z",
  "summary": {
    "totalItems": 450,
    "itemsChecked": 450,
    "itemsWithDependencies": 312,
    "itemsValid": 445,
    "itemsWithIssues": 5,
    "errorCount": 3,
    "warningCount": 2
  },
  "issues": [
    {
      "itemId": "command/deploy-test",
      "itemName": "Deploy Command",
      "itemKind": "command",
      "severity": "error",
      "type": "missing_dependency",
      "message": "Dependency \"hardhat-deployment-specialist\" does not exist in registry",
      "suggestion": "Remove invalid dependency or add missing item to registry"
    }
  ],
  "fixSuggestions": [
    {
      "itemId": "command/deploy-test",
      "itemName": "Deploy Command",
      "action": "remove_dependency",
      "currentValue": "hardhat-deployment-specialist",
      "reason": "Dependency does not exist in registry"
    }
  ],
  "dependencyReport": {
    "totalItems": 450,
    "itemsWithDependencies": 312,
    "coveragePercentage": 69,
    "missingDependencies": [...],
    "circularDependencies": [...],
    "orphanedItems": [...],
    "mostDependedOn": [...],
    "mostDependencies": [...],
    "byKind": {...}
  }
}
```

## Quick Validation Output

```bash
node scripts/quick-validate.mjs
```

```
🔍 Quick Registry Validation
================================================================================

SUMMARY
--------------------------------------------------------------------------------
Total Items:              450
Items with Dependencies:  312
Coverage:                 69%
Missing Dependencies:     2
Circular Dependencies:    1
Orphaned Items:           15


COVERAGE BY KIND
--------------------------------------------------------------------------------
agent                56/56 (100%) ████████████████████
skill                142/142 (100%) ████████████████████
command              45/67 (67%) █████████████
mcp                  69/83 (83%) ████████████████


❌ MISSING DEPENDENCIES
--------------------------------------------------------------------------------
Deploy Command (command/deploy-test)
  → Missing: "hardhat-deployment-specialist"

Security Audit Command (command/audit-security)
  → Missing: "security-auditor-pro"


🔄 CIRCULAR DEPENDENCIES
--------------------------------------------------------------------------------
Cycle: frontend-fusion-engine → typescript-precision-engineer → code-quality-enforcer → frontend-fusion-engine


⭐ MOST DEPENDED ON (Top 10)
--------------------------------------------------------------------------------
TypeScript Precision Engineer                      47 dependents
Rust Systems Architect                             32 dependents
Code Quality Enforcer                              28 dependents
...

================================================================================

❌ Validation FAILED - Fix the issues above
```

## Item-Specific Validation

```bash
npx tsx scripts/validate-registry.ts --item frontend-fusion-engine
```

```
🔍 Validating gICM Registry...


Validation results for item: frontend-fusion-engine

[ERROR] circular_dependency
  Circular dependency detected: frontend-fusion-engine → typescript-precision-engineer → code-quality-enforcer → frontend-fusion-engine
  💡 Break the circular dependency chain

Process exited with code 1
```
