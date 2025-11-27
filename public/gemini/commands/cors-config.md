# /cors-config

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
Generate CORS (Cross-Origin Resource Sharing) configuration with security best practices and origin validation for APIs and web services.

## Usage

```bash
/cors-config
/cors-config --origins=https://example.com
/cors-config --template=strict
```

## Features

- **CORS Headers Configuration**: Generate proper CORS headers
- **Origin Validation**: Whitelist specific origins
- **Credentials Support**: Secure cookie and auth header handling
- **Method Restriction**: Limit HTTP methods
- **Header Whitelisting**: Control exposed headers
- **Preflight Caching**: Optimize OPTIONS requests
- **Multiple Frameworks**: Express, Fastify, NestJS, etc
- **Security Best Practices**: CSRF protection, origin validation
- **Testing**: Validate CORS configuration

## Configuration

```yaml
cors:
  origins:
    - "https://example.com"
    - "https://app.example.com"
  methods:
    - GET
    - POST
    - PUT
    - DELETE
  credentials: true
  maxAge: 86400 # 24 hours
  allowedHeaders:
    - Authorization
    - Content-Type
  exposedHeaders:
    - X-Total-Count
    - X-Page-Number
```

## Example Output

```typescript
// Generated CORS configuration (Express)
import cors from 'cors';

const allowedOrigins = [
  'https://example.com',
  'https://app.example.com',
];

export const corsOptions = {
  // Origin validation
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  // Allowed methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
  ],

  // Exposed headers (client can access)
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Number',
    'X-Has-More',
  ],

  // Credentials (cookies, auth headers)
  credentials: true,

  // Preflight cache
  maxAge: 86400, // 24 hours

  // HTTP 204 on OPTIONS
  optionsSuccessStatus: 204,
};

// Apply middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.options('/api/*', cors(corsOptions));
```

## CORS Headers

```
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Expose-Headers: X-Total-Count, X-Page-Number
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

## Options

- `--origins`: Allowed origins (comma-separated)
- `--template`: Config template (strict, permissive, custom)
- `--credentials`: Enable credentials support
- `--framework`: Target framework (express, fastify, nestjs)
- `--output`: Custom output path

## See Also

- `/security-audit` - Security testing
- `/env-validator` - Configuration validation
- `/rate-limit-setup` - Rate limiting
