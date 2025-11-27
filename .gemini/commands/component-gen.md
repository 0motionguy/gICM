# Command: /component-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> React/Vue component generation with TypeScript, Storybook, and tests

## Description

The `/component-gen` command scaffolds complete UI components with TypeScript types, Storybook stories, unit tests, and accessibility features. Supports React, Vue, and custom component templates.

## Usage

```bash
/component-gen <name> [--framework=<framework>] [--template=<template>]
```

## Arguments

- `name` (required) - Component name (e.g., "UserProfile", "DataTable")
- `--framework` - Framework: `react`, `vue`, `svelte` (default: `react`)
- `--template` - Template type: `basic`, `form`, `data-display`, `modal` (default: `basic`)

## Examples

### Example 1: Basic React component
```bash
/component-gen Button --framework=react
```
Generates Button component with props, tests, and stories.

### Example 2: Form component with validation
```bash
/component-gen LoginForm --template=form
```
Creates form component with Zod validation and error handling.

### Example 3: Data table component
```bash
/component-gen UserTable --template=data-display
```
Generates data table with sorting, filtering, and pagination.

## Generated Files

- `Component.tsx` - Main component file
- `Component.test.tsx` - Unit tests
- `Component.stories.tsx` - Storybook stories
- `Component.module.css` - Scoped styles
- `index.ts` - Barrel export

## Related Commands

- `/test-gen` - Generate additional tests
- `/doc-generate` - Generate component documentation
- `/refactor` - Refactor existing components
