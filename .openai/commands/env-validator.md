# /env-validator

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Generate environment variable validation with Zod schemas, runtime type safety, and comprehensive documentation. Catch configuration errors early.

## Usage

```bash
/env-validator
/env-validator --generate-schema
/env-validator --validate
```

## Features

- **Zod Schema Generation**: Create type-safe env validators
- **Runtime Validation**: Check environment at startup
- **Type Inference**: Automatic TypeScript types from validation
- **Documentation**: Generate env variable documentation
- **Default Values**: Set sensible defaults for optional vars
- **Transformation**: Parse and transform environment values
- **Error Messages**: Clear, actionable error messages
- **Multiple Environments**: Dev, staging, production configs
- **Secrets Detection**: Warn about exposed secrets

## Configuration

```yaml
envValidation:
  schema: ".env.schema.ts"
  generateTypes: true
  validateOnStartup: true
  strict: true
  documentation: true
```

## Example Output

```typescript
// Generated environment validator
import { z } from 'zod';

const envSchema = z.object({
  // API Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),
  API_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),

  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('24h'),

  // Third-party Services
  STRIPE_API_KEY: z.string().startsWith('sk_'),
  SENDGRID_API_KEY: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnvironment(): Environment {
  const env = process.env;

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid environment variables:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Usage
const env = validateEnvironment();
export default env;
```

## Options

- `--generate-schema`: Generate validation schema
- `--validate`: Validate current environment
- `--strict`: Disallow extra environment variables
- `--output`: Custom output directory
- `--format`: Output format (ts, js, json)

## See Also

- `/config-gen` - Configuration generation
- `/secrets-scan` - Secrets scanning
- `/env-setup` - Environment setup
