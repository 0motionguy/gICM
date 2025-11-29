#!/bin/bash
# ============================================================================
# gICM Platform - Build Services Only
# ============================================================================
# Quickly rebuild all services
# ============================================================================

set -e

cd "$(dirname "$0")/.."

echo "Building all services..."

# TypeScript services
pnpm --filter "./services/gicm-*" --parallel build

echo "✓ All services built"
echo ""
echo "Service CLIs available:"
echo "  gicm-money   - services/gicm-money-engine/dist/cli.js"
echo "  gicm-product - services/gicm-product-engine/dist/cli.js"
