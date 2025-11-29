#!/bin/bash
# ============================================================================
# gICM Platform - Update All Script
# ============================================================================
# Run this script to bring all agents and services up to date
#
# Usage:
#   ./scripts/update-all.sh           # Full update
#   ./scripts/update-all.sh --quick   # Skip install, just build
# ============================================================================

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "════════════════════════════════════════════════════════════"
echo "  gICM Platform - Update All"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check for quick mode
QUICK_MODE=false
if [ "$1" == "--quick" ]; then
    QUICK_MODE=true
    echo "Running in quick mode (skipping install)"
fi

# Step 1: Install dependencies
if [ "$QUICK_MODE" = false ]; then
    echo "Step 1/4: Installing dependencies..."
    pnpm install
    echo "✓ Dependencies installed"
    echo ""
fi

# Step 2: Build core packages first
echo "Step 2/4: Building core packages..."
pnpm --filter @gicm/agent-core build 2>/dev/null || echo "  (agent-core skipped)"
echo "✓ Core packages built"
echo ""

# Step 3: Build all packages
echo "Step 3/4: Building all packages..."
pnpm -r build
echo "✓ All packages built"
echo ""

# Step 4: Verify builds
echo "Step 4/4: Verifying builds..."

# Count built packages
BUILT_COUNT=0
FAILED_COUNT=0

for pkg in packages/*/dist; do
    if [ -d "$pkg" ]; then
        ((BUILT_COUNT++))
    fi
done

for svc in services/*/dist; do
    if [ -d "$svc" ]; then
        ((BUILT_COUNT++))
    fi
done

echo "✓ $BUILT_COUNT packages/services built successfully"
echo ""

# Summary
echo "════════════════════════════════════════════════════════════"
echo "  Update Complete!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Built packages:"
ls -d packages/*/dist 2>/dev/null | sed 's|packages/||g' | sed 's|/dist||g' | while read pkg; do
    echo "  ✓ @gicm/$pkg"
done

echo ""
echo "Built services:"
ls -d services/*/dist 2>/dev/null | sed 's|services/||g' | sed 's|/dist||g' | while read svc; do
    echo "  ✓ $svc"
done

echo ""
echo "Run 'pnpm dev' to start development mode"
echo ""
