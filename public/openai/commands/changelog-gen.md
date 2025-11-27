# /changelog-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Automatically generate CHANGELOG.md from conventional commits with automatic categorization, linking, and contributor attribution.

## Usage

```bash
/changelog-gen
/changelog-gen --from=v1.0.0 --to=v2.0.0
/changelog-gen --format=markdown
```

## Features

- **Conventional Commits**: Parse and categorize commits automatically
- **Version Grouping**: Organize changes by semantic version
- **Category Classification**: Features, Fixes, Breaking Changes, etc.
- **Contributor Attribution**: List contributors for each version
- **GitHub/GitLab Integration**: Link to issues and PRs
- **Markdown Formatting**: Well-formatted CHANGELOG.md
- **Version Comparison**: Show differences between versions
- **Template Support**: Customize format with templates

## Configuration

```yaml
changelog:
  format: "markdown" # markdown, rst, asciidoc
  groupBy: "type" # type, scope, author
  includeContributors: true
  includeLinks: true
  template: ".changelog-template.md"
  maxVersions: 10
  autoIncludeUnreleased: true
```

## Example Output

```markdown
# Changelog

## [2.1.0] - 2024-11-08

### Added
- New performance caching API (#234) @author1
- GraphQL subscription support (#245) @author2
- Dark mode theme support (#256) @author3

### Fixed
- Memory leak in event handler (#267) @author1
- Race condition in cache invalidation (#278) @author2

### Breaking Changes
- Removed deprecated REST endpoints
- Changed cache API signature

### Contributors
@author1, @author2, @author3

## [2.0.0] - 2024-10-15
...
```

## Options

- `--from`: Start version (default: previous tag)
- `--to`: End version (default: HEAD)
- `--format`: Output format (markdown, rst, asciidoc)
- `--output`: Custom output file
- `--include-breaking`: Include breaking changes section

## See Also

- `/release-notes` - Generate release notes
- `/deploy-prepare-release` - Release preparation
- `/feature-branch` - Git workflow
