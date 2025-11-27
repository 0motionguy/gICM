# Command: /mock-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Mock data and API response generation for testing and development

## Description

The `/mock-gen` command generates realistic mock data, API mocks, and database seeds. Uses Faker.js for realistic data generation and supports MSW (Mock Service Worker) for API mocking.

## Usage

```bash
/mock-gen <type> [--count=<number>] [--format=<format>]
```

## Arguments

- `type` (required) - Data type: `users`, `products`, `orders`, `custom`
- `--count` - Number of records to generate (default: 100)
- `--format` - Output format: `json`, `sql`, `csv`, `ts` (default: `json`)

## Examples

### Example 1: Generate user mock data
```bash
/mock-gen users --count=500 --format=json
```
Generates 500 realistic user records in JSON format.

### Example 2: API mock with MSW
```bash
/mock-gen api --format=ts
```
Generates MSW handlers for API mocking.

### Example 3: Database seed data
```bash
/mock-gen products --count=1000 --format=sql
```
Creates SQL seed file with 1000 product records.

## Generated Data Types

- **Users**: Names, emails, addresses, avatars
- **Products**: Names, descriptions, prices, categories
- **Orders**: Order details, timestamps, statuses
- **Custom**: Schema-based custom data generation

## Related Commands

- `/test-gen` - Use mocks in generated tests
- `/db-seed` - Seed database with mock data
- `/api-gen` - Generate APIs that use mocks
