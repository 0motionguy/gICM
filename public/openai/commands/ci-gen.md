# Command: /ci-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> CI/CD pipeline generation for GitHub Actions, GitLab CI, CircleCI

## Description

The `/ci-gen` command generates complete CI/CD pipelines with testing, linting, building, security scanning, and deployment workflows. Supports GitHub Actions, GitLab CI, CircleCI, and Jenkins.

## Usage

```bash
/ci-gen [--platform=<platform>] [--deploy=<target>] [--test]
```

## Arguments

- `--platform` - CI platform: `github`, `gitlab`, `circle`, `jenkins` (default: `github`)
- `--deploy` - Deployment target: `vercel`, `netlify`, `aws`, `docker`, `k8s`
- `--test` - Include comprehensive test workflows

## Examples

### Example 1: GitHub Actions with Vercel
```bash
/ci-gen --platform=github --deploy=vercel --test
```
Generates GitHub Actions workflow with tests and Vercel deployment.

### Example 2: GitLab CI with Docker
```bash
/ci-gen --platform=gitlab --deploy=docker
```
Creates GitLab CI pipeline with Docker build and push.

### Example 3: Full test pipeline
```bash
/ci-gen --test
```
Generates comprehensive test pipeline with coverage reporting.

## Pipeline Stages

- **Lint**: ESLint, Prettier, type checking
- **Test**: Unit, integration, E2E tests
- **Build**: Compile, bundle, optimize
- **Security**: Dependency scanning, SAST, DAST
- **Deploy**: Automated deployment to target platform

## Related Commands

- `/deploy-ci-setup` - Advanced CI configuration
- `/test-gen` - Generate tests for CI
- `/security-audit` - Security checks for CI
