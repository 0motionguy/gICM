# Command: /hook-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> React/Vue custom hook generation with TypeScript and tests

## Description

The `/hook-gen` command generates custom React hooks or Vue composables with TypeScript types, comprehensive tests, and usage documentation. Includes common patterns like data fetching, form handling, and state management.

## Usage

```bash
/hook-gen <name> [--framework=<framework>] [--pattern=<pattern>]
```

## Arguments

- `name` (required) - Hook name (e.g., "useAuth", "useFetch", "useLocalStorage")
- `--framework` - Framework: `react`, `vue` (default: `react`)
- `--pattern` - Pattern: `fetch`, `state`, `effect`, `custom` (default: `custom`)

## Examples

### Example 1: Data fetching hook
```bash
/hook-gen useFetch --pattern=fetch
```
Generates hook with loading, error, and data states.

### Example 2: Form handling hook
```bash
/hook-gen useForm --pattern=state
```
Creates form hook with validation and submission handling.

### Example 3: Vue composable
```bash
/hook-gen useAuth --framework=vue
```
Generates Vue 3 composable for authentication.

## Common Hook Patterns

- **useFetch**: Data fetching with caching
- **useForm**: Form state and validation
- **useLocalStorage**: Persistent state
- **useDebounce**: Debounced values
- **useMediaQuery**: Responsive breakpoints

## Related Commands

- `/component-gen` - Generate components using hooks
- `/test-gen` - Generate hook tests
- `/doc-generate` - Document hook usage
