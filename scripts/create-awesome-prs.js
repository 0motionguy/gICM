#!/usr/bin/env node
/**
 * Create PRs for Awesome Lists - OPUS 67
 * Forks repos, creates branches, commits changes, and opens PRs
 */

const https = require("https");
const fs = require("fs");

// Token from environment variable
const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const USERNAME = "0motionguy";

const AWESOME_LISTS = [
  {
    owner: "punkpeye",
    repo: "awesome-mcp-servers",
    section: "Development Tools",
    entry:
      "- [OPUS 67](https://github.com/icm-motion/gICM) - Skill management system with 593+ components. MCP tools for dynamic context loading and multi-step workflows.",
    prTitle: "Add OPUS 67 - MCP-based skill management system",
    prBody: `## Description

OPUS 67 provides MCP tools for dynamic skill loading and context management.

## MCP Tools Provided

- \`opus67_detect_skills\` - Semantic detection of relevant skills
- \`opus67_get_skill\` - Load specific skill into context
- \`opus67_get_context\` - Get full context bundle for a task
- \`opus67_list_skills\` - List all available skills

## Features

- 96 skills available via MCP
- 108 agents (multi-skill workflows)
- 82 external MCP integrations
- On-demand loading (progressive disclosure)

## Installation

\`\`\`bash
npx @gicm/opus67 init
\`\`\`

Automatically configures MCP for Claude Desktop or VS Code.

## Links

- GitHub: https://github.com/icm-motion/gICM
- Documentation: https://gicm.app/opus67

## Checklist

- [x] Implements MCP protocol
- [x] Open source
- [x] Actively maintained
- [x] Documentation available`,
  },
];

/**
 * Make GitHub API request
 */
function githubRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      path,
      method,
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "User-Agent": "OPUS67-PR-Bot",
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            console.error(
              `API Error (${res.statusCode}):`,
              json.message || json
            );
            reject(new Error(json.message || `HTTP ${res.statusCode}`));
          }
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Fork a repository
 */
async function forkRepo(owner, repo) {
  console.log(`📋 Forking ${owner}/${repo}...`);
  try {
    const result = await githubRequest("POST", `/repos/${owner}/${repo}/forks`);
    console.log(`✅ Forked to ${USERNAME}/${repo}`);
    return result;
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log(`ℹ️  Fork already exists at ${USERNAME}/${repo}`);
      return { name: repo };
    }
    throw error;
  }
}

/**
 * Get default branch of a repo
 */
async function getDefaultBranch(owner, repo) {
  const result = await githubRequest("GET", `/repos/${owner}/${repo}`);
  return result.default_branch || "main";
}

/**
 * Get latest commit SHA of a branch
 */
async function getLatestCommit(owner, repo, branch) {
  const result = await githubRequest(
    "GET",
    `/repos/${owner}/${repo}/git/ref/heads/${branch}`
  );
  return result.object.sha;
}

/**
 * Create a new branch
 */
async function createBranch(owner, repo, branchName, fromSha) {
  console.log(`🌿 Creating branch ${branchName}...`);
  try {
    await githubRequest("POST", `/repos/${owner}/${repo}/git/refs`, {
      ref: `refs/heads/${branchName}`,
      sha: fromSha,
    });
    console.log(`✅ Branch created: ${branchName}`);
  } catch (error) {
    if (error.message.includes("Reference already exists")) {
      console.log(`ℹ️  Branch ${branchName} already exists`);
    } else {
      throw error;
    }
  }
}

/**
 * Get file contents
 */
async function getFileContents(owner, repo, path, branch) {
  try {
    const result = await githubRequest(
      "GET",
      `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    );
    return {
      content: Buffer.from(result.content, "base64").toString("utf-8"),
      sha: result.sha,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Create or update file
 */
async function updateFile(
  owner,
  repo,
  path,
  content,
  message,
  branch,
  sha = null
) {
  console.log(`📝 Updating ${path}...`);
  const body = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch,
  };
  if (sha) body.sha = sha;

  await githubRequest("PUT", `/repos/${owner}/${repo}/contents/${path}`, body);
  console.log(`✅ File updated`);
}

/**
 * Create pull request
 */
async function createPR(owner, repo, title, body, head, base) {
  console.log(`🚀 Creating PR: ${title}...`);
  const result = await githubRequest("POST", `/repos/${owner}/${repo}/pulls`, {
    title,
    body,
    head: `${USERNAME}:${head}`,
    base,
  });
  console.log(`✅ PR created: ${result.html_url}`);
  return result;
}

/**
 * Process one awesome list
 */
async function processAwesomeList(list) {
  const { owner, repo, entry, prTitle, prBody } = list;
  const branchName = "add-opus67";

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Processing: ${owner}/${repo}`);
  console.log(`${"=".repeat(50)}\n`);

  try {
    // Step 1: Fork the repo
    await forkRepo(owner, repo);

    // Wait for fork to be ready
    console.log(`⏳ Waiting for fork to sync...`);
    await new Promise((r) => setTimeout(r, 5000));

    // Step 2: Get default branch
    const defaultBranch = await getDefaultBranch(owner, repo);
    console.log(`📌 Default branch: ${defaultBranch}`);

    // Step 3: Get latest commit from our fork
    const latestSha = await getLatestCommit(USERNAME, repo, defaultBranch);
    console.log(`📌 Latest commit: ${latestSha.substring(0, 7)}`);

    // Step 4: Create new branch
    await createBranch(USERNAME, repo, branchName, latestSha);

    // Step 5: Get README.md
    const readme = await getFileContents(
      USERNAME,
      repo,
      "README.md",
      branchName
    );
    if (!readme) {
      console.error(`❌ Could not find README.md`);
      return;
    }

    // Step 6: Find section and add entry
    let content = readme.content;

    // Try to find a good insertion point (look for similar entries)
    const lines = content.split("\n");
    let insertIndex = -1;

    // Look for existing tool entries (lines starting with "- [")
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^- \[.+\]\(.+\)/)) {
        insertIndex = i + 1; // Insert after this line
      }
    }

    if (insertIndex === -1) {
      // Fallback: add at the end
      content = content.trim() + "\n\n" + entry + "\n";
    } else {
      // Insert after the last tool entry
      lines.splice(insertIndex, 0, entry);
      content = lines.join("\n");
    }

    // Step 7: Update README
    await updateFile(
      USERNAME,
      repo,
      "README.md",
      content,
      "Add OPUS 67 to the list",
      branchName,
      readme.sha
    );

    // Step 8: Create PR
    const pr = await createPR(
      owner,
      repo,
      prTitle,
      prBody,
      branchName,
      defaultBranch
    );

    console.log(`\n🎉 Successfully created PR for ${owner}/${repo}`);
    console.log(`🔗 ${pr.html_url}\n`);

    return pr;
  } catch (error) {
    console.error(`\n❌ Failed to process ${owner}/${repo}:`, error.message);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n🚀 OPUS 67 Awesome List PR Creator\n`);
  console.log(`Creating PRs for ${AWESOME_LISTS.length} awesome list(s)...\n`);

  const results = [];
  for (const list of AWESOME_LISTS) {
    const result = await processAwesomeList(list);
    if (result) results.push(result);

    // Wait between PRs to be polite
    if (AWESOME_LISTS.indexOf(list) < AWESOME_LISTS.length - 1) {
      console.log(`⏳ Waiting 3 seconds before next PR...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`SUMMARY`);
  console.log(`${"=".repeat(50)}`);
  console.log(`✅ Created ${results.length}/${AWESOME_LISTS.length} PRs`);
  results.forEach((pr) => {
    console.log(`   - ${pr.html_url}`);
  });
}

main().catch((error) => {
  console.error(`\n💥 Fatal error:`, error.message);
  process.exit(1);
});
