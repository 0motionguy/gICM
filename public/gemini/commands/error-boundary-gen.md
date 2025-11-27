# /error-boundary-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
Generate React error boundaries with fallback UI, error logging integration, and recovery strategies. Protect applications from component crashes.

## Usage

```bash
/error-boundary-gen
/error-boundary-gen --with-logging
/error-boundary-gen --recovery-ui
```

## Features

- **Error Boundary Components**: Generate class and functional boundaries
- **Fallback UI**: Customizable error display components
- **Error Logging**: Integration with Sentry, LogRocket, custom services
- **Recovery Strategies**: Retry mechanisms, state reset, navigation
- **Error Stack Traces**: Show/hide stack traces based on environment
- **User Messages**: Custom error messages for different error types
- **TypeScript Support**: Full type safety for error handling
- **Testing**: Generate test cases for error scenarios

## Configuration

```yaml
errorBoundary:
  type: "hoc" # hoc, hook, component
  withLogging: true
  logger: "sentry" # sentry, logrocket, custom
  showStackTrace: false # in production
  recovery: true
  uiTemplate: "modern"
```

## Example Output

```typescript
// Generated error boundary
import React, { Component, ReactNode } from 'react';
import { logError } from '@/services/logging';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, errorInfo);
    this.props.onError?.(error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorUI onRetry={this.handleReset} />;
    }

    return this.props.children;
  }
}
```

## Options

- `--type`: Component type (hoc, hook, component)
- `--with-logging`: Include error logging
- `--logger`: Logger service (sentry, logrocket)
- `--recovery`: Include recovery UI
- `--output`: Custom output directory

## See Also

- `/test-generate-cases` - Generate test cases
- `/security-audit` - Security testing
- `/dev-code-review` - Code quality
