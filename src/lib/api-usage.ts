import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { APIUsageEvent, APIUsageStats } from '@/types/analytics';
import crypto from 'crypto';

// Anthropic pricing (as of 2025) with prompt caching
const PRICING = {
  INPUT_PER_MILLION: 3, // $3 per million input tokens
  OUTPUT_PER_MILLION: 15, // $15 per million output tokens
  CACHE_WRITE_PER_MILLION: 3.75, // $3.75 per million tokens (cache creation)
  CACHE_READ_PER_MILLION: 0.30, // $0.30 per million tokens (90% discount!)
};

// Rate limiting config
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 10;

// Cache config
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const ANALYTICS_DIR = join(process.cwd(), '.analytics');
const API_USAGE_FILE = join(ANALYTICS_DIR, 'api-usage.json');
const CACHE_DIR = join(process.cwd(), '.cache');
const WORKFLOW_CACHE_FILE = join(CACHE_DIR, 'workflow-responses.json');

// Ensure directories exist
function ensureDirs() {
  if (!existsSync(ANALYTICS_DIR)) {
    mkdirSync(ANALYTICS_DIR, { recursive: true });
  }
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// Calculate cost from token usage (with cache support)
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  cacheCreationTokens: number = 0,
  cacheReadTokens: number = 0
): number {
  const inputCost = (inputTokens / 1000000) * PRICING.INPUT_PER_MILLION;
  const outputCost = (outputTokens / 1000000) * PRICING.OUTPUT_PER_MILLION;
  const cacheWriteCost = (cacheCreationTokens / 1000000) * PRICING.CACHE_WRITE_PER_MILLION;
  const cacheReadCost = (cacheReadTokens / 1000000) * PRICING.CACHE_READ_PER_MILLION;

  return inputCost + outputCost + cacheWriteCost + cacheReadCost;
}

// Generate hash for prompt (for caching and deduplication)
export function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

// Track API usage
export function trackAPIUsage(event: Omit<APIUsageEvent, 'id'>): void {
  try {
    ensureDirs();

    const events: APIUsageEvent[] = existsSync(API_USAGE_FILE)
      ? JSON.parse(readFileSync(API_USAGE_FILE, 'utf-8'))
      : [];

    const newEvent: APIUsageEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    events.push(newEvent);
    writeFileSync(API_USAGE_FILE, JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('Failed to track API usage:', error);
  }
}

// Check rate limit
export function checkRateLimit(sessionId: string): { allowed: boolean; remainingRequests: number; resetTime: number } {
  try {
    ensureDirs();

    if (!existsSync(API_USAGE_FILE)) {
      return { allowed: true, remainingRequests: MAX_REQUESTS_PER_WINDOW - 1, resetTime: Date.now() + RATE_LIMIT_WINDOW };
    }

    const events: APIUsageEvent[] = JSON.parse(readFileSync(API_USAGE_FILE, 'utf-8'));
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;

    // Count requests in the current window for this session
    const recentRequests = events.filter(
      (event) => event.sessionId === sessionId && new Date(event.timestamp).getTime() > windowStart
    );

    const requestCount = recentRequests.length;
    const allowed = requestCount < MAX_REQUESTS_PER_WINDOW;
    const remainingRequests = Math.max(0, MAX_REQUESTS_PER_WINDOW - requestCount);

    // Calculate reset time (oldest request + window duration)
    const oldestRequest = recentRequests.length > 0
      ? Math.min(...recentRequests.map(r => new Date(r.timestamp).getTime()))
      : now;
    const resetTime = oldestRequest + RATE_LIMIT_WINDOW;

    return { allowed, remainingRequests, resetTime };
  } catch (error) {
    console.error('Failed to check rate limit:', error);
    return { allowed: true, remainingRequests: MAX_REQUESTS_PER_WINDOW, resetTime: Date.now() + RATE_LIMIT_WINDOW };
  }
}

// Cache workflow response
export function cacheWorkflowResponse(promptHash: string, response: any): void {
  try {
    ensureDirs();

    const cache: Record<string, { response: any; timestamp: number; expiresAt: number }> = existsSync(WORKFLOW_CACHE_FILE)
      ? JSON.parse(readFileSync(WORKFLOW_CACHE_FILE, 'utf-8'))
      : {};

    const now = Date.now();
    cache[promptHash] = {
      response,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
    };

    // Clean up expired entries
    Object.keys(cache).forEach((key) => {
      if (cache[key].expiresAt < now) {
        delete cache[key];
      }
    });

    writeFileSync(WORKFLOW_CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('Failed to cache workflow response:', error);
  }
}

// Get cached workflow response
export function getCachedWorkflowResponse(promptHash: string): any | null {
  try {
    ensureDirs();

    if (!existsSync(WORKFLOW_CACHE_FILE)) {
      return null;
    }

    const cache: Record<string, { response: any; timestamp: number; expiresAt: number }> = JSON.parse(
      readFileSync(WORKFLOW_CACHE_FILE, 'utf-8')
    );

    const cached = cache[promptHash];
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (cached.expiresAt < now) {
      // Expired
      return null;
    }

    return cached.response;
  } catch (error) {
    console.error('Failed to get cached workflow response:', error);
    return null;
  }
}

// Get API usage stats
export function getAPIUsageStats(): APIUsageStats {
  try {
    ensureDirs();

    if (!existsSync(API_USAGE_FILE)) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 0,
        costByDay: [],
        topPrompts: [],
        requestsByHour: [],
      };
    }

    const events: APIUsageEvent[] = JSON.parse(readFileSync(API_USAGE_FILE, 'utf-8'));

    const totalRequests = events.length;
    const successfulRequests = events.filter((e) => e.success).length;
    const failedRequests = events.filter((e) => !e.success).length;
    const totalInputTokens = events.reduce((sum, e) => sum + e.inputTokens, 0);
    const totalOutputTokens = events.reduce((sum, e) => sum + e.outputTokens, 0);
    const totalTokens = totalInputTokens + totalOutputTokens;
    const totalCost = events.reduce((sum, e) => sum + e.estimatedCost, 0);
    const averageResponseTime = events.length > 0
      ? events.reduce((sum, e) => sum + e.responseTime, 0) / events.length
      : 0;

    // Cost by day
    const costByDayMap = new Map<string, { cost: number; requests: number }>();
    events.forEach((event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      const existing = costByDayMap.get(date) || { cost: 0, requests: 0 };
      costByDayMap.set(date, {
        cost: existing.cost + event.estimatedCost,
        requests: existing.requests + 1,
      });
    });
    const costByDay = Array.from(costByDayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30); // Last 30 days

    // Top prompts
    const promptMap = new Map<string, { count: number; totalCost: number }>();
    events.forEach((event) => {
      if (event.promptHash) {
        const existing = promptMap.get(event.promptHash) || { count: 0, totalCost: 0 };
        promptMap.set(event.promptHash, {
          count: existing.count + 1,
          totalCost: existing.totalCost + event.estimatedCost,
        });
      }
    });
    const topPrompts = Array.from(promptMap.entries())
      .map(([prompt, data]) => ({
        prompt: prompt.substring(0, 8) + '...', // Short hash
        count: data.count,
        avgCost: data.totalCost / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Requests by hour
    const hourMap = new Map<number, number>();
    events.forEach((event) => {
      const hour = new Date(event.timestamp).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });
    const requestsByHour = Array.from(hourMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      totalCost,
      averageResponseTime,
      costByDay,
      topPrompts,
      requestsByHour,
    };
  } catch (error) {
    console.error('Failed to get API usage stats:', error);
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      averageResponseTime: 0,
      costByDay: [],
      topPrompts: [],
      requestsByHour: [],
    };
  }
}
