/**
 * Universal Bridge - Runtime Adapter Logic
 * Transforms prompts and configurations between AI runtimes.
 *
 * Handles:
 * - Claude <thinking> tags → internalized reasoning
 * - Claude artifacts → code blocks with file paths
 * - Claude XML tool format → JSON function calling
 * - Model-specific terminology updates
 */

export interface BridgeContext {
  sourcePlatform: 'claude' | 'gemini' | 'openai';
  targetPlatform: 'claude' | 'gemini' | 'openai';
  agentName: string;
}

export class UniversalBridge {
  /**
   * Transforms a prompt for cross-platform compatibility
   */
  static bridgePrompt(originalPrompt: string, context: BridgeContext): string {
    if (context.sourcePlatform === context.targetPlatform) {
      return originalPrompt;
    }

    // Apply content transformations
    let transformedPrompt = this.transformContent(originalPrompt, context);

    // Add compatibility shim header
    const shim = this.getShim(context);
    return `${shim}\n\n${transformedPrompt}`;
  }

  /**
   * Transform prompt content for target platform
   */
  private static transformContent(content: string, context: BridgeContext): string {
    let transformed = content;

    // Remove Claude-specific sections that don't apply to other platforms
    transformed = transformed.replace(/## Available MCP Tools[\s\S]*?(?=## |# |$)/g, '');
    transformed = transformed.replace(/### Context7[\s\S]*?(?=### |## |# |$)/g, '');
    transformed = transformed.replace(/@context7\s+[^\n]+/g, '');

    // Transform thinking tags to comments (other platforms don't need explicit thinking blocks)
    transformed = transformed.replace(/<thinking>/g, '<!-- Internal reasoning:');
    transformed = transformed.replace(/<\/thinking>/g, '-->');

    // Transform artifact references
    transformed = transformed.replace(/\bartifacts?\b/gi, 'code outputs');
    transformed = transformed.replace(/\bthinking\s+blocks?\b/gi, 'internal reasoning');

    // Update model references based on target
    if (context.targetPlatform === 'gemini') {
      transformed = transformed.replace(/Claude Opus/gi, 'Gemini 2.0 Flash');
      transformed = transformed.replace(/Claude Sonnet/gi, 'Gemini 2.0 Flash');
      transformed = transformed.replace(/\bopus\b/gi, 'advanced model');
      transformed = transformed.replace(/\bsonnet\b/gi, 'standard model');
      transformed = transformed.replace(/\bhaiku\b/gi, 'flash model');
    } else if (context.targetPlatform === 'openai') {
      transformed = transformed.replace(/Claude Opus/gi, 'GPT-4o');
      transformed = transformed.replace(/Claude Sonnet/gi, 'GPT-4o-mini');
      transformed = transformed.replace(/\bopus\b/gi, 'advanced model');
      transformed = transformed.replace(/\bsonnet\b/gi, 'standard model');
      transformed = transformed.replace(/\bhaiku\b/gi, 'mini model');
    }

    return transformed;
  }

  /**
   * Get platform-specific compatibility shim
   */
  private static getShim(context: BridgeContext): string {
    if (context.targetPlatform === 'gemini') {
      return `<!-- AETHER BRIDGE: ADAPTER ACTIVE -->
<!-- Source: ${context.sourcePlatform} | Target: ${context.targetPlatform} | Agent: ${context.agentName} -->

# Runtime Compatibility Layer

You are running on the **Gemini** runtime, executing the agent "${context.agentName}".

## Platform Adaptation Rules

### 1. Reasoning Style
- When you need to think through a problem, do so internally before responding
- Show your work when it helps the user understand, but don't use XML thinking tags

### 2. Tool/Function Calling
- If the original prompt describes XML-based tools, interpret them as function specifications
- Use Gemini's native function calling format when tools are available

### 3. Code Generation
- Wrap code in markdown code blocks with language identifiers
- For file outputs, use format: \`\`\`language:path/to/file.ext

### 4. Persona Consistency
- Maintain the agent's defined expertise and personality
- You may acknowledge being Gemini if directly asked

---`;
    }

    if (context.targetPlatform === 'openai') {
      return `<!-- AETHER BRIDGE: ADAPTER ACTIVE -->
<!-- Source: ${context.sourcePlatform} | Target: ${context.targetPlatform} | Agent: ${context.agentName} -->

# Runtime Compatibility Layer

You are running on **OpenAI GPT**, executing the agent "${context.agentName}".

## Platform Adaptation Rules

### 1. Response Style
- Be concise and direct - GPT users often prefer shorter responses
- Skip preambles and get straight to the solution

### 2. Code Output Format
- Use markdown code blocks with language identifiers
- For multi-file outputs, clearly label each file: \`\`\`language:filename

### 3. Reasoning
- Think step-by-step internally when needed
- Show reasoning only when it adds value to the response

### 4. Tool Use
- If function calling is available, use OpenAI's native format
- Otherwise, output structured responses as JSON when appropriate

---`;
    }

    return "";
  }
}
