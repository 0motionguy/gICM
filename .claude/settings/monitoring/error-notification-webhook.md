# Error Notification Webhook

Webhook URL for error notifications. Supports Slack, Discord, custom endpoints.

## Overview

Sends error notifications to specified webhook URL. Supports Slack webhooks, Discord webhooks, and custom endpoints. Useful for real-time error alerting.

## Configuration

**Category:** Monitoring
**Type:** String (URL)
**Default:** "" (disabled)

## Usage

```bash
# Slack webhook
npx @gicm/cli settings add monitoring/error-notification-webhook --value "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Discord webhook
npx @gicm/cli settings add monitoring/error-notification-webhook --value "https://discord.com/api/webhooks/YOUR/WEBHOOK"

# Custom webhook
npx @gicm/cli settings add monitoring/error-notification-webhook --value "https://your-api.com/webhooks/errors"
```

## Environment Variable

**Store in .env:**
```bash
ERROR_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Reference in settings:**
```json
{
  "error-notification-webhook": "${ERROR_WEBHOOK_URL}"
}
```

## Webhook Payload

**Slack format:**
```json
{
  "text": "🚨 Error in gICM Stack",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🚨 Build Error"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Error:* TypeScript compilation failed"
        },
        {
          "type": "mrkdwn",
          "text": "*File:* src/app/page.tsx:42"
        },
        {
          "type": "mrkdwn",
          "text": "*Time:* 2025-11-08 10:30:45"
        }
      ]
    }
  ]
}
```

**Discord format:**
```json
{
  "embeds": [
    {
      "title": "🚨 Error in gICM Stack",
      "description": "TypeScript compilation failed",
      "color": 15548997,
      "fields": [
        {
          "name": "File",
          "value": "src/app/page.tsx:42"
        },
        {
          "name": "Error",
          "value": "Type 'string' is not assignable to 'number'"
        }
      ],
      "timestamp": "2025-11-08T10:30:45.123Z"
    }
  ]
}
```

## Error Levels

**Configure which errors to report:**
```json
{
  "error-notification-webhook": "${ERROR_WEBHOOK_URL}",
  "notification-levels": {
    "error": true,
    "warning": false,
    "critical": true
  }
}
```

## Rate Limiting

**Prevent notification spam:**
```json
{
  "error-notification-webhook": "${ERROR_WEBHOOK_URL}",
  "rate-limit": {
    "max-per-minute": 5,
    "max-per-hour": 20,
    "cooldown-minutes": 5
  }
}
```

**Rate limit exceeded:**
```
⚠️  Error notification rate limit reached

Suppressed 15 error notifications in last 5 minutes.
View full error log: .claude/logs/errors.log
```

## Error Grouping

**Group similar errors:**
```json
{
  "error-notification-webhook": "${ERROR_WEBHOOK_URL}",
  "grouping": {
    "enabled": true,
    "group-by": "error-type",
    "window-minutes": 5
  }
}
```

**Grouped notification:**
```
🚨 5 similar errors in last 5 minutes

TypeError: Cannot read property 'name' of undefined
Occurrences: 5
First: 10:25:30
Last: 10:30:45

Stack trace from latest:
  at getUser (src/lib/utils.ts:42)
  at processRequest (src/app/api/route.ts:15)
```

## Custom Webhook Format

**Configure custom payload:**
```json
{
  "error-notification-webhook": "https://your-api.com/webhooks",
  "webhook-format": "custom",
  "custom-payload": {
    "event": "error",
    "severity": "{{level}}",
    "message": "{{message}}",
    "timestamp": "{{timestamp}}",
    "metadata": {
      "file": "{{file}}",
      "line": "{{line}}"
    }
  }
}
```

## Related Settings

- `error-reporting-service` - Comprehensive error tracking
- `monitoring-dashboard` - Monitoring integration
- `audit-log-enabled` - Error logging

## Examples

### Slack Integration
```json
{
  "error-notification-webhook": "${SLACK_WEBHOOK_URL}",
  "notification-levels": {
    "error": true,
    "critical": true
  },
  "rate-limit": {
    "max-per-minute": 5
  },
  "grouping": {
    "enabled": true
  }
}
```

### Discord Integration
```json
{
  "error-notification-webhook": "${DISCORD_WEBHOOK_URL}",
  "webhook-format": "discord",
  "notification-levels": {
    "error": true,
    "warning": true,
    "critical": true
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
