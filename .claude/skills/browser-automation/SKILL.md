---
name: browser-automation
description: "Browser automation guide. Playwright MCP vs browser-use vs Claude Preview vs Computer Use."
version: 1.0.0
triggers:
  keywords:
    - automate browser
    - browser automation
    - web scraping agent
    - screenshot to code
---

# Browser Automation — Pick the Right Tool

4 browser tools available. Each has a sweet spot.

## Tool Selection

| Tool                                      | Best For                                  | Speed  | Setup                                     |
| ----------------------------------------- | ----------------------------------------- | ------ | ----------------------------------------- |
| **Claude Preview** (`preview_start`)      | Testing YOUR app's UI                     | Fast   | Zero (built-in)                           |
| **Playwright MCP**                        | E2E tests, form filling, data extraction  | Medium | `npx @anthropic-ai/mcp-server-playwright` |
| **browser-use**                           | Anti-detect, CAPTCHA, persistent sessions | Medium | `npx browser-use cloud signup`            |
| **Computer Use** (`mcp__computer-use__*`) | Native desktop apps, cross-app workflows  | Slow   | Built-in (request access)                 |

## When to Use What

- **"Test if my button works"** → Claude Preview
- **"Scrape data from 50 pages"** → Playwright MCP
- **"Login to a site with anti-bot protection"** → browser-use (anti-detect + residential proxies)
- **"Click something in Figma/Photoshop"** → Computer Use
- **"Take a screenshot of my running app"** → Claude Preview (`preview_screenshot`)

## browser-use Setup (Cloud Browsers)

```bash
# Self-provisioning — Claude can do this autonomously
npx browser-use cloud signup
# Returns API key, no human intervention needed

# Features included (free tier):
# - Anti-detect browser profiles
# - CAPTCHA solving
# - Residential proxies (195+ countries)
# - Persistent sessions
```

## Screenshot-to-Code Workflow

```
1. preview_start → launch your dev server
2. preview_screenshot → capture current UI
3. Analyze screenshot → identify what to change
4. Edit code → make changes
5. preview_screenshot → verify result
```

## Playwright Quick Patterns

```
# Navigate and extract
mcp__playwright__navigate({ url: "https://example.com" })
mcp__playwright__screenshot()
mcp__playwright__get_text({ selector: ".main-content" })

# Fill forms
mcp__playwright__fill({ selector: "#email", value: "test@test.com" })
mcp__playwright__click({ selector: "button[type=submit]" })
```
