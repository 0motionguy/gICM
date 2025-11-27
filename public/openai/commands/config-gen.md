# Command: /config-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Configuration file generation for build tools, linters, and formatters

## Description

The `/config-gen` command generates configuration files for ESLint, Prettier, TypeScript, Vite, Webpack, Tailwind, and other development tools with best practices and team standards.

## Usage

```bash
/config-gen <tool> [--strict] [--framework=<framework>]
```

## Arguments

- `tool` (required) - Tool name: `eslint`, `prettier`, `tsconfig`, `vite`, `webpack`, `tailwind`
- `--strict` - Enable strict mode and all recommended rules
- `--framework` - Framework-specific config: `react`, `vue`, `next`, `svelte`

## Examples

### Example 1: ESLint with TypeScript
```bash
/config-gen eslint --strict --framework=react
```
Generates strict ESLint config for React + TypeScript.

### Example 2: TypeScript configuration
```bash
/config-gen tsconfig --strict
```
Creates strict TypeScript config with all checks enabled.

### Example 3: Tailwind CSS setup
```bash
/config-gen tailwind --framework=next
```
Generates Tailwind config optimized for Next.js.

## Supported Tools

- **ESLint**: Code quality and style rules
- **Prettier**: Code formatting configuration
- **TypeScript**: Compiler options and strict mode
- **Vite**: Build configuration and plugins
- **Webpack**: Module bundling setup
- **Tailwind**: Utility-first CSS configuration

## Related Commands

- `/env-setup` - Environment configuration
- `/ci-gen` - CI configuration files
- `/dockerfile-gen` - Docker configuration
