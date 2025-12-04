/**
 * OPUS 67 Skill Hints v4.0
 * Lightweight MCP-backed hints that replace heavy skills
 * 94% token reduction: 91K → 5.7K tokens
 */

export interface SkillHint {
  id: string;
  name: string;
  token_cost: number;          // ~300-500 tokens (vs 5K-10K for full skills)
  backed_by_mcp: string[];     // MCPs that provide the actual capability
  replaces_skill?: string;     // Original skill this hint replaces
  prompt_snippet: string;      // Minimal context injected into prompt
  keywords: string[];          // Trigger keywords for auto-loading
}

/**
 * 15 MCP-backed hints that replace heavy skills
 * Total: ~5,700 tokens (vs 91K for full skill versions)
 */
export const SKILL_HINTS: SkillHint[] = [
  // Blockchain/DeFi Hints
  {
    id: 'jupiter-hint',
    name: 'Jupiter Trading Hint',
    token_cost: 400,
    backed_by_mcp: ['jupiter'],
    replaces_skill: 'jupiter-trader',
    keywords: ['swap', 'dex', 'jupiter', 'trade', 'token price', 'slippage'],
    prompt_snippet: `Use Jupiter MCP for Solana token swaps:
- jupiter.quote(inputMint, outputMint, amount) - Get swap quote
- jupiter.swap(quote, userPublicKey) - Execute swap
- jupiter.tokens() - List tradeable tokens
Always check slippage and use priority fees for time-sensitive trades.`
  },
  {
    id: 'defi-data-hint',
    name: 'DeFi Data Hint',
    token_cost: 500,
    backed_by_mcp: ['birdeye', 'helius'],
    replaces_skill: 'defi-data-analyst',
    keywords: ['defi', 'tvl', 'volume', 'liquidity', 'pool', 'token data'],
    prompt_snippet: `Use Birdeye MCP for DeFi data:
- birdeye.getTokenPrice(address) - Current price
- birdeye.getTokenSecurity(address) - Rug check
- birdeye.getTopTraders(address) - Whale activity
Use Helius MCP for on-chain data and transaction history.`
  },
  {
    id: 'social-hint',
    name: 'Crypto Social Hint',
    token_cost: 400,
    backed_by_mcp: ['tweetscout', 'santiment'],
    replaces_skill: 'crypto-twitter-analyst',
    keywords: ['twitter', 'sentiment', 'social', 'influencer', 'ct', 'crypto twitter'],
    prompt_snippet: `Use TweetScout MCP for crypto social analysis:
- tweetscout.getInfluencerScore(handle) - Influencer metrics
- tweetscout.getTokenMentions(symbol) - Social volume
Use Santiment for broader market sentiment data.`
  },
  {
    id: 'chain-data-hint',
    name: 'Chain Data Hint',
    token_cost: 350,
    backed_by_mcp: ['helius', 'solana'],
    replaces_skill: 'solana-reader',
    keywords: ['balance', 'transaction', 'account', 'rpc', 'solana data'],
    prompt_snippet: `Use Helius MCP for Solana chain data:
- helius.getAssetsByOwner(wallet) - All token holdings
- helius.getTransactionHistory(address) - Tx history
- helius.getAsset(mint) - Token metadata
Prefer Helius over raw RPC for better performance.`
  },

  // Developer Tools Hints
  {
    id: 'github-hint',
    name: 'GitHub Hint',
    token_cost: 300,
    backed_by_mcp: ['github'],
    replaces_skill: 'github-manager',
    keywords: ['github', 'repo', 'pr', 'issue', 'commit', 'branch'],
    prompt_snippet: `Use GitHub MCP for repo operations:
- github.createPR(title, body, branch) - Create pull request
- github.listIssues(repo) - Get issues
- github.getFile(repo, path) - Read file contents
Always create branches before committing changes.`
  },
  {
    id: 'memory-hint',
    name: 'Memory Hint',
    token_cost: 300,
    backed_by_mcp: ['mem0'],
    replaces_skill: 'memory-keeper',
    keywords: ['remember', 'memory', 'recall', 'context', 'persist'],
    prompt_snippet: `Use Mem0 MCP for persistent memory:
- mem0.add(content, metadata) - Store memory
- mem0.search(query) - Semantic search
- mem0.getAll(userId) - Retrieve user memories
Use namespaces to organize memories by project/context.`
  },
  {
    id: 'vector-hint',
    name: 'Vector DB Hint',
    token_cost: 350,
    backed_by_mcp: ['qdrant'],
    replaces_skill: 'vector-wizard',
    keywords: ['vector', 'embedding', 'similarity', 'search', 'qdrant', 'semantic'],
    prompt_snippet: `Use Qdrant MCP for vector operations:
- qdrant.upsert(collection, vectors) - Store embeddings
- qdrant.search(collection, vector, limit) - Similarity search
- qdrant.createCollection(name, size) - Create collection
Use OpenAI/Voyage embeddings (1536/1024 dims).`
  },
  {
    id: 'supabase-hint',
    name: 'Supabase Hint',
    token_cost: 400,
    backed_by_mcp: ['supabase'],
    replaces_skill: 'db-commander',
    keywords: ['supabase', 'database', 'postgres', 'sql', 'realtime', 'auth'],
    prompt_snippet: `Use Supabase MCP for backend:
- supabase.from(table).select() - Query data
- supabase.from(table).insert(data) - Insert rows
- supabase.rpc(function, params) - Call stored procedures
Enable RLS policies for security. Use realtime for live updates.`
  },
  {
    id: 'sentry-hint',
    name: 'Sentry Hint',
    token_cost: 350,
    backed_by_mcp: ['sentry'],
    replaces_skill: 'error-hunter',
    keywords: ['error', 'sentry', 'debug', 'exception', 'crash', 'monitoring'],
    prompt_snippet: `Use Sentry MCP for error tracking:
- sentry.captureException(error) - Log error
- sentry.getIssues(project) - List issues
- sentry.getEventContext(eventId) - Error details
Always include user context and breadcrumbs.`
  },

  // Research & Scraping Hints
  {
    id: 'scraping-hint',
    name: 'Web Scraping Hint',
    token_cost: 400,
    backed_by_mcp: ['firecrawl', 'jina'],
    replaces_skill: 'web-scraper',
    keywords: ['scrape', 'crawl', 'extract', 'website', 'html', 'parse'],
    prompt_snippet: `Use Firecrawl MCP for web scraping:
- firecrawl.scrapeUrl(url) - Get page content as markdown
- firecrawl.crawlUrl(url, options) - Crawl site
Use Jina MCP for reader mode extraction.
Respect robots.txt and rate limits.`
  },
  {
    id: 'research-hint',
    name: 'Research Hint',
    token_cost: 450,
    backed_by_mcp: ['tavily', 'exa'],
    replaces_skill: 'deep-researcher',
    keywords: ['research', 'search', 'find', 'lookup', 'information'],
    prompt_snippet: `Use Tavily MCP for web research:
- tavily.search(query, options) - Search with AI summary
- tavily.searchNews(query) - Recent news
Use Exa MCP for semantic search across web documents.
Cross-reference multiple sources for accuracy.`
  },
  {
    id: 'browser-hint',
    name: 'Browser Automation Hint',
    token_cost: 400,
    backed_by_mcp: ['playwright'],
    replaces_skill: 'browser-automator',
    keywords: ['browser', 'playwright', 'automate', 'click', 'form', 'screenshot'],
    prompt_snippet: `Use Playwright MCP for browser automation:
- playwright.navigate(url) - Open page
- playwright.click(selector) - Click element
- playwright.fill(selector, text) - Fill input
- playwright.screenshot() - Take screenshot
Use data-testid selectors for reliability.`
  },
  {
    id: 'screenpipe-hint',
    name: 'Desktop Context Hint',
    token_cost: 300,
    backed_by_mcp: ['screenpipe'],
    replaces_skill: 'desktop-context',
    keywords: ['screen', 'desktop', 'window', 'ocr', 'context'],
    prompt_snippet: `Use Screenpipe MCP for desktop context:
- screenpipe.getRecentActivity() - Recent screen content
- screenpipe.search(query) - Search past activity
- screenpipe.getContext() - Current window context
Respect user privacy, only access when needed.`
  },

  // Analytics & Productivity Hints
  {
    id: 'analytics-hint',
    name: 'Analytics Hint',
    token_cost: 300,
    backed_by_mcp: ['posthog'],
    replaces_skill: 'analytics-tracking',
    keywords: ['analytics', 'posthog', 'tracking', 'event', 'funnel'],
    prompt_snippet: `Use PostHog MCP for analytics:
- posthog.capture(event, properties) - Track event
- posthog.identify(userId, traits) - Identify user
- posthog.featureFlags.isEnabled(flag) - Check feature flag
Use meaningful event names: noun_verb format.`
  },
  {
    id: 'notion-hint',
    name: 'Notion Hint',
    token_cost: 300,
    backed_by_mcp: ['notion'],
    replaces_skill: 'notion-navigator',
    keywords: ['notion', 'page', 'database', 'docs', 'wiki'],
    prompt_snippet: `Use Notion MCP for documentation:
- notion.getPage(pageId) - Read page content
- notion.queryDatabase(dbId, filter) - Query database
- notion.createPage(parentId, content) - Create page
Use block-based structure for content.`
  }
];

/**
 * Load a skill hint by ID
 */
export function loadHint(hintId: string): SkillHint | null {
  return SKILL_HINTS.find(h => h.id === hintId) || null;
}

/**
 * Get hint that replaces a given skill
 */
export function getHintForSkill(skillId: string): SkillHint | null {
  return SKILL_HINTS.find(h => h.replaces_skill === skillId) || null;
}

/**
 * Find hints that match given keywords
 */
export function findHintsByKeywords(query: string): SkillHint[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  return SKILL_HINTS.filter(hint => {
    return hint.keywords.some(keyword => {
      const keywordParts = keyword.toLowerCase().split(' ');
      return keywordParts.every(part =>
        queryWords.includes(part) || queryLower.includes(part)
      );
    });
  });
}

/**
 * Format hints for prompt injection
 */
export function formatHintsForPrompt(hints: SkillHint[]): string {
  if (hints.length === 0) {
    return '';
  }

  let output = `<!-- OPUS 67: ${hints.length} skill hints loaded (${hints.reduce((sum, h) => sum + h.token_cost, 0)} tokens) -->\n`;
  output += '<skill_hints>\n';

  for (const hint of hints) {
    output += `\n### ${hint.name}\n`;
    output += `MCPs: ${hint.backed_by_mcp.join(', ')}\n`;
    output += hint.prompt_snippet + '\n';
  }

  output += '\n</skill_hints>\n';
  return output;
}

/**
 * Get total token cost of hints
 */
export function getHintsTotalCost(hints: SkillHint[]): number {
  return hints.reduce((sum, h) => sum + h.token_cost, 0);
}

/**
 * Get all MCPs required by hints
 */
export function getHintsMcpConnections(hints: SkillHint[]): string[] {
  const mcps = new Set<string>();
  for (const hint of hints) {
    for (const mcp of hint.backed_by_mcp) {
      mcps.add(mcp);
    }
  }
  return Array.from(mcps);
}
