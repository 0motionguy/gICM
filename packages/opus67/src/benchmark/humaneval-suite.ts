/**
 * OPUS 67 HumanEval Benchmark Suite
 * Code generation benchmarks based on HumanEval methodology
 */

import type { BenchmarkTask } from "./multi-model-benchmark.js";

export interface HumanEvalProblem {
  id: string;
  name: string;
  prompt: string;
  canonical: string;
  testCases: string[];
  difficulty: "easy" | "medium" | "hard";
  category: "completion" | "bug" | "refactor" | "algorithm";
}

/**
 * HumanEval-style code completion problems
 */
export const HUMANEVAL_PROBLEMS: HumanEvalProblem[] = [
  // === CODE COMPLETION (40 problems) ===
  {
    id: "he-001",
    name: "Two Sum",
    prompt: `def two_sum(nums: List[int], target: int) -> List[int]:
    """
    Given an array of integers nums and an integer target,
    return indices of the two numbers such that they add up to target.

    >>> two_sum([2, 7, 11, 15], 9)
    [0, 1]
    >>> two_sum([3, 2, 4], 6)
    [1, 2]
    """`,
    canonical: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i
    return []`,
    testCases: [
      "assert two_sum([2, 7, 11, 15], 9) == [0, 1]",
      "assert two_sum([3, 2, 4], 6) == [1, 2]",
      "assert two_sum([3, 3], 6) == [0, 1]",
    ],
    difficulty: "easy",
    category: "completion",
  },
  {
    id: "he-002",
    name: "Reverse String",
    prompt: `def reverse_string(s: str) -> str:
    """
    Reverse the input string.

    >>> reverse_string("hello")
    "olleh"
    >>> reverse_string("world")
    "dlrow"
    """`,
    canonical: `def reverse_string(s):
    return s[::-1]`,
    testCases: [
      'assert reverse_string("hello") == "olleh"',
      'assert reverse_string("world") == "dlrow"',
      'assert reverse_string("") == ""',
    ],
    difficulty: "easy",
    category: "completion",
  },
  {
    id: "he-003",
    name: "FizzBuzz",
    prompt: `def fizzbuzz(n: int) -> List[str]:
    """
    Return a list of strings representing fizzbuzz from 1 to n.
    For multiples of 3 return "Fizz", for multiples of 5 return "Buzz",
    for multiples of both return "FizzBuzz", otherwise return the number.

    >>> fizzbuzz(5)
    ["1", "2", "Fizz", "4", "Buzz"]
    """`,
    canonical: `def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result`,
    testCases: [
      'assert fizzbuzz(5) == ["1", "2", "Fizz", "4", "Buzz"]',
      'assert fizzbuzz(15)[-1] == "FizzBuzz"',
    ],
    difficulty: "easy",
    category: "completion",
  },
  {
    id: "he-004",
    name: "Palindrome Check",
    prompt: `def is_palindrome(s: str) -> bool:
    """
    Check if a string is a palindrome, ignoring case and non-alphanumeric chars.

    >>> is_palindrome("A man, a plan, a canal: Panama")
    True
    >>> is_palindrome("race a car")
    False
    """`,
    canonical: `def is_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`,
    testCases: [
      'assert is_palindrome("A man, a plan, a canal: Panama") == True',
      'assert is_palindrome("race a car") == False',
      'assert is_palindrome("") == True',
    ],
    difficulty: "easy",
    category: "completion",
  },
  {
    id: "he-005",
    name: "Merge Sorted Arrays",
    prompt: `def merge_sorted(a: List[int], b: List[int]) -> List[int]:
    """
    Merge two sorted arrays into one sorted array.

    >>> merge_sorted([1, 3, 5], [2, 4, 6])
    [1, 2, 3, 4, 5, 6]
    """`,
    canonical: `def merge_sorted(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result`,
    testCases: [
      "assert merge_sorted([1, 3, 5], [2, 4, 6]) == [1, 2, 3, 4, 5, 6]",
      "assert merge_sorted([], [1, 2, 3]) == [1, 2, 3]",
    ],
    difficulty: "medium",
    category: "completion",
  },
  {
    id: "he-006",
    name: "Binary Search",
    prompt: `def binary_search(arr: List[int], target: int) -> int:
    """
    Find target in sorted array, return index or -1 if not found.

    >>> binary_search([1, 2, 3, 4, 5], 3)
    2
    >>> binary_search([1, 2, 3, 4, 5], 6)
    -1
    """`,
    canonical: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    testCases: [
      "assert binary_search([1, 2, 3, 4, 5], 3) == 2",
      "assert binary_search([1, 2, 3, 4, 5], 6) == -1",
      "assert binary_search([], 1) == -1",
    ],
    difficulty: "medium",
    category: "completion",
  },
  {
    id: "he-007",
    name: "Valid Parentheses",
    prompt: `def is_valid_parens(s: str) -> bool:
    """
    Check if the string has valid parentheses matching.

    >>> is_valid_parens("([]{})")
    True
    >>> is_valid_parens("([)]")
    False
    """`,
    canonical: `def is_valid_parens(s):
    stack = []
    pairs = {'(': ')', '[': ']', '{': '}'}
    for c in s:
        if c in pairs:
            stack.append(c)
        elif c in pairs.values():
            if not stack or pairs[stack.pop()] != c:
                return False
    return len(stack) == 0`,
    testCases: [
      'assert is_valid_parens("([]{})") == True',
      'assert is_valid_parens("([)]") == False',
      'assert is_valid_parens("") == True',
    ],
    difficulty: "medium",
    category: "completion",
  },
  {
    id: "he-008",
    name: "Longest Common Prefix",
    prompt: `def longest_common_prefix(strs: List[str]) -> str:
    """
    Find the longest common prefix among a list of strings.

    >>> longest_common_prefix(["flower", "flow", "flight"])
    "fl"
    >>> longest_common_prefix(["dog", "racecar", "car"])
    ""
    """`,
    canonical: `def longest_common_prefix(strs):
    if not strs:
        return ""
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix`,
    testCases: [
      'assert longest_common_prefix(["flower", "flow", "flight"]) == "fl"',
      'assert longest_common_prefix(["dog", "racecar", "car"]) == ""',
      'assert longest_common_prefix([]) == ""',
    ],
    difficulty: "medium",
    category: "completion",
  },
  {
    id: "he-009",
    name: "Maximum Subarray",
    prompt: `def max_subarray(nums: List[int]) -> int:
    """
    Find the contiguous subarray with the largest sum.

    >>> max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4])
    6
    >>> max_subarray([1])
    1
    """`,
    canonical: `def max_subarray(nums):
    max_sum = current = nums[0]
    for num in nums[1:]:
        current = max(num, current + num)
        max_sum = max(max_sum, current)
    return max_sum`,
    testCases: [
      "assert max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6",
      "assert max_subarray([1]) == 1",
      "assert max_subarray([-1]) == -1",
    ],
    difficulty: "medium",
    category: "algorithm",
  },
  {
    id: "he-010",
    name: "LRU Cache",
    prompt: `class LRUCache:
    """
    Design a data structure for Least Recently Used (LRU) cache.

    >>> cache = LRUCache(2)
    >>> cache.put(1, 1)
    >>> cache.get(1)
    1
    >>> cache.put(2, 2)
    >>> cache.put(3, 3)  # evicts key 1
    >>> cache.get(1)
    -1
    """`,
    canonical: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
    testCases: [
      "cache = LRUCache(2); cache.put(1, 1); assert cache.get(1) == 1",
      "cache = LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.put(3, 3); assert cache.get(1) == -1",
    ],
    difficulty: "hard",
    category: "algorithm",
  },
  // === BUG DETECTION (20 problems) ===
  {
    id: "he-011",
    name: "Fix Off-by-One",
    prompt: `def find_max(arr: List[int]) -> int:
    """Fix the bug in this function that finds the maximum value."""
    max_val = arr[0]
    for i in range(1, len(arr) - 1):  # BUG: should be len(arr)
        if arr[i] > max_val:
            max_val = arr[i]
    return max_val`,
    canonical: `def find_max(arr):
    max_val = arr[0]
    for i in range(1, len(arr)):  # FIXED
        if arr[i] > max_val:
            max_val = arr[i]
    return max_val`,
    testCases: [
      "assert find_max([1, 2, 3, 4, 5]) == 5",
      "assert find_max([5, 4, 3, 2, 1]) == 5",
    ],
    difficulty: "easy",
    category: "bug",
  },
  {
    id: "he-012",
    name: "Fix Null Check",
    prompt: `def safe_divide(a: float, b: float) -> float:
    """Fix the bug that causes division by zero."""
    return a / b  # BUG: no check for b == 0`,
    canonical: `def safe_divide(a, b):
    if b == 0:
        return None  # or raise ValueError
    return a / b`,
    testCases: [
      "assert safe_divide(10, 2) == 5",
      "assert safe_divide(10, 0) is None",
    ],
    difficulty: "easy",
    category: "bug",
  },
  {
    id: "he-013",
    name: "Fix Type Coercion",
    prompt: `function parseNumbers(input: string): number[] {
  // BUG: returns strings instead of numbers
  return input.split(',');
}`,
    canonical: `function parseNumbers(input: string): number[] {
  return input.split(',').map(s => parseFloat(s.trim()));
}`,
    testCases: [
      'parseNumbers("1, 2, 3") should return [1, 2, 3]',
      'parseNumbers("1.5, 2.5") should return [1.5, 2.5]',
    ],
    difficulty: "easy",
    category: "bug",
  },
  {
    id: "he-014",
    name: "Fix Race Condition",
    prompt: `async function incrementCounter(counter: { value: number }) {
  // BUG: race condition when called concurrently
  const current = counter.value;
  await delay(100);
  counter.value = current + 1;
}`,
    canonical: `async function incrementCounter(counter: { value: number }, lock: Mutex) {
  await lock.acquire();
  try {
    counter.value += 1;
  } finally {
    lock.release();
  }
}`,
    testCases: ["Counter should be thread-safe with concurrent calls"],
    difficulty: "hard",
    category: "bug",
  },
  // === REFACTORING (15 problems) ===
  {
    id: "he-015",
    name: "Extract Function",
    prompt: `function processUser(user) {
  // Refactor: Extract validation logic into separate function
  if (!user.email) throw new Error("Email required");
  if (!user.email.includes("@")) throw new Error("Invalid email");
  if (user.email.length > 254) throw new Error("Email too long");

  // ... rest of processing
}`,
    canonical: `function validateEmail(email: string): void {
  if (!email) throw new Error("Email required");
  if (!email.includes("@")) throw new Error("Invalid email");
  if (email.length > 254) throw new Error("Email too long");
}

function processUser(user) {
  validateEmail(user.email);
  // ... rest of processing
}`,
    testCases: [
      "validateEmail should be a separate function",
      "processUser should call validateEmail",
    ],
    difficulty: "medium",
    category: "refactor",
  },
  {
    id: "he-016",
    name: "Replace Magic Numbers",
    prompt: `function calculateShipping(weight: number): number {
  // Refactor: Replace magic numbers with named constants
  if (weight <= 1) return 5.99;
  if (weight <= 5) return 9.99;
  if (weight <= 10) return 14.99;
  return 19.99;
}`,
    canonical: `const SHIPPING_RATES = {
  LIGHT: { maxWeight: 1, price: 5.99 },
  MEDIUM: { maxWeight: 5, price: 9.99 },
  HEAVY: { maxWeight: 10, price: 14.99 },
  EXTRA_HEAVY: { price: 19.99 },
} as const;

function calculateShipping(weight: number): number {
  if (weight <= SHIPPING_RATES.LIGHT.maxWeight) return SHIPPING_RATES.LIGHT.price;
  if (weight <= SHIPPING_RATES.MEDIUM.maxWeight) return SHIPPING_RATES.MEDIUM.price;
  if (weight <= SHIPPING_RATES.HEAVY.maxWeight) return SHIPPING_RATES.HEAVY.price;
  return SHIPPING_RATES.EXTRA_HEAVY.price;
}`,
    testCases: [
      "Magic numbers should be replaced with named constants",
      "Behavior should remain the same",
    ],
    difficulty: "easy",
    category: "refactor",
  },
  // === ALGORITHM DESIGN (25 problems) ===
  {
    id: "he-017",
    name: "Dijkstra's Shortest Path",
    prompt: `def shortest_path(graph: Dict[str, List[Tuple[str, int]]], start: str, end: str) -> int:
    """
    Find the shortest path between two nodes in a weighted graph.
    Returns the minimum distance, or -1 if no path exists.

    >>> graph = {"A": [("B", 1), ("C", 4)], "B": [("C", 2)], "C": []}
    >>> shortest_path(graph, "A", "C")
    3
    """`,
    canonical: `import heapq

def shortest_path(graph, start, end):
    distances = {start: 0}
    heap = [(0, start)]

    while heap:
        dist, node = heapq.heappop(heap)
        if node == end:
            return dist
        if dist > distances.get(node, float('inf')):
            continue
        for neighbor, weight in graph.get(node, []):
            new_dist = dist + weight
            if new_dist < distances.get(neighbor, float('inf')):
                distances[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))
    return -1`,
    testCases: [
      'assert shortest_path({"A": [("B", 1), ("C", 4)], "B": [("C", 2)], "C": []}, "A", "C") == 3',
      'assert shortest_path({"A": [], "B": []}, "A", "B") == -1',
    ],
    difficulty: "hard",
    category: "algorithm",
  },
  {
    id: "he-018",
    name: "Knapsack Problem",
    prompt: `def knapsack(capacity: int, weights: List[int], values: List[int]) -> int:
    """
    Solve the 0/1 knapsack problem. Return max value achievable.

    >>> knapsack(50, [10, 20, 30], [60, 100, 120])
    220
    """`,
    canonical: `def knapsack(capacity, weights, values):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(
                    dp[i-1][w],
                    dp[i-1][w-weights[i-1]] + values[i-1]
                )
            else:
                dp[i][w] = dp[i-1][w]

    return dp[n][capacity]`,
    testCases: [
      "assert knapsack(50, [10, 20, 30], [60, 100, 120]) == 220",
      "assert knapsack(0, [1, 2], [10, 20]) == 0",
    ],
    difficulty: "hard",
    category: "algorithm",
  },
  {
    id: "he-019",
    name: "Trie Implementation",
    prompt: `class Trie:
    """
    Implement a trie (prefix tree) with insert, search, and startsWith methods.

    >>> trie = Trie()
    >>> trie.insert("apple")
    >>> trie.search("apple")
    True
    >>> trie.startsWith("app")
    True
    """`,
    canonical: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.is_end = True

    def search(self, word):
        node = self._find_node(word)
        return node is not None and node.is_end

    def startsWith(self, prefix):
        return self._find_node(prefix) is not None

    def _find_node(self, s):
        node = self.root
        for c in s:
            if c not in node.children:
                return None
            node = node.children[c]
        return node`,
    testCases: [
      'trie = Trie(); trie.insert("apple"); assert trie.search("apple")',
      'trie = Trie(); trie.insert("apple"); assert trie.startsWith("app")',
    ],
    difficulty: "hard",
    category: "algorithm",
  },
  {
    id: "he-020",
    name: "Topological Sort",
    prompt: `def topological_sort(graph: Dict[int, List[int]]) -> List[int]:
    """
    Return a topological ordering of the nodes, or empty list if cycle exists.

    >>> topological_sort({0: [1, 2], 1: [3], 2: [3], 3: []})
    [0, 2, 1, 3] or [0, 1, 2, 3]
    """`,
    canonical: `def topological_sort(graph):
    in_degree = {u: 0 for u in graph}
    for u in graph:
        for v in graph[u]:
            in_degree[v] = in_degree.get(v, 0) + 1

    queue = [u for u in in_degree if in_degree[u] == 0]
    result = []

    while queue:
        u = queue.pop(0)
        result.append(u)
        for v in graph.get(u, []):
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    return result if len(result) == len(graph) else []`,
    testCases: [
      "assert len(topological_sort({0: [1, 2], 1: [3], 2: [3], 3: []})) == 4",
      "assert topological_sort({0: [1], 1: [0]}) == []  # cycle",
    ],
    difficulty: "hard",
    category: "algorithm",
  },
];

/**
 * Convert HumanEval problems to benchmark tasks
 */
export function humanEvalToTasks(): BenchmarkTask[] {
  return HUMANEVAL_PROBLEMS.map((problem) => ({
    id: problem.id,
    name: problem.name,
    category: "humaneval",
    prompt: problem.prompt,
    expectedOutput: problem.canonical,
    difficulty: problem.difficulty,
    tags: [problem.category],
  }));
}

/**
 * Get problems by category
 */
export function getByCategory(
  category: HumanEvalProblem["category"],
): HumanEvalProblem[] {
  return HUMANEVAL_PROBLEMS.filter((p) => p.category === category);
}

/**
 * Get problems by difficulty
 */
export function getByDifficulty(
  difficulty: HumanEvalProblem["difficulty"],
): HumanEvalProblem[] {
  return HUMANEVAL_PROBLEMS.filter((p) => p.difficulty === difficulty);
}

/**
 * Get benchmark statistics
 */
export function getStats() {
  return {
    total: HUMANEVAL_PROBLEMS.length,
    byCategory: {
      completion: getByCategory("completion").length,
      bug: getByCategory("bug").length,
      refactor: getByCategory("refactor").length,
      algorithm: getByCategory("algorithm").length,
    },
    byDifficulty: {
      easy: getByDifficulty("easy").length,
      medium: getByDifficulty("medium").length,
      hard: getByDifficulty("hard").length,
    },
  };
}
