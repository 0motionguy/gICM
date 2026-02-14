#!/usr/bin/env bash
set -euo pipefail

# Publish all @gicm packages with a single OTP
# Usage: ./scripts/publish-all.sh <otp-code>

OTP="${1:?Usage: publish-all.sh <otp-code>}"

PACKAGES=(
  "gicm-router"
  "gicm-goldfish"
  "gicm-soul"
  "gicm-cache"
  "gicm-context"
  "gicm-shield"
  "gicm-orchestrator"
  "gicm-dashboard"
  "gicm-polyclaw-pro"
  "gicm-installer"
  "opus67"
)

# Skip memory (already published at same version)
echo "=== Publishing ${#PACKAGES[@]} packages with OTP ==="

for pkg in "${PACKAGES[@]}"; do
  PKG_DIR="packages/${pkg}"
  NAME=$(node -p "require('./${PKG_DIR}/package.json').name")
  VERSION=$(node -p "require('./${PKG_DIR}/package.json').version")
  echo -n "  ${NAME}@${VERSION} ... "

  cd "${PKG_DIR}"
  npm publish --access public --otp="${OTP}" 2>&1 | tail -1
  cd - > /dev/null
done

echo ""
echo "=== Done ==="
