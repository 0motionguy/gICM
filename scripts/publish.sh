#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/publish.sh [all|router|goldfish|soul|memory|cache|context|shield|orchestrator|dashboard|polyclaw-pro|opus67|installer] [patch|minor|major]
# Builds, tests, bumps version, and publishes @gicm packages to npm.

PACKAGES=(
  "gicm-router"
  "gicm-goldfish"
  "gicm-soul"
  "gicm-memory"
  "gicm-cache"
  "gicm-context"
  "gicm-shield"
  "gicm-orchestrator"
  "gicm-dashboard"
  "gicm-polyclaw-pro"
  "opus67"
  "gicm-installer"
)

TARGET="${1:-all}"
BUMP="${2:-patch}"
DRY_RUN="${3:-}"

if [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
  echo "Error: bump must be patch, minor, or major (got: $BUMP)"
  exit 1
fi

# Resolve target packages
if [[ "$TARGET" == "all" ]]; then
  TARGETS=("${PACKAGES[@]}")
else
  # Map short names to dir names
  case "$TARGET" in
    router|goldfish|soul|memory|cache|context|shield|orchestrator|dashboard|installer)
      TARGETS=("gicm-${TARGET}")
      ;;
    polyclaw-pro)
      TARGETS=("gicm-polyclaw-pro")
      ;;
    opus67)
      TARGETS=("opus67")
      ;;
    *)
      TARGETS=("$TARGET")
      ;;
  esac
fi

echo "=== @gicm Publish ==="
echo "Targets: ${TARGETS[*]}"
echo "Bump:    $BUMP"
echo ""

for pkg in "${TARGETS[@]}"; do
  PKG_DIR="packages/${pkg}"

  if [[ ! -f "${PKG_DIR}/package.json" ]]; then
    echo "Error: ${PKG_DIR}/package.json not found"
    exit 1
  fi

  NAME=$(node -p "require('./${PKG_DIR}/package.json').name")
  CURRENT=$(node -p "require('./${PKG_DIR}/package.json').version")

  echo "--- ${NAME} (v${CURRENT}) ---"

  # Build
  echo "  Building..."
  pnpm --filter "${NAME}" build

  # Test
  echo "  Testing..."
  pnpm --filter "${NAME}" test -- --run

  # Bump version
  echo "  Bumping ${BUMP}..."
  cd "${PKG_DIR}"
  npm version "${BUMP}" --no-git-tag-version
  NEW_VERSION=$(node -p "require('./package.json').version")
  cd - > /dev/null

  # Publish
  if [[ "$DRY_RUN" == "--dry-run" ]]; then
    echo "  Publishing (dry run)..."
    pnpm --filter "${NAME}" publish --access public --no-git-checks --dry-run
  else
    echo "  Publishing v${NEW_VERSION}..."
    pnpm --filter "${NAME}" publish --access public --no-git-checks
  fi

  echo "  Done: ${NAME}@${NEW_VERSION}"
  echo ""
done

# Git commit + tag (skip for dry runs)
if [[ "$DRY_RUN" != "--dry-run" ]]; then
  echo "=== Git commit + tags ==="
  git add -A
  git commit -m "chore: publish @gicm packages (${BUMP})" || echo "No changes to commit"

  for pkg in "${TARGETS[@]}"; do
    PKG_DIR="packages/${pkg}"
    NAME=$(node -p "require('./${PKG_DIR}/package.json').name")
    VERSION=$(node -p "require('./${PKG_DIR}/package.json').version")
    TAG="${NAME}@v${VERSION}"
    git tag "${TAG}" 2>/dev/null || echo "Tag ${TAG} already exists"
  done

  echo ""
  echo "Tags created. Run 'git push origin HEAD --tags' to push."
fi

echo ""
echo "=== Publish complete ==="
