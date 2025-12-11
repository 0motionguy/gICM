---
name: kubernetes-patterns
description: "Production-grade Kubernetes patterns for resilient, scalable deployments."
version: 1.0.0
author: gICM Community
license: Apache-2.0
---

# Kubernetes Patterns

Production-grade Kubernetes patterns for resilient, scalable deployments.

## Deployment Patterns

### 1. Blue-Green Deployment
```yaml
# Blue deployment (current production)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
  labels:
    version: blue
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: myapp
        version: blue

---
# Green deployment (new version)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
  labels:
    version: green
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: myapp
        version: green

---
# Switch traffic by updating service selector
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
    version: green  # Switch from blue to green
```

### 2. Canary Deployment with Istio
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: token-launcher
spec:
  hosts:
  - token-launcher.example.com
  http:
  - match:
    - headers:
        x-user-group:
          exact: "beta"
    route:
    - destination:
        host: token-launcher
        subset: v2
  - route:
    - destination:
        host: token-launcher
        subset: v1
      weight: 95
    - destination:
        host: token-launcher
        subset: v2
      weight: 5  # 5% canary traffic
```

### 3. Rolling Update with Readiness Gates
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # Zero downtime
  template:
    spec:
      containers:
      - name: api
        image: api:v2
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          successThreshold: 2
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

## Resilience Patterns

### 4. Pod Disruption Budget
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: solana-rpc-pdb
spec:
  minAvailable: 2  # Always keep 2 pods running
  selector:
    matchLabels:
      app: solana-rpc
```

### 5. Init Containers for Dependencies
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  initContainers:
  - name: wait-for-db
    image: busybox
    command: ['sh', '-c',
      'until nslookup postgres-service; do sleep 2; done']
  - name: run-migrations
    image: myapp:migrations
    command: ['npm', 'run', 'migrate']
  containers:
  - name: app
    image: myapp:latest
```

### 6. Sidecar Pattern
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-logging
spec:
  containers:
  # Main application
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app

  # Logging sidecar
  - name: log-shipper
    image: fluentd:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
      readOnly: true

  volumes:
  - name: logs
    emptyDir: {}
```

## Scaling Patterns

### 7. Horizontal Pod Autoscaling (HPA)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

### 8. Vertical Pod Autoscaling (VPA)
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: database-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: postgres
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: postgres
      minAllowed:
        memory: "2Gi"
        cpu: "500m"
      maxAllowed:
        memory: "16Gi"
        cpu: "4"
```

## Storage Patterns

### 9. StatefulSet with Persistent Storage
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: solana-validator
spec:
  serviceName: validator
  replicas: 3
  selector:
    matchLabels:
      app: validator
  template:
    spec:
      containers:
      - name: validator
        image: solana/validator:1.18.0
        volumeMounts:
        - name: data
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 2Ti
```

### 10. Dynamic Volume Provisioning
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd
  replication-type: regional-pd
allowVolumeExpansion: true
reclaimPolicy: Retain
```

## Security Patterns

### 11. Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
spec:
  podSelector:
    matchLabels:
      app: api-server
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
```

### 12. Pod Security Standards
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

## Observability Patterns

### 13. ServiceMonitor for Prometheus
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-metrics
spec:
  selector:
    matchLabels:
      app: api-server
  endpoints:
  - port: metrics
    path: /metrics
    interval: 30s
```

## Best Practices

- ✅ Use **resource requests and limits**
- ✅ Implement **readiness and liveness probes**
- ✅ Apply **Pod Disruption Budgets** for HA
- ✅ Use **NetworkPolicies** for security
- ✅ Leverage **labels and selectors** consistently
- ✅ Implement **monitoring and logging**
- ❌ Avoid running containers as root
- ❌ Don't store secrets in ConfigMaps
- ❌ Never expose services without authentication

---

**Category:** Kubernetes & Cloud Native
**Difficulty:** Advanced
**Prerequisites:** Kubernetes fundamentals, YAML
