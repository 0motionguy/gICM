# /release-notes

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
Generate comprehensive release notes with features, bug fixes, breaking changes, migration guides, and deployment instructions.

## Usage

```bash
/release-notes
/release-notes --version=2.1.0
/release-notes --include-migration-guide
```

## Features

- **Release Summary**: High-level overview of what's new
- **Features Section**: Highlight new capabilities with descriptions
- **Bug Fixes**: List resolved issues with references
- **Breaking Changes**: Detail migration paths for breaking changes
- **Migration Guide**: Step-by-step upgrade instructions
- **Deprecations**: Mark deprecated features with timelines
- **Known Issues**: Document known limitations
- **Contributors**: Acknowledge team members
- **Performance Notes**: Highlight performance improvements

## Configuration

```yaml
releaseNotes:
  template: "professional" # professional, casual, technical
  includeMigrationGuide: true
  includePerformanceNotes: true
  includeContributors: true
  generateHTML: true
  emailTemplate: true
```

## Example Output

```markdown
# Release Notes: Version 2.1.0

**Release Date:** November 8, 2024

## What's New

### Performance Improvements
- 40% faster initial load time
- Reduced bundle size by 120KB
- Optimized database queries

### New Features
- Advanced filtering with full-text search
- Real-time collaboration features
- Dark mode support

## Bug Fixes
- Fixed race condition in cache invalidation (#234)
- Resolved memory leak in event listeners (#245)

## Breaking Changes
- Removed REST API v1 endpoints (use v2)
- Changed authentication header format

**Migration Guide:** See [MIGRATION.md](./MIGRATION.md)

## Deprecations
- `oldAPI()` deprecated in favor of `newAPI()`
- Support ends: v3.0.0 (March 2025)

## Known Issues
- WebSocket on Safari 15 requires workaround
- See [issues](https://github.com/org/repo/issues)

## Contributors
Thanks to @author1, @author2, @author3 for this release!
```

## Options

- `--version`: Specific version to generate
- `--include-migration`: Include migration guide
- `--format`: Output format (markdown, html, text)
- `--template`: Template style (professional, casual, technical)
- `--output`: Custom output file

## See Also

- `/changelog-gen` - Auto-generate changelog
- `/deploy-prepare-release` - Release preparation
- `/test-coverage-report` - Quality metrics
