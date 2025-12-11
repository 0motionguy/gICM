---
name: load-testing-k6
description: "r.status === 200 });"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Load Testing with k6

## Quick Reference

```javascript
// Basic k6 test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // Virtual users
  duration: '30s',
};

export default function () {
  const res = http.get('https://api.example.com/tokens');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}

// Run: k6 run script.js

// Cloud execution
// k6 cloud script.js

// Thresholds
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // < 1% failure rate
  },
};

// Stages (ramp-up/down)
export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 0 },    // Ramp down
  ],
};
```

## Core Concepts

### Test Lifecycle & Options

```javascript
// load-tests/token-api.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const tokenFetchTrend = new Trend('token_fetch_duration');
const requestCount = new Counter('request_count');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Warm up
    { duration: '3m', target: 100 },  // Normal load
    { duration: '2m', target: 200 },  // Peak load
    { duration: '2m', target: 100 },  // Cool down
    { duration: '1m', target: 0 },    // Wind down
  ],
  thresholds: {
    // HTTP metrics
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.05'], // Less than 5% failures

    // Custom metrics
    'errors': ['rate<0.1'],
    'token_fetch_duration': ['p(95)<300'],
  },
  ext: {
    loadimpact: {
      projectID: 3456789,
      name: 'Token API Load Test',
    },
  },
};

// Setup: runs once before test
export function setup() {
  // Authenticate, get tokens, etc.
  const authRes = http.post('https://api.example.com/auth', {
    apiKey: __ENV.API_KEY,
  });

  return {
    authToken: authRes.json('token'),
    baseUrl: __ENV.BASE_URL || 'https://api.example.com',
  };
}

// Main test function: runs repeatedly for each VU
export default function (data) {
  const { authToken, baseUrl } = data;

  group('Token API Tests', () => {
    // Test 1: List tokens
    group('GET /tokens', () => {
      const res = http.get(`${baseUrl}/tokens`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        tags: { name: 'ListTokens' },
      });

      const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'response has tokens': (r) => r.json('tokens').length > 0,
        'response time < 500ms': (r) => r.timings.duration < 500,
      });

      errorRate.add(!success);
      tokenFetchTrend.add(res.timings.duration);
      requestCount.add(1);

      sleep(1);
    });

    // Test 2: Get token details
    group('GET /token/:id', () => {
      const tokenId = 'SOL_MINT_ADDRESS';
      const res = http.get(`${baseUrl}/token/${tokenId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        tags: { name: 'GetTokenDetails' },
      });

      check(res, {
        'status is 200': (r) => r.status === 200,
        'has token data': (r) => r.json('symbol') !== undefined,
      });

      sleep(0.5);
    });

    // Test 3: Get token price
    group('GET /token/:id/price', () => {
      const res = http.get(`${baseUrl}/token/SOL/price`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        tags: { name: 'GetTokenPrice' },
      });

      check(res, {
        'status is 200': (r) => r.status === 200,
        'price is number': (r) => typeof r.json('price') === 'number',
      });

      sleep(0.5);
    });
  });

  sleep(Math.random() * 3 + 1); // Random sleep 1-4s
}

// Teardown: runs once after test
export function teardown(data) {
  // Cleanup, logout, etc.
  console.log('Test completed');
}
```

### Scenarios & Executors

```javascript
// load-tests/advanced-scenarios.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    // Constant VUs
    constant_load: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      gracefulStop: '30s',
      exec: 'constantLoad',
    },

    // Ramping VUs
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'rampingLoad',
    },

    // Per-VU iterations
    shared_iterations: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 10000,
      maxDuration: '30m',
      exec: 'sharedIterations',
    },

    // Constant arrival rate (RPS)
    constant_rps: {
      executor: 'constant-arrival-rate',
      rate: 100, // 100 requests per second
      timeUnit: '1s',
      duration: '10m',
      preAllocatedVUs: 50,
      maxVUs: 200,
      exec: 'constantRps',
    },

    // Spike test
    spike_test: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 500,
      stages: [
        { duration: '2m', target: 10 },  // Normal load
        { duration: '30s', target: 500 }, // Spike!
        { duration: '2m', target: 10 },  // Back to normal
      ],
      exec: 'spikeTest',
    },
  },
  thresholds: {
    'http_req_duration{scenario:constant_load}': ['p(95)<400'],
    'http_req_duration{scenario:spike_test}': ['p(95)<1000'],
  },
};

export function constantLoad() {
  const res = http.get(__ENV.BASE_URL + '/tokens');
  check(res, { 'status 200': (r) => r.status === 200 });
}

export function rampingLoad() {
  const res = http.get(__ENV.BASE_URL + '/token/SOL');
  check(res, { 'status 200': (r) => r.status === 200 });
}

export function sharedIterations() {
  const res = http.post(__ENV.BASE_URL + '/swap', JSON.stringify({
    from: 'SOL',
    to: 'USDC',
    amount: 1.0,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'status 200': (r) => r.status === 200 });
}

export function constantRps() {
  const res = http.get(__ENV.BASE_URL + '/tokens/trending');
  check(res, { 'status 200': (r) => r.status === 200 });
}

export function spikeTest() {
  const res = http.get(__ENV.BASE_URL + '/api/health');
  check(res, { 'status 200': (r) => r.status === 200 });
}
```

### Custom Metrics & Thresholds

```javascript
// load-tests/custom-metrics.js
import http from 'k6/http';
import { check, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Define custom metrics
const successRate = new Rate('success_rate');
const swapLatency = new Trend('swap_latency', true);
const activeUsers = new Gauge('active_users');
const totalSwaps = new Counter('total_swaps');

// Business metrics
const swapVolume = new Counter('swap_volume_usd');
const slippageRate = new Rate('slippage_exceeded');

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // Standard metrics
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],

    // Custom metrics
    'success_rate': ['rate>0.95'],
    'swap_latency': ['p(95)<800', 'p(99)<1500'],
    'slippage_exceeded': ['rate<0.05'],

    // Grouped metrics
    'http_req_duration{name:CreateToken}': ['p(95)<2000'],
    'http_req_duration{name:ExecuteSwap}': ['p(95)<1000'],
  },
};

export default function () {
  group('Swap Flow', () => {
    // Get quote
    const quoteStart = Date.now();
    const quoteRes = http.get(`${__ENV.BASE_URL}/quote?from=SOL&to=USDC&amount=1.0`, {
      tags: { name: 'GetQuote' },
    });

    const quoteSuccess = check(quoteRes, {
      'quote status 200': (r) => r.status === 200,
      'has price': (r) => r.json('outAmount') > 0,
    });

    if (!quoteSuccess) {
      successRate.add(false);
      return;
    }

    const quote = quoteRes.json();

    // Execute swap
    const swapStart = Date.now();
    const swapRes = http.post(`${__ENV.BASE_URL}/swap`, JSON.stringify({
      inputMint: 'SOL',
      outputMint: 'USDC',
      amount: 1.0,
      slippageBps: 50,
    }), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'ExecuteSwap' },
    });

    const swapDuration = Date.now() - swapStart;
    swapLatency.add(swapDuration);

    const swapSuccess = check(swapRes, {
      'swap status 200': (r) => r.status === 200,
      'has signature': (r) => r.json('signature') !== undefined,
    });

    successRate.add(swapSuccess);

    if (swapSuccess) {
      const result = swapRes.json();
      totalSwaps.add(1);
      swapVolume.add(quote.outAmount);

      // Check slippage
      const actualSlippage = Math.abs(result.actualAmount - quote.outAmount) / quote.outAmount;
      slippageRate.add(actualSlippage > 0.005); // 0.5% threshold
    }

    // Update active users gauge
    activeUsers.add(1);
  });
}
```

## Common Patterns

### Pattern 1: Real-World User Journeys

```javascript
// load-tests/user-journey.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { randomItem, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const BASE_URL = __ENV.BASE_URL || 'https://api.example.com';

const TOKENS = ['SOL', 'USDC', 'BONK', 'JTO', 'JUP'];

export const options = {
  scenarios: {
    // Scenario 1: Casual browser (60% of users)
    casual_browser: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 60 },
        { duration: '10m', target: 60 },
      ],
      exec: 'browsing',
      gracefulRampDown: '1m',
    },

    // Scenario 2: Active trader (30% of users)
    active_trader: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 30 },
        { duration: '10m', target: 30 },
      ],
      exec: 'trading',
      gracefulRampDown: '1m',
    },

    // Scenario 3: Token creator (10% of users)
    token_creator: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 10 },
        { duration: '10m', target: 10 },
      ],
      exec: 'creating',
      gracefulRampDown: '1m',
    },
  },
  thresholds: {
    'http_req_duration{scenario:casual_browser}': ['p(95)<500'],
    'http_req_duration{scenario:active_trader}': ['p(95)<800'],
    'http_req_duration{scenario:token_creator}': ['p(95)<2000'],
  },
};

// Casual browser: Views tokens, checks prices
export function browsing() {
  group('Browse Tokens', () => {
    // Homepage
    let res = http.get(`${BASE_URL}/`, {
      tags: { name: 'Homepage' },
    });
    check(res, { 'homepage loaded': (r) => r.status === 200 });
    sleep(randomIntBetween(2, 5));

    // View token list
    res = http.get(`${BASE_URL}/tokens`, {
      tags: { name: 'TokenList' },
    });
    check(res, { 'token list loaded': (r) => r.status === 200 });
    sleep(randomIntBetween(3, 7));

    // View specific token
    const token = randomItem(TOKENS);
    res = http.get(`${BASE_URL}/token/${token}`, {
      tags: { name: 'TokenDetails' },
    });
    check(res, { 'token details loaded': (r) => r.status === 200 });
    sleep(randomIntBetween(10, 20));

    // Check price chart
    res = http.get(`${BASE_URL}/token/${token}/chart?interval=1h`, {
      tags: { name: 'PriceChart' },
    });
    check(res, { 'chart loaded': (r) => r.status === 200 });
    sleep(randomIntBetween(5, 10));
  });
}

// Active trader: Makes swaps, checks balances
export function trading() {
  group('Trading Flow', () => {
    // Check wallet balance
    let res = http.get(`${BASE_URL}/wallet/balance`, {
      tags: { name: 'CheckBalance' },
    });
    check(res, { 'balance fetched': (r) => r.status === 200 });
    sleep(1);

    // Get quote
    const fromToken = randomItem(TOKENS);
    const toToken = randomItem(TOKENS.filter(t => t !== fromToken));
    const amount = randomIntBetween(1, 100) / 10;

    res = http.get(`${BASE_URL}/quote?from=${fromToken}&to=${toToken}&amount=${amount}`, {
      tags: { name: 'GetQuote' },
    });
    check(res, { 'quote received': (r) => r.status === 200 });
    sleep(randomIntBetween(2, 5));

    // Execute swap (50% of the time)
    if (Math.random() < 0.5) {
      res = http.post(`${BASE_URL}/swap`, JSON.stringify({
        inputMint: fromToken,
        outputMint: toToken,
        amount: amount,
        slippageBps: 50,
      }), {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'ExecuteSwap' },
      });
      check(res, { 'swap executed': (r) => r.status === 200 });
      sleep(randomIntBetween(3, 8));

      // Check updated balance
      res = http.get(`${BASE_URL}/wallet/balance`, {
        tags: { name: 'CheckBalance' },
      });
      sleep(randomIntBetween(2, 5));
    }

    sleep(randomIntBetween(10, 30));
  });
}

// Token creator: Creates new tokens
export function creating() {
  group('Create Token', () => {
    // Fill form (user thinks)
    sleep(randomIntBetween(30, 60));

    // Upload image
    const imageData = open('./fixtures/token-image.png', 'b');
    let res = http.post(`${BASE_URL}/upload`, {
      file: http.file(imageData, 'token.png'),
    }, {
      tags: { name: 'UploadImage' },
    });
    check(res, { 'image uploaded': (r) => r.status === 200 });
    sleep(randomIntBetween(2, 5));

    // Create token
    res = http.post(`${BASE_URL}/token/create`, JSON.stringify({
      name: `Test Token ${Date.now()}`,
      symbol: `TST${randomIntBetween(100, 999)}`,
      description: 'A test token for load testing',
      supply: 1000000000,
    }), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'CreateToken' },
    });
    check(res, { 'token created': (r) => r.status === 200 });

    if (res.status === 200) {
      const tokenId = res.json('tokenId');

      // View created token
      sleep(randomIntBetween(2, 5));
      res = http.get(`${BASE_URL}/token/${tokenId}`, {
        tags: { name: 'ViewCreatedToken' },
      });
      check(res, { 'view token': (r) => r.status === 200 });

      // Monitor for a bit
      sleep(randomIntBetween(30, 60));
    }
  });
}
```

### Pattern 2: WebSocket & Real-Time Testing

```javascript
// load-tests/websocket.js
import ws from 'k6/ws';
import { check } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const messageLatency = new Trend('ws_message_latency');
const messagesReceived = new Counter('ws_messages_received');
const connectionsEstablished = new Counter('ws_connections');

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const url = __ENV.WS_URL || 'wss://api.example.com/ws';

  const res = ws.connect(url, {}, function (socket) {
    connectionsEstablished.add(1);

    socket.on('open', () => {
      console.log('WebSocket connected');

      // Subscribe to token prices
      socket.send(JSON.stringify({
        type: 'subscribe',
        channels: ['tokens', 'trades'],
      }));

      // Send periodic pings
      socket.setInterval(() => {
        socket.send(JSON.stringify({ type: 'ping' }));
      }, 10000);
    });

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      messagesReceived.add(1);

      if (message.type === 'price_update') {
        const latency = Date.now() - message.timestamp;
        messageLatency.add(latency);

        check(message, {
          'has price': (m) => m.price !== undefined,
          'latency < 1s': (m) => latency < 1000,
        });
      }
    });

    socket.on('error', (e) => {
      console.error('WebSocket error:', e);
    });

    socket.on('close', () => {
      console.log('WebSocket closed');
    });

    // Keep connection open for test duration
    socket.setTimeout(() => {
      socket.close();
    }, 180000); // 3 minutes
  });

  check(res, { 'WebSocket connected': (r) => r && r.status === 101 });
}
```

### Pattern 3: API Rate Limiting Tests

```javascript
// load-tests/rate-limiting.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const rateLimitHit = new Rate('rate_limit_hit');
const requestsBlocked = new Counter('requests_blocked');

export const options = {
  scenarios: {
    // Test rate limit enforcement
    rate_limit_test: {
      executor: 'constant-arrival-rate',
      rate: 200, // 200 requests per second
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 10,
      maxVUs: 50,
    },
  },
  thresholds: {
    'rate_limit_hit': ['rate<0.1'], // Less than 10% should hit rate limit
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/tokens`, {
    headers: {
      'X-API-Key': __ENV.API_KEY,
    },
  });

  const isRateLimited = res.status === 429;
  rateLimitHit.add(isRateLimited);

  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
  });

  if (isRateLimited) {
    requestsBlocked.add(1);

    // Check rate limit headers
    check(res, {
      'has retry-after': (r) => r.headers['Retry-After'] !== undefined,
      'has rate limit info': (r) => r.headers['X-RateLimit-Remaining'] !== undefined,
    });

    const retryAfter = parseInt(res.headers['Retry-After'] || '1');
    sleep(retryAfter);
  }
}
```

## Advanced Techniques

### Distributed Load Testing

```javascript
// k6-cloud.js - Run distributed tests
export const options = {
  ext: {
    loadimpact: {
      projectID: 12345,
      name: 'Distributed Load Test',
      distribution: {
        'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 50 },
        'amazon:ie:dublin': { loadZone: 'amazon:ie:dublin', percent: 30 },
        'amazon:sg:singapore': { loadZone: 'amazon:sg:singapore', percent: 20 },
      },
    },
  },
  stages: [
    { duration: '5m', target: 500 },
    { duration: '10m', target: 500 },
  ],
};

// Run: k6 cloud k6-cloud.js
```

### Data-Driven Testing

```javascript
// load-tests/data-driven.js
import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

// Load test data (shared across VUs)
const tokens = new SharedArray('tokens', function () {
  return papaparse.parse(open('./data/tokens.csv'), { header: true }).data;
});

const users = new SharedArray('users', function () {
  return JSON.parse(open('./data/users.json'));
});

export default function () {
  // Use test data
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  const user = users[__VU % users.length];

  const res = http.get(`${__ENV.BASE_URL}/token/${token.address}`, {
    headers: {
      'Authorization': `Bearer ${user.token}`,
    },
  });

  check(res, {
    'status 200': (r) => r.status === 200,
    'has token data': (r) => r.json('symbol') === token.symbol,
  });
}
```

### Performance Monitoring Integration

```javascript
// load-tests/monitoring.js
import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// Custom metrics for monitoring
const dbQueryTime = new Trend('db_query_time');
const cacheHitRate = new Trend('cache_hit_rate');

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/tokens`, {
    tags: { name: 'ListTokens' },
  });

  check(res, { 'status 200': (r) => r.status === 200 });

  // Parse server timing headers
  if (res.headers['Server-Timing']) {
    const timings = parseServerTimings(res.headers['Server-Timing']);

    if (timings.db) {
      dbQueryTime.add(timings.db);
    }
    if (timings.cache) {
      cacheHitRate.add(timings.cache === 'hit' ? 1 : 0);
    }
  }
}

function parseServerTimings(header) {
  const timings = {};
  header.split(',').forEach(timing => {
    const [name, value] = timing.split(';')[0].split('=');
    timings[name.trim()] = parseFloat(value);
  });
  return timings;
}

// Output results to external monitoring
export function handleSummary(data) {
  // Send to Datadog, Grafana, etc.
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}
```

## Production Examples

### Example 1: Complete API Load Test Suite

```javascript
// load-tests/api-suite.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const successRate = new Rate('success_rate');
const apiLatency = new Trend('api_latency');
const totalRequests = new Counter('total_requests');

export const options = {
  scenarios: {
    // Smoke test: Verify functionality with minimal load
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      exec: 'smokeTest',
      startTime: '0s',
    },

    // Load test: Normal expected load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      exec: 'loadTest',
      startTime: '1m',
    },

    // Stress test: Push beyond normal limits
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 0 },
      ],
      exec: 'stressTest',
      startTime: '10m',
    },

    // Spike test: Sudden traffic surge
    spike: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 500,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '30s', target: 500 },
        { duration: '1m', target: 10 },
      ],
      exec: 'spikeTest',
      startTime: '21m',
    },
  },
  thresholds: {
    'http_req_duration{scenario:smoke}': ['p(95)<200'],
    'http_req_duration{scenario:load}': ['p(95)<500'],
    'http_req_duration{scenario:stress}': ['p(95)<1000'],
    'http_req_duration{scenario:spike}': ['p(95)<2000'],
    'http_req_failed': ['rate<0.05'],
    'success_rate': ['rate>0.95'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://api.example.com';

export function smokeTest() {
  group('Smoke Test - Basic Functionality', () => {
    testHealthCheck();
    testListTokens();
    testGetToken();
  });
}

export function loadTest() {
  group('Load Test - Normal Traffic', () => {
    testListTokens();
    sleep(1);
    testGetToken();
    sleep(1);
    testGetQuote();
    sleep(2);
  });
}

export function stressTest() {
  group('Stress Test - Heavy Load', () => {
    testListTokens();
    testGetToken();
    testGetQuote();
    testExecuteSwap();
    sleep(0.5);
  });
}

export function spikeTest() {
  testListTokens();
}

function testHealthCheck() {
  const start = Date.now();
  const res = http.get(`${BASE_URL}/health`);
  apiLatency.add(Date.now() - start);
  totalRequests.add(1);

  const success = check(res, {
    'health check status 200': (r) => r.status === 200,
  });
  successRate.add(success);
}

function testListTokens() {
  const start = Date.now();
  const res = http.get(`${BASE_URL}/tokens`);
  apiLatency.add(Date.now() - start);
  totalRequests.add(1);

  const success = check(res, {
    'list tokens status 200': (r) => r.status === 200,
    'has tokens array': (r) => Array.isArray(r.json('tokens')),
  });
  successRate.add(success);
}

function testGetToken() {
  const start = Date.now();
  const res = http.get(`${BASE_URL}/token/SOL`);
  apiLatency.add(Date.now() - start);
  totalRequests.add(1);

  const success = check(res, {
    'get token status 200': (r) => r.status === 200,
    'has symbol': (r) => r.json('symbol') === 'SOL',
  });
  successRate.add(success);
}

function testGetQuote() {
  const start = Date.now();
  const res = http.get(`${BASE_URL}/quote?from=SOL&to=USDC&amount=1.0`);
  apiLatency.add(Date.now() - start);
  totalRequests.add(1);

  const success = check(res, {
    'quote status 200': (r) => r.status === 200,
    'has output amount': (r) => r.json('outAmount') > 0,
  });
  successRate.add(success);
}

function testExecuteSwap() {
  const start = Date.now();
  const res = http.post(`${BASE_URL}/swap`, JSON.stringify({
    inputMint: 'SOL',
    outputMint: 'USDC',
    amount: 0.1,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  apiLatency.add(Date.now() - start);
  totalRequests.add(1);

  const success = check(res, {
    'swap status 200': (r) => r.status === 200,
  });
  successRate.add(success);
}
```

### Example 2: Blockchain RPC Load Test

```javascript
// load-tests/solana-rpc.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const rpcLatency = new Trend('rpc_latency');
const rpcErrors = new Rate('rpc_errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'rpc_latency': ['p(95)<300', 'p(99)<500'],
    'rpc_errors': ['rate<0.01'],
  },
};

const RPC_URL = __ENV.RPC_URL || 'https://api.mainnet-beta.solana.com';

export default function () {
  // Test different RPC methods
  testGetBalance();
  sleep(0.5);
  testGetAccountInfo();
  sleep(0.5);
  testGetRecentBlockhash();
  sleep(0.5);
  testGetTransaction();
  sleep(1);
}

function testGetBalance() {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getBalance',
    params: ['vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg'],
  };

  const start = Date.now();
  const res = http.post(RPC_URL, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { method: 'getBalance' },
  });
  rpcLatency.add(Date.now() - start);

  const success = check(res, {
    'status 200': (r) => r.status === 200,
    'has result': (r) => r.json('result') !== undefined,
    'no error': (r) => !r.json('error'),
  });

  rpcErrors.add(!success);
}

function testGetAccountInfo() {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getAccountInfo',
    params: [
      'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg',
      { encoding: 'base64' },
    ],
  };

  const start = Date.now();
  const res = http.post(RPC_URL, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { method: 'getAccountInfo' },
  });
  rpcLatency.add(Date.now() - start);

  const success = check(res, {
    'status 200': (r) => r.status === 200,
    'has account data': (r) => r.json('result.value') !== null,
  });

  rpcErrors.add(!success);
}

function testGetRecentBlockhash() {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getLatestBlockhash',
  };

  const start = Date.now();
  const res = http.post(RPC_URL, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { method: 'getLatestBlockhash' },
  });
  rpcLatency.add(Date.now() - start);

  const success = check(res, {
    'status 200': (r) => r.status === 200,
    'has blockhash': (r) => r.json('result.value.blockhash') !== undefined,
  });

  rpcErrors.add(!success);
}

function testGetTransaction() {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getTransaction',
    params: [
      '2nBhEBYYvfaAe16UMNqRHre4YNSskvuYgx3M6E4JP1oDYvZEJHvoPzyUidNgNX5r9sTyN1J9UxtbCXy2rqYcuyuv',
      { encoding: 'json' },
    ],
  };

  const start = Date.now();
  const res = http.post(RPC_URL, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { method: 'getTransaction' },
  });
  rpcLatency.add(Date.now() - start);

  const success = check(res, {
    'status 200': (r) => r.status === 200,
  });

  rpcErrors.add(!success);
}
```

### Example 3: CI/CD Integration

```yaml
# .github/workflows/load-test.yml
name: Load Tests

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *' # Daily at midnight

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run smoke test
        run: k6 run load-tests/api-suite.js --env BASE_URL=${{ secrets.STAGING_URL }}

      - name: Run load test
        run: k6 run load-tests/api-suite.js --env BASE_URL=${{ secrets.STAGING_URL }}

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: summary.json

      - name: Send results to monitoring
        run: |
          curl -X POST ${{ secrets.MONITORING_WEBHOOK }} \
            -H "Content-Type: application/json" \
            -d @summary.json
```

## Best Practices

1. **Test Planning**
   - Define clear objectives
   - Identify realistic user scenarios
   - Set appropriate thresholds

2. **Scenario Design**
   - Mix different user types
   - Include think time (sleep)
   - Use realistic data

3. **Metrics & Monitoring**
   - Track custom business metrics
   - Monitor infrastructure during tests
   - Compare against baselines

4. **Thresholds**
   - Set realistic performance goals
   - Use percentiles (p95, p99) not averages
   - Include error rate thresholds

5. **CI/CD Integration**
   - Run smoke tests on every deploy
   - Schedule regular load tests
   - Fail builds on threshold violations

## Common Pitfalls

1. **Unrealistic Load Patterns**
   ```javascript
   // ❌ Bad: Constant hammering
   export default function () {
     http.get(url);
   }

   // ✅ Good: Realistic think time
   export default function () {
     http.get(url);
     sleep(randomIntBetween(1, 5));
   }
   ```

2. **Ignoring Ramp-Up**
   ```javascript
   // ❌ Bad: Instant full load
   export const options = {
     vus: 1000,
     duration: '10m',
   };

   // ✅ Good: Gradual ramp-up
   export const options = {
     stages: [
       { duration: '2m', target: 100 },
       { duration: '5m', target: 1000 },
       { duration: '2m', target: 0 },
     ],
   };
   ```

3. **Not Testing Failures**
   ```javascript
   // ❌ Bad: Only test happy path
   check(res, { 'status 200': (r) => r.status === 200 });

   // ✅ Good: Test error handling
   check(res, {
     'valid status': (r) => [200, 429, 503].includes(r.status),
     'has error message': (r) => r.status !== 200 ? r.json('error') : true,
   });
   ```

4. **Over-Reliance on Averages**
   ```javascript
   // ❌ Bad: Only average latency
   thresholds: {
     'http_req_duration': ['avg<500'],
   }

   // ✅ Good: Use percentiles
   thresholds: {
     'http_req_duration': ['p(95)<500', 'p(99)<1000', 'max<5000'],
   }
   ```

## Resources

- **Official Docs**: https://k6.io/docs/
- **Examples**: https://github.com/grafana/k6/tree/master/examples
- **Cloud**: https://k6.io/cloud/
- **Extensions**: https://k6.io/docs/extensions/
- **Community**: https://community.k6.io/
- **Best Practices**: https://k6.io/docs/testing-guides/test-types/
