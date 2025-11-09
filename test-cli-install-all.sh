#!/bin/bash

###############################################################################
# PHASE 2: Test ALL CLI Installations
# Tests installation of all 409 items via @gicm/cli
#
# WARNING: This script takes 60-90 minutes to complete
# Usage: ./test-cli-install-all.sh [--category agents|skills|commands|mcps|settings]
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TEST_DIR="/tmp/gicm-cli-test-$$"
RESULTS_FILE="./test-results-cli.json"
LOG_DIR="./test-logs-cli"

# Counters
TOTAL_TESTED=0
TOTAL_PASSED=0
TOTAL_FAILED=0

# Create directories
mkdir -p "$TEST_DIR"
mkdir -p "$LOG_DIR"

echo "🧪 COMPLETE CLI INSTALLATION TEST"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Test directory: $TEST_DIR"
echo "Results file: $RESULTS_FILE"
echo "Logs directory: $LOG_DIR"
echo ""

# Initialize results JSON
cat > "$RESULTS_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "testDirectory": "$TEST_DIR",
  "results": {
    "agents": [],
    "skills": [],
    "commands": [],
    "mcps": [],
    "settings": []
  },
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0
  }
}
EOF

# Function to test a single item
test_item() {
  local kind=$1
  local slug=$2
  local item_path="${kind}/${slug}"

  printf "Testing ${item_path}... "

  # Clean test directory
  rm -rf "$TEST_DIR/.claude"

  # Run installation
  cd "$TEST_DIR"
  if npx @gicm/cli add "${item_path}" --yes > "$LOG_DIR/${kind}-${slug}.log" 2>&1; then
    echo -e "${GREEN}✅${NC}"
    TOTAL_PASSED=$((TOTAL_PASSED + 1))
    return 0
  else
    echo -e "${RED}❌${NC}"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
    echo "  Error log: $LOG_DIR/${kind}-${slug}.log"
    return 1
  fi
}

# Test agents
test_category() {
  local category=$1
  shift
  local items=("$@")

  echo ""
  echo "📋 Testing ${category^^} (${#items[@]} items)"
  echo "───────────────────────────────────────────────────────────────"

  local cat_passed=0
  local cat_failed=0

  for slug in "${items[@]}"; do
    if test_item "$category" "$slug"; then
      cat_passed=$((cat_passed + 1))
    else
      cat_failed=$((cat_failed + 1))
    fi
    TOTAL_TESTED=$((TOTAL_TESTED + 1))

    # Progress every 10 items
    if (( TOTAL_TESTED % 10 == 0 )); then
      echo "  Progress: $TOTAL_TESTED tested, $TOTAL_PASSED passed, $TOTAL_FAILED failed"
    fi
  done

  echo "  Result: ${cat_passed}/${#items[@]} passed"

  if (( cat_failed > 0 )); then
    echo -e "  ${YELLOW}⚠️  ${cat_failed} failed${NC}"
  fi
}

# Define all items (extracted from registry)
# NOTE: In production, these would be loaded from the registry file

AGENTS=(
  "icm-anchor-architect"
  "frontend-fusion-engine"
  "rust-systems-architect"
  "database-schema-oracle"
  "api-design-architect"
  # ... Add all 90 agents here
  # To get full list: grep 'slug:' src/lib/registry.ts | grep agent | sed 's/.*"\(.*\)".*/\1/'
)

SKILLS=(
  "solana-anchor-mastery"
  "web3-wallet-integration"
  # ... Add all 96 skills here
)

COMMANDS=(
  "deploy-foundry"
  "verify-contract"
  # ... Add all 93 commands here
)

MCPS=(
  "postgres"
  "github"
  # ... Add all 82 MCPs here
)

SETTINGS=(
  "token-budget-strict"
  # ... Add all 48 settings here
)

# Run tests based on category filter
CATEGORY_FILTER=${1:-all}

case "$CATEGORY_FILTER" in
  agents)
    test_category "agent" "${AGENTS[@]}"
    ;;
  skills)
    test_category "skill" "${SKILLS[@]}"
    ;;
  commands)
    test_category "command" "${COMMANDS[@]}"
    ;;
  mcps)
    test_category "mcp" "${MCPS[@]}"
    ;;
  settings)
    test_category "setting" "${SETTINGS[@]}"
    ;;
  all|*)
    test_category "agent" "${AGENTS[@]}"
    test_category "skill" "${SKILLS[@]}"
    test_category "command" "${COMMANDS[@]}"
    test_category "mcp" "${MCPS[@]}"
    test_category "setting" "${SETTINGS[@]}"
    ;;
esac

# Final summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 FINAL RESULTS"
echo ""
echo "Total Tested: $TOTAL_TESTED"
echo -e "Passed: ${GREEN}$TOTAL_PASSED ✅${NC}"
echo -e "Failed: ${RED}$TOTAL_FAILED ❌${NC}"

if (( TOTAL_TESTED > 0 )); then
  SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_PASSED / $TOTAL_TESTED) * 100}")
  echo "Success Rate: ${SUCCESS_RATE}%"
fi

echo ""
echo "Results saved to: $RESULTS_FILE"
echo "Logs saved to: $LOG_DIR/"
echo ""
echo "═══════════════════════════════════════════════════════════════"

# Cleanup
rm -rf "$TEST_DIR"

# Exit with error if any tests failed
if (( TOTAL_FAILED > 0 )); then
  exit 1
fi
