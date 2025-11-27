# Serverless Architecture

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Master serverless development with AWS Lambda, API Gateway, and event-driven patterns.

## Quick Reference

### AWS Lambda Function
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}')

    // Business logic
    const result = await processData(body)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
```

### Serverless Framework
```yaml
# serverless.yml
service: my-service

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    TABLE_NAME: ${self:service}-${self:provider.stage}

functions:
  api:
    handler: src/handler.handler
    events:
      - http:
          path: /users
          method: get
          cors: true

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.TABLE_NAME}
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
```

### Event-Driven Architecture
```typescript
// S3 event trigger
export const handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name
    const key = record.s3.object.key

    // Process uploaded file
    await processFile(bucket, key)
  }
}

// SQS event trigger
export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body)
    await processMessage(message)
  }
}
```

## Best Practices

- Keep functions small and focused
- Use environment variables for config
- Implement proper error handling
- Use layers for shared dependencies
- Set appropriate timeout and memory
- Monitor with CloudWatch
- Use provisioned concurrency for latency-sensitive functions
- Implement dead letter queues for failed events
