/**
 * OPUS 67 LLM Benchmark - Hallucination Detection
 * Detects made-up APIs, non-existent functions, and invalid imports
 */

import { describe, it, expect, beforeAll } from 'vitest';
import type { HallucinationResult, BenchmarkResult } from './types.js';

// Known valid Python standard library modules (full list)
const VALID_STDLIB = new Set([
  // Core
  'os', 'sys', 're', 'json', 'math', 'random', 'datetime', 'time',
  'collections', 'itertools', 'functools', 'typing', 'pathlib',
  'io', 'string', 'copy', 'pickle', 'hashlib', 'base64', 'uuid',
  'threading', 'multiprocessing', 'asyncio', 'subprocess', 'shutil',
  'tempfile', 'glob', 'fnmatch', 'linecache', 'traceback', 'warnings',
  'contextlib', 'abc', 'dataclasses', 'enum', 'bisect', 'heapq',
  'operator', 'statistics', 'decimal', 'fractions', 'numbers',
  'cmath', 'array', 'struct', 'codecs', 'unicodedata', 'locale',
  'calendar', 'pprint', 'textwrap', 'difflib', 'urllib', 'http',
  'socket', 'email', 'html', 'xml', 'logging', 'unittest', 'doctest',
  // Additional stdlib
  'builtins', 'types', 'weakref', 'gc', 'inspect', 'dis', 'code',
  'codeop', 'pdb', 'profile', 'timeit', 'trace', 'resource', 'syslog',
  'argparse', 'optparse', 'configparser', 'secrets', 'hmac',
  'ssl', 'select', 'selectors', 'signal', 'mmap', 'ctypes',
  'zipfile', 'tarfile', 'gzip', 'bz2', 'lzma', 'csv', 'sqlite3',
  'queue', 'concurrent', 'contextvars', 'importlib', 'pkgutil',
  'platform', 'errno', 'faulthandler', 'atexit', 'venv', 'site',
  // Common third-party (allowed)
  'pytest', 'numpy', 'pandas', 'requests', 'flask', 'django',
  'sqlalchemy', 'boto3', 'tensorflow', 'torch', 'scipy', 'matplotlib',
  'PIL', 'cv2', 'sklearn', 'pydantic', 'fastapi', 'httpx', 'aiohttp',
  // Built-in submodules (from collections, typing, etc.)
  'defaultdict', 'Counter', 'OrderedDict', 'namedtuple', 'deque',
  'List', 'Dict', 'Set', 'Tuple', 'Optional', 'Union', 'Any', 'Callable'
]);

// Patterns that indicate hallucinations
const HALLUCINATION_PATTERNS = {
  invalid_import: /from\s+(\w+)\s+import|import\s+(\w+)/g,
  nonexistent_function: /(?:from|import)\s+\w+.*?\.(\w+)\(/g,
  made_up_api: /(\.magical_|\.auto_|\.smart_|\.ai_)/g,
  wrong_signature: /(sort\(\s*reverse\s*,|len\(\s*\w+\s*,)/g
};

// Known non-existent but commonly hallucinated modules
const HALLUCINATED_MODULES = new Set([
  'utils', 'helpers', 'common', 'core', 'lib', 'tools',
  'mymodule', 'custom', 'internal', 'private'
]);

export interface HallucinationAnalysis {
  code: string;
  hallucinations: {
    type: 'invalid_import' | 'nonexistent_function' | 'wrong_api' | 'invalid_syntax';
    location: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  total_score: number;
}

export function analyzeCode(code: string): HallucinationAnalysis {
  const hallucinations: HallucinationAnalysis['hallucinations'] = [];

  // Check for invalid imports
  const importMatches = code.matchAll(/(?:from\s+(\w+)|import\s+(\w+))/g);
  for (const match of importMatches) {
    const module = match[1] || match[2];
    if (module && !VALID_STDLIB.has(module) && !isLocalModule(module, code)) {
      if (HALLUCINATED_MODULES.has(module)) {
        hallucinations.push({
          type: 'invalid_import',
          location: match[0],
          description: `Module '${module}' is commonly hallucinated and doesn't exist`,
          severity: 'high'
        });
      } else if (!isPossibleValidModule(module)) {
        hallucinations.push({
          type: 'invalid_import',
          location: match[0],
          description: `Unknown module '${module}' - may be hallucinated`,
          severity: 'medium'
        });
      }
    }
  }

  // Check for made-up API patterns
  const apiMatches = code.matchAll(/\.(\w+_\w+)\(/g);
  for (const match of apiMatches) {
    const method = match[1];
    if (isSuspiciousMethod(method)) {
      hallucinations.push({
        type: 'wrong_api',
        location: match[0],
        description: `Suspicious method '${method}' - may not exist`,
        severity: 'low'
      });
    }
  }

  // Check for common Python hallucinations
  const commonErrors = [
    { pattern: /list\.add\(/g, description: 'list.add() should be list.append()' },
    { pattern: /string\.reverse\(/g, description: 'string.reverse() does not exist, use [::-1]' },
    { pattern: /dict\.add\(/g, description: 'dict.add() does not exist, use dict[key] = value' },
    { pattern: /len\s*\(\s*\w+\s*,/g, description: 'len() takes exactly one argument' },
    { pattern: /range\s*\(\s*\w+\s*,\s*\w+\s*,\s*\w+\s*,/g, description: 'range() takes at most 3 arguments' }
  ];

  for (const { pattern, description } of commonErrors) {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      hallucinations.push({
        type: 'wrong_api',
        location: match[0],
        description,
        severity: 'high'
      });
    }
  }

  // Calculate total score (0-100, lower is better)
  const total_score = Math.min(
    hallucinations.reduce((sum, h) => {
      const weights = { low: 5, medium: 15, high: 30 };
      return sum + weights[h.severity];
    }, 0),
    100
  );

  return { code, hallucinations, total_score };
}

function isLocalModule(module: string, code: string): boolean {
  // Check if module is defined in the same code
  return code.includes(`def ${module}`) || code.includes(`class ${module}`);
}

function isPossibleValidModule(module: string): boolean {
  // Allow single-letter or very short names (likely local)
  if (module.length <= 2) return true;
  // Allow names that look like project modules
  if (module.includes('_') && !HALLUCINATED_MODULES.has(module)) return true;
  return false;
}

function isSuspiciousMethod(method: string): boolean {
  const suspicious = ['auto_', 'magic_', 'smart_', 'ai_', 'super_', 'ultra_'];
  return suspicious.some(prefix => method.startsWith(prefix));
}

export function analyzeResults(results: BenchmarkResult[]): HallucinationResult[] {
  const modelResults: Map<string, HallucinationAnalysis[]> = new Map();

  for (const result of results) {
    if (!result.generated_code) continue;

    const analysis = analyzeCode(result.generated_code);
    const existing = modelResults.get(result.model) || [];
    existing.push(analysis);
    modelResults.set(result.model, existing);
  }

  const hallucinationResults: HallucinationResult[] = [];

  for (const [model, analyses] of modelResults) {
    const totalSolutions = analyses.length;
    const withHallucinations = analyses.filter(a => a.hallucinations.length > 0).length;

    const categories = {
      invalid_imports: 0,
      nonexistent_functions: 0,
      wrong_api_usage: 0,
      invalid_syntax: 0
    };

    for (const analysis of analyses) {
      for (const h of analysis.hallucinations) {
        if (h.type === 'invalid_import') categories.invalid_imports++;
        if (h.type === 'nonexistent_function') categories.nonexistent_functions++;
        if (h.type === 'wrong_api') categories.wrong_api_usage++;
        if (h.type === 'invalid_syntax') categories.invalid_syntax++;
      }
    }

    const rate = totalSolutions > 0 ? (withHallucinations / totalSolutions) * 100 : 0;

    hallucinationResults.push({
      model,
      total_solutions: totalSolutions,
      hallucinations_detected: withHallucinations,
      hallucination_rate: parseFloat(rate.toFixed(2)),
      categories,
      severity: rate < 5 ? 'low' : rate < 15 ? 'medium' : 'high'
    });
  }

  return hallucinationResults;
}

export async function runHallucinationBenchmark(): Promise<HallucinationResult[]> {
  // Use sample data for testing without API calls
  const sampleResults: BenchmarkResult[] = [
    {
      model: 'gemini',
      problem_id: 'test/1',
      passed: true,
      tokens_used: 100,
      latency_ms: 500,
      generated_code: `def solve(n):
    from utils import helper
    return helper.auto_solve(n)`
    },
    {
      model: 'gemini',
      problem_id: 'test/2',
      passed: true,
      tokens_used: 80,
      latency_ms: 450,
      generated_code: `def solve(items):
    return sorted(items, key=lambda x: x)`
    },
    {
      model: 'deepseek',
      problem_id: 'test/1',
      passed: true,
      tokens_used: 90,
      latency_ms: 600,
      generated_code: `def solve(n):
    import math
    return math.factorial(n)`
    },
    {
      model: 'deepseek',
      problem_id: 'test/2',
      passed: false,
      tokens_used: 110,
      latency_ms: 700,
      generated_code: `def solve(items):
    items.add(5)  # Wrong - should be append
    return items`
    }
  ];

  return analyzeResults(sampleResults);
}

// Vitest test suite
describe('Hallucination Detection', () => {
  it('should detect invalid imports', () => {
    const code = `from utils import helper
import mymodule`;
    const analysis = analyzeCode(code);

    expect(analysis.hallucinations.length).toBeGreaterThan(0);
    expect(analysis.hallucinations.some(h => h.type === 'invalid_import')).toBe(true);
  });

  it('should allow valid stdlib imports', () => {
    const code = `import os
import json
from collections import defaultdict`;
    const analysis = analyzeCode(code);

    const invalidImports = analysis.hallucinations.filter(h => h.type === 'invalid_import');
    expect(invalidImports.length).toBe(0);
  });

  it('should detect common Python API errors', () => {
    const code = `my_list.add(5)`;
    const analysis = analyzeCode(code);

    expect(analysis.hallucinations.some(h =>
      h.description.includes('append')
    )).toBe(true);
  });

  it('should flag suspicious method names', () => {
    const code = `result.auto_solve(x)`;
    const analysis = analyzeCode(code);

    expect(analysis.hallucinations.some(h =>
      h.description.includes('may not exist')
    )).toBe(true);
  });

  it('should calculate severity correctly', () => {
    const code = `from helpers import common
from utils import tools
x.auto_magic()`;
    const analysis = analyzeCode(code);

    expect(analysis.total_score).toBeGreaterThan(0);
    expect(analysis.total_score).toBeLessThanOrEqual(100);
  });

  it('should analyze multiple model results', async () => {
    const results = await runHallucinationBenchmark();

    expect(results.length).toBe(2); // gemini and deepseek
    expect(results.every(r => r.hallucination_rate !== undefined)).toBe(true);
  });
});
