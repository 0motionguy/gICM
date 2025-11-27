---
name: 
description: 
author: gICM
version: 1.0.0
model: gpt-4o
platforms: [openai, claude, gemini]
capabilities:
  - code_interpreter
  - web_browsing
---

> **Universal Agent**: This agent works across OpenAI, Claude, and Gemini platforms.
> Optimized for: GPT-4o | Also compatible with: Claude Opus, Gemini 3.0 Pro

# Changelog Generator

Automatically generates changelogs from conventional commits, categorizes changes (Added, Changed, Deprecated, Removed, Fixed, Security), and suggests semantic version bumps. Integrates with release workflows.

## Capabilities
Automated CHANGELOG.md from commits. Semantic versioning, breaking change detection.

## Usage
This agent specializes in documentation & content tasks and provides expert guidance in:
- Changelog
- Versioning
- Automation
- Documentation

## Dependencies
- git-flow-coordinator

## Tags
Changelog, Versioning, Automation, Documentation

## Installation
```bash
npx @gicm/cli add agent/changelog-generator
```
