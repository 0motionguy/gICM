# /analytics-setup

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Analytics and tracking setup with event tracking, property management, and data collection patterns. Integrate with analytics platforms.

## Usage

```bash
/analytics-setup
/analytics-setup --provider=mixpanel
/analytics-setup --include-consent
```

## Features

- **Event Tracking**: Define and track custom events
- **User Properties**: Manage user identification and traits
- **Session Management**: Track user sessions and behavior
- **Consent Management**: GDPR/CCPA compliance
- **Provider Integration**: Mixpanel, Amplitude, Segment, PostHog
- **Error Tracking**: Integrate with error monitoring
- **Revenue Tracking**: Monitor transactions and revenue
- **Custom Dashboards**: Track key metrics
- **Type Safety**: Full TypeScript support

## Configuration

```yaml
analytics:
  provider: "mixpanel" # mixpanel, amplitude, segment, posthog
  trackPageViews: true
  trackClickEvents: true
  identifyUsers: true
  trackRevenue: true
  consentManagement: true
  debug: false
```

## Example Output

```typescript
// Generated analytics service
import { Analytics } from '@/lib/analytics';

export const analytics = new Analytics({
  provider: 'mixpanel',
  token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!,
  debug: process.env.NODE_ENV === 'development',
});

// Event definitions (type-safe)
export const events = {
  // User events
  USER_SIGNUP: 'User Signup',
  USER_LOGIN: 'User Login',
  USER_LOGOUT: 'User Logout',
  PROFILE_UPDATED: 'Profile Updated',

  // Feature events
  FEATURE_VIEWED: 'Feature Viewed',
  SEARCH_PERFORMED: 'Search Performed',
  FILTER_APPLIED: 'Filter Applied',
  ITEM_VIEWED: 'Item Viewed',
  ITEM_PURCHASED: 'Item Purchased',

  // Error events
  ERROR_OCCURRED: 'Error Occurred',
  PAGE_ERROR: 'Page Error',
} as const;

// Track event with type safety
export function trackEvent<T extends keyof typeof events>(
  event: T,
  properties?: Record<string, any>
) {
  analytics.track(events[event], properties);
}

// User identification
export function identifyUser(userId: string, traits?: any) {
  analytics.identify(userId, {
    email: traits?.email,
    name: traits?.name,
    plan: traits?.plan,
    signupDate: traits?.createdAt,
    ...traits,
  });
}

// Page view tracking
export function trackPageView(
  pathname: string,
  title: string,
  properties?: Record<string, any>
) {
  analytics.track(events.FEATURE_VIEWED, {
    page: pathname,
    title,
    timestamp: new Date(),
    ...properties,
  });
}

// Revenue tracking
export function trackRevenue(
  userId: string,
  amount: number,
  currency: string,
  metadata?: any
) {
  analytics.track(events.ITEM_PURCHASED, {
    userId,
    amount,
    currency,
    revenue: amount,
    ...metadata,
  });
}

// Search event
export function trackSearch(query: string, results: number) {
  trackEvent('SEARCH_PERFORMED', {
    query,
    resultsCount: results,
    timestamp: new Date(),
  });
}
```

```typescript
// React hooks for analytics
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { analytics, trackPageView, identifyUser } from '@/lib/analytics';

export function useAnalytics(userId?: string) {
  const router = useRouter();

  // Track page views
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPageView(
        url,
        document.title,
        { referrer: document.referrer }
      );
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Identify user
  useEffect(() => {
    if (userId) {
      identifyUser(userId);
    }
  }, [userId]);

  // Track events
  const track = useCallback(
    (event: string, properties?: Record<string, any>) => {
      analytics.track(event, {
        ...properties,
        timestamp: new Date(),
        url: window.location.href,
      });
    },
    []
  );

  return { track };
}
```

```typescript
// Consent management
import React, { useState, useCallback } from 'react';

export function ConsentManager() {
  const [consentGiven, setConsentGiven] = useState(
    localStorage.getItem('analytics_consent') === 'true'
  );

  const handleConsent = useCallback((given: boolean) => {
    localStorage.setItem('analytics_consent', String(given));
    setConsentGiven(given);

    if (given) {
      analytics.optIn();
    } else {
      analytics.optOut();
    }
  }, []);

  return (
    <div className="consent-banner">
      <p>We use analytics to improve your experience</p>
      <button onClick={() => handleConsent(true)}>
        Accept
      </button>
      <button onClick={() => handleConsent(false)}>
        Decline
      </button>
    </div>
  );
}
```

## Key Events to Track

- User Authentication: signup, login, logout
- Feature Usage: page views, feature accessed
- User Actions: search, filter, sort
- Conversions: purchase, upgrade, subscription
- Errors: page errors, API errors, crashes

## Options

- `--provider`: Analytics provider (mixpanel, amplitude, posthog)
- `--include-consent`: Include GDPR/CCPA consent
- `--include-errors`: Integrate error tracking
- `--include-revenue`: Revenue tracking
- `--output`: Custom output directory

## See Also

- `/monitoring-setup` - Application monitoring
- `/env-setup` - Environment setup
- `/error-boundary-gen` - Error tracking
