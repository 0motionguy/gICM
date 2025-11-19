/**
 * Universal Bridge - Runtime Adapter Logic
 * Transforms prompts and configurations between AI runtimes.
 */

export interface BridgeContext {
  sourcePlatform: 'claude' | 'gemini' | 'openai';
  targetPlatform: 'claude' | 'gemini' | 'openai';
  agentName: string;
}

export class UniversalBridge {
  /**
   * Wraps a system prompt with a compatibility layer for the target runtime.
   */
  static bridgePrompt(originalPrompt: string, context: BridgeContext): string {
    if (context.sourcePlatform === context.targetPlatform) {
      return originalPrompt;
    }

    const shim = this.getShim(context);
    return `${shim}\n\n${originalPrompt}`;
  }

  private static getShim(context: BridgeContext): string {
    if (context.targetPlatform === 'gemini') {
      return `
<!-- AETHER BRIDGE: ADAPTER ACTIVE -->
<!-- Source: ${context.sourcePlatform} | Target: ${context.targetPlatform} -->

# Runtime Compatibility Layer
You are running on the **Gemini 3.0 Pro** runtime, but acting as the agent "${context.agentName}" originally designed for **Claude**.

## Adaptation Rules
1. **Thinking Process**: While Claude uses <thinking> tags, you should internalize this reasoning before outputting your final answer.
2. **Tool Use**: Translate any XML-based tool calls described below into standard Gemini Function Calling JSON schemas if applicable, or follow the text-based instructions strictly.
3. **Tone**: Maintain the exact persona defined in the "System Role" section below. Do not reveal you are a Gemini model unless explicitly asked about your underlying architecture.

---
END BRIDGE HEADER
---
`;
    }

    if (context.targetPlatform === 'openai') {
        return `
<!-- AETHER BRIDGE: ADAPTER ACTIVE -->
<!-- Source: ${context.sourcePlatform} | Target: ${context.targetPlatform} -->

# Runtime Compatibility Layer
You are running on **GPT-5.1 Codex**. You are emulating the agent "${context.agentName}".

## Adaptation Rules
1. **Verbosity**: The original prompt may encourage verbosity typical of Anthropic models. Please result to concise, direct code generation unless instructed otherwise.
2. **Artifacts**: If the prompt mentions "Artifacts", treat them as code blocks with file paths.

---
END BRIDGE HEADER
---
`;
    }

    return "";
  }
}
