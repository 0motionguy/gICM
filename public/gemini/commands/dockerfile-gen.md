# Command: /dockerfile-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Production-ready Dockerfile generation with multi-stage builds and optimization

## Description

The `/dockerfile-gen` command generates optimized Dockerfiles with multi-stage builds, layer caching, security best practices, and platform-specific optimizations for Node.js, Python, Go, Rust, and more.

## Usage

```bash
/dockerfile-gen [--runtime=<runtime>] [--optimize] [--security]
```

## Arguments

- `--runtime` - Runtime: `node`, `python`, `go`, `rust`, `java` (auto-detected)
- `--optimize` - Enable advanced optimizations (multi-stage, layer caching)
- `--security` - Include security hardening (non-root user, minimal base image)

## Examples

### Example 1: Node.js production Dockerfile
```bash
/dockerfile-gen --runtime=node --optimize --security
```
Generates optimized Node.js Dockerfile with Alpine base.

### Example 2: Python Dockerfile with dependencies
```bash
/dockerfile-gen --runtime=python --optimize
```
Creates Python Dockerfile with poetry/pip dependency management.

### Example 3: Go multi-stage build
```bash
/dockerfile-gen --runtime=go --optimize
```
Generates minimal Go binary with scratch base image.

## Features

- Multi-stage builds for minimal image size
- Layer caching optimization
- Non-root user for security
- Health checks and metadata
- Build argument support
- Docker Compose integration

## Related Commands

- `/deploy-containerize` - Full containerization workflow
- `/deploy-kubernetes` - Generate K8s manifests
- `/security-audit` - Audit container security
