# Command: /storybook-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Storybook story generation with controls, actions, and variants

## Description

The `/storybook-gen` command generates Storybook stories for React/Vue components with interactive controls, action logging, accessibility testing, and component variants. Supports CSF 3.0 format.

## Usage

```bash
/storybook-gen <component> [--variants] [--a11y]
```

## Arguments

- `component` (required) - Component name or path
- `--variants` - Generate multiple component variants
- `--a11y` - Include accessibility addon testing

## Examples

### Example 1: Generate basic story
```bash
/storybook-gen Button
```
Generates Storybook story for Button component.

### Example 2: Component with variants
```bash
/storybook-gen Card --variants
```
Creates stories with multiple Card variants (default, outlined, elevated).

### Example 3: Accessibility testing
```bash
/storybook-gen Form --a11y
```
Generates story with accessibility checks.

## Generated Story Features

- **Controls**: Interactive prop controls
- **Actions**: Event logging
- **Variants**: Multiple component states
- **Documentation**: Auto-generated docs
- **Accessibility**: a11y addon integration

## Related Commands

- `/component-gen` - Generate components with stories
- `/test-gen` - Generate component tests
- `/doc-generate` - Generate component docs
