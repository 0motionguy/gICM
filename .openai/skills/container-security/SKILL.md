# Container Security

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


Master Docker and Kubernetes security best practices for production deployments.

## Quick Reference

### Secure Dockerfile
```dockerfile
# Use specific version, not 'latest'
FROM node:20-alpine

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js

CMD ["node", "server.js"]
```

### Vulnerability Scanning
```bash
# Scan image
trivy image myapp:latest

# Scan filesystem
trivy fs .

# Generate SBOM
syft myapp:latest -o spdx-json
```

### Kubernetes Security
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
  - name: app
    image: myapp:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
          - ALL
    resources:
      limits:
        memory: "512Mi"
        cpu: "500m"
```

## Best Practices

- Never run containers as root
- Scan images for vulnerabilities
- Use minimal base images (Alpine, Distroless)
- Sign and verify images
- Implement network policies
- Set resource limits
- Use secrets management (not environment variables)
- Enable audit logging
