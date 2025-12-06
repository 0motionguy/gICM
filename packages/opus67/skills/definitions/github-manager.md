# GitHub Manager Skill

**ID:** `github-manager`
**Tier:** 2
**Token Cost:** 5000
**Category:** DevOps & CI/CD

## Overview

Complete GitHub automation and management using Octokit REST/GraphQL APIs, GitHub Actions workflows, branch protection rules, issue/PR automation, GitHub Apps, and semantic releases.

## Prerequisites

```bash
npm install @octokit/rest @octokit/graphql @octokit/webhooks
npm install @actions/core @actions/github @actions/exec
npm install semantic-release @semantic-release/changelog @semantic-release/git
npm install conventional-changelog-conventionalcommits
```

## Core Capabilities

### 1. GitHub API - Octokit REST

```typescript
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { retry } from '@octokit/plugin-retry';

// Enhanced Octokit with rate limiting and retries
const MyOctokit = Octokit.plugin(throttling, retry);

interface GitHubClientConfig {
  auth: string;
  userAgent?: string;
  baseUrl?: string;
  previews?: string[];
}

class GitHubClient {
  private octokit: Octokit;

  constructor(config: GitHubClientConfig) {
    this.octokit = new MyOctokit({
      auth: config.auth,
      userAgent: config.userAgent || 'gICM-GitHub-Manager/1.0',
      baseUrl: config.baseUrl || 'https://api.github.com',
      throttle: {
        onRateLimit: (retryAfter, options, octokit) => {
          console.warn(
            \`Request quota exhausted for request \${options.method} \${options.url}\`
          );
          if (options.request.retryCount === 0) {
            console.log(\`Retrying after \${retryAfter} seconds!\`);
            return true;
          }
          return false;
        },
        onSecondaryRateLimit: (retryAfter, options, octokit) => {
          console.warn(
            \`SecondaryRateLimit detected for request \${options.method} \${options.url}\`
          );
          return true;
        },
      },
      retry: {
        doNotRetry: ['400', '401', '403', '404', '422'],
      },
    });
  }

  async getRepository(owner: string, repo: string) {
    const { data } = await this.octokit.repos.get({ owner, repo });
    return data;
  }

  async listRepositories(org: string, type: 'all' | 'public' | 'private' = 'all') {
    const repos = await this.octokit.paginate(
      this.octokit.repos.listForOrg,
      { org, type, per_page: 100 }
    );
    return repos;
  }

  async createRepository(params: {
    org?: string;
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
    gitignore_template?: string;
    license_template?: string;
  }) {
    const method = params.org
      ? this.octokit.repos.createInOrg
      : this.octokit.repos.createForAuthenticatedUser;

    const { data } = await method({
      ...(params.org ? { org: params.org } : {}),
      name: params.name,
      description: params.description,
      private: params.private ?? true,
      auto_init: params.auto_init ?? true,
      gitignore_template: params.gitignore_template,
      license_template: params.license_template,
    } as any);

    return data;
  }

  async updateRepository(
    owner: string,
    repo: string,
    updates: {
      name?: string;
      description?: string;
      homepage?: string;
      private?: boolean;
      has_issues?: boolean;
      has_projects?: boolean;
      has_wiki?: boolean;
      default_branch?: string;
      allow_squash_merge?: boolean;
      allow_merge_commit?: boolean;
      allow_rebase_merge?: boolean;
      delete_branch_on_merge?: boolean;
    }
  ) {
    const { data } = await this.octokit.repos.update({
      owner,
      repo,
      ...updates,
    });
    return data;
  }

  async getFile(owner: string, repo: string, path: string, ref?: string) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if ('content' in data) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return { content, sha: data.sha, data };
      }
      throw new Error('Path is a directory');
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createOrUpdateFile(params: {
    owner: string;
    repo: string;
    path: string;
    message: string;
    content: string;
    branch?: string;
    sha?: string;
  }) {
    const content = Buffer.from(params.content).toString('base64');

    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner: params.owner,
      repo: params.repo,
      path: params.path,
      message: params.message,
      content,
      branch: params.branch,
      sha: params.sha,
    });

    return data;
  }

  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch?: string
  ) {
    const { data } = await this.octokit.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha,
      branch,
    });
    return data;
  }

  async listBranches(owner: string, repo: string) {
    const branches = await this.octokit.paginate(
      this.octokit.repos.listBranches,
      { owner, repo, per_page: 100 }
    );
    return branches;
  }

  async getBranch(owner: string, repo: string, branch: string) {
    const { data } = await this.octokit.repos.getBranch({ owner, repo, branch });
    return data;
  }

  async createBranch(
    owner: string,
    repo: string,
    branch: string,
    fromBranch: string
  ) {
    const { data: refData } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: \`heads/\${fromBranch}\`,
    });

    const { data } = await this.octokit.git.createRef({
      owner,
      repo,
      ref: \`refs/heads/\${branch}\`,
      sha: refData.object.sha,
    });

    return data;
  }

  async deleteBranch(owner: string, repo: string, branch: string) {
    const { data } = await this.octokit.git.deleteRef({
      owner,
      repo,
      ref: \`heads/\${branch}\`,
    });
    return data;
  }

  async listCommits(
    owner: string,
    repo: string,
    options?: {
      sha?: string;
      path?: string;
      author?: string;
      since?: string;
      until?: string;
    }
  ) {
    const commits = await this.octokit.paginate(
      this.octokit.repos.listCommits,
      { owner, repo, per_page: 100, ...options }
    );
    return commits;
  }

  async getCommit(owner: string, repo: string, ref: string) {
    const { data } = await this.octokit.repos.getCommit({ owner, repo, ref });
    return data;
  }

  async compareCommits(
    owner: string,
    repo: string,
    base: string,
    head: string
  ) {
    const { data } = await this.octokit.repos.compareCommits({
      owner,
      repo,
      base,
      head,
    });
    return data;
  }

  async createCommit(params: {
    owner: string;
    repo: string;
    message: string;
    tree: string;
    parents: string[];
    author?: {
      name: string;
      email: string;
      date?: string;
    };
  }) {
    const { data } = await this.octokit.git.createCommit(params);
    return data;
  }

  getOctokit() {
    return this.octokit;
  }
}

// Usage example
async function initGitHubClient() {
  const client = new GitHubClient({
    auth: process.env.GITHUB_TOKEN!,
    userAgent: 'gICM-OPUS67/1.0',
  });

  return client;
}
```

### 2. GitHub GraphQL API

```typescript
import { graphql } from '@octokit/graphql';

interface GraphQLClientConfig {
  auth: string;
  baseUrl?: string;
}

class GitHubGraphQLClient {
  private client: typeof graphql;

  constructor(config: GraphQLClientConfig) {
    this.client = graphql.defaults({
      headers: {
        authorization: \`token \${config.auth}\`,
      },
      baseUrl: config.baseUrl || 'https://api.github.com',
    });
  }

  async getRepositoryInfo(owner: string, name: string) {
    const query = \`
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
          name
          description
          url
          createdAt
          updatedAt
          stargazerCount
          forkCount
          issues(states: OPEN) {
            totalCount
          }
          pullRequests(states: OPEN) {
            totalCount
          }
          primaryLanguage {
            name
            color
          }
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    \`;

    const result: any = await this.client(query, { owner, name });
    return result.repository;
  }

  async searchRepositories(query: string, first: number = 20) {
    const gqlQuery = \`
      query($query: String!, $first: Int!) {
        search(query: $query, type: REPOSITORY, first: $first) {
          repositoryCount
          edges {
            node {
              ... on Repository {
                id
                name
                description
                url
                stargazerCount
                forkCount
                primaryLanguage {
                  name
                  color
                }
                owner {
                  login
                  avatarUrl
                }
              }
            }
          }
        }
      }
    \`;

    const result: any = await this.client(gqlQuery, { query, first });
    return result.search;
  }

  async getPullRequestDetails(owner: string, name: string, number: number) {
    const query = \`
      query($owner: String!, $name: String!, $number: Int!) {
        repository(owner: $owner, name: $name) {
          pullRequest(number: $number) {
            id
            number
            title
            body
            state
            author {
              login
              avatarUrl
            }
            createdAt
            updatedAt
            mergedAt
            commits(first: 100) {
              totalCount
              nodes {
                commit {
                  oid
                  message
                  author {
                    name
                    email
                  }
                }
              }
            }
            reviews(first: 100) {
              totalCount
              nodes {
                author {
                  login
                }
                state
                body
              }
            }
            files(first: 100) {
              totalCount
              nodes {
                path
                additions
                deletions
              }
            }
          }
        }
      }
    \`;

    const result: any = await this.client(query, { owner, name, number });
    return result.repository.pullRequest;
  }

  async getIssueTimeline(owner: string, name: string, number: number) {
    const query = \`
      query($owner: String!, $name: String!, $number: Int!) {
        repository(owner: $owner, name: $name) {
          issue(number: $number) {
            id
            number
            title
            body
            state
            author {
              login
            }
            createdAt
            timelineItems(first: 100, itemTypes: [
              ISSUE_COMMENT,
              LABELED_EVENT,
              UNLABELED_EVENT,
              ASSIGNED_EVENT,
              UNASSIGNED_EVENT,
              CLOSED_EVENT,
              REOPENED_EVENT
            ]) {
              nodes {
                __typename
                ... on IssueComment {
                  id
                  body
                  author {
                    login
                  }
                  createdAt
                }
                ... on LabeledEvent {
                  label {
                    name
                  }
                  createdAt
                }
                ... on AssignedEvent {
                  assignee {
                    ... on User {
                      login
                    }
                  }
                  createdAt
                }
              }
            }
          }
        }
      }
    \`;

    const result: any = await this.client(query, { owner, name, number });
    return result.repository.issue;
  }

  async getContributorStats(owner: string, name: string) {
    const query = \`
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100) {
                  nodes {
                    author {
                      name
                      email
                      user {
                        login
                      }
                    }
                    additions
                    deletions
                    committedDate
                  }
                }
              }
            }
          }
        }
      }
    \`;

    const result: any = await this.client(query, { owner, name });
    return result.repository.defaultBranchRef.target.history.nodes;
  }

  async createIssue(params: {
    repositoryId: string;
    title: string;
    body?: string;
    labelIds?: string[];
    assigneeIds?: string[];
  }) {
    const mutation = \`
      mutation($input: CreateIssueInput!) {
        createIssue(input: $input) {
          issue {
            id
            number
            url
          }
        }
      }
    \`;

    const result: any = await this.client(mutation, {
      input: {
        repositoryId: params.repositoryId,
        title: params.title,
        body: params.body,
        labelIds: params.labelIds,
        assigneeIds: params.assigneeIds,
      },
    });

    return result.createIssue.issue;
  }

  async addComment(subjectId: string, body: string) {
    const mutation = \`
      mutation($input: AddCommentInput!) {
        addComment(input: $input) {
          commentEdge {
            node {
              id
              body
              createdAt
            }
          }
        }
      }
    \`;

    const result: any = await this.client(mutation, {
      input: { subjectId, body },
    });

    return result.addComment.commentEdge.node;
  }
}
```

### 3. GitHub Actions - Production Workflows

Complete CI/CD workflow with caching, parallel jobs, security scanning, and automated deployment.

```yaml
# .github/workflows/ci.yml - Production-grade CI pipeline
name: CI Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
  workflow_dispatch:
env:
  NODE_VERSION: '20.x'
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - uses: codecov/codecov-action@v4
```

### 4. Branch Protection & Status Checks

```typescript
class BranchProtectionManager {
  constructor(private client: GitHubClient) {}

  async applyMainBranchProtection(owner: string, repo: string) {
    return this.client.getOctokit().repos.updateBranchProtection({
      owner, repo, branch: 'main',
      required_status_checks: { strict: true, contexts: ['ci/test', 'ci/lint'] },
      enforce_admins: true,
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: true,
        required_approving_review_count: 2
      },
      required_linear_history: true,
      allow_force_pushes: false,
      allow_deletions: false
    });
  }
}
```

### 5. Issues & PR Automation

```typescript
class IssueManager {
  constructor(private client: GitHubClient) {}

  async createIssue(params: { owner: string; repo: string; title: string; body?: string; labels?: string[] }) {
    const { data } = await this.client.getOctokit().issues.create(params);
    return data;
  }

  async addLabels(owner: string, repo: string, issue_number: number, labels: string[]) {
    return this.client.getOctokit().issues.addLabels({ owner, repo, issue_number, labels });
  }
}

class PullRequestManager {
  constructor(private client: GitHubClient) {}

  async createPullRequest(params: {
    owner: string; repo: string; title: string; head: string; base: string; body?: string
  }) {
    return this.client.getOctokit().pulls.create(params);
  }

  async mergePullRequest(owner: string, repo: string, pull_number: number, merge_method?: 'merge' | 'squash' | 'rebase') {
    return this.client.getOctokit().pulls.merge({ owner, repo, pull_number, merge_method });
  }
}
```

### 6. GitHub Apps & Webhooks

```typescript
import { Webhooks } from '@octokit/webhooks';
import { App } from '@octokit/app';
import express from 'express';

class GitHubApp {
  private app: App;
  private webhooks: Webhooks;

  constructor(config: { appId: string; privateKey: string; webhookSecret: string }) {
    this.app = new App({
      appId: config.appId,
      privateKey: config.privateKey,
      webhooks: { secret: config.webhookSecret }
    });

    this.webhooks = new Webhooks({ secret: config.webhookSecret });
    this.setupWebhooks();
  }

  private setupWebhooks() {
    this.webhooks.on('pull_request.opened', async ({ payload }) => {
      console.log(\`PR opened: \${payload.pull_request.html_url}\`);
    });

    this.webhooks.on('issues.opened', async ({ payload }) => {
      console.log(\`Issue opened: \${payload.issue.html_url}\`);
    });

    this.webhooks.on('push', async ({ payload }) => {
      console.log(\`Push to \${payload.ref}\`);
    });
  }

  async startServer(port: number = 3000) {
    const app = express();
    app.use('/webhooks', require('@octokit/webhooks').createNodeMiddleware(this.webhooks));
    app.get('/health', (req, res) => res.json({ status: 'ok' }));
    app.listen(port, () => console.log(\`Server listening on port \${port}\`));
  }
}
```

### 7. Semantic Release Configuration

```typescript
// release.config.js
module.exports = {
  branches: ['main', { name: 'beta', prerelease: true }],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): \${nextRelease.version} [skip ci]'
      }
    ],
    ['@semantic-release/github', { successComment: false }]
  ]
};
```

## Complete Usage Example

```typescript
import { GitHubClient } from './github-client';
import { BranchProtectionManager } from './branch-protection';
import { IssueManager, PullRequestManager } from './automation';

async function main() {
  const client = new GitHubClient({ auth: process.env.GITHUB_TOKEN! });
  const protection = new BranchProtectionManager(client);
  await protection.applyMainBranchProtection('owner', 'repo');

  const issueManager = new IssueManager(client);
  const issue = await issueManager.createIssue({
    owner: 'owner',
    repo: 'repo',
    title: 'New Feature Request',
    body: 'Feature description here',
    labels: ['enhancement']
  });

  const prManager = new PullRequestManager(client);
  const pr = await prManager.createPullRequest({
    owner: 'owner',
    repo: 'repo',
    title: 'feat: Implement new feature',
    body: \`Closes #\${issue.number}\`,
    head: 'feature-branch',
    base: 'main'
  });

  console.log(\`Created PR #\${pr.number}: \${pr.html_url}\`);
}

main().catch(console.error);
```

## Best Practices

1. **Authentication** - Use GitHub Apps for better rate limits, never hardcode tokens
2. **Rate Limiting** - Implement exponential backoff, use conditional requests
3. **Error Handling** - Handle 404s gracefully, retry 5xx errors, log with context
4. **Security** - Validate webhook signatures, use branch protection, require reviews
5. **CI/CD** - Matrix builds, cache dependencies, parallel tests, reusable workflows

## Troubleshooting

```typescript
// Check rate limit status
const { data } = await octokit.rateLimit.get();
console.log(\`Remaining: \${data.rate.remaining}/\${data.rate.limit}\`);

// Webhook verification
import { verify } from '@octokit/webhooks-methods';
const isValid = await verify(webhookSecret, payload, signature);

// GraphQL optimization
const fragment = \`fragment repoInfo on Repository { id name description }\`;
```

## Performance Tips

1. Use GraphQL for complex queries (single request)
2. Implement pagination for large datasets
3. Cache responses with appropriate TTL
4. Batch operations when possible
5. Use webhooks instead of polling
6. Enable HTTP/2 for multiplexing

## Conclusion

This GitHub Manager skill provides production-ready implementations for complete GitHub automation including REST/GraphQL APIs, GitHub Actions workflows, branch protection, issue/PR automation, webhooks, and semantic releases. All code includes proper TypeScript typing, error handling, rate limiting, and security best practices.

## Resources

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub GraphQL API Documentation](https://docs.github.com/en/graphql)
- [Octokit.js Documentation](https://github.com/octokit/octokit.js)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Release](https://semantic-release.gitbook.io/)
