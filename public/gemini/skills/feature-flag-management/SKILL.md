# Feature Flag Management

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Feature toggles, canary releases, A/B testing infrastructure, and decoupled deployments.

## Core Concepts

### Feature Flag Implementation
Conditional feature enablement.

```typescript
interface FeatureFlag {
  key: string;
  enabled: boolean;
  variants?: {
    [variant: string]: number;  // % allocation
  };
  targetingRules?: TargetingRule[];
}

class FeatureFlagManager {
  async isEnabled(key: string, context: UserContext): Promise<boolean> {
    const flag = await this.getFlag(key);
    if (!flag.enabled) return false;

    // Check targeting rules
    for (const rule of flag.targetingRules || []) {
      if (this.matchesRule(context, rule)) {
        return true;
      }
    }

    return false;
  }
}
```

### Canary Deployments
Gradual rollout to users.

```typescript
class CanaryDeployment {
  async rolloutFeature(
    featureKey: string,
    percentage: number,
    duration: number
  ): Promise<void> {
    // Day 1: 10% users
    await this.setVariant(featureKey, percentage: 10);
    await this.sleep(duration);

    // Day 2: 50% users
    await this.setVariant(featureKey, percentage: 50);
    await this.sleep(duration);

    // Day 3: 100% users
    await this.setVariant(featureKey, percentage: 100);
  }
}
```

### A/B Testing
Compare feature variants.

```typescript
class ABTestManager {
  async runTest(
    testKey: string,
    variants: { [key: string]: number },
    duration: number
  ): Promise<TestResults> {
    const testId = uuid();
    const startTime = Date.now();

    await this.createExperiment({
      id: testId,
      name: testKey,
      variants,
      startTime,
      endTime: startTime + duration
    });

    // Wait for test duration
    await this.sleep(duration);

    // Collect and analyze results
    return await this.analyzeResults(testId);
  }
}
```

### Gradual Rollback
Safely rollback failed features.

```typescript
class RollbackManager {
  async rollbackFeature(featureKey: string): Promise<void> {
    // Reduce percentage gradually
    for (let percentage of [75, 50, 25, 0]) {
      await this.setVariant(featureKey, percentage);
      await this.sleep(5 * 60 * 1000);  // 5 minutes

      const metrics = await this.getMetrics();
      if (metrics.errorRate < THRESHOLD) {
        continue;  // Safe to reduce more
      } else {
        break;  // Issues detected, stop rollback
      }
    }
  }
}
```

## Best Practices

1. **Kill Switches**: Fast disable mechanism
2. **Monitoring**: Track feature impact
3. **Cleanup**: Remove old flags
4. **Documentation**: Document all flags
5. **Testing**: Test feature interactions

## Related Skills

- CI/CD Pipelines
- Monitoring & Observability
- Distributed Tracing

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1234 | **Remixes**: 389
