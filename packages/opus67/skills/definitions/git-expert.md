# Git Expert
> **ID:** `git-expert` | **Tier:** 2 | **Token Cost:** 5000

## What This Skill Does

Provides advanced Git expertise for professional development workflows, covering branching strategies, history manipulation, automation, and conflict resolution. This skill transforms Git from a basic version control tool into a powerful workflow orchestrator with deep knowledge of repository management, collaboration patterns, and team coordination.

**Core Focus Areas:**
- Strategic branching models for different team sizes and release cycles
- Advanced command mastery for complex repository operations
- Automated quality gates through hooks and CI integration
- Surgical history editing and problem diagnosis
- Multi-context development with worktrees
- Submodule management for monorepo alternatives

**Expected Outcomes:**
- Clean, meaningful commit history that serves as documentation
- Automated code quality enforcement at commit time
- Efficient conflict resolution with minimal disruption
- Safe history rewriting without losing work
- Parallel development across features and versions
- Professional team collaboration workflows

## When to Use

**Immediate Use Cases:**
- Setting up new repositories with professional workflows
- Implementing pre-commit quality gates (linting, formatting, tests)
- Resolving complex merge conflicts or untangling history
- Migrating from simple workflows to advanced branching strategies
- Managing multiple feature development contexts simultaneously
- Creating release branches and hotfix workflows
- Diagnosing when and where bugs were introduced
- Cleaning up commit history before pull requests
- Setting up monorepo or multi-package repositories
- Recovering from Git mistakes or lost commits

**Strategic Use Cases:**
- Designing branching strategies for growing teams
- Implementing Conventional Commits for automated changelogs
- Setting up Git Flow or GitHub Flow for release management
- Creating reusable Git hooks for team standardization
- Establishing code review and merge policies
- Integrating Git workflows with CI/CD pipelines
- Training teams on advanced Git techniques
- Optimizing repository performance and structure

**Anti-Patterns (When NOT to Use):**
- Simple single-branch personal projects
- When team prefers manual quality checks
- Learning Git fundamentals for the first time
- Quick prototype or throwaway code
- When automated tools would be overkill

## Core Capabilities

### 1. Branching Strategies

**Git Flow - Structured Release Management**

Git Flow provides a robust branching model for projects with scheduled releases:

```bash
# Repository structure
main          # Production-ready code only
develop       # Integration branch for features
feature/*     # Individual feature development
release/*     # Release preparation
hotfix/*      # Emergency production fixes
```

**Setting Up Git Flow:**

```bash
# Initialize Git Flow
git flow init

# Configuration prompts (recommended settings)
# Branch name for production releases: main
# Branch name for "next release": develop
# Feature branches prefix: feature/
# Release branches prefix: release/
# Hotfix branches prefix: hotfix/
# Support branches prefix: support/
# Version tag prefix: v
```

**Feature Development Workflow:**

```bash
# Start new feature (creates feature/user-authentication)
git flow feature start user-authentication

# Work on feature with regular commits
git add src/auth/
git commit -m "feat(auth): implement JWT token generation"

git add tests/auth/
git commit -m "test(auth): add token validation tests"

# Finish feature (merges to develop, deletes feature branch)
git flow feature finish user-authentication

# Alternatively, finish and push for code review
git flow feature publish user-authentication
# Creates pull request: feature/user-authentication -> develop
```

**Release Workflow:**

```bash
# Start release branch from develop
git flow release start 1.5.0

# On release branch: version bumps, changelog, final testing
npm version 1.5.0
git add package.json
git commit -m "chore(release): bump version to 1.5.0"

# Update changelog
git add CHANGELOG.md
git commit -m "docs(changelog): update for v1.5.0"

# Finish release (merges to main and develop, creates tag)
git flow release finish 1.5.0
# Enter tag message: "Release v1.5.0 - User Authentication"

# Push all branches and tags
git push origin main develop --tags
```

**Hotfix Workflow:**

```bash
# Emergency fix needed in production
git flow hotfix start 1.5.1

# Fix the critical bug
git add src/payment/
git commit -m "fix(payment): prevent duplicate charge on retry"

# Finish hotfix (merges to main and develop, creates tag)
git flow hotfix finish 1.5.1

# Hotfix is now in production and merged back to develop
git push origin main develop --tags
```

**GitHub Flow - Continuous Deployment**

Simplified workflow for teams deploying continuously:

```bash
# Always branch from main
git checkout main
git pull origin main
git checkout -b feature/add-payment-processing

# Develop with descriptive commits
git commit -m "feat(payment): integrate Stripe payment intent API"
git commit -m "feat(payment): add webhook handler for payment events"
git commit -m "test(payment): add integration tests for payment flow"

# Push and create pull request
git push -u origin feature/add-payment-processing

# After code review and CI passes, merge to main
# Deployment happens automatically from main branch

# Delete feature branch after merge
git branch -d feature/add-payment-processing
git push origin --delete feature/add-payment-processing
```

**Trunk-Based Development - Rapid Integration**

For high-velocity teams with strong CI/CD:

```bash
# Work on main with short-lived branches (hours, not days)
git checkout -b payment-webhook
# Develop for 2-4 hours maximum
git commit -m "feat(payment): add Stripe webhook endpoint"

# Integrate immediately
git checkout main
git pull origin main
git merge payment-webhook
git push origin main

# Or use feature flags for incomplete features
git commit -m "feat(payment): add payment UI (behind ENABLE_PAYMENTS flag)"

# Enable feature flag when ready
# No long-lived branches, continuous integration
```

**Branch Protection Rules:**

```bash
# Configure on GitHub/GitLab for main branch:
# - Require pull request reviews (1-2 approvers)
# - Require status checks to pass (CI, tests, linting)
# - Require branches to be up to date before merging
# - Require signed commits (optional)
# - Restrict who can push (protect from force push)

# Local enforcement with hooks (see Git Hooks section)
```

### 2. Advanced Commands

**Interactive Rebase - History Crafting**

```bash
# Rewrite last 5 commits
git rebase -i HEAD~5

# Interactive rebase interface:
# pick a1b2c3d feat(auth): add login endpoint
# squash e4f5g6h fix(auth): handle null password
# reword h7i8j9k feat(auth): add registration
# edit k0l1m2n feat(user): add profile endpoint
# drop n3o4p5q debug: temp logging

# Commands available:
# pick    - keep commit as-is
# reword  - keep commit, edit message
# edit    - pause to amend commit
# squash  - merge into previous commit, edit message
# fixup   - merge into previous commit, discard message
# drop    - remove commit entirely
# exec    - run shell command

# Squashing multiple commits:
git rebase -i HEAD~3
# squash all into first commit
# pick a1b2c3d feat(auth): implement authentication
# squash e4f5g6h feat(auth): add password validation
# squash h7i8j9k feat(auth): add tests
# Result: One commit with combined changes

# Fixup workflow (cleaner than squash):
git commit -m "feat(auth): implement authentication"
git commit -m "fixup! feat(auth): implement authentication"
git rebase -i HEAD~2 --autosquash
# Automatically arranges fixup commits
```

**Cherry-Pick - Selective Commit Application**

```bash
# Apply specific commit from another branch
git cherry-pick a1b2c3d

# Cherry-pick with custom message
git cherry-pick a1b2c3d --edit

# Cherry-pick range of commits
git cherry-pick a1b2c3d..e4f5g6h

# Cherry-pick without committing (stage changes only)
git cherry-pick a1b2c3d --no-commit
git commit -m "feat(payment): backport payment fix to v1.x"

# Handle cherry-pick conflicts
git cherry-pick a1b2c3d
# CONFLICT in src/auth.ts
git status
git add src/auth.ts
git cherry-pick --continue

# Abort if conflicts are too complex
git cherry-pick --abort

# Real-world example: Backport security fix
git checkout release/1.5
git log main --grep="security" --oneline
# Find: c7d8e9f fix(security): sanitize user input
git cherry-pick c7d8e9f
git push origin release/1.5
```

**Bisect - Binary Search for Bugs**

```bash
# Find commit that introduced bug
git bisect start

# Mark current state as bad
git bisect bad

# Mark last known good commit
git bisect good v1.4.0

# Git checks out middle commit
# Test the code (run tests, check bug)
npm test

# If bug present:
git bisect bad

# If bug not present:
git bisect good

# Repeat until Git identifies the commit
# Bisecting: 3 revisions left to test
# Bisecting: 1 revision left to test
# a1b2c3d is the first bad commit
# commit a1b2c3d
# Author: Developer <dev@example.com>
# Date:   Mon Nov 15 10:30:00 2024
#     feat(payment): refactor payment processing

# View the bad commit
git show a1b2c3d

# End bisect session
git bisect reset

# Automated bisect with test script:
git bisect start HEAD v1.4.0
git bisect run npm test
# Automatically runs test at each commit
# Exits when bug-introducing commit found
```

**Reflog - Time Travel and Recovery**

```bash
# View all reference updates (HEAD movements)
git reflog
# a1b2c3d HEAD@{0}: commit: feat(auth): add login
# e4f5g6h HEAD@{1}: rebase -i: squash commits
# h7i8j9k HEAD@{2}: checkout: moving from main to feature
# k0l1m2n HEAD@{3}: commit: fix(user): handle null email

# Recover deleted branch
git branch feature/deleted-feature h7i8j9k

# Undo destructive rebase
git reflog
# Find pre-rebase state: HEAD@{5}
git reset --hard HEAD@{5}

# Recover lost commits after reset
git reset --hard a1b2c3d
# Oh no, I needed those commits!
git reflog
git reset --hard HEAD@{1}

# View reflog for specific branch
git reflog show feature/authentication

# Reflog with dates
git reflog --date=relative
# a1b2c3d HEAD@{5 minutes ago}: commit: feat(auth)
# e4f5g6h HEAD@{2 hours ago}: rebase -i

# Clean old reflog entries (careful!)
git reflog expire --expire=30.days --all
git gc --prune=now
```

**Stash - Context Switching**

```bash
# Save work in progress
git stash push -m "WIP: payment validation refactor"

# Stash with untracked files
git stash push -u -m "WIP: new payment module"

# List stashes
git stash list
# stash@{0}: On feature/payment: WIP: new payment module
# stash@{1}: On main: WIP: payment validation refactor

# Apply most recent stash
git stash apply

# Apply specific stash
git stash apply stash@{1}

# Apply and remove stash
git stash pop

# Create branch from stash
git stash branch feature/payment-validation stash@{1}

# View stash contents
git stash show -p stash@{0}

# Drop specific stash
git stash drop stash@{1}

# Clear all stashes
git stash clear

# Partial stash (interactive)
git stash push -p
# Prompts for each hunk: stash this hunk [y,n,q,a,d,/,e,?]?
```

**Worktree - Parallel Development**

```bash
# Create new worktree for hotfix
git worktree add ../myproject-hotfix hotfix/1.5.1

# Now you have:
# ~/myproject/        - main development (feature branch)
# ~/myproject-hotfix/ - hotfix work (hotfix/1.5.1 branch)

# Work in hotfix directory
cd ../myproject-hotfix
git commit -m "fix(payment): prevent duplicate charges"
git push origin hotfix/1.5.1

# Return to main development
cd ../myproject
# Your feature work is untouched

# List all worktrees
git worktree list
# /Users/dev/myproject         a1b2c3d [feature/payment]
# /Users/dev/myproject-hotfix  e4f5g6h [hotfix/1.5.1]

# Remove worktree when done
git worktree remove ../myproject-hotfix

# Or prune deleted worktrees
git worktree prune

# Real-world workflow:
# Terminal 1: Feature development
git worktree add ../project-feature feature/new-ui
cd ../project-feature

# Terminal 2: Code review
git worktree add ../project-review pr/123
cd ../project-review

# Terminal 3: Hotfix
git worktree add ../project-hotfix hotfix/critical-bug
cd ../project-hotfix
```

### 3. Git Hooks

**Husky + Lint-Staged Setup**

```bash
# Install dependencies
npm install --save-dev husky lint-staged

# Initialize husky
npx husky init

# Creates .husky/ directory with sample pre-commit hook
```

**package.json Configuration:**

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.ts": [
      "npm run type-check"
    ]
  }
}
```

**Pre-Commit Hook (.husky/pre-commit):**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run tests on staged files
npm run test:staged

# Check for console.logs in production code
if git diff --cached --name-only | grep -E '\.tsx?$' | xargs grep -n 'console\.' | grep -v '\.test\.' | grep -v '\.spec\.'; then
  echo "ERROR: console.log found in staged files"
  exit 1
fi

# Check for TODO/FIXME in critical files
if git diff --cached --name-only | grep -E 'src/(api|payment|auth)' | xargs grep -n 'TODO\|FIXME'; then
  echo "WARNING: TODO/FIXME found in critical code"
  echo "Consider creating a ticket instead"
  exit 1
fi
```

**Commit-Msg Hook - Conventional Commits (.husky/commit-msg):**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Validate conventional commit format
npx --no -- commitlint --edit "$1"
```

**commitlint.config.js:**

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting, missing semi colons, etc
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvement
        'test',     // Adding missing tests
        'chore',    // Maintain, tooling, etc
        'revert',   // Revert previous commit
        'ci',       // CI/CD changes
        'build',    // Build system changes
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'payment',
        'user',
        'api',
        'ui',
        'db',
        'config',
        'deps',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
```

**Pre-Push Hook (.husky/pre-push):**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run full test suite before push
npm run test

# Run build to ensure no build errors
npm run build

# Check for breaking changes in public API
npm run api-check

# Prevent push to protected branches
branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" = "main" ] || [ "$branch" = "develop" ]; then
  echo "ERROR: Cannot push directly to $branch"
  echo "Please create a pull request instead"
  exit 1
fi
```

**Post-Commit Hook (.husky/post-commit):**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Auto-update ticket status in commit message
commit_msg=$(git log -1 --pretty=%B)

if echo "$commit_msg" | grep -q "closes #[0-9]\+"; then
  issue_number=$(echo "$commit_msg" | grep -o "closes #[0-9]\+" | grep -o "[0-9]\+")
  echo "Ticket #$issue_number marked as closed"
fi

# Generate updated changelog
npm run changelog:update
```

**Prepare-Commit-Msg Hook (.husky/prepare-commit-msg):**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Auto-add branch name to commit message
COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Only run for manual commits (not merge, template, etc)
if [ -z "$COMMIT_SOURCE" ]; then
  branch_name=$(git symbolic-ref --short HEAD)

  # Extract ticket number from branch name
  if [[ $branch_name =~ ^feature/([A-Z]+-[0-9]+) ]]; then
    ticket="${BASH_REMATCH[1]}"

    # Prepend ticket to commit message
    sed -i.bak -e "1s/^/[$ticket] /" "$COMMIT_MSG_FILE"
    rm "$COMMIT_MSG_FILE.bak"
  fi
fi
```

**Custom Hook - Check File Size:**

```bash
#!/usr/bin/env sh
# .husky/pre-commit-file-size

# Prevent large files from being committed
MAX_SIZE=1048576 # 1MB in bytes

while read -r file; do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    if [ "$size" -gt "$MAX_SIZE" ]; then
      echo "ERROR: File too large: $file ($size bytes)"
      echo "Maximum allowed size: $MAX_SIZE bytes (1MB)"
      echo "Consider using Git LFS for large files"
      exit 1
    fi
  fi
done < <(git diff --cached --name-only --diff-filter=ACMR)
```

**Server-Side Hooks (for self-hosted Git):**

```bash
# hooks/update - Server-side push validation
#!/bin/bash

refname="$1"
oldrev="$2"
newrev="$3"

# Prevent deletion of protected branches
if [ "$oldrev" != "0000000000000000000000000000000000000000" ] && \
   [ "$newrev" = "0000000000000000000000000000000000000000" ]; then
  if [ "$refname" = "refs/heads/main" ] || [ "$refname" = "refs/heads/develop" ]; then
    echo "ERROR: Deletion of $refname is not allowed"
    exit 1
  fi
fi

# Require signed commits
if ! git verify-commit "$newrev" 2>/dev/null; then
  echo "ERROR: Unsigned commits are not allowed"
  exit 1
fi

exit 0
```

### 4. Conflict Resolution

**Understanding Conflict Markers:**

```bash
# After merge conflict
git merge feature/payment
# CONFLICT (content): Merge conflict in src/payment.ts

# Conflict markers in file:
<<<<<<< HEAD (current branch)
function processPayment(amount: number): boolean {
  return stripe.charge(amount);
}
=======
function processPayment(amount: number, currency: string): Promise<boolean> {
  return stripe.charge(amount, currency);
}
>>>>>>> feature/payment (incoming branch)
```

**Merge Strategies:**

```bash
# Default recursive strategy
git merge feature/payment

# Prefer current branch (ours) for conflicts
git merge -X ours feature/payment

# Prefer incoming branch (theirs) for conflicts
git merge -X theirs feature/payment

# Ignore all whitespace changes
git merge -X ignore-all-space feature/payment

# Patience algorithm (better for large refactors)
git merge -X patience feature/payment

# Abort merge and return to pre-merge state
git merge --abort

# Continue merge after resolving conflicts
git add src/payment.ts
git merge --continue
```

**Three-Way Merge Tool:**

```bash
# Configure merge tool (VS Code, Meld, KDiff3, etc)
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait --merge $REMOTE $LOCAL $BASE $MERGED'

# Launch merge tool for conflicts
git mergetool

# Shows three panels:
# LEFT:   Current branch (ours)
# CENTER: Common ancestor (base)
# RIGHT:  Incoming branch (theirs)

# After resolving
git add resolved-file.ts
git merge --continue

# Clean up backup files created by mergetool
git clean -f
```

**Rerere - Reuse Recorded Resolution:**

```bash
# Enable rerere globally
git config --global rerere.enabled true

# First time resolving conflict
git merge feature/payment
# CONFLICT in src/payment.ts
# Resolve conflict manually
git add src/payment.ts
git commit

# Next time same conflict occurs
git merge another-branch
# Recorded resolution for 'src/payment.ts'
# Automatic merge failed; fix conflicts and then commit
git diff
# Shows conflict was automatically resolved using previous resolution

# View recorded resolutions
git rerere diff

# Clear recorded resolutions
git rerere clear

# Forget specific resolution
git rerere forget src/payment.ts
```

**Conflict Resolution Workflow:**

```bash
# Step 1: Identify conflicts
git status
# both modified:   src/payment.ts
# both modified:   src/auth.ts

# Step 2: View conflict details
git diff --ours src/payment.ts    # Our changes
git diff --theirs src/payment.ts  # Their changes
git diff --base src/payment.ts    # Against common ancestor

# Step 3: Check conflict type
git ls-files -u
# 100644 a1b2c3d 1 src/payment.ts  (base)
# 100644 e4f5g6h 2 src/payment.ts  (ours)
# 100644 h7i8j9k 3 src/payment.ts  (theirs)

# Step 4: Resolve conflict (manual edit or tool)
code src/payment.ts

# Step 5: Mark as resolved
git add src/payment.ts

# Step 6: Verify resolution
git diff --cached

# Step 7: Complete merge
git commit -m "merge: integrate payment feature with auth changes"

# Alternative: Checkout specific version
git checkout --ours src/payment.ts   # Keep our version
git checkout --theirs src/payment.ts # Keep their version
git add src/payment.ts
```

**Rebase Conflict Resolution:**

```bash
# During rebase
git rebase main
# CONFLICT (content): Merge conflict in src/payment.ts

# Resolve conflict
code src/payment.ts
git add src/payment.ts

# Continue rebase (applies next commit)
git rebase --continue

# Skip current commit if it's no longer needed
git rebase --skip

# Abort rebase and return to original state
git rebase --abort

# View current patch being applied
git am --show-current-patch
```

**Preventive Strategies:**

```bash
# Keep branches up to date to minimize conflicts
git checkout feature/payment
git fetch origin
git rebase origin/main

# Or merge instead of rebase
git merge origin/main

# Use feature flags to reduce merge conflicts
# Deploy incomplete features behind flags
// src/payment.ts
if (process.env.ENABLE_NEW_PAYMENT === 'true') {
  return newPaymentFlow();
}
return legacyPaymentFlow();

# Small, frequent merges over large, infrequent ones
git merge main  # Daily or several times per day

# Communicate with team about overlapping work
# Use pair programming for shared code areas
```

### 5. History Rewriting

**Interactive Rebase Deep Dive:**

```bash
# Edit last 7 commits
git rebase -i HEAD~7

# Rebase onto specific commit
git rebase -i a1b2c3d

# Rebase from branch point
git rebase -i $(git merge-base HEAD main)

# Advanced rebase commands in editor:
# pick a1b2c3d feat(auth): implement JWT authentication
# reword e4f5g6h feat(user): add user profile endpoint
# edit h7i8j9k feat(payment): integrate Stripe
# squash k0l1m2n fix(payment): handle null payment method
# fixup n3o4p5q fix(payment): typo in error message
# exec npm test
# drop q6r7s8t debug: temp logging code
# break

# Commands explained:
# exec - Run shell command between commits
git rebase -i HEAD~5
# pick a1b2c3d feat(api): add endpoint
# exec npm test
# pick e4f5g6h feat(api): add validation
# exec npm run lint

# break - Pause rebase for inspection
# edit - Pause to modify commit
git commit --amend
git rebase --continue

# Reordering commits
# Just move lines in editor:
# pick a1b2c3d feat(user): add profile
# pick e4f5g6h feat(auth): add login  # Moved down
# pick h7i8j9k feat(user): add avatar
```

**Squash vs Fixup:**

```bash
# Squash - Combine commits, edit message
git rebase -i HEAD~3
# pick a1b2c3d feat(payment): add Stripe integration
# squash e4f5g6h feat(payment): add payment validation
# squash h7i8j9k feat(payment): add payment tests

# Editor opens for combined message:
# This is a combination of 3 commits.
# feat(payment): add Stripe integration
#
# feat(payment): add payment validation
#
# feat(payment): add payment tests

# Edit to:
# feat(payment): implement complete Stripe payment flow
#
# - Integrate Stripe API for payment processing
# - Add comprehensive payment validation
# - Add unit and integration tests

# Fixup - Combine commits, discard message
git commit -m "feat(payment): add Stripe integration"
git commit -m "fixup! feat(payment): add Stripe integration"
git rebase -i HEAD~2 --autosquash
# Automatically arranges and squashes fixup commits

# Fixup workflow (recommended):
git commit -m "feat(auth): implement authentication"
# Oops, forgot something
git add forgotten-file.ts
git commit --fixup HEAD
# Creates: "fixup! feat(auth): implement authentication"

# Later, clean up
git rebase -i HEAD~5 --autosquash
# Fixup commits are automatically placed and squashed
```

**Amending Commits:**

```bash
# Amend last commit (add changes)
git add forgotten-file.ts
git commit --amend --no-edit

# Amend last commit (change message)
git commit --amend -m "feat(payment): implement Stripe payment flow"

# Amend last commit (both changes and message)
git add fixed-file.ts
git commit --amend

# Amend author
git commit --amend --author="John Doe <john@example.com>"

# Amend date
git commit --amend --date="2024-12-01 10:00:00"

# Amend older commit (not last)
git rebase -i HEAD~5
# Change 'pick' to 'edit' for target commit
# Make changes
git add changed-file.ts
git commit --amend
git rebase --continue
```

**Filter-Branch and Filter-Repo:**

```bash
# Remove sensitive file from entire history (use git-filter-repo)
pip install git-filter-repo

# Remove file
git filter-repo --path secrets.env --invert-paths

# Remove large file
git filter-repo --path large-file.zip --invert-paths

# Change author for all commits
git filter-repo --commit-callback '
  if commit.author_email == b"old@example.com":
    commit.author_email = b"new@example.com"
'

# Extract subdirectory as new repo
git filter-repo --subdirectory-filter packages/payment/

# Legacy filter-branch (not recommended)
git filter-branch --tree-filter 'rm -f secrets.env' HEAD

# Force push after filter (DANGEROUS)
git push origin --force --all
git push origin --force --tags
```

**Resetting and Reverting:**

```bash
# Reset types:
# --soft  - Move HEAD, keep staged and working changes
# --mixed - Move HEAD, unstage changes, keep working changes
# --hard  - Move HEAD, discard all changes

# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, unstage changes
git reset HEAD~1
git reset --mixed HEAD~1  # Same as above

# Undo last commit, discard changes (DANGEROUS)
git reset --hard HEAD~1

# Reset to specific commit
git reset --hard a1b2c3d

# Reset single file
git reset HEAD src/payment.ts

# Revert commit (creates new commit)
git revert a1b2c3d
# Safer than reset for shared branches

# Revert merge commit
git revert -m 1 e4f5g6h
# -m 1 specifies which parent to revert to

# Revert multiple commits
git revert --no-commit a1b2c3d..e4f5g6h
git commit -m "revert: undo payment feature changes"
```

**Safe History Rewriting Rules:**

```bash
# NEVER rewrite public history
# If commits are pushed to shared branch, DO NOT:
# - Rebase
# - Amend
# - Reset
# - Filter
# Exception: Force push allowed for personal feature branches

# Safe rewriting:
# 1. Feature branches before PR
git rebase -i main
git push --force-with-lease origin feature/payment

# 2. After PR feedback, before merge
git commit -m "fix(payment): address review feedback"
git push origin feature/payment

# Unsafe rewriting:
# 1. Never rewrite main/develop
# 2. Never rewrite shared feature branches
# 3. Never rewrite release branches
# 4. Never rewrite tags

# Force push safety:
# Use --force-with-lease instead of --force
git push --force-with-lease origin feature/payment
# Fails if remote has commits you don't have locally
# Prevents overwriting others' work

# Create backup before risky operations
git branch backup-before-rebase
git rebase -i HEAD~10
# If something goes wrong:
git reset --hard backup-before-rebase
```

### 6. Worktrees & Submodules

**Worktree Management:**

```bash
# List existing worktrees
git worktree list
# /home/dev/project      a1b2c3d [main]
# /home/dev/project-fix  e4f5g6h [hotfix/critical-bug]

# Add worktree for new branch
git worktree add ../project-feature feature/new-ui

# Add worktree for existing branch
git worktree add ../project-review existing-branch

# Add worktree with detached HEAD
git worktree add ../project-test a1b2c3d

# Add worktree and create new branch
git worktree add -b hotfix/security-fix ../project-hotfix main

# Remove worktree
git worktree remove ../project-feature

# Remove worktree forcefully (if directory deleted manually)
git worktree remove --force ../project-feature

# Prune stale worktrees
git worktree prune

# Lock worktree (prevent automatic pruning)
git worktree lock ../project-important

# Unlock worktree
git worktree unlock ../project-important

# Move worktree
git worktree move ../project-feature ../renamed-feature

# Repair worktree (after moving repository)
git worktree repair
```

**Worktree Workflows:**

```bash
# Workflow 1: Simultaneous feature development
git worktree add ../project-auth feature/authentication
git worktree add ../project-payment feature/payment

# Terminal 1
cd ../project-auth
npm run dev:auth

# Terminal 2
cd ../project-payment
npm run dev:payment

# Workflow 2: Code review while developing
git worktree add ../project-dev feature/my-work
git worktree add ../project-review main

# Continue working in project-dev
# Review PRs in project-review without context switching

# Workflow 3: Testing across versions
git worktree add ../project-v1 release/1.x
git worktree add ../project-v2 release/2.x
git worktree add ../project-main main

# Test feature in each version simultaneously

# Workflow 4: Hotfix without losing work
cd ~/project
# Working on feature, lots of uncommitted changes

# Emergency hotfix needed
git worktree add ../project-hotfix main
cd ../project-hotfix
# Fix bug, commit, push
# Return to feature work without stashing
cd ~/project
```

**Submodules - Nested Repositories:**

```bash
# Add submodule
git submodule add https://github.com/company/shared-lib.git libs/shared

# Add submodule to specific path
git submodule add https://github.com/company/ui-components.git packages/ui

# Clone repository with submodules
git clone --recursive https://github.com/company/main-project.git

# Or initialize submodules after cloning
git clone https://github.com/company/main-project.git
git submodule init
git submodule update

# Or in one command
git submodule update --init --recursive

# Update all submodules to latest
git submodule update --remote

# Update specific submodule
git submodule update --remote libs/shared

# Pull parent repo and update submodules
git pull
git submodule update --init --recursive

# View submodule status
git submodule status
# a1b2c3d4 libs/shared (v1.2.3)
# e5f6g7h8 packages/ui (v2.0.1)

# Execute command in all submodules
git submodule foreach 'git fetch'
git submodule foreach 'git checkout main'
git submodule foreach 'npm install'

# Remove submodule
git submodule deinit libs/shared
git rm libs/shared
git commit -m "remove shared library submodule"
rm -rf .git/modules/libs/shared
```

**Submodule Workflows:**

```bash
# Workflow 1: Working on submodule and parent
cd main-project
cd libs/shared

# Make changes in submodule
git checkout -b feature/shared-update
git commit -m "feat(shared): add new utility"
git push origin feature/shared-update

# Update parent to use new submodule commit
cd ../..
git add libs/shared
git commit -m "chore(deps): update shared library"
git push

# Workflow 2: Pinning submodule versions
cd main-project
cd libs/shared
git checkout v1.2.3
cd ../..
git add libs/shared
git commit -m "chore(deps): pin shared library to v1.2.3"

# Workflow 3: Development with local changes
# .gitmodules
[submodule "libs/shared"]
  path = libs/shared
  url = https://github.com/company/shared-lib.git
  branch = main

# Update to track specific branch
git config -f .gitmodules submodule.libs/shared.branch develop
git submodule update --remote

# Workflow 4: Shallow submodules (faster clones)
git clone --recursive --shallow-submodules https://github.com/company/main.git

# Or add shallow submodule
git submodule add --depth 1 https://github.com/company/large-repo.git
```

**Submodule Best Practices:**

```bash
# Use tags or specific commits for stability
cd libs/shared
git checkout v1.2.3
cd ../..
git add libs/shared
git commit -m "chore(deps): lock shared library to v1.2.3"

# Document submodule in README
# README.md
## Submodules
This project uses submodules. Clone with:
git clone --recursive https://github.com/company/project.git

Or initialize after cloning:
git submodule update --init --recursive

# Automate submodule updates in CI/CD
# .github/workflows/ci.yml
- name: Checkout code
  uses: actions/checkout@v4
  with:
    submodules: recursive

# Consider alternatives to submodules:
# 1. Monorepo (Nx, Turborepo)
# 2. Package manager (npm, yarn workspaces)
# 3. Git subtree (simpler than submodules)

# Git subtree alternative:
git subtree add --prefix libs/shared \
  https://github.com/company/shared-lib.git main --squash

# Update subtree
git subtree pull --prefix libs/shared \
  https://github.com/company/shared-lib.git main --squash

# Push changes back to subtree
git subtree push --prefix libs/shared \
  https://github.com/company/shared-lib.git main
```

## Real-World Examples

### Example 1: Feature Development Workflow

**Scenario:** Implement new payment processing feature with proper branching, commits, and PR.

```bash
# Step 1: Start feature branch
git checkout main
git pull origin main
git checkout -b feature/stripe-payment-integration

# Step 2: Initial implementation
git add src/payment/stripe-service.ts
git commit -m "feat(payment): create Stripe service with basic charge method"

git add src/config/payment.ts
git commit -m "feat(payment): add Stripe API configuration"

# Step 3: Clean up history with interactive rebase
git rebase -i HEAD~9

# Step 4: Push feature branch
git push -u origin feature/stripe-payment-integration

# Step 5: Create pull request
gh pr create --title "feat(payment): Implement Stripe payment integration"
```

### Example 2: Release Management

**Scenario:** Prepare and deploy v2.0.0 release using Git Flow.

```bash
# Step 1: Create release branch
git checkout -b release/2.0.0

# Step 2: Bump version
npm version 2.0.0 --no-git-tag-version
git commit -m "chore(release): bump version to 2.0.0"

# Step 3: Final release
git checkout main
git merge --no-ff release/2.0.0
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin main --tags
```

## Related Skills

**Complementary Skills:**
- `cicd-automation:github-actions-templates` - Automate Git workflows with CI/CD
- `security-scanning:sast-configuration` - Integrate security scanning in Git hooks
- `javascript-typescript:javascript-testing-patterns` - Testing patterns for Git hooks
- `nodejs-backend-patterns` - Backend workflows with Git integration

**Skill Progression:**
1. Start here: `git-expert` - Master Git fundamentals and workflows
2. Then: `cicd-automation:deployment-pipeline-design` - Automate Git-based deployments
3. Advanced: `cicd-automation:secrets-management` - Secure Git operations

**Related Tools & Technologies:**
- **GitHub CLI (gh):** Pull requests, issues, releases from command line
- **GitLab CLI (glab):** GitLab equivalent of GitHub CLI
- **Husky:** Git hooks made easy for Node.js projects
- **lint-staged:** Run linters on staged files only
- **commitlint:** Enforce conventional commit messages
- **conventional-changelog:** Generate changelogs from commits
- **semantic-release:** Automated version management and package publishing
- **Git LFS:** Large file storage for binary assets
- **Sourcetree/GitKraken:** Visual Git clients for complex operations
- **git-filter-repo:** Fast alternative to filter-branch

## Further Reading

**Official Documentation:**
- [Git Official Documentation](https://git-scm.com/doc) - Comprehensive Git reference
- [Pro Git Book](https://git-scm.com/book/en/v2) - Free online book covering everything Git
- [Git Flight Rules](https://github.com/k88hudson/git-flight-rules) - What to do when things go wrong

**Branching Strategies:**
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) - Original Git Flow article
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow) - Simplified workflow for continuous deployment
- [Trunk-Based Development](https://trunkbaseddevelopment.com/) - Alternative to Git Flow

**Commit Conventions:**
- [Conventional Commits](https://www.conventionalcommits.org/) - Specification for commit messages
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit) - Detailed commit message format
- [Semantic Versioning](https://semver.org/) - Version numbering scheme

**Advanced Topics:**
- [Git Internals](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain) - Understanding Git's architecture
- [Git Hooks Documentation](https://git-scm.com/docs/githooks) - Complete hooks reference
- [Git Submodules vs Subtrees](https://stackoverflow.com/questions/31769820/differences-between-git-submodule-and-subtree) - Choosing the right approach

**Tools & Integration:**
- [Husky Documentation](https://typicode.github.io/husky/) - Modern Git hooks for Node.js
- [lint-staged](https://github.com/okonet/lint-staged) - Run linters on staged files
- [commitlint](https://commitlint.js.org/) - Lint commit messages
- [git-filter-repo](https://github.com/newren/git-filter-repo) - Fast history rewriting

**Best Practices:**
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials) - Comprehensive Git tutorials
- [GitHub Skills](https://skills.github.com/) - Interactive Git learning
- [Oh Shit, Git!?!](https://ohshitgit.com/) - Plain English guide to fixing Git mistakes
- [Git Tips & Tricks](https://github.com/git-tips/tips) - Collection of useful Git commands

**Team Collaboration:**
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/) - Understanding pull request workflows
- [Code Review Best Practices](https://google.github.io/eng-practices/review/) - Google's code review guide
- [Gitflow Workflow Tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) - Detailed Git Flow explanation

**Performance & Optimization:**
- [Git Performance Tips](https://github.blog/2020-12-17-commits-are-snapshots-not-diffs/) - Understanding Git's internal model
- [Scaling Git](https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables#_performance) - Large repository optimization
- [Monorepo Tools](https://monorepo.tools/) - Tools for managing large Git repositories

---

**Version:** 1.0.0
**Last Updated:** 2024-12-05
**Maintainer:** OPUS 67 Skills Team
