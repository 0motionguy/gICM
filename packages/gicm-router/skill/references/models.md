# Supported Models & Pricing

## Tier 0 — Free / Local

| Model            | Provider       | Input/1M | Output/1M | Context |
| ---------------- | -------------- | -------- | --------- | ------- |
| llama3.2:3b      | Ollama (local) | $0       | $0        | 128K    |
| gemini-2.0-flash | Google         | $0       | $0        | 1M      |

## Tier 1 — Cheap

| Model            | Provider  | Input/1M | Output/1M | Context |
| ---------------- | --------- | -------- | --------- | ------- |
| claude-haiku-4.5 | Anthropic | $0.80    | $4.00     | 200K    |
| gemini-1.5-flash | Google    | $0.075   | $0.30     | 1M      |
| gpt-4o-mini      | OpenAI    | $0.15    | $0.60     | 128K    |
| deepseek-chat    | DeepSeek  | $0.14    | $0.28     | 128K    |

## Tier 2 — Balanced

| Model             | Provider  | Input/1M | Output/1M | Context |
| ----------------- | --------- | -------- | --------- | ------- |
| claude-sonnet-4.5 | Anthropic | $3.00    | $15.00    | 200K    |
| gpt-4o            | OpenAI    | $2.50    | $10.00    | 128K    |
| grok-2            | xAI       | $2.00    | $10.00    | 131K    |

## Tier 3 — Premium

| Model             | Provider  | Input/1M | Output/1M | Context |
| ----------------- | --------- | -------- | --------- | ------- |
| claude-opus-4.6   | Anthropic | $15.00   | $75.00    | 200K    |
| gpt-5.3-codex     | OpenAI    | $10.00   | $30.00    | 128K    |
| deepseek-reasoner | DeepSeek  | $0.55    | $2.19     | 64K     |

## OpenRouter BYOK

All models accessible via OpenRouter with your own API keys.
Set `OPENROUTER_API_KEY` to use any model from any provider.
