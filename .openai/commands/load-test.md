# /load-test

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Load testing and stress testing with k6 and Artillery. Simulate concurrent users, spike tests, soak tests, and stress testing to ensure application scalability.

## Usage

```bash
/load-test
/load-test --users=100
/load-test --type=spike
```

## Features

- **Concurrency Simulation**: Simulate multiple concurrent users
- **Spike Testing**: Sudden traffic spikes to test burst capacity
- **Soak Testing**: Long-running tests to find memory leaks
- **Stress Testing**: Gradual load increase until failure
- **Real-time Metrics**: Request/error rates, latency, throughput
- **Threshold Alerts**: Alert on SLA violations
- **HTML Reports**: Detailed HTML and JSON reports
- **Cloud Testing**: k6 Cloud integration for distributed load
- **Custom Scenarios**: Write custom test scenarios

## Configuration

```yaml
loadTest:
  type: "ramp-up" # ramp-up, spike, soak, stress
  tool: "k6" # k6, artillery
  duration: "5m"
  vus: 100 # virtual users
  rampUp: "30s"
  checkThresholds: true
  generateReport: true
```

## Example Output

```
Load Test Results
=================
Test Type: Ramp-up
Duration: 5 minutes
Peak Users: 100

Metrics:
  Requests: 50,234
  Success Rate: 99.8%
  Avg Response Time: 145ms
  P95 Response Time: 312ms
  P99 Response Time: 892ms
  Throughput: 167 req/sec
  Errors: 101

Threshold Status:
  ✓ Response time < 500ms: PASS
  ✓ Error rate < 1%: PASS
  ✓ Throughput > 100 req/sec: PASS
```

## Options

- `--type`: Test type (ramp-up, spike, soak, stress)
- `--users`: Peak number of virtual users
- `--duration`: Test duration (e.g., 5m, 2h)
- `--tool`: Testing tool (k6, artillery)
- `--output`: Custom report output path
- `--cloud`: Run on k6 Cloud

## See Also

- `/perf-trace` - Performance profiling
- `/bundle-analyze` - Size analysis
- `/monitoring-setup` - Production monitoring
