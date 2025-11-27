# Progressive Web Apps

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


Master PWA development with service workers, offline support, and app-like experience.

## Quick Reference

### Service Worker
```javascript
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}

// sw.js
const CACHE_NAME = 'v1'
const urlsToCache = ['/', '/styles.css', '/app.js']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  )
})
```

### Web App Manifest
```json
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Offline Support
```javascript
// Network-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  )
})

// Cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  )
})
```

## Features

- Install prompt
- Offline functionality
- Push notifications
- Background sync
- App-like experience
- Fast loading
- Responsive design

## Best Practices

- Use cache-first for static assets
- Use network-first for dynamic content
- Implement background sync
- Show offline UI when disconnected
- Precache critical resources
- Test on real devices
