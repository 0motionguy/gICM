/**
 * OPUS 67 Module Unit Tests
 * Tests for refactored modules: memory, modes, models, skills
 */

import { describe, it, expect } from 'vitest';

// Memory module tests
describe('Memory Module', () => {
  it('should export types from memory/types', async () => {
    const types = await import('../memory/types.js');
    expect(types).toBeDefined();
  });

  it('should export embeddings functions', async () => {
    const { simpleEmbed, cosineSimilarity } = await import('../memory/embeddings.js');
    expect(simpleEmbed).toBeDefined();
    expect(cosineSimilarity).toBeDefined();

    // Test simple embed - returns 64-dimension vectors
    const embedding = simpleEmbed('test query');
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBe(64);
  });

  it('should export cache class', async () => {
    const { LocalMemoryCache } = await import('../memory/cache.js');
    expect(LocalMemoryCache).toBeDefined();

    const cache = new LocalMemoryCache();
    expect(cache).toBeInstanceOf(LocalMemoryCache);
  });
});

// Modes module tests
describe('Modes Module', () => {
  it('should load mode registry', async () => {
    const { loadModeRegistry } = await import('../modes/registry.js');
    const registry = loadModeRegistry();
    expect(registry).toBeDefined();
    expect(registry.modes).toBeDefined();
  });

  it('should detect mode from context', async () => {
    const { detectMode } = await import('../modes/detection.js');
    const result = detectMode({ query: 'build a landing page' });
    expect(result).toBeDefined();
    expect(result.mode).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('should format mode display', async () => {
    const { formatModeDisplay } = await import('../modes/display.js');
    const output = formatModeDisplay('build');
    expect(output).toContain('OPUS 67');
  });

  it('should export ModeSelector class', async () => {
    const { ModeSelector } = await import('../modes/selector.js');
    const selector = new ModeSelector();
    expect(selector).toBeDefined();
    expect(selector.getCurrentMode()).toBe('auto');
  });
});

// Models module tests
describe('Models Module', () => {
  it('should export pricing functions', async () => {
    const { calculateClaudeCost, calculateGeminiCost, calculateDeepSeekCost } = await import('../models/pricing.js');

    const claudeCost = calculateClaudeCost(1000, 500, 'claude-3-5-sonnet-20241022');
    expect(claudeCost).toBeGreaterThan(0);

    const geminiCost = calculateGeminiCost(1000, 500, 'gemini-1.5-flash');
    expect(geminiCost).toBeGreaterThan(0);

    const deepseekCost = calculateDeepSeekCost(1000, 500);
    expect(deepseekCost).toBeGreaterThan(0);
  });

  it('should get claude model id by tier', async () => {
    const { getClaudeModelId } = await import('../models/pricing.js');

    expect(getClaudeModelId('fast')).toBe('claude-3-5-haiku-20241022');
    expect(getClaudeModelId('balanced')).toBe('claude-3-5-sonnet-20241022');
    expect(getClaudeModelId('premium')).toBe('claude-3-opus-20240229');
  });

  it('should export ModelClient class', async () => {
    const { ModelClient } = await import('../models/model-client.js');
    const client = new ModelClient();
    expect(client).toBeDefined();
    expect(client.getAvailableProviders).toBeDefined();
  });
});

// Skills module tests
describe('Skills Module', () => {
  it('should load skill registry', async () => {
    const { loadRegistry } = await import('../skills/registry.js');
    const registry = loadRegistry();
    expect(registry).toBeDefined();
    expect(registry.skills).toBeDefined();
    expect(Array.isArray(registry.skills)).toBe(true);
  });

  it('should extract keywords from query', async () => {
    const { extractKeywords } = await import('../skills/matcher.js');
    const keywords = extractKeywords('build a react component');
    expect(keywords).toContain('build');
    expect(keywords).toContain('react');
    expect(keywords).toContain('component');
  });

  it('should format skills for prompt', async () => {
    const { formatSkillsForPrompt } = await import('../skills/formatter.js');
    const output = formatSkillsForPrompt({
      skills: [],
      totalTokenCost: 0,
      mcpConnections: [],
      reason: []
    });
    expect(output).toContain('No specific skills loaded');
  });

  it('should export loadSkills function', async () => {
    const { loadSkills } = await import('../skill-loader.js');
    const result = loadSkills({ query: 'test query' });
    expect(result).toBeDefined();
    expect(result.skills).toBeDefined();
    expect(result.totalTokenCost).toBeDefined();
  });
});

// MCP Server module tests
describe('MCP Server Module', () => {
  it('should export tool definitions', async () => {
    const { TOOL_DEFINITIONS } = await import('../mcp-server/tools.js');
    expect(TOOL_DEFINITIONS).toBeDefined();
    expect(Array.isArray(TOOL_DEFINITIONS)).toBe(true);
    expect(TOOL_DEFINITIONS.length).toBeGreaterThan(0);
  });

  it('should load registries', async () => {
    const { loadRegistries, getPackageRoot } = await import('../mcp-server/registry.js');
    const packageRoot = getPackageRoot();
    const registries = loadRegistries(packageRoot);
    expect(registries).toBeDefined();
    expect(registries.skills).toBeDefined();
    expect(registries.modes).toBeDefined();
  });
});
