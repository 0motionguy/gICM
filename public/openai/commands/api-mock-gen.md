# /api-mock-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Generate mock API servers with OpenAPI/GraphQL support, realistic data generation, and request validation. Perfect for frontend development and API testing.

## Usage

```bash
/api-mock-gen
/api-mock-gen --spec=openapi.yaml
/api-mock-gen --type=graphql
```

## Features

- **OpenAPI/Swagger Support**: Parse specs and generate mocks
- **GraphQL Mocking**: Generate mock resolvers from schema
- **Realistic Data**: Faker.js integration for realistic test data
- **Request Validation**: Validate incoming requests against spec
- **Response Simulation**: Configure delays, errors, status codes
- **Database Simulation**: In-memory data persistence
- **CORS Support**: Enable cross-origin requests
- **Request Logging**: Log all requests for debugging
- **Webhook Support**: Simulate webhooks and callbacks

## Configuration

```yaml
mockAPI:
  type: "openapi" # openapi, graphql, rest
  port: 3001
  dataGeneration: true
  delay: 100 # ms
  logRequests: true
  persistence: true
  cors: true
  spec: "./openapi.yaml"
```

## Example Output

```bash
Mock API Server Running
Port: 3001
Endpoints loaded: 34
Data generators: Active

GET /api/users (200)
POST /api/users (201)
GET /api/users/:id (200)
PUT /api/users/:id (200)
DELETE /api/users/:id (204)

Sample request:
curl http://localhost:3001/api/users
```

## Options

- `--spec`: OpenAPI/GraphQL spec file path
- `--type`: Mock type (openapi, graphql, rest)
- `--port`: Server port (default: 3001)
- `--delay`: Response delay in ms
- `--persist`: Enable data persistence
- `--log`: Log all requests

## See Also

- `/test-e2e-setup` - E2E testing
- `/test-write-tests` - Unit testing
- `/api-contract-designer` - API design
