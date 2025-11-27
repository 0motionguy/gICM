# Command: /feature

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Start a new Git Flow feature branch with automatic naming and branch protection

## Description

The `/feature` command creates a new feature branch following Git Flow conventions. It automatically generates branch names based on your feature description, ensures you're starting from the latest main/develop branch, and sets up branch protection rules to maintain clean version control.

This command is essential for teams following Git Flow methodology, ensuring consistent branch naming, preventing direct commits to protected branches, and maintaining a clean git history.

## Usage

```bash
/feature [feature-name]
```

## Arguments

- `feature-name` (optional) - A descriptive name for your feature. If omitted, you'll be prompted to provide one.

## Examples

### Example 1: Basic feature branch creation
```bash
/feature user-authentication
```
Creates a new branch: `feature/user-authentication` from the current develop branch.

### Example 2: Feature with multi-word name
```bash
/feature add-wallet-integration
```
Creates: `feature/add-wallet-integration` with automatic kebab-case formatting.

### Example 3: Interactive mode
```bash
/feature
```
Prompts you interactively for the feature name and provides suggestions based on current project context.

## Best Practices

- **Descriptive names**: Use clear, specific names that describe what the feature does (e.g., `implement-bonding-curve` instead of `updates`)
- **Keep scope focused**: Each feature branch should represent a single, atomic feature or enhancement
- **Regular commits**: Make frequent, meaningful commits with conventional commit messages
- **Stay updated**: Regularly merge or rebase from develop to avoid conflicts
- **Short-lived branches**: Aim to merge feature branches within a few days to avoid drift

## Workflow

The command performs the following steps:

1. **Validation**: Checks for uncommitted changes and warns if working directory is dirty
2. **Update**: Fetches latest changes from remote and updates develop branch
3. **Branch creation**: Creates new feature branch with `feature/` prefix
4. **Checkout**: Automatically switches to the new feature branch
5. **Push**: Optionally pushes the branch to remote with tracking

## Configuration

Configure default behaviors in your `.claude/settings.json`:

```json
{
  "git": {
    "defaultBaseBranch": "develop",
    "autoPush": true,
    "branchProtection": ["main", "master", "develop"]
  }
}
```

## Related Commands

- `/code-review` - Review code before merging feature
- `/release` - Create a release branch from develop
- `/hotfix` - Create an urgent hotfix branch from main

## Git Flow Integration

This command follows Git Flow branching model:

```
main (production)
  └─ develop (integration)
      ├─ feature/user-auth
      ├─ feature/wallet-integration
      └─ feature/bonding-curve
```

## Notes

- **Branch protection**: Main and develop branches are protected from direct commits
- **Naming convention**: All feature branches automatically receive `feature/` prefix
- **Conflict detection**: Command will warn if a branch with the same name already exists
- **Clean state required**: Uncommitted changes must be stashed or committed before creating new branch
- **Remote sync**: If remote repository exists, command offers to push branch and set up tracking
