#!/bin/bash
# OPUS 67 Launcher - Shows status then starts Claude Code

echo ""
echo -e "\033[36m╔═══════════════════════════════════════════════════════════════╗\033[0m"
echo -e "\033[36m║  \033[1;33mOPUS 67 v6.0.0\033[0;36m │ \033[32m● ONLINE\033[36m │ Skills: 141 │ MCPs: 82     ║\033[0m"
echo -e "\033[36m╚═══════════════════════════════════════════════════════════════╝\033[0m"

# Detect project type
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    PROJECT="nextjs"
elif [ -f "Anchor.toml" ]; then
    PROJECT="solana"
elif [ -f "package.json" ]; then
    PROJECT="node"
else
    PROJECT="generic"
fi

echo -e "\033[90m├─ Project: \033[36m$PROJECT\033[90m │ Auto-loading skills...\033[0m"
echo ""

# Launch Claude Code
claude "$@"
