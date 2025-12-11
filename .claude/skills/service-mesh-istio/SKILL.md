---
name: service-mesh-istio
description: "Istio service mesh: traffic management, security policies, observability integration."
version: 1.0.0
author: gICM Community
license: Apache-2.0
---

# Service Mesh (Istio)

> Istio service mesh: traffic management, security policies, observability integration.

## Core Concepts

### VirtualService
Route requests to different destination versions.

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-service
spec:
  hosts:
  - user-service
  http:
  - match:
    - uri:
        prefix: /api/v2
    route:
    - destination:
        host: user-service
        subset: v2
      weight: 100
  - route:
    - destination:
        host: user-service
        subset: v1
      weight: 100
```

### DestinationRule
Define connection pooling and outlier detection.

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: user-service
spec:
  host: user-service
  trafficPolicy:
    connectionPool:
      http:
        http1MaxPendingRequests: 100
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s
```

### AuthorizationPolicy
mTLS and fine-grained access control.

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: api-policy
spec:
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/default/sa/api"]
    to:
    - operation:
        methods: ["GET"]
        paths: ["/api/users"]
```

## Best Practices

1. **Canary Deployments**: Use weighted traffic splitting
2. **Observability**: Integrate with Jaeger/Kiali
3. **mTLS**: Enable strict mTLS enforcement
4. **Resource Limits**: Define CPU/memory in destination rules
5. **Health Checks**: Configure readiness probes

## Related Skills

- Circuit Breaker Patterns
- Load Balancing Strategies
- Distributed Tracing
- Kubernetes Patterns

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 834 | **Remixes**: 289
