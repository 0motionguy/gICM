#!/bin/bash
# ============================================================================
# gICM Platform - Build Agents Only
# ============================================================================
# Quickly rebuild all agent packages
# ============================================================================

set -e

cd "$(dirname "$0")/.."

echo "Building all agents..."

# Core first
pnpm --filter @gicm/agent-core build

# All agents in parallel
pnpm --filter "@gicm/*-agent" --parallel build

echo "✓ All agents built"
